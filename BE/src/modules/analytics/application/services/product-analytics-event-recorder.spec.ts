import type {
  CreateProductAnalyticsEventInput,
  ProductAnalyticsRepository,
} from "@/modules/analytics/application/ports/product-analytics.repository";
import {
  ProductAnalyticsEventRecorder,
  type RecordProductAnalyticsServerEventCommand,
  toProductAnalyticsExportRowCountBucket,
  toProductAnalyticsImportRowCountBucket,
  toProductAnalyticsLinkCountBucket,
} from "@/modules/analytics/application/services/product-analytics-event-recorder";
import { AppLogger } from "@/shared/infrastructure/logger/app-logger.service";

const NOW = new Date("2026-07-29T15:30:00.000Z");
const USER_ID = "00000000-0000-4000-8000-000000000101";
const SESSION_ID = "00000000-0000-4000-8000-000000000201";
const DEVICE_ID = "00000000-0000-4000-8000-000000000301";
const TARGET_ID = "00000000-0000-4000-8000-000000000401";

interface ServerEventCase {
  readonly eventName: RecordProductAnalyticsServerEventCommand["eventName"];
  readonly targetType: RecordProductAnalyticsServerEventCommand["targetType"];
  readonly targetId: string | null;
  readonly payload: Record<string, unknown>;
}

const DEAL_CREATED_PAYLOAD = {
  dealStatus: "INITIAL_CONTACT",
  currencyCode: "KRW",
  hasCompany: true,
  hasContact: false,
  hasProduct: true,
};

const SERVER_EVENT_CASES: readonly ServerEventCase[] = [
  {
    eventName: "auth_signup_completed",
    targetType: "USER",
    targetId: USER_ID,
    payload: {
      provider: "google",
      locale: "ko-KR",
      countryCode: "KR",
      timeZone: "Asia/Seoul",
    },
  },
  {
    eventName: "deal_created",
    targetType: "DEAL",
    targetId: TARGET_ID,
    payload: DEAL_CREATED_PAYLOAD,
  },
  {
    eventName: "deal_next_action_created",
    targetType: "DEAL",
    targetId: TARGET_ID,
    payload: { source: "deal_create" },
  },
  {
    eventName: "schedule_created",
    targetType: "SCHEDULE",
    targetId: TARGET_ID,
    payload: { sourceType: "INTERNAL", isAllDay: false, hasDealLink: true },
  },
  {
    eventName: "schedule_deal_linked",
    targetType: "SCHEDULE",
    targetId: TARGET_ID,
    payload: { linkCountBucket: "2_3" },
  },
  {
    eventName: "meeting_note_created",
    targetType: "MEETING_NOTE",
    targetId: TARGET_ID,
    payload: { sourceType: "TEXT_AI", hasDealLink: true, hasAiDraft: true },
  },
  {
    eventName: "meeting_note_deal_linked",
    targetType: "MEETING_NOTE",
    targetId: TARGET_ID,
    payload: { linkCountBucket: "1" },
  },
  {
    eventName: "business_card_scan_confirmed",
    targetType: "BUSINESS_CARD_SCAN",
    targetId: TARGET_ID,
    payload: {
      companyResolution: "CREATED",
      contactResolution: "EXISTING",
      createdCompany: true,
      createdContact: false,
    },
  },
  {
    eventName: "import_confirmed",
    targetType: "IMPORT_JOB",
    targetId: TARGET_ID,
    payload: {
      importType: "DEAL",
      rowCountBucket: "11_50",
      importedRowCount: 12,
    },
  },
  {
    eventName: "export_downloaded",
    targetType: "EXPORT",
    targetId: null,
    payload: {
      exportType: "COMPANY",
      rowCountBucket: "2_10",
      locale: "ko-KR",
    },
  },
];

// 역할 : FakeAppLogger 테스트 중 warning 로그 호출만 검증합니다.
class FakeAppLogger extends AppLogger {
  readonly warnMock = jest.fn();

  // 기능 : warning 메시지를 실제 출력하지 않고 mock에 저장합니다.
  override warn(message: string, context?: string): void {
    this.warnMock(message, context);
  }
}

// 기능 : ProductAnalyticsRepository 테스트 대역을 생성합니다.
function createRepositoryFake(): jest.Mocked<ProductAnalyticsRepository> {
  return {
    countActivatedUsersByDate: jest.fn(),
    countRetainedUsersByDate: jest.fn(),
    createEvent: jest.fn().mockResolvedValue({ id: "event-1" }),
    deleteRawEventsBefore: jest.fn(),
    findAuthDeviceIdBySessionId: jest.fn().mockResolvedValue(DEVICE_ID),
    findFirstActivationCandidates: jest.fn(),
    listAiUsageProviderCallLogsForSummary: jest.fn().mockResolvedValue([]),
    listActivatedCohortDates: jest.fn(),
    runInTransaction: jest.fn(async (work) =>
      work(createRepositoryFake())
    ) as jest.Mocked<ProductAnalyticsRepository>["runInTransaction"],
    upsertRetentionCohortSnapshot: jest.fn(),
    upsertUserActivationSnapshot: jest.fn(),
  };
}

// 기능 : server event recorder와 의존성 fake를 함께 생성합니다.
function createRecorder() {
  const repository = createRepositoryFake();
  const logger = new FakeAppLogger();
  const recorder = new ProductAnalyticsEventRecorder(repository, logger);

  return { logger, recorder, repository };
}

// 기능 : server event command의 기본값을 생성합니다.
function createCommand(
  overrides: Partial<RecordProductAnalyticsServerEventCommand> = {}
): RecordProductAnalyticsServerEventCommand {
  return {
    userId: USER_ID,
    authSessionId: SESSION_ID,
    requestId: "request-analytics-server-1",
    eventName: "deal_created",
    timeZone: "Asia/Seoul",
    idempotencyKey: "deal_created:deal-1",
    targetType: "DEAL",
    targetId: TARGET_ID,
    payload: DEAL_CREATED_PAYLOAD,
    ...overrides,
  };
}

// 기능 : warning 로그 JSON을 구조화해 payload 비노출을 검증합니다.
function parseWarnLog(logger: FakeAppLogger): Record<string, unknown> {
  const [message] = logger.warnMock.mock.calls[0] ?? [];

  return JSON.parse(message as string) as Record<string, unknown>;
}

describe("ProductAnalyticsEventRecorder", () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(NOW);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("stores a server event with session device, eventDate and SERVER source", async () => {
    const { logger, recorder, repository } = createRecorder();

    await recorder.recordServerEvent(createCommand());

    expect(repository.findAuthDeviceIdBySessionId).toHaveBeenCalledWith(
      SESSION_ID
    );
    expect(repository.createEvent).toHaveBeenCalledWith({
      authDeviceId: DEVICE_ID,
      authSessionId: SESSION_ID,
      eventDate: "2026-07-30",
      eventName: "deal_created",
      eventVersion: 1,
      idempotencyKey: "deal_created:deal-1",
      occurredAt: NOW,
      payloadJson: DEAL_CREATED_PAYLOAD,
      source: "SERVER",
      targetId: TARGET_ID,
      targetType: "DEAL",
      timeZone: "Asia/Seoul",
      userId: USER_ID,
    } satisfies CreateProductAnalyticsEventInput);
    expect(logger.warnMock).not.toHaveBeenCalled();
  });

  it.each(SERVER_EVENT_CASES)(
    "accepts the $eventName server event payload contract",
    async (eventCase) => {
      const { logger, recorder, repository } = createRecorder();

      await recorder.recordServerEvent(
        createCommand({
          eventName: eventCase.eventName,
          idempotencyKey: `${eventCase.eventName}:idempotent`,
          targetType: eventCase.targetType,
          targetId: eventCase.targetId,
          payload: eventCase.payload,
        })
      );

      expect(repository.createEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventName: eventCase.eventName,
          payloadJson: eventCase.payload,
          source: "SERVER",
          targetId: eventCase.targetId,
          targetType: eventCase.targetType,
        })
      );
      expect(logger.warnMock).not.toHaveBeenCalled();
    }
  );

  it("logs a warning without saving when idempotencyKey is blank", async () => {
    const { logger, recorder, repository } = createRecorder();

    await recorder.recordServerEvent(createCommand({ idempotencyKey: "   " }));

    expect(repository.createEvent).not.toHaveBeenCalled();
    expect(logger.warnMock).toHaveBeenCalledWith(
      expect.stringContaining("analytics.event.recordFailed"),
      "ProductAnalyticsEventRecorder"
    );
    expect(parseWarnLog(logger)).toMatchObject({
      event: "analytics.event.recordFailed",
      eventName: "deal_created",
      errorName: "ProductAnalyticsPayloadInvalidError",
      requestId: "request-analytics-server-1",
      targetId: TARGET_ID,
      targetType: "DEAL",
      userId: USER_ID,
    });
  });

  it("rejects PII-like payload keys and does not put raw payload in warning logs", async () => {
    const { logger, recorder, repository } = createRecorder();

    await recorder.recordServerEvent(
      createCommand({
        payload: {
          ...DEAL_CREATED_PAYLOAD,
          email: "customer@example.com",
        },
      })
    );

    expect(repository.createEvent).not.toHaveBeenCalled();
    const log = parseWarnLog(logger);
    expect(log).toMatchObject({
      event: "analytics.event.recordFailed",
      errorName: "ProductAnalyticsPayloadPiiRejectedError",
    });
    expect(log).not.toHaveProperty("payload");
    expect(JSON.stringify(log)).not.toContain("customer@example.com");
  });

  it("maps link, import and export row counts into analytics buckets", () => {
    expect(toProductAnalyticsLinkCountBucket(1)).toBe("1");
    expect(toProductAnalyticsLinkCountBucket(3)).toBe("2_3");
    expect(toProductAnalyticsLinkCountBucket(4)).toBe("4_plus");
    expect(toProductAnalyticsImportRowCountBucket(1)).toBe("1");
    expect(toProductAnalyticsImportRowCountBucket(10)).toBe("2_10");
    expect(toProductAnalyticsImportRowCountBucket(50)).toBe("11_50");
    expect(toProductAnalyticsImportRowCountBucket(200)).toBe("51_200");
    expect(toProductAnalyticsImportRowCountBucket(201)).toBe("201_plus");
    expect(toProductAnalyticsExportRowCountBucket(0)).toBe("0");
    expect(toProductAnalyticsExportRowCountBucket(2)).toBe("2_10");
  });
});
