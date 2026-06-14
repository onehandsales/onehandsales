import { useQuery } from "@tanstack/react-query";
import {
  getSchedule,
  listScheduleDealOptions,
  listSchedules,
} from "@/features/schedule/api/schedule-api";
import { scheduleQueryKeys } from "@/features/schedule/api/schedule-query-keys";
import type { ScheduleListParams } from "@/features/schedule/types/schedule";

export function useScheduleDealOptions() {
  return useQuery({
    queryKey: scheduleQueryKeys.dealOptions(),
    queryFn: listScheduleDealOptions,
  });
}

export function useScheduleList(params: ScheduleListParams) {
  return useQuery({
    queryKey: scheduleQueryKeys.list(params),
    queryFn: () => listSchedules(params),
  });
}

export function useScheduleDetail(scheduleId: string, enabled: boolean) {
  return useQuery({
    enabled: enabled && scheduleId.length > 0,
    queryKey: scheduleQueryKeys.detail(scheduleId),
    queryFn: () => getSchedule(scheduleId),
  });
}
