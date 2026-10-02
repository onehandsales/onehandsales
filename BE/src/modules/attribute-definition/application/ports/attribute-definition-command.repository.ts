import type { AttributeDefinitionType } from "@/modules/attribute-definition/application/attribute-definition-type";
import type { AttributeDefinitionConfig } from "@/modules/attribute-definition/application/attribute-definition-config";
import type { TransactionContext } from "@/shared/application/ports/transaction-manager.port";

export const ATTRIBUTE_DEFINITION_COMMAND_REPOSITORY = Symbol(
  "ATTRIBUTE_DEFINITION_COMMAND_REPOSITORY"
);

// 역할 : AttributeDefinitionApiSlugLookupInput이 ObjectDefinition 안의 AttributeDefinition apiSlug 조회 입력을 정의합니다.
export interface AttributeDefinitionApiSlugLookupInput {
  readonly workspaceId: string;
  readonly objectDefinitionId: string;
  readonly apiSlug: string;
}

// 역할 : AttributeDefinitionSortOrderLookupInput이 ObjectDefinition 안의 다음 정렬 순서 조회 입력을 정의합니다.
export interface AttributeDefinitionSortOrderLookupInput {
  readonly workspaceId: string;
  readonly objectDefinitionId: string;
  readonly transactionContext?: TransactionContext | null;
}

// 역할 : CreateAttributeDefinitionInput이 AttributeDefinition 생성에 필요한 값을 정의합니다.
export interface CreateAttributeDefinitionInput {
  readonly workspaceId: string;
  readonly objectDefinitionId: string;
  readonly createdByActorId: string;
  readonly apiSlug: string;
  readonly title: string;
  readonly sortOrder: number;
  readonly type: AttributeDefinitionType;
  readonly icon: string | null;
  readonly isMultiselect: boolean;
  readonly description: string | null;
  readonly config: AttributeDefinitionConfig | null;
  readonly transactionContext?: TransactionContext | null;
}

// 역할 : CreateAttributeDefinitionResult가 AttributeDefinition 생성 결과를 정의합니다.
export interface CreateAttributeDefinitionResult {
  readonly id: string;
}

// 역할 : AttributeDefinitionCommandRepository가 AttributeDefinition 쓰기 저장소 계약을 정의합니다.
export interface AttributeDefinitionCommandRepository {
  // 기능 : 같은 ObjectDefinition 안에 동일 apiSlug의 AttributeDefinition이 있는지 확인합니다.
  hasAttributeDefinitionApiSlug(
    input: AttributeDefinitionApiSlugLookupInput
  ): Promise<boolean>;

  // 기능 : 같은 ObjectDefinition 안에서 다음 AttributeDefinition 정렬 순서를 조회합니다.
  getNextAttributeDefinitionSortOrder(
    input: AttributeDefinitionSortOrderLookupInput
  ): Promise<number>;

  // 기능 : ObjectDefinition에 AttributeDefinition row를 생성합니다.
  createAttributeDefinition(
    input: CreateAttributeDefinitionInput
  ): Promise<CreateAttributeDefinitionResult>;
}
