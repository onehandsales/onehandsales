import { Type } from "class-transformer";
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from "class-validator";
import { UserStatus } from "@/modules/admin-operation/application/ports/admin-operation.types";
import { AdminUserListSort } from "@/modules/admin-operation/application/ports/admin-user.repository";

// 역할 : ListAdminUsersQueryDto Admin 사용자 목록 query 요청 값을 검증합니다.
export class ListAdminUsersQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  q?: string;

  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @IsOptional()
  @IsString()
  @MaxLength(8)
  countryCode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(16)
  preferredLocale?: string;

  @IsOptional()
  @IsString()
  cursor?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @IsOptional()
  @IsEnum(AdminUserListSort)
  sort?: AdminUserListSort;
}

// 역할 : ListAdminUserActivityTimelineQueryDto Admin 사용자 활동 timeline query 요청 값을 검증합니다.
export class ListAdminUserActivityTimelineQueryDto {
  @IsOptional()
  @IsString()
  cursor?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  eventType?: string;
}
