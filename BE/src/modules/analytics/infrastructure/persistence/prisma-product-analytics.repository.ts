import {
  Prisma,
  UserActivationStatus as PrismaUserActivationStatus,
} from "@prisma/client";
import type {
  ActivationCandidate,
  CreateProductAnalyticsEventInput,
  ProductAnalyticsEventRecord,
  ProductAnalyticsRepository,
  UpsertRetentionCohortSnapshotInput,
  UpsertUserActivationSnapshotInput,
  UserActivationSnapshotStatus,
} from "@/modules/analytics/application/ports/product-analytics.repository";
import {
  formatProductAnalyticsDateOnlyDate,
  toProductAnalyticsDateOnlyDate,
} from "@/modules/analytics/application/services/product-analytics-date";
import { assertProductAnalyticsEventInputPolicy } from "@/modules/analytics/application/services/product-analytics-event-input-policy";
import type { ProductAnalyticsRuntimeEventName } from "@/modules/analytics/domain/product-analytics-event-taxonomy";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";

type ProductAnalyticsPrismaClient = PrismaService | Prisma.TransactionClient;

const FIRST_DEAL_CREATED_EVENT_NAME = "deal_created";
const MEANINGFUL_ACTIVATION_EVENT_NAMES = [
  "deal_next_action_created",
] as const;
const ACTIVATION_EVENT_NAMES = [
  FIRST_DEAL_CREATED_EVENT_NAME,
  ...MEANINGFUL_ACTIVATION_EVENT_NAMES,
] as const;

// ??븷 : PrismaProductAnalyticsRepository ?쒗뭹 遺꾩꽍 ??μ냼瑜?Prisma濡?援ы쁽?⑸땲??
export class PrismaProductAnalyticsRepository
  implements ProductAnalyticsRepository
{
  // 湲곕뒫 : ?쒗뭹 遺꾩꽍 ??μ냼媛 ?ъ슜??Prisma client瑜?蹂닿??⑸땲??
  constructor(
    private readonly client: ProductAnalyticsPrismaClient,
    private readonly transactionRunner: PrismaService | null = null
  ) {}

  // 湲곕뒫 : snapshot upsert 臾띠쓬??Prisma transaction ?덉뿉???ㅽ뻾?⑸땲??
  async runInTransaction<T>(
    work: (repository: ProductAnalyticsRepository) => Promise<T>
  ): Promise<T> {
    if (!this.transactionRunner) {
      return work(this);
    }

    return this.transactionRunner.$transaction(async (transaction) =>
      work(new PrismaProductAnalyticsRepository(transaction, null))
    );
  }

  // 湲곕뒫 : allowlist瑜??듦낵???쒗뭹 遺꾩꽍 ?먮낯 ?대깽?몃? ??ν빀?덈떎.
  async createEvent(
    input: CreateProductAnalyticsEventInput
  ): Promise<ProductAnalyticsEventRecord> {
    assertProductAnalyticsEventInputPolicy(input);

    const event = await this.client.productAnalyticsEvent.create({
      data: {
        userId: input.userId,
        authSessionId: input.authSessionId,
        authDeviceId: input.authDeviceId,
        eventName: input.eventName,
        eventVersion: input.eventVersion,
        source: input.source,
        occurredAt: input.occurredAt,
        eventDate: toProductAnalyticsDateOnlyDate(input.eventDate),
        timeZone: input.timeZone,
        idempotencyKey: input.idempotencyKey ?? null,
        targetType: input.targetType ?? null,
        targetId: input.targetId ?? null,
        payloadJson: this.toPrismaPayload(input.payloadJson),
      },
      select: {
        id: true,
      },
    });

    return {
      id: event.id,
    };
  }

  // 湲곕뒫 : app session ID濡??곌껐??authDeviceId瑜?議고쉶?⑸땲??
  async findAuthDeviceIdBySessionId(sessionId: string): Promise<string | null> {
    const session = await this.client.authSession.findUnique({
      where: {
        id: sessionId,
      },
      select: {
        authDeviceId: true,
      },
    });

    return session?.authDeviceId ?? null;
  }

  // 湲곕뒫 : 吏?뺥븳 eventDate 踰붿쐞 ?덉뿉??activation ?ш퀎??????ъ슜?먯? all-time 理쒖큹 ?대깽?몃? 議고쉶?⑸땲??
  async findFirstActivationCandidates(
    fromDate: string,
    toDate: string,
    limit: number
  ): Promise<ActivationCandidate[]> {
    const candidateRows = await this.client.productAnalyticsEvent.findMany({
      where: {
        eventDate: {
          gte: toProductAnalyticsDateOnlyDate(fromDate),
          lte: toProductAnalyticsDateOnlyDate(toDate),
        },
        eventName: {
          in: [...ACTIVATION_EVENT_NAMES],
        },
      },
      distinct: ["userId"],
      orderBy: [{ userId: "asc" }],
      select: {
        userId: true,
      },
      take: limit,
    });
    const userIds = candidateRows.map((row) => row.userId);

    if (userIds.length === 0) {
      return [];
    }

    const eventRows = await this.client.productAnalyticsEvent.findMany({
      where: {
        eventName: {
          in: [...ACTIVATION_EVENT_NAMES],
        },
        userId: {
          in: userIds,
        },
      },
      orderBy: [{ userId: "asc" }, { occurredAt: "asc" }, { id: "asc" }],
      select: {
        userId: true,
        eventName: true,
        occurredAt: true,
        eventDate: true,
        timeZone: true,
      },
    });

    const candidates = new Map<string, ActivationCandidate>();

    for (const userId of userIds) {
      candidates.set(userId, this.createEmptyActivationCandidate(userId));
    }

    for (const row of eventRows) {
      const candidate = candidates.get(row.userId);

      if (!candidate) {
        continue;
      }

      const eventDate = formatProductAnalyticsDateOnlyDate(row.eventDate);

      if (
        row.eventName === FIRST_DEAL_CREATED_EVENT_NAME &&
        !candidate.firstDealCreatedAt
      ) {
        candidates.set(row.userId, {
          ...candidate,
          firstDealCreatedAt: row.occurredAt,
          firstDealCreatedEventDate: eventDate,
          firstDealCreatedTimeZone: row.timeZone,
        });
        continue;
      }

      if (
        MEANINGFUL_ACTIVATION_EVENT_NAMES.some(
          (eventName) => eventName === row.eventName
        ) &&
        !candidate.firstMeaningfulActionAt
      ) {
        candidates.set(row.userId, {
          ...candidate,
          firstMeaningfulActionAt: row.occurredAt,
          firstMeaningfulActionEventDate: eventDate,
          firstMeaningfulActionTimeZone: row.timeZone,
        });
      }
    }

    return [...candidates.values()];
  }

  // 湲곕뒫 : ?ъ슜?먮퀎 activation snapshot??userId 湲곗??쇰줈 ?앹꽦?섍굅??媛깆떊?⑸땲??
  async upsertUserActivationSnapshot(
    input: UpsertUserActivationSnapshotInput
  ): Promise<void> {
    const data = {
      status: this.toPrismaActivationStatus(input.status),
      firstDealCreatedAt: input.firstDealCreatedAt,
      firstMeaningfulActionAt: input.firstMeaningfulActionAt,
      activatedAt: input.activatedAt,
      activatedEventDate: input.activatedEventDate
        ? toProductAnalyticsDateOnlyDate(input.activatedEventDate)
        : null,
      timeZone: input.timeZone,
      calculatedAt: input.calculatedAt,
    };

    await this.client.userActivationSnapshot.upsert({
      where: {
        userId: input.userId,
      },
      create: {
        userId: input.userId,
        ...data,
      },
      update: data,
    });
  }

  // 湲곕뒫 : retention snapshot 怨꾩궛 ???activation cohort date 紐⑸줉??date-only 臾몄옄?대줈 議고쉶?⑸땲??
  async listActivatedCohortDates(
    fromDate: string,
    toDate: string,
    limit: number
  ): Promise<string[]> {
    const rows = await this.client.userActivationSnapshot.findMany({
      where: {
        activatedEventDate: {
          gte: toProductAnalyticsDateOnlyDate(fromDate),
          lte: toProductAnalyticsDateOnlyDate(toDate),
        },
        status: PrismaUserActivationStatus.ACTIVATED,
      },
      distinct: ["activatedEventDate"],
      orderBy: [{ activatedEventDate: "asc" }],
      select: {
        activatedEventDate: true,
      },
      take: limit,
    });

    return rows.flatMap((row) =>
      row.activatedEventDate
        ? [formatProductAnalyticsDateOnlyDate(row.activatedEventDate)]
        : []
    );
  }

  // 湲곕뒫 : ?뱀젙 cohort date??activation ???ъ슜???섎? 吏묎퀎?⑸땲??
  async countActivatedUsersByDate(cohortDate: string): Promise<number> {
    return this.client.userActivationSnapshot.count({
      where: {
        activatedEventDate: toProductAnalyticsDateOnlyDate(cohortDate),
        status: PrismaUserActivationStatus.ACTIVATED,
      },
    });
  }

  // 湲곕뒫 : cohort ?ъ슜??以?target date??active event瑜??④릿 distinct user ?섎? 吏묎퀎?⑸땲??
  async countRetainedUsersByDate(
    cohortDate: string,
    targetDate: string,
    activeEventNames: readonly ProductAnalyticsRuntimeEventName[]
  ): Promise<number> {
    const rows = await this.client.productAnalyticsEvent.findMany({
      where: {
        eventDate: toProductAnalyticsDateOnlyDate(targetDate),
        eventName: {
          in: [...activeEventNames],
        },
        user: {
          activationSnapshot: {
            is: {
              activatedEventDate: toProductAnalyticsDateOnlyDate(cohortDate),
              status: PrismaUserActivationStatus.ACTIVATED,
            },
          },
        },
      },
      distinct: ["userId"],
      select: {
        userId: true,
      },
    });

    return rows.length;
  }

  // 湲곕뒫 : cohort date? day offset 湲곗??쇰줈 retention snapshot???앹꽦?섍굅??媛깆떊?⑸땲??
  async upsertRetentionCohortSnapshot(
    input: UpsertRetentionCohortSnapshotInput
  ): Promise<void> {
    const cohortDate = toProductAnalyticsDateOnlyDate(input.cohortDate);

    await this.client.retentionCohortSnapshot.upsert({
      where: {
        cohortDate_dayOffset: {
          cohortDate,
          dayOffset: input.dayOffset,
        },
      },
      create: {
        cohortDate,
        dayOffset: input.dayOffset,
        cohortUserCount: input.cohortUserCount,
        retainedUserCount: input.retainedUserCount,
        calculatedAt: input.calculatedAt,
      },
      update: {
        cohortUserCount: input.cohortUserCount,
        retainedUserCount: input.retainedUserCount,
        calculatedAt: input.calculatedAt,
      },
    });
  }

  // 湲곕뒫 : cutoff蹂대떎 ?ㅻ옒??raw event ID瑜?batch濡?怨좊Ⅸ ??ProductAnalyticsEvent留???젣?⑸땲??
  async deleteRawEventsBefore(cutoff: Date, batchSize: number): Promise<number> {
    const rows = await this.client.productAnalyticsEvent.findMany({
      where: {
        occurredAt: {
          lt: cutoff,
        },
      },
      orderBy: [{ occurredAt: "asc" }, { id: "asc" }],
      select: {
        id: true,
      },
      take: batchSize,
    });

    if (rows.length === 0) {
      return 0;
    }

    const result = await this.client.productAnalyticsEvent.deleteMany({
      where: {
        id: {
          in: rows.map((row) => row.id),
        },
      },
    });

    return result.count;
  }

  private toPrismaPayload(
    payloadJson: Record<string, unknown>
  ): Prisma.InputJsonObject {
    return payloadJson as Prisma.InputJsonObject;
  }

  private createEmptyActivationCandidate(userId: string): ActivationCandidate {
    return {
      userId,
      firstDealCreatedAt: null,
      firstDealCreatedEventDate: null,
      firstDealCreatedTimeZone: null,
      firstMeaningfulActionAt: null,
      firstMeaningfulActionEventDate: null,
      firstMeaningfulActionTimeZone: null,
    };
  }

  // 湲곕뒫 : application activation status瑜?Prisma enum 媛믪쑝濡?蹂?섑빀?덈떎.
  private toPrismaActivationStatus(
    status: UserActivationSnapshotStatus
  ): PrismaUserActivationStatus {
    return status === "ACTIVATED"
      ? PrismaUserActivationStatus.ACTIVATED
      : PrismaUserActivationStatus.NOT_ACTIVATED;
  }
}
