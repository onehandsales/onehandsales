import type { ProductAnalyticsRepository } from "@/modules/analytics/application/ports/product-analytics.repository";
import { PurgeProductAnalyticsRawEventsUseCase } from "@/modules/analytics/application/use-cases/purge-product-analytics-raw-events.use-case";
import { AppLogger } from "@/shared/infrastructure/logger/app-logger.service";

const NOW = new Date("2026-07-29T00:00:00.000Z");

// 역할 : FakeAppLogger 테스트 중 실제 로그 출력을 막고 호출만 기록합니다.
class FakeAppLogger extends AppLogger {
  readonly logMock = jest.fn();

  // 기능 : info 로그 메시지를 테스트 검증용 mock에 저장합니다.
  override log(message: string, context?: string): void {
    this.logMock(message, context);
  }
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

  return repository;
}

// 기능 : purge use case와 테스트 대역을 함께 생성합니다.
function createUseCase() {
  const repository = createRepositoryFake();
  const logger = new FakeAppLogger();
  const useCase = new PurgeProductAnalyticsRawEventsUseCase(
    repository,
    logger
  );

  return { logger, repository, useCase };
}

describe("PurgeProductAnalyticsRawEventsUseCase", () => {
  it("purges raw events older than 365 days until the final partial batch", async () => {
    const { logger, repository, useCase } = createUseCase();
    repository.deleteRawEventsBefore
      .mockResolvedValueOnce(500)
      .mockResolvedValueOnce(12);

    const result = await useCase.execute({
      batchSize: 500,
      now: NOW,
      retentionDays: 365,
    });

    expect(repository.deleteRawEventsBefore).toHaveBeenCalledTimes(2);
    expect(repository.deleteRawEventsBefore).toHaveBeenCalledWith(
      new Date("2025-07-29T00:00:00.000Z"),
      500
    );
    expect(result).toEqual({
      purgeCutoffOccurredAt: "2025-07-29T00:00:00.000Z",
      rawEventsPurged: 512,
    });
    expect(logger.logMock).toHaveBeenCalledWith(
      expect.stringContaining("analytics.retention.purgeCompleted"),
      "PurgeProductAnalyticsRawEventsUseCase"
    );
    expect(logger.logMock.mock.calls[0]?.[0]).not.toContain("payload");
  });

  it("rejects retention windows other than 365 days", async () => {
    const { repository, useCase } = createUseCase();

    await expect(
      useCase.execute({
        batchSize: 500,
        now: NOW,
        retentionDays: 30 as 365,
      })
    ).rejects.toThrow("retentionDays must be 365");
    expect(repository.deleteRawEventsBefore).not.toHaveBeenCalled();
  });
});
