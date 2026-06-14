import { Lock, Package, Plus } from "lucide-react";
import { useState } from "react";
import { ProductEditForm } from "@/features/product/components/product-edit-form";
import {
  useProductDetail,
  useProductMemoLogsInfinite,
  useProductPrivateMemoLogsInfinite,
} from "@/features/product/hooks/use-product-detail";
import {
  useCreateMemoLogMutation,
  useCreatePrivateMemoLogMutation,
  useUpdateMemoLogMutation,
  useUpdatePrivateMemoLogMutation,
} from "@/features/product/hooks/use-product-mutations";
import type {
  ProductMemoLog,
  ProductPrivateMemoLog,
} from "@/features/product/types/product";
import { getApiErrorMessage } from "@/lib/api-client";
import { formatDate, formatDateTime } from "@/utils/format";

type ProductDetailScreenProps = {
  readonly productId: string;
  readonly isEditing: boolean;
  readonly onEditingChange: (v: boolean) => void;
};

export function ProductDetailScreen({ productId, isEditing, onEditingChange }: ProductDetailScreenProps) {
  const [notice, setNotice] = useState<string | null>(null);
  const productQuery = useProductDetail(productId);
  const memoLogsQuery = useProductMemoLogsInfinite(productId);
  const privateMemoLogsQuery = useProductPrivateMemoLogsInfinite(productId);

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

  const memoLogs = memoLogsQuery.data?.pages.flatMap((p) => p.items) ?? [];
  const memoTotalCount = memoLogs.length;
  const memoHasNext = memoLogsQuery.data?.pages.at(-1)?.hasNext ?? false;

  const privateMemoLogs =
    privateMemoLogsQuery.data?.pages.flatMap((p) => p.items) ?? [];
  const privateMemoHasNext =
    privateMemoLogsQuery.data?.pages.at(-1)?.hasNext ?? false;

  return (
    <div className="flex h-full flex-col">
      {/* Notices */}
      {notice ? (
        <div className="mx-6 mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-800">
          {notice}
        </div>
      ) : null}

      {/* Content */}
      <div className="flex min-h-0 flex-1 overflow-hidden bg-[#F9FAFB]">
        {/* Left */}
        <div className="flex min-w-0 flex-1 flex-col gap-4 overflow-y-auto p-6">
          {/* 기본 정보 카드 */}
          <div className="rounded-lg border border-[#E5E7EB] bg-white p-5">
            <h2 className="mb-4 text-[14px] font-semibold text-[#111827]">
              기본 정보
            </h2>
            {isEditing ? (
              <ProductEditForm
                onSaved={() => {
                  setNotice("제품이 저장되었습니다.");
                  onEditingChange(false);
                  void productQuery.refetch();
                }}
                product={product}
              />
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <ProductInfoField label="제품명" value={product.productName} />
                <ProductInfoField
                  label="등록일"
                  value={formatDate(product.createdAt, { year: "numeric" })}
                />
                <ProductInfoField
                  label="분류"
                  value={product.productCategory.categoryName}
                />
                <ProductInfoField
                  label="단위"
                  value={
                    product.productPrice
                      ? `${product.productPrice.toLocaleString()}원`
                      : "-"
                  }
                />
              </div>
            )}
          </div>

          {/* 메모 기록 카드 */}
          <MemoLogsCard
            hasNext={memoHasNext}
            isFetchingNextPage={memoLogsQuery.isFetchingNextPage}
            isLoading={memoLogsQuery.isLoading}
            logs={memoLogs}
            productId={productId}
            totalCount={memoTotalCount}
            onFetchNext={() => void memoLogsQuery.fetchNextPage()}
          />
        </div>

        {/* Right */}
        <div className="flex w-[415px] shrink-0   flex-col gap-4 overflow-y-auto bg-[#F9FAFB] p-6">
          {/* 판매 현황 카드 */}
          <div className="rounded-lg border border-[#E5E7EB] bg-white p-4">
            <h3 className="mb-3 text-[13px] font-semibold text-[#111827]">
              판매 현황
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1 rounded-lg bg-[#F9FAFB] p-3">
                <span className="text-[11px] font-medium text-[#6B7280]">
                  연결 딜
                </span>
                <span className="text-[20px] font-bold text-[#111827]">-</span>
              </div>
              <div className="flex flex-col gap-1 rounded-lg bg-[#F9FAFB] p-3">
                <span className="text-[11px] font-medium text-[#6B7280]">
                  이번 달 사용
                </span>
                <span className="text-[20px] font-bold text-[#111827]">-</span>
              </div>
            </div>
          </div>
          {/* Memo 기록 카드 */}
          <PrivateMemoLogsCard
            hasNext={privateMemoHasNext}
            isFetchingNextPage={privateMemoLogsQuery.isFetchingNextPage}
            isLoading={privateMemoLogsQuery.isLoading}
            logs={privateMemoLogs}
            productId={productId}
            onFetchNext={() => void privateMemoLogsQuery.fetchNextPage()}
          />
        </div>
      </div>
    </div>
  );
}

// ── Memo Logs Card ──────────────────────────────────────────────────────────

function MemoLogsCard({
  productId,
  logs,
  totalCount,
  hasNext,
  isLoading,
  isFetchingNextPage,
  onFetchNext,
}: {
  readonly productId: string;
  readonly logs: ProductMemoLog[];
  readonly totalCount: number;
  readonly hasNext: boolean;
  readonly isLoading: boolean;
  readonly isFetchingNextPage: boolean;
  readonly onFetchNext: () => void;
}) {
  const createMutation = useCreateMemoLogMutation(productId);
  const updateMutation = useUpdateMemoLogMutation(productId);

  const [showCreate, setShowCreate] = useState(false);
  const [createMemoType, setCreateMemoType] = useState("");
  const [createMemo, setCreateMemo] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editMemoType, setEditMemoType] = useState("");
  const [editMemo, setEditMemo] = useState("");
  const [editError, setEditError] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!createMemo.trim()) return;
    setCreateError(null);
    try {
      await createMutation.mutateAsync({
        memoType: createMemoType.trim() || "일반",
        memo: createMemo.trim(),
      });
      setCreateMemoType("");
      setCreateMemo("");
      setShowCreate(false);
    } catch (err) {
      setCreateError(getApiErrorMessage(err));
    }
  };

  const handleUpdate = async (logId: string) => {
    if (!editMemo.trim()) return;
    setEditError(null);
    try {
      await updateMutation.mutateAsync({
        memoLogId: logId,
        memoType: editMemoType.trim() || undefined,
        memo: editMemo.trim(),
      });
      setEditingId(null);
    } catch (err) {
      setEditError(getApiErrorMessage(err));
    }
  };

  const startEdit = (log: ProductMemoLog) => {
    setEditingId(log.id);
    setEditMemoType(log.memoType);
    setEditMemo(log.memo);
    setEditError(null);
  };

  return (
    <div className="rounded-lg border border-[#E5E7EB] bg-white p-4">
      <div className="mb-3 flex items-center gap-2">
        <h3 className="flex-1 text-[13px] font-semibold text-[#111827]">
          제품 로그
        </h3>
        <span className="text-[12px] text-[#9CA3AF]">{totalCount}건</span>
        <button
          className="inline-flex h-7 items-center gap-1 rounded-md border border-[#E5E7EB] px-2.5 text-[12px] font-medium text-[#374151] hover:bg-[#F9FAFB]"
          onClick={() => {
            setShowCreate(true);
            setCreateError(null);
          }}
          type="button"
        >
          <Plus className="h-3 w-3" strokeWidth={2.5} />
          메모 추가
        </button>
      </div>

      {/* Inline create form */}
      {showCreate && (
        <div className="mb-3 rounded-lg border border-[#BFDBFE] bg-[#EFF6FF] p-3">
          <div className="flex flex-col gap-2">
            <input
              className="h-8 rounded-md border border-[#E6EAF0] bg-white px-2.5 text-[12px] outline-none focus:border-[#93C5FD] focus:ring-1 focus:ring-[#93C5FD]"
              placeholder="메모 유형 (예: 영업, 기술, 일반)"
              value={createMemoType}
              onChange={(e) => setCreateMemoType(e.target.value)}
            />
            <textarea
              className="min-h-[72px] resize-y rounded-md border border-[#E6EAF0] bg-white px-2.5 py-2 text-[12px] outline-none focus:border-[#93C5FD] focus:ring-1 focus:ring-[#93C5FD]"
              placeholder="메모 내용을 입력하세요"
              value={createMemo}
              onChange={(e) => setCreateMemo(e.target.value)}
            />
            {createError ? (
              <p className="text-[11px] text-[#EF4444]">{createError}</p>
            ) : null}
            <div className="flex justify-end gap-2">
              <button
                className="inline-flex h-7 items-center rounded-md border border-[#E5E7EB] bg-white px-2.5 text-[12px] font-medium text-[#374151] hover:bg-[#F9FAFB]"
                onClick={() => {
                  setShowCreate(false);
                  setCreateMemoType("");
                  setCreateMemo("");
                }}
                type="button"
              >
                취소
              </button>
              <button
                className="inline-flex h-7 items-center rounded-md bg-[#1D4ED8] px-2.5 text-[12px] font-medium text-white hover:bg-[#1E40AF] disabled:opacity-60"
                disabled={createMutation.isPending || !createMemo.trim()}
                onClick={() => void handleCreate()}
                type="button"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="py-4 text-center text-[13px] text-[#9CA3AF]">
          불러오는 중...
        </div>
      ) : logs.length === 0 ? (
        <p className="py-2 text-[13px] text-[#9CA3AF]">
          등록된 메모가 없습니다.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {logs.map((log) =>
            editingId === log.id ? (
              <div
                key={log.id}
                className="rounded-lg border border-[#BFDBFE] bg-[#EFF6FF] p-3"
              >
                <div className="flex flex-col gap-2">
                  <input
                    className="h-8 rounded-md border border-[#E6EAF0] bg-white px-2.5 text-[12px] outline-none focus:border-[#93C5FD] focus:ring-1 focus:ring-[#93C5FD]"
                    placeholder="메모 유형"
                    value={editMemoType}
                    onChange={(e) => setEditMemoType(e.target.value)}
                  />
                  <textarea
                    className="min-h-[72px] resize-y rounded-md border border-[#E6EAF0] bg-white px-2.5 py-2 text-[12px] outline-none focus:border-[#93C5FD] focus:ring-1 focus:ring-[#93C5FD]"
                    value={editMemo}
                    onChange={(e) => setEditMemo(e.target.value)}
                  />
                  {editError ? (
                    <p className="text-[11px] text-[#EF4444]">{editError}</p>
                  ) : null}
                  <div className="flex justify-end gap-2">
                    <button
                      className="inline-flex h-7 items-center rounded-md border border-[#E5E7EB] bg-white px-2.5 text-[12px] font-medium text-[#374151] hover:bg-[#F9FAFB]"
                      onClick={() => setEditingId(null)}
                      type="button"
                    >
                      취소
                    </button>
                    <button
                      className="inline-flex h-7 items-center rounded-md bg-[#1D4ED8] px-2.5 text-[12px] font-medium text-white hover:bg-[#1E40AF] disabled:opacity-60"
                      disabled={updateMutation.isPending || !editMemo.trim()}
                      onClick={() => void handleUpdate(log.id)}
                      type="button"
                    >
                      저장
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div
                key={log.id}
                className="flex flex-col gap-1 rounded-lg bg-[#F9FAFB] p-3"
              >
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-5 items-center rounded bg-[#F3F4F6] px-1.5 text-[10px] font-medium text-[#374151]">
                    {log.memoType}
                  </span>
                  <span className="flex-1 text-[11px] text-[#9CA3AF]">
                    {formatDateTime(log.createdAt, { includeYear: true })}
                  </span>
                  <button
                    className="text-[11px] font-medium text-[#6B7280] hover:text-[#374151]"
                    onClick={() => startEdit(log)}
                    type="button"
                  >
                    수정
                  </button>
                </div>
                <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-[#374151]">
                  {log.memo}
                </p>
              </div>
            ),
          )}
        </div>
      )}

      {hasNext && (
        <div className="mt-3 flex justify-center">
          <button
            className="inline-flex h-8 items-center rounded-lg border border-[#E5E7EB] bg-white px-3 text-[12px] font-medium text-[#374151] hover:bg-[#F9FAFB] disabled:opacity-60"
            disabled={isFetchingNextPage}
            onClick={onFetchNext}
            type="button"
          >
            {isFetchingNextPage ? "불러오는 중..." : "더 보기"}
          </button>
        </div>
      )}
    </div>
  );
}

// ── Private Memo Logs Card ──────────────────────────────────────────────────

function PrivateMemoLogsCard({
  productId,
  logs,
  hasNext,
  isLoading,
  isFetchingNextPage,
  onFetchNext,
}: {
  readonly productId: string;
  readonly logs: ProductPrivateMemoLog[];
  readonly hasNext: boolean;
  readonly isLoading: boolean;
  readonly isFetchingNextPage: boolean;
  readonly onFetchNext: () => void;
}) {
  const createMutation = useCreatePrivateMemoLogMutation(productId);
  const updateMutation = useUpdatePrivateMemoLogMutation(productId);

  const [showCreate, setShowCreate] = useState(false);
  const [createMemo, setCreateMemo] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editMemo, setEditMemo] = useState("");
  const [editError, setEditError] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!createMemo.trim()) return;
    setCreateError(null);
    try {
      await createMutation.mutateAsync({ memo: createMemo.trim() });
      setCreateMemo("");
      setShowCreate(false);
    } catch (err) {
      setCreateError(getApiErrorMessage(err));
    }
  };

  const handleUpdate = async (logId: string) => {
    if (!editMemo.trim()) return;
    setEditError(null);
    try {
      await updateMutation.mutateAsync({
        privateMemoLogId: logId,
        memo: editMemo.trim(),
      });
      setEditingId(null);
    } catch (err) {
      setEditError(getApiErrorMessage(err));
    }
  };

  const startEdit = (log: ProductPrivateMemoLog) => {
    setEditingId(log.id);
    setEditMemo(log.memo);
    setEditError(null);
  };

  return (
    <div className="rounded-lg border border-[#E5E7EB] bg-white p-4">
      <div className="mb-3 flex items-center gap-1.5">
        <h3 className="flex-1 text-[13px] font-semibold text-[#111827]">
          Memo 기록
        </h3>
        <Lock className="h-3 w-3 text-[#B45309]" />
        <span className="inline-flex h-5 items-center rounded bg-[#FEF3C7] px-1.5 text-[10px] font-medium text-[#B45309]">
          암호화 저장
        </span>
        <button
          className="ml-1 inline-flex h-7 items-center gap-1 rounded-md border border-[#E5E7EB] px-2.5 text-[12px] font-medium text-[#374151] hover:bg-[#F9FAFB]"
          onClick={() => {
            setShowCreate(true);
            setCreateError(null);
          }}
          type="button"
        >
          <Plus className="h-3 w-3" strokeWidth={2.5} />
          추가
        </button>
      </div>

      {/* Inline create form */}
      {showCreate && (
        <div className="mb-3 rounded-lg border border-[#FDE68A] bg-[#FFFBEB] p-3">
          <div className="flex flex-col gap-2">
            <textarea
              className="min-h-[72px] resize-y rounded-md border border-[#E6EAF0] bg-white px-2.5 py-2 text-[12px] outline-none focus:border-[#93C5FD] focus:ring-1 focus:ring-[#93C5FD]"
              placeholder="비밀 메모 내용을 입력하세요"
              value={createMemo}
              onChange={(e) => setCreateMemo(e.target.value)}
            />
            {createError ? (
              <p className="text-[11px] text-[#EF4444]">{createError}</p>
            ) : null}
            <div className="flex justify-end gap-2">
              <button
                className="inline-flex h-7 items-center rounded-md border border-[#E5E7EB] bg-white px-2.5 text-[12px] font-medium text-[#374151] hover:bg-[#F9FAFB]"
                onClick={() => {
                  setShowCreate(false);
                  setCreateMemo("");
                }}
                type="button"
              >
                취소
              </button>
              <button
                className="inline-flex h-7 items-center rounded-md bg-[#1D4ED8] px-2.5 text-[12px] font-medium text-white hover:bg-[#1E40AF] disabled:opacity-60"
                disabled={createMutation.isPending || !createMemo.trim()}
                onClick={() => void handleCreate()}
                type="button"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="py-4 text-center text-[13px] text-[#9CA3AF]">
          불러오는 중...
        </div>
      ) : logs.length === 0 ? (
        <p className="py-2 text-[13px] text-[#9CA3AF]">
          등록된 비밀 메모가 없습니다.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {logs.map((log) =>
            editingId === log.id ? (
              <div
                key={log.id}
                className="rounded-lg border border-[#FDE68A] bg-[#FFFBEB] p-3"
              >
                <div className="flex flex-col gap-2">
                  <textarea
                    className="min-h-[72px] resize-y rounded-md border border-[#E6EAF0] bg-white px-2.5 py-2 text-[12px] outline-none focus:border-[#93C5FD] focus:ring-1 focus:ring-[#93C5FD]"
                    value={editMemo}
                    onChange={(e) => setEditMemo(e.target.value)}
                  />
                  {editError ? (
                    <p className="text-[11px] text-[#EF4444]">{editError}</p>
                  ) : null}
                  <div className="flex justify-end gap-2">
                    <button
                      className="inline-flex h-7 items-center rounded-md border border-[#E5E7EB] bg-white px-2.5 text-[12px] font-medium text-[#374151] hover:bg-[#F9FAFB]"
                      onClick={() => setEditingId(null)}
                      type="button"
                    >
                      취소
                    </button>
                    <button
                      className="inline-flex h-7 items-center rounded-md bg-[#1D4ED8] px-2.5 text-[12px] font-medium text-white hover:bg-[#1E40AF] disabled:opacity-60"
                      disabled={updateMutation.isPending || !editMemo.trim()}
                      onClick={() => void handleUpdate(log.id)}
                      type="button"
                    >
                      저장
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div
                key={log.id}
                className="flex flex-col gap-1 rounded-lg bg-[#FFFBEB] p-3"
              >
                <div className="flex items-center gap-2">
                  <span className="flex-1 text-[11px] text-[#9CA3AF]">
                    {formatDateTime(log.createdAt, { includeYear: true })}
                  </span>
                  <button
                    className="text-[11px] font-medium text-[#6B7280] hover:text-[#374151]"
                    onClick={() => startEdit(log)}
                    type="button"
                  >
                    수정
                  </button>
                </div>
                <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-[#374151]">
                  {log.memo}
                </p>
              </div>
            ),
          )}
        </div>
      )}

      {hasNext && (
        <div className="mt-3 flex justify-center">
          <button
            className="inline-flex h-8 items-center rounded-lg border border-[#E5E7EB] bg-white px-3 text-[12px] font-medium text-[#374151] hover:bg-[#F9FAFB] disabled:opacity-60"
            disabled={isFetchingNextPage}
            onClick={onFetchNext}
            type="button"
          >
            {isFetchingNextPage ? "불러오는 중..." : "더 보기"}
          </button>
        </div>
      )}
    </div>
  );
}

// ── Shared helpers ──────────────────────────────────────────────────────────

function ProductInfoField({
  label,
  value,
}: {
  readonly label: string;
  readonly value: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[11px] font-semibold text-[#6B7280]">{label}</span>
      <span className="text-[13px] text-[#111827]">{value}</span>
    </div>
  );
}

function ProductDetailError({
  error,
  onRetry,
}: {
  readonly error: unknown;
  readonly onRetry: () => void;
}) {
  return (
    <div className="grid place-items-center px-5 py-16 text-center">
      <Package className="h-10 w-10 text-[#D1D5DB]" />
      <p className="mt-4 text-[14px] font-semibold text-[#374151]">
        제품 상세를 불러오지 못했습니다.
      </p>
      <p className="mt-1 text-[13px] text-[#9CA3AF]">
        {getApiErrorMessage(error)}
      </p>
      <button
        className="mt-5 inline-flex h-9 items-center rounded-lg border border-[#E5E7EB] bg-white px-4 text-[13px] font-medium text-[#374151] hover:bg-[#F9FAFB]"
        onClick={onRetry}
        type="button"
      >
        다시 시도
      </button>
    </div>
  );
}

function ProductDetailSkeleton() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 shrink-0 items-center gap-4 border-b border-[#E5E7EB] bg-white px-6">
        <div className="h-5 w-5 animate-pulse rounded bg-[#F3F4F6]" />
        <div className="h-4 w-48 animate-pulse rounded bg-[#F3F4F6]" />
        <div className="ml-auto flex gap-2">
          <div className="h-9 w-16 animate-pulse rounded-lg bg-[#F3F4F6]" />
        </div>
      </div>
      <div className="flex flex-1 gap-4 bg-[#F9FAFB] p-6">
        <div className="flex flex-1 flex-col gap-4">
          <div className="h-44 animate-pulse rounded-lg bg-[#F3F4F6]" />
          <div className="h-64 animate-pulse rounded-lg bg-[#F3F4F6]" />
        </div>
        <div className="flex w-[415px] flex-col gap-4">
          <div className="h-36 animate-pulse rounded-lg bg-[#F3F4F6]" />
        </div>
      </div>
    </div>
  );
}
