import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ManagedTaxonomyDropdown } from "@/components/ui/managed-taxonomy-dropdown";
import {
  useProductCategories,
  useProductStatuses,
} from "@/features/product/hooks/use-product-detail";
import {
  useCreateCategoryMutation,
  useCreateStatusMutation,
  useDeleteCategoryMutation,
  useDeleteStatusMutation,
  useUpdateProductMutation,
} from "@/features/product/hooks/use-product-mutations";
import type {
  ProductCategory,
  ProductDetail,
  ProductStatus,
} from "@/features/product/types/product";
import { getApiErrorMessage } from "@/lib/api-client";

const schema = z.object({
  productName: z.string().trim().min(1, "제품명을 입력해 주세요."),
  productPrice: z
    .string()
    .trim()
    .refine(
      (value) => value.length === 0 || /^\d+$/.test(value),
    "금액은 0 이상의 정수로 입력해 주세요."
    ),
  productCategoryId: z.string().trim().min(1, "카테고리를 선택해 주세요."),
  productStatusId: z.string().trim().min(1, "상태를 선택해 주세요."),
});

type FormValues = z.infer<typeof schema>;

type ProductEditFormProps = {
  readonly formId?: string;
  readonly product: ProductDetail;
  readonly onPendingChange?: (isPending: boolean) => void;
  readonly onSaved: () => void;
};

// 기능 : 제품 상세 기본 정보 수정 폼을 렌더링합니다.
export function ProductEditForm({
  formId,
  product,
  onPendingChange,
  onSaved,
}: ProductEditFormProps) {
  const updateProductMutation = useUpdateProductMutation();
  const createCategoryMutation = useCreateCategoryMutation();
  const createStatusMutation = useCreateStatusMutation();
  const deleteCategoryMutation = useDeleteCategoryMutation();
  const deleteStatusMutation = useDeleteStatusMutation();
  const categoriesQuery = useProductCategories();
  const statusesQuery = useProductStatuses();
  const [pendingCategoryName, setPendingCategoryName] = useState("");
  const [pendingStatusName, setPendingStatusName] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: toFormValues(product),
  });
  const selectedCategoryId = watch("productCategoryId") ?? "";
  const selectedStatusId = watch("productStatusId") ?? "";
  const categories = useMemo(
    () =>
      mergeProductCategories(
        categoriesQuery.data?.items ?? [],
        product.productCategory
      ),
    [categoriesQuery.data, product.productCategory]
  );
  const statuses = useMemo(
    () =>
      mergeProductStatuses(statusesQuery.data?.items ?? [], product.productStatus),
    [product.productStatus, statusesQuery.data]
  );

  useEffect(() => {
    reset(toFormValues(product));
    setPendingCategoryName("");
    setPendingStatusName("");
  }, [product, reset]);

  useEffect(() => {
    onPendingChange?.(updateProductMutation.isPending);
  }, [onPendingChange, updateProductMutation.isPending]);

  useEffect(() => {
    if (!pendingCategoryName) {
      return;
    }

    const matchedCategory = categories.find(
      (category) => category.categoryName === pendingCategoryName
    );

    if (matchedCategory) {
      setValue("productCategoryId", matchedCategory.id, {
        shouldDirty: true,
        shouldValidate: true,
      });
      setPendingCategoryName("");
    }
  }, [categories, pendingCategoryName, setValue]);

  useEffect(() => {
    if (!pendingStatusName) {
      return;
    }

    const matchedStatus = statuses.find(
      (status) => status.statusName === pendingStatusName
    );

    if (matchedStatus) {
      setValue("productStatusId", matchedStatus.id, {
        shouldDirty: true,
        shouldValidate: true,
      });
      setPendingStatusName("");
    }
  }, [pendingStatusName, setValue, statuses]);

  useEffect(() => {
    if (
      selectedCategoryId &&
      !categories.some((category) => category.id === selectedCategoryId)
    ) {
      setValue("productCategoryId", "", {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  }, [categories, selectedCategoryId, setValue]);

  useEffect(() => {
    if (
      selectedStatusId &&
      !statuses.some((status) => status.id === selectedStatusId)
    ) {
      setValue("productStatusId", "", {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  }, [selectedStatusId, setValue, statuses]);

  // 기능 : 제품 기본 정보 수정 요청을 보냅니다.
  const onSubmit = handleSubmit(async (values) => {
    await updateProductMutation.mutateAsync({
      productId: product.id,
      productName: values.productName,
      productPrice: Number(values.productPrice || "0"),
      productCategoryId: values.productCategoryId,
      productStatusId: values.productStatusId,
    });

    onSaved();
  });

  // 기능 : 새 제품 카테고리를 생성하고 생성된 항목을 선택합니다.
  const createCategory = async (name: string) => {
    await createCategoryMutation.mutateAsync({ categoryName: name });
    const updated = await categoriesQuery.refetch();
    const created = updated.data?.items.find(
      (category) => category.categoryName === name
    );

    if (created) {
      setValue("productCategoryId", created.id, {
        shouldDirty: true,
        shouldValidate: true,
      });
      return;
    }

    setPendingCategoryName(name);
  };

  // 기능 : 새 제품 상태를 생성하고 생성된 항목을 선택합니다.
  const createStatus = async (name: string) => {
    await createStatusMutation.mutateAsync({ statusName: name });
    const updated = await statusesQuery.refetch();
    const created = updated.data?.items.find(
      (status) => status.statusName === name
    );

    if (created) {
      setValue("productStatusId", created.id, {
        shouldDirty: true,
        shouldValidate: true,
      });
      return;
    }

    setPendingStatusName(name);
  };

  // 기능 : 제품 카테고리를 삭제하고 선택 중인 항목이면 선택값을 비웁니다.
  const deleteCategory = async (category: ProductCategory) => {
    await deleteCategoryMutation.mutateAsync(category.id);

    if (selectedCategoryId === category.id) {
      setValue("productCategoryId", "", {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  };

  // 기능 : 제품 상태를 삭제하고 선택 중인 항목이면 선택값을 비웁니다.
  const deleteStatus = async (status: ProductStatus) => {
    await deleteStatusMutation.mutateAsync(status.id);

    if (selectedStatusId === status.id) {
      setValue("productStatusId", "", {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  };

  return (
    <form
      className="grid gap-3"
      id={formId}
      onSubmit={(event) => void onSubmit(event)}
    >
      <div className="grid gap-2">
        <label className="text-sm font-medium" htmlFor="product-detail-name">
          제품명
        </label>
        <input
          aria-invalid={Boolean(errors.productName)}
          className="h-10 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          id="product-detail-name"
          {...register("productName")}
        />
        {errors.productName ? (
          <p className="text-xs text-destructive">{errors.productName.message}</p>
        ) : null}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="grid gap-2">
          <label
            className="text-sm font-medium"
            htmlFor="product-detail-category"
          >
            카테고리
          </label>
          <input type="hidden" {...register("productCategoryId")} />
          <ManagedTaxonomyDropdown
            addPlaceholder="카테고리명"
            createActionLabel="새 제품 생성"
                  emptyText="검색어를 바꾸면 카테고리를 찾을 수 있어요"
            getLabel={(category) => category.categoryName}
            id="product-detail-category"
            isCreating={createCategoryMutation.isPending}
            isDeleting={deleteCategoryMutation.isPending}
            items={categories}
            listClassName="max-h-[88px]"
            placeholder="카테고리 선택"
            selectedId={selectedCategoryId}
            title="카테고리"
            onCreate={createCategory}
            onDelete={deleteCategory}
            onSelect={(id) =>
              setValue("productCategoryId", id, {
                shouldDirty: true,
                shouldValidate: true,
              })
            }
          />
          {errors.productCategoryId ? (
            <p className="text-xs text-destructive">
              {errors.productCategoryId.message}
            </p>
          ) : null}
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium" htmlFor="product-detail-status">
            판매 상태
          </label>
          <input type="hidden" {...register("productStatusId")} />
          <ManagedTaxonomyDropdown
            addPlaceholder="상태명"
            createActionLabel="새 상태 생성"
                  emptyText="검색어를 바꾸면 상태를 찾을 수 있어요"
            getLabel={(status) => status.statusName}
            id="product-detail-status"
            isCreating={createStatusMutation.isPending}
            isDeleting={deleteStatusMutation.isPending}
            items={statuses}
            listClassName="max-h-[88px]"
            placeholder="상태 선택"
            selectedId={selectedStatusId}
            title="상태"
            onCreate={createStatus}
            onDelete={deleteStatus}
            onSelect={(id) =>
              setValue("productStatusId", id, {
                shouldDirty: true,
                shouldValidate: true,
              })
            }
          />
          {errors.productStatusId ? (
            <p className="text-xs text-destructive">
              {errors.productStatusId.message}
            </p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium" htmlFor="product-detail-price">
          금액 (원)
        </label>
        <input
          aria-invalid={Boolean(errors.productPrice)}
          className="h-10 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          id="product-detail-price"
          inputMode="numeric"
          {...register("productPrice")}
        />
        {errors.productPrice ? (
          <p className="text-xs text-destructive">{errors.productPrice.message}</p>
        ) : null}
      </div>

      {updateProductMutation.error ? (
        <p className="rounded-md border border-destructive/30 bg-red-50 px-3 py-2 text-sm text-destructive">
          {getApiErrorMessage(updateProductMutation.error)}
        </p>
      ) : null}

    </form>
  );
}

// 기능 : 제품 상세 응답을 수정 form 기본값으로 변환합니다.
function toFormValues(product: ProductDetail): FormValues {
  return {
    productName: product.productName,
    productPrice: String(product.productPrice ?? 0),
    productCategoryId: product.productCategory.id,
    productStatusId: product.productStatus.id,
  };
}

// 기능 : 현재 제품의 카테고리가 목록 응답에 없거나 로딩 전이어도 선택지에 포함합니다.
function mergeProductCategories(
  categories: readonly ProductCategory[],
  current: ProductCategory
) {
  return categories.some((category) => category.id === current.id)
    ? categories
    : [current, ...categories];
}

// 기능 : 현재 제품의 상태가 목록 응답에 없거나 로딩 전이어도 선택지에 포함합니다.
function mergeProductStatuses(
  statuses: readonly ProductStatus[],
  current: ProductStatus
) {
  return statuses.some((status) => status.id === current.id)
    ? statuses
    : [current, ...statuses];
}
