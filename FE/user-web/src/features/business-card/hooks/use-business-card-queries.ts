import { useQuery } from "@tanstack/react-query";
import {
  getBusinessCardScanLog,
  listBusinessCardScanLogs,
} from "@/features/business-card/api/business-card-api";
import { businessCardQueryKeys } from "@/features/business-card/api/business-card-query-keys";
import type { ListBusinessCardScanLogsParams } from "@/features/business-card/types/business-card";

export function useBusinessCardScanLogs(params: ListBusinessCardScanLogsParams) {
  return useQuery({
    queryKey: businessCardQueryKeys.list(params),
    queryFn: () => listBusinessCardScanLogs(params),
  });
}

export function useBusinessCardScanLogDetail(scanLogId: string | null) {
  return useQuery({
    enabled: Boolean(scanLogId),
    queryKey: businessCardQueryKeys.detail(scanLogId ?? ""),
    queryFn: () => getBusinessCardScanLog(scanLogId ?? ""),
  });
}
