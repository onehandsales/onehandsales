import type {
  AttributeDefinitionApiSlugLookupInput,
  AttributeDefinitionCommandRepository,
  AttributeDefinitionForUpdate,
  AttributeDefinitionSortOrderByIdLookupInput,
  AttributeDefinitionSortOrderLookupInput,
  AttributeDefinitionWorkspaceObjectLookupInput,
  CreateAttributeDefinitionInput,
  CreateAttributeDefinitionResult,
  IncrementAttributeDefinitionSortOrdersFromInput,
  MoveAttributeDefinitionSortOrderInput,
  MoveAttributeDefinitionSortOrderResult,
  UpdateAttributeDefinitionInput,
  UpdateAttributeDefinitionResult,
} from "@/modules/attribute-definition/application/ports/attribute-definition-command.repository";
import {
  AttributeDefinitionNotFoundError,
  AttributeDefinitionObjectDefinitionNotFoundError,
  AttributeDefinitionValidationError,
  AttributeDefinitionWorkspaceNotFoundError,
} from "@/modules/attribute-definition/domain/attribute-definition.errors";
import type {
  ObjectDefinitionAccessQuery,
  ObjectDefinitionWorkspaceLookupInput,
} from "@/modules/object-definition/application/ports/object-definition-access-query.port";
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
import { MoveWorkspaceObjectAttributeDefinitionUseCase } from "./move-workspace-object-attribute-definition.use-case";

const WORKSPACE_ID = "00000000-0000-4000-8000-000000000301";
const OBJECT_DEFINITION_ID = "00000000-0000-4000-8000-000000000501";
const SOURCE_ATTRIBUTE_DEFINITION_ID =
  "00000000-0000-4000-8000-000000000601";
const REFERENCE_ATTRIBUTE_DEFINITION_ID =
  "00000000-0000-4000-8000-000000000606";
const ACTOR_ID = "00000000-0000-4000-8000-000000000401";

// 기능 : MoveWorkspaceObjectAttributeDefinitionUseCase 동작을 검증합니다.
describe("MoveWorkspaceObjectAttributeDefinitionUseCase", () => {
  // 기능 : 앞에 있던 AttributeDefinition을 기준 속성 뒤로 이동합니다.
  it("moves an earlier attribute definition after the reference attribute definition", async () => {
    const fixture = createFixture();
    fixture.repository.sortOrders.set(SOURCE_ATTRIBUTE_DEFINITION_ID, 1);
    fixture.repository.sortOrders.set(REFERENCE_ATTRIBUTE_DEFINITION_ID, 5);
    fixture.repository.shiftedAttributeDefinitionCount = 4;

    const result = await fixture.useCase.execute(
      makeCurrentUser(),
      WORKSPACE_ID,
      OBJECT_DEFINITION_ID,
      SOURCE_ATTRIBUTE_DEFINITION_ID,
      {
        targetPlacementPosition: {
          referenceAttributeDefinitionId: REFERENCE_ATTRIBUTE_DEFINITION_ID,
          side: "after",
        },
      }
    );

    expect(fixture.workspaceAccessQuery.lastAccessInput).toEqual({
      userId: "00000000-0000-4000-8000-000000000101",
      workspaceId: WORKSPACE_ID,
    });
    expect(fixture.objectDefinitionAccessQuery.lastInput).toEqual({
      workspaceId: WORKSPACE_ID,
      objectDefinitionId: OBJECT_DEFINITION_ID,
    });
    expect(fixture.repository.lastSortOrderByIdInputs).toEqual([
      {
        workspaceId: WORKSPACE_ID,
        objectDefinitionId: OBJECT_DEFINITION_ID,
        attributeDefinitionId: SOURCE_ATTRIBUTE_DEFINITION_ID,
        transactionContext: fixture.transactionManager.context,
      },
      {
        workspaceId: WORKSPACE_ID,
        objectDefinitionId: OBJECT_DEFINITION_ID,
        attributeDefinitionId: REFERENCE_ATTRIBUTE_DEFINITION_ID,
        transactionContext: fixture.transactionManager.context,
      },
    ]);
    expect(fixture.repository.lastMoveInput).toEqual({
      workspaceId: WORKSPACE_ID,
      objectDefinitionId: OBJECT_DEFINITION_ID,
      attributeDefinitionId: SOURCE_ATTRIBUTE_DEFINITION_ID,
      fromSortOrder: 1,
      toSortOrder: 5,
      updatedByActorId: ACTOR_ID,
      transactionContext: fixture.transactionManager.context,
    });
    expect(fixture.logger.log).toHaveBeenCalledWith(
      expect.stringContaining("crm.attributeDefinition.moved"),
      "MoveWorkspaceObjectAttributeDefinitionUseCase"
    );
    expect(String(fixture.logger.log.mock.calls[0]?.[0])).toContain(
      "\"fromSortOrder\":1"
    );
    expect(String(fixture.logger.log.mock.calls[0]?.[0])).toContain(
      "\"toSortOrder\":5"
    );
    expect(result).toEqual({
      attributeDefinitionId: SOURCE_ATTRIBUTE_DEFINITION_ID,
    });
  });

  // 기능 : 뒤에 있던 AttributeDefinition을 기준 속성 앞으로 이동합니다.
  it("moves a later attribute definition before the reference attribute definition", async () => {
    const fixture = createFixture();
    fixture.repository.sortOrders.set(SOURCE_ATTRIBUTE_DEFINITION_ID, 6);
    fixture.repository.sortOrders.set(REFERENCE_ATTRIBUTE_DEFINITION_ID, 2);
    fixture.repository.shiftedAttributeDefinitionCount = 4;

    await fixture.useCase.execute(
      makeCurrentUser(),
      WORKSPACE_ID,
      OBJECT_DEFINITION_ID,
      SOURCE_ATTRIBUTE_DEFINITION_ID,
      {
        targetPlacementPosition: {
          referenceAttributeDefinitionId: REFERENCE_ATTRIBUTE_DEFINITION_ID,
          side: "before",
        },
      }
    );

    expect(fixture.repository.lastMoveInput).toMatchObject({
      fromSortOrder: 6,
      toSortOrder: 2,
      updatedByActorId: ACTOR_ID,
    });
  });

  // 기능 : 계산된 최종 위치가 현재 위치와 같으면 DB 변경 없이 no-op 성공으로 처리합니다.
  it("returns success without moving rows when the target sort order is unchanged", async () => {
    const fixture = createFixture();
    fixture.repository.sortOrders.set(SOURCE_ATTRIBUTE_DEFINITION_ID, 1);
    fixture.repository.sortOrders.set(REFERENCE_ATTRIBUTE_DEFINITION_ID, 2);

    await fixture.useCase.execute(
      makeCurrentUser(),
      WORKSPACE_ID,
      OBJECT_DEFINITION_ID,
      SOURCE_ATTRIBUTE_DEFINITION_ID,
      {
        targetPlacementPosition: {
          referenceAttributeDefinitionId: REFERENCE_ATTRIBUTE_DEFINITION_ID,
          side: "before",
        },
      }
    );

    expect(fixture.repository.lastMoveInput).toBeNull();
    expect(fixture.transactionManager.runCount).toBe(1);
    expect(String(fixture.logger.log.mock.calls[0]?.[0])).toContain(
      "\"isNoop\":true"
    );
    expect(String(fixture.logger.log.mock.calls[0]?.[0])).toContain(
      "\"shiftedAttributeDefinitionCount\":0"
    );
  });

  // 기능 : targetPlacementPosition 필수 구조가 아니면 DB 조회 전에 위치 변경을 차단합니다.
  it.each([
    ["missing", {}],
    ["null", { targetPlacementPosition: null }],
    ["array", { targetPlacementPosition: [] }],
    [
      "invalid side",
      {
        targetPlacementPosition: {
          referenceAttributeDefinitionId: REFERENCE_ATTRIBUTE_DEFINITION_ID,
          side: "left",
        },
      },
    ],
  ])(
    "rejects malformed target placement positions before workspace lookup: %s",
    async (_caseName, command) => {
      const fixture = createFixture();

      await expect(
        fixture.useCase.execute(
          makeCurrentUser(),
          WORKSPACE_ID,
          OBJECT_DEFINITION_ID,
          SOURCE_ATTRIBUTE_DEFINITION_ID,
          command
        )
      ).rejects.toMatchObject({
        code: "ATTRIBUTE_DEFINITION_POSITION_INVALID",
        details: { field: "targetPlacementPosition" },
      } satisfies Partial<AttributeDefinitionValidationError>);

      expect(fixture.workspaceAccessQuery.lastAccessInput).toBeNull();
      expect(fixture.transactionManager.runCount).toBe(0);
    }
  );

  // 기능 : 잘못된 targetPlacementPosition 입력은 DB 조회 전에 위치 변경을 차단합니다.
  it("rejects invalid target placement positions before workspace lookup", async () => {
    const fixture = createFixture();

    await expect(
      fixture.useCase.execute(
        makeCurrentUser(),
        WORKSPACE_ID,
        OBJECT_DEFINITION_ID,
        SOURCE_ATTRIBUTE_DEFINITION_ID,
        {
          targetPlacementPosition: {
            referenceAttributeDefinitionId: "not-a-uuid",
            side: "before",
          },
        }
      )
    ).rejects.toMatchObject({
      code: "ATTRIBUTE_DEFINITION_POSITION_INVALID",
      details: { field: "targetPlacementPosition" },
    } satisfies Partial<AttributeDefinitionValidationError>);

    expect(fixture.workspaceAccessQuery.lastAccessInput).toBeNull();
    expect(fixture.transactionManager.runCount).toBe(0);
  });

  // 기능 : 계약에 없는 targetPlacementPosition 하위 필드는 DB 조회 전에 위치 변경을 차단합니다.
  it("rejects target placement positions with unknown fields before workspace lookup", async () => {
    const fixture = createFixture();

    await expect(
      fixture.useCase.execute(
        makeCurrentUser(),
        WORKSPACE_ID,
        OBJECT_DEFINITION_ID,
        SOURCE_ATTRIBUTE_DEFINITION_ID,
        {
          targetPlacementPosition: {
            referenceAttributeDefinitionId: REFERENCE_ATTRIBUTE_DEFINITION_ID,
            side: "before",
            unknownNestedField: "not allowed",
          },
        }
      )
    ).rejects.toMatchObject({
      code: "ATTRIBUTE_DEFINITION_POSITION_INVALID",
      details: { field: "targetPlacementPosition" },
    } satisfies Partial<AttributeDefinitionValidationError>);

    expect(fixture.workspaceAccessQuery.lastAccessInput).toBeNull();
    expect(fixture.transactionManager.runCount).toBe(0);
  });

  // 기능 : 이동 대상 자신을 기준으로 한 위치 변경 요청은 DB 조회 전에 차단합니다.
  it("rejects moving an attribute definition relative to itself before workspace lookup", async () => {
    const fixture = createFixture();

    await expect(
      fixture.useCase.execute(
        makeCurrentUser(),
        WORKSPACE_ID,
        OBJECT_DEFINITION_ID,
        SOURCE_ATTRIBUTE_DEFINITION_ID,
        {
          targetPlacementPosition: {
            referenceAttributeDefinitionId: SOURCE_ATTRIBUTE_DEFINITION_ID,
            side: "after",
          },
        }
      )
    ).rejects.toMatchObject({
      code: "ATTRIBUTE_DEFINITION_POSITION_INVALID",
      details: { field: "targetPlacementPosition" },
    } satisfies Partial<AttributeDefinitionValidationError>);

    expect(fixture.workspaceAccessQuery.lastAccessInput).toBeNull();
    expect(fixture.transactionManager.runCount).toBe(0);
  });

  // 기능 : 현재 사용자가 Workspace 멤버가 아니면 위치 변경을 차단합니다.
  it("throws not found when the current user is not a workspace member", async () => {
    const fixture = createFixture();
    fixture.workspaceAccessQuery.workspaceMemberAccess = null;

    await expect(
      fixture.useCase.execute(
        makeCurrentUser(),
        WORKSPACE_ID,
        OBJECT_DEFINITION_ID,
        SOURCE_ATTRIBUTE_DEFINITION_ID,
        {
          targetPlacementPosition: {
            referenceAttributeDefinitionId: REFERENCE_ATTRIBUTE_DEFINITION_ID,
            side: "after",
          },
        }
      )
    ).rejects.toBeInstanceOf(AttributeDefinitionWorkspaceNotFoundError);

    expect(fixture.objectDefinitionAccessQuery.lastInput).toBeNull();
    expect(fixture.repository.lastMoveInput).toBeNull();
    expect(fixture.transactionManager.runCount).toBe(0);
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
        WORKSPACE_ID,
        OBJECT_DEFINITION_ID,
        SOURCE_ATTRIBUTE_DEFINITION_ID,
        {
          targetPlacementPosition: {
            referenceAttributeDefinitionId: REFERENCE_ATTRIBUTE_DEFINITION_ID,
            side: "after",
          },
        }
      )
    ).rejects.toThrow("Workspace member actor is missing");

    expect(fixture.objectDefinitionAccessQuery.lastInput).toBeNull();
    expect(fixture.repository.lastMoveInput).toBeNull();
    expect(fixture.transactionManager.runCount).toBe(0);
  });

  // 기능 : 요청 ObjectDefinition이 Workspace에 속하지 않으면 위치 변경을 차단합니다.
  it("throws not found when the object definition is outside the workspace", async () => {
    const fixture = createFixture();
    fixture.objectDefinitionAccessQuery.hasObjectDefinition = false;

    await expect(
      fixture.useCase.execute(
        makeCurrentUser(),
        WORKSPACE_ID,
        "00000000-0000-4000-8000-000000000599",
        SOURCE_ATTRIBUTE_DEFINITION_ID,
        {
          targetPlacementPosition: {
            referenceAttributeDefinitionId: REFERENCE_ATTRIBUTE_DEFINITION_ID,
            side: "after",
          },
        }
      )
    ).rejects.toBeInstanceOf(AttributeDefinitionObjectDefinitionNotFoundError);

    expect(fixture.repository.lastMoveInput).toBeNull();
    expect(fixture.transactionManager.runCount).toBe(0);
  });

  // 기능 : 이동 대상 AttributeDefinition이 Workspace/ObjectDefinition 경계 밖이면 rollback합니다.
  it("throws not found when the source attribute definition is outside the object definition", async () => {
    const fixture = createFixture();
    fixture.repository.sortOrders.delete(SOURCE_ATTRIBUTE_DEFINITION_ID);

    await expect(
      fixture.useCase.execute(
        makeCurrentUser(),
        WORKSPACE_ID,
        OBJECT_DEFINITION_ID,
        SOURCE_ATTRIBUTE_DEFINITION_ID,
        {
          targetPlacementPosition: {
            referenceAttributeDefinitionId: REFERENCE_ATTRIBUTE_DEFINITION_ID,
            side: "after",
          },
        }
      )
    ).rejects.toBeInstanceOf(AttributeDefinitionNotFoundError);

    expect(fixture.repository.lastMoveInput).toBeNull();
    expect(fixture.transactionManager.runCount).toBe(1);
  });

  // 기능 : 기준 AttributeDefinition이 Workspace/ObjectDefinition 경계 밖이면 rollback합니다.
  it("throws not found when the reference attribute definition is outside the object definition", async () => {
    const fixture = createFixture();
    fixture.repository.sortOrders.delete(REFERENCE_ATTRIBUTE_DEFINITION_ID);

    await expect(
      fixture.useCase.execute(
        makeCurrentUser(),
        WORKSPACE_ID,
        OBJECT_DEFINITION_ID,
        SOURCE_ATTRIBUTE_DEFINITION_ID,
        {
          targetPlacementPosition: {
            referenceAttributeDefinitionId: REFERENCE_ATTRIBUTE_DEFINITION_ID,
            side: "after",
          },
        }
      )
    ).rejects.toBeInstanceOf(AttributeDefinitionNotFoundError);

    expect(fixture.repository.lastMoveInput).toBeNull();
    expect(fixture.transactionManager.runCount).toBe(1);
  });
});

// 기능 : MoveWorkspaceObjectAttributeDefinitionUseCase 테스트 fixture를 생성합니다.
function createFixture() {
  const workspaceAccessQuery = new FakeWorkspaceAccessQuery();
  const objectDefinitionAccessQuery = new FakeObjectDefinitionAccessQuery();
  const repository = new FakeAttributeDefinitionCommandRepository();
  const transactionManager = new FakeTransactionManager();
  const logger = createLoggerFake();

  return {
    workspaceAccessQuery,
    objectDefinitionAccessQuery,
    repository,
    transactionManager,
    logger,
    useCase: new MoveWorkspaceObjectAttributeDefinitionUseCase(
      workspaceAccessQuery,
      objectDefinitionAccessQuery,
      repository,
      transactionManager,
      logger
    ),
  };
}

// 역할 : FakeTransactionManager 위치 변경 유스케이스 테스트용 transaction manager입니다.
class FakeTransactionManager implements TransactionManager {
  readonly context: TransactionContext = {
    transactionId: Symbol("attributeDefinitionMoveTransaction"),
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

// 역할 : FakeWorkspaceAccessQuery AttributeDefinition 위치 변경 테스트용 Workspace 접근 확인 구현체입니다.
class FakeWorkspaceAccessQuery implements WorkspaceAccessQuery {
  workspaceMemberAccess: WorkspaceMemberAccess | null = {
    workspaceMemberId: "00000000-0000-4000-8000-000000000321",
    actorId: ACTOR_ID,
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

// 역할 : FakeObjectDefinitionAccessQuery AttributeDefinition 위치 변경 테스트용 ObjectDefinition 접근 확인 구현체입니다.
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

// 역할 : FakeAttributeDefinitionCommandRepository 위치 변경 유스케이스 테스트용 AttributeDefinition 저장소입니다.
class FakeAttributeDefinitionCommandRepository
  implements AttributeDefinitionCommandRepository
{
  sortOrders = new Map<string, number>([
    [SOURCE_ATTRIBUTE_DEFINITION_ID, 1],
    [REFERENCE_ATTRIBUTE_DEFINITION_ID, 5],
  ]);
  shiftedAttributeDefinitionCount = 0;
  lastSortOrderByIdInputs: AttributeDefinitionSortOrderByIdLookupInput[] = [];
  lastMoveInput: MoveAttributeDefinitionSortOrderInput | null = null;

  // 기능 : 현재 테스트에서 사용하지 않는 apiSlug 중복 확인 호출을 차단합니다.
  async hasAttributeDefinitionApiSlug(
    _input: AttributeDefinitionApiSlugLookupInput
  ): Promise<boolean> {
    void _input;
    throw new Error("Not implemented in fake repository");
  }

  // 기능 : 현재 테스트에서 사용하지 않는 다음 정렬 순서 조회 호출을 차단합니다.
  async getNextAttributeDefinitionSortOrder(
    _input: AttributeDefinitionSortOrderLookupInput
  ): Promise<number> {
    void _input;
    throw new Error("Not implemented in fake repository");
  }

  // 기능 : 테스트용 AttributeDefinition 정렬 순서를 반환합니다.
  async findAttributeDefinitionSortOrder(
    input: AttributeDefinitionSortOrderByIdLookupInput
  ): Promise<number | null> {
    this.lastSortOrderByIdInputs.push(input);
    return this.sortOrders.get(input.attributeDefinitionId) ?? null;
  }

  // 기능 : 현재 테스트에서 사용하지 않는 정렬 순서 밀기 호출을 차단합니다.
  async incrementAttributeDefinitionSortOrdersFrom(
    _input: IncrementAttributeDefinitionSortOrdersFromInput
  ): Promise<number> {
    void _input;
    throw new Error("Not implemented in fake repository");
  }

  // 기능 : 테스트용 AttributeDefinition 위치 변경 결과를 반환합니다.
  async moveAttributeDefinitionSortOrder(
    input: MoveAttributeDefinitionSortOrderInput
  ): Promise<MoveAttributeDefinitionSortOrderResult> {
    this.lastMoveInput = input;

    return {
      id: input.attributeDefinitionId,
      shiftedAttributeDefinitionCount: this.shiftedAttributeDefinitionCount,
    };
  }

  // 기능 : 현재 테스트에서 사용하지 않는 생성 호출을 차단합니다.
  async createAttributeDefinition(
    _input: CreateAttributeDefinitionInput
  ): Promise<CreateAttributeDefinitionResult> {
    void _input;
    throw new Error("Not implemented in fake repository");
  }

  // 기능 : 현재 테스트에서 사용하지 않는 수정 대상 조회 호출을 차단합니다.
  async findAttributeDefinitionForUpdate(
    _input: AttributeDefinitionWorkspaceObjectLookupInput
  ): Promise<AttributeDefinitionForUpdate | null> {
    void _input;
    throw new Error("Not implemented in fake repository");
  }

  // 기능 : 현재 테스트에서 사용하지 않는 AttributeDefinition 수정 호출을 차단합니다.
  async updateAttributeDefinition(
    _input: UpdateAttributeDefinitionInput
  ): Promise<UpdateAttributeDefinitionResult> {
    void _input;
    throw new Error("Not implemented in fake repository");
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
function makeCurrentUser(
  overrides: Partial<CurrentUserContext> = {}
): CurrentUserContext {
  return {
    id: "00000000-0000-4000-8000-000000000101",
    sessionId: "00000000-0000-4000-8000-000000000201",
    email: "user@example.com",
    displayName: "User",
    platformRole: "USER",
    status: "ACTIVE",
    timeZone: "Asia/Seoul",
    ...overrides,
  };
}
