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
  UpdateAttributeDefinitionInput,
  UpdateAttributeDefinitionResult,
} from "@/modules/attribute-definition/application/ports/attribute-definition-command.repository";
import {
  AttributeDefinitionApiSlugAlreadyExistsError,
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
import { UpdateWorkspaceObjectAttributeDefinitionUseCase } from "./update-workspace-object-attribute-definition.use-case";

// 기능 : UpdateWorkspaceObjectAttributeDefinitionUseCase 동작을 검증합니다.
describe("UpdateWorkspaceObjectAttributeDefinitionUseCase", () => {
  // 기능 : request에 포함된 필드만 AttributeDefinition update patch에 반영합니다.
  it("updates only included attribute definition fields", async () => {
    const fixture = createFixture();

    const result = await fixture.useCase.execute(
      makeCurrentUser(),
      "00000000-0000-4000-8000-000000000301",
      "00000000-0000-4000-8000-000000000501",
      "00000000-0000-4000-8000-000000000601",
      {
        hasTitle: true,
        title: "  계약 금액  ",
        hasDescription: true,
        description: null,
        hasIcon: true,
        icon: "circle-dollar-sign",
        hasIsMultiselect: true,
        isMultiselect: true,
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
    expect(fixture.repository.lastFindInput).toEqual({
      workspaceId: "00000000-0000-4000-8000-000000000301",
      objectDefinitionId: "00000000-0000-4000-8000-000000000501",
      attributeDefinitionId: "00000000-0000-4000-8000-000000000601",
    });
    expect(fixture.repository.lastLookupInput).toEqual({
      workspaceId: "00000000-0000-4000-8000-000000000301",
      objectDefinitionId: "00000000-0000-4000-8000-000000000501",
      apiSlug: "계약 금액",
      excludeAttributeDefinitionId: "00000000-0000-4000-8000-000000000601",
    });
    expect(fixture.repository.lastUpdateInput).toEqual({
      workspaceId: "00000000-0000-4000-8000-000000000301",
      objectDefinitionId: "00000000-0000-4000-8000-000000000501",
      attributeDefinitionId: "00000000-0000-4000-8000-000000000601",
      updatedByActorId: "00000000-0000-4000-8000-000000000401",
      patch: {
        title: "계약 금액",
        apiSlug: "계약 금액",
        description: null,
        icon: "circle-dollar-sign",
        isMultiselect: true,
      },
    });
    expect(fixture.logger.log).toHaveBeenCalledWith(
      expect.stringContaining("crm.attributeDefinition.updated"),
      "UpdateWorkspaceObjectAttributeDefinitionUseCase"
    );
    expect(String(fixture.logger.log.mock.calls[0]?.[0])).not.toContain(
      "계약 금액"
    );
    expect(String(fixture.logger.log.mock.calls[0]?.[0])).toContain(
      "changedFields"
    );
    expect(result).toEqual({
      attributeDefinitionId: "00000000-0000-4000-8000-000000000601",
    });
  });

  // 기능 : 포함되지 않은 optional 필드는 update patch에서 제외합니다.
  it("omits missing optional fields from the update patch", async () => {
    const fixture = createFixture();

    await fixture.useCase.execute(
      makeCurrentUser(),
      "00000000-0000-4000-8000-000000000301",
      "00000000-0000-4000-8000-000000000501",
      "00000000-0000-4000-8000-000000000601",
      {
        hasTitle: false,
        hasDescription: false,
        hasIcon: true,
        icon: "",
        hasIsMultiselect: false,
      }
    );

    expect(fixture.repository.lastLookupInput).toBeNull();
    expect(fixture.repository.lastUpdateInput?.patch).toEqual({
      icon: null,
    });
  });

  // 기능 : 수정 필드가 하나도 없으면 DB 조회 전에 요청을 차단합니다.
  it("rejects empty patch requests before workspace lookup", async () => {
    const fixture = createFixture();

    await expect(
      fixture.useCase.execute(
        makeCurrentUser(),
        "00000000-0000-4000-8000-000000000301",
        "00000000-0000-4000-8000-000000000501",
        "00000000-0000-4000-8000-000000000601",
        {
          hasTitle: false,
          hasDescription: false,
          hasIcon: false,
          hasIsMultiselect: false,
        }
      )
    ).rejects.toMatchObject({
      code: "ATTRIBUTE_DEFINITION_UPDATE_FIELD_REQUIRED",
      details: { field: "body" },
    } satisfies Partial<AttributeDefinitionValidationError>);

    expect(fixture.workspaceAccessQuery.lastAccessInput).toBeNull();
    expect(fixture.repository.lastUpdateInput).toBeNull();
  });

  // 기능 : 공백 title은 DB 조회 전에 수정을 차단합니다.
  it("rejects blank titles before workspace lookup", async () => {
    const fixture = createFixture();

    await expect(
      fixture.useCase.execute(
        makeCurrentUser(),
        "00000000-0000-4000-8000-000000000301",
        "00000000-0000-4000-8000-000000000501",
        "00000000-0000-4000-8000-000000000601",
        {
          hasTitle: true,
          title: "   ",
          hasDescription: false,
          hasIcon: false,
          hasIsMultiselect: false,
        }
      )
    ).rejects.toMatchObject({
      code: "ATTRIBUTE_DEFINITION_TITLE_REQUIRED",
      details: { field: "title" },
    } satisfies Partial<AttributeDefinitionValidationError>);

    expect(fixture.workspaceAccessQuery.lastAccessInput).toBeNull();
    expect(fixture.repository.lastUpdateInput).toBeNull();
  });

  // 기능 : 너무 긴 title은 AttributeDefinition 수정을 차단합니다.
  it("rejects titles longer than 80 characters", async () => {
    const fixture = createFixture();

    await expect(
      fixture.useCase.execute(
        makeCurrentUser(),
        "00000000-0000-4000-8000-000000000301",
        "00000000-0000-4000-8000-000000000501",
        "00000000-0000-4000-8000-000000000601",
        {
          hasTitle: true,
          title: "가".repeat(81),
          hasDescription: false,
          hasIcon: false,
          hasIsMultiselect: false,
        }
      )
    ).rejects.toMatchObject({
      code: "ATTRIBUTE_DEFINITION_TITLE_TOO_LONG",
      details: { field: "title" },
    } satisfies Partial<AttributeDefinitionValidationError>);

    expect(fixture.workspaceAccessQuery.lastAccessInput).toBeNull();
    expect(fixture.repository.lastUpdateInput).toBeNull();
  });

  // 기능 : 현재 사용자가 Workspace 멤버가 아니면 수정을 차단합니다.
  it("throws not found when the current user is not a workspace member", async () => {
    const fixture = createFixture();
    fixture.workspaceAccessQuery.workspaceMemberAccess = null;

    await expect(
      fixture.useCase.execute(
        makeCurrentUser(),
        "00000000-0000-4000-8000-000000000302",
        "00000000-0000-4000-8000-000000000501",
        "00000000-0000-4000-8000-000000000601",
        {
          hasTitle: false,
          hasDescription: false,
          hasIcon: true,
          icon: "phone",
          hasIsMultiselect: false,
        }
      )
    ).rejects.toBeInstanceOf(AttributeDefinitionWorkspaceNotFoundError);

    expect(fixture.objectDefinitionAccessQuery.lastInput).toBeNull();
    expect(fixture.repository.lastUpdateInput).toBeNull();
  });

  // 기능 : 요청 ObjectDefinition이 Workspace에 속하지 않으면 수정을 차단합니다.
  it("throws not found when the object definition is outside the workspace", async () => {
    const fixture = createFixture();
    fixture.objectDefinitionAccessQuery.hasObjectDefinition = false;

    await expect(
      fixture.useCase.execute(
        makeCurrentUser(),
        "00000000-0000-4000-8000-000000000301",
        "00000000-0000-4000-8000-000000000599",
        "00000000-0000-4000-8000-000000000601",
        {
          hasTitle: false,
          hasDescription: false,
          hasIcon: true,
          icon: "phone",
          hasIsMultiselect: false,
        }
      )
    ).rejects.toBeInstanceOf(AttributeDefinitionObjectDefinitionNotFoundError);

    expect(fixture.repository.lastFindInput).toBeNull();
    expect(fixture.repository.lastUpdateInput).toBeNull();
  });

  // 기능 : 요청 AttributeDefinition이 Workspace/ObjectDefinition 경계 밖이면 수정을 차단합니다.
  it("throws not found when the attribute definition is outside the object definition", async () => {
    const fixture = createFixture();
    fixture.repository.attributeDefinitionForUpdate = null;

    await expect(
      fixture.useCase.execute(
        makeCurrentUser(),
        "00000000-0000-4000-8000-000000000301",
        "00000000-0000-4000-8000-000000000501",
        "00000000-0000-4000-8000-000000000699",
        {
          hasTitle: false,
          hasDescription: false,
          hasIcon: true,
          icon: "phone",
          hasIsMultiselect: false,
        }
      )
    ).rejects.toBeInstanceOf(AttributeDefinitionNotFoundError);

    expect(fixture.repository.lastUpdateInput).toBeNull();
  });

  // 기능 : 변경된 title이 같은 ObjectDefinition 안의 다른 apiSlug와 충돌하면 수정을 차단합니다.
  it("rejects duplicate api slugs after title changes", async () => {
    const fixture = createFixture();
    fixture.repository.hasSameApiSlug = true;

    await expect(
      fixture.useCase.execute(
        makeCurrentUser(),
        "00000000-0000-4000-8000-000000000301",
        "00000000-0000-4000-8000-000000000501",
        "00000000-0000-4000-8000-000000000601",
        {
          hasTitle: true,
          title: "회사번호",
          hasDescription: false,
          hasIcon: false,
          hasIsMultiselect: false,
        }
      )
    ).rejects.toBeInstanceOf(AttributeDefinitionApiSlugAlreadyExistsError);

    expect(fixture.repository.lastUpdateInput).toBeNull();
  });

  // 기능 : title이 현재 apiSlug와 같으면 자기 자신 중복 조회 없이 수정을 허용합니다.
  it("does not check duplicate api slug when title matches current api slug", async () => {
    const fixture = createFixture();
    fixture.repository.attributeDefinitionForUpdate = {
      id: "00000000-0000-4000-8000-000000000601",
      apiSlug: "회사번호",
    };

    await fixture.useCase.execute(
      makeCurrentUser(),
      "00000000-0000-4000-8000-000000000301",
      "00000000-0000-4000-8000-000000000501",
      "00000000-0000-4000-8000-000000000601",
      {
        hasTitle: true,
        title: " 회사번호 ",
        hasDescription: false,
        hasIcon: false,
        hasIsMultiselect: false,
      }
    );

    expect(fixture.repository.lastLookupInput).toBeNull();
    expect(fixture.repository.lastUpdateInput?.patch).toEqual({
      title: "회사번호",
      apiSlug: "회사번호",
    });
  });
});

// 기능 : UpdateWorkspaceObjectAttributeDefinitionUseCase 테스트 fixture를 생성합니다.
function createFixture() {
  const workspaceAccessQuery = new FakeWorkspaceAccessQuery();
  const objectDefinitionAccessQuery = new FakeObjectDefinitionAccessQuery();
  const repository = new FakeAttributeDefinitionCommandRepository();
  const logger = createLoggerFake();

  return {
    workspaceAccessQuery,
    objectDefinitionAccessQuery,
    repository,
    logger,
    useCase: new UpdateWorkspaceObjectAttributeDefinitionUseCase(
      workspaceAccessQuery,
      objectDefinitionAccessQuery,
      repository,
      logger
    ),
  };
}

// 역할 : FakeWorkspaceAccessQuery AttributeDefinition 수정 테스트용 Workspace 접근 확인 구현체입니다.
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

// 역할 : FakeObjectDefinitionAccessQuery AttributeDefinition 수정 테스트용 ObjectDefinition 접근 확인 구현체입니다.
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

// 역할 : FakeAttributeDefinitionCommandRepository 수정 유스케이스 테스트용 AttributeDefinition 저장소입니다.
class FakeAttributeDefinitionCommandRepository
  implements AttributeDefinitionCommandRepository
{
  hasSameApiSlug = false;
  attributeDefinitionForUpdate: AttributeDefinitionForUpdate | null = {
    id: "00000000-0000-4000-8000-000000000601",
    apiSlug: "금액",
  };
  lastLookupInput: AttributeDefinitionApiSlugLookupInput | null = null;
  lastFindInput: AttributeDefinitionWorkspaceObjectLookupInput | null = null;
  lastUpdateInput: UpdateAttributeDefinitionInput | null = null;

  // 기능 : 테스트용 AttributeDefinition apiSlug 중복 여부를 반환합니다.
  async hasAttributeDefinitionApiSlug(
    input: AttributeDefinitionApiSlugLookupInput
  ): Promise<boolean> {
    this.lastLookupInput = input;
    return this.hasSameApiSlug;
  }

  // 기능 : 현재 테스트에서 사용하지 않는 다음 정렬 순서 조회 호출을 차단합니다.
  async getNextAttributeDefinitionSortOrder(
    _input: AttributeDefinitionSortOrderLookupInput
  ): Promise<number> {
    void _input;
    throw new Error("Not implemented in fake repository");
  }

  // 기능 : 현재 테스트에서 사용하지 않는 기준 정렬 순서 조회 호출을 차단합니다.
  async findAttributeDefinitionSortOrder(
    _input: AttributeDefinitionSortOrderByIdLookupInput
  ): Promise<number | null> {
    void _input;
    throw new Error("Not implemented in fake repository");
  }

  // 기능 : 현재 테스트에서 사용하지 않는 정렬 순서 밀기 호출을 차단합니다.
  async incrementAttributeDefinitionSortOrdersFrom(
    _input: IncrementAttributeDefinitionSortOrdersFromInput
  ): Promise<number> {
    void _input;
    throw new Error("Not implemented in fake repository");
  }

  // 기능 : 현재 테스트에서 사용하지 않는 생성 호출을 차단합니다.
  async createAttributeDefinition(
    _input: CreateAttributeDefinitionInput
  ): Promise<CreateAttributeDefinitionResult> {
    void _input;
    throw new Error("Not implemented in fake repository");
  }

  // 기능 : 테스트용 수정 대상 AttributeDefinition 조회 결과를 반환합니다.
  async findAttributeDefinitionForUpdate(
    input: AttributeDefinitionWorkspaceObjectLookupInput
  ): Promise<AttributeDefinitionForUpdate | null> {
    this.lastFindInput = input;
    return this.attributeDefinitionForUpdate;
  }

  // 기능 : 테스트용 AttributeDefinition 수정 결과를 반환합니다.
  async updateAttributeDefinition(
    input: UpdateAttributeDefinitionInput
  ): Promise<UpdateAttributeDefinitionResult> {
    this.lastUpdateInput = input;

    return {
      id: input.attributeDefinitionId,
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
