import type {
  ObjectDefinitionAccessQuery,
  ObjectDefinitionWorkspaceLookupInput,
} from "@/modules/object-definition/application/ports/object-definition-access-query.port";
import type {
  CreateRecordDefinitionResult,
  RecordAttributeValueDefinitionForUpdate,
  RecordAttributeValueDefinitionLookupInput,
  RecordDefinitionCommandRepository,
  RecordDefinitionWorkspaceObjectLookupInput,
  UpdateRecordAttributeValueDefinitionInput,
  UpdateRecordAttributeValueDefinitionResult,
} from "@/modules/record-definition/application/ports/record-definition-command.repository";
import {
  RecordAttributeValueDefinitionNotFoundError,
  RecordAttributeValueDefinitionValidationError,
  RecordDefinitionObjectDefinitionNotFoundError,
  RecordDefinitionRecordNotFoundError,
  RecordDefinitionWorkspaceNotFoundError,
} from "@/modules/record-definition/domain/record-definition.errors";
import type {
  WorkspaceAccessQuery,
  WorkspaceMemberAccess,
} from "@/modules/workspace/application/ports/workspace-access-query.port";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import type { ApplicationLogger } from "@/shared/application/ports/application-logger.port";
import type {
  TransactionContext,
  TransactionManager,
} from "@/shared/application/ports/transaction-manager.port";
import { UpdateWorkspaceObjectRecordAttributeValueDefinitionUseCase } from "./update-workspace-object-record-attribute-value-definition.use-case";

// 기능 : UpdateWorkspaceObjectRecordAttributeValueDefinitionUseCase 동작을 검증합니다.
describe("UpdateWorkspaceObjectRecordAttributeValueDefinitionUseCase", () => {
  // 기능 : 접근 가능한 Workspace Object Record cell value를 수정합니다.
  it("updates a text cell value for an accessible workspace object record", async () => {
    const fixture = createFixture();

    const result = await fixture.useCase.execute(
      makeCurrentUser(),
      "00000000-0000-4000-8000-000000000301",
      "00000000-0000-4000-8000-000000000501",
      "00000000-0000-4000-8000-000000000701",
      "00000000-0000-4000-8000-000000000801",
      {
        hasValue: true,
        value: "회사명",
      }
    );

    expect(fixture.workspaceAccessQuery.lastAccessInput).toEqual({
      userId: "00000000-0000-4000-8000-000000000101",
      workspaceId: "00000000-0000-4000-8000-000000000301",
    });
    expect(fixture.objectDefinitionAccessQuery.lastInput).toEqual({
      workspaceId: "00000000-0000-4000-8000-000000000301",
      objectDefinitionId: "00000000-0000-4000-8000-000000000501",
    });
    expect(fixture.repository.lastRecordLookupInput).toEqual({
      workspaceId: "00000000-0000-4000-8000-000000000301",
      objectDefinitionId: "00000000-0000-4000-8000-000000000501",
      recordDefinitionId: "00000000-0000-4000-8000-000000000701",
    });
    expect(fixture.repository.lastCellLookupInput).toEqual({
      workspaceId: "00000000-0000-4000-8000-000000000301",
      objectDefinitionId: "00000000-0000-4000-8000-000000000501",
      recordDefinitionId: "00000000-0000-4000-8000-000000000701",
      recordAttributeValueDefinitionId:
        "00000000-0000-4000-8000-000000000801",
    });
    expect(fixture.repository.lastUpdateInput).toEqual({
      workspaceId: "00000000-0000-4000-8000-000000000301",
      objectDefinitionId: "00000000-0000-4000-8000-000000000501",
      recordDefinitionId: "00000000-0000-4000-8000-000000000701",
      recordAttributeValueDefinitionId:
        "00000000-0000-4000-8000-000000000801",
      updatedByActorId: "00000000-0000-4000-8000-000000000401",
      values: {
        jsonValue: null,
        textValue: "회사명",
        numberValue: null,
        booleanValue: null,
        dateValue: null,
        timestampValue: null,
        selectOptionId: null,
        statusOptionId: null,
        targetRecordDefinitionId: null,
        targetObjectDefinitionId: null,
        targetActorId: null,
      },
      transactionContext: fixture.transactionManager.context,
    });
    expect(fixture.transactionManager.runCount).toBe(1);
    expect(fixture.logger.log).toHaveBeenCalledWith(
      expect.stringContaining("crm.recordAttributeValueDefinition.updated"),
      "UpdateWorkspaceObjectRecordAttributeValueDefinitionUseCase"
    );
    expect(fixture.logger.log.mock.calls[0]?.[0]).not.toContain("회사명");
    expect(result).toEqual({
      recordAttributeValueDefinitionId:
        "00000000-0000-4000-8000-000000000801",
    });
  });

  // 기능 : value key가 없으면 Workspace 조회 전에 검증 오류를 반환합니다.
  it("rejects a request without value before workspace lookup", async () => {
    const fixture = createFixture();

    await expect(
      fixture.useCase.execute(
        makeCurrentUser(),
        "00000000-0000-4000-8000-000000000301",
        "00000000-0000-4000-8000-000000000501",
        "00000000-0000-4000-8000-000000000701",
        "00000000-0000-4000-8000-000000000801",
        {
          hasValue: false,
          value: undefined,
        }
      )
    ).rejects.toMatchObject({
      code: "RECORD_ATTRIBUTE_VALUE_DEFINITION_VALUE_REQUIRED",
    } satisfies Partial<RecordAttributeValueDefinitionValidationError>);

    expect(fixture.workspaceAccessQuery.lastAccessInput).toBeNull();
    expect(fixture.repository.lastUpdateInput).toBeNull();
    expect(fixture.transactionManager.runCount).toBe(0);
  });

  // 기능 : 현재 사용자가 Workspace 멤버가 아니면 cell 수정을 차단합니다.
  it("throws not found when the current user is not a workspace member", async () => {
    const fixture = createFixture();
    fixture.workspaceAccessQuery.workspaceMemberAccess = null;

    await expect(
      fixture.useCase.execute(
        makeCurrentUser(),
        "00000000-0000-4000-8000-000000000302",
        "00000000-0000-4000-8000-000000000501",
        "00000000-0000-4000-8000-000000000701",
        "00000000-0000-4000-8000-000000000801",
        {
          hasValue: true,
          value: "회사명",
        }
      )
    ).rejects.toBeInstanceOf(RecordDefinitionWorkspaceNotFoundError);

    expect(fixture.objectDefinitionAccessQuery.lastInput).toBeNull();
    expect(fixture.repository.lastUpdateInput).toBeNull();
    expect(fixture.transactionManager.runCount).toBe(0);
  });

  // 기능 : 요청 ObjectDefinition이 Workspace에 속하지 않으면 cell 수정을 차단합니다.
  it("throws not found when the object definition is outside the workspace", async () => {
    const fixture = createFixture();
    fixture.objectDefinitionAccessQuery.hasObjectDefinition = false;

    await expect(
      fixture.useCase.execute(
        makeCurrentUser(),
        "00000000-0000-4000-8000-000000000301",
        "00000000-0000-4000-8000-000000000599",
        "00000000-0000-4000-8000-000000000701",
        "00000000-0000-4000-8000-000000000801",
        {
          hasValue: true,
          value: "회사명",
        }
      )
    ).rejects.toBeInstanceOf(RecordDefinitionObjectDefinitionNotFoundError);

    expect(fixture.repository.lastRecordLookupInput).toBeNull();
    expect(fixture.repository.lastUpdateInput).toBeNull();
    expect(fixture.transactionManager.runCount).toBe(0);
  });

  // 기능 : 요청 RecordDefinition이 Workspace/ObjectDefinition에 속하지 않으면 cell 수정을 차단합니다.
  it("throws not found when the record definition is outside the object", async () => {
    const fixture = createFixture();
    fixture.repository.hasRecordDefinition = false;

    await expect(
      fixture.useCase.execute(
        makeCurrentUser(),
        "00000000-0000-4000-8000-000000000301",
        "00000000-0000-4000-8000-000000000501",
        "00000000-0000-4000-8000-000000000799",
        "00000000-0000-4000-8000-000000000801",
        {
          hasValue: true,
          value: "회사명",
        }
      )
    ).rejects.toBeInstanceOf(RecordDefinitionRecordNotFoundError);

    expect(fixture.repository.lastCellLookupInput).toBeNull();
    expect(fixture.repository.lastUpdateInput).toBeNull();
    expect(fixture.transactionManager.runCount).toBe(0);
  });

  // 기능 : 요청 cell value row가 RecordDefinition에 속하지 않으면 수정을 차단합니다.
  it("throws not found when the cell value row is outside the record", async () => {
    const fixture = createFixture();
    fixture.repository.recordAttributeValueDefinition = null;

    await expect(
      fixture.useCase.execute(
        makeCurrentUser(),
        "00000000-0000-4000-8000-000000000301",
        "00000000-0000-4000-8000-000000000501",
        "00000000-0000-4000-8000-000000000701",
        "00000000-0000-4000-8000-000000000899",
        {
          hasValue: true,
          value: "회사명",
        }
      )
    ).rejects.toBeInstanceOf(RecordAttributeValueDefinitionNotFoundError);

    expect(fixture.repository.lastUpdateInput).toBeNull();
    expect(fixture.transactionManager.runCount).toBe(0);
  });

  // 기능 : value가 AttributeType과 맞지 않으면 cell 수정을 차단합니다.
  it("rejects a value that does not match the cell attribute type", async () => {
    const fixture = createFixture();
    fixture.repository.recordAttributeValueDefinition = {
      id: "00000000-0000-4000-8000-000000000801",
      attributeDefinitionId: "00000000-0000-4000-8000-000000000601",
      attributeType: "Number",
    };

    await expect(
      fixture.useCase.execute(
        makeCurrentUser(),
        "00000000-0000-4000-8000-000000000301",
        "00000000-0000-4000-8000-000000000501",
        "00000000-0000-4000-8000-000000000701",
        "00000000-0000-4000-8000-000000000801",
        {
          hasValue: true,
          value: "abc",
        }
      )
    ).rejects.toMatchObject({
      code: "RECORD_ATTRIBUTE_VALUE_DEFINITION_VALUE_INVALID",
    } satisfies Partial<RecordAttributeValueDefinitionValidationError>);

    expect(fixture.repository.lastUpdateInput).toBeNull();
    expect(fixture.transactionManager.runCount).toBe(0);
  });

  // 기능 : timezone 정보가 없는 timestamp 값이면 cell 수정을 차단합니다.
  it("rejects timestamp values without timezone information", async () => {
    const fixture = createFixture();
    fixture.repository.recordAttributeValueDefinition = {
      id: "00000000-0000-4000-8000-000000000801",
      attributeDefinitionId: "00000000-0000-4000-8000-000000000601",
      attributeType: "Timestamp",
    };

    await expect(
      fixture.useCase.execute(
        makeCurrentUser(),
        "00000000-0000-4000-8000-000000000301",
        "00000000-0000-4000-8000-000000000501",
        "00000000-0000-4000-8000-000000000701",
        "00000000-0000-4000-8000-000000000801",
        {
          hasValue: true,
          value: "2026-09-30T10:30:00",
        }
      )
    ).rejects.toMatchObject({
      code: "RECORD_ATTRIBUTE_VALUE_DEFINITION_VALUE_INVALID",
    } satisfies Partial<RecordAttributeValueDefinitionValidationError>);

    expect(fixture.repository.lastUpdateInput).toBeNull();
    expect(fixture.transactionManager.runCount).toBe(0);
  });

  // 기능 : 참조형 value object는 FK 컬럼이 아니라 jsonValue에 그대로 저장합니다.
  it("stores reference-shaped values as json without reference columns", async () => {
    const fixture = createFixture();
    fixture.repository.recordAttributeValueDefinition = {
      id: "00000000-0000-4000-8000-000000000801",
      attributeDefinitionId: "00000000-0000-4000-8000-000000000601",
      attributeType: "RecordReference",
    };
    const value = {
      targetRecordDefinitionId: "00000000-0000-4000-8000-000000000777",
    };

    await fixture.useCase.execute(
      makeCurrentUser(),
      "00000000-0000-4000-8000-000000000301",
      "00000000-0000-4000-8000-000000000501",
      "00000000-0000-4000-8000-000000000701",
      "00000000-0000-4000-8000-000000000801",
      {
        hasValue: true,
        value,
      }
    );

    expect(fixture.repository.lastUpdateInput?.values).toEqual({
      jsonValue: value,
      textValue: null,
      numberValue: null,
      booleanValue: null,
      dateValue: null,
      timestampValue: null,
      selectOptionId: null,
      statusOptionId: null,
      targetRecordDefinitionId: null,
      targetObjectDefinitionId: null,
      targetActorId: null,
    });
  });
});

// 기능 : UpdateWorkspaceObjectRecordAttributeValueDefinitionUseCase 테스트 fixture를 생성합니다.
function createFixture() {
  const workspaceAccessQuery = new FakeWorkspaceAccessQuery();
  const objectDefinitionAccessQuery = new FakeObjectDefinitionAccessQuery();
  const repository = new FakeRecordDefinitionCommandRepository();
  const transactionManager = new FakeTransactionManager();
  const logger = createLoggerFake();

  return {
    workspaceAccessQuery,
    objectDefinitionAccessQuery,
    repository,
    transactionManager,
    logger,
    useCase: new UpdateWorkspaceObjectRecordAttributeValueDefinitionUseCase(
      workspaceAccessQuery,
      objectDefinitionAccessQuery,
      repository,
      transactionManager,
      logger
    ),
  };
}

// 역할 : FakeTransactionManager cell 수정 유스케이스 테스트용 transaction manager입니다.
class FakeTransactionManager implements TransactionManager {
  readonly context: TransactionContext = {
    transactionId: Symbol("recordAttributeValueDefinitionUpdateTransaction"),
  };
  runCount = 0;

  // 기능 : 전달받은 작업을 테스트용 transaction context로 실행합니다.
  async runInTransaction<T>(
    work: (context: TransactionContext) => Promise<T>
  ): Promise<T> {
    this.runCount += 1;
    return work(this.context);
  }
}

// 역할 : FakeWorkspaceAccessQuery cell 수정 테스트용 Workspace 접근 확인 구현체입니다.
class FakeWorkspaceAccessQuery implements WorkspaceAccessQuery {
  workspaceMemberAccess: WorkspaceMemberAccess | null = {
    workspaceMemberId: "00000000-0000-4000-8000-000000000321",
    actorId: "00000000-0000-4000-8000-000000000401",
  };
  lastAccessInput: {
    readonly userId: string;
    readonly workspaceId: string;
  } | null = null;

  // 기능 : 현재 테스트에서 사용하지 않는 membership 존재 여부 호출을 차단합니다.
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

// 역할 : FakeObjectDefinitionAccessQuery cell 수정 테스트용 ObjectDefinition 접근 확인 구현체입니다.
class FakeObjectDefinitionAccessQuery implements ObjectDefinitionAccessQuery {
  hasObjectDefinition = true;
  lastInput: ObjectDefinitionWorkspaceLookupInput | null = null;

  // 기능 : 테스트용 ObjectDefinition Workspace 소속 여부를 반환합니다.
  async hasObjectDefinitionInWorkspace(
    input: ObjectDefinitionWorkspaceLookupInput
  ): Promise<boolean> {
    this.lastInput = input;
    return this.hasObjectDefinition;
  }
}

// 역할 : FakeRecordDefinitionCommandRepository cell 수정 테스트용 RecordDefinition 저장소입니다.
class FakeRecordDefinitionCommandRepository
  implements RecordDefinitionCommandRepository
{
  hasRecordDefinition = true;
  recordAttributeValueDefinition: RecordAttributeValueDefinitionForUpdate | null =
    {
      id: "00000000-0000-4000-8000-000000000801",
      attributeDefinitionId: "00000000-0000-4000-8000-000000000601",
      attributeType: "Text",
    };
  lastRecordLookupInput: RecordDefinitionWorkspaceObjectLookupInput | null =
    null;
  lastCellLookupInput: RecordAttributeValueDefinitionLookupInput | null = null;
  lastUpdateInput: UpdateRecordAttributeValueDefinitionInput | null = null;

  // 기능 : 현재 테스트에서 사용하지 않는 RecordDefinition 생성 호출을 차단합니다.
  async createRecordDefinition(): Promise<CreateRecordDefinitionResult> {
    throw new Error("Not implemented in fake repository");
  }

  // 기능 : 테스트용 RecordDefinition Workspace/ObjectDefinition 소속 여부를 반환합니다.
  async hasRecordDefinitionInWorkspaceObject(
    input: RecordDefinitionWorkspaceObjectLookupInput
  ): Promise<boolean> {
    this.lastRecordLookupInput = input;
    return this.hasRecordDefinition;
  }

  // 기능 : 테스트용 cell value row와 AttributeDefinition 정보를 반환합니다.
  async findRecordAttributeValueDefinitionForUpdate(
    input: RecordAttributeValueDefinitionLookupInput
  ): Promise<RecordAttributeValueDefinitionForUpdate | null> {
    this.lastCellLookupInput = input;
    return this.recordAttributeValueDefinition;
  }

  // 기능 : 테스트용 cell value row 수정 결과를 반환합니다.
  async updateRecordAttributeValueDefinition(
    input: UpdateRecordAttributeValueDefinitionInput
  ): Promise<UpdateRecordAttributeValueDefinitionResult> {
    this.lastUpdateInput = input;
    return {
      id: input.recordAttributeValueDefinitionId,
    };
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
