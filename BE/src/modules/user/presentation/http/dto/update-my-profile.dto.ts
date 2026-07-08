import { IsString, MaxLength, ValidateIf } from "class-validator";

// 역할 : UpdateMyProfileDto HTTP 요청 값을 검증하기 위한 DTO입니다.
export class UpdateMyProfileDto {
  @ValidateIf((_, value) => value !== undefined && value !== null)
  @IsString()
  @MaxLength(80)
  name?: string | null;

  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  @MaxLength(64)
  timeZone?: string;

  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  @MaxLength(16)
  preferredLocale?: string;
}
