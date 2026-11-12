import { Controller, Get, Param, ParseUUIDPipe, Query, UseGuards } from "@nestjs/common";
import { IsOptional, IsString, IsUUID, MaxLength } from "class-validator";
import { AuthGuard } from "@/shared/presentation/guards/auth.guard";
import { CurrentUser } from "@/shared/presentation/decorators/current-user.decorator";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { GetRecordFormUseCase } from "../../application/use-cases/get-record-form.use-case";
// 역할 : 입력 후보의 제한된 검색과 페이지 요청입니다.
export class RecordFormQueryDto {
  @IsOptional() @IsUUID() attributeDefinitionId?: string;
  @IsOptional() @IsString() @MaxLength(200) q?: string;
  @IsOptional() @IsUUID() cursor?: string;
}
// 역할 : 기록 생성과 값 편집에 사용하는 입력 메타데이터 HTTP 경계입니다.
@UseGuards(AuthGuard)
@Controller("api/users/me/workspaces/:workspaceId/object-definitions/:objectDefinitionId/record-definitions/form")
export class UserWorkspaceRecordFormController {
  // 기능 : 소유 모듈을 통해 폼 정보를 읽는 유스케이스를 주입받습니다.
  constructor(private readonly form: GetRecordFormUseCase) {}
  // API : 사용자, 기록 입력 속성과 선택 후보 조회
  @Get()
  get(@CurrentUser() user: CurrentUserContext, @Param("workspaceId", new ParseUUIDPipe()) workspaceId: string,
    @Param("objectDefinitionId", new ParseUUIDPipe()) objectId: string, @Query() query: RecordFormQueryDto) {
    return this.form.execute(user, workspaceId, objectId, query);
  }
}
