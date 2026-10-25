import { randomUUID } from "node:crypto";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";
import { PrismaObjectDefinitionViewsQueryRepository } from "./prisma-object-definition-views-query.repository";

const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL;
const describeWithTestDatabase = TEST_DATABASE_URL ? describe : describe.skip;

// 기능 : Object View 목록의 실제 Workspace·대상 격리와 정렬·표시 필드를 검증합니다.
describeWithTestDatabase("PrismaObjectDefinitionViewsQueryRepository", () => {
  let prisma: PrismaService;

  // 기능 : 명시적인 테스트 DB에만 연결합니다.
  beforeAll(async () => {
    if (!TEST_DATABASE_URL) throw new Error("TEST_DATABASE_URL is required");
    prisma = new PrismaService({ datasources: { db: { url: TEST_DATABASE_URL } } });
    await prisma.$connect();
  });

  // 기능 : 테스트 DB 연결을 해제합니다.
  afterAll(async () => { await prisma?.$disconnect(); });

  // 기능 : 저장 순서 동률과 두 소속 View를 포함해 범위·빈 목록·원문 설정 제외를 확인합니다.
  it("returns every scoped view in stable order without creating or exposing extra data", async () => {
    const workspaceId = randomUUID();
    const otherWorkspaceId = randomUUID();
    const userId = randomUUID();
    const memberId = randomUUID();
    const actorId = randomUUID();
    const targetId = randomUUID();
    const otherTargetId = randomUUID();
    const emptyTargetId = randomUUID();
    const oppositeId = randomUUID();
    const prefix = randomUUID().slice(0, 24);
    const earlier = new Date("2026-01-01T00:00:00Z");
    const later = new Date("2026-01-02T00:00:00Z");
    const rollback = new Error("Rollback object views fixtures");
    const types = [
      "TABLE", "KANBAN", "LIST", "GALLERY", "CALENDAR", "TIMELINE",
      "GANTT", "CHART", "PIVOT", "MAP", "DASHBOARD",
    ] as const;

    // 기능 : 같은 생성 시각을 가진 fixture의 UUID 순서를 의도적으로 고정합니다.
    function viewId(order: number): string {
      return prefix + String(order).padStart(12, "0");
    }

    // 1. 기존 SQL 제약이 적용된 테스트 DB transaction에만 fixture를 생성한다.
    await expect(prisma.$transaction(async tx => {
      await tx.user.create({ data: { id: userId } });
      await tx.workspace.createMany({ data: [
        { id: workspaceId, name: "Views A", kind: "PERSONAL" },
        { id: otherWorkspaceId, name: "Views B", kind: "PERSONAL" },
      ] });
      await tx.workspaceMember.create({ data: { id: memberId, workspaceId, userId } });
      await tx.actor.create({ data: { id: actorId, workspaceId, workspaceMemberId: memberId, type: "WORKSPACE_MEMBER" } });
      await tx.objectDefinition.createMany({ data: [targetId, otherTargetId, emptyTargetId].map((id, i) => ({
        id, workspaceId, createdByActorId: actorId, apiSlug: "target-" + i,
        singularName: "회사", pluralName: "회사들",
      })) });
      await tx.listDefinition.create({ data: {
        id: oppositeId, workspaceId, createdByActorId: actorId, apiSlug: "opposite",
        name: "영업",
      } });
      await tx.viewDefinition.createMany({ data: [
        { id: viewId(4), workspaceId, objectDefinitionId: targetId, sortOrder: 1, createdAt: earlier },
        { id: viewId(3), workspaceId, objectDefinitionId: targetId, sortOrder: 0, createdAt: later },
        { id: viewId(2), workspaceId, objectDefinitionId: targetId, sortOrder: 0, createdAt: earlier },
        { id: viewId(1), workspaceId, objectDefinitionId: targetId, sortOrder: 0, createdAt: earlier },
        { id: viewId(5), workspaceId: otherWorkspaceId, objectDefinitionId: targetId, sortOrder: -100, createdAt: earlier },
        { id: viewId(6), workspaceId, objectDefinitionId: otherTargetId, sortOrder: -200, createdAt: earlier },
        { id: viewId(7), workspaceId, objectDefinitionId: targetId, listDefinitionId: oppositeId, sortOrder: 2, createdAt: earlier },
        { id: viewId(8), workspaceId, listDefinitionId: oppositeId, sortOrder: -300, createdAt: earlier },
      ].map(data => ({
        ...data, name: "Ordered view", icon: null, type: "TABLE" as const,
        createdByActorId: actorId, description: "internal description", configJson: { private: true },
      })) });
      await tx.viewDefinition.createMany({ data: types.map((type, i) => ({
        id: viewId(20 + i), workspaceId, objectDefinitionId: targetId, sortOrder: 10 + i,
        createdAt: earlier, name: type, type, icon: i === 0 ? "table" : null,
        createdByActorId: actorId,
      })) });
      const repository = new PrismaObjectDefinitionViewsQueryRepository(tx);

      // 2. 타 Workspace·다른 대상·다른 종류를 제외하고 두 소속 View도 보존한다.
      const input = { workspaceId, objectDefinitionId: targetId };
      const rows = await repository.findWorkspaceObjectViews(input);
      expect(rows.map(row => row.id)).toEqual([
        viewId(1), viewId(2), viewId(3), viewId(4), viewId(7),
        ...types.map((_type, i) => viewId(20 + i)),
      ]);
      expect(rows[0]).toEqual({ id: viewId(1), name: "Ordered view", icon: null, type: "TABLE" });
      expect(rows.slice(5).map(row => row.type)).toEqual([...types]);
      expect(rows[5]?.icon).toBe("table");
      expect(rows.every(row => Object.keys(row).sort().join(",") === "icon,id,name,type")).toBe(true);

      // 3. 빈 대상·다른 종류 ID·없는 Workspace는 생성 없이 빈 목록이다.
      expect(await repository.findWorkspaceObjectViews({ ...input, objectDefinitionId: emptyTargetId })).toEqual([]);
      expect(await repository.findWorkspaceObjectViews({ ...input, objectDefinitionId: oppositeId })).toEqual([]);
      expect(await repository.findWorkspaceObjectViews({ ...input, workspaceId: randomUUID() })).toEqual([]);
      expect(await repository.findWorkspaceObjectViews({ ...input, objectDefinitionId: randomUUID() })).toEqual([]);
      expect(await tx.viewDefinition.count()).toBeGreaterThanOrEqual(8 + types.length);
      expect(await tx.viewDefinition.count({ where: { workspaceId } })).toBe(7 + types.length);
      throw rollback;
    }, { timeout: 20000 })).rejects.toBe(rollback);

    // 4. 성공한 검증의 fixture도 남지 않았는지 확인한다.
    expect(await prisma.workspace.count({ where: { id: workspaceId } })).toBe(0);
    expect(await prisma.viewDefinition.count({ where: { id: viewId(1) } })).toBe(0);
  }, 30000);
});
