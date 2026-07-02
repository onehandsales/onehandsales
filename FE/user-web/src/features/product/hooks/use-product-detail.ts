import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import {
  getProduct,
  listCategories,
  listMemoLogs,
  listProductDeals,
  listPrivateMemoLogs,
  listStatuses,
} from "@/features/product/api/product-api";
import { productQueryKeys } from "@/features/product/api/product-query-keys";
import type {
  ProductMemoLogListResponse,
  ProductPrivateMemoLogListResponse,
} from "@/features/product/types/product";

export function useProductDetail(productId: string) {
  return useQuery({
    enabled: productId.length > 0,
    queryKey: productQueryKeys.detail(productId),
    queryFn: () => getProduct(productId),
  });
}

export function useProductDeals(productId: string) {
  return useQuery({
    enabled: productId.length > 0,
    queryKey: productQueryKeys.deals(productId),
    queryFn: () => listProductDeals(productId),
  });
}

export function useProductCategories(options?: { readonly enabled?: boolean }) {
  return useQuery({
    queryKey: productQueryKeys.categories(),
    queryFn: () => listCategories(),
    enabled: options?.enabled ?? true,
  });
}

export function useProductStatuses(options?: { readonly enabled?: boolean }) {
  return useQuery({
    queryKey: productQueryKeys.statuses(),
    queryFn: () => listStatuses(),
    enabled: options?.enabled ?? true,
  });
}

export function useProductMemoLogs(productId: string, cursor?: string) {
  return useQuery({
    enabled: productId.length > 0,
    queryKey: productQueryKeys.memoLogs(productId, cursor),
    queryFn: () => listMemoLogs(productId, cursor),
  });
}

export function useProductPrivateMemoLogs(productId: string, cursor?: string) {
  return useQuery({
    enabled: productId.length > 0,
    queryKey: productQueryKeys.privateMemoLogs(productId, cursor),
    queryFn: () => listPrivateMemoLogs(productId, cursor),
  });
}

export function useProductMemoLogsInfinite(productId: string) {
  return useInfiniteQuery<
    ProductMemoLogListResponse,
    Error,
    { pages: ProductMemoLogListResponse[] },
    readonly string[],
    string | undefined
  >({
    enabled: productId.length > 0,
    queryKey: productQueryKeys.memoLogs(productId) as unknown as readonly string[],
    queryFn: ({ pageParam }) =>
      listMemoLogs(productId, pageParam ?? undefined),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });
}

export function useProductPrivateMemoLogsInfinite(productId: string) {
  return useInfiniteQuery<
    ProductPrivateMemoLogListResponse,
    Error,
    { pages: ProductPrivateMemoLogListResponse[] },
    readonly string[],
    string | undefined
  >({
    enabled: productId.length > 0,
    queryKey: productQueryKeys.privateMemoLogs(productId) as unknown as readonly string[],
    queryFn: ({ pageParam }) =>
      listPrivateMemoLogs(productId, pageParam ?? undefined),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });
}
