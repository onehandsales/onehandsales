// 기능 : 딜 상세, 다음 행동 로그, 메모 로그 TanStack Query hook
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
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
  return useInfiniteQuery({
    enabled: dealId.length > 0,
    queryKey: dealQueryKeys.followingActionLogs(dealId),
    queryFn: ({ pageParam }) =>
      listFollowingActionLogs(dealId, pageParam ?? undefined),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
}

export function useDealMemoLogs(dealId: string) {
  return useInfiniteQuery({
    enabled: dealId.length > 0,
    queryKey: dealQueryKeys.memoLogs(dealId),
    queryFn: ({ pageParam }) => listMemoLogs(dealId, pageParam ?? undefined),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
}
