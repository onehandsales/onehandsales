import type { AttributeDefinitionMetadata } from "@/modules/attribute-definition/application/ports/attribute-definition-metadata-query.port";
import type { AttributeValueSnapshot } from "@/modules/attribute-definition/application/attribute-value-snapshot";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import type { ViewDefinitionType } from "../view-definition-type";
import type {
  ViewAttributeSettingRow,
  ViewGroupRow,
} from "../view-header-configuration";
import type { ViewDataSnapshot } from "./view-data-loader";
import { valueKey } from "./view-data-json";

// 기능 : 테스트만 사용하는 안정적인 UUID를 생성합니다.
export const fixtureId = (value: number): string =>
  `00000000-0000-4000-8000-${String(value).padStart(12, "0")}`;
export const fixtureUser: CurrentUserContext = {
  id: fixtureId(1),
  sessionId: fixtureId(2),
  email: null,
  displayName: null,
  status: "ACTIVE",
  platformRole: "USER",
  timeZone: "Asia/Seoul",
};
// 기능 : DB 쓰기 없이 중복 Entry·소수 집계·기간 누락을 포함한 테스트 원본을 만듭니다.
export function viewDataFixture(type: ViewDefinitionType): ViewDataSnapshot {
  const workspaceId = fixtureId(3),
    viewId = fixtureId(4),
    objectId = fixtureId(5),
    listId = fixtureId(6),
    date = new Date("2026-11-01T00:00:00Z");
  const common = { workspaceId, viewDefinitionId: viewId, createdAt: date };
  const types = [
    "Text",
    "Number",
    "Status",
    "Date",
    "Date",
    "Location",
    "Number",
  ] as const;
  const attributes: AttributeDefinitionMetadata[] = types.map(
    (attributeType, index) => ({
      id: fixtureId(10 + index),
      workspaceId,
      objectDefinitionId: objectId,
      listDefinitionId: null,
      title: `attribute-${index}`,
      type: attributeType,
      icon: null,
      isMultiselect: false,
      configJson: null,
    }),
  );
  const bind = (
    index: number,
    role: ViewAttributeSettingRow["attributeDisplayRole"],
  ): ViewAttributeSettingRow => ({
    ...common,
    id: fixtureId(40 + index),
    attributeDefinitionId: fixtureId(10 + index),
    sourceScope: "RECORD",
    referenceAttributeIdPathJson: [],
    attributeDisplayRole: role,
    sortOrder: index,
    labelOverride: null,
    width: 180,
    isHidden: false,
    formatJson: role === "PROGRESS" ? { valueScale: 100 } : null,
  });
  const group = (
    role: ViewGroupRow["groupRole"],
    index: number,
  ): ViewGroupRow => ({
    ...common,
    id: fixtureId(50 + index),
    sourceScope: "RECORD",
    attributeDefinitionId: fixtureId(12),
    referenceAttributeIdPathJson: [],
    groupRole: role,
    sortDirection: "ASC",
    sortOrder: index,
    configJson: null,
  });
  const records = [0, 1].map((index) => ({
    id: fixtureId(70 + index),
    objectDefinitionId: objectId,
    createdAt: date.toISOString(),
  }));
  const items = [0, 0, 1].map((recordIndex, index) => {
    const entry = {
      id: fixtureId(80 + index),
      recordDefinitionId: records[recordIndex]!.id,
      createdAt: date.toISOString(),
    };
    return {
      key: `LIST_ENTRY:${entry.id}`,
      entry,
      record: records[recordIndex]!,
      createdAt: date.toISOString(),
    };
  });
  const values = new Map<string, AttributeValueSnapshot[]>();
  for (const [recordIndex, record] of records.entries())
    for (const [index, attribute] of attributes.entries()) {
      const row: AttributeValueSnapshot = {
        id: fixtureId(100 + recordIndex * 10 + index),
        ownerId: record.id,
        attributeDefinitionId: attribute.id,
        attributeType: attribute.type,
        textValue: index === 0 ? `Record ${recordIndex + 1}` : null,
        numberValue:
          index === 1
            ? recordIndex
              ? "0.2"
              : "0.1"
            : index === 6
              ? "50"
              : null,
        booleanValue: null,
        dateValue:
          index === 3
            ? "2026-11-09"
            : index === 4 && recordIndex === 0
              ? "2026-11-11"
              : null,
        timestampValue: null,
        selectOptionId: null,
        statusOptionId: index === 2 ? fixtureId(30 + recordIndex) : null,
        targetRecordDefinitionId: null,
        targetObjectDefinitionId: null,
        targetActorId: null,
        jsonValue:
          index === 5
            ? { text: "Origin", latitude: recordIndex ? 100 : 0, longitude: 0 }
            : null,
      };
      values.set(valueKey("RECORD", record.id, attribute.id), [row]);
    }
  const dated = ["CALENDAR", "TIMELINE", "GANTT"].includes(type),
    aggregated = type === "CHART" || type === "PIVOT";
  const bindings = [
    bind(0, "TITLE"),
    bind(1, aggregated ? "MEASURE" : "DISPLAY"),
    ...(dated ? [bind(3, "START_DATE"), bind(4, "END_DATE")] : []),
    ...(type === "GANTT" ? [bind(6, "PROGRESS")] : []),
    ...(type === "MAP" ? [bind(5, "LOCATION")] : []),
  ];
  return {
    configuration: {
      view: {
        id: viewId,
        workspaceId,
        objectDefinitionId: null,
        listDefinitionId: listId,
        name: "Fixture",
        type,
        configJson: aggregated ? { aggregation: "SUM" } : null,
      },
      viewAttributeSettingDefinitions: type === "DASHBOARD" ? [] : bindings,
      viewFilterGroupDefinitions: [],
      viewFilterConditionDefinitions: [],
      viewSortDefinitions: [],
      viewGroupDefinitions:
        type === "KANBAN" || type === "CHART"
          ? [group("GROUP", 0)]
          : type === "PIVOT"
            ? [group("PIVOT_ROW", 0), group("PIVOT_COLUMN", 1)]
            : [],
      viewGroupSettingDefinitions: [],
      viewWidgetDefinitions:
        type === "DASHBOARD"
          ? [
              {
                ...common,
                id: fixtureId(90),
                contentViewDefinitionId: fixtureId(91),
                sortOrder: 0,
                titleOverride: null,
                isHidden: false,
                layoutJson: { x: 0, y: 0, width: 6, height: 4 },
                configJson: null,
              },
            ]
          : [],
    },
    source: {
      kind: "LIST",
      objectDefinitionId: null,
      listDefinitionId: listId,
      itemKind: "LIST_ENTRY",
    },
    items,
    attributes: new Map(
      attributes.map((attribute) => [attribute.id, attribute]),
    ),
    values,
    records: new Map(records.map((record) => [record.id, record])),
    options: new Map(
      [0, 1].map((index) => {
        const option = {
          id: fixtureId(30 + index),
          workspaceId,
          attributeDefinitionId: fixtureId(12),
          title: `Stage ${index + 1}`,
          color: null,
          sortOrder: index,
          createdAt: date,
        };
        return [option.id, option];
      }),
    ),
    actors: new Map(),
    titles: [bind(0, "TITLE")],
    relationships: [],
    dependencies: [],
    children: [
      {
        id: fixtureId(91),
        workspaceId,
        name: "Child",
        type: "TABLE",
        objectDefinitionId: objectId,
        listDefinitionId: null,
        configJson: null,
      },
    ],
  };
}
