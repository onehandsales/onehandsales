import { Type } from "class-transformer";
import {
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from "class-validator";

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
  @IsUUID()
  companyRegionId?: string;
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
