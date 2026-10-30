import type { AttributeDefinitionMetadata } from "@/modules/attribute-definition/application/ports/attribute-definition-metadata-query.port";
import type { AttributeValueSnapshot } from "@/modules/attribute-definition/application/attribute-value-snapshot";
import type { JsonValue } from "@/shared/application/types/json-value";
import type { ViewSourceScope } from "../view-header-configuration";
import type { ViewDataSnapshot, ViewSourceItem } from "./view-data-loader";
import type {
  ViewCell,
  ViewCellValue,
  ViewDataBinding,
  ViewDataItem,
} from "./view-data.types";
import { decimalString, decimalUnits } from "./view-data-decimal";
import { ViewDataConfigurationError, ViewDataNeedsConfiguration } from "./view-data.errors";
import { jsonObject, referencePath, valueId, valueKey } from "./view-data-json";

export type ViewField = {
  sourceScope: ViewSourceScope;
  attributeDefinitionId: string;
  referenceAttributeIdPathJson: JsonValue;
};
export type ResolvedViewField = {
  applicable: boolean;
  state: ViewCell["state"];
  values: ViewCellValue[];
  emptyValues: ViewCellValue[];
};

// 역할 : typed/JSON 값과 관계 경로를 해석하고 공개 cell을 구성합니다.
export class ViewDataValues {
  readonly bindings: ViewDataBinding[];
  private readonly fieldCache = new Map<string, ResolvedViewField>();
  // 기능 : 공개 binding과 실행 경로를 검증합니다.
  constructor(readonly snapshot: ViewDataSnapshot) {
    const config = snapshot.configuration;
    if (config.view.type === "DASHBOARD") { this.bindings = []; return; }
    for (const field of [
      ...config.viewAttributeSettingDefinitions,
      ...config.viewFilterConditionDefinitions,
      ...config.viewSortDefinitions,
      ...config.viewGroupDefinitions,
    ])
      this.validateField(field);
    this.bindings = config.viewAttributeSettingDefinitions.map((row) => {
      if (row.width !== null && (!Number.isFinite(row.width) || row.width <= 0 || row.width > 2000)) throw new ViewDataNeedsConfiguration("COLUMN_WIDTH_UNSUPPORTED", "width", row.id);
      const attribute = snapshot.attributes.get(row.attributeDefinitionId)!;
      const currency = jsonObject(jsonObject(attribute.configJson).currency);
      return {
        id: row.id,
        attributeDefinitionId: row.attributeDefinitionId,
        sourceScope: row.sourceScope,
        referenceAttributeIdPath: referencePath(
          row.referenceAttributeIdPathJson,
        ),
        role: row.attributeDisplayRole,
        label: row.labelOverride ?? attribute.title,
        attributeType: attribute.type,
        isMultiselect: attribute.isMultiselect,
        isHidden: row.isHidden,
        width: row.width,
        format: safeFormat(row.formatJson),
        currencyCode:
          attribute.type === "Currency" &&
          typeof currency.defaultCurrencyCode === "string"
            ? currency.defaultCurrencyCode
            : null,
      };
    });
  }

  // 기능 : 경로의 각 속성 소속과 명시된 관계 대상 Object를 검증합니다.
  private validateField(field: ViewField): void {
    const path = referencePath(field.referenceAttributeIdPathJson);
    const ids = [...path, field.attributeDefinitionId];
    let expectedObject: string | null =
      field.sourceScope === "RECORD"
        ? this.snapshot.source.objectDefinitionId
        : null;
    for (let i = 0; i < ids.length; i++) {
      const attribute = this.snapshot.attributes.get(ids[i]!);
      if (!attribute) throw new ViewDataConfigurationError();
      const entry = i === 0 && field.sourceScope === "LIST_ENTRY";
      if (
        entry
          ? !this.snapshot.source.listDefinitionId ||
            attribute.listDefinitionId !== this.snapshot.source.listDefinitionId
          : !attribute.objectDefinitionId ||
            (expectedObject !== null &&
              attribute.objectDefinitionId !== expectedObject)
      )
        throw new ViewDataConfigurationError();
      if (i < path.length) {
        if (attribute.type !== "RecordReference")
          throw new ViewDataConfigurationError();
        const targets = new Set(
          this.snapshot.relationships.flatMap((relation) =>
            relation.sourceAttributeDefinitionId === attribute.id
              ? [relation.targetObjectDefinitionId]
              : relation.targetAttributeDefinitionId === attribute.id
                ? [relation.sourceObjectDefinitionId]
                : [],
          ),
        );
        const configured = jsonObject(
          jsonObject(attribute.configJson).recordReference,
        ).objectDefinitionId;
        if (typeof configured === "string") targets.add(configured);
        if (targets.size !== 1) throw new ViewDataConfigurationError();
        expectedObject = [...targets][0]!;
      }
    }
  }

  // 기능 : 같은 원본과 경로의 결과를 재사용하면서 모든 다중값 출처를 보존합니다.
  field(item: ViewSourceItem, field: ViewField): ResolvedViewField {
    const path = referencePath(field.referenceAttributeIdPathJson);
    const cacheKey = `${item.key}:${field.sourceScope}:${path.join("/")}:${field.attributeDefinitionId}`;
    const cached = this.fieldCache.get(cacheKey);
    if (cached) return cached;
    let entities = [
      {
        kind: field.sourceScope,
        id:
          field.sourceScope === "RECORD"
            ? item.record.id
            : (item.entry?.id ?? ""),
      },
    ];
    let unavailable = false,
      invalid = false,
      applicable = true;
    const steps = [...path, field.attributeDefinitionId];
    for (const [step, id] of steps.entries()) {
      const attribute = this.snapshot.attributes.get(id)!;
      const terminal = step === steps.length - 1;
      const values: ViewCellValue[] = [];
      const emptyValues: ViewCellValue[] = [];
      for (const entity of entities) {
        if (
          entity.kind === "RECORD" &&
          this.snapshot.records.get(entity.id)?.objectDefinitionId !==
            attribute.objectDefinitionId
        ) {
          applicable = false;
          continue;
        }
        const rows =
          this.snapshot.values.get(valueKey(entity.kind, entity.id, id)) ?? [];
        if (!attribute.isMultiselect && rows.length > 1) {
          invalid = true;
          continue;
        }
        for (const row of rows) {
          try {
            const value = this.decode(row, attribute);
            if (value === undefined) {
              unavailable = true;
              continue;
            }
            (value === null ? emptyValues : values).push({
              valueDefinitionId: row.id,
              sourceEntity: entity,
              value,
            });
          } catch {
            invalid = true;
          }
        }
      }
      if (terminal) {
        const unique = [
          ...new Map(
            values.map((value) => [
              `${value.sourceEntity.kind}:${value.sourceEntity.id}:${value.valueDefinitionId}`,
              value,
            ]),
          ).values(),
        ];
        const result: ResolvedViewField = {
          applicable,
          state: invalid
            ? "INVALID"
            : unique.length
              ? "VALUE"
              : unavailable
                ? "UNAVAILABLE"
                : "EMPTY",
          values: invalid ? [] : unique,
          emptyValues: invalid ? [] : emptyValues,
        };
        this.fieldCache.set(cacheKey, result);
        return result;
      }
      entities = [
        ...new Set(
          values.flatMap((value) => {
            const target = jsonObject(value.value).recordDefinitionId;
            return typeof target === "string" ? [target] : [];
          }),
        ),
      ].map((id) => ({ kind: "RECORD" as const, id }));
    }
    throw new ViewDataConfigurationError();
  }

  // 기능 : 저장된 binding 순서와 원본 식별자를 본문 item으로 매핑합니다.
  item(item: ViewSourceItem, groupPath: string[] = []): ViewDataItem {
    const cells =
      this.snapshot.configuration.viewAttributeSettingDefinitions.map((row) => {
        const value = this.field(item, row);
        return {
          bindingId: row.id,
          state: value.state,
          values: [...value.values, ...value.emptyValues],
        };
      });
    const titleId = this.bindings.find(
      (binding) => binding.role === "TITLE",
    )?.id;
    const title =
      cells
        .find((cell) => cell.bindingId === titleId)
        ?.values.map((value) => displayValue(value.value))
        .filter(Boolean)
        .join(", ") ||
      this.recordTitle(item.record.id) ||
      "이름 없는 기록";
    return {
      itemKey: item.key,
      occurrenceKey: groupPath.length
        ? `${item.key}:${groupPath.join("/")}`
        : item.key,
      recordDefinitionId: item.record.id,
      objectDefinitionId: item.record.objectDefinitionId,
      listEntryDefinitionId: item.entry?.id ?? null,
      title,
      cells,
      groupPath,
    };
  }

  // 기능 : 같은 Object의 명시 TITLE가 한 속성으로 수렴할 때만 참조 이름을 제공합니다.
  private recordTitle(id: string): string | null {
    const record = this.snapshot.records.get(id);
    if (!record) return null;
    const ids = [
      ...new Set(
        this.snapshot.titles
          .filter(
            (title) =>
              this.snapshot.attributes.get(title.attributeDefinitionId)
                ?.objectDefinitionId === record.objectDefinitionId,
          )
          .map((title) => title.attributeDefinitionId),
      ),
    ];
    if (ids.length !== 1) return null;
    const rows =
      this.snapshot.values.get(valueKey("RECORD", id, ids[0]!)) ?? [];
    const names = rows
      .map(
        (row) =>
          row.textValue ??
          (typeof jsonObject(row.jsonValue).displayName === "string"
            ? (jsonObject(row.jsonValue).displayName as string)
            : null),
      )
      .filter(Boolean);
    return names.length === 1 ? names[0]! : null;
  }

  // 기능 : 속성 타입별 공개 값만 정규화하며 접근 불가 참조는 식별자를 반환하지 않습니다.
  private decode(
    row: AttributeValueSnapshot,
    attribute: AttributeDefinitionMetadata,
  ): JsonValue | undefined {
    if (row.attributeType !== attribute.type)
      throw new ViewDataConfigurationError();
    const json = jsonObject(row.jsonValue);
    switch (attribute.type) {
      case "Number":
      case "Currency":
      case "Rating": {
        const value =
          row.numberValue ??
          (typeof json.value === "string" ? json.value : null);
        return value === null ? null : decimalString(decimalUnits(value));
      }
      case "Checkbox":
        return (
          row.booleanValue ??
          (typeof json.value === "boolean" ? json.value : null)
        );
      case "Date": {
        const value =
          row.dateValue ?? (typeof json.value === "string" ? json.value : null);
        if (
          value &&
          (!/^\d{4}-\d{2}-\d{2}$/.test(value) ||
            new Date(value).toISOString().slice(0, 10) !== value)
        )
          throw new ViewDataConfigurationError();
        return value;
      }
      case "Timestamp": {
        const value =
          row.timestampValue ??
          (typeof json.value === "string" ? json.value : null);
        return value ? new Date(value).toISOString() : null;
      }
      case "Select":
      case "Status": {
        const id =
          attribute.type === "Select"
            ? valueId(row.selectOptionId, json, "selectOptionId")
            : valueId(row.statusOptionId, json, "statusOptionId");
        if (!id) return null;
        const option = this.snapshot.options.get(id);
        if (!option || option.attributeDefinitionId !== attribute.id)
          return undefined;
        return { id: option.id, label: option.title, color: option.color };
      }
      case "RecordReference": {
        const id = valueId(
          row.targetRecordDefinitionId,
          json,
          "recordDefinitionId",
          "targetRecordDefinitionId",
        );
        if (!id) return null;
        const record = this.snapshot.records.get(id);
        if (!record) return undefined;
        const allowed = this.snapshot.relationships.flatMap((relation) =>
          relation.sourceAttributeDefinitionId === attribute.id
            ? [relation.targetObjectDefinitionId]
            : relation.targetAttributeDefinitionId === attribute.id
              ? [relation.sourceObjectDefinitionId]
              : [],
        );
        if (allowed.length && !allowed.includes(record.objectDefinitionId))
          throw new ViewDataConfigurationError();
        const objectId = valueId(
          row.targetObjectDefinitionId,
          json,
          "objectDefinitionId",
          "targetObjectDefinitionId",
        );
        if (objectId && objectId !== record.objectDefinitionId)
          throw new ViewDataConfigurationError();
        return {
          recordDefinitionId: record.id,
          objectDefinitionId: record.objectDefinitionId,
          label: this.recordTitle(record.id),
        };
      }
      case "ActorReference": {
        const id = valueId(row.targetActorId, json, "actorId", "targetActorId");
        if (!id) return null;
        if (!this.snapshot.actors.has(id)) return undefined;
        return { actorId: id, label: this.snapshot.actors.get(id) ?? null };
      }
      case "PersonalName":
        return {
          displayName:
            typeof json.displayName === "string"
              ? json.displayName
              : (row.textValue ?? ""),
        };
      case "Location":
        return {
          text: typeof json.text === "string" ? json.text : row.textValue,
          latitude:
            typeof json.latitude === "number" && Number.isFinite(json.latitude)
              ? json.latitude
              : null,
          longitude:
            typeof json.longitude === "number" &&
            Number.isFinite(json.longitude)
              ? json.longitude
              : null,
        };
      case "Interaction":
        return {
          summary:
            typeof json.summary === "string" ? json.summary : row.textValue,
          occurredAt:
            typeof json.occurredAt === "string" ? json.occurredAt : null,
        };
      default:
        return (
          row.textValue ??
          (typeof json.value === "string"
            ? json.value
            : typeof row.jsonValue === "string"
              ? row.jsonValue
              : null)
        );
    }
  }
}

// 기능 : 검색·제목·범례에서 사용할 안전한 표시 문자열을 추출합니다.
export function displayValue(value: JsonValue): string {
  if (value === null) return "";
  if (typeof value !== "object") return String(value);
  const object = jsonObject(value);
  for (const key of ["label", "displayName", "text", "summary"])
    if (typeof object[key] === "string") return object[key];
  return "";
}
// 기능 : 브라우저가 사용하는 표시 옵션만 공개하고 원본 JSON 전체 노출을 막습니다.
function safeFormat(value: JsonValue): JsonValue {
  if (value !== null && (typeof value !== "object" || Array.isArray(value))) throw new ViewDataNeedsConfiguration("FORMAT_UNSUPPORTED", "format");
  const result: { [key: string]: JsonValue } = {};
  const object = jsonObject(value);
  if (object.style === "PERCENT" && object.valueScale !== 1 && object.valueScale !== 100) throw new ViewDataNeedsConfiguration("PERCENT_SCALE_REQUIRED", "format");
  if (object.fractionDigits !== undefined && (typeof object.fractionDigits !== "number" || !Number.isInteger(object.fractionDigits) || object.fractionDigits < 0 || object.fractionDigits > 10)) throw new ViewDataNeedsConfiguration("FRACTION_DIGITS_UNSUPPORTED", "format");
  for (const key of [
    "style",
    "valueScale",
    "fractionDigits",
    "dateFormat",
    "timeFormat",
    "currencyDisplay",
  ]) {
    const entry = object[key];
    if (
      typeof entry === "string" ||
      typeof entry === "number" ||
      typeof entry === "boolean"
    )
      result[key] = entry;
  }
  return Object.keys(result).length ? result : null;
}
