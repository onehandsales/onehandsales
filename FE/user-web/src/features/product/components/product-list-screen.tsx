import {
  ChevronDown,
  Download,
  Package,
  Plus,
  RotateCcw,
  Search,
  SlidersHorizontal,
  X,
  type LucideIcon,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  useLocation,
  useNavigate,
  useOutletContext,
} from "react-router-dom";
import type { AppShellOutletContext } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { CollapsibleDesktopSearch } from "@/components/ui/collapsible-desktop-search";
import { ListFilterSelect } from "@/components/ui/list-filter-select";
import { Pagination } from "@/components/ui/pagination";
import { ListEmptyState } from "@/components/ui/state";
import { Toast } from "@/components/ui/toast";
import { useAuthSession } from "@/features/auth";
import { ProductCreateDialog } from "@/features/product/components/product-create-dialog";
import type {
  ProductCreateFormValues,
} from "@/features/product/components/product-create-dialog";
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
import {
  readLocationNotice,
  readLocationNoticeDescription,
} from "@/utils/location-state";

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
  gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
};
const PRODUCT_CREATE_PANEL_STORAGE_KEY = "onehand.product.createPanelWidth";
const PRODUCT_CREATE_PANEL_DEFAULT_WIDTH = 520;
const PRODUCT_CREATE_PANEL_MIN_WIDTH = 420;
const PRODUCT_CREATE_PANEL_MAX_RATIO = 0.55;
const PRODUCT_CREATE_PANEL_AUTO_SIDEBAR_RATIO = 0.45;
const PRODUCT_CREATE_PANEL_TRANSITION_MS = 500;
const DESKTOP_SEARCH_COMPACT_MAX_WIDTH = 170;
const DESKTOP_FILTER_COLLAPSED_WIDTH = 32;
const DESKTOP_FILTER_EXPANDED_WIDTH =
  "calc(clamp(136px,14vw,178px) + clamp(136px,14vw,178px) + 0.5rem)";

export function ProductListScreen({
  initialCreateOpen = false,
  onCreateDialogClose,
}: ProductListScreenProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const outletContext =
    useOutletContext<AppShellOutletContext | undefined>();
  const { user } = useAuthSession();
  const isDockedViewport = useMediaQuery("(min-width: 1024px)");
  const [searchText, setSearchText] = useState("");
  const [search, setSearch] = useState("");
  const [searchResetSignal, setSearchResetSignal] = useState(0);
  const [categoryFilterIds, setCategoryFilterIds] = useState<string[]>([]);
  const [statusFilterIds, setStatusFilterIds] = useState<string[]>([]);
  const [sort, setSort] = useState<ProductSort>("createdAtDesc");
  const [page, setPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDockedCreateRendered, setIsDockedCreateRendered] = useState(false);
  const [createPanelWidth, setCreatePanelWidth] = useState(
    getStoredProductCreatePanelWidth,
  );
  const [isCreatePanelResizing, setIsCreatePanelResizing] = useState(false);
  const [isCompactFilterOpen, setIsCompactFilterOpen] = useState(false);
  const [compactFilterPosition, setCompactFilterPosition] =
    useState<FieldFilterPopoverPosition | null>(null);
  const [taxonomyDialog, setTaxonomyDialog] = useState<{
    readonly kind: "category" | "status";
  } | null>(null);
  const [pendingCategoryName, setPendingCategoryName] = useState("");
  const [pendingStatusName, setPendingStatusName] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [noticeDescription, setNoticeDescription] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const compactFilterButtonRef = useRef<HTMLButtonElement>(null);
  const compactFilterPopoverRef = useRef<HTMLDivElement>(null);
  const setAutoSidebarCollapsed = outletContext?.setAutoSidebarCollapsed;

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
      productCategoryIds:
        categoryFilterIds.length > 0 ? categoryFilterIds : undefined,
      productStatusIds:
        statusFilterIds.length > 0 ? statusFilterIds : undefined,
      sort,
    }),
    [categoryFilterIds, page, search, sort, statusFilterIds],
  );

  const productsQuery = useProductList(listParams);
  const products = productsQuery.data?.items ?? [];
  const totalCount = productsQuery.data?.totalCount ?? 0;
  const displayTimeZone = user?.timeZone ?? getBrowserTimeZoneFallback();
  const isDockedCreateOpen = isCreateOpen && isDockedViewport;
  const isDockedCreateMounted = isDockedCreateOpen || isDockedCreateRendered;
  const isCompactFilterMode = isDockedCreateOpen;
  const hasTaxonomyFilters =
    categoryFilterIds.length > 0 || statusFilterIds.length > 0;
  const taxonomyFilterCount = categoryFilterIds.length + statusFilterIds.length;
  const hasFilters =
    search.length > 0 ||
    categoryFilterIds.length > 0 ||
    statusFilterIds.length > 0 ||
    sort !== "createdAtDesc";

  useEffect(() => {
    const message = readLocationNotice(location.state);
    if (!message) {
      return;
    }

    setNotice(message);
    setNoticeDescription(readLocationNoticeDescription(location.state));
    void navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate]);

  useEffect(() => {
    if (!initialCreateOpen) {
      return;
    }

    setCreatePanelWidth(PRODUCT_CREATE_PANEL_MIN_WIDTH);
    setIsCreateOpen(true);
  }, [initialCreateOpen]);

  useEffect(() => {
    if (isDockedCreateOpen) {
      setIsDockedCreateRendered(true);
      return;
    }

    const timerId = window.setTimeout(() => {
      setIsDockedCreateRendered(false);
    }, PRODUCT_CREATE_PANEL_TRANSITION_MS);

    return () => window.clearTimeout(timerId);
  }, [isDockedCreateOpen]);

  useEffect(() => {
    if (!isCompactFilterMode) {
      setIsCompactFilterOpen(false);
    }
  }, [isCompactFilterMode]);

  useEffect(() => {
    if (!isCompactFilterOpen) {
      return;
    }

    const updateCompactFilterPosition = () => {
      if (!compactFilterButtonRef.current) {
        return;
      }

      setCompactFilterPosition(
        getCompactFilterPopoverPosition(compactFilterButtonRef.current),
      );
    };
    const onMouseDown = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        compactFilterButtonRef.current?.contains(target) ||
        compactFilterPopoverRef.current?.contains(target)
      ) {
        return;
      }

      setIsCompactFilterOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsCompactFilterOpen(false);
        compactFilterButtonRef.current?.focus();
      }
    };

    updateCompactFilterPosition();
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", updateCompactFilterPosition);
    window.addEventListener("scroll", updateCompactFilterPosition, true);

    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", updateCompactFilterPosition);
      window.removeEventListener("scroll", updateCompactFilterPosition, true);
    };
  }, [isCompactFilterOpen]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(
      PRODUCT_CREATE_PANEL_STORAGE_KEY,
      String(createPanelWidth),
    );
  }, [createPanelWidth]);

  useEffect(() => {
    const clampToViewport = () => {
      setCreatePanelWidth((currentWidth) =>
        clampProductCreatePanelWidth(
          currentWidth,
          window.innerWidth,
        ),
      );
    };

    clampToViewport();
    window.addEventListener("resize", clampToViewport);

    return () => {
      window.removeEventListener("resize", clampToViewport);
    };
  }, []);

  useEffect(() => {
    if (!setAutoSidebarCollapsed) {
      return;
    }

    return () => {
      setAutoSidebarCollapsed(false);
    };
  }, [setAutoSidebarCollapsed]);

  useEffect(() => {
    if (!setAutoSidebarCollapsed) {
      return;
    }

    const syncAutoSidebar = () => {
      const viewportWidth =
        typeof window === "undefined" ? 0 : window.innerWidth;
      const shouldCollapse =
        isDockedCreateMounted &&
        viewportWidth > 0 &&
        createPanelWidth / viewportWidth >
          PRODUCT_CREATE_PANEL_AUTO_SIDEBAR_RATIO;

      setAutoSidebarCollapsed(shouldCollapse);
    };

    syncAutoSidebar();
    window.addEventListener("resize", syncAutoSidebar);

    return () => {
      window.removeEventListener("resize", syncAutoSidebar);
    };
  }, [createPanelWidth, isDockedCreateMounted, setAutoSidebarCollapsed]);

  useEffect(() => {
    if (!isCreatePanelResizing) {
      return;
    }

    const previousCursor = document.body.style.cursor;
    const previousUserSelect = document.body.style.userSelect;
    const onMouseMove = (event: MouseEvent) => {
      setCreatePanelWidth(
        clampProductCreatePanelWidth(
          window.innerWidth - event.clientX,
          window.innerWidth,
        ),
      );
    };
    const onMouseUp = () => setIsCreatePanelResizing(false);

    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      document.body.style.cursor = previousCursor;
      document.body.style.userSelect = previousUserSelect;
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [isCreatePanelResizing]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  useEffect(() => {
    if (!pendingCategoryName) return;
    const matched = categories.find(
      (category) => category.categoryName === pendingCategoryName,
    );
    if (matched) {
      setCategoryFilterIds((prev) => addUniqueId(prev, matched.id));
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
      setStatusFilterIds((prev) => addUniqueId(prev, matched.id));
      setPage(1);
      setPendingStatusName("");
    }
  }, [statuses, pendingStatusName]);

  useEffect(() => {
    const validIds = new Set(categories.map((category) => category.id));
    const nextIds = categoryFilterIds.filter((id) => validIds.has(id));
    if (nextIds.length !== categoryFilterIds.length) {
      setCategoryFilterIds(nextIds);
      setPage(1);
    }
  }, [categoryFilterIds, categories]);

  useEffect(() => {
    const validIds = new Set(statuses.map((status) => status.id));
    const nextIds = statusFilterIds.filter((id) => validIds.has(id));
    if (nextIds.length !== statusFilterIds.length) {
      setStatusFilterIds(nextIds);
      setPage(1);
    }
  }, [statusFilterIds, statuses]);

  const onSearchSubmit = (nextSearch: string) => {
    setSearch(nextSearch);
    setPage(1);
  };

  const onExport = async () => {
    setIsExporting(true);
    try {
      const { blob, fileName } = await exportProductsXlsx({
        productName: search || undefined,
        productCategoryIds:
          categoryFilterIds.length > 0 ? categoryFilterIds : undefined,
        productStatusIds:
          statusFilterIds.length > 0 ? statusFilterIds : undefined,
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
  const onCreateOpenChange = (open: boolean) => {
    setIsCreateOpen(open);

    if (!open) {
      onCreateDialogClose?.();
    }
  };
  const openCreatePanel = () => {
    setCreatePanelWidth(PRODUCT_CREATE_PANEL_MIN_WIDTH);
    setIsCreateOpen(true);
  };
  const onCreateExpand = (values: ProductCreateFormValues) => {
    void navigate("/app/products/new/full", {
      state: { productCreateDraft: values },
    });
  };
  const onProductCreated = () => {
    setNotice("제품을 추가했어요.");
    void productsQuery.refetch();
  };

  return (
    <section
      className="flex min-h-full flex-col bg-white transition-[padding-right] duration-[500ms] ease-out"
      style={
        isDockedCreateMounted
          ? { paddingRight: isDockedCreateOpen ? createPanelWidth : 0 }
          : undefined
      }
    >
      <PageHeader
        breadcrumbs={[{ label: "제품", icon: Package }]}
        actions={[
          {
            icon: Download,
            tooltip: "엑셀 다운로드",
            onClick: () => void onExport(),
            disabled: isExporting,
          },
          {
            icon: Plus,
            tooltip: "제품 생성",
            onClick: openCreatePanel,
            hidden: isDockedCreateMounted,
            variant: "primary",
          },
        ]}
      />

      {/* 검색 + 필터 툴바 (데스크톱) */}
      <div className="hidden min-h-10 shrink-0 items-center px-5 py-1 md:flex">
        <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto [scrollbar-width:none] lg:gap-2 [&::-webkit-scrollbar]:hidden">
          <CollapsibleDesktopSearch
            appliedValue={search}
            maxExpandedWidth={
              isCompactFilterMode ? DESKTOP_SEARCH_COMPACT_MAX_WIDTH : undefined
            }
            placeholder="제품을 검색하세요!"
            resetSignal={searchResetSignal}
            submitLabel="제품 검색 실행"
            value={searchText}
            onSubmit={onSearchSubmit}
            onValueChange={setSearchText}
          />
          <FilterChip
            active={hasFilters}
            icon={RotateCcw}
            label="초기화"
            onClick={() => {
              setSearch("");
              setSearchText("");
              setSearchResetSignal((signal) => signal + 1);
              setCategoryFilterIds([]);
              setStatusFilterIds([]);
              setSort("createdAtDesc");
              setPage(1);
            }}
          />
          <div
            className="relative flex h-8 shrink-0 items-center overflow-hidden transition-[width] duration-500 ease-out"
            style={{
              width: isCompactFilterMode
                ? DESKTOP_FILTER_COLLAPSED_WIDTH
                : DESKTOP_FILTER_EXPANDED_WIDTH,
            }}
          >
            <button
              ref={compactFilterButtonRef}
              aria-expanded={isCompactFilterOpen}
              aria-label="필터"
              aria-hidden={!isCompactFilterMode}
              className={cn(
                "absolute left-0 top-0 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border text-[13px] font-semibold transition-[opacity,transform,border-color,background-color,color] duration-200 focus:outline-none",
                hasTaxonomyFilters
                  ? "border-[#E2E5EC] bg-[#EFF6FF] text-[#1D4ED8] hover:border-[#D1D5DB] hover:bg-[#DBEAFE]"
                  : "border-[#E2E5EC] bg-white text-[#475569] hover:border-[#D1D5DB] hover:bg-[#F5F6F8]",
                isCompactFilterMode
                  ? "scale-100 opacity-100"
                  : "!hidden pointer-events-none scale-95 opacity-0",
              )}
              onClick={() => setIsCompactFilterOpen((open) => !open)}
              tabIndex={isCompactFilterMode ? 0 : -1}
              type="button"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              {hasTaxonomyFilters ? (
                <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-[#4880EE] px-1 text-[10px] font-bold leading-none text-white">
                  {taxonomyFilterCount}
                </span>
              ) : null}
            </button>
            <div
              aria-hidden={isCompactFilterMode}
              inert={isCompactFilterMode ? true : undefined}
              className={cn(
                "flex shrink-0 items-center gap-1.5 transition-opacity duration-300 ease-out lg:gap-2",
                isCompactFilterMode
                  ? "!hidden pointer-events-none opacity-0"
                  : "opacity-100",
              )}
            >
              <ProductTaxonomyFilterCombobox
                emptyText="조건을 바꾸면 카테고리를 찾을 수 있어요."
                getLabel={(c) => c.categoryName}
                itemKindLabel="카테고리"
                items={categories}
                selectedIds={categoryFilterIds}
                size="desktop"
                tone="blue"
                onCreateClick={() => setTaxonomyDialog({ kind: "category" })}
                onSelectedIdsChange={(ids) => {
                  setCategoryFilterIds(ids);
                  setPage(1);
                }}
              />
              <ProductTaxonomyFilterCombobox
                emptyText="조건을 바꾸면 상태를 찾을 수 있어요."
                getLabel={(s) => s.statusName}
                itemKindLabel="상태"
                items={statuses}
                selectedIds={statusFilterIds}
                size="desktop"
                tone="blue"
                onCreateClick={() => setTaxonomyDialog({ kind: "status" })}
                onSelectedIdsChange={(ids) => {
                  setStatusFilterIds(ids);
                  setPage(1);
                }}
              />
            </div>
          </div>
          <ListFilterSelect
            active={sort !== "createdAtDesc"}
            ariaLabel="정렬 조건"
            className={
              isCompactFilterMode
                ? "w-[104px]"
                : "w-[clamp(136px,14vw,178px)]"
            }
            onChange={(nextSort) => {
              setSort(nextSort);
              setPage(1);
            }}
            options={PRODUCT_SORT_OPTIONS}
            value={sort}
          />
        </div>
        <span className="ml-2 shrink-0 text-[12px] text-[#9CA3AF]">
          {isExporting ? "내보내는 중..." : `${totalCount}개`}
        </span>
      </div>
      {isCompactFilterMode && isCompactFilterOpen ? (
        <div
          ref={compactFilterPopoverRef}
          className={cn(
            "fixed z-50 rounded-lg border border-[#E6EAF0] bg-white p-3 shadow-lg",
            !compactFilterPosition && "invisible",
          )}
          style={{
            left: compactFilterPosition?.left ?? 0,
            top: compactFilterPosition?.top ?? 0,
            width: compactFilterPosition?.width ?? 320,
          }}
        >
          <div className="grid gap-3">
            <div className="grid gap-1.5">
              <p className="text-[12px] font-semibold text-[#64748B]">
                카테고리
              </p>
              <ProductTaxonomyFilterCombobox
                emptyText="조건을 바꾸면 카테고리를 찾을 수 있어요."
                getLabel={(c) => c.categoryName}
                itemKindLabel="카테고리"
                items={categories}
                layout="full"
                selectedIds={categoryFilterIds}
                size="desktop"
                tone="blue"
                onCreateClick={() => setTaxonomyDialog({ kind: "category" })}
                onSelectedIdsChange={(ids) => {
                  setCategoryFilterIds(ids);
                  setPage(1);
                }}
              />
            </div>
            <div className="grid gap-1.5">
              <p className="text-[12px] font-semibold text-[#64748B]">상태</p>
              <ProductTaxonomyFilterCombobox
                emptyText="조건을 바꾸면 상태를 찾을 수 있어요."
                getLabel={(s) => s.statusName}
                itemKindLabel="상태"
                items={statuses}
                layout="full"
                selectedIds={statusFilterIds}
                size="desktop"
                tone="blue"
                onCreateClick={() => setTaxonomyDialog({ kind: "status" })}
                onSelectedIdsChange={(ids) => {
                  setStatusFilterIds(ids);
                  setPage(1);
                }}
              />
            </div>
          </div>
        </div>
      ) : null}

      {/* 테이블 (데스크톱) */}
      <div
        className={cn(
          "hidden min-h-0 flex-1 gap-3 overflow-hidden px-5 pb-3 pt-1 md:flex xl:gap-5",
          isCreatePanelResizing && "cursor-col-resize select-none",
        )}
      >
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          {notice ? (
            <Toast
              description={noticeDescription ?? undefined}
              message={notice}
              onClose={() => {
                setNotice(null);
                setNoticeDescription(null);
              }}
              variant="success"
            />
          ) : null}

          {productsQuery.isError ? (
            <p className="rounded-md border border-destructive/30 bg-red-50 px-3 py-2 text-sm text-destructive">
              {getApiErrorMessage(productsQuery.error)}
            </p>
          ) : null}

          <div className="flex w-full min-w-0 flex-col overflow-hidden rounded-lg border border-[#E2E5EC] bg-white shadow-sm">
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
                actionLabel="제품 생성"
                icon={Package}
                onAction={openCreatePanel}
                title={
                  hasFilters
                    ? "조건을 바꾸면 제품을 찾을 수 있어요"
                    : "데이터가 존재하지 않아요"
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

        {isDockedCreateMounted ? (
          <ProductCreateDialog
            mode="docked"
            onExpand={onCreateExpand}
            onCreated={onProductCreated}
            onOpenChange={onCreateOpenChange}
            onResizeStart={() => setIsCreatePanelResizing(true)}
            open={isDockedCreateOpen}
            width={createPanelWidth}
          />
        ) : null}
      </div>

      {/* 모바일 뷰 */}
      <section className="flex min-h-0 flex-1 flex-col md:hidden">
        {/* 모바일 필터 칩 행 */}
        <div className="flex h-10 shrink-0 items-center gap-2 overflow-x-auto border-b border-[#E5E7EB] px-4">
          <button
            aria-label="초기화"
            className={cn(
              "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[12px] font-bold transition focus:outline-none",
              hasFilters
                ? "border-transparent bg-[#4880EE] text-white hover:bg-[#4880EE]"
                : "border-[#E5E7EB] bg-[#F3F4F6] text-[#4B5563] hover:border-[#D1D5DB]",
            )}
            onClick={() => {
              setSearch("");
              setSearchText("");
              setCategoryFilterIds([]);
              setStatusFilterIds([]);
              setSort("createdAtDesc");
              setPage(1);
            }}
            type="button"
          >
            <RotateCcw className="h-3 w-3" />
          </button>
          <ProductTaxonomyFilterCombobox
            emptyText="조건을 바꾸면 카테고리를 찾을 수 있어요."
            getLabel={(c) => c.categoryName}
            itemKindLabel="카테고리"
            items={categories}
            selectedIds={categoryFilterIds}
            size="mobile"
            tone="blue"
            onCreateClick={() => setTaxonomyDialog({ kind: "category" })}
            onSelectedIdsChange={(ids) => {
              setCategoryFilterIds(ids);
              setPage(1);
            }}
          />
          <ProductTaxonomyFilterCombobox
            emptyText="조건을 바꾸면 상태를 찾을 수 있어요."
            getLabel={(s) => s.statusName}
            itemKindLabel="상태"
            items={statuses}
            selectedIds={statusFilterIds}
            size="mobile"
            tone="blue"
            onCreateClick={() => setTaxonomyDialog({ kind: "status" })}
            onSelectedIdsChange={(ids) => {
              setStatusFilterIds(ids);
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
              description={noticeDescription ?? undefined}
              message={notice}
              onClose={() => {
                setNotice(null);
                setNoticeDescription(null);
              }}
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
              actionLabel="제품 생성"
              icon={Package}
              onAction={openCreatePanel}
              title={
                hasFilters
                  ? "조건을 바꾸면 제품을 찾을 수 있어요"
                  : "데이터가 존재하지 않아요"
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
          aria-label="제품 생성"
          className="fixed bottom-24 right-5 flex h-8 w-8 items-center justify-center rounded-full bg-[#4880EE] shadow-[0_4px_16px_rgba(59,130,246,0.27)] transition active:opacity-80"
          onClick={openCreatePanel}
          type="button"
        >
          <Plus className="h-4 w-4 text-white" strokeWidth={2.5} />
        </button>
      </section>

      <div className="lg:hidden">
        <ProductCreateDialog
          mode="overlay"
          onExpand={onCreateExpand}
          onCreated={onProductCreated}
          onOpenChange={onCreateOpenChange}
          open={isCreateOpen && !isDockedViewport}
        />
      </div>
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
      onClick={() => void navigate(`/app/products/${product.id}`)}
      type="button"
    >
      {/* 아이콘 */}
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#EEF4FF]">
        <Package className="h-4 w-4 text-[#4880EE]" strokeWidth={2} />
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
      onClick={() => void navigate(`/app/products/${product.id}`)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          void navigate(`/app/products/${product.id}`);
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
    indigo: "bg-[#EEF4FF] text-[#4880EE]",
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
      aria-label={label}
      className={cn(
        "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[6px] border text-[13px] font-bold transition focus:outline-none",
        active
          ? "border-transparent bg-[#4880EE] text-white hover:bg-[#4880EE]"
          : "border-[#E2E5EC] bg-white text-[#475569] hover:border-[#D1D5DB] hover:bg-[#F5F6F8]",
      )}
      onClick={onClick}
      type="button"
    >
      {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
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

type ProductTaxonomyFilterTone = "blue";

function ProductTaxonomyFilterCombobox<
  TItem extends ProductTaxonomyFilterItem,
>({
  emptyText,
  getLabel,
  itemKindLabel,
  items,
  layout = "compact",
  selectedIds,
  size,
  tone,
  onCreateClick,
  onSelectedIdsChange,
}: {
  readonly emptyText: string;
  readonly getLabel: (item: TItem) => string;
  readonly itemKindLabel: string;
  readonly items: readonly TItem[];
  readonly layout?: "compact" | "full";
  readonly selectedIds: readonly string[];
  readonly size: "desktop" | "mobile";
  readonly tone: ProductTaxonomyFilterTone;
  readonly onCreateClick: () => void;
  readonly onSelectedIdsChange: (ids: string[]) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [popoverPosition, setPopoverPosition] =
    useState<FieldFilterPopoverPosition | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const selectedItems = useMemo(
    () => items.filter((item) => selectedIdSet.has(item.id)),
    [items, selectedIdSet],
  );
  const selectedSummary = getSelectedTaxonomyFilterSummary(
    selectedItems,
    getLabel,
    itemKindLabel,
  );

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

  const toggleItem = (item: TItem) => {
    const nextIds = selectedIdSet.has(item.id)
      ? selectedIds.filter((id) => id !== item.id)
      : [...selectedIds, item.id];

    setSearch("");
    onSelectedIdsChange(nextIds);
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
    onSelectedIdsChange([]);
    inputRef.current?.focus();
    openOptions("");
  };

  return (
    <div
      ref={wrapperRef}
      className={cn(
        "relative shrink-0",
        layout === "full"
          ? "w-full"
          : isMobile
            ? "w-[120px]"
            : "w-[clamp(136px,14vw,178px)]",
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
                  "border-[#D1D5DB] bg-white text-[#111827]",
                  isMobile ? "pl-7 pr-7" : "pl-8 pr-7",
                )
              : selectedIds.length > 0
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
              toggleItem(firstItem);
            }
          }}
          placeholder={`${itemKindLabel} 선택`}
          value={inputValue}
        />
        {/* Right icon: × when selected/searching, ▾ when idle */}
        {selectedIds.length > 0 || search ? (
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
              selectedIds.length === 0
                ? "font-semibold text-[#1D4ED8]"
                : "font-medium text-[#475569]",
            )}
            onClick={() => {
              setSearch("");
              setIsOpen(false);
              onSelectedIdsChange([]);
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
                const isSelected = selectedIdSet.has(item.id);

                return (
                  <button
                    className={cn(
                      "flex h-8 w-full min-w-0 items-center gap-2 px-3 text-left text-[13px] transition hover:bg-[#F9FAFB]",
                      isSelected && getTaxonomyFilterItemSelectedClass(tone),
                    )}
                    key={item.id}
                    onClick={() => toggleItem(item)}
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
            className="flex h-9 w-full items-center gap-1.5 px-3 text-left text-[12px] font-semibold text-[#4880EE] transition hover:bg-[#EFF6FF]"
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

function getCompactFilterPopoverPosition(
  trigger: HTMLButtonElement,
): FieldFilterPopoverPosition {
  const rect = trigger.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const margin = 16;
  const width = Math.min(320, Math.max(280, viewportWidth - margin * 2));
  const maxLeft = Math.max(margin, viewportWidth - width - margin);
  const left = Math.min(Math.max(rect.left, margin), maxLeft);

  return {
    left,
    top: rect.bottom + 6,
    width,
  };
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

function getSelectedTaxonomyFilterSummary<
  TItem extends ProductTaxonomyFilterItem,
>(
  selectedItems: readonly TItem[],
  getLabel: (item: TItem) => string,
  itemKindLabel: string,
) {
  if (selectedItems.length === 0) {
    return "";
  }

  if (selectedItems.length === 1) {
    const selectedItem = selectedItems[0];
    return selectedItem ? getLabel(selectedItem) : "";
  }

  return `${itemKindLabel} ${selectedItems.length}개`;
}

function getTaxonomyFilterInputSelectedClass(tone: ProductTaxonomyFilterTone) {
  switch (tone) {
    case "blue":
      return "border-[#E2E5EC] bg-[#EFF6FF] font-semibold text-[#1D4ED8]";
  }
}

function getTaxonomyFilterItemSelectedClass(tone: ProductTaxonomyFilterTone) {
  switch (tone) {
    case "blue":
      return "bg-[#EFF6FF] font-semibold text-[#1D4ED8]";
  }
}

function getTaxonomyFilterCheckBorderClass(tone: ProductTaxonomyFilterTone) {
  switch (tone) {
    case "blue":
      return "border-[#E2E5EC]";
  }
}

function getTaxonomyFilterCheckDotClass(tone: ProductTaxonomyFilterTone) {
  switch (tone) {
    case "blue":
      return "bg-[#4880EE]";
  }
}

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQueryList = window.matchMedia(query);
    const onChange = () => setMatches(mediaQueryList.matches);

    onChange();
    mediaQueryList.addEventListener("change", onChange);

    return () => {
      mediaQueryList.removeEventListener("change", onChange);
    };
  }, [query]);

  return matches;
}

function getStoredProductCreatePanelWidth() {
  if (typeof window === "undefined") {
    return PRODUCT_CREATE_PANEL_DEFAULT_WIDTH;
  }

  const storedWidth = Number(
    window.localStorage.getItem(PRODUCT_CREATE_PANEL_STORAGE_KEY),
  );

  return clampProductCreatePanelWidth(storedWidth, window.innerWidth);
}

function clampProductCreatePanelWidth(width: number, viewportWidth?: number) {
  const fallbackWidth = Number.isFinite(width)
    ? width
    : PRODUCT_CREATE_PANEL_DEFAULT_WIDTH;
  const maxWidth = getProductCreatePanelMaxWidth(viewportWidth);

  return Math.min(
    Math.max(fallbackWidth, PRODUCT_CREATE_PANEL_MIN_WIDTH),
    maxWidth,
  );
}

function getProductCreatePanelMaxWidth(viewportWidth?: number) {
  if (!viewportWidth || viewportWidth <= 0) {
    return PRODUCT_CREATE_PANEL_DEFAULT_WIDTH;
  }

  return Math.max(
    PRODUCT_CREATE_PANEL_MIN_WIDTH,
    Math.floor(viewportWidth * PRODUCT_CREATE_PANEL_MAX_RATIO),
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
    return "rose" as const;
  }
  if (statusName.includes("판매") || statusName.includes("활성")) {
    return "green" as const;
  }
  return "slate" as const;
}

function addUniqueId(ids: readonly string[], id: string) {
  return ids.includes(id) ? [...ids] : [...ids, id];
}

function normalizeFilterText(value: string) {
  return value.trim().toLowerCase();
}
