import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
  UseGuards,
} from "@nestjs/common";
import { GetWorkspaceViewHeaderUseCase } from "@/modules/view-definition/application/use-cases/get-workspace-view-header.use-case";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { CurrentUser } from "@/shared/presentation/decorators/current-user.decorator";
import { AuthGuard } from "@/shared/presentation/guards/auth.guard";
import { GetWorkspaceViewHeaderQueryDto } from "./dto/get-workspace-view-header-query.dto";

// 역할 : Object/List 클릭에 대한 헤더 조회 요청을 application 계층에 위임합니다.
@UseGuards(AuthGuard)
@Controller("api/users/me/workspaces/:workspaceId/view-header")
export class UserWorkspaceViewHeaderController {
  // 기능 : 대상 기반 헤더 조회 유스케이스를 주입받습니다.
  constructor(
    private readonly getWorkspaceViewHeaderUseCase: GetWorkspaceViewHeaderUseCase
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
}
