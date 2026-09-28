export const OBJECT_DEFINITION_ACCESS_QUERY = Symbol(
  "OBJECT_DEFINITION_ACCESS_QUERY"
);

// 역할 : ObjectDefinitionWorkspaceLookupInput이 Workspace 안의 ObjectDefinition 소속 확인 입력을 정의합니다.
export interface ObjectDefinitionWorkspaceLookupInput {
  readonly workspaceId: string;
  readonly objectDefinitionId: string;
}

// 역할 : ObjectDefinitionAccessQuery가 다른 모듈이 ObjectDefinition 접근 가능 여부를 확인하는 계약을 정의합니다.
export interface ObjectDefinitionAccessQuery {
  // 기능 : 특정 ObjectDefinition이 요청 Workspace에 속하는지 확인합니다.
  hasObjectDefinitionInWorkspace(
    input: ObjectDefinitionWorkspaceLookupInput
  ): Promise<boolean>;
}
