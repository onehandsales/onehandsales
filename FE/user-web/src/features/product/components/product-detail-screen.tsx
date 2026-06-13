import {
  ArchiveRestore,
  ChevronLeft,
  Lock,
  Package,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { ProductConnectionSection } from "@/features/product/components/product-connection-section";
import { ProductEditForm } from "@/features/product/components/product-edit-form";
import { ProductLogSection } from "@/features/product/components/product-log-section";
import {
  useProductDetail,
  useProductLogs,
} from "@/features/product/hooks/use-product-detail";
import {
  useDeleteProductMutation,
  useRestoreProductMutation,
} from "@/features/product/hooks/use-product-mutations";
import type { Product, ProductConnection, ProductLog, ProductMemo } from "@/features/product/types/product";
import { getApiErrorMessage } from "@/lib/api-client";
import { isDeletedResourceReadError } from "@/utils/api-error";
import { formatDate, formatDateTime, formatMoney } from "@/utils/format";

type ProductDetailScreenProps = {
  readonly productId: string;
};

export function ProductDetailScreen({ productId }: ProductDetailScreenProps) {
  const [notice, setNotice] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const productQuery = useProductDetail(productId);
  const logsQuery = useProductLogs(productId, { page: 1, pageSize: 20 });
  const deleteProductMutation = useDeleteProductMutation();
  const restoreProductMutation = useRestoreProductMutation();

  const onDelete = async (product: Product) => {
    if (!window.confirm(`${product.name} 제품을 휴지통으로 이동할까요?`)) {
      return;
    }
    await deleteProductMutation.mutateAsync(product.id);
    setNotice("제품이 휴지통으로 이동되었습니다.");
  };

  const onRestore = async () => {
    const product = await restoreProductMutation.mutateAsync(productId);
    setNotice(`${product.name} 제품이 복구되었습니다.`);
  };

  if (productQuery.isLoading) {
    return <ProductDetailSkeleton />;
  }

  if (productQuery.isError) {
    if (isDeletedResourceReadError(productQuery.error)) {
      return (
        <DeletedProductState
          error={productQuery.error}
          isRestoring={restoreProductMutation.isPending}
          onRestore={onRestore}
        />
      );
    }
    return (
      <ProductDetailError
        error={productQuery.error}
        onRetry={() => void productQuery.refetch()}
      />
    );
  }

  const productDetail = productQuery.data;
  if (!productDetail) {
    return <ProductDetailSkeleton />;
  }

  const { product, connections, memos } = productDetail;
  const logs = logsQuery.data?.items ?? [];

  return (
    <div className="flex h-full flex-col">
      {/* TopBar */}
      <header className="flex h-16 shrink-0 items-center gap-3 border-b border-[#E5E7EB] bg-white px-6">
        <Link className="text-[#9CA3AF] hover:text-[#374151]" to="/products">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <nav className="flex min-w-0 flex-1 items-center gap-1.5">
          <Link
            className="shrink-0 text-[13px] text-[#6B7280] hover:text-[#374151]"
            to="/products"
          >
            제품
          </Link>
          <span className="text-[13px] text-[#D1D5DB]">/</span>
          <span className="truncate text-[13px] font-semibold text-[#111827]">
            {product.name}
          </span>
        </nav>
        <div className="flex shrink-0 items-center gap-2">
          <button
            className="inline-flex h-9 items-center rounded-lg border border-[#E5E7EB] bg-white px-3.5 text-[13px] font-medium text-[#374151] transition hover:bg-[#F9FAFB]"
            onClick={() => setIsEditing((prev) => !prev)}
            type="button"
          >
            {isEditing ? "취소" : "수정"}
          </button>
          <button
            className="inline-flex h-9 items-center rounded-lg border border-[#FEE2E2] bg-white px-3.5 text-[13px] font-medium text-[#B91C1C] transition hover:bg-[#FEF2F2] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={deleteProductMutation.isPending}
            onClick={() => void onDelete(product)}
            type="button"
          >
            삭제
          </button>
        </div>
      </header>

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
            <h2 className="mb-4 text-[14px] font-semibold text-[#111827]">기본 정보</h2>
            {isEditing ? (
              <ProductEditForm
                onSaved={(updatedProduct) => {
                  setNotice(`${updatedProduct.name} 제품이 저장되었습니다.`);
                  setIsEditing(false);
                }}
                product={product}
              />
            ) : (
              <div className="flex gap-3">
                <div className="flex flex-1 flex-col gap-3.5">
                  <ProductInfoField label="제품명" value={product.name} />
                  <ProductInfoField
                    label="등록일"
                    value={formatDate(product.createdAt, { year: "numeric" })}
                  />
                </div>
                <div className="flex flex-1 flex-col gap-3.5">
                  <ProductInfoField label="분류" value={product.category ?? "-"} />
                  <ProductInfoField
                    label="단가"
                    value={formatProductMoney(product)}
                  />
                </div>
                {product.description ? (
                  <div className="flex-1">
                    <ProductInfoField label="설명" value={product.description} />
                  </div>
                ) : null}
              </div>
            )}
          </div>

          {/* 제품 로그 카드 */}
          <div className="rounded-lg border border-[#E5E7EB] bg-white p-4">
            <PdLogCard
              error={logsQuery.error}
              isLoading={logsQuery.isLoading}
              logs={logs}
              onChanged={setNotice}
              onRetry={() => void logsQuery.refetch()}
              productId={product.id}
            />
          </div>
        </div>

        {/* Right */}
        <div className="flex w-[415px] shrink-0 flex-col gap-4 overflow-y-auto bg-[#F9FAFB] p-6">
          {/* 판매 현황 */}
          <div className="rounded-lg border border-[#E5E7EB] bg-white p-4">
            <h3 className="mb-3 text-[13px] font-semibold text-[#111827]">판매 현황</h3>
            <div className="flex gap-2">
              <div className="flex flex-1 flex-col gap-1 rounded-lg bg-[#EFF6FF] px-3 py-2.5">
                <span className="text-[11px] text-[#6B7280]">연결 딜</span>
                <span className="text-[14px] font-bold text-[#2563EB]">
                  {product.connectionCount}건
                </span>
              </div>
              <div className="flex flex-1 flex-col gap-1 rounded-lg bg-[#F3F4F6] px-3 py-2.5">
                <span className="text-[11px] text-[#6B7280]">메모</span>
                <span className="text-[14px] font-bold text-[#374151]">
                  {product.memoCount}건
                </span>
              </div>
            </div>
          </div>

          {/* 연결된 딜 */}
          <PdConnectionCard
            connections={connections}
            onChanged={setNotice}
            productId={product.id}
          />

          {/* Memo 기록 */}
          <PdMemoCard memos={memos} />
        </div>
      </div>
    </div>
  );
}

function ProductInfoField({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[11px] font-semibold text-[#6B7280]">{label}</span>
      <span className="text-[13px] text-[#111827]">{value}</span>
    </div>
  );
}

function PdLogCard({
  productId,
  logs,
  isLoading,
  error,
  onRetry,
  onChanged,
}: {
  readonly productId: string;
  readonly logs: ProductLog[];
  readonly isLoading: boolean;
  readonly error: unknown;
  readonly onRetry: () => void;
  readonly onChanged: (msg: string) => void;
}) {
  return (
    <ProductLogSection
      error={error}
      isLoading={isLoading}
      logs={logs}
      onChanged={onChanged}
      onRetry={onRetry}
      productId={productId}
    />
  );
}

function PdConnectionCard({
  productId,
  connections,
  onChanged,
}: {
  readonly productId: string;
  readonly connections: ProductConnection[];
  readonly onChanged: (msg: string) => void;
}) {
  return (
    <div className="rounded-lg border border-[#E5E7EB] bg-white">
      <div className="flex items-center border-b border-[#F3F4F6] px-4 py-3">
        <span className="flex-1 text-[13px] font-semibold text-[#111827]">연결 대상</span>
        <span className="text-[12px] text-[#2563EB]">
          {connections.length > 0 ? `${connections.length}건` : ""}
        </span>
      </div>
      <div className="p-4">
        <ProductConnectionSection
          connections={connections}
          onChanged={onChanged}
          productId={productId}
        />
      </div>
    </div>
  );
}

function PdMemoCard({ memos }: { readonly memos: ProductMemo[] }) {
  return (
    <div className="rounded-lg border border-[#E5E7EB] bg-white p-4">
      <div className="mb-2 flex items-center">
        <span className="flex-1 text-[13px] font-semibold text-[#111827]">Memo 기록</span>
        <button className="text-[12px] font-medium text-[#2563EB]" type="button">
          + 추가
        </button>
      </div>
      <div className="mb-3 flex items-center gap-1.5">
        <Lock className="h-3 w-3 text-[#B45309]" />
        <span className="text-[11px] text-[#B45309]">메모는 암호화 저장됩니다</span>
      </div>
      {memos.length === 0 ? (
        <p className="py-2 text-[13px] text-[#9CA3AF]">등록된 메모가 없습니다.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {memos.map((memo) => (
            <div
              className="flex flex-col gap-1 rounded-lg bg-[#F9FAFB] p-3"
              key={memo.id}
            >
              <span className="text-[11px] text-[#9CA3AF]">
                {formatDateTime(memo.memoDate, { includeYear: true })}
              </span>
              {memo.title ? (
                <p className="text-[13px] font-semibold text-[#111827]">{memo.title}</p>
              ) : null}
              <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-[#374151]">
                {memo.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function DeletedProductState({
  error,
  isRestoring,
  onRestore,
}: {
  readonly error: unknown;
  readonly isRestoring: boolean;
  readonly onRestore: () => Promise<void>;
}) {
  return (
    <div className="grid place-items-center px-5 py-16 text-center">
      <Package className="h-10 w-10 text-[#D1D5DB]" />
      <p className="mt-4 text-[14px] font-semibold text-[#374151]">삭제된 제품입니다.</p>
      <p className="mt-1 text-[13px] text-[#9CA3AF]">{getApiErrorMessage(error)}</p>
      <div className="mt-5 flex gap-2">
        <Link
          className="inline-flex h-9 items-center rounded-lg border border-[#E5E7EB] bg-white px-4 text-[13px] font-medium text-[#374151] hover:bg-[#F9FAFB]"
          to="/products"
        >
          제품 목록
        </Link>
        <button
          className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#1D4ED8] px-4 text-[13px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isRestoring}
          onClick={() => void onRestore()}
          type="button"
        >
          <ArchiveRestore className="h-3.5 w-3.5" />
          복구
        </button>
      </div>
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
      <p className="mt-1 text-[13px] text-[#9CA3AF]">{getApiErrorMessage(error)}</p>
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
          <div className="h-9 w-16 animate-pulse rounded-lg bg-[#F3F4F6]" />
        </div>
      </div>
      <div className="flex flex-1 gap-4 bg-[#F9FAFB] p-6">
        <div className="flex flex-1 flex-col gap-4">
          <div className="h-44 animate-pulse rounded-lg bg-[#F3F4F6]" />
          <div className="h-64 animate-pulse rounded-lg bg-[#F3F4F6]" />
        </div>
        <div className="flex w-[415px] flex-col gap-4">
          <div className="h-24 animate-pulse rounded-lg bg-[#F3F4F6]" />
          <div className="h-48 animate-pulse rounded-lg bg-[#F3F4F6]" />
          <div className="h-36 animate-pulse rounded-lg bg-[#F3F4F6]" />
        </div>
      </div>
    </div>
  );
}

function formatProductMoney(product: Product) {
  if (product.unitPrice === null) {
    return "-";
  }
  return formatMoney(product.unitPrice, product.currency || "KRW");
}
