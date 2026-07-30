import type {
  AiUsageProviderCallLogSummarySource,
  ProductAnalyticsRepository,
} from "@/modules/analytics/application/ports/product-analytics.repository";
import {
  SummarizeAiUsageUseCase,
  type SummarizeAiUsageCommand,
} from "@/modules/analytics/application/use-cases/summarize-ai-usage.use-case";
import { AppLogger } from "@/shared/infrastructure/logger/app-logger.service";

const USER_ID = "00000000-0000-4000-8000-000000000101";
const SECOND_USER_ID = "00000000-0000-4000-8000-000000000102";

// 역할 : FakeAppLogger 테스트 중 실제 로그 출력을 막고 호출만 기록합니다.
class FakeAppLogger extends AppLogger {
  readonly warnMock = jest.fn();

  // 기능 : warning 로그 메시지를 테스트 검증용 mock에 저장합니다.
  override warn(message: string, context?: string): void {
    this.warnMock(message, context);
  }
}

// 기능 : AI usage summary source row 테스트 기본값을 생성합니다.
function createSourceRow(
  overrides: Partial<AiUsageProviderCallLogSummarySource> = {}
): AiUsageProviderCallLogSummarySource {
  return {
    costCurrency: "USD",
    estimatedCostAmount: "0.010000",
    operation: "MEETING_NOTE_TEXT_DRAFT",
    startedAt: new Date("2026-07-29T15:30:00.000Z"),
    status: "SUCCEEDED",
    totalTokenCount: 100,
    userId: USER_ID,
    userTimeZone: "Asia/Seoul",
    ...overrides,
  };
}

// 기능 : ProductAnalyticsRepository 테스트 대역을 생성합니다.
function createRepositoryFake(): jest.Mocked<ProductAnalyticsRepository> {
  const repository = {} as jest.Mocked<ProductAnalyticsRepository>;

  repository.runInTransaction = jest.fn(async (work) =>
    work(repository)
  ) as jest.Mocked<ProductAnalyticsRepository>["runInTransaction"];
  repository.createEvent = jest.fn().mockResolvedValue({ id: "event-1" });
  repository.findAuthDeviceIdBySessionId = jest.fn().mockResolvedValue(null);
  repository.findFirstActivationCandidates = jest.fn().mockResolvedValue([]);
  repository.upsertUserActivationSnapshot = jest.fn().mockResolvedValue(undefined);
  repository.listActivatedCohortDates = jest.fn().mockResolvedValue([]);
  repository.countActivatedUsersByDate = jest.fn().mockResolvedValue(0);
  repository.countRetainedUsersByDate = jest.fn().mockResolvedValue(0);
  repository.upsertRetentionCohortSnapshot = jest
    .fn()
    .mockResolvedValue(undefined);
  repository.deleteRawEventsBefore = jest.fn().mockResolvedValue(0);
  repository.listAiUsageProviderCallLogsForSummary = jest
    .fn()
    .mockResolvedValue([]);

  return repository;
}

// 기능 : use case와 repository/logger 테스트 대역을 함께 생성합니다.
function createUseCase() {
  const repository = createRepositoryFake();
  const logger = new FakeAppLogger();
  const useCase = new SummarizeAiUsageUseCase(repository, logger);

  return { logger, repository, useCase };
}

// 기능 : AI usage summary command 테스트 기본값을 생성합니다.
function createCommand(
  overrides: Partial<SummarizeAiUsageCommand> = {}
): SummarizeAiUsageCommand {
  return {
    from: new Date("2026-07-01T00:00:00.000Z"),
    groupBy: "USER",
    to: new Date("2026-07-31T23:59:59.999Z"),
    ...overrides,
  };
}

describe("SummarizeAiUsageUseCase", () => {
  it("groups provider call status token and cost by user", async () => {
    const { repository, useCase } = createUseCase();
    repository.listAiUsageProviderCallLogsForSummary.mockResolvedValue([
      createSourceRow(),
      createSourceRow({
        estimatedCostAmount: null,
        status: "FAILED",
        totalTokenCount: null,
      }),
      createSourceRow({
        estimatedCostAmount: "0.002500",
        status: "PENDING",
        totalTokenCount: 25,
      }),
      createSourceRow({
        estimatedCostAmount: "0.001000",
        status: "CANCELED",
        totalTokenCount: 10,
        userId: SECOND_USER_ID,
      }),
    ]);

    const response = await useCase.execute(createCommand());

    expect(repository.listAiUsageProviderCallLogsForSummary).toHaveBeenCalledWith(
      {
        from: new Date("2026-07-01T00:00:00.000Z"),
        to: new Date("2026-07-31T23:59:59.999Z"),
      }
    );
    expect(response.items).toEqual([
      {
        canceledCount: 0,
        costCurrency: "USD",
        dateKey: null,
        estimatedCostAmount: "0.012500",
        failedCount: 1,
        operation: null,
        pendingCount: 1,
        requestCount: 3,
        succeededCount: 1,
        totalTokenCount: 125,
        userId: USER_ID,
        userTimeZone: null,
      },
      {
        canceledCount: 1,
        costCurrency: "USD",
        dateKey: null,
        estimatedCostAmount: "0.001000",
        failedCount: 0,
        operation: null,
        pendingCount: 0,
        requestCount: 1,
        succeededCount: 0,
        totalTokenCount: 10,
        userId: SECOND_USER_ID,
        userTimeZone: null,
      },
    ]);
  });

  it("groups day usage by current user timezone", async () => {
    const { repository, useCase } = createUseCase();
    repository.listAiUsageProviderCallLogsForSummary.mockResolvedValue([
      createSourceRow({
        startedAt: new Date("2026-07-29T15:30:00.000Z"),
        userTimeZone: "Asia/Seoul",
      }),
      createSourceRow({
        startedAt: new Date("2026-07-30T06:30:00.000Z"),
        userTimeZone: "America/Los_Angeles",
      }),
    ]);

    const response = await useCase.execute(
      createCommand({ groupBy: "DAY", userId: USER_ID })
    );

    expect(repository.listAiUsageProviderCallLogsForSummary).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: USER_ID,
      })
    );
    expect(response.items).toEqual([
      expect.objectContaining({
        dateKey: "2026-07-29",
        requestCount: 1,
        userTimeZone: "America/Los_Angeles",
      }),
      expect.objectContaining({
        dateKey: "2026-07-30",
        requestCount: 1,
        userTimeZone: "Asia/Seoul",
      }),
    ]);
  });

  it("groups usage by user and operation", async () => {
    const { repository, useCase } = createUseCase();
    repository.listAiUsageProviderCallLogsForSummary.mockResolvedValue([
      createSourceRow({ operation: "MEETING_NOTE_TEXT_DRAFT" }),
      createSourceRow({ operation: "MEETING_NOTE_STT_TRANSCRIPTION" }),
      createSourceRow({ operation: "MEETING_NOTE_TEXT_DRAFT" }),
    ]);

    const response = await useCase.execute(createCommand({ groupBy: "OPERATION" }));

    expect(response.items).toEqual([
      expect.objectContaining({
        dateKey: null,
        operation: "MEETING_NOTE_STT_TRANSCRIPTION",
        requestCount: 1,
        userTimeZone: null,
      }),
      expect.objectContaining({
        dateKey: null,
        operation: "MEETING_NOTE_TEXT_DRAFT",
        requestCount: 2,
        userTimeZone: null,
      }),
    ]);
  });

  it("logs summary failure without user id or raw provider contents", async () => {
    const { logger, repository, useCase } = createUseCase();
    repository.listAiUsageProviderCallLogsForSummary.mockRejectedValue(
      new Error("raw provider prompt secret")
    );

    await expect(
      useCase.execute(createCommand({ userId: USER_ID }))
    ).rejects.toThrow("raw provider prompt secret");

    expect(logger.warnMock).toHaveBeenCalledWith(
      expect.stringContaining("analytics.aiUsage.summaryFailed"),
      "SummarizeAiUsageUseCase"
    );
    const log = logger.warnMock.mock.calls[0]?.[0] ?? "";
    expect(log).not.toContain(USER_ID);
    expect(log).not.toContain("raw provider prompt secret");
    expect(log).toContain("\"hasUserFilter\":true");
  });

  it("rejects invalid date ranges before querying", async () => {
    const { repository, useCase } = createUseCase();

    await expect(
      useCase.execute(
        createCommand({
          from: new Date("2026-08-01T00:00:00.000Z"),
          to: new Date("2026-07-01T00:00:00.000Z"),
        })
      )
    ).rejects.toThrow("from must be earlier than or equal to to");
    expect(repository.listAiUsageProviderCallLogsForSummary).not.toHaveBeenCalled();
  });
});
