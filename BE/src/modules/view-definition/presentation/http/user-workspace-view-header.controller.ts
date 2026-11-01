import {
  Controller,
  Body,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
  UseGuards,
} from "@nestjs/common";
import { GetWorkspaceViewHeaderUseCase } from "@/modules/view-definition/application/use-cases/get-workspace-view-header.use-case";
import { GetWorkspaceViewHeaderByViewIdUseCase } from "../../application/use-cases/get-workspace-view-header-by-view-id.use-case";
import { EmptyRequestPipe } from "@/shared/presentation/pipes/empty-request.pipe";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { CurrentUser } from "@/shared/presentation/decorators/current-user.decorator";
import { AuthGuard } from "@/shared/presentation/guards/auth.guard";
import { GetWorkspaceViewHeaderQueryDto } from "./dto/get-workspace-view-header-query.dto";

// 역할 : Object/List 클릭에 대한 헤더 조회 요청을 application 계층에 위임합니다.
@UseGuards(AuthGuard)
@Controller("api/users/me/workspaces/:workspaceId/view-header")
export class UserWorkspaceViewHeaderController {
  // 기능 : 대상 기준 및 View ID 기준의 공통 헤더 조회 유스케이스를 주입받습니다.
  constructor(
    private readonly getWorkspaceViewHeaderUseCase: GetWorkspaceViewHeaderUseCase,
    private readonly getWorkspaceViewHeaderByViewIdUseCase: GetWorkspaceViewHeaderByViewIdUseCase,
  ) {}

  // API : 사용자, Workspace Object/List의 초기 View 헤더 조회
  @Get()
  getWorkspaceViewHeader(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("workspaceId", new ParseUUIDPipe()) workspaceId: string,
    @Query() query: GetWorkspaceViewHeaderQueryDto
  ) {
    // 1. 검증된 대상 필드와 인증 사용자만 application 계층으로 전달한다.
    return this.getWorkspaceViewHeaderUseCase.execute(currentUser, workspaceId, {
      targetType: query.targetType,
      targetId: query.targetId,
    });
  }

  // API : 사용자, 특정 View ID의 공통 헤더와 소속 조회
  @Get("view-definitions/:viewDefinitionId")
  getWorkspaceViewHeaderByViewId(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("workspaceId", new ParseUUIDPipe()) workspaceId: string,
    @Param("viewDefinitionId", new ParseUUIDPipe()) viewDefinitionId: string,
    @Query(new EmptyRequestPipe()) _query: unknown,
    @Body(new EmptyRequestPipe()) _body: unknown,
  ) {
    // 1. 인증 사용자와 검증한 두 경로 ID만 단건 UseCase에 전달한다.
    void _query;
    void _body;
    return this.getWorkspaceViewHeaderByViewIdUseCase.execute(currentUser, workspaceId, viewDefinitionId);
  }
}
