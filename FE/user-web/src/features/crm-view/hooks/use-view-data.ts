import { useQuery } from "@tanstack/react-query";
import { getWorkspaceViewData } from "../api/view-data-api";
import { viewDataQueryKeys } from "../api/view-data-query-keys";
import type { ViewDataRequest } from "../types/view-data";

export type ViewDataScope = {
  userId: string;
  workspaceId: string;
  viewId: string;
};
// 기능 : 이전 View 응답을 표시하지 않고 선택된 조회 조건만 요청합니다.
export function useViewData(
  scope: ViewDataScope,
  request: ViewDataRequest,
  enabled = true,
) {
  return useQuery({
    queryKey: viewDataQueryKeys.query(
      scope.userId,
      scope.workspaceId,
      scope.viewId,
      request,
    ),
    queryFn: ({ signal }) =>
      getWorkspaceViewData(scope.workspaceId, scope.viewId, request, signal),
    enabled,
    staleTime: 30_000,
    retry: false,
    refetchOnWindowFocus: false,
  });
}
