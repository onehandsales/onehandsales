import type { DealListParams } from "@/features/deal/types/deal";

export const dealQueryKeys = {
  all: ["deal"] as const,
  lists: () => [...dealQueryKeys.all, "list"] as const,
  list: (params: DealListParams) =>
    [
      ...dealQueryKeys.lists(),
      {
        page: params.page ?? 1,
        pageSize: params.pageSize ?? 20,
        search: params.search ?? "",
        stage: params.stage ?? "",
        likelihoodStatus: params.likelihoodStatus ?? "",
        nextActionStatus: params.nextActionStatus ?? "",
        companyId: params.companyId ?? "",
        contactId: params.contactId ?? "",
        includeDeleted: params.includeDeleted ?? false,
      },
    ] as const,
  details: () => [...dealQueryKeys.all, "detail"] as const,
  detail: (dealId: string) => [...dealQueryKeys.details(), dealId] as const,
};
