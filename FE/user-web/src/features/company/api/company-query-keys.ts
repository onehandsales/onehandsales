import type { CompanyListParams } from "@/features/company/types/company";

export const companyQueryKeys = {
  all: ["company"] as const,
  lists: () => [...companyQueryKeys.all, "list"] as const,
  list: (params: CompanyListParams) =>
    [
      ...companyQueryKeys.lists(),
      {
        page: params.page ?? 1,
        pageSize: params.pageSize ?? 20,
        search: params.search ?? "",
        includeDeleted: params.includeDeleted ?? false,
      },
    ] as const,
  details: () => [...companyQueryKeys.all, "detail"] as const,
  detail: (companyId: string) =>
    [...companyQueryKeys.details(), companyId] as const,
};
