import type { ProductListParams } from "@/features/product/types/product";

export const productQueryKeys = {
  all: ["product"] as const,
  lists: () => [...productQueryKeys.all, "list"] as const,
  list: (params: ProductListParams) =>
    [
      ...productQueryKeys.lists(),
      {
        page: params.page ?? 1,
        productName: params.productName ?? "",
        productCategoryId: params.productCategoryId ?? "",
        productCategoryIds: params.productCategoryIds ?? [],
        productStatusId: params.productStatusId ?? "",
        productStatusIds: params.productStatusIds ?? [],
        sort: params.sort ?? "createdAtDesc",
      },
    ] as const,
  details: () => [...productQueryKeys.all, "detail"] as const,
  detail: (productId: string) =>
    [...productQueryKeys.details(), productId] as const,
  categories: () => [...productQueryKeys.all, "categories"] as const,
  statuses: () => [...productQueryKeys.all, "statuses"] as const,
  deals: (productId: string) =>
    [...productQueryKeys.detail(productId), "deals"] as const,
  memoLogs: (productId: string, cursor?: string) =>
    [...productQueryKeys.detail(productId), "memo-logs", cursor ?? ""] as const,
  privateMemoLogs: (productId: string, cursor?: string) =>
    [...productQueryKeys.detail(productId), "private-memo-logs", cursor ?? ""] as const,
};
