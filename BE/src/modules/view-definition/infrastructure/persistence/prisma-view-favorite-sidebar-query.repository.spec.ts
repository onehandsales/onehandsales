import { randomUUID } from "node:crypto";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";
import { PrismaViewFavoriteSidebarQueryRepository } from "./prisma-view-favorite-sidebar-query.repository";

const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL;
const describeWithTestDatabase = TEST_DATABASE_URL ? describe : describe.skip;

// 기능 : 명시된 테스트 DB에서 개인·Workspace 격리와 정렬을 rollback으로 검증합니다.
describeWithTestDatabase("PrismaViewFavoriteSidebarQueryRepository", () => {
  let prisma: PrismaService;

  // 기능 : 운영 연결 문자열 대신 명시된 테스트 DB에만 연결합니다.
  beforeAll(async () => {
    if (!TEST_DATABASE_URL) {
      throw new Error("TEST_DATABASE_URL is required for favorite query tests");
    }

    prisma = new PrismaService({
      datasources: { db: { url: TEST_DATABASE_URL } },
    });
    await prisma.$connect();
  });

  // 기능 : 테스트 DB 연결을 해제합니다.
  afterAll(async () => {
    await prisma?.$disconnect();
  });

  // 기능 : 다른 멤버·Workspace·다른 공간의 View를 제외하고 개인 순서와 최소 응답을 확인합니다.
  it("isolates member/workspace/view scope and orders only the four response fields", async () => {
    const userId = randomUUID();
    const otherUserId = randomUUID();
    const workspaceId = randomUUID();
    const otherWorkspaceId = randomUUID();
    const memberId = randomUUID();
    const otherMemberId = randomUUID();
    const otherWorkspaceMemberId = randomUUID();
    const actorId = randomUUID();
    const otherActorId = randomUUID();
    const viewIds = [randomUUID(), randomUUID(), randomUUID(), randomUUID(), randomUUID()] as const;
    const favoriteIdPrefix = randomUUID().slice(0, 24);
    const earlier = new Date("2026-01-01T00:00:00Z");
    const later = new Date("2026-01-02T00:00:00Z");
    const rollback = new Error("Rollback favorite query fixtures");

    // 기능 : 같은 시각의 ID 정렬도 확인할 수 있는 테스트 UUID를 생성합니다.
    function favoriteId(order: number) {
      return `${favoriteIdPrefix}${String(order).padStart(12, "0")}`;
    }

    // 1. 모든 fixture와 검증을 하나의 transaction에서 실행하고 반드시 rollback한다.
    await expect(prisma.$transaction(async (tx) => {
      await tx.user.createMany({ data: [{ id: userId }, { id: otherUserId }] });
      await tx.workspace.createMany({ data: [
        { id: workspaceId, name: "Favorite scope A", kind: "PERSONAL" },
        { id: otherWorkspaceId, name: "Favorite scope B", kind: "PERSONAL" },
      ] });
      await tx.workspaceMember.createMany({ data: [
        { id: memberId, userId, workspaceId },
        { id: otherMemberId, userId: otherUserId, workspaceId },
        { id: otherWorkspaceMemberId, userId, workspaceId: otherWorkspaceId },
      ] });
      await tx.actor.createMany({ data: [
        { id: actorId, workspaceId, workspaceMemberId: memberId, type: "WORKSPACE_MEMBER" },
        { id: otherActorId, workspaceId: otherWorkspaceId, workspaceMemberId: otherWorkspaceMemberId, type: "WORKSPACE_MEMBER" },
      ] });
      await tx.viewDefinition.createMany({ data: viewIds.map((id, index) => ({
        id,
        workspaceId: index < 4 ? workspaceId : otherWorkspaceId,
        createdByActorId: index < 4 ? actorId : otherActorId,
        name: `View ${index}`,
        icon: index === 1 ? null : "star",
        type: "TABLE" as const,
      })) });
      await tx.viewFavoriteDefinition.createMany({ data: [
        { id: favoriteId(1), workspaceId, workspaceMemberId: memberId, createdByActorId: actorId, viewDefinitionId: viewIds[0], sortOrder: 20, createdAt: earlier },
        { id: favoriteId(2), workspaceId, workspaceMemberId: memberId, createdByActorId: actorId, viewDefinitionId: viewIds[1], sortOrder: 10, createdAt: later },
        { id: favoriteId(3), workspaceId, workspaceMemberId: memberId, createdByActorId: actorId, viewDefinitionId: viewIds[2], sortOrder: 10, createdAt: later },
        { id: favoriteId(4), workspaceId, workspaceMemberId: memberId, createdByActorId: actorId, viewDefinitionId: viewIds[3], sortOrder: 10, createdAt: earlier },
        { id: favoriteId(5), workspaceId, workspaceMemberId: otherMemberId, createdByActorId: actorId, viewDefinitionId: viewIds[0], sortOrder: 0 },
        { id: favoriteId(6), workspaceId: otherWorkspaceId, workspaceMemberId: otherWorkspaceMemberId, createdByActorId: otherActorId, viewDefinitionId: viewIds[4], sortOrder: 0 },
        { id: favoriteId(7), workspaceId, workspaceMemberId: memberId, createdByActorId: actorId, viewDefinitionId: viewIds[4], sortOrder: 0 },
      ] });

      // 2. 서버가 확인한 개인 범위와 연결 View의 Workspace 범위, 정렬을 검증한다.
      const repository = new PrismaViewFavoriteSidebarQueryRepository(tx);
      const result = await repository.listSidebarViewFavorites({ workspaceId, workspaceMemberId: memberId });
      expect(result).toEqual([
        { id: favoriteId(4), viewDefinitionId: viewIds[3], name: "View 3", icon: "star" },
        { id: favoriteId(2), viewDefinitionId: viewIds[1], name: "View 1", icon: null },
        { id: favoriteId(3), viewDefinitionId: viewIds[2], name: "View 2", icon: "star" },
        { id: favoriteId(1), viewDefinitionId: viewIds[0], name: "View 0", icon: "star" },
      ]);
      await expect(repository.listSidebarViewFavorites({
        workspaceId: otherWorkspaceId,
        workspaceMemberId: memberId,
      })).resolves.toEqual([]);

      // 3. 성공한 검증도 fixture를 남기지 않는다.
      throw rollback;
    }, { timeout: 15000 })).rejects.toBe(rollback);
  }, 30000);
});
