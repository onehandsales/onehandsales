import { IsBoolean, IsString, ValidateIf } from "class-validator";

// 역할 : UpdateWorkspaceObjectAttributeDefinitionDto HTTP 수정 요청 값을 검증하기 위한 DTO입니다.
export class UpdateWorkspaceObjectAttributeDefinitionDto {
  // 기능 : title이 request body에 포함된 경우 문자열인지 검증합니다.
  @ValidateIf((_object, value) => value !== undefined)
  @IsString()
  title?: string;

  // 기능 : description이 request body에 포함된 경우 문자열 또는 null인지 검증합니다.
  @ValidateIf((_object, value) => value !== undefined && value !== null)
  @IsString()
  description?: string | null;

  // 기능 : icon이 request body에 포함된 경우 문자열 또는 null인지 검증합니다.
  @ValidateIf((_object, value) => value !== undefined && value !== null)
  @IsString()
  icon?: string | null;

  // 기능 : isMultiselect가 request body에 포함된 경우 boolean인지 검증합니다.
  @ValidateIf((_object, value) => value !== undefined)
  @IsBoolean()
  isMultiselect?: boolean;
}
