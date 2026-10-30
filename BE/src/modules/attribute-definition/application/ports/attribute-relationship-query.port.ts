import type { TransactionContext } from "@/shared/application/ports/transaction-manager.port";
export const ATTRIBUTE_RELATIONSHIP_QUERY = Symbol(
  "ATTRIBUTE_RELATIONSHIP_QUERY",
);
// 역할 : 관계 경로의 허용 Object 연결을 검증할 메타데이터입니다.
export interface AttributeRelationshipSnapshot {
  readonly sourceObjectDefinitionId: string;
  readonly sourceAttributeDefinitionId: string;
  readonly targetObjectDefinitionId: string;
  readonly targetAttributeDefinitionId: string;
}
// 역할 : 속성 소유 모듈이 관계 정의 읽기를 공개합니다.
export interface AttributeRelationshipQuery {
  // 기능 : 관련 속성이 참여하는 양방향 관계를 같은 Workspace에서 읽습니다.
  find(
    workspaceId: string,
    attributeIds: string[],
    context: TransactionContext,
  ): Promise<AttributeRelationshipSnapshot[]>;
}
