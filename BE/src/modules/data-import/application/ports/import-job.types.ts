// 역할 : ImportFieldValue import row cell이 application 계층에서 가질 수 있는 값을 정의합니다.
export type ImportFieldValue = string | number | null;

// 역할 : ImportRawRowData 업로드 파일에서 파싱한 원본 row 데이터를 정의합니다.
export type ImportRawRowData = Readonly<Record<string, string>>;

// 역할 : ImportMappedRowData 원본 컬럼 매핑 후 대상 필드별 값을 정의합니다.
export type ImportMappedRowData = Readonly<Record<string, ImportFieldValue>>;

// 역할 : ImportMapping 대상 필드 key와 원본 컬럼명 연결 정보를 정의합니다.
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
