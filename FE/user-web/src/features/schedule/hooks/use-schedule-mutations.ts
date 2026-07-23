import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createSchedule,
  deleteSchedule,
  disconnectGoogleCalendar,
  startGoogleCalendarConnect,
  syncGoogleCalendar,
  updateSchedule,
  updateGoogleCalendarSelection,
} from "@/features/schedule/api/schedule-api";
import { scheduleQueryKeys } from "@/features/schedule/api/schedule-query-keys";
import type {
  CreateScheduleInput,
  DisconnectGoogleCalendarInput,
  StartGoogleCalendarConnectInput,
  SyncGoogleCalendarInput,
  UpdateScheduleInput,
  UpdateGoogleCalendarSelectionInput,
} from "@/features/schedule/types/schedule";
import { trashQueryKeys } from "@/features/trash/api/trash-query-keys";

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

export function useStartGoogleCalendarConnectMutation() {
  return useMutation({
    mutationFn: (input: StartGoogleCalendarConnectInput) =>
      startGoogleCalendarConnect(input),
  });
}

export function useUpdateGoogleCalendarSelectionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateGoogleCalendarSelectionInput) =>
      updateGoogleCalendarSelection(input),
    onSuccess: () => {
      invalidateGoogleCalendarQueries(queryClient);
    },
  });
}

export function useSyncGoogleCalendarMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: SyncGoogleCalendarInput) => syncGoogleCalendar(input),
    onSuccess: () => {
      invalidateGoogleCalendarQueries(queryClient);
    },
  });
}

export function useDisconnectGoogleCalendarMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: DisconnectGoogleCalendarInput) =>
      disconnectGoogleCalendar(input),
    onSuccess: () => {
      invalidateGoogleCalendarQueries(queryClient);
      void queryClient.invalidateQueries({ queryKey: trashQueryKeys.lists() });
    },
  });
}

function invalidateScheduleQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  scheduleId: string
) {
  void queryClient.invalidateQueries({ queryKey: scheduleQueryKeys.lists() });
  void queryClient.invalidateQueries({
    queryKey: scheduleQueryKeys.weeklyReports(),
  });
  void queryClient.invalidateQueries({
    queryKey: scheduleQueryKeys.detail(scheduleId),
  });
  void queryClient.invalidateQueries({
    queryKey: trashQueryKeys.lists(),
  });
  void queryClient.invalidateQueries({
    queryKey: scheduleQueryKeys.dealOptions(),
  });
}

function invalidateGoogleCalendarQueries(
  queryClient: ReturnType<typeof useQueryClient>
) {
  void queryClient.invalidateQueries({ queryKey: scheduleQueryKeys.google() });
  void queryClient.invalidateQueries({ queryKey: scheduleQueryKeys.lists() });
  void queryClient.invalidateQueries({
    queryKey: scheduleQueryKeys.weeklyReports(),
  });
  void queryClient.invalidateQueries({ queryKey: scheduleQueryKeys.details() });
}
