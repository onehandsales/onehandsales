import type {
  WorkspaceSidebarQuery,
  WorkspaceSidebarWorkspaceListItem,
  WorkspaceSidebarWorkspaceSummary,
} from "@/modules/workspace/application/ports/workspace-sidebar-query.port";
import { WorkspaceSidebarWorkspaceNotFoundError } from "@/modules/workspace/domain/workspace.errors";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { GetMyDefaultSidebarWorkspaceUseCase } from "./get-my-default-sidebar-workspace.use-case";

// 기능 : GetMyDefaultSidebarWorkspaceUseCase 동작을 검증합니다.
describe("GetMyDefaultSidebarWorkspaceUseCase", () => {
  // 기능 : 현재 사용자가 멤버로 속한 최신 Workspace 요약을 기본값으로 반환합니다.
  it("returns the default sidebar workspace for the current user", async () => {
    const fixture = createFixture();

    const result = await fixture.useCase.execute(makeCurrentUser());

    expect(fixture.query.lastDefaultUserId).toBe(
      "00000000-0000-4000-8000-000000000101"
    );
    expect(result).toEqual({
      id: "00000000-0000-4000-8000-000000000301",
      name: "Recent Workspace",
      kind: "ORGANIZATION",
    });
  });

  // 기능 : 현재 사용자가 멤버로 속한 Workspace가 없으면 not found로 차단합니다.
  it("throws not found when the current user has no workspace membership", async () => {
    const fixture = createFixture();
    fixture.query.workspace = null;

    await expect(fixture.useCase.execute(makeCurrentUser())).rejects.toBeInstanceOf(
      WorkspaceSidebarWorkspaceNotFoundError
    );
  });
});

// 기능 : GetMyDefaultSidebarWorkspaceUseCase 테스트 fixture를 생성합니다.
function createFixture() {
  const query = new FakeWorkspaceSidebarQuery();

  return {
    query,
    useCase: new GetMyDefaultSidebarWorkspaceUseCase(query),
  };
}

// 역할 : FakeWorkspaceSidebarQuery 기본 Workspace 조회 테스트용 WorkspaceSidebarQuery 구현체입니다.
class FakeWorkspaceSidebarQuery implements WorkspaceSidebarQuery {
  lastDefaultUserId: string | null = null;
  workspace: WorkspaceSidebarWorkspaceSummary | null = {
    id: "00000000-0000-4000-8000-000000000301",
    name: "Recent Workspace",
    kind: "ORGANIZATION",
  };

  // 기능 : 현재 테스트에서 사용하지 않는 목록 조회를 차단합니다.
  async listMySidebarWorkspaces(): Promise<WorkspaceSidebarWorkspaceListItem[]> {
    throw new Error("Not implemented in fake query");
  }

  // 기능 : 테스트용 기본 Workspace 요약 또는 null을 반환합니다.
  async getMyDefaultSidebarWorkspace(
    userId: string
  ): Promise<WorkspaceSidebarWorkspaceSummary | null> {
    this.lastDefaultUserId = userId;
    return this.workspace;
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
