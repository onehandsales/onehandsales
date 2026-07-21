import { Transform, Type } from "class-transformer";
import {
  IsArray,
  IsBoolean,
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

// 역할 : CreateImportJobDto 데이터 불러오기 파일 업로드 요청 값을 검증합니다.
export class ListActiveImportJobsRequest {
  @IsOptional()
  @IsIn(IMPORT_TEMPLATE_TYPE_VALUES)
  targetType?: ImportTemplateType;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;
}

export class CreateImportJobRequest {
  @IsIn(IMPORT_TEMPLATE_TYPE_VALUES)
  targetType!: ImportTemplateType;
}

export class GetImportJobRequest {
  @IsOptional()
  @Transform(({ value }) => transformOptionalBoolean(value))
  @IsBoolean()
  includeErrors?: boolean;
}

export class MapImportJobRequest {
  @IsOptional()
  @IsIn(["AI", "RULE_BASED"])
  preferredSource?: "AI" | "RULE_BASED";
}

export class UpdateImportJobMappingRequest {
  @IsObject()
  mapping!: Record<string, string | null>;
}

export class UpdateImportJobRowRequest {
  @IsString()
  @IsNotEmpty()
  rowId!: string;

  @IsObject()
  data!: Record<string, unknown>;

  @IsOptional()
  @IsBoolean()
  excluded?: boolean;
}

export class UpdateImportJobRowsRequest {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateImportJobRowRequest)
  rows!: UpdateImportJobRowRequest[];
}

export class ValidateImportJobRequest {}

export class CancelImportJobRequest {}

export class ListImportJobErrorsRequest {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;
}

export class ConfirmImportJobRequest {
  @IsOptional()
  @IsString()
  idempotencyKey?: string;
}
