import type { ViewFavoriteCommandRepository } from "@/modules/view-definition/application/ports/view-favorite-command.repository";
import { ViewFavoriteViewNotFoundError, ViewFavoriteWorkspaceNotFoundError } from "@/modules/view-definition/domain/view-definition.errors";
import type { WorkspaceAccessQuery } from "@/modules/workspace/application/ports/workspace-access-query.port";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import type { TransactionContext, TransactionManager } from "@/shared/application/ports/transaction-manager.port";
import { CreateWorkspaceViewFavoriteUseCase } from "./create-workspace-view-favorite.use-case";
import { DeleteWorkspaceViewFavoriteUseCase } from "./delete-workspace-view-favorite.use-case";

const WORKSPACE_ID = "00000000-0000-4000-8000-000000000c01";
const VIEW_ID = "00000000-0000-4000-8000-000000000a01";
const MEMBER_ID = "member-id", ACTOR_ID = "actor-id";
const USER: CurrentUserContext = { id: "user-id", sessionId: "session-id", email: null, displayName: null, platformRole: "USER", status: "ACTIVE", timeZone: "Asia/Seoul" };
const SCOPE = { workspaceId: WORKSPACE_ID, workspaceMemberId: MEMBER_ID, viewId: VIEW_ID };

// 기능 : HTTP·ORM 없이 권한·멱등성·순서·트랜잭션·로그 경계를 검증합니다.
describe("Workspace view favorite use cases", () => {
  const access: jest.Mocked<WorkspaceAccessQuery> = { hasWorkspaceMembership: jest.fn(), getWorkspaceMemberAccess: jest.fn() };
  const repository: jest.Mocked<ViewFavoriteCommandRepository> = {
    lockMemberFavorites: jest.fn(), lockWorkspaceView: jest.fn(), findMemberFavorite: jest.fn(),
    findLastMemberFavoriteSortOrder: jest.fn(), createMemberFavorite: jest.fn(), deleteMemberFavorites: jest.fn(),
  };
  const context: TransactionContext = { transactionId: Symbol("test") };
  const logger = { log: jest.fn(), warn: jest.fn(), error: jest.fn() };
  let committed = false, failCommit = false, transactionCalls = 0;
  const transactions: TransactionManager = {
    // 기능 : callback이 완료된 뒤 commit 성공·실패를 분리해 로그 시점을 검증합니다.
    async runInTransaction<T>(work: (context: TransactionContext) => Promise<T>): Promise<T> {
      transactionCalls++;
      const result = await work(context);
      if (failCommit) throw new Error("commit failed");
      committed = true;
      return result;
    },
  };
  const create = new CreateWorkspaceViewFavoriteUseCase(access, repository, transactions, logger);
  const remove = new DeleteWorkspaceViewFavoriteUseCase(access, repository, transactions, logger);

  // 기능 : 매 사례의 멤버·저장 결과·commit 상태를 독립적으로 초기화합니다.
  beforeEach(() => {
    jest.resetAllMocks();
    committed = false; failCommit = false; transactionCalls = 0;
    access.getWorkspaceMemberAccess.mockResolvedValue({ workspaceMemberId: MEMBER_ID, actorId: ACTOR_ID });
    repository.lockMemberFavorites.mockResolvedValue();
    repository.lockWorkspaceView.mockResolvedValue(true);
    repository.findMemberFavorite.mockResolvedValue(null);
    repository.findLastMemberFavoriteSortOrder.mockResolvedValue(null);
    repository.createMemberFavorite.mockResolvedValue({ id: "favorite-id" });
    repository.deleteMemberFavorites.mockResolvedValue(1);
    logger.log.mockImplementation(() => { expect(committed).toBe(true); });
  });

  // 기능 : 빈 목록과 기존 개인 순서를 구분해 서버 Actor로 맨 뒤에 저장합니다.
  it.each([[null, 0], [7, 8], [-3, -2]] as const)("appends after %s with sortOrder %s", async (last, next) => {
    repository.findLastMemberFavoriteSortOrder.mockResolvedValue(last);
    expect(await create.execute(USER, WORKSPACE_ID.toUpperCase(), VIEW_ID.toUpperCase())).toEqual({ viewDefinitionId: VIEW_ID, isFavorite: true, created: true });
    expect(access.getWorkspaceMemberAccess).toHaveBeenCalledWith(USER.id, WORKSPACE_ID);
    expect(repository.createMemberFavorite).toHaveBeenCalledWith({ ...SCOPE, createdByActorId: ACTOR_ID, sortOrder: next }, context);
    expect(logger.log).toHaveBeenCalledWith(JSON.stringify({ event: "crm.viewFavorite.created", requestId: null, userId: USER.id, ...SCOPE, favoriteId: "favorite-id" }), "CreateWorkspaceViewFavoriteUseCase");
    expect(repository.lockMemberFavorites.mock.invocationCallOrder[0]).toBeLessThan(repository.lockWorkspaceView.mock.invocationCallOrder[0]!);
    expect(repository.lockWorkspaceView).toHaveBeenCalledWith(SCOPE, context);
  });

  // 기능 : 기존 등록에는 Actor가 없어도 재생성·재정렬·성공 로그를 추가하지 않습니다.
  it("returns an existing favorite without requiring an actor or reordering", async () => {
    access.getWorkspaceMemberAccess.mockResolvedValue({ workspaceMemberId: MEMBER_ID, actorId: null });
    repository.findMemberFavorite.mockResolvedValue({ id: "old-favorite" });
    expect(await create.execute(USER, WORKSPACE_ID, VIEW_ID)).toEqual({ viewDefinitionId: VIEW_ID, isFavorite: true, created: false });
    expect(repository.findMemberFavorite).toHaveBeenCalledWith(SCOPE, context);
    expect(repository.findLastMemberFavoriteSortOrder).not.toHaveBeenCalled();
    expect(repository.createMemberFavorite).not.toHaveBeenCalled();
    expect(logger.log).not.toHaveBeenCalled();
  });

  // 기능 : 신규 생성에 필요한 Actor 부재는 자동 보정하지 않고 변경 전에 중단합니다.
  it("rejects a new favorite without an actor", async () => {
    access.getWorkspaceMemberAccess.mockResolvedValue({ workspaceMemberId: MEMBER_ID, actorId: null });
    await expect(create.execute(USER, WORKSPACE_ID, VIEW_ID)).rejects.toThrow("Workspace member actor is missing");
    expect(repository.createMemberFavorite).not.toHaveBeenCalled();
    expect(committed).toBe(false);
    expect(logger.log).not.toHaveBeenCalled();
  });

  // 기능 : Actor가 없어도 기존 중복 수만큼 해제하고 개인 범위만 전달합니다.
  it.each([0, 1, 3])("deletes %i scoped rows and always returns false", async count => {
    access.getWorkspaceMemberAccess.mockResolvedValue({ workspaceMemberId: MEMBER_ID, actorId: null });
    repository.deleteMemberFavorites.mockResolvedValue(count);
    expect(await remove.execute(USER, WORKSPACE_ID.toUpperCase(), VIEW_ID.toUpperCase())).toEqual({ viewDefinitionId: VIEW_ID, isFavorite: false });
    expect(repository.deleteMemberFavorites).toHaveBeenCalledWith(SCOPE, context);
    expect(repository.findLastMemberFavoriteSortOrder).not.toHaveBeenCalled();
    expect(logger.log).toHaveBeenCalledTimes(count > 0 ? 1 : 0);
  });

  // 기능 : 등록·해제 모두 현재 사용자 접근과 대상 소속을 우선 검증합니다.
  describe.each([{ name: "create", useCase: create }, { name: "delete", useCase: remove }])("$name mutation boundaries", ({ useCase }) => {
    // 기능 : 프레임워크 의존 없이 전달한 요청 ID로 commit된 변경을 추적합니다.
    it("includes the request id in the committed mutation event", async () => {
      await useCase.execute(USER, WORKSPACE_ID, VIEW_ID, "favorite-request-1");
      expect(JSON.parse(logger.log.mock.calls[0]![0])).toMatchObject({ requestId: "favorite-request-1", userId: USER.id, ...SCOPE });
    });

    // 기능 : 비멤버는 transaction·View 접근을 수행하지 않습니다.
    it("stops before a transaction for a nonmember", async () => {
      access.getWorkspaceMemberAccess.mockResolvedValue(null);
      await expect(useCase.execute(USER, WORKSPACE_ID, VIEW_ID)).rejects.toBeInstanceOf(ViewFavoriteWorkspaceNotFoundError);
      expect(transactionCalls).toBe(0);
      expect(repository.lockMemberFavorites).not.toHaveBeenCalled();
    });

    // 기능 : 소속이 다른 View 또는 부재한 View는 수정 없이 404로 전파합니다.
    it("rejects an inaccessible view inside the transaction", async () => {
      repository.lockWorkspaceView.mockResolvedValue(false);
      await expect(useCase.execute(USER, WORKSPACE_ID, VIEW_ID)).rejects.toBeInstanceOf(ViewFavoriteViewNotFoundError);
      expect(repository.createMemberFavorite).not.toHaveBeenCalled();
      expect(repository.deleteMemberFavorites).not.toHaveBeenCalled();
      expect(logger.log).not.toHaveBeenCalled();
    });

    // 기능 : callback 이후 commit 실패를 성공 응답·로그로 숨기지 않습니다.
    it("propagates commit failure without logging success", async () => {
      failCommit = true;
      await expect(useCase.execute(USER, WORKSPACE_ID, VIEW_ID, "failed-favorite-request")).rejects.toThrow("commit failed");
      expect(logger.log).not.toHaveBeenCalled();
      expect(committed).toBe(false);
      expect(logger.error).toHaveBeenCalledTimes(1);
      expect(JSON.parse(logger.error.mock.calls[0]![0])).toMatchObject({ requestId: "failed-favorite-request", userId: USER.id, ...SCOPE });
      expect(logger.error.mock.calls[0]![0]).not.toContain("commit failed");
    });
  });
});
