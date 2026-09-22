import {
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from "@nestjs/common";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { CurrentUser } from "@/shared/presentation/decorators/current-user.decorator";
import { AuthGuard } from "@/shared/presentation/guards/auth.guard";

// 역할 : UserWorkspaceObjectDefinitionsController 사용자 Workspace ObjectDefinition HTTP 요청의 route 연결을 담당합니다.
@UseGuards(AuthGuard)
@Controller("api/users/me/workspaces/:workspaceId/object-definitions")
export class UserWorkspaceObjectDefinitionsController {
  // API : 사용자, Workspace ObjectDefinition 생성
  @Post()
  @HttpCode(HttpStatus.OK)
  createWorkspaceObjectDefinition(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("workspaceId", new ParseUUIDPipe()) workspaceId: string
  ) {
    // 1. 현재는 route 연결만 확인하고 고정 성공 응답을 반환한다.
    void currentUser;
    void workspaceId;

    return {
      ok: true,
    };
  }
}
