import type { ListBusinessCardScanLogsParams } from "@/features/business-card/types/business-card";

export const businessCardQueryKeys = {
  all: ["business-card-scans"] as const,
  lists: () => [...businessCardQueryKeys.all, "list"] as const,
  list: (params: ListBusinessCardScanLogsParams) =>
    [...businessCardQueryKeys.lists(), params] as const,
  details: () => [...businessCardQueryKeys.all, "detail"] as const,
  detail: (scanLogId: string) =>
    [...businessCardQueryKeys.details(), scanLogId] as const,
};
