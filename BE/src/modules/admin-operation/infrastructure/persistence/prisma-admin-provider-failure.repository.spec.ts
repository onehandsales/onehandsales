import {
  AiProviderCallStatus,
  AiProviderOperation,
  BusinessCardScanStatus,
  ExternalCalendarConnectionStatus,
  ExternalCalendarProvider,
  ExternalCalendarSourceStatus,
  FollowUpDeliveryAttemptStatus,
  FollowUpDeliveryChannel,
  NotificationDeliveryChannel,
  NotificationDeliveryStatus,
} from "@prisma/client";
import {
  AdminProviderFailureFeatureArea,
  AdminProviderFailureType,
} from "@/modules/admin-operation/application/ports/admin-provider-failure.repository";
import type { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";
import { PrismaAdminProviderFailureRepository } from "./prisma-admin-provider-failure.repository";

const targetUserId = "00000000-0000-4000-8000-000000000010";
const aiLogId = "00000000-0000-4000-8000-000000000020";
const ocrLogId = "00000000-0000-4000-8000-000000000030";
const pushAttemptId = "00000000-0000-4000-8000-000000000040";
const followUpAttemptId = "00000000-0000-4000-8000-000000000050";
const calendarConnectionId = "00000000-0000-4000-8000-000000000060";
const createdAt = new Date("2026-08-01T00:00:00.000Z");

// 기능 : PrismaAdminProviderFailureRepository의 provider 실패 safe select 정책을 테스트합니다.
describe("PrismaAdminProviderFailureRepository", () => {
  // 기능 : provider failure 목록 조회가 raw/prompt/token/quota/browser push secret 필드를 select하지 않는지 검증합니다.
  it("selects only safe provider failure fields for list sources", async () => {
    const client = createClientMock();
    const repository = new PrismaAdminProviderFailureRepository(
      client as unknown as PrismaService
    );

    const response = await repository.listProviderFailures({
      providerType: AdminProviderFailureType.AI,
      featureArea: AdminProviderFailureFeatureArea.MEETING_NOTE,
      status: "ALL",
      limit: 50,
    });
    const aiQuery = client.aiProviderCallLog.findMany.mock.calls[0]?.[0];

    expect(response.items[0]?.id).toBe(`AI:${aiLogId}`);
    expect(aiQuery?.select).toEqual(
      expect.objectContaining({
        id: true,
        safeErrorCode: true,
        safeErrorMessage: true,
        retryable: true,
        latencyMs: true,
      })
    );
    expect(JSON.stringify(aiQuery?.select)).not.toContain("inputTokenCount");
    expect(JSON.stringify(aiQuery?.select)).not.toContain("outputTokenCount");
    expect(JSON.stringify(aiQuery?.select)).not.toContain("totalTokenCount");
    expect(JSON.stringify(aiQuery?.select)).not.toContain(
      "estimatedCostAmount"
    );
    expect(JSON.stringify(aiQuery?.select)).not.toContain("metadataJson");
  });

  // 기능 : 모든 source 조회 select가 G06 금지 필드를 제외하는지 검증합니다.
  it("does not select forbidden raw fields across all provider sources", async () => {
    const client = createClientMock();
    const repository = new PrismaAdminProviderFailureRepository(
      client as unknown as PrismaService
    );

    await repository.listProviderFailures({
      status: "ALL",
      limit: 50,
    });

    const ocrQuery = client.businessCardScanLog.findMany.mock.calls[0]?.[0];
    const pushQuery =
      client.notificationDeliveryAttempt.findMany.mock.calls[0]?.[0];
    const followUpQuery =
      client.followUpDeliveryAttempt.findMany.mock.calls[0]?.[0];
    const calendarConnectionQuery =
      client.externalCalendarConnection.findMany.mock.calls[0]?.[0];
    const calendarSourceQuery =
      client.externalCalendarSource.findMany.mock.calls[0]?.[0];

    expect(JSON.stringify(ocrQuery?.select)).not.toContain("promptSnapshot");
    expect(JSON.stringify(ocrQuery?.select)).not.toContain("requestToken");
    expect(JSON.stringify(ocrQuery?.select)).not.toContain("totalCost");
    expect(JSON.stringify(pushQuery?.select)).not.toContain("endpointHash");
    expect(JSON.stringify(pushQuery?.select)).not.toContain(
      "endpointCiphertext"
    );
    expect(JSON.stringify(pushQuery?.select)).not.toContain("p256dhCiphertext");
    expect(JSON.stringify(pushQuery?.select)).not.toContain("authCiphertext");
    expect(JSON.stringify(pushQuery?.select)).not.toContain("userAgent");
    expect(JSON.stringify(followUpQuery?.select)).not.toContain("detailJson");
    expect(JSON.stringify(calendarConnectionQuery?.select)).not.toContain(
      "encryptedAccessToken"
    );
    expect(JSON.stringify(calendarConnectionQuery?.select)).not.toContain(
      "providerAccountEmail"
    );
    expect(JSON.stringify(calendarSourceQuery?.select)).not.toContain(
      "calendarId"
    );
    expect(JSON.stringify(calendarSourceQuery?.select)).not.toContain(
      "calendarName"
    );
    expect(JSON.stringify(calendarSourceQuery?.select)).not.toContain(
      "syncToken"
    );
  });

  // 기능 : push 상세 조회가 BrowserPushSubscription delegate와 endpoint/key/userAgent 원문을 건드리지 않는지 검증합니다.
  it("reads push detail without browser push subscription raw fields", async () => {
    const client = createClientMock();
    const repository = new PrismaAdminProviderFailureRepository(
      client as unknown as PrismaService
    );

    const detail = await repository.getProviderFailureDetail(
      `PUSH:${pushAttemptId}`
    );
    const pushDetailQuery =
      client.notificationDeliveryAttempt.findUnique.mock.calls[0]?.[0];

    expect(detail?.providerType).toBe(AdminProviderFailureType.PUSH);
    expect(client.browserPushSubscription.findMany).not.toHaveBeenCalled();
    expect(JSON.stringify(pushDetailQuery?.select)).not.toContain(
      "endpointCiphertext"
    );
    expect(JSON.stringify(pushDetailQuery?.select)).not.toContain("userAgent");
  });

  // 기능 : 성공한 delivery attempt가 provider failure 상세로 노출되지 않는지 검증합니다.
  it("does not expose successful delivery attempts as provider failures", async () => {
    const client = createClientMock();
    client.notificationDeliveryAttempt.findUnique.mockResolvedValue({
      ...createNotificationDeliveryAttemptRow(),
      status: NotificationDeliveryStatus.SENT,
    });
    const repository = new PrismaAdminProviderFailureRepository(
      client as unknown as PrismaService
    );

    const detail = await repository.getProviderFailureDetail(
      `PUSH:${pushAttemptId}`
    );

    expect(detail).toBeNull();
  });
});

// 기능 : PrismaAdminProviderFailureRepository 테스트용 Prisma client mock을 생성합니다.
function createClientMock() {
  return {
    aiProviderCallLog: {
      findMany: jest.fn().mockResolvedValue([createAiProviderCallLogRow()]),
      findUnique: jest.fn().mockResolvedValue(createAiProviderCallLogRow()),
    },
    businessCardScanLog: {
      findMany: jest.fn().mockResolvedValue([createBusinessCardScanLogRow()]),
      findUnique: jest.fn().mockResolvedValue(createBusinessCardScanLogRow()),
    },
    notificationDeliveryAttempt: {
      findMany: jest
        .fn()
        .mockResolvedValue([createNotificationDeliveryAttemptRow()]),
      findUnique: jest
        .fn()
        .mockResolvedValue(createNotificationDeliveryAttemptRow()),
    },
    followUpDeliveryAttempt: {
      findMany: jest.fn().mockResolvedValue([createFollowUpDeliveryAttemptRow()]),
      findUnique: jest.fn().mockResolvedValue(createFollowUpDeliveryAttemptRow()),
    },
    externalCalendarConnection: {
      findMany: jest
        .fn()
        .mockResolvedValue([createCalendarConnectionRow()]),
      findUnique: jest.fn().mockResolvedValue(createCalendarConnectionRow()),
    },
    externalCalendarSource: {
      findMany: jest.fn().mockResolvedValue([createCalendarSourceRow()]),
      findUnique: jest.fn().mockResolvedValue(createCalendarSourceRow()),
    },
    browserPushSubscription: {
      findMany: jest.fn(),
    },
    adminAuditLog: {
      create: jest.fn().mockResolvedValue({ id: "audit-id" }),
    },
  };
}

// 기능 : 테스트용 AiProviderCallLog row를 생성합니다.
function createAiProviderCallLogRow() {
  return {
    id: aiLogId,
    userId: targetUserId,
    operation: AiProviderOperation.MEETING_NOTE_STT_DRAFT,
    status: AiProviderCallStatus.FAILED,
    reportId: null,
    jobId: null,
    targetType: "MEETING_NOTE_DRAFT",
    targetId: null,
    provider: "OPENAI",
    model: "gpt-test",
    requestId: "ai-request-id",
    latencyMs: 12000,
    safeErrorCode: "AI_PROVIDER_TIMEOUT",
    safeErrorMessage: "AI 응답 시간이 초과됐어요",
    retryable: true,
    startedAt: createdAt,
    completedAt: null,
    failedAt: new Date("2026-08-01T00:00:12.000Z"),
    createdAt,
    updatedAt: createdAt,
    user: { email: "local.user@example.com" },
  };
}

// 기능 : 테스트용 BusinessCardScanLog row를 생성합니다.
function createBusinessCardScanLogRow() {
  return {
    id: ocrLogId,
    userId: targetUserId,
    status: BusinessCardScanStatus.OCR_FAILED,
    companyName: "삼성전자",
    contactName: "김민수",
    companyId: null,
    contactId: null,
    pendingTimeMs: 3200,
    safeErrorCode: "OCR_IMAGE_BLURRY",
    safeErrorMessage: "이미지가 흐려서 읽기 어려워요",
    retryable: true,
    createdAt,
    updatedAt: createdAt,
    user: { email: "local.user@example.com" },
  };
}

// 기능 : 테스트용 NotificationDeliveryAttempt row를 생성합니다.
function createNotificationDeliveryAttemptRow() {
  return {
    id: pushAttemptId,
    notificationId: "00000000-0000-4000-8000-000000000041",
    userId: targetUserId,
    channel: NotificationDeliveryChannel.BROWSER_PUSH,
    status: NotificationDeliveryStatus.FAILED,
    attemptNumber: 1,
    provider: "WEB_PUSH",
    providerMessageId: "push-request-id",
    providerStatusCode: "410",
    safeErrorCode: "PUSH_SUBSCRIPTION_GONE",
    safeErrorMessage: "브라우저 푸시 구독이 만료됐어요",
    retryable: false,
    nextRetryAt: null,
    sentAt: null,
    failedAt: createdAt,
    createdAt,
    updatedAt: createdAt,
    user: { email: "local.user@example.com" },
  };
}

// 기능 : 테스트용 FollowUpDeliveryAttempt row를 생성합니다.
function createFollowUpDeliveryAttemptRow() {
  return {
    id: followUpAttemptId,
    messageId: "00000000-0000-4000-8000-000000000051",
    userId: targetUserId,
    channel: FollowUpDeliveryChannel.EMAIL,
    status: FollowUpDeliveryAttemptStatus.FAILED,
    attemptNumber: 1,
    provider: "GOOGLE",
    providerMessageId: "email-request-id",
    providerStatusCode: "429",
    safeErrorCode: "FollowUpProviderRateLimited",
    safeErrorMessage: "잠시 후 다시 발송해 주세요.",
    retryable: true,
    nextRetryAt: null,
    latencyMs: 900,
    sentAt: null,
    failedAt: createdAt,
    createdAt,
    updatedAt: createdAt,
    user: { email: "local.user@example.com" },
  };
}

// 기능 : 테스트용 ExternalCalendarConnection row를 생성합니다.
function createCalendarConnectionRow() {
  return {
    id: calendarConnectionId,
    userId: targetUserId,
    provider: ExternalCalendarProvider.GOOGLE,
    status: ExternalCalendarConnectionStatus.RECONNECT_REQUIRED,
    lastSyncedAt: null,
    lastSyncStartedAt: createdAt,
    lastSyncFailedAt: createdAt,
    lastSyncErrorCode: "GOOGLE_CALENDAR_RECONNECT_REQUIRED",
    createdAt,
    updatedAt: createdAt,
    user: { email: "local.user@example.com" },
  };
}

// 기능 : 테스트용 ExternalCalendarSource row를 생성합니다.
function createCalendarSourceRow() {
  return {
    id: "00000000-0000-4000-8000-000000000070",
    userId: targetUserId,
    connectionId: calendarConnectionId,
    provider: ExternalCalendarProvider.GOOGLE,
    calendarTimeZone: "Asia/Seoul",
    isPrimary: true,
    isSystemCalendar: false,
    status: ExternalCalendarSourceStatus.SELECTED,
    lastSyncedAt: null,
    lastSyncFailedAt: createdAt,
    lastSyncErrorCode: "GOOGLE_CALENDAR_SOURCE_SYNC_FAILED",
    createdAt,
    updatedAt: createdAt,
    user: { email: "local.user@example.com" },
  };
}
