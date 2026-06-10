import { Type } from "class-transformer";
import {
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from "class-validator";

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

export class CursorQueryDto {
  @IsOptional()
  @IsString()
  cursor?: string;
}

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

export class CreateCompanyFieldDto {
  @IsString()
  field!: string;
}

export class CreateCompanyRegionDto {
  @IsString()
  region!: string;
}

export class CreateCompanyMemoLogDto {
  @IsString()
  memoType!: string;

  @IsString()
  memo!: string;
}

export class UpdateCompanyMemoLogDto {
  @IsString()
  memo!: string;
}

export class CreateCompanyPrivateMemoLogDto {
  @IsString()
  memo!: string;
}

export class UpdateCompanyPrivateMemoLogDto {
  @IsString()
  memo!: string;
}
