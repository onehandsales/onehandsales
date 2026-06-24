import { Transform, Type, type TransformFnParams } from "class-transformer";
import {
  ArrayNotEmpty,
  IsBoolean,
  IsEnum,
  IsInt,
  IsArray,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Min,
} from "class-validator";
import { DealListSort } from "@/modules/deal/application/ports/deal.repository";
import { DealStatusCode } from "@/modules/deal/domain/deal-status";

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function toOptionalArray({ value }: TransformFnParams): string[] | undefined {
  if (value === undefined) {
    return undefined;
  }

  return Array.isArray(value) ? value : [value];
}

// 역할 : ListDealsQueryDto HTTP 목록 query 요청 값을 검증하기 위한 DTO입니다.
export class DealStageCountsQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Transform(toOptionalArray)
  @IsArray()
  @IsUUID(undefined, { each: true })
  companyIds?: string[];

  @IsOptional()
  @Transform(toOptionalArray)
  @IsArray()
  @IsUUID(undefined, { each: true })
  contactIds?: string[];
}

export class ListDealsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Transform(toOptionalArray)
  @IsArray()
  @IsUUID(undefined, { each: true })
  companyIds?: string[];

  @IsOptional()
  @Transform(toOptionalArray)
  @IsArray()
  @IsUUID(undefined, { each: true })
  contactIds?: string[];

  @IsOptional()
  @IsEnum(DealStatusCode)
  dealStatus?: DealStatusCode;

  @IsOptional()
  @IsEnum(DealListSort)
  sort?: DealListSort;
}

// 역할 : ExportDealsQueryDto HTTP export query 요청 값을 검증하기 위한 DTO입니다.
export class ExportDealsQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Transform(toOptionalArray)
  @IsArray()
  @IsUUID(undefined, { each: true })
  companyIds?: string[];

  @IsOptional()
  @Transform(toOptionalArray)
  @IsArray()
  @IsUUID(undefined, { each: true })
  contactIds?: string[];

  @IsOptional()
  @IsEnum(DealStatusCode)
  dealStatus?: DealStatusCode;

  @IsOptional()
  @IsEnum(DealListSort)
  sort?: DealListSort;
}

// 역할 : CursorQueryDto HTTP cursor 조회 요청 값을 검증하기 위한 DTO입니다.
export class CursorQueryDto {
  @IsOptional()
  @IsString()
  cursor?: string;
}

// 역할 : CreateDealDto HTTP 딜 생성 요청 값을 검증하기 위한 DTO입니다.
export class CreateDealDto {
  @IsString()
  dealName!: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  dealCost!: number;

  @IsArray()
  @ArrayNotEmpty()
  @IsUUID(undefined, { each: true })
  companyIds!: string[];

  @IsArray()
  @ArrayNotEmpty()
  @IsUUID(undefined, { each: true })
  contactIds!: string[];

  @IsArray()
  @ArrayNotEmpty()
  @IsUUID(undefined, { each: true })
  productIds!: string[];

  @IsEnum(DealStatusCode)
  dealStatus!: DealStatusCode;

  @IsString()
  followingAction!: string;

  @IsString()
  @Matches(DATE_ONLY_PATTERN)
  expectedEndDate!: string;

  @IsOptional()
  @IsString()
  dealMemo?: string | null;
}

// 역할 : UpdateDealDto HTTP 딜 수정 요청 값을 검증하기 위한 DTO입니다.
export class UpdateDealDto {
  @IsOptional()
  @IsString()
  dealName?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  dealCost?: number;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID(undefined, { each: true })
  companyIds?: string[];

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID(undefined, { each: true })
  contactIds?: string[];

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID(undefined, { each: true })
  productIds?: string[];

  @IsOptional()
  @IsString()
  @Matches(DATE_ONLY_PATTERN)
  expectedEndDate?: string;

  @IsOptional()
  @IsEnum(DealStatusCode)
  dealStatus?: DealStatusCode;
}

// 역할 : CreateDealFollowingActionLogDto HTTP 다음 행동 로그 생성 요청 값을 검증하기 위한 DTO입니다.
export class CreateDealFollowingActionLogDto {
  @IsString()
  followingAction!: string;
}

// 역할 : UpdateDealFollowingActionLogDto HTTP 다음 행동 로그 수정 요청 값을 검증하기 위한 DTO입니다.
export class UpdateDealFollowingActionLogDto {
  @IsOptional()
  @IsString()
  followingAction?: string;

  @IsOptional()
  @IsBoolean()
  checkComplete?: boolean;
}

// 역할 : CreateDealMemoLogDto HTTP 메모 로그 생성 요청 값을 검증하기 위한 DTO입니다.
export class CreateDealMemoLogDto {
  @IsString()
  memoType!: string;

  @IsString()
  memo!: string;
}

// 역할 : UpdateDealMemoLogDto HTTP 메모 로그 수정 요청 값을 검증하기 위한 DTO입니다.
export class UpdateDealMemoLogDto {
  @IsOptional()
  @IsString()
  memoType?: string;

  @IsOptional()
  @IsString()
  memo?: string;
}
