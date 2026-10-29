import type { WorkspaceViewTargetType } from "../types/workspace-view";

export const workspaceViewQueryKeys = {
  // 기능 : 쓰기 결과를 요청한 사용자·Workspace의 보기 캐시에만 반영합니다.
  workspace(userId: string | null, workspaceId: string | null) {
    return ["crm-view", userId?.toLowerCase() ?? null, workspaceId?.toLowerCase() ?? null] as const;
  },
  // 기능 : 현재 Workspace에서 같은 View를 표시하는 헤더들의 별표 상태를 갱신합니다.
  headers(userId: string | null, workspaceId: string | null) {
    return ["crm-view", userId?.toLowerCase() ?? null, workspaceId?.toLowerCase() ?? null, "header"] as const;
  },
  // 기능 : 사용자와 대상 종류를 포함해 헤더 캐시를 격리합니다.
  header(
    userId: string | null, workspaceId: string | null,
    targetType: WorkspaceViewTargetType | null, targetId: string | null,
  ) {
    return ["crm-view", userId?.toLowerCase() ?? null, workspaceId?.toLowerCase() ?? null, "header", targetType, targetId?.toLowerCase() ?? null] as const;
  },
  // 기능 : 현재 선택까지 포함해 드롭다운 선택 표시 캐시를 격리합니다.
  views(
    userId: string | null, workspaceId: string | null,
    targetType: WorkspaceViewTargetType | null, targetId: string | null,
    viewDefinitionId: string | null,
  ) {
    return ["crm-view", userId?.toLowerCase() ?? null, workspaceId?.toLowerCase() ?? null, "views", targetType, targetId?.toLowerCase() ?? null, viewDefinitionId?.toLowerCase() ?? null] as const;
  },
};
