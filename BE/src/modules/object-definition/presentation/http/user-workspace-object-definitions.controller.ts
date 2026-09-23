import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from "@nestjs/common";
import {
  type CreateWorkspaceObjectDefinitionCommand,
  CreateWorkspaceObjectDefinitionUseCase,
} from "@/modules/object-definition/application/use-cases/create-workspace-object-definition.use-case";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { CurrentUser } from "@/shared/presentation/decorators/current-user.decorator";
import { AuthGuard } from "@/shared/presentation/guards/auth.guard";
import { CreateWorkspaceObjectDefinitionDto } from "./dto/create-workspace-object-definition.dto";

// 역할 : UserWorkspaceObjectDefinitionsController 사용자 Workspace ObjectDefinition HTTP 요청의 route 연결을 담당합니다.
@UseGuards(AuthGuard)
@Controller("api/users/me/workspaces/:workspaceId/object-definitions")
export class UserWorkspaceObjectDefinitionsController {
  // 기능 : ObjectDefinition 생성 유스케이스를 주입받습니다.
  constructor(
    private readonly createWorkspaceObjectDefinitionUseCase: CreateWorkspaceObjectDefinitionUseCase
  ) {}

  // API : 사용자, Workspace ObjectDefinition 생성
  @Post()
  @HttpCode(HttpStatus.CREATED)
  createWorkspaceObjectDefinition(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("workspaceId", new ParseUUIDPipe()) workspaceId: string,
    @Body() body: CreateWorkspaceObjectDefinitionDto
  ) {
    // 1. undefined인 선택 필드는 application command에서 제외한다.
    const command: CreateWorkspaceObjectDefinitionCommand = {
      objectDefinitionName: body.objectDefinitionName,
      ...(body.icon !== undefined ? { icon: body.icon } : {}),
      ...(body.description !== undefined ? { description: body.description } : {}),
    };

    // 2. request body를 application 계층 입력으로 전달한다.
    return this.createWorkspaceObjectDefinitionUseCase.execute(
      currentUser,
      workspaceId,
      command
    );
  }
}
