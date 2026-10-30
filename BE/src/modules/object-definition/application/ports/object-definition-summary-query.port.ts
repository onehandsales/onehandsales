import type { TransactionContext } from "@/shared/application/ports/transaction-manager.port";
export const OBJECT_DEFINITION_SUMMARY_QUERY = Symbol(
  "OBJECT_DEFINITION_SUMMARY_QUERY"
);

// 역할 : 다른 모듈에 공개할 Workspace Object의 최소 표시 정보를 정의합니다.
export interface ObjectDefinitionSummary {
  readonly id: string;
  readonly singularName: string;
  readonly icon: string | null;
}

// 역할 : 단건 요약을 요청할 Object와 Workspace 경계를 정의합니다.
export interface ObjectDefinitionSummaryInput {
  readonly workspaceId: string;
  readonly objectDefinitionId: string;
}

// 역할 : Object 소유 모듈의 단건 표시 정보 조회 계약을 공개합니다.
export interface ObjectDefinitionSummaryQuery {
  // 기능 : 같은 Workspace에 속한 Object의 표시 정보만 조회합니다.
  findObjectDefinitionSummary(
    input: ObjectDefinitionSummaryInput, context?: TransactionContext
  ): Promise<ObjectDefinitionSummary | null>;
}
