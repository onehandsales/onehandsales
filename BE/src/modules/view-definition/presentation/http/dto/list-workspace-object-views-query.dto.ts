import { IsUUID, ValidateIf } from "class-validator";

// 역할 : Object 보기 선택 목록의 선택적 현재 View ID를 검증합니다.
export class ListWorkspaceObjectViewsQueryDto {
  @ValidateIf((_object, value: unknown) => value !== undefined)
  @IsUUID()
  viewDefinitionId?: string;
}
