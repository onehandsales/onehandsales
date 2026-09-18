import { useQuery } from "@tanstack/react-query";
import {
  getDefaultSidebarWorkspace,
  getSidebarWorkspace,
  listSidebarWorkspaces,
} from "@/features/workspace/api/sidebar-workspace-api";
import { sidebarWorkspaceQueryKeys } from "@/features/workspace/api/sidebar-workspace-query-keys";

type UseDefaultSidebarWorkspaceQueryOptions = {
  readonly enabled?: boolean;
  readonly userId?: string | null;
};

// 기능 : 현재 사용자가 앱 진입 시 기본으로 열 Workspace 요약 query를 제공합니다.
export function useDefaultSidebarWorkspaceQuery(
  options: UseDefaultSidebarWorkspaceQueryOptions = {}
) {
  const userId = options.userId ?? null;

  return useQuery({
    queryKey: sidebarWorkspaceQueryKeys.default(userId),
    queryFn: getDefaultSidebarWorkspace,
    enabled: (options.enabled ?? true) && Boolean(userId),
    refetchOnMount: "always",
    staleTime: 0,
  });
}

type UseSidebarWorkspaceQueryOptions = {
  readonly enabled?: boolean;
  readonly userId?: string | null;
  readonly workspaceId?: string | null;
};

// 기능 : 현재 사용자가 접근할 수 있는 Workspace 단건 요약 query를 제공합니다.
export function useSidebarWorkspaceQuery(
  options: UseSidebarWorkspaceQueryOptions = {}
) {
  const userId = options.userId ?? null;
  const workspaceId = options.workspaceId ?? null;

  return useQuery({
    queryKey: sidebarWorkspaceQueryKeys.detail(userId, workspaceId),
    queryFn: () => {
      if (!workspaceId) {
        throw new Error("workspaceId is required");
      }

      return getSidebarWorkspace(workspaceId);
    },
    enabled: (options.enabled ?? true) && Boolean(userId && workspaceId),
    refetchOnMount: "always",
    staleTime: 0,
  });
}

type UseSidebarWorkspacesQueryOptions = {
  readonly enabled?: boolean;
  readonly userId?: string | null;
};

// 기능 : 현재 사용자가 사이드바에서 전환할 수 있는 Workspace 목록 query를 제공합니다.
export function useSidebarWorkspacesQuery(
  options: UseSidebarWorkspacesQueryOptions = {}
) {
  const userId = options.userId ?? null;

  return useQuery({
    queryKey: sidebarWorkspaceQueryKeys.list(userId),
    queryFn: listSidebarWorkspaces,
    enabled: (options.enabled ?? true) && Boolean(userId),
    refetchOnMount: "always",
    staleTime: 0,
  });
}
