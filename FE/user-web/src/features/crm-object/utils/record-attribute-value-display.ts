import type { WorkspaceObjectRecordAttributeValueListItem } from "@/features/crm-object";

// 역할 : boolean cell 값을 사용자 표시 문구로 바꾸는 label 묶음입니다.
export type RecordAttributeValueBooleanLabels = {
  readonly falseLabel: string;
  readonly trueLabel: string;
};

type RecordAttributeValueFormatters = {
  readonly formatDate: (value: string) => string;
  readonly formatDateTime: (value: string) => string;
};

const CURRENCY_SYMBOL_BY_CODE: Readonly<Record<string, string>> = {
  AUD: "A$",
  CAD: "C$",
  CNY: "¥",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
  KRW: "₩",
  USD: "$",
};

// 기능 : RecordAttributeValue 응답에서 화면에 표시할 문자열을 계산합니다.
export function getRecordAttributeValueDisplayText(
  value: WorkspaceObjectRecordAttributeValueListItem | null | undefined,
  booleanLabels: RecordAttributeValueBooleanLabels,
  formatters?: RecordAttributeValueFormatters,
) {
  if (!value) {
    return "";
  }

  switch (value.attributeType) {
    case "Checkbox":
      if (value.booleanValue === null) {
        return "";
      }

      return value.booleanValue
        ? booleanLabels.trueLabel
        : booleanLabels.falseLabel;
    case "Currency":
      return getCurrencyDisplayText(value);
    case "Date":
      return value.dateValue
        ? formatters?.formatDate(value.dateValue) ?? value.dateValue
        : "";
    case "Interaction":
      return getInteractionDisplayText(value, formatters);
    case "Location":
      return (
        getJsonStringField(value.jsonValue, "text") ??
        value.textValue ??
        ""
      );
    case "PersonalName":
      return getPersonalNameDisplayText(value);
    case "Timestamp":
      return value.timestampValue
        ? formatters?.formatDateTime(value.timestampValue) ?? value.timestampValue
        : "";
    case "Select":
      return (
        getJsonStringField(value.jsonValue, "selectOptionId") ??
        value.selectOptionId ??
        ""
      );
    case "Status":
      return (
        getJsonStringField(value.jsonValue, "statusOptionId") ??
        value.statusOptionId ??
        ""
      );
    case "RecordReference":
      return (
        getJsonStringField(value.jsonValue, "targetRecordDefinitionId") ??
        value.targetRecordDefinitionId ??
        ""
      );
    case "ActorReference":
      return (
        getJsonStringField(value.jsonValue, "targetActorId") ??
        value.targetActorId ??
        ""
      );
    default:
      break;
  }

  if (value.textValue) {
    return value.textValue;
  }

  if (value.numberValue) {
    return value.numberValue;
  }

  if (value.jsonValue !== null) {
    return typeof value.jsonValue === "string"
      ? value.jsonValue
      : JSON.stringify(value.jsonValue);
  }

  return "";
}

// 기능 : Currency cell 표시 문자열을 계산합니다.
function getCurrencyDisplayText(
  value: WorkspaceObjectRecordAttributeValueListItem,
) {
  const amount =
    getJsonStringField(value.jsonValue, "amount") ??
    value.numberValue ??
    "";
  const currencyCode = getJsonStringField(value.jsonValue, "currencyCode") ?? "";
  const currencySymbol = getCurrencySymbol(currencyCode);

  if (amount.length === 0) {
    return currencySymbol;
  }

  return currencySymbol.length > 0 ? `${currencySymbol} ${amount}` : amount;
}

// 기능 : PersonalName cell 표시 문자열을 계산합니다.
function getPersonalNameDisplayText(
  value: WorkspaceObjectRecordAttributeValueListItem,
) {
  const displayName =
    getJsonStringField(value.jsonValue, "displayName") ??
    value.textValue ??
    "";

  if (displayName.length > 0) {
    return displayName;
  }

  return [
    getJsonStringField(value.jsonValue, "familyName") ?? "",
    getJsonStringField(value.jsonValue, "givenName") ?? "",
  ].join("");
}

// 기능 : Interaction cell 표시 문자열을 계산합니다.
function getInteractionDisplayText(
  value: WorkspaceObjectRecordAttributeValueListItem,
  formatters?: RecordAttributeValueFormatters,
) {
  const interactionType = getJsonStringField(value.jsonValue, "type") ?? "";
  const summary =
    getJsonStringField(value.jsonValue, "summary") ??
    value.textValue ??
    "";
  const occurredAt =
    getJsonStringField(value.jsonValue, "occurredAt") ??
    value.timestampValue ??
    "";
  const occurredAtText =
    occurredAt.length > 0
      ? formatters?.formatDateTime(occurredAt) ?? occurredAt
      : "";

  return [interactionType, summary, occurredAtText]
    .filter((part) => part.length > 0)
    .join(" / ");
}

// 기능 : JSON object에서 문자열 필드를 안전하게 꺼냅니다.
function getJsonStringField(value: unknown, key: string) {
  return getStringField(getJsonObject(value), key);
}

// 기능 : Currency code를 셀에서 읽기 쉬운 통화 기호로 변환합니다.
function getCurrencySymbol(currencyCode: string) {
  const normalizedCurrencyCode = currencyCode.trim().toUpperCase();

  if (normalizedCurrencyCode.length === 0) {
    return "";
  }

  return CURRENCY_SYMBOL_BY_CODE[normalizedCurrencyCode] ?? normalizedCurrencyCode;
}

// 기능 : JSON object 후보에서 문자열 필드를 안전하게 꺼냅니다.
function getStringField(value: Record<string, unknown> | null, key: string) {
  const fieldValue = value?.[key];

  return typeof fieldValue === "string" ? fieldValue : null;
}

// 기능 : unknown 값이 JSON object 형태인지 확인합니다.
function getJsonObject(value: unknown): Record<string, unknown> | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}
