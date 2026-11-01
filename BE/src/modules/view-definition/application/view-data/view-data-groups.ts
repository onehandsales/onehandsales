import type { JsonValue } from "@/shared/application/types/json-value";
import type { ViewGroupRow } from "../view-header-configuration";
import type { ViewSourceItem } from "./view-data-loader";
import type { ViewDataGroup, ViewDimension } from "./view-data.types";
import {
  assertViewDataLimit,
  ViewDataConfigurationError,
  ViewDataNeedsConfiguration,
} from "./view-data.errors";
import { jsonObject } from "./view-data-json";
import { displayValue } from "./view-data-values";
import type { ViewDataQueryContext } from "./view-data-query-context";
import { localDate } from "./view-data-query-context";
import { decimalString, decimalUnits } from "./view-data-decimal";

export type ViewGroupBucket = {
  group: ViewDataGroup;
  dimension: ViewDimension;
  items: ViewSourceItem[];
  order: number;
};
// 기능 : 그룹 기준의 다중값을 identity별로 중복 제거하여 차원으로 변환합니다.
export function itemDimensions(
  context: ViewDataQueryContext,
  item: ViewSourceItem,
  row: ViewGroupRow,
): ViewDimension[] {
  const attribute = context.snapshot.attributes.get(row.attributeDefinitionId)!;
  const field = context.values.field(item, row);
  if (field.state === "INVALID" || field.state === "UNAVAILABLE")
    throw new ViewDataConfigurationError();
  if (["Location", "Interaction"].includes(attribute.type))
    throw new ViewDataNeedsConfiguration("GROUP_TYPE_UNSUPPORTED", "groups");
  const result = field.values.map((entry) =>
    dimension(context, row, entry.value),
  );
  const unique = [...new Map(result.map((value) => [value.key, value])).values()];
  if (unique.length > 1 && context.viewType === "KANBAN") {
    throw new ViewDataNeedsConfiguration("MULTIVALUE_KANBAN_GROUP_UNSUPPORTED", "groups");
  }
  return unique.length ? unique : [dimension(context, row, null)];
}
// 기능 : 옵션·참조의 ID와 표시 이름을 분리하고 날짜 그룹은 명시 단위로 묶습니다.
function dimension(
  context: ViewDataQueryContext,
  row: ViewGroupRow,
  value: JsonValue,
): ViewDimension {
  const attribute = context.snapshot.attributes.get(row.attributeDefinitionId)!;
  const object = jsonObject(value);
  let identity: JsonValue =
    object.id ?? object.recordDefinitionId ?? object.actorId ??
    (attribute.type === "PersonalName" && value !== null ? displayValue(value) : value);
  if (identity !== null && ["Number", "Currency", "Rating"].includes(attribute.type))
    identity = decimalString(decimalUnits(String(identity)));
  let label =
    value === null ? "값 없음" : displayValue(value) || "이름 없는 기록";
  if (
    value !== null &&
    (attribute.type === "Date" || attribute.type === "Timestamp")
  ) {
    const unit = jsonObject(row.configJson).dateUnit;
    if (!["DAY", "MONTH", "YEAR"].includes(String(unit)))
      throw new ViewDataNeedsConfiguration(
        "DATE_GROUP_UNIT_REQUIRED",
        "groups",
      );
    const date =
      attribute.type === "Timestamp"
        ? localDate(new Date(String(value)), context.user.timeZone ?? "UTC")
        : String(value);
    label = date.slice(0, unit === "YEAR" ? 4 : unit === "MONTH" ? 7 : 10);
    identity = label;
  }
  const reference: ViewDimension["reference"] =
    typeof identity !== "string"
      ? null
      : attribute.type === "Select"
        ? { kind: "SELECT_OPTION", id: identity }
        : attribute.type === "Status"
          ? { kind: "STATUS_OPTION", id: identity }
          : attribute.type === "RecordReference"
            ? { kind: "RECORD", id: identity }
            : attribute.type === "ActorReference"
              ? { kind: "ACTOR", id: identity }
              : null;
  return {
    key: context.codec.fingerprint({ group: row.id, value: identity }),
    label,
    reference,
  };
}
// 기능 : 전체 필터 결과로 그룹 개수·숨김·순서를 계산한 뒤 각 그룹 원본을 제공합니다.
export function groupBuckets(
  context: ViewDataQueryContext,
  row: ViewGroupRow,
  items = context.items,
  showEmpty = false,
): ViewGroupBucket[] {
  // 1. 저장 그룹 규칙을 확인하고 옵션 metadata를 담을 그룹 집합을 준비한다.
  if ((row.configJson !== null && (typeof row.configJson !== "object" || Array.isArray(row.configJson))) || Object.keys(jsonObject(row.configJson)).some((key) => key !== "dateUnit"))
    throw new ViewDataNeedsConfiguration("GROUP_CONFIG_UNSUPPORTED", "groups");
  const buckets = new Map<string, ViewGroupBucket>();
  // 기능 : 같은 값 identity를 하나의 그룹으로 모으고 옵션의 표시 정보를 복원합니다.
  const add = (value: ViewDimension) => {
    let bucket = buckets.get(value.key);
    if (!bucket) {
      const option =
        value.reference &&
        ["SELECT_OPTION", "STATUS_OPTION"].includes(value.reference.kind)
          ? context.snapshot.options.get(value.reference.id)
          : null;
      bucket = {
        dimension: value,
        group: {
          key: value.key,
          parentKey: null,
          label: value.label,
          color: option?.color ?? null,
          count: 0,
          isHidden: false,
          isFold: false,
        },
        items: [],
        order: option?.sortOrder ?? Number.MAX_SAFE_INTEGER,
      };
      buckets.set(value.key, bucket);
      assertViewDataLimit(buckets.size, 200);
    }
    return bucket;
  };
  // 2. 전체 일치 항목을 identity별로 분류하고 필요한 빈 옵션 그룹도 포함한다.
  if (showEmpty)
    for (const option of context.snapshot.options.values())
      if (option.attributeDefinitionId === row.attributeDefinitionId)
        add(dimension(context, row, { id: option.id, label: option.title }));
  for (const item of items)
    for (const value of itemDimensions(context, item, row)) {
      const bucket = add(value);
      bucket.items.push(item);
      bucket.group.count++;
    }
  // 3. 저장된 그룹별 표시명·순서·숨김·접힘을 실제 그룹에 적용한다.
  for (const setting of context.snapshot.configuration.viewGroupSettingDefinitions.filter(
    (setting) => setting.viewGroupDefinitionId === row.id,
  )) {
    if (
      setting.attributeDefinitionId !== row.attributeDefinitionId ||
      (setting.selectOptionId && setting.statusOptionId)
    )
      throw new ViewDataConfigurationError();
    const id = setting.selectOptionId ?? setting.statusOptionId;
    const option = id ? context.snapshot.options.get(id) : null;
    if (
      id &&
      (!option || option.attributeDefinitionId !== row.attributeDefinitionId)
    )
      throw new ViewDataConfigurationError();
    const groupKey = jsonObject(setting.groupKeyJson);
    const raw = id
      ? { id, label: option!.title }
      : (Object.hasOwn(groupKey, "value") ? groupKey.value! : setting.groupKeyJson);
    const key = dimension(context, row, raw).key;
    const bucket = buckets.get(key);
    if (!bucket) continue;
    bucket.order = setting.sortOrder;
    bucket.group = {
      ...bucket.group,
      label: setting.labelOverride ?? bucket.group.label,
      isHidden: setting.isHidden,
      isFold: setting.isFold,
    };
    bucket.dimension.label = bucket.group.label;
  }
  // 4. 명시 그룹·옵션 순서를 우선하고 표시명과 key로 동률을 결정한다.
  return [...buckets.values()].sort(
    (a, b) =>
      a.order - b.order ||
      a.group.label.localeCompare(b.group.label, "ko") *
        (row.sortDirection === "ASC" ? 1 : -1) ||
      a.group.key.localeCompare(b.group.key),
  );
}
// 기능 : 일반 행 보기의 그룹 계층을 원본 occurrence와 함께 펼칩니다.
export function groupedRows(context: ViewDataQueryContext) {
  const definitions =
    context.snapshot.configuration.viewGroupDefinitions.filter(
      (row) => row.groupRole === "GROUP",
    );
  if (definitions.length > 3)
    throw new ViewDataNeedsConfiguration("GROUP_DEPTH_UNSUPPORTED", "groups");
  const groups: ViewDataGroup[] = [];
  const rows: { item: ViewSourceItem; path: string[] }[] = [];
  // 기능 : 숨긴 그룹을 제외하며 하위 그룹 경로별 항목의 표시 위치를 구성합니다.
  const visit = (items: ViewSourceItem[], depth: number, path: string[]) => {
    const definition = definitions[depth];
    if (!definition) {
      rows.push(...items.map((item) => ({ item, path })));
      assertViewDataLimit(rows.length, 20000);
      return;
    }
    for (const bucket of groupBuckets(context, definition, items)) {
      const key = path.length
        ? context.codec.fingerprint({ parent: path, key: bucket.group.key })
        : bucket.group.key;
      groups.push({ ...bucket.group, key, parentKey: path.at(-1) ?? null });
      assertViewDataLimit(groups.length, 200);
      if (!bucket.group.isHidden)
        visit(bucket.items, depth + 1, [...path, key]);
    }
  };
  visit(context.items, 0, []);
  context.eligibleCount = new Set(rows.map((row) => row.item.key)).size;
  return { groups, rows };
}
