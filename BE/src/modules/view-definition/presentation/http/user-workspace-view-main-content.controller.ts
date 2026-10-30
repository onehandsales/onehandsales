import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { GetWorkspaceViewMainContentUseCase } from "../../application/use-cases/get-workspace-view-main-content.use-case";
import {
  GetWorkspaceViewMainContentQueryDto,
  toViewDataRequest,
} from "./dto/get-workspace-view-main-content-query.dto";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { CurrentUser } from "@/shared/presentation/decorators/current-user.decorator";
import { AuthGuard } from "@/shared/presentation/guards/auth.guard";
import { EmptyRequestPipe } from "@/shared/presentation/pipes/empty-request.pipe";
import type { RequestWithRequestId } from "@/shared/presentation/middleware/request-id.middleware";

// 역할 : 선택 View의 공통 주 화면 조회 HTTP 진입점을 제공합니다.
@UseGuards(AuthGuard)
@Controller(
  "api/users/me/workspaces/:workspaceId/view-definitions/:viewDefinitionId",
)
export class UserWorkspaceViewMainContentController {
  // 기능 : 본문 조회 유스케이스를 주입받습니다.
  constructor(private readonly query: GetWorkspaceViewMainContentUseCase) {}
  // API : 사용자, 선택 View의 저장 설정 기반 주 화면 데이터 조회
  @Get("data")
  getData(
    @CurrentUser() user: CurrentUserContext,
    @Param("workspaceId", new ParseUUIDPipe()) workspaceId: string,
    @Param("viewDefinitionId", new ParseUUIDPipe()) viewDefinitionId: string,
    @Query() query: GetWorkspaceViewMainContentQueryDto,
    @Body(new EmptyRequestPipe()) _body: unknown,
    @Req() request: RequestWithRequestId,
  ) {
    return this.query.execute(
      user,
      workspaceId,
      viewDefinitionId,
      toViewDataRequest(query),
      request.requestId ?? null,
    );
  }
}
