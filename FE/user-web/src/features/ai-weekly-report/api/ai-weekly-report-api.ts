import type {
  AiWeeklyReportDetail,
  AiWeeklyReportGenerationResponse,
  AiWeeklyReportSnapshotSummary,
  AiWeeklyReportWeekParams,
  AiWeeklyReportWeekResponse,
  CreateAiWeeklyReportInput,
} from "@/features/ai-weekly-report/types/ai-weekly-report";
import { apiClient } from "@/lib/api-client";

export function createAiWeeklyReport(input: CreateAiWeeklyReportInput) {
  return apiClient<AiWeeklyReportGenerationResponse>(
    "/api/sales-reports/weekly",
    {
      body: compactBody({
        locale: input.locale,
        timeZone: input.timeZone,
        weekStart: input.weekStart,
      }),
      headers: input.idempotencyKey
        ? { "Idempotency-Key": input.idempotencyKey }
        : undefined,
      method: "POST",
    }
  );
}

export function getAiWeeklyReportWeek(params: AiWeeklyReportWeekParams) {
  const query = toWeekSearchParams(params);

  return apiClient<AiWeeklyReportWeekResponse>(
    `/api/sales-reports/weekly?${query.toString()}`
  );
}

export function getAiWeeklyReport(reportId: string) {
  return apiClient<AiWeeklyReportDetail>(
    `/api/sales-reports/weekly/${reportId}`
  );
}

export function getAiWeeklyReportSnapshotSummary(reportId: string) {
  return apiClient<AiWeeklyReportSnapshotSummary>(
    `/api/sales-reports/weekly/${reportId}/snapshot-summary`
  );
}

function toWeekSearchParams(params: AiWeeklyReportWeekParams) {
  const searchParams = new URLSearchParams();
  searchParams.set("weekStart", params.weekStart);

  if (params.timeZone) {
    searchParams.set("timeZone", params.timeZone);
  }

  if (params.includeFailed !== undefined) {
    searchParams.set("includeFailed", String(params.includeFailed));
  }

  return searchParams;
}

function compactBody(input: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(input).filter(([, value]) => value !== undefined)
  );
}
