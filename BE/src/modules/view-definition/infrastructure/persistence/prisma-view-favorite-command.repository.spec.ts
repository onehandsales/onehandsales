import { randomUUID } from "node:crypto";
import type { Prisma } from "@prisma/client";
import { CreateWorkspaceViewFavoriteUseCase } from "@/modules/view-definition/application/use-cases/create-workspace-view-favorite.use-case";
import { DeleteWorkspaceViewFavoriteUseCase } from "@/modules/view-definition/application/use-cases/delete-workspace-view-favorite.use-case";
import { ViewFavoriteViewNotFoundError } from "@/modules/view-definition/domain/view-definition.errors";
import type { WorkspaceAccessQuery } from "@/modules/workspace/application/ports/workspace-access-query.port";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import type { TransactionContext, TransactionManager } from "@/shared/application/ports/transaction-manager.port";
import { PrismaTransactionManager } from "@/shared/infrastructure/prisma/prisma-transaction-manager";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";
import { PrismaViewDefinitionHeaderQueryRepository } from "./prisma-view-definition-header-query.repository";
import { PrismaViewFavoriteSidebarQueryRepository } from "./prisma-view-favorite-sidebar-query.repository";
import { PrismaViewFavoriteCommandRepository } from "./prisma-view-favorite-command.repository";

const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL;
const describeWithDatabase = TEST_DATABASE_URL ? describe : describe.skip;

// 기능 : 명시된 테스트 DB에서 실제 잠금·동시성·범위·롤백과 기존 조회 연결을 검증합니다.
describeWithDatabase("Prisma view favorite mutations", () => {
  const workspaceId = randomUUID(), foreignWorkspaceId = randomUUID();
  const userId = randomUUID(), otherUserId = randomUUID();
  const memberId = randomUUID(), otherMemberId = randomUUID(), foreignMemberId = randomUUID();
  const actorId = randomUUID(), otherActorId = randomUUID(), foreignActorId = randomUUID();
  const objectId = randomUUID(), listId = randomUUID(), foreignObjectId = randomUUID();
  const viewIds = Array.from({ length: 8 }, () => randomUUID()), foreignViewId = randomUUID();
  const viewId = viewIds[0]!;
  const workspaceIds = [workspaceId, foreignWorkspaceId];
  const user: CurrentUserContext = { id: userId, sessionId: randomUUID(), email: null, displayName: null, platformRole: "USER", status: "ACTIVE", timeZone: "Asia/Seoul" };
  const logger = { log: jest.fn(), warn: jest.fn(), error: jest.fn() };
  const access: WorkspaceAccessQuery = {
    // 기능 : 외부 Workspace 조회의 결과만 제공하고 View 쓰기는 실제 DB에서 실행합니다.
    async hasWorkspaceMembership() { return true; },
    // 기능 : 동일 Workspace의 두 사용자와 다른 Workspace의 소유 범위를 분리합니다.
    async getWorkspaceMemberAccess(id, requestedWorkspaceId) {
      if (requestedWorkspaceId === workspaceId && id === userId) return { workspaceMemberId: memberId, actorId };
      if (requestedWorkspaceId === workspaceId && id === otherUserId) return { workspaceMemberId: otherMemberId, actorId: otherActorId };
      if (requestedWorkspaceId === foreignWorkspaceId && id === userId) return { workspaceMemberId: foreignMemberId, actorId: foreignActorId };
      return null;
    },
  };
  let prisma: PrismaService, repository: PrismaViewFavoriteCommandRepository, transactions: PrismaTransactionManager;
  let create: CreateWorkspaceViewFavoriteUseCase, remove: DeleteWorkspaceViewFavoriteUseCase;

  // 기능 : 별도 연결에서 동시 transaction이 보도록 격리 DB의 고유 fixture만 commit합니다.
  beforeAll(async () => {
    if (!TEST_DATABASE_URL) throw new Error("TEST_DATABASE_URL is required");
    prisma = new PrismaService({ datasources: { db: { url: TEST_DATABASE_URL } } });
    await prisma.$connect();
    repository = new PrismaViewFavoriteCommandRepository(prisma);
    transactions = new PrismaTransactionManager(prisma);
    create = new CreateWorkspaceViewFavoriteUseCase(access, repository, transactions, logger);
    remove = new DeleteWorkspaceViewFavoriteUseCase(access, repository, transactions, logger);
    await prisma.$transaction(async tx => {
      // 1. 서로 다른 Workspace·사용자·감사 Actor를 준비한다.
      await tx.user.createMany({ data: [{ id: userId }, { id: otherUserId }] });
      await tx.workspace.createMany({ data: workspaceIds.map(id => ({ id, name: "Favorite integration", kind: "PERSONAL" as const })) });
      await tx.workspaceMember.createMany({ data: [{ id: memberId, userId, workspaceId }, { id: otherMemberId, userId: otherUserId, workspaceId }, { id: foreignMemberId, userId, workspaceId: foreignWorkspaceId }] });
      await tx.actor.createMany({ data: [{ id: actorId, workspaceId, workspaceMemberId: memberId }, { id: otherActorId, workspaceId, workspaceMemberId: otherMemberId }, { id: foreignActorId, workspaceId: foreignWorkspaceId, workspaceMemberId: foreignMemberId }].map(row => ({ ...row, type: "WORKSPACE_MEMBER" as const })) });
      // 2. Object·List View와 다른 Workspace View를 구분해 둔다.
      await tx.objectDefinition.createMany({ data: [{ id: objectId, workspaceId, createdByActorId: actorId }, { id: foreignObjectId, workspaceId: foreignWorkspaceId, createdByActorId: foreignActorId }].map(row => ({ ...row, apiSlug: "companies", singularName: "Company", pluralName: "Companies" })) });
      await tx.listDefinition.create({ data: { id: listId, workspaceId, createdByActorId: actorId, apiSlug: "pipeline", name: "Pipeline" } });
      await tx.viewDefinition.createMany({ data: viewIds.map((id, index) => ({ id, workspaceId, createdByActorId: actorId, objectDefinitionId: index % 2 === 0 ? objectId : null, listDefinitionId: index % 2 === 1 ? listId : null, name: "Favorite view", type: index % 2 === 0 ? "TABLE" as const : "KANBAN" as const, sortOrder: index })) });
      await tx.viewDefinition.create({ data: { id: foreignViewId, workspaceId: foreignWorkspaceId, createdByActorId: foreignActorId, objectDefinitionId: foreignObjectId, name: "Foreign view", type: "TABLE" } });
    }, { timeout: 15000 });
  });

  // 기능 : 테스트별 즐겨찾기만 초기화하고 잠금 spy와 로그 상태를 복구합니다.
  beforeEach(async () => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
    await prisma.viewFavoriteDefinition.deleteMany({ where: { workspaceId: { in: workspaceIds } } });
  });

  // 기능 : 테스트가 실패해도 고유 fixture를 FK 순서대로 정리하고 연결을 해제합니다.
  afterAll(async () => {
    if (!prisma) return;
    try {
      await prisma.$transaction(async tx => {
        // 1. 감사 Actor를 참조하는 View 소유 데이터부터 제거한다.
        await tx.viewFavoriteDefinition.deleteMany({ where: { workspaceId: { in: workspaceIds } } });
        await tx.viewDefinition.deleteMany({ where: { workspaceId: { in: workspaceIds } } });
        await tx.listDefinition.deleteMany({ where: { workspaceId: { in: workspaceIds } } });
        await tx.objectDefinition.deleteMany({ where: { workspaceId: { in: workspaceIds } } });
        await tx.actor.deleteMany({ where: { workspaceId: { in: workspaceIds } } });
        await tx.workspaceMember.deleteMany({ where: { workspaceId: { in: workspaceIds } } });
        await tx.workspace.deleteMany({ where: { id: { in: workspaceIds } } });
        await tx.user.deleteMany({ where: { id: { in: [userId, otherUserId] } } });
      });
      expect(await prisma.workspace.count({ where: { id: { in: workspaceIds } } })).toBe(0);
    } finally { await prisma.$disconnect(); }
  });

  // 기능 : 같은 View에 동시에 도착한 등록을 한 행과 한 번의 생성으로 수렴시킵니다.
  it("creates exactly once for concurrent requests and UUID casing variants", async () => {
    const results = await Promise.all(Array.from({ length: 10 }, (_, index) => create.execute(user, index % 2 ? workspaceId.toUpperCase() : workspaceId, index % 2 ? viewId.toUpperCase() : viewId)));
    expect(results.filter(result => result.created)).toHaveLength(1);
    const rows = await prisma.viewFavoriteDefinition.findMany({ where: { workspaceId, workspaceMemberId: memberId } });
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ viewDefinitionId: viewId, createdByActorId: actorId, updatedByActorId: null, sortOrder: 0 });
    expect(rows[0]!.createdAt).toBeInstanceOf(Date);
    expect(logger.log).toHaveBeenCalledTimes(1);
  }, 30000);

  // 기능 : 서로 다른 Object/List View의 동시 추가도 개인 목록 순서를 충돌 없이 배정합니다.
  it("serializes append positions across concurrent Object and List favorites", async () => {
    await Promise.all(viewIds.map(id => create.execute(user, workspaceId, id)));
    const rows = await prisma.viewFavoriteDefinition.findMany({ where: { workspaceId, workspaceMemberId: memberId }, orderBy: { sortOrder: "asc" } });
    expect(rows.map(row => row.sortOrder)).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
    const before = rows.find(row => row.viewDefinitionId === viewId)!;
    expect((await create.execute(user, workspaceId, viewId)).created).toBe(false);
    expect(await prisma.viewFavoriteDefinition.findUnique({ where: { id: before.id } })).toEqual(before);
  }, 30000);

  // 기능 : 기존 중복을 추가 시 보존하고 해제 시 본인 범위만 제거하며 순서를 유지합니다.
  it("preserves historical duplicates on add and isolates deletion and ordering", async () => {
    await prisma.viewFavoriteDefinition.createMany({ data: [
      { workspaceId, workspaceMemberId: memberId, viewDefinitionId: viewId, sortOrder: 4 },
      { workspaceId, workspaceMemberId: memberId, viewDefinitionId: viewId, sortOrder: 6 },
      { workspaceId, workspaceMemberId: memberId, viewDefinitionId: viewIds[1]!, sortOrder: 9 },
      { workspaceId, workspaceMemberId: otherMemberId, viewDefinitionId: viewId, sortOrder: 100 },
      { workspaceId: foreignWorkspaceId, workspaceMemberId: foreignMemberId, viewDefinitionId: foreignViewId, sortOrder: 200 },
      { workspaceId: foreignWorkspaceId, workspaceMemberId: memberId, viewDefinitionId: viewId, sortOrder: 300 },
    ].map(row => ({ ...row, createdByActorId: actorId })) });
    expect((await create.execute(user, workspaceId, viewId)).created).toBe(false);
    expect(await prisma.viewFavoriteDefinition.count({ where: { workspaceId: { in: workspaceIds } } })).toBe(6);
    await create.execute(user, workspaceId, viewIds[2]!);
    expect(await prisma.viewFavoriteDefinition.findFirst({ where: { workspaceId, workspaceMemberId: memberId, viewDefinitionId: viewIds[2]! } })).toMatchObject({ sortOrder: 10 });
    expect(await remove.execute(user, workspaceId, viewId)).toEqual({ viewId, isFavorite: false });
    expect(await remove.execute(user, workspaceId, viewId)).toEqual({ viewId, isFavorite: false });
    const remaining = await prisma.viewFavoriteDefinition.findMany({ where: { workspaceId: { in: workspaceIds } } });
    expect(remaining).toHaveLength(5);
    expect(remaining.filter(row => row.workspaceId === workspaceId && row.workspaceMemberId === memberId).map(row => row.sortOrder).sort((a, b) => a - b)).toEqual([9, 10]);
    expect(remaining.find(row => row.workspaceMemberId === otherMemberId)).toMatchObject({ sortOrder: 100 });
  });

  // 기능 : View 검증이 실제 Workspace 조건을 사용하고 존재하지 않는 대상도 생성하지 않습니다.
  it("rejects a foreign or missing view for both mutations", async () => {
    for (const id of [foreignViewId, randomUUID()]) {
      await expect(create.execute(user, workspaceId, id)).rejects.toBeInstanceOf(ViewFavoriteViewNotFoundError);
      await expect(remove.execute(user, workspaceId, id)).rejects.toBeInstanceOf(ViewFavoriteViewNotFoundError);
    }
    expect(await prisma.viewFavoriteDefinition.count({ where: { workspaceId } })).toBe(0);
  });

  // 기능 : 실제 생성 이후 실패하면 행과 성공 로그가 남지 않고 잠금이 해제됩니다.
  it("rolls back inserts and deletes and releases locks before a retry", async () => {
    const rollback = new Error("forced rollback after insertion");
    const failingTransactions: TransactionManager = {
      // 기능 : 실제 transaction callback의 저장 이후 예외를 주입합니다.
      runInTransaction<T>(work: (context: TransactionContext) => Promise<T>): Promise<T> {
        return transactions.runInTransaction(async context => { await work(context); throw rollback; });
      },
    };
    const failingCreate = new CreateWorkspaceViewFavoriteUseCase(access, repository, failingTransactions, logger);
    await expect(failingCreate.execute(user, workspaceId, viewId)).rejects.toBe(rollback);
    expect(await prisma.viewFavoriteDefinition.count({ where: { workspaceId } })).toBe(0);
    expect(logger.log).not.toHaveBeenCalled();
    expect((await create.execute(user, workspaceId, viewId)).created).toBe(true);
    expect(await prisma.viewFavoriteDefinition.findFirst({ where: { workspaceId } })).toMatchObject({ sortOrder: 0 });
    const failingRemove = new DeleteWorkspaceViewFavoriteUseCase(access, repository, failingTransactions, logger);
    await expect(failingRemove.execute(user, workspaceId, viewId)).rejects.toBe(rollback);
    expect(await prisma.viewFavoriteDefinition.count({ where: { workspaceId } })).toBe(1);
    expect(logger.log).toHaveBeenCalledTimes(1);
    expect(await remove.execute(user, workspaceId, viewId)).toEqual({ viewId, isFavorite: false });
  });

  // 기능 : 등록이 아직 commit되지 않았을 때 해제가 동일 잠금을 기다리고 최종 false로 수렴합니다.
  it("serializes a delete behind an uncommitted create", async () => {
    let releaseCreate!: () => void, inserted!: () => void, deleteAttempted!: () => void;
    const gate = new Promise<void>(resolve => { releaseCreate = resolve; });
    const insertion = new Promise<void>(resolve => { inserted = resolve; });
    const deletion = new Promise<void>(resolve => { deleteAttempted = resolve; });
    const originalCreate = repository.createMemberFavorite.bind(repository);
    const originalLock = repository.lockMemberFavorites.bind(repository);
    jest.spyOn(repository, "createMemberFavorite").mockImplementation(async (input, context) => {
      const result = await originalCreate(input, context);
      inserted(); await gate; return result;
    });
    let lockCount = 0;
    jest.spyOn(repository, "lockMemberFavorites").mockImplementation(async (scope, context) => {
      if (++lockCount === 2) deleteAttempted();
      return originalLock(scope, context);
    });
    const creation = create.execute(user, workspaceId, viewId);
    await insertion;
    const removal = remove.execute(user, workspaceId, viewId);
    try { await deletion; } finally { releaseCreate(); }
    expect((await creation).created).toBe(true);
    expect(await removal).toEqual({ viewId, isFavorite: false });
    expect(await prisma.viewFavoriteDefinition.count({ where: { workspaceId } })).toBe(0);
  }, 15000);

  // 기능 : 반복 읽기 snapshot에서는 잠금 후에도 이전 상태를 볼 수 있어 쓰기 전에 중단합니다.
  it("rejects unsupported snapshot isolation without writing", async () => {
    const runTransaction = prisma.$transaction.bind(prisma);
    const isolationOverride = jest.spyOn(prisma, "$transaction").mockImplementation(
      ((work: (client: Prisma.TransactionClient) => Promise<unknown>) => runTransaction(work, { isolationLevel: "RepeatableRead" })) as PrismaService["$transaction"]
    );
    try {
      await expect(create.execute(user, workspaceId, viewId)).rejects.toThrow("READ COMMITTED");
    } finally { isolationOverride.mockRestore(); }
    expect(await prisma.viewFavoriteDefinition.count({ where: { workspaceId } })).toBe(0);
    expect(logger.log).not.toHaveBeenCalled();
  });

  // 기능 : 쓰기 결과가 기존 헤더·개인 사이드바 조회에 즉시 반영되는지 확인합니다.
  it("reflects favorite mutations in existing header and sidebar queries", async () => {
    const header = new PrismaViewDefinitionHeaderQueryRepository(prisma);
    const sidebar = new PrismaViewFavoriteSidebarQueryRepository(prisma);
    const headerInput = { workspaceId, workspaceMemberId: memberId, targetType: "OBJECT" as const, targetId: objectId };
    await create.execute(user, workspaceId, viewId);
    expect((await header.findFirstWorkspaceViewHeader(headerInput))?.isFavorite).toBe(true);
    expect(await sidebar.listSidebarViewFavorites({ workspaceId, workspaceMemberId: memberId })).toEqual([expect.objectContaining({ viewDefinitionId: viewId })]);
    await remove.execute(user, workspaceId, viewId);
    expect((await header.findFirstWorkspaceViewHeader(headerInput))?.isFavorite).toBe(false);
    expect(await sidebar.listSidebarViewFavorites({ workspaceId, workspaceMemberId: memberId })).toEqual([]);
  });
});
