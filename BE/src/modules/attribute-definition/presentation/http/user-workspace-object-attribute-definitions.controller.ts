import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from "@nestjs/common";
import {
  type CreateWorkspaceObjectAttributeDefinitionCommand,
  CreateWorkspaceObjectAttributeDefinitionUseCase,
} from "@/modules/attribute-definition/application/use-cases/create-workspace-object-attribute-definition.use-case";
import { ListWorkspaceObjectAttributeDefinitionsUseCase } from "@/modules/attribute-definition/application/use-cases/list-workspace-object-attribute-definitions.use-case";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { CurrentUser } from "@/shared/presentation/decorators/current-user.decorator";
import { AuthGuard } from "@/shared/presentation/guards/auth.guard";
import { CreateWorkspaceObjectAttributeDefinitionDto } from "./dto/create-workspace-object-attribute-definition.dto";

// 역할 : UserWorkspaceObjectAttributeDefinitionsController 사용자 Workspace ObjectDefinition AttributeDefinition HTTP 요청을 application 계층으로 위임합니다.
@UseGuards(AuthGuard)
@Controller(
  "api/users/me/workspaces/:workspaceId/object-definitions/:objectDefinitionId/attribute-definitions"
)
export class UserWorkspaceObjectAttributeDefinitionsController {
  // 기능 : AttributeDefinition 생성/목록 조회 유스케이스를 주입받습니다.
  constructor(
    private readonly createWorkspaceObjectAttributeDefinitionUseCase: CreateWorkspaceObjectAttributeDefinitionUseCase,
    private readonly listWorkspaceObjectAttributeDefinitionsUseCase: ListWorkspaceObjectAttributeDefinitionsUseCase
  ) {}

  // API : 사용자, Workspace ObjectDefinition AttributeDefinition 생성
  @Post()
  @HttpCode(HttpStatus.CREATED)
  createWorkspaceObjectAttributeDefinition(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("workspaceId", new ParseUUIDPipe()) workspaceId: string,
    @Param("objectDefinitionId", new ParseUUIDPipe()) objectDefinitionId: string,
    @Body() body: CreateWorkspaceObjectAttributeDefinitionDto
  ) {
    // 1. undefined인 선택 필드는 application command에서 제외한다.
    const command: CreateWorkspaceObjectAttributeDefinitionCommand = {
      attributeDefinitionName: body.attributeDefinitionName,
      attributeType: body.attributeType,
      ...(body.icon !== undefined ? { icon: body.icon } : {}),
      ...(body.description !== undefined ? { description: body.description } : {}),
      ...(body.config !== undefined ? { config: body.config } : {}),
    };

    // 2. request body를 application 계층 입력으로 전달한다.
    return this.createWorkspaceObjectAttributeDefinitionUseCase.execute(
      currentUser,
      workspaceId,
      objectDefinitionId,
      command
    );
  }

  // API : 사용자, Workspace ObjectDefinition AttributeDefinition 목록 조회
  @Get()
  listWorkspaceObjectAttributeDefinitions(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("workspaceId", new ParseUUIDPipe()) workspaceId: string,
    @Param("objectDefinitionId", new ParseUUIDPipe()) objectDefinitionId: string
  ) {
    // 1. application 계층에 현재 사용자의 AttributeDefinition 목록 조회를 위임한다.
    return this.listWorkspaceObjectAttributeDefinitionsUseCase.execute(
      currentUser,
      workspaceId,
      objectDefinitionId
    );
  }
}
