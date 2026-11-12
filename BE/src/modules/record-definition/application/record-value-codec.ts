import type { RecordAttributeValueType } from "./ports/record-definition-list-query.port";
import type { RecordAttributeValueDefinitionValuePatch } from "./ports/record-definition-command.repository";
import { RecordAttributeValueDefinitionValidationError } from "../domain/record-definition.errors";

export const RECORD_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
// 기능 : 사용자 값 원문 없이 기존 입력 오류 계약을 유지합니다.
export function invalidRecordValue(): never {
  throw new RecordAttributeValueDefinitionValidationError("RECORD_ATTRIBUTE_VALUE_DEFINITION_VALUE_INVALID", "value", "Record attribute value definition value is invalid");
}
// 기능 : 사용하지 않는 typed 컬럼을 SQL NULL로 비웁니다.
export function emptyRecordValue(): { -readonly [K in keyof RecordAttributeValueDefinitionValuePatch]: RecordAttributeValueDefinitionValuePatch[K] } {
  return { jsonValue: null, textValue: null, numberValue: null, booleanValue: null, dateValue: null, timestampValue: null,
    selectOptionId: null, statusOptionId: null, targetRecordDefinitionId: null, targetObjectDefinitionId: null, targetActorId: null };
}
// 기능 : JSON 객체만 허용합니다.
export function recordValueObject(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) invalidRecordValue();
  return value as Record<string, unknown>;
}
// 기능 : 실제 날짜와 timezone 있는 시각을 검증합니다.
function parseDate(value: unknown, timestamp = false): Date {
  if (typeof value !== "string" || !(timestamp ? /^\d{4}-\d{2}-\d{2}T.*(?:Z|[+-]\d{2}:\d{2})$/ : /^\d{4}-\d{2}-\d{2}$/).test(value)) invalidRecordValue();
  const result = new Date(timestamp ? value : `${value}T00:00:00.000Z`);
  if (timestamp) parseDate(value.slice(0, 10));
  if (!Number.isFinite(result.getTime()) || (!timestamp && result.toISOString().slice(0, 10) !== value)) invalidRecordValue();
  return result;
}
// 기능 : 참조 별칭은 같은 UUID일 때만 수용하고 표시용 label은 저장하지 않습니다.
function reference(value: unknown, keys: string[]): string {
  const object = recordValueObject(value);
  const ids = keys.flatMap(key => object[key] === undefined ? [] : [object[key]]);
  if (!ids.length || ids.some(id => typeof id !== "string" || !RECORD_UUID.test(id)) || new Set(ids.map(id => (id as string).toLowerCase())).size !== 1) invalidRecordValue();
  return (ids[0] as string).toLowerCase();
}
// 기능 : 생성과 수정에서 동일한 타입 변환 및 Decimal 범위를 적용합니다.
export function encodeRecordValue(type: RecordAttributeValueType, value: unknown): RecordAttributeValueDefinitionValuePatch {
  const result = emptyRecordValue();
  if (value === null) return result;
  switch (type) {
    case "Text": case "EmailAddress": case "Domain": case "PhoneNumber":
      if (typeof value !== "string") invalidRecordValue(); result.textValue = value; break;
    case "Number": case "Currency": case "Rating": {
      if (typeof value !== "string" || !/^-?\d+(\.\d+)?$/.test(value)) invalidRecordValue();
      const [whole = "0", decimal = ""] = value.replace(/^-/, "").split(".");
      if (whole.replace(/^0+/, "").length > 20 || decimal.length > 10) invalidRecordValue();
      const normalized = `${value.startsWith("-") ? "-" : ""}${whole.replace(/^0+(?=\d)/, "")}${decimal.replace(/0+$/, "") ? "." + decimal.replace(/0+$/, "") : ""}`;
      result.numberValue = /^-?0$/.test(normalized) ? "0" : normalized; break;
    }
    case "Checkbox": if (typeof value !== "boolean") invalidRecordValue(); result.booleanValue = value; break;
    case "Date": result.dateValue = parseDate(value); break;
    case "Timestamp": result.timestampValue = parseDate(value, true); break;
    case "Select": result.selectOptionId = reference(value, ["selectOptionId", "id"]); break;
    case "Status": result.statusOptionId = reference(value, ["statusOptionId", "id"]); break;
    case "ActorReference": result.targetActorId = reference(value, ["targetActorId", "actorId", "id"]); break;
    case "RecordReference": result.targetRecordDefinitionId = reference(value, ["targetRecordDefinitionId", "recordDefinitionId", "id"]); break;
    case "PersonalName": case "Location": case "Interaction": {
      const object = recordValueObject(value);
      const text = object[type === "PersonalName" ? "displayName" : type === "Location" ? "text" : "summary"];
      if (text !== undefined && text !== null && typeof text !== "string") invalidRecordValue();
      result.textValue = typeof text === "string" ? text : null; result.jsonValue = object;
      if (type === "Interaction" && object.occurredAt != null) result.timestampValue = parseDate(object.occurredAt, true);
      break;
    }
  }
  return result;
}
// 기능 : 값 비교에서 자동 audit/행 ID를 제외하고 JSON 키 순서를 정규화합니다.
export function recordValueKey(value: RecordAttributeValueDefinitionValuePatch): string {
  const sort = (item: unknown): unknown => Array.isArray(item) ? item.map(sort) : item && typeof item === "object" && !(item instanceof Date)
    ? Object.fromEntries(Object.entries(item).sort(([a], [b]) => a.localeCompare(b)).map(([key, item]) => [key, sort(item)])) : item;
  return JSON.stringify(sort(Object.fromEntries(Object.keys(emptyRecordValue()).map(key => [key, value[key as keyof typeof value]]))));
}
