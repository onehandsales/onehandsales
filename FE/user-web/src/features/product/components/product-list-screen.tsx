import { Download, Package, Plus, Search } from "lucide-react";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/layout/page-header";
import { Pagination } from "@/components/ui/pagination";
import { Toast } from "@/components/ui/toast";
import { useAuthSession } from "@/features/auth";
import { ProductCreateDialog } from "@/features/product/components/product-create-dialog";
import { ProductTaxonomyManageDialog } from "@/features/product/components/product-taxonomy-manage-dialog";
import { exportProductsXlsx } from "@/features/product/api/product-api";
import {
  useProductCategories,
  useProductStatuses,
} from "@/features/product/hooks/use-product-detail";
import { useProductList } from "@/features/product/hooks/use-product-list";
import type { Product, ProductSort } from "@/features/product/types/product";
import { getApiErrorMessage } from "@/lib/api-client";
import { cn } from "@/utils/cn";
import { formatDateWithOptions } from "@/utils/format";

type ProductListScreenProps = {
  readonly initialCreateOpen?: boolean;
  readonly onCreateDialogClose?: () => void;
};

export function ProductListScreen({
  initialCreateOpen = false,
  onCreateDialogClose,
}: ProductListScreenProps) {
  const navigate = useNavigate();
  const { user } = useAuthSession();
  const [searchText, setSearchText] = useState("");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sort, setSort] = useState<ProductSort>("createdAtDesc");
  const [page, setPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [taxonomyDialog, setTaxonomyDialog] = useState<
    { readonly kind: "category" | "status" } | null
  >(null);
  const [pendingCategoryName, setPendingCategoryName] = useState("");
  const [pendingStatusName, setPendingStatusName] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const categoriesQuery = useProductCategories();
  const statusesQuery = useProductStatuses();
  const categories = useMemo(
    () => categoriesQuery.data?.items ?? [],
    [categoriesQuery.data]
  );
  const statuses = useMemo(
    () => statusesQuery.data?.items ?? [],
    [statusesQuery.data]
  );

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
  const displayTimeZone = user?.timeZone ?? getBrowserTimeZoneFallback();
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

  useEffect(() => {
    if (!pendingCategoryName) return;
    const matched = categories.find(
      (category) => category.categoryName === pendingCategoryName
    );
    if (matched) {
      setCategoryFilter(matched.id);
      setPage(1);
      setPendingCategoryName("");
    }
  }, [categories, pendingCategoryName]);

  useEffect(() => {
    if (!pendingStatusName) return;
    const matched = statuses.find(
      (status) => status.statusName === pendingStatusName
    );
    if (matched) {
      setStatusFilter(matched.id);
      setPage(1);
      setPendingStatusName("");
    }
  }, [statuses, pendingStatusName]);

  useEffect(() => {
    if (
      categoryFilter &&
      !categories.some((category) => category.id === categoryFilter)
    ) {
      setCategoryFilter("");
      setPage(1);
    }
  }, [categoryFilter, categories]);

  useEffect(() => {
    if (
      statusFilter &&
      !statuses.some((status) => status.id === statusFilter)
    ) {
      setStatusFilter("");
      setPage(1);
    }
  }, [statusFilter, statuses]);

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
    <section className="flex flex-1 flex-col overflow-hidden bg-[#FAFAF8]">
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
        <form className="flex h-8 items-center gap-1.5 rounded-md border border-[#E2E5EC] bg-[#FAFAF8] px-3 transition focus-within:border-[#93C5FD] focus-within:bg-white" onSubmit={onSearchSubmit}>
          <Search className="h-3 w-3 shrink-0 text-[#9CA3AF]" />
          <input
            className="w-[220px] bg-transparent text-[13px] text-[#111827] outline-none placeholder:text-[#9CA3AF]"
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
            "h-8 min-w-[132px] appearance-none rounded-md border px-3 text-[13px] outline-none transition",
            categoryFilter
              ? "border-[#BFDBFE] bg-[#EFF6FF] text-[#1D4ED8]"
              : "border-[#E2E5EC] bg-transparent text-[#6B7280] hover:bg-[#FAFAF8]"
          )}
          disabled={categoriesQuery.isLoading}
          onChange={(event) => {
            const value = event.target.value;
            if (value === ADD_TAXONOMY_VALUE) {
              setTaxonomyDialog({ kind: "category" });
              return;
            }
            setCategoryFilter(value);
            setPage(1);
          }}
          value={categoryFilter}
        >
          <option value="">카테고리</option>
          <option value={ADD_TAXONOMY_VALUE}>+ 추가</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>{category.categoryName}</option>
          ))}
        </select>
        <select
          className={cn(
            "h-8 min-w-[132px] appearance-none rounded-md border px-3 text-[13px] outline-none transition",
            statusFilter
              ? "border-[#BFDBFE] bg-[#EFF6FF] text-[#1D4ED8]"
              : "border-[#E2E5EC] bg-transparent text-[#6B7280] hover:bg-[#FAFAF8]"
          )}
          disabled={statusesQuery.isLoading}
          onChange={(event) => {
            const value = event.target.value;
            if (value === ADD_TAXONOMY_VALUE) {
              setTaxonomyDialog({ kind: "status" });
              return;
            }
            setStatusFilter(value);
            setPage(1);
          }}
          value={statusFilter}
        >
          <option value="">판매 상태</option>
          <option value={ADD_TAXONOMY_VALUE}>+ 추가</option>
          {statuses.map((status) => (
            <option key={status.id} value={status.id}>{status.statusName}</option>
          ))}
        </select>
        <select
          className={cn(
            "h-8 min-w-[118px] appearance-none rounded-md border px-3 text-[13px] outline-none transition",
            sort !== "createdAtDesc"
              ? "border-[#BFDBFE] bg-[#EFF6FF] text-[#1D4ED8]"
              : "border-[#E2E5EC] bg-transparent text-[#6B7280] hover:bg-[#FAFAF8]"
          )}
          onChange={(event) => { setSort(event.target.value as ProductSort); setPage(1); }}
          value={sort}
        >
          <option value="createdAtDesc">최신순</option>
          <option value="dealCountDesc">딜 높은순</option>
          <option value="dealCountAsc">딜 낮은순</option>
        </select>
        <div className="flex-1" />
        <span className="text-[12px] text-[#9CA3AF]">
          {isExporting ? "내보내는 중..." : `${totalCount}개`}
        </span>
      </div>

      <div className="flex min-h-0 flex-1 flex-col px-5 pb-3 pt-1">
        {notice ? (
          <Toast message={notice} onClose={() => setNotice(null)} variant="success" />
        ) : null}

        {productsQuery.isError ? (
          <p className="rounded-md border border-destructive/30 bg-red-50 px-3 py-2 text-sm text-destructive">
            {getApiErrorMessage(productsQuery.error)}
          </p>
        ) : null}

        <div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden rounded-lg border border-[#E2E5EC] bg-white shadow-sm">
          <div className="flex h-11 shrink-0 items-center border-b border-[#E6EAF0] bg-[#FAFBFC] px-6">
            <ProductTableHeaderCell width={320}>제품명</ProductTableHeaderCell>
            <ProductTableHeaderCell width={180}>카테고리</ProductTableHeaderCell>
            <ProductTableHeaderCell width={130}>상태</ProductTableHeaderCell>
            <ProductTableHeaderCell align="right" width={80}>딜 수</ProductTableHeaderCell>
            <ProductTableHeaderCell align="right" width={128}>등록일</ProductTableHeaderCell>
            <div className="min-w-0 flex-1" />
          </div>

          {productsQuery.isLoading ? (
            <ProductListSkeleton />
          ) : products.length === 0 ? (
            <ProductEmptyState
              hasSearch={search.length > 0 || categoryFilter.length > 0 || statusFilter.length > 0}
              onCreate={() => setIsCreateOpen(true)}
            />
          ) : (
            <div className="min-h-0 flex-1 overflow-y-auto">
              {products.map((product) => (
                <ProductRow
                  key={product.id}
                  product={product}
                  displayTimeZone={displayTimeZone}
                />
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
      <ProductTaxonomyManageDialog
        categories={categories}
        kind={taxonomyDialog?.kind ?? "category"}
        onCreated={(kind, name) => {
          if (kind === "category") {
            setPendingCategoryName(name);
          } else {
            setPendingStatusName(name);
          }
        }}
        onOpenChange={(open) => {
          if (!open) {
            setTaxonomyDialog(null);
          }
        }}
        open={taxonomyDialog !== null}
        statuses={statuses}
      />
    </section>
  );
}

function ProductRow({
  product,
  displayTimeZone,
}: {
  readonly product: Product;
  readonly displayTimeZone: string;
}) {
  return (
    <Link
      className="flex h-[66px] items-center border-b border-[#E8EDF3] px-6 transition-colors hover:bg-blue-50/60 last:border-b-0"
      to={`/products/${product.id}`}
    >
      <div className="w-[320px] shrink-0 min-w-0">
        <span className="block truncate text-[13px] font-semibold text-[#111827]">
          {product.productName}
        </span>
      </div>
      <div className="w-[180px] min-w-0 shrink-0">
        <Badge tone="indigo">
          {product.productCategory.categoryName}
        </Badge>
      </div>
      <div className="w-[130px] min-w-0 shrink-0">
        <Badge tone={statusToneFromName(product.productStatus.statusName)}>
          {product.productStatus.statusName}
        </Badge>
      </div>
      <div className="w-[80px] shrink-0 text-right text-[12px] font-medium text-[#475569]">
        {product.dealCount.toLocaleString("ko-KR")}건
      </div>
      <div
        className="w-[128px] shrink-0 text-right text-[12px] font-medium text-[#64748B]"
        title={formatProductCreatedAt(product.createdAt, displayTimeZone)}
      >
        {formatProductCreatedAt(product.createdAt, displayTimeZone)}
      </div>
      <div className="min-w-0 flex-1" />
    </Link>
  );
}

function ProductTableHeaderCell({
  align = "left",
  children,
  width,
  flex = false,
}: {
  readonly align?: "left" | "right";
  readonly children: string;
  readonly width?: number;
  readonly flex?: boolean;
}) {
  return (
    <div
      className={cn(
        "shrink-0 text-[12px] font-semibold text-[#64748B]",
        align === "right" && "text-right",
        flex && "min-w-0 flex-1"
      )}
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
  readonly tone: "indigo" | "green" | "rose" | "slate";
}) {
  const styles: Record<typeof tone, string> = {
    indigo: "bg-[#EEF2FF] text-[#4338CA]",
    green: "bg-[#ECFDF5] text-[#047857]",
    rose: "bg-[#FEF2F2] text-[#B91C1C]",
    slate: "bg-[#F1F5F9] text-[#475569]",
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
        "inline-flex h-8 items-center rounded-[6px] px-3 text-[13px] transition",
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
    <div className="min-h-0 flex-1 overflow-hidden">
      {Array.from({ length: 6 }, (_, index) => (
        <div
          className="h-[66px] animate-pulse border-b border-[#E8EDF3] bg-[#FAFBFC]"
          key={index}
        />
      ))}
    </div>
  );
}

function formatProductCreatedAt(value: string, timeZone: string) {
  return formatDateWithOptions(value, {
    day: "2-digit",
    month: "2-digit",
    timeZone,
    year: "numeric",
  });
}

function getBrowserTimeZoneFallback() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Seoul";
  } catch {
    return "Asia/Seoul";
  }
}

function statusToneFromName(statusName: string) {
  if (statusName.includes("중단") || statusName.includes("보류")) {
    return "rose";
  }
  if (statusName.includes("판매") || statusName.includes("활성")) {
    return "green";
  }
  return "slate";
}

const ADD_TAXONOMY_VALUE = "__add_taxonomy__";
