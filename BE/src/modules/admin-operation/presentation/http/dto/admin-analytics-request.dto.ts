import { IsDateString, IsOptional, IsString, MaxLength } from "class-validator";

// 역할 : GetAdminAnalyticsOverviewQueryDto Admin analytics overview query 요청 값을 검증합니다.
export class GetAdminAnalyticsOverviewQueryDto {
  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  timeZone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(8)
  countryCode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(16)
  preferredLocale?: string;
}
