import type {
  CreateProductCategoryInput,
  CreateProductInput,
  CreateProductStatusInput,
  ProductCategoryListResponse,
  ProductDealListResponse,
  ProductDetail,
  ProductListParams,
  ProductListResponse,
  ProductMemoLogListResponse,
  ProductPrivateMemoLogListResponse,
  ProductStatusListResponse,
  UpdateProductInput,
} from "@/features/product/types/product";
import { apiClient, apiBlobClient } from "@/lib/api-client";
import type { ApiBlobResponse } from "@/lib/api-client";

export function listProducts(params: ProductListParams) {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.productName) query.set("productName", params.productName);
  if (params.productCategoryId) query.set("productCategoryId", params.productCategoryId);
  if (params.productStatusId) query.set("productStatusId", params.productStatusId);
  if (params.sort) query.set("sort", params.sort);
  const suffix = query.toString() ? `?${query.toString()}` : "";
  return apiClient<ProductListResponse>(`/api/products${suffix}`);
}

export function getProduct(productId: string) {
  return apiClient<ProductDetail>(`/api/products/${productId}`);
}

export function listProductDeals(productId: string) {
  return apiClient<ProductDealListResponse>(`/api/products/${productId}/deals`);
}

export function createProduct(input: CreateProductInput) {
  return apiClient<void>("/api/products", {
    method: "POST",
    body: input,
  });
}

export function updateProduct(input: UpdateProductInput) {
  const { productId, ...body } = input;
  return apiClient<void>(`/api/products/${productId}`, {
    method: "PATCH",
    body: compactBody(body as Record<string, unknown>),
  });
}

// 기능 : 참조가 없는 제품을 삭제합니다.
export function deleteProduct(productId: string) {
  return apiClient<void>(`/api/products/${productId}`, {
    method: "DELETE",
  });
}

export function listCategories() {
  return apiClient<ProductCategoryListResponse>("/api/product-categories");
}

export function createCategory(input: CreateProductCategoryInput) {
  return apiClient<void>("/api/product-categories", {
    method: "POST",
    body: input,
  });
}

export function listStatuses() {
  return apiClient<ProductStatusListResponse>("/api/product-statuses");
}

export function createStatus(input: CreateProductStatusInput) {
  return apiClient<void>("/api/product-statuses", {
    method: "POST",
    body: input,
  });
}

export function listMemoLogs(productId: string, cursor?: string) {
  const query = new URLSearchParams();
  if (cursor) query.set("cursor", cursor);
  const suffix = query.toString() ? `?${query.toString()}` : "";
  return apiClient<ProductMemoLogListResponse>(
    `/api/products/${productId}/memo-logs${suffix}`
  );
}

export function listPrivateMemoLogs(productId: string, cursor?: string) {
  const query = new URLSearchParams();
  if (cursor) query.set("cursor", cursor);
  const suffix = query.toString() ? `?${query.toString()}` : "";
  return apiClient<ProductPrivateMemoLogListResponse>(
    `/api/products/${productId}/private-memo-logs${suffix}`
  );
}

export function deleteCategory(categoryId: string): Promise<void> {
  return apiClient<void>(`/api/product-categories/${categoryId}`, {
    method: "DELETE",
  });
}

export function deleteStatus(statusId: string): Promise<void> {
  return apiClient<void>(`/api/product-statuses/${statusId}`, {
    method: "DELETE",
  });
}

export function createMemoLog(
  productId: string,
  input: { memoType: string; memo: string }
): Promise<void> {
  return apiClient<void>(`/api/products/${productId}/memo-logs`, {
    method: "POST",
    body: input,
  });
}

export function updateMemoLog(
  productId: string,
  memoLogId: string,
  input: { memoType?: string; memo?: string }
): Promise<void> {
  return apiClient<void>(`/api/products/${productId}/memo-logs/${memoLogId}`, {
    method: "PATCH",
    body: compactBody(input as Record<string, unknown>),
  });
}

export function createPrivateMemoLog(
  productId: string,
  input: { memo: string }
): Promise<void> {
  return apiClient<void>(`/api/products/${productId}/private-memo-logs`, {
    method: "POST",
    body: input,
  });
}

export function updatePrivateMemoLog(
  productId: string,
  privateMemoLogId: string,
  input: { memo: string }
): Promise<void> {
  return apiClient<void>(
    `/api/products/${productId}/private-memo-logs/${privateMemoLogId}`,
    {
      method: "PATCH",
      body: input,
    }
  );
}

export function exportProductsXlsx(params: {
  productName?: string;
  productCategoryId?: string;
  productStatusId?: string;
  sort?: string;
}): Promise<ApiBlobResponse> {
  const query = new URLSearchParams();
  if (params.productName) query.set("productName", params.productName);
  if (params.productCategoryId) query.set("productCategoryId", params.productCategoryId);
  if (params.productStatusId) query.set("productStatusId", params.productStatusId);
  if (params.sort) query.set("sort", params.sort);
  const suffix = query.toString() ? `?${query.toString()}` : "";
  return apiBlobClient(`/api/products/export/xlsx${suffix}`);
}

function compactBody(input: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(input).filter(([, value]) => value !== undefined)
  );
}
