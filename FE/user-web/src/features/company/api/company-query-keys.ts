import type { CompanyListParams } from "@/features/company/types/company";

export const companyQueryKeys = {
  all: ["company"] as const,
  lists: () => [...companyQueryKeys.all, "list"] as const,
  list: (params: CompanyListParams) =>
    [
      ...companyQueryKeys.lists(),
      {
        page: params.page ?? 1,
        companyName: params.companyName ?? "",
        companyFieldId: params.companyFieldId ?? "",
        companyFieldIds: params.companyFieldIds ?? [],
        companyRegionId: params.companyRegionId ?? "",
        companyRegionIds: params.companyRegionIds ?? [],
        sort: params.sort ?? "createdAtDesc",
      },
    ] as const,
  details: () => [...companyQueryKeys.all, "detail"] as const,
  detail: (companyId: string) =>
    [...companyQueryKeys.details(), companyId] as const,
  fields: () => [...companyQueryKeys.all, "field"] as const,
  regions: () => [...companyQueryKeys.all, "region"] as const,
  contacts: (companyId: string) =>
    [...companyQueryKeys.detail(companyId), "contact"] as const,
  deals: (companyId: string) =>
    [...companyQueryKeys.detail(companyId), "deal"] as const,
  memoLogs: (companyId: string) =>
    [...companyQueryKeys.detail(companyId), "memo-log"] as const,
  privateMemoLogs: (companyId: string) =>
    [...companyQueryKeys.detail(companyId), "private-memo-log"] as const,
};
