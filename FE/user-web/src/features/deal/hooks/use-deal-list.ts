// 기능 : 딜 목록 및 단계별 개수 TanStack Query hook
import { useQuery } from "@tanstack/react-query";
import {
  getDealStageCounts,
  listDeals,
} from "@/features/deal/api/deal-api";
import { dealQueryKeys } from "@/features/deal/api/deal-query-keys";
import type {
  DealListParams,
  DealStageCountParams,
} from "@/features/deal/types/deal";

export function useDealStageCounts(params: DealStageCountParams = {}) {
  return useQuery({
    queryKey: dealQueryKeys.stageCounts(params),
    queryFn: () => getDealStageCounts(params),
  });
}

export function useDealList(params: DealListParams) {
  return useQuery({
    queryKey: dealQueryKeys.list(params),
    queryFn: () => listDeals(params),
  });
}
