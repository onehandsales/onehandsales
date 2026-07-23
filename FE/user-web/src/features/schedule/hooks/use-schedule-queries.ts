import { useQuery } from "@tanstack/react-query";
import {
  getGoogleCalendarStatus,
  getSchedule,
  listGoogleCalendars,
  listWeeklyScheduleReport,
  listScheduleDealOptions,
  listSchedules,
} from "@/features/schedule/api/schedule-api";
import { scheduleQueryKeys } from "@/features/schedule/api/schedule-query-keys";
import type {
  ScheduleListParams,
  WeeklyScheduleReportParams,
} from "@/features/schedule/types/schedule";

export function useScheduleDealOptions() {
  return useQuery({
    queryKey: scheduleQueryKeys.dealOptions(),
    queryFn: listScheduleDealOptions,
  });
}

export function useGoogleCalendarStatus() {
  return useQuery({
    queryKey: scheduleQueryKeys.googleStatus(),
    queryFn: getGoogleCalendarStatus,
  });
}

export function useGoogleCalendars(enabled = true) {
  return useQuery({
    enabled,
    queryKey: scheduleQueryKeys.googleCalendars(),
    queryFn: listGoogleCalendars,
  });
}

export function useScheduleList(params: ScheduleListParams) {
  return useQuery({
    queryKey: scheduleQueryKeys.list(params),
    queryFn: () => listSchedules(params),
  });
}

export function useWeeklyScheduleReport(params: WeeklyScheduleReportParams) {
  return useQuery({
    queryKey: scheduleQueryKeys.weeklyReport(params),
    queryFn: () => listWeeklyScheduleReport(params),
  });
}

export function useScheduleDetail(scheduleId: string, enabled: boolean) {
  return useQuery({
    enabled: enabled && scheduleId.length > 0,
    queryKey: scheduleQueryKeys.detail(scheduleId),
    queryFn: () => getSchedule(scheduleId),
  });
}
