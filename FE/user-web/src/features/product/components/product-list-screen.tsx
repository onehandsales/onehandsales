import {
  ChevronDown,
  Download,
  Package,
  Plus,
  RotateCcw,
  Search,
  X,
  type LucideIcon,
} from "lucide-react";
import {
  type FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/layout/page-header";
import { ListFilterSelect } from "@/components/ui/list-filter-select";
import { Pagination } from "@/components/ui/pagination";
import { ListEmptyState } from "@/components/ui/state";
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
import { readLocationNotice } from "@/utils/location-state";

type ProductListScreenProps = {
  readonly initialCreateOpen?: boolean;
  readonly onCreateDialogClose?: () => void;
};

const PRODUCT_SORT_OPTIONS: Array<{
  readonly value: ProductSort;
  readonly label: string;
}> = [
  { value: "createdAtDesc", label: "최신순" },
  { value: "dealCountDesc", label: "딜 높은순" },
  { value: "dealCountAsc", label: "딜 낮은순" },
];

const PRODUCT_TABLE_GRID_STYLE = {
  gridTemplateColumns: "repeat(5, minmax(90px, 1fr))",
};

export function ProductListScreen({
  initialCreateOpen = false,
  onCreateDialogClose,
}: ProductListScreenProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthSession();
  const [searchText, setSearchText] = useState("");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sort, setSort] = useState<ProductSort>("createdAtDesc");
  const [page, setPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [taxonomyDialog, setTaxonomyDialog] = useState<{
    readonly kind: "category" | "status";
  } | null>(null);
  const [pendingCategoryName, setPendingCategoryName] = useState("");
  const [pendingStatusName, setPendingStatusName] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const categoriesQuery = useProductCategories();
  const statusesQuery = useProductStatuses();
  const categories = useMemo(
    () => categoriesQuery.data?.items ?? [],
    [categoriesQuery.data],
  );
  const statuses = useMemo(
    () => statusesQuery.data?.items ?? [],
    [statusesQuery.data],
  );

  const listParams = useMemo(
    () => ({
      page,
      productName: search || undefined,
      productCategoryId: categoryFilter || undefined,
      productStatusId: statusFilter || undefined,
      sort,
    }),
    [categoryFilter, page, search, sort, statusFilter],
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
    const message = readLocationNotice(location.state);
    if (!message) {
      return;
    }

    setNotice(message);
    void navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate]);

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
      (category) => category.categoryName === pendingCategoryName,
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
      (status) => status.statusName === pendingStatusName,
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
    <section className="flex min-h-full flex-col bg-[#FAFAF8]">
      <PageHeader
        breadcrumbs={[{ label: "제품", icon: Package }]}
        actions={[
          {
            icon: Download,
            tooltip: "액셀 다운로드",
            onClick: () => void onExport(),
            disabled: isExporting,
          },
          {
            icon: Plus,
            tooltip: "제품 추가",
            onClick: () => void navigate("/products/new"),
            variant: "primary",
          },
        ]}
      />

      {/* 검색 + 필터 툴바 (데스크톱) */}
      <div className="hidden min-h-10 shrink-0 items-center gap-1.5 overflow-x-auto px-5 py-1 md:flex lg:gap-2">
        <form
          className="flex h-8 w-[clamp(150px,20vw,220px)] shrink-0 items-center gap-1.5 rounded-md border border-[#E2E5EC] bg-[#FAFAF8] px-3 transition hover:border-[#93C5FD] hover:bg-white focus-within:border-[#2563EB] focus-within:bg-white focus-within:ring-1 focus-within:ring-[#2563EB]"
          onSubmit={onSearchSubmit}
        >
          <Search className="h-3 w-3 shrink-0 text-[#9CA3AF]" />
          <input
            className="min-w-0 flex-1 bg-transparent text-[13px] text-[#111827] outline-none placeholder:text-[#9CA3AF]"
            onChange={(event) => setSearchText(event.target.value)}
            placeholder="제품명 검색"
            value={searchText}
          />
        </form>
        <FilterChip
          active={!hasFilters}
          icon={RotateCcw}
          label="초기화"
          onClick={() => {
            setSearch("");
            setSearchText("");
            setCategoryFilter("");
            setStatusFilter("");
            setSort("createdAtDesc");
            setPage(1);
          }}
        />
        <ProductTaxonomyFilterCombobox
          emptyText="조건에 맞는 카테고리가 없습니다."
          getLabel={(c) => c.categoryName}
          itemKindLabel="카테고리"
          items={categories}
          selectedId={categoryFilter}
          size="desktop"
          tone="indigo"
          onCreateClick={() => setTaxonomyDialog({ kind: "category" })}
          onSelectedIdChange={(id) => {
            setCategoryFilter(id);
            setPage(1);
          }}
        />
        <ProductTaxonomyFilterCombobox
          emptyText="조건에 맞는 상태가 없습니다."
          getLabel={(s) => s.statusName}
          itemKindLabel="상태"
          items={statuses}
          selectedId={statusFilter}
          size="desktop"
          tone="green"
          onCreateClick={() => setTaxonomyDialog({ kind: "status" })}
          onSelectedIdChange={(id) => {
            setStatusFilter(id);
            setPage(1);
          }}
        />
        <ListFilterSelect
          active={sort !== "createdAtDesc"}
          ariaLabel="정렬 조건"
          className="w-[clamp(112px,11vw,132px)]"
          onChange={(nextSort) => {
            setSort(nextSort);
            setPage(1);
          }}
          options={PRODUCT_SORT_OPTIONS}
          value={sort}
        />
        <div className="flex-1" />
        <span className="shrink-0 text-[12px] text-[#9CA3AF]">
          {isExporting ? "내보내는 중..." : `${totalCount}개`}
        </span>
      </div>

      {/* 테이블 (데스크톱) */}
      <div className="hidden gap-3 overflow-x-auto px-5 pb-3 pt-1 md:flex xl:gap-5">
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          {notice ? (
            <Toast
              message={notice}
              onClose={() => setNotice(null)}
              variant="success"
            />
          ) : null}

          {productsQuery.isError ? (
            <p className="rounded-md border border-destructive/30 bg-red-50 px-3 py-2 text-sm text-destructive">
              {getApiErrorMessage(productsQuery.error)}
            </p>
          ) : null}

          <div className="flex w-full min-w-[520px] flex-col overflow-hidden rounded-lg border border-[#E2E5EC] bg-white shadow-sm">
            <div
              className="grid h-11 shrink-0 items-center border-b border-[#E6EAF0] bg-[#FAFBFC] px-3 md:px-4 xl:px-6"
              style={PRODUCT_TABLE_GRID_STYLE}
            >
              <ProductTableHeaderCell>제품명</ProductTableHeaderCell>
              <ProductTableHeaderCell>카테고리</ProductTableHeaderCell>
              <ProductTableHeaderCell>상태</ProductTableHeaderCell>
              <ProductTableHeaderCell>딜 수</ProductTableHeaderCell>
              <ProductTableHeaderCell>등록일</ProductTableHeaderCell>
            </div>

            {productsQuery.isLoading ? (
              <ProductListSkeleton />
            ) : products.length === 0 ? (
              <ListEmptyState
                actionIcon={Plus}
                actionLabel="제품 추가"
                icon={Package}
                onAction={() => setIsCreateOpen(true)}
                title={
                  hasFilters
                    ? "조건에 맞는 제품이 없습니다"
                    : "등록된 제품이 없습니다"
                }
              />
            ) : (
              <div className="min-w-0">
                {products.map((product) => (
                  <ProductRow
                    displayTimeZone={displayTimeZone}
                    key={product.id}
                    product={product}
                  />
                ))}
              </div>
            )}
          </div>

          {productsQuery.data ? (
            <Pagination
              onPageChange={setPage}
              page={productsQuery.data.page}
              totalPages={productsQuery.data.totalPages}
            />
          ) : null}
        </div>
      </div>

      {/* 모바일 뷰 */}
      <section className="flex min-h-0 flex-1 flex-col md:hidden">
        {/* 모바일 필터 칩 행 */}
        <div className="flex h-10 shrink-0 items-center gap-2 overflow-x-auto border-b border-[#E5E7EB] px-4">
          <button
            className={cn(
              "inline-flex h-7 shrink-0 items-center gap-1.5 rounded-full border px-3 text-[12px] font-medium transition",
              !hasFilters
                ? "border-[#C7D7FE] bg-[#EAF2FF] font-bold text-[#1D4ED8]"
                : "border-[#E5E7EB] bg-[#F3F4F6] text-[#4B5563]",
            )}
            onClick={() => {
              setSearch("");
              setSearchText("");
              setCategoryFilter("");
              setStatusFilter("");
              setSort("createdAtDesc");
              setPage(1);
            }}
            type="button"
          >
            <RotateCcw className="h-3 w-3" />
            초기화
          </button>
          <ProductTaxonomyFilterCombobox
            emptyText="조건에 맞는 카테고리가 없습니다."
            getLabel={(c) => c.categoryName}
            itemKindLabel="카테고리"
            items={categories}
            selectedId={categoryFilter}
            size="mobile"
            tone="indigo"
            onCreateClick={() => setTaxonomyDialog({ kind: "category" })}
            onSelectedIdChange={(id) => {
              setCategoryFilter(id);
              setPage(1);
            }}
          />
          <ProductTaxonomyFilterCombobox
            emptyText="조건에 맞는 상태가 없습니다."
            getLabel={(s) => s.statusName}
            itemKindLabel="상태"
            items={statuses}
            selectedId={statusFilter}
            size="mobile"
            tone="green"
            onCreateClick={() => setTaxonomyDialog({ kind: "status" })}
            onSelectedIdChange={(id) => {
              setStatusFilter(id);
              setPage(1);
            }}
          />
          <div className="flex-1" />
          <span className="shrink-0 text-[11px] text-[#9CA3AF]">
            {totalCount}개
          </span>
        </div>

        {/* 모바일 알림 */}
        {notice ? (
          <div className="px-4 pt-2">
            <Toast
              message={notice}
              onClose={() => setNotice(null)}
              variant="success"
            />
          </div>
        ) : null}

        {/* 모바일 카드 목록 */}
        <div className="bg-white">
          {productsQuery.isLoading ? (
            <div className="space-y-0">
              {Array.from({ length: 8 }, (_, i) => (
                <div
                  key={i}
                  className="h-[80px] animate-pulse border-b border-[#E5E7EB] bg-[#F9FAFB]"
                />
              ))}
            </div>
          ) : productsQuery.isError ? (
            <div className="flex flex-col items-center justify-center px-5 py-14 text-center">
              <p className="text-[13px] text-red-500">
                {getApiErrorMessage(productsQuery.error)}
              </p>
              <button
                className="mt-3 inline-flex h-8 items-center rounded-md border border-[#E2E5EC] bg-white px-3 text-[12px] text-[#6B7280]"
                onClick={() => void productsQuery.refetch()}
                type="button"
              >
                다시 시도
              </button>
            </div>
          ) : products.length === 0 ? (
            <ListEmptyState
              actionIcon={Plus}
              actionLabel="제품 추가"
              icon={Package}
              onAction={() => setIsCreateOpen(true)}
              title={
                hasFilters
                  ? "조건에 맞는 제품이 없습니다"
                  : "등록된 제품이 없습니다"
              }
            />
          ) : (
            products.map((product) => (
              <ProductMobileCard
                key={product.id}
                product={product}
                displayTimeZone={displayTimeZone}
              />
            ))
          )}
        </div>

        {/* 모바일 페이지네이션 */}
        {productsQuery.data ? (
          <div className="shrink-0 border-t border-[#E5E7EB] bg-white px-4 py-2">
            <Pagination
              page={productsQuery.data.page}
              totalPages={productsQuery.data.totalPages}
              onPageChange={setPage}
            />
          </div>
        ) : null}

        {/* FAB */}
        <button
          aria-label="제품 추가"
          className="fixed bottom-24 right-5 flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[#5E5CE6] shadow-[0_4px_16px_rgba(59,130,246,0.27)] transition active:opacity-80"
          onClick={() => void navigate("/products/new")}
          type="button"
        >
          <Plus className="h-6 w-6 text-white" strokeWidth={2.5} />
        </button>
      </section>

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

function ProductMobileCard({
  product,
  displayTimeZone,
}: {
  readonly product: Product;
  readonly displayTimeZone: string;
}) {
  const navigate = useNavigate();

  return (
    <button
      className="flex w-full items-start gap-3 border-b border-[#E5E7EB] bg-white px-4 py-[14px] text-left transition active:bg-[#F9FAFB] hover:bg-[#EAF2FF]"
      onClick={() => void navigate(`/products/${product.id}`)}
      type="button"
    >
      {/* 아이콘 */}
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#EEEEFF]">
        <Package className="h-4 w-4 text-[#5E5CE6]" strokeWidth={2} />
      </div>
      {/* 내용 */}
      <div className="min-w-0 flex-1">
        {/* Row1: 제품명 + 카테고리 배지 */}
        <div className="flex min-w-0 items-center gap-2">
          <span className="min-w-0 truncate text-[14px] font-semibold text-[#111827]">
            {product.productName}
          </span>
          <span className="inline-flex h-5 shrink-0 items-center rounded-full bg-[#EEF2FF] px-2 text-[11px] font-semibold text-[#4338CA]">
            {product.productCategory.categoryName}
          </span>
        </div>
        {/* Row2: 상태 배지 */}
        <div className="mt-0.5">
          <Badge tone={statusToneFromName(product.productStatus.statusName)}>
            {product.productStatus.statusName}
          </Badge>
        </div>
        {/* Row3: 딜 수 + 등록일 */}
        <div className="mt-1 flex items-center justify-between">
          <span className="text-[12px] text-[#6B7280]">
            딜 {product.dealCount.toLocaleString("ko-KR")}건
          </span>
          <span className="shrink-0 text-[11px] text-[#9CA3AF]">
            {formatProductCreatedAt(product.createdAt, displayTimeZone)}
          </span>
        </div>
      </div>
    </button>
  );
}

function ProductRow({
  product,
  displayTimeZone,
}: {
  readonly product: Product;
  readonly displayTimeZone: string;
}) {
  const navigate = useNavigate();

  return (
    <div
      className="grid h-[66px] cursor-pointer items-center border-b border-[#E8EDF3] px-3 transition-colors last:border-b-0 hover:bg-[#EAF2FF] md:px-4 xl:px-6"
      onClick={() => void navigate(`/products/${product.id}`)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          void navigate(`/products/${product.id}`);
        }
      }}
      role="button"
      style={PRODUCT_TABLE_GRID_STYLE}
      tabIndex={0}
    >
      <div className="min-w-0">
        <span className="block truncate text-[13px] font-semibold text-[#111827]">
          {product.productName}
        </span>
      </div>
      <div className="min-w-0">
        <Badge tone="indigo">{product.productCategory.categoryName}</Badge>
      </div>
      <div className="min-w-0">
        <Badge tone={statusToneFromName(product.productStatus.statusName)}>
          {product.productStatus.statusName}
        </Badge>
      </div>
      <div className="min-w-0 whitespace-nowrap text-[12px] font-medium text-[#475569]">
        {product.dealCount.toLocaleString("ko-KR")}건
      </div>
      <div
        className="min-w-0 truncate text-[12px] font-medium text-[#64748B]"
        title={formatProductCreatedAt(product.createdAt, displayTimeZone)}
      >
        {formatProductCreatedAt(product.createdAt, displayTimeZone)}
      </div>
    </div>
  );
}

function ProductTableHeaderCell({
  align = "left",
  children,
}: {
  readonly align?: "left" | "right";
  readonly children: string;
}) {
  return (
    <div
      className={cn(
        "min-w-0 truncate text-[12px] font-semibold text-[#64748B]",
        align === "right" && "text-right",
      )}
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
        styles[tone],
      )}
      title={children}
    >
      <span className="min-w-0 truncate whitespace-nowrap">{children}</span>
    </span>
  );
}

function FilterChip({
  active,
  icon: Icon,
  label,
  onClick,
}: {
  readonly active: boolean;
  readonly icon?: LucideIcon;
  readonly label: string;
  readonly onClick: () => void;
}) {
  return (
    <button
      className={cn(
        "inline-flex h-8 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-[6px] border px-3 text-[13px] transition hover:border-[#93C5FD] focus:border-[#2563EB] focus:outline-none focus:ring-1 focus:ring-[#2563EB]",
        active
          ? "border-[#C7D7FE] bg-[#EAF2FF] font-bold text-[#1D4ED8]"
          : "border-[#E6EAF0] bg-white font-medium text-[#475569] hover:bg-[#F9FAFB]",
      )}
      onClick={onClick}
      type="button"
    >
      {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
      {label}
    </button>
  );
}

// ── ProductTaxonomyFilterCombobox ─────────────────────────────────────────────

type FieldFilterPopoverPosition = {
  readonly left: number;
  readonly top: number;
  readonly width: number;
};

type ProductTaxonomyFilterItem = {
  readonly id: string;
};

type ProductTaxonomyFilterTone = "indigo" | "green";

function ProductTaxonomyFilterCombobox<
  TItem extends ProductTaxonomyFilterItem,
>({
  emptyText,
  getLabel,
  itemKindLabel,
  items,
  selectedId,
  size,
  tone,
  onCreateClick,
  onSelectedIdChange,
}: {
  readonly emptyText: string;
  readonly getLabel: (item: TItem) => string;
  readonly itemKindLabel: string;
  readonly items: readonly TItem[];
  readonly selectedId: string;
  readonly size: "desktop" | "mobile";
  readonly tone: ProductTaxonomyFilterTone;
  readonly onCreateClick: () => void;
  readonly onSelectedIdChange: (id: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [popoverPosition, setPopoverPosition] =
    useState<FieldFilterPopoverPosition | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedItem = useMemo(
    () => items.find((item) => item.id === selectedId) ?? null,
    [items, selectedId],
  );
  const selectedSummary = selectedItem ? getLabel(selectedItem) : "";

  const query = search.trim();
  const normalizedQuery = normalizeFilterText(query);
  const filteredItems =
    normalizedQuery.length > 0
      ? items.filter((item) =>
          normalizeFilterText(getLabel(item)).includes(normalizedQuery),
        )
      : items;
  const isMobile = size === "mobile";
  const inputValue = isOpen ? search : selectedSummary;

  useEffect(() => {
    if (!isOpen) {
      setSearch("");
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const updatePopoverPosition = () => {
      if (!inputRef.current) {
        return;
      }
      setPopoverPosition(
        getFieldFilterPopoverPosition(inputRef.current, isMobile),
      );
    };
    const onMouseDown = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearch("");
      }
    };

    updatePopoverPosition();
    document.addEventListener("mousedown", onMouseDown);
    window.addEventListener("resize", updatePopoverPosition);
    window.addEventListener("scroll", updatePopoverPosition, true);

    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("resize", updatePopoverPosition);
      window.removeEventListener("scroll", updatePopoverPosition, true);
    };
  }, [isMobile, isOpen]);

  const selectItem = (item: TItem) => {
    const nextId = selectedId === item.id ? "" : item.id;
    setSearch("");
    onSelectedIdChange(nextId);
    setIsOpen(false);
  };

  const openOptions = (nextSearch: string) => {
    setSearch(nextSearch);
    if (inputRef.current) {
      setPopoverPosition(
        getFieldFilterPopoverPosition(inputRef.current, isMobile),
      );
    }
    setIsOpen(true);
  };

  const clearSelection = () => {
    setSearch("");
    onSelectedIdChange("");
    inputRef.current?.focus();
    openOptions("");
  };

  return (
    <div
      ref={wrapperRef}
      className={cn(
        "relative shrink-0",
        isMobile ? "w-[120px]" : "w-[clamp(136px,14vw,178px)]",
      )}
    >
      <div className="relative">
        {/* Search icon — only visible when open */}
        {isOpen ? (
          <Search
            className={cn(
              "pointer-events-none absolute top-1/2 shrink-0 -translate-y-1/2 text-[#9CA3AF]",
              isMobile ? "left-2.5 h-3 w-3" : "left-3 h-3 w-3",
            )}
          />
        ) : null}
        <input
          ref={inputRef}
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-label={`${itemKindLabel} 필터`}
          autoComplete="off"
          className={cn(
            "w-full min-w-0 border outline-none transition",
            isMobile
              ? "h-7 rounded-full text-[12px]"
              : "h-8 rounded-full text-[13px]",
            isOpen
              ? cn(
                  "border-[#2563EB] bg-white text-[#111827] ring-1 ring-[#2563EB]",
                  isMobile ? "pl-7 pr-7" : "pl-8 pr-7",
                )
              : selectedId
                ? cn(
                    getTaxonomyFilterInputSelectedClass(tone),
                    isMobile ? "pl-3 pr-7" : "pl-3.5 pr-7",
                  )
                : isMobile
                  ? "border-[#E5E7EB] bg-[#F3F4F6] pl-3 pr-7 text-[#4B5563] hover:border-[#D1D5DB]"
                  : "cursor-pointer border-[#E2E5EC] bg-transparent pl-3.5 pr-7 text-[#6B7280] hover:border-[#D1D5DB] hover:bg-[#F5F6F8]",
          )}
          onChange={(event) => {
            openOptions(event.target.value);
          }}
          onFocus={() => openOptions("")}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setIsOpen(false);
              setSearch("");
              inputRef.current?.blur();
              return;
            }

            if (event.key === "Enter") {
              const firstItem = filteredItems[0];
              if (!firstItem) {
                return;
              }
              event.preventDefault();
              selectItem(firstItem);
            }
          }}
          placeholder={`${itemKindLabel} 선택`}
          value={inputValue}
        />
        {/* Right icon: × when selected/searching, ▾ when idle */}
        {selectedId || search ? (
          <button
            aria-label={`${itemKindLabel} 필터 지우기`}
            className={cn(
              "absolute right-1 top-1/2 grid -translate-y-1/2 place-items-center rounded-full text-[#9CA3AF] transition hover:bg-white hover:text-[#374151]",
              isMobile ? "h-6 w-6" : "h-7 w-7",
            )}
            onClick={clearSelection}
            type="button"
          >
            <X className={isMobile ? "h-3 w-3" : "h-3.5 w-3.5"} />
          </button>
        ) : (
          <ChevronDown
            className={cn(
              "pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[#9CA3AF] transition-transform",
              isMobile ? "h-3 w-3" : "h-3.5 w-3.5",
              isOpen && "rotate-180",
            )}
          />
        )}
      </div>

      {isOpen ? (
        <div
          className={cn(
            "fixed z-50 overflow-hidden rounded-md border border-[#E6EAF0] bg-white shadow-lg",
            !popoverPosition && "invisible",
          )}
          style={{
            left: popoverPosition?.left ?? 0,
            top: popoverPosition?.top ?? 0,
            width: popoverPosition?.width ?? 256,
          }}
        >
          <button
            className={cn(
              "flex h-9 w-full items-center gap-1.5 px-3 text-left text-[13px] transition hover:bg-[#F9FAFB]",
              !selectedId
                ? "font-semibold text-[#1D4ED8]"
                : "font-medium text-[#475569]",
            )}
            onClick={() => {
              setSearch("");
              setIsOpen(false);
              onSelectedIdChange("");
            }}
            type="button"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            {itemKindLabel} 초기화
          </button>

          <div className="max-h-[184px] overflow-y-auto border-y border-[#E6EAF0] py-1">
            {filteredItems.length === 0 ? (
              <p className="px-3 py-3 text-[12px] text-[#9CA3AF]">
                {emptyText}
              </p>
            ) : (
              filteredItems.map((item) => {
                const isSelected = item.id === selectedId;

                return (
                  <button
                    className={cn(
                      "flex h-8 w-full min-w-0 items-center gap-2 px-3 text-left text-[13px] transition hover:bg-[#F9FAFB]",
                      isSelected && getTaxonomyFilterItemSelectedClass(tone),
                    )}
                    key={item.id}
                    onClick={() => selectItem(item)}
                    type="button"
                  >
                    <span
                      className={cn(
                        "grid h-3.5 w-3.5 shrink-0 place-items-center rounded-full border",
                        isSelected
                          ? getTaxonomyFilterCheckBorderClass(tone)
                          : "border-[#CBD5E1]",
                      )}
                    >
                      {isSelected ? (
                        <span
                          className={cn(
                            "h-1.5 w-1.5 rounded-full",
                            getTaxonomyFilterCheckDotClass(tone),
                          )}
                        />
                      ) : null}
                    </span>
                    <span className="min-w-0 flex-1 truncate">
                      {getLabel(item)}
                    </span>
                  </button>
                );
              })
            )}
          </div>

          <button
            className="flex h-9 w-full items-center gap-1.5 px-3 text-left text-[12px] font-semibold text-[#2563EB] transition hover:bg-[#EFF6FF]"
            onClick={() => {
              setIsOpen(false);
              setSearch("");
              onCreateClick();
            }}
            type="button"
          >
            <Plus className="h-3.5 w-3.5" />
            새 {itemKindLabel} 추가
          </button>
        </div>
      ) : null}
    </div>
  );
}

function getFieldFilterPopoverPosition(
  input: HTMLInputElement,
  isMobile: boolean,
): FieldFilterPopoverPosition {
  const rect = input.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const margin = 16;
  const width = isMobile
    ? Math.min(256, Math.max(160, viewportWidth - margin * 2))
    : 256;
  const maxLeft = Math.max(margin, viewportWidth - width - margin);
  const left = Math.min(Math.max(rect.left, margin), maxLeft);

  return {
    left,
    top: rect.bottom + 4,
    width,
  };
}

function getTaxonomyFilterInputSelectedClass(tone: ProductTaxonomyFilterTone) {
  return tone === "indigo"
    ? "border-[#BFDBFE] bg-[#EFF6FF] font-semibold text-[#1D4ED8]"
    : "border-[#A7F3D0] bg-[#ECFDF5] font-semibold text-[#047857]";
}

function getTaxonomyFilterItemSelectedClass(tone: ProductTaxonomyFilterTone) {
  return tone === "indigo"
    ? "bg-[#EFF6FF] font-semibold text-[#1D4ED8]"
    : "bg-[#ECFDF5] font-semibold text-[#047857]";
}

function getTaxonomyFilterCheckBorderClass(tone: ProductTaxonomyFilterTone) {
  return tone === "indigo" ? "border-[#1D4ED8]" : "border-[#047857]";
}

function getTaxonomyFilterCheckDotClass(tone: ProductTaxonomyFilterTone) {
  return tone === "indigo" ? "bg-[#1D4ED8]" : "bg-[#047857]";
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
    return "rose" as const;
  }
  if (statusName.includes("판매") || statusName.includes("활성")) {
    return "green" as const;
  }
  return "slate" as const;
}

function normalizeFilterText(value: string) {
  return value.trim().toLowerCase();
}
