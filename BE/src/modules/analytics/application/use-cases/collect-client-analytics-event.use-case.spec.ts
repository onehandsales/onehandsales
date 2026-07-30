import type { ProductAnalyticsRepository } from "@/modules/analytics/application/ports/product-analytics.repository";
import type { CollectClientAnalyticsEventCommand } from "@/modules/analytics/application/use-cases/collect-client-analytics-event.use-case";
import { CollectClientAnalyticsEventUseCase } from "@/modules/analytics/application/use-cases/collect-client-analytics-event.use-case";
import { AppLogger } from "@/shared/infrastructure/logger/app-logger.service";

const NOW = new Date("2026-07-29T15:30:00.000Z");
const USER_ID = "00000000-0000-4000-8000-000000000101";
const SESSION_ID = "00000000-0000-4000-8000-000000000201";
const DEVICE_ID = "00000000-0000-4000-8000-000000000301";

const CURRENT_USER = {
  id: USER_ID,
  sessionId: SESSION_ID,
  email: "user@example.com",
  displayName: "User",
  role: "USER" as const,
  status: "ACTIVE" as const,
  timeZone: "Asia/Seoul",
};

// 역할 : FakeAppLogger 테스트 중 실제 로그 출력을 막고 호출만 기록합니다.
class FakeAppLogger extends AppLogger {
  readonly warnMock = jest.fn();

  // 기능 : 테스트에서 warning 로그 내용을 검증할 수 있게 기록합니다.
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

// 기능 : client 분석 이벤트 수집 command 기본값을 생성합니다.
function createCommand(
  input?: Partial<CollectClientAnalyticsEventCommand>
): CollectClientAnalyticsEventCommand {
  return {
    currentUser: CURRENT_USER,
    eventName: "app_route_viewed",
    eventVersion: 1,
    payload: { routeKey: "deals" },
    requestFieldNames: ["eventName", "eventVersion", "payload"],
    requestId: "request-1",
    ...input,
  };
}

// 기능 : use case와 repository/logger 테스트 대역을 함께 생성합니다.
function createUseCase() {
  const repository = createRepositoryFake();
  const logger = new FakeAppLogger();
  const useCase = new CollectClientAnalyticsEventUseCase(repository, logger);

  return { logger, repository, useCase };
}

describe("CollectClientAnalyticsEventUseCase", () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(NOW);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("stores app_route_viewed with backend-enriched user session device and eventDate", async () => {
    const { repository, useCase } = createUseCase();

    const response = await useCase.execute(createCommand());

    expect(response).toEqual({ accepted: true });
    expect(repository.findAuthDeviceIdBySessionId).toHaveBeenCalledWith(
      SESSION_ID
    );
    expect(repository.createEvent).toHaveBeenCalledWith({
      authDeviceId: DEVICE_ID,
      authSessionId: SESSION_ID,
      eventDate: "2026-07-30",
      eventName: "app_route_viewed",
      eventVersion: 1,
      idempotencyKey: null,
      occurredAt: NOW,
      payloadJson: { routeKey: "deals" },
      source: "CLIENT",
      targetId: null,
      targetType: null,
      timeZone: "Asia/Seoul",
      userId: USER_ID,
    });
  });

  it("continues with null authDeviceId when session lookup has no row", async () => {
    const { repository, useCase } = createUseCase();
    repository.findAuthDeviceIdBySessionId.mockResolvedValue(null);

    await useCase.execute(createCommand());

    expect(repository.createEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        authDeviceId: null,
      })
    );
  });

  it("rejects request fields that the client must not send", async () => {
    const { repository, useCase } = createUseCase();

    await expect(
      useCase.execute(
        createCommand({
          requestFieldNames: ["eventName", "eventVersion", "payload", "userId"],
        })
      )
    ).rejects.toMatchObject({ code: "ANALYTICS_PAYLOAD_INVALID" });
    expect(repository.createEvent).not.toHaveBeenCalled();
  });

  it("rejects unsupported client event names", async () => {
    const { repository, useCase } = createUseCase();

    await expect(
      useCase.execute(createCommand({ eventName: "paywall_viewed" }))
    ).rejects.toMatchObject({ code: "ANALYTICS_EVENT_UNSUPPORTED" });
    expect(repository.createEvent).not.toHaveBeenCalled();
  });

  it("rejects unsupported event versions", async () => {
    const { repository, useCase } = createUseCase();

    await expect(
      useCase.execute(createCommand({ eventVersion: 2 }))
    ).rejects.toMatchObject({ code: "ANALYTICS_EVENT_VERSION_UNSUPPORTED" });
    expect(repository.createEvent).not.toHaveBeenCalled();
  });

  it("rejects routeKey outside the User Web route allowlist", async () => {
    const { repository, useCase } = createUseCase();

    await expect(
      useCase.execute(createCommand({ payload: { routeKey: "/app/deals" } }))
    ).rejects.toMatchObject({ code: "ANALYTICS_ROUTE_KEY_UNSUPPORTED" });
    expect(repository.createEvent).not.toHaveBeenCalled();
  });

  it("rejects PII or raw text payload keys before saving", async () => {
    const { repository, useCase } = createUseCase();

    await expect(
      useCase.execute(
        createCommand({
          payload: { routeKey: "deals", email: "user@example.com" },
        })
      )
    ).rejects.toMatchObject({ code: "ANALYTICS_PAYLOAD_PII_REJECTED" });
    expect(repository.createEvent).not.toHaveBeenCalled();
  });

  it("logs repository failure without payload contents", async () => {
    const { logger, repository, useCase } = createUseCase();
    repository.createEvent.mockRejectedValue(new Error("database unavailable"));

    await expect(useCase.execute(createCommand())).rejects.toThrow(
      "database unavailable"
    );

    expect(logger.warnMock).toHaveBeenCalledWith(
      expect.stringContaining("analytics.event.collectFailed"),
      "CollectClientAnalyticsEventUseCase"
    );
    expect(logger.warnMock.mock.calls[0]?.[0]).not.toContain("routeKey");
  });
});
