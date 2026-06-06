import { useQuery } from "@tanstack/react-query";
import { getImportJob } from "@/features/import-export/api/import-export-api";
import { importExportQueryKeys } from "@/features/import-export/api/import-export-query-keys";

export function useImportJobDetail(importJobId: string) {
  return useQuery({
    enabled: importJobId.length > 0,
    queryKey: importExportQueryKeys.importDetail(importJobId),
    queryFn: () => getImportJob(importJobId),
  });
}
