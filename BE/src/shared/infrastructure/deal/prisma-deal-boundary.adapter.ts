import { Prisma } from "@prisma/client";
import type {
  CreateDealActivityInput,
  DealActivityRecord,
  DealActivitySourceTypeCode,
  DealActivityTypeCode,
  DealActivityWritePort,
  FindDealActivityBySourceInput,
} from "@/shared/application/deal/deal-activity-writer.port";
import type {
  CreateDealFollowingActionLogInput,
  DealBoundaryPort,
  DealFollowingActionLogRecord,
  DealLabelRecord,
  DealOptionRecord,
  DealSnapshotRecord,
} from "@/shared/application/deal/deal-boundary.port";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";

type DealBoundaryPrismaClient = PrismaService | Prisma.TransactionClient;

type DealActivityRow = {
  readonly id: string;
  readonly userId: string;
  readonly dealId: string;
  readonly activityType: DealActivityTypeCode;
  readonly sourceType: DealActivitySourceTypeCode;
  readonly sourceId: string | null;
  readonly title: string;
  readonly summary: string | null;
  readonly body: string | null;
  readonly occurredAt: Date;
  readonly linkedRecordsJson: unknown | null;
  readonly metadataJson: unknown | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
};

// 역할 : PrismaDealBoundaryAdapter 다른 module transaction client로 딜 참조와 부수 쓰기를 수행합니다.
export class PrismaDealBoundaryAdapter
  implements DealBoundaryPort, DealActivityWritePort
{
  // 기능 : Prisma client 또는 transaction client를 주입받습니다.
  constructor(private readonly client: DealBoundaryPrismaClient) {}

  // 기능 : 현재 사용자의 일정 연결용 딜 옵션 목록을 조회합니다.
  async listDealOptions(userId: string): Promise<DealOptionRecord[]> {
    const deals = await this.client.deal.findMany({
      where: { userId, deletedAt: null },
      select: {
        id: true,
        dealName: true,
        createdAt: true,
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    });

    return deals.map((deal) => ({
      id: deal.id,
      dealName: deal.dealName,
      createdAt: deal.createdAt,
    }));
  }

  // 기능 : 현재 사용자 소유 딜의 label projection을 조회합니다.
  async findDealLabelsByIds(
    userId: string,
    dealIds: readonly string[]
  ): Promise<DealLabelRecord[]> {
    if (dealIds.length === 0) {
      return [];
    }

    const deals = await this.client.deal.findMany({
      where: {
        id: { in: [...dealIds] },
        userId,
        deletedAt: null,
      },
      select: {
        id: true,
        dealName: true,
      },
    });

    return deals.map((deal) => ({
      id: deal.id,
      dealName: deal.dealName,
    }));
  }

  // 기능 : 현재 사용자 소유 딜의 relation snapshot projection을 조회합니다.
  async findDealSnapshotsByIds(
    userId: string,
    dealIds: readonly string[]
  ): Promise<DealSnapshotRecord[]> {
    if (dealIds.length === 0) {
      return [];
    }

    const deals = await this.client.deal.findMany({
      where: {
        id: { in: [...dealIds] },
        userId,
        deletedAt: null,
      },
      select: {
        id: true,
        dealName: true,
        dealStatus: true,
        dealCost: true,
        expectedEndDate: true,
      },
    });

    return deals.map((deal) => ({
      id: deal.id,
      dealName: deal.dealName,
      dealStatus: deal.dealStatus,
      dealCost: deal.dealCost,
      expectedEndDate: deal.expectedEndDate,
    }));
  }

  // 기능 : 딜 다음 행동 로그를 생성합니다.
  async createFollowingActionLog(
    input: CreateDealFollowingActionLogInput
  ): Promise<DealFollowingActionLogRecord> {
    return this.client.dealFollowingActionLog.create({
      data: {
        userId: input.userId,
        dealId: input.dealId,
        followingAction: input.followingAction,
      },
    });
  }

  // 기능 : 딜 활동 행을 생성합니다.
  async createActivity(
    input: CreateDealActivityInput
  ): Promise<DealActivityRecord> {
    const activity = await this.client.dealActivity.create({
      data: {
        userId: input.userId,
        dealId: input.dealId,
        activityType: input.activityType,
        sourceType: input.sourceType,
        sourceId: input.sourceId ?? null,
        title: input.title,
        summary: input.summary ?? null,
        body: input.body ?? null,
        occurredAt: input.occurredAt,
        ...(input.linkedRecordsJson !== undefined
          ? {
              linkedRecordsJson: this.toNullableInputJson(
                input.linkedRecordsJson
              ),
            }
          : {}),
        ...(input.metadataJson !== undefined
          ? { metadataJson: this.toNullableInputJson(input.metadataJson) }
          : {}),
      },
      select: this.createDealActivitySelect(),
    });

    return this.mapDealActivity(activity);
  }

  // 기능 : 자동 활동 원본 기준으로 기존 딜 활동을 조회합니다.
  async findActivityBySource(
    input: FindDealActivityBySourceInput
  ): Promise<DealActivityRecord | null> {
    const activity = await this.client.dealActivity.findFirst({
      where: {
        userId: input.userId,
        dealId: input.dealId,
        activityType: input.activityType,
        sourceType: input.sourceType,
        sourceId: input.sourceId,
      },
      select: this.createDealActivitySelect(),
    });

    return activity ? this.mapDealActivity(activity) : null;
  }

  // 기능 : 딜 활동 조회에 필요한 Prisma select 객체를 생성합니다.
  private createDealActivitySelect(): Prisma.DealActivitySelect {
    return {
      id: true,
      userId: true,
      dealId: true,
      activityType: true,
      sourceType: true,
      sourceId: true,
      title: true,
      summary: true,
      body: true,
      occurredAt: true,
      linkedRecordsJson: true,
      metadataJson: true,
      createdAt: true,
      updatedAt: true,
    };
  }

  // 기능 : Prisma 딜 활동 row를 application record로 변환합니다.
  private mapDealActivity(row: DealActivityRow): DealActivityRecord {
    return {
      id: row.id,
      userId: row.userId,
      dealId: row.dealId,
      activityType: row.activityType,
      sourceType: row.sourceType,
      sourceId: row.sourceId,
      title: row.title,
      summary: row.summary,
      body: row.body,
      occurredAt: row.occurredAt,
      linkedRecordsJson: row.linkedRecordsJson,
      metadataJson: row.metadataJson,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  // 기능 : null 허용 JSON 값을 Prisma input JSON 값으로 변환합니다.
  private toNullableInputJson(
    value: unknown | null
  ): Prisma.NullableJsonNullValueInput | Prisma.InputJsonValue {
    return value === null
      ? Prisma.JsonNull
      : (JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue);
  }
}
