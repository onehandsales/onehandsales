import { apiClient } from "@/lib/api-client";
import type { ViewConfigurationCommand, ViewConfigurationOptionsResponse, ViewConfigurationResponse, ViewConfigurationScope } from "../types/view-configuration";
import type { ViewReference } from "../types/view-menu";

// 기능 : View 설정 API의 인증된 경로를 구성합니다.
function path(scope: ViewConfigurationScope) { return `/api/users/me/workspaces/${encodeURIComponent(scope.workspaceId)}/view-definitions/${encodeURIComponent(scope.viewDefinitionId)}/configuration`; }
// 기능 : 응답이 요청 당시 View에 속하는지 확인합니다.
function checked(scope: ViewConfigurationScope, result: ViewConfigurationResponse) {
  if (!result.configurationVersion || [result.filters, result.sorts, result.settings].some(menu => menu.viewDefinitionId.toLowerCase() !== scope.viewDefinitionId.toLowerCase())) throw new Error("View configuration response mismatch");
  return result;
}
// 기능 : 하나의 버전으로 묶인 저장 설정과 편집 후보를 읽습니다.
export async function getViewConfiguration(scope: ViewConfigurationScope, signal: AbortSignal) {
  return checked(scope, await apiClient<ViewConfigurationResponse>(`${path(scope)}?sourceType=${scope.sourceType}`, { signal }));
}
// 기능 : 사용자가 변경한 section을 같은 요청으로 저장합니다.
export async function updateViewConfiguration(scope: ViewConfigurationScope, command: ViewConfigurationCommand) {
  return checked(scope, await apiClient<ViewConfigurationResponse>(`${path(scope)}?sourceType=${scope.sourceType}`, { method: "PATCH", body: JSON.stringify(command) }));
}
// 기능 : 원본과 속성 경로에 맞는 선택 후보를 검색합니다.
export function getViewConfigurationOptions(scope: ViewConfigurationScope, reference: ViewReference, q: string, cursor: string | null, signal: AbortSignal) {
  const query = new URLSearchParams({ sourceType: scope.sourceType, sourceScope: reference.sourceScope, attributeDefinitionId: reference.attributeDefinitionId, q, limit: "25" });
  if (reference.referenceAttributeIdPathJson.length) query.set("referenceAttributeIdPath", reference.referenceAttributeIdPathJson.join(","));
  if (cursor) query.set("cursor", cursor);
  return apiClient<ViewConfigurationOptionsResponse>(`${path(scope)}/options?${query}`, { signal });
}
