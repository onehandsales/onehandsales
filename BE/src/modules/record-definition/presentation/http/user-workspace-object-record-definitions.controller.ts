import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { CreateWorkspaceObjectRecordDefinitionUseCase } from "@/modules/record-definition/application/use-cases/create-workspace-object-record-definition.use-case";
import { ListWorkspaceObjectRecordDefinitionsUseCase } from "@/modules/record-definition/application/use-cases/list-workspace-object-record-definitions.use-case";
import { ListWorkspaceObjectRecordDefinitionsQueryDto } from "@/modules/record-definition/presentation/http/dto/list-workspace-object-record-definitions-query.dto";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { CurrentUser } from "@/shared/presentation/decorators/current-user.decorator";
import { AuthGuard } from "@/shared/presentation/guards/auth.guard";

// 역할 : UserWorkspaceObjectRecordDefinitionsController 사용자 Workspace ObjectDefinition RecordDefinition HTTP 요청을 application 계층으로 위임합니다.
@UseGuards(AuthGuard)
@Controller(
  "api/users/me/workspaces/:workspaceId/object-definitions/:objectDefinitionId/record-definitions"
)
export class UserWorkspaceObjectRecordDefinitionsController {
  // 기능 : RecordDefinition 생성/목록 조회 유스케이스를 주입받습니다.
  constructor(
    private readonly createWorkspaceObjectRecordDefinitionUseCase: CreateWorkspaceObjectRecordDefinitionUseCase,
    private readonly listWorkspaceObjectRecordDefinitionsUseCase: ListWorkspaceObjectRecordDefinitionsUseCase
  ) {}

  // API : 사용자, Workspace ObjectDefinition RecordDefinition 생성
  @Post()
  @HttpCode(HttpStatus.CREATED)
  createWorkspaceObjectRecordDefinition(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("workspaceId", new ParseUUIDPipe()) workspaceId: string,
    @Param("objectDefinitionId", new ParseUUIDPipe()) objectDefinitionId: string
  ) {
    // 1. application 계층에 현재 사용자의 빈 RecordDefinition과 null cell value row 생성을 위임한다.
    return this.createWorkspaceObjectRecordDefinitionUseCase.execute(
      currentUser,
      workspaceId,
      objectDefinitionId
    );
  }

  // API : 사용자, Workspace ObjectDefinition RecordDefinition 목록 조회
  @Get()
  listWorkspaceObjectRecordDefinitions(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("workspaceId", new ParseUUIDPipe()) workspaceId: string,
    @Param("objectDefinitionId", new ParseUUIDPipe()) objectDefinitionId: string,
    @Query() query: ListWorkspaceObjectRecordDefinitionsQueryDto
  ) {
    // 1. application 계층에 현재 사용자의 RecordDefinition 목록 조회를 위임한다.
    return this.listWorkspaceObjectRecordDefinitionsUseCase.execute(
      currentUser,
      workspaceId,
      objectDefinitionId,
      query.cursor
    );
  }
}
