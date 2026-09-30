import type { TransactionContext } from "@/shared/application/ports/transaction-manager.port";
import type { RecordAttributeValueType } from "./record-definition-list-query.port";

export const RECORD_DEFINITION_COMMAND_REPOSITORY = Symbol(
  "RECORD_DEFINITION_COMMAND_REPOSITORY"
);

// 역할 : CreateRecordDefinitionInput이 RecordDefinition과 null cell value row 생성에 필요한 값을 정의합니다.
export interface CreateRecordDefinitionInput {
  readonly workspaceId: string;
  readonly objectDefinitionId: string;
  readonly createdByActorId: string;
  readonly transactionContext?: TransactionContext | null;
}

// 역할 : CreateRecordDefinitionResult가 RecordDefinition 생성 결과를 정의합니다.
export interface CreateRecordDefinitionResult {
  readonly id: string;
}

// 역할 : RecordDefinitionWorkspaceObjectLookupInput이 Workspace/ObjectDefinition 안의 RecordDefinition 소속 확인 입력을 정의합니다.
export interface RecordDefinitionWorkspaceObjectLookupInput {
  readonly workspaceId: string;
  readonly objectDefinitionId: string;
  readonly recordDefinitionId: string;
}

// 역할 : RecordAttributeValueDefinitionLookupInput이 RecordDefinition 안의 cell value row 소속 확인 입력을 정의합니다.
export interface RecordAttributeValueDefinitionLookupInput {
  readonly workspaceId: string;
  readonly objectDefinitionId: string;
  readonly recordDefinitionId: string;
  readonly recordAttributeValueDefinitionId: string;
}

// 역할 : RecordAttributeValueDefinitionForUpdate가 수정 대상 cell value row의 저장 기준 정보를 정의합니다.
export interface RecordAttributeValueDefinitionForUpdate {
  readonly id: string;
  readonly attributeDefinitionId: string;
  readonly attributeType: RecordAttributeValueType;
}

// 역할 : RecordAttributeValueDefinitionValuePatch가 cell value update 시 저장할 컬럼 값을 정의합니다.
export interface RecordAttributeValueDefinitionValuePatch {
  readonly jsonValue: unknown | null;
  readonly textValue: string | null;
  readonly numberValue: string | null;
  readonly booleanValue: boolean | null;
  readonly dateValue: Date | null;
  readonly timestampValue: Date | null;
  readonly selectOptionId: string | null;
  readonly statusOptionId: string | null;
  readonly targetRecordDefinitionId: string | null;
  readonly targetObjectDefinitionId: string | null;
  readonly targetActorId: string | null;
}

// 역할 : UpdateRecordAttributeValueDefinitionInput이 cell value row 수정에 필요한 값을 정의합니다.
export interface UpdateRecordAttributeValueDefinitionInput
  extends RecordAttributeValueDefinitionLookupInput {
  readonly updatedByActorId: string;
  readonly values: RecordAttributeValueDefinitionValuePatch;
  readonly transactionContext?: TransactionContext | null;
}

// 역할 : UpdateRecordAttributeValueDefinitionResult가 cell value row 수정 결과를 정의합니다.
export interface UpdateRecordAttributeValueDefinitionResult {
  readonly id: string;
}

// 역할 : RecordDefinitionCommandRepository가 RecordDefinition 쓰기 저장소 계약을 정의합니다.
export interface RecordDefinitionCommandRepository {
  // 기능 : ObjectDefinition에 빈 RecordDefinition row와 현재 AttributeDefinition 기준 null cell value row를 생성합니다.
  createRecordDefinition(
    input: CreateRecordDefinitionInput
  ): Promise<CreateRecordDefinitionResult>;

  // 기능 : 특정 RecordDefinition이 요청 Workspace와 ObjectDefinition에 속하는지 확인합니다.
  hasRecordDefinitionInWorkspaceObject(
    input: RecordDefinitionWorkspaceObjectLookupInput
  ): Promise<boolean>;

  // 기능 : 수정 대상 cell value row와 AttributeDefinition 정합성을 조회합니다.
  findRecordAttributeValueDefinitionForUpdate(
    input: RecordAttributeValueDefinitionLookupInput
  ): Promise<RecordAttributeValueDefinitionForUpdate | null>;

  // 기능 : cell value row와 부모 RecordDefinition 수정 감사 정보를 같은 작업으로 저장합니다.
  updateRecordAttributeValueDefinition(
    input: UpdateRecordAttributeValueDefinitionInput
  ): Promise<UpdateRecordAttributeValueDefinitionResult>;
}
