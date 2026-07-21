import { useQuery } from "@tanstack/react-query";
import {
  getExportJob,
  getImportJob,
  listActiveImportJobs,
  listImportJobErrors,
} from "@/features/import-export/api/import-export-api";
import { importExportQueryKeys } from "@/features/import-export/api/import-export-query-keys";
import type {
  ListActiveImportJobsParams,
  ListImportJobErrorsInput,
} from "@/features/import-export/types/import-export";

export function useActiveImportJobs(params: ListActiveImportJobsParams = {}) {
  return useQuery({
    queryKey: importExportQueryKeys.activeImportJobs(params),
    queryFn: () => listActiveImportJobs(params),
  });
}

export function useImportJobDetail(
  importJobId: string,
  options: { readonly includeErrors?: boolean } = {}
) {
  return useQuery({
    enabled: importJobId.length > 0,
    queryKey: importExportQueryKeys.importDetail(importJobId),
    queryFn: () =>
      getImportJob({
        importJobId,
        includeErrors: options.includeErrors,
      }),
  });
}

export function useImportJobErrors(input: ListImportJobErrorsInput) {
  return useQuery({
    enabled: input.importJobId.length > 0,
    queryKey: importExportQueryKeys.importErrors(input),
    queryFn: () => listImportJobErrors(input),
  });
}

export function useExportJobDetail(exportJobId: string, shouldPoll: boolean) {
  return useQuery({
    enabled: exportJobId.length > 0,
    queryKey: importExportQueryKeys.exportDetail(exportJobId),
    queryFn: () => getExportJob(exportJobId),
    refetchInterval: shouldPoll ? 2000 : false,
  });
}
