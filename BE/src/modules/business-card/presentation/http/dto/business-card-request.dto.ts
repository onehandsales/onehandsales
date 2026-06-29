import { Transform, type TransformFnParams, Type } from "class-transformer";
import { IsArray, IsEnum, IsInt, IsOptional, IsString, Min } from "class-validator";
import { BusinessCardScanStatusValue } from "@/modules/business-card/application/ports/business-card-scan-log.repository";

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

// 역할 : ListBusinessCardScansQueryDto 명함 스캔 목록 조회 query를 검증합니다.
export class ListBusinessCardScansQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Transform(toOptionalStringArray)
  @IsArray()
  @IsEnum(BusinessCardScanStatusValue, { each: true })
  status?: string[];
}

// 역할 : ConfirmBusinessCardScanDto 명함 OCR 결과 확정 저장 body를 검증합니다.
export class ConfirmBusinessCardScanDto {
  @IsString()
  companyName!: string;

  @IsOptional()
  @IsString()
  companyFieldName?: string | null;

  @IsOptional()
  @IsString()
  companyRegionName?: string | null;

  @IsString()
  contactName!: string;

  @IsString()
  contactMobile!: string;

  @IsString()
  contactEmail!: string;

  @IsOptional()
  @IsString()
  contactDepartmentName?: string | null;

  @IsOptional()
  @IsString()
  contactJobGradeName?: string | null;
}
