import { Inject, Injectable } from "@nestjs/common";
import {
  ATTRIBUTE_DEFINITION_METADATA_QUERY,
  type AttributeDefinitionMetadataQuery,
  type AttributeDefinitionMetadata,
  type AttributeOptionMetadata,
} from "@/modules/attribute-definition/application/ports/attribute-definition-metadata-query.port";
import {
  ATTRIBUTE_RELATIONSHIP_QUERY,
  type AttributeRelationshipQuery,
  type AttributeRelationshipSnapshot,
} from "@/modules/attribute-definition/application/ports/attribute-relationship-query.port";
import type { AttributeValueSnapshot } from "@/modules/attribute-definition/application/attribute-value-snapshot";
import {
  RECORD_DATA_QUERY,
  type RecordDataQuery,
  type RecordDataSnapshot,
} from "@/modules/record-definition/application/ports/record-data-query.port";
import {
  LIST_ENTRY_DATA_QUERY,
  type ListEntryDataQuery,
  type ListEntryDataSnapshot,
} from "@/modules/list-definition/application/ports/list-entry-data-query.port";
import {
  OBJECT_DEFINITION_SUMMARY_QUERY,
  type ObjectDefinitionSummaryQuery,
} from "@/modules/object-definition/application/ports/object-definition-summary-query.port";
import {
  WORKSPACE_SNAPSHOT_QUERY,
  type WorkspaceSnapshotQuery,
} from "@/modules/workspace/application/ports/workspace-snapshot-query.port";
import type { TransactionContext } from "@/shared/application/ports/transaction-manager.port";
import { ValidationDomainError } from "@/shared/domain/errors/common.errors";
import {
  VIEW_DATA_CONFIGURATION_QUERY,
  type ViewDataConfigurationQuery,
  type ViewDataConfiguration,
  type WorkDependencySnapshot,
} from "../ports/view-data-configuration-query.port";
import type {
  ViewAttributeSettingRow,
  ViewHeaderDefinition,
} from "../view-header-configuration";
import type { ViewDataRequest, ViewDataSource } from "./view-data.types";
import {
  assertViewDataLimit,
  ViewDataConfigurationError,
  ViewDataNeedsConfiguration,
} from "./view-data.errors";
import { jsonObject, referencePath, valueId, valueKey } from "./view-data-json";

export type ViewSourceItem = {
  key: string;
  record: RecordDataSnapshot;
  entry: ListEntryDataSnapshot | null;
  createdAt: string;
};
// 역할 : 같은 읽기 시점의 설정·원본·메타데이터를 타입별 계산기에 제공합니다.
export interface ViewDataSnapshot {
  configuration: ViewDataConfiguration;
  source: ViewDataSource;
  items: ViewSourceItem[];
  attributes: Map<string, AttributeDefinitionMetadata>;
  options: Map<string, AttributeOptionMetadata>;
  records: Map<string, RecordDataSnapshot>;
  values: Map<string, AttributeValueSnapshot[]>;
  actors: Map<string, string | null>;
  titles: ViewAttributeSettingRow[];
  relationships: AttributeRelationshipSnapshot[];
  dependencies: WorkDependencySnapshot[];
  children: ViewHeaderDefinition[];
}

// 기능 : 단일 소속을 유도하고 이중 소속은 명시적 선택만 허용합니다.
export function resolveViewSource(
  view: ViewHeaderDefinition,
  request: ViewDataRequest,
): ViewDataSource {
  const { objectDefinitionId: objectId, listDefinitionId: listId } = view;
  if (objectId && listId && !request.sourceType)
    throw new ValidationDomainError(
      "sourceType is required for a View with two sources",
    );
  const kind =
    request.sourceType ?? (objectId ? "OBJECT" : listId ? "LIST" : "NONE");
  if ((kind === "OBJECT" && !objectId) || (kind === "LIST" && !listId))
    throw new ValidationDomainError("sourceType does not belong to this View");
  return {
    kind,
    objectDefinitionId: kind === "OBJECT" ? objectId : null,
    listDefinitionId: kind === "LIST" ? listId : null,
    itemKind:
      kind === "OBJECT" ? "RECORD" : kind === "LIST" ? "LIST_ENTRY" : null,
  };
}

// 역할 : 소유 모듈의 공개 Port로 원본과 참조 값을 제한된 배치로 읽습니다.
@Injectable()
export class ViewDataLoader {
  // 기능 : 설정과 소유 모듈의 읽기 계약을 주입받습니다.
  constructor(
    @Inject(VIEW_DATA_CONFIGURATION_QUERY)
    private readonly views: ViewDataConfigurationQuery,
    @Inject(RECORD_DATA_QUERY) private readonly records: RecordDataQuery,
    @Inject(LIST_ENTRY_DATA_QUERY) private readonly entries: ListEntryDataQuery,
    @Inject(OBJECT_DEFINITION_SUMMARY_QUERY)
    private readonly objects: ObjectDefinitionSummaryQuery,
    @Inject(ATTRIBUTE_DEFINITION_METADATA_QUERY)
    private readonly metadata: AttributeDefinitionMetadataQuery,
    @Inject(ATTRIBUTE_RELATIONSHIP_QUERY)
    private readonly relationships: AttributeRelationshipQuery,
    @Inject(WORKSPACE_SNAPSHOT_QUERY)
    private readonly workspace: WorkspaceSnapshotQuery,
  ) {}

  // 기능 : 전체 필터 대상과 필요한 속성만 snapshot 내부에서 복원합니다.
  async load(
    configuration: ViewDataConfiguration,
    source: ViewDataSource,
    context: TransactionContext,
  ): Promise<ViewDataSnapshot> {
    const workspaceId = configuration.view.workspaceId;
    const snapshot: ViewDataSnapshot = {
      configuration,
      source,
      items: [],
      attributes: new Map(),
      options: new Map(),
      records: new Map(),
      values: new Map(),
      actors: new Map(),
      titles: [],
      relationships: [],
      dependencies: [],
      children: [],
    };
    // 1. Dashboard는 구성만 읽고 자식 원본 쿼리를 서버에서 재귀 실행하지 않는다.
    if (configuration.view.type === "DASHBOARD") {
      const ids = [
        ...new Set(
          configuration.viewWidgetDefinitions
            .filter((row) => !row.isHidden)
            .map((row) => row.contentViewDefinitionId),
        ),
      ];
      assertViewDataLimit(ids.length, 50);
      snapshot.children = await this.views.children(workspaceId, ids, context);
      return snapshot;
    }
    if (source.kind === "NONE")
      throw new ViewDataNeedsConfiguration("SOURCE_REQUIRED", "sourceType");
    if (
      source.objectDefinitionId &&
      !(await this.objects.findObjectDefinitionSummary(
        { workspaceId, objectDefinitionId: source.objectDefinitionId },
        context,
      ))
    )
      throw new ViewDataConfigurationError();
    if (
      source.listDefinitionId &&
      !(await this.entries.exists(
        workspaceId,
        source.listDefinitionId,
        context,
      ))
    )
      throw new ViewDataConfigurationError();
    // 2. Entry를 원본 단위로 유지하고 연결 Record만 중복 제거하여 읽는다.
    if (source.objectDefinitionId) {
      let after: string | null = null;
      for (;;) {
        const rows = await this.records.list(
          workspaceId,
          source.objectDefinitionId,
          after,
          250,
          context,
        );
        rows.forEach((record) => {
          snapshot.records.set(record.id, record);
          snapshot.items.push({
            key: `RECORD:${record.id}`,
            record,
            entry: null,
            createdAt: record.createdAt,
          });
        });
        assertViewDataLimit(snapshot.items.length, 5000);
        if (rows.length < 250) break;
        after = rows.at(-1)!.id;
      }
    } else if (source.listDefinitionId) {
      const entries: ListEntryDataSnapshot[] = [];
      let after: string | null = null;
      for (;;) {
        const rows = await this.entries.list(
          workspaceId,
          source.listDefinitionId,
          after,
          250,
          context,
        );
        entries.push(...rows);
        assertViewDataLimit(entries.length, 5000);
        if (rows.length < 250) break;
        after = rows.at(-1)!.id;
      }
      for (const ids of batches([
        ...new Set(entries.map((entry) => entry.recordDefinitionId)),
      ])) {
        (await this.records.find(workspaceId, ids, context)).forEach((record) =>
          snapshot.records.set(record.id, record),
        );
      }
      for (const entry of entries) {
        const record = snapshot.records.get(entry.recordDefinitionId);
        if (!record) throw new ViewDataConfigurationError();
        snapshot.items.push({
          key: `LIST_ENTRY:${entry.id}`,
          record,
          entry,
          createdAt: entry.createdAt,
        });
      }
    }
    // 3. 필터·정렬·그룹 경로와 명시 TITLE의 메타데이터만 모은다.
    snapshot.titles = await this.views.titles(workspaceId, context);
    const configured = [
      ...configuration.viewAttributeSettingDefinitions,
      ...configuration.viewFilterConditionDefinitions,
      ...configuration.viewSortDefinitions,
      ...configuration.viewGroupDefinitions,
    ];
    const requiredIds = [
      ...new Set(
        configured.flatMap((row) => [
          row.attributeDefinitionId,
          ...referencePath(row.referenceAttributeIdPathJson),
        ]),
      ),
    ];
    const attributeIds = [
      ...new Set([
        ...requiredIds,
        ...snapshot.titles.map((row) => row.attributeDefinitionId),
      ]),
    ];
    for (const ids of batches(attributeIds))
      (await this.metadata.findAttributes(workspaceId, ids, context)).forEach(
        (attribute) => snapshot.attributes.set(attribute.id, attribute),
      );
    if (requiredIds.some((id) => !snapshot.attributes.has(id)))
      throw new ViewDataConfigurationError();
    const attributes = [...snapshot.attributes.values()];
    const options = await this.metadata.findOptions(
      {
        workspaceId,
        selectAttributeIds: attributes
          .filter((a) => a.type === "Select")
          .map((a) => a.id),
        statusAttributeIds: attributes
          .filter((a) => a.type === "Status")
          .map((a) => a.id),
        selectOptionIds: [],
        statusOptionIds: [],
      },
      context,
    );
    assertViewDataLimit(
      options.selectOptions.length + options.statusOptions.length,
      10000,
    );
    [...options.selectOptions, ...options.statusOptions].forEach((option) =>
      snapshot.options.set(option.id, option),
    );
    snapshot.relationships = await this.relationships.find(
      workspaceId,
      attributeIds,
      context,
    );
    let valueCount = 0;
    const addValues = (
      kind: "RECORD" | "LIST_ENTRY",
      rows: AttributeValueSnapshot[],
    ) => {
      valueCount += rows.length;
      assertViewDataLimit(valueCount, 100000);
      for (const row of rows) {
        const key = valueKey(kind, row.ownerId, row.attributeDefinitionId);
        const previous = snapshot.values.get(key) ?? [];
        previous.push(row);
        snapshot.values.set(key, previous);
      }
    };
    for (const ids of batches([...snapshot.records.keys()]))
      addValues(
        "RECORD",
        await this.records.values(
          workspaceId,
          ids,
          attributeIds,
          100001 - valueCount,
          context,
        ),
      );
    if (source.listDefinitionId)
      for (const ids of batches(snapshot.items.map((item) => item.entry!.id)))
        addValues(
          "LIST_ENTRY",
          await this.entries.values(
            workspaceId,
            source.listDefinitionId,
            ids,
            attributeIds,
            100001 - valueCount,
            context,
          ),
        );
    // 4. 경로와 표시 참조를 최대 네 단계(경로 3 + 말단 라벨)까지 배치 복원한다.
    const loaded = new Set(snapshot.records.keys());
    let referenceCount = 0;
    for (let depth = 0; depth < 4; depth++) {
      const targets = new Set<string>();
      for (const rows of snapshot.values.values())
        for (const row of rows)
          if (row.attributeType === "RecordReference") {
            const id = valueId(
              row.targetRecordDefinitionId,
              jsonObject(row.jsonValue),
              "recordDefinitionId",
              "targetRecordDefinitionId",
            );
            if (id && !loaded.has(id)) targets.add(id);
          }
      if (!targets.size) break;
      referenceCount += targets.size;
      assertViewDataLimit(referenceCount, 2000);
      for (const ids of batches([...targets])) {
        ids.forEach((id) => loaded.add(id));
        const records = await this.records.find(workspaceId, ids, context);
        records.forEach((record) => snapshot.records.set(record.id, record));
        addValues(
          "RECORD",
          await this.records.values(
            workspaceId,
            records.map((record) => record.id),
            attributeIds,
            100001 - valueCount,
            context,
          ),
        );
      }
    }
    const actorIds = new Set<string>();
    for (const rows of snapshot.values.values())
      for (const row of rows)
        if (row.attributeType === "ActorReference") {
          const id = valueId(
            row.targetActorId,
            jsonObject(row.jsonValue),
            "actorId",
            "targetActorId",
          );
          if (id) actorIds.add(id);
        }
    for (const ids of batches([...actorIds]))
      (await this.workspace.actors(workspaceId, ids, context)).forEach(
        (actor) => snapshot.actors.set(actor.id, actor.label),
      );
    if (configuration.view.type === "GANTT")
      snapshot.dependencies = await this.views.dependencies(
        workspaceId,
        snapshot.items.map((item) => item.record.id),
        snapshot.items.flatMap((item) => (item.entry ? [item.entry.id] : [])),
        context,
      );
    return snapshot;
  }
}
// 기능 : 조회 입력 ID를 고정 크기의 배치로 나눕니다.
function batches<T>(items: T[]): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < items.length; i += 250)
    result.push(items.slice(i, i + 250));
  return result;
}
