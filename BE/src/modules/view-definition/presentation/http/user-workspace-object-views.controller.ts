import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  ListWorkspaceObjectViewsUseCase,
  type WorkspaceObjectViewsResponse,
} from "@/modules/view-definition/application/use-cases/list-workspace-object-views.use-case";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { CurrentUser } from "@/shared/presentation/decorators/current-user.decorator";
import { AuthGuard } from "@/shared/presentation/guards/auth.guard";
import { ListWorkspaceObjectViewsQueryDto } from "./dto/list-workspace-object-views-query.dto";

// 역할 : Object의 보기 드롭다운 조회를 전용 application 유스케이스에 위임합니다.
@UseGuards(AuthGuard)
@Controller(
  "api/users/me/workspaces/:workspaceId/object-definitions/:objectDefinitionId/view-definitions"
)
export class UserWorkspaceObjectViewsController {
  // 기능 : Object 소속 View 목록 유스케이스를 주입받습니다.
  constructor(
    private readonly listWorkspaceObjectViewsUseCase: ListWorkspaceObjectViewsUseCase
  ) {}

  // API : 사용자, Object 소속 View 선택 목록 조회
  @Get()
  listWorkspaceObjectViews(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("workspaceId", new ParseUUIDPipe()) workspaceId: string,
    @Param("objectDefinitionId", new ParseUUIDPipe()) objectDefinitionId: string,
    @Query() query: ListWorkspaceObjectViewsQueryDto
  ): Promise<WorkspaceObjectViewsResponse> {
    // 1. 검증된 대상과 선택 ID만 인증 사용자 문맥과 함께 전달한다.
    return this.listWorkspaceObjectViewsUseCase.execute(
      currentUser,
      workspaceId,
      objectDefinitionId,
      query.viewId
    );
  }
}
