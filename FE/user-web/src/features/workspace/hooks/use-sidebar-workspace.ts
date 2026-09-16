import { useQuery } from "@tanstack/react-query";
import { getDefaultSidebarWorkspace } from "@/features/workspace/api/sidebar-workspace-api";
import { sidebarWorkspaceQueryKeys } from "@/features/workspace/api/sidebar-workspace-query-keys";

type UseDefaultSidebarWorkspaceQueryOptions = {
  readonly enabled?: boolean;
};

// 기능 : 현재 사용자가 앱 진입 시 기본으로 열 Workspace 요약 query를 제공합니다.
export function useDefaultSidebarWorkspaceQuery(
  options: UseDefaultSidebarWorkspaceQueryOptions = {}
) {
  return useQuery({
    queryKey: sidebarWorkspaceQueryKeys.default(),
    queryFn: getDefaultSidebarWorkspace,
    enabled: options.enabled ?? true,
  });
}
