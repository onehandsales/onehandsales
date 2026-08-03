import { Injectable, type OnModuleDestroy, type OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  DataImportApplicationService,
  IMPORT_JOB_CLEANUP_DEFAULT_BATCH_SIZE,
  IMPORT_JOB_CLEANUP_RETENTION_DAYS,
  IMPORT_USER_LOG_ROW_CLEANUP_RETENTION_DAYS,
} from "@/modules/data-import/application/services/data-import-application.service";

export const IMPORT_JOB_CLEANUP_DEFAULT_INTERVAL_MS = 300_000;

// 역할 : ImportJobCleanupRunner 환경 변수 기반 import retention cleanup timer를 관리합니다.
@Injectable()
export class ImportJobCleanupRunner implements OnModuleInit, OnModuleDestroy {
  private timer: ReturnType<typeof setInterval> | null = null;
  private running = false;

  // 기능 : cleanup use case와 환경 설정 조회기를 주입받습니다.
  constructor(
    private readonly dataImportApplicationService: DataImportApplicationService,
    private readonly configService: ConfigService
  ) {}

  // 기능 : module 초기화 시 cleanup env flag가 켜진 경우에만 주기 실행 timer를 시작합니다.
  onModuleInit(): void {
    if (!this.isCleanupEnabled()) {
      return;
    }

    const intervalMs = this.readPositiveIntegerConfig(
      "IMPORT_JOB_CLEANUP_INTERVAL_MS",
      IMPORT_JOB_CLEANUP_DEFAULT_INTERVAL_MS
    );

    this.timer = setInterval(() => {
      void this.runOnce();
    }, intervalMs);
  }

  // 기능 : module 종료 시 cleanup timer를 해제합니다.
  onModuleDestroy(): void {
    if (!this.timer) {
      return;
    }

    clearInterval(this.timer);
    this.timer = null;
  }

  // 기능 : 이전 tick 실행 중이면 이번 cleanup tick을 건너뛰고 다음 주기를 기다립니다.
  async runOnce(): Promise<void> {
    if (this.running) {
      return;
    }

    this.running = true;

    try {
      const batchSize = this.readPositiveIntegerConfig(
        "IMPORT_JOB_CLEANUP_BATCH_SIZE",
        IMPORT_JOB_CLEANUP_DEFAULT_BATCH_SIZE
      );

      // 1. 같은 tick 안에서 terminal job cleanup과 성공 이력 row cleanup을 각각 독립 실행한다.
      await this.runTerminalImportJobCleanup(batchSize);
      await this.runImportUserLogRowCleanup(batchSize);
    } finally {
      this.running = false;
    }
  }

  // 기능 : terminal import job cleanup 실패가 다음 retention 작업을 막지 않도록 격리합니다.
  private async runTerminalImportJobCleanup(batchSize: number): Promise<void> {
    try {
      await this.dataImportApplicationService.cleanupTerminalImportJobs({
        now: new Date(),
        retentionDays: IMPORT_JOB_CLEANUP_RETENTION_DAYS,
        batchSize,
      });
    } catch {
      // 1. cleanup use case가 safe failure log를 남기므로 runner는 다음 작업을 계속한다.
    }
  }

  // 기능 : 성공 이력 row cleanup을 같은 env flag와 batch size 기준으로 실행합니다.
  private async runImportUserLogRowCleanup(batchSize: number): Promise<void> {
    try {
      await this.dataImportApplicationService.cleanupImportUserLogRows({
        now: new Date(),
        retentionDays: IMPORT_USER_LOG_ROW_CLEANUP_RETENTION_DAYS,
        batchSize,
      });
    } catch {
      // 1. cleanup use case가 safe failure log를 남기므로 runner timer를 중단하지 않는다.
    }
  }

  // 기능 : cleanup runner 활성화 flag를 true/1 값으로만 해석합니다.
  private isCleanupEnabled(): boolean {
    const value = this.configService.get<string>("IMPORT_JOB_CLEANUP_ENABLED");
    const normalized = value?.trim().toLowerCase();

    return normalized === "true" || normalized === "1";
  }

  // 기능 : 환경 변수 숫자 값을 양의 정수로 정규화하고 잘못된 값은 기본값으로 대체합니다.
  private readPositiveIntegerConfig(key: string, defaultValue: number): number {
    const value = this.configService.get<string | number>(key);
    const parsed = typeof value === "number" ? value : Number(value);

    if (!Number.isInteger(parsed) || parsed <= 0) {
      return defaultValue;
    }

    return parsed;
  }
}
