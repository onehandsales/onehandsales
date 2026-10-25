export const LIST_DEFINITION_SUMMARY_QUERY = Symbol(
  "LIST_DEFINITION_SUMMARY_QUERY"
);

// 역할 : 다른 모듈에 공개할 업무 목록의 최소 표시 정보를 정의합니다.
export interface ListDefinitionSummary {
  readonly id: string;
  readonly name: string;
  readonly icon: string | null;
}

// 역할 : 단건 요약을 요청할 List와 Workspace 경계를 정의합니다.
export interface ListDefinitionSummaryInput {
  readonly workspaceId: string;
  readonly listDefinitionId: string;
}

// 역할 : List 소유 모듈의 단건 표시 정보 조회 계약을 공개합니다.
export interface ListDefinitionSummaryQuery {
  // 기능 : 같은 Workspace에 속한 List의 표시 정보만 조회합니다.
  findListDefinitionSummary(
    input: ListDefinitionSummaryInput
  ): Promise<ListDefinitionSummary | null>;
}
