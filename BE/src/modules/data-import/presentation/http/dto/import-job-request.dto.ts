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
  MaxLength,
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

// 역할 : ListActiveImportJobsRequest 재개 가능한 import job 목록 query 값을 검증합니다.
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

// 역할 : CreateImportJobRequest 데이터 불러오기 파일 업로드 요청 body 값을 검증합니다.
export class CreateImportJobRequest {
  @IsIn(IMPORT_TEMPLATE_TYPE_VALUES)
  targetType!: ImportTemplateType;
}

// 역할 : GetImportJobRequest import job 상세 조회 query 값을 검증합니다.
export class GetImportJobRequest {
  @IsOptional()
  @Transform(({ value }) => transformOptionalBoolean(value))
  @IsBoolean()
  includeErrors?: boolean;
}

// 역할 : MapImportJobRequest import job 컬럼 매핑 생성 요청 body 값을 검증합니다.
export class MapImportJobRequest {
  @IsOptional()
  @IsIn(["AI", "RULE_BASED"])
  preferredSource?: "AI" | "RULE_BASED";
}

// 역할 : UpdateImportJobMappingRequest 사용자가 수정한 컬럼 매핑 body 값을 검증합니다.
export class UpdateImportJobMappingRequest {
  @IsObject()
  mapping!: Record<string, string | null>;
}

// 역할 : UpdateImportJobRowRequest 사용자가 보정한 단일 import row 값을 검증합니다.
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

// 역할 : UpdateImportJobRowsRequest 사용자가 보정한 import row 목록 body 값을 검증합니다.
export class UpdateImportJobRowsRequest {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateImportJobRowRequest)
  rows!: UpdateImportJobRowRequest[];
}

// 역할 : ValidateImportJobRequest 현재 저장된 mapping과 row 재검증 요청 body를 표현합니다.
export class ValidateImportJobRequest {}

// 역할 : CancelImportJobRequest import job 취소 요청 body를 표현합니다.
export class CancelImportJobRequest {}

// 역할 : ListImportJobErrorsRequest import job 오류 이력 query 값을 검증합니다.
export class ListImportJobErrorsRequest {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;
}

// 역할 : ConfirmImportJobRequest import job 최종 확정 요청 body 값을 검증합니다.
export class ConfirmImportJobRequest {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  idempotencyKey?: string;
}
