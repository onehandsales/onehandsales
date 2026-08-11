import { PrismaDealBoundaryAdapter } from "./prisma-deal-boundary.adapter";
import type { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";

const USER_ID = "00000000-0000-4000-8000-000000000101";
const DEAL_ID = "00000000-0000-4000-8000-000000000201";
const LOG_ID = "00000000-0000-4000-8000-000000000301";
const ACTIVITY_ID = "00000000-0000-4000-8000-000000000401";
const NOW = new Date("2026-07-26T05:00:00.000Z");

describe("PrismaDealBoundaryAdapter", () => {
  it("reads active deal labels through the shared boundary", async () => {
    const client = createMockClient();
    client.deal.findMany.mockResolvedValue([
      { id: DEAL_ID, dealName: "Acme Renewal" },
    ]);
    const adapter = new PrismaDealBoundaryAdapter(
      client as unknown as PrismaService
    );

    const deals = await adapter.findDealLabelsByIds(USER_ID, [DEAL_ID]);

    expect(deals).toEqual([{ id: DEAL_ID, dealName: "Acme Renewal" }]);
    expect(client.deal.findMany).toHaveBeenCalledWith({
      where: {
        id: { in: [DEAL_ID] },
        userId: USER_ID,
        deletedAt: null,
      },
      select: {
        id: true,
        dealName: true,
      },
    });
  });

  it("creates following action logs with the provided transaction client", async () => {
    const client = createMockClient();
    client.dealFollowingActionLog.create.mockResolvedValue(createLogRow());
    const adapter = new PrismaDealBoundaryAdapter(
      client as unknown as PrismaService
    );

    const log = await adapter.createFollowingActionLog({
      userId: USER_ID,
      dealId: DEAL_ID,
      followingAction: "회의록 기반 후속 조치",
    });

    expect(log.id).toBe(LOG_ID);
    expect(client.dealFollowingActionLog.create).toHaveBeenCalledWith({
      data: {
        userId: USER_ID,
        dealId: DEAL_ID,
        followingAction: "회의록 기반 후속 조치",
      },
    });
  });

  it("creates deal activity rows with source based idempotency fields", async () => {
    const client = createMockClient();
    client.dealActivity.create.mockResolvedValue(createActivityRow());
    const adapter = new PrismaDealBoundaryAdapter(
      client as unknown as PrismaService
    );

    await adapter.createActivity({
      userId: USER_ID,
      dealId: DEAL_ID,
      activityType: "FOLLOW_UP_SENT",
      sourceType: "FOLLOW_UP",
      sourceId: "attempt-1",
      title: "이메일 follow-up을 보냈어요.",
      occurredAt: NOW,
      linkedRecordsJson: [],
      metadataJson: { deliveryAttemptId: "attempt-1" },
    });

    expect(client.dealActivity.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: USER_ID,
        dealId: DEAL_ID,
        activityType: "FOLLOW_UP_SENT",
        sourceType: "FOLLOW_UP",
        sourceId: "attempt-1",
        linkedRecordsJson: [],
        metadataJson: { deliveryAttemptId: "attempt-1" },
      }),
      select: expect.objectContaining({
        id: true,
      }),
    });
  });
});

// 기능 : 딜 boundary adapter 테스트에 필요한 Prisma client mock을 생성합니다.
function createMockClient() {
  return {
    deal: {
      findMany: jest.fn(),
    },
    dealFollowingActionLog: {
      create: jest.fn(),
    },
    dealActivity: {
      create: jest.fn(),
      findFirst: jest.fn(),
    },
  };
}

// 기능 : 다음 행동 로그 테스트에 사용할 Prisma row fixture를 생성합니다.
function createLogRow() {
  return {
    id: LOG_ID,
    userId: USER_ID,
    dealId: DEAL_ID,
    followingAction: "회의록 기반 후속 조치",
    checkComplete: false,
    deletedAt: null,
    deletedByUserId: null,
    trashExpiresAt: null,
    createdAt: NOW,
    updatedAt: NOW,
  };
}

// 기능 : 딜 활동 테스트에 사용할 Prisma row fixture를 생성합니다.
function createActivityRow() {
  return {
    id: ACTIVITY_ID,
    userId: USER_ID,
    dealId: DEAL_ID,
    activityType: "FOLLOW_UP_SENT",
    sourceType: "FOLLOW_UP",
    sourceId: "attempt-1",
    title: "이메일 follow-up을 보냈어요.",
    summary: null,
    body: null,
    occurredAt: NOW,
    linkedRecordsJson: [],
    metadataJson: { deliveryAttemptId: "attempt-1" },
    createdAt: NOW,
    updatedAt: NOW,
  };
}
