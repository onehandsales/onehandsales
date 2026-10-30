import type { AttributeDefinitionType } from "@/modules/attribute-definition/application/attribute-definition-type";
import type { JsonValue } from "@/shared/application/types/json-value";
import type { ViewFilterConditionRow } from "../view-header-configuration";
import type { ViewSourceItem } from "./view-data-loader";
import { decimalUnits } from "./view-data-decimal";
import {
  ViewDataConfigurationError,
  ViewDataNeedsConfiguration,
} from "./view-data.errors";
import { jsonObject } from "./view-data-json";
import { displayValue, ViewDataValues } from "./view-data-values";

const collator = new Intl.Collator("ko", {
  sensitivity: "variant",
  numeric: false,
});
const numericTypes = new Set<AttributeDefinitionType>([
  "Number",
  "Currency",
  "Rating",
]);
const textTypes = new Set<AttributeDefinitionType>([
  "Text",
  "Domain",
  "EmailAddress",
  "PhoneNumber",
  "PersonalName",
]);
// 기능 : 숫자 정밀도와 표시 이름을 구분하여 동등성·대소 비교를 수행합니다.
export function compareViewValue(
  a: JsonValue,
  b: JsonValue,
  type: AttributeDefinitionType,
): number {
  if (numericTypes.has(type)) {
    if (typeof a !== "string" || typeof b !== "string")
      throw new ViewDataConfigurationError();
    const x = decimalUnits(a),
      y = decimalUnits(b);
    return x < y ? -1 : x > y ? 1 : 0;
  }
  if (type === "Checkbox") return Number(a) - Number(b);
  return collator.compare(displayValue(a), displayValue(b));
}
// 기능 : 필터 identity 비교에서 이름이 같은 서로 다른 옵션·참조를 합치지 않습니다.
function identity(value: JsonValue): JsonValue {
  const object = jsonObject(value);
  return (
    object.id ??
    object.recordDefinitionId ??
    object.actorId ??
    (typeof value === "object" && value !== null ? displayValue(value) : value)
  );
}
// 기능 : 모든 필터 설정을 먼저 검증하고 빈 데이터에서도 손상을 숨기지 않습니다.
export function selectViewItems(
  values: ViewDataValues,
  search: string,
): ViewSourceItem[] {
  const config = values.snapshot.configuration;
  const groups = new Map(
    config.viewFilterGroupDefinitions.map((group) => [group.id, group]),
  );
  const tests = new Map<string, (item: ViewSourceItem) => boolean>();
  for (const group of groups.values()) {
    const seen = new Set<string>();
    let id: string | null = group.id;
    while (id !== null) {
      if (seen.has(id) || !groups.has(id))
        throw new ViewDataConfigurationError();
      seen.add(id);
      id = groups.get(id)!.parentViewFilterGroupDefinitionId;
    }
  }
  for (const condition of config.viewFilterConditionDefinitions) {
    if (!groups.has(condition.viewFilterGroupDefinitionId))
      throw new ViewDataConfigurationError();
    tests.set(condition.id, conditionTest(values, condition));
  }
  const children = new Map<string, string[]>(),
    conditions = new Map<string, string[]>();
  for (const group of groups.values())
    if (group.parentViewFilterGroupDefinitionId)
      children.set(group.parentViewFilterGroupDefinitionId, [
        ...(children.get(group.parentViewFilterGroupDefinitionId) ?? []),
        group.id,
      ]);
  for (const condition of config.viewFilterConditionDefinitions)
    conditions.set(condition.viewFilterGroupDefinitionId, [
      ...(conditions.get(condition.viewFilterGroupDefinitionId) ?? []),
      condition.id,
    ]);
  // 기능 : 빈 그룹은 조건 없음으로 처리하고 루트 조건은 AND로 평가합니다.
  const evaluate = (id: string, item: ViewSourceItem): boolean | null => {
    const results = [
      ...(conditions.get(id) ?? []).map((key) => tests.get(key)!(item)),
      ...(children.get(id) ?? [])
        .map((key) => evaluate(key, item))
        .filter((value): value is boolean => value !== null),
    ];
    return !results.length
      ? null
      : groups.get(id)!.conditionGroupOperator === "AND"
        ? results.every(Boolean)
        : results.some(Boolean);
  };
  const roots = [...groups.values()].filter(
    (group) => !group.parentViewFilterGroupDefinitionId,
  );
  const query = normalizeText(search);
  const selected = values.snapshot.items
    .filter((item) =>
      roots.every((group) => evaluate(group.id, item) !== false),
    )
    .filter((item) => {
      if (!query) return true;
      const rendered = values.item(item);
      const visible = new Set(
        values.bindings
          .filter((binding) => !binding.isHidden)
          .map((binding) => binding.id),
      );
      return (
        normalizeText(rendered.title).includes(query) ||
        rendered.cells.some(
          (cell) =>
            visible.has(cell.bindingId) &&
            cell.values.some((value) =>
              normalizeText(displayValue(value.value)).includes(query),
            ),
        )
      );
    });
  const sorters = config.viewSortDefinitions.map((sort) => {
    const attribute = values.snapshot.attributes.get(
      sort.attributeDefinitionId,
    )!;
    const options = jsonObject(sort.configJson);
    if (
      Object.keys(options).some((key) => !["nulls", "reducer"].includes(key)) ||
      (options.nulls !== undefined &&
        options.nulls !== "FIRST" &&
        options.nulls !== "LAST")
    )
      throw new ViewDataNeedsConfiguration("SORT_CONFIG_UNSUPPORTED", "sorts");
    if (
      attribute.isMultiselect &&
      options.reducer !== "MIN" &&
      options.reducer !== "MAX"
    )
      throw new ViewDataNeedsConfiguration(
        "MULTIVALUE_SORT_REDUCER_REQUIRED",
        "sorts",
      );
    if (attribute.type === "Location" || attribute.type === "Interaction")
      throw new ViewDataNeedsConfiguration("SORT_TYPE_UNSUPPORTED", "sorts");
    const keys = new Map<string, JsonValue | null>();
    for (const item of selected) {
      const field = values.field(item, sort);
      if (field.state === "INVALID" || field.state === "UNAVAILABLE")
        throw new ViewDataConfigurationError();
      const candidates = field.values
        .map((value) => value.value)
        .sort((x, y) => compareViewValue(x, y, attribute.type));
      if (
        candidates.length > 1 &&
        options.reducer !== "MIN" &&
        options.reducer !== "MAX"
      )
        throw new ViewDataNeedsConfiguration(
          "MULTIVALUE_SORT_REDUCER_REQUIRED",
          "sorts",
        );
      keys.set(
        item.key,
        options.reducer === "MAX"
          ? (candidates.at(-1) ?? null)
          : (candidates[0] ?? null),
      );
    }
    return { sort, attribute, options, keys };
  });
  return selected.sort((a, b) => {
    for (const { sort, attribute, options, keys } of sorters) {
      const x = keys.get(a.key) ?? null,
        y = keys.get(b.key) ?? null;
      if (x === null || y === null) {
        if (x !== y)
          return (x === null ? 1 : -1) * (options.nulls === "FIRST" ? -1 : 1);
        continue;
      }
      const result = compareViewValue(x, y, attribute.type);
      if (result) return result * (sort.sortDirection === "ASC" ? 1 : -1);
    }
    return a.createdAt.localeCompare(b.createdAt) || a.key.localeCompare(b.key);
  });
}

// 기능 : 연산자와 비교값을 타입별로 검사한 뒤 ANY/ALL 평가 함수를 구성합니다.
function conditionTest(
  values: ViewDataValues,
  row: ViewFilterConditionRow,
): (item: ViewSourceItem) => boolean {
  const type = values.snapshot.attributes.get(row.attributeDefinitionId)!.type;
  const operator = row.comparisonOperator.toLowerCase();
  const supported = [
    "eq",
    "neq",
    "gt",
    "gte",
    "lt",
    "lte",
    "contains",
    "starts_with",
    "ends_with",
    "in",
    "not_in",
    "is_empty",
    "is_not_empty",
  ];
  if (!supported.includes(operator))
    throw new ViewDataNeedsConfiguration(
      "FILTER_OPERATOR_UNSUPPORTED",
      "filters",
    );
  const empty = operator === "is_empty" || operator === "is_not_empty";
  if (
    ["contains", "starts_with", "ends_with"].includes(operator) &&
    !textTypes.has(type)
  )
    throw new ViewDataNeedsConfiguration(
      "FILTER_OPERATOR_TYPE_UNSUPPORTED",
      "filters",
    );
  if (
    ["gt", "gte", "lt", "lte"].includes(operator) &&
    !numericTypes.has(type) &&
    type !== "Date" &&
    type !== "Timestamp"
  )
    throw new ViewDataNeedsConfiguration(
      "FILTER_OPERATOR_TYPE_UNSUPPORTED",
      "filters",
    );
  if (!empty && (type === "Location" || type === "Interaction"))
    throw new ViewDataNeedsConfiguration("FILTER_TYPE_UNSUPPORTED", "filters");
  const object = jsonObject(row.comparisonValueJson);
  const input = object.value ?? object.values ?? row.comparisonValueJson;
  const candidates: JsonValue[] = ["in", "not_in"].includes(operator)
    ? Array.isArray(input)
      ? input
      : []
    : [input];
  if (
    !empty &&
    (!candidates.length ||
      candidates.some((value) =>
        numericTypes.has(type)
          ? typeof value !== "string" || !/^-?\d+(\.\d{1,10})?$/.test(value)
          : type === "Checkbox"
            ? typeof value !== "boolean"
            : typeof value !== "string",
      ))
  )
    throw new ViewDataConfigurationError();
  if (!empty && (type === "Date" || type === "Timestamp"))
    for (let index = 0; index < candidates.length; index++) {
      const value = String(candidates[index]);
      if (
        !Number.isFinite(Date.parse(value)) ||
        (type === "Date" &&
          (!/^\d{4}-\d{2}-\d{2}$/.test(value) ||
            new Date(value).toISOString().slice(0, 10) !== value))
      )
        throw new ViewDataConfigurationError();
      if (type === "Timestamp")
        candidates[index] = new Date(value).toISOString();
    }
  return (item) => {
    const field = values.field(item, row);
    if (!field.applicable) return false;
    if (field.state === "INVALID" || field.state === "UNAVAILABLE")
      throw new ViewDataConfigurationError();
    if (empty)
      return operator === "is_empty"
        ? !field.values.length
        : !!field.values.length;
    const matches = field.values.map((value) => {
      const raw = identity(value.value);
      const compare = (candidate: JsonValue) =>
        compareViewValue(raw, candidate, type);
      switch (operator) {
        case "eq":
          return compare(candidates[0]!) === 0;
        case "neq":
          return compare(candidates[0]!) !== 0;
        case "gt":
          return compare(candidates[0]!) > 0;
        case "gte":
          return compare(candidates[0]!) >= 0;
        case "lt":
          return compare(candidates[0]!) < 0;
        case "lte":
          return compare(candidates[0]!) <= 0;
        case "in":
          return candidates.some((candidate) => compare(candidate) === 0);
        case "not_in":
          return candidates.every((candidate) => compare(candidate) !== 0);
        case "contains":
          return normalizeText(displayValue(raw)).includes(
            normalizeText(String(candidates[0])),
          );
        case "starts_with":
          return normalizeText(displayValue(raw)).startsWith(
            normalizeText(String(candidates[0])),
          );
        case "ends_with":
          return normalizeText(displayValue(raw)).endsWith(
            normalizeText(String(candidates[0])),
          );
        default:
          return false;
      }
    });
    return (
      matches.length > 0 &&
      (row.multiValueMatchMode === "ALL"
        ? matches.every(Boolean)
        : matches.some(Boolean))
    );
  };
}
// 기능 : 검색용 문자열을 Unicode NFC와 대소문자 무시 형태로 정규화합니다.
function normalizeText(value: string): string {
  return value.normalize("NFC").toLocaleLowerCase("ko");
}
