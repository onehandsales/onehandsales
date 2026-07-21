import type { ImportTemplateType } from "./import-template.repository";

export const IMPORT_JOB_REPOSITORY = Symbol("IMPORT_JOB_REPOSITORY");
export const IMPORT_JOB_ROW_REPOSITORY = Symbol("IMPORT_JOB_ROW_REPOSITORY");
export const IMPORT_JOB_ERROR_REPOSITORY = Symbol("IMPORT_JOB_ERROR_REPOSITORY");
export const IMPORT_UPLOADED_FILE_REPOSITORY = Symbol(
  "IMPORT_UPLOADED_FILE_REPOSITORY"
);

// 역할 : PersistentImportJobStatus 확정 전 import job lifecycle 상태를 정의합니다.
export type PersistentImportJobStatus =
  | "UPLOADED"
  | "MAPPED"
  | "NEEDS_REVIEW"
  | "READY_TO_CONFIRM"
  | "CONFIRMING"
  | "CONFIRMED"
  | "FAILED"
  | "CANCELED"
  | "EXPIRED";

// 역할 : PersistentImportJobRowStatus import job row별 검증/확정 상태를 정의합니다.
export type PersistentImportJobRowStatus =
  | "PENDING"
  | "VALID"
  | "INVALID"
  | "EXCLUDED"
  | "IMPORTED"
  | "FAILED";

// 역할 : PersistentImportJobMappingSource import job 컬럼 매핑의 출처를 정의합니다.
export type PersistentImportJobMappingSource =
  | "NONE"
  | "AI"
  | "RULE_BASED"
  | "USER";

// 역할 : PersistentImportUploadedFileStatus 업로드 원본 파일 보관 상태를 정의합니다.
export type PersistentImportUploadedFileStatus =
  | "STORED"
  | "PARSED"
  | "DELETED"
  | "EXPIRED";

// 역할 : PersistentImportJobErrorType import job 사용자 복구용 오류 유형을 정의합니다.
export type PersistentImportJobErrorType =
  | "PARSE"
  | "AI_MAPPING"
  | "VALIDATION"
  | "CONFIRM"
  | "STORAGE"
  | "SYSTEM";

// 역할 : PersistentImportJobErrorSeverity import job 오류 이력의 심각도를 정의합니다.
export type PersistentImportJobErrorSeverity = "INFO" | "WARNING" | "ERROR";

// 역할 : ImportJobRecord 확정 전 import job DB record를 application 계층에 전달합니다.
export interface ImportJobRecord {
  readonly id: string;
  readonly userId: string;
  readonly templateId: string;
  readonly targetType: ImportTemplateType;
  readonly templateVersion: string;
  readonly templateColumnsJson: unknown;
  readonly sourceColumnsJson: unknown;
  readonly status: PersistentImportJobStatus;
  readonly mappingJson: unknown;
  readonly mappingSource: PersistentImportJobMappingSource;
  readonly contextLabel: string | null;
  readonly contextJson: unknown;
  readonly originalFileName: string;
  readonly fileSizeBytes: number;
  readonly totalRowCount: number;
  readonly validRowCount: number;
  readonly invalidRowCount: number;
  readonly importedRowCount: number;
  readonly failedRowCount: number;
  readonly importUserLogId: string | null;
  readonly confirmIdempotencyKey: string | null;
  readonly expiresAt: Date;
  readonly confirmedAt: Date | null;
  readonly canceledAt: Date | null;
  readonly failedAt: Date | null;
  readonly lastErrorCode: string | null;
  readonly lastErrorMessage: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

// 역할 : ImportJobRowRecord 확정 전 import job row DB record를 application 계층에 전달합니다.
export interface ImportJobRowRecord {
  readonly id: string;
  readonly importJobId: string;
  readonly userId: string;
  readonly rowNumber: number;
  readonly rawDataJson: unknown;
  readonly mappedDataJson: unknown;
  readonly normalizedDataJson: unknown;
  readonly status: PersistentImportJobRowStatus;
  readonly validationErrorsJson: unknown;
  readonly targetLabel: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

// 역할 : ImportJobErrorRecord import job 사용자 복구용 오류 DB record를 전달합니다.
export interface ImportJobErrorRecord {
  readonly id: string;
  readonly importJobId: string;
  readonly importJobRowId: string | null;
  readonly userId: string;
  readonly errorType: PersistentImportJobErrorType;
  readonly errorCode: string;
  readonly severity: PersistentImportJobErrorSeverity;
  readonly rowNumber: number | null;
  readonly fieldKey: string | null;
  readonly safeMessage: string;
  readonly detailJson: unknown;
  readonly retryable: boolean;
  readonly createdAt: Date;
}

// 역할 : ImportUploadedFileRecord import job 원본 파일 metadata DB record를 전달합니다.
export interface ImportUploadedFileRecord {
  readonly id: string;
  readonly importJobId: string;
  readonly userId: string;
  readonly originalFileName: string;
  readonly mimeType: string;
  readonly fileSizeBytes: number;
  readonly checksum: string;
  readonly storageProvider: string;
  readonly storageBucket: string | null;
  readonly storageKey: string;
  readonly status: PersistentImportUploadedFileStatus;
  readonly uploadedAt: Date;
  readonly deletedAt: Date | null;
  readonly expiresAt: Date;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

// 역할 : ImportJobDetailRecord import job 상세 조회에 필요한 row/error/file 관계를 묶습니다.
export interface ImportJobDetailRecord extends ImportJobRecord {
  readonly rows: readonly ImportJobRowRecord[];
  readonly errors: readonly ImportJobErrorRecord[];
  readonly uploadedFile: ImportUploadedFileRecord | null;
}

// 역할 : CreateImportJobRowInput import job 생성 시 함께 저장할 row 값을 정의합니다.
export interface CreateImportJobRowInput {
  readonly rowNumber: number;
  readonly rawDataJson: unknown;
  readonly mappedDataJson?: unknown;
  readonly normalizedDataJson?: unknown | null;
  readonly status?: PersistentImportJobRowStatus;
  readonly validationErrorsJson?: unknown;
  readonly targetLabel?: string | null;
}

// 역할 : CreateImportUploadedFileInput import job 생성 시 함께 저장할 파일 metadata를 정의합니다.
export interface CreateImportUploadedFileInput {
  readonly originalFileName: string;
  readonly mimeType: string;
  readonly fileSizeBytes: number;
  readonly checksum: string;
  readonly storageProvider: string;
  readonly storageBucket?: string | null;
  readonly storageKey: string;
  readonly status?: PersistentImportUploadedFileStatus;
  readonly uploadedAt?: Date;
  readonly deletedAt?: Date | null;
  readonly expiresAt: Date;
}

// 역할 : CreateImportJobErrorInput import job 생성/처리 중 저장할 오류 이력 값을 정의합니다.
export interface CreateImportJobErrorInput {
  readonly importJobRowId?: string | null;
  readonly errorType: PersistentImportJobErrorType;
  readonly errorCode: string;
  readonly severity?: PersistentImportJobErrorSeverity;
  readonly rowNumber?: number | null;
  readonly fieldKey?: string | null;
  readonly safeMessage: string;
  readonly detailJson?: unknown | null;
  readonly retryable?: boolean;
}

// 역할 : CreateImportJobInput 확정 전 import job 생성 요청 값을 정의합니다.
export interface CreateImportJobInput {
  readonly id?: string;
  readonly userId: string;
  readonly templateId: string;
  readonly targetType: ImportTemplateType;
  readonly templateVersion: string;
  readonly templateColumnsJson: unknown;
  readonly sourceColumnsJson: unknown;
  readonly status?: PersistentImportJobStatus;
  readonly mappingJson?: unknown;
  readonly mappingSource?: PersistentImportJobMappingSource;
  readonly contextLabel?: string | null;
  readonly contextJson?: unknown | null;
  readonly originalFileName: string;
  readonly fileSizeBytes: number;
  readonly totalRowCount: number;
  readonly validRowCount?: number;
  readonly invalidRowCount?: number;
  readonly importedRowCount?: number;
  readonly failedRowCount?: number;
  readonly expiresAt: Date;
  readonly rows?: readonly CreateImportJobRowInput[];
  readonly uploadedFile?: CreateImportUploadedFileInput | null;
  readonly errors?: readonly CreateImportJobErrorInput[];
}

// 역할 : FindImportJobForUserInput 현재 사용자 소유 import job 조회 조건을 정의합니다.
export interface FindImportJobForUserInput {
  readonly userId: string;
  readonly importJobId: string;
  readonly includeErrors?: boolean;
  readonly errorLimit?: number;
}

// 역할 : ListActiveImportJobsForUserInput 재개 가능한 활성 import job 목록 조건을 정의합니다.
export interface ListActiveImportJobsForUserInput {
  readonly userId: string;
  readonly now: Date;
  readonly targetType?: ImportTemplateType;
  readonly limit?: number;
}

// 역할 : ListExpiredImportJobsForUserInput TTL이 지난 활성 import job 목록 조건을 정의합니다.
export interface ListExpiredImportJobsForUserInput {
  readonly userId: string;
  readonly now: Date;
  readonly importJobId?: string;
  readonly limit?: number;
}

// 역할 : ExpireImportJobsForUserInput TTL 만료 처리 대상 import job 조건을 정의합니다.
export interface ExpireImportJobsForUserInput {
  readonly userId: string;
  readonly now: Date;
  readonly importJobId?: string;
}

// 역할 : UpdateImportJobStatusForUserInput 현재 사용자 소유 import job 상태 변경 값을 정의합니다.
export interface UpdateImportJobStatusForUserInput
  extends FindImportJobForUserInput {
  readonly status: PersistentImportJobStatus;
  readonly expectedStatus?: PersistentImportJobStatus;
  readonly mappingJson?: unknown;
  readonly mappingSource?: PersistentImportJobMappingSource;
  readonly validRowCount?: number;
  readonly invalidRowCount?: number;
  readonly importedRowCount?: number;
  readonly failedRowCount?: number;
  readonly importUserLogId?: string | null;
  readonly confirmedAt?: Date | null;
  readonly canceledAt?: Date | null;
  readonly failedAt?: Date | null;
  readonly lastErrorCode?: string | null;
  readonly lastErrorMessage?: string | null;
}

// 역할 : ListImportJobRowsForUserInput 현재 사용자 소유 import job row 목록 조건을 정의합니다.
export type ListImportJobRowsForUserInput = FindImportJobForUserInput;

// 역할 : CreateImportJobRowsInput 현재 사용자 소유 import job에 추가할 row 목록을 정의합니다.
export interface CreateImportJobRowsInput extends FindImportJobForUserInput {
  readonly rows: readonly CreateImportJobRowInput[];
}

// 역할 : UpdateImportJobRowInput import job row의 검증/정규화 결과 변경 값을 정의합니다.
export interface UpdateImportJobRowInput {
  readonly rowId: string;
  readonly mappedDataJson?: unknown;
  readonly normalizedDataJson?: unknown | null;
  readonly status?: PersistentImportJobRowStatus;
  readonly validationErrorsJson?: unknown;
  readonly targetLabel?: string | null;
}

// 역할 : UpdateImportJobRowsForUserInput 현재 사용자 소유 import job row 일괄 변경 값을 정의합니다.
export interface UpdateImportJobRowsForUserInput
  extends FindImportJobForUserInput {
  readonly rows: readonly UpdateImportJobRowInput[];
}

// 역할 : ListImportJobErrorsForUserInput 현재 사용자 소유 import job 오류 목록 조건을 정의합니다.
export type ListImportJobErrorsForUserInput = FindImportJobForUserInput;

// 역할 : CreateImportJobErrorForUserInput 현재 사용자 소유 import job 오류 생성 값을 정의합니다.
export interface CreateImportJobErrorForUserInput
  extends FindImportJobForUserInput,
    CreateImportJobErrorInput {}

// 역할 : ListImportJobErrorsPageForUserInput import job 오류 이력 paging 조건을 정의합니다.
export interface ListImportJobErrorsPageForUserInput
  extends FindImportJobForUserInput {
  readonly limit?: number;
}

// 역할 : CreateImportUploadedFileForUserInput 현재 사용자 소유 import job 파일 metadata 생성 값을 정의합니다.
export interface CreateImportUploadedFileForUserInput
  extends FindImportJobForUserInput,
    CreateImportUploadedFileInput {}

// 역할 : UpdateImportUploadedFileStatusForUserInput 현재 사용자 소유 import job 파일 상태 변경 값을 정의합니다.
export interface UpdateImportUploadedFileStatusForUserInput
  extends FindImportJobForUserInput {
  readonly status: PersistentImportUploadedFileStatus;
  readonly deletedAt?: Date | null;
}

// 역할 : ImportJobRepository import job aggregate 영속성 계약을 정의합니다.
export interface ImportJobRepository {
  // 기능 : import job 관련 repository 작업을 하나의 DB transaction으로 실행합니다.
  runInTransaction<T>(
    work: (repositories: ImportJobRepositoryContext) => Promise<T>
  ): Promise<T>;

  // 기능 : import job과 초기 row/file/error 관계를 생성합니다.
  createJob(input: CreateImportJobInput): Promise<ImportJobDetailRecord>;

  // 기능 : 현재 사용자 소유 import job 상세를 조회합니다.
  findJobByIdForUser(
    input: FindImportJobForUserInput
  ): Promise<ImportJobDetailRecord | null>;

  // 기능 : 현재 사용자가 재개할 수 있는 활성 import job 목록을 조회합니다.
  listActiveJobsForUser(
    input: ListActiveImportJobsForUserInput
  ): Promise<ImportJobRecord[]>;

  // 기능 : 현재 사용자 소유의 TTL 만료 대상 활성 import job 목록을 조회합니다.
  listExpiredActiveJobsForUser(
    input: ListExpiredImportJobsForUserInput
  ): Promise<ImportJobDetailRecord[]>;

  // 기능 : 현재 사용자 소유 import job을 TTL 만료 상태로 변경합니다.
  expireJobsForUser(input: ExpireImportJobsForUserInput): Promise<number>;

  // 기능 : 현재 사용자 소유 import job 상태와 집계 field를 변경합니다.
  updateJobStatusForUser(
    input: UpdateImportJobStatusForUserInput
  ): Promise<boolean>;
}

// 역할 : ImportJobRowRepository import job row 영속성 계약을 정의합니다.
export interface ImportJobRowRepository {
  // 기능 : 현재 사용자 소유 import job에 row 목록을 추가합니다.
  createRows(input: CreateImportJobRowsInput): Promise<void>;

  // 기능 : 현재 사용자 소유 import job의 row 목록을 조회합니다.
  listRowsForJob(
    input: ListImportJobRowsForUserInput
  ): Promise<ImportJobRowRecord[]>;

  // 기능 : 현재 사용자 소유 import job의 row 목록을 일괄 변경합니다.
  updateRowsForJob(input: UpdateImportJobRowsForUserInput): Promise<boolean>;
}

// 역할 : ImportJobErrorRepository import job 사용자 복구용 오류 이력 영속성 계약을 정의합니다.
export interface ImportJobErrorRepository {
  // 기능 : 현재 사용자 소유 import job에 오류 이력을 생성합니다.
  createError(
    input: CreateImportJobErrorForUserInput
  ): Promise<ImportJobErrorRecord>;

  // 기능 : 현재 사용자 소유 import job의 오류 이력을 조회합니다.
  listErrorsForJob(
    input: ListImportJobErrorsPageForUserInput
  ): Promise<ImportJobErrorRecord[]>;
}

// 역할 : ImportUploadedFileRepository import job 원본 파일 metadata 영속성 계약을 정의합니다.
export interface ImportUploadedFileRepository {
  // 기능 : 현재 사용자 소유 import job의 원본 파일 metadata를 생성합니다.
  createUploadedFile(
    input: CreateImportUploadedFileForUserInput
  ): Promise<ImportUploadedFileRecord>;

  // 기능 : 현재 사용자 소유 import job의 원본 파일 metadata를 조회합니다.
  findUploadedFileForJob(
    input: FindImportJobForUserInput
  ): Promise<ImportUploadedFileRecord | null>;

  // 기능 : 현재 사용자 소유 import job의 원본 파일 metadata 상태를 변경합니다.
  updateUploadedFileStatusForUser(
    input: UpdateImportUploadedFileStatusForUserInput
  ): Promise<boolean>;
}

// 역할 : ImportJobRepositoryContext transaction 안에서 사용할 import job repository 묶음을 정의합니다.
export interface ImportJobRepositoryContext
  extends ImportJobRepository,
    ImportJobRowRepository,
    ImportJobErrorRepository,
    ImportUploadedFileRepository {}
