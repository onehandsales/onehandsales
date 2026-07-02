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
  | "PREVIEW_READY"
  | "MAPPING_PENDING"
  | "MAPPING_READY"
  | "VALIDATION_FAILED"
  | "CONFIRMED"
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED"
  | "CANCELED";

export type ExportJobStatus =
  | "PENDING"
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED"
  | "EXPIRED";

export type ImportRowStatus =
  | "PENDING"
  | "VALID"
  | "VALIDATION_FAILED"
  | "IMPORTED"
  | "SKIPPED"
  | "FAILED";

export type ImportFieldValue = string | number | null;
export type ImportMapping = Record<string, string | null>;
export type ImportRawRowData = Record<string, string>;
export type ImportMappedRowData = Record<string, ImportFieldValue>;

export type ImportError = {
  readonly rowNumber: number | null;
  readonly message: string;
};

export type ImportMappingResponse = {
  readonly suggestedMapping: ImportMapping;
  readonly confidence: number;
  readonly unmappedColumns: string[];
};

export type ImportJobRow = {
  readonly id: string;
  readonly rowNumber: number;
  readonly rawData: ImportRawRowData;
  readonly mappedData: ImportMappedRowData | null;
  readonly status: ImportRowStatus;
  readonly errorMessage: string | null;
  readonly targetId: string | null;
};

export type ImportJobResponse = {
  readonly id: string;
  readonly targetType: ImportTargetType;
  readonly status: ImportJobStatus;
  readonly rowCount: number;
  readonly validRowCount: number;
  readonly invalidRowCount: number;
  readonly mapping: ImportMapping | null;
  readonly aiMapping?: ImportMappingResponse | null;
  readonly previewRows: ImportJobRow[];
  readonly errors: ImportError[];
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type ImportJobDetailResponse = {
  readonly job: ImportJobResponse;
  readonly rows: ImportJobRow[];
  readonly errors: ImportError[];
};

export type ImportJobResultResponse = {
  readonly id: string;
  readonly status: ImportJobStatus;
  readonly successCount: number;
  readonly failedCount: number;
  readonly errors: ImportError[];
};

export type CreateImportJobInput = {
  readonly targetType: ImportTargetType;
  readonly file: File;
};

export type UpdateImportMappingInput = {
  readonly importJobId: string;
  readonly mapping: ImportMapping;
};

export type ConfirmImportJobInput = {
  readonly importJobId: string;
  readonly contactCompanyResolutions?: readonly {
    readonly companyName: string;
    readonly companyFieldName: string;
    readonly companyRegionName: string;
  }[];
  readonly dealCompanyResolutions?: readonly {
    readonly companyName: string;
    readonly companyFieldName: string;
    readonly companyRegionName: string;
  }[];
  readonly dealContactResolutions?: readonly {
    readonly companyName: string;
    readonly contactName: string;
    readonly contactEmail: string;
    readonly contactPhone: string;
    readonly contactDepartmentName: string;
    readonly contactJobGradeName: string;
  }[];
  readonly dealProductResolutions?: readonly {
    readonly productName: string;
    readonly productPrice: number;
    readonly productCategoryName: string;
    readonly productStatusName: string;
  }[];
  readonly rows?: readonly {
    readonly rowNumber: number;
    readonly data: ImportMappedRowData;
  }[];
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
