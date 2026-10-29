import { Module, ValidationPipe, type INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import * as request from "supertest";
import { AuthModule } from "@/modules/auth/infrastructure/auth.module";
import { ViewDefinitionModule } from "../../infrastructure/view-definition.module";
import { CURRENT_USER_RESOLVER } from "@/shared/application/ports/current-user-resolver.port";
import { APPLICATION_LOGGER } from "@/shared/application/ports/application-logger.port";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";
import { AuthGuard } from "@/shared/presentation/guards/auth.guard";
import { HttpExceptionFilter } from "@/shared/presentation/filters/http-exception.filter";
import { RequestIdMiddleware } from "@/shared/presentation/middleware/request-id.middleware";
import { DomainError } from "@/shared/domain/errors/domain-error";

const W = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa", V = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const endpoint = "/api/users/me/workspaces/" + W + "/view-header/view-definitions/" + V;
const user = { id: W, sessionId: V, status: "ACTIVE", platformRole: "USER" };
const resolver = { resolveFromAccessToken: jest.fn().mockResolvedValue(user) };

// 역할 : 실제 Guard를 유지하면서 외부 인증 검증만 대체합니다.
@Module({ providers: [AuthGuard, { provide: CURRENT_USER_RESOLVER, useValue: resolver }], exports: [AuthGuard, CURRENT_USER_RESOLVER] })
class MenuTestAuthModule {}

// 기능 : 실제 모듈·Controller·UseCase·adapter의 HTTP 계약을 검증합니다.
describe("View header menus HTTP and module wiring", () => {
  let app: INestApplication;
  const logger = { log: jest.fn(), warn: jest.fn(), error: jest.fn() };
  const prisma = {
    workspaceMember: { findFirst: jest.fn() },
    viewDefinition: { findFirst: jest.fn(), findMany: jest.fn() },
    viewFilterGroupDefinition: { findMany: jest.fn() },
    viewFilterConditionDefinition: { findMany: jest.fn() },
    viewSortDefinition: { findMany: jest.fn() },
    viewAttributeSettingDefinition: { findMany: jest.fn() },
    viewGroupDefinition: { findMany: jest.fn() },
    viewGroupSettingDefinition: { findMany: jest.fn() },
    viewWidgetDefinition: { findMany: jest.fn() },
    attributeDefinition: { findMany: jest.fn() },
    selectOption: { findMany: jest.fn() },
    statusOption: { findMany: jest.fn() },
  };

  // 기능 : 공개 Port DI를 실제 모듈로 조립하고 runtime validation을 등록합니다.
  beforeAll(async () => {
    const ref = await Test.createTestingModule({ imports: [ViewDefinitionModule] })
      .overrideModule(AuthModule).useModule(MenuTestAuthModule)
      .overrideProvider(PrismaService).useValue(prisma)
      .overrideProvider(APPLICATION_LOGGER).useValue(logger).compile();
    app = ref.createNestApplication();
    const middleware = new RequestIdMiddleware();
    app.use(middleware.use.bind(middleware));
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();
  });

  // 기능 : 테스트별로 조회 결과와 외부 인증 상태를 초기화합니다.
  beforeEach(() => {
    jest.clearAllMocks();
    resolver.resolveFromAccessToken.mockResolvedValue(user);
    prisma.workspaceMember.findFirst.mockResolvedValue({ id: W });
    prisma.viewDefinition.findFirst.mockResolvedValue({ id: V, workspaceId: W, name: "view", type: "TABLE", objectDefinitionId: null, listDefinitionId: null, configJson: null });
    for (const delegate of Object.values(prisma)) if ("findMany" in delegate) delegate.findMany.mockResolvedValue([]);
  });

  // 기능 : HTTP 서버 자원을 해제합니다.
  afterAll(async () => { await app.close(); });

  // 기능 : 인증된 각 메뉴를 실제 유스케이스로 읽고 기본 생성 없이 빈 상태를 반환합니다.
  it.each(["filters", "sorts", "settings"])("serves %s through real module bindings", async menu => {
    const response = await request(app.getHttpServer()).get(endpoint + "/" + menu).set("Authorization", "Bearer test").expect(200);
    expect(response.body).toMatchObject({ viewDefinitionId: V, viewType: "TABLE", attributeDefinitions: [] });
    expect(prisma.workspaceMember.findFirst).toHaveBeenCalledTimes(1);
    expect(prisma.attributeDefinition.findMany).not.toHaveBeenCalled();
  });

  // 기능 : 공개 Attribute Port와 JSON 매핑까지 실제 adapter 연결을 확인합니다.
  it("resolves metadata without exposing internal scope or actor fields", async () => {
    prisma.viewSortDefinition.findMany.mockResolvedValue([{ id: V, workspaceId: W, viewDefinitionId: V, createdAt: new Date(), sortOrder: 0, sourceScope: "RECORD", attributeDefinitionId: W, referenceAttributeIdPathJson: [], sortDirection: "DESC", configJson: null }]);
    prisma.attributeDefinition.findMany.mockResolvedValue([{ id: W, workspaceId: W, objectDefinitionId: V, listDefinitionId: null, title: "field", type: "Text", icon: null, isMultiselect: false, configJson: false }]);
    const response = await request(app.getHttpServer()).get(endpoint + "/sorts").set("Authorization", "Bearer test").expect(200);
    expect(response.body.attributeDefinitions[0]).toMatchObject({ configJson: false });
    expect(response.body.attributeDefinitions[0]).not.toHaveProperty("workspaceId");
    expect(response.body.viewSortDefinitions[0]).not.toHaveProperty("createdAt");
    expect(prisma.attributeDefinition.findMany).toHaveBeenCalledTimes(1);
    expect(prisma.selectOption.findMany).not.toHaveBeenCalled();
  });

  // 기능 : 세 메뉴 모두 Bearer 인증을 요구합니다.
  it.each(["filters", "sorts", "settings"])("requires auth for %s", async menu => {
    await request(app.getHttpServer()).get(endpoint + "/" + menu).expect(401);
    expect(prisma.viewDefinition.findFirst).not.toHaveBeenCalled();
  });

  // 기능 : 비활성 사용자와 잘못된 인증의 상태 코드를 유지합니다.
  it.each([["InactiveUser", 403], ["Unauthorized", 401]] as const)("preserves %s", async (code, status) => {
    resolver.resolveFromAccessToken.mockRejectedValueOnce(new DomainError(code, "Access denied"));
    await request(app.getHttpServer()).get(endpoint + "/filters").set("Authorization", "Bearer test").expect(status);
  });

  // 기능 : 임의 Query는 값이 비어 있어도 거부합니다.
  it.each(["filters", "sorts", "settings"])("rejects extra query for %s", async menu => {
    await request(app.getHttpServer()).get(endpoint + "/" + menu).query({ unexpected: "" }).set("Authorization", "Bearer test").expect(400);
    expect(prisma.workspaceMember.findFirst).not.toHaveBeenCalled();
  });

  // 기능 : null·배열·원시값·추가 필드 Body를 거부합니다.
  it.each(["null", "[]", "1", '"text"', '{"extra":true}'])("rejects body %s", async body => {
    await request(app.getHttpServer()).get(endpoint + "/settings").set("Authorization", "Bearer test").set("Content-Type", "application/json").send(body).expect(400);
    expect(prisma.workspaceMember.findFirst).not.toHaveBeenCalled();
  });

  // 기능 : 전역 DTO 변환이 제거할 수 있는 키도 모든 메뉴에서 DB 접근 전에 거부합니다.
  it.each(["filters", "sorts", "settings"])("rejects reserved request keys for %s", async menu => {
    for (const body of ['{"constructor":"unexpected"}', '{"__proto__":{"extra":true}}']) {
      await request(app.getHttpServer()).get(endpoint + "/" + menu).set("Authorization", "Bearer test").set("Content-Type", "application/json").send(body).expect(400);
    }
    await request(app.getHttpServer()).get(endpoint + "/" + menu + "?constructor=unexpected").set("Authorization", "Bearer test").expect(400);
    expect(prisma.workspaceMember.findFirst).not.toHaveBeenCalled();
  });

  // 기능 : 명시적인 빈 객체 Body는 모든 메뉴의 읽기 계약에서 허용합니다.
  it.each(["filters", "sorts", "settings"])("accepts an empty object body for %s", async menu => {
    await request(app.getHttpServer()).get(endpoint + "/" + menu).set("Authorization", "Bearer test").send({}).expect(200);
  });

  // 기능 : 두 경로 식별자를 application 호출 전에 검증합니다.
  it.each([endpoint.replace(W, "invalid"), endpoint.replace(V, "invalid")])("rejects invalid UUID %s", async path => {
    await request(app.getHttpServer()).get(path + "/sorts").set("Authorization", "Bearer test").expect(400);
    expect(prisma.workspaceMember.findFirst).not.toHaveBeenCalled();
  });

  // 기능 : Workspace 비멤버와 선택 View 부재를 각 계약 오류로 반환합니다.
  it.each(["workspace", "view"])("returns scoped 404 for %s", async missing => {
    if (missing === "workspace") prisma.workspaceMember.findFirst.mockResolvedValue(null);
    else prisma.viewDefinition.findFirst.mockResolvedValue(null);
    const response = await request(app.getHttpServer()).get(endpoint + "/filters").set("Authorization", "Bearer test").expect(404);
    expect(response.body.error).toBe(missing === "workspace" ? "ViewHeaderWorkspaceNotFound" : "ViewHeaderViewDefinitionNotFound");
  });

  // 기능 : 깨진 필터 참조를 안전한 500과 기존 요청 ID 로그로 처리합니다.
  it("returns safe configuration failure and logs request context", async () => {
    prisma.viewFilterGroupDefinition.findMany.mockResolvedValue([{ id: V, workspaceId: W, viewDefinitionId: V, createdAt: new Date(), sortOrder: 0, conditionGroupOperator: "AND", parentViewFilterGroupDefinitionId: V }]);
    await request(app.getHttpServer()).get(endpoint + "/filters").set("Authorization", "Bearer test").set("x-request-id", "menu-test").expect(500).expect({ statusCode: 500, error: "ViewHeaderConfigurationInvalid", message: "View configuration is invalid" });
    expect(logger.error.mock.calls[0]![0]).toContain("menu-test");
  });
});
