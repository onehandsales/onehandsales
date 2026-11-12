import type { TransactionContext } from "@/shared/application/ports/transaction-manager.port";

export const OBJECT_DEFINITION_COMMAND_REPOSITORY = Symbol(
  "OBJECT_DEFINITION_COMMAND_REPOSITORY"
);

// 역할 : ObjectDefinitionApiSlugLookupInput이 Workspace 안의 ObjectDefinition apiSlug 조회 입력을 정의합니다.
export interface ObjectDefinitionApiSlugLookupInput {
  readonly workspaceId: string;
  readonly apiSlug: string;
}

// 역할 : CreateObjectDefinitionInput이 ObjectDefinition 생성에 필요한 값을 정의합니다.
export interface CreateObjectDefinitionInput {
  readonly workspaceId: string;
  readonly createdByActorId: string;
  readonly apiSlug: string;
  readonly singularName: string;
  readonly pluralName: string;
  readonly icon: string | null;
  readonly description: string | null;
  readonly sortOrder: number;
}

// 역할 : CreateObjectDefinitionResult가 ObjectDefinition 생성 결과를 정의합니다.
export interface CreateObjectDefinitionResult {
  readonly id: string;
}

// 역할 : ObjectDefinitionCommandRepository가 ObjectDefinition 쓰기 저장소 계약을 정의합니다.
export interface ObjectDefinitionCommandRepository {
  // 기능 : 같은 생성 작업에서 만든 이름 속성을 관리 항목의 대표 이름으로 지정합니다.
  setRecordTitle(workspaceId: string, objectId: string, attributeId: string, context: TransactionContext): Promise<void>;
  // 기능 : 같은 Workspace의 생성·재정렬을 잠근 뒤 현재 마지막 순서를 조회합니다.
  lockAndGetLastSortOrder(workspaceId: string, context: TransactionContext): Promise<number | null>;

  // 기능 : 같은 Workspace 안에 동일 apiSlug의 ObjectDefinition이 있는지 확인합니다.
  hasObjectDefinitionApiSlug(
    input: ObjectDefinitionApiSlugLookupInput
  ): Promise<boolean>;

  // 기능 : Workspace에 ObjectDefinition row를 생성합니다.
  createObjectDefinition(
    input: CreateObjectDefinitionInput,
    context: TransactionContext
  ): Promise<CreateObjectDefinitionResult>;
}
