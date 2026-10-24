import { useQuery } from "@tanstack/react-query";
import { listSidebarCrmLists } from "@/features/crm-list/api/sidebar-crm-list-api";
import { sidebarCrmListQueryKeys } from "@/features/crm-list/api/sidebar-crm-list-query-keys";

type UseSidebarCrmListsQueryOptions = {
  readonly enabled?: boolean;
  readonly userId?: string | null;
  readonly workspaceId?: string | null;
};

// 기능 : 현재 사용자와 Workspace에 속한 사이드바 업무 목록 Query를 제공합니다.
export function useSidebarCrmListsQuery(
  options: UseSidebarCrmListsQueryOptions = {}
) {
  // 1. 인증 사용자와 Workspace가 확인된 경우에만 조회할 수 있도록 범위를 준비한다.
  const userId = options.userId ?? null;
  const workspaceId = options.workspaceId ?? null;

  // 기능 : Workspace가 확정된 요청에서 업무 목록을 조회합니다.
  function fetchSidebarCrmLists() {
    if (!workspaceId) {
      throw new Error("workspaceId is required");
    }

    return listSidebarCrmLists(workspaceId);
  }

  // 2. 관리 항목과 동일한 재조회 정책을 사용하며 다른 Workspace 데이터를 유지하지 않는다.
  return useQuery({
    queryKey: sidebarCrmListQueryKeys.list(userId, workspaceId),
    queryFn: fetchSidebarCrmLists,
    enabled: (options.enabled ?? true) && Boolean(userId && workspaceId),
    refetchOnMount: "always",
    staleTime: 0,
  });
}
