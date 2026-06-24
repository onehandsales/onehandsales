// 기능 : 딜 생성/수정, 로그 생성/수정 TanStack Query mutation hook
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createDeal,
  createFollowingActionLog,
  createMemoLog,
  deleteDeal,
  exportDealsXlsx,
  updateDeal,
  updateFollowingActionLog,
  updateMemoLog,
} from "@/features/deal/api/deal-api";
import { dealQueryKeys } from "@/features/deal/api/deal-query-keys";
import { scheduleQueryKeys } from "@/features/schedule/api/schedule-query-keys";
import type {
  CreateDealInput,
  CreateFollowingActionLogInput,
  CreateMemoLogInput,
  DealExportParams,
  UpdateDealInput,
  UpdateFollowingActionLogInput,
  UpdateMemoLogInput,
} from "@/features/deal/types/deal";

export function useCreateDealMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateDealInput) => createDeal(input),
    onSuccess: (deal) => {
      void queryClient.invalidateQueries({ queryKey: dealQueryKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: dealQueryKeys.stageCounts() });
      void queryClient.invalidateQueries({ queryKey: dealQueryKeys.detail(deal.id) });
    },
  });
}

export function useUpdateDealMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateDealInput) => updateDeal(input),
    onSuccess: (deal) => {
      void queryClient.invalidateQueries({ queryKey: dealQueryKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: dealQueryKeys.stageCounts() });
      void queryClient.invalidateQueries({ queryKey: dealQueryKeys.detail(deal.id) });
    },
  });
}

export function useDeleteDealMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dealId: string) => deleteDeal(dealId),
    onSuccess: (_data, dealId) => {
      void queryClient.invalidateQueries({ queryKey: dealQueryKeys.lists() });
      void queryClient.invalidateQueries({
        queryKey: [...dealQueryKeys.all, "stage-counts"] as const,
      });
      void queryClient.invalidateQueries({ queryKey: dealQueryKeys.details() });
      void queryClient.invalidateQueries({ queryKey: dealQueryKeys.detail(dealId) });
      void queryClient.invalidateQueries({
        queryKey: scheduleQueryKeys.dealOptions(),
      });
    },
  });
}

export function useCreateFollowingActionLogMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateFollowingActionLogInput) =>
      createFollowingActionLog(input),
    onSuccess: (_log, input) => {
      // 다음 행동 생성 후 목록(nextFollowingAction 갱신)과 로그 목록 invalidate
      void queryClient.invalidateQueries({ queryKey: dealQueryKeys.lists() });
      void queryClient.invalidateQueries({
        queryKey: dealQueryKeys.followingActionLogs(input.dealId),
      });
    },
  });
}

export function useUpdateFollowingActionLogMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateFollowingActionLogInput) =>
      updateFollowingActionLog(input),
    onSuccess: (_log, input) => {
      void queryClient.invalidateQueries({ queryKey: dealQueryKeys.lists() });
      void queryClient.invalidateQueries({
        queryKey: dealQueryKeys.followingActionLogs(input.dealId),
      });
    },
  });
}

export function useCreateMemoLogMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateMemoLogInput) => createMemoLog(input),
    onSuccess: (_log, input) => {
      void queryClient.invalidateQueries({
        queryKey: dealQueryKeys.memoLogs(input.dealId),
      });
    },
  });
}

export function useUpdateMemoLogMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateMemoLogInput) => updateMemoLog(input),
    onSuccess: (_log, input) => {
      void queryClient.invalidateQueries({
        queryKey: dealQueryKeys.memoLogs(input.dealId),
      });
    },
  });
}

export function useExportDealsMutation() {
  return useMutation({
    mutationFn: (params: DealExportParams) => exportDealsXlsx(params),
    onSuccess: (response) => {
      // blob을 파일로 다운로드
      const url = URL.createObjectURL(response.blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = response.fileName ?? `deals_${Date.now()}.xlsx`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
    },
  });
}
