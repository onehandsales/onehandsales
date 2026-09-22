import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  UseGuards,
} from "@nestjs/common";
import { ListSidebarObjectDefinitionsUseCase } from "@/modules/object-definition/application/use-cases/list-sidebar-object-definitions.use-case";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { CurrentUser } from "@/shared/presentation/decorators/current-user.decorator";
import { AuthGuard } from "@/shared/presentation/guards/auth.guard";

// 역할 : UserSidebarWorkspaceObjectsController 사이드바 ObjectDefinition HTTP 요청을 application 계층으로 위임합니다.
@UseGuards(AuthGuard)
@Controller("api/users/me/sidebar/workspaces/:workspaceId/objects")
export class UserSidebarWorkspaceObjectsController {
  // 기능 : 사이드바 ObjectDefinition 조회 유스케이스를 주입받습니다.
  constructor(
    private readonly listSidebarObjectDefinitionsUseCase: ListSidebarObjectDefinitionsUseCase
  ) {}

  // API : 사용자, 사이드바 Workspace ObjectDefinition 목록 조회
  @Get()
  listSidebarObjectDefinitions(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("workspaceId", new ParseUUIDPipe()) workspaceId: string
  ) {
    // 1. application 계층에 현재 사용자의 사이드바 ObjectDefinition 목록 조회를 위임한다.
    return this.listSidebarObjectDefinitionsUseCase.execute(
      currentUser,
      workspaceId
    );
  }
}
