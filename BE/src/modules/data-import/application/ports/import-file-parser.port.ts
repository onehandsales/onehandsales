import type { Buffer } from "node:buffer";

export const IMPORT_FILE_PARSER = Symbol("IMPORT_FILE_PARSER");

// 역할 : ImportUploadedFile 업로드된 불러오기 파일 정보를 표현합니다.
export interface ImportUploadedFile {
  readonly buffer: Buffer;
  readonly originalname: string;
  readonly mimetype: string;
  readonly size: number;
}

// 역할 : ParsedImportRow 엑셀/CSV 원본 row 데이터를 표현합니다.
export interface ParsedImportRow {
  readonly rowNumber: number;
  readonly rawData: Readonly<Record<string, string>>;
}

// 역할 : ParsedImportFile 불러오기 파일 파싱 결과를 표현합니다.
export interface ParsedImportFile {
  readonly sourceColumns: readonly string[];
  readonly rows: readonly ParsedImportRow[];
}

// 역할 : ImportFileParser 업로드 파일을 미리보기 row로 파싱하는 계약입니다.
export interface ImportFileParser {
  // 기능 : CSV/XLS/XLSX 파일을 헤더와 row 데이터로 파싱합니다.
  parse(file: ImportUploadedFile): Promise<ParsedImportFile>;
}
