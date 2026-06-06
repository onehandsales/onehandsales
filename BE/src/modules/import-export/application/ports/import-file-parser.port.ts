import type { ImportTargetType } from "@/modules/import-export/application/import-target-fields";

export const IMPORT_FILE_PARSER_PORT = Symbol("IMPORT_FILE_PARSER_PORT");

export interface ParsedImportRow {
  readonly rowNumber: number;
  readonly rawData: Record<string, string>;
}

export interface ParsedImportFile {
  readonly sourceColumns: string[];
  readonly rows: ParsedImportRow[];
}

export interface ImportFileParserInput {
  readonly targetType: ImportTargetType;
  readonly fileName: string;
  readonly contentType: string;
  readonly buffer: Buffer;
}

export interface ImportFileParserPort {
  parse(input: ImportFileParserInput): Promise<ParsedImportFile>;
}
