import type { ImportMappingSuggestion } from "./import-job.store";
import type { ImportTemplateType } from "./import-template.repository";

export const IMPORT_MAPPING_PROVIDER = Symbol("IMPORT_MAPPING_PROVIDER");

// 역할 : ImportMappingTargetField 매핑 대상 필드 정의를 표현합니다.
export interface ImportMappingTargetField {
  readonly key: string;
  readonly label: string;
  readonly required: boolean;
  readonly type: string;
}

// 역할 : GenerateImportMappingInput AI 매핑 요청 입력을 표현합니다.
export interface GenerateImportMappingInput {
  readonly targetType: ImportTemplateType;
  readonly targetFields: readonly ImportMappingTargetField[];
  readonly sourceColumns: readonly string[];
  readonly sampleRows: readonly Readonly<Record<string, string>>[];
}

// 역할 : ImportMappingProvider 원본 컬럼을 템플릿 필드로 매핑하는 AI 계약입니다.
export interface ImportMappingProvider {
  // 기능 : 원본 컬럼과 대상 필드 정의를 기반으로 컬럼 매핑을 제안합니다.
  generate(input: GenerateImportMappingInput): Promise<ImportMappingSuggestion>;
}
