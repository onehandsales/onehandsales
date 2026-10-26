export const sidebarViewFavoriteQueryKeys = {
  all: ["sidebarViewFavorite"] as const,
  // 기능 : 사용자와 Workspace별 개인 즐겨찾기 캐시를 UUID 대소문자와 무관하게 분리합니다.
  list: (userId: string | null, workspaceId: string | null) =>
    [...sidebarViewFavoriteQueryKeys.all, "list", userId?.toLowerCase() ?? null, workspaceId?.toLowerCase() ?? null] as const,
};
