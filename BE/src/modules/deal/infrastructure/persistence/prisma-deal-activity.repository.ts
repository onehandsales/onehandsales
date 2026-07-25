import { Prisma } from "@prisma/client";
import type {
  CreateDealActivityInput,
  DealActivityCursor,
  DealActivityRecord,
  DealActivityRepository,
  DealActivitySourceTypeCode,
  DealActivityTypeCode,
  FindDealActivityByIdInput,
  FindDealActivityBySourceInput,
  ListDealActivitiesForDealInput,
  UpdateUserDealActivityInput,
} from "@/modules/deal/application/ports/deal-activity.repository";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";

type DealActivityPrismaClient = PrismaService | Prisma.TransactionClient;

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

// 역할 : PrismaDealActivityRepository 저장소 계약을 Prisma 기반 딜 활동 영속성 처리로 구현합니다.
export class PrismaDealActivityRepository implements DealActivityRepository {
  // 기능 : Prisma 클라이언트와 선택적 트랜잭션 실행기를 주입받습니다.
  constructor(
    private readonly client: DealActivityPrismaClient,
    private readonly transactionRunner: PrismaService | null = null
  ) {}

  // 기능 : 딜 활동 저장소 작업을 트랜잭션 안에서 실행합니다.
  async runInTransaction<T>(
    work: (repository: DealActivityRepository) => Promise<T>
  ): Promise<T> {
    if (!this.transactionRunner) {
      return work(this);
    }

    // 기능 : Prisma 트랜잭션 클라이언트로 격리된 딜 활동 저장소 콜백을 실행합니다.
    return this.transactionRunner.$transaction(async (transaction) => {
      return work(new PrismaDealActivityRepository(transaction, null));
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

  // 기능 : 현재 사용자의 딜 활동 단건을 조회합니다.
  async findActivityByIdForDeal(
    input: FindDealActivityByIdInput
  ): Promise<DealActivityRecord | null> {
    const activity = await this.client.dealActivity.findFirst({
      where: {
        id: input.activityId,
        userId: input.userId,
        dealId: input.dealId,
        deal: {
          deletedAt: null,
        },
      },
      select: this.createDealActivitySelect(),
    });

    return activity ? this.mapDealActivity(activity) : null;
  }

  // 기능 : 현재 사용자의 딜 활동 목록을 최신순 커서 기준으로 조회합니다.
  async listActivitiesForDeal(
    input: ListDealActivitiesForDealInput
  ): Promise<DealActivityRecord[]> {
    const activities = await this.client.dealActivity.findMany({
      where: {
        userId: input.userId,
        dealId: input.dealId,
        deal: {
          deletedAt: null,
        },
        ...(input.type ? { activityType: input.type } : {}),
        ...this.createTimelineCursorWhere(input.cursor),
      },
      select: this.createDealActivitySelect(),
      orderBy: [{ occurredAt: "desc" }, { id: "desc" }],
      take: input.take,
    });

    return activities.map((activity) => this.mapDealActivity(activity));
  }

  // 기능 : 현재 사용자가 직접 작성한 딜 활동만 수정합니다.
  async updateUserActivity(
    input: UpdateUserDealActivityInput
  ): Promise<DealActivityRecord | null> {
    const result = await this.client.dealActivity.updateMany({
      where: {
        id: input.activityId,
        userId: input.userId,
        dealId: input.dealId,
        sourceType: "USER",
      },
      data: {
        ...(input.activityType !== undefined
          ? { activityType: input.activityType }
          : {}),
        ...(input.title !== undefined ? { title: input.title } : {}),
        ...(input.summary !== undefined ? { summary: input.summary } : {}),
        ...(input.body !== undefined ? { body: input.body } : {}),
        ...(input.occurredAt !== undefined
          ? { occurredAt: input.occurredAt }
          : {}),
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
    });

    if (result.count === 0) {
      return null;
    }

    const activity = await this.client.dealActivity.findFirst({
      where: {
        id: input.activityId,
        userId: input.userId,
        dealId: input.dealId,
        sourceType: "USER",
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

  // 기능 : 최신순 커서 페이지네이션에 사용할 복합 조건을 생성합니다.
  private createTimelineCursorWhere(
    cursor: DealActivityCursor | null
  ): Prisma.DealActivityWhereInput {
    if (!cursor) {
      return {};
    }

    return {
      OR: [
        {
          occurredAt: {
            lt: cursor.occurredAt,
          },
        },
        {
          occurredAt: cursor.occurredAt,
          id: {
            lt: cursor.id,
          },
        },
      ],
    };
  }

  // 기능 : Prisma Json 입력값을 nullable Json 컬럼에 맞게 변환합니다.
  private toNullableInputJson(
    value: unknown | null
  ): Prisma.NullableJsonNullValueInput | Prisma.InputJsonValue {
    return value === null
      ? Prisma.JsonNull
      : (JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue);
  }

  // 기능 : Prisma 행을 애플리케이션 계층 레코드로 변환합니다.
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
}
