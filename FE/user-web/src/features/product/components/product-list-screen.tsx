import { Package, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { ProductCreateDialog } from "@/features/product/components/product-create-dialog";
import { exportProductsXlsx } from "@/features/product/api/product-api";
import { useProductCategories, useProductStatuses } from "@/features/product/hooks/use-product-detail";
import { useProductList } from "@/features/product/hooks/use-product-list";
import type { Product } from "@/features/product/types/product";
import { Pagination } from "@/components/ui/pagination";
import { getApiErrorMessage } from "@/lib/api-client";
import { cn } from "@/utils/cn";
import { formatDate } from "@/utils/format";

export function ProductListScreen() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // TopBar SearchBar에서 넘어온 검색어
  const search = searchParams.get("q") ?? "";

  // 검색어 변경 시 page 리셋
  useEffect(() => {
    setPage(1);
  }, [search]);

  // TopBar 버튼 액션 처리 → ?action=create | ?action=export
  useEffect(() => {
    const action = searchParams.get("action");
    if (action === "create") {
      setIsCreateOpen(true);
      void navigate("/products", { replace: true });
    } else if (action === "export") {
      void navigate("/products", { replace: true });
      setIsExporting(true);
      void exportProductsXlsx({
        productName: search || undefined,
        productCategoryId: categoryFilter || undefined,
        productStatusId: statusFilter || undefined,
      }).then(({ blob, fileName }) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName ?? "products.xlsx";
        a.click();
        URL.revokeObjectURL(url);
      }).finally(() => {
        setIsExporting(false);
      });
    }
  }, [navigate, searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  const categoriesQuery = useProductCategories();
  const statusesQuery = useProductStatuses();

  const productsQuery = useProductList({
    page,
    productName: search || undefined,
    productCategoryId: categoryFilter || undefined,
    productStatusId: statusFilter || undefined,
  });

  const products = productsQuery.data?.items ?? [];
  const totalCount = productsQuery.data?.totalCount ?? 0;

  return (
    <section className="flex flex-col gap-0 px-6 py-5">
      {/* Controls Bar */}
      <div className="mb-3 flex h-10 shrink-0 items-center gap-2">
        {/* 전체 */}
        <button
          className={cn(
            "inline-flex h-[30px] items-center rounded-[7px] px-3 text-[12px] font-bold transition-colors",
            !categoryFilter && !statusFilter
              ? "border border-[#C7D7FE] bg-[#EAF2FF] text-[#1D4ED8]"
              : "border border-[#E6EAF0] bg-white text-[#475569] hover:bg-gray-50"
          )}
          onClick={() => {
            setCategoryFilter("");
            setStatusFilter("");
            setPage(1);
          }}
          type="button"
        >
          전체
        </button>

        {/* 카테고리 ▾ */}
        <div className="relative">
          <select
            className={cn(
              "inline-flex h-[30px] cursor-pointer appearance-none items-center rounded-[7px] border border-[#E6EAF0] bg-white pl-3 pr-7 text-[12px] font-medium text-[#475569] outline-none transition-colors hover:bg-gray-50",
              categoryFilter && "border-[#C7D7FE] bg-[#EAF2FF] text-[#1D4ED8]"
            )}
            onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
            value={categoryFilter}
          >
            <option value="">카테고리 ▾</option>
            {categoriesQuery.data?.items.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.categoryName}
              </option>
            ))}
          </select>
        </div>

        {/* 상태 ▾ */}
        <div className="relative">
          <select
            className={cn(
              "inline-flex h-[30px] cursor-pointer appearance-none items-center rounded-[7px] border border-[#E6EAF0] bg-white pl-3 pr-7 text-[12px] font-medium text-[#475569] outline-none transition-colors hover:bg-gray-50",
              statusFilter && "border-[#C7D7FE] bg-[#EAF2FF] text-[#1D4ED8]"
            )}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            value={statusFilter}
          >
            <option value="">판매 상태 ▾</option>
            {statusesQuery.data?.items.map((st) => (
              <option key={st.id} value={st.id}>
                {st.statusName}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1" />
        <span className="text-[12px] font-semibold text-[#64748B]">
          {isExporting ? "내보내는 중..." : `${totalCount}개`}
        </span>
      </div>

      {/* Table Card */}
      <div className="flex flex-col overflow-hidden rounded-lg border border-[#E5EAF0] bg-white">
        {/* Notice */}
        {notice ? (
          <div className="mx-6 mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-800">
            {notice}
          </div>
        ) : null}

        {/* Table Header */}
        <div className="flex shrink-0 items-center border-b border-[#E6EAF0] bg-[#FAFBFC] px-6" style={{ height: 44 }}>
          <ProductHeaderCell width={280}>제품명</ProductHeaderCell>
          <ProductHeaderCell width={150}>카테고리</ProductHeaderCell>
          <ProductHeaderCell width={100}>상태</ProductHeaderCell>
          <ProductHeaderCell flex>등록일</ProductHeaderCell>
        </div>

        {/* Table Body */}
        {productsQuery.isLoading ? (
          <ProductListSkeleton />
        ) : productsQuery.isError ? (
          <ProductListError
            error={productsQuery.error}
            onRetry={() => void productsQuery.refetch()}
          />
        ) : products.length === 0 ? (
          <ProductEmptyState
            hasSearch={search.length > 0}
            onCreate={() => setIsCreateOpen(true)}
          />
        ) : (
          <div className="flex-1 overflow-y-auto">
            {products.map((product) => (
              <ProductRow key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>

      {productsQuery.data && (productsQuery.data.totalPages > 1 || page > 1) ? (
        <Pagination
          page={productsQuery.data.page}
          totalPages={productsQuery.data.totalPages}
          totalCount={productsQuery.data.totalCount}
          onPageChange={setPage}
        />
      ) : null}

      <ProductCreateDialog
        onCreated={() => {
          setNotice("제품이 추가되었습니다.");
          void productsQuery.refetch();
        }}
        onOpenChange={setIsCreateOpen}
        open={isCreateOpen}
      />
    </section>
  );
}

function ProductRow({ product }: { readonly product: Product }) {
  return (
    <Link
      className="flex items-center border-b border-[#E8EDF3] px-6 hover:bg-[#F9FAFB] last:border-b-0"
      style={{ height: 62 }}
      to={`/products/${product.id}`}
    >
      <div style={{ width: 280 }} className="min-w-0 shrink-0">
        <span className="block truncate text-[13px] font-semibold text-[#111827]">
          {product.productName}
        </span>
      </div>
      <div style={{ width: 150 }} className="shrink-0">
        <span className="inline-flex h-6 items-center rounded-full bg-[#DBEAFE] px-2.5 text-[11px] font-medium text-[#2568D8]">
          {product.productCategory.categoryName}
        </span>
      </div>
      <div style={{ width: 100 }} className="shrink-0">
        <span className="inline-flex h-6 items-center rounded-md bg-[#D1FAE5] px-2.5 text-[11px] font-medium text-[#065F46]">
          {product.productStatus.statusName}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <span className="text-[12px] text-[#374151]">
          {formatDate(product.createdAt, { year: "numeric" })}
        </span>
      </div>
    </Link>
  );
}

function ProductHeaderCell({
  children,
  width,
  flex = false,
}: {
  readonly children: string;
  readonly width?: number;
  readonly flex?: boolean;
}) {
  return (
    <div
      className={cn("shrink-0 text-[12px] font-bold text-[#334155]", flex && "min-w-0 flex-1")}
      style={width ? { width } : undefined}
    >
      {children}
    </div>
  );
}

function ProductEmptyState({
  hasSearch,
  onCreate,
}: {
  readonly hasSearch: boolean;
  readonly onCreate: () => void;
}) {
  return (
    <div className="grid place-items-center px-5 py-16 text-center">
      <Package className="h-10 w-10 text-[#D1D5DB]" />
      <p className="mt-4 text-[14px] font-semibold text-[#374151]">
        {hasSearch ? "조건에 맞는 제품이 없습니다." : "등록된 제품이 없습니다."}
      </p>
      <p className="mt-1 text-[13px] text-[#9CA3AF]">
        새 제품을 등록하면 목록에서 바로 확인할 수 있습니다.
      </p>
      <button
        className="mt-5 inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#1D4ED8] px-4 text-[13px] font-semibold text-white hover:bg-[#1E40AF]"
        onClick={onCreate}
        type="button"
      >
        <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
        제품 추가
      </button>
    </div>
  );
}

function ProductListError({
  error,
  onRetry,
}: {
  readonly error: unknown;
  readonly onRetry: () => void;
}) {
  return (
    <div className="px-6 py-10 text-center">
      <p className="text-[13px] font-medium text-[#EF4444]">{getApiErrorMessage(error)}</p>
      <button
        className="mt-3 inline-flex h-8 items-center rounded-lg border border-[#E5E7EB] px-3 text-[13px] text-[#374151] hover:bg-[#F9FAFB]"
        onClick={onRetry}
        type="button"
      >
        다시 시도
      </button>
    </div>
  );
}

function ProductListSkeleton() {
  return (
    <div>
      {Array.from({ length: 6 }, (_, i) => (
        <div
          className="animate-pulse border-b border-[#E8EDF3] bg-[#FAFBFC]"
          key={i}
          style={{ height: 62 }}
        />
      ))}
    </div>
  );
}
