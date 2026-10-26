import type { WorkspaceViewTargetType } from "../types/workspace-view";

export const workspaceViewQueryKeys = {
  // 기능 : 사용자와 대상 종류를 포함해 헤더 캐시를 격리합니다.
  header(
    userId: string | null, workspaceId: string | null,
    targetType: WorkspaceViewTargetType | null, targetId: string | null,
  ) {
    return ["crm-view", userId, workspaceId, "header", targetType, targetId] as const;
  },
  // 기능 : 현재 선택까지 포함해 드롭다운 선택 표시 캐시를 격리합니다.
  views(
    userId: string | null, workspaceId: string | null,
    targetType: WorkspaceViewTargetType | null, targetId: string | null,
    viewId: string | null,
  ) {
    return ["crm-view", userId, workspaceId, "views", targetType, targetId, viewId] as const;
  },
};
