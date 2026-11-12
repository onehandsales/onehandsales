import { apiClient } from "@/lib/api-client";
import type { AttributeDefinitionValueType } from "./attribute-definition-api";
export type RecordFormScope = { userId: string; workspaceId: string; objectDefinitionId: string };
export type RecordFormAttribute = { id: string; title: string; type: AttributeDefinitionValueType; isMultiselect: boolean };
export type RecordFormOptions = { items: { id: string; label: string }[]; pageInfo: { hasNextPage: boolean; nextCursor: string | null } };
// 기능 : 사용자와 Workspace/Object별로 입력 폼 캐시를 분리합니다.
export const recordFormQueryKeys = {
  fields: (scope: RecordFormScope) => ["record-form", scope.userId, scope.workspaceId, scope.objectDefinitionId] as const,
  options: (scope: RecordFormScope, attributeId: string, q: string) => ["record-form-options", scope.userId, scope.workspaceId, scope.objectDefinitionId, attributeId, q] as const,
};
// 기능 : 현재 Object의 입력 속성을 읽습니다.
export function getRecordForm(scope: RecordFormScope) {
  return apiClient<{ attributes: RecordFormAttribute[] }>(path(scope));
}
// 기능 : 속성별 선택 후보를 검색하고 같은 검색 범위의 다음 페이지를 읽습니다.
export function getRecordFormOptions(scope: RecordFormScope, attributeDefinitionId: string, q: string, cursor: string | null) {
  const query = new URLSearchParams({ attributeDefinitionId, q });
  if (cursor) query.set("cursor", cursor);
  return apiClient<RecordFormOptions>(`${path(scope)}?${query}`);
}
// 기능 : 폼 API 경로를 같은 Workspace/Object 경계로 구성합니다.
function path(scope: RecordFormScope) {
  return `/api/users/me/workspaces/${encodeURIComponent(scope.workspaceId)}/object-definitions/${encodeURIComponent(scope.objectDefinitionId)}/record-definitions/form`;
}
