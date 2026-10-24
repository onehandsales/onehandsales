export const sidebarCrmListQueryKeys = {
  all: ["sidebarCrmList"] as const,
  // 기능 : 사용자와 Workspace별로 사이드바 업무 목록 캐시를 분리합니다.
  list: (userId: string | null, workspaceId: string | null) =>
    [...sidebarCrmListQueryKeys.all, "list", userId, workspaceId] as const,
};
