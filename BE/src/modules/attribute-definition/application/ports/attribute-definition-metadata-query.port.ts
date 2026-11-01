import type { JsonValue } from "@/shared/application/types/json-value";
import type { AttributeDefinitionType } from "../attribute-definition-type";
import type { TransactionContext } from "@/shared/application/ports/transaction-manager.port";

export const ATTRIBUTE_DEFINITION_METADATA_QUERY = Symbol("ATTRIBUTE_DEFINITION_METADATA_QUERY");

// 역할 : 저장 설정의 표시와 소속 검증에 필요한 속성 원본을 정의합니다.
export interface AttributeDefinitionMetadata {
  readonly id: string;
  readonly workspaceId: string;
  readonly objectDefinitionId: string | null;
  readonly listDefinitionId: string | null;
  readonly title: string;
  readonly type: AttributeDefinitionType;
  readonly icon: string | null;
  readonly isMultiselect: boolean;
  readonly configJson: JsonValue;
}

// 역할 : 옵션의 표시 정보와 속성 소속을 검증하는 내부 결과입니다.
export interface AttributeOptionMetadata {
  readonly id: string;
  readonly workspaceId: string;
  readonly attributeDefinitionId: string;
  readonly title: string;
  readonly color: string | null;
  readonly sortOrder: number;
  readonly createdAt: Date;
}

// 역할 : 전체 옵션 후보와 명시 옵션을 같은 Workspace에서 읽는 입력입니다.
export interface AttributeOptionsInput {
  readonly workspaceId: string;
  readonly selectAttributeIds: string[];
  readonly statusAttributeIds: string[];
  readonly selectOptionIds: string[];
  readonly statusOptionIds: string[];
}

// 역할 : 다른 모듈에 속성·옵션 일괄 읽기만 공개합니다.
export interface AttributeDefinitionMetadataQuery {
  // 기능 : 요청 ID 중 같은 Workspace에 존재하는 속성 원본을 반환합니다.
  findAttributes(workspaceId: string, ids: string[], context?: TransactionContext): Promise<AttributeDefinitionMetadata[]>;
  // 기능 : 참조 속성의 전체 옵션과 명시 옵션을 일괄 조회합니다.
  findOptions(input: AttributeOptionsInput, context?: TransactionContext): Promise<{ selectOptions: AttributeOptionMetadata[]; statusOptions: AttributeOptionMetadata[] }>;
}
