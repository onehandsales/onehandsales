import { useQuery } from "@tanstack/react-query";
import { listSidebarViewFavorites } from "@/features/view-favorite/api/sidebar-view-favorite-api";
import { sidebarViewFavoriteQueryKeys } from "@/features/view-favorite/api/sidebar-view-favorite-query-keys";

type UseSidebarViewFavoritesQueryOptions = {
  readonly enabled?: boolean;
  readonly userId?: string | null;
  readonly workspaceId?: string | null;
};

// 기능 : 현재 사용자와 Workspace로 분리된 사이드바 즐겨찾기 Query를 제공합니다.
export function useSidebarViewFavoritesQuery(
  options: UseSidebarViewFavoritesQueryOptions = {}
) {
  // 1. 인증 사용자와 Workspace가 확인되면 조회할 수 있도록 범위를 준비한다.
  const userId = options.userId ?? null;
  const workspaceId = options.workspaceId ?? null;

  // 기능 : Workspace가 확정된 요청의 개인 즐겨찾기를 조회합니다.
  function fetchSidebarViewFavorites() {
    if (!workspaceId) {
      throw new Error("workspaceId is required");
    }

    return listSidebarViewFavorites(workspaceId);
  }

  // 2. Object/List와 같은 재조회 정책과 사용자별 캐시 경계를 사용한다.
  return useQuery({
    queryKey: sidebarViewFavoriteQueryKeys.list(userId, workspaceId),
    queryFn: fetchSidebarViewFavorites,
    enabled: (options.enabled ?? true) && Boolean(userId && workspaceId),
    refetchOnMount: "always",
    staleTime: 0,
  });
}
