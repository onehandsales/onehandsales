import { randomUUID } from "node:crypto";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";
import { PrismaViewDefinitionHeaderQueryRepository } from "./prisma-view-definition-header-query.repository";

const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL;
const describeWithTestDatabase = TEST_DATABASE_URL ? describe : describe.skip;

// 기능 : 실제 DB에서 초기 View 순서와 대상·Workspace·개인 Favorite 격리를 검증합니다.
describeWithTestDatabase("PrismaViewDefinitionHeaderQueryRepository", () => {
  let prisma: PrismaService;

  // 기능 : 명시한 테스트 DB에만 연결합니다.
  beforeAll(async () => {
    if (!TEST_DATABASE_URL) throw new Error("TEST_DATABASE_URL is required");
    prisma = new PrismaService({ datasources: { db: { url: TEST_DATABASE_URL } } });
    await prisma.$connect();
  });

  // 기능 : 테스트 DB 연결을 해제합니다.
  afterAll(async () => { await prisma?.$disconnect(); });

  // 기능 : 정렬 동률·두 대상 종류·빈 View·부정한 Workspace 관계와 개인 상태를 함께 확인합니다.
  it("selects the first scoped view and isolates member favorites without writes", async () => {
    const workspaceId = randomUUID(), otherWorkspaceId = randomUUID();
    const userId = randomUUID(), otherUserId = randomUUID();
    const memberId = randomUUID(), otherMemberId = randomUUID(), foreignMemberId = randomUUID();
    const actorId = randomUUID(), objectId = randomUUID(), emptyObjectId = randomUUID(), bothObjectId = randomUUID();
    const listId = randomUUID(), emptyListId = randomUUID(), bothListId = randomUUID();
    const prefix = randomUUID().slice(0, 24);
    // 기능 : 같은 생성 시각의 ID 순서를 의도적으로 제어합니다.
    function viewId(order: number) { return prefix + String(order).padStart(12, "0"); }
    const earlier = new Date("2026-01-01T00:00:00Z"), later = new Date("2026-01-02T00:00:00Z");
    const rollback = new Error("Rollback view header fixtures");

    // 1. 모든 fixture와 검증은 테스트 DB transaction 안에서 수행한다.
    await expect(prisma.$transaction(async tx => {
      await tx.user.createMany({ data: [{ id: userId }, { id: otherUserId }] });
      await tx.workspace.createMany({ data: [
        { id: workspaceId, name: "Header A", kind: "PERSONAL" },
        { id: otherWorkspaceId, name: "Header B", kind: "PERSONAL" },
      ] });
      await tx.workspaceMember.createMany({ data: [
        { id: memberId, workspaceId, userId },
        { id: otherMemberId, workspaceId, userId: otherUserId },
        { id: foreignMemberId, workspaceId: otherWorkspaceId, userId },
      ] });
      await tx.actor.create({ data: { id: actorId, workspaceId, workspaceMemberId: memberId, type: "WORKSPACE_MEMBER" } });
      await tx.objectDefinition.createMany({ data: [objectId, emptyObjectId, bothObjectId].map((id, i) => ({
        id, workspaceId, createdByActorId: actorId, apiSlug: "object-" + i, singularName: "Object", pluralName: "Objects",
      })) });
      await tx.listDefinition.createMany({ data: [listId, emptyListId, bothListId].map((id, i) => ({
        id, workspaceId, createdByActorId: actorId, apiSlug: "list-" + i, name: "List",
      })) });
      await tx.viewDefinition.createMany({ data: [
        { id: viewId(4), workspaceId, objectDefinitionId: objectId, sortOrder: 1, createdAt: earlier },
        { id: viewId(3), workspaceId, objectDefinitionId: objectId, sortOrder: 0, createdAt: later },
        { id: viewId(2), workspaceId, objectDefinitionId: objectId, sortOrder: 0, createdAt: earlier },
        { id: viewId(1), workspaceId, objectDefinitionId: objectId, sortOrder: 0, createdAt: earlier },
        { id: viewId(5), workspaceId: otherWorkspaceId, objectDefinitionId: objectId, sortOrder: -100, createdAt: earlier },
        { id: viewId(6), workspaceId, listDefinitionId: listId, sortOrder: 0, createdAt: earlier },
        { id: viewId(7), workspaceId, objectDefinitionId: bothObjectId, listDefinitionId: bothListId, sortOrder: -200, createdAt: earlier },
      ].map(data => ({ ...data, name: "Header view", icon: null, createdByActorId: actorId, type: "TABLE" as const })) });
      await tx.viewDefinition.update({ where: { id: viewId(6) }, data: { type: "KANBAN" } });
      await tx.viewFavoriteDefinition.createMany({ data: [
        { workspaceId, workspaceMemberId: otherMemberId },
        { workspaceId: otherWorkspaceId, workspaceMemberId: memberId },
        { workspaceId: otherWorkspaceId, workspaceMemberId: foreignMemberId },
      ].map(data => ({ ...data, createdByActorId: actorId, viewDefinitionId: viewId(1) })) });

      // 2. 앞선 다른 대상·Workspace를 제외하고 sortOrder/createdAt/id 순으로 선택한다.
      const repository = new PrismaViewDefinitionHeaderQueryRepository(tx);
      const input = { workspaceId, workspaceMemberId: memberId, targetType: "OBJECT" as const, targetId: objectId };
      expect(await repository.findFirstWorkspaceViewHeader(input)).toEqual({
        id: viewId(1), name: "Header view", icon: null, type: "TABLE", isFavorite: false,
      });
      expect((await repository.findFirstWorkspaceViewHeader({ ...input, workspaceMemberId: otherMemberId }))?.isFavorite).toBe(true);
      expect((await repository.findFirstWorkspaceViewHeader({
        ...input, targetType: "LIST", targetId: listId,
      }))?.type).toBe("KANBAN");
      expect(await repository.findFirstWorkspaceViewHeader({ ...input, targetId: emptyObjectId })).toBeNull();
      expect(await repository.findFirstWorkspaceViewHeader({ ...input, targetType: "LIST", targetId: emptyListId })).toBeNull();
      expect(await repository.findFirstWorkspaceViewHeader({ ...input, targetType: "LIST", targetId: objectId })).toBeNull();

      // 3. 기존 스키마의 두 소속 View를 임의 XOR 조건으로 제외하지 않는다.
      expect((await repository.findFirstWorkspaceViewHeader({ ...input, targetId: bothObjectId }))?.id).toBe(viewId(7));
      expect((await repository.findFirstWorkspaceViewHeader({ ...input, targetType: "LIST", targetId: bothListId }))?.id).toBe(viewId(7));

      // 4. 본인 Favorite가 중복되어도 존재 여부만 반환하고 row를 정리하지 않는다.
      await tx.viewFavoriteDefinition.createMany({ data: [1, 2].map(() => ({
        workspaceId, workspaceMemberId: memberId, viewDefinitionId: viewId(1), createdByActorId: actorId,
      })) });
      expect((await repository.findFirstWorkspaceViewHeader(input))?.isFavorite).toBe(true);
      expect(await tx.viewFavoriteDefinition.count({ where: { workspaceId, workspaceMemberId: memberId } })).toBe(2);
      expect(await tx.viewDefinition.count({ where: { workspaceId } })).toBe(6);
      throw rollback;
    }, { timeout: 15000 })).rejects.toBe(rollback);

    // 5. 성공한 검증의 데이터도 남지 않았는지 확인한다.
    expect(await prisma.viewDefinition.count({ where: { id: viewId(1) } })).toBe(0);
  }, 30000);
});
