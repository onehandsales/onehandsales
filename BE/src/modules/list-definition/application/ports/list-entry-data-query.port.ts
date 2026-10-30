import type { TransactionContext } from "@/shared/application/ports/transaction-manager.port";
import type { AttributeValueSnapshot } from "@/modules/attribute-definition/application/attribute-value-snapshot";
export const LIST_ENTRY_DATA_QUERY = Symbol("LIST_ENTRY_DATA_QUERY");
// 역할 : ListEntry 원본의 고유 식별자와 Record 연결을 정의합니다.
export interface ListEntryDataSnapshot {
  readonly id: string;
  readonly recordDefinitionId: string;
  readonly createdAt: string;
}
// 역할 : List 원본과 Entry 값을 소유 모듈의 공개 경계로 읽습니다.
export interface ListEntryDataQuery {
  // 기능 : 선택 List의 Workspace 소속을 검증합니다.
  exists(
    workspaceId: string,
    listId: string,
    context: TransactionContext,
  ): Promise<boolean>;
  // 기능 : 중복 Record도 보존하며 Entry를 ID 순서로 순회합니다.
  list(
    workspaceId: string,
    listId: string,
    afterId: string | null,
    take: number,
    context: TransactionContext,
  ): Promise<ListEntryDataSnapshot[]>;
  // 기능 : 해당 List의 명시 Entry·속성 값을 배열로 조회합니다.
  values(
    workspaceId: string,
    listId: string,
    ids: string[],
    attributeIds: string[],
    take: number,
    context: TransactionContext,
  ): Promise<AttributeValueSnapshot[]>;
}
