import type { ConfigService } from "@nestjs/config";
import type { DataImportApplicationService } from "@/modules/data-import/application/services/data-import-application.service";
import {
  IMPORT_JOB_CLEANUP_DEFAULT_INTERVAL_MS,
  ImportJobCleanupRunner,
} from "./import-job-cleanup.runner";

type CleanupServiceMock = Pick<
  jest.Mocked<DataImportApplicationService>,
  "cleanupTerminalImportJobs" | "cleanupImportUserLogRows"
>;

describe("ImportJobCleanupRunner", () => {
  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it("does not start a timer when env flag is off", () => {
    jest.useFakeTimers();
    const setIntervalSpy = jest.spyOn(global, "setInterval");
    const fixture = createRunnerFixture({
      IMPORT_JOB_CLEANUP_ENABLED: "false",
    });

    fixture.runner.onModuleInit();

    expect(setIntervalSpy).not.toHaveBeenCalled();
    expect(fixture.service.cleanupTerminalImportJobs).not.toHaveBeenCalled();
    expect(fixture.service.cleanupImportUserLogRows).not.toHaveBeenCalled();
  });

  it("runs import retention cleanups with default batch size when env flag is on", async () => {
    jest.useFakeTimers();
    const setIntervalSpy = jest.spyOn(global, "setInterval");
    const fixture = createRunnerFixture({
      IMPORT_JOB_CLEANUP_ENABLED: "true",
    });

    fixture.runner.onModuleInit();
    jest.advanceTimersByTime(IMPORT_JOB_CLEANUP_DEFAULT_INTERVAL_MS);
    await Promise.resolve();
    await Promise.resolve();

    expect(setIntervalSpy).toHaveBeenCalledWith(
      expect.any(Function),
      IMPORT_JOB_CLEANUP_DEFAULT_INTERVAL_MS
    );
    expect(fixture.service.cleanupTerminalImportJobs).toHaveBeenCalledWith({
      now: expect.any(Date),
      retentionDays: 7,
      batchSize: 500,
    });
    expect(fixture.service.cleanupImportUserLogRows).toHaveBeenCalledWith({
      now: expect.any(Date),
      retentionDays: 30,
      batchSize: 500,
    });

    fixture.runner.onModuleDestroy();
  });

  it("runs import user log row cleanup even when terminal job cleanup fails", async () => {
    const fixture = createRunnerFixture({
      IMPORT_JOB_CLEANUP_ENABLED: "true",
    });
    fixture.service.cleanupTerminalImportJobs.mockRejectedValueOnce(
      new Error("terminal cleanup failed")
    );

    await fixture.runner.runOnce();

    expect(fixture.service.cleanupTerminalImportJobs).toHaveBeenCalled();
    expect(fixture.service.cleanupImportUserLogRows).toHaveBeenCalledWith({
      now: expect.any(Date),
      retentionDays: 30,
      batchSize: 500,
    });
  });
});

function createRunnerFixture(env: Readonly<Record<string, string>>) {
  const service: CleanupServiceMock = {
    cleanupTerminalImportJobs: jest.fn().mockResolvedValue({
      deletedJobCount: 0,
      fileDeleteRetriedCount: 0,
      fileDeleteFailedCount: 0,
      skippedJobCount: 0,
      cleanupCutoffAt: "2026-07-14T00:00:00.000Z",
    }),
    cleanupImportUserLogRows: jest.fn().mockResolvedValue({
      deletedRowCount: 0,
      cleanupCutoffAt: "2026-06-21T00:00:00.000Z",
    }),
  };
  const configService = {
    get: jest.fn((key: string) => env[key]),
  };

  return {
    runner: new ImportJobCleanupRunner(
      service as unknown as DataImportApplicationService,
      configService as unknown as ConfigService
    ),
    service,
    configService,
  };
}
