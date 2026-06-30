import type { ImportTemplateType } from "./import-template.repository";

export const IMPORT_JOB_STORE = Symbol("IMPORT_JOB_STORE");

export type ImportFieldValue = string | number | null;
export type ImportRawRowData = Readonly<Record<string, string>>;
export type ImportMappedRowData = Readonly<Record<string, ImportFieldValue>>;
export type ImportMapping = Readonly<Record<string, string | null>>;

export type ImportJobStatus =
  | "UPLOADED"
  | "PREVIEW_READY"
  | "MAPPING_READY"
  | "VALIDATION_FAILED"
  | "COMPLETED";

// 역할 : ImportMappingSuggestion AI 컬럼 매핑 제안 결과를 표현합니다.
export interface ImportMappingSuggestion {
  readonly suggestedMapping: ImportMapping;
  readonly confidence: number;
  readonly unmappedColumns: readonly string[];
}

// 역할 : StoredImportJobRow 임시 불러오기 job row 상태를 표현합니다.
export interface StoredImportJobRow {
  readonly id: string;
  readonly rowNumber: number;
  readonly rawData: ImportRawRowData;
  readonly mappedData: ImportMappedRowData | null;
  readonly status: "PENDING" | "VALID" | "VALIDATION_FAILED";
  readonly errorMessage: string | null;
}

// 역할 : StoredImportJob 확정 전 임시 불러오기 job 상태를 표현합니다.
export interface StoredImportJob {
  readonly id: string;
  readonly userId: string;
  readonly targetType: ImportTemplateType;
  readonly templateVersion: string;
  readonly templateColumnsJson: unknown;
  readonly originalFileName: string;
  readonly fileSizeBytes: number;
  readonly sourceColumns: readonly string[];
  readonly status: ImportJobStatus;
  readonly rowCount: number;
  readonly validRowCount: number;
  readonly invalidRowCount: number;
  readonly mapping: ImportMapping | null;
  readonly aiMapping: ImportMappingSuggestion | null;
  readonly rows: readonly StoredImportJobRow[];
  readonly errors: readonly ImportJobError[];
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

// 역할 : ImportJobError 불러오기 job 검증 오류를 표현합니다.
export interface ImportJobError {
  readonly rowNumber: number | null;
  readonly message: string;
}

// 역할 : SaveImportJobInput 임시 job 저장 입력을 표현합니다.
export interface SaveImportJobInput {
  readonly job: StoredImportJob;
}

// 역할 : UpdateImportJobInput 임시 job 수정 입력을 표현합니다.
export interface UpdateImportJobInput {
  readonly job: StoredImportJob;
}

// 역할 : ImportJobStore 확정 전 임시 job 저장소 계약입니다.
export interface ImportJobStore {
  // 기능 : 임시 불러오기 job을 저장합니다.
  save(input: SaveImportJobInput): Promise<void>;
  // 기능 : 현재 사용자 소유 임시 불러오기 job을 조회합니다.
  findById(input: {
    readonly userId: string;
    readonly importJobId: string;
  }): Promise<StoredImportJob | null>;
  // 기능 : 임시 불러오기 job 상태를 교체 저장합니다.
  update(input: UpdateImportJobInput): Promise<void>;
  // 기능 : 확정 완료된 임시 불러오기 job을 제거합니다.
  delete(input: {
    readonly userId: string;
    readonly importJobId: string;
  }): Promise<void>;
}
