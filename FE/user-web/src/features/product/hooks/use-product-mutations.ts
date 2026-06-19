import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createCategory,
  createMemoLog,
  createPrivateMemoLog,
  createProduct,
  createStatus,
  deleteCategory,
  deleteProduct,
  deleteStatus,
  updateMemoLog,
  updatePrivateMemoLog,
  updateProduct,
} from "@/features/product/api/product-api";
import { dealQueryKeys } from "@/features/deal/api/deal-query-keys";
import { productQueryKeys } from "@/features/product/api/product-query-keys";
import type {
  CreateProductCategoryInput,
  CreateProductInput,
  CreateProductStatusInput,
  UpdateProductInput,
} from "@/features/product/types/product";

export function useCreateProductMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateProductInput) => createProduct(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: productQueryKeys.lists() });
    },
  });
}

export function useUpdateProductMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateProductInput) => updateProduct(input),
    onSuccess: (_data, input) => {
      void queryClient.invalidateQueries({ queryKey: productQueryKeys.lists() });
      void queryClient.invalidateQueries({
        queryKey: productQueryKeys.detail(input.productId),
      });
    },
  });
}

export function useDeleteProductMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => deleteProduct(productId),
    onSuccess: (_data, productId) => {
      void queryClient.invalidateQueries({ queryKey: productQueryKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: productQueryKeys.details() });
      void queryClient.invalidateQueries({
        queryKey: productQueryKeys.detail(productId),
      });
      void queryClient.invalidateQueries({
        queryKey: dealQueryKeys.productOptions(),
      });
    },
  });
}

export function useCreateCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateProductCategoryInput) => createCategory(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: productQueryKeys.categories() });
    },
  });
}

export function useCreateStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateProductStatusInput) => createStatus(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: productQueryKeys.statuses() });
    },
  });
}

export function useDeleteCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (categoryId: string) => deleteCategory(categoryId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: productQueryKeys.categories() });
    },
  });
}

export function useDeleteStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (statusId: string) => deleteStatus(statusId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: productQueryKeys.statuses() });
    },
  });
}

export function useCreateMemoLogMutation(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { memoType: string; memo: string }) =>
      createMemoLog(productId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: productQueryKeys.memoLogs(productId),
      });
    },
  });
}

export function useUpdateMemoLogMutation(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      memoLogId,
      ...input
    }: {
      memoLogId: string;
      memoType?: string;
      memo?: string;
    }) => updateMemoLog(productId, memoLogId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: productQueryKeys.memoLogs(productId),
      });
    },
  });
}

export function useCreatePrivateMemoLogMutation(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { memo: string }) =>
      createPrivateMemoLog(productId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: productQueryKeys.privateMemoLogs(productId),
      });
    },
  });
}

export function useUpdatePrivateMemoLogMutation(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      privateMemoLogId,
      memo,
    }: {
      privateMemoLogId: string;
      memo: string;
    }) => updatePrivateMemoLog(productId, privateMemoLogId, { memo }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: productQueryKeys.privateMemoLogs(productId),
      });
    },
  });
}
