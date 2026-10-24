import type { ListDefinitionSidebarQuery } from "@/modules/list-definition/application/ports/list-definition-sidebar-query.port";
import { ListDefinitionSidebarWorkspaceNotFoundError } from "@/modules/list-definition/domain/list-definition.errors";
import type { WorkspaceAccessQuery } from "@/modules/workspace/application/ports/workspace-access-query.port";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { ListSidebarListDefinitionsUseCase } from "./list-sidebar-list-definitions.use-case";

const WORKSPACE_ID = "00000000-0000-4000-8000-000000000301";
const CURRENT_USER: CurrentUserContext = {
  id: "00000000-0000-4000-8000-000000000101",
  sessionId: "00000000-0000-4000-8000-000000000201",
  email: "user@example.com",
  displayName: "User",
  platformRole: "USER",
  status: "ACTIVE",
  timeZone: "Asia/Seoul",
};

// 기능 : 접근 가능한 Workspace와 List 요약 목록을 준비합니다.
function createFixture() {
  const workspaceAccessQuery: jest.Mocked<WorkspaceAccessQuery> = {
    hasWorkspaceMembership: jest.fn().mockResolvedValue(true),
    getWorkspaceMemberAccess: jest.fn(),
  };
  const listDefinitionQuery: jest.Mocked<ListDefinitionSidebarQuery> = {
    listSidebarListDefinitions: jest.fn().mockResolvedValue([
      {
        id: "00000000-0000-4000-8000-000000000501",
        icon: "kanban",
        name: "영업 파이프라인",
      },
    ]),
  };

  return {
    workspaceAccessQuery,
    listDefinitionQuery,
    useCase: new ListSidebarListDefinitionsUseCase(
      workspaceAccessQuery,
      listDefinitionQuery
    ),
  };
}

// 기능 : 사이드바 업무 목록 조회의 Workspace 접근 경계를 검증합니다.
describe("ListSidebarListDefinitionsUseCase", () => {
  // 기능 : 인증 사용자와 요청 Workspace로 접근 확인 후 같은 Workspace의 목록을 조회합니다.
  it("returns lists from the authenticated user's accessible workspace", async () => {
    const fixture = createFixture();

    const result = await fixture.useCase.execute(CURRENT_USER, WORKSPACE_ID);

    expect(
      fixture.workspaceAccessQuery.hasWorkspaceMembership
    ).toHaveBeenCalledWith(CURRENT_USER.id, WORKSPACE_ID);
    expect(
      fixture.listDefinitionQuery.listSidebarListDefinitions
    ).toHaveBeenCalledWith(WORKSPACE_ID);
    expect(result).toEqual([
      {
        id: "00000000-0000-4000-8000-000000000501",
        icon: "kanban",
        name: "영업 파이프라인",
      },
    ]);
  });

  // 기능 : 접근할 수 없는 Workspace의 List 조회를 실행하기 전에 차단합니다.
  it("blocks list queries when the user has no workspace membership", async () => {
    const fixture = createFixture();
    fixture.workspaceAccessQuery.hasWorkspaceMembership.mockResolvedValue(false);

    await expect(
      fixture.useCase.execute(CURRENT_USER, WORKSPACE_ID)
    ).rejects.toBeInstanceOf(ListDefinitionSidebarWorkspaceNotFoundError);
    expect(
      fixture.listDefinitionQuery.listSidebarListDefinitions
    ).not.toHaveBeenCalled();
  });

  // 기능 : 접근 가능한 Workspace에 List가 없으면 생성 없이 빈 배열을 반환합니다.
  it("returns an empty array when the workspace has no lists", async () => {
    const fixture = createFixture();
    fixture.listDefinitionQuery.listSidebarListDefinitions.mockResolvedValue([]);

    await expect(
      fixture.useCase.execute(CURRENT_USER, WORKSPACE_ID)
    ).resolves.toEqual([]);
  });
});
