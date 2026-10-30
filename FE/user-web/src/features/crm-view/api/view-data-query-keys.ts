import type { ViewDataRequest } from "../types/view-data";
export const viewDataQueryKeys = {
  all: ["crm-view-data"] as const,
  // 기능 : 사용자·Workspace·View·모든 조회 조건을 캐시 경계에 포함합니다.
  query: (
    userId: string,
    workspaceId: string,
    viewId: string,
    request: ViewDataRequest,
  ) => ["crm-view-data", userId, workspaceId, viewId, request] as const,
};
