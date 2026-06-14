import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createSchedule,
  deleteSchedule,
  updateSchedule,
} from "@/features/schedule/api/schedule-api";
import { scheduleQueryKeys } from "@/features/schedule/api/schedule-query-keys";
import type {
  CreateScheduleInput,
  UpdateScheduleInput,
} from "@/features/schedule/types/schedule";

export function useCreateScheduleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateScheduleInput) => createSchedule(input),
    onSuccess: (schedule) => {
      invalidateScheduleQueries(queryClient, schedule.id);
    },
  });
}

export function useUpdateScheduleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateScheduleInput) => updateSchedule(input),
    onSuccess: (schedule) => {
      invalidateScheduleQueries(queryClient, schedule.id);
    },
  });
}

export function useDeleteScheduleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (scheduleId: string) => deleteSchedule(scheduleId),
    onSuccess: (_result, scheduleId) => {
      invalidateScheduleQueries(queryClient, scheduleId);
    },
  });
}

function invalidateScheduleQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  scheduleId: string
) {
  void queryClient.invalidateQueries({ queryKey: scheduleQueryKeys.lists() });
  void queryClient.invalidateQueries({
    queryKey: scheduleQueryKeys.detail(scheduleId),
  });
  void queryClient.invalidateQueries({
    queryKey: scheduleQueryKeys.dealOptions(),
  });
}
