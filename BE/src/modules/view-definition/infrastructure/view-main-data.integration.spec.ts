import { randomUUID } from "node:crypto";
import { Module } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import { PrismaClient, type Prisma } from "@prisma/client";
import { AuthModule } from "@/modules/auth/infrastructure/auth.module";
import { APPLICATION_LOGGER } from "@/shared/application/ports/application-logger.port";
import { CURRENT_USER_RESOLVER } from "@/shared/application/ports/current-user-resolver.port";
import { READ_SNAPSHOT_RUNNER, type ReadSnapshotRunner } from "@/shared/application/ports/read-snapshot-runner.port";
import { AuthGuard } from "@/shared/presentation/guards/auth.guard";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";
import { resolvePrismaReadContext } from "@/shared/infrastructure/prisma/prisma-transaction-manager";
import { GetWorkspaceViewMainContentUseCase } from "../application/use-cases/get-workspace-view-main-content.use-case";
import { VIEW_DATA_TOKEN_CODEC } from "../application/ports/view-data-token-codec.port";
import { fixtureUser } from "../application/view-data/view-data.fixture";
import { ViewDefinitionModule } from "./view-definition.module";
import { EncryptedViewDataTokenCodec } from "./view-data-token-codec";

const url = process.env.TEST_DATABASE_URL;
const describeDatabase = url ? describe : describe.skip;

// 역할 : DB 통합 검증에서 외부 인증만 대체하고 실제 업무 모듈과 Guard를 조립합니다.
@Module({ providers: [AuthGuard, { provide: CURRENT_USER_RESOLVER, useValue: { resolveFromAccessToken: async () => fixtureUser } }], exports: [AuthGuard, CURRENT_USER_RESOLVER] })
class MainDataIntegrationAuthModule {}

// 기능 : 전용 테스트 DB의 실제 소유 Port·Prisma mapping·snapshot을 검증합니다.
describeDatabase("View main data PostgreSQL integration", () => {
  let prisma: PrismaClient<Prisma.PrismaClientOptions, "query">;
  let module: TestingModule;
  let query: GetWorkspaceViewMainContentUseCase;
  let snapshots: ReadSnapshotRunner;
  const sql: string[] = [];
  const userId = randomUUID(), workspaceId = randomUUID(), foreignWorkspaceId = randomUUID();
  const actorId = randomUUID(), objectId = randomUUID(), listId = randomUUID();
  const titleId = randomUUID(), amountId = randomUUID(), statusId = randomUUID(), noteId = randomUUID(), assigneeId = randomUUID(), referenceId = randomUUID();
  const recordIds = [randomUUID(), randomUUID()], entryIds = [randomUUID(), randomUUID(), randomUUID()];
  const stageIds = [randomUUID(), randomUUID()];
  const tableId = randomUUID(), listViewId = randomUUID(), kanbanId = randomUUID(), objectViewId = randomUUID(), invalidViewId = randomUUID();
  const user = { ...fixtureUser, id: userId };

  // 기능 : 실제 DB에 고유 fixture를 만들고 모듈의 공개 의존성으로 조회기를 구성합니다.
  beforeAll(async () => {
    if (!url) throw new Error("TEST_DATABASE_URL required");
    prisma = new PrismaClient({ datasources: { db: { url } }, log: [{ emit: "event", level: "query" }] });
    prisma.$on("query", event => sql.push(event.query));
    await prisma.$connect();
    // 1. 테스트 전용 Workspace에 중복 Entry와 두 scope의 다중 타입 값을 저장한다.
    await prisma.$transaction(async tx => {
      await tx.user.create({ data: { id: userId } });
      await tx.workspace.createMany({ data: [{ id: workspaceId, kind: "PERSONAL", name: "main query" }, { id: foreignWorkspaceId, kind: "PERSONAL", name: "foreign" }] });
      const member = await tx.workspaceMember.create({ data: { userId, workspaceId } });
      await tx.actor.create({ data: { id: actorId, workspaceId, workspaceMemberId: member.id, type: "WORKSPACE_MEMBER", displayNameSnapshot: "Reviewer" } });
      const audit = { workspaceId, createdByActorId: actorId };
      await tx.objectDefinition.create({ data: { ...audit, id: objectId, apiSlug: "objects", singularName: "object", pluralName: "objects" } });
      await tx.listDefinition.create({ data: { ...audit, id: listId, apiSlug: "work", name: "work" } });
      await tx.attributeDefinition.createMany({ data: [
        { ...audit, id: titleId, objectDefinitionId: objectId, apiSlug: "title", title: "Title", type: "Text" },
        { ...audit, id: amountId, objectDefinitionId: objectId, apiSlug: "amount", title: "Amount", type: "Number", isMultiselect: true },
        { ...audit, id: statusId, objectDefinitionId: objectId, apiSlug: "status", title: "Status", type: "Status" },
        { ...audit, id: referenceId, objectDefinitionId: objectId, apiSlug: "linked", title: "Linked", type: "RecordReference", configJson: { recordReference: { objectDefinitionId: objectId } } },
        { ...audit, id: noteId, listDefinitionId: listId, apiSlug: "note", title: "Note", type: "Text" },
        { ...audit, id: assigneeId, listDefinitionId: listId, apiSlug: "assignee", title: "Assignee", type: "ActorReference" },
      ] });
      await tx.statusOption.createMany({ data: stageIds.map((id, index) => ({ ...audit, id, attributeDefinitionId: statusId, title: "Stage " + index, color: index ? "blue" : "red", sortOrder: index })) });
      await tx.recordDefinition.createMany({ data: recordIds.map(id => ({ ...audit, id, objectDefinitionId: objectId })) });
      for (const [index, id] of recordIds.entries()) {
        const owner = { ...audit, recordDefinitionId: id, objectDefinitionId: objectId };
        await tx.recordAttributeValueDefinition.createMany({ data: [
          { ...owner, attributeDefinitionId: titleId, attributeType: "Text", textValue: index ? "Second" : "First" },
          { ...owner, attributeDefinitionId: amountId, attributeType: "Number", numberValue: index ? "9007199254740992.0000000002" : "9007199254740992.0000000001" },
          { ...owner, attributeDefinitionId: statusId, attributeType: "Status", statusOptionId: stageIds[index]! },
          { ...owner, attributeDefinitionId: referenceId, attributeType: "RecordReference", targetRecordDefinitionId: recordIds[1]!, targetObjectDefinitionId: objectId },
        ] });
      }
      await tx.recordAttributeValueDefinition.create({ data: { ...audit, recordDefinitionId: recordIds[0]!, objectDefinitionId: objectId, attributeDefinitionId: amountId, attributeType: "Number", numberValue: "9007199254740992.0000000003" } });
      for (const [index, id] of entryIds.entries()) {
        await tx.listEntryDefinition.create({ data: { ...audit, id, listDefinitionId: listId, recordDefinitionId: recordIds[index === 2 ? 1 : 0]! } });
        await tx.listEntryValueDefinition.createMany({ data: [
          { ...audit, listDefinitionId: listId, listEntryDefinitionId: id, attributeDefinitionId: noteId, attributeType: "Text", textValue: "Work " + index },
          { ...audit, listDefinitionId: listId, listEntryDefinitionId: id, attributeDefinitionId: assigneeId, attributeType: "ActorReference", targetActorId: actorId },
        ] });
      }
      // 2. 세 타입의 저장 표시·조건·정렬·그룹과 Object 원본 보기를 구성한다.
      for (const [id, type] of [[tableId, "TABLE"], [listViewId, "LIST"], [kanbanId, "KANBAN"], [objectViewId, "TABLE"]] as const) {
        await tx.viewDefinition.create({ data: { ...audit, id, name: type, type, ...(id === objectViewId ? { objectDefinitionId: objectId } : { listDefinitionId: listId }) } });
        const scope = { ...audit, viewDefinitionId: id };
        const fields = id === objectViewId ? [titleId, amountId, referenceId] : [titleId, amountId, noteId, assigneeId, referenceId];
        await tx.viewAttributeSettingDefinition.createMany({ data: fields.map((attributeDefinitionId, index) => ({ ...scope, attributeDefinitionId,
          sourceScope: attributeDefinitionId === noteId || attributeDefinitionId === assigneeId ? "LIST_ENTRY" : "RECORD",
          referenceAttributeIdPathJson: [], attributeDisplayRole: index ? "DISPLAY" : "TITLE", sortOrder: index })) });
        await tx.viewSortDefinition.create({ data: { ...scope, sourceScope: "RECORD", attributeDefinitionId: amountId, referenceAttributeIdPathJson: [], sortDirection: "DESC", configJson: { reducer: "MIN", nulls: "LAST" } } });
        if (id === tableId || id === listViewId) {
          const group = await tx.viewFilterGroupDefinition.create({ data: { ...scope, conditionGroupOperator: "AND" } });
          await tx.viewFilterConditionDefinition.create({ data: { ...scope, viewFilterGroupDefinitionId: group.id, sourceScope: "LIST_ENTRY", attributeDefinitionId: noteId, referenceAttributeIdPathJson: [], comparisonOperator: "neq", comparisonValueJson: { value: "Work 0" }, multiValueMatchMode: "ANY" } });
        }
        if (id === kanbanId || id === listViewId)
          await tx.viewGroupDefinition.create({ data: { ...scope, sourceScope: "RECORD", attributeDefinitionId: statusId, referenceAttributeIdPathJson: [], groupRole: "GROUP", sortDirection: "ASC" } });
      }
      const foreignAttribute = await tx.attributeDefinition.create({ data: { ...audit, workspaceId: foreignWorkspaceId, objectDefinitionId: objectId, apiSlug: "foreign", title: "private foreign", type: "Text" } });
      await tx.viewDefinition.create({ data: { ...audit, id: invalidViewId, objectDefinitionId: objectId, name: "invalid", type: "TABLE" } });
      await tx.viewAttributeSettingDefinition.create({ data: { ...audit, viewDefinitionId: invalidViewId, attributeDefinitionId: foreignAttribute.id, sourceScope: "RECORD", referenceAttributeIdPathJson: [], attributeDisplayRole: "TITLE" } });
    }, { timeout: 30000 });
    // 3. 외부 인증·token·logger만 대체하고 실제 모듈·Prisma·소유 Port를 연결한다.
    module = await Test.createTestingModule({ imports: [ViewDefinitionModule] })
      .overrideModule(AuthModule).useModule(MainDataIntegrationAuthModule)
      .overrideProvider(PrismaService).useValue(prisma)
      .overrideProvider(VIEW_DATA_TOKEN_CODEC).useValue(new EncryptedViewDataTokenCodec("postgres-integration"))
      .overrideProvider(APPLICATION_LOGGER).useValue({ log: jest.fn(), warn: jest.fn(), error: jest.fn() })
      .compile();
    query = module.get(GetWorkspaceViewMainContentUseCase);
    snapshots = module.get(READ_SNAPSHOT_RUNNER);
  }, 40000);

  // 기능 : 테스트 fixture만 명시 순서로 제거하고 전용 DB 연결을 해제합니다.
  afterAll(async () => {
    try {
      if (prisma) {
        // 1. 이번 fixture의 하위 업무 row를 먼저 제거하여 Actor RESTRICT를 보존한다.
        const where = { workspaceId: { in: [workspaceId, foreignWorkspaceId] } };
        await prisma.$transaction(async tx => {
          await tx.viewDefinition.deleteMany({ where });
          await tx.listDefinition.deleteMany({ where });
          await tx.recordDefinition.deleteMany({ where });
          await tx.attributeDefinition.deleteMany({ where });
          await tx.objectDefinition.deleteMany({ where });
          await tx.actor.deleteMany({ where });
          await tx.workspace.deleteMany({ where: { id: { in: [workspaceId, foreignWorkspaceId] } } });
          await tx.user.deleteMany({ where: { id: userId } });
        });
        expect(await prisma.workspace.count({ where: { id: workspaceId } })).toBe(0);
        expect(await prisma.user.count({ where: { id: userId } })).toBe(0);
      }
    } finally {
      // 2. 실패한 검증에서도 테스트 연결과 Nest 모듈을 닫는다.
      await module?.close();
      await prisma?.$disconnect();
    }
  });

  it("executes saved filtering and precise sorting before pages, preserving Entry scopes and labels", async () => {
    sql.length = 0;
    const first = await query.execute(user, workspaceId, tableId, { limit: 1 });
    if (first.state !== "READY" || first.part !== "MAIN" || first.viewType !== "TABLE") throw Error("TABLE expected");
    expect(first.summary).toEqual({ sourceItemCount: 3, matchedItemCount: 2, eligibleItemCount: 2 });
    expect(first.data.items[0]).toMatchObject({ listEntryDefinitionId: entryIds[2], title: "Second" });
    const next = await query.execute(user, workspaceId, tableId, { limit: 1, cursor: first.data.pageInfo.nextCursor! });
    if (next.state !== "READY" || next.part !== "MAIN" || next.viewType !== "TABLE") throw Error("TABLE expected");
    const item = next.data.items[0]!;
    expect(item.listEntryDefinitionId).toBe(entryIds[1]);
    expect(item.cells.flatMap(cell => cell.values).filter(value => value.sourceEntity.kind === "LIST_ENTRY").map(value => value.value))
      .toEqual(["Work 1", { actorId, label: "Reviewer" }]);
    const amountBinding = next.bindings.find(binding => binding.attributeDefinitionId === amountId)!;
    expect(item.cells.find(cell => cell.bindingId === amountBinding.id)?.values.map(value => value.value).sort())
      .toEqual(["9007199254740992.0000000001", "9007199254740992.0000000003"]);
    expect(item.cells.flatMap(cell => cell.values).some(value => typeof value.value === "object" && value.value !== null && "label" in value.value && value.value.label === "Second")).toBe(true);
    expect(sql.some(statement => /^\s*(INSERT|UPDATE|DELETE)/i.test(statement))).toBe(false);
    expect(sql.length).toBeLessThan(80);
  });

  it("returns List groups and independent Kanban column pages without merging duplicate Record entries", async () => {
    const list = await query.execute(user, workspaceId, listViewId, { limit: 100 });
    if (list.state !== "READY" || list.part !== "MAIN" || list.viewType !== "LIST") throw Error("LIST expected");
    expect(list.data.groups.map(group => group.count)).toEqual([1, 1]);
    const board = await query.execute(user, workspaceId, kanbanId, { limit: 1 });
    if (board.state !== "READY" || board.part !== "MAIN" || board.viewType !== "KANBAN") throw Error("KANBAN expected");
    const column = board.data.columns[0]!;
    expect(column).toMatchObject({ count: 2, color: "red" });
    const next = await query.execute(user, workspaceId, kanbanId, { part: "GROUP_ITEMS", limit: 1, groupToken: column.groupToken, cursor: column.pageInfo.nextCursor! });
    if (next.state !== "READY" || next.part !== "GROUP_ITEMS") throw Error("GROUP_ITEMS expected");
    expect(next.data.items[0]?.recordDefinitionId).toBe(column.items[0]?.recordDefinitionId);
    expect(next.data.items[0]?.listEntryDefinitionId).not.toBe(column.items[0]?.listEntryDefinitionId);
  });

  it("uses Record grain for Object views and rejects foreign membership and corrupted attribute scope", async () => {
    const object = await query.execute(user, workspaceId, objectViewId, {});
    expect(object.summary?.sourceItemCount).toBe(2);
    if (object.state === "READY" && object.part === "MAIN" && object.viewType === "TABLE")
      expect(object.data.items.every(item => item.listEntryDefinitionId === null)).toBe(true);
    await expect(query.execute(user, foreignWorkspaceId, objectViewId, {})).rejects.toMatchObject({ code: "ViewDataWorkspaceNotFound" });
    await expect(query.execute(user, workspaceId, invalidViewId, {})).rejects.toMatchObject({ code: "ViewDataConfigurationInvalid", message: "View configuration is invalid" });
  });

  it("enforces actual read-only RepeatableRead while a concurrent writer changes the same value", async () => {
    await snapshots.run(async context => {
      // 1. 실제 transaction 옵션과 첫 읽기 값을 확보한다.
      const reader = resolvePrismaReadContext(context);
      const settings = await reader.$queryRaw<{ isolation: string; readonly: string }[]>`SELECT current_setting('transaction_isolation') AS isolation, current_setting('transaction_read_only') AS readonly`;
      expect(settings[0]).toEqual({ isolation: "repeatable read", readonly: "on" });
      const value = await reader.recordAttributeValueDefinition.findFirstOrThrow({ where: { workspaceId, recordDefinitionId: recordIds[1]!, attributeDefinitionId: amountId } });
      // 2. 별도 DB 연결의 변경 후에도 snapshot의 값은 그대로인지 확인한다.
      await prisma.recordAttributeValueDefinition.update({ where: { id: value.id }, data: { numberValue: "1" } });
      expect((await reader.recordAttributeValueDefinition.findUniqueOrThrow({ where: { id: value.id } })).numberValue?.toFixed()).toBe("9007199254740992.0000000002");
    });
    // 3. 읽기 snapshot에서 쓰기를 시도하면 DB가 거부하고 row가 남지 않아야 한다.
    const forbiddenId = randomUUID();
    await expect(snapshots.run(async context => resolvePrismaReadContext(context).user.create({ data: { id: forbiddenId } }))).rejects.toThrow();
    expect(await prisma.user.count({ where: { id: forbiddenId } })).toBe(0);
  });
});
