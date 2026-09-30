import type { TransactionContext } from "@/shared/application/ports/transaction-manager.port";

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

// 역할 : RecordDefinitionCommandRepository가 RecordDefinition 쓰기 저장소 계약을 정의합니다.
export interface RecordDefinitionCommandRepository {
  // 기능 : ObjectDefinition에 빈 RecordDefinition row와 현재 AttributeDefinition 기준 null cell value row를 생성합니다.
  createRecordDefinition(
    input: CreateRecordDefinitionInput
  ): Promise<CreateRecordDefinitionResult>;
}
