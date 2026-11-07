import { Body, Controller, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post, Req, UseGuards } from "@nestjs/common";
import { CreateWorkspaceListDefinitionUseCase } from "../../application/use-cases/create-workspace-list-definition.use-case";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { CurrentUser } from "@/shared/presentation/decorators/current-user.decorator";
import { AuthGuard } from "@/shared/presentation/guards/auth.guard";
import type { RequestWithRequestId } from "@/shared/presentation/middleware/request-id.middleware";
import { CreateWorkspaceListDefinitionBodyPipe } from "./pipes/create-workspace-list-definition-body.pipe";

// 역할 : 업무 목록 생성 HTTP 요청을 application orchestration에 위임합니다.
@UseGuards(AuthGuard)
@Controller("api/users/me/workspaces/:workspaceId/list-definitions")
export class UserWorkspaceListDefinitionsController {
  private readonly bodyPipe = new CreateWorkspaceListDefinitionBodyPipe();
  // 기능 : 목록과 첫 보기를 생성하는 유스케이스를 주입받습니다.
  constructor(private readonly createList: CreateWorkspaceListDefinitionUseCase) {}

  // API : 사용자, Workspace 업무 목록과 첫 보기 생성
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@CurrentUser() user: CurrentUserContext,
    @Param("workspaceId", new ParseUUIDPipe()) workspaceId: string,
    @Body() rawBody: unknown, @Req() request: RequestWithRequestId) {
    // 1. 전역 DTO 변환이 예약 키를 지우기 전에 확인하고 필드형 DTO 검증을 수행한다.
    const body = await this.bodyPipe.transform(rawBody);
    // 2. 검증된 요청과 감사 추적 정보를 application에 전달한다.
    return this.createList.execute(user, workspaceId, {
      listDefinitionName: body.listDefinitionName, objectDefinitionId: body.objectDefinitionId,
      titleAttributeDefinitionId: body.titleAttributeDefinitionId, viewType: body.viewType,
      ...(body.icon !== undefined ? { icon: body.icon } : {}),
      ...(body.description !== undefined ? { description: body.description } : {}),
      ...(body.kanban !== undefined ? { kanban: body.kanban } : {}),
    }, request.requestId);
  }
}
