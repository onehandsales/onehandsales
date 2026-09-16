import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  UseGuards,
} from "@nestjs/common";
import { GetMySidebarWorkspaceUseCase } from "@/modules/workspace/application/use-cases/get-my-sidebar-workspace.use-case";
import { ListMySidebarWorkspacesUseCase } from "@/modules/workspace/application/use-cases/list-my-sidebar-workspaces.use-case";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { CurrentUser } from "@/shared/presentation/decorators/current-user.decorator";
import { AuthGuard } from "@/shared/presentation/guards/auth.guard";

// 역할 : UserSidebarWorkspacesController 사이드바 Workspace HTTP 요청을 application 계층으로 위임합니다.
@UseGuards(AuthGuard)
@Controller("api/users/me/sidebar/workspaces")
export class UserSidebarWorkspacesController {
  // 기능 : 사이드바 Workspace 조회 유스케이스를 주입받습니다.
  constructor(
    private readonly listMySidebarWorkspacesUseCase: ListMySidebarWorkspacesUseCase,
    private readonly getMySidebarWorkspaceUseCase: GetMySidebarWorkspaceUseCase
  ) {}

  // API : 사용자, 사이드바 Workspace 목록 조회
  @Get()
  listMySidebarWorkspaces(@CurrentUser() currentUser: CurrentUserContext) {
    // 1. application 계층에 현재 사용자의 사이드바 Workspace 목록 조회를 위임한다.
    return this.listMySidebarWorkspacesUseCase.execute(currentUser);
  }

  // API : 사용자, 사이드바 Workspace 단건 조회
  @Get(":workspaceId")
  getMySidebarWorkspace(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("workspaceId", new ParseUUIDPipe())
    workspaceId: string
  ) {
    // 1. application 계층에 현재 사용자의 특정 사이드바 Workspace 조회를 위임한다.
    return this.getMySidebarWorkspaceUseCase.execute(currentUser, workspaceId);
  }
}
