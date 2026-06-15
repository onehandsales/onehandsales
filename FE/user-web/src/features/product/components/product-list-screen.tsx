import { Download, Package, Plus, Search } from "lucide-react";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/layout/page-header";
import { Pagination } from "@/components/ui/pagination";
import { Toast } from "@/components/ui/toast";
import { ProductCreateDialog } from "@/features/product/components/product-create-dialog";
import { exportProductsXlsx } from "@/features/product/api/product-api";
import {
  useProductCategories,
  useProductStatuses,
} from "@/features/product/hooks/use-product-detail";
import { useProductList } from "@/features/product/hooks/use-product-list";
import type { Product, ProductSort } from "@/features/product/types/product";
import { getApiErrorMessage } from "@/lib/api-client";
import { cn } from "@/utils/cn";

type ProductListScreenProps = {
  readonly initialCreateOpen?: boolean;
  readonly onCreateDialogClose?: () => void;
};

export function ProductListScreen({
  initialCreateOpen = false,
  onCreateDialogClose,
}: ProductListScreenProps) {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sort, setSort] = useState<ProductSort>("createdAtDesc");
  const [page, setPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const categoriesQuery = useProductCategories();
  const statusesQuery = useProductStatuses();

  const listParams = useMemo(
    () => ({
      page,
      productName: search || undefined,
      productCategoryId: categoryFilter || undefined,
      productStatusId: statusFilter || undefined,
      sort,
    }),
    [categoryFilter, page, search, sort, statusFilter]
  );

  const productsQuery = useProductList(listParams);
  const products = productsQuery.data?.items ?? [];
  const totalCount = productsQuery.data?.totalCount ?? 0;
  const hasFilters =
    search.length > 0 ||
    categoryFilter.length > 0 ||
    statusFilter.length > 0 ||
    sort !== "createdAtDesc";

  useEffect(() => {
    if (initialCreateOpen) {
      setIsCreateOpen(true);
    }
  }, [initialCreateOpen]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const onSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSearch(searchText.trim());
    setPage(1);
  };

  const onExport = async () => {
    setIsExporting(true);
    try {
      const { blob, fileName } = await exportProductsXlsx({
        productName: search || undefined,
        productCategoryId: categoryFilter || undefined,
        productStatusId: statusFilter || undefined,
        sort,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName ?? "products.xlsx";
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <section className="flex min-h-full flex-col bg-[#FAFAF8]">
      <PageHeader
        breadcrumbs={[{ label: "제품", icon: Package }]}
        actions={[
          {
            icon: Plus,
            tooltip: "제품 추가",
            onClick: () => void navigate("/products/new"),
            variant: "primary",
          },
          {
            icon: Download,
            tooltip: "파일로 내보내기",
            onClick: () => void onExport(),
            disabled: isExporting,
          },
        ]}
      />

      {/* 검색 + 필터 툴바 */}
      <div className="flex h-10 shrink-0 items-center gap-2 px-5">
        <form className="flex h-7 items-center gap-1.5 rounded-md border border-[#E2E5EC] bg-[#FAFAF8] px-2.5 transition focus-within:border-[#93C5FD] focus-within:bg-white" onSubmit={onSearchSubmit}>
          <Search className="h-3 w-3 shrink-0 text-[#9CA3AF]" />
          <input
            className="w-[150px] bg-transparent text-[12px] text-[#111827] outline-none placeholder:text-[#9CA3AF]"
            onChange={(event) => setSearchText(event.target.value)}
            placeholder="제품 검색"
            value={searchText}
          />
        </form>
        <FilterChip
          active={!hasFilters}
          label="전체"
          onClick={() => {
            setSearch("");
            setSearchText("");
            setCategoryFilter("");
            setStatusFilter("");
            setSort("createdAtDesc");
            setPage(1);
          }}
        />
        <select
          className={cn(
            "h-7 appearance-none rounded-md border px-2.5 text-[12px] outline-none transition",
            categoryFilter
              ? "border-[#BFDBFE] bg-[#EFF6FF] text-[#1D4ED8]"
              : "border-[#E2E5EC] bg-transparent text-[#6B7280] hover:bg-[#FAFAF8]"
          )}
          onChange={(event) => { setCategoryFilter(event.target.value); setPage(1); }}
          value={categoryFilter}
        >
          <option value="">카테고리</option>
          {categoriesQuery.data?.items.map((category) => (
            <option key={category.id} value={category.id}>{category.categoryName}</option>
          ))}
        </select>
        <select
          className={cn(
            "h-7 appearance-none rounded-md border px-2.5 text-[12px] outline-none transition",
            statusFilter
              ? "border-[#BFDBFE] bg-[#EFF6FF] text-[#1D4ED8]"
              : "border-[#E2E5EC] bg-transparent text-[#6B7280] hover:bg-[#FAFAF8]"
          )}
          onChange={(event) => { setStatusFilter(event.target.value); setPage(1); }}
          value={statusFilter}
        >
          <option value="">판매 상태</option>
          {statusesQuery.data?.items.map((status) => (
            <option key={status.id} value={status.id}>{status.statusName}</option>
          ))}
        </select>
        <select
          className={cn(
            "h-7 appearance-none rounded-md border px-2.5 text-[12px] outline-none transition",
            sort !== "createdAtDesc"
              ? "border-[#BFDBFE] bg-[#EFF6FF] text-[#1D4ED8]"
              : "border-[#E2E5EC] bg-transparent text-[#6B7280] hover:bg-[#FAFAF8]"
          )}
          onChange={(event) => { setSort(event.target.value as ProductSort); setPage(1); }}
          value={sort}
        >
          <option value="createdAtDesc">최신순</option>
          <option value="dealCountDesc">딜 많은순</option>
        </select>
        <div className="flex-1" />
        <span className="text-[12px] text-[#9CA3AF]">
          {isExporting ? "내보내는 중..." : `${totalCount}개`}
        </span>
      </div>

      <div className="px-5 py-3">
        {notice ? (
          <Toast message={notice} onClose={() => setNotice(null)} variant="success" />
        ) : null}

        {productsQuery.isError ? (
          <p className="rounded-md border border-destructive/30 bg-red-50 px-3 py-2 text-sm text-destructive">
            {getApiErrorMessage(productsQuery.error)}
          </p>
        ) : null}

        <div className="flex w-full flex-col overflow-hidden rounded-lg border border-[#E2E5EC] bg-white shadow-sm">
          <div className="flex h-11 shrink-0 items-center border-b border-[#E6EAF0] bg-[#FAFBFC] px-6">
            <ProductTableHeaderCell width={280}>제품명</ProductTableHeaderCell>
            <ProductTableHeaderCell width={150}>카테고리</ProductTableHeaderCell>
            <ProductTableHeaderCell width={80}>연결</ProductTableHeaderCell>
            <ProductTableHeaderCell width={100}>상태</ProductTableHeaderCell>
            <div className="min-w-0 flex-1" />
            <ProductTableHeaderCell width={86}>등록일</ProductTableHeaderCell>
          </div>

          {productsQuery.isLoading ? (
            <ProductListSkeleton />
          ) : products.length === 0 ? (
            <ProductEmptyState
              hasSearch={search.length > 0 || categoryFilter.length > 0 || statusFilter.length > 0}
              onCreate={() => setIsCreateOpen(true)}
            />
          ) : (
            <div className="overflow-hidden">
              {products.map((product) => (
                <ProductRow key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>

      {productsQuery.data ? (
        <Pagination
          className="py-3"
          onPageChange={setPage}
          page={productsQuery.data.page}
          totalPages={productsQuery.data.totalPages}
        />
      ) : null}

      <ProductCreateDialog
        onCreated={() => {
          setNotice("제품이 추가되었습니다.");
          void productsQuery.refetch();
        }}
        onOpenChange={(open) => {
          setIsCreateOpen(open);
          if (!open) {
            onCreateDialogClose?.();
          }
        }}
        open={isCreateOpen}
      />
    </section>
  );
}

function ProductRow({ product }: { readonly product: Product }) {
  return (
    <Link
      className="flex h-[62px] items-center border-b border-[#E8EDF3] px-6 hover:bg-[#F9FAFB] last:border-b-0"
      to={`/products/${product.id}`}
    >
      <div className="w-[280px] shrink-0 min-w-0">
        <span className="block truncate text-[13px] font-semibold text-[#111827]">
          {product.productName}
        </span>
      </div>
      <div className="w-[150px] min-w-0 shrink-0">
        <Badge tone={badgeToneFromCategory(product.productCategory.categoryName)}>
          {product.productCategory.categoryName}
        </Badge>
      </div>
      <div className="w-[80px] shrink-0">
        <Badge tone="blue">{`${product.dealCount.toLocaleString("ko-KR")}건`}</Badge>
      </div>
      <div className="w-[100px] min-w-0 shrink-0">
        <Badge tone={statusToneFromName(product.productStatus.statusName)}>
          {product.productStatus.statusName}
        </Badge>
      </div>
      <div className="min-w-0 flex-1" />
      <div className="w-[86px] shrink-0">
        <span className="text-[12px] text-[#374151]">{formatCompactDate(product.createdAt)}</span>
      </div>
    </Link>
  );
}

function ProductTableHeaderCell({
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
      className={cn("shrink-0 text-[12px] font-semibold text-[#64748B]", flex && "min-w-0 flex-1")}
      style={width ? { width } : undefined}
    >
      {children}
    </div>
  );
}

function Badge({
  children,
  tone,
}: {
  readonly children: string;
  readonly tone: "blue" | "green" | "amber" | "slate";
}) {
  const styles: Record<typeof tone, string> = {
    blue: "bg-[#DBEAFE] text-[#2568D8]",
    green: "bg-[#CCFBF1] text-[#15803D]",
    amber: "bg-[#FEF3C7] text-[#B45309]",
    slate: "bg-[#E2E8F0] text-[#475569]",
  };

  return (
    <span
      className={cn(
        "inline-flex h-[22px] max-w-full min-w-0 items-center overflow-hidden rounded-full px-2.5 text-[11px] font-semibold",
        styles[tone]
      )}
      title={children}
    >
      <span className="min-w-0 truncate whitespace-nowrap">{children}</span>
    </span>
  );
}

function FilterChip({
  active,
  label,
  onClick,
}: {
  readonly active: boolean;
  readonly label: string;
  readonly onClick: () => void;
}) {
  return (
    <button
      className={cn(
        "inline-flex h-[30px] items-center rounded-[6px] px-3 text-[12px] transition",
        active
          ? "border border-[#C7D7FE] bg-[#EAF2FF] font-bold text-[#1D4ED8]"
          : "border border-[#E6EAF0] bg-white font-medium text-[#475569] hover:bg-[#F9FAFB]"
      )}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
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
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#EFF6FF] text-[#2563EB]">
        <Package className="h-10 w-10" />
      </div>
      <div className="mt-4">
        <p className="text-[18px] font-bold text-[#111827]">
          {hasSearch ? "조건에 맞는 제품이 없습니다." : "등록된 제품이 없어요"}
        </p>
        <p className="mt-1 text-[13px] text-[#9CA3AF]">
          새 제품을 등록하면 목록에서 바로 확인할 수 있습니다
        </p>
      </div>
      <button
        className="mt-5 inline-flex h-11 items-center gap-1.5 rounded-[10px] bg-[#2563EB] px-5 text-[14px] font-semibold text-white transition hover:bg-[#1D4ED8]"
        onClick={onCreate}
        type="button"
      >
        <Plus className="h-4 w-4" />
        제품 추가
      </button>
    </div>
  );
}

function ProductListSkeleton() {
  return (
    <div className="overflow-hidden">
      {Array.from({ length: 6 }, (_, index) => (
        <div
          className="h-[62px] animate-pulse border-b border-[#E8EDF3] bg-[#FAFBFC]"
          key={index}
        />
      ))}
    </div>
  );
}

function badgeToneFromCategory(categoryName: string) {
  if (categoryName.includes("하드") || categoryName.includes("장비")) {
    return "amber";
  }
  if (categoryName.includes("서비스") || categoryName.includes("컨설")) {
    return "green";
  }
  return "blue";
}

function statusToneFromName(statusName: string) {
  if (statusName.includes("중단") || statusName.includes("보류")) {
    return "slate";
  }
  if (statusName.includes("판매") || statusName.includes("활성")) {
    return "green";
  }
  return "blue";
}

function formatCompactDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  })
    .format(new Date(value))
    .replace(/\s+/g, "")
    .replace(/\.$/, "");
}
