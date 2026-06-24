import {
  BriefcaseBusiness,
  ChevronLeft,
  LockKeyhole,
  Package,
  Pencil,
  Plus,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type UseFormRegisterReturn } from "react-hook-form";
import { z } from "zod";
import { SummaryTaxonomySelect } from "@/components/ui/summary-taxonomy-select";
import { Toast } from "@/components/ui/toast";
import {
  ModalFieldGroup,
  ModalFooterActions,
  ModalForm,
  ModalFormSection,
} from "@/components/ui/modal-form";
import { ModalShell } from "@/components/ui/modal-shell";
import {
  useProductCategories,
  useProductDeals,
  useProductDetail,
  useProductMemoLogsInfinite,
  useProductPrivateMemoLogsInfinite,
  useProductStatuses,
} from "@/features/product/hooks/use-product-detail";
import {
  useCreateMemoLogMutation,
  useCreatePrivateMemoLogMutation,
  useDeleteProductMutation,
  useUpdateMemoLogMutation,
  useUpdatePrivateMemoLogMutation,
  useUpdateProductMutation,
} from "@/features/product/hooks/use-product-mutations";
import type {
  ProductCategory,
  ProductDeal,
  ProductDetail,
  ProductMemoLog,
  ProductPrivateMemoLog,
  ProductStatus,
} from "@/features/product/types/product";
import { DEAL_STATUS_LABEL, type DealStatus } from "@/features/deal/types/deal";
import { getApiErrorMessage } from "@/lib/api-client";
import { formatDate, formatDateTime } from "@/utils/format";

type ProductDetailScreenProps = {
  readonly productId: string;
};

const productSummaryEditSchema = z.object({
  productName: z.string().trim().min(1, "제품명을 입력해주세요."),
  productPrice: z
    .string()
    .trim()
    .refine(
      (value) => value.length === 0 || /^\d+$/.test(value),
      "가격은 0 이상의 정수로 입력해주세요."
    ),
  productCategoryId: z.string().trim().min(1, "카테고리를 선택해주세요."),
  productStatusId: z.string().trim().min(1, "상태를 선택해주세요."),
});

type ProductSummaryEditFormValues = z.infer<typeof productSummaryEditSchema>;

export function ProductDetailScreen({ productId }: ProductDetailScreenProps) {
  const navigate = useNavigate();
  const [notice, setNotice] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const productQuery = useProductDetail(productId);
  const dealsQuery = useProductDeals(productId);
  const memoLogsQuery = useProductMemoLogsInfinite(productId);
  const privateMemoLogsQuery = useProductPrivateMemoLogsInfinite(productId);
  const deleteProductMutation = useDeleteProductMutation();

  const memoLogs = memoLogsQuery.data?.pages.flatMap((p) => p.items) ?? [];
  const privateMemoLogs =
    privateMemoLogsQuery.data?.pages.flatMap((p) => p.items) ?? [];

  if (productQuery.isLoading) {
    return <ProductDetailSkeleton />;
  }

  if (productQuery.isError) {
    return (
      <ProductDetailError
        error={productQuery.error}
        onRetry={() => void productQuery.refetch()}
      />
    );
  }

  const product = productQuery.data;
  if (!product) {
    return <ProductDetailSkeleton />;
  }

  const deals = dealsQuery.data?.items ?? [];

  const onDeleteProduct = async () => {
    if (!window.confirm(`${product.productName} 제품을 삭제할까요?`)) {
      return;
    }

    setActionError(null);

    try {
      await deleteProductMutation.mutateAsync(product.id);
      void navigate("/products", {
        replace: true,
        state: { notice: "제품이 삭제되었습니다." },
      });
    } catch (error) {
      setActionError(getApiErrorMessage(error));
    }
  };

  return (
    <>
      {/* ── Mobile ──────────────────────────────────────────── */}
      <div className="md:hidden min-h-screen bg-[#FAFAF8]">
        {notice ? (
          <div className="px-4 pt-3">
            <Toast message={notice} onClose={() => setNotice(null)} variant="success" />
          </div>
        ) : null}
        {actionError ? (
          <div className="px-4 pt-3">
            <Toast
              message={actionError}
              onClose={() => setActionError(null)}
              variant="error"
            />
          </div>
        ) : null}

        {/* TopBar */}
        <div className="flex h-16 items-center gap-3 bg-transparent px-6">
          <Link to="/products">
            <ChevronLeft className="h-5 w-5 text-[#9CA3AF]" />
          </Link>
          <div className="flex flex-1 items-center gap-1.5 text-[13px]">
            <Package className="h-3.5 w-3.5 shrink-0 text-[#9CA3AF]" />
            <span className="font-medium text-[#6B7280]">제품</span>
            <span className="text-[#9CA3AF]">/</span>
            <span className="font-bold text-[#111827]">{product.productName}</span>
          </div>
          <button
            aria-label={isEditing ? "수정 취소" : "수정"}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E5E7EB] bg-white text-[#374151] disabled:opacity-50"
            onClick={() => setIsEditing((value) => !value)}
            type="button"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            aria-label="삭제"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#FEE2E2] bg-white text-[#B91C1C] disabled:opacity-50"
            disabled={deleteProductMutation.isPending}
            onClick={() => void onDeleteProduct()}
            type="button"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-col gap-4 p-4 pb-24">
          <ProductSummaryHeader
            dealCount={deals.length}
            isEditing={isEditing}
            product={product}
            onCancelEdit={() => setIsEditing(false)}
            onSaved={() => {
              void productQuery.refetch();
              setNotice("제품 정보가 저장되었습니다.");
              setIsEditing(false);
            }}
          />

          <ConnectedDealsTable
            deals={deals}
            isLoading={dealsQuery.isLoading}
          />
          <ProductMemoPanel
            productId={productId}
            memoLogs={memoLogs}
            isLoading={memoLogsQuery.isLoading}
            hasNext={Boolean(memoLogsQuery.hasNextPage)}
            isFetchingNext={memoLogsQuery.isFetchingNextPage}
            onFetchMore={() => void memoLogsQuery.fetchNextPage()}
            onChanged={setNotice}
          />
          <ProductActivityLogPanel
            productId={productId}
            privateMemoLogs={privateMemoLogs}
            isLoading={privateMemoLogsQuery.isLoading}
            hasNext={Boolean(privateMemoLogsQuery.hasNextPage)}
            isFetchingNext={privateMemoLogsQuery.isFetchingNextPage}
            onFetchMore={() => void privateMemoLogsQuery.fetchNextPage()}
            onChanged={setNotice}
          />
        </div>
      </div>

      {/* ── Desktop ──────────────────────────────────────────── */}
      <div className="hidden md:flex h-full flex-col bg-[#FAFAF8]">
        {notice ? (
          <div className="mx-6 mt-3">
            <Toast message={notice} onClose={() => setNotice(null)} variant="success" />
          </div>
        ) : null}
        {actionError ? (
          <div className="mx-6 mt-3">
            <Toast
              message={actionError}
              onClose={() => setActionError(null)}
              variant="error"
            />
          </div>
        ) : null}

        {/* TopBar */}
        <div className="flex h-16 shrink-0 items-center gap-3 bg-transparent px-6">
          <Link to="/products">
            <ChevronLeft className="h-5 w-5 text-[#9CA3AF]" />
          </Link>
          <div className="flex flex-1 items-center gap-1.5 text-[13px]">
            <Package className="h-3.5 w-3.5 shrink-0 text-[#9CA3AF]" />
            <span className="font-medium text-[#6B7280]">제품</span>
            <span className="text-[#9CA3AF]">/</span>
            <span className="font-bold text-[#111827]">{product.productName}</span>
          </div>
          <button
            aria-label="수정"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E5E7EB] bg-white text-[#374151] transition-colors hover:bg-[#F9FAFB]"
            onClick={() => setIsEditing((v) => !v)}
            type="button"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            aria-label="삭제"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#FEE2E2] bg-white text-[#B91C1C] transition-colors hover:bg-red-50 disabled:opacity-50"
            disabled={deleteProductMutation.isPending}
            onClick={() => void onDeleteProduct()}
            type="button"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-6">
          <ProductSummaryHeader
            dealCount={deals.length}
            isEditing={isEditing}
            product={product}
            onCancelEdit={() => setIsEditing(false)}
            onSaved={() => {
              void productQuery.refetch();
              setNotice("제품 정보가 저장되었습니다.");
              setIsEditing(false);
            }}
          />

          {/* 1행: 연결딜 (전체 너비) */}
          <ConnectedDealsTable
            deals={deals}
            isLoading={dealsQuery.isLoading}
          />

          {/* 2행: 제품 로그 + 비밀 메모 */}
          <div className="grid grid-cols-2 gap-4">
            <ProductMemoPanel
              productId={productId}
              memoLogs={memoLogs}
              isLoading={memoLogsQuery.isLoading}
              hasNext={Boolean(memoLogsQuery.hasNextPage)}
              isFetchingNext={memoLogsQuery.isFetchingNextPage}
              onFetchMore={() => void memoLogsQuery.fetchNextPage()}
              onChanged={setNotice}
            />
            <ProductActivityLogPanel
              productId={productId}
              privateMemoLogs={privateMemoLogs}
              isLoading={privateMemoLogsQuery.isLoading}
              hasNext={Boolean(privateMemoLogsQuery.hasNextPage)}
              isFetchingNext={privateMemoLogsQuery.isFetchingNextPage}
              onFetchMore={() => void privateMemoLogsQuery.fetchNextPage()}
              onChanged={setNotice}
            />
          </div>
        </div>
      </div>
    </>
  );
}

// ── Product Summary Header ──────────────────────────────────────────

function ProductSummaryHeader({
  product,
  dealCount,
  isEditing,
  onCancelEdit,
  onSaved,
}: {
  readonly product: ProductDetail;
  readonly dealCount: number;
  readonly isEditing: boolean;
  readonly onCancelEdit: () => void;
  readonly onSaved: () => void;
}) {
  const updateProductMutation = useUpdateProductMutation();
  const categoriesQuery = useProductCategories();
  const statusesQuery = useProductStatuses();
  const categories = mergeProductCategories(
    categoriesQuery.data?.items ?? [],
    product.productCategory
  );
  const statuses = mergeProductStatuses(
    statusesQuery.data?.items ?? [],
    product.productStatus
  );
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductSummaryEditFormValues>({
    resolver: zodResolver(productSummaryEditSchema),
    defaultValues: toProductSummaryEditFormValues(product),
  });
  const selectedCategoryId = watch("productCategoryId");
  const selectedStatusId = watch("productStatusId");

  useEffect(() => {
    if (isEditing) {
      reset(toProductSummaryEditFormValues(product));
    }
  }, [isEditing, product, reset]);

  const onSubmit = handleSubmit(async (values) => {
    await updateProductMutation.mutateAsync({
      productId: product.id,
      productName: values.productName.trim(),
      productPrice: Number(values.productPrice || "0"),
      productCategoryId: values.productCategoryId,
      productStatusId: values.productStatusId,
    });
    onSaved();
  });
  const validationError =
    errors.productName?.message ??
    errors.productCategoryId?.message ??
    errors.productStatusId?.message ??
    errors.productPrice?.message;

  if (isEditing) {
    return (
      <form
        className="flex min-h-[74px] flex-wrap items-center gap-3 rounded-xl border border-[#BFDBFE] bg-white px-5 py-4 shadow-[0_0_0_1px_rgba(37,99,235,0.04)]"
        onSubmit={onSubmit}
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EEF2FF]">
          <Package className="h-5 w-5 text-[#4338CA]" strokeWidth={2} />
        </div>

        <div className="min-w-[180px] flex-[1_1_220px] md:max-w-[280px] md:flex-none">
          <label className="sr-only" htmlFor="product-summary-edit-name">
            제품명
          </label>
          <input
            aria-invalid={Boolean(errors.productName)}
            className="h-9 w-full rounded-lg border border-[#DDE3EE] bg-white px-3 text-[15px] font-extrabold text-[#111827] outline-none transition-colors focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
            id="product-summary-edit-name"
            {...register("productName")}
          />
        </div>

        <div className="hidden h-5 w-px shrink-0 bg-[#E5E7EB] md:block" />

        <input type="hidden" {...register("productCategoryId")} />
        <SummaryTaxonomySelect
          emptyText="조건에 맞는 카테고리가 없습니다."
          getLabel={(category) => category.categoryName}
          id="product-summary-edit-category"
          invalid={Boolean(errors.productCategoryId)}
          itemKindLabel="카테고리"
          items={categories}
          selectedId={selectedCategoryId}
          tone="amber"
          widthClassName="w-[132px]"
          onSelect={(id) =>
            setValue("productCategoryId", id, {
              shouldDirty: true,
              shouldValidate: true,
            })
          }
        />

        <input type="hidden" {...register("productStatusId")} />
        <SummaryTaxonomySelect
          emptyText="조건에 맞는 상태가 없습니다."
          getLabel={(status) => status.statusName}
          id="product-summary-edit-status"
          invalid={Boolean(errors.productStatusId)}
          itemKindLabel="상태"
          items={statuses}
          selectedId={selectedStatusId}
          tone="green"
          widthClassName="w-[116px]"
          onSelect={(id) =>
            setValue("productStatusId", id, {
              shouldDirty: true,
              shouldValidate: true,
            })
          }
        />

        <ProductInlineTextInput
          id="product-summary-edit-price"
          inputMode="numeric"
          label="가격"
          register={register("productPrice")}
          widthClassName="w-[132px]"
        />

        <div className="hidden h-5 w-px shrink-0 bg-[#E5E7EB] lg:block" />
        <div className="flex items-center gap-1.5 text-[13px]">
          <span className="font-semibold text-[#9CA3AF]">딜</span>
          <span className="font-extrabold text-[#111827]">
            {dealCount.toLocaleString("ko-KR")}건
          </span>
        </div>

        <div className="flex-1" />

        {validationError || updateProductMutation.error ? (
          <span className="basis-full text-[12px] font-semibold text-[#B91C1C] md:basis-auto">
            {validationError ?? getApiErrorMessage(updateProductMutation.error)}
          </span>
        ) : null}

        <button
          className="h-9 rounded-lg border border-[#DDE3EE] bg-white px-3 text-[13px] font-semibold text-[#6B7280] transition-colors hover:bg-[#F9FAFB]"
          onClick={onCancelEdit}
          type="button"
        >
          취소
        </button>
        <button
          className="h-9 rounded-lg bg-[#2563EB] px-4 text-[13px] font-extrabold text-white transition-colors hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={updateProductMutation.isPending}
          type="submit"
        >
          {updateProductMutation.isPending ? "저장 중" : "저장"}
        </button>
      </form>
    );
  }

  return (
    <div className="flex min-h-[74px] flex-wrap items-center gap-3 rounded-xl border border-[#E5E7EB] bg-white px-5 py-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EEF2FF]">
        <Package className="h-5 w-5 text-[#4338CA]" strokeWidth={2} />
      </div>
      <span className="shrink-0 text-[20px] font-extrabold leading-none text-[#111827]">
        {product.productName}
      </span>
      <div className="h-5 w-px shrink-0 bg-[#E5E7EB]" />
      <div className="flex items-center gap-1.5 text-[13px]">
        <span className="font-semibold text-[#9CA3AF]">카테고리</span>
        <span className="font-extrabold text-[#111827]">
          {product.productCategory.categoryName}
        </span>
      </div>
      <div className="flex items-center gap-1.5 text-[13px]">
        <span className="font-semibold text-[#9CA3AF]">상태</span>
        <span className="font-extrabold text-[#111827]">
          {product.productStatus.statusName}
        </span>
      </div>
      <div className="flex items-center gap-1.5 text-[13px]">
        <span className="font-semibold text-[#9CA3AF]">가격</span>
        <span className="font-extrabold text-[#111827]">
          {product.productPrice ? `₩${product.productPrice.toLocaleString("ko-KR")}원` : "-"}
        </span>
      </div>
      <div className="h-5 w-px shrink-0 bg-[#E5E7EB]" />
      <div className="flex items-center gap-1.5 text-[13px]">
        <span className="font-semibold text-[#9CA3AF]">딜</span>
        <span className="font-extrabold text-[#111827]">
          {dealCount.toLocaleString("ko-KR")}건
        </span>
      </div>
      <div className="flex-1" />
      <div className="flex items-center gap-4 text-[12px] text-[#9CA3AF]">
        <span>등록 {formatDateTime(product.createdAt, { includeYear: true })}</span>
        <span>수정 {formatDateTime(product.updatedAt, { includeYear: true })}</span>
      </div>
    </div>
  );
}

function ProductInlineTextInput({
  id,
  inputMode,
  label,
  register,
  widthClassName,
}: {
  readonly id: string;
  readonly inputMode?: "numeric";
  readonly label: string;
  readonly register: UseFormRegisterReturn;
  readonly widthClassName: string;
}) {
  return (
    <div className="flex items-center gap-1.5 text-[13px]">
      <label className="shrink-0 font-semibold text-[#9CA3AF]" htmlFor={id}>
        {label}
      </label>
      <input
        className={`${widthClassName} h-8 rounded-lg border border-[#DDE3EE] bg-white px-2 text-[13px] font-extrabold text-[#111827] outline-none transition-colors focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]`}
        id={id}
        inputMode={inputMode}
        {...register}
      />
    </div>
  );
}

function toProductSummaryEditFormValues(
  product: ProductDetail
): ProductSummaryEditFormValues {
  return {
    productName: product.productName,
    productPrice: String(product.productPrice ?? 0),
    productCategoryId: product.productCategory.id,
    productStatusId: product.productStatus.id,
  };
}

function mergeProductCategories(
  categories: ProductCategory[],
  current: ProductCategory
) {
  return categories.some((category) => category.id === current.id)
    ? categories
    : [current, ...categories];
}

function mergeProductStatuses(statuses: ProductStatus[], current: ProductStatus) {
  return statuses.some((status) => status.id === current.id)
    ? statuses
    : [current, ...statuses];
}

// ── Connected Deals Table ───────────────────────────────────────────

const DEAL_DOT_COLORS = ["#B45309", "#0369A1", "#2563EB", "#15803D", "#9CA3AF"];

function ConnectedDealsTable({
  deals,
  isLoading,
}: {
  readonly deals: ProductDeal[];
  readonly isLoading: boolean;
}) {
  const SHOW_LIMIT = 4;
  const hasMore = deals.length > SHOW_LIMIT;

  return (
    <div className="flex flex-col rounded-xl border border-[#E5E7EB] bg-white overflow-hidden">
      <div className="flex h-[48px] shrink-0 items-center gap-2 border-b border-[#E5E7EB] px-4">
        <BriefcaseBusiness className="h-4 w-4 text-[#6B7280]" />
        <span className="text-[14px] font-extrabold text-[#111827]">연결 딜</span>
        <span className="text-[13px] font-semibold text-[#9CA3AF]">{deals.length}</span>
        <div className="flex-1" />
      </div>

      {isLoading ? (
        <div className="flex flex-col">
          {[1, 2, 3].map((i) => (
            <div className="h-[58px] animate-pulse border-b border-[#F3F4F6] bg-white/60" key={i} />
          ))}
        </div>
      ) : deals.length === 0 ? (
        <p className="px-4 py-4 text-[13px] text-[#9CA3AF]">연결된 딜이 없습니다.</p>
      ) : (
        <div className={hasMore ? "max-h-[232px] overflow-y-auto" : ""}>
          {deals.map((deal, idx) => (
            <Link
              className="flex h-[58px] items-center gap-3 border-b border-[#F3F4F6] bg-white px-4 hover:bg-[#F9FAFB] transition-colors last:border-0"
              key={deal.id}
              to={`/deals/${deal.id}`}
            >
              <div
                className="h-[8px] w-[8px] shrink-0 rounded-full"
                style={{ backgroundColor: DEAL_DOT_COLORS[idx % DEAL_DOT_COLORS.length] }}
              />
              <span className="min-w-0 flex-1 truncate text-[13px] font-extrabold text-[#111827]">
                {deal.dealName}
              </span>
              <span className="shrink-0 text-[13px] font-semibold text-[#374151]">
                ₩{deal.dealCost.toLocaleString("ko-KR")}
              </span>
              <span className="ml-1 shrink-0 rounded-md bg-[#EEF2FF] px-2 py-0.5 text-[11px] font-medium text-[#4338CA]">
                {toDealStatusLabel(deal.dealStatus)}
              </span>
              <span className="ml-2 shrink-0 text-[12px] text-[#9CA3AF]">
                {formatDate(deal.createdAt, { includeYear: true })}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function toDealStatusLabel(status: string) {
  return DEAL_STATUS_LABEL[status as DealStatus] ?? status;
}

// ── Product Memo Panel ──────────────────────────────────────────────

function TimelineMarker({
  isFirst,
  isLast,
}: {
  readonly isFirst: boolean;
  readonly isLast: boolean;
}) {
  return (
    <div className="relative flex w-[8px] shrink-0 self-stretch items-start justify-center pt-[16px]">
      {!isFirst ? (
        <div className="absolute left-1/2 top-0 h-[20px] w-px -translate-x-1/2 bg-[#DBEAFE]" />
      ) : null}
      {!isLast ? (
        <div className="absolute bottom-0 left-1/2 top-[20px] w-px -translate-x-1/2 bg-[#DBEAFE]" />
      ) : null}
      <div className="relative h-[8px] w-[8px] rounded-full bg-[#2563EB]" />
    </div>
  );
}

function ProductMemoPanel({
  productId,
  memoLogs,
  isLoading,
  hasNext,
  isFetchingNext,
  onFetchMore,
  onChanged,
}: {
  readonly productId: string;
  readonly memoLogs: ProductMemoLog[];
  readonly isLoading: boolean;
  readonly hasNext: boolean;
  readonly isFetchingNext: boolean;
  readonly onFetchMore: () => void;
  readonly onChanged: (notice: string) => void;
}) {
  const createMemoMutation = useCreateMemoLogMutation(productId);
  const updateMemoMutation = useUpdateMemoLogMutation(productId);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [createMemoType, setCreateMemoType] = useState("");
  const [createMemo, setCreateMemo] = useState("");

  const [editMemoType, setEditMemoType] = useState("");
  const [editMemo, setEditMemo] = useState("");

  const onSubmitCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createMemo.trim()) return;
    await createMemoMutation.mutateAsync({
      memoType: createMemoType.trim() || "일반",
      memo: createMemo.trim(),
    });
    setCreateMemoType("");
    setCreateMemo("");
    setIsCreateOpen(false);
    onChanged("제품 로그가 추가되었습니다.");
  };

  const onStartEdit = (log: ProductMemoLog) => {
    setEditingId(log.id);
    setEditMemoType(log.memoType);
    setEditMemo(log.memo);
  };

  const onSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId || !editMemo.trim()) return;
    await updateMemoMutation.mutateAsync({
      memoLogId: editingId,
      memoType: editMemoType.trim() || undefined,
      memo: editMemo.trim(),
    });
    setEditingId(null);
    onChanged("제품 로그가 수정되었습니다.");
  };

  const createFormId = "product-log-create-form";

  return (
    <>
    <div className="flex h-[420px] flex-col rounded-xl border border-[#E5E7EB] bg-white overflow-hidden">
      {/* Header */}
      <div className="flex h-[52px] shrink-0 items-center gap-2.5 border-b border-[#E5E7EB] px-4">
        <span className="text-[15px] font-extrabold text-[#111827]">제품 로그</span>
        <div className="flex-1" />
        <button
          aria-label="제품 로그 추가"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#2563EB] text-white transition-colors hover:bg-[#1D4ED8]"
          onClick={() => setIsCreateOpen(true)}
          type="button"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Memo List */}
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex flex-col gap-2">
            {[1, 2].map((i) => (
              <div className="h-16 animate-pulse rounded-lg bg-[#F3F4F6]" key={i} />
            ))}
          </div>
        ) : memoLogs.length === 0 ? (
          <p className="text-[13px] text-[#9CA3AF]">제품 로그가 없습니다.</p>
        ) : (
          memoLogs.map((log, index) =>
            editingId === log.id ? (
              <form
                className="flex flex-col gap-2 rounded-lg border border-[#DBEAFE] bg-[#EFF6FF] p-3"
                key={log.id}
                onSubmit={(e) => void onSubmitEdit(e)}
              >
                <div className="flex h-8 items-center rounded border border-[#BFDBFE] bg-white px-2">
                  <input
                    className="flex-1 bg-transparent text-[12px] font-semibold text-[#111827] outline-none"
                    value={editMemoType}
                    onChange={(e) => setEditMemoType(e.target.value)}
                  />
                </div>
                <textarea
                  className="resize-none rounded border border-[#BFDBFE] bg-white p-2 text-[13px] font-medium text-[#374151] outline-none"
                  rows={3}
                  value={editMemo}
                  onChange={(e) => setEditMemo(e.target.value)}
                />
                <div className="flex justify-end gap-2">
                  <button
                    className="h-7 rounded px-2.5 text-[12px] font-semibold text-[#6B7280] hover:bg-white transition-colors"
                    onClick={() => setEditingId(null)}
                    type="button"
                  >
                    취소
                  </button>
                  <button
                    className="h-7 rounded bg-[#2563EB] px-2.5 text-[12px] font-extrabold text-white hover:bg-[#1D4ED8] transition-colors disabled:opacity-50"
                    disabled={updateMemoMutation.isPending}
                    type="submit"
                  >
                    저장
                  </button>
                </div>
              </form>
            ) : (
              <div
                className="group flex gap-3"
                key={log.id}
              >
                <TimelineMarker
                  isFirst={index === 0}
                  isLast={index === memoLogs.length - 1}
                />
                <div className="min-w-0 flex-1">
                <button
                  className="flex min-h-[40px] w-full items-center bg-white text-left"
                  onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                  type="button"
                >
                  <span className="flex-1 truncate text-[13px] font-semibold text-[#111827]">
                    {log.memoType || "제목 없음"}
                  </span>
                  <span className="shrink-0 text-[11px] font-bold text-[#9CA3AF]">
                    {formatDateTime(log.createdAt, { includeYear: true })}
                  </span>
                  <div
                    className="invisible ml-1 flex h-6 w-6 shrink-0 items-center justify-center rounded group-hover:visible"
                    onClick={(e) => { e.stopPropagation(); onStartEdit(log); }}
                    role="button"
                    tabIndex={-1}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.stopPropagation(); onStartEdit(log); } }}
                  >
                    <Pencil className="h-3 w-3 text-[#9CA3AF]" />
                  </div>
                </button>
                {expandedId === log.id ? (
                  <p className="pb-3 pt-1 text-[13px] font-medium leading-[1.35] text-[#374151] whitespace-pre-wrap">
                    {log.memo}
                  </p>
                ) : null}
                </div>
              </div>
            )
          )
        )}
        {hasNext ? (
          <button
            className="text-[12px] font-semibold text-[#6B7280] hover:text-[#374151] transition-colors"
            disabled={isFetchingNext}
            onClick={onFetchMore}
            type="button"
          >
            {isFetchingNext ? "불러오는 중..." : "더 보기"}
          </button>
        ) : null}
      </div>
    </div>
    <ModalShell
      footer={
        <ModalFooterActions
          formId={createFormId}
          isSubmitting={createMemoMutation.isPending}
          pendingLabel="추가 중"
          submitLabel="추가"
          onCancel={() => setIsCreateOpen(false)}
        />
      }
      open={isCreateOpen}
      size="md"
      title="제품 로그 추가"
      onOpenChange={setIsCreateOpen}
    >
      <ModalForm id={createFormId} onSubmit={(e) => void onSubmitCreate(e)}>
        <ModalFormSection title="제품 로그">
          <ModalFieldGroup id="product-log-create-title" label="제목">
            <input
              className="h-10 w-full rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              id="product-log-create-title"
              placeholder="제품 로그 제목"
              value={createMemoType}
              onChange={(e) => setCreateMemoType(e.target.value)}
            />
          </ModalFieldGroup>
          <ModalFieldGroup id="product-log-create-memo" label="내용">
            <textarea
              className="min-h-28 resize-y rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              id="product-log-create-memo"
              placeholder="내용 입력"
              rows={4}
              value={createMemo}
              onChange={(e) => setCreateMemo(e.target.value)}
            />
          </ModalFieldGroup>
        </ModalFormSection>
        {createMemoMutation.error ? (
          <p className="text-xs text-[#B91C1C]">
            {getApiErrorMessage(createMemoMutation.error)}
          </p>
        ) : null}
      </ModalForm>
    </ModalShell>
    </>
  );
}

// ── Product Activity Log Panel ──────────────────────────────────────

function ProductActivityLogPanel({
  productId,
  privateMemoLogs,
  isLoading,
  hasNext,
  isFetchingNext,
  onFetchMore,
  onChanged,
}: {
  readonly productId: string;
  readonly privateMemoLogs: ProductPrivateMemoLog[];
  readonly isLoading: boolean;
  readonly hasNext: boolean;
  readonly isFetchingNext: boolean;
  readonly onFetchMore: () => void;
  readonly onChanged: (notice: string) => void;
}) {
  const createMutation = useCreatePrivateMemoLogMutation(productId);
  const updateMutation = useUpdatePrivateMemoLogMutation(productId);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [createMemo, setCreateMemo] = useState("");
  const [editMemo, setEditMemo] = useState("");

  const onSubmitCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createMemo.trim()) return;
    await createMutation.mutateAsync({ memo: createMemo.trim() });
    setCreateMemo("");
    setIsCreateOpen(false);
    onChanged("비밀 메모가 추가되었습니다.");
  };

  const onStartEdit = (log: ProductPrivateMemoLog) => {
    setEditingId(log.id);
    setEditMemo(log.memo);
  };

  const onSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId || !editMemo.trim()) return;
    await updateMutation.mutateAsync({
      privateMemoLogId: editingId,
      memo: editMemo.trim(),
    });
    setEditingId(null);
    onChanged("비밀 메모가 수정되었습니다.");
  };

  const createFormId = "product-private-memo-create-form";

  return (
    <>
    <div className="flex h-[420px] flex-col rounded-xl border border-[#E5E7EB] bg-white overflow-hidden">
      {/* Header */}
      <div className="flex h-[52px] shrink-0 items-center gap-2.5 border-b border-[#E5E7EB] px-4">
        <span className="text-[15px] font-extrabold text-[#111827]">비밀 메모</span>
        <div
          aria-label="암호화 보안 메모"
          className="flex items-center gap-1.5"
          title="암호화 보안 메모"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#DBEAFE]">
            <ShieldCheck className="h-4 w-4 text-[#1D4ED8]" />
          </span>
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#DBEAFE]">
            <LockKeyhole className="h-4 w-4 text-[#1D4ED8]" />
          </span>
        </div>
        <div className="flex-1" />
        <button
          aria-label="비밀 메모 추가"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#2563EB] text-white transition-colors hover:bg-[#1D4ED8]"
          onClick={() => setIsCreateOpen(true)}
          type="button"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Items */}
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex flex-col gap-2">
            {[1, 2, 3].map((i) => (
              <div className="h-12 animate-pulse rounded-lg bg-[#F3F4F6]" key={i} />
            ))}
          </div>
        ) : privateMemoLogs.length === 0 ? (
          <p className="text-[13px] text-[#9CA3AF]">등록된 비밀 메모가 없습니다.</p>
        ) : (
          privateMemoLogs.map((log, index) =>
            editingId === log.id ? (
              <form
                className="flex flex-col gap-2 rounded-lg border border-[#CCFBF1] bg-[#F0FDFA] p-3"
                key={log.id}
                onSubmit={(e) => void onSubmitEdit(e)}
              >
                <textarea
                  className="resize-none rounded border border-[#99F6E4] bg-white p-2 text-[13px] font-medium text-[#374151] outline-none"
                  rows={3}
                  value={editMemo}
                  onChange={(e) => setEditMemo(e.target.value)}
                />
                <div className="flex justify-end gap-2">
                  <button
                    className="h-7 rounded px-2.5 text-[12px] font-semibold text-[#6B7280] hover:bg-white transition-colors"
                    onClick={() => setEditingId(null)}
                    type="button"
                  >
                    취소
                  </button>
                  <button
                    className="h-7 rounded bg-[#2563EB] px-2.5 text-[12px] font-extrabold text-white hover:bg-[#1D4ED8] transition-colors disabled:opacity-50"
                    disabled={updateMutation.isPending}
                    type="submit"
                  >
                    저장
                  </button>
                </div>
              </form>
            ) : (
              <div
                className="group flex gap-3"
                key={log.id}
              >
                <TimelineMarker
                  isFirst={index === 0}
                  isLast={index === privateMemoLogs.length - 1}
                />
                <div className="min-w-0 flex-1">
                <button
                  className="flex min-h-[40px] w-full items-center bg-white text-left"
                  onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                  type="button"
                >
                  <span className="flex-1 truncate text-[12px] font-medium text-[#4B5563]">
                    {log.memo}
                  </span>
                  <span className="shrink-0 text-[11px] font-semibold text-[#9CA3AF]">
                    {formatDateTime(log.createdAt, { includeYear: true })}
                  </span>
                  <div
                    className="invisible ml-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded group-hover:visible"
                    onClick={(e) => { e.stopPropagation(); onStartEdit(log); }}
                    role="button"
                    tabIndex={-1}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.stopPropagation(); onStartEdit(log); } }}
                  >
                    <Pencil className="h-3 w-3 text-[#9CA3AF]" />
                  </div>
                </button>
                {expandedId === log.id ? (
                  <p className="pb-3 pt-1 text-[12px] font-medium leading-[1.35] text-[#4B5563] whitespace-pre-wrap">
                    {log.memo}
                  </p>
                ) : null}
                </div>
              </div>
            )
          )
        )}
        {hasNext ? (
          <button
            className="text-[12px] font-semibold text-[#6B7280] hover:text-[#374151] transition-colors"
            disabled={isFetchingNext}
            onClick={onFetchMore}
            type="button"
          >
            {isFetchingNext ? "불러오는 중..." : "더 보기"}
          </button>
        ) : null}
      </div>
    </div>
    <ModalShell
      footer={
        <ModalFooterActions
          formId={createFormId}
          isSubmitting={createMutation.isPending}
          pendingLabel="추가 중"
          submitLabel="추가"
          onCancel={() => setIsCreateOpen(false)}
        />
      }
      open={isCreateOpen}
      size="md"
      title="비밀 메모 추가"
      onOpenChange={setIsCreateOpen}
    >
      <ModalForm id={createFormId} onSubmit={(e) => void onSubmitCreate(e)}>
        <ModalFormSection title="비밀 메모">
          <ModalFieldGroup id="product-private-memo-create-memo" label="내용">
            <textarea
              className="min-h-32 resize-y rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              id="product-private-memo-create-memo"
              placeholder="비밀 메모 입력"
              rows={5}
              value={createMemo}
              onChange={(e) => setCreateMemo(e.target.value)}
            />
          </ModalFieldGroup>
        </ModalFormSection>
        {createMutation.error ? (
          <p className="text-xs text-[#B91C1C]">
            {getApiErrorMessage(createMutation.error)}
          </p>
        ) : null}
      </ModalForm>
    </ModalShell>
    </>
  );
}

// ── Skeleton / Error ────────────────────────────────────────────────

function ProductDetailError({
  error,
  onRetry,
}: {
  readonly error: unknown;
  readonly onRetry: () => void;
}) {
  return (
    <div className="flex min-h-full flex-col bg-[#FAFAF8]">
      <div className="mx-auto max-w-xl px-6 py-12">
        <div className="rounded-xl border border-red-100 bg-red-50 p-5">
          <p className="text-[13px] text-red-600">{getApiErrorMessage(error)}</p>
          <button
            className="mt-3 inline-flex h-8 items-center rounded-lg border border-red-200 bg-white px-3 text-[13px] text-red-600 hover:bg-red-50"
            onClick={onRetry}
            type="button"
          >
            다시 시도
          </button>
        </div>
      </div>
    </div>
  );
}

function ProductDetailSkeleton() {
  return (
    <div className="min-h-full bg-[#FAFAF8]">
      <div className="flex h-16 items-center gap-3 px-6">
        <div className="h-4 w-4 animate-pulse rounded bg-[#F3F4F6]" />
        <div className="h-4 w-48 animate-pulse rounded bg-[#F3F4F6]" />
        <div className="ml-auto flex gap-2">
          <div className="h-9 w-14 animate-pulse rounded-lg bg-[#F3F4F6]" />
          <div className="h-9 w-14 animate-pulse rounded-lg bg-[#F3F4F6]" />
        </div>
      </div>
      <div className="flex flex-col gap-4 p-6">
        <div className="h-[72px] animate-pulse rounded-xl bg-white" />
        <div className="h-[240px] animate-pulse rounded-xl bg-white" />
        <div className="flex gap-4">
          <div className="h-[420px] flex-1 animate-pulse rounded-xl bg-white" />
          <div className="h-[420px] flex-1 animate-pulse rounded-xl bg-white" />
        </div>
      </div>
    </div>
  );
}
