import type { TransactionContext } from "@/shared/application/ports/transaction-manager.port";
import type { AttributeValueSnapshot } from "@/modules/attribute-definition/application/attribute-value-snapshot";

export const RECORD_DATA_QUERY = Symbol("RECORD_DATA_QUERY");
// 역할 : Record 원본의 식별자와 소속을 공개합니다.
export interface RecordDataSnapshot {
  readonly id: string;
  readonly objectDefinitionId: string;
  readonly createdAt: string;
}
// 역할 : 다른 모듈에 같은 snapshot의 Record 배치 읽기를 제공합니다.
export interface RecordDataQuery {
  // 기능 : Object의 원본 ID를 안정적으로 순회합니다.
  list(
    workspaceId: string,
    objectId: string,
    afterId: string | null,
    take: number,
    context: TransactionContext,
  ): Promise<RecordDataSnapshot[]>;
  // 기능 : 동일 Workspace의 참조 Record 소속을 일괄 확인합니다.
  find(
    workspaceId: string,
    ids: string[],
    context: TransactionContext,
  ): Promise<RecordDataSnapshot[]>;
  // 기능 : 명시 원본·속성의 다중값을 제한된 배치로 읽습니다.
  values(
    workspaceId: string,
    ids: string[],
    attributeIds: string[],
    take: number,
    context: TransactionContext,
  ): Promise<AttributeValueSnapshot[]>;
}
