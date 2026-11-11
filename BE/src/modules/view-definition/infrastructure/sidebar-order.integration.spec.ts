import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";
import { PrismaTransactionManager } from "@/shared/infrastructure/prisma/prisma-transaction-manager";
import type { TransactionManager } from "@/shared/application/ports/transaction-manager.port";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { PrismaWorkspaceAccessQueryRepository } from "@/modules/workspace/infrastructure/persistence/prisma-workspace-access-query.repository";
import { PrismaViewFavoriteCommandRepository } from "./persistence/prisma-view-favorite-command.repository";
import { PrismaObjectDefinitionCommandRepository } from "@/modules/object-definition/infrastructure/persistence/prisma-object-definition-command.repository";
import { PrismaListDefinitionCommandRepository } from "@/modules/list-definition/infrastructure/persistence/prisma-list-definition-command.repository";
import { ReorderSidebarObjectDefinitionsUseCase } from "@/modules/object-definition/application/use-cases/reorder-sidebar-object-definitions.use-case";
import { PrismaSidebarObjectOrderRepository } from "@/modules/object-definition/infrastructure/persistence/prisma-sidebar-object-order.repository";
import { ReorderSidebarListDefinitionsUseCase } from "@/modules/list-definition/application/use-cases/reorder-sidebar-list-definitions.use-case";
import { PrismaSidebarListOrderRepository } from "@/modules/list-definition/infrastructure/persistence/prisma-sidebar-list-order.repository";
import { ReorderSidebarViewFavoritesUseCase } from "@/modules/view-definition/application/use-cases/reorder-sidebar-view-favorites.use-case";
import { PrismaSidebarFavoriteOrderRepository } from "@/modules/view-definition/infrastructure/persistence/prisma-sidebar-favorite-order.repository";
import { PrismaObjectDefinitionSidebarQueryRepository } from "@/modules/object-definition/infrastructure/persistence/prisma-object-definition-sidebar-query.repository";
import { PrismaListDefinitionSidebarQueryRepository } from "@/modules/list-definition/infrastructure/persistence/prisma-list-definition-sidebar-query.repository";
import { PrismaViewFavoriteSidebarQueryRepository } from "./persistence/prisma-view-favorite-sidebar-query.repository";

const url = process.env.TEST_DATABASE_URL;
const describeDb = url ? describe : describe.skip;

// 기능 : 격리 PostgreSQL에서 실제 순서 저장/소속/잠금/rollback과 migration을 검증합니다.
describeDb("Sidebar order PostgreSQL integration", () => {
  const users: [string, string] = [randomUUID(), randomUUID()], workspaces: [string, string] = [randomUUID(), randomUUID()];
  const members: [string, string, string] = [randomUUID(), randomUUID(), randomUUID()], actors: [string, string, string] = [randomUUID(), randomUUID(), randomUUID()];
  const objects: [string, string, string] = [randomUUID(), randomUUID(), randomUUID()], lists: [string, string, string] = [randomUUID(), randomUUID(), randomUUID()];
  const views: [string, string, string] = [randomUUID(), randomUUID(), randomUUID()], favorites: [string, string, string] = [randomUUID(), randomUUID(), randomUUID()];
  const foreignObject = randomUUID(), foreignList = randomUUID(), otherFavorite = randomUUID();
  const user: CurrentUserContext = { id: users[0]!, sessionId: randomUUID(), email: null, displayName: null, platformRole: "USER", status: "ACTIVE", timeZone: "Asia/Seoul" };
  const logger = { log: jest.fn(), warn: jest.fn(), error: jest.fn() };
  let prisma: PrismaService, transactions: PrismaTransactionManager, access: PrismaWorkspaceAccessQueryRepository;
  const configurations = [
    { section: "objects", ids: objects, table: "ObjectDefinition" },
    { section: "lists", ids: lists, table: "ListDefinition" },
    { section: "favorites", ids: favorites, table: "ViewFavoriteDefinition" },
  ] as const;

  // 기능 : 테스트 전용 Workspace와 두 멤버를 생성하고 원본 View 순서를 분리한다.
  beforeAll(async () => {
    if (!url) throw new Error("TEST_DATABASE_URL is required");
    prisma = new PrismaService({ datasources: { db: { url } } });
    await prisma.$connect();
    transactions = new PrismaTransactionManager(prisma);
    access = new PrismaWorkspaceAccessQueryRepository(prisma);
    await prisma.$transaction(async tx => {
      await tx.user.createMany({ data: users.map(id => ({ id })) });
      await tx.workspace.createMany({ data: workspaces.map(id => ({ id, name: "Sidebar test", kind: "PERSONAL" as const })) });
      await tx.workspaceMember.createMany({ data: [
        { id: members[0], userId: users[0]!, workspaceId: workspaces[0]! },
        { id: members[1], userId: users[1]!, workspaceId: workspaces[0]! },
        { id: members[2], userId: users[0]!, workspaceId: workspaces[1]! },
      ] });
      await tx.actor.createMany({ data: actors.map((id, index) => ({ id, workspaceId: workspaces[index === 2 ? 1 : 0]!, workspaceMemberId: members[index]!, type: "WORKSPACE_MEMBER" as const })) });
      await tx.objectDefinition.createMany({ data: [...objects, foreignObject].map((id, index) => ({
        id, workspaceId: workspaces[index === 3 ? 1 : 0]!, createdByActorId: actors[index === 3 ? 2 : 0]!, apiSlug: id, singularName: id, pluralName: id, sortOrder: index === 3 ? 9 : index,
      })) });
      await tx.listDefinition.createMany({ data: [...lists, foreignList].map((id, index) => ({
        id, workspaceId: workspaces[index === 3 ? 1 : 0]!, createdByActorId: actors[index === 3 ? 2 : 0]!, apiSlug: id, name: id, sortOrder: index === 3 ? 9 : index,
      })) });
      await tx.viewDefinition.createMany({ data: views.map((id, index) => ({
        id, workspaceId: workspaces[0]!, createdByActorId: actors[0]!, objectDefinitionId: objects[0], name: id, type: "TABLE" as const, sortOrder: 100 + index,
      })) });
      await tx.viewFavoriteDefinition.createMany({ data: [...favorites, otherFavorite].map((id, index) => ({
        id, workspaceId: workspaces[0]!, createdByActorId: actors[index === 3 ? 1 : 0]!, workspaceMemberId: members[index === 3 ? 1 : 0]!, viewDefinitionId: views[index % 3]!, sortOrder: index,
      })) });
    });
  });

  // 기능 : 각 테스트의 초기 순서를 복원한다.
  beforeEach(async () => {
    for (const config of configurations) for (const [sortOrder, id] of config.ids.entries()) {
      await prisma.$executeRawUnsafe(`UPDATE "${config.table}" SET "sortOrder"=$1, "updatedByActorId"=NULL WHERE id=$2::uuid`, sortOrder, id);
    }
  });

  // 기능 : 소유 행들을 FK 순서에 맞춰 정리하고 연결을 해제한다.
  afterAll(async () => {
    if (!prisma) return;
    try {
      await prisma.$transaction(async tx => {
        const where = { workspaceId: { in: workspaces } };
        await tx.viewFavoriteDefinition.deleteMany({ where });
        await tx.viewDefinition.deleteMany({ where });
        await tx.listDefinition.deleteMany({ where });
        await tx.objectDefinition.deleteMany({ where });
        await tx.workspace.deleteMany({ where: { id: { in: workspaces } } });
        await tx.user.deleteMany({ where: { id: { in: users } } });
      });
    } finally { await prisma.$disconnect(); }
  });

  // 기능 : 실제 소유 모듈의 application과 persistence를 연결한다.
  function useCase(section: string, manager: TransactionManager = transactions) {
    if (section === "objects") return new ReorderSidebarObjectDefinitionsUseCase(access, new PrismaSidebarObjectOrderRepository(prisma), manager, logger);
    if (section === "lists") return new ReorderSidebarListDefinitionsUseCase(access, new PrismaSidebarListOrderRepository(prisma), manager, logger);
    return new ReorderSidebarViewFavoritesUseCase(access, new PrismaSidebarFavoriteOrderRepository(prisma, new PrismaViewFavoriteCommandRepository(prisma)), manager, logger);
  }

  // 기능 : 범위 내 행의 실제 정렬 결과를 읽는다.
  async function rows(table: string, ids: readonly string[]) {
    const rows = await prisma.$queryRawUnsafe<{ id: string; sortOrder: number; updatedByActorId: string | null; updatedAt: Date }[]>(
      `SELECT id,"sortOrder","updatedByActorId","updatedAt" FROM "${table}" WHERE "workspaceId"=$1::uuid ORDER BY "sortOrder"`, workspaces[0]);
    return rows.filter(row => ids.includes(row.id));
  }

  it.each(configurations)("persists $section and leaves other scopes and View order untouched", async config => {
    const ids = [...config.ids].reverse();
    await useCase(config.section).execute(user, workspaces[0]!, ids);
    const saved = await rows(config.table, config.ids);
    expect(saved.map(row => row.id)).toEqual(ids);
    expect(saved.map(row => row.sortOrder)).toEqual([0, 1, 2]);
    const visible = config.section === "objects"
      ? await new PrismaObjectDefinitionSidebarQueryRepository(prisma).listSidebarObjectDefinitions(workspaces[0])
      : config.section === "lists"
        ? await new PrismaListDefinitionSidebarQueryRepository(prisma).listSidebarListDefinitions(workspaces[0])
        : await new PrismaViewFavoriteSidebarQueryRepository(prisma).listSidebarViewFavorites({ workspaceId: workspaces[0], workspaceMemberId: members[0] });
    expect(visible.map(row => row.id)).toEqual(ids);
    expect(saved.filter(row => row.updatedByActorId === actors[0])).toHaveLength(2);
    await useCase(config.section).execute(user, workspaces[0]!, ids);
    expect(await rows(config.table, config.ids)).toEqual(saved);
    expect((await prisma.objectDefinition.findUniqueOrThrow({ where: { id: foreignObject } })).sortOrder).toBe(9);
    expect((await prisma.listDefinition.findUniqueOrThrow({ where: { id: foreignList } })).sortOrder).toBe(9);
    expect((await prisma.viewFavoriteDefinition.findUniqueOrThrow({ where: { id: otherFavorite } })).sortOrder).toBe(3);
    expect((await prisma.viewDefinition.findMany({ where: { id: { in: views } }, orderBy: { sortOrder: "asc" } })).map(row => row.sortOrder)).toEqual([100, 101, 102]);
  });

  it.each(configurations)("rejects missing and foreign $section IDs with no partial changes", async config => {
    const before = await rows(config.table, config.ids);
    const foreign = config.section === "objects" ? foreignObject : config.section === "lists" ? foreignList : otherFavorite;
    await expect(useCase(config.section).execute(user, workspaces[0]!, [foreign, ...config.ids.slice(1)])).rejects.toMatchObject({ code: "SidebarOrderConflict" });
    await expect(useCase(config.section).execute(user, workspaces[0]!, config.ids.slice(1))).rejects.toMatchObject({ code: "SidebarOrderConflict" });
    expect(await rows(config.table, config.ids)).toEqual(before);
  });

  it.each(configurations)("rolls back all $section rows after a write failure", async config => {
    const before = await rows(config.table, config.ids);
    const failure = new Error("rollback proof");
    const rollback: TransactionManager = {
      runInTransaction: work => transactions.runInTransaction(async context => { await work(context); throw failure; }),
    };
    await expect(useCase(config.section, rollback).execute(user, workspaces[0]!, [...config.ids].reverse())).rejects.toBe(failure);
    expect(await rows(config.table, config.ids)).toEqual(before);
  });

  it.each(configurations)("serializes concurrent complete $section order requests", async config => {
    const proposals = [[...config.ids].reverse(), [config.ids[1]!, config.ids[2]!, config.ids[0]!]];
    await Promise.all(proposals.map(ids => useCase(config.section).execute(user, workspaces[0]!, ids)));
    const saved = await rows(config.table, config.ids);
    expect(proposals).toContainEqual(saved.map(row => row.id));
    expect(saved.map(row => row.sortOrder)).toEqual([0, 1, 2]);
  });

  it("appends concurrent Object/List creation after existing reordered items", async () => {
    const created = await Promise.all([0, 1].map(i => transactions.runInTransaction(async context => {
      const repository = new PrismaObjectDefinitionCommandRepository(prisma);
      const lastSortOrder = await repository.lockAndGetLastSortOrder(workspaces[0], context);
      return repository.createObjectDefinition({
        workspaceId: workspaces[0]!, createdByActorId: actors[0]!, apiSlug: "new-object-" + i, singularName: "new", pluralName: "new", icon: null, description: null,
        sortOrder: (lastSortOrder ?? -1) + 1,
      }, context);
    })));
    const newObjects = await prisma.objectDefinition.findMany({ where: { id: { in: created.map(row => row.id) } }, orderBy: { sortOrder: "asc" } });
    expect(newObjects.map(row => row.sortOrder)).toEqual([3, 4]);
    const newLists = await Promise.all([0, 1].map(i => transactions.runInTransaction(async context => {
      const repository = new PrismaListDefinitionCommandRepository(prisma);
      const lastSortOrder = await repository.lockAndGetLastSortOrder(workspaces[0], context);
      return repository.create({
        workspaceId: workspaces[0]!, createdByActorId: actors[0]!, name: "new-list-" + i, icon: null, description: null,
        sortOrder: (lastSortOrder ?? -1) + 1,
      }, context);
    })));
    expect((await prisma.listDefinition.findMany({ where: { id: { in: newLists.map(row => row.id) } }, orderBy: { sortOrder: "asc" } })).map(row => row.sortOrder)).toEqual([3, 4]);
    await prisma.objectDefinition.deleteMany({ where: { id: { in: created.map(row => row.id) } } });
    await prisma.listDefinition.deleteMany({ where: { id: { in: newLists.map(row => row.id) } } });
  });

  it("migration preserves historical order and unrelated audit fields", async () => {
    const rollback = new Error("migration rollback");
    await expect(prisma.$transaction(async tx => {
      // 임시 테이블만 사용해 이미 적용된 테스트 스키마나 업무 데이터를 건드리지 않는다.
      for (const table of ["ObjectDefinition", "ListDefinition"]) {
        await tx.$executeRawUnsafe(`CREATE TEMP TABLE "${table}" (id UUID PRIMARY KEY, "workspaceId" UUID NOT NULL, "createdAt" TIMESTAMPTZ NOT NULL, "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT '2020-01-01') ON COMMIT DROP`);
        await tx.$executeRawUnsafe(`INSERT INTO "${table}" (id,"workspaceId","createdAt") VALUES ($1::uuid,$3::uuid,'2021-01-01'),($2::uuid,$3::uuid,'2020-01-01')`, objects[0], objects[1], workspaces[0]);
      }
      await tx.$executeRawUnsafe('CREATE TEMP TABLE "ViewFavoriteDefinition" (id UUID PRIMARY KEY, "workspaceId" UUID, "workspaceMemberId" UUID, "sortOrder" INTEGER, "createdAt" TIMESTAMPTZ, "updatedAt" TIMESTAMPTZ DEFAULT \'2020-01-01\') ON COMMIT DROP');
      await tx.$executeRawUnsafe('INSERT INTO "ViewFavoriteDefinition" (id,"workspaceId","workspaceMemberId","sortOrder","createdAt") VALUES ($1::uuid,$3::uuid,$4::uuid,9,\'2020-01-01\'),($2::uuid,$3::uuid,$4::uuid,2,\'2021-01-01\')', favorites[0], favorites[1], workspaces[0], members[0]);
      const sql = readFileSync(join(process.cwd(), "prisma/migrations/20261111060000_add_sidebar_definition_sort_order/migration.sql"), "utf8");
      for (const statement of sql.replace(/^BEGIN;|^COMMIT;/gm, "").split(";").map(value => value.trim()).filter(Boolean)) {
        await tx.$executeRawUnsafe(statement);
      }
      for (const table of ["ObjectDefinition", "ListDefinition", "ViewFavoriteDefinition"]) {
        const actual = await tx.$queryRawUnsafe<{ id: string; sortOrder: number; updatedAt: Date }[]>(`SELECT id,"sortOrder","updatedAt" FROM "${table}" ORDER BY "sortOrder"`);
        expect(actual.map(row => row.id)).toEqual(table === "ViewFavoriteDefinition" ? [favorites[1], favorites[0]] : [objects[1], objects[0]]);
        expect(actual.map(row => row.sortOrder)).toEqual([0, 1]);
        const [expected] = await tx.$queryRawUnsafe<{ value: Date }[]>("SELECT '2020-01-01'::timestamptz AS value");
        expect(actual.every(row => row.updatedAt.getTime() === expected!.value.getTime())).toBe(true);
      }
      throw rollback;
    }, { timeout: 15000 })).rejects.toBe(rollback);
  });
});
