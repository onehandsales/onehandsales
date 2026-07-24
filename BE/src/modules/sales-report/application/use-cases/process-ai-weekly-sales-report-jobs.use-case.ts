import { Inject, Injectable } from "@nestjs/common";
import {
  AI_WEEKLY_SALES_REPORT_PROVIDER,
  AiWeeklySalesReportProviderFailure,
  type AiWeeklySalesReportOutput,
  type AiWeeklySalesReportProvider,
  type AiWeeklySalesReportSuggestionItem,
} from "@/modules/sales-report/application/ports/ai-weekly-sales-report.provider";
import {
  AI_WEEKLY_SALES_REPORT_REPOSITORY,
  type AiWeeklySalesReportRecord,
  type AiWeeklySalesReportRepository,
  type AiWeeklySalesReportSuggestionTypeValue,
  type CreateAiWeeklySalesReportSuggestionInput,
} from "@/modules/sales-report/application/ports/ai-weekly-sales-report.repository";
import { normalizeSuggestionTargetId } from "@/modules/sales-report/application/services/ai-weekly-sales-report-application.service";
import { AppLogger } from "@/shared/infrastructure/logger/app-logger.service";

const DEFAULT_BATCH_SIZE = 10;
const MAX_BATCH_SIZE = 50;

export interface ProcessAiWeeklySalesReportJobsCommand {
  readonly limit?: number;
  readonly now?: Date;
}

export interface ProcessAiWeeklySalesReportJobsResult {
  readonly picked: number;
  readonly generated: number;
  readonly failed: number;
}

@Injectable()
export class ProcessAiWeeklySalesReportJobsUseCase {
  constructor(
    @Inject(AI_WEEKLY_SALES_REPORT_REPOSITORY)
    private readonly salesReportRepository: AiWeeklySalesReportRepository,
    @Inject(AI_WEEKLY_SALES_REPORT_PROVIDER)
    private readonly provider: AiWeeklySalesReportProvider,
    private readonly logger: AppLogger
  ) {}

  async execute(
    input: ProcessAiWeeklySalesReportJobsCommand = {}
  ): Promise<ProcessAiWeeklySalesReportJobsResult> {
    const limit = this.normalizeLimit(input.limit);
    const jobs = await this.salesReportRepository.listPendingWeeklyReportJobs({
      limit,
    });
    let generated = 0;
    let failed = 0;

    for (const job of jobs) {
      const result = await this.processJob(job.id, input.now ?? new Date());

      if (result === "generated") {
        generated += 1;
      }

      if (result === "failed") {
        failed += 1;
      }
    }

    this.logEvent("ai.weeklyReport.jobsProcessed", {
      picked: jobs.length,
      generated,
      failed,
    });

    return {
      picked: jobs.length,
      generated,
      failed,
    };
  }

  async processJob(
    jobId: string,
    now = new Date()
  ): Promise<"generated" | "failed" | "skipped"> {
    const workItem = await this.salesReportRepository.startWeeklyReportJob(
      jobId,
      now
    );

    if (!workItem) {
      return "skipped";
    }

    this.logEvent("ai.weeklyReport.jobStarted", {
      userId: workItem.job.userId,
      jobId: workItem.job.id,
      reportId: workItem.report.id,
      version: workItem.report.version,
    });

    const metadata = this.provider.getMetadata();
    const providerCallLog =
      await this.salesReportRepository.createProviderCallLog({
        userId: workItem.job.userId,
        jobId: workItem.job.id,
        reportId: workItem.report.id,
        provider: metadata.provider,
        model: metadata.model,
        startedAt: now,
      });
    const startedAtMs = Date.now();

    try {
      const result = await this.provider.generateReport({
        reportId: workItem.report.id,
        userId: workItem.report.userId,
        weekStart: this.formatDateOnly(workItem.report.weekStart),
        weekEnd: this.formatDateOnly(workItem.report.weekEnd),
        timeZone: workItem.report.timeZone,
        locale: workItem.report.locale,
        inputSnapshot: workItem.report.inputSnapshotJson,
      });
      const completedAt = new Date();
      const latencyMs = Math.max(Date.now() - startedAtMs, 0);
      const output = this.normalizeOutput(result.output);

      await this.salesReportRepository.completeReportGeneration({
        userId: workItem.report.userId,
        reportId: workItem.report.id,
        jobId: workItem.job.id,
        providerCallLogId: providerCallLog.id,
        provider: result.provider,
        model: result.model,
        output,
        dataCoverageJson: output.dataCoverage as unknown as Record<string, unknown>,
        suggestions: this.createSuggestions(workItem.report, output),
        completedAt,
        providerCall: {
          providerCallLogId: providerCallLog.id,
          completedAt,
          requestId: result.requestId ?? null,
          latencyMs,
          inputTokenCount: result.usage?.inputTokenCount ?? null,
          outputTokenCount: result.usage?.outputTokenCount ?? null,
          totalTokenCount: result.usage?.totalTokenCount ?? null,
          estimatedCostAmount: result.usage?.estimatedCostAmount ?? null,
          costCurrency: result.usage?.costCurrency ?? "USD",
        },
      });

      this.logEvent("ai.weeklyReport.generated", {
        userId: workItem.report.userId,
        jobId: workItem.job.id,
        reportId: workItem.report.id,
        provider: result.provider,
        model: result.model,
        latencyMs,
      });

      return "generated";
    } catch (error) {
      const failure = this.toSafeFailure(error);
      const failedAt = new Date();
      const latencyMs = Math.max(Date.now() - startedAtMs, 0);

      await this.salesReportRepository.failReportGeneration({
        userId: workItem.report.userId,
        reportId: workItem.report.id,
        jobId: workItem.job.id,
        providerCallLogId: providerCallLog.id,
        failedAt,
        safeErrorCode: failure.safeErrorCode,
        safeErrorMessage: failure.safeErrorMessage,
        retryable: failure.retryable,
        providerCall: {
          providerCallLogId: providerCallLog.id,
          failedAt,
          latencyMs,
          safeErrorCode: failure.safeErrorCode,
          safeErrorMessage: failure.safeErrorMessage,
          retryable: failure.retryable,
        },
      });

      this.logEvent("ai.weeklyReport.failed", {
        userId: workItem.report.userId,
        jobId: workItem.job.id,
        reportId: workItem.report.id,
        safeErrorCode: failure.safeErrorCode,
        retryable: failure.retryable,
      });

      return "failed";
    }
  }

  private normalizeOutput(
    output: AiWeeklySalesReportOutput
  ): AiWeeklySalesReportOutput {
    return {
      executiveSummary: {
        headline: this.normalizeRequiredText(
          output.executiveSummary.headline,
          "executiveSummary.headline"
        ),
        narrative: this.normalizeRequiredText(
          output.executiveSummary.narrative,
          "executiveSummary.narrative"
        ),
        wins: this.normalizeStringList(output.executiveSummary.wins),
        concerns: this.normalizeStringList(output.executiveSummary.concerns),
      },
      pipelineSummary: {
        narrative: this.normalizeRequiredText(
          output.pipelineSummary.narrative,
          "pipelineSummary.narrative"
        ),
        totalDealCost: Number.isFinite(output.pipelineSummary.totalDealCost)
          ? output.pipelineSummary.totalDealCost
          : 0,
        statusCounts: output.pipelineSummary.statusCounts.map((item) => ({
          status: this.normalizeRequiredText(item.status, "statusCounts.status"),
          count: Number.isInteger(item.count) && item.count > 0 ? item.count : 0,
        })),
      },
      riskSignals: this.normalizeSuggestionItems(output.riskSignals),
      nextWeekActions: this.normalizeSuggestionItems(output.nextWeekActions),
      followUpDrafts: this.normalizeSuggestionItems(output.followUpDrafts),
      dataCleanupSuggestions: this.normalizeSuggestionItems(
        output.dataCleanupSuggestions
      ),
      dataCoverage: {
        scheduleCount: this.normalizeCount(output.dataCoverage.scheduleCount),
        dealCount: this.normalizeCount(output.dataCoverage.dealCount),
        meetingNoteCount: this.normalizeCount(
          output.dataCoverage.meetingNoteCount
        ),
        linkedDealCount: this.normalizeCount(output.dataCoverage.linkedDealCount),
        missingSignals: this.normalizeStringList(
          output.dataCoverage.missingSignals
        ),
      },
    };
  }

  private createSuggestions(
    report: AiWeeklySalesReportRecord,
    output: AiWeeklySalesReportOutput
  ): CreateAiWeeklySalesReportSuggestionInput[] {
    return [
      ...this.toSuggestionInputs(report, "RISK", output.riskSignals),
      ...this.toSuggestionInputs(report, "NEXT_ACTION", output.nextWeekActions),
      ...this.toSuggestionInputs(report, "FOLLOW_UP", output.followUpDrafts),
      ...this.toSuggestionInputs(
        report,
        "DATA_CLEANUP",
        output.dataCleanupSuggestions
      ),
    ];
  }

  private toSuggestionInputs(
    report: AiWeeklySalesReportRecord,
    type: AiWeeklySalesReportSuggestionTypeValue,
    items: readonly AiWeeklySalesReportSuggestionItem[]
  ): CreateAiWeeklySalesReportSuggestionInput[] {
    return items.map((item, index) => ({
      userId: report.userId,
      reportId: report.id,
      type,
      suggestionKey: this.createSuggestionKey(type, item.key, index),
      priority: item.priority,
      title: item.title,
      body: item.body,
      reason: item.reason ?? null,
      targetType: item.targetType ?? null,
      targetId: normalizeSuggestionTargetId(item.targetId ?? null),
      targetPath: item.targetPath ?? null,
      targetLabel: item.targetLabel ?? null,
      payloadJson: item.payload ?? {},
    }));
  }

  private normalizeSuggestionItems(
    items: readonly AiWeeklySalesReportSuggestionItem[]
  ): AiWeeklySalesReportSuggestionItem[] {
    return items.slice(0, 20).map((item, index) => ({
      key: this.normalizeOptionalText(item.key) ?? `item-${index + 1}`,
      priority: ["LOW", "MEDIUM", "HIGH"].includes(item.priority)
        ? item.priority
        : "MEDIUM",
      title: this.normalizeRequiredText(item.title, "suggestion.title"),
      body: this.normalizeRequiredText(item.body, "suggestion.body"),
      reason: this.normalizeOptionalText(item.reason ?? null),
      targetType: this.normalizeOptionalText(item.targetType ?? null),
      targetId: this.normalizeOptionalText(item.targetId ?? null),
      targetPath: this.normalizeOptionalText(item.targetPath ?? null),
      targetLabel: this.normalizeOptionalText(item.targetLabel ?? null),
      payload: item.payload ?? {},
    }));
  }

  private createSuggestionKey(
    type: AiWeeklySalesReportSuggestionTypeValue,
    key: string,
    index: number
  ): string {
    const normalizedKey = key
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80);

    return `${type.toLowerCase()}-${normalizedKey || index + 1}`;
  }

  private toSafeFailure(error: unknown): {
    readonly safeErrorCode: string;
    readonly safeErrorMessage: string;
    readonly retryable: boolean;
  } {
    if (error instanceof AiWeeklySalesReportProviderFailure) {
      return {
        safeErrorCode: error.safeErrorCode,
        safeErrorMessage: error.safeErrorMessage,
        retryable: error.retryable,
      };
    }

    return {
      safeErrorCode: "AI_PROVIDER_FAILED",
      safeErrorMessage: "AI weekly sales report generation failed",
      retryable: false,
    };
  }

  private normalizeLimit(value: number | undefined): number {
    if (!Number.isInteger(value) || value === undefined || value < 1) {
      return DEFAULT_BATCH_SIZE;
    }

    return Math.min(value, MAX_BATCH_SIZE);
  }

  private normalizeRequiredText(value: string, fieldName: string): string {
    const normalized = value.trim();

    if (!normalized) {
      throw new AiWeeklySalesReportProviderFailure(
        "AI_PROVIDER_SCHEMA_INVALID",
        `${fieldName} was not generated`,
        false
      );
    }

    return normalized;
  }

  private normalizeOptionalText(value: string | null): string | null {
    if (value === null) {
      return null;
    }

    const normalized = value.trim();

    return normalized.length > 0 ? normalized : null;
  }

  private normalizeStringList(values: readonly string[]): string[] {
    return values
      .map((value) => value.trim())
      .filter((value) => value.length > 0)
      .slice(0, 20);
  }

  private normalizeCount(value: number): number {
    return Number.isInteger(value) && value >= 0 ? value : 0;
  }

  private formatDateOnly(date: Date): string {
    return date.toISOString().slice(0, 10);
  }

  private logEvent(event: string, fields: Record<string, unknown>): void {
    this.logger.log(
      JSON.stringify({
        event,
        ...fields,
      }),
      this.constructor.name
    );
  }
}
