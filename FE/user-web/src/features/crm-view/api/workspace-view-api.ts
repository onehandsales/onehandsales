import { apiClient } from "@/lib/api-client";
import type {
  WorkspaceViewHeaderResponse, WorkspaceViewsResponse, WorkspaceViewTargetType,
  WorkspaceViewTarget,
} from "../types/workspace-view";

const HEADER_VIEW_TYPES = ["TABLE", "KANBAN", "LIST", "GALLERY", "CALENDAR", "TIMELINE", "GANTT", "CHART", "PIVOT", "MAP", "DASHBOARD"];

// 기능 : 단일·이중·무소속을 보존하면서 공개 대상 요약의 필수 필드를 검사합니다.
function isHeaderTarget(value: unknown) {
  if (value === null) return true;
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const target = value as Partial<WorkspaceViewTarget>;
  return typeof target.id === "string" && Boolean(target.id) && typeof target.name === "string" && (target.icon === null || typeof target.icon === "string");
}

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

// 기능 : 즐겨찾기의 특정 View 헤더를 읽고 다른 View 응답을 거부합니다.
export async function getWorkspaceViewHeaderByViewId(workspaceId: string, viewDefinitionId: string, signal?: AbortSignal) {
  // 1. source 선택은 화면 URL에서 처리하고 이 API에는 두 경로 ID만 전달한다.
  const response = await apiClient<WorkspaceViewHeaderResponse>(
    `/api/users/me/workspaces/${encodeURIComponent(workspaceId)}/view-header/view-definitions/${encodeURIComponent(viewDefinitionId)}`,
    signal ? { signal } : {},
  );
  // 2. 누락된 View를 기본 보기나 다른 선택으로 대체하지 않는다.
  if (typeof response?.viewId !== "string" || response.viewId.toLowerCase() !== viewDefinitionId.toLowerCase() || typeof response.viewName !== "string" ||
    !response.viewType || !HEADER_VIEW_TYPES.includes(response.viewType) || (response.viewIcon !== null && typeof response.viewIcon !== "string") ||
    typeof response.isFavorite !== "boolean" || !isHeaderTarget(response.objectDefinition) || !isHeaderTarget(response.listDefinition))
    throw new Error("View header response mismatch");
  return response;
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
