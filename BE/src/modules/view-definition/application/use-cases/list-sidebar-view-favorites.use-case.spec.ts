import type { ViewFavoriteSidebarQuery } from "@/modules/view-definition/application/ports/view-favorite-sidebar-query.port";
import { ViewFavoriteSidebarWorkspaceNotFoundError } from "@/modules/view-definition/domain/view-definition.errors";
import type { WorkspaceAccessQuery } from "@/modules/workspace/application/ports/workspace-access-query.port";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { ListSidebarViewFavoritesUseCase } from "./list-sidebar-view-favorites.use-case";

const WORKSPACE_ID = "00000000-0000-4000-8000-000000000301";
const MEMBER_ID = "00000000-0000-4000-8000-000000000401";
const CURRENT_USER: CurrentUserContext = {
  id: "00000000-0000-4000-8000-000000000101",
  sessionId: "00000000-0000-4000-8000-000000000201",
  email: "user@example.com",
  displayName: "User",
  platformRole: "USER",
  status: "ACTIVE",
  timeZone: "Asia/Seoul",
};

// 기능 : 감사 Actor가 없어도 조회할 수 있는 현재 멤버와 즐겨찾기 응답을 준비합니다.
function createFixture() {
  const workspaceAccess: jest.Mocked<WorkspaceAccessQuery> = {
    hasWorkspaceMembership: jest.fn(),
    getWorkspaceMemberAccess: jest.fn().mockResolvedValue({
      workspaceMemberId: MEMBER_ID,
      actorId: null,
    }),
  };
  const favorites: jest.Mocked<ViewFavoriteSidebarQuery> = {
    listSidebarViewFavorites: jest.fn().mockResolvedValue([
      {
        id: "00000000-0000-4000-8000-000000000701",
        viewDefinitionId: "00000000-0000-4000-8000-000000000801",
        name: "서울 회사",
        icon: null,
      },
    ]),
  };

  return {
    workspaceAccess,
    favorites,
    useCase: new ListSidebarViewFavoritesUseCase(workspaceAccess, favorites),
  };
}

// 기능 : 개인 즐겨찾기의 멤버십 경계와 Actor 불필요 조건을 검증합니다.
describe("ListSidebarViewFavoritesUseCase", () => {
  // 기능 : 인증 사용자로 확인한 멤버 ID만 조회 Port에 전달합니다.
  it("uses the authenticated user's workspace member even without an actor", async () => {
    const fixture = createFixture();
    const result = await fixture.useCase.execute(CURRENT_USER, WORKSPACE_ID);

    expect(fixture.workspaceAccess.getWorkspaceMemberAccess).toHaveBeenCalledWith(
      CURRENT_USER.id,
      WORKSPACE_ID
    );
    expect(fixture.favorites.listSidebarViewFavorites).toHaveBeenCalledWith({
      workspaceId: WORKSPACE_ID,
      workspaceMemberId: MEMBER_ID,
    });
    expect(result).toEqual([
      {
        id: "00000000-0000-4000-8000-000000000701",
        viewDefinitionId: "00000000-0000-4000-8000-000000000801",
        name: "서울 회사",
        icon: null,
      },
    ]);
  });

  // 기능 : 비멤버이거나 Workspace가 없으면 개인 목록 조회 전에 차단합니다.
  it("blocks favorite queries when workspace membership is absent", async () => {
    const fixture = createFixture();
    fixture.workspaceAccess.getWorkspaceMemberAccess.mockResolvedValue(null);

    await expect(
      fixture.useCase.execute(CURRENT_USER, WORKSPACE_ID)
    ).rejects.toBeInstanceOf(ViewFavoriteSidebarWorkspaceNotFoundError);
    expect(fixture.favorites.listSidebarViewFavorites).not.toHaveBeenCalled();
  });

  // 기능 : 현재 멤버의 즐겨찾기가 없으면 빈 배열을 반환합니다.
  it("returns an empty array for a member with no favorites", async () => {
    const fixture = createFixture();
    fixture.favorites.listSidebarViewFavorites.mockResolvedValue([]);

    await expect(
      fixture.useCase.execute(CURRENT_USER, WORKSPACE_ID)
    ).resolves.toEqual([]);
  });
});
