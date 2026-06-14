// 기능 : 딜 상세, 다음 행동 로그, 메모 로그 TanStack Query hook
import { useQuery } from "@tanstack/react-query";
import {
  getDeal,
  listFollowingActionLogs,
  listMemoLogs,
} from "@/features/deal/api/deal-api";
import { dealQueryKeys } from "@/features/deal/api/deal-query-keys";

export function useDealDetail(dealId: string) {
  return useQuery({
    enabled: dealId.length > 0,
    queryKey: dealQueryKeys.detail(dealId),
    queryFn: () => getDeal(dealId),
  });
}

export function useDealFollowingActionLogs(dealId: string) {
  return useQuery({
    enabled: dealId.length > 0,
    queryKey: dealQueryKeys.followingActionLogs(dealId),
    queryFn: () => listFollowingActionLogs(dealId),
  });
}

export function useDealMemoLogs(dealId: string) {
  return useQuery({
    enabled: dealId.length > 0,
    queryKey: dealQueryKeys.memoLogs(dealId),
    queryFn: () => listMemoLogs(dealId),
  });
}
