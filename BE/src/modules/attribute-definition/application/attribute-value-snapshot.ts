import type { JsonValue } from "@/shared/application/types/json-value";
import type { AttributeDefinitionType } from "./attribute-definition-type";

// 역할 : 소유 Record/Entry 모듈이 공개하는 속성값의 저장 표현을 정의합니다.
export interface AttributeValueSnapshot {
  readonly id: string;
  readonly ownerId: string;
  readonly attributeDefinitionId: string;
  readonly attributeType: AttributeDefinitionType;
  readonly jsonValue: JsonValue;
  readonly textValue: string | null;
  readonly numberValue: string | null;
  readonly booleanValue: boolean | null;
  readonly dateValue: string | null;
  readonly timestampValue: string | null;
  readonly selectOptionId: string | null;
  readonly statusOptionId: string | null;
  readonly targetRecordDefinitionId: string | null;
  readonly targetObjectDefinitionId: string | null;
  readonly targetActorId: string | null;
}
