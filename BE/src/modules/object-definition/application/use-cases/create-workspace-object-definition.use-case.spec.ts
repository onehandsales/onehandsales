import type {
  CreateObjectDefinitionInput,
  CreateObjectDefinitionResult,
  ObjectDefinitionApiSlugLookupInput,
  ObjectDefinitionCommandRepository,
} from "@/modules/object-definition/application/ports/object-definition-command.repository";
import {
  ObjectDefinitionApiSlugAlreadyExistsError,
  ObjectDefinitionValidationError,
  ObjectDefinitionWorkspaceNotFoundError,
} from "@/modules/object-definition/domain/object-definition.errors";
import type {
  WorkspaceAccessQuery,
  WorkspaceMemberAccess,
} from "@/modules/workspace/application/ports/workspace-access-query.port";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import type { ApplicationLogger } from "@/shared/application/ports/application-logger.port";
import type { ObjectTextAttributeCreator } from "@/modules/attribute-definition/application/ports/object-text-attribute-creator.port";
import type { ObjectTableViewCreator } from "@/modules/view-definition/application/ports/object-table-view-creator.port";
import type { TransactionContext, TransactionManager } from "@/shared/application/ports/transaction-manager.port";
import { CreateWorkspaceObjectDefinitionUseCase } from "./create-workspace-object-definition.use-case";

// 기능 : CreateWorkspaceObjectDefinitionUseCase 동작을 검증합니다.
describe("CreateWorkspaceObjectDefinitionUseCase", () => {
  // 기능 : 입력 이름을 ObjectDefinition 이름 필드들에 매핑해 생성합니다.
  it("creates an object definition for an accessible workspace", async () => {
    const fixture = createFixture();

    const result = await fixture.useCase.execute(
      makeCurrentUser(),
      "00000000-0000-4000-8000-000000000301",
      {
        objectDefinitionName: "  회사  ",
        icon: "lucide:building-2",
        description: " 거래처를 관리해요. ",
      },
      "request-create-001"
    );

    expect(fixture.workspaceAccessQuery.lastAccessInput).toEqual({
      userId: "00000000-0000-4000-8000-000000000101",
      workspaceId: "00000000-0000-4000-8000-000000000301",
    });
    expect(fixture.repository.lastLookupInput).toEqual({
      workspaceId: "00000000-0000-4000-8000-000000000301",
      apiSlug: "회사",
    });
    expect(fixture.repository.lastCreateInput).toEqual({
      workspaceId: "00000000-0000-4000-8000-000000000301",
      createdByActorId: "00000000-0000-4000-8000-000000000401",
      apiSlug: "회사",
      singularName: "회사",
      pluralName: "회사",
      icon: "lucide:building-2",
      description: " 거래처를 관리해요. ",
      sortOrder: 0,
    });
    expect(fixture.logger.log).toHaveBeenCalledWith(
      expect.stringContaining("crm.objectDefinition.created"),
      "CreateWorkspaceObjectDefinitionUseCase"
    );
    expect(result).toEqual({
      objectDefinitionId: "00000000-0000-4000-8000-000000000501",
      viewDefinitionId: "00000000-0000-4000-8000-000000000601",
    });
    expect(fixture.repository.lastCreateContext).toBe(fixture.transactions.context);
    expect(fixture.attributes.create).toHaveBeenCalledWith({
      workspaceId: "00000000-0000-4000-8000-000000000301",
      createdByActorId: "00000000-0000-4000-8000-000000000401",
      objectDefinitionId: result.objectDefinitionId,
      apiSlug: "name", title: "이름",
    }, fixture.transactions.context);
    expect(fixture.views.create).toHaveBeenCalledWith({
      workspaceId: "00000000-0000-4000-8000-000000000301",
      createdByActorId: "00000000-0000-4000-8000-000000000401",
      objectDefinitionId: result.objectDefinitionId,
      titleAttributeDefinitionId: "00000000-0000-4000-8000-000000000701",
      name: "전체 회사",
    }, fixture.transactions.context);
    expect(fixture.transactions.committed).toBe(true);
    const logged = fixture.logger.log.mock.calls[0]![0];
    expect(JSON.parse(logged)).toMatchObject({ requestId: "request-create-001", ...result });
    expect(logged).not.toContain("회사");
    expect(logged).not.toContain("거래처");
  });

  // 기능 : 첫 항목과 기존 목록의 다음 순서를 application에서 결정하고 동일 transaction을 사용합니다.
  it.each([null, 7])("assigns append order from the locked last value %s", async lastSortOrder => {
    const fixture = createFixture();
    fixture.repository.lastSortOrder = lastSortOrder;
    await fixture.useCase.execute(makeCurrentUser(), "00000000-0000-4000-8000-000000000301", { objectDefinitionName: "회사" });
    expect(fixture.repository.lastCreateInput?.sortOrder).toBe(lastSortOrder === null ? 0 : 8);
    expect(fixture.repository.lastSortContext).toBe(fixture.transactions.context);
    expect(fixture.repository.lastCreateContext).toBe(fixture.transactions.context);
  });

  // 기능 : 선택 입력값이 없거나 빈 문자열이면 null로 저장합니다.
  it("stores missing optional values as null", async () => {
    const fixture = createFixture();

    await fixture.useCase.execute(
      makeCurrentUser(),
      "00000000-0000-4000-8000-000000000301",
      {
        objectDefinitionName: "회사",
        icon: "",
      }
    );

    expect(fixture.repository.lastCreateInput).toMatchObject({
      icon: null,
      description: null,
    });
  });

  // 기능 : 공백 이름은 ObjectDefinition 생성을 차단합니다.
  it("rejects blank object definition names", async () => {
    const fixture = createFixture();

    await expect(
      fixture.useCase.execute(
        makeCurrentUser(),
        "00000000-0000-4000-8000-000000000301",
        { objectDefinitionName: "   " }
      )
    ).rejects.toMatchObject({
      code: "OBJECT_DEFINITION_NAME_REQUIRED",
    } satisfies Partial<ObjectDefinitionValidationError>);

    expect(fixture.repository.lastCreateInput).toBeNull();
  });

  // 기능 : 너무 긴 이름은 ObjectDefinition 생성을 차단합니다.
  it("rejects object definition names longer than 80 characters", async () => {
    const fixture = createFixture();

    await expect(
      fixture.useCase.execute(
        makeCurrentUser(),
        "00000000-0000-4000-8000-000000000301",
        { objectDefinitionName: "가".repeat(81) }
      )
    ).rejects.toMatchObject({
      code: "OBJECT_DEFINITION_NAME_TOO_LONG",
    } satisfies Partial<ObjectDefinitionValidationError>);

    expect(fixture.repository.lastCreateInput).toBeNull();
  });

  // 기능 : 현재 사용자가 Workspace 멤버가 아니면 생성을 차단합니다.
  it("throws not found when the current user is not a workspace member", async () => {
    const fixture = createFixture();
    fixture.workspaceAccessQuery.workspaceMemberAccess = null;

    await expect(
      fixture.useCase.execute(
        makeCurrentUser(),
        "00000000-0000-4000-8000-000000000302",
        { objectDefinitionName: "회사" }
      )
    ).rejects.toBeInstanceOf(ObjectDefinitionWorkspaceNotFoundError);

    expect(fixture.repository.lastCreateInput).toBeNull();
  });

  // 기능 : WorkspaceMember에 연결된 Actor가 없으면 내부 정합성 오류로 중단합니다.
  it("throws when the workspace member actor is missing", async () => {
    const fixture = createFixture();
    fixture.workspaceAccessQuery.workspaceMemberAccess = {
      workspaceMemberId: "00000000-0000-4000-8000-000000000321",
      actorId: null,
    };

    await expect(
      fixture.useCase.execute(
        makeCurrentUser(),
        "00000000-0000-4000-8000-000000000301",
        { objectDefinitionName: "회사" }
      )
    ).rejects.toThrow("Workspace member actor is missing");

    expect(fixture.repository.lastCreateInput).toBeNull();
  });

  // 기능 : 같은 Workspace 안의 중복 apiSlug 생성을 차단합니다.
  it("rejects duplicate api slugs in the same workspace", async () => {
    const fixture = createFixture();
    fixture.repository.hasSameApiSlug = true;

    await expect(
      fixture.useCase.execute(
        makeCurrentUser(),
        "00000000-0000-4000-8000-000000000301",
        { objectDefinitionName: "회사" }
      )
    ).rejects.toBeInstanceOf(ObjectDefinitionApiSlugAlreadyExistsError);

    expect(fixture.repository.lastCreateInput).toBeNull();
    expect(fixture.attributes.create).not.toHaveBeenCalled();
    expect(fixture.views.create).not.toHaveBeenCalled();
  });

  // 기능 : 어느 하위 모듈이 실패해도 transaction에 실패를 전파하고 성공 로그를 기록하지 않습니다.
  it.each(["attribute", "view", "commit"])("propagates %s failure through the transaction without success", async stage => {
    const fixture = createFixture();
    const error = new Error("private database error containing user input");
    if (stage === "attribute") fixture.attributes.create.mockRejectedValueOnce(error);
    if (stage === "view") fixture.views.create.mockRejectedValueOnce(error);
    if (stage === "commit") fixture.transactions.commitError = error;

    await expect(fixture.useCase.execute(makeCurrentUser(), "workspace-1", {
      objectDefinitionName: "매물",
    }, "request-failed")).rejects.toBe(error);

    expect(fixture.transactions.rolledBack).toBe(true);
    expect(fixture.transactions.committed).toBe(false);
    expect(fixture.logger.log).not.toHaveBeenCalled();
    expect(fixture.logger.error).toHaveBeenCalledWith(JSON.stringify({
      event: "crm.objectDefinition.createFailed", requestId: "request-failed",
      userId: makeCurrentUser().id, workspaceId: "workspace-1",
    }), undefined, "CreateWorkspaceObjectDefinitionUseCase");
    if (stage === "attribute") expect(fixture.views.create).not.toHaveBeenCalled();
  });

  // 기능 : 사전 중복 조회 이후 발생하는 unique 충돌도 초기화 없이 그대로 409 오류로 전파합니다.
  it("preserves concurrent duplicate errors without invoking child creation", async () => {
    const fixture = createFixture();
    jest.spyOn(fixture.repository, "createObjectDefinition").mockRejectedValueOnce(new ObjectDefinitionApiSlugAlreadyExistsError());
    await expect(fixture.useCase.execute(makeCurrentUser(), "workspace-1", { objectDefinitionName: "매물" }))
      .rejects.toBeInstanceOf(ObjectDefinitionApiSlugAlreadyExistsError);
    expect(fixture.attributes.create).not.toHaveBeenCalled();
    expect(fixture.views.create).not.toHaveBeenCalled();
    expect(fixture.transactions.rolledBack).toBe(true);
    expect(fixture.logger.log).not.toHaveBeenCalled();
    expect(fixture.logger.warn).toHaveBeenCalledTimes(1);
  });
});

// 기능 : CreateWorkspaceObjectDefinitionUseCase 테스트 fixture를 생성합니다.
function createFixture() {
  const workspaceAccessQuery = new FakeWorkspaceAccessQuery();
  const repository = new FakeObjectDefinitionCommandRepository();
  const logger = createLoggerFake();
  const transactions = new FakeTransactionManager();
  const attributes: jest.Mocked<ObjectTextAttributeCreator> = {
    create: jest.fn().mockResolvedValue({ id: "00000000-0000-4000-8000-000000000701" }),
  };
  const views: jest.Mocked<ObjectTableViewCreator> = {
    create: jest.fn().mockImplementation(async () => {
      expect(logger.log).not.toHaveBeenCalled();
      expect(transactions.committed).toBe(false);
      return { id: "00000000-0000-4000-8000-000000000601" };
    }),
  };

  return {
    workspaceAccessQuery,
    repository,
    logger,
    transactions,
    attributes,
    views,
    useCase: new CreateWorkspaceObjectDefinitionUseCase(
      workspaceAccessQuery,
      repository,
      attributes,
      views,
      transactions,
      logger
    ),
  };
}

// 역할 : FakeWorkspaceAccessQuery ObjectDefinition 생성 테스트용 Workspace 접근 확인 구현체입니다.
class FakeWorkspaceAccessQuery implements WorkspaceAccessQuery {
  workspaceMemberAccess: WorkspaceMemberAccess | null = {
    workspaceMemberId: "00000000-0000-4000-8000-000000000321",
    actorId: "00000000-0000-4000-8000-000000000401",
  };
  lastAccessInput: {
    readonly userId: string;
    readonly workspaceId: string;
  } | null = null;

  // 기능 : 테스트용 Workspace membership 존재 여부를 반환합니다.
  async hasWorkspaceMembership(): Promise<boolean> {
    throw new Error("Not implemented in fake query");
  }

  // 기능 : 테스트용 Workspace membership과 Actor 조회 결과를 반환합니다.
  async getWorkspaceMemberAccess(
    userId: string,
    workspaceId: string
  ): Promise<WorkspaceMemberAccess | null> {
    this.lastAccessInput = { userId, workspaceId };
    return this.workspaceMemberAccess;
  }
}

// 역할 : FakeObjectDefinitionCommandRepository 생성 유스케이스 테스트용 ObjectDefinition 저장소입니다.
class FakeObjectDefinitionCommandRepository
  implements ObjectDefinitionCommandRepository
{
  hasSameApiSlug = false;
  lastLookupInput: ObjectDefinitionApiSlugLookupInput | null = null;
  lastCreateInput: CreateObjectDefinitionInput | null = null;
  lastCreateContext: TransactionContext | null = null;
  lastSortOrder: number | null = null;
  lastSortContext: TransactionContext | null = null;

  // 기능 : application이 동일 transaction에서 마지막 순서를 조회했는지 기록합니다.
  async lockAndGetLastSortOrder(_workspaceId: string, context: TransactionContext): Promise<number | null> {
    this.lastSortContext = context;
    return this.lastSortOrder;
  }

  // 기능 : 테스트용 ObjectDefinition apiSlug 중복 여부를 반환합니다.
  async hasObjectDefinitionApiSlug(
    input: ObjectDefinitionApiSlugLookupInput
  ): Promise<boolean> {
    this.lastLookupInput = input;
    return this.hasSameApiSlug;
  }

  // 기능 : 테스트용 ObjectDefinition 생성 결과를 반환합니다.
  async createObjectDefinition(
    input: CreateObjectDefinitionInput,
    context: TransactionContext
  ): Promise<CreateObjectDefinitionResult> {
    this.lastCreateInput = input;
    this.lastCreateContext = context;

    return {
      id: "00000000-0000-4000-8000-000000000501",
    };
  }
}

// 역할 : application 테스트에서 transaction 완료와 실패 전파를 관찰합니다. 실제 DB rollback 검증은 별도입니다.
class FakeTransactionManager implements TransactionManager {
  readonly context: TransactionContext = { transactionId: Symbol("test-transaction") };
  committed = false;
  rolledBack = false;
  commitError: Error | null = null;

  // 기능 : callback 이후 commit 실패까지 application이 성공으로 처리하지 않는지 검증합니다.
  async runInTransaction<T>(work: (context: TransactionContext) => Promise<T>): Promise<T> {
    try {
      const result = await work(this.context);
      if (this.commitError) throw this.commitError;
      this.committed = true;
      return result;
    } catch (error) {
      this.rolledBack = true;
      throw error;
    }
  }
}

// 기능 : 테스트용 application logger fake를 생성합니다.
function createLoggerFake(): jest.Mocked<ApplicationLogger> {
  return {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  };
}

// 기능 : 테스트용 현재 사용자 컨텍스트를 생성합니다.
function makeCurrentUser(): CurrentUserContext {
  return {
    id: "00000000-0000-4000-8000-000000000101",
    sessionId: "00000000-0000-4000-8000-000000000201",
    email: "user@example.com",
    displayName: "User",
    platformRole: "USER",
    status: "ACTIVE",
    timeZone: "Asia/Seoul",
  };
}
