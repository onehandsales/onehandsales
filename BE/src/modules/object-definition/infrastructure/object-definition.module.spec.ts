import { Module } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import { Prisma } from "@prisma/client";
import { AuthModule } from "@/modules/auth/infrastructure/auth.module";
import { CreateWorkspaceObjectDefinitionUseCase } from "@/modules/object-definition/application/use-cases/create-workspace-object-definition.use-case";
import { ObjectDefinitionApiSlugAlreadyExistsError } from "@/modules/object-definition/domain/object-definition.errors";
import { WORKSPACE_ACCESS_QUERY } from "@/modules/workspace/application/ports/workspace-access-query.port";
import { WorkspaceModule } from "@/modules/workspace/infrastructure/workspace.module";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { APPLICATION_LOGGER } from "@/shared/application/ports/application-logger.port";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";
import { AuthGuard } from "@/shared/presentation/guards/auth.guard";
import { ObjectDefinitionModule } from "./object-definition.module";

const user: CurrentUserContext = { id: "user-1", sessionId: "session-1", email: null, displayName: null, platformRole: "USER", status: "ACTIVE", timeZone: "Asia/Seoul" };
const access = {
  hasWorkspaceMembership: jest.fn().mockResolvedValue(true),
  getWorkspaceMemberAccess: jest.fn().mockResolvedValue({ workspaceMemberId: "member-1", actorId: "actor-1" }),
};

// 역할 : 모듈 조립 테스트에서 인증 외부 provider 연결을 생략합니다.
@Module({ providers: [{ provide: AuthGuard, useValue: { canActivate: () => true } }], exports: [AuthGuard] })
class TestAuthModule {}

// 역할 : Workspace의 공개 접근 포트만 테스트에 제공합니다.
@Module({ providers: [{ provide: WORKSPACE_ACCESS_QUERY, useValue: access }], exports: [WORKSPACE_ACCESS_QUERY] })
class TestWorkspaceModule {}

// 기능 : 실제 모듈 조립·Prisma transaction adapter·네 모델 쓰기 경계를 DB 연결 없이 검증합니다.
describe("ObjectDefinitionModule creation transaction", () => {
  let module: TestingModule;
  let useCase: CreateWorkspaceObjectDefinitionUseCase;
  const logger = { log: jest.fn(), warn: jest.fn(), error: jest.fn() };
  const transactionClient = {
    $queryRaw: jest.fn(),
    objectDefinition: { create: jest.fn(), aggregate: jest.fn() },
    attributeDefinition: { create: jest.fn() },
    viewDefinition: { create: jest.fn() },
    viewAttributeSettingDefinition: { create: jest.fn() },
  };
  const prisma = {
    objectDefinition: { findFirst: jest.fn(), create: jest.fn() },
    attributeDefinition: { create: jest.fn() },
    viewDefinition: { create: jest.fn() },
    viewAttributeSettingDefinition: { create: jest.fn() },
    $transaction: jest.fn(),
  };

  // 기능 : 생성 소유 모듈은 그대로 조립하고 DB 경계만 mock으로 대체합니다.
  beforeEach(async () => {
    jest.clearAllMocks();
    transactionClient.$queryRaw.mockResolvedValue([{ isolationLevel: "read committed" }]);
    transactionClient.objectDefinition.aggregate.mockResolvedValue({ _max: { sortOrder: null } });
    prisma.objectDefinition.findFirst.mockResolvedValue(null);
    transactionClient.objectDefinition.create.mockReset().mockResolvedValue({ id: "object-1" });
    transactionClient.attributeDefinition.create.mockReset().mockResolvedValue({ id: "attribute-1" });
    transactionClient.viewDefinition.create.mockReset().mockResolvedValue({ id: "view-1" });
    transactionClient.viewAttributeSettingDefinition.create.mockReset().mockResolvedValue({ id: "binding-1" });
    prisma.$transaction.mockImplementation(async (work: (client: typeof transactionClient) => Promise<unknown>) => {
      const result = await work(transactionClient);
      expect(logger.log).not.toHaveBeenCalled();
      return result;
    });
    module = await Test.createTestingModule({ imports: [ObjectDefinitionModule] })
      .overrideModule(AuthModule).useModule(TestAuthModule)
      .overrideGuard(AuthGuard).useValue({ canActivate: () => true })
      .overrideModule(WorkspaceModule).useModule(TestWorkspaceModule)
      .overrideProvider(PrismaService).useValue(prisma)
      .overrideProvider(APPLICATION_LOGGER).useValue(logger)
      .compile();
    useCase = module.get(CreateWorkspaceObjectDefinitionUseCase);
  });

  // 기능 : 공유 연결이나 실제 서버를 시작하지 않고 테스트 모듈을 해제합니다.
  afterEach(async () => { await module?.close(); });

  // 기능 : 모든 모델에 같은 소속·감사 주체와 이번 생성 ID를 연결합니다.
  it("wires ports without circular dependencies and creates four rows through one transaction client", async () => {
    await expect(useCase.execute(user, "workspace-1", { objectDefinitionName: " 매물 " }))
      .resolves.toEqual({ objectDefinitionId: "object-1", viewDefinitionId: "view-1" });
    const audit = { workspaceId: "workspace-1", createdByActorId: "actor-1" };
    expect(transactionClient.objectDefinition.create).toHaveBeenCalledWith({
      data: { ...audit, apiSlug: "매물", singularName: "매물", pluralName: "매물", icon: null, description: null, sortOrder: 0 }, select: { id: true },
    });
    expect(transactionClient.attributeDefinition.create).toHaveBeenCalledWith({
      data: { ...audit, objectDefinitionId: "object-1", listDefinitionId: null, apiSlug: "name", title: "이름", type: "Text", sortOrder: 0, isMultiselect: false }, select: { id: true },
    });
    expect(transactionClient.viewDefinition.create).toHaveBeenCalledWith({
      data: { ...audit, objectDefinitionId: "object-1", listDefinitionId: null, name: "전체 매물", type: "TABLE", sortOrder: 0, configJson: { rowDensity: "COMFORTABLE" } }, select: { id: true },
    });
    expect(transactionClient.viewAttributeSettingDefinition.create).toHaveBeenCalledWith({
      data: { ...audit, viewDefinitionId: "view-1", attributeDefinitionId: "attribute-1", sourceScope: "RECORD", attributeDisplayRole: "TITLE", referenceAttributeIdPathJson: [], sortOrder: 0, isHidden: false }, select: { id: true },
    });
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    for (const key of ["objectDefinition", "attributeDefinition", "viewDefinition", "viewAttributeSettingDefinition"] as const) {
      expect(transactionClient[key].create).toHaveBeenCalledTimes(1);
      expect(prisma[key].create).not.toHaveBeenCalled();
    }
    expect(logger.log).toHaveBeenCalledTimes(1);
  });

  // 기능 : 속성·View·표시 설정의 오류가 상위 transaction을 reject해 부분 commit되지 않도록 합니다.
  it.each(["attributeDefinition", "viewDefinition", "viewAttributeSettingDefinition"] as const)("rejects the transaction when %s insertion fails", async model => {
    const failure = new Error("forced insertion failure");
    transactionClient[model].create.mockRejectedValueOnce(failure);
    await expect(useCase.execute(user, "workspace-1", { objectDefinitionName: "매물" })).rejects.toBe(failure);
    await expect(prisma.$transaction.mock.results[0]!.value).rejects.toBe(failure);
    expect(logger.log).not.toHaveBeenCalled();
    if (model === "attributeDefinition") expect(transactionClient.viewDefinition.create).not.toHaveBeenCalled();
  });

  // 기능 : 사전 조회를 통과한 동시 이름 충돌을 기존 conflict 도메인 오류로 변환합니다.
  it("maps a database unique race to conflict before creating child rows", async () => {
    transactionClient.objectDefinition.create.mockRejectedValueOnce(new Prisma.PrismaClientKnownRequestError("unique", {
      code: "P2002", clientVersion: "test", meta: { target: ["workspaceId", "apiSlug"] },
    }));
    await expect(useCase.execute(user, "workspace-1", { objectDefinitionName: "매물" })).rejects.toBeInstanceOf(ObjectDefinitionApiSlugAlreadyExistsError);
    expect(transactionClient.attributeDefinition.create).not.toHaveBeenCalled();
    expect(logger.log).not.toHaveBeenCalled();
  });
});
