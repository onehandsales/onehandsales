import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from "@nestjs/common";
import { CreateMyWorkspaceUseCase } from "@/modules/workspace/application/use-cases/create-my-workspace.use-case";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { CurrentUser } from "@/shared/presentation/decorators/current-user.decorator";
import { AuthGuard } from "@/shared/presentation/guards/auth.guard";
import { CreateMyWorkspaceDto } from "./dto/create-my-workspace.dto";

// 역할 : UserWorkspacesController 사용자 Workspace HTTP 요청을 application 계층으로 위임합니다.
@UseGuards(AuthGuard)
@Controller("api/users/me/workspaces")
export class UserWorkspacesController {
  // 기능 : 사용자 Workspace 생성 유스케이스를 주입받습니다.
  constructor(private readonly createMyWorkspaceUseCase: CreateMyWorkspaceUseCase) {}

  // API : 사용자, 내 Workspace 생성
  @Post()
  @HttpCode(HttpStatus.CREATED)
  createMyWorkspace(
    @CurrentUser() currentUser: CurrentUserContext,
    @Body() body: CreateMyWorkspaceDto
  ) {
    // 1. request body를 application 계층 입력으로 전달한다.
    return this.createMyWorkspaceUseCase.execute(currentUser, {
      workspaceName: body.workspaceName,
    });
  }
}
