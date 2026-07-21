import type { ImportTemplateColumn } from "@/features/import-export/types/import-template";

export type ImportTargetType = "COMPANY" | "CONTACT" | "PRODUCT" | "DEAL";
export type ExportTargetType =
  | "COMPANY"
  | "CONTACT"
  | "PRODUCT"
  | "DEAL"
  | "SCHEDULE"
  | "MEETING_NOTE";

export type ExportFormat = "EXCEL" | "PDF";

export type ImportJobStatus =
  | "UPLOADED"
  | "MAPPED"
  | "NEEDS_REVIEW"
  | "READY_TO_CONFIRM"
  | "CONFIRMING"
  | "CONFIRMED"
  | "FAILED"
  | "CANCELED"
  | "EXPIRED";

export type ImportJobRowStatus =
  | "PENDING"
  | "VALID"
  | "INVALID"
  | "EXCLUDED"
  | "IMPORTED"
  | "FAILED";

export type ImportRowStatus = ImportJobRowStatus;

export type ImportJobMappingSource = "NONE" | "AI" | "RULE_BASED" | "USER";

export type ExportJobStatus =
  | "PENDING"
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED"
  | "EXPIRED";

export type ImportFieldValue = string | number | boolean | null;
export type ImportMapping = Record<string, string | null>;
export type ImportMappedRowData = Record<string, ImportFieldValue>;
export type ImportRawRowData = Record<string, string>;

export type ImportCellValidationError = {
  readonly fieldKey: string;
  readonly message: string;
  readonly code: string;
};

export type ImportJobErrorResponse = {
  readonly id: string;
  readonly rowId: string | null;
  readonly rowNumber: number | null;
  readonly fieldKey: string | null;
  readonly errorType: string;
  readonly errorCode: string;
  readonly severity: string;
  readonly safeMessage: string;
  readonly retryable: boolean;
  readonly createdAt: string;
};

export type ImportError = ImportJobErrorResponse;

export type ImportJobRow = {
  readonly rowId: string;
  readonly rowNumber: number;
  readonly status: ImportJobRowStatus;
  readonly data: ImportMappedRowData;
  readonly targetLabel: string | null;
  readonly errors: readonly ImportCellValidationError[];
};

export type ImportJobSummary = {
  readonly id: string;
  readonly targetType: ImportTargetType;
  readonly status: ImportJobStatus;
  readonly mappingSource: ImportJobMappingSource;
  readonly originalFileName: string;
  readonly totalRowCount: number;
  readonly validRowCount: number;
  readonly invalidRowCount: number;
  readonly importedRowCount: number;
  readonly failedRowCount: number;
  readonly importUserLogId: string | null;
  readonly expiresAt: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type ImportJobResponse = ImportJobSummary;

export type ActiveImportJobsResponse = {
  readonly items: ImportJobSummary[];
};

export type ImportJobDetailResponse = {
  readonly job: ImportJobSummary;
  readonly templateColumns: ImportTemplateColumn[];
  readonly sourceColumns: readonly string[];
  readonly mapping: ImportMapping;
  readonly rows: ImportJobRow[];
  readonly errors: readonly ImportJobErrorResponse[];
};

export type ImportMappingResponse = ImportJobDetailResponse;

export type ConfirmImportJobResponse = {
  readonly importJobId: string;
  readonly importUserLogId: string;
  readonly status: "CONFIRMED";
  readonly importedRowCount: number;
};

export type ImportJobResultResponse = ConfirmImportJobResponse;

export type ImportJobErrorsResponse = {
  readonly items: ImportJobErrorResponse[];
};

export type ListActiveImportJobsParams = {
  readonly targetType?: ImportTargetType;
  readonly limit?: number;
};

export type CreateImportJobInput = {
  readonly targetType: ImportTargetType;
  readonly file: File;
};

export type GetImportJobInput = {
  readonly importJobId: string;
  readonly includeErrors?: boolean;
};

export type GenerateImportMappingInput = {
  readonly importJobId: string;
  readonly preferredSource?: "AI" | "RULE_BASED";
};

export type UpdateImportMappingInput = {
  readonly importJobId: string;
  readonly mapping: ImportMapping;
};

export type UpdateImportJobRowsInput = {
  readonly importJobId: string;
  readonly rows: readonly {
    readonly rowId: string;
    readonly data: ImportMappedRowData;
    readonly excluded?: boolean;
  }[];
};

export type ConfirmImportJobInput = {
  readonly importJobId: string;
  readonly idempotencyKey?: string;
};

export type CancelImportJobInput = {
  readonly importJobId: string;
};

export type ListImportJobErrorsInput = {
  readonly importJobId: string;
  readonly limit?: number;
};

export type ExportJobResponse = {
  readonly id: string;
  readonly targetType: ExportTargetType;
  readonly format: ExportFormat;
  readonly status: ExportJobStatus;
  readonly includeSensitiveData: boolean;
  readonly downloadReady: boolean;
  readonly createdAt: string;
};

export type ExportDownloadResponse = {
  readonly downloadUrl: string;
  readonly expiresAt: string;
};

export type CreateExportJobInput = {
  readonly targetType: ExportTargetType;
  readonly format: ExportFormat;
  readonly includeSensitiveData: boolean;
  readonly sensitiveConfirm: boolean;
  readonly filters?: Record<string, unknown>;
};

export type DownloadExportFileInput = {
  readonly exportJobId: string;
};
