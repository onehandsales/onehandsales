import type {
  ScheduleListParams,
  WeeklyScheduleReportParams,
} from "@/features/schedule/types/schedule";

export const scheduleQueryKeys = {
  all: ["schedule"] as const,
  dealOptions: () => [...scheduleQueryKeys.all, "deal-options"] as const,
  google: () => [...scheduleQueryKeys.all, "google"] as const,
  googleStatus: () => [...scheduleQueryKeys.google(), "status"] as const,
  googleCalendars: () => [...scheduleQueryKeys.google(), "calendars"] as const,
  lists: () => [...scheduleQueryKeys.all, "list"] as const,
  list: (params: ScheduleListParams) =>
    [
      ...scheduleQueryKeys.lists(),
      {
        view: params.view,
        baseDate: params.baseDate,
        timeZone: params.timeZone ?? "",
        visibility: params.visibility ?? "ACTIVE",
        sourceType: params.sourceType ?? "ALL",
      },
    ] as const,
  weeklyReports: () => [...scheduleQueryKeys.all, "weekly-report"] as const,
  weeklyReport: (params: WeeklyScheduleReportParams) =>
    [
      ...scheduleQueryKeys.weeklyReports(),
      {
        weekStart: params.weekStart,
        timeZone: params.timeZone ?? "",
      },
    ] as const,
  details: () => [...scheduleQueryKeys.all, "detail"] as const,
  detail: (scheduleId: string) =>
    [...scheduleQueryKeys.details(), scheduleId] as const,
};
