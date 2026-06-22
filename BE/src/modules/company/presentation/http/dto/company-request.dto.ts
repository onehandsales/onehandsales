import { Transform, type TransformFnParams, Type } from "class-transformer";
import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from "class-validator";
import { CompanyListSort } from "@/modules/company/application/ports/company.repository";

// 기능 : 반복 query와 comma-separated query를 UUID 배열 검증 대상으로 정규화합니다.
function toOptionalStringArray(params: TransformFnParams): string[] | undefined {
  const { value } = params;

  if (value === undefined || value === null) {
    return undefined;
  }

  const values = Array.isArray(value) ? value : [value];
  const normalizedValues = values
    .flatMap((item) => (typeof item === "string" ? item.split(",") : []))
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

  return normalizedValues.length > 0 ? normalizedValues : undefined;
}

// 역할 : ListCompaniesQueryDto HTTP 요청 값을 검증하기 위한 DTO입니다.
export class ListCompaniesQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsString()
  companyName?: string;

  @IsOptional()
  @IsUUID()
  companyFieldId?: string;

  @IsOptional()
  @Transform(toOptionalStringArray)
  @IsArray()
  @IsUUID("all", { each: true })
  companyFieldIds?: string[];

  @IsOptional()
  @IsUUID()
  companyRegionId?: string;

  @IsOptional()
  @Transform(toOptionalStringArray)
  @IsArray()
  @IsUUID("all", { each: true })
  companyRegionIds?: string[];

  @IsOptional()
  @IsEnum(CompanyListSort)
  sort?: CompanyListSort;
}

// 역할 : ExportCompaniesQueryDto HTTP export 요청 값을 검증하기 위한 DTO입니다.
export class ExportCompaniesQueryDto {
  @IsOptional()
  @IsString()
  companyName?: string;

  @IsOptional()
  @IsUUID()
  companyFieldId?: string;

  @IsOptional()
  @Transform(toOptionalStringArray)
  @IsArray()
  @IsUUID("all", { each: true })
  companyFieldIds?: string[];

  @IsOptional()
  @IsUUID()
  companyRegionId?: string;

  @IsOptional()
  @Transform(toOptionalStringArray)
  @IsArray()
  @IsUUID("all", { each: true })
  companyRegionIds?: string[];

  @IsOptional()
  @IsEnum(CompanyListSort)
  sort?: CompanyListSort;
}

// 역할 : CursorQueryDto HTTP 요청 값을 검증하기 위한 DTO입니다.
export class CursorQueryDto {
  @IsOptional()
  @IsString()
  cursor?: string;
}

// 역할 : CreateCompanyDto HTTP 요청 값을 검증하기 위한 DTO입니다.
export class CreateCompanyDto {
  @IsString()
  companyName!: string;

  @IsUUID()
  companyFieldId!: string;

  @IsUUID()
  companyRegionId!: string;

  @IsOptional()
  @IsString()
  companyMemo?: string | null;
}

// 역할 : UpdateCompanyDto HTTP 요청 값을 검증하기 위한 DTO입니다.
export class UpdateCompanyDto {
  @IsOptional()
  @IsString()
  companyName?: string;

  @IsOptional()
  @IsUUID()
  companyFieldId?: string;

  @IsOptional()
  @IsUUID()
  companyRegionId?: string;
}

// 역할 : CreateCompanyFieldDto HTTP 요청 값을 검증하기 위한 DTO입니다.
export class CreateCompanyFieldDto {
  @IsString()
  field!: string;
}

// 역할 : CreateCompanyRegionDto HTTP 요청 값을 검증하기 위한 DTO입니다.
export class CreateCompanyRegionDto {
  @IsString()
  region!: string;
}

// 역할 : CreateCompanyMemoLogDto HTTP 요청 값을 검증하기 위한 DTO입니다.
export class CreateCompanyMemoLogDto {
  @IsString()
  memoType!: string;

  @IsString()
  memo!: string;
}

// 역할 : UpdateCompanyMemoLogDto HTTP 요청 값을 검증하기 위한 DTO입니다.
export class UpdateCompanyMemoLogDto {
  @IsString()
  memoType!: string;

  @IsString()
  memo!: string;
}

// 역할 : CreateCompanyPrivateMemoLogDto HTTP 요청 값을 검증하기 위한 DTO입니다.
export class CreateCompanyPrivateMemoLogDto {
  @IsString()
  memo!: string;
}

// 역할 : UpdateCompanyPrivateMemoLogDto HTTP 요청 값을 검증하기 위한 DTO입니다.
export class UpdateCompanyPrivateMemoLogDto {
  @IsString()
  memo!: string;
}
