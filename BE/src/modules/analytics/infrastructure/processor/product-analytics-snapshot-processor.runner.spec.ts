import { ConfigService } from "@nestjs/config";
import { PurgeProductAnalyticsRawEventsUseCase } from "@/modules/analytics/application/use-cases/purge-product-analytics-raw-events.use-case";
import { ProcessProductAnalyticsSnapshotsUseCase } from "@/modules/analytics/application/use-cases/process-product-analytics-snapshots.use-case";
import { ProductAnalyticsSnapshotProcessorRunner } from "@/modules/analytics/infrastructure/processor/product-analytics-snapshot-processor.runner";
import { AppLogger } from "@/shared/infrastructure/logger/app-logger.service";

// 역할 : FakeAppLogger runner 로그 호출을 테스트에서 검증할 수 있게 저장합니다.
class FakeAppLogger extends AppLogger {
  readonly errorMock = jest.fn();
  readonly logMock = jest.fn();

  // 기능 : error 로그 메시지를 실제 출력하지 않고 mock에 저장합니다.
  override error(message: string, trace?: string, context?: string): void {
    this.errorMock(message, trace, context);
  }

  // 기능 : info 로그 메시지를 실제 출력하지 않고 mock에 저장합니다.
  override log(message: string, context?: string): void {
    this.logMock(message, context);
  }
}

// 기능 : ConfigService 테스트 대역을 환경 변수 map으로 생성합니다.
function createConfigService(env: Record<string, string>): ConfigService {
  return {
    get: jest.fn((key: string) => env[key]),
  } as unknown as ConfigService;
}

// 기능 : runner와 의존성 테스트 대역을 함께 생성합니다.
function createRunner(env: Record<string, string>) {
  const processSnapshots = {
    execute: jest.fn().mockResolvedValue({
      activationSnapshotsUpdated: 1,
      fromDate: "2026-07-01",
      retentionSnapshotsUpdated: 3,
      toDate: "2026-07-29",
    }),
  } as unknown as jest.Mocked<ProcessProductAnalyticsSnapshotsUseCase>;
  const purgeRawEvents = {
    execute: jest.fn().mockResolvedValue({
      purgeCutoffOccurredAt: "2025-07-29T00:00:00.000Z",
      rawEventsPurged: 0,
    }),
  } as unknown as jest.Mocked<PurgeProductAnalyticsRawEventsUseCase>;
  const logger = new FakeAppLogger();
  const runner = new ProductAnalyticsSnapshotProcessorRunner(
    processSnapshots,
    purgeRawEvents,
    createConfigService(env),
    logger
  );

  return { logger, processSnapshots, purgeRawEvents, runner };
}

// 기능 : setInterval handler 내부의 비동기 tick이 끝날 때까지 microtask를 비웁니다.
async function flushPromises(): Promise<void> {
  await new Promise<void>((resolve) => setImmediate(resolve));
}

describe("ProductAnalyticsSnapshotProcessorRunner", () => {
  let intervalHandler: (() => void) | null;
  let setIntervalSpy: jest.SpyInstance;
  let clearIntervalSpy: jest.SpyInstance;

  beforeEach(() => {
    intervalHandler = null;
    setIntervalSpy = jest.spyOn(global, "setInterval").mockImplementation(
      ((handler: () => void) => {
        intervalHandler = handler;
        return {} as NodeJS.Timeout;
      }) as typeof setInterval
    );
    clearIntervalSpy = jest
      .spyOn(global, "clearInterval")
      .mockImplementation((() => undefined) as typeof clearInterval);
  });

  afterEach(() => {
    setIntervalSpy.mockRestore();
    clearIntervalSpy.mockRestore();
  });

  it("does not start when snapshot and purge flags are disabled", () => {
    const { runner } = createRunner({});

    runner.onModuleInit();

    expect(setIntervalSpy).not.toHaveBeenCalled();
  });

  it("runs snapshot processing when snapshot flag is enabled", async () => {
    const { logger, processSnapshots, runner } = createRunner({
      PRODUCT_ANALYTICS_SNAPSHOT_PROCESSOR_BATCH_SIZE: "37",
      PRODUCT_ANALYTICS_SNAPSHOT_PROCESSOR_ENABLED: "true",
      PRODUCT_ANALYTICS_SNAPSHOT_PROCESSOR_INTERVAL_MS: "1000",
    });

    runner.onModuleInit();
    intervalHandler?.();
    await flushPromises();

    expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 1000);
    expect(processSnapshots.execute).toHaveBeenCalledWith({ limit: 37 });
    expect(logger.logMock).toHaveBeenCalledWith(
      expect.stringContaining("analytics.snapshot.processor.tick"),
      "ProductAnalyticsSnapshotProcessorRunner"
    );
    expect(logger.logMock.mock.calls[0]?.[0]).not.toContain("userId");
  });

  it("runs purge with 365 day retention when purge flag is enabled", async () => {
    const { processSnapshots, purgeRawEvents, runner } = createRunner({
      PRODUCT_ANALYTICS_RETENTION_PURGE_ENABLED: "1",
    });

    runner.onModuleInit();
    intervalHandler?.();
    await flushPromises();

    expect(processSnapshots.execute).not.toHaveBeenCalled();
    expect(purgeRawEvents.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        batchSize: 500,
        retentionDays: 365,
      })
    );
  });

  it("logs snapshot failure without blocking enabled purge", async () => {
    const { logger, processSnapshots, purgeRawEvents, runner } = createRunner({
      PRODUCT_ANALYTICS_RETENTION_PURGE_ENABLED: "true",
      PRODUCT_ANALYTICS_SNAPSHOT_PROCESSOR_ENABLED: "true",
    });
    processSnapshots.execute.mockRejectedValue(new Error("database unavailable"));

    runner.onModuleInit();
    intervalHandler?.();
    await flushPromises();

    expect(logger.errorMock).toHaveBeenCalledWith(
      expect.stringContaining("analytics.snapshot.processor.failed"),
      undefined,
      "ProductAnalyticsSnapshotProcessorRunner"
    );
    expect(purgeRawEvents.execute).toHaveBeenCalled();
  });
});
