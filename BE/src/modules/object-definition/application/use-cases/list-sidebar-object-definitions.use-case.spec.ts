import type {
  ObjectDefinitionSidebarQuery,
  SidebarObjectDefinitionListItem,
} from "@/modules/object-definition/application/ports/object-definition-sidebar-query.port";
import { ObjectDefinitionSidebarWorkspaceNotFoundError } from "@/modules/object-definition/domain/object-definition.errors";
import type { WorkspaceAccessQuery } from "@/modules/workspace/application/ports/workspace-access-query.port";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { ListSidebarObjectDefinitionsUseCase } from "./list-sidebar-object-definitions.use-case";

// 기능 : ListSidebarObjectDefinitionsUseCase 동작을 검증합니다.
describe("ListSidebarObjectDefinitionsUseCase", () => {
  // 기능 : 현재 사용자가 멤버로 속한 Workspace의 ObjectDefinition 목록을 반환합니다.
  it("returns sidebar object definitions for an accessible workspace", async () => {
    const fixture = createFixture();

    const result = await fixture.useCase.execute(
      makeCurrentUser(),
      "00000000-0000-4000-8000-000000000301"
    );

    expect(fixture.workspaceAccessQuery.lastInput).toEqual({
      userId: "00000000-0000-4000-8000-000000000101",
      workspaceId: "00000000-0000-4000-8000-000000000301",
    });
    expect(fixture.objectDefinitionQuery.lastWorkspaceId).toBe(
      "00000000-0000-4000-8000-000000000301"
    );
    expect(result).toEqual([
      {
        id: "00000000-0000-4000-8000-000000000501",
        icon: "users",
        singularName: "고객",
        pluralName: "고객",
      },
    ]);
  });

  // 기능 : 현재 사용자가 Workspace 멤버가 아니면 ObjectDefinition 조회를 차단합니다.
  it("throws not found when the current user is not a workspace member", async () => {
    const fixture = createFixture();
    fixture.workspaceAccessQuery.hasMembership = false;

    await expect(
      fixture.useCase.execute(
        makeCurrentUser(),
        "00000000-0000-4000-8000-000000000302"
      )
    ).rejects.toBeInstanceOf(ObjectDefinitionSidebarWorkspaceNotFoundError);

    expect(fixture.objectDefinitionQuery.lastWorkspaceId).toBeNull();
  });
});

// 기능 : ListSidebarObjectDefinitionsUseCase 테스트 fixture를 생성합니다.
function createFixture() {
  const workspaceAccessQuery = new FakeWorkspaceAccessQuery();
  const objectDefinitionQuery = new FakeObjectDefinitionSidebarQuery();

  return {
    workspaceAccessQuery,
    objectDefinitionQuery,
    useCase: new ListSidebarObjectDefinitionsUseCase(
      workspaceAccessQuery,
      objectDefinitionQuery
    ),
  };
}

// 역할 : FakeWorkspaceAccessQuery ObjectDefinition 조회 테스트용 Workspace 접근 확인 구현체입니다.
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
}

// 역할 : FakeObjectDefinitionSidebarQuery ObjectDefinition 목록 조회 테스트용 구현체입니다.
class FakeObjectDefinitionSidebarQuery implements ObjectDefinitionSidebarQuery {
  lastWorkspaceId: string | null = null;

  // 기능 : 테스트용 ObjectDefinition 요약 목록을 반환합니다.
  async listSidebarObjectDefinitions(
    workspaceId: string
  ): Promise<SidebarObjectDefinitionListItem[]> {
    this.lastWorkspaceId = workspaceId;
    return [
      {
        id: "00000000-0000-4000-8000-000000000501",
        icon: "users",
        singularName: "고객",
        pluralName: "고객",
      },
    ];
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
