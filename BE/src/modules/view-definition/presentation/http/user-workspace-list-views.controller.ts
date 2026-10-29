import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  ListWorkspaceListViewsUseCase,
  type WorkspaceListViewsResponse,
} from "@/modules/view-definition/application/use-cases/list-workspace-list-views.use-case";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { CurrentUser } from "@/shared/presentation/decorators/current-user.decorator";
import { AuthGuard } from "@/shared/presentation/guards/auth.guard";
import { ListWorkspaceListViewsQueryDto } from "./dto/list-workspace-list-views-query.dto";

// 역할 : List의 보기 드롭다운 조회를 전용 application 유스케이스에 위임합니다.
@UseGuards(AuthGuard)
@Controller(
  "api/users/me/workspaces/:workspaceId/view-header/list-definitions/:listDefinitionId/view-definitions"
)
export class UserWorkspaceListViewsController {
  // 기능 : List 소속 View 목록 유스케이스를 주입받습니다.
  constructor(
    private readonly listWorkspaceListViewsUseCase: ListWorkspaceListViewsUseCase
  ) {}

  // API : 사용자, List 소속 View 선택 목록 조회
  @Get()
  listWorkspaceListViews(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("workspaceId", new ParseUUIDPipe()) workspaceId: string,
    @Param("listDefinitionId", new ParseUUIDPipe()) listDefinitionId: string,
    @Query() query: ListWorkspaceListViewsQueryDto
  ): Promise<WorkspaceListViewsResponse> {
    // 1. 검증된 대상과 선택 ID만 인증 사용자 문맥과 함께 전달한다.
    return this.listWorkspaceListViewsUseCase.execute(
      currentUser,
      workspaceId,
      listDefinitionId,
      query.viewDefinitionId
    );
  }
}
