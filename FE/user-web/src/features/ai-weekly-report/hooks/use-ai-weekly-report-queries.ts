import { useQuery } from "@tanstack/react-query";
import {
  getAiWeeklyReport,
  getAiWeeklyReportSnapshotSummary,
  getAiWeeklyReportWeek,
} from "@/features/ai-weekly-report/api/ai-weekly-report-api";
import { aiWeeklyReportQueryKeys } from "@/features/ai-weekly-report/api/ai-weekly-report-query-keys";
import type { AiWeeklyReportWeekParams } from "@/features/ai-weekly-report/types/ai-weekly-report";

const POLLING_INTERVAL_MS = 3000;

export function useAiWeeklyReportWeek(params: AiWeeklyReportWeekParams) {
  return useQuery({
    queryKey: aiWeeklyReportQueryKeys.week(params),
    queryFn: () => getAiWeeklyReportWeek(params),
    refetchInterval: (query) =>
      query.state.data?.generatingReport ? POLLING_INTERVAL_MS : false,
  });
}

export function useAiWeeklyReportDetail(
  reportId: string | null,
  options: { readonly enabled?: boolean; readonly shouldPoll?: boolean } = {}
) {
  const resolvedReportId = reportId ?? "";

  return useQuery({
    enabled: Boolean(reportId) && (options.enabled ?? true),
    queryKey: aiWeeklyReportQueryKeys.detail(resolvedReportId),
    queryFn: () => getAiWeeklyReport(resolvedReportId),
    refetchInterval: options.shouldPoll ? POLLING_INTERVAL_MS : false,
  });
}

export function useAiWeeklyReportSnapshotSummary(
  reportId: string | null,
  enabled: boolean
) {
  const resolvedReportId = reportId ?? "";

  return useQuery({
    enabled: Boolean(reportId) && enabled,
    queryKey: aiWeeklyReportQueryKeys.snapshotSummary(resolvedReportId),
    queryFn: () => getAiWeeklyReportSnapshotSummary(resolvedReportId),
  });
}
