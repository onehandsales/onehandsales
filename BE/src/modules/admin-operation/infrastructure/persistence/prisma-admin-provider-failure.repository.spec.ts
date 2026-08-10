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

// 역할 : SourceFindManyQuery 테스트 mock이 처리하는 Prisma paging 인자를 정의합니다.
type SourceFindManyQuery = {
  readonly select?: unknown;
  readonly where?: unknown;
  readonly orderBy?: unknown;
  readonly skip?: number;
  readonly take?: number;
};

// 역할 : AiProviderCallLogRowFixture Admin provider failure 테스트용 AI row 구조를 정의합니다.
type AiProviderCallLogRowFixture = {
  readonly id: string;
  readonly userId: string;
  readonly operation: AiProviderOperation;
  readonly status: AiProviderCallStatus;
  readonly reportId: string | null;
  readonly jobId: string | null;
  readonly targetType: string | null;
  readonly targetId: string | null;
  readonly provider: string;
  readonly model: string;
  readonly requestId: string | null;
  readonly latencyMs: number | null;
  readonly safeErrorCode: string | null;
  readonly safeErrorMessage: string | null;
  readonly retryable: boolean;
  readonly startedAt: Date;
  readonly completedAt: Date | null;
  readonly failedAt: Date | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly user: { readonly email: string };
};

// 역할 : CreateClientMockOptions provider failure repository mock source 구성을 정의합니다.
type CreateClientMockOptions = {
  readonly aiRows?: readonly AiProviderCallLogRowFixture[];
  readonly emptyOtherSources?: boolean;
};

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

  // 기능 : 한 source에 실패 로그가 몰려도 cursor pagination이 끝까지 이어지는지 검증합니다.
  it("keeps cursor pagination open when one source has more rows than the old fetch window", async () => {
    const client = createClientMock({
      aiRows: createManyAiProviderCallLogRows(305),
      emptyOtherSources: true,
    });
    const repository = new PrismaAdminProviderFailureRepository(
      client as unknown as PrismaService
    );
    const pageSizes: number[] = [];
    const seenIds: string[] = [];
    let cursor: string | undefined;

    for (let pageIndex = 0; pageIndex < 10; pageIndex += 1) {
      const response = await repository.listProviderFailures({
        status: "ALL",
        limit: 50,
        ...(cursor ? { cursor } : {}),
      });

      pageSizes.push(response.items.length);
      seenIds.push(...response.items.map((item) => item.id));
      cursor = response.nextCursor ?? undefined;

      if (!cursor) {
        break;
      }
    }

    expect(pageSizes).toEqual([50, 50, 50, 50, 50, 50, 5]);
    expect(new Set(seenIds).size).toBe(305);
    expect(client.aiProviderCallLog.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 300,
        take: 300,
      })
    );
  });
});

// 기능 : PrismaAdminProviderFailureRepository 테스트용 Prisma client mock을 생성합니다.
function createClientMock(options: CreateClientMockOptions = {}) {
  const aiRows = options.aiRows ?? [createAiProviderCallLogRow()];
  const businessCardRows = options.emptyOtherSources
    ? []
    : [createBusinessCardScanLogRow()];
  const notificationRows = options.emptyOtherSources
    ? []
    : [createNotificationDeliveryAttemptRow()];
  const followUpRows = options.emptyOtherSources
    ? []
    : [createFollowUpDeliveryAttemptRow()];
  const calendarConnectionRows = options.emptyOtherSources
    ? []
    : [createCalendarConnectionRow()];
  const calendarSourceRows = options.emptyOtherSources
    ? []
    : [createCalendarSourceRow()];

  return {
    aiProviderCallLog: {
      findMany: createPaginatedFindManyMock(aiRows),
      findUnique: jest.fn().mockResolvedValue(
        aiRows[0] ?? createAiProviderCallLogRow()
      ),
    },
    businessCardScanLog: {
      findMany: createPaginatedFindManyMock(businessCardRows),
      findUnique: jest.fn().mockResolvedValue(createBusinessCardScanLogRow()),
    },
    notificationDeliveryAttempt: {
      findMany: createPaginatedFindManyMock(notificationRows),
      findUnique: jest
        .fn()
        .mockResolvedValue(createNotificationDeliveryAttemptRow()),
    },
    followUpDeliveryAttempt: {
      findMany: createPaginatedFindManyMock(followUpRows),
      findUnique: jest.fn().mockResolvedValue(createFollowUpDeliveryAttemptRow()),
    },
    externalCalendarConnection: {
      findMany: createPaginatedFindManyMock(calendarConnectionRows),
      findUnique: jest.fn().mockResolvedValue(createCalendarConnectionRow()),
    },
    externalCalendarSource: {
      findMany: createPaginatedFindManyMock(calendarSourceRows),
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

// 기능 : Prisma findMany mock이 skip/take paging을 실제 배열 slice로 반영하게 만듭니다.
function createPaginatedFindManyMock<TRow>(rows: readonly TRow[]) {
  return jest.fn((query: SourceFindManyQuery = {}) => {
    const skip = query.skip ?? 0;
    const take = query.take ?? rows.length;

    return Promise.resolve(rows.slice(skip, skip + take));
  });
}

// 기능 : 테스트용 AiProviderCallLog row를 생성합니다.
function createAiProviderCallLogRow(
  overrides: Partial<AiProviderCallLogRowFixture> = {}
): AiProviderCallLogRowFixture {
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
    ...overrides,
  };
}

// 기능 : 한 source 편중 pagination 검증용 AI provider 실패 row 목록을 생성합니다.
function createManyAiProviderCallLogRows(
  count: number
): AiProviderCallLogRowFixture[] {
  const startTime = new Date("2026-08-01T00:10:00.000Z").getTime();

  return Array.from({ length: count }, (_, index) => {
    const occurredAt = new Date(startTime - index * 1000);

    return createAiProviderCallLogRow({
      id: createUuidFromNumber(1_000 + index),
      startedAt: occurredAt,
      failedAt: occurredAt,
      createdAt: occurredAt,
      updatedAt: occurredAt,
    });
  });
}

// 기능 : 테스트 row마다 충돌 없는 UUID 문자열을 생성합니다.
function createUuidFromNumber(value: number): string {
  return `00000000-0000-4000-8000-${String(value).padStart(12, "0")}`;
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
