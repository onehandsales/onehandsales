export const AI_WEEKLY_SALES_REPORT_PROVIDER = Symbol(
  "AI_WEEKLY_SALES_REPORT_PROVIDER"
);

export type AiSuggestionPriorityValue = "LOW" | "MEDIUM" | "HIGH";

export interface AiWeeklySalesReportDataCoverage {
  readonly scheduleCount: number;
  readonly dealCount: number;
  readonly meetingNoteCount: number;
  readonly linkedDealCount: number;
  readonly missingSignals: readonly string[];
}

export interface AiWeeklySalesReportSuggestionItem {
  readonly key: string;
  readonly priority: AiSuggestionPriorityValue;
  readonly title: string;
  readonly body: string;
  readonly reason?: string | null;
  readonly targetType?: string | null;
  readonly targetId?: string | null;
  readonly targetPath?: string | null;
  readonly targetLabel?: string | null;
  readonly payload?: Record<string, unknown>;
}

export interface AiWeeklySalesReportOutput {
  readonly executiveSummary: {
    readonly headline: string;
    readonly narrative: string;
    readonly wins: readonly string[];
    readonly concerns: readonly string[];
  };
  readonly pipelineSummary: {
    readonly narrative: string;
    readonly totalDealCost: number;
    readonly statusCounts: readonly {
      readonly status: string;
      readonly count: number;
    }[];
  };
  readonly riskSignals: readonly AiWeeklySalesReportSuggestionItem[];
  readonly nextWeekActions: readonly AiWeeklySalesReportSuggestionItem[];
  readonly followUpDrafts: readonly AiWeeklySalesReportSuggestionItem[];
  readonly dataCleanupSuggestions: readonly AiWeeklySalesReportSuggestionItem[];
  readonly dataCoverage: AiWeeklySalesReportDataCoverage;
}

export interface GenerateAiWeeklySalesReportInput {
  readonly reportId: string;
  readonly userId: string;
  readonly weekStart: string;
  readonly weekEnd: string;
  readonly timeZone: string;
  readonly locale: string;
  readonly inputSnapshot: Record<string, unknown>;
}

export interface AiWeeklySalesReportProviderUsage {
  readonly inputTokenCount?: number | null;
  readonly outputTokenCount?: number | null;
  readonly totalTokenCount?: number | null;
  readonly estimatedCostAmount?: string | null;
  readonly costCurrency?: string | null;
}

export interface AiWeeklySalesReportProviderResult {
  readonly provider: string;
  readonly model: string;
  readonly requestId?: string | null;
  readonly output: AiWeeklySalesReportOutput;
  readonly usage?: AiWeeklySalesReportProviderUsage;
}

export interface AiWeeklySalesReportProviderMetadata {
  readonly provider: string;
  readonly model: string;
}

export class AiWeeklySalesReportProviderFailure extends Error {
  constructor(
    readonly safeErrorCode: string,
    readonly safeErrorMessage: string,
    readonly retryable = false
  ) {
    super(safeErrorMessage);
    this.name = "AiWeeklySalesReportProviderFailure";
  }
}

export interface AiWeeklySalesReportProvider {
  getMetadata(): AiWeeklySalesReportProviderMetadata;

  generateReport(
    input: GenerateAiWeeklySalesReportInput
  ): Promise<AiWeeklySalesReportProviderResult>;
}
