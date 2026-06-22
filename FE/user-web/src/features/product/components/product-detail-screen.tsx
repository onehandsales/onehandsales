import {
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
  Package,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Toast } from "@/components/ui/toast";
import { ProductEditForm } from "@/features/product/components/product-edit-form";
import {
  useProductDeals,
  useProductDetail,
  useProductMemoLogsInfinite,
  useProductPrivateMemoLogsInfinite,
} from "@/features/product/hooks/use-product-detail";
import {
  useCreateMemoLogMutation,
  useCreatePrivateMemoLogMutation,
  useDeleteProductMutation,
  useUpdateMemoLogMutation,
  useUpdatePrivateMemoLogMutation,
} from "@/features/product/hooks/use-product-mutations";
import type {
  ProductDeal,
  ProductMemoLog,
  ProductPrivateMemoLog,
} from "@/features/product/types/product";
import { DEAL_STATUS_LABEL, type DealStatus } from "@/features/deal/types/deal";
import { getApiErrorMessage } from "@/lib/api-client";
import { formatDate, formatDateTime } from "@/utils/format";

type ProductDetailScreenProps = {
  readonly productId: string;
};

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
            aria-label="수정"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E5E7EB] bg-white text-[#374151] disabled:opacity-50"
            onClick={() => setIsEditing(true)}
            type="button"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            aria-label="삭제"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#FEE2E2] bg-white text-[#B91C1C] disabled:opacity-50"
            disabled={deleteProductMutation.isPending}
            onClick={() => void onDeleteProduct()}
            type="button"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-col gap-4 p-4 pb-24">
          <ProductSummaryHeader product={product} dealCount={deals.length} />

          {isEditing ? (
            <div className="rounded-xl border border-[#E5E7EB] bg-white p-4">
              <h2 className="mb-4 text-[14px] font-bold text-[#111827]">제품 정보 수정</h2>
              <ProductEditForm
                product={product}
                onSaved={() => {
                  void productQuery.refetch();
                  setNotice("제품 정보가 저장되었습니다.");
                  setIsEditing(false);
                }}
              />
              <button
                className="mt-3 text-[13px] text-[#6B7280] underline"
                onClick={() => setIsEditing(false)}
                type="button"
              >
                취소
              </button>
            </div>
          ) : null}

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
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E5E7EB] bg-white text-[#374151] transition-colors hover:bg-[#F9FAFB]"
            onClick={() => setIsEditing((v) => !v)}
            type="button"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            aria-label="삭제"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#FEE2E2] bg-white text-[#B91C1C] transition-colors hover:bg-red-50 disabled:opacity-50"
            disabled={deleteProductMutation.isPending}
            onClick={() => void onDeleteProduct()}
            type="button"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-6">
          <ProductSummaryHeader product={product} dealCount={deals.length} />

          {isEditing ? (
            <div className="rounded-xl border border-[#E5E7EB] bg-white p-5">
              <h2 className="mb-4 text-[14px] font-bold text-[#111827]">제품 정보 수정</h2>
              <ProductEditForm
                product={product}
                onSaved={() => {
                  void productQuery.refetch();
                  setNotice("제품 정보가 저장되었습니다.");
                  setIsEditing(false);
                }}
              />
              <button
                className="mt-3 text-[13px] text-[#6B7280] underline hover:text-[#374151]"
                onClick={() => setIsEditing(false)}
                type="button"
              >
                취소
              </button>
            </div>
          ) : null}

          {/* 1행: 연결딜 (전체 너비) */}
          <ConnectedDealsTable
            deals={deals}
            isLoading={dealsQuery.isLoading}
          />

          {/* 2행: 메모 + 활동 로그 */}
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
}: {
  readonly product: {
    readonly productName: string;
    readonly productCategory: { readonly categoryName: string };
    readonly productStatus: { readonly statusName: string };
    readonly productPrice: number;
    readonly createdAt: string;
    readonly updatedAt: string;
  };
  readonly dealCount: number;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-[#E5E7EB] bg-white px-5 py-4">
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
        <span>등록 {formatDate(product.createdAt, { includeYear: true })}</span>
        <span>수정 {formatDate(product.updatedAt, { includeYear: true })}</span>
      </div>
    </div>
  );
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
  const SHOW_LIMIT = 5;
  const visible = deals.slice(0, SHOW_LIMIT);
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
            <div className="h-[54px] animate-pulse border-b border-[#F3F4F6] bg-white/60" key={i} />
          ))}
        </div>
      ) : deals.length === 0 ? (
        <p className="px-4 py-4 text-[13px] text-[#9CA3AF]">연결된 딜이 없습니다.</p>
      ) : (
        <>
          <div className={hasMore ? "max-h-[270px] overflow-y-auto" : ""}>
            {visible.map((deal, idx) => (
              <Link
                className="flex h-[54px] items-center gap-3 border-b border-[#F3F4F6] bg-white px-4 hover:bg-[#F9FAFB] transition-colors last:border-0"
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
          {hasMore ? (
            <div className="flex h-8 items-center px-4">
              <span className="text-[12px] font-semibold text-[#9CA3AF]">
                +{deals.length - SHOW_LIMIT}건 더 있음
              </span>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}

function toDealStatusLabel(status: string) {
  return DEAL_STATUS_LABEL[status as DealStatus] ?? status;
}

// ── Product Memo Panel ──────────────────────────────────────────────

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
    onChanged("메모가 추가되었습니다.");
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
    onChanged("메모가 수정되었습니다.");
  };

  return (
    <div className="flex h-[420px] flex-col rounded-xl border border-[#E5E7EB] bg-white overflow-hidden">
      {/* Header */}
      <div className="flex h-[52px] shrink-0 items-center gap-2.5 border-b border-[#E5E7EB] px-4">
        <span className="text-[15px] font-extrabold text-[#111827]">메모</span>
        <div className="flex-1" />
      </div>

      {/* Composer */}
      <form
        className="flex shrink-0 flex-col gap-2.5 border-b border-[#F3F4F6] p-4"
        onSubmit={(e) => void onSubmitCreate(e)}
      >
        <div className="flex items-center gap-2">
          <div className="flex h-9 flex-1 items-center rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-3">
            <input
              className="flex-1 bg-transparent text-[13px] font-semibold text-[#111827] outline-none placeholder:text-[#9CA3AF]"
              placeholder="메모 제목"
              value={createMemoType}
              onChange={(e) => setCreateMemoType(e.target.value)}
            />
          </div>
          <button
            className="flex h-9 w-[72px] shrink-0 items-center justify-center gap-1 rounded-lg bg-[#2563EB] text-[12px] font-extrabold text-white hover:bg-[#1D4ED8] transition-colors disabled:opacity-50"
            disabled={createMemoMutation.isPending}
            type="submit"
          >
            <Plus className="h-3.5 w-3.5" />
            추가
          </button>
        </div>
        <div className="flex rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-3" style={{ minHeight: 52 }}>
          <textarea
            className="flex-1 resize-none bg-transparent text-[13px] font-medium text-[#111827] outline-none placeholder:text-[#9CA3AF]"
            placeholder="내용 입력"
            rows={2}
            value={createMemo}
            onChange={(e) => setCreateMemo(e.target.value)}
          />
        </div>
      </form>

      {/* Memo List */}
      <div className="flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex flex-col gap-2">
            {[1, 2].map((i) => (
              <div className="h-16 animate-pulse rounded-lg bg-[#F3F4F6]" key={i} />
            ))}
          </div>
        ) : memoLogs.length === 0 ? (
          <p className="text-[13px] text-[#9CA3AF]">등록된 메모가 없습니다.</p>
        ) : (
          memoLogs.map((log) =>
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
                className="group flex flex-col gap-1 border-b border-[#F3F4F6] pb-2.5 last:border-0"
                key={log.id}
              >
                <button
                  className="flex w-full items-center gap-1 text-left"
                  onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                  type="button"
                >
                  <ChevronRight
                    className={`h-3.5 w-3.5 shrink-0 text-[#9CA3AF] transition-transform ${expandedId === log.id ? "rotate-90" : ""}`}
                  />
                  <span className="flex-1 truncate text-[13px] font-semibold text-[#111827]">
                    {log.memoType || "제목 없음"}
                  </span>
                  <span className="shrink-0 text-[11px] font-bold text-[#9CA3AF]">
                    {formatDateTime(log.createdAt, { includeYear: true })}
                  </span>
                  <div
                    className="ml-1 hidden h-6 w-6 shrink-0 items-center justify-center rounded hover:bg-[#F3F4F6] transition-colors group-hover:flex"
                    onClick={(e) => { e.stopPropagation(); onStartEdit(log); }}
                    role="button"
                    tabIndex={-1}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.stopPropagation(); onStartEdit(log); } }}
                  >
                    <Pencil className="h-3 w-3 text-[#9CA3AF]" />
                  </div>
                </button>
                {expandedId === log.id ? (
                  <p className="pl-5 text-[13px] font-medium leading-[1.35] text-[#374151] whitespace-pre-wrap">
                    {log.memo}
                  </p>
                ) : null}
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

  const [createMemo, setCreateMemo] = useState("");
  const [editMemo, setEditMemo] = useState("");

  const onSubmitCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createMemo.trim()) return;
    await createMutation.mutateAsync({ memo: createMemo.trim() });
    setCreateMemo("");
    onChanged("활동 로그가 추가되었습니다.");
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
    onChanged("활동 로그가 수정되었습니다.");
  };

  return (
    <div className="flex h-[420px] flex-col rounded-xl border border-[#E5E7EB] bg-white overflow-hidden">
      {/* Header */}
      <div className="flex h-[52px] shrink-0 items-center border-b border-[#E5E7EB] px-4">
        <span className="text-[15px] font-extrabold text-[#111827]">활동 로그</span>
      </div>

      {/* Composer */}
      <form
        className="flex shrink-0 flex-col gap-2 border-b border-[#F3F4F6] p-4"
        onSubmit={(e) => void onSubmitCreate(e)}
      >
        <div className="flex rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2.5" style={{ minHeight: 48 }}>
          <textarea
            className="flex-1 resize-none bg-transparent text-[13px] font-medium text-[#111827] outline-none placeholder:text-[#9CA3AF]"
            placeholder="활동 내용 입력"
            rows={2}
            value={createMemo}
            onChange={(e) => setCreateMemo(e.target.value)}
          />
        </div>
        <div className="flex justify-end">
          <button
            className="flex h-8 items-center justify-center gap-1.5 rounded-lg bg-[#0D9488] px-3 text-[13px] font-extrabold text-white hover:bg-[#0F766E] transition-colors disabled:opacity-50"
            disabled={createMutation.isPending}
            type="submit"
          >
            <Plus className="h-3.5 w-3.5" />
            추가
          </button>
        </div>
      </form>

      {/* Items */}
      <div className="flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex flex-col gap-2">
            {[1, 2, 3].map((i) => (
              <div className="h-12 animate-pulse rounded-lg bg-[#F3F4F6]" key={i} />
            ))}
          </div>
        ) : privateMemoLogs.length === 0 ? (
          <p className="text-[13px] text-[#9CA3AF]">활동 기록이 없습니다.</p>
        ) : (
          privateMemoLogs.map((log) =>
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
                    className="h-7 rounded bg-[#0D9488] px-2.5 text-[12px] font-extrabold text-white hover:bg-[#0F766E] transition-colors disabled:opacity-50"
                    disabled={updateMutation.isPending}
                    type="submit"
                  >
                    저장
                  </button>
                </div>
              </form>
            ) : (
              <div
                className="group flex flex-col gap-1 border-b border-[#F3F4F6] pb-2.5 last:border-0"
                key={log.id}
              >
                <button
                  className="flex w-full items-center gap-2 text-left"
                  onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                  type="button"
                >
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-2xl bg-[#EFF6FF]">
                    <div className="h-[6px] w-[6px] rounded-full bg-[#2563EB]" />
                  </div>
                  <span className={`flex-1 text-[12px] font-medium text-[#4B5563] ${expandedId === log.id ? "whitespace-pre-wrap" : "truncate"}`}>
                    {log.memo}
                  </span>
                  <span className="shrink-0 text-[11px] font-semibold text-[#9CA3AF]">
                    {formatDateTime(log.createdAt, { includeYear: true })}
                  </span>
                  <div
                    className="ml-0.5 hidden h-6 w-6 shrink-0 items-center justify-center rounded hover:bg-[#F3F4F6] transition-colors group-hover:flex"
                    onClick={(e) => { e.stopPropagation(); onStartEdit(log); }}
                    role="button"
                    tabIndex={-1}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.stopPropagation(); onStartEdit(log); } }}
                  >
                    <Pencil className="h-3 w-3 text-[#9CA3AF]" />
                  </div>
                </button>
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
