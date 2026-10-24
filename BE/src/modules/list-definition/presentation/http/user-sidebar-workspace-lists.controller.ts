import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  UseGuards,
} from "@nestjs/common";
import { ListSidebarListDefinitionsUseCase } from "@/modules/list-definition/application/use-cases/list-sidebar-list-definitions.use-case";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { CurrentUser } from "@/shared/presentation/decorators/current-user.decorator";
import { AuthGuard } from "@/shared/presentation/guards/auth.guard";

// 역할 : 사이드바 업무 목록 HTTP 요청을 application 계층으로 위임합니다.
@UseGuards(AuthGuard)
@Controller("api/users/me/sidebar/workspaces/:workspaceId/lists")
export class UserSidebarWorkspaceListsController {
  // 기능 : Workspace 업무 목록 조회 유스케이스를 주입받습니다.
  constructor(
    private readonly listSidebarListDefinitionsUseCase: ListSidebarListDefinitionsUseCase
  ) {}

  // API : 사용자, 사이드바 Workspace 업무 목록 조회
  @Get()
  listSidebarListDefinitions(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("workspaceId", new ParseUUIDPipe()) workspaceId: string
  ) {
    // 1. 인증 사용자와 검증한 Workspace ID를 application 계층에 전달한다.
    return this.listSidebarListDefinitionsUseCase.execute(
      currentUser,
      workspaceId
    );
  }
}
