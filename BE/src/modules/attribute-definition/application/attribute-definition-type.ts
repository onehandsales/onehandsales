export const ATTRIBUTE_DEFINITION_TYPES = [
  "ActorReference",
  "Checkbox",
  "Currency",
  "Date",
  "Domain",
  "EmailAddress",
  "Interaction",
  "Location",
  "PersonalName",
  "Number",
  "PhoneNumber",
  "Rating",
  "RecordReference",
  "Select",
  "Status",
  "Text",
  "Timestamp",
] as const;

// 역할 : AttributeDefinitionType이 AttributeDefinition 값 타입 범위를 정의합니다.
export type AttributeDefinitionType = (typeof ATTRIBUTE_DEFINITION_TYPES)[number];

// 기능 : 입력 문자열이 AttributeDefinition type enum 값인지 확인합니다.
export function isAttributeDefinitionType(
  value: string
): value is AttributeDefinitionType {
  return ATTRIBUTE_DEFINITION_TYPES.some(
    (attributeDefinitionType) => attributeDefinitionType === value
  );
}
