import { useQuery } from "@tanstack/react-query";
import { listSidebarCrmObjects } from "@/features/crm-object/api/sidebar-crm-object-api";
import { sidebarCrmObjectQueryKeys } from "@/features/crm-object/api/sidebar-crm-object-query-keys";

type UseSidebarCrmObjectsQueryOptions = {
  readonly enabled?: boolean;
  readonly userId?: string | null;
  readonly workspaceId?: string | null;
};

// 기능 : 현재 Workspace의 사이드바 관리 항목 목록 query를 제공합니다.
export function useSidebarCrmObjectsQuery(
  options: UseSidebarCrmObjectsQueryOptions = {}
) {
  // 1. 이후 단계에서 사용할 userId 값을 준비한다.
  const userId = options.userId ?? null;
  // 2. 이후 단계에서 사용할 workspaceId 값을 준비한다.
  const workspaceId = options.workspaceId ?? null;

  // 3. 계산된 query 설정을 호출자에게 반환한다.
  return useQuery({
    queryKey: sidebarCrmObjectQueryKeys.list(userId, workspaceId),
    queryFn: () => {
      if (!workspaceId) {
        throw new Error("workspaceId is required");
      }

      return listSidebarCrmObjects(workspaceId);
    },
    enabled: (options.enabled ?? true) && Boolean(userId && workspaceId),
    refetchOnMount: "always",
    staleTime: 0,
  });
}
