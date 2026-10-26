import { Module, ValidationPipe, type INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import * as request from "supertest";
import { AuthModule } from "@/modules/auth/infrastructure/auth.module";
import { ViewDefinitionModule } from "@/modules/view-definition/infrastructure/view-definition.module";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { APPLICATION_LOGGER } from "@/shared/application/ports/application-logger.port";
import { CURRENT_USER_RESOLVER } from "@/shared/application/ports/current-user-resolver.port";
import { DomainError } from "@/shared/domain/errors/domain-error";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";
import { HttpExceptionFilter } from "@/shared/presentation/filters/http-exception.filter";
import { AuthGuard } from "@/shared/presentation/guards/auth.guard";
import { RequestIdMiddleware } from "@/shared/presentation/middleware/request-id.middleware";

const WORKSPACE_ID = "00000000-0000-4000-8000-000000000c01";
const VIEW_ID = "00000000-0000-4000-8000-000000000a01";
const MEMBER_ID = "00000000-0000-4000-8000-000000000b01";
const ACTOR_ID = "00000000-0000-4000-8000-000000000d01";
const USER: CurrentUserContext = { id: "00000000-0000-4000-8000-000000000101", sessionId: "session", email: null, displayName: null, platformRole: "USER", status: "ACTIVE", timeZone: "Asia/Seoul" };
const resolver = { resolveFromAccessToken: jest.fn() };

// 역할 : 실제 인증 Guard를 보존하고 외부 토큰 해석기만 격리합니다.
@Module({ providers: [AuthGuard, { provide: CURRENT_USER_RESOLVER, useValue: resolver }], exports: [AuthGuard, CURRENT_USER_RESOLVER] })
class ViewFavoriteTestAuthModule {}

// 기능 : 실제 모듈·Workspace Port·TransactionManager·Repository와 HTTP 계약을 검증합니다.
describe("Workspace view favorite HTTP and module wiring", () => {
  let app: INestApplication;
  const endpoint = `/api/users/me/workspaces/${WORKSPACE_ID}/view-definitions/${VIEW_ID}/favorite`;
  const tx = {
    $queryRaw: jest.fn(),
    viewFavoriteDefinition: { findFirst: jest.fn(), aggregate: jest.fn(), create: jest.fn(), deleteMany: jest.fn() },
  };
  const prisma = { workspaceMember: { findFirst: jest.fn() }, $transaction: jest.fn() };
  const logger = { log: jest.fn(), warn: jest.fn(), error: jest.fn() };

  // 기능 : 외부 인증·DB만 대체하고 실제 새 API 의존성 전체를 조립합니다.
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [ViewDefinitionModule] })
      .overrideModule(AuthModule).useModule(ViewFavoriteTestAuthModule)
      .overrideProvider(PrismaService).useValue(prisma)
      .overrideProvider(APPLICATION_LOGGER).useValue(logger).compile();
    app = moduleRef.createNestApplication();
    const requestIdMiddleware = new RequestIdMiddleware();
    app.use(requestIdMiddleware.use.bind(requestIdMiddleware));
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();
  });

  // 기능 : 각 요청에서 독립된 인증·멤버·transaction·저장 결과를 준비합니다.
  beforeEach(() => {
    jest.resetAllMocks();
    resolver.resolveFromAccessToken.mockResolvedValue(USER);
    prisma.workspaceMember.findFirst.mockResolvedValue({ id: MEMBER_ID, actors: [{ id: ACTOR_ID }] });
    prisma.$transaction.mockImplementation(async (work: (client: typeof tx) => Promise<unknown>) => work(tx));
    tx.$queryRaw.mockImplementation(async (parts: TemplateStringsArray) => parts.join("").includes("pg_advisory_xact_lock") ? [{ isolationLevel: "read committed" }] : [{ id: VIEW_ID }]);
    tx.viewFavoriteDefinition.findFirst.mockResolvedValue(null);
    tx.viewFavoriteDefinition.aggregate.mockResolvedValue({ _max: { sortOrder: null } });
    tx.viewFavoriteDefinition.create.mockResolvedValue({ id: "favorite-id" });
    tx.viewFavoriteDefinition.deleteMany.mockResolvedValue({ count: 1 });
  });

  // 기능 : HTTP 테스트 앱을 종료합니다.
  afterAll(async () => { await app.close(); });

  // 기능 : 신규 생성은 201이며 서버 소유 필드와 정확한 응답 필드를 사용합니다.
  it("creates with 201 through real ports and strips internal result fields", async () => {
    await request(app.getHttpServer()).post(endpoint).set("Authorization", "Bearer valid").expect(201).expect({ viewId: VIEW_ID, isFavorite: true });
    expect(prisma.workspaceMember.findFirst).toHaveBeenCalledWith(expect.objectContaining({ where: { userId: USER.id, workspaceId: WORKSPACE_ID } }));
    expect(tx.viewFavoriteDefinition.create).toHaveBeenCalledWith({ data: { workspaceId: WORKSPACE_ID, workspaceMemberId: MEMBER_ID, viewDefinitionId: VIEW_ID, createdByActorId: ACTOR_ID, sortOrder: 0 }, select: { id: true } });
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(tx.$queryRaw).toHaveBeenCalledTimes(2);
  });

  // 기능 : 재요청은 200으로 반환하고 Actor 없는 기존 등록도 보존합니다.
  it("returns 200 for an existing favorite without an actor", async () => {
    prisma.workspaceMember.findFirst.mockResolvedValue({ id: MEMBER_ID, actors: [] });
    tx.viewFavoriteDefinition.findFirst.mockResolvedValue({ id: "existing" });
    await request(app.getHttpServer()).post(endpoint).set("Authorization", "Bearer valid").expect(200).expect({ viewId: VIEW_ID, isFavorite: true });
    expect(tx.viewFavoriteDefinition.create).not.toHaveBeenCalled();
    expect(logger.log).not.toHaveBeenCalled();
  });

  // 기능 : 삭제와 이미 없는 상태 모두 200/false이며 Actor를 요구하지 않습니다.
  it.each([0, 2])("returns 200 after deleting %i personal rows", async count => {
    prisma.workspaceMember.findFirst.mockResolvedValue({ id: MEMBER_ID, actors: [] });
    tx.viewFavoriteDefinition.deleteMany.mockResolvedValue({ count });
    await request(app.getHttpServer()).delete(endpoint).set("Authorization", "Bearer valid").expect(200).expect({ viewId: VIEW_ID, isFavorite: false });
    expect(tx.viewFavoriteDefinition.deleteMany).toHaveBeenCalledWith({ where: { workspaceId: WORKSPACE_ID, workspaceMemberId: MEMBER_ID, viewDefinitionId: VIEW_ID } });
  });

  // 기능 : 신규 생성 Actor 누락은 원문 없는 내부 오류로 응답합니다.
  it("returns a safe 500 for a missing creation actor", async () => {
    prisma.workspaceMember.findFirst.mockResolvedValue({ id: MEMBER_ID, actors: [] });
    await request(app.getHttpServer()).post(endpoint).set("Authorization", "Bearer valid").expect(500).expect({ statusCode: 500, error: "InternalServerError" });
    expect(tx.viewFavoriteDefinition.create).not.toHaveBeenCalled();
  });

  // 기능 : 두 메서드 모두 인증·검증·Workspace·View 경계를 동일하게 적용합니다.
  describe.each(["post", "delete"] as const)("%s validation and access", method => {
    // 기능 : 생성·기존 header의 정규화·긴 header 대체 결과가 응답과 성공 로그에서 일치합니다.
    it("correlates success events with the middleware response request id", async () => {
      for (const incoming of [undefined, " favorite-request-1 ", "x".repeat(129)]) {
        logger.log.mockClear();
        const call = request(app.getHttpServer())[method](endpoint).set("Authorization", "Bearer valid");
        if (incoming !== undefined) call.set("x-request-id", incoming);
        const response = await call.expect(method === "post" ? 201 : 200);
        const requestId = response.headers["x-request-id"];
        expect(requestId).toEqual(expect.any(String));
        expect(requestId?.length).toBeGreaterThan(0);
        if (incoming === " favorite-request-1 ") expect(requestId).toBe("favorite-request-1");
        if (incoming?.length === 129) expect(requestId).not.toBe(incoming);
        expect(JSON.parse(logger.log.mock.calls[0]![0])).toMatchObject({ requestId, userId: USER.id, workspaceId: WORKSPACE_ID, viewId: VIEW_ID });
      }
    });

    // 기능 : 객체가 아닌 JSON 배열을 빈 요청 DTO로 받아들이지 않습니다.
    it.each([{ body: [] }, { body: [{}] }])("rejects an array body $body", async ({ body }) => {
      await request(app.getHttpServer())[method](endpoint).send(body).set("Authorization", "Bearer valid").expect(400);
      expect(prisma.workspaceMember.findFirst).not.toHaveBeenCalled();
    });

    // 기능 : 인증 누락은 DB 접근 전 차단합니다.
    it("requires authentication", async () => {
      await request(app.getHttpServer())[method](endpoint).expect(401);
      expect(prisma.workspaceMember.findFirst).not.toHaveBeenCalled();
    });

    // 기능 : 비활성 계정은 기존 Guard 오류를 유지합니다.
    it("preserves the inactive-user 403", async () => {
      resolver.resolveFromAccessToken.mockRejectedValue(new DomainError("InactiveUser", "Access denied"));
      await request(app.getHttpServer())[method](endpoint).set("Authorization", "Bearer inactive").expect(403);
    });

    // 기능 : 두 path의 UUID를 각각 검사합니다.
    it.each([WORKSPACE_ID, VIEW_ID])("rejects invalid UUID replacing %s", async id => {
      await request(app.getHttpServer())[method](endpoint.replace(id, "bad-id")).set("Authorization", "Bearer valid").expect(400);
      expect(prisma.workspaceMember.findFirst).not.toHaveBeenCalled();
    });

    // 기능 : query/body 소유자·순서 위조는 유스케이스에 도달하기 전에 거부합니다.
    it.each(["userId", "workspaceMemberId", "actorId", "sortOrder", "requestId"])("rejects extra %s in query and body", async key => {
      await request(app.getHttpServer())[method](endpoint).query({ [key]: MEMBER_ID }).set("Authorization", "Bearer valid").expect(400);
      await request(app.getHttpServer())[method](endpoint).send({ [key]: MEMBER_ID }).set("Authorization", "Bearer valid").expect(400);
      expect(prisma.workspaceMember.findFirst).not.toHaveBeenCalled();
    });

    // 기능 : 비멤버에게 View 존재 정보를 노출하지 않습니다.
    it("returns the same workspace 404 for missing membership", async () => {
      prisma.workspaceMember.findFirst.mockResolvedValue(null);
      await request(app.getHttpServer())[method](endpoint).set("Authorization", "Bearer valid").expect(404).expect({ statusCode: 404, error: "ViewFavoriteWorkspaceNotFound", message: "Workspace not found" });
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    // 기능 : 없는 View와 다른 Workspace View는 같은 소속 조회 결과로 404를 반환합니다.
    it("returns view 404 without writes for an inaccessible view", async () => {
      tx.$queryRaw.mockResolvedValueOnce([{ isolationLevel: "read committed" }]).mockResolvedValueOnce([]);
      await request(app.getHttpServer())[method](endpoint).set("Authorization", "Bearer valid").expect(404).expect({ statusCode: 404, error: "ViewFavoriteViewNotFound", message: "View definition not found" });
      expect(tx.viewFavoriteDefinition.create).not.toHaveBeenCalled();
      expect(tx.viewFavoriteDefinition.deleteMany).not.toHaveBeenCalled();
    });

    // 기능 : DB 오류 원문을 응답하지 않고 성공 로그도 남기지 않습니다.
    it("returns a safe 500 for transaction failures", async () => {
      prisma.$transaction.mockRejectedValue(new Error("private database error"));
      await request(app.getHttpServer())[method](endpoint).set("Authorization", "Bearer valid").set("x-request-id", "failed-favorite-request").expect(500).expect({ statusCode: 500, error: "InternalServerError" });
      expect(logger.log).not.toHaveBeenCalled();
      expect(JSON.parse(logger.error.mock.calls[0]![0])).toMatchObject({ requestId: "failed-favorite-request", workspaceId: WORKSPACE_ID, viewId: VIEW_ID });
      expect(logger.error.mock.calls[0]![0]).not.toContain("private database error");
    });
  });
});
