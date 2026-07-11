import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  Check,
  ChevronsRight,
  Loader2,
  Maximize2,
  Package,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ManagedTaxonomyDropdown } from "@/components/ui/managed-taxonomy-dropdown";
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

const productCreateFormSchema = z.object({
  productName: z.string().trim().min(1, "제품명을 입력해 주세요."),
  productPrice: z
    .string()
    .trim()
    .refine(
      (value) => value.length === 0 || /^\d+$/.test(value),
      "단가는 0 이상의 정수로 입력해 주세요.",
    ),
  productCategoryId: z.string().trim().min(1, "카테고리를 선택해 주세요."),
  productStatusId: z.string().trim().min(1, "상태를 선택해 주세요."),
  productMemo: z.string().trim().optional(),
});

export type ProductCreateFormValues = z.infer<typeof productCreateFormSchema>;

const emptyProductCreateFormValues: ProductCreateFormValues = {
  productName: "",
  productPrice: "0",
  productCategoryId: "",
  productStatusId: "",
  productMemo: "",
};

type ProductCreateDialogProps = {
  readonly open: boolean;
  readonly initialValues?: Partial<ProductCreateFormValues>;
  readonly mode?: "docked" | "overlay" | "page";
  readonly width?: number;
  readonly onOpenChange: (open: boolean) => void;
  readonly onCreated: (productName: string) => void;
  readonly onExpand?: (values: ProductCreateFormValues) => void;
  readonly onResizeStart?: () => void;
};

export function ProductCreateDialog({
  open,
  initialValues,
  mode = "overlay",
  width,
  onOpenChange,
  onCreated,
  onExpand,
  onResizeStart,
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
  const memoTextareaRef = useRef<HTMLTextAreaElement | null>(null);

  const {
    register,
    handleSubmit,
    getValues,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductCreateFormValues>({
    resolver: zodResolver(productCreateFormSchema),
    defaultValues: emptyProductCreateFormValues,
  });

  const selectedCategoryId = watch("productCategoryId");
  const selectedStatusId = watch("productStatusId");
  const productMemo = watch("productMemo") ?? "";
  const memoRegister = register("productMemo");
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
        ...emptyProductCreateFormValues,
        ...initialValues,
        productName: initialValues?.productName ?? "",
        productPrice: initialValues?.productPrice ?? "0",
        productCategoryId: initialValues?.productCategoryId ?? "",
        productStatusId: initialValues?.productStatusId ?? "",
        productMemo: initialValues?.productMemo ?? "",
      });
      setPendingCategoryName("");
      setPendingStatusName("");
    }
  }, [initialValues, open, reset]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !createProductMutation.isPending) {
        onOpenChange(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [createProductMutation.isPending, onOpenChange, open]);

  useEffect(() => {
    resizeMemoTextarea(memoTextareaRef.current);
  }, [open, initialValues]);

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
      !categoriesQuery.isLoading &&
      selectedCategoryId &&
      !categories.some((category) => category.id === selectedCategoryId)
    ) {
      setValue("productCategoryId", "", {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  }, [categories, categoriesQuery.isLoading, selectedCategoryId, setValue]);

  useEffect(() => {
    if (
      !statusesQuery.isLoading &&
      selectedStatusId &&
      !statuses.some((status) => status.id === selectedStatusId)
    ) {
      setValue("productStatusId", "", {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  }, [selectedStatusId, setValue, statuses, statusesQuery.isLoading]);

  const onSubmit = handleSubmit(async (values) => {
    await createProductMutation.mutateAsync({
      productName: values.productName.trim(),
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

  const focusMemoTextarea = () => {
    memoTextareaRef.current?.focus();
  };

  const isDocked = mode === "docked";
  const isPage = mode === "page";
  const CloseIcon = isPage ? ArrowLeft : ChevronsRight;

  if (!open && !isDocked) {
    return null;
  }

  const panel = (
    <section
      aria-label="제품 생성"
      aria-modal={isPage ? undefined : !isDocked}
      className={
        isPage
          ? "flex min-h-full flex-col bg-white"
          : isDocked
            ? `fixed inset-y-0 right-0 z-50 flex h-screen shrink-0 flex-col bg-white shadow-[0_18px_48px_rgba(15,23,42,0.16)] transition-[transform,opacity] duration-[500ms] ease-out will-change-transform ${
                open
                  ? "product-create-panel-enter pointer-events-auto translate-x-0 opacity-100"
                  : "pointer-events-none translate-x-full opacity-0"
              }`
            : "pointer-events-auto relative flex h-full w-full flex-col bg-white shadow-[0_18px_48px_rgba(15,23,42,0.16)] sm:max-w-[520px]"
      }
      role={isPage ? undefined : "dialog"}
      style={isDocked ? { width: width ?? 520 } : undefined}
    >
      {isDocked ? (
        <button
          aria-label="제품 생성 패널 폭 조절"
          className="absolute -left-1 top-0 z-10 h-full w-2 cursor-col-resize transition hover:bg-[#EFF6FF] focus:bg-[#EFF6FF] focus:outline-none"
          onMouseDown={(event) => {
            event.preventDefault();
            onResizeStart?.();
          }}
          type="button"
        />
      ) : null}
      <header className="flex h-10 shrink-0 items-center px-1.5">
        <div className="flex shrink-0 items-center gap-0.5">
          <button
            aria-label={isPage ? "제품 목록으로 이동" : "제품 생성 패널 접기"}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[#8A8F98] transition hover:bg-[#F3F4F6] hover:text-[#374151] disabled:cursor-not-allowed disabled:opacity-50"
            disabled={createProductMutation.isPending}
            onClick={() => onOpenChange(false)}
            title={isPage ? "제품 목록으로 이동" : "제품 생성 패널 접기"}
            type="button"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
          {onExpand && !isPage ? (
            <button
              aria-label="전체 생성 페이지로 열기"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[#8A8F98] transition hover:bg-[#F3F4F6] hover:text-[#374151] disabled:cursor-not-allowed disabled:opacity-50"
              disabled={createProductMutation.isPending}
              onClick={() => onExpand(getValues())}
              title="전체 생성 페이지로 열기"
              type="button"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </header>

      <form
        className="flex min-h-0 flex-1 flex-col"
        id={formId}
        onSubmit={(event) => void onSubmit(event)}
      >
        <div
          className="min-h-0 flex-1 cursor-text overflow-y-auto px-5 py-6"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              focusMemoTextarea();
            }
          }}
        >
          <div
            className={
              isPage
                ? "mx-auto grid min-h-full w-full max-w-[920px] cursor-text content-start gap-4"
                : "grid min-h-full cursor-text content-start gap-4"
            }
            onClick={(event) => {
              if (event.target === event.currentTarget) {
                focusMemoTextarea();
              }
            }}
          >
            <section className="grid cursor-auto gap-2">
              <label
                className="text-[16px] font-semibold text-[#94A3B8]"
                htmlFor="product-name"
              >
                제품명
              </label>
              <div className="relative">
                <Package className="pointer-events-none absolute left-0 top-1/2 h-5 w-5 -translate-y-1/2 text-[#CBD5E1]" />
                <input
                  aria-describedby={
                    errors.productName ? "product-name-error" : undefined
                  }
                  aria-invalid={Boolean(errors.productName)}
                  className="h-14 w-full border-0 bg-transparent pl-8 pr-1 text-[32px] font-semibold leading-none text-[#111827] outline-none placeholder:text-[#CBD5E1] placeholder:opacity-100"
                  id="product-name"
                  placeholder="제품명을 넣어주세요."
                  {...register("productName")}
                />
              </div>
              {errors.productName ? (
                <p
                  className="text-[12px] text-red-500"
                  id="product-name-error"
                >
                  {errors.productName.message}
                </p>
              ) : null}
            </section>

            <section className="grid cursor-auto gap-3 sm:grid-cols-2">
              <ProductCreatePanelProperty
                error={errors.productPrice?.message}
                errorId="product-price-error"
                label="단가"
              >
                <div className="flex h-10 items-center overflow-hidden rounded-md border border-[#E6EAF0] focus-within:border-[#4880EE] focus-within:ring-1 focus-within:ring-[#4880EE]">
                  <span className="shrink-0 select-none border-r border-[#E6EAF0] bg-[#F9FAFB] px-3 text-[13px] font-medium text-[#6B7280]">
                    ₩
                  </span>
                  <input
                    aria-describedby={
                      errors.productPrice ? "product-price-error" : undefined
                    }
                    aria-invalid={Boolean(errors.productPrice)}
                    className="h-full min-w-0 flex-1 px-3 text-[13px] outline-none"
                    id="product-price"
                    inputMode="numeric"
                    placeholder="0"
                    {...register("productPrice")}
                  />
                  <span className="shrink-0 select-none border-l border-[#E6EAF0] bg-[#F9FAFB] px-3 text-[12px] font-medium text-[#9CA3AF]">
                    KRW
                  </span>
                </div>
              </ProductCreatePanelProperty>
            </section>

            <section className="grid cursor-auto gap-3 sm:grid-cols-2">
              <ProductCreatePanelProperty
                error={errors.productCategoryId?.message}
                label="카테고리"
              >
                <input type="hidden" {...register("productCategoryId")} />
                <ManagedTaxonomyDropdown
                  addPlaceholder="카테고리명"
                  createActionLabel="새 카테고리 생성"
                  emptyText="카테고리를 추가하면 선택할 수 있어요"
                  getLabel={(category) => category.categoryName}
                  id="product-category"
                  isCreating={createCategoryMutation.isPending}
                  isDeleting={deleteCategoryMutation.isPending}
                  items={categories}
                  listClassName="max-h-[132px]"
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
              </ProductCreatePanelProperty>

              <ProductCreatePanelProperty
                error={errors.productStatusId?.message}
                label="상태"
              >
                <input type="hidden" {...register("productStatusId")} />
                <ManagedTaxonomyDropdown
                  addPlaceholder="상태명"
                  createActionLabel="새 상태 생성"
                  emptyText="상태를 추가하면 선택할 수 있어요"
                  getLabel={(status) => status.statusName}
                  id="product-status"
                  isCreating={createStatusMutation.isPending}
                  isDeleting={deleteStatusMutation.isPending}
                  items={statuses}
                  listClassName="max-h-[132px]"
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
              </ProductCreatePanelProperty>
            </section>

            <section className="grid cursor-auto gap-2">
              <label
                className="text-[16px] font-semibold text-[#94A3B8]"
                htmlFor="product-memo"
              >
                메모
              </label>
              <div className="relative min-h-8">
                <textarea
                  aria-label="메모"
                  className="min-h-0 w-full resize-none overflow-hidden border-0 bg-white px-0 py-1 text-[14px] leading-6 text-[#111827] outline-none"
                  id="product-memo"
                  {...memoRegister}
                  onChange={(event) => {
                    memoRegister.onChange(event);
                    resizeMemoTextarea(event.currentTarget);
                  }}
                  ref={(element) => {
                    memoRegister.ref(element);
                    memoTextareaRef.current = element;
                  }}
                  rows={1}
                />
                {productMemo.trim().length === 0 ? (
                  <span className="pointer-events-none absolute left-0 top-1 text-[14px] font-semibold leading-6 text-[#CBD5E1]">
                    번뜩이는 생각들을 기록하세요!
                  </span>
                ) : null}
              </div>
            </section>

            {createProductMutation.error ? (
              <ErrorState
                message={getApiErrorMessage(createProductMutation.error)}
                title="제품 저장 실패"
                variant="inline"
              />
            ) : null}
          </div>
        </div>

        <footer className="flex h-16 shrink-0 items-center px-5">
          <div
            className={
              isPage
                ? "mx-auto flex w-full max-w-[920px] justify-end gap-2"
                : "flex w-full justify-end gap-2"
            }
          >
            <button
              className="inline-flex h-9 items-center justify-center rounded-md border border-[#E5E7EB] bg-white px-3 text-[13px] font-medium text-[#475569] transition hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:opacity-50"
              disabled={createProductMutation.isPending}
              onClick={() => onOpenChange(false)}
              type="button"
            >
              {isPage ? "목록으로" : "닫기"}
            </button>
            <button
              className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-[#4880EE] px-3.5 text-[13px] font-semibold text-white transition hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={createProductMutation.isPending}
              type="submit"
            >
              {createProductMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              {createProductMutation.isPending ? "저장 중" : "저장"}
            </button>
          </div>
        </footer>
      </form>
    </section>
  );

  if (isDocked || isPage) {
    return panel;
  }

  return (
    <div className="pointer-events-none fixed inset-y-0 right-0 z-50 flex w-full justify-end">
      {panel}
    </div>
  );
}

function resizeMemoTextarea(element: HTMLTextAreaElement | null) {
  if (!element) {
    return;
  }

  element.style.height = "auto";
  element.style.height = `${element.scrollHeight}px`;
}

type ProductCreatePanelPropertyProps = {
  readonly children: ReactNode;
  readonly error?: string;
  readonly errorId?: string;
  readonly label: string;
};

function ProductCreatePanelProperty({
  children,
  error,
  errorId,
  label,
}: ProductCreatePanelPropertyProps) {
  return (
    <div className="grid min-w-0 gap-2">
      <div className="text-[16px] font-semibold text-[#94A3B8]">{label}</div>
      <div className="min-w-0">
        {children}
        {error ? (
          <p
            className="mt-1 truncate text-[12px] leading-4 text-red-500"
            id={errorId}
            title={error}
          >
            {error}
          </p>
        ) : null}
      </div>
    </div>
  );
}
