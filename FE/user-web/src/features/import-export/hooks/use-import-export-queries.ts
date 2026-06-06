import { useQuery } from "@tanstack/react-query";
import {
  getExportJob,
  getImportJob,
} from "@/features/import-export/api/import-export-api";
import { importExportQueryKeys } from "@/features/import-export/api/import-export-query-keys";

export function useImportJobDetail(importJobId: string) {
  return useQuery({
    enabled: importJobId.length > 0,
    queryKey: importExportQueryKeys.importDetail(importJobId),
    queryFn: () => getImportJob(importJobId),
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
