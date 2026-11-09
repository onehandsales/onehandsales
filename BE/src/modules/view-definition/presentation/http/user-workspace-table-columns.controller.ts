import { Body, Controller, HttpStatus, Param, ParseUUIDPipe, Post, Query, Req, Res, UseGuards } from "@nestjs/common";
import type { Response } from "express";
import { CreateWorkspaceTableColumnUseCase } from "../../application/use-cases/create-workspace-table-column.use-case";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { CurrentUser } from "@/shared/presentation/decorators/current-user.decorator";
import { AuthGuard } from "@/shared/presentation/guards/auth.guard";
import { EmptyRequestPipe } from "@/shared/presentation/pipes/empty-request.pipe";
import type { RequestWithRequestId } from "@/shared/presentation/middleware/request-id.middleware";
import { CreateWorkspaceTableColumnDto } from "./dto/create-workspace-table-column.dto";

// 역할 : TABLE 컬럼 생성 HTTP 요청을 View 소유 application에 위임합니다.
@UseGuards(AuthGuard)
@Controller("api/users/me/workspaces/:workspaceId/view-definitions/:viewDefinitionId/columns")
export class UserWorkspaceTableColumnsController {
  // 기능 : 인라인 컬럼 생성 유스케이스를 주입받습니다.
  constructor(private readonly createColumn: CreateWorkspaceTableColumnUseCase) {}

  // API : 사용자, Workspace Object TABLE의 새 속성과 표시 컬럼 생성
  @Post()
  async create(
    @CurrentUser() user: CurrentUserContext,
    @Param("workspaceId", new ParseUUIDPipe()) workspaceId: string,
    @Param("viewDefinitionId", new ParseUUIDPipe()) viewId: string,
    @Body() body: CreateWorkspaceTableColumnDto,
    @Query(new EmptyRequestPipe()) _query: unknown,
    @Req() request: RequestWithRequestId,
    @Res({ passthrough: true }) response: Response,
  ) {
    // 1. HTTP 전용 상태와 요청 ID를 변환하고 내부 생성 판정은 응답에서 제외한다.
    const { created, ...result } = await this.createColumn.execute(user, workspaceId, viewId, body, request.requestId);
    response.status(created ? HttpStatus.CREATED : HttpStatus.OK);
    return result;
  }
}
