import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  PRODUCT_ANALYTICS_RAW_EVENT_RETENTION_DAYS,
  PurgeProductAnalyticsRawEventsUseCase,
} from "@/modules/analytics/application/use-cases/purge-product-analytics-raw-events.use-case";
import { ProcessProductAnalyticsSnapshotsUseCase } from "@/modules/analytics/application/use-cases/process-product-analytics-snapshots.use-case";
import { AppLogger } from "@/shared/infrastructure/logger/app-logger.service";

const DEFAULT_INTERVAL_MS = 300_000;
const DEFAULT_SNAPSHOT_BATCH_SIZE = 100;
const DEFAULT_PURGE_BATCH_SIZE = 500;

@Injectable()
// 역할 : 설정으로 켜는 optional product analytics snapshot processor입니다.
export class ProductAnalyticsSnapshotProcessorRunner
  implements OnModuleInit, OnModuleDestroy
{
  private timer: NodeJS.Timeout | null = null;
  private running = false;

  constructor(
    private readonly processSnapshots: ProcessProductAnalyticsSnapshotsUseCase,
    private readonly purgeRawEvents: PurgeProductAnalyticsRawEventsUseCase,
    private readonly configService: ConfigService,
    private readonly logger: AppLogger
  ) {}

  onModuleInit(): void {
    // 기능 : snapshot 또는 purge가 명시적으로 활성화된 경우에만 interval tick을 시작합니다.
    if (!this.isSnapshotEnabled() && !this.isPurgeEnabled()) {
      return;
    }

    const intervalMs = this.getPositiveInteger(
      "PRODUCT_ANALYTICS_SNAPSHOT_PROCESSOR_INTERVAL_MS",
      DEFAULT_INTERVAL_MS
    );
    this.timer = setInterval(() => {
      void this.tick();
    }, intervalMs);
  }

  onModuleDestroy(): void {
    // 기능 : module 종료 시 product analytics interval timer를 정리합니다.
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  // 기능 : 이전 tick이 실행 중이면 중복 계산을 건너뛰고 활성화된 작업만 순차 실행합니다.
  private async tick(): Promise<void> {
    if (this.running) {
      return;
    }

    this.running = true;

    try {
      if (this.isSnapshotEnabled()) {
        await this.runSnapshotTick();
      }

      if (this.isPurgeEnabled()) {
        await this.runPurgeTick();
      }
    } finally {
      this.running = false;
    }
  }

  // 기능 : activation/retention snapshot 계산 결과를 count와 date 중심 로그로 남깁니다.
  private async runSnapshotTick(): Promise<void> {
    try {
      const result = await this.processSnapshots.execute({
        limit: this.getPositiveInteger(
          "PRODUCT_ANALYTICS_SNAPSHOT_PROCESSOR_BATCH_SIZE",
          DEFAULT_SNAPSHOT_BATCH_SIZE
        ),
      });

      this.logger.log(
        JSON.stringify({
          event: "analytics.snapshot.processor.tick",
          ...result,
        }),
        this.constructor.name
      );
    } catch {
      this.logger.error(
        JSON.stringify({
          event: "analytics.snapshot.processor.failed",
          safeErrorCode: "ANALYTICS_SNAPSHOT_PROCESSOR_FAILED",
        }),
        undefined,
        this.constructor.name
      );
    }
  }

  // 기능 : raw event purge 실패는 payload 없이 safe error code만 기록합니다.
  private async runPurgeTick(): Promise<void> {
    try {
      await this.purgeRawEvents.execute({
        batchSize: this.getPositiveInteger(
          "PRODUCT_ANALYTICS_RETENTION_PURGE_BATCH_SIZE",
          DEFAULT_PURGE_BATCH_SIZE
        ),
        now: new Date(),
        retentionDays: PRODUCT_ANALYTICS_RAW_EVENT_RETENTION_DAYS,
      });
    } catch {
      this.logger.error(
        JSON.stringify({
          event: "analytics.retention.purgeFailed",
          safeErrorCode: "ANALYTICS_RETENTION_PURGE_FAILED",
        }),
        undefined,
        this.constructor.name
      );
    }
  }

  // 기능 : PRODUCT_ANALYTICS_SNAPSHOT_PROCESSOR_ENABLED 값이 true/1일 때 snapshot 계산을 활성화합니다.
  private isSnapshotEnabled(): boolean {
    return this.isEnabled("PRODUCT_ANALYTICS_SNAPSHOT_PROCESSOR_ENABLED");
  }

  // 기능 : PRODUCT_ANALYTICS_RETENTION_PURGE_ENABLED 값이 true/1일 때 raw event purge를 활성화합니다.
  private isPurgeEnabled(): boolean {
    return this.isEnabled("PRODUCT_ANALYTICS_RETENTION_PURGE_ENABLED");
  }

  // 기능 : 환경 변수 문자열을 boolean flag로 해석합니다.
  private isEnabled(key: string): boolean {
    const value = this.configService.get<string>(key)?.trim().toLowerCase();

    return value === "true" || value === "1";
  }

  // 기능 : batch size와 interval 설정을 양의 정수로 정규화합니다.
  private getPositiveInteger(key: string, fallback: number): number {
    const value = Number(this.configService.get<string>(key));

    return Number.isInteger(value) && value > 0 ? value : fallback;
  }
}
