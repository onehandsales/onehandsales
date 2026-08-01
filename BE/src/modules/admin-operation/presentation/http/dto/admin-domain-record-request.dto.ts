import { Transform, Type } from "class-transformer";
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from "class-validator";

// 기능 : optional boolean query 값을 true/false 문자열만 boolean으로 변환합니다.
function transformOptionalBoolean(value: unknown): unknown {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  if (value === true || value === "true") {
    return true;
  }

  if (value === false || value === "false") {
    return false;
  }

  return value;
}

// 역할 : ListAdminDomainRecordsQueryDto Admin 도메인 read-only 목록 query 요청 값을 검증합니다.
export class ListAdminDomainRecordsQueryDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
  domain!: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  q?: string;

  @IsOptional()
  @Transform(({ value }) => transformOptionalBoolean(value))
  @IsBoolean()
  includeDeleted?: boolean;

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
  @IsString()
  @MaxLength(40)
  sort?: string;
}
