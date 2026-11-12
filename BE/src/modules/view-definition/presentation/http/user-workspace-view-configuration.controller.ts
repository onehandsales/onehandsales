import { Body, Controller, Get, HttpCode, Param, ParseUUIDPipe, Patch, Post, Query, Req, UseGuards } from "@nestjs/common";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { CurrentUser } from "@/shared/presentation/decorators/current-user.decorator";
import { AuthGuard } from "@/shared/presentation/guards/auth.guard";
import { EmptyRequestPipe } from "@/shared/presentation/pipes/empty-request.pipe";
import type { RequestWithRequestId } from "@/shared/presentation/middleware/request-id.middleware";
import { ValidationDomainError } from "@/shared/domain/errors/common.errors";
import { ViewConfigurationService } from "../../application/view-configuration-application.service";
import { PreviewViewConfigurationDto, UpdateViewConfigurationDto, ViewConfigurationOptionsQueryDto, ViewConfigurationQueryDto } from "./dto/view-configuration.dto";

// 기능 : UUID 경로를 저장소 비교에 사용하는 표준 소문자로 변환합니다.
function scope(workspaceId: string, viewDefinitionId: string) { return { workspaceId: workspaceId.toLowerCase(), viewDefinitionId: viewDefinitionId.toLowerCase() }; }
// 역할 : 보기 설정 편집의 HTTP 검증과 application 호출을 연결합니다.
@UseGuards(AuthGuard)
@Controller("api/users/me/workspaces/:workspaceId/view-definitions/:viewDefinitionId")
export class UserWorkspaceViewConfigurationController {
  // 기능 : 설정 편집의 orchestration을 application에 위임합니다.
  constructor(private readonly configuration: ViewConfigurationService) {}

  // API : 사용자, 보기의 저장 설정과 편집 후보 조회
  @Get("configuration")
  get(@CurrentUser() user: CurrentUserContext, @Param("workspaceId", new ParseUUIDPipe()) workspaceId: string,
    @Param("viewDefinitionId", new ParseUUIDPipe()) viewId: string, @Query() query: ViewConfigurationQueryDto,
    @Body(new EmptyRequestPipe()) _body: unknown) {
    // 1. 인증 맥락과 검증된 원본 선택으로 일관된 설정을 읽는다.
    void _body;
    return this.configuration.get(user, scope(workspaceId, viewId), query);
  }
  // API : 사용자, 보기 조건의 선택 후보 조회
  @Get("configuration/options")
  options(@CurrentUser() user: CurrentUserContext, @Param("workspaceId", new ParseUUIDPipe()) workspaceId: string,
    @Param("viewDefinitionId", new ParseUUIDPipe()) viewId: string, @Query() query: ViewConfigurationOptionsQueryDto,
    @Body(new EmptyRequestPipe()) _body: unknown) {
    // 1. View와 속성 경로에 한정한 선택 후보를 반환한다.
    void _body;
    return this.configuration.options(user, scope(workspaceId, viewId), query);
  }
  // API : 사용자, 저장하지 않은 보기 설정으로 본문 미리보기
  @Post("data/preview")
  @HttpCode(200)
  preview(@CurrentUser() user: CurrentUserContext, @Param("workspaceId", new ParseUUIDPipe()) workspaceId: string,
    @Param("viewDefinitionId", new ParseUUIDPipe()) viewId: string, @Query() query: ViewConfigurationQueryDto,
    @Body() body: PreviewViewConfigurationDto) {
    // 1. 원본 선택은 URL로 통일하고 본문 조회 조건만 미리보기에 전달한다.
    if (body.query === null) throw new ValidationDomainError("query must be an object");
    if (body.query?.sourceType !== undefined) throw new ValidationDomainError("sourceType belongs in the URL query");
    return this.configuration.preview(user, scope(workspaceId, viewId), body, { ...body.query, ...query });
  }
  // API : 사용자, 보기의 필터·정렬·표시 설정 일괄 저장
  @Patch("configuration")
  update(@CurrentUser() user: CurrentUserContext, @Param("workspaceId", new ParseUUIDPipe()) workspaceId: string,
    @Param("viewDefinitionId", new ParseUUIDPipe()) viewId: string, @Query() query: ViewConfigurationQueryDto,
    @Body() body: UpdateViewConfigurationDto, @Req() request: RequestWithRequestId) {
    // 1. 같은 요청의 감사 맥락을 전달하고 application이 transaction을 소유한다.
    return this.configuration.update(user, scope(workspaceId, viewId), body, query, request.requestId ?? null);
  }
}
