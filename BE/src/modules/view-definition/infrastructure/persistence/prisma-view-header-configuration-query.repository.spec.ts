import { randomUUID } from "node:crypto";
import { PrismaClient, type Prisma } from "@prisma/client";
import { PrismaViewHeaderConfigurationQueryRepository } from "./prisma-view-header-configuration-query.repository";
import { PrismaAttributeDefinitionMetadataQueryRepository } from "@/modules/attribute-definition/infrastructure/persistence/prisma-attribute-definition-metadata-query.repository";

const url = process.env.TEST_DATABASE_URL;
const describeDatabase = url ? describe : describe.skip;

// 기능 : 명시된 테스트 DB에 연결하고 실제 SQL 횟수를 관찰합니다.
function client() {
  if (!url) throw new Error("TEST_DATABASE_URL required");
  return new PrismaClient<Prisma.PrismaClientOptions, "query">({ datasources: { db: { url } }, log: [{ emit: "event", level: "query" }] });
}

// 기능 : 실제 PostgreSQL에서 설정·메타데이터 adapter의 소속·순서·JSON·쿼리 수를 검증합니다.
describeDatabase("View header menu repositories", () => {
  let prisma: ReturnType<typeof client>;
  const queries: string[] = [];
  // 기능 : 전용 테스트 DB 연결 실패를 테스트 실패로 처리합니다.
  beforeAll(async () => {
    if (!url) throw new Error("TEST_DATABASE_URL required");
    prisma = client();
    prisma.$on("query", event => queries.push(event.query));
    await prisma.$connect();
    expect((await prisma.$queryRaw<{ port: number }[]> `SELECT inet_server_port() AS port`)[0]?.port).toBeGreaterThan(0);
  });
  // 기능 : 검증 종료 시 연결을 해제합니다.
  afterAll(async () => { await prisma?.$disconnect(); });

  // 기능 : 소속이 어긋난 행을 제외하면서 모든 메뉴 필드와 옵션 batch를 검증합니다.
  it("reads scoped stored rows in stable order with bounded queries and rolls back fixtures", async () => {
    const W = randomUUID(), F = randomUUID(), U = randomUUID(), M = randomUUID(), A = randomUUID(), O = randomUUID(), L = randomUUID(), V = randomUUID(), X = randomUUID(), S = randomUUID(), T = randomUUID();
    const ids = [randomUUID(), randomUUID()].sort(), optionId = randomUUID(), foreignOptionId = randomUUID(), groupId = randomUUID();
    const rollback = new Error("rollback menu fixtures");
    await expect(prisma.$transaction(async tx => {
      // 1. 고유한 Workspace와 Actor·Object·속성 fixture를 만든다.
      await tx.user.create({ data: { id: U } });
      await tx.workspace.createMany({ data: [{ id: W, name: "menus", kind: "PERSONAL" }, { id: F, name: "foreign", kind: "PERSONAL" }] });
      await tx.workspaceMember.create({ data: { id: M, workspaceId: W, userId: U } });
      await tx.actor.create({ data: { id: A, workspaceId: W, workspaceMemberId: M, type: "WORKSPACE_MEMBER" } });
      await tx.objectDefinition.create({ data: { id: O, workspaceId: W, createdByActorId: A, apiSlug: "obj", singularName: "object", pluralName: "objects" } });
      await tx.listDefinition.create({ data: { id: L, workspaceId: W, createdByActorId: A, apiSlug: "list", name: "list" } });
      await tx.attributeDefinition.createMany({ data: [
        { id: S, workspaceId: W, objectDefinitionId: O, apiSlug: "select", type: "Select" },
        { id: T, workspaceId: W, objectDefinitionId: O, apiSlug: "status", type: "Status" },
        { id: X, workspaceId: F, objectDefinitionId: O, apiSlug: "foreign", type: "Text" },
      ].map(data => ({ ...data, type: data.type as "Select" | "Status" | "Text", title: "field", createdByActorId: A, configJson: ["raw"] })) });
      await tx.viewDefinition.create({ data: { id: V, workspaceId: W, objectDefinitionId: O, listDefinitionId: L, name: "menu view", type: "DASHBOARD", createdByActorId: A, configJson: false } });
      const common = { workspaceId: W, viewDefinitionId: V, createdByActorId: A, createdAt: new Date("2026-01-01T00:00:00Z") };
      const attribute = { sourceScope: "RECORD" as const, attributeDefinitionId: S, referenceAttributeIdPathJson: [S.toUpperCase(), S] };
      await tx.viewSortDefinition.createMany({ data: [
        ...ids.map(id => ({ ...common, ...attribute, id, sortDirection: "DESC" as const, sortOrder: 0, configJson: ["raw", "12345678901234567890.00"] })),
        { ...common, ...attribute, workspaceId: F, sortOrder: -10, sortDirection: "ASC" as const },
      ] });
      await tx.viewFilterGroupDefinition.create({ data: { ...common, id: groupId, conditionGroupOperator: "OR" } });
      await tx.viewFilterConditionDefinition.create({ data: { ...common, ...attribute, viewFilterGroupDefinitionId: groupId, comparisonOperator: "future", comparisonValueJson: { amount: "12345678901234567890.00" }, multiValueMatchMode: "ALL" } });
      await tx.viewAttributeSettingDefinition.create({ data: { ...common, ...attribute, attributeDisplayRole: "TITLE", isHidden: true, width: 180, formatJson: false } });
      await tx.viewGroupDefinition.create({ data: { ...common, ...attribute, id: groupId, groupRole: "GROUP", sortDirection: "DESC" } });
      await tx.selectOption.createMany({ data: [
        { id: optionId, workspaceId: W, attributeDefinitionId: S, title: "chosen", sortOrder: 1 },
        { workspaceId: W, attributeDefinitionId: S, title: "unchosen", sortOrder: 0 },
        { id: foreignOptionId, workspaceId: F, attributeDefinitionId: S, title: "foreign", sortOrder: -1 },
      ].map(data => ({ ...data, createdByActorId: A })) });
      await tx.statusOption.create({ data: { workspaceId: W, attributeDefinitionId: T, title: "status", sortOrder: 0, createdByActorId: A } });
      await tx.viewGroupSettingDefinition.create({ data: { ...common, viewGroupDefinitionId: groupId, attributeDefinitionId: S, selectOptionId: optionId, isHidden: true, isFold: true, groupKeyJson: ["preserve"] } });
      await tx.viewWidgetDefinition.createMany({ data: [0, 1].map(sortOrder => ({ ...common, contentViewDefinitionId: V, titleOverride: null, isHidden: true, sortOrder, layoutJson: { x: sortOrder }, configJson: { showTitle: false } })) });

      // 2. 실제 adapter로 세 메뉴를 읽고 교차 Workspace 행의 제외와 동률 순서를 확인한다.
      const views = new PrismaViewHeaderConfigurationQueryRepository(tx);
      const metadata = new PrismaAttributeDefinitionMetadataQueryRepository(tx);
      const scope = { workspaceId: W, viewDefinitionId: V };
      queries.length = 0;
      expect((await views.findView(scope))?.configJson).toBe(false);
      const sorts = await views.findSorts(scope);
      expect(sorts.map(r => r.id)).toEqual(ids);
      expect(sorts[0]?.referenceAttributeIdPathJson).toEqual([S.toUpperCase(), S]);
      expect(sorts[0]?.configJson).toEqual(["raw", "12345678901234567890.00"]);
      const filters = await views.findFilters(scope);
      expect(filters.viewFilterConditionDefinitions[0]?.comparisonValueJson).toEqual({ amount: "12345678901234567890.00" });
      const settings = await views.findSettings(scope);
      expect(settings.viewAttributeSettingDefinitions[0]).toMatchObject({ isHidden: true, formatJson: false, width: 180 });
      expect(settings.viewGroupSettingDefinitions[0]).toMatchObject({ isFold: true, isHidden: true, groupKeyJson: ["preserve"] });
      expect(settings.viewWidgetDefinitions).toHaveLength(2);
      expect(await views.findContentViews(W, [V])).toHaveLength(1);
      const attributes = await metadata.findAttributes(W, [S, T, X]);
      expect(attributes).toHaveLength(2);
      const options = await metadata.findOptions({ workspaceId: W, selectAttributeIds: [S], statusAttributeIds: [T], selectOptionIds: [optionId, foreignOptionId], statusOptionIds: [] });
      expect(options.selectOptions.map(r => r.title)).toEqual(["unchosen", "chosen"]);
      expect(options.statusOptions).toHaveLength(1);
      // 3. 12개 SELECT만 실행하고 빈 batch와 실제 업무 값 조회·쓰기를 생략한다.
      expect(queries).toHaveLength(12);
      expect(queries.every(sql => sql.trimStart().startsWith("SELECT"))).toBe(true);
      expect(queries.some(sql => /RecordAttributeValueDefinition|ListEntryValueDefinition/.test(sql))).toBe(false);
      queries.length = 0;
      expect(await metadata.findAttributes(W, [])).toEqual([]);
      expect(await views.findContentViews(W, [])).toEqual([]);
      expect(await metadata.findOptions({ workspaceId: W, selectAttributeIds: [], statusAttributeIds: [], selectOptionIds: [], statusOptionIds: [] })).toEqual({ selectOptions: [], statusOptions: [] });
      expect(queries).toHaveLength(0);
      expect(await views.findView({ workspaceId: F, viewDefinitionId: V })).toBeNull();
      throw rollback;
    }, { timeout: 30000 })).rejects.toBe(rollback);
    // 4. 테스트용 데이터도 남지 않았는지 확인한다.
    expect(await prisma.workspace.count({ where: { id: W } })).toBe(0);
  }, 40000);
});
