import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ManagedTaxonomyDropdown } from "@/components/ui/managed-taxonomy-dropdown";
import {
  ModalFieldGroup,
  ModalFooterActions,
  ModalForm,
  ModalFormRow,
  ModalFormSection,
} from "@/components/ui/modal-form";
import { ModalShell } from "@/components/ui/modal-shell";
import { ErrorState } from "@/components/ui/state";
import {
  useProductCategories,
  useProductStatuses,
} from "@/features/product/hooks/use-product-detail";
import {
  useCreateCategoryMutation,
  useCreateProductMutation,
  useCreateStatusMutation,
  useDeleteCategoryMutation,
  useDeleteStatusMutation,
} from "@/features/product/hooks/use-product-mutations";
import type {
  ProductCategory,
  ProductStatus,
} from "@/features/product/types/product";
import { getApiErrorMessage } from "@/lib/api-client";

const schema = z.object({
  productName: z.string().trim().min(1, "제품명을 입력해주세요."),
  productPrice: z
    .string()
    .trim()
    .refine(
      (v) => v.length === 0 || /^\d+$/.test(v),
      "단가는 0 이상의 정수로 입력해주세요.",
    ),
  productCategoryId: z.string().trim().min(1, "카테고리를 선택해주세요."),
  productStatusId: z.string().trim().min(1, "상태를 선택해주세요."),
  productMemo: z.string().trim().optional(),
});

type FormValues = z.infer<typeof schema>;

type ProductCreateDialogProps = {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly onCreated: (productName: string) => void;
};

export function ProductCreateDialog({
  open,
  onOpenChange,
  onCreated,
}: ProductCreateDialogProps) {
  const createProductMutation = useCreateProductMutation();
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
    defaultValues: {
      productName: "",
      productPrice: "0",
      productCategoryId: "",
      productStatusId: "",
      productMemo: "",
    },
  });

  const selectedCategoryId = watch("productCategoryId");
  const selectedStatusId = watch("productStatusId");
  const formId = "product-create-form";
  const categories = useMemo(
    () => categoriesQuery.data?.items ?? [],
    [categoriesQuery.data],
  );
  const statuses = useMemo(
    () => statusesQuery.data?.items ?? [],
    [statusesQuery.data],
  );

  useEffect(() => {
    if (open) {
      reset({
        productName: "",
        productPrice: "0",
        productCategoryId: "",
        productStatusId: "",
        productMemo: "",
      });
      setPendingCategoryName("");
      setPendingStatusName("");
    }
  }, [open, reset]);

  useEffect(() => {
    if (!pendingCategoryName) {
      return;
    }

    const matchedCategory = categories.find(
      (category) => category.categoryName === pendingCategoryName,
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
      (status) => status.statusName === pendingStatusName,
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

  if (!open) return null;

  const onSubmit = handleSubmit(async (values) => {
    await createProductMutation.mutateAsync({
      productName: values.productName,
      productPrice: Number(values.productPrice || "0"),
      productCategoryId: values.productCategoryId,
      productStatusId: values.productStatusId,
      productMemo: values.productMemo?.trim() || undefined,
    });

    onCreated(values.productName.trim());
    onOpenChange(false);
  });

  const createCategory = async (name: string) => {
    await createCategoryMutation.mutateAsync({ categoryName: name });
    const updated = await categoriesQuery.refetch();
    const created = updated.data?.items.find(
      (category) => category.categoryName === name,
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

  const createStatus = async (name: string) => {
    await createStatusMutation.mutateAsync({ statusName: name });
    const updated = await statusesQuery.refetch();
    const created = updated.data?.items.find(
      (status) => status.statusName === name,
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

  const deleteCategory = async (category: ProductCategory) => {
    await deleteCategoryMutation.mutateAsync(category.id);

    if (selectedCategoryId === category.id) {
      setValue("productCategoryId", "", {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  };

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
    <ModalShell
      footer={
        <ModalFooterActions
          formId={formId}
          isSubmitting={createProductMutation.isPending}
          pendingLabel="추가 중"
          submitLabel="제품 추가"
          onCancel={() => onOpenChange(false)}
          onSubmit={() => void onSubmit()}
        />
      }
      open={open}
      size="md"
      title="제품 추가"
      onOpenChange={onOpenChange}
    >
      <ModalForm id={formId} onSubmit={onSubmit}>
        <ModalFormSection title="제품 기본 정보">
          <ModalFormRow columns={2}>
            <ModalFieldGroup
              error={errors.productName?.message}
              id="pc-product-name"
              label="제품명"
            >
              <input
                aria-describedby={
                  errors.productName ? "pc-product-name-message" : undefined
                }
                aria-invalid={Boolean(errors.productName)}
                className="h-10 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                id="pc-product-name"
                placeholder="제품명 입력"
                {...register("productName")}
              />
            </ModalFieldGroup>

            <ModalFieldGroup
              error={errors.productPrice?.message}
              id="pc-product-price"
              label="단가"
            >
              <div className="flex items-center overflow-hidden rounded-md border border-[#E6EAF0] focus-within:border-[#93C5FD] focus-within:ring-1 focus-within:ring-[#93C5FD]">
                <span className="shrink-0 select-none border-r border-[#E6EAF0] bg-[#F9FAFB] px-3 text-[13px] font-medium text-[#6B7280]">
                  ₩
                </span>
                <input
                  className="h-10 min-w-0 flex-1 px-3 text-[13px] outline-none"
                  id="pc-product-price"
                  inputMode="numeric"
                  placeholder="0"
                  {...register("productPrice")}
                />
                <span className="shrink-0 select-none border-l border-[#E6EAF0] bg-[#F9FAFB] px-3 text-[12px] font-medium text-[#9CA3AF]">
                  KRW
                </span>
              </div>
            </ModalFieldGroup>
          </ModalFormRow>
        </ModalFormSection>

        <ModalFormSection title="카테고리 / 상태">
          <ModalFormRow columns={2}>
            <ModalFieldGroup
              error={errors.productCategoryId?.message}
              id="pc-product-category"
              label="카테고리"
            >
              <input type="hidden" {...register("productCategoryId")} />
              <ManagedTaxonomyDropdown
                addPlaceholder="카테고리명"
                createActionLabel="새 제품 생성"
                emptyText="검색된 카테고리가 없습니다"
                getLabel={(category) => category.categoryName}
                id="pc-product-category"
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
            </ModalFieldGroup>

            <ModalFieldGroup
              error={errors.productStatusId?.message}
              id="pc-product-status"
              label="상태"
            >
              <input type="hidden" {...register("productStatusId")} />
              <ManagedTaxonomyDropdown
                addPlaceholder="상태명"
                createActionLabel="새 상태 생성"
                emptyText="검색된 상태가 없습니다"
                getLabel={(status) => status.statusName}
                id="pc-product-status"
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
            </ModalFieldGroup>
          </ModalFormRow>
        </ModalFormSection>

        <ModalFormSection title="메모(옵션)">
          <ModalFieldGroup id="pc-product-memo">
            <textarea
              aria-label="메모"
              className="min-h-24 resize-y rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              id="pc-product-memo"
              {...register("productMemo")}
            />
          </ModalFieldGroup>
        </ModalFormSection>

        {createProductMutation.error ? (
          <ErrorState
            message={getApiErrorMessage(createProductMutation.error)}
            title="제품 저장 실패"
            variant="inline"
          />
        ) : null}
      </ModalForm>
    </ModalShell>
  );
}
