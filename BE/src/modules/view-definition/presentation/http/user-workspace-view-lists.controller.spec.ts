import { Module, ValidationPipe, type INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import * as request from "supertest";
import { AuthModule } from "@/modules/auth/infrastructure/auth.module";
import { ViewDefinitionModule } from "@/modules/view-definition/infrastructure/view-definition.module";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { CURRENT_USER_RESOLVER } from "@/shared/application/ports/current-user-resolver.port";
import { DomainError } from "@/shared/domain/errors/domain-error";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";
import { HttpExceptionFilter } from "@/shared/presentation/filters/http-exception.filter";
import { AuthGuard } from "@/shared/presentation/guards/auth.guard";

const WORKSPACE_ID = "00000000-0000-4000-8000-000000000c01";
const TARGET_ID = "00000000-0000-4000-8000-000000000b01";
const SELECTED_ID = "00000000-0000-4000-8000-000000000a02";
const CURRENT_USER: CurrentUserContext = {
  id: "00000000-0000-4000-8000-000000000101",
  sessionId: "00000000-0000-4000-8000-000000000201",
  email: "user@example.com", displayName: "User",
  platformRole: "USER", status: "ACTIVE", timeZone: "Asia/Seoul",
};
const resolver = { resolveFromAccessToken: jest.fn() };
const VIEWS = [
  { id: "00000000-0000-4000-8000-000000000a01", name: "전체 보기", icon: null, type: "TABLE" },
  { id: SELECTED_ID, name: "단계별 보기", icon: "kanban", type: "KANBAN" },
];

// 역할 : 실제 모듈 조립에서 외부 인증 해석기만 대체합니다.
@Module({
  providers: [AuthGuard, { provide: CURRENT_USER_RESOLVER, useValue: resolver }],
  exports: [AuthGuard, CURRENT_USER_RESOLVER],
})
class ViewListsTestAuthModule {}

// 기능 : 실제 Controller·Guard·UseCase·공개 Port·Repository의 두 API 계약을 검증합니다.
describe.each([
  { entity: "Object", slug: "object", key: "objectDefinitionId" },
  { entity: "List", slug: "list", key: "listDefinitionId" },
] as const)("Workspace $entity views HTTP and module wiring", ({ entity, slug, key }) => {
  let app: INestApplication;
  const endpoint = "/api/users/me/workspaces/" + WORKSPACE_ID + "/view-header/" + slug + "-definitions/" + TARGET_ID + "/view-definitions";
  const prisma = {
    workspaceMember: { findFirst: jest.fn() },
    objectDefinition: { findFirst: jest.fn() },
    listDefinition: { findFirst: jest.fn() },
    viewDefinition: { findMany: jest.fn() },
  };

  // 기능 : 인증 adapter와 DB delegate만 대체하고 실제 소유 모듈의 export까지 조립합니다.
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [ViewDefinitionModule] })
      .overrideModule(AuthModule).useModule(ViewListsTestAuthModule)
      .overrideProvider(PrismaService).useValue(prisma).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();
  });

  // 기능 : 매 요청에서 인증과 DB 응답을 초기화해 테스트 간 선택 상태를 격리합니다.
  beforeEach(() => {
    resolver.resolveFromAccessToken.mockReset().mockResolvedValue(CURRENT_USER);
    prisma.workspaceMember.findFirst.mockReset().mockResolvedValue({ id: TARGET_ID });
    prisma.objectDefinition.findFirst.mockReset().mockResolvedValue({ id: TARGET_ID, singularName: "회사", icon: null });
    prisma.listDefinition.findFirst.mockReset().mockResolvedValue({ id: TARGET_ID, name: "영업", icon: null });
    prisma.viewDefinition.findMany.mockReset().mockResolvedValue(VIEWS);
  });

  // 기능 : 테스트 앱의 모든 자원을 해제합니다.
  afterAll(async () => { await app.close(); });

  // 기능 : 중간 View 선택을 표시하면서 정렬·정확한 응답·각 소유 Port 조회를 보존합니다.
  it("serves the list through real owner ports without requiring a preceding header request", async () => {
    await request(app.getHttpServer()).get(endpoint).query({ viewDefinitionId: SELECTED_ID })
      .set("Authorization", "Bearer valid-token").expect(200).expect({ items: [
        { viewDefinitionId: VIEWS[0]!.id, viewName: "전체 보기", viewIcon: null, viewType: "TABLE", isSelected: false },
        { viewDefinitionId: SELECTED_ID, viewName: "단계별 보기", viewIcon: "kanban", viewType: "KANBAN", isSelected: true },
      ] });
    expect(prisma.workspaceMember.findFirst).toHaveBeenCalledTimes(1);
    expect(prisma.workspaceMember.findFirst).toHaveBeenCalledWith({
      where: { userId: CURRENT_USER.id, workspaceId: WORKSPACE_ID }, select: { id: true },
    });
    const targetQuery = entity === "Object" ? prisma.objectDefinition : prisma.listDefinition;
    const otherQuery = entity === "Object" ? prisma.listDefinition : prisma.objectDefinition;
    expect(targetQuery.findFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: TARGET_ID, workspaceId: WORKSPACE_ID },
    }));
    expect(otherQuery.findFirst).not.toHaveBeenCalled();
    expect(prisma.viewDefinition.findMany).toHaveBeenCalledTimes(1);
    expect(prisma.viewDefinition.findMany).toHaveBeenCalledWith({
      where: { workspaceId: WORKSPACE_ID, [key]: TARGET_ID },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }, { id: "asc" }],
      select: { id: true, name: true, icon: true, type: true },
    });
  });

  // 기능 : 선택 ID가 없거나 목록 밖이어도 대상 전체 목록을 반환합니다.
  it.each([{}, { viewDefinitionId: "00000000-0000-4000-8000-000000000fff" }])(
    "returns all items unselected for query %j", async (query) => {
      const response = await request(app.getHttpServer()).get(endpoint).query(query)
        .set("Authorization", "Bearer valid-token").expect(200);
      expect(response.body.items).toHaveLength(2);
      expect(response.body.items.map((item: { isSelected: boolean }) => item.isSelected)).toEqual([false, false]);
    }
  );

  // 기능 : 유효한 UUID의 대문자 표기 역시 현재 선택으로 표시합니다.
  it("accepts uppercase selection UUIDs", async () => {
    const response = await request(app.getHttpServer()).get(endpoint)
      .query({ viewDefinitionId: SELECTED_ID.toUpperCase() })
      .set("Authorization", "Bearer valid-token").expect(200);
    expect(response.body.items[1].isSelected).toBe(true);
  });

  // 기능 : 대상은 존재하지만 View가 없으면 안전한 빈 목록을 반환합니다.
  it("returns 200 with empty items for an existing target without views", async () => {
    prisma.viewDefinition.findMany.mockResolvedValue([]);
    await request(app.getHttpServer()).get(endpoint)
      .set("Authorization", "Bearer valid-token").expect(200).expect({ items: [] });
  });

  // 기능 : 현재 선택 외 추가 입력·배열·null·빈 값을 application 조회 전에 차단합니다.
  it.each([
    { viewDefinitionId: "" }, { viewDefinitionId: "null" }, { viewDefinitionId: "undefined" }, { viewDefinitionId: "invalid" },
    { viewDefinitionId: [SELECTED_ID, SELECTED_ID] },
    { viewId: SELECTED_ID },
    { userId: TARGET_ID }, { workspaceMemberId: TARGET_ID }, { actorId: TARGET_ID },
    { workspaceId: WORKSPACE_ID }, { targetType: "OBJECT" }, { page: 1 }, { sort: "name" },
  ])("rejects invalid or extra query %j", async (query) => {
    await request(app.getHttpServer()).get(endpoint).query(query)
      .set("Authorization", "Bearer valid-token").expect(400);
    expect(prisma.workspaceMember.findFirst).not.toHaveBeenCalled();
  });

  // 기능 : 동일한 UUID라도 중복 query로 들어오면 배열로 거부합니다.
  it("rejects duplicate selection query keys", async () => {
    await request(app.getHttpServer()).get(endpoint + "?viewDefinitionId=" + SELECTED_ID + "&viewDefinitionId=" + SELECTED_ID)
      .set("Authorization", "Bearer valid-token").expect(400);
    expect(prisma.viewDefinition.findMany).not.toHaveBeenCalled();
  });

  // 기능 : Workspace와 대상 path의 UUID를 각각 검증합니다.
  it.each(["workspace", "target"])("rejects an invalid %s path UUID", async (part) => {
    const invalid = endpoint.replace(part === "workspace" ? WORKSPACE_ID : TARGET_ID, "not-a-uuid");
    await request(app.getHttpServer()).get(invalid)
      .set("Authorization", "Bearer valid-token").expect(400);
    expect(prisma.workspaceMember.findFirst).not.toHaveBeenCalled();
  });

  // 기능 : 인증 누락은 소속 정보를 조회하기 전에 차단합니다.
  it("requires authentication", async () => {
    await request(app.getHttpServer()).get(endpoint).expect(401);
    expect(prisma.workspaceMember.findFirst).not.toHaveBeenCalled();
  });

  // 기능 : 기존 인증 실패와 계정 비활성 상태를 그대로 보존합니다.
  it.each([["Unauthorized", 401], ["InactiveUser", 403]] as const)(
    "preserves the %s authentication response", async (code, status) => {
      resolver.resolveFromAccessToken.mockRejectedValue(new DomainError(code, "Access denied"));
      await request(app.getHttpServer()).get(endpoint)
        .set("Authorization", "Bearer invalid-token").expect(status);
      expect(prisma.workspaceMember.findFirst).not.toHaveBeenCalled();
    }
  );

  // 기능 : 비멤버에게는 대상과 View의 존재 정보를 조회하지 않습니다.
  it("returns 404 and stops reads for a nonmember", async () => {
    prisma.workspaceMember.findFirst.mockResolvedValue(null);
    await request(app.getHttpServer()).get(endpoint)
      .set("Authorization", "Bearer valid-token").expect(404).expect({
        statusCode: 404, error: entity + "ViewsWorkspaceNotFound", message: "Workspace not found",
      });
    expect(prisma.objectDefinition.findFirst).not.toHaveBeenCalled();
    expect(prisma.listDefinition.findFirst).not.toHaveBeenCalled();
    expect(prisma.viewDefinition.findMany).not.toHaveBeenCalled();
  });

  // 기능 : 대상 부재·다른 Workspace의 대상은 빈 목록과 구분합니다.
  it("returns the target 404 contract before listing views", async () => {
    const targetQuery = entity === "Object" ? prisma.objectDefinition : prisma.listDefinition;
    targetQuery.findFirst.mockResolvedValue(null);
    await request(app.getHttpServer()).get(endpoint)
      .set("Authorization", "Bearer valid-token").expect(404).expect({
        statusCode: 404, error: entity + "Views" + entity + "DefinitionNotFound",
        message: entity + " definition not found",
      });
    expect(prisma.viewDefinition.findMany).not.toHaveBeenCalled();
  });

  // 기능 : 내부 DB 오류는 정상 빈 목록이나 원문 노출 없이 공통 500으로 전달합니다.
  it("returns a safe 500 for database failures", async () => {
    prisma.viewDefinition.findMany.mockRejectedValue(new Error("private database error"));
    await request(app.getHttpServer()).get(endpoint)
      .set("Authorization", "Bearer valid-token").expect(500).expect({
        statusCode: 500, error: "InternalServerError",
      });
  });
});
