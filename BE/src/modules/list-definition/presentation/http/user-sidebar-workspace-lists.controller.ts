import {
  Body, Patch, Query, Req,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  UseGuards,
} from "@nestjs/common";
import { EmptyRequestPipe } from "@/shared/presentation/pipes/empty-request.pipe";
import { StrictOrderBodyPipe } from "@/shared/presentation/pipes/strict-order-body.pipe";
import { ReorderSidebarListDefinitionsDto } from "./dto/reorder-sidebar-list-definitions.dto";
import { ReorderSidebarListDefinitionsUseCase } from "../../application/use-cases/reorder-sidebar-list-definitions.use-case";
import { ListSidebarListDefinitionsUseCase } from "@/modules/list-definition/application/use-cases/list-sidebar-list-definitions.use-case";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { CurrentUser } from "@/shared/presentation/decorators/current-user.decorator";
import { AuthGuard } from "@/shared/presentation/guards/auth.guard";

// 역할 : 사이드바 업무 목록 HTTP 요청을 application 계층으로 위임합니다.
@UseGuards(AuthGuard)
@Controller("api/users/me/sidebar/workspaces/:workspaceId/lists")
export class UserSidebarWorkspaceListsController {
  // API : 사용자, 현재 Workspace의 사이드바 lists 전체 순서를 변경합니다.
  @Patch("order")
  reorderItems(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("workspaceId", new ParseUUIDPipe()) workspaceId: string,
    @Body(new StrictOrderBodyPipe(ReorderSidebarListDefinitionsDto)) body: unknown,
    @Query(new EmptyRequestPipe()) _query: unknown,
    @Req() request: { requestId?: string },
  ) {
    // 1. 인증된 사용자와 검증한 요청만 application use case로 전달한다.
    return this.reorder.execute(currentUser, workspaceId, (body as ReorderSidebarListDefinitionsDto).orderedIds, request.requestId ?? null);
  }

  // 기능 : Workspace 업무 목록 조회 유스케이스를 주입받습니다.
  constructor(
    private readonly listSidebarListDefinitionsUseCase: ListSidebarListDefinitionsUseCase,
    private readonly reorder: ReorderSidebarListDefinitionsUseCase
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
