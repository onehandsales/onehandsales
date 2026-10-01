import type { RecordAttributeValueType } from "@/modules/record-definition/application/ports/record-definition-list-query.port";
import type { TransactionContext } from "@/shared/application/ports/transaction-manager.port";

export const RECORD_ATTRIBUTE_VALUE_DEFINITION_MATERIALIZER = Symbol(
  "RECORD_ATTRIBUTE_VALUE_DEFINITION_MATERIALIZER"
);

// 역할 : MaterializeRecordAttributeValuesForAttributeDefinitionInput이 새 AttributeDefinition에 대응하는 기존 RecordDefinition cell row 생성 입력을 정의합니다.
export interface MaterializeRecordAttributeValuesForAttributeDefinitionInput {
  readonly workspaceId: string;
  readonly objectDefinitionId: string;
  readonly attributeDefinitionId: string;
  readonly attributeType: RecordAttributeValueType;
  readonly createdByActorId: string;
  readonly transactionContext?: TransactionContext | null;
}

// 역할 : MaterializeRecordAttributeValuesForAttributeDefinitionResult가 생성된 cell value row 수를 정의합니다.
export interface MaterializeRecordAttributeValuesForAttributeDefinitionResult {
  readonly createdCount: number;
}

// 역할 : RecordAttributeValueDefinitionMaterializer가 기존 RecordDefinition에 새 AttributeDefinition의 null cell row를 채우는 공개 계약을 정의합니다.
export interface RecordAttributeValueDefinitionMaterializer {
  // 기능 : 새 AttributeDefinition 기준으로 기존 RecordDefinition마다 비어 있는 cell value row를 생성합니다.
  materializeForAttributeDefinition(
    input: MaterializeRecordAttributeValuesForAttributeDefinitionInput
  ): Promise<MaterializeRecordAttributeValuesForAttributeDefinitionResult>;
}
