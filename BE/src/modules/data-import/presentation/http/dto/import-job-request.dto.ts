import { Type } from "class-transformer";
import {
  IsArray,
  IsEmail,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from "class-validator";
import type { ImportTemplateType } from "@/modules/data-import/application/ports/import-template.repository";

const IMPORT_TEMPLATE_TYPE_VALUES: readonly ImportTemplateType[] = [
  "COMPANY",
  "CONTACT",
  "PRODUCT",
  "DEAL",
];

// 역할 : CreateImportJobDto 데이터 불러오기 파일 업로드 요청 값을 검증합니다.
export class CreateImportJobDto {
  @IsIn(IMPORT_TEMPLATE_TYPE_VALUES)
  targetType!: ImportTemplateType;
}

// 역할 : UpdateImportMappingDto 데이터 불러오기 컬럼 매핑 수정 요청 값을 검증합니다.
export class UpdateImportMappingDto {
  @IsObject()
  mapping!: Record<string, string | null>;
}

// 역할 : ConfirmImportJobRowDto 데이터 불러오기 확정 row 요청 값을 검증합니다.
export class ConfirmImportJobRowDto {
  @Type(() => Number)
  @IsInt()
  @Min(2)
  rowNumber!: number;

  @IsObject()
  data!: Record<string, unknown>;
}

// 역할 : 담당자 불러오기 중 새 회사 생성 보정 요청 값을 검증합니다.
export class ConfirmContactCompanyResolutionDto {
  @IsString()
  @IsNotEmpty()
  companyName!: string;

  @IsString()
  @IsNotEmpty()
  companyFieldName!: string;

  @IsString()
  @IsNotEmpty()
  companyRegionName!: string;
}

// 역할 : 딜 불러오기 중 새 회사 생성 보정 요청 값을 검증합니다.
export class ConfirmDealCompanyResolutionDto extends ConfirmContactCompanyResolutionDto {}

// 역할 : 딜 불러오기 중 새 담당자 생성 보정 요청 값을 검증합니다.
export class ConfirmDealContactResolutionDto {
  @IsString()
  @IsNotEmpty()
  companyName!: string;

  @IsString()
  @IsNotEmpty()
  contactName!: string;

  @IsEmail()
  contactEmail!: string;

  @IsString()
  @IsNotEmpty()
  contactPhone!: string;

  @IsString()
  @IsNotEmpty()
  contactDepartmentName!: string;

  @IsString()
  @IsNotEmpty()
  contactJobGradeName!: string;
}

// 역할 : 딜 불러오기 중 새 제품 생성 보정 요청 값을 검증합니다.
export class ConfirmDealProductResolutionDto {
  @IsString()
  @IsNotEmpty()
  productName!: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  productPrice!: number;

  @IsString()
  @IsNotEmpty()
  productCategoryName!: string;

  @IsString()
  @IsNotEmpty()
  productStatusName!: string;
}

// 역할 : ConfirmImportJobDto 데이터 불러오기 확정 요청 값을 검증합니다.
export class ConfirmImportJobDto {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConfirmContactCompanyResolutionDto)
  contactCompanyResolutions?: ConfirmContactCompanyResolutionDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConfirmDealCompanyResolutionDto)
  dealCompanyResolutions?: ConfirmDealCompanyResolutionDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConfirmDealContactResolutionDto)
  dealContactResolutions?: ConfirmDealContactResolutionDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConfirmDealProductResolutionDto)
  dealProductResolutions?: ConfirmDealProductResolutionDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConfirmImportJobRowDto)
  rows?: ConfirmImportJobRowDto[];
}
