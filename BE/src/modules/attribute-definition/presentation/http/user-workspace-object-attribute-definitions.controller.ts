import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  UseGuards,
} from "@nestjs/common";
import { ListWorkspaceObjectAttributeDefinitionsUseCase } from "@/modules/attribute-definition/application/use-cases/list-workspace-object-attribute-definitions.use-case";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { CurrentUser } from "@/shared/presentation/decorators/current-user.decorator";
import { AuthGuard } from "@/shared/presentation/guards/auth.guard";

// 역할 : UserWorkspaceObjectAttributeDefinitionsController 사용자 Workspace ObjectDefinition AttributeDefinition HTTP 요청을 application 계층으로 위임합니다.
@UseGuards(AuthGuard)
@Controller(
  "api/users/me/workspaces/:workspaceId/object-definitions/:objectDefinitionId/attribute-definitions"
)
export class UserWorkspaceObjectAttributeDefinitionsController {
  // 기능 : AttributeDefinition 목록 조회 유스케이스를 주입받습니다.
  constructor(
    private readonly listWorkspaceObjectAttributeDefinitionsUseCase: ListWorkspaceObjectAttributeDefinitionsUseCase
  ) {}

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
