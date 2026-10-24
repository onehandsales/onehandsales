import { Inject, Injectable } from "@nestjs/common";
import {
  VIEW_FAVORITE_SIDEBAR_QUERY,
  type SidebarViewFavoriteListItem,
  type ViewFavoriteSidebarQuery,
} from "@/modules/view-definition/application/ports/view-favorite-sidebar-query.port";
import { ViewFavoriteSidebarWorkspaceNotFoundError } from "@/modules/view-definition/domain/view-definition.errors";
import {
  WORKSPACE_ACCESS_QUERY,
  type WorkspaceAccessQuery,
} from "@/modules/workspace/application/ports/workspace-access-query.port";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";

// 역할 : 현재 사용자 멤버십으로 범위를 제한한 사이드바 즐겨찾기를 조회합니다.
@Injectable()
export class ListSidebarViewFavoritesUseCase {
  // 기능 : Workspace 공개 접근 확인과 즐겨찾기 조회 계약을 주입받습니다.
  constructor(
    @Inject(WORKSPACE_ACCESS_QUERY)
    private readonly workspaceAccessQuery: WorkspaceAccessQuery,
    @Inject(VIEW_FAVORITE_SIDEBAR_QUERY)
    private readonly viewFavoriteSidebarQuery: ViewFavoriteSidebarQuery
  ) {}

  // 기능 : 요청이 아닌 로그인 사용자로 멤버 ID를 구해 개인 즐겨찾기만 반환합니다.
  async execute(
    currentUser: CurrentUserContext,
    workspaceId: string
  ): Promise<SidebarViewFavoriteListItem[]> {
    // 1. 현재 사용자가 요청 Workspace에 속하는지 공개 Port로 확인한다.
    const memberAccess = await this.workspaceAccessQuery.getWorkspaceMemberAccess(
      currentUser.id,
      workspaceId
    );

    // 2. 멤버십이 없으면 Workspace 존재 여부를 노출하지 않고 조회를 차단한다.
    if (!memberAccess) {
      throw new ViewFavoriteSidebarWorkspaceNotFoundError();
    }

    // 3. Actor 존재를 요구하지 않고 서버가 확인한 멤버 ID로 개인 범위를 제한한다.
    return this.viewFavoriteSidebarQuery.listSidebarViewFavorites({
      workspaceId,
      workspaceMemberId: memberAccess.workspaceMemberId,
    });
  }
}
