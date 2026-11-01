import type { WorkspaceObjectRecordAttributeValueListItem } from "@/features/crm-object";
import type { ViewJson } from "../types/view-menu";
import type { ViewCellValue, ViewDataBinding } from "../types/view-data";

// 기능 : 허용된 JSON object의 표시 필드만 읽습니다.
export function viewValueObject(value: ViewJson | undefined): { readonly [key: string]: ViewJson } {
  return value !== null && typeof value === "object" && !Array.isArray(value) ? value as { readonly [key: string]: ViewJson } : {};
}

// 기능 : Decimal을 Number로 변환하지 않고 사용자 locale과 표시 형식으로 렌더링합니다.
export function formatViewDecimal(value: string, binding: ViewDataBinding, locale: string): string {
  if (!/^-?\d+(?:\.\d{1,10})?$/.test(value)) return value;
  // 1. 고정 소수 정수로 배율·반올림을 적용해 큰 금액과 작은 소수의 정밀도를 보존한다.
  const format = viewValueObject(binding.format);
  const negative = value.startsWith("-");
  const [integer = "0", fraction = ""] = value.replace(/^-/, "").split(".");
  const scale = 10_000_000_000n;
  let units = BigInt(integer) * scale + BigInt(fraction.padEnd(10, "0"));
  const percent = format.style === "PERCENT";
  if (percent && format.valueScale === 100) units *= 100n;
  const currency = binding.attributeType === "Currency" && binding.currencyCode && /^[A-Z]{3}$/.test(binding.currencyCode) ? binding.currencyCode : null;
  const digits = typeof format.fractionDigits === "number" ? Math.max(0, Math.min(10, format.fractionDigits)) : null;
  const defaultDigits = currency ? new Intl.NumberFormat(locale, { style: "currency", currency }).resolvedOptions().maximumFractionDigits ?? 2 : 10;
  const maximum = digits ?? defaultDigits;
  const rounding = 10n ** BigInt(10 - maximum);
  units = (units + rounding / 2n) / rounding * rounding;
  let decimal = (units % scale).toString().padStart(10, "0").slice(0, maximum);
  if (digits === null && !currency) decimal = decimal.replace(/0+$/, "");
  const decimalSeparator = new Intl.NumberFormat(locale).formatToParts(1.1).find(part => part.type === "decimal")?.value ?? ".";
  const grouping = typeof format.useGrouping === "boolean" ? { useGrouping: format.useGrouping } : {};
  const number = new Intl.NumberFormat(locale, grouping).format(units / scale) + (decimal ? decimalSeparator + decimal : "");
  // 2. 통화·부호·퍼센트의 locale별 위치를 유지하고 정수 자리만 정확한 문자열로 교체한다.
  const formatter = new Intl.NumberFormat(locale, {
    ...(percent ? { style: "percent" as const } : currency ? { style: "currency" as const, currency,
      ...(format.currencyDisplay === "code" || format.currencyDisplay === "name" || format.currencyDisplay === "symbol" || format.currencyDisplay === "narrowSymbol" ? { currencyDisplay: format.currencyDisplay } : {}) } : {}),
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  });
  return formatter.formatToParts(negative ? -1n : 1n).map(part => part.type === "integer" ? number : part.value).join("");
}

// 기능 : 날짜 전용 값은 날짜를 보존하고 instant는 사용자 시간대로 표시합니다.
function formatViewDate(value: string, binding: ViewDataBinding, locale: string, timeZone: string): string {
  const dateOnly = binding.attributeType === "Date";
  const date = new Date(dateOnly ? value + "T00:00:00Z" : value);
  if (!Number.isFinite(date.getTime())) return value;
  const format = viewValueObject(binding.format);
  const zone = dateOnly ? "UTC" : timeZone;
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: zone, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(date);
  // 기능 : Intl의 분리된 날짜 구성 요소를 저장된 날짜 형식에 대응합니다.
  const part = (type: string) => parts.find(item => item.type === type)?.value ?? "";
  if (format.dateFormat === "YYYY-MM-DD" && (dateOnly || !format.timeFormat)) return `${part("year")}-${part("month")}-${part("day")}`;
  return new Intl.DateTimeFormat(locale, { timeZone: zone, year: "numeric", month: "2-digit", day: "2-digit",
    ...(!dateOnly ? { hour: "2-digit", minute: "2-digit", ...(format.timeFormat === "HH:mm" ? { hour12: false } : {}) } as const : {}) }).format(date);
}

// 기능 : API가 공개한 값과 라벨을 표시하고 참조 ID나 복합 JSON 원문은 노출하지 않습니다.
export function formatViewValue(value: ViewJson, binding: ViewDataBinding, locale: string, timeZone: string, yes: string, no: string): string {
  if (value === null) return "";
  if (typeof value === "boolean") return value ? yes : no;
  if (typeof value === "string") {
    if (["Number", "Currency", "Rating"].includes(binding.attributeType)) return formatViewDecimal(value, binding, locale);
    if (binding.attributeType === "Date" || binding.attributeType === "Timestamp") return formatViewDate(value, binding, locale, timeZone);
    return value;
  }
  if (typeof value === "number") return String(value);
  const object = viewValueObject(value);
  for (const key of ["label", "displayName", "text", "summary"]) if (typeof object[key] === "string") return object[key];
  return "";
}

// 기능 : 직접 Record 값의 기존 셀 편집기를 재사용할 수 있는 입력으로 변환합니다.
export function toEditableRecordValue(binding: ViewDataBinding, entry: ViewCellValue): WorkspaceObjectRecordAttributeValueListItem {
  const value = entry.value;
  const object = viewValueObject(value);
  return { id: entry.valueDefinitionId, attributeDefinitionId: binding.attributeDefinitionId,
    attributeType: binding.attributeType as WorkspaceObjectRecordAttributeValueListItem["attributeType"],
    textValue: typeof value === "string" && !["Number", "Currency", "Rating", "Date", "Timestamp"].includes(binding.attributeType) ? value : null,
    numberValue: typeof value === "string" && ["Number", "Currency", "Rating"].includes(binding.attributeType) ? value : null,
    booleanValue: typeof value === "boolean" ? value : null,
    dateValue: binding.attributeType === "Date" && typeof value === "string" ? value : null,
    timestampValue: binding.attributeType === "Timestamp" && typeof value === "string" ? value : null,
    selectOptionId: binding.attributeType === "Select" && typeof object.id === "string" ? object.id : null,
    statusOptionId: binding.attributeType === "Status" && typeof object.id === "string" ? object.id : null,
    targetActorId: typeof object.actorId === "string" ? object.actorId : null,
    targetRecordDefinitionId: typeof object.recordDefinitionId === "string" ? object.recordDefinitionId : null,
    targetObjectDefinitionId: typeof object.objectDefinitionId === "string" ? object.objectDefinitionId : null,
    jsonValue: value,
  };
}
