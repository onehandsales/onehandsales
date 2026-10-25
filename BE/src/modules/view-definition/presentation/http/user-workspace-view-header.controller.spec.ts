import { Module, ValidationPipe, type INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import * as request from "supertest";
import { AuthModule } from "@/modules/auth/infrastructure/auth.module";
import { GetWorkspaceViewHeaderUseCase, type WorkspaceViewHeaderResponse } from "@/modules/view-definition/application/use-cases/get-workspace-view-header.use-case";
import { ViewHeaderListDefinitionNotFoundError, ViewHeaderObjectDefinitionNotFoundError, ViewHeaderWorkspaceNotFoundError } from "@/modules/view-definition/domain/view-definition.errors";
import { ViewDefinitionModule } from "@/modules/view-definition/infrastructure/view-definition.module";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { CURRENT_USER_RESOLVER, type CurrentUserResolver } from "@/shared/application/ports/current-user-resolver.port";
import { DomainError } from "@/shared/domain/errors/domain-error";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";
import { HttpExceptionFilter } from "@/shared/presentation/filters/http-exception.filter";
import { AuthGuard } from "@/shared/presentation/guards/auth.guard";
import { UserWorkspaceViewHeaderController } from "./user-workspace-view-header.controller";

const WORKSPACE_ID = "00000000-0000-4000-8000-000000000301";
const TARGET_ID = "00000000-0000-4000-8000-000000000501";
const VIEW_ID = "00000000-0000-4000-8000-000000000801";
const ENDPOINT = "/api/users/me/workspaces/" + WORKSPACE_ID + "/view-header";
const CURRENT_USER: CurrentUserContext = {
  id: "00000000-0000-4000-8000-000000000101",
  sessionId: "00000000-0000-4000-8000-000000000201",
  email: "user@example.com", displayName: "User",
  platformRole: "USER", status: "ACTIVE", timeZone: "Asia/Seoul",
};
const HEADER: WorkspaceViewHeaderResponse = {
  viewId: VIEW_ID, viewName: "전체 회사", viewIcon: null, viewType: "TABLE",
  isFavorite: false,
  objectDefinition: { id: TARGET_ID, name: "회사", icon: null },
  listDefinition: null,
};

// 기능 : 런타임과 같은 전역 Query 검증과 오류 변환을 등록합니다.
function configureApp(app: INestApplication) {
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
  app.useGlobalFilters(new HttpExceptionFilter());
}

// 기능 : 실제 Guard·DTO·Filter를 사용해 헤더 조회의 HTTP 계약을 검증합니다.
describe("UserWorkspaceViewHeaderController", () => {
  let app: INestApplication;
  let useCase: jest.Mocked<Pick<GetWorkspaceViewHeaderUseCase, "execute">>;
  let resolver: jest.Mocked<CurrentUserResolver>;

  // 기능 : 인증 해석과 UseCase 결과만 대체한 실제 HTTP 앱을 준비합니다.
  beforeEach(async () => {
    resolver = { resolveFromAccessToken: jest.fn().mockResolvedValue(CURRENT_USER) };
    useCase = { execute: jest.fn().mockResolvedValue(HEADER) };
    const moduleRef = await Test.createTestingModule({
      controllers: [UserWorkspaceViewHeaderController],
      providers: [
        AuthGuard,
        { provide: CURRENT_USER_RESOLVER, useValue: resolver },
        { provide: GetWorkspaceViewHeaderUseCase, useValue: useCase },
      ],
    }).compile();
    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.init();
  });

  // 기능 : 테스트 HTTP 앱 자원을 해제합니다.
  afterEach(async () => { await app.close(); });

  // 기능 : 사전 View ID 없이 인증 사용자와 검증된 클릭 대상만 전달합니다.
  it("returns an object header using only the clicked target", async () => {
    await request(app.getHttpServer()).get(ENDPOINT)
      .query({ targetType: "OBJECT", targetId: TARGET_ID })
      .set("Authorization", "Bearer valid-token").expect(200).expect(HEADER);
    expect(useCase.execute).toHaveBeenCalledWith(CURRENT_USER, WORKSPACE_ID, {
      targetType: "OBJECT", targetId: TARGET_ID,
    });
  });

  // 기능 : 같은 경로에서 LIST Query를 받아 List 헤더를 반환합니다.
  it("returns a list header on the same endpoint", async () => {
    const header = { ...HEADER, objectDefinition: null, listDefinition: { id: TARGET_ID, name: "영업", icon: "kanban" } };
    useCase.execute.mockResolvedValue(header);
    await request(app.getHttpServer()).get(ENDPOINT)
      .query({ targetType: "LIST", targetId: TARGET_ID })
      .set("Authorization", "Bearer valid-token").expect(200).expect(header);
    expect(useCase.execute).toHaveBeenCalledWith(CURRENT_USER, WORKSPACE_ID, { targetType: "LIST", targetId: TARGET_ID });
  });

  // 기능 : 정상적인 View 없음 상태는 대상 정보를 보존한 200입니다.
  it("returns nullable view fields without creating a view", async () => {
    const header = { ...HEADER, viewId: null, viewName: null, viewIcon: null, viewType: null };
    useCase.execute.mockResolvedValue(header);
    await request(app.getHttpServer()).get(ENDPOINT)
      .query({ targetType: "OBJECT", targetId: TARGET_ID })
      .set("Authorization", "Bearer valid-token").expect(200).expect(header);
  });

  // 기능 : 누락·빈 값·타입 오류·중복·추가 query를 UseCase 호출 전에 차단합니다.
  it.each([
    {}, { targetType: "OBJECT" }, { targetId: TARGET_ID },
    { targetType: "object", targetId: TARGET_ID },
    { targetType: "OTHER", targetId: TARGET_ID },
    { targetType: "OBJECT", targetId: "" },
    { targetType: "OBJECT", targetId: "not-a-uuid" },
    { targetType: ["OBJECT", "LIST"], targetId: TARGET_ID },
    { targetType: "OBJECT", targetId: [TARGET_ID, TARGET_ID] },
    { targetType: "OBJECT", targetId: TARGET_ID, workspaceMemberId: TARGET_ID },
    { targetType: "OBJECT", targetId: TARGET_ID, viewId: VIEW_ID },
  ])("rejects invalid or unexpected query %j", async (query) => {
    await request(app.getHttpServer()).get(ENDPOINT).query(query)
      .set("Authorization", "Bearer valid-token").expect(400);
    expect(useCase.execute).not.toHaveBeenCalled();
  });

  // 기능 : 잘못된 Workspace UUID는 application 호출 전에 거부합니다.
  it("rejects invalid workspace IDs", async () => {
    await request(app.getHttpServer()).get("/api/users/me/workspaces/not-a-uuid/view-header")
      .query({ targetType: "OBJECT", targetId: TARGET_ID })
      .set("Authorization", "Bearer valid-token").expect(400);
    expect(useCase.execute).not.toHaveBeenCalled();
  });

  // 기능 : 인증 헤더가 없으면 사용자 해석과 헤더 조회 전에 차단합니다.
  it("requires authentication", async () => {
    await request(app.getHttpServer()).get(ENDPOINT)
      .query({ targetType: "OBJECT", targetId: TARGET_ID }).expect(401);
    expect(resolver.resolveFromAccessToken).not.toHaveBeenCalled();
    expect(useCase.execute).not.toHaveBeenCalled();
  });

  // 기능 : 기존 인증 실패와 비활성 사용자 상태 코드를 보존합니다.
  it.each([["Unauthorized", 401], ["InactiveUser", 403]] as const)(
    "preserves %s authentication errors", async (code, status) => {
      resolver.resolveFromAccessToken.mockRejectedValue(new DomainError(code, "Access denied"));
      await request(app.getHttpServer()).get(ENDPOINT)
        .query({ targetType: "OBJECT", targetId: TARGET_ID })
        .set("Authorization", "Bearer invalid-token").expect(status);
      expect(useCase.execute).not.toHaveBeenCalled();
    }
  );

  // 기능 : 공통 Filter가 새 도메인 오류를 기존 404 형식으로 변환합니다.
  it.each([
    new ViewHeaderWorkspaceNotFoundError(),
    new ViewHeaderObjectDefinitionNotFoundError(),
    new ViewHeaderListDefinitionNotFoundError(),
  ])("returns the existing 404 contract for %s", async (error) => {
    useCase.execute.mockRejectedValue(error);
    await request(app.getHttpServer()).get(ENDPOINT)
      .query({ targetType: "OBJECT", targetId: TARGET_ID })
      .set("Authorization", "Bearer valid-token").expect(404)
      .expect({ statusCode: 404, error: error.code, message: error.message });
  });

  // 기능 : 내부 오류 원문을 응답에 노출하지 않습니다.
  it("returns a safe 500 for unexpected failures", async () => {
    useCase.execute.mockRejectedValue(new Error("private database error"));
    await request(app.getHttpServer()).get(ENDPOINT)
      .query({ targetType: "OBJECT", targetId: TARGET_ID })
      .set("Authorization", "Bearer valid-token").expect(500)
      .expect({ statusCode: 500, error: "InternalServerError" });
  });
});

// 역할 : 모듈 조립 검증에서 외부 인증 adapter만 대체하는 테스트 모듈입니다.
@Module({
  providers: [AuthGuard, {
    provide: CURRENT_USER_RESOLVER,
    useValue: { resolveFromAccessToken: jest.fn().mockResolvedValue(CURRENT_USER) },
  }],
  exports: [AuthGuard, CURRENT_USER_RESOLVER],
})
class HeaderTestAuthModule {}

// 기능 : 실제 View/Object/List/Workspace 모듈의 공개 Port 연결을 검증합니다.
describe("ViewDefinitionModule header wiring", () => {
  // 기능 : Actor 없이 모든 실제 Query adapter와 UseCase를 거쳐 헤더를 조합합니다.
  it("resolves owner module exports and serves the header through real use cases", async () => {
    const prisma = {
      workspaceMember: { findFirst: jest.fn().mockResolvedValue({ id: TARGET_ID, actors: [] }) },
      objectDefinition: { findFirst: jest.fn().mockResolvedValue({ id: TARGET_ID, singularName: "회사", icon: null }) },
      viewDefinition: { findFirst: jest.fn().mockResolvedValue({
        id: VIEW_ID, name: "전체 회사", icon: null, type: "TABLE", viewFavoriteDefinitions: [],
      }) },
    };
    const moduleRef = await Test.createTestingModule({ imports: [ViewDefinitionModule] })
      .overrideModule(AuthModule).useModule(HeaderTestAuthModule)
      .overrideProvider(PrismaService).useValue(prisma).compile();
    const app = moduleRef.createNestApplication();
    configureApp(app);
    try {
      await app.init();
      await request(app.getHttpServer()).get(ENDPOINT)
        .query({ targetType: "OBJECT", targetId: TARGET_ID })
        .set("Authorization", "Bearer valid-token").expect(200).expect(HEADER);
      expect(prisma.workspaceMember.findFirst).toHaveBeenCalledTimes(1);
      expect(prisma.viewDefinition.findFirst).toHaveBeenCalledTimes(1);
    } finally {
      await app.close();
    }
  });
});
