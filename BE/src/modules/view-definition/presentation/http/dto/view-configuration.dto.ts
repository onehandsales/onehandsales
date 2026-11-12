import { Type } from "class-transformer";
import { IsDefined, IsIn, IsInt, IsObject, IsOptional, IsString, IsUUID, Length, Max, MaxLength, Min, ValidateNested } from "class-validator";
import { GetWorkspaceViewMainContentQueryDto } from "./get-workspace-view-main-content-query.dto";
// 역할 : 보기에 두 원본이 있는 경우 명시적으로 선택합니다.
export class ViewConfigurationQueryDto {
  @IsOptional() @IsIn(["OBJECT", "LIST"]) sourceType?: "OBJECT" | "LIST";
}
// 역할 : 설정의 기준 버전과 교체할 section을 전달합니다.
export class UpdateViewConfigurationDto {
  @IsString() @Length(1, 128) baseConfigurationVersion!: string;
  @IsDefined() @IsObject() changes!: Record<string, unknown>;
}
// 역할 : 저장하지 않은 설정으로 기존 본문 페이지를 조회합니다.
export class PreviewViewConfigurationDto extends UpdateViewConfigurationDto {
  @IsOptional() @IsObject() @ValidateNested() @Type(() => GetWorkspaceViewMainContentQueryDto) query?: GetWorkspaceViewMainContentQueryDto;
}
// 역할 : 선택형 정보와 연결 기록의 후보 검색 입력을 검증합니다.
export class ViewConfigurationOptionsQueryDto extends ViewConfigurationQueryDto {
  @IsIn(["RECORD", "LIST_ENTRY"]) sourceScope!: "RECORD" | "LIST_ENTRY";
  @IsUUID() attributeDefinitionId!: string;
  @IsOptional() @IsString() @MaxLength(110) referenceAttributeIdPath?: string;
  @IsOptional() @IsString() @MaxLength(200) q?: string;
  @IsOptional() @IsUUID() cursor?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) limit?: number;
}
