import { randomUUID } from "node:crypto";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";
import { PrismaListDefinitionSummaryQueryRepository } from "./prisma-list-definition-summary-query.repository";

const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL;
const describeWithTestDatabase = TEST_DATABASE_URL ? describe : describe.skip;

// 기능 : List 요약의 실제 Workspace 격리와 최소 필드 매핑을 검증합니다.
describeWithTestDatabase("PrismaListDefinitionSummaryQueryRepository", () => {
  let prisma: PrismaService;

  // 기능 : 명시한 테스트 DB에만 연결합니다.
  beforeAll(async () => {
    if (!TEST_DATABASE_URL) throw new Error("TEST_DATABASE_URL is required");
    prisma = new PrismaService({ datasources: { db: { url: TEST_DATABASE_URL } } });
    await prisma.$connect();
  });

  // 기능 : 테스트 DB 연결을 해제합니다.
  afterAll(async () => { await prisma?.$disconnect(); });

  // 기능 : 같은 ID도 요청 Workspace가 다르면 숨기며 설명과 내부 필드는 반환하지 않습니다.
  it("isolates the workspace and returns only the list summary", async () => {
    const userId = randomUUID(), workspaceId = randomUUID(), otherWorkspaceId = randomUUID();
    const memberId = randomUUID(), actorId = randomUUID(), listId = randomUUID();
    const rollback = new Error("Rollback list summary fixtures");
    // 1. fixture와 조회를 하나의 transaction에서 수행하고 성공해도 rollback한다.
    await expect(prisma.$transaction(async tx => {
      await tx.user.create({ data: { id: userId } });
      await tx.workspace.createMany({ data: [
        { id: workspaceId, name: "List summary A", kind: "PERSONAL" },
        { id: otherWorkspaceId, name: "List summary B", kind: "PERSONAL" },
      ] });
      await tx.workspaceMember.create({ data: { id: memberId, userId, workspaceId } });
      await tx.actor.create({ data: { id: actorId, workspaceId, workspaceMemberId: memberId, type: "WORKSPACE_MEMBER" } });
      await tx.listDefinition.create({ data: {
        id: listId, workspaceId, createdByActorId: actorId, apiSlug: "pipeline",
        name: "영업 파이프라인", icon: null, description: "internal detail",
      } });
      const repository = new PrismaListDefinitionSummaryQueryRepository(tx);
      expect(await repository.findListDefinitionSummary({ workspaceId, listDefinitionId: listId }))
        .toEqual({ id: listId, name: "영업 파이프라인", icon: null });
      expect(await repository.findListDefinitionSummary({ workspaceId: otherWorkspaceId, listDefinitionId: listId })).toBeNull();
      expect(await repository.findListDefinitionSummary({ workspaceId, listDefinitionId: randomUUID() })).toBeNull();
      expect(await tx.listDefinition.count({ where: { workspaceId } })).toBe(1);
      throw rollback;
    })).rejects.toBe(rollback);
    // 2. fixture가 테스트 DB에도 남지 않았는지 확인한다.
    expect(await prisma.listDefinition.count({ where: { id: listId } })).toBe(0);
  });
});
