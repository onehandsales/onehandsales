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
import { trashQueryKeys } from "@/features/trash/query-keys";

// 기능 : 일정 생성 mutation 훅을 제공합니다.
export function useCreateScheduleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateScheduleInput) => createSchedule(input),
    onSuccess: (schedule) => {
      invalidateScheduleQueries(queryClient, schedule.id);
    },
  });
}

// 기능 : 일정 수정 mutation 훅을 제공합니다.
export function useUpdateScheduleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateScheduleInput) => updateSchedule(input),
    onSuccess: (schedule) => {
      invalidateScheduleQueries(queryClient, schedule.id);
    },
  });
}

// 기능 : 일정 삭제 mutation 훅을 제공합니다.
export function useDeleteScheduleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (scheduleId: string) => deleteSchedule(scheduleId),
    onSuccess: (_result, scheduleId) => {
      invalidateScheduleQueries(queryClient, scheduleId);
    },
  });
}

// 기능 : Google Calendar 연결 시작 mutation 훅을 제공합니다.
export function useStartGoogleCalendarConnectMutation() {
  return useMutation({
    mutationFn: (input: StartGoogleCalendarConnectInput) =>
      startGoogleCalendarConnect(input),
  });
}

// 기능 : 일정 수정 mutation 훅을 제공합니다.
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

// 기능 : Google Calendar 동기화 mutation 훅을 제공합니다.
export function useSyncGoogleCalendarMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: SyncGoogleCalendarInput) => syncGoogleCalendar(input),
    onSuccess: () => {
      invalidateGoogleCalendarQueries(queryClient);
    },
  });
}

// 기능 : Google Calendar 연결 해제 mutation 훅을 제공합니다.
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

// 기능 : 일정 관련 쿼리 캐시를 무효화합니다.
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

// 기능 : Google Calendar 관련 쿼리 캐시를 무효화합니다.
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
