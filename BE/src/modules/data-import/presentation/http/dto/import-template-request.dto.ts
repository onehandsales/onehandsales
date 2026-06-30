import { Transform, Type, type TransformFnParams } from "class-transformer";
import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from "class-validator";

// 역할 : ImportTemplateTypeDto 데이터 불러오기 대상 타입 query 값을 정의합니다.
export enum ImportTemplateTypeDto {
  COMPANY = "COMPANY",
  CONTACT = "CONTACT",
  PRODUCT = "PRODUCT",
  DEAL = "DEAL",
}

// 역할 : DownloadImportTemplateQueryDto 양식 다운로드 query 값을 검증합니다.
export class DownloadImportTemplateQueryDto {
  @IsOptional()
  @IsString()
  companyName?: string;
}

// 역할 : ListImportUserLogsQueryDto 불러오기 내역 목록 query 값을 검증합니다.
export class ListImportUserLogsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsEnum(ImportTemplateTypeDto)
  targetType?: ImportTemplateTypeDto;

  @IsOptional()
  @Transform(toOptionalArray)
  @IsArray()
  @IsEnum(ImportTemplateTypeDto, { each: true })
  targetTypes?: ImportTemplateTypeDto[];
}

function toOptionalArray({ value }: TransformFnParams): string[] | undefined {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  return Array.isArray(value) ? value : [value];
}
