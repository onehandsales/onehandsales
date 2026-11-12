import { useInfiniteQuery } from "@tanstack/react-query";
import { ApiClientError } from "@/lib/api-client";
import { getViewGroupData } from "../api/view-data-api";
import { viewDataQueryKeys } from "../api/view-data-query-keys";
import type { ViewDataRequest, ViewItemPage, ViewKanbanColumn } from "../types/view-data";

// 기능 : MAIN 카드와 접힌 열의 첫 조회를 열별 페이지 체인으로 연결합니다.
export function useViewKanbanColumn(input: ViewDataRequest, column: ViewKanbanColumn, expanded: boolean) {
  // 기능 : 해당 열의 token·cursor를 유지하고 설정 변경을 MAIN 복구 대상으로 알립니다.
  async function fetchPage({ pageParam, signal }: { readonly pageParam: string | null; readonly signal: AbortSignal }): Promise<ViewItemPage> {
    const response = await getViewGroupData({ ...input, cursor: pageParam, groupToken: column.groupToken }, signal);
    if (response.state !== "READY" || response.data.groupKey !== column.key)
      throw new ApiClientError({ statusCode: 409, code: "ViewDataCursorStale", message: "View column changed", raw: null });
    return response.data;
  }
  return useInfiniteQuery({
    queryKey: [...viewDataQueryKeys.group(input, column.groupToken), input.preview ? JSON.stringify(input.preview) : ""], queryFn: fetchPage,
    initialPageParam: null as string | null,
    ...(!column.isFold ? { initialData: { pages: [{ items: column.items, pageInfo: column.pageInfo }], pageParams: [null as string | null] } } : {}),
    // 기능 : 각 열이 마지막으로 받은 다음 cursor만 이어 읽습니다.
    getNextPageParam(last: ViewItemPage) { return last.pageInfo.hasNextPage ? last.pageInfo.nextCursor ?? undefined : undefined; },
    enabled: expanded && column.isFold, retry: false, staleTime: Infinity, gcTime: 0, refetchOnWindowFocus: false,
  });
}
