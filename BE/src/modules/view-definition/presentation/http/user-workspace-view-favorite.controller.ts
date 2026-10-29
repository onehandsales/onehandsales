import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import type { Response } from "express";
import {
  CreateWorkspaceViewFavoriteUseCase,
  type CreateWorkspaceViewFavoriteResponse,
} from "@/modules/view-definition/application/use-cases/create-workspace-view-favorite.use-case";
import {
  DeleteWorkspaceViewFavoriteUseCase,
  type DeleteWorkspaceViewFavoriteResponse,
} from "@/modules/view-definition/application/use-cases/delete-workspace-view-favorite.use-case";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { CurrentUser } from "@/shared/presentation/decorators/current-user.decorator";
import { AuthGuard } from "@/shared/presentation/guards/auth.guard";
import type { RequestWithRequestId } from "@/shared/presentation/middleware/request-id.middleware";
import { EmptyRequestPipe } from "@/shared/presentation/pipes/empty-request.pipe";

// 역할 : 현재 사용자의 View 즐겨찾기 등록·해제 HTTP 계약을 application에 연결합니다.
@UseGuards(AuthGuard)
@Controller("api/users/me/workspaces/:workspaceId/view-header/view-definitions/:viewDefinitionId/favorite")
export class UserWorkspaceViewFavoriteController {
  // 기능 : 등록과 해제를 각각 전담하는 유스케이스를 주입받습니다.
  constructor(
    private readonly createFavorite: CreateWorkspaceViewFavoriteUseCase,
    private readonly deleteFavorite: DeleteWorkspaceViewFavoriteUseCase
  ) {}

  // API : 사용자, Workspace View 즐겨찾기 등록
  @Post()
  async create(
    @Query(new EmptyRequestPipe()) _query: unknown,
    @Body(new EmptyRequestPipe()) _body: unknown,
    @CurrentUser() currentUser: CurrentUserContext,
    @Req() request: RequestWithRequestId,
    @Param("workspaceId", new ParseUUIDPipe()) workspaceId: string,
    @Param("viewDefinitionId", new ParseUUIDPipe()) viewDefinitionId: string,
    @Res({ passthrough: true }) response: Response
  ): Promise<CreateWorkspaceViewFavoriteResponse> {
    // 1. 검증된 경로·인증 사용자·middleware 요청 ID를 전달하고 신규 여부를 HTTP 상태로 변환한다.
    const result = await this.createFavorite.execute(
      currentUser, workspaceId, viewDefinitionId, request.requestId
    );
    response.status(result.created ? HttpStatus.CREATED : HttpStatus.OK);
    // 2. 내부 생성 판정은 제외하고 공개 응답 필드만 반환한다.
    return { viewDefinitionId: result.viewDefinitionId, isFavorite: result.isFavorite };
  }

  // API : 사용자, Workspace View 즐겨찾기 해제
  @Delete()
  @HttpCode(HttpStatus.OK)
  delete(
    @Query(new EmptyRequestPipe()) _query: unknown,
    @Body(new EmptyRequestPipe()) _body: unknown,
    @CurrentUser() currentUser: CurrentUserContext,
    @Req() request: RequestWithRequestId,
    @Param("workspaceId", new ParseUUIDPipe()) workspaceId: string,
    @Param("viewDefinitionId", new ParseUUIDPipe()) viewDefinitionId: string
  ): Promise<DeleteWorkspaceViewFavoriteResponse> {
    // 1. 검증된 요청과 middleware 요청 ID를 전달하고 기존 유무와 무관하게 200을 반환한다.
    return this.deleteFavorite.execute(
      currentUser, workspaceId, viewDefinitionId, request.requestId
    );
  }
}
