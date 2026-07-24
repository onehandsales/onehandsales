export type AiWeeklyReportStatus = "GENERATING" | "READY" | "FAILED";

export type AiWeeklyReportPriority = "LOW" | "MEDIUM" | "HIGH";

export type AiWeeklyReportTargetType =
  | "COMPANY"
  | "CONTACT"
  | "DEAL"
  | "MEETING_NOTE"
  | "PRODUCT"
  | "SCHEDULE"
  | string;

export type CreateAiWeeklyReportRequest = {
  readonly weekStart: string;
  readonly timeZone?: string;
  readonly locale?: string;
};

export type CreateAiWeeklyReportInput = CreateAiWeeklyReportRequest & {
  readonly idempotencyKey?: string;
};

export type AiWeeklyReportWeekParams = {
  readonly weekStart: string;
  readonly timeZone?: string;
  readonly includeFailed?: boolean;
};

export type AiWeeklyReportSummary = {
  readonly id: string;
  readonly weekStart: string;
  readonly weekEnd: string;
  readonly timeZone: string;
  readonly locale: string;
  readonly version: number;
  readonly status: AiWeeklyReportStatus;
  readonly requestedAt: string;
  readonly generatedAt: string | null;
  readonly failedAt: string | null;
  readonly summaryPreview?: string | null;
  readonly safeErrorCode?: string | null;
  readonly safeErrorMessage?: string | null;
};

export type AiWeeklyReportGenerationResponse = {
  readonly report: AiWeeklyReportSummary;
  readonly job: {
    readonly id: string;
    readonly status: string;
  };
};

export type AiWeeklyReportWeekResponse = {
  readonly weekStart: string;
  readonly weekEnd: string;
  readonly timeZone: string;
  readonly latestSuccessfulReport: AiWeeklyReportSummary | null;
  readonly generatingReport: AiWeeklyReportSummary | null;
  readonly versions: readonly AiWeeklyReportSummary[];
  readonly failedVersionCount: number;
  readonly failedVersions: readonly AiWeeklyReportSummary[];
};

export type AiWeeklyReportDataCoverage = {
  readonly scheduleCount?: number;
  readonly dealCount?: number;
  readonly meetingNoteCount?: number;
  readonly linkedDealCount?: number;
  readonly missingSignals?: readonly string[];
};

export type AiWeeklyReportSuggestion = {
  readonly id?: string | null;
  readonly sourceSuggestionId?: string | null;
  readonly suggestionKey?: string | null;
  readonly key: string;
  readonly priority: AiWeeklyReportPriority;
  readonly title: string;
  readonly body: string;
  readonly reason?: string | null;
  readonly targetType?: AiWeeklyReportTargetType | null;
  readonly targetId?: string | null;
  readonly targetPath?: string | null;
  readonly targetLabel?: string | null;
  readonly payload?: Record<string, unknown>;
};

export type AiWeeklyReportSections = {
  readonly executiveSummary?: {
    readonly headline: string;
    readonly narrative: string;
    readonly wins: readonly string[];
    readonly concerns: readonly string[];
  };
  readonly pipelineSummary?: {
    readonly narrative: string;
    readonly totalDealCost: number;
    readonly statusCounts: readonly {
      readonly status: string;
      readonly count: number;
    }[];
  };
  readonly riskSignals?: readonly AiWeeklyReportSuggestion[];
  readonly nextWeekActions?: readonly AiWeeklyReportSuggestion[];
  readonly followUpDrafts?: readonly AiWeeklyReportSuggestion[];
  readonly dataCleanupSuggestions?: readonly AiWeeklyReportSuggestion[];
  readonly dataCoverage?: AiWeeklyReportDataCoverage;
};

export type AiWeeklyReportDetail = AiWeeklyReportSummary & {
  readonly safeErrorCode: string | null;
  readonly safeErrorMessage: string | null;
  readonly sections: AiWeeklyReportSections | null;
  readonly dataCoverage: AiWeeklyReportDataCoverage;
};

export type AiWeeklyReportSnapshotCounts = {
  readonly schedules?: number;
  readonly deals?: number;
  readonly meetingNotes?: number;
  readonly linkedDeals?: number;
  readonly [key: string]: number | undefined;
};

export type AiWeeklyReportSnapshotSchedule = {
  readonly id: string | null;
  readonly scheduleTitle: string | null;
  readonly startAt: string | null;
  readonly endAt: string | null;
  readonly sourceType: string | null;
  readonly hasMemo: boolean;
  readonly dealCount: number;
};

export type AiWeeklyReportSnapshotDeal = {
  readonly id: string | null;
  readonly dealName: string | null;
  readonly dealStatus: string | null;
  readonly dealCost: number;
  readonly expectedEndDate: string | null;
  readonly companyCount: number;
  readonly contactCount: number;
  readonly nextActionCount: number;
};

export type AiWeeklyReportSnapshotMeetingNote = {
  readonly id: string | null;
  readonly title: string | null;
  readonly meetingAt: string | null;
  readonly sourceType: string | null;
  readonly hasDetails: boolean;
  readonly hasNextPlan: boolean;
  readonly hasRequiredAction: boolean;
  readonly linkedDealCount: number;
};

export type AiWeeklyReportSnapshotSummary = {
  readonly reportId: string;
  readonly snapshotSchemaVersion: string;
  readonly capturedAt: string | null;
  readonly counts: AiWeeklyReportSnapshotCounts;
  readonly records: {
    readonly schedules: readonly AiWeeklyReportSnapshotSchedule[];
    readonly deals: readonly AiWeeklyReportSnapshotDeal[];
    readonly meetingNotes: readonly AiWeeklyReportSnapshotMeetingNote[];
  };
  readonly excluded: readonly string[];
};
