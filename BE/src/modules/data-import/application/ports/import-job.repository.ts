import type { ImportTemplateType } from "./import-template.repository";

export const IMPORT_JOB_REPOSITORY = Symbol("IMPORT_JOB_REPOSITORY");
export const IMPORT_JOB_ROW_REPOSITORY = Symbol("IMPORT_JOB_ROW_REPOSITORY");
export const IMPORT_JOB_ERROR_REPOSITORY = Symbol("IMPORT_JOB_ERROR_REPOSITORY");
export const IMPORT_UPLOADED_FILE_REPOSITORY = Symbol(
  "IMPORT_UPLOADED_FILE_REPOSITORY"
);

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

export type PersistentImportJobRowStatus =
  | "PENDING"
  | "VALID"
  | "INVALID"
  | "EXCLUDED"
  | "IMPORTED"
  | "FAILED";

export type PersistentImportJobMappingSource =
  | "NONE"
  | "AI"
  | "RULE_BASED"
  | "USER";

export type PersistentImportUploadedFileStatus =
  | "STORED"
  | "PARSED"
  | "DELETED"
  | "EXPIRED";

export type PersistentImportJobErrorType =
  | "PARSE"
  | "AI_MAPPING"
  | "VALIDATION"
  | "CONFIRM"
  | "STORAGE"
  | "SYSTEM";

export type PersistentImportJobErrorSeverity = "INFO" | "WARNING" | "ERROR";

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
  readonly expiresAt: Date;
  readonly confirmedAt: Date | null;
  readonly canceledAt: Date | null;
  readonly failedAt: Date | null;
  readonly lastErrorCode: string | null;
  readonly lastErrorMessage: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

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

export interface ImportJobDetailRecord extends ImportJobRecord {
  readonly rows: readonly ImportJobRowRecord[];
  readonly errors: readonly ImportJobErrorRecord[];
  readonly uploadedFile: ImportUploadedFileRecord | null;
}

export interface CreateImportJobRowInput {
  readonly rowNumber: number;
  readonly rawDataJson: unknown;
  readonly mappedDataJson?: unknown;
  readonly normalizedDataJson?: unknown | null;
  readonly status?: PersistentImportJobRowStatus;
  readonly validationErrorsJson?: unknown;
  readonly targetLabel?: string | null;
}

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

export interface CreateImportJobInput {
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

export interface FindImportJobForUserInput {
  readonly userId: string;
  readonly importJobId: string;
}

export interface ListActiveImportJobsForUserInput {
  readonly userId: string;
  readonly now: Date;
  readonly targetType?: ImportTemplateType;
  readonly limit?: number;
}

export interface UpdateImportJobStatusForUserInput
  extends FindImportJobForUserInput {
  readonly status: PersistentImportJobStatus;
  readonly importedRowCount?: number;
  readonly failedRowCount?: number;
  readonly importUserLogId?: string | null;
  readonly confirmedAt?: Date | null;
  readonly canceledAt?: Date | null;
  readonly failedAt?: Date | null;
  readonly lastErrorCode?: string | null;
  readonly lastErrorMessage?: string | null;
}

export type ListImportJobRowsForUserInput = FindImportJobForUserInput;

export interface CreateImportJobRowsInput extends FindImportJobForUserInput {
  readonly rows: readonly CreateImportJobRowInput[];
}

export type ListImportJobErrorsForUserInput = FindImportJobForUserInput;

export interface CreateImportJobErrorForUserInput
  extends FindImportJobForUserInput,
    CreateImportJobErrorInput {}

export interface CreateImportUploadedFileForUserInput
  extends FindImportJobForUserInput,
    CreateImportUploadedFileInput {}

export interface UpdateImportUploadedFileStatusForUserInput
  extends FindImportJobForUserInput {
  readonly status: PersistentImportUploadedFileStatus;
  readonly deletedAt?: Date | null;
}

export interface ImportJobRepository {
  runInTransaction<T>(
    work: (repositories: ImportJobRepositoryContext) => Promise<T>
  ): Promise<T>;
  createJob(input: CreateImportJobInput): Promise<ImportJobDetailRecord>;
  findJobByIdForUser(
    input: FindImportJobForUserInput
  ): Promise<ImportJobDetailRecord | null>;
  listActiveJobsForUser(
    input: ListActiveImportJobsForUserInput
  ): Promise<ImportJobRecord[]>;
  updateJobStatusForUser(
    input: UpdateImportJobStatusForUserInput
  ): Promise<boolean>;
}

export interface ImportJobRowRepository {
  createRows(input: CreateImportJobRowsInput): Promise<void>;
  listRowsForJob(input: ListImportJobRowsForUserInput): Promise<ImportJobRowRecord[]>;
}

export interface ImportJobErrorRepository {
  createError(input: CreateImportJobErrorForUserInput): Promise<ImportJobErrorRecord>;
  listErrorsForJob(
    input: ListImportJobErrorsForUserInput
  ): Promise<ImportJobErrorRecord[]>;
}

export interface ImportUploadedFileRepository {
  createUploadedFile(
    input: CreateImportUploadedFileForUserInput
  ): Promise<ImportUploadedFileRecord>;
  findUploadedFileForJob(
    input: FindImportJobForUserInput
  ): Promise<ImportUploadedFileRecord | null>;
  updateUploadedFileStatusForUser(
    input: UpdateImportUploadedFileStatusForUserInput
  ): Promise<boolean>;
}

export interface ImportJobRepositoryContext
  extends ImportJobRepository,
    ImportJobRowRepository,
    ImportJobErrorRepository,
    ImportUploadedFileRepository {}
