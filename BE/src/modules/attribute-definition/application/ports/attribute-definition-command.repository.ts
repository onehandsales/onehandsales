import type { AttributeDefinitionType } from "@/modules/attribute-definition/application/attribute-definition-type";
import type { AttributeDefinitionConfig } from "@/modules/attribute-definition/application/attribute-definition-config";
import type { TransactionContext } from "@/shared/application/ports/transaction-manager.port";

export const ATTRIBUTE_DEFINITION_COMMAND_REPOSITORY = Symbol(
  "ATTRIBUTE_DEFINITION_COMMAND_REPOSITORY"
);

// 역할 : AttributeDefinitionApiSlugLookupInput이 ObjectDefinition 안의 AttributeDefinition apiSlug 조회 입력을 정의합니다.
export interface AttributeDefinitionApiSlugLookupInput {
  // 기능 : AttributeDefinition이 속한 Workspace 경계를 지정합니다.
  readonly workspaceId: string;
  // 기능 : AttributeDefinition이 속한 ObjectDefinition 경계를 지정합니다.
  readonly objectDefinitionId: string;
  // 기능 : 중복 여부를 확인할 저장 기준 apiSlug 값을 지정합니다.
  readonly apiSlug: string;
  // 기능 : 수정 중인 자기 자신을 중복 검사 대상에서 제외할 때 사용합니다.
  readonly excludeAttributeDefinitionId?: string;
}

// 역할 : AttributeDefinitionSortOrderLookupInput이 ObjectDefinition 안의 다음 정렬 순서 조회 입력을 정의합니다.
export interface AttributeDefinitionSortOrderLookupInput {
  // 기능 : 정렬 순서를 계산할 Workspace 경계를 지정합니다.
  readonly workspaceId: string;
  // 기능 : 정렬 순서를 계산할 ObjectDefinition 경계를 지정합니다.
  readonly objectDefinitionId: string;
  // 기능 : 생성 흐름에서 같은 트랜잭션으로 조회해야 할 때 전달합니다.
  readonly transactionContext?: TransactionContext | null;
}

// 역할 : CreateAttributeDefinitionInput이 AttributeDefinition 생성에 필요한 값을 정의합니다.
export interface CreateAttributeDefinitionInput {
  // 기능 : 생성할 AttributeDefinition의 Workspace 경계를 지정합니다.
  readonly workspaceId: string;
  // 기능 : 생성할 AttributeDefinition의 ObjectDefinition 경계를 지정합니다.
  readonly objectDefinitionId: string;
  // 기능 : 생성 감사 컬럼에 기록할 Actor 식별자를 지정합니다.
  readonly createdByActorId: string;
  // 기능 : ObjectDefinition 안에서 사용할 API 식별자 값을 지정합니다.
  readonly apiSlug: string;
  // 기능 : 사용자에게 노출할 AttributeDefinition 이름을 지정합니다.
  readonly title: string;
  // 기능 : ObjectDefinition 안에서의 표시 순서를 지정합니다.
  readonly sortOrder: number;
  // 기능 : AttributeDefinition의 값 타입을 지정합니다.
  readonly type: AttributeDefinitionType;
  // 기능 : UI에 표시할 아이콘 값을 지정합니다.
  readonly icon: string | null;
  // 기능 : 선택형 AttributeDefinition의 다중 선택 여부를 지정합니다.
  readonly isMultiselect: boolean;
  // 기능 : AttributeDefinition 설명 값을 지정합니다.
  readonly description: string | null;
  // 기능 : AttributeDefinition 타입별 설정 값을 지정합니다.
  readonly config: AttributeDefinitionConfig | null;
  // 기능 : 생성 흐름을 묶는 트랜잭션 컨텍스트를 전달합니다.
  readonly transactionContext?: TransactionContext | null;
}

// 역할 : CreateAttributeDefinitionResult가 AttributeDefinition 생성 결과를 정의합니다.
export interface CreateAttributeDefinitionResult {
  // 기능 : 생성된 AttributeDefinition 식별자를 반환합니다.
  readonly id: string;
}

// 역할 : AttributeDefinitionWorkspaceObjectLookupInput이 Workspace/ObjectDefinition 안의 AttributeDefinition 소속 확인 입력을 정의합니다.
export interface AttributeDefinitionWorkspaceObjectLookupInput {
  // 기능 : 조회할 AttributeDefinition의 Workspace 경계를 지정합니다.
  readonly workspaceId: string;
  // 기능 : 조회할 AttributeDefinition의 ObjectDefinition 경계를 지정합니다.
  readonly objectDefinitionId: string;
  // 기능 : 조회할 AttributeDefinition 식별자를 지정합니다.
  readonly attributeDefinitionId: string;
}

// 역할 : AttributeDefinitionForUpdate가 수정 대상 AttributeDefinition의 저장 기준 정보를 정의합니다.
export interface AttributeDefinitionForUpdate {
  // 기능 : 수정 대상 AttributeDefinition 식별자를 반환합니다.
  readonly id: string;
  // 기능 : 기존 apiSlug와 변경 요청 apiSlug를 비교할 때 사용합니다.
  readonly apiSlug: string;
}

// 역할 : UpdateAttributeDefinitionPatch가 AttributeDefinition 수정 시 저장할 컬럼 값을 정의합니다.
export interface UpdateAttributeDefinitionPatch {
  // 기능 : title 필드가 요청에 포함된 경우에만 저장할 값을 지정합니다.
  readonly title?: string;
  // 기능 : title 변경과 함께 동기화할 apiSlug 값을 지정합니다.
  readonly apiSlug?: string;
  // 기능 : description 필드가 요청에 포함된 경우에만 저장할 값을 지정합니다.
  readonly description?: string | null;
  // 기능 : icon 필드가 요청에 포함된 경우에만 저장할 값을 지정합니다.
  readonly icon?: string | null;
  // 기능 : isMultiselect 필드가 요청에 포함된 경우에만 저장할 값을 지정합니다.
  readonly isMultiselect?: boolean;
}

// 역할 : UpdateAttributeDefinitionInput이 AttributeDefinition 수정에 필요한 값을 정의합니다.
export interface UpdateAttributeDefinitionInput
  extends AttributeDefinitionWorkspaceObjectLookupInput {
  // 기능 : 수정 감사 컬럼에 기록할 Actor 식별자를 지정합니다.
  readonly updatedByActorId: string;
  // 기능 : request에 포함된 수정 대상 컬럼만 담습니다.
  readonly patch: UpdateAttributeDefinitionPatch;
}

// 역할 : UpdateAttributeDefinitionResult가 AttributeDefinition 수정 결과를 정의합니다.
export interface UpdateAttributeDefinitionResult {
  // 기능 : 수정된 AttributeDefinition 식별자를 반환합니다.
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

  // 기능 : 수정 대상 AttributeDefinition이 요청 Workspace와 ObjectDefinition에 속하는지 조회합니다.
  findAttributeDefinitionForUpdate(
    input: AttributeDefinitionWorkspaceObjectLookupInput
  ): Promise<AttributeDefinitionForUpdate | null>;

  // 기능 : AttributeDefinition row를 부분 수정합니다.
  updateAttributeDefinition(
    input: UpdateAttributeDefinitionInput
  ): Promise<UpdateAttributeDefinitionResult>;
}
