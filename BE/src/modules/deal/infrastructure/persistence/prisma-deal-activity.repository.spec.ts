import { Prisma } from "@prisma/client";
import { PrismaDealActivityRepository } from "./prisma-deal-activity.repository";
import type { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";

type MockDealActivityModel = {
  readonly create: jest.Mock;
  readonly findFirst: jest.Mock;
  readonly findMany: jest.Mock;
  readonly updateMany: jest.Mock;
};

type MockPrismaClient = {
  readonly dealActivity: MockDealActivityModel;
};

type DealActivityRowFixture = {
  readonly id: string;
  readonly userId: string;
  readonly dealId: string;
  readonly activityType:
    | "DEAL_CREATED"
    | "SCHEDULE_LINKED"
    | "FOLLOW_UP_SENT";
  readonly sourceType: "SYSTEM" | "USER" | "SCHEDULE" | "FOLLOW_UP";
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

const USER_ID = "00000000-0000-4000-8000-000000000101";
const DEAL_ID = "00000000-0000-4000-8000-000000000201";
const ACTIVITY_ID = "00000000-0000-4000-8000-000000000301";
const SOURCE_ID = "00000000-0000-4000-8000-000000000401";
const OCCURRED_AT = new Date("2026-07-26T01:00:00.000Z");

describe("PrismaDealActivityRepository", () => {
  it("creates a user-owned deal activity with safe json fields", async () => {
    const client = createMockClient();
    client.dealActivity.create.mockResolvedValue(createActivityRow());
    const repository = new PrismaDealActivityRepository(
      client as unknown as PrismaService
    );

    const activity = await repository.createActivity({
      userId: USER_ID,
      dealId: DEAL_ID,
      activityType: "FOLLOW_UP_SENT",
      sourceType: "FOLLOW_UP",
      sourceId: SOURCE_ID,
      title: "후속 연락 발송",
      summary: "이메일 발송 성공",
      body: null,
      occurredAt: OCCURRED_AT,
      linkedRecordsJson: [{ targetType: "CONTACT", targetId: "contact-1" }],
      metadataJson: { messageId: "message-1" },
    });

    expect(client.dealActivity.create).toHaveBeenCalledWith({
      data: {
        userId: USER_ID,
        dealId: DEAL_ID,
        activityType: "FOLLOW_UP_SENT",
        sourceType: "FOLLOW_UP",
        sourceId: SOURCE_ID,
        title: "후속 연락 발송",
        summary: "이메일 발송 성공",
        body: null,
        occurredAt: OCCURRED_AT,
        linkedRecordsJson: [{ targetType: "CONTACT", targetId: "contact-1" }],
        metadataJson: { messageId: "message-1" },
      },
      select: expect.objectContaining({
        id: true,
        metadataJson: true,
      }),
    });
    expect(activity.id).toBe(ACTIVITY_ID);
    expect(activity.metadataJson).toEqual({ messageId: "message-1" });
  });

  it("finds an existing automatic activity by source ownership key", async () => {
    const client = createMockClient();
    client.dealActivity.findFirst.mockResolvedValue(createActivityRow());
    const repository = new PrismaDealActivityRepository(
      client as unknown as PrismaService
    );

    await repository.findActivityBySource({
      userId: USER_ID,
      dealId: DEAL_ID,
      activityType: "SCHEDULE_LINKED",
      sourceType: "SCHEDULE",
      sourceId: SOURCE_ID,
    });

    expect(client.dealActivity.findFirst).toHaveBeenCalledWith({
      where: {
        userId: USER_ID,
        dealId: DEAL_ID,
        activityType: "SCHEDULE_LINKED",
        sourceType: "SCHEDULE",
        sourceId: SOURCE_ID,
      },
      select: expect.objectContaining({
        id: true,
      }),
    });
  });

  it("lists deal activities with active deal guard and desc cursor order", async () => {
    const client = createMockClient();
    client.dealActivity.findMany.mockResolvedValue([createActivityRow()]);
    const repository = new PrismaDealActivityRepository(
      client as unknown as PrismaService
    );

    await repository.listActivitiesForDeal({
      userId: USER_ID,
      dealId: DEAL_ID,
      cursor: {
        occurredAt: OCCURRED_AT,
        id: ACTIVITY_ID,
      },
      take: 21,
    });

    expect(client.dealActivity.findMany).toHaveBeenCalledWith({
      where: {
        userId: USER_ID,
        dealId: DEAL_ID,
        deal: {
          deletedAt: null,
        },
        OR: [
          {
            occurredAt: {
              lt: OCCURRED_AT,
            },
          },
          {
            occurredAt: OCCURRED_AT,
            id: {
              lt: ACTIVITY_ID,
            },
          },
        ],
      },
      select: expect.objectContaining({
        id: true,
      }),
      orderBy: [{ occurredAt: "desc" }, { id: "desc" }],
      take: 21,
    });
  });

  it("updates only user-created activities", async () => {
    const client = createMockClient();
    client.dealActivity.updateMany.mockResolvedValue({ count: 1 });
    client.dealActivity.findFirst.mockResolvedValue(
      createActivityRow({ sourceType: "USER" })
    );
    const repository = new PrismaDealActivityRepository(
      client as unknown as PrismaService
    );

    const activity = await repository.updateUserActivity({
      userId: USER_ID,
      dealId: DEAL_ID,
      activityId: ACTIVITY_ID,
      title: "통화 완료",
      linkedRecordsJson: null,
    });

    expect(client.dealActivity.updateMany).toHaveBeenCalledWith({
      where: {
        id: ACTIVITY_ID,
        userId: USER_ID,
        dealId: DEAL_ID,
        sourceType: "USER",
      },
      data: {
        title: "통화 완료",
        linkedRecordsJson: Prisma.JsonNull,
      },
    });
    expect(activity?.sourceType).toBe("USER");
  });

  it("runs work with a transaction-scoped repository when a runner exists", async () => {
    const transactionClient = createMockClient();
    const prismaService = {
      dealActivity: createMockDealActivityModel(),
      $transaction: jest.fn(
        async (work: (transaction: MockPrismaClient) => Promise<string>) =>
          work(transactionClient)
      ),
    };
    const repository = new PrismaDealActivityRepository(
      prismaService as unknown as PrismaService,
      prismaService as unknown as PrismaService
    );

    const result = await repository.runInTransaction(async (transactionRepo) => {
      expect(transactionRepo).toBeInstanceOf(PrismaDealActivityRepository);
      await transactionRepo.createActivity({
        userId: USER_ID,
        dealId: DEAL_ID,
        activityType: "DEAL_CREATED",
        sourceType: "SYSTEM",
        sourceId: DEAL_ID,
        title: "딜 생성",
        occurredAt: OCCURRED_AT,
      });
      return "done";
    });

    expect(result).toBe("done");
    expect(prismaService.$transaction).toHaveBeenCalledTimes(1);
    expect(transactionClient.dealActivity.create).toHaveBeenCalledTimes(1);
  });
});

function createMockClient(): MockPrismaClient {
  return {
    dealActivity: createMockDealActivityModel(),
  };
}

function createMockDealActivityModel(): MockDealActivityModel {
  return {
    create: jest.fn().mockResolvedValue(createActivityRow()),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    updateMany: jest.fn(),
  };
}

function createActivityRow(
  overrides: Partial<DealActivityRowFixture> = {}
): DealActivityRowFixture {
  return {
    id: ACTIVITY_ID,
    userId: USER_ID,
    dealId: DEAL_ID,
    activityType: "FOLLOW_UP_SENT",
    sourceType: "FOLLOW_UP",
    sourceId: SOURCE_ID,
    title: "후속 연락 발송",
    summary: "이메일 발송 성공",
    body: null,
    occurredAt: OCCURRED_AT,
    linkedRecordsJson: [{ targetType: "CONTACT", targetId: "contact-1" }],
    metadataJson: { messageId: "message-1" },
    createdAt: OCCURRED_AT,
    updatedAt: OCCURRED_AT,
    ...overrides,
  };
}
