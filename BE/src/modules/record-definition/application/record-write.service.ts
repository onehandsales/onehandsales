import { Inject, Injectable } from "@nestjs/common";
import { RECORD_ATTRIBUTE_SCHEMA_QUERY, type RecordAttributeSchema, type RecordAttributeSchemaQuery } from "@/modules/attribute-definition/application/ports/record-attribute-schema-query.port";
import type { AttributeDefinitionMetadata } from "@/modules/attribute-definition/application/ports/attribute-definition-metadata-query.port";
import { OBJECT_DEFINITION_ACCESS_QUERY, type ObjectDefinitionAccessQuery } from "@/modules/object-definition/application/ports/object-definition-access-query.port";
import { WORKSPACE_ACCESS_QUERY, type WorkspaceAccessQuery } from "@/modules/workspace/application/ports/workspace-access-query.port";
import { WORKSPACE_SNAPSHOT_QUERY, type WorkspaceSnapshotQuery } from "@/modules/workspace/application/ports/workspace-snapshot-query.port";
import { TRANSACTION_MANAGER, type TransactionContext, type TransactionManager } from "@/shared/application/ports/transaction-manager.port";
import { APPLICATION_LOGGER, type ApplicationLogger } from "@/shared/application/ports/application-logger.port";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { DomainError } from "@/shared/domain/errors/domain-error";
import { RECORD_WRITE_REPOSITORY, type RecordWriteRepository, type StoredRecordValue } from "./ports/record-write.repository";
import type { RecordAttributeValueDefinitionValuePatch as ValuePatch } from "./ports/record-definition-command.repository";
import { emptyRecordValue, encodeRecordValue, invalidRecordValue, recordValueKey, recordValueObject, RECORD_UUID } from "./record-value-codec";
import { RecordAttributeValueDefinitionNotFoundError, RecordDefinitionObjectDefinitionNotFoundError, RecordDefinitionRecordNotFoundError, RecordDefinitionWorkspaceNotFoundError } from "../domain/record-definition.errors";

// 역할 : 생성 시 속성 단위 초기값과 재시도 키를 전달합니다.
export interface CreateRecordCommand {
  creationId?: string;
  values?: { attributeDefinitionId: string; values: unknown[] }[];
}
type WriteScope = { workspaceId: string; objectId: string; actorId: string; context: TransactionContext; schema: RecordAttributeSchema };
// 기능 : 값을 노출하지 않는 충돌 오류를 만듭니다.
function conflict(code = "RecordValueConflict"): never { throw new DomainError(code, "Record write conflicts with current data"); }

// 역할 : Record 생성/수정의 공통 검증·양방향 관계·transaction을 담당합니다.
@Injectable()
export class RecordWriteService {
  // 기능 : 소유 모듈 공개 port와 Record 저장 port를 주입받습니다.
  constructor(
    @Inject(WORKSPACE_ACCESS_QUERY) private readonly workspace: WorkspaceAccessQuery,
    @Inject(WORKSPACE_SNAPSHOT_QUERY) private readonly snapshots: WorkspaceSnapshotQuery,
    @Inject(OBJECT_DEFINITION_ACCESS_QUERY) private readonly objects: ObjectDefinitionAccessQuery,
    @Inject(RECORD_ATTRIBUTE_SCHEMA_QUERY) private readonly schemas: RecordAttributeSchemaQuery,
    @Inject(RECORD_WRITE_REPOSITORY) private readonly records: RecordWriteRepository,
    @Inject(TRANSACTION_MANAGER) private readonly transactions: TransactionManager,
    @Inject(APPLICATION_LOGGER) private readonly logger: ApplicationLogger,
  ) {}

  // 기능 : 초기값과 역방향 관계를 원자적으로 생성하고 같은 생성 키 재시도를 검증합니다.
  async create(user: CurrentUserContext, workspaceId: string, objectId: string, command: CreateRecordCommand = {}, requestId: string | null = null) {
    if (command.creationId !== undefined && (typeof command.creationId !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(command.creationId))) invalidRecordValue();
    if (command.values !== undefined && (!Array.isArray(command.values) || command.values.length > 100 || !command.creationId)) invalidRecordValue();
    const requested = new Map<string, unknown[]>(); let count = 0;
    for (const row of command.values ?? []) {
      if (!row || typeof row.attributeDefinitionId !== "string" || !RECORD_UUID.test(row.attributeDefinitionId) || !Array.isArray(row.values) || row.values.length > 100) invalidRecordValue();
      const id = row.attributeDefinitionId.toLowerCase();
      if (requested.has(id) || (count += row.values.length) > 500) invalidRecordValue();
      requested.set(id, row.values);
    }
    return this.run(user, workspaceId, objectId, requestId, async scope => {
      const attributes = scope.schema.attributes.filter(row => row.objectDefinitionId === scope.objectId && !row.listDefinitionId);
      if ([...requested.keys()].some(id => !attributes.some(row => row.id === id))) invalidRecordValue();
      const prepared = new Map<string, ValuePatch[]>();
      for (const attribute of attributes) {
        const raw = requested.get(attribute.id) ?? [];
        if (!attribute.isMultiselect && raw.length > 1) invalidRecordValue();
        const values: ValuePatch[] = [];
        for (const value of raw.length ? raw : [null]) values.push(await this.prepare(scope, attribute, value));
        const referenceValues = values.filter(value => value.targetRecordDefinitionId || value.targetActorId || value.selectOptionId || value.statusOptionId);
        if (new Set(referenceValues.map(recordValueKey)).size !== referenceValues.length) invalidRecordValue();
        prepared.set(attribute.id, values);
      }
      const creationId = command.creationId?.toLowerCase();
      if (creationId) {
        const existing = await this.records.record(creationId, scope.context);
        if (existing) {
          if (existing.workspaceId !== scope.workspaceId || existing.objectDefinitionId !== scope.objectId || existing.createdByActorId !== scope.actorId) conflict("RecordCreationConflict");
          const current = await this.records.values(scope.workspaceId, creationId, scope.context);
          if (current.some(row => !prepared.has(row.attributeDefinitionId))) conflict("RecordCreationConflict");
          for (const attribute of attributes) {
            const actual = current.filter(row => row.attributeDefinitionId === attribute.id).map(recordValueKey).sort();
            const expected = prepared.get(attribute.id)!.map(recordValueKey).sort();
            if (JSON.stringify(actual) !== JSON.stringify(expected)) conflict("RecordCreationConflict");
          }
          return { recordDefinitionId: creationId };
        }
      }
      // 1. 원본과 빈 셀을 만든 뒤 같은 transaction에서 검증된 초기값·역방향 값을 채운다.
      const created = await this.records.createRecordDefinition({ workspaceId: scope.workspaceId, objectDefinitionId: scope.objectId,
        createdByActorId: scope.actorId, ...(creationId ? { recordDefinitionId: creationId } : {}),
        attributes: attributes.map(row => ({ id: row.id, type: row.type })), transactionContext: scope.context });
      const blank = await this.records.values(scope.workspaceId, created.id, scope.context);
      for (const attribute of attributes) {
        for (const [index, value] of prepared.get(attribute.id)!.entries()) {
          const before = index === 0 ? blank.find(row => row.attributeDefinitionId === attribute.id) : undefined;
          await this.save(scope, created.id, attribute, before, value);
        }
      }
      return { recordDefinitionId: created.id };
    }, "crm.recordDefinition.created");
  }

  // 기능 : 단일 값 행을 수정하고 다른 속성·다중값 occurrence를 보존합니다.
  async update(user: CurrentUserContext, workspaceId: string, objectId: string, recordId: string, valueId: string, value: unknown, requestId: string | null = null) {
    return this.run(user, workspaceId, objectId, requestId, async scope => {
      const record = await this.records.record(recordId.toLowerCase(), scope.context);
      if (!record || record.workspaceId !== scope.workspaceId || record.objectDefinitionId !== scope.objectId) throw new RecordDefinitionRecordNotFoundError();
      const rows = await this.records.values(scope.workspaceId, record.id, scope.context);
      const before = rows.find(row => row.id === valueId.toLowerCase());
      if (!before) throw new RecordAttributeValueDefinitionNotFoundError();
      const attribute = scope.schema.attributes.find(row => row.id === before.attributeDefinitionId && row.objectDefinitionId === scope.objectId && !row.listDefinitionId);
      if (!attribute || attribute.type !== before.attributeType) conflict();
      const prepared = await this.prepare(scope, attribute, value);
      const siblings = rows.filter(row => row.attributeDefinitionId === attribute.id && row.id !== before.id && recordValueKey(row) !== recordValueKey(emptyRecordValue()));
      const isReference = prepared.targetRecordDefinitionId || prepared.targetActorId || prepared.selectOptionId || prepared.statusOptionId;
      if ((!attribute.isMultiselect && siblings.length) || (isReference && siblings.some(row => recordValueKey(row) === recordValueKey(prepared)))) conflict();
      await this.save(scope, record.id, attribute, before, prepared);
      return { recordAttributeValueDefinitionId: before.id };
    }, "crm.recordAttributeValueDefinition.updated");
  }

  // 기능 : 권한과 정의 검증을 transaction 안에서 재확인하고 안전한 이벤트만 기록합니다.
  private async run<T>(user: CurrentUserContext, workspaceId: string, objectId: string, requestId: string | null,
    work: (scope: WriteScope) => Promise<T>, event: string): Promise<T> {
    const ws = workspaceId.toLowerCase(), object = objectId.toLowerCase();
    try {
      const member = await this.workspace.getWorkspaceMemberAccess(user.id, ws);
      if (!member) throw new RecordDefinitionWorkspaceNotFoundError();
      if (!member.actorId) throw new Error("Workspace member actor is missing");
      const actorId = member.actorId;
      const result = await this.transactions.runInTransaction(async context => {
        await this.records.lock(ws, context);
        if (!await this.snapshots.hasMembership(user.id, ws, context)) throw new RecordDefinitionWorkspaceNotFoundError();
        if (!await this.objects.hasObjectDefinitionInWorkspace({ workspaceId: ws, objectDefinitionId: object })) throw new RecordDefinitionObjectDefinitionNotFoundError();
        const schema = await this.schemas.load(ws, object, context);
        return work({ workspaceId: ws, objectId: object, actorId, context, schema });
      }, { timeoutMs: 30000 });
      this.logger.log(JSON.stringify({ event, requestId, userId: user.id, workspaceId: ws, objectDefinitionId: object, ...result }), "RecordWriteService");
      return result;
    } catch (error) {
      this.logger.warn(JSON.stringify({ event: "crm.record.writeFailed", requestId, userId: user.id, workspaceId: ws, objectDefinitionId: object,
        errorCode: error instanceof DomainError ? error.code : "InternalServerError" }), "RecordWriteService");
      throw error;
    }
  }

  // 기능 : 옵션·Actor·Record의 실제 소속을 확인하여 typed FK 저장 값을 완성합니다.
  private async prepare(scope: WriteScope, attribute: AttributeDefinitionMetadata, raw: unknown): Promise<ValuePatch> {
    const value = encodeRecordValue(attribute.type, raw);
    if (value.selectOptionId && !scope.schema.selectOptions.some(row => row.id === value.selectOptionId && row.attributeDefinitionId === attribute.id)) invalidRecordValue();
    if (value.statusOptionId && !scope.schema.statusOptions.some(row => row.id === value.statusOptionId && row.attributeDefinitionId === attribute.id)) invalidRecordValue();
    if (value.targetActorId && !(await this.snapshots.actors(scope.workspaceId, [value.targetActorId], scope.context)).length) invalidRecordValue();
    if (value.targetRecordDefinitionId) {
      const target = await this.records.record(value.targetRecordDefinitionId, scope.context);
      if (!target || target.workspaceId !== scope.workspaceId) invalidRecordValue();
      const relation = this.relation(scope, attribute);
      const config = attribute.configJson && typeof attribute.configJson === "object" && !Array.isArray(attribute.configJson) ? attribute.configJson.recordReference : null;
      const configured = config && typeof config === "object" && !Array.isArray(config) ? config.objectDefinitionId : null;
      if (configured != null && (typeof configured !== "string" || configured.toLowerCase() !== target.objectDefinitionId)) invalidRecordValue();
      if (relation && relation.objectDefinitionId !== target.objectDefinitionId) invalidRecordValue();
      const input = recordValueObject(raw);
      if (input.targetObjectDefinitionId !== undefined && (typeof input.targetObjectDefinitionId !== "string" || input.targetObjectDefinitionId.toLowerCase() !== target.objectDefinitionId)) invalidRecordValue();
      return { ...value, targetObjectDefinitionId: target.objectDefinitionId };
    }
    return value;
  }

  // 기능 : 현재 속성의 역방향 속성을 관계 정의에서 찾아 소속과 타입을 검증합니다.
  private relation(scope: WriteScope, attribute: AttributeDefinitionMetadata): AttributeDefinitionMetadata | null {
    const relations = scope.schema.relationships.filter(row => row.sourceAttributeDefinitionId === attribute.id || row.targetAttributeDefinitionId === attribute.id);
    if (relations.length > 1) conflict();
    const relation = relations[0]; if (!relation) return null;
    const source = relation.sourceAttributeDefinitionId === attribute.id;
    const object = source ? relation.sourceObjectDefinitionId : relation.targetObjectDefinitionId;
    const otherObject = source ? relation.targetObjectDefinitionId : relation.sourceObjectDefinitionId;
    const otherId = source ? relation.targetAttributeDefinitionId : relation.sourceAttributeDefinitionId;
    const other = scope.schema.attributes.find(row => row.id === otherId);
    if (attribute.objectDefinitionId !== object || attribute.type !== "RecordReference" || !other || other.type !== "RecordReference" || other.objectDefinitionId !== otherObject || other.listDefinitionId) conflict();
    return other;
  }

  // 기능 : 원본 값과 관계의 역방향 차이를 같은 transaction에 저장합니다.
  private async save(scope: WriteScope, recordId: string, attribute: AttributeDefinitionMetadata, before: StoredRecordValue | undefined, value: ValuePatch) {
    if (before && recordValueKey(before) === recordValueKey(value)) return;
    const inverse = attribute.type === "RecordReference" ? this.relation(scope, attribute) : null;
    let previousTarget = before?.targetRecordDefinitionId ?? null;
    if (!previousTarget && before?.jsonValue != null && attribute.type === "RecordReference") previousTarget = encodeRecordValue(attribute.type, before.jsonValue).targetRecordDefinitionId;
    if (inverse && previousTarget !== value.targetRecordDefinitionId) {
      if (previousTarget) await this.syncInverse(scope, recordId, attribute, inverse, previousTarget, false);
      if (value.targetRecordDefinitionId) await this.syncInverse(scope, recordId, attribute, inverse, value.targetRecordDefinitionId, true);
    }
    await this.records.put({ workspaceId: scope.workspaceId, objectDefinitionId: scope.objectId, recordDefinitionId: recordId,
      attributeDefinitionId: attribute.id, attributeType: attribute.type, ...(before ? { id: before.id } : {}), actorId: scope.actorId, value }, scope.context);
  }

  // 기능 : 다른 관계값을 보존하면서 역방향 한 쌍을 추가하거나 비웁니다.
  private async syncInverse(scope: WriteScope, recordId: string, attribute: AttributeDefinitionMetadata, inverse: AttributeDefinitionMetadata, targetId: string, add: boolean) {
    if (recordId === targetId && inverse.id === attribute.id) return;
    const target = await this.records.record(targetId, scope.context);
    if (!target || target.workspaceId !== scope.workspaceId || target.objectDefinitionId !== inverse.objectDefinitionId) conflict();
    const rows = (await this.records.values(scope.workspaceId, targetId, scope.context)).filter(row => row.attributeDefinitionId === inverse.id);
    if (rows.some(row => row.attributeType !== "RecordReference")) conflict();
    const targetOf = (row: StoredRecordValue) => row.targetRecordDefinitionId ?? (row.jsonValue == null ? null : encodeRecordValue("RecordReference", row.jsonValue).targetRecordDefinitionId);
    const existing = rows.filter(row => targetOf(row) === recordId);
    if (add && existing.length) return;
    if (add && !inverse.isMultiselect && rows.some(row => targetOf(row) !== null)) conflict("RecordRelationshipConflict");
    const changes = add ? [rows.find(row => recordValueKey(row) === recordValueKey(emptyRecordValue()))] : existing;
    for (const row of changes) {
      await this.records.put({ workspaceId: scope.workspaceId, objectDefinitionId: target.objectDefinitionId, recordDefinitionId: targetId,
        attributeDefinitionId: inverse.id, attributeType: "RecordReference", ...(row ? { id: row.id } : {}), actorId: scope.actorId,
        value: add ? { ...emptyRecordValue(), targetRecordDefinitionId: recordId, targetObjectDefinitionId: scope.objectId } : emptyRecordValue() }, scope.context);
    }
  }
}
