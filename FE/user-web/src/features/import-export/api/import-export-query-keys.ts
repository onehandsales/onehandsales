import type {
  ListActiveImportJobsParams,
  ListImportJobErrorsInput,
} from "@/features/import-export/types/import-export";

export const importExportQueryKeys = {
  importJobs: () => ["importJobs"] as const,
  activeImportJobs: (params: ListActiveImportJobsParams = {}) =>
    [...importExportQueryKeys.importJobs(), "active", { ...params }] as const,
  importDetail: (importJobId: string) =>
    [...importExportQueryKeys.importJobs(), importJobId] as const,
  importErrors: (input: ListImportJobErrorsInput) =>
    [
      ...importExportQueryKeys.importDetail(input.importJobId),
      "errors",
      { limit: input.limit },
    ] as const,
  exports: () => ["import-export", "exports"] as const,
  exportDetail: (exportJobId: string) =>
    [...importExportQueryKeys.exports(), exportJobId] as const,
};
