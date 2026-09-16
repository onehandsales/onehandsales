import type {
  WorkspaceSidebarQuery,
  WorkspaceSidebarWorkspaceSummary,
} from "@/modules/workspace/application/ports/workspace-sidebar-query.port";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { ListMySidebarWorkspacesUseCase } from "./list-my-sidebar-workspaces.use-case";

// 기능 : ListMySidebarWorkspacesUseCase 동작을 검증합니다.
describe("ListMySidebarWorkspacesUseCase", () => {
  // 기능 : 현재 사용자가 멤버로 속한 Workspace 요약 목록을 반환합니다.
  it("returns sidebar workspaces for the current user", async () => {
    const fixture = createFixture();

    const result = await fixture.useCase.execute(makeCurrentUser());

    expect(fixture.query.lastListUserId).toBe(
      "00000000-0000-4000-8000-000000000101"
    );
    expect(result).toEqual([
      {
        id: "00000000-0000-4000-8000-000000000301",
        name: "User Workspace",
        kind: "PERSONAL",
      },
    ]);
  });
});

// 기능 : ListMySidebarWorkspacesUseCase 테스트 fixture를 생성합니다.
function createFixture() {
  const query = new FakeWorkspaceSidebarQuery();

  return {
    query,
    useCase: new ListMySidebarWorkspacesUseCase(query),
  };
}

// 역할 : FakeWorkspaceSidebarQuery 목록 조회 테스트용 WorkspaceSidebarQuery 구현체입니다.
class FakeWorkspaceSidebarQuery implements WorkspaceSidebarQuery {
  lastListUserId: string | null = null;

  // 기능 : 테스트용 Workspace 요약 목록을 반환합니다.
  async listMySidebarWorkspaces(
    userId: string
  ): Promise<WorkspaceSidebarWorkspaceSummary[]> {
    this.lastListUserId = userId;
    return [
      {
        id: "00000000-0000-4000-8000-000000000301",
        name: "User Workspace",
        kind: "PERSONAL",
      },
    ];
  }

  // 기능 : 현재 테스트에서 사용하지 않는 단건 조회를 차단합니다.
  async getMySidebarWorkspace(): Promise<WorkspaceSidebarWorkspaceSummary | null> {
    throw new Error("Not implemented in fake query");
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
