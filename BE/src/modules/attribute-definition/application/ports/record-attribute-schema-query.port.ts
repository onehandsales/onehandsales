import type { TransactionContext } from "@/shared/application/ports/transaction-manager.port";
import type { AttributeDefinitionMetadata, AttributeOptionMetadata } from "./attribute-definition-metadata-query.port";
import type { AttributeRelationshipSnapshot } from "./attribute-relationship-query.port";

export const RECORD_ATTRIBUTE_SCHEMA_QUERY = Symbol("RECORD_ATTRIBUTE_SCHEMA_QUERY");
// 역할 : Record 입력 검증에 필요한 속성·관계·선택 옵션의 동일 transaction 스냅샷입니다.
export interface RecordAttributeSchema {
  attributes: (AttributeDefinitionMetadata & { sortOrder: number })[];
  relationships: AttributeRelationshipSnapshot[];
  selectOptions: AttributeOptionMetadata[];
  statusOptions: AttributeOptionMetadata[];
}
// 역할 : Attribute 소유 모듈이 Record 입력용 정의 조회를 공개합니다.
export interface RecordAttributeSchemaQuery {
  // 기능 : 원본 Object 속성과 역방향 관계 속성을 조회하고 쓰기 검증에서는 정의 변경을 잠급니다.
  load(workspaceId: string, objectId: string, context: TransactionContext, lock?: boolean): Promise<RecordAttributeSchema>;
}
