import { apiClient } from "@/lib/api-client";
import type {
  WorkspaceViewHeaderResponse, WorkspaceViewsResponse, WorkspaceViewTargetType,
} from "../types/workspace-view";

// 기능 : 사이드바에서 선택한 대상의 초기 헤더를 기존 인증 흐름으로 조회합니다.
export function getWorkspaceViewHeader(
  workspaceId: string, targetType: WorkspaceViewTargetType, targetId: string,
  signal?: AbortSignal,
) {
  // 1. View ID를 요구하지 않는 대상 Query를 구성한다.
  const query = new URLSearchParams({ targetType, targetId });
  return apiClient<WorkspaceViewHeaderResponse>(
    `/api/users/me/workspaces/${encodeURIComponent(workspaceId)}/view-header?${query}`,
    signal ? { signal } : {},
  );
}

// 기능 : 관리항목의 전체 View와 현재 선택 표시를 조회합니다.
export function listWorkspaceObjectViews(
  workspaceId: string, objectDefinitionId: string, viewDefinitionId: string | null,
  signal?: AbortSignal,
) {
  // 1. 선택한 View가 없으면 query를 생략하고 Object 범위만 전달한다.
  const query = viewDefinitionId ? "?" + new URLSearchParams({ viewDefinitionId }) : "";
  return apiClient<WorkspaceViewsResponse>(
    `/api/users/me/workspaces/${encodeURIComponent(workspaceId)}/view-header/object-definitions/${encodeURIComponent(objectDefinitionId)}/view-definitions${query}`,
    signal ? { signal } : {},
  );
}

// 기능 : 업무목록의 전체 View와 현재 선택 표시를 조회합니다.
export function listWorkspaceListViews(
  workspaceId: string, listDefinitionId: string, viewDefinitionId: string | null,
  signal?: AbortSignal,
) {
  // 1. 선택한 View가 없으면 query를 생략하고 List 범위만 전달한다.
  const query = viewDefinitionId ? "?" + new URLSearchParams({ viewDefinitionId }) : "";
  return apiClient<WorkspaceViewsResponse>(
    `/api/users/me/workspaces/${encodeURIComponent(workspaceId)}/view-header/list-definitions/${encodeURIComponent(listDefinitionId)}/view-definitions${query}`,
    signal ? { signal } : {},
  );
}
