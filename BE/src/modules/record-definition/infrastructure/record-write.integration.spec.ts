import { randomUUID } from "node:crypto";
import { Test } from "@nestjs/testing";
import { ValidationPipe, type INestApplication, type ExecutionContext } from "@nestjs/common";
import * as request from "supertest";
import { AppModule } from "@/app.module";
import { AuthGuard } from "@/shared/presentation/guards/auth.guard";
import { HttpExceptionFilter } from "@/shared/presentation/filters/http-exception.filter";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";

const url = process.env.TEST_DATABASE_URL;
const suite = url ? describe : describe.skip;
const keys = ["user", "outsider", "ws", "foreignWs", "member", "actor", "company", "sales", "companyName", "inverse", "name", "amount", "companyRef", "owner", "priority", "stage", "day", "flag", "emails", "option", "status", "c1", "c2", "table", "list", "kanban"] as const;
const ids = Object.fromEntries(keys.map(key => [key, randomUUID()])) as Record<typeof keys[number], string>;
const user: CurrentUserContext = { id: ids.user!, sessionId: randomUUID(), email: null, displayName: "Tester", platformRole: "USER", status: "ACTIVE", timeZone: "Asia/Seoul" };
const base = `/api/users/me/workspaces/${ids.ws}/object-definitions/${ids.sales}/record-definitions`;
// 기능 : 실제 PostgreSQL과 HTTP 경계에서 기록 생성/수정의 원자성 및 View 읽기를 검증합니다.
suite("Record write HTTP and PostgreSQL", () => {
  let prisma: PrismaService, app: INestApplication;
  beforeAll(async () => {
    if (!url || !["127.0.0.1", "localhost"].includes(new URL(url).hostname)) throw new Error("Local TEST_DATABASE_URL required");
    prisma = new PrismaService({ datasources: { db: { url } } }); await prisma.$connect();
    await prisma.$transaction(async tx => {
      await tx.user.createMany({ data: [{ id: ids.user }, { id: ids.outsider }] });
      await tx.workspace.createMany({ data: [{ id: ids.ws, name: "Record write test", kind: "PERSONAL" }, { id: ids.foreignWs, name: "Other scope", kind: "PERSONAL" }] });
      await tx.workspaceMember.create({ data: { id: ids.member, workspaceId: ids.ws!, userId: ids.user!, role: "OWNER" } });
      await tx.actor.create({ data: { id: ids.actor, workspaceId: ids.ws!, workspaceMemberId: ids.member!, type: "WORKSPACE_MEMBER", displayNameSnapshot: "Tester" } });
      const audit = { workspaceId: ids.ws!, createdByActorId: ids.actor! };
      await tx.objectDefinition.createMany({ data: [
        { ...audit, id: ids.company, apiSlug: "companies", singularName: "회사", pluralName: "회사" },
        { ...audit, id: ids.sales, apiSlug: "sales", singularName: "영업", pluralName: "영업" },
      ] });
      await tx.attributeDefinition.createMany({ data: [
        { ...audit, id: ids.companyName, objectDefinitionId: ids.company, apiSlug: "name", title: "회사명", type: "Text" },
        { ...audit, id: ids.inverse, objectDefinitionId: ids.company, apiSlug: "sales", title: "연결 영업", type: "RecordReference", isMultiselect: true },
        { ...audit, id: ids.name, objectDefinitionId: ids.sales, apiSlug: "name", title: "영업명", type: "Text", sortOrder: 0 },
        { ...audit, id: ids.amount, objectDefinitionId: ids.sales, apiSlug: "amount", title: "금액", type: "Currency", sortOrder: 1 },
        { ...audit, id: ids.companyRef, objectDefinitionId: ids.sales, apiSlug: "company", title: "대상 회사", type: "RecordReference", sortOrder: 2 },
        { ...audit, id: ids.owner, objectDefinitionId: ids.sales, apiSlug: "owner", title: "담당자", type: "ActorReference", sortOrder: 3 },
        { ...audit, id: ids.priority, objectDefinitionId: ids.sales, apiSlug: "priority", title: "우선순위", type: "Select", sortOrder: 4 },
        { ...audit, id: ids.stage, objectDefinitionId: ids.sales, apiSlug: "stage", title: "단계", type: "Status", sortOrder: 5 },
        { ...audit, id: ids.day, objectDefinitionId: ids.sales, apiSlug: "day", title: "계약일", type: "Date", sortOrder: 6 },
        { ...audit, id: ids.flag, objectDefinitionId: ids.sales, apiSlug: "flag", title: "중요", type: "Checkbox", sortOrder: 7 },
        { ...audit, id: ids.emails, objectDefinitionId: ids.sales, apiSlug: "emails", title: "메일", type: "EmailAddress", isMultiselect: true, sortOrder: 8 },
      ] });
      await tx.relationshipDefinition.create({ data: { ...audit, sourceObjectDefinitionId: ids.company!, sourceAttributeDefinitionId: ids.inverse!, targetObjectDefinitionId: ids.sales!, targetAttributeDefinitionId: ids.companyRef! } });
      await tx.selectOption.create({ data: { ...audit, id: ids.option, attributeDefinitionId: ids.priority!, title: "높음", sortOrder: 0 } });
      await tx.statusOption.create({ data: { ...audit, id: ids.status, attributeDefinitionId: ids.stage!, title: "문의", sortOrder: 0 } });
      await tx.recordDefinition.createMany({ data: [ids.c1!, ids.c2!].map(id => ({ ...audit, id, objectDefinitionId: ids.company! })) });
      await tx.recordAttributeValueDefinition.createMany({ data: [ids.c1!, ids.c2!].map((id, i) => ({ ...audit, recordDefinitionId: id, objectDefinitionId: ids.company!, attributeDefinitionId: ids.companyName!, attributeType: "Text", textValue: i ? "SAMSUNG" : "OpenAI" })) });
      const companyView = await tx.viewDefinition.create({ data: { ...audit, objectDefinitionId: ids.company, name: "회사", type: "TABLE" } });
      await tx.viewAttributeSettingDefinition.create({ data: { ...audit, viewDefinitionId: companyView.id, attributeDefinitionId: ids.companyName!, sourceScope: "RECORD", attributeDisplayRole: "TITLE", referenceAttributeIdPathJson: [] } });
      for (const [id, type] of [[ids.table!, "TABLE"], [ids.list!, "LIST"], [ids.kanban!, "KANBAN"]] as const) {
        await tx.viewDefinition.create({ data: { ...audit, id, objectDefinitionId: ids.sales, name: type, type } });
        await tx.viewAttributeSettingDefinition.createMany({ data: [ids.name!, ids.amount!, ids.companyRef!].map((attributeDefinitionId, i) => ({ ...audit, viewDefinitionId: id, attributeDefinitionId,
          sourceScope: "RECORD", attributeDisplayRole: i === 0 ? "TITLE" : "DISPLAY", referenceAttributeIdPathJson: [], sortOrder: i })) });
        if (type === "KANBAN") await tx.viewGroupDefinition.create({ data: { ...audit, viewDefinitionId: id, attributeDefinitionId: ids.stage!, sourceScope: "RECORD", groupRole: "GROUP", referenceAttributeIdPathJson: [], sortDirection: "ASC" } });
      }
    });
    const module = await Test.createTestingModule({ imports: [AppModule] }).overrideProvider(PrismaService).useValue(prisma)
      .overrideGuard(AuthGuard).useValue({ canActivate(context: ExecutionContext) { const req = context.switchToHttp().getRequest(); req.currentUser = req.headers["x-test-outsider"] ? { ...user, id: ids.outsider } : user; return true; } }).compile();
    app = module.createNestApplication(); app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true })); app.useGlobalFilters(new HttpExceptionFilter()); await app.init();
  }, 60000);
  afterAll(async () => {
    if (prisma) {
      const where = { workspaceId: ids.ws! };
      await prisma.viewDefinition.deleteMany({ where }); await prisma.relationshipDefinition.deleteMany({ where });
      await prisma.recordAttributeValueDefinition.deleteMany({ where }); await prisma.recordDefinition.deleteMany({ where });
      await prisma.attributeDefinition.deleteMany({ where }); await prisma.objectDefinition.deleteMany({ where });
      await prisma.actor.deleteMany({ where }); await prisma.workspaceMember.deleteMany({ where });
      await prisma.workspace.deleteMany({ where: { id: { in: [ids.ws!, ids.foreignWs!] } } });
      await prisma.user.deleteMany({ where: { id: { in: [ids.user!, ids.outsider!] } } });
    }
    await app?.close(); await prisma?.$disconnect();
  });
  // 기능 : 각 테스트가 별도 생성 ID를 갖게 합니다.
  function body(company = ids.c1!) { return { creationId: randomUUID(), values: [
    { attributeDefinitionId: ids.name, values: ["새 영업"] }, { attributeDefinitionId: ids.amount, values: ["0"] },
    { attributeDefinitionId: ids.companyRef, values: [{ targetRecordDefinitionId: company }] },
    { attributeDefinitionId: ids.owner, values: [{ targetActorId: ids.actor }] },
    { attributeDefinitionId: ids.priority, values: [{ selectOptionId: ids.option }] },
    { attributeDefinitionId: ids.stage, values: [{ statusOptionId: ids.status }] },
    { attributeDefinitionId: ids.emails, values: ["one@example.com", "two@example.com"] },
  ] }; }
  // 기능 : 값 ID를 외부 응답으로 전달받은 기록 범위에서 찾습니다.
  async function value(recordId: string, attributeId: string) { return prisma.recordAttributeValueDefinition.findFirstOrThrow({ where: { recordDefinitionId: recordId, attributeDefinitionId: attributeId }, orderBy: { id: "asc" } }); }
  const patchPath = (record: string, row: string) => `${base}/${record}/record-attribute-values-definitions/${row}`;

  it("creates typed values, both relationship directions and reads all three Views without changing settings", async () => {
    const before = await prisma.viewAttributeSettingDefinition.findMany({ where: { workspaceId: ids.ws } });
    const input = body(); const response = await request(app.getHttpServer()).post(base).send(input).expect(201);
    expect(response.body).toEqual({ recordDefinitionId: input.creationId });
    expect((await value(input.creationId, ids.amount!)).numberValue?.toString()).toBe("0");
    const company = await value(input.creationId, ids.companyRef!);
    expect(company).toMatchObject({ targetRecordDefinitionId: ids.c1, targetObjectDefinitionId: ids.company, jsonValue: null });
    expect((await value(input.creationId, ids.owner!)).targetActorId).toBe(ids.actor);
    expect((await value(input.creationId, ids.priority!)).selectOptionId).toBe(ids.option);
    expect(await prisma.recordAttributeValueDefinition.count({ where: { recordDefinitionId: ids.c1, attributeDefinitionId: ids.inverse, targetRecordDefinitionId: input.creationId } })).toBe(1);
    for (const view of [ids.table, ids.list, ids.kanban]) {
      const res = await request(app.getHttpServer()).get(`/api/users/me/workspaces/${ids.ws}/view-definitions/${view}/data`).expect(200);
      expect(res.body.state).toBe("READY"); expect(res.body.issues).toEqual([]);
      const items = res.body.data.items ?? res.body.data.columns.flatMap((column: { items: unknown[] }) => column.items);
      expect(items.some((item: { recordDefinitionId: string }) => item.recordDefinitionId === input.creationId)).toBe(true);
    }
    expect(await prisma.viewAttributeSettingDefinition.findMany({ where: { workspaceId: ids.ws } })).toEqual(before);
  });
  it("replays concurrent creation once, preserves audit and rejects different intent", async () => {
    const input = body(); const responses = await Promise.all([request(app.getHttpServer()).post(base).send(input), request(app.getHttpServer()).post(base).send(input)]);
    expect(responses.map(res => res.status)).toEqual([201, 201]);
    const before = await prisma.recordDefinition.findUniqueOrThrow({ where: { id: input.creationId } });
    await request(app.getHttpServer()).post(base).send(input).expect(201);
    expect(await prisma.recordDefinition.findUniqueOrThrow({ where: { id: input.creationId } })).toEqual(before);
    input.values[0]!.values = ["다른 영업"];
    await request(app.getHttpServer()).post(base).send(input).expect(409);
    expect(await prisma.recordDefinition.count({ where: { id: input.creationId } })).toBe(1);
  });
  it("moves a company reference atomically and preserves other multi-values", async () => {
    const input = body(); await request(app.getHttpServer()).post(base).send(input).expect(201);
    const company = await value(input.creationId, ids.companyRef!), emails = await prisma.recordAttributeValueDefinition.findMany({ where: { recordDefinitionId: input.creationId, attributeDefinitionId: ids.emails } });
    const path = patchPath(input.creationId, company.id);
    // 같은 Workspace라도 관계 정의가 다른 Object를 가리키면 연결할 수 없다.
    await request(app.getHttpServer()).patch(path).send({ value: { targetRecordDefinitionId: input.creationId } }).expect(400);
    await request(app.getHttpServer()).patch(path).send({ value: { targetRecordDefinitionId: ids.c2 } }).expect(200);
    expect((await value(input.creationId, ids.companyRef!)).targetRecordDefinitionId).toBe(ids.c2);
    expect(await prisma.recordAttributeValueDefinition.count({ where: { recordDefinitionId: ids.c1, targetRecordDefinitionId: input.creationId } })).toBe(0);
    expect(await prisma.recordAttributeValueDefinition.count({ where: { recordDefinitionId: ids.c2, targetRecordDefinitionId: input.creationId } })).toBe(1);
    const before = await prisma.recordDefinition.findUniqueOrThrow({ where: { id: input.creationId } });
    await request(app.getHttpServer()).patch(path).send({ value: { targetRecordDefinitionId: ids.c2 } }).expect(200);
    expect(await prisma.recordDefinition.findUniqueOrThrow({ where: { id: input.creationId } })).toEqual(before);
    await request(app.getHttpServer()).patch(path).send({ value: null }).expect(200);
    expect((await value(input.creationId, ids.companyRef!)).targetRecordDefinitionId).toBeNull();
    expect(await prisma.recordAttributeValueDefinition.count({ where: { recordDefinitionId: ids.c2, targetRecordDefinitionId: input.creationId } })).toBe(0);
    expect(await prisma.recordAttributeValueDefinition.findMany({ where: { recordDefinitionId: input.creationId, attributeDefinitionId: ids.emails } })).toEqual(emails);
    // 생성 후 수정된 기록은 초기 요청 재전송으로 덮어쓰지 않는다.
    await request(app.getHttpServer()).post(base).send(input).expect(409);
  });
  it("rejects invalid options, cross-owner attributes, absent value and unauthorized workspace without partial rows", async () => {
    const input = body(); input.values[4]!.values = [{ selectOptionId: randomUUID() }];
    await request(app.getHttpServer()).post(base).send(input).expect(400);
    expect(await prisma.recordDefinition.findUnique({ where: { id: input.creationId } })).toBeNull();
    await request(app.getHttpServer()).post(base).send({ creationId: randomUUID(), values: [{ attributeDefinitionId: ids.companyName, values: ["bad"] }] }).expect(400);
    await request(app.getHttpServer()).post(base).set("x-test-outsider", "1").send(body()).expect(404);
    const valid = body(); await request(app.getHttpServer()).post(base).send(valid).expect(201);
    const amount = await value(valid.creationId, ids.amount!);
    await request(app.getHttpServer()).patch(patchPath(valid.creationId, amount.id)).send({}).expect(400);
    await request(app.getHttpServer()).patch(patchPath(valid.creationId, amount.id)).send({ value: "100000000000000000000" }).expect(400);
    expect((await value(valid.creationId, ids.amount!)).numberValue?.toString()).toBe("0");
  });
  it("rolls back a reverse single-value conflict instead of stealing another company's sale", async () => {
    const first = body(ids.c1), second = body(ids.c2);
    await request(app.getHttpServer()).post(base).send(first).expect(201); await request(app.getHttpServer()).post(base).send(second).expect(201);
    const reverse = await prisma.recordAttributeValueDefinition.findFirstOrThrow({ where: { recordDefinitionId: ids.c1, targetRecordDefinitionId: first.creationId } });
    const companyBase = base.replace(ids.sales!, ids.company!);
    await request(app.getHttpServer()).patch(`${companyBase}/${ids.c1}/record-attribute-values-definitions/${reverse.id}`).send({ value: { targetRecordDefinitionId: second.creationId } }).expect(409);
    expect((await value(first.creationId, ids.companyRef!)).targetRecordDefinitionId).toBe(ids.c1);
    expect((await value(second.creationId, ids.companyRef!)).targetRecordDefinitionId).toBe(ids.c2);
    expect((await prisma.recordAttributeValueDefinition.findUniqueOrThrow({ where: { id: reverse.id } })).targetRecordDefinitionId).toBe(first.creationId);
  });
  it("keeps legacy empty creation and returns scoped names for record/actor/option pickers", async () => {
    const response = await request(app.getHttpServer()).post(base).expect(201);
    expect(await prisma.recordAttributeValueDefinition.count({ where: { recordDefinitionId: response.body.recordDefinitionId } })).toBe(9);
    const fields = await request(app.getHttpServer()).get(`${base}/form`).expect(200); expect(fields.body.attributes).toHaveLength(9);
    const companies = await request(app.getHttpServer()).get(`${base}/form`).query({ attributeDefinitionId: ids.companyRef, q: "OpenAI" }).expect(200);
    expect(companies.body.items).toEqual([{ id: ids.c1, label: "OpenAI" }]);
    const actors = await request(app.getHttpServer()).get(`${base}/form`).query({ attributeDefinitionId: ids.owner }).expect(200);
    expect(actors.body.items).toEqual([{ id: ids.actor, label: "Tester" }]);
    const options = await request(app.getHttpServer()).get(`${base}/form`).query({ attributeDefinitionId: ids.priority }).expect(200);
    expect(options.body.items).toEqual([{ id: ids.option, label: "높음" }]);
    await request(app.getHttpServer()).get(`${base}/form`).query({ attributeDefinitionId: ids.companyName }).expect(400);
  });
});
