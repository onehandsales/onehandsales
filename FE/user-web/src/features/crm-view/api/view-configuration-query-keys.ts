import type { ViewConfigurationScope } from "../types/view-configuration";
import type { ViewFilterCondition } from "../types/view-menu";
import { workspaceViewQueryKeys } from "./workspace-view-query-keys";

export const viewConfigurationQueryKeys = {
  // 기능 : 원본 선택이 달라도 같은 보기의 설정 캐시를 함께 갱신합니다.
  view(userId: string | null, workspaceId: string | null, viewDefinitionId: string | null) {
    return [...workspaceViewQueryKeys.workspace(userId, workspaceId), "configuration", viewDefinitionId?.toLowerCase() ?? null] as const;
  },
  // 기능 : 사용자·Workspace·보기·원본별 저장 기준을 격리합니다.
  detail(scope: ViewConfigurationScope | null) {
    return [...this.view(scope?.userId ?? null, scope?.workspaceId ?? null, scope?.viewDefinitionId ?? null), scope?.sourceType ?? null] as const;
  },
  // 기능 : 옵션 검색을 속성 소속·참조 경로와 검색어별로 분리합니다.
  options(scope: ViewConfigurationScope, condition: ViewFilterCondition, search: string) {
    return [...workspaceViewQueryKeys.workspace(scope.userId, scope.workspaceId), "configuration-options", scope.viewDefinitionId.toLowerCase(), scope.sourceType,
      condition.sourceScope, condition.attributeDefinitionId.toLowerCase(), condition.referenceAttributeIdPathJson, search] as const;
  },
};
