import {
  BrowserPushSubscriptionStatus,
  NotificationDeliveryChannel,
  NotificationDeliveryStatus,
  ProductAnalyticsTargetType,
} from "@prisma/client";
import type { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";
import { PrismaAdminUserRepository } from "./prisma-admin-user.repository";

const targetUserId = "00000000-0000-4000-8000-000000000010";

// 기능 : PrismaAdminUserRepository의 Admin 사용자 overview 안전 select 정책을 테스트합니다.
describe("PrismaAdminUserRepository", () => {
  // 기능 : notification summary 조회가 browser push endpoint/key/userAgent 원문을 조회하지 않는지 검증합니다.
  it("does not select browser push endpoint keys or userAgent in overview", async () => {
    const client = createClientMock();
    const repository = new PrismaAdminUserRepository(
      client as unknown as PrismaService
    );

    const overview = await repository.getUserOverview(
      targetUserId,
      new Date("2026-08-10T00:00:00.000Z")
    );
    const deliveryQuery = client.notificationDeliveryAttempt.findFirst.mock
      .calls[0]?.[0];
    const subscriptionQuery = client.browserPushSubscription.count.mock.calls[0]?.[0];

    expect(overview?.notificationSummary.browserPushEnabled).toBe(true);
    expect(subscriptionQuery).toEqual({
      where: {
        userId: targetUserId,
        status: BrowserPushSubscriptionStatus.ACTIVE,
      },
    });
    expect(deliveryQuery).toEqual({
      where: {
        userId: targetUserId,
        channel: NotificationDeliveryChannel.BROWSER_PUSH,
      },
      select: { status: true, safeErrorCode: true },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    });
    expect(JSON.stringify(client.browserPushSubscription.count.mock.calls)).not.toContain(
      "endpointCiphertext"
    );
    expect(JSON.stringify(deliveryQuery)).not.toContain("userAgent");
  });

  // 기능 : timeline 조회가 analytics payloadJson 원문을 select하지 않는지 검증합니다.
  it("does not select analytics payloadJson in activity timeline", async () => {
    const client = createClientMock();
    const repository = new PrismaAdminUserRepository(
      client as unknown as PrismaService
    );

    const response = await repository.listActivityTimeline({
      userId: targetUserId,
      limit: 30,
    });
    const analyticsQuery = client.productAnalyticsEvent.findMany.mock.calls[0]?.[0];

    expect(response.items[0]?.eventType).toBe("deal_created");
    expect(analyticsQuery?.select).toEqual({
      id: true,
      eventName: true,
      targetType: true,
      targetId: true,
      occurredAt: true,
    });
    expect(JSON.stringify(analyticsQuery?.select)).not.toContain("payloadJson");
  });
});

// 기능 : PrismaAdminUserRepository 테스트용 Prisma client mock을 생성합니다.
function createClientMock() {
  const emptyGroupBy = jest.fn().mockResolvedValue([]);
  const emptyFindMany = jest.fn().mockResolvedValue([]);

  return {
    user: {
      findUnique: jest.fn().mockResolvedValue({
        id: targetUserId,
        email: "local.user@example.com",
        displayName: "로컬 사용자",
        role: "USER",
        status: "ACTIVE",
        preferredLocale: "ko-KR",
        timeZone: "Asia/Seoul",
        countryCode: "KR",
        defaultCurrencyCode: "KRW",
        createdAt: new Date("2026-08-01T00:00:00.000Z"),
        lastLoginAt: null,
      }),
    },
    company: {
      count: jest.fn().mockResolvedValue(1),
      groupBy: emptyGroupBy,
      findMany: emptyFindMany,
    },
    contact: {
      count: jest.fn().mockResolvedValue(2),
      groupBy: emptyGroupBy,
      findMany: emptyFindMany,
    },
    product: {
      count: jest.fn().mockResolvedValue(3),
      groupBy: emptyGroupBy,
      findMany: emptyFindMany,
    },
    deal: {
      count: jest.fn().mockResolvedValue(4),
      groupBy: emptyGroupBy,
    },
    schedule: {
      count: jest.fn().mockResolvedValue(5),
      groupBy: emptyGroupBy,
    },
    meetingNote: {
      count: jest.fn().mockResolvedValue(6),
      groupBy: emptyGroupBy,
    },
    businessCardScanLog: {
      count: jest.fn().mockResolvedValue(7),
      findMany: emptyFindMany,
    },
    importJob: {
      count: jest.fn().mockResolvedValue(8),
      findMany: emptyFindMany,
    },
    productAnalyticsEvent: {
      count: jest.fn().mockResolvedValue(9),
      findFirst: jest.fn().mockResolvedValue({
        occurredAt: new Date("2026-08-02T00:00:00.000Z"),
      }),
      findMany: jest.fn().mockResolvedValue([
        {
          id: "00000000-0000-4000-8000-000000000020",
          eventName: "deal_created",
          targetType: ProductAnalyticsTargetType.DEAL,
          targetId: "00000000-0000-4000-8000-000000000030",
          occurredAt: new Date("2026-08-03T00:00:00.000Z"),
        },
      ]),
    },
    companyMemoLog: { groupBy: emptyGroupBy },
    companyUserPrivateMemoLog: { groupBy: emptyGroupBy },
    contactMemoLog: { groupBy: emptyGroupBy },
    contactUserPrivateMemoLog: { groupBy: emptyGroupBy },
    productMemoLog: { groupBy: emptyGroupBy },
    productUserPrivateMemoLog: { groupBy: emptyGroupBy },
    dealFollowingActionLog: { groupBy: emptyGroupBy },
    dealMemoLog: { groupBy: emptyGroupBy },
    trashRecoveryRequest: { groupBy: emptyGroupBy },
    userActivationSnapshot: {
      findUnique: jest.fn().mockResolvedValue({
        status: "ACTIVATED",
        activatedAt: new Date("2026-08-01T00:00:00.000Z"),
      }),
    },
    aiProviderCallLog: {
      aggregate: jest.fn().mockResolvedValue({
        _count: { _all: 3 },
        _sum: { estimatedCostAmount: { toString: () => "0.42" } },
      }),
    },
    userNotificationSetting: {
      findUnique: jest.fn().mockResolvedValue({
        browserPushEnabled: true,
      }),
    },
    browserPushSubscription: {
      count: jest
        .fn()
        .mockResolvedValueOnce(1)
        .mockResolvedValueOnce(0),
    },
    notificationDeliveryAttempt: {
      findFirst: jest.fn().mockResolvedValue({
        status: NotificationDeliveryStatus.SENT,
        safeErrorCode: null,
      }),
    },
  };
}
