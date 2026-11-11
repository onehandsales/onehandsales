import { ValidationPipe, type INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import * as request from "supertest";
import { AuthGuard } from "@/shared/presentation/guards/auth.guard";
import { HttpExceptionFilter } from "@/shared/presentation/filters/http-exception.filter";
import { RequestIdMiddleware } from "@/shared/presentation/middleware/request-id.middleware";
import { CURRENT_USER_RESOLVER } from "@/shared/application/ports/current-user-resolver.port";
import { WORKSPACE_ACCESS_QUERY } from "@/modules/workspace/application/ports/workspace-access-query.port";
import { TRANSACTION_MANAGER } from "@/shared/application/ports/transaction-manager.port";
import { APPLICATION_LOGGER } from "@/shared/application/ports/application-logger.port";
import { SidebarOrderConflictError } from "@/shared/application/ordering/ordered-items";
import { ReorderSidebarObjectDefinitionsUseCase } from "@/modules/object-definition/application/use-cases/reorder-sidebar-object-definitions.use-case";
import { ListSidebarObjectDefinitionsUseCase } from "@/modules/object-definition/application/use-cases/list-sidebar-object-definitions.use-case";
import { UserSidebarWorkspaceObjectsController } from "./../../../object-definition/presentation/http/user-sidebar-workspace-objects.controller";
import { SIDEBAR_OBJECT_ORDER_REPOSITORY } from "@/modules/object-definition/application/ports/sidebar-object-order.repository";
import { ReorderSidebarListDefinitionsUseCase } from "@/modules/list-definition/application/use-cases/reorder-sidebar-list-definitions.use-case";
import { ListSidebarListDefinitionsUseCase } from "@/modules/list-definition/application/use-cases/list-sidebar-list-definitions.use-case";
import { UserSidebarWorkspaceListsController } from "./../../../list-definition/presentation/http/user-sidebar-workspace-lists.controller";
import { SIDEBAR_LIST_ORDER_REPOSITORY } from "@/modules/list-definition/application/ports/sidebar-list-order.repository";
import { ReorderSidebarViewFavoritesUseCase } from "@/modules/view-definition/application/use-cases/reorder-sidebar-view-favorites.use-case";
import { ListSidebarViewFavoritesUseCase } from "@/modules/view-definition/application/use-cases/list-sidebar-view-favorites.use-case";
import { UserSidebarWorkspaceViewFavoritesController } from "./user-sidebar-workspace-view-favorites.controller";
import { SIDEBAR_FAVORITE_ORDER_REPOSITORY } from "@/modules/view-definition/application/ports/sidebar-favorite-order.repository";

const W = "00000000-0000-4000-8000-000000000001";
const A = "aaaaaaaa-0000-4000-8000-000000000002";
const B = "bbbbbbbb-0000-4000-8000-000000000003";
const user = { id: "user-1" };
const configurations = [{ section: "objects", controller: UserSidebarWorkspaceObjectsController, useCase: ReorderSidebarObjectDefinitionsUseCase, query: ListSidebarObjectDefinitionsUseCase, token: SIDEBAR_OBJECT_ORDER_REPOSITORY },
{ section: "lists", controller: UserSidebarWorkspaceListsController, useCase: ReorderSidebarListDefinitionsUseCase, query: ListSidebarListDefinitionsUseCase, token: SIDEBAR_LIST_ORDER_REPOSITORY },
{ section: "view-favorites", controller: UserSidebarWorkspaceViewFavoritesController, useCase: ReorderSidebarViewFavoritesUseCase, query: ListSidebarViewFavoritesUseCase, token: SIDEBAR_FAVORITE_ORDER_REPOSITORY }];

// 기능 : 실제 Controller/Guard/DTO/UseCase의 세 순서 API 계약을 함께 검증합니다.
describe.each(configurations)("Sidebar $section order HTTP", config => {
  let app: INestApplication;
  const access = { getWorkspaceMemberAccess: jest.fn() };
  const repository = { lock: jest.fn(), list: jest.fn(), save: jest.fn() };
  const logger = { log: jest.fn(), warn: jest.fn(), error: jest.fn() };
  const transaction = { transactionId: Symbol("test") };
  const transactions = { runInTransaction: jest.fn() };
  const path = `/api/users/me/sidebar/workspaces/${W}/${config.section}/order`;

  beforeEach(async () => {
    jest.resetAllMocks();
    access.getWorkspaceMemberAccess.mockResolvedValue({ workspaceMemberId: "member-1", actorId: "actor-1" });
    repository.list.mockResolvedValue([{ id: A, sortOrder: 0 }, { id: B, sortOrder: 1 }]);
    transactions.runInTransaction.mockImplementation(async work => {
      const result = await work(transaction);
      expect(logger.log).not.toHaveBeenCalled();
      return result;
    });
    const module = await Test.createTestingModule({
      controllers: [config.controller],
      providers: [config.useCase, AuthGuard,
        { provide: config.query, useValue: { execute: jest.fn() } },
        { provide: CURRENT_USER_RESOLVER, useValue: { resolveFromAccessToken: async () => user } },
        { provide: WORKSPACE_ACCESS_QUERY, useValue: access },
        { provide: config.token, useValue: repository },
        { provide: TRANSACTION_MANAGER, useValue: transactions },
        { provide: APPLICATION_LOGGER, useValue: logger }],
    }).compile();
    app = module.createNestApplication();
    const requestIds = new RequestIdMiddleware();
    app.use(requestIds.use.bind(requestIds));
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }));
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();
  });
  afterEach(async () => { await app.close(); });

  it("normalizes IDs, locks before validation and updates only server-owned scope", async () => {
    await request(app.getHttpServer()).patch(path).set("Authorization", "Bearer test")
      .send({ orderedIds: [B.toUpperCase(), A] }).expect(200).expect({ items: [{ id: B, sortOrder: 0 }, { id: A, sortOrder: 1 }] });
    const scope = config.section === "view-favorites" ? { workspaceId: W, workspaceMemberId: "member-1" } : { workspaceId: W };
    expect(repository.save).toHaveBeenCalledWith(scope, [{ id: B, sortOrder: 0 }, { id: A, sortOrder: 1 }], "actor-1", transaction);
    expect(repository.lock.mock.invocationCallOrder[0]).toBeLessThan(repository.list.mock.invocationCallOrder[0]!);
    expect(access.getWorkspaceMemberAccess).toHaveBeenCalledTimes(1);
  });
  it("requires authentication", async () => {
    await request(app.getHttpServer()).patch(path).send({ orderedIds: [B, A] }).expect(401);
    expect(access.getWorkspaceMemberAccess).not.toHaveBeenCalled();
  });
  it("hides absent workspace membership", async () => {
    access.getWorkspaceMemberAccess.mockResolvedValue(null);
    const errorCode = config.section === "objects" ? "ObjectDefinitionWorkspaceNotFound"
      : config.section === "lists" ? "ListDefinitionWorkspaceNotFound" : "ViewFavoriteWorkspaceNotFound";
    await request(app.getHttpServer()).patch(path).set("Authorization", "Bearer secret-test-token")
      .set("x-request-id", "reorder-denied-1").send({ orderedIds: [B, A] }).expect(404)
      .expect({ statusCode: 404, error: errorCode, message: "Workspace not found" });
    expect(transactions.runInTransaction).not.toHaveBeenCalled();
    const message = logger.warn.mock.calls[0]![0] as string;
    expect(JSON.parse(message)).toMatchObject({ requestId: "reorder-denied-1", userId: user.id, workspaceId: W, errorCode });
    expect(message).not.toContain("secret-test-token");
    expect(message).not.toContain(A);
    expect(logger.error).not.toHaveBeenCalled();
  });
  it("records access lookup failures without exposing provider details", async () => {
    access.getWorkspaceMemberAccess.mockRejectedValue(new Error("private-provider-details"));
    await request(app.getHttpServer()).patch(path).set("Authorization", "Bearer test")
      .set("x-request-id", "reorder-access-1").send({ orderedIds: [B, A] }).expect(500)
      .expect({ statusCode: 500, error: "InternalServerError" });
    const message = logger.error.mock.calls[0]![0] as string;
    expect(JSON.parse(message)).toMatchObject({ requestId: "reorder-access-1", userId: user.id, errorCode: "InternalServerError" });
    expect(message).not.toContain("private-provider-details");
    expect(transactions.runInTransaction).not.toHaveBeenCalled();
    expect(logger.log).not.toHaveBeenCalled();
  });
  it("records success with the HTTP request ID after commit", async () => {
    await request(app.getHttpServer()).patch(path).set("Authorization", "Bearer test")
      .set("x-request-id", "reorder-success-1").send({ orderedIds: [B, A] }).expect(200);
    expect(JSON.parse(logger.log.mock.calls[0]![0])).toMatchObject({ requestId: "reorder-success-1", userId: user.id, changedCount: 2 });
    expect(logger.warn).not.toHaveBeenCalled();
    expect(logger.error).not.toHaveBeenCalled();
  });
  it.each([{}, { orderedIds: null }, { orderedIds: "invalid" }, { orderedIds: ["invalid"] }, { orderedIds: [A, A.toUpperCase()] },
    { orderedIds: [A, B], workspaceMemberId: "other" }, { orderedIds: [A, B], sortOrder: 9 },
    { orderedIds: [A], constructor: "unexpected" }, JSON.parse('{"orderedIds":[],"__proto__":{}}')])("rejects malformed body %j", async body => {
    await request(app.getHttpServer()).patch(path).set("Authorization", "Bearer test").set("Content-Type", "application/json").send(JSON.stringify(body)).expect(400);
    expect(repository.save).not.toHaveBeenCalled();
  });
  it("rejects query input and invalid path UUIDs", async () => {
    await request(app.getHttpServer()).patch(path + "?userId=other").set("Authorization", "Bearer test").send({ orderedIds: [A, B] }).expect(400);
    await request(app.getHttpServer()).patch(path.replace(W, "invalid")).set("Authorization", "Bearer test").send({ orderedIds: [A, B] }).expect(400);
  });
  it.each([[A], [A, W], [], [A, B, W]])("returns 409 for a different full ID set %j", async (...ids) => {
    await request(app.getHttpServer()).patch(path).set("Authorization", "Bearer test").send({ orderedIds: ids }).expect(409);
    expect(repository.save).not.toHaveBeenCalled();
  });
  it("treats unchanged order as a no-op even without an actor", async () => {
    access.getWorkspaceMemberAccess.mockResolvedValue({ workspaceMemberId: "member-1", actorId: null });
    await request(app.getHttpServer()).patch(path).set("Authorization", "Bearer test").send({ orderedIds: [A, B] }).expect(200);
    expect(repository.save).not.toHaveBeenCalled();
    expect(logger.log).not.toHaveBeenCalled();
  });
  it("allows an empty request only for an empty section", async () => {
    repository.list.mockResolvedValue([]);
    await request(app.getHttpServer()).patch(path).set("Authorization", "Bearer test").send({ orderedIds: [] }).expect(200).expect({ items: [] });
  });
  it("does not change rows when the required audit actor is missing", async () => {
    access.getWorkspaceMemberAccess.mockResolvedValue({ workspaceMemberId: "member-1", actorId: null });
    await request(app.getHttpServer()).patch(path).set("Authorization", "Bearer test").send({ orderedIds: [B, A] }).expect(500);
    expect(repository.save).not.toHaveBeenCalled();
  });
  it("does not log success on commit failure and maps conflict safely", async () => {
    transactions.runInTransaction.mockRejectedValue(new SidebarOrderConflictError());
    await request(app.getHttpServer()).patch(path).set("Authorization", "Bearer test").send({ orderedIds: [B, A] }).expect(409);
    expect(logger.log).not.toHaveBeenCalled();
  });
});
