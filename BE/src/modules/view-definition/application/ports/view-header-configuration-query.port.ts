import type { ViewContentSummary, ViewFilterRows, ViewHeaderDefinition, ViewHeaderScope, ViewSettingsRows, ViewSortRow } from "../view-header-configuration";

export const VIEW_HEADER_CONFIGURATION_QUERY = Symbol("VIEW_HEADER_CONFIGURATION_QUERY");
export const VIEW_HEADER_CLOCK = Symbol("VIEW_HEADER_CLOCK");

// 역할 : View 소유 설정과 직접 원본 요약의 읽기 계약을 정의합니다.
export interface ViewHeaderConfigurationQuery {
  // 기능 : 선택 View를 Workspace 범위 안에서 조회합니다.
  findView(scope: ViewHeaderScope): Promise<ViewHeaderDefinition | null>;
  // 기능 : 해당 View의 필터 그룹과 조건만 조회합니다.
  findFilters(scope: ViewHeaderScope): Promise<ViewFilterRows>;
  // 기능 : 해당 View의 정렬 조건만 조회합니다.
  findSorts(scope: ViewHeaderScope): Promise<ViewSortRow[]>;
  // 기능 : 해당 View의 표시·그룹·위젯 설정만 조회합니다.
  findSettings(scope: ViewHeaderScope): Promise<ViewSettingsRows>;
  // 기능 : 같은 Workspace의 직접 원본 요약을 일괄 조회합니다.
  findContentViews(workspaceId: string, ids: string[]): Promise<ViewContentSummary[]>;
}
