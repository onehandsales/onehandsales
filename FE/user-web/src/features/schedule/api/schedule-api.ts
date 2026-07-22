import type {
  CreateScheduleInput,
  Schedule,
  ScheduleDealOptionListResponse,
  ScheduleDetail,
  ScheduleListParams,
  ScheduleListResponse,
  UpdateScheduleInput,
  WeeklyScheduleReportParams,
  WeeklyScheduleReportResponse,
} from "@/features/schedule/types/schedule";
import { apiBlobClient, apiClient } from "@/lib/api-client";

export function listScheduleDealOptions() {
  return apiClient<ScheduleDealOptionListResponse>("/api/schedules/deal-options");
}

export function listSchedules(params: ScheduleListParams) {
  const query = toScheduleListSearchParams(params);

  return apiClient<ScheduleListResponse>(`/api/schedules?${query.toString()}`);
}

export function listWeeklyScheduleReport(params: WeeklyScheduleReportParams) {
  const query = toWeeklyScheduleReportSearchParams(params);

  return apiClient<WeeklyScheduleReportResponse>(
    `/api/schedules/week?${query.toString()}`
  );
}

export function downloadWeeklyScheduleReportXlsx(
  params: WeeklyScheduleReportParams
) {
  const query = toWeeklyScheduleReportSearchParams(params);

  return apiBlobClient(`/api/schedules/week/export/xlsx?${query.toString()}`);
}

export function createSchedule(input: CreateScheduleInput) {
  return apiClient<Schedule>("/api/schedules", {
    method: "POST",
    body: compactBody(input),
  });
}

export function getSchedule(scheduleId: string) {
  return apiClient<ScheduleDetail>(`/api/schedules/${scheduleId}`);
}

export function updateSchedule(input: UpdateScheduleInput) {
  return apiClient<Schedule>(`/api/schedules/${input.scheduleId}`, {
    method: "PATCH",
    body: compactBody({
      scheduleTitle: input.scheduleTitle,
      startAt: input.startAt,
      endAt: input.endAt,
      timeZone: input.timeZone,
      location: input.location,
      memo: input.memo,
      dealIds: input.dealIds,
    }),
  });
}

export async function deleteSchedule(scheduleId: string) {
  await apiClient<void>(`/api/schedules/${scheduleId}`, {
    method: "DELETE",
  });
}

function toScheduleListSearchParams(params: ScheduleListParams) {
  const searchParams = new URLSearchParams();
  searchParams.set("view", params.view);
  searchParams.set("baseDate", params.baseDate);

  if (params.timeZone) {
    searchParams.set("timeZone", params.timeZone);
  }

  return searchParams;
}

function toWeeklyScheduleReportSearchParams(
  params: WeeklyScheduleReportParams
) {
  const searchParams = new URLSearchParams();
  searchParams.set("weekStart", params.weekStart);

  if (params.timeZone) {
    searchParams.set("timeZone", params.timeZone);
  }

  return searchParams;
}

function compactBody(input: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(input).filter(([, value]) => value !== undefined)
  );
}
