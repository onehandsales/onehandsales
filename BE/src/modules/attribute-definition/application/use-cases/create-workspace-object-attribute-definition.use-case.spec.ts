import type {
  AttributeDefinitionApiSlugLookupInput,
  AttributeDefinitionSortOrderLookupInput,
  AttributeDefinitionCommandRepository,
  CreateAttributeDefinitionInput,
  CreateAttributeDefinitionResult,
} from "@/modules/attribute-definition/application/ports/attribute-definition-command.repository";
import {
  AttributeDefinitionApiSlugAlreadyExistsError,
  AttributeDefinitionObjectDefinitionNotFoundError,
  AttributeDefinitionValidationError,
  AttributeDefinitionWorkspaceNotFoundError,
} from "@/modules/attribute-definition/domain/attribute-definition.errors";
import type {
  ObjectDefinitionAccessQuery,
  ObjectDefinitionWorkspaceLookupInput,
} from "@/modules/object-definition/application/ports/object-definition-access-query.port";
import type {
  MaterializeRecordAttributeValuesForAttributeDefinitionInput,
  MaterializeRecordAttributeValuesForAttributeDefinitionResult,
  RecordAttributeValueDefinitionMaterializer,
} from "@/modules/record-definition/application/ports/record-attribute-value-definition-materializer.port";
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
import { CreateWorkspaceObjectAttributeDefinitionUseCase } from "./create-workspace-object-attribute-definition.use-case";

// 기능 : CreateWorkspaceObjectAttributeDefinitionUseCase 동작을 검증합니다.
describe("CreateWorkspaceObjectAttributeDefinitionUseCase", () => {
  // 기능 : 입력 이름과 타입을 AttributeDefinition 생성 필드에 매핑해 생성합니다.
  it("creates an attribute definition for an accessible workspace object", async () => {
    const fixture = createFixture();

    const result = await fixture.useCase.execute(
      makeCurrentUser(),
      "00000000-0000-4000-8000-000000000301",
      "00000000-0000-4000-8000-000000000501",
      {
        attributeDefinitionName: "  회사번호  ",
        attributeType: "PhoneNumber",
        icon: "phone",
        description: " 대표 전화번호를 저장해요. ",
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
    expect(fixture.repository.lastLookupInput).toEqual({
      workspaceId: "00000000-0000-4000-8000-000000000301",
      objectDefinitionId: "00000000-0000-4000-8000-000000000501",
      apiSlug: "회사번호",
    });
    expect(fixture.repository.lastSortOrderInput).toEqual({
      workspaceId: "00000000-0000-4000-8000-000000000301",
      objectDefinitionId: "00000000-0000-4000-8000-000000000501",
      transactionContext: fixture.transactionManager.context,
    });
    expect(fixture.repository.lastCreateInput).toEqual({
      workspaceId: "00000000-0000-4000-8000-000000000301",
      objectDefinitionId: "00000000-0000-4000-8000-000000000501",
      createdByActorId: "00000000-0000-4000-8000-000000000401",
      apiSlug: "회사번호",
      title: "회사번호",
      sortOrder: 0,
      type: "PhoneNumber",
      icon: "phone",
      isMultiselect: false,
      description: " 대표 전화번호를 저장해요. ",
      config: null,
      transactionContext: fixture.transactionManager.context,
    });
    expect(fixture.materializer.lastInput).toEqual({
      workspaceId: "00000000-0000-4000-8000-000000000301",
      objectDefinitionId: "00000000-0000-4000-8000-000000000501",
      attributeDefinitionId: "00000000-0000-4000-8000-000000000601",
      attributeType: "PhoneNumber",
      createdByActorId: "00000000-0000-4000-8000-000000000401",
      transactionContext: fixture.transactionManager.context,
    });
    expect(fixture.transactionManager.runCount).toBe(1);
    expect(fixture.logger.log).toHaveBeenCalledWith(
      expect.stringContaining("crm.attributeDefinition.created"),
      "CreateWorkspaceObjectAttributeDefinitionUseCase"
    );
    expect(result).toEqual({
      attributeDefinitionId: "00000000-0000-4000-8000-000000000601",
    });
  });

  // 기능 : 선택 입력값이 없거나 빈 문자열이면 null로 저장합니다.
  it("stores missing optional values as null", async () => {
    const fixture = createFixture();

    await fixture.useCase.execute(
      makeCurrentUser(),
      "00000000-0000-4000-8000-000000000301",
      "00000000-0000-4000-8000-000000000501",
      {
        attributeDefinitionName: "회사번호",
        attributeType: "PhoneNumber",
        icon: "",
      }
    );

    expect(fixture.repository.lastCreateInput).toMatchObject({
      icon: null,
      description: null,
    });
  });

  // 기능 : Prisma enum에 있는 AttributeType은 별도 미지원 오류 없이 생성 대상으로 받습니다.
  it("accepts any known attribute type enum value", async () => {
    const fixture = createFixture();

    await fixture.useCase.execute(
      makeCurrentUser(),
      "00000000-0000-4000-8000-000000000301",
      "00000000-0000-4000-8000-000000000501",
      {
        attributeDefinitionName: "상태",
        attributeType: "Status",
      }
    );

    expect(fixture.repository.lastCreateInput).toMatchObject({
      type: "Status",
      isMultiselect: false,
      config: null,
    });
  });

  // 기능 : Currency AttributeDefinition config를 저장 가능한 canonical 설정으로 정규화합니다.
  it("normalizes currency attribute definition config", async () => {
    const fixture = createFixture();

    await fixture.useCase.execute(
      makeCurrentUser(),
      "00000000-0000-4000-8000-000000000301",
      "00000000-0000-4000-8000-000000000501",
      {
        attributeDefinitionName: "금액",
        attributeType: "Currency",
        config: {
          currency: {
            defaultCurrencyCode: " usd ",
            displayType: "symbol",
          },
        },
      }
    );

    expect(fixture.repository.lastCreateInput).toMatchObject({
      type: "Currency",
      config: {
        currency: {
          defaultCurrencyCode: "USD",
          displayType: "symbol",
        },
      },
    });
  });

  // 기능 : Currency config가 없으면 현재 사용자 기본 통화와 symbol 표시 방식을 사용합니다.
  it("uses current user default currency for missing currency config", async () => {
    const fixture = createFixture();

    await fixture.useCase.execute(
      makeCurrentUser({ defaultCurrencyCode: "USD" }),
      "00000000-0000-4000-8000-000000000301",
      "00000000-0000-4000-8000-000000000501",
      {
        attributeDefinitionName: "금액",
        attributeType: "Currency",
      }
    );

    expect(fixture.repository.lastCreateInput).toMatchObject({
      config: {
        currency: {
          defaultCurrencyCode: "USD",
          displayType: "symbol",
        },
      },
    });
  });

  // 기능 : Currency가 아닌 AttributeType의 config 입력을 차단합니다.
  it("rejects config for non-currency attribute types", async () => {
    const fixture = createFixture();

    await expect(
      fixture.useCase.execute(
        makeCurrentUser(),
        "00000000-0000-4000-8000-000000000301",
        "00000000-0000-4000-8000-000000000501",
        {
          attributeDefinitionName: "회사번호",
          attributeType: "PhoneNumber",
          config: {
            currency: {
              defaultCurrencyCode: "KRW",
              displayType: "symbol",
            },
          },
        }
      )
    ).rejects.toMatchObject({
      code: "ATTRIBUTE_DEFINITION_CONFIG_INVALID",
    } satisfies Partial<AttributeDefinitionValidationError>);

    expect(fixture.workspaceAccessQuery.lastAccessInput).toBeNull();
    expect(fixture.repository.lastCreateInput).toBeNull();
    expect(fixture.materializer.lastInput).toBeNull();
    expect(fixture.transactionManager.runCount).toBe(0);
  });

  // 기능 : 지원하지 않는 Currency config 값은 DB 조회 전에 생성을 차단합니다.
  it("rejects invalid currency config values before workspace lookup", async () => {
    const fixture = createFixture();

    await expect(
      fixture.useCase.execute(
        makeCurrentUser(),
        "00000000-0000-4000-8000-000000000301",
        "00000000-0000-4000-8000-000000000501",
        {
          attributeDefinitionName: "금액",
          attributeType: "Currency",
          config: {
            currency: {
              defaultCurrencyCode: "EUR",
              displayType: "symbol",
            },
          },
        }
      )
    ).rejects.toMatchObject({
      code: "ATTRIBUTE_DEFINITION_CONFIG_INVALID",
    } satisfies Partial<AttributeDefinitionValidationError>);

    expect(fixture.workspaceAccessQuery.lastAccessInput).toBeNull();
    expect(fixture.repository.lastCreateInput).toBeNull();
    expect(fixture.materializer.lastInput).toBeNull();
    expect(fixture.transactionManager.runCount).toBe(0);
  });

  // 기능 : 현재 지원하지 않는 Currency 표시 방식은 DB 조회 전에 생성을 차단합니다.
  it("rejects unsupported currency display types before workspace lookup", async () => {
    const fixture = createFixture();

    await expect(
      fixture.useCase.execute(
        makeCurrentUser(),
        "00000000-0000-4000-8000-000000000301",
        "00000000-0000-4000-8000-000000000501",
        {
          attributeDefinitionName: "금액",
          attributeType: "Currency",
          config: {
            currency: {
              defaultCurrencyCode: "KRW",
              displayType: "code",
            },
          },
        }
      )
    ).rejects.toMatchObject({
      code: "ATTRIBUTE_DEFINITION_CONFIG_INVALID",
    } satisfies Partial<AttributeDefinitionValidationError>);

    expect(fixture.workspaceAccessQuery.lastAccessInput).toBeNull();
    expect(fixture.repository.lastCreateInput).toBeNull();
    expect(fixture.materializer.lastInput).toBeNull();
    expect(fixture.transactionManager.runCount).toBe(0);
  });

  // 기능 : 공백 이름은 DB 조회 전에 AttributeDefinition 생성을 차단합니다.
  it("rejects blank attribute definition names before workspace lookup", async () => {
    const fixture = createFixture();

    await expect(
      fixture.useCase.execute(
        makeCurrentUser(),
        "00000000-0000-4000-8000-000000000301",
        "00000000-0000-4000-8000-000000000501",
        {
          attributeDefinitionName: "   ",
          attributeType: "Text",
        }
      )
    ).rejects.toMatchObject({
      code: "ATTRIBUTE_DEFINITION_NAME_REQUIRED",
    } satisfies Partial<AttributeDefinitionValidationError>);

    expect(fixture.workspaceAccessQuery.lastAccessInput).toBeNull();
    expect(fixture.repository.lastCreateInput).toBeNull();
    expect(fixture.materializer.lastInput).toBeNull();
    expect(fixture.transactionManager.runCount).toBe(0);
  });

  // 기능 : 너무 긴 이름은 AttributeDefinition 생성을 차단합니다.
  it("rejects attribute definition names longer than 80 characters", async () => {
    const fixture = createFixture();

    await expect(
      fixture.useCase.execute(
        makeCurrentUser(),
        "00000000-0000-4000-8000-000000000301",
        "00000000-0000-4000-8000-000000000501",
        {
          attributeDefinitionName: "가".repeat(81),
          attributeType: "Text",
        }
      )
    ).rejects.toMatchObject({
      code: "ATTRIBUTE_DEFINITION_NAME_TOO_LONG",
    } satisfies Partial<AttributeDefinitionValidationError>);

    expect(fixture.workspaceAccessQuery.lastAccessInput).toBeNull();
    expect(fixture.repository.lastCreateInput).toBeNull();
    expect(fixture.materializer.lastInput).toBeNull();
    expect(fixture.transactionManager.runCount).toBe(0);
  });

  // 기능 : 알 수 없는 AttributeType은 DB 조회 전에 AttributeDefinition 생성을 차단합니다.
  it("rejects unknown attribute types before workspace lookup", async () => {
    const fixture = createFixture();

    await expect(
      fixture.useCase.execute(
        makeCurrentUser(),
        "00000000-0000-4000-8000-000000000301",
        "00000000-0000-4000-8000-000000000501",
        {
          attributeDefinitionName: "회사번호",
          attributeType: "RandomType",
        }
      )
    ).rejects.toMatchObject({
      code: "ATTRIBUTE_DEFINITION_TYPE_UNKNOWN",
    } satisfies Partial<AttributeDefinitionValidationError>);

    expect(fixture.workspaceAccessQuery.lastAccessInput).toBeNull();
    expect(fixture.repository.lastCreateInput).toBeNull();
    expect(fixture.materializer.lastInput).toBeNull();
    expect(fixture.transactionManager.runCount).toBe(0);
  });

  // 기능 : 현재 사용자가 Workspace 멤버가 아니면 생성을 차단합니다.
  it("throws not found when the current user is not a workspace member", async () => {
    const fixture = createFixture();
    fixture.workspaceAccessQuery.workspaceMemberAccess = null;

    await expect(
      fixture.useCase.execute(
        makeCurrentUser(),
        "00000000-0000-4000-8000-000000000302",
        "00000000-0000-4000-8000-000000000501",
        {
          attributeDefinitionName: "회사번호",
          attributeType: "PhoneNumber",
        }
      )
    ).rejects.toBeInstanceOf(AttributeDefinitionWorkspaceNotFoundError);

    expect(fixture.objectDefinitionAccessQuery.lastInput).toBeNull();
    expect(fixture.repository.lastCreateInput).toBeNull();
    expect(fixture.materializer.lastInput).toBeNull();
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
        "00000000-0000-4000-8000-000000000301",
        "00000000-0000-4000-8000-000000000501",
        {
          attributeDefinitionName: "회사번호",
          attributeType: "PhoneNumber",
        }
      )
    ).rejects.toThrow("Workspace member actor is missing");

    expect(fixture.objectDefinitionAccessQuery.lastInput).toBeNull();
    expect(fixture.repository.lastCreateInput).toBeNull();
    expect(fixture.materializer.lastInput).toBeNull();
    expect(fixture.transactionManager.runCount).toBe(0);
  });

  // 기능 : 요청 ObjectDefinition이 Workspace에 속하지 않으면 생성을 차단합니다.
  it("throws not found when the object definition is outside the workspace", async () => {
    const fixture = createFixture();
    fixture.objectDefinitionAccessQuery.hasObjectDefinition = false;

    await expect(
      fixture.useCase.execute(
        makeCurrentUser(),
        "00000000-0000-4000-8000-000000000301",
        "00000000-0000-4000-8000-000000000599",
        {
          attributeDefinitionName: "회사번호",
          attributeType: "PhoneNumber",
        }
      )
    ).rejects.toBeInstanceOf(AttributeDefinitionObjectDefinitionNotFoundError);

    expect(fixture.repository.lastLookupInput).toBeNull();
    expect(fixture.repository.lastCreateInput).toBeNull();
    expect(fixture.materializer.lastInput).toBeNull();
    expect(fixture.transactionManager.runCount).toBe(0);
  });

  // 기능 : 같은 ObjectDefinition 안의 중복 apiSlug 생성을 차단합니다.
  it("rejects duplicate api slugs in the same object definition", async () => {
    const fixture = createFixture();
    fixture.repository.hasSameApiSlug = true;

    await expect(
      fixture.useCase.execute(
        makeCurrentUser(),
        "00000000-0000-4000-8000-000000000301",
        "00000000-0000-4000-8000-000000000501",
        {
          attributeDefinitionName: "회사번호",
          attributeType: "PhoneNumber",
        }
      )
    ).rejects.toBeInstanceOf(AttributeDefinitionApiSlugAlreadyExistsError);

    expect(fixture.repository.lastCreateInput).toBeNull();
    expect(fixture.materializer.lastInput).toBeNull();
    expect(fixture.transactionManager.runCount).toBe(0);
  });
});

// 기능 : CreateWorkspaceObjectAttributeDefinitionUseCase 테스트 fixture를 생성합니다.
function createFixture() {
  const workspaceAccessQuery = new FakeWorkspaceAccessQuery();
  const objectDefinitionAccessQuery = new FakeObjectDefinitionAccessQuery();
  const repository = new FakeAttributeDefinitionCommandRepository();
  const materializer = new FakeRecordAttributeValueDefinitionMaterializer();
  const transactionManager = new FakeTransactionManager();
  const logger = createLoggerFake();

  return {
    workspaceAccessQuery,
    objectDefinitionAccessQuery,
    repository,
    materializer,
    transactionManager,
    logger,
    useCase: new CreateWorkspaceObjectAttributeDefinitionUseCase(
      workspaceAccessQuery,
      objectDefinitionAccessQuery,
      repository,
      materializer,
      transactionManager,
      logger
    ),
  };
}

// 역할 : FakeTransactionManager 생성 유스케이스 테스트용 transaction manager입니다.
class FakeTransactionManager implements TransactionManager {
  readonly context: TransactionContext = {
    transactionId: Symbol("attributeDefinitionCreateTransaction"),
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

// 역할 : FakeWorkspaceAccessQuery AttributeDefinition 생성 테스트용 Workspace 접근 확인 구현체입니다.
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

// 역할 : FakeObjectDefinitionAccessQuery AttributeDefinition 생성 테스트용 ObjectDefinition 접근 확인 구현체입니다.
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

// 역할 : FakeAttributeDefinitionCommandRepository 생성 유스케이스 테스트용 AttributeDefinition 저장소입니다.
class FakeAttributeDefinitionCommandRepository
  implements AttributeDefinitionCommandRepository
{
  hasSameApiSlug = false;
  lastLookupInput: AttributeDefinitionApiSlugLookupInput | null = null;
  lastSortOrderInput: AttributeDefinitionSortOrderLookupInput | null = null;
  lastCreateInput: CreateAttributeDefinitionInput | null = null;
  nextSortOrder = 0;

  // 기능 : 테스트용 AttributeDefinition apiSlug 중복 여부를 반환합니다.
  async hasAttributeDefinitionApiSlug(
    input: AttributeDefinitionApiSlugLookupInput
  ): Promise<boolean> {
    this.lastLookupInput = input;
    return this.hasSameApiSlug;
  }

  // 기능 : 테스트용 AttributeDefinition 다음 정렬 순서를 반환합니다.
  async getNextAttributeDefinitionSortOrder(
    input: AttributeDefinitionSortOrderLookupInput
  ): Promise<number> {
    this.lastSortOrderInput = input;
    return this.nextSortOrder;
  }

  // 기능 : 테스트용 AttributeDefinition 생성 결과를 반환합니다.
  async createAttributeDefinition(
    input: CreateAttributeDefinitionInput
  ): Promise<CreateAttributeDefinitionResult> {
    this.lastCreateInput = input;

    return {
      id: "00000000-0000-4000-8000-000000000601",
    };
  }
}

// 역할 : FakeRecordAttributeValueDefinitionMaterializer 생성 유스케이스 테스트용 cell row materializer입니다.
class FakeRecordAttributeValueDefinitionMaterializer
  implements RecordAttributeValueDefinitionMaterializer
{
  lastInput: MaterializeRecordAttributeValuesForAttributeDefinitionInput | null =
    null;
  result: MaterializeRecordAttributeValuesForAttributeDefinitionResult = {
    createdCount: 2,
  };

  // 기능 : 테스트용 RecordAttributeValueDefinition materialize 결과를 반환합니다.
  async materializeForAttributeDefinition(
    input: MaterializeRecordAttributeValuesForAttributeDefinitionInput
  ): Promise<MaterializeRecordAttributeValuesForAttributeDefinitionResult> {
    this.lastInput = input;
    return this.result;
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
