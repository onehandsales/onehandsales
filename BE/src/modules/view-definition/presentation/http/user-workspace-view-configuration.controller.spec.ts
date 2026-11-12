import { ValidationPipe, type INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import * as request from "supertest";
import { AuthGuard } from "@/shared/presentation/guards/auth.guard";
import { CURRENT_USER_RESOLVER } from "@/shared/application/ports/current-user-resolver.port";
import { HttpExceptionFilter } from "@/shared/presentation/filters/http-exception.filter";
import { DomainError } from "@/shared/domain/errors/domain-error";
import { fixtureId, fixtureUser } from "../../application/view-data/view-data.fixture";
import { ViewConfigurationService } from "../../application/view-configuration-application.service";
import { UserWorkspaceViewConfigurationController } from "./user-workspace-view-configuration.controller";

// 기능 : 실제 인증 Guard·DTO·오류 매핑을 통해 편집 API의 HTTP 경계를 검증합니다.
describe("View configuration HTTP contract", () => {
  let app: INestApplication;
  const service = { get: jest.fn(), update: jest.fn(), preview: jest.fn(), options: jest.fn() };
  const base = `/api/users/me/workspaces/${fixtureId(3)}/view-definitions/${fixtureId(4)}`;
  const command = { baseConfigurationVersion: "v1", changes: { sorts: { viewSortDefinitions: [] } } };
  beforeAll(async () => {
    const module = await Test.createTestingModule({ controllers: [UserWorkspaceViewConfigurationController], providers: [AuthGuard,
      { provide: CURRENT_USER_RESOLVER, useValue: { resolveFromAccessToken: async () => fixtureUser } },
      { provide: ViewConfigurationService, useValue: service },
    ] }).compile();
    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }));
    app.useGlobalFilters(new HttpExceptionFilter()); await app.init();
  });
  beforeEach(() => { for (const method of Object.values(service)) method.mockReset().mockResolvedValue({ ok: true }); });
  afterAll(async () => { await app.close(); });
  it("requires authentication", async () => { await request(app.getHttpServer()).get(base + "/configuration").expect(401); expect(service.get).not.toHaveBeenCalled(); });
  it("accepts only source selection in query and no GET payload", async () => {
    await request(app.getHttpServer()).get(base + "/configuration?sourceType=LIST").set("Authorization", "Bearer test").expect(200);
    expect(service.get).toHaveBeenCalledWith(fixtureUser, { workspaceId: fixtureId(3), viewDefinitionId: fixtureId(4) }, { sourceType: "LIST" });
    await request(app.getHttpServer()).get(base + "/configuration?extra=1").set("Authorization", "Bearer test").expect(400);
    await request(app.getHttpServer()).get(base + "/configuration").set("Authorization", "Bearer test").send({ extra: true }).expect(400);
  });
  it.each([{ changes: {} }, { ...command, actorId: fixtureId(1) }, { ...command, changes: null }, { ...command, changes: [] }])("rejects invalid mutation envelope %j", async body => {
    await request(app.getHttpServer()).patch(base + "/configuration").set("Authorization", "Bearer test").send(body).expect(400);
    expect(service.update).not.toHaveBeenCalled();
  });
  it("passes preview paging without accepting another source in the body", async () => {
    await request(app.getHttpServer()).post(base + "/data/preview?sourceType=LIST").set("Authorization", "Bearer test").send({ ...command, query: { limit: 10 } }).expect(200);
    expect(service.preview.mock.calls[0]?.[3]).toEqual({ limit: 10, sourceType: "LIST" });
    for (const query of [null, { sourceType: "OBJECT" }, { unknown: true }, { limit: 101 }])
      await request(app.getHttpServer()).post(base + "/data/preview").set("Authorization", "Bearer test").send({ ...command, query }).expect(400);
  });
  it.each([["ViewConfigurationNotFound", 404], ["ViewConfigurationConflict", 409], ["ViewConfigurationInvalid", 422]] as const)("maps %s", async (code, status) => {
    service.update.mockRejectedValueOnce(new DomainError(code, "safe error"));
    const response = await request(app.getHttpServer()).patch(base + "/configuration").set("Authorization", "Bearer test").send(command).expect(status);
    expect(response.body.error).toBe(code);
  });
  it("validates option attribute, scope and page size", async () => {
    await request(app.getHttpServer()).get(base + "/configuration/options").set("Authorization", "Bearer test").query({ sourceScope: "RECORD", attributeDefinitionId: fixtureId(10), limit: "10" }).expect(200);
    expect(service.options.mock.calls[0]?.[2].limit).toBe(10);
    await request(app.getHttpServer()).get(base + "/configuration/options").set("Authorization", "Bearer test").query({ sourceScope: "RECORD", attributeDefinitionId: "invalid" }).expect(400);
  });
});
