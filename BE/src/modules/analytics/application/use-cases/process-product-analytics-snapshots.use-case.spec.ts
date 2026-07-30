import type {
  ActivationCandidate,
  ProductAnalyticsRepository,
} from "@/modules/analytics/application/ports/product-analytics.repository";
import { ProcessProductAnalyticsSnapshotsUseCase } from "@/modules/analytics/application/use-cases/process-product-analytics-snapshots.use-case";
import { PRODUCT_ANALYTICS_ACTIVE_RETENTION_EVENT_NAMES } from "@/modules/analytics/domain/product-analytics-event-taxonomy";

const NOW = new Date("2026-07-29T15:30:00.000Z");
const USER_ID = "00000000-0000-4000-8000-000000000101";

// 기능 : activation 후보 테스트 기본값을 생성합니다.
function createActivationCandidate(
  overrides: Partial<ActivationCandidate> = {}
): ActivationCandidate {
  return {
    firstDealCreatedAt: new Date("2026-07-01T01:00:00.000Z"),
    firstDealCreatedEventDate: "2026-07-01",
    firstDealCreatedTimeZone: "Asia/Seoul",
    firstMeaningfulActionAt: new Date("2026-07-02T01:00:00.000Z"),
    firstMeaningfulActionEventDate: "2026-07-02",
    firstMeaningfulActionTimeZone: "Asia/Seoul",
    userId: USER_ID,
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
  repository.listAiUsageProviderCallLogsForSummary = jest
    .fn()
    .mockResolvedValue([]);
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

// 기능 : use case와 repository 테스트 대역을 함께 생성합니다.
function createUseCase() {
  const repository = createRepositoryFake();
  const useCase = new ProcessProductAnalyticsSnapshotsUseCase(repository);

  return { repository, useCase };
}

describe("ProcessProductAnalyticsSnapshotsUseCase", () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(NOW);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("stores activation at the later timestamp between first deal and first meaningful action", async () => {
    const { repository, useCase } = createUseCase();
    const candidate = createActivationCandidate();
    repository.findFirstActivationCandidates.mockResolvedValue([candidate]);

    const result = await useCase.execute({
      fromDate: "2026-07-01",
      limit: 10,
      toDate: "2026-07-31",
    });

    expect(repository.upsertUserActivationSnapshot).toHaveBeenCalledWith({
      activatedAt: candidate.firstMeaningfulActionAt,
      activatedEventDate: "2026-07-02",
      calculatedAt: NOW,
      firstDealCreatedAt: candidate.firstDealCreatedAt,
      firstMeaningfulActionAt: candidate.firstMeaningfulActionAt,
      status: "ACTIVATED",
      timeZone: "Asia/Seoul",
      userId: USER_ID,
    });
    expect(result).toMatchObject({
      activationSnapshotsUpdated: 1,
      fromDate: "2026-07-01",
      retentionSnapshotsUpdated: 0,
      toDate: "2026-07-31",
    });
  });

  it("uses the deal row as activation when meaningful action happened first", async () => {
    const { repository, useCase } = createUseCase();
    const candidate = createActivationCandidate({
      firstDealCreatedAt: new Date("2026-07-03T01:00:00.000Z"),
      firstDealCreatedEventDate: "2026-07-03",
      firstDealCreatedTimeZone: "America/Los_Angeles",
      firstMeaningfulActionAt: new Date("2026-07-01T01:00:00.000Z"),
      firstMeaningfulActionEventDate: "2026-07-01",
      firstMeaningfulActionTimeZone: "Asia/Seoul",
    });
    repository.findFirstActivationCandidates.mockResolvedValue([candidate]);

    await useCase.execute({
      fromDate: "2026-07-01",
      toDate: "2026-07-31",
    });

    expect(repository.upsertUserActivationSnapshot).toHaveBeenCalledWith(
      expect.objectContaining({
        activatedAt: candidate.firstDealCreatedAt,
        activatedEventDate: "2026-07-03",
        status: "ACTIVATED",
        timeZone: "America/Los_Angeles",
      })
    );
  });

  it("stores NOT_ACTIVATED when the user has no meaningful action", async () => {
    const { repository, useCase } = createUseCase();
    const candidate = createActivationCandidate({
      firstMeaningfulActionAt: null,
      firstMeaningfulActionEventDate: null,
      firstMeaningfulActionTimeZone: null,
    });
    repository.findFirstActivationCandidates.mockResolvedValue([candidate]);

    await useCase.execute({
      fromDate: "2026-07-01",
      toDate: "2026-07-31",
    });

    expect(repository.upsertUserActivationSnapshot).toHaveBeenCalledWith(
      expect.objectContaining({
        activatedAt: null,
        activatedEventDate: null,
        status: "NOT_ACTIVATED",
        timeZone: null,
      })
    );
  });

  it("upserts D1 D7 D30 retention snapshots from activation cohort date", async () => {
    const { repository, useCase } = createUseCase();
    repository.listActivatedCohortDates.mockResolvedValue(["2026-07-01"]);
    repository.countActivatedUsersByDate.mockResolvedValue(3);
    repository.countRetainedUsersByDate.mockImplementation(
      async (_cohortDate, targetDate) =>
        ({ "2026-07-02": 1, "2026-07-08": 2, "2026-07-31": 0 })[
          targetDate
        ] ?? 0
    );

    const result = await useCase.execute({
      fromDate: "2026-07-01",
      toDate: "2026-07-31",
    });

    expect(repository.countRetainedUsersByDate).toHaveBeenCalledWith(
      "2026-07-01",
      "2026-07-02",
      PRODUCT_ANALYTICS_ACTIVE_RETENTION_EVENT_NAMES
    );
    expect(repository.upsertRetentionCohortSnapshot).toHaveBeenCalledTimes(3);
    expect(repository.upsertRetentionCohortSnapshot).toHaveBeenNthCalledWith(2, {
      calculatedAt: NOW,
      cohortDate: "2026-07-01",
      cohortUserCount: 3,
      dayOffset: 7,
      retainedUserCount: 2,
    });
    expect(result.retentionSnapshotsUpdated).toBe(3);
  });

  it("defaults to a 30 day window and default batch limit", async () => {
    const { repository, useCase } = createUseCase();

    await useCase.execute();

    expect(repository.findFirstActivationCandidates).toHaveBeenCalledWith(
      "2026-06-29",
      "2026-07-29",
      100
    );
  });
});
