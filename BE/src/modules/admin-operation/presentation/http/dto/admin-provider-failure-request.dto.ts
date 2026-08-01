import { Type } from "class-transformer";
import {
  IsBooleanString,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from "class-validator";

// 역할 : ListAdminProviderFailuresQueryDto Admin provider 실패 목록 query DTO입니다.
export class ListAdminProviderFailuresQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(24)
  providerType?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  featureArea?: string;

  @IsOptional()
  @IsString()
  @MaxLength(16)
  status?: string;

  @IsOptional()
  @IsBooleanString()
  retryable?: string;

  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;

  @IsOptional()
  @IsString()
  cursor?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
