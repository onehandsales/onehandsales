import { Body, Controller, Get, Param, ParseUUIDPipe, Query, Req, UseGuards } from "@nestjs/common";
import { GetWorkspaceViewFiltersUseCase } from "@/modules/view-definition/application/use-cases/get-workspace-view-filters.use-case";
import { GetWorkspaceViewSortsUseCase } from "@/modules/view-definition/application/use-cases/get-workspace-view-sorts.use-case";
import { GetWorkspaceViewSettingsUseCase } from "@/modules/view-definition/application/use-cases/get-workspace-view-settings.use-case";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { CurrentUser } from "@/shared/presentation/decorators/current-user.decorator";
import { AuthGuard } from "@/shared/presentation/guards/auth.guard";
import type { RequestWithRequestId } from "@/shared/presentation/middleware/request-id.middleware";
import { EmptyRequestPipe } from "@/shared/presentation/pipes/empty-request.pipe";

// 역할 : 현재 View의 세 설정 메뉴 HTTP 요청을 해당 유스케이스에 연결합니다.
@UseGuards(AuthGuard)
@Controller("api/users/me/workspaces/:workspaceId/view-header/view-definitions/:viewDefinitionId")
export class UserWorkspaceViewHeaderMenusController {
  // 기능 : 세 메뉴별 조회 유스케이스를 주입받습니다.
  constructor(
    private readonly filters: GetWorkspaceViewFiltersUseCase,
    private readonly sorts: GetWorkspaceViewSortsUseCase,
    private readonly settings: GetWorkspaceViewSettingsUseCase,
  ) {}

  // API : 사용자, 선택 View의 Filters 저장 메뉴 조회
  @Get("filters")
  getFilters(
    @Query(new EmptyRequestPipe()) _query: unknown,
    @Body(new EmptyRequestPipe()) _body: unknown,
    @CurrentUser() user: CurrentUserContext,
    @Req() request: RequestWithRequestId,
    @Param("workspaceId", new ParseUUIDPipe()) workspaceId: string,
    @Param("viewDefinitionId", new ParseUUIDPipe()) viewDefinitionId: string,
  ) {
    // 1. 인증 사용자·경로와 기존 middleware의 요청 ID를 전달한다.
    return this.filters.execute(user, workspaceId, viewDefinitionId, request.requestId ?? null);
  }

  // API : 사용자, 선택 View의 Sorts 저장 메뉴 조회
  @Get("sorts")
  getSorts(
    @Query(new EmptyRequestPipe()) _query: unknown,
    @Body(new EmptyRequestPipe()) _body: unknown,
    @CurrentUser() user: CurrentUserContext,
    @Req() request: RequestWithRequestId,
    @Param("workspaceId", new ParseUUIDPipe()) workspaceId: string,
    @Param("viewDefinitionId", new ParseUUIDPipe()) viewDefinitionId: string,
  ) {
    // 1. 인증 사용자·경로와 기존 middleware의 요청 ID를 전달한다.
    return this.sorts.execute(user, workspaceId, viewDefinitionId, request.requestId ?? null);
  }

  // API : 사용자, 선택 View의 Settings 저장 메뉴 조회
  @Get("settings")
  getSettings(
    @Query(new EmptyRequestPipe()) _query: unknown,
    @Body(new EmptyRequestPipe()) _body: unknown,
    @CurrentUser() user: CurrentUserContext,
    @Req() request: RequestWithRequestId,
    @Param("workspaceId", new ParseUUIDPipe()) workspaceId: string,
    @Param("viewDefinitionId", new ParseUUIDPipe()) viewDefinitionId: string,
  ) {
    // 1. 인증 사용자·경로와 기존 middleware의 요청 ID를 전달한다.
    return this.settings.execute(user, workspaceId, viewDefinitionId, request.requestId ?? null);
  }

}
