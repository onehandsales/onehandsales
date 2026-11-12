import type { JsonValue } from "@/shared/application/types/json-value";
import { DomainError } from "@/shared/domain/errors/domain-error";
import type { ViewDataConfiguration } from "./ports/view-data-configuration-query.port";
import * as map from "./view-header-menu.mapper";

// 기능 : 저장 입력·버전에 사용할 공개 설정만 매핑합니다.
export function viewConfigurationSections(value: ViewDataConfiguration) {
  return {
    filters: { viewFilterGroupDefinitions: value.viewFilterGroupDefinitions.map(map.mapFilterGroup), viewFilterConditionDefinitions: value.viewFilterConditionDefinitions.map(map.mapFilterCondition) },
    sorts: { viewSortDefinitions: value.viewSortDefinitions.map(map.mapSort) },
    settings: { configJson: value.view.configJson, viewAttributeSettingDefinitions: value.viewAttributeSettingDefinitions.map(map.mapAttributeSetting),
      viewGroupDefinitions: value.viewGroupDefinitions.map(map.mapGroup), viewGroupSettingDefinitions: value.viewGroupSettingDefinitions.map(map.mapGroupSetting) },
  };
}
export type ViewConfigurationSections = ReturnType<typeof viewConfigurationSections>;
export type ViewConfigurationChanges = Partial<ViewConfigurationSections>;

// 기능 : 입력 원문 대신 수정할 필드만 포함하는 안전한 오류를 만듭니다.
export function invalidViewConfiguration(field = "changes"): never {
  throw new DomainError("ViewConfigurationInvalid", "보기 설정을 확인해 주세요.", { field });
}

type Rule = (value: unknown) => boolean;
// 기능 : 설정 행 ID를 표준 소문자 UUID로 제한합니다.
const uuid: Rule = value => typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(value);
// 기능 : 정렬 순서가 DB Int 범위 안의 음수가 아닌 정수인지 검사합니다.
const order: Rule = value => Number.isSafeInteger(value) && Number(value) >= 0 && Number(value) <= 2147483647;
// 기능 : 암묵적 문자열 변환 없이 boolean만 허용합니다.
const bool: Rule = value => typeof value === "boolean";
// 기능 : nullable 참조의 명시 해제와 UUID 입력을 구분합니다.
const nullableUuid: Rule = value => value === null || uuid(value);
// 기능 : 표시명 초기화와 유효한 사용자 입력만 허용합니다.
const label: Rule = value => value === null || typeof value === "string" && value.trim().length > 0 && value.length <= 500;
// 기능 : 허용된 문자열 집합에 속하는지 검사하는 규칙을 만듭니다.
function oneOf(...values: string[]): Rule { return value => typeof value === "string" && values.includes(value); }
// 기능 : JSON 깊이와 키를 제한하여 실행 데이터가 아닌 값만 받습니다.
function json(value: unknown, depth = 0): boolean {
  if (depth > 10) return false;
  if (value === null || typeof value === "string" || typeof value === "boolean") return true;
  if (typeof value === "number") return Number.isFinite(value);
  if (Array.isArray(value)) return value.length <= 500 && value.every(item => json(item, depth + 1));
  return !!value && typeof value === "object" && Object.entries(value).every(([key, item]) => !["__proto__", "constructor", "prototype"].includes(key) && json(item, depth + 1));
}
const base = { id: uuid, sortOrder: order };
const reference = { sourceScope: oneOf("RECORD", "LIST_ENTRY"), attributeDefinitionId: uuid,
  referenceAttributeIdPathJson: (value: unknown) => Array.isArray(value) && value.length <= 3 && value.every(uuid) };
const filterGroup = { ...base, parentViewFilterGroupDefinitionId: nullableUuid, conditionGroupOperator: oneOf("AND", "OR") };
const condition = { ...base, ...reference, viewFilterGroupDefinitionId: uuid, comparisonOperator: oneOf("eq", "neq", "gt", "gte", "lt", "lte", "contains", "starts_with", "ends_with", "in", "not_in", "is_empty", "is_not_empty"), comparisonValueJson: json, multiValueMatchMode: oneOf("ANY", "ALL") };
const sort = { ...base, ...reference, sortDirection: oneOf("ASC", "DESC"), configJson: json };
const attribute = { ...base, ...reference, attributeDisplayRole: oneOf("TITLE", "DISPLAY", "BODY"), labelOverride: label,
  width: (value: unknown) => value === null || Number.isInteger(value) && Number(value) > 0 && Number(value) <= 2000, isHidden: bool, formatJson: json };
const group = { ...sort, groupRole: oneOf("GROUP") };
const groupSetting = { ...base, viewGroupDefinitionId: uuid, attributeDefinitionId: uuid, statusOptionId: nullableUuid, selectOptionId: nullableUuid,
  groupKeyJson: json, labelOverride: label, isHidden: bool, isFold: bool, configJson: json };

// 기능 : 필수 키를 모두 받고 알 수 없는 내부 필드는 거부합니다.
function object(value: unknown, fields: Record<string, Rule>, field: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) invalidViewConfiguration(field);
  const input = value as Record<string, unknown>;
  if (Object.keys(input).some(key => !Object.hasOwn(fields, key))) invalidViewConfiguration(field);
  for (const [key, rule] of Object.entries(fields)) if (!Object.hasOwn(input, key) || !rule(input[key])) invalidViewConfiguration(`${field}.${key}`);
  return input;
}
// 기능 : 설정 배열의 크기·행 형식·ID 중복을 검증합니다.
function rows(fields: Record<string, Rule>, field: string): Rule {
  return value => {
    if (!Array.isArray(value) || value.length > 500) return false;
    const ids = new Set<string>();
    for (const [index, row] of value.entries()) {
      const parsed = object(row, fields, `${field}.${index}`);
      if (ids.has(String(parsed.id))) return false;
      ids.add(String(parsed.id));
    }
    return true;
  };
}
// 기능 : HTTP와 내부 호출 모두 같은 엄격한 변경 계약을 검증합니다.
export function parseViewConfigurationChanges(value: unknown): ViewConfigurationChanges {
  if (!value || typeof value !== "object" || Array.isArray(value)) invalidViewConfiguration();
  const input = value as Record<string, unknown>;
  const keys = Object.keys(input);
  if (!keys.length || keys.some(key => !["filters", "sorts", "settings"].includes(key))) invalidViewConfiguration();
  if (Object.hasOwn(input, "filters")) object(input.filters, {
    viewFilterGroupDefinitions: rows(filterGroup, "filters.groups"), viewFilterConditionDefinitions: rows(condition, "filters.conditions"),
  }, "filters");
  if (Object.hasOwn(input, "sorts")) object(input.sorts, { viewSortDefinitions: rows(sort, "sorts") }, "sorts");
  if (Object.hasOwn(input, "settings")) object(input.settings, { configJson: json,
    viewAttributeSettingDefinitions: rows(attribute, "settings.attributes"), viewGroupDefinitions: rows(group, "settings.groups"), viewGroupSettingDefinitions: rows(groupSetting, "settings.groupSettings"),
  }, "settings");
  const parsed = structuredClone(value) as ViewConfigurationChanges;
  for (const row of [...parsed.settings?.viewAttributeSettingDefinitions ?? [], ...parsed.settings?.viewGroupSettingDefinitions ?? []])
    row.labelOverride = row.labelOverride?.trim() ?? null;
  return parsed;
}

// 기능 : 기존 감사 필드는 유지하고 요청 section만 실행용 설정에 합칩니다.
export function mergeViewConfiguration(current: ViewDataConfiguration, changes: ViewConfigurationChanges): ViewDataConfiguration {
  const scope = { workspaceId: current.view.workspaceId, viewDefinitionId: current.view.id };
  // 기능 : 기존 ID의 생성 시각을 유지하고 배열을 실행 우선순위로 정렬합니다.
  function merge<T extends { id: string; sortOrder: number }>(before: { id: string; createdAt: Date }[], next: T[]) {
    // 같은 우선순위의 새 행은 저장 시와 같이 기존 행 뒤에 두고 미리보기 cursor에는 안정된 시각을 사용한다.
    const newRowTime = new Date(Math.max(0, ...before.map(row => row.createdAt.getTime())) + 1);
    return next.map(row => ({ ...row, ...scope, createdAt: before.find(old => old.id === row.id)?.createdAt ?? newRowTime }))
      .sort((a, b) => a.sortOrder - b.sortOrder || a.createdAt.getTime() - b.createdAt.getTime() || a.id.localeCompare(b.id));
  }
  return { ...current, view: { ...current.view, configJson: changes.settings ? changes.settings.configJson : current.view.configJson },
    viewFilterGroupDefinitions: changes.filters ? merge(current.viewFilterGroupDefinitions, changes.filters.viewFilterGroupDefinitions) : current.viewFilterGroupDefinitions,
    viewFilterConditionDefinitions: changes.filters ? merge(current.viewFilterConditionDefinitions, changes.filters.viewFilterConditionDefinitions) : current.viewFilterConditionDefinitions,
    viewSortDefinitions: changes.sorts ? merge(current.viewSortDefinitions, changes.sorts.viewSortDefinitions) : current.viewSortDefinitions,
    viewAttributeSettingDefinitions: changes.settings ? merge(current.viewAttributeSettingDefinitions, changes.settings.viewAttributeSettingDefinitions) : current.viewAttributeSettingDefinitions,
    viewGroupDefinitions: changes.settings ? merge(current.viewGroupDefinitions, changes.settings.viewGroupDefinitions) : current.viewGroupDefinitions,
    viewGroupSettingDefinitions: changes.settings ? merge(current.viewGroupSettingDefinitions, changes.settings.viewGroupSettingDefinitions) : current.viewGroupSettingDefinitions,
  };
}

// 기능 : 감사 정보와 배열 입력 순서를 제외한 의미 비교용 JSON을 만듭니다.
export function canonicalConfiguration(value: unknown): JsonValue {
  if (Array.isArray(value)) {
    const rows = value.map(canonicalConfiguration);
    if (rows.every(row => row !== null && typeof row === "object" && !Array.isArray(row) && "id" in row))
      rows.sort((a, b) => String((a as Record<string, JsonValue>).id).localeCompare(String((b as Record<string, JsonValue>).id)));
    return rows;
  }
  if (value !== null && typeof value === "object") return Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([key, item]) => [key, canonicalConfiguration(item)]));
  return value as JsonValue;
}
