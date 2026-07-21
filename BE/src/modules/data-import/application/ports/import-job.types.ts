export type ImportFieldValue = string | number | null;
export type ImportRawRowData = Readonly<Record<string, string>>;
export type ImportMappedRowData = Readonly<Record<string, ImportFieldValue>>;
export type ImportMapping = Readonly<Record<string, string | null>>;

// 역할 : ImportMappingSuggestion AI 또는 규칙 기반 컬럼 매핑 제안 결과를 표현합니다.
export interface ImportMappingSuggestion {
  readonly suggestedMapping: ImportMapping;
  readonly confidence: number;
  readonly unmappedColumns: readonly string[];
}

// 역할 : ImportJobError import 작업 중 사용자에게 보여줄 수 있는 row 오류를 표현합니다.
export interface ImportJobError {
  readonly rowNumber: number | null;
  readonly message: string;
}
