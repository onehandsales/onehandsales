export const LIST_DEFINITION_SIDEBAR_QUERY = Symbol(
  "LIST_DEFINITION_SIDEBAR_QUERY"
);

// 역할 : 사이드바 업무 목록에 표시할 List 요약 응답을 정의합니다.
export interface SidebarListDefinitionListItem {
  readonly id: string;
  readonly icon: string | null;
  readonly name: string;
}

// 역할 : Workspace에 속한 사이드바 업무 목록의 조회 계약을 정의합니다.
export interface ListDefinitionSidebarQuery {
  // 기능 : 특정 Workspace의 List 요약 목록을 생성순으로 조회합니다.
  listSidebarListDefinitions(
    workspaceId: string
  ): Promise<SidebarListDefinitionListItem[]>;
}
