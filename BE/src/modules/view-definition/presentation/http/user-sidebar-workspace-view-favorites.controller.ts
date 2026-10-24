import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  UseGuards,
} from "@nestjs/common";
import { ListSidebarViewFavoritesUseCase } from "@/modules/view-definition/application/use-cases/list-sidebar-view-favorites.use-case";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { CurrentUser } from "@/shared/presentation/decorators/current-user.decorator";
import { AuthGuard } from "@/shared/presentation/guards/auth.guard";

// 역할 : 사이드바 개인 즐겨찾기 HTTP 조회를 application 계층으로 위임합니다.
@UseGuards(AuthGuard)
@Controller("api/users/me/sidebar/workspaces/:workspaceId/view-favorites")
export class UserSidebarWorkspaceViewFavoritesController {
  // 기능 : 현재 사용자의 즐겨찾기 조회 유스케이스를 주입받습니다.
  constructor(
    private readonly listSidebarViewFavoritesUseCase: ListSidebarViewFavoritesUseCase
  ) {}

  // API : 사용자, 현재 Workspace의 개인 View 즐겨찾기 목록 조회
  @Get()
  listSidebarViewFavorites(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("workspaceId", new ParseUUIDPipe()) workspaceId: string
  ) {
    // 1. 인증 사용자와 검증한 Workspace ID만 전달한다.
    return this.listSidebarViewFavoritesUseCase.execute(currentUser, workspaceId);
  }
}
