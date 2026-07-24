import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ProcessAiWeeklySalesReportJobsUseCase } from "@/modules/sales-report/application/use-cases/process-ai-weekly-sales-report-jobs.use-case";
import { AppLogger } from "@/shared/infrastructure/logger/app-logger.service";

const DEFAULT_INTERVAL_MS = 60_000;
const DEFAULT_BATCH_SIZE = 10;

@Injectable()
export class AiWeeklySalesReportProcessorRunner
  implements OnModuleInit, OnModuleDestroy
{
  private timer: NodeJS.Timeout | null = null;
  private running = false;

  constructor(
    private readonly processJobs: ProcessAiWeeklySalesReportJobsUseCase,
    private readonly configService: ConfigService,
    private readonly logger: AppLogger
  ) {}

  onModuleInit(): void {
    if (!this.isEnabled()) {
      return;
    }

    const intervalMs = this.getPositiveInteger(
      "AI_WEEKLY_REPORT_PROCESSOR_INTERVAL_MS",
      DEFAULT_INTERVAL_MS
    );
    this.timer = setInterval(() => {
      void this.tick();
    }, intervalMs);
  }

  onModuleDestroy(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private async tick(): Promise<void> {
    if (this.running) {
      return;
    }

    this.running = true;

    try {
      const result = await this.processJobs.execute({
        limit: this.getPositiveInteger(
          "AI_WEEKLY_REPORT_PROCESSOR_BATCH_SIZE",
          DEFAULT_BATCH_SIZE
        ),
      });

      this.logger.log(
        JSON.stringify({
          event: "ai.weeklyReport.processor.tick",
          ...result,
        }),
        this.constructor.name
      );
    } catch {
      this.logger.error(
        JSON.stringify({
          event: "ai.weeklyReport.processor.failed",
          safeErrorCode: "AI_WEEKLY_REPORT_PROCESSOR_FAILED",
        }),
        undefined,
        this.constructor.name
      );
    } finally {
      this.running = false;
    }
  }

  private isEnabled(): boolean {
    const value = this.configService
      .get<string>("AI_WEEKLY_REPORT_PROCESSOR_ENABLED")
      ?.trim()
      .toLowerCase();

    return value === "true" || value === "1";
  }

  private getPositiveInteger(key: string, fallback: number): number {
    const value = Number(this.configService.get<string>(key));

    return Number.isInteger(value) && value > 0 ? value : fallback;
  }
}
