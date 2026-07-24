import type {
  AiSuggestionPriorityValue,
  AiWeeklySalesReportOutput,
} from "./ai-weekly-sales-report.provider";

export const AI_WEEKLY_SALES_REPORT_REPOSITORY = Symbol(
  "AI_WEEKLY_SALES_REPORT_REPOSITORY"
);

export type AiWeeklySalesReportStatusValue = "GENERATING" | "READY" | "FAILED";
export type AiJobStatusValue =
  | "PENDING"
  | "RUNNING"
  | "SUCCEEDED"
  | "FAILED"
  | "CANCELED";
export type AiProviderCallStatusValue =
  | "PENDING"
  | "SUCCEEDED"
  | "FAILED"
  | "CANCELED";
export type AiWeeklySalesReportSuggestionTypeValue =
  | "RISK"
  | "NEXT_ACTION"
  | "FOLLOW_UP"
  | "DATA_CLEANUP";

export interface AiWeeklySalesReportRecord {
  readonly id: string;
  readonly userId: string;
  readonly weekStart: Date;
  readonly weekEnd: Date;
  readonly timeZone: string;
  readonly locale: string;
  readonly version: number;
  readonly status: AiWeeklySalesReportStatusValue;
  readonly provider: string | null;
  readonly model: string | null;
  readonly inputSnapshotJson: Record<string, unknown>;
  readonly inputMetadataJson: Record<string, unknown>;
  readonly outputJson: Record<string, unknown> | null;
  readonly dataCoverageJson: Record<string, unknown>;
  readonly safeErrorCode: string | null;
  readonly safeErrorMessage: string | null;
  readonly requestedAt: Date;
  readonly startedAt: Date | null;
  readonly generatedAt: Date | null;
  readonly failedAt: Date | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface AiJobRecord {
  readonly id: string;
  readonly userId: string;
  readonly operation: "WEEKLY_SALES_REPORT";
  readonly status: AiJobStatusValue;
  readonly targetType: string;
  readonly targetId: string;
  readonly idempotencyKey: string | null;
  readonly attemptCount: number;
  readonly maxAttemptCount: number;
  readonly safeErrorCode: string | null;
  readonly safeErrorMessage: string | null;
  readonly requestedAt: Date;
  readonly startedAt: Date | null;
  readonly completedAt: Date | null;
  readonly failedAt: Date | null;
  readonly metadataJson: Record<string, unknown>;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface AiProviderCallLogRecord {
  readonly id: string;
  readonly userId: string;
  readonly status: AiProviderCallStatusValue;
  readonly reportId: string | null;
  readonly jobId: string | null;
  readonly provider: string;
  readonly model: string;
  readonly requestId: string | null;
  readonly latencyMs: number | null;
  readonly inputTokenCount: number | null;
  readonly outputTokenCount: number | null;
  readonly totalTokenCount: number | null;
  readonly estimatedCostAmount: string | null;
  readonly costCurrency: string;
  readonly safeErrorCode: string | null;
  readonly safeErrorMessage: string | null;
  readonly retryable: boolean;
  readonly retryCount: number;
  readonly startedAt: Date;
  readonly completedAt: Date | null;
  readonly failedAt: Date | null;
  readonly metadataJson: Record<string, unknown>;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface AiWeeklySalesReportUserPreferencesRecord {
  readonly timeZone: string;
  readonly preferredLocale: string;
}

export interface AiWeeklySnapshotCompanyRecord {
  readonly id: string | null;
  readonly companyName: string;
  readonly companyField?: string | null;
  readonly companyRegion?: string | null;
}

export interface AiWeeklySnapshotContactRecord {
  readonly id: string | null;
  readonly companyId: string | null;
  readonly username: string;
  readonly email?: string | null;
  readonly mobile?: string | null;
  readonly companyName?: string | null;
  readonly department?: string | null;
  readonly jobGrade?: string | null;
}

export interface AiWeeklySnapshotProductRecord {
  readonly id: string | null;
  readonly productName: string;
  readonly productPrice: number | null;
  readonly category?: string | null;
  readonly status?: string | null;
}

export interface AiWeeklySnapshotDealRecord {
  readonly id: string;
  readonly dealName: string;
  readonly dealStatus: string;
  readonly dealCost: number;
  readonly expectedEndDate: Date;
  readonly companies: readonly AiWeeklySnapshotCompanyRecord[];
  readonly contacts: readonly AiWeeklySnapshotContactRecord[];
  readonly products: readonly AiWeeklySnapshotProductRecord[];
  readonly nextFollowingActions: readonly {
    readonly id: string;
    readonly followingAction: string;
    readonly checkComplete: boolean;
    readonly createdAt: Date;
  }[];
  readonly openFollowingActionCount: number;
}

export interface AiWeeklySnapshotMeetingNoteRecord {
  readonly id: string;
  readonly sourceType: string;
  readonly title: string;
  readonly meetingAt: Date;
  readonly timeZone: string;
  readonly details: string;
  readonly nextPlan: string | null;
  readonly requiredAction: string | null;
  readonly companies: readonly AiWeeklySnapshotCompanyRecord[];
  readonly contacts: readonly AiWeeklySnapshotContactRecord[];
  readonly products: readonly AiWeeklySnapshotProductRecord[];
  readonly deals: readonly {
    readonly id: string;
    readonly dealId: string;
    readonly dealName: string;
    readonly dealStatus: string;
    readonly dealCost: number;
    readonly expectedEndDate: Date;
  }[];
}

export interface CreateGeneratingReportInput {
  readonly userId: string;
  readonly weekStart: Date;
  readonly weekEnd: Date;
  readonly timeZone: string;
  readonly locale: string;
  readonly inputSnapshotJson: Record<string, unknown>;
  readonly inputMetadataJson: Record<string, unknown>;
  readonly dataCoverageJson: Record<string, unknown>;
  readonly idempotencyKey: string | null;
  readonly now: Date;
}

export interface CreateGeneratingReportResult {
  readonly report: AiWeeklySalesReportRecord;
  readonly job: AiJobRecord;
}

export interface CreateProviderCallLogInput {
  readonly userId: string;
  readonly reportId: string;
  readonly jobId: string;
  readonly provider: string;
  readonly model: string;
  readonly startedAt: Date;
}

export interface MarkProviderCallSucceededInput {
  readonly providerCallLogId: string;
  readonly completedAt: Date;
  readonly requestId: string | null;
  readonly latencyMs: number;
  readonly inputTokenCount: number | null;
  readonly outputTokenCount: number | null;
  readonly totalTokenCount: number | null;
  readonly estimatedCostAmount: string | null;
  readonly costCurrency: string | null;
}

export interface MarkProviderCallFailedInput {
  readonly providerCallLogId: string;
  readonly failedAt: Date;
  readonly latencyMs: number | null;
  readonly safeErrorCode: string;
  readonly safeErrorMessage: string;
  readonly retryable: boolean;
}

export interface CompleteReportGenerationInput {
  readonly reportId: string;
  readonly jobId: string;
  readonly providerCallLogId: string;
  readonly userId: string;
  readonly provider: string;
  readonly model: string;
  readonly output: AiWeeklySalesReportOutput;
  readonly dataCoverageJson: Record<string, unknown>;
  readonly suggestions: readonly CreateAiWeeklySalesReportSuggestionInput[];
  readonly completedAt: Date;
  readonly providerCall: MarkProviderCallSucceededInput;
}

export interface FailReportGenerationInput {
  readonly reportId: string;
  readonly jobId: string;
  readonly providerCallLogId: string | null;
  readonly userId: string;
  readonly failedAt: Date;
  readonly safeErrorCode: string;
  readonly safeErrorMessage: string;
  readonly retryable: boolean;
  readonly providerCall?: MarkProviderCallFailedInput;
}

export interface CreateAiWeeklySalesReportSuggestionInput {
  readonly userId: string;
  readonly reportId: string;
  readonly type: AiWeeklySalesReportSuggestionTypeValue;
  readonly suggestionKey: string;
  readonly priority: AiSuggestionPriorityValue;
  readonly title: string;
  readonly body: string;
  readonly reason: string | null;
  readonly targetType: string | null;
  readonly targetId: string | null;
  readonly targetPath: string | null;
  readonly targetLabel: string | null;
  readonly payloadJson: Record<string, unknown>;
}

export interface WeeklyReportJobWorkItem {
  readonly job: AiJobRecord;
  readonly report: AiWeeklySalesReportRecord;
}

export interface AiWeeklySalesReportRepository {
  runInTransaction<T>(
    work: (repository: AiWeeklySalesReportRepository) => Promise<T>
  ): Promise<T>;
  findUserPreferences(
    userId: string
  ): Promise<AiWeeklySalesReportUserPreferencesRecord | null>;
  findGenerationRequestByIdempotencyKey(
    userId: string,
    idempotencyKey: string
  ): Promise<CreateGeneratingReportResult | null>;
  findGeneratingReport(
    userId: string,
    weekStart: Date,
    timeZone: string
  ): Promise<AiWeeklySalesReportRecord | null>;
  createGeneratingReportWithJob(
    input: CreateGeneratingReportInput
  ): Promise<CreateGeneratingReportResult>;
  listReportsForWeek(input: {
    readonly userId: string;
    readonly weekStart: Date;
    readonly timeZone: string;
  }): Promise<AiWeeklySalesReportRecord[]>;
  findReportById(
    userId: string,
    reportId: string
  ): Promise<AiWeeklySalesReportRecord | null>;
  listMeetingNotesForSnapshot(input: {
    readonly userId: string;
    readonly rangeStartAt: Date;
    readonly rangeEndAt: Date;
    readonly limit: number;
  }): Promise<AiWeeklySnapshotMeetingNoteRecord[]>;
  listDealsForSnapshot(input: {
    readonly userId: string;
    readonly weekStart: Date;
    readonly weekEnd: Date;
    readonly limit: number;
  }): Promise<AiWeeklySnapshotDealRecord[]>;
  listPendingWeeklyReportJobs(input: {
    readonly limit: number;
  }): Promise<AiJobRecord[]>;
  startWeeklyReportJob(
    jobId: string,
    startedAt: Date
  ): Promise<WeeklyReportJobWorkItem | null>;
  createProviderCallLog(
    input: CreateProviderCallLogInput
  ): Promise<AiProviderCallLogRecord>;
  completeReportGeneration(input: CompleteReportGenerationInput): Promise<void>;
  failReportGeneration(input: FailReportGenerationInput): Promise<void>;
}
