import type {
  AttributeDefinitionDetailQuery,
  WorkspaceObjectAttributeDefinitionDetail,
  WorkspaceObjectAttributeDefinitionDetailInput,
} from "@/modules/attribute-definition/application/ports/attribute-definition-detail-query.port";
import {
  AttributeDefinitionNotFoundError,
  AttributeDefinitionObjectDefinitionNotFoundError,
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
import { GetWorkspaceObjectAttributeDefinitionUseCase } from "./get-workspace-object-attribute-definition.use-case";

// 기능 : GetWorkspaceObjectAttributeDefinitionUseCase 동작을 검증합니다.
describe("GetWorkspaceObjectAttributeDefinitionUseCase", () => {
  // 기능 : 현재 사용자가 접근 가능한 Workspace ObjectDefinition의 AttributeDefinition 단건 정보를 반환합니다.
  it("returns an attribute definition for an accessible workspace object", async () => {
    const fixture = createFixture();

    const result = await fixture.useCase.execute(
      makeCurrentUser(),
      "00000000-0000-4000-8000-000000000301",
      "00000000-0000-4000-8000-000000000501",
      "00000000-0000-4000-8000-000000000603"
    );

    expect(fixture.workspaceAccessQuery.lastInput).toEqual({
      userId: "00000000-0000-4000-8000-000000000101",
      workspaceId: "00000000-0000-4000-8000-000000000301",
    });
    expect(fixture.objectDefinitionAccessQuery.lastInput).toEqual({
      workspaceId: "00000000-0000-4000-8000-000000000301",
      objectDefinitionId: "00000000-0000-4000-8000-000000000501",
    });
    expect(fixture.attributeDefinitionDetailQuery.lastInput).toEqual({
      workspaceId: "00000000-0000-4000-8000-000000000301",
      objectDefinitionId: "00000000-0000-4000-8000-000000000501",
      attributeDefinitionId: "00000000-0000-4000-8000-000000000603",
    });
    expect(result).toEqual({
      id: "00000000-0000-4000-8000-000000000603",
      title: "금액",
      type: "Currency",
      isMultiselect: false,
      description: "계약 금액을 저장해요.",
      icon: "circle-dollar-sign",
      config: {
        currency: {
          defaultCurrencyCode: "KRW",
          displayType: "symbol",
        },
      },
      sortOrder: 2,
    });
  });

  // 기능 : 현재 사용자가 Workspace 멤버가 아니면 AttributeDefinition 단건 조회를 차단합니다.
  it("throws not found when the current user is not a workspace member", async () => {
    const fixture = createFixture();
    fixture.workspaceAccessQuery.hasMembership = false;

    await expect(
      fixture.useCase.execute(
        makeCurrentUser(),
        "00000000-0000-4000-8000-000000000302",
        "00000000-0000-4000-8000-000000000501",
        "00000000-0000-4000-8000-000000000603"
      )
    ).rejects.toBeInstanceOf(AttributeDefinitionWorkspaceNotFoundError);

    expect(fixture.objectDefinitionAccessQuery.lastInput).toBeNull();
    expect(fixture.attributeDefinitionDetailQuery.lastInput).toBeNull();
  });

  // 기능 : 요청 ObjectDefinition이 Workspace에 속하지 않으면 AttributeDefinition 단건 조회를 차단합니다.
  it("throws not found when the object definition is outside the workspace", async () => {
    const fixture = createFixture();
    fixture.objectDefinitionAccessQuery.hasObjectDefinition = false;

    await expect(
      fixture.useCase.execute(
        makeCurrentUser(),
        "00000000-0000-4000-8000-000000000301",
        "00000000-0000-4000-8000-000000000599",
        "00000000-0000-4000-8000-000000000603"
      )
    ).rejects.toBeInstanceOf(AttributeDefinitionObjectDefinitionNotFoundError);

    expect(fixture.attributeDefinitionDetailQuery.lastInput).toBeNull();
  });

  // 기능 : 요청 AttributeDefinition이 Workspace/ObjectDefinition에 속하지 않으면 단건 조회를 차단합니다.
  it("throws not found when the attribute definition is outside the object", async () => {
    const fixture = createFixture();
    fixture.attributeDefinitionDetailQuery.item = null;

    await expect(
      fixture.useCase.execute(
        makeCurrentUser(),
        "00000000-0000-4000-8000-000000000301",
        "00000000-0000-4000-8000-000000000501",
        "00000000-0000-4000-8000-000000000699"
      )
    ).rejects.toBeInstanceOf(AttributeDefinitionNotFoundError);
  });
});

// 기능 : GetWorkspaceObjectAttributeDefinitionUseCase 테스트 fixture를 생성합니다.
function createFixture() {
  const workspaceAccessQuery = new FakeWorkspaceAccessQuery();
  const objectDefinitionAccessQuery = new FakeObjectDefinitionAccessQuery();
  const attributeDefinitionDetailQuery = new FakeAttributeDefinitionDetailQuery();

  return {
    workspaceAccessQuery,
    objectDefinitionAccessQuery,
    attributeDefinitionDetailQuery,
    useCase: new GetWorkspaceObjectAttributeDefinitionUseCase(
      workspaceAccessQuery,
      objectDefinitionAccessQuery,
      attributeDefinitionDetailQuery
    ),
  };
}

// 역할 : FakeWorkspaceAccessQuery AttributeDefinition 단건 조회 테스트용 Workspace 접근 확인 구현체입니다.
class FakeWorkspaceAccessQuery implements WorkspaceAccessQuery {
  hasMembership = true;
  lastInput: { readonly userId: string; readonly workspaceId: string } | null =
    null;

  // 기능 : 테스트용 Workspace membership 존재 여부를 반환합니다.
  async hasWorkspaceMembership(
    userId: string,
    workspaceId: string
  ): Promise<boolean> {
    this.lastInput = { userId, workspaceId };
    return this.hasMembership;
  }

  // 기능 : 현재 테스트에서 사용하지 않는 생성 감사 Actor 조회 호출을 차단합니다.
  async getWorkspaceMemberAccess(): Promise<WorkspaceMemberAccess | null> {
    throw new Error("Not implemented in fake query");
  }
}

// 역할 : FakeObjectDefinitionAccessQuery AttributeDefinition 단건 조회 테스트용 ObjectDefinition 접근 확인 구현체입니다.
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

// 역할 : FakeAttributeDefinitionDetailQuery AttributeDefinition 단건 조회 테스트용 구현체입니다.
class FakeAttributeDefinitionDetailQuery implements AttributeDefinitionDetailQuery {
  lastInput: WorkspaceObjectAttributeDefinitionDetailInput | null = null;
  item: WorkspaceObjectAttributeDefinitionDetail | null = {
    id: "00000000-0000-4000-8000-000000000603",
    title: "금액",
    type: "Currency",
    isMultiselect: false,
    description: "계약 금액을 저장해요.",
    icon: "circle-dollar-sign",
    config: {
      currency: {
        defaultCurrencyCode: "KRW",
        displayType: "symbol",
      },
    },
    sortOrder: 2,
  };

  // 기능 : 테스트용 AttributeDefinition 단건 정보를 반환합니다.
  async findWorkspaceObjectAttributeDefinition(
    input: WorkspaceObjectAttributeDefinitionDetailInput
  ): Promise<WorkspaceObjectAttributeDefinitionDetail | null> {
    this.lastInput = input;
    return this.item;
  }
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
