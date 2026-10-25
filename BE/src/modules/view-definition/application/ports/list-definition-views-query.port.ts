import type { ViewDefinitionType } from "@/modules/view-definition/application/view-definition-type";

export const LIST_DEFINITION_VIEWS_QUERY = Symbol("LIST_DEFINITION_VIEWS_QUERY");

// 역할 : List 소속 보기 목록을 조회할 Workspace와 대상 경계를 정의합니다.
export interface WorkspaceListViewsQueryInput {
  readonly workspaceId: string;
  readonly listDefinitionId: string;
}

// 역할 : List 보기 선택 메뉴에 필요한 최소 조회 결과를 정의합니다.
export interface ListDefinitionViewRecord {
  readonly id: string;
  readonly name: string;
  readonly icon: string | null;
  readonly type: ViewDefinitionType;
}

// 역할 : List 소속 View의 정렬된 전체 요약을 조회하는 계약을 정의합니다.
export interface ListDefinitionViewsQuery {
  // 기능 : 같은 Workspace와 List에 속한 View 요약을 저장 순서로 조회합니다.
  findWorkspaceListViews(
    input: WorkspaceListViewsQueryInput
  ): Promise<readonly ListDefinitionViewRecord[]>;
}
