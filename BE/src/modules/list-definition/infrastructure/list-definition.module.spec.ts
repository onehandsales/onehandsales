import { Module } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import { Prisma } from "@prisma/client";
import { AuthModule } from "@/modules/auth/infrastructure/auth.module";
import { WORKSPACE_ACCESS_QUERY } from "@/modules/workspace/application/ports/workspace-access-query.port";
import { WorkspaceModule } from "@/modules/workspace/infrastructure/workspace.module";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { APPLICATION_LOGGER } from "@/shared/application/ports/application-logger.port";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";
import { AuthGuard } from "@/shared/presentation/guards/auth.guard";
import { CreateWorkspaceListDefinitionUseCase, type CreateWorkspaceListDefinitionCommand } from "../application/use-cases/create-workspace-list-definition.use-case";
import { ListDefinitionModule } from "./list-definition.module";

const user: CurrentUserContext = { id: "user-1", sessionId: "session-1", email: null, displayName: null, platformRole: "USER", status: "ACTIVE", timeZone: "Asia/Seoul" };
const access = { getWorkspaceMemberAccess: jest.fn(), hasWorkspaceMembership: jest.fn() };
const command: CreateWorkspaceListDefinitionCommand = {
  listDefinitionName: " 매물 상담 ", objectDefinitionId: "object-1", titleAttributeDefinitionId: "title-1", viewType: "TABLE",
};

// 역할 : 실제 모듈 조립에서 외부 인증 provider만 대체합니다.
@Module({ providers: [{ provide: AuthGuard, useValue: { canActivate: () => true } }], exports: [AuthGuard] })
class TestAuthModule {}

// 역할 : 현재 멤버십을 제공하며 Workspace 구현의 외부 의존성을 제거합니다.
@Module({ providers: [{ provide: WORKSPACE_ACCESS_QUERY, useValue: access }], exports: [WORKSPACE_ACCESS_QUERY] })
class TestWorkspaceModule {}

// 기능 : 기준 Object의 속성 메타데이터를 구성합니다.
function attribute(id: string, type = "Text") {
  return { id, workspaceId: "workspace-1", objectDefinitionId: "object-1", listDefinitionId: null,
    title: "safe", type, isMultiselect: false, configJson: null, icon: null };
}

// 기능 : 실제 생성 모듈과 transaction adapter를 조립하여 분기·실패·소속 경계를 검증합니다.
describe("ListDefinitionModule creation", () => {
  let module: TestingModule;
  let useCase: CreateWorkspaceListDefinitionUseCase;
  const logger = { log: jest.fn(), warn: jest.fn(), error: jest.fn() };
  const tx = {
    listDefinition: { create: jest.fn() },
    attributeDefinition: { create: jest.fn(), findMany: jest.fn() },
    statusOption: { createMany: jest.fn() },
    viewDefinition: { create: jest.fn() },
    viewAttributeSettingDefinition: { create: jest.fn() },
    viewGroupDefinition: { create: jest.fn() },
  };
  const prisma = { objectDefinition: { findFirst: jest.fn() }, $transaction: jest.fn() };

  // 기능 : DB 대신 하나의 transaction client를 제공하고 실제 모듈 간 공개 port를 사용합니다.
  beforeEach(async () => {
    jest.resetAllMocks();
    access.getWorkspaceMemberAccess.mockResolvedValue({ actorId: "actor-1", workspaceMemberId: "member-1" });
    prisma.objectDefinition.findFirst.mockResolvedValue({ id: "object-1" });
    tx.listDefinition.create.mockResolvedValue({ id: "list-1" });
    tx.attributeDefinition.findMany.mockResolvedValue([attribute("title-1"), attribute("status-1", "Status")]);
    tx.attributeDefinition.create.mockResolvedValue({ id: "new-status" });
    tx.viewDefinition.create.mockResolvedValue({ id: "view-1" });
    prisma.$transaction.mockImplementation(async (work: (client: typeof tx) => Promise<unknown>) => {
      const result = await work(tx);
      expect(logger.log).not.toHaveBeenCalled();
      return result;
    });
    module = await Test.createTestingModule({ imports: [ListDefinitionModule] })
      .overrideModule(AuthModule).useModule(TestAuthModule)
      .overrideGuard(AuthGuard).useValue({ canActivate: () => true })
      .overrideModule(WorkspaceModule).useModule(TestWorkspaceModule)
      .overrideProvider(PrismaService).useValue(prisma)
      .overrideProvider(APPLICATION_LOGGER).useValue(logger).compile();
    useCase = module.get(CreateWorkspaceListDefinitionUseCase);
  });

  // 기능 : 실행 중 개발 서버와 독립된 테스트 모듈을 해제합니다.
  afterEach(async () => { await module?.close(); });

  // 기능 : 단순 보기는 새 속성·Record·Entry 없이 제목만 연결합니다.
  it.each(["TABLE", "LIST"] as const)("creates empty %s with a RECORD title in one transaction", async viewType => {
    await expect(useCase.execute(user, "workspace-1", { ...command, viewType }, "request-1"))
      .resolves.toEqual({ listDefinitionId: "list-1", viewDefinitionId: "view-1" });
    expect(tx.listDefinition.create).toHaveBeenCalledWith({ data: {
      workspaceId: "workspace-1", createdByActorId: "actor-1", name: "매물 상담", apiSlug: "매물 상담", icon: null, description: null,
    }, select: { id: true } });
    expect(tx.viewDefinition.create).toHaveBeenCalledWith({ data: {
      workspaceId: "workspace-1", createdByActorId: "actor-1", objectDefinitionId: null,
      listDefinitionId: "list-1", name: "전체 매물 상담", type: viewType, sortOrder: 0, configJson: { rowDensity: "COMFORTABLE" },
    }, select: { id: true } });
    expect(tx.viewAttributeSettingDefinition.create).toHaveBeenCalledWith({ data: expect.objectContaining({
      viewDefinitionId: "view-1", attributeDefinitionId: "title-1", sourceScope: "RECORD", attributeDisplayRole: "TITLE",
    }) });
    expect(tx.attributeDefinition.create).not.toHaveBeenCalled();
    expect(tx.statusOption.createMany).not.toHaveBeenCalled();
    expect(tx.viewGroupDefinition.create).not.toHaveBeenCalled();
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(logger.log).toHaveBeenCalledWith(expect.stringContaining('"requestId":"request-1"'), expect.any(String));
    expect(logger.log.mock.calls[0]![0]).not.toContain("매물");
  });

  // 기능 : UUID의 대소문자 차이가 동일 소속 속성을 잘못 거부하지 않도록 합니다.
  it("normalizes case-insensitive UUID input before comparing source metadata", async () => {
    await expect(useCase.execute(user, "WORKSPACE-1", { ...command, objectDefinitionId: "OBJECT-1",
      titleAttributeDefinitionId: "TITLE-1", viewType: "KANBAN", kanban: { attributeDefinitionId: "STATUS-1" } }))
      .resolves.toEqual({ listDefinitionId: "list-1", viewDefinitionId: "view-1" });
  });

  // 기능 : 기존 Record 상태는 복사하지 않고 그룹으로 참조합니다.
  it.each(["Status", "Select"])("reuses existing %s options for a board", async type => {
    tx.attributeDefinition.findMany.mockResolvedValue([attribute("title-1"), attribute("status-1", type)]);
    await useCase.execute(user, "workspace-1", { ...command, viewType: "KANBAN", kanban: { attributeDefinitionId: "status-1" } });
    expect(tx.attributeDefinition.create).not.toHaveBeenCalled();
    expect(tx.statusOption.createMany).not.toHaveBeenCalled();
    expect(tx.viewGroupDefinition.create).toHaveBeenCalledWith({ data: expect.objectContaining({
      sourceScope: "RECORD", attributeDefinitionId: "status-1", groupRole: "GROUP", sortDirection: "ASC",
    }) });
  });

  // 기능 : 새 목록 전용 단계는 List 소속 속성·옵션과 LIST_ENTRY 그룹을 함께 저장합니다.
  it("creates user-supplied stages in the same transaction and preserves order", async () => {
    await useCase.execute(user, "workspace-1", { ...command, viewType: "KANBAN",
      kanban: { newStatus: { title: " 진행 ", options: [" 상담 ", " 계약 "] } } });
    expect(tx.attributeDefinition.create).toHaveBeenCalledWith({ data: expect.objectContaining({
      objectDefinitionId: null, listDefinitionId: "list-1", type: "Status", title: "진행", apiSlug: "status", isMultiselect: false,
    }), select: { id: true } });
    expect(tx.statusOption.createMany).toHaveBeenCalledWith({ data: [
      { workspaceId: "workspace-1", createdByActorId: "actor-1", attributeDefinitionId: "new-status", title: "상담", sortOrder: 0, color: null },
      { workspaceId: "workspace-1", createdByActorId: "actor-1", attributeDefinitionId: "new-status", title: "계약", sortOrder: 1, color: null },
    ] });
    expect(tx.viewGroupDefinition.create).toHaveBeenCalledWith({ data: expect.objectContaining({ sourceScope: "LIST_ENTRY", attributeDefinitionId: "new-status" }) });
    expect(tx.viewDefinition.create).toHaveBeenCalledWith({ data: expect.objectContaining({ configJson: { cardDensity: "COMFORTABLE", showEmptyGroups: true } }), select: { id: true } });
  });

  // 기능 : 멤버십이나 기준 관리 항목이 없으면 생성 transaction을 시작하지 않습니다.
  it.each(["membership", "object"])("rejects inaccessible %s before writing", async target => {
    if (target === "membership") access.getWorkspaceMemberAccess.mockResolvedValue(null);
    else prisma.objectDefinition.findFirst.mockResolvedValue(null);
    await expect(useCase.execute(user, "workspace-1", command)).rejects.toMatchObject({ code: expect.stringMatching(/NotFound$/) });
    expect(prisma.$transaction).not.toHaveBeenCalled();
    expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('"event":"crm.listDefinition.createFailed"'), expect.any(String));
    expect(logger.warn.mock.calls[0]![0]).not.toContain("매물");
  });

  // 기능 : 감사 Actor가 없으면 쓰기를 시작하지 않고 내부 설정 오류를 안전하게 기록합니다.
  it("logs a missing actor before transaction without exposing the error message", async () => {
    access.getWorkspaceMemberAccess.mockResolvedValue({ actorId: null, workspaceMemberId: "member-1" });
    await expect(useCase.execute(user, "workspace-1", command, "request-actor")).rejects.toThrow("Workspace member actor is missing");
    expect(prisma.$transaction).not.toHaveBeenCalled();
    expect(JSON.parse(logger.error.mock.calls[0]![0])).toEqual({ event: "crm.listDefinition.createFailed",
      requestId: "request-actor", userId: user.id, workspaceId: "workspace-1", errorCode: "InternalServerError" });
  });

  // 기능 : 기준 Object 조회 장애도 transaction 이전에 추적하며 원문을 남기지 않습니다.
  it("logs source lookup failures without database details", async () => {
    prisma.objectDefinition.findFirst.mockRejectedValueOnce(new Error("private query details"));
    await expect(useCase.execute(user, "workspace-1", command, "request-source")).rejects.toThrow("private query details");
    expect(prisma.$transaction).not.toHaveBeenCalled();
    expect(logger.error.mock.calls[0]![0]).toContain('"requestId":"request-source"');
    expect(logger.error.mock.calls[0]![0]).not.toContain("private query details");
  });

  // 기능 : 다른 공간·관리 항목·목록 소속 속성이나 누락된 속성을 저장하지 않습니다.
  it.each([
    [], [ { ...attribute("title-1"), workspaceId: "foreign" } ],
    [ { ...attribute("title-1"), objectDefinitionId: "foreign" } ],
    [ { ...attribute("title-1"), listDefinitionId: "foreign" } ],
  ])("rejects inaccessible title metadata %j", async (...rows) => {
    tx.attributeDefinition.findMany.mockResolvedValue(rows);
    await expect(useCase.execute(user, "workspace-1", command)).rejects.toMatchObject({ code: "ListDefinitionSourceNotFound" });
    expect(tx.listDefinition.create).not.toHaveBeenCalled();
  });

  // 기능 : 다중값 또는 보드에서 지원하지 않는 속성은 쓰기 전에 차단합니다.
  it.each([{ ...attribute("status-1", "Status"), isMultiselect: true }, attribute("status-1", "Text")])("rejects invalid grouping %j", async status => {
    tx.attributeDefinition.findMany.mockResolvedValue([attribute("title-1"), status]);
    await expect(useCase.execute(user, "workspace-1", { ...command, viewType: "KANBAN", kanban: { attributeDefinitionId: "status-1" } }))
      .rejects.toMatchObject({ code: "ValidationError" });
    expect(tx.listDefinition.create).not.toHaveBeenCalled();
  });

  // 기능 : 제목 속성이 정상이어도 다른 공간·관리 항목·목록의 보드 기준을 참조할 수 없습니다.
  it.each([
    { ...attribute("status-1", "Status"), workspaceId: "foreign" },
    { ...attribute("status-1", "Status"), objectDefinitionId: "foreign" },
    { ...attribute("status-1", "Status"), objectDefinitionId: null, listDefinitionId: "foreign" },
  ])("rejects a foreign grouping attribute %j", async status => {
    tx.attributeDefinition.findMany.mockResolvedValue([attribute("title-1"), status]);
    await expect(useCase.execute(user, "workspace-1", { ...command, viewType: "KANBAN", kanban: { attributeDefinitionId: "status-1" } }))
      .rejects.toMatchObject({ code: "ListDefinitionSourceNotFound" });
    expect(tx.listDefinition.create).not.toHaveBeenCalled();
  });

  // 기능 : 같은 속성을 제목과 그룹으로 선택하면 TITLE 하나를 공유해 표시 중복을 피합니다.
  it("reuses a title binding when it is also the board grouping field", async () => {
    await useCase.execute(user, "workspace-1", { ...command, titleAttributeDefinitionId: "status-1",
      viewType: "KANBAN", kanban: { attributeDefinitionId: "status-1" } });
    expect(tx.viewAttributeSettingDefinition.create).toHaveBeenCalledTimes(1);
    expect(tx.viewGroupDefinition.create).toHaveBeenCalledWith({ data: expect.objectContaining({ attributeDefinitionId: "status-1" }) });
  });

  // 기능 : 타입별 조건부 입력과 정규화 후 이름·단계 오류를 차단합니다.
  it.each([
    { listDefinitionName: " " }, { listDefinitionName: "가".repeat(81) },
    { kanban: { attributeDefinitionId: "status-1" } },
    { viewType: "KANBAN" }, { viewType: "KANBAN", kanban: {} },
    { viewType: "KANBAN", kanban: { attributeDefinitionId: "status-1", newStatus: { title: "단계", options: ["a"] } } },
    ...[[], [" "], ["a", " a "], ["a".repeat(81)], Array.from({ length: 51 }, (_, index) => String(index))]
      .map(options => ({ viewType: "KANBAN", kanban: { newStatus: { title: "단계", options } } })),
  ])("rejects invalid conditional input %j", async patch => {
    await expect(useCase.execute(user, "workspace-1", { ...command, ...patch } as CreateWorkspaceListDefinitionCommand))
      .rejects.toMatchObject({ code: "ValidationError" });
    expect(prisma.$transaction).not.toHaveBeenCalled();
    expect(JSON.parse(logger.warn.mock.calls[0]![0])).toMatchObject({ event: "crm.listDefinition.createFailed", errorCode: "ValidationError" });
  });

  // 기능 : 어느 쓰기에서 실패해도 전체 transaction을 reject하고 성공 이벤트를 남기지 않습니다.
  it.each(["listDefinition", "attributeDefinition", "statusOption", "viewDefinition", "viewAttributeSettingDefinition", "viewGroupDefinition"] as const)("propagates %s failure to rollback boundary", async model => {
    const failure = new Error("secret database error");
    const write = model === "statusOption" ? tx.statusOption.createMany : tx[model].create;
    write.mockRejectedValueOnce(failure);
    await expect(useCase.execute(user, "workspace-1", { ...command, viewType: "KANBAN", kanban: { newStatus: { title: "단계", options: ["a"] } } }))
      .rejects.toBe(failure);
    await expect(prisma.$transaction.mock.results[0]!.value).rejects.toBe(failure);
    expect(logger.log).not.toHaveBeenCalled();
    expect(logger.error.mock.calls[0]![0]).not.toContain("secret");
  });

  // 기능 : 사전 조회에 의존하지 않고 DB unique 제약으로 동시 이름 충돌을 처리합니다.
  it("maps a concurrent unique violation to conflict", async () => {
    tx.listDefinition.create.mockRejectedValueOnce(new Prisma.PrismaClientKnownRequestError("unique", { code: "P2002", clientVersion: "test" }));
    await expect(useCase.execute(user, "workspace-1", command)).rejects.toMatchObject({ code: "ListDefinitionApiSlugAlreadyExists" });
    expect(tx.viewDefinition.create).not.toHaveBeenCalled();
  });
});
