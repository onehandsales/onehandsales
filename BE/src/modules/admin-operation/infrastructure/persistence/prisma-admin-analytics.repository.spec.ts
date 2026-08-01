import type { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";
import { PrismaAdminAnalyticsRepository } from "./prisma-admin-analytics.repository";

const adminUserId = "00000000-0000-4000-8000-000000000001";
const analyticsRange = {
  from: new Date("2026-07-01T00:00:00.000Z"),
  to: new Date("2026-07-31T23:59:59.999Z"),
  timeZone: "Asia/Seoul",
};

// 기능 : PrismaAdminAnalyticsRepository의 Admin analytics safe 집계 정책을 테스트합니다.
describe("PrismaAdminAnalyticsRepository", () => {
  // 기능 : overview 집계가 raw payload를 응답에 노출하지 않고 allowlist bucket만 반환하는지 검증합니다.
  it("aggregates overview without dumping route or mobile raw payload", async () => {
    const client = createClientMock();
    const repository = new PrismaAdminAnalyticsRepository(
      client as unknown as PrismaService
    );

    const response = await repository.getAnalyticsOverview(analyticsRange);

    expect(response.activation).toEqual({
      activatedUsers: 10,
      notActivatedUsers: 5,
      activationRate: 0.6667,
    });
    expect(response.retention).toEqual([
      {
        cohortDate: "2026-07-01",
        dayOffset: 7,
        cohortUserCount: 10,
        retainedUserCount: 4,
        retentionRate: 0.4,
      },
    ]);
    expect(response.events.find((event) => event.eventName === "deal_created")).toEqual(
      { eventName: "deal_created", count: 3 }
    );
    expect(response.routes).toEqual([{ routeKey: "deals", viewCount: 1 }]);
    expect(response.mobileFieldUse).toEqual(
      expect.objectContaining({
        businessCardCaptureStarted: 2,
        meetingNoteRecordingStarted: 1,
        mobilePushPermissionPromptOpened: 1,
      })
    );
    expect(response.mobileFieldUse.mobilePushPermissionResult).toEqual({
      granted: 1,
      denied: 1,
      default: 0,
      unsupported: 0,
      browserPushEnabledTrue: 1,
      browserPushEnabledFalse: 1,
    });
    expect(JSON.stringify(response)).not.toContain("rawSecret");
    expect(JSON.stringify(response)).not.toContain("push-endpoint");
  });

  // 기능 : route/mobile bucket이 raw payload row select 없이 key 추출 SQL과 안전한 AI 집계만 쓰는지 검증합니다.
  it("uses allowlist key extraction SQL and no raw AI fields", async () => {
    const client = createClientMock();
    const repository = new PrismaAdminAnalyticsRepository(
      client as unknown as PrismaService
    );

    await repository.getAnalyticsOverview(analyticsRange);

    expect(client.productAnalyticsEvent.findMany).not.toHaveBeenCalled();
    expect(client.$queryRaw).toHaveBeenCalledTimes(2);
    expect(JSON.stringify(client.$queryRaw.mock.calls)).not.toContain(
      "endpoint"
    );
    expect(JSON.stringify(client.$queryRaw.mock.calls)).not.toContain("p256dh");
    expect(JSON.stringify(client.$queryRaw.mock.calls)).not.toContain(
      "userAgent"
    );
    expect(JSON.stringify(client.aiProviderCallLog.count.mock.calls)).not.toContain(
      "metadataJson"
    );
    expect(JSON.stringify(client.aiProviderCallLog.aggregate.mock.calls)).not.toContain(
      "metadataJson"
    );
    expect(JSON.stringify(client.aiProviderCallLog.aggregate.mock.calls)).not.toContain(
      "prompt"
    );
  });

  // 기능 : Admin analytics 감사 로그를 append-only로 저장하는지 검증합니다.
  it("creates append-only analytics audit log", async () => {
    const client = createClientMock();
    const repository = new PrismaAdminAnalyticsRepository(
      client as unknown as PrismaService
    );

    await repository.createAuditLog({
      adminUserId,
      targetUserId: null,
      targetType: "SYSTEM_OPERATION_CHECK",
      targetId: null,
      action: "ADMIN_ANALYTICS_VIEW",
      result: "SUCCESS",
      requestId: "req-analytics-1",
      metadataJson: { endpoint: "analyticsOverview" },
    });

    expect(client.adminAuditLog.create).toHaveBeenCalledWith({
      data: {
        adminUserId,
        targetUserId: null,
        targetType: "SYSTEM_OPERATION_CHECK",
        targetId: null,
        action: "ADMIN_ANALYTICS_VIEW",
        result: "SUCCESS",
        requestId: "req-analytics-1",
        metadataJson: { endpoint: "analyticsOverview" },
      },
      select: { id: true },
    });
  });
});

// 기능 : 테스트용 Admin analytics Prisma client mock을 생성합니다.
function createClientMock() {
  return {
    userActivationSnapshot: {
      count: jest
        .fn()
        .mockResolvedValueOnce(10)
        .mockResolvedValueOnce(5),
    },
    retentionCohortSnapshot: {
      findMany: jest.fn().mockResolvedValue([
        {
          cohortDate: new Date("2026-07-01T00:00:00.000Z"),
          dayOffset: 7,
          cohortUserCount: 10,
          retainedUserCount: 4,
        },
      ]),
    },
    productAnalyticsEvent: {
      groupBy: jest
        .fn()
        .mockResolvedValueOnce([
          { eventName: "deal_created", _count: { _all: 3 } },
          { eventName: "meeting_note_created", _count: { _all: 2 } },
        ])
        .mockResolvedValueOnce([
          {
            eventName: "business_card_capture_started",
            _count: { _all: 2 },
          },
          {
            eventName: "meeting_note_recording_started",
            _count: { _all: 1 },
          },
          {
            eventName: "mobile_push_permission_prompt_opened",
            _count: { _all: 1 },
          },
        ]),
      findMany: jest.fn(),
    },
    aiProviderCallLog: {
      count: jest
        .fn()
        .mockResolvedValueOnce(6)
        .mockResolvedValueOnce(4)
        .mockResolvedValueOnce(2),
      aggregate: jest.fn().mockResolvedValue({
        _sum: {
          estimatedCostAmount: { toString: () => "1.230000" },
        },
      }),
    },
    adminAuditLog: {
      create: jest.fn().mockResolvedValue({ id: "audit-id" }),
    },
    $queryRaw: jest
      .fn()
      .mockResolvedValueOnce([
        { routeKey: "deals", viewCount: 1 },
        { routeKey: "private-admin-route", viewCount: 1 },
      ])
      .mockResolvedValueOnce([
        {
          permissionState: "granted",
          browserPushEnabled: true,
          count: 1,
        },
        {
          permissionState: "denied",
          browserPushEnabled: false,
          count: 1,
        },
      ]),
  };
}
