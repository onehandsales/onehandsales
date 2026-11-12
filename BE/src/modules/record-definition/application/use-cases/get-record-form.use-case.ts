import { Inject, Injectable } from "@nestjs/common";
import { RECORD_ATTRIBUTE_SCHEMA_QUERY, type RecordAttributeSchemaQuery } from "@/modules/attribute-definition/application/ports/record-attribute-schema-query.port";
import { ATTRIBUTE_DEFINITION_METADATA_QUERY, type AttributeDefinitionMetadataQuery } from "@/modules/attribute-definition/application/ports/attribute-definition-metadata-query.port";
import { VIEW_DATA_CONFIGURATION_QUERY, type ViewDataConfigurationQuery } from "@/modules/view-definition/application/ports/view-data-configuration-query.port";
import { WORKSPACE_SNAPSHOT_QUERY, type WorkspaceSnapshotQuery } from "@/modules/workspace/application/ports/workspace-snapshot-query.port";
import { WORKSPACE_ACTOR_OPTIONS_QUERY, type WorkspaceActorOptionsQuery } from "@/modules/workspace/application/ports/workspace-actor-options-query.port";
import { OBJECT_DEFINITION_ACCESS_QUERY, type ObjectDefinitionAccessQuery } from "@/modules/object-definition/application/ports/object-definition-access-query.port";
import { READ_SNAPSHOT_RUNNER, type ReadSnapshotRunner } from "@/shared/application/ports/read-snapshot-runner.port";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { RECORD_OPTIONS_QUERY, type RecordOptionsQuery } from "../ports/record-options-query.port";
import { RecordDefinitionObjectDefinitionNotFoundError, RecordDefinitionWorkspaceNotFoundError } from "../../domain/record-definition.errors";
import { invalidRecordValue, RECORD_UUID } from "../record-value-codec";

// 역할 : 생성/수정 폼의 속성 및 선택 후보를 읽기 전용으로 제공합니다.
@Injectable()
export class GetRecordFormUseCase {
  // 기능 : 소유 모듈의 조회 port와 동일 snapshot 경계를 주입받습니다.
  constructor(
    @Inject(RECORD_ATTRIBUTE_SCHEMA_QUERY) private readonly schemas: RecordAttributeSchemaQuery,
    @Inject(ATTRIBUTE_DEFINITION_METADATA_QUERY) private readonly metadata: AttributeDefinitionMetadataQuery,
    @Inject(VIEW_DATA_CONFIGURATION_QUERY) private readonly views: ViewDataConfigurationQuery,
    @Inject(WORKSPACE_SNAPSHOT_QUERY) private readonly workspace: WorkspaceSnapshotQuery,
    @Inject(WORKSPACE_ACTOR_OPTIONS_QUERY) private readonly actors: WorkspaceActorOptionsQuery,
    @Inject(OBJECT_DEFINITION_ACCESS_QUERY) private readonly objects: ObjectDefinitionAccessQuery,
    @Inject(RECORD_OPTIONS_QUERY) private readonly records: RecordOptionsQuery,
    @Inject(READ_SNAPSHOT_RUNNER) private readonly snapshots: ReadSnapshotRunner,
  ) {}
  // 기능 : 속성 목록 또는 명시 속성 후보 25건을 같은 조회 시점으로 반환합니다.
  execute(user: CurrentUserContext, workspaceId: string, objectId: string, query: { attributeDefinitionId?: string; q?: string; cursor?: string } = {}) {
    const ws = workspaceId.toLowerCase(), object = objectId.toLowerCase();
    return this.snapshots.run(async context => {
      if (!await this.workspace.hasMembership(user.id, ws, context)) throw new RecordDefinitionWorkspaceNotFoundError();
      if (!await this.objects.hasObjectDefinitionInWorkspace({ workspaceId: ws, objectDefinitionId: object })) throw new RecordDefinitionObjectDefinitionNotFoundError();
      const schema = await this.schemas.load(ws, object, context, false);
      const attributes = schema.attributes.filter(row => row.objectDefinitionId === object && !row.listDefinitionId);
      if (!query.attributeDefinitionId) {
        if (query.q !== undefined || query.cursor !== undefined) invalidRecordValue();
        return { attributes: attributes.map(row => ({ id: row.id, title: row.title, type: row.type, isMultiselect: row.isMultiselect })) };
      }
      const attribute = attributes.find(row => row.id === query.attributeDefinitionId?.toLowerCase());
      if (!attribute) invalidRecordValue();
      const q = query.q?.trim() ?? "", cursor = query.cursor?.toLowerCase() ?? null;
      let items: { id: string; label: string | null }[];
      if (attribute.type === "Select" || attribute.type === "Status") {
        items = (attribute.type === "Select" ? schema.selectOptions : schema.statusOptions).filter(row => row.attributeDefinitionId === attribute.id && row.title.toLowerCase().includes(q.toLowerCase()) && (!cursor || row.id > cursor))
          .sort((a, b) => a.id.localeCompare(b.id)).slice(0, 26).map(row => ({ id: row.id, label: row.title }));
      } else if (attribute.type === "ActorReference") items = await this.actors.actorOptions(ws, q, cursor, 26, context);
      else if (attribute.type === "RecordReference") {
        const relation = schema.relationships.find(row => row.sourceAttributeDefinitionId === attribute.id || row.targetAttributeDefinitionId === attribute.id);
        const config = attribute.configJson as { recordReference?: { objectDefinitionId?: string } } | null;
        const target = relation ? (relation.sourceAttributeDefinitionId === attribute.id ? relation.targetObjectDefinitionId : relation.sourceObjectDefinitionId) : config?.recordReference?.objectDefinitionId ?? null;
        if (target !== null && (typeof target !== "string" || !RECORD_UUID.test(target))) invalidRecordValue();
        const bindings = await this.views.titles(ws, context);
        const titleAttributes = await this.metadata.findAttributes(ws, bindings.map(row => row.attributeDefinitionId), context);
        const ids = titleAttributes.filter(row => row.objectDefinitionId && !row.listDefinitionId && (!target || row.objectDefinitionId === target)).map(row => row.id);
        items = await this.records.find({ workspaceId: ws, objectId: target, titleAttributeIds: ids, q, cursor, take: 26 }, context);
      } else invalidRecordValue();
      const hasNextPage = items.length > 25, page = items.slice(0, 25);
      return { items: page.map(row => ({ id: row.id, label: row.label ?? "이름 없는 담당자" })), pageInfo: { hasNextPage, nextCursor: hasNextPage ? page.at(-1)!.id : null } };
    });
  }
}
