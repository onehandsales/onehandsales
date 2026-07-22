import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ProcessDueNotificationsUseCase } from "@/modules/notification/application/use-cases/process-due-notifications.use-case";
import { AppLogger } from "@/shared/infrastructure/logger/app-logger.service";

const DEFAULT_INTERVAL_MS = 60_000;
const DEFAULT_BATCH_SIZE = 50;

@Injectable()
// 역할 : 설정으로 켜는 optional background due notification processor입니다.
export class NotificationDueProcessorRunner
  implements OnModuleInit, OnModuleDestroy
{
  private timer: NodeJS.Timeout | null = null;
  private running = false;

  constructor(
    private readonly processDueNotifications: ProcessDueNotificationsUseCase,
    private readonly configService: ConfigService,
    private readonly logger: AppLogger
  ) {}

  onModuleInit(): void {
    // 기능 : 명시적으로 활성화된 경우에만 주기적 processor tick을 시작합니다.
    if (!this.isEnabled()) {
      return;
    }

    const intervalMs = this.getPositiveInteger(
      "NOTIFICATION_PROCESSOR_INTERVAL_MS",
      DEFAULT_INTERVAL_MS
    );
    this.timer = setInterval(() => {
      void this.tick();
    }, intervalMs);
  }

  onModuleDestroy(): void {
    // 기능 : module 종료 시 interval timer를 정리합니다.
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private async tick(): Promise<void> {
    // 기능 : 이전 tick이 아직 실행 중이면 중복 실행을 건너뜁니다.
    if (this.running) {
      return;
    }

    this.running = true;

    try {
      const result = await this.processDueNotifications.execute({
        limit: this.getPositiveInteger(
          "NOTIFICATION_PROCESSOR_BATCH_SIZE",
          DEFAULT_BATCH_SIZE
        ),
      });

      this.logger.log(
        JSON.stringify({
          event: "notification.processor.tick",
          ...result,
        }),
        this.constructor.name
      );
    } catch {
      this.logger.error(
        JSON.stringify({
          event: "notification.processor.failed",
          safeErrorCode: "NOTIFICATION_PROCESSOR_FAILED",
        }),
        undefined,
        this.constructor.name
      );
    } finally {
      this.running = false;
    }
  }

  private isEnabled(): boolean {
    // 기능 : NOTIFICATION_PROCESSOR_ENABLED 값이 true/1일 때만 runner를 활성화합니다.
    const value = this.configService
      .get<string>("NOTIFICATION_PROCESSOR_ENABLED")
      ?.trim()
      .toLowerCase();

    return value === "true" || value === "1";
  }

  private getPositiveInteger(key: string, fallback: number): number {
    // 기능 : batch size와 interval 설정을 양수 정수로 정규화합니다.
    const value = Number(this.configService.get<string>(key));

    return Number.isInteger(value) && value > 0 ? value : fallback;
  }
}
