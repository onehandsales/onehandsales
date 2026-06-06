import type {
  ImportTargetField,
  ImportTargetType,
} from "@/modules/import-export/application/import-target-fields";

export const IMPORT_MAPPING_PORT = Symbol("IMPORT_MAPPING_PORT");

export type ImportMapping = Record<string, string | null>;

export interface ImportMappingSuggestion {
  readonly suggestedMapping: ImportMapping;
  readonly confidence: number;
  readonly unmappedColumns: string[];
}

export interface GenerateImportMappingInput {
  readonly targetType: ImportTargetType;
  readonly sourceColumns: string[];
  readonly targetFields: readonly ImportTargetField[];
  readonly sampleRows: readonly Record<string, string>[];
}

export interface ImportMappingPort {
  generateMapping(input: GenerateImportMappingInput): Promise<ImportMappingSuggestion>;
}
