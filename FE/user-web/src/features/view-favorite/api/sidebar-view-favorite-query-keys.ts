export const sidebarViewFavoriteQueryKeys = {
  all: ["sidebarViewFavorite"] as const,
  // 기능 : 사용자와 Workspace별 개인 즐겨찾기 캐시를 분리합니다.
  list: (userId: string | null, workspaceId: string | null) =>
    [...sidebarViewFavoriteQueryKeys.all, "list", userId, workspaceId] as const,
};
