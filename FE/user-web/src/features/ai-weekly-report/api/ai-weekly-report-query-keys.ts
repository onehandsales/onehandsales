import type { AiWeeklyReportWeekParams } from "@/features/ai-weekly-report/types/ai-weekly-report";

export const aiWeeklyReportQueryKeys = {
  all: ["ai-weekly-report"] as const,
  weeks: () => [...aiWeeklyReportQueryKeys.all, "week"] as const,
  week: (params: AiWeeklyReportWeekParams) =>
    [
      ...aiWeeklyReportQueryKeys.weeks(),
      {
        includeFailed: params.includeFailed ?? true,
        timeZone: params.timeZone ?? "",
        weekStart: params.weekStart,
      },
    ] as const,
  details: () => [...aiWeeklyReportQueryKeys.all, "detail"] as const,
  detail: (reportId: string) =>
    [...aiWeeklyReportQueryKeys.details(), reportId] as const,
  snapshotSummaries: () =>
    [...aiWeeklyReportQueryKeys.all, "snapshot-summary"] as const,
  snapshotSummary: (reportId: string) =>
    [...aiWeeklyReportQueryKeys.snapshotSummaries(), reportId] as const,
};
