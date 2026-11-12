import { Module, ValidationPipe, type INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import * as request from "supertest";
import { Prisma } from "@prisma/client";
import { AuthModule } from "@/modules/auth/infrastructure/auth.module";
import { ATTRIBUTE_DEFINITION_TYPES } from "@/modules/attribute-definition/application/attribute-definition-type";
import { CURRENT_USER_RESOLVER } from "@/shared/application/ports/current-user-resolver.port";
import { APPLICATION_LOGGER } from "@/shared/application/ports/application-logger.port";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";
import { AuthGuard } from "@/shared/presentation/guards/auth.guard";
import { HttpExceptionFilter } from "@/shared/presentation/filters/http-exception.filter";
import { ViewDefinitionModule } from "../../infrastructure/view-definition.module";

const ws = "00000000-0000-4000-8000-000000000301", view = "00000000-0000-4000-8000-000000000401";
const object = "00000000-0000-4000-8000-000000000501", actor = "00000000-0000-4000-8000-000000000601";
const attr = "00000000-0000-4000-8000-000000000701", creation = "00000000-0000-4000-8000-000000000801";
const user = { id: "00000000-0000-4000-8000-000000000101", sessionId: "session", email: null, displayName: null, platformRole: "USER", status: "ACTIVE", defaultCurrencyCode: "KRW", timeZone: "Asia/Seoul" };
const resolver = { resolveFromAccessToken: jest.fn() };

// 역할 : 실제 인증 Guard를 보존하고 외부 토큰 해석만 격리합니다.
@Module({ providers: [AuthGuard, { provide: CURRENT_USER_RESOLVER, useValue: resolver }], exports: [AuthGuard, CURRENT_USER_RESOLVER] })
class ColumnTestAuthModule {}

// 기능 : 실제 모듈·공개 Port·transaction adapter·HTTP 계약을 함께 검증합니다.
describe("Object TABLE column creation", () => {
  let app: INestApplication;
  const path = `/api/users/me/workspaces/${ws}/view-definitions/${view}/columns`;
  const input = { creationId: creation, attributeDefinitionName: "  매매가격  ", attributeType: "Currency" };
  const expected = { viewDefinitionId: view, objectDefinitionId: object, attributeDefinitionId: attr, viewAttributeSettingDefinitionId: creation };
  const tx = { $queryRaw: jest.fn(), attributeDefinition: { aggregate: jest.fn(), create: jest.fn(), findMany: jest.fn() },
    recordDefinition: { findMany: jest.fn() }, recordAttributeValueDefinition: { createMany: jest.fn() },
    viewAttributeSettingDefinition: { findUnique: jest.fn(), aggregate: jest.fn(), create: jest.fn(), findFirst: jest.fn(), updateMany: jest.fn() } };
  const prisma = { workspaceMember: { findFirst: jest.fn() }, objectDefinition: { findFirst: jest.fn() }, attributeDefinition: { findFirst: jest.fn() }, $transaction: jest.fn() };
  const logger = { log: jest.fn(), warn: jest.fn(), error: jest.fn() };

  // 기능 : DB와 외부 인증만 대체하고 새 API의 실제 의존성 조립을 확인합니다.
  beforeAll(async () => {
    const module = await Test.createTestingModule({ imports: [ViewDefinitionModule] })
      .overrideModule(AuthModule).useModule(ColumnTestAuthModule)
      .overrideProvider(PrismaService).useValue(prisma)
      .overrideProvider(APPLICATION_LOGGER).useValue(logger).compile();
    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();
  });
  // 기능 : 테스트별 소속·생성 결과를 격리합니다.
  beforeEach(() => {
    jest.resetAllMocks();
    resolver.resolveFromAccessToken.mockResolvedValue(user);
    prisma.workspaceMember.findFirst.mockResolvedValue({ id: "member", actors: [{ id: actor }] });
    prisma.objectDefinition.findFirst.mockResolvedValue({ id: object });
    prisma.attributeDefinition.findFirst.mockResolvedValue(null);
    prisma.$transaction.mockImplementation(async (work: (client: typeof tx) => Promise<unknown>) => work(tx));
    tx.$queryRaw.mockImplementation(async (parts: TemplateStringsArray) => parts.join("").includes("transaction_isolation")
      ? [{ level: "read committed" }] : [{ type: "TABLE", objectDefinitionId: object, listDefinitionId: null }]);
    tx.viewAttributeSettingDefinition.findUnique.mockResolvedValue(null);
    tx.viewAttributeSettingDefinition.aggregate.mockResolvedValue({ _count: 1, _max: { sortOrder: 4 } });
    tx.viewAttributeSettingDefinition.create.mockResolvedValue({ id: creation });
    tx.viewAttributeSettingDefinition.findFirst.mockResolvedValue({ labelOverride: null });
    tx.viewAttributeSettingDefinition.updateMany.mockResolvedValue({ count: 1 });
    tx.attributeDefinition.aggregate.mockResolvedValue({ _max: { sortOrder: 9 } });
    tx.attributeDefinition.create.mockResolvedValue({ id: attr });
    tx.recordDefinition.findMany.mockResolvedValue([{ id: "record-a" }, { id: "record-b" }]);
    tx.recordAttributeValueDefinition.createMany.mockResolvedValue({ count: 2 });
    tx.attributeDefinition.findMany.mockResolvedValue([{ id: attr, workspaceId: ws, objectDefinitionId: object, listDefinitionId: null, title: "매매가격", type: "Currency" }]);
  });
  // 기능 : HTTP 검증 앱 자원을 해제합니다.
  afterAll(async () => { await app.close(); });
  // 기능 : 인증된 새 컬럼 생성 요청을 전송합니다.
  function post(body: object = input, endpoint = path) { return request(app.getHttpServer()).post(endpoint).set("Authorization", "Bearer valid").send(body); }

  // 기능 : 기존 표시 설정의 이름 수정 HTTP 요청을 실제 의존성 조립에 전달합니다.
  function patch(body: object = { labelOverride: "  예상 매출  " }, endpoint = `${path}/${creation}`) {
    return request(app.getHttpServer()).patch(endpoint).set("Authorization", "Bearer valid").send(body);
  }

  describe("View column label update", () => {
    it("updates only the scoped display setting and its server audit actor", async () => {
      await patch().expect(200).expect({ viewDefinitionId: view, viewAttributeSettingDefinitionId: creation, labelOverride: "예상 매출" });
      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
      const where = { id: creation, workspaceId: ws, viewDefinitionId: view };
      expect(tx.viewAttributeSettingDefinition.findFirst).toHaveBeenCalledWith({ where, select: { labelOverride: true } });
      expect(tx.viewAttributeSettingDefinition.updateMany).toHaveBeenCalledWith({ where, data: { labelOverride: "예상 매출", updatedByActorId: actor } });
      expect(tx.attributeDefinition.create).not.toHaveBeenCalled();
      expect(tx.recordAttributeValueDefinition.createMany).not.toHaveBeenCalled();
      expect(JSON.stringify(logger.log.mock.calls)).not.toContain("예상 매출");
    });
    it.each(["TABLE", "KANBAN", "LIST"])("supports %s labels without an Object-only source restriction", async type => {
      tx.$queryRaw.mockImplementation(async (parts: TemplateStringsArray) => parts.join("").includes("transaction_isolation")
        ? [{ level: "read committed" }] : [{ type, objectDefinitionId: null, listDefinitionId: "list" }]);
      await patch().expect(200);
    });
    it("clears an override and leaves already cleared labels untouched", async () => {
      tx.viewAttributeSettingDefinition.findFirst.mockResolvedValueOnce({ labelOverride: "현재 이름" });
      await patch({ labelOverride: null }).expect(200).expect({ viewDefinitionId: view, viewAttributeSettingDefinitionId: creation, labelOverride: null });
      expect(tx.viewAttributeSettingDefinition.updateMany).toHaveBeenCalledWith(expect.objectContaining({ data: { labelOverride: null, updatedByActorId: actor } }));
      await patch({ labelOverride: null }).expect(200);
      expect(tx.viewAttributeSettingDefinition.updateMany).toHaveBeenCalledTimes(1);
    });
    it("does not update audit fields for the same normalized label", async () => {
      tx.viewAttributeSettingDefinition.findFirst.mockResolvedValue({ labelOverride: "예상 매출" });
      await patch().expect(200);
      expect(tx.viewAttributeSettingDefinition.updateMany).not.toHaveBeenCalled();
      expect(logger.log).not.toHaveBeenCalled();
    });
    it("requires authentication and Workspace membership before a transaction", async () => {
      await request(app.getHttpServer()).patch(`${path}/${creation}`).send({ labelOverride: null }).expect(401);
      prisma.workspaceMember.findFirst.mockResolvedValue(null);
      await patch().expect(404);
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });
    it("rejects a missing View and a missing or foreign display setting", async () => {
      tx.$queryRaw.mockImplementation(async (parts: TemplateStringsArray) => parts.join("").includes("transaction_isolation") ? [{ level: "read committed" }] : []);
      await patch().expect(404);
      expect(tx.viewAttributeSettingDefinition.findFirst).not.toHaveBeenCalled();
      tx.$queryRaw.mockImplementation(async (parts: TemplateStringsArray) => parts.join("").includes("transaction_isolation") ? [{ level: "read committed" }] : [{ type: "TABLE" }]);
      tx.viewAttributeSettingDefinition.findFirst.mockResolvedValue(null);
      await patch().expect(404);
      expect(tx.viewAttributeSettingDefinition.updateMany).not.toHaveBeenCalled();
    });
    it("rejects unsupported View types without changing a setting", async () => {
      tx.$queryRaw.mockImplementation(async (parts: TemplateStringsArray) => parts.join("").includes("transaction_isolation") ? [{ level: "read committed" }] : [{ type: "CALENDAR" }]);
      const result = await patch().expect(409);
      expect(result.body.error).toBe("ViewColumnLabelTargetUnsupported");
      expect(tx.viewAttributeSettingDefinition.updateMany).not.toHaveBeenCalled();
    });
    it.each([{}, { labelOverride: "" }, { labelOverride: " \n " }, { labelOverride: 1 }, { labelOverride: [] }, { labelOverride: {} },
      { labelOverride: null, title: "원본 변경" }, { labelOverride: null, updatedByActorId: actor }, { labelOverride: null, width: 100 }])("rejects invalid or unrelated fields %j", async body => {
      await patch(body).expect(400);
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });
    it("rejects invalid UUIDs and unknown query keys", async () => {
      await patch({ labelOverride: null }, `${path}/bad`).expect(400);
      await patch({ labelOverride: null }, `${path}/${creation}?extra=1`).expect(400);
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });
    it("propagates persistence failures for rollback without leaking private input", async () => {
      tx.viewAttributeSettingDefinition.updateMany.mockRejectedValue(new Error("private database failure"));
      const result = await patch().expect(500);
      expect(result.body).toEqual({ statusCode: 500, error: "InternalServerError" });
      await expect(prisma.$transaction.mock.results[0]!.value).rejects.toThrow();
      expect(logger.log).not.toHaveBeenCalled();
      expect(JSON.stringify(logger.warn.mock.calls)).not.toMatch(/예상 매출|private database failure/);
    });
    it("does not claim success if the scoped row disappears before writing", async () => {
      tx.viewAttributeSettingDefinition.updateMany.mockResolvedValue({ count: 0 });
      await patch().expect(404);
      expect(logger.log).not.toHaveBeenCalled();
    });
  });

  it("creates attribute, blank cells and one DISPLAY binding in a single transaction", async () => {
    await post().expect(201).expect(expected);
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(tx.attributeDefinition.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ workspaceId: ws, objectDefinitionId: object, title: "매매가격", type: "Currency", sortOrder: 10, icon: null, description: null, configJson: { currency: { defaultCurrencyCode: "KRW", displayType: "symbol" } } }) }));
    expect(tx.recordAttributeValueDefinition.createMany).toHaveBeenCalledWith({ data: expect.arrayContaining([expect.objectContaining({ recordDefinitionId: "record-a", attributeDefinitionId: attr, attributeType: "Currency", numberValue: null }), expect.objectContaining({ recordDefinitionId: "record-b", attributeDefinitionId: attr })]) });
    expect(tx.viewAttributeSettingDefinition.create).toHaveBeenCalledWith({ data: { id: creation, workspaceId: ws, viewDefinitionId: view, attributeDefinitionId: attr, createdByActorId: actor, sortOrder: 5, sourceScope: "RECORD", attributeDisplayRole: "DISPLAY", referenceAttributeIdPathJson: [], isHidden: false, labelOverride: null, width: null } });
    expect(JSON.stringify(logger.log.mock.calls)).not.toContain("매매가격");
    expect(logger.log).toHaveBeenCalledTimes(1);
  });
  it("does not invent records when the object is empty", async () => {
    tx.recordDefinition.findMany.mockResolvedValue([]);
    await post().expect(201);
    expect(tx.recordAttributeValueDefinition.createMany).not.toHaveBeenCalled();
  });
  it.each(ATTRIBUTE_DEFINITION_TYPES)("preserves existing %s attribute creation support", async attributeType => {
    await post({ ...input, attributeType }).expect(201);
    expect(tx.attributeDefinition.create.mock.calls[0][0].data.type).toBe(attributeType);
  });
  it("replays the same creation without new attributes, cells or order changes", async () => {
    tx.viewAttributeSettingDefinition.findUnique.mockResolvedValue({ id: creation, workspaceId: ws, viewDefinitionId: view, createdByActorId: actor, attributeDefinitionId: attr, sourceScope: "RECORD", attributeDisplayRole: "DISPLAY", referenceAttributeIdPathJson: [] });
    await post().expect(200).expect(expected);
    expect(tx.attributeDefinition.create).not.toHaveBeenCalled();
    expect(tx.viewAttributeSettingDefinition.create).not.toHaveBeenCalled();
    expect(logger.log).not.toHaveBeenCalled();
  });
  it.each([{ workspaceId: "foreign" }, { viewDefinitionId: "foreign" }, { createdByActorId: "foreign" }, { sourceScope: "LIST_ENTRY" }, { referenceAttributeIdPathJson: ["foreign"] }])("rejects creation ID reuse outside the original scope: %j", async change => {
    tx.viewAttributeSettingDefinition.findUnique.mockResolvedValue({ id: creation, workspaceId: ws, viewDefinitionId: view, createdByActorId: actor, attributeDefinitionId: attr, sourceScope: "RECORD", attributeDisplayRole: "DISPLAY", referenceAttributeIdPathJson: [], ...change });
    await post().expect(409);
    expect(tx.attributeDefinition.create).not.toHaveBeenCalled();
  });
  it("rejects a reused ID with changed input", async () => {
    tx.viewAttributeSettingDefinition.findUnique.mockResolvedValue({ workspaceId: ws, viewDefinitionId: view, createdByActorId: actor, attributeDefinitionId: attr, sourceScope: "RECORD", attributeDisplayRole: "DISPLAY", referenceAttributeIdPathJson: [] });
    await post({ ...input, attributeType: "Text" }).expect(409);
  });
  it.each([{ type: "KANBAN", objectDefinitionId: object, listDefinitionId: null }, { type: "TABLE", objectDefinitionId: null, listDefinitionId: "list" }, { type: "TABLE", objectDefinitionId: object, listDefinitionId: "list" }])("rejects unsupported View source: %j", async target => {
    tx.$queryRaw.mockImplementation(async (parts: TemplateStringsArray) => parts.join("").includes("transaction_isolation") ? [{ level: "read committed" }] : [target]);
    await post().expect(409);
    expect(tx.attributeDefinition.create).not.toHaveBeenCalled();
  });
  it("requires authentication and current Workspace membership", async () => {
    await request(app.getHttpServer()).post(path).send(input).expect(401);
    prisma.workspaceMember.findFirst.mockResolvedValue(null);
    await post().expect(404);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });
  it("rejects a cross-workspace Object", async () => {
    prisma.objectDefinition.findFirst.mockResolvedValue(null);
    await post().expect(404);
    expect(tx.attributeDefinition.create).not.toHaveBeenCalled();
  });
  it("does not create an attribute when the scoped View lookup is empty", async () => {
    tx.$queryRaw.mockImplementation(async (parts: TemplateStringsArray) => parts.join("").includes("transaction_isolation") ? [{ level: "read committed" }] : []);
    await post().expect(404);
    expect(tx.attributeDefinition.create).not.toHaveBeenCalled();
  });
  it.each([{ ...input, creationId: "bad" }, { ...input, attributeType: "bad" }, { ...input, attributeType: null }, { ...input, attributeDefinitionName: " " }, { ...input, attributeDefinitionName: "a".repeat(81) }, { ...input, objectDefinitionId: object }, { ...input, icon: "custom" }])("rejects invalid or server-owned inputs: %j", async body => {
    await post(body).expect(400);
    expect(tx.attributeDefinition.create).not.toHaveBeenCalled();
  });
  it("rejects unexpected queries and a duplicate attribute slug", async () => {
    await post(input, `${path}?extra=1`).expect(400);
    prisma.attributeDefinition.findFirst.mockResolvedValue({ id: attr });
    await post().expect(409);
    expect(tx.attributeDefinition.create).not.toHaveBeenCalled();
  });
  it("respects the existing View reader limit before writes", async () => {
    tx.viewAttributeSettingDefinition.aggregate.mockResolvedValue({ _count: 500, _max: { sortOrder: 499 } });
    await post().expect(409);
    expect(tx.attributeDefinition.create).not.toHaveBeenCalled();
  });
  it("propagates a final binding failure through the same transaction and never logs success", async () => {
    tx.viewAttributeSettingDefinition.create.mockRejectedValue(new Error("private database failure"));
    const result = await post().expect(500);
    expect(result.body).toEqual({ statusCode: 500, error: "InternalServerError" });
    await expect(prisma.$transaction.mock.results[0]!.value).rejects.toThrow();
    expect(logger.log).not.toHaveBeenCalled();
    expect(JSON.stringify(logger.warn.mock.calls)).not.toContain("private database failure");
  });
  it("returns a safe conflict if a competing creation ID wins the database constraint", async () => {
    tx.viewAttributeSettingDefinition.create.mockRejectedValue(new Prisma.PrismaClientKnownRequestError("private unique conflict", { code: "P2002", clientVersion: "test" }));
    const result = await post().expect(409);
    expect(result.body.error).toBe("ViewColumnCreationConflict");
    await expect(prisma.$transaction.mock.results[0]!.value).rejects.toThrow();
    expect(logger.log).not.toHaveBeenCalled();
    expect(JSON.stringify(result.body)).not.toContain("private unique conflict");
  });
  it("rejects the shared transaction before binding insertion when blank cell creation fails", async () => {
    tx.recordAttributeValueDefinition.createMany.mockRejectedValue(new Error("cell materialization failed"));
    await post().expect(500);
    await expect(prisma.$transaction.mock.results[0]!.value).rejects.toThrow();
    expect(tx.viewAttributeSettingDefinition.create).not.toHaveBeenCalled();
    expect(logger.log).not.toHaveBeenCalled();
  });
});
