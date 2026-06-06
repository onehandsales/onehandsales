import type {
  ImportErrorRecord,
  ImportJobDetailRecord,
  ImportJobResultRecord,
  ImportJobRowRecord,
} from "@/modules/import-export/application/ports/import-export.repository";

export interface ImportJobRowResponse {
  readonly id: string;
  readonly rowNumber: number;
  readonly rawData: Record<string, string>;
  readonly mappedData: Record<string, string | number | null> | null;
  readonly status: string;
  readonly errorMessage: string | null;
  readonly targetId: string | null;
}

export interface ImportJobResponse {
  readonly id: string;
  readonly targetType: string;
  readonly status: string;
  readonly rowCount: number;
  readonly validRowCount: number;
  readonly invalidRowCount: number;
  readonly mapping: Record<string, string | null> | null;
  readonly aiMapping: {
    readonly suggestedMapping: Record<string, string | null>;
    readonly confidence: number;
    readonly unmappedColumns: string[];
  } | null;
  readonly previewRows: ImportJobRowResponse[];
  readonly errors: ImportErrorRecord[];
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface ImportJobDetailResponse {
  readonly job: ImportJobResponse;
  readonly rows: ImportJobRowResponse[];
  readonly errors: ImportErrorRecord[];
}

export interface ImportJobResultResponse {
  readonly id: string;
  readonly status: string;
  readonly successCount: number;
  readonly failedCount: number;
  readonly errors: ImportErrorRecord[];
}

export function toImportJobResponse(
  detail: ImportJobDetailRecord
): ImportJobResponse {
  const rows = detail.rows.map(toImportJobRowResponse);
  const errors = collectImportErrors(detail.rows);

  return {
    id: detail.job.id,
    targetType: detail.job.targetType,
    status: detail.job.status,
    rowCount: detail.rows.length,
    validRowCount: countRows(detail.rows, ["VALID", "IMPORTED"]),
    invalidRowCount: countRows(detail.rows, ["VALIDATION_FAILED", "FAILED"]),
    mapping: detail.job.userMapping,
    aiMapping: detail.job.aiMapping,
    previewRows: rows,
    errors,
    createdAt: detail.job.createdAt.toISOString(),
    updatedAt: detail.job.updatedAt.toISOString(),
  };
}

export function toImportJobDetailResponse(
  detail: ImportJobDetailRecord
): ImportJobDetailResponse {
  return {
    job: toImportJobResponse(detail),
    rows: detail.rows.map(toImportJobRowResponse),
    errors: collectImportErrors(detail.rows),
  };
}

export function toImportJobResultResponse(
  result: ImportJobResultRecord
): ImportJobResultResponse {
  return {
    id: result.id,
    status: result.status,
    successCount: result.successCount,
    failedCount: result.failedCount,
    errors: result.errors,
  };
}

function toImportJobRowResponse(row: ImportJobRowRecord): ImportJobRowResponse {
  return {
    id: row.id,
    rowNumber: row.rowNumber,
    rawData: row.rawData,
    mappedData: row.mappedData,
    status: row.status,
    errorMessage: row.errorMessage,
    targetId: row.targetId,
  };
}

function collectImportErrors(rows: readonly ImportJobRowRecord[]) {
  return rows
    .filter((row) => row.errorMessage)
    .map((row) => ({
      rowNumber: row.rowNumber,
      message: row.errorMessage ?? "",
    }));
}

function countRows(
  rows: readonly ImportJobRowRecord[],
  statuses: readonly string[]
): number {
  return rows.filter((row) => statuses.includes(row.status)).length;
}
