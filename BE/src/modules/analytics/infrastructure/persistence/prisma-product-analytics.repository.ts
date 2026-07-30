import { Prisma, UserActivationStatus as PrismaUserActivationStatus } from "@prisma/client";
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
  "schedule_deal_linked",
  "meeting_note_deal_linked",
] as const;
const ACTIVATION_EVENT_NAMES = [
  FIRST_DEAL_CREATED_EVENT_NAME,
  ...MEANINGFUL_ACTIVATION_EVENT_NAMES,
] as const;

// 역할 : PrismaProductAnalyticsRepository 제품 분석 저장소를 Prisma로 구현합니다.
export class PrismaProductAnalyticsRepository
  implements ProductAnalyticsRepository
{
  // 기능 : 제품 분석 저장소가 사용할 Prisma client를 보관합니다.
  constructor(
    private readonly client: ProductAnalyticsPrismaClient,
    private readonly transactionRunner: PrismaService | null = null
  ) {}

  // 기능 : snapshot upsert 묶음을 Prisma transaction 안에서 실행합니다.
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

  // 기능 : allowlist를 통과한 제품 분석 원본 이벤트를 저장합니다.
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

  // 기능 : app session ID로 연결된 authDeviceId를 조회합니다.
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

  // 기능 : 지정한 eventDate 범위 안에서 activation 재계산 대상 사용자와 all-time 최초 이벤트를 조회합니다.
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

  // 기능 : 사용자별 activation snapshot을 userId 기준으로 생성하거나 갱신합니다.
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

  // 기능 : retention snapshot 계산 대상 activation cohort date 목록을 date-only 문자열로 조회합니다.
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

  // 기능 : 특정 cohort date에 activation 된 사용자 수를 집계합니다.
  async countActivatedUsersByDate(cohortDate: string): Promise<number> {
    return this.client.userActivationSnapshot.count({
      where: {
        activatedEventDate: toProductAnalyticsDateOnlyDate(cohortDate),
        status: PrismaUserActivationStatus.ACTIVATED,
      },
    });
  }

  // 기능 : cohort 사용자 중 target date에 active event를 남긴 distinct user 수를 집계합니다.
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

  // 기능 : cohort date와 day offset 기준으로 retention snapshot을 생성하거나 갱신합니다.
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

  // 기능 : cutoff보다 오래된 raw event ID를 batch로 고른 뒤 ProductAnalyticsEvent만 삭제합니다.
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

  // 기능 : application allowlist를 통과한 payload를 Prisma JSON 입력 형태로 변환합니다.
  private toPrismaPayload(
    payloadJson: Record<string, unknown>
  ): Prisma.InputJsonObject {
    return payloadJson as Prisma.InputJsonObject;
  }

  // 기능 : 아직 이벤트가 채워지지 않은 activation 후보 기본값을 만듭니다.
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

  // 기능 : application activation status를 Prisma enum 값으로 변환합니다.
  private toPrismaActivationStatus(
    status: UserActivationSnapshotStatus
  ): PrismaUserActivationStatus {
    return status === "ACTIVATED"
      ? PrismaUserActivationStatus.ACTIVATED
      : PrismaUserActivationStatus.NOT_ACTIVATED;
  }
}
