import type { ImportUserLogListParams } from "@/features/import-export/types/import-user-log";

export const importTemplateQueryKeys = {
  all: ["import-template"] as const,
  active: () => [...importTemplateQueryKeys.all, "active"] as const,
};

export const importUserLogQueryKeys = {
  all: ["import-user-log"] as const,
  lists: () => [...importUserLogQueryKeys.all, "list"] as const,
  list: (params: ImportUserLogListParams) =>
    [...importUserLogQueryKeys.lists(), { ...params }] as const,
  details: () => [...importUserLogQueryKeys.all, "detail"] as const,
  detail: (importUserLogId: string) =>
    [...importUserLogQueryKeys.details(), importUserLogId] as const,
};
