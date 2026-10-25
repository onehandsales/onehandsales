import { randomUUID } from "node:crypto";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";
import { PrismaObjectDefinitionSummaryQueryRepository } from "./prisma-object-definition-summary-query.repository";

const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL;
const describeWithTestDatabase = TEST_DATABASE_URL ? describe : describe.skip;

// 기능 : Object 요약의 실제 Workspace 격리와 최소 필드 매핑을 검증합니다.
describeWithTestDatabase("PrismaObjectDefinitionSummaryQueryRepository", () => {
  let prisma: PrismaService;

  // 기능 : 명시한 테스트 DB에만 연결합니다.
  beforeAll(async () => {
    if (!TEST_DATABASE_URL) throw new Error("TEST_DATABASE_URL is required");
    prisma = new PrismaService({ datasources: { db: { url: TEST_DATABASE_URL } } });
    await prisma.$connect();
  });

  // 기능 : 테스트 DB 연결을 해제합니다.
  afterAll(async () => { await prisma?.$disconnect(); });

  // 기능 : 다른 Workspace의 ID로는 요약을 조회할 수 없고 nullable icon을 보존합니다.
  it("isolates the workspace and returns only the object summary", async () => {
    const userId = randomUUID(), workspaceId = randomUUID(), otherWorkspaceId = randomUUID();
    const memberId = randomUUID(), actorId = randomUUID(), objectId = randomUUID();
    const rollback = new Error("Rollback object summary fixtures");
    // 1. fixture와 조회를 하나의 transaction에서 수행하고 성공해도 rollback한다.
    await expect(prisma.$transaction(async tx => {
      await tx.user.create({ data: { id: userId } });
      await tx.workspace.createMany({ data: [
        { id: workspaceId, name: "Object summary A", kind: "PERSONAL" },
        { id: otherWorkspaceId, name: "Object summary B", kind: "PERSONAL" },
      ] });
      await tx.workspaceMember.create({ data: { id: memberId, userId, workspaceId } });
      await tx.actor.create({ data: { id: actorId, workspaceId, workspaceMemberId: memberId, type: "WORKSPACE_MEMBER" } });
      await tx.objectDefinition.create({ data: {
        id: objectId, workspaceId, createdByActorId: actorId, apiSlug: "companies",
        singularName: "회사", pluralName: "회사들", icon: null, description: "internal detail",
      } });
      const repository = new PrismaObjectDefinitionSummaryQueryRepository(tx);
      expect(await repository.findObjectDefinitionSummary({ workspaceId, objectDefinitionId: objectId }))
        .toEqual({ id: objectId, singularName: "회사", icon: null });
      expect(await repository.findObjectDefinitionSummary({ workspaceId: otherWorkspaceId, objectDefinitionId: objectId })).toBeNull();
      expect(await repository.findObjectDefinitionSummary({ workspaceId, objectDefinitionId: randomUUID() })).toBeNull();
      expect(await tx.objectDefinition.count({ where: { workspaceId } })).toBe(1);
      throw rollback;
    })).rejects.toBe(rollback);
    // 2. fixture가 테스트 DB에도 남지 않았는지 확인한다.
    expect(await prisma.objectDefinition.count({ where: { id: objectId } })).toBe(0);
  });
});
