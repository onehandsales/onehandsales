import {
  AdminAuditAction,
  AdminAuditResult,
  AdminTargetType,
} from "@/modules/admin-operation/application/ports/admin-operation.types";
import type { AdminAnalyticsRepository } from "@/modules/admin-operation/application/ports/admin-analytics.repository";
import type { AdminAnalyticsOverviewRecord } from "@/modules/admin-operation/application/ports/admin-analytics-read-model.types";
import {
  AdminAnalyticsRangeRequiredError,
  AdminAnalyticsRangeTooLargeError,
  AdminTimezoneInvalidError,
} from "@/modules/admin-operation/domain/admin-operation.errors";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { AdminAnalyticsApplicationService } from "./admin-analytics-application.service";

const adminUser = {
  id: "00000000-0000-4000-8000-000000000001",
  sessionId: "session-analytics-1",
  email: "admin@example.com",
  displayName: "관리자",
  role: "ADMIN",
  status: "ACTIVE",
  timeZone: "Asia/Seoul",
} satisfies CurrentUserContext;
const requestMetadata = { requestId: "req-analytics-1" };

// 기능 : AdminAnalyticsApplicationService의 검증과 감사 로그 정책을 테스트합니다.
describe("AdminAnalyticsApplicationService", () => {
  // 기능 : overview 조회가 안전한 audit metadata만 남기고 raw payload 없이 응답하는지 검증합니다.
  it("stores safe analytics audit metadata and returns overview", async () => {
    const repository = createRepositoryMock();
    repository.getAnalyticsOverview.mockResolvedValue(createOverviewRecord());
    const service = new AdminAnalyticsApplicationService(repository);

    const response = await service.getAnalyticsOverview(
      adminUser,
      {
        from: "2026-07-01T00:00:00.000Z",
        to: "2026-07-31T23:59:59.999Z",
        timeZone: "Asia/Seoul",
        countryCode: "kr",
        preferredLocale: "ko-KR",
      },
      requestMetadata
    );

    expect(repository.getAnalyticsOverview).toHaveBeenCalledWith(
      expect.objectContaining({
        from: new Date("2026-07-01T00:00:00.000Z"),
        to: new Date("2026-07-31T23:59:59.999Z"),
        timeZone: "Asia/Seoul",
        countryCode: "KR",
        preferredLocale: "ko-KR",
      })
    );
    expect(repository.createAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        adminUserId: adminUser.id,
        targetUserId: null,
        targetType: AdminTargetType.SYSTEM_OPERATION_CHECK,
        targetId: null,
        action: AdminAuditAction.ADMIN_ANALYTICS_VIEW,
        result: AdminAuditResult.SUCCESS,
        requestId: requestMetadata.requestId,
        metadataJson: expect.objectContaining({
          endpoint: "analyticsOverview",
          countryCode: "KR",
          preferredLocale: "ko-KR",
        }),
      })
    );
    expect(response.mobileFieldUse.mobilePushPermissionResult.granted).toBe(2);
    expect(JSON.stringify(response)).not.toContain("payloadJson");
    expect(JSON.stringify(repository.createAuditLog.mock.calls)).not.toContain(
      "rawPayload"
    );
  });

  // 기능 : analytics 조회 audit 기록에 실패하면 overview 응답을 반환하지 않는지 검증합니다.
  it("does not return analytics overview when audit creation fails", async () => {
    const repository = createRepositoryMock();
    repository.getAnalyticsOverview.mockResolvedValue(createOverviewRecord());
    repository.createAuditLog.mockRejectedValue(new Error("audit failed"));
    const service = new AdminAnalyticsApplicationService(repository);

    await expect(
      service.getAnalyticsOverview(
        adminUser,
        {
          from: "2026-07-01T00:00:00.000Z",
          to: "2026-07-31T23:59:59.999Z",
        },
        requestMetadata
      )
    ).rejects.toThrow("audit failed");
  });

  // 기능 : from/to 필수 기간이 없으면 G07 계약 오류 code로 거부하는지 검증합니다.
  it("rejects missing analytics range", async () => {
    const repository = createRepositoryMock();
    const service = new AdminAnalyticsApplicationService(repository);

    await expect(
      service.getAnalyticsOverview(
        adminUser,
        { to: "2026-07-31T23:59:59.999Z" },
        requestMetadata
      )
    ).rejects.toBeInstanceOf(AdminAnalyticsRangeRequiredError);
  });

  // 기능 : 기간 상한을 넘으면 G07 계약 오류 code로 거부하는지 검증합니다.
  it("rejects analytics range over 366 days", async () => {
    const repository = createRepositoryMock();
    const service = new AdminAnalyticsApplicationService(repository);

    await expect(
      service.getAnalyticsOverview(
        adminUser,
        {
          from: "2025-01-01T00:00:00.000Z",
          to: "2026-08-01T00:00:00.000Z",
        },
        requestMetadata
      )
    ).rejects.toBeInstanceOf(AdminAnalyticsRangeTooLargeError);
  });

  // 기능 : IANA timezone이 아니면 G07 계약 오류 code로 거부하는지 검증합니다.
  it("rejects invalid analytics timezone", async () => {
    const repository = createRepositoryMock();
    const service = new AdminAnalyticsApplicationService(repository);

    await expect(
      service.getAnalyticsOverview(
        adminUser,
        {
          from: "2026-07-01T00:00:00.000Z",
          to: "2026-07-31T23:59:59.999Z",
          timeZone: "Not/A_Timezone",
        },
        requestMetadata
      )
    ).rejects.toBeInstanceOf(AdminTimezoneInvalidError);
  });
});

// 기능 : 테스트용 AdminAnalyticsRepository mock을 생성합니다.
function createRepositoryMock(): jest.Mocked<AdminAnalyticsRepository> {
  return {
    getAnalyticsOverview: jest.fn(),
    createAuditLog: jest.fn(),
  };
}

// 기능 : 테스트용 Admin analytics overview record를 생성합니다.
function createOverviewRecord(): AdminAnalyticsOverviewRecord {
  return {
    range: {
      from: "2026-07-01T00:00:00.000Z",
      to: "2026-07-31T23:59:59.999Z",
      timeZone: "Asia/Seoul",
    },
    activation: {
      activatedUsers: 20,
      notActivatedUsers: 5,
      activationRate: 0.8,
    },
    retention: [
      {
        cohortDate: "2026-07-01",
        dayOffset: 7,
        cohortUserCount: 10,
        retainedUserCount: 4,
        retentionRate: 0.4,
      },
    ],
    events: [{ eventName: "deal_created", count: 12 }],
    routes: [{ routeKey: "deals", viewCount: 9 }],
    aiUsage: {
      requestCount: 10,
      successCount: 8,
      failureCount: 2,
      estimatedCost: "1.230000",
    },
    mobileFieldUse: {
      businessCardCaptureStarted: 3,
      businessCardCaptureRetried: 1,
      businessCardOcrFailed: 1,
      meetingNoteRecordingStarted: 4,
      meetingNoteRecordingCompleted: 3,
      meetingNoteRecordingFailed: 1,
      localDraftSaved: 2,
      localDraftRestored: 1,
      localDraftDiscarded: 1,
      mobilePushPermissionPromptOpened: 5,
      mobilePushPermissionResult: {
        granted: 2,
        denied: 1,
        default: 1,
        unsupported: 1,
        browserPushEnabledTrue: 2,
        browserPushEnabledFalse: 3,
      },
    },
  };
}
