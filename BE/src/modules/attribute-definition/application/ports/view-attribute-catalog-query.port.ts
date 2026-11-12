import type { TransactionContext } from "@/shared/application/ports/transaction-manager.port";
import type { AttributeDefinitionMetadata } from "./attribute-definition-metadata-query.port";
export const VIEW_ATTRIBUTE_CATALOG_QUERY = Symbol("VIEW_ATTRIBUTE_CATALOG_QUERY");
// 역할 : 선택 원본에서 사용할 수 있는 속성을 소유 모듈이 제공합니다.
export interface ViewAttributeCatalogQuery {
  // 기능 : Object 속성 또는 혼합 Object를 허용하는 List의 속성 후보를 반환합니다.
  list(workspaceId: string, objectId: string | null, listId: string | null, context: TransactionContext): Promise<AttributeDefinitionMetadata[]>;
}
