export const OBJECT_DEFINITION_SIDEBAR_QUERY = Symbol(
  "OBJECT_DEFINITION_SIDEBAR_QUERY"
);

// 역할 : SidebarObjectDefinitionListItem 사이드바 Items 섹션에 표시할 ObjectDefinition 요약을 정의합니다.
export interface SidebarObjectDefinitionListItem {
  readonly id: string;
  readonly icon: string | null;
  readonly singularName: string;
  readonly pluralName: string;
}

// 역할 : ObjectDefinitionSidebarQuery가 사이드바용 ObjectDefinition 조회 계약을 정의합니다.
export interface ObjectDefinitionSidebarQuery {
  // 기능 : 특정 Workspace에 속한 ObjectDefinition 요약 목록을 조회합니다.
  listSidebarObjectDefinitions(
    workspaceId: string
  ): Promise<SidebarObjectDefinitionListItem[]>;
}
