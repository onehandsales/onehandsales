import type { ScheduleListParams } from "@/features/schedule/types/schedule";

export const scheduleQueryKeys = {
  all: ["schedule"] as const,
  dealOptions: () => [...scheduleQueryKeys.all, "deal-options"] as const,
  lists: () => [...scheduleQueryKeys.all, "list"] as const,
  list: (params: ScheduleListParams) =>
    [
      ...scheduleQueryKeys.lists(),
      {
        view: params.view,
        baseDate: params.baseDate,
        timeZone: params.timeZone ?? "",
      },
    ] as const,
  details: () => [...scheduleQueryKeys.all, "detail"] as const,
  detail: (scheduleId: string) =>
    [...scheduleQueryKeys.details(), scheduleId] as const,
};
