import type {
  WorkspaceSidebarQuery,
  WorkspaceSidebarWorkspaceSummary,
} from "@/modules/workspace/application/ports/workspace-sidebar-query.port";
import { WorkspaceSidebarWorkspaceNotFoundError } from "@/modules/workspace/domain/workspace.errors";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { GetMySidebarWorkspaceUseCase } from "./get-my-sidebar-workspace.use-case";

// 기능 : GetMySidebarWorkspaceUseCase 동작을 검증합니다.
describe("GetMySidebarWorkspaceUseCase", () => {
  // 기능 : 현재 사용자가 멤버로 속한 Workspace 요약을 반환합니다.
  it("returns a sidebar workspace for the current user", async () => {
    const fixture = createFixture();

    const result = await fixture.useCase.execute(
      makeCurrentUser(),
      "00000000-0000-4000-8000-000000000301"
    );

    expect(fixture.query.lastGetInput).toEqual({
      userId: "00000000-0000-4000-8000-000000000101",
      workspaceId: "00000000-0000-4000-8000-000000000301",
    });
    expect(result).toEqual({
      id: "00000000-0000-4000-8000-000000000301",
      name: "User Workspace",
      kind: "PERSONAL",
    });
  });

  // 기능 : 현재 사용자가 멤버가 아닌 Workspace 단건 조회를 not found로 차단합니다.
  it("throws not found when the current user is not a workspace member", async () => {
    const fixture = createFixture();
    fixture.query.workspace = null;

    await expect(
      fixture.useCase.execute(
        makeCurrentUser(),
        "00000000-0000-4000-8000-000000000302"
      )
    ).rejects.toBeInstanceOf(WorkspaceSidebarWorkspaceNotFoundError);
  });
});

// 기능 : GetMySidebarWorkspaceUseCase 테스트 fixture를 생성합니다.
function createFixture() {
  const query = new FakeWorkspaceSidebarQuery();

  return {
    query,
    useCase: new GetMySidebarWorkspaceUseCase(query),
  };
}

// 역할 : FakeWorkspaceSidebarQuery 단건 조회 테스트용 WorkspaceSidebarQuery 구현체입니다.
class FakeWorkspaceSidebarQuery implements WorkspaceSidebarQuery {
  lastGetInput: { readonly userId: string; readonly workspaceId: string } | null =
    null;
  workspace: WorkspaceSidebarWorkspaceSummary | null = {
    id: "00000000-0000-4000-8000-000000000301",
    name: "User Workspace",
    kind: "PERSONAL",
  };

  // 기능 : 현재 테스트에서 사용하지 않는 목록 조회를 차단합니다.
  async listMySidebarWorkspaces(): Promise<WorkspaceSidebarWorkspaceSummary[]> {
    throw new Error("Not implemented in fake query");
  }

  // 기능 : 테스트용 Workspace 요약 또는 null을 반환합니다.
  async getMySidebarWorkspace(
    userId: string,
    workspaceId: string
  ): Promise<WorkspaceSidebarWorkspaceSummary | null> {
    this.lastGetInput = { userId, workspaceId };
    return this.workspace;
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
