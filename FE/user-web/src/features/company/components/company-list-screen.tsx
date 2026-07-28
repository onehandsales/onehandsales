import {
  Activity,
  ArrowUpDown,
  BriefcaseBusiness,
  Building2,
  ChevronDown,
  Download,
  MapPin,
  Plus,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Tags,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import {
  type FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { PageHeader } from "@/components/layout/page-header";
import { useLocation, useNavigate, useOutletContext } from "react-router-dom";
import { FilterPopoverSearchHeader } from "@/components/ui/filter-popover-search-header";
import {
  LIST_TABLE_HEADER_ROW_CLASS_NAME,
  LIST_TABLE_ROW_CLASS_NAME,
  ListTableHeaderCell,
} from "@/components/ui/list-table-header-cell";
import { ListFilterSelect } from "@/components/ui/list-filter-select";
import { Pagination } from "@/components/ui/pagination";
import { ListEmptyState } from "@/components/ui/state";
import { Toast } from "@/components/ui/toast";
import { useAuthSession } from "@/features/auth";
import {
  useAppI18n,
  type AppI18nKey,
  type AppLocale,
} from "@/features/app-i18n";
import { CompanyCreateDialog } from "@/features/company/components/company-create-dialog";
import { CompanyTaxonomyCreateDialog } from "@/features/company/components/company-taxonomy-create-dialog";
import {
  useCompanyFields,
  useCompanyList,
  useCompanyRegions,
} from "@/features/company/hooks/use-company-list";
import { useExportCompaniesMutation } from "@/features/company/hooks/use-company-mutations";
import type {
  CompanyCreateFormValues,
} from "@/features/company/schemas/company-schema";
import type {
  CompanyListItem,
  CompanySort,
} from "@/features/company/types/company";
import { formatCompanyRegionLabel } from "@/features/company/utils/company-region-options";
import { getApiErrorMessage, type ApiBlobResponse } from "@/lib/api-client";
import { cn } from "@/utils/cn";
import { formatDateWithOptions } from "@/utils/format";
import {
  readLocationNotice,
  readLocationNoticeDescription,
} from "@/utils/location-state";
import type { AppShellOutletContext } from "@/components/layout/app-shell";
import {
  useResizableTableColumns,
  type ResizableTableColumn,
} from "@/hooks/use-resizable-table-columns";

type CompanyListScreenProps = {
  readonly initialCreateOpen?: boolean;
  readonly onCreateDialogClose?: () => void;
};

const COMPANY_SORT_OPTIONS: Array<{
  readonly value: CompanySort;
  readonly labelKey: AppI18nKey;
}> = [
  { value: "createdAtDesc", labelKey: "companyList.sortCreatedAtDesc" },
  { value: "contactCountDesc", labelKey: "companyList.sortContactCountDesc" },
  { value: "contactCountAsc", labelKey: "companyList.sortContactCountAsc" },
  { value: "dealCountDesc", labelKey: "companyList.sortDealCountDesc" },
  { value: "dealCountAsc", labelKey: "companyList.sortDealCountAsc" },
];

const COMPANY_TABLE_COLUMNS = [
  { id: "companyName", defaultWidth: 220, minWidth: 165, maxWidth: 420 },
  { id: "field", defaultWidth: 150, minWidth: 115 },
  { id: "region", defaultWidth: 150, minWidth: 115 },
  { id: "contactCount", defaultWidth: 120, minWidth: 95 },
  { id: "dealCount", defaultWidth: 110, minWidth: 95 },
  { id: "createdAt", defaultWidth: 130, minWidth: 115 },
] satisfies readonly ResizableTableColumn[];
const COMPANY_TABLE_COLUMNS_STORAGE_KEY = "onehand.table.companies.columns";
const COMPANY_LIST_TABLE_ROW_CLASS_NAME = cn(
  LIST_TABLE_ROW_CLASS_NAME,
  "h-12",
);
const COMPANY_CREATE_PANEL_STORAGE_KEY = "onehand.company.createPanelWidth";
const COMPANY_CREATE_PANEL_DEFAULT_WIDTH = 520;
const COMPANY_CREATE_PANEL_MIN_WIDTH = 420;
const COMPANY_CREATE_PANEL_MAX_RATIO = 0.55;
const COMPANY_CREATE_PANEL_AUTO_SIDEBAR_RATIO = 0.45;
const COMPANY_CREATE_PANEL_TRANSITION_MS = 500;
const DESKTOP_SEARCH_COLLAPSED_WIDTH = 72;
const DESKTOP_SEARCH_MIN_WIDTH = 150;
const DESKTOP_SEARCH_MAX_WIDTH = 170;
const DESKTOP_SEARCH_COMPACT_MAX_WIDTH = 170;
const DESKTOP_SEARCH_VIEWPORT_RATIO = 0.2;
const DESKTOP_FILTER_COLLAPSED_WIDTH = 72;

export function CompanyListScreen({
  initialCreateOpen = false,
  onCreateDialogClose,
}: CompanyListScreenProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const outletContext =
    useOutletContext<AppShellOutletContext | undefined>();
  const { user } = useAuthSession();
  const { locale, t } = useAppI18n();
  const isDockedViewport = useMediaQuery("(min-width: 1024px)");
  const [companyNameText, setCompanyNameText] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [isDesktopSearchOpen, setIsDesktopSearchOpen] = useState(false);
  const [desktopSearchExpandedWidth, setDesktopSearchExpandedWidth] = useState(
    getDesktopSearchExpandedWidth,
  );
  const [companyFieldIds, setCompanyFieldIds] = useState<string[]>([]);
  const [companyRegionIds, setCompanyRegionIds] = useState<string[]>([]);
  const [sort, setSort] = useState<CompanySort>("createdAtDesc");
  const [page, setPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDockedCreateRendered, setIsDockedCreateRendered] = useState(false);
  const [createPanelWidth, setCreatePanelWidth] = useState(
    getStoredCompanyCreatePanelWidth,
  );
  const [isCreatePanelResizing, setIsCreatePanelResizing] = useState(false);
  const [isCompactFilterOpen, setIsCompactFilterOpen] = useState(false);
  const [compactFilterPosition, setCompactFilterPosition] =
    useState<FieldFilterPopoverPosition | null>(null);
  const [taxonomyDialog, setTaxonomyDialog] = useState<{
    readonly kind: "field" | "region";
  } | null>(null);
  const [pendingFieldName, setPendingFieldName] = useState("");
  const [pendingRegionName, setPendingRegionName] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [noticeDescription, setNoticeDescription] = useState<string | null>(null);
  const desktopSearchFormRef = useRef<HTMLFormElement>(null);
  const desktopSearchInputRef = useRef<HTMLInputElement>(null);
  const compactFilterButtonRef = useRef<HTMLButtonElement>(null);
  const compactFilterPopoverRef = useRef<HTMLDivElement>(null);
  const setAutoSidebarCollapsed = outletContext?.setAutoSidebarCollapsed;
  const { getHeaderCellResizeProps, tableContainerRef, tableContainerStyle } =
    useResizableTableColumns({
      allowHorizontalOverflow: true,
      columns: COMPANY_TABLE_COLUMNS,
      storageKey: COMPANY_TABLE_COLUMNS_STORAGE_KEY,
    });

  const listParams = useMemo(
    () => ({
      page,
      companyName: companyName || undefined,
      companyFieldIds:
        companyFieldIds.length > 0 ? companyFieldIds : undefined,
      companyRegionIds:
        companyRegionIds.length > 0 ? companyRegionIds : undefined,
      sort,
    }),
    [companyFieldIds, companyName, companyRegionIds, page, sort],
  );
  const exportFilters = useMemo(
    () => ({
      companyName: companyName || undefined,
      companyFieldIds:
        companyFieldIds.length > 0 ? companyFieldIds : undefined,
      companyRegionIds:
        companyRegionIds.length > 0 ? companyRegionIds : undefined,
      sort,
    }),
    [companyFieldIds, companyName, companyRegionIds, sort],
  );

  const companiesQuery = useCompanyList(listParams);
  const fieldsQuery = useCompanyFields();
  const regionsQuery = useCompanyRegions();
  const exportCompaniesMutation = useExportCompaniesMutation();

  useEffect(() => {
    const message = readLocationNotice(location.state);
    if (!message) {
      return;
    }

    setNotice(message);
    setNoticeDescription(readLocationNoticeDescription(location.state));
    void navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate]);

  const fields = useMemo(
    () => fieldsQuery.data?.items ?? [],
    [fieldsQuery.data],
  );
  const regions = useMemo(
    () => regionsQuery.data?.items ?? [],
    [regionsQuery.data],
  );
  const sortOptions = useMemo(
    () =>
      COMPANY_SORT_OPTIONS.map((option) => ({
        value: option.value,
        label: t(option.labelKey),
      })),
    [t],
  );
  const companyList = companiesQuery.data;
  const displayTimeZone = user?.timeZone ?? getBrowserTimeZoneFallback();
  const isDockedCreateOpen = isCreateOpen && isDockedViewport;
  const isDockedCreateMounted = isDockedCreateOpen || isDockedCreateRendered;
  const isCompactFilterMode = isDockedCreateOpen;
  const hasTaxonomyFilters =
    companyFieldIds.length > 0 || companyRegionIds.length > 0;
  const taxonomyFilterCount = companyFieldIds.length + companyRegionIds.length;
  const hasSearch =
    companyName.length > 0 ||
    companyFieldIds.length > 0 ||
    companyRegionIds.length > 0 ||
    sort !== "createdAtDesc";

  useEffect(() => {
    if (!initialCreateOpen) {
      return;
    }

    setCreatePanelWidth(COMPANY_CREATE_PANEL_MIN_WIDTH);
    setIsCreateOpen(true);
  }, [initialCreateOpen]);

  useEffect(() => {
    if (!isDesktopSearchOpen) {
      return;
    }

    const animationFrameId = window.requestAnimationFrame(() => {
      desktopSearchInputRef.current?.focus();
    });

    return () => window.cancelAnimationFrame(animationFrameId);
  }, [isDesktopSearchOpen]);

  useEffect(() => {
    if (companyName || companyNameText) {
      setIsDesktopSearchOpen(true);
    }
  }, [companyName, companyNameText]);

  useEffect(() => {
    const syncDesktopSearchWidth = () => {
      setDesktopSearchExpandedWidth(getDesktopSearchExpandedWidth());
    };

    syncDesktopSearchWidth();
    window.addEventListener("resize", syncDesktopSearchWidth);

    return () => {
      window.removeEventListener("resize", syncDesktopSearchWidth);
    };
  }, []);

  useEffect(() => {
    if (isDockedCreateOpen) {
      setIsDockedCreateRendered(true);
      return;
    }

    const timerId = window.setTimeout(() => {
      setIsDockedCreateRendered(false);
    }, COMPANY_CREATE_PANEL_TRANSITION_MS);

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
      COMPANY_CREATE_PANEL_STORAGE_KEY,
      String(createPanelWidth),
    );
  }, [createPanelWidth]);

  useEffect(() => {
    const clampToViewport = () => {
      setCreatePanelWidth((currentWidth) =>
        clampCompanyCreatePanelWidth(
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
          COMPANY_CREATE_PANEL_AUTO_SIDEBAR_RATIO;

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
        clampCompanyCreatePanelWidth(
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
    if (!pendingFieldName) return;
    const matched = fields.find((f) => f.field === pendingFieldName);
    if (matched) {
      setCompanyFieldIds((prev) => addUniqueId(prev, matched.id));
      setPage(1);
      setPendingFieldName("");
    }
  }, [fields, pendingFieldName]);

  useEffect(() => {
    if (!pendingRegionName) return;
    const matched = regions.find((r) => r.region === pendingRegionName);
    if (matched) {
      setCompanyRegionIds((prev) => addUniqueId(prev, matched.id));
      setPage(1);
      setPendingRegionName("");
    }
  }, [regions, pendingRegionName]);

  useEffect(() => {
    const validFieldIds = new Set(fields.map((field) => field.id));
    const nextIds = companyFieldIds.filter((id) => validFieldIds.has(id));

    if (nextIds.length !== companyFieldIds.length) {
      setCompanyFieldIds(nextIds);
      setPage(1);
    }
  }, [companyFieldIds, fields]);

  useEffect(() => {
    const validRegionIds = new Set(regions.map((region) => region.id));
    const nextIds = companyRegionIds.filter((id) => validRegionIds.has(id));

    if (nextIds.length !== companyRegionIds.length) {
      setCompanyRegionIds(nextIds);
      setPage(1);
    }
  }, [companyRegionIds, regions]);

  const submitDesktopSearch = () => {
    const nextCompanyName = companyNameText.trim();

    setCompanyName(nextCompanyName);
    if (!nextCompanyName) {
      setIsDesktopSearchOpen(false);
    }
    setPage(1);
  };
  const onSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submitDesktopSearch();
  };

  const onExport = async () => {
    const file = await exportCompaniesMutation.mutateAsync(exportFilters);
    downloadBlobFile(file, "companies.xlsx");
  };
  const onCreateOpenChange = (open: boolean) => {
    setIsCreateOpen(open);

    if (!open) {
      onCreateDialogClose?.();
    }
  };
  const openCreatePanel = () => {
    setCreatePanelWidth(COMPANY_CREATE_PANEL_MIN_WIDTH);
    setIsCreateOpen(true);
  };
  const onCreateExpand = (values: CompanyCreateFormValues) => {
    void navigate("/app/companies/new/full", {
      state: { companyCreateDraft: values },
    });
  };
  const onCompanyCreated = () => setNotice(t("companyList.createdNotice"));

  return (
    <section
      className="flex min-h-full flex-col bg-white transition-[padding-right] duration-500 ease-out"
      style={
        isDockedCreateMounted
          ? { paddingRight: isDockedCreateOpen ? createPanelWidth : 0 }
          : undefined
      }
    >
      <PageHeader
        breadcrumbs={[{ label: t("navigation.companies"), icon: Building2 }]}
        actions={[
          {
            icon: Download,
            tooltip: t("importExport.excelDownload"),
            onClick: () => void onExport(),
            disabled: exportCompaniesMutation.isPending,
          },
          {
            icon: Plus,
            tooltip: t("companyList.createCompany"),
            onClick: openCreatePanel,
            disabled: fieldsQuery.isLoading || regionsQuery.isLoading,
            hidden: isDockedCreateMounted,
            variant: "primary",
          },
        ]}
      />

      {/* 검색 + 필터 툴바 (데스크톱) */}
      <div className="hidden min-h-10 shrink-0 items-center px-5 py-1 lg:flex">
        <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto [scrollbar-width:none] lg:gap-2 [&::-webkit-scrollbar]:hidden">
        <form
          ref={desktopSearchFormRef}
          className={cn(
            "flex h-8 shrink-0 items-center overflow-hidden rounded-md bg-transparent transition-[width,background-color,padding] duration-500 ease-out focus-within:bg-[#F3F4F6]",
            isDesktopSearchOpen ? "pr-3" : "pr-0",
            isDesktopSearchOpen
              ? "hover:bg-[#F3F4F6]"
              : "hover:bg-[#F3F4F6]",
          )}
          onBlur={(event) => {
            const nextTarget = event.relatedTarget;

            if (
              nextTarget instanceof Node &&
              event.currentTarget.contains(nextTarget)
            ) {
              return;
            }

            if (!companyNameText.trim() && !companyName) {
              setIsDesktopSearchOpen(false);
            }
          }}
          onSubmit={onSearchSubmit}
          style={{
            width: isDesktopSearchOpen
              ? isCompactFilterMode
                ? Math.min(
                    desktopSearchExpandedWidth,
                    DESKTOP_SEARCH_COMPACT_MAX_WIDTH,
                  )
                : desktopSearchExpandedWidth
              : DESKTOP_SEARCH_COLLAPSED_WIDTH,
          }}
        >
          <button
            aria-expanded={isDesktopSearchOpen}
            aria-label={
              isDesktopSearchOpen
                ? t("companyList.searchSubmit")
                : t("companyList.searchOpen")
            }
            className={cn(
              "inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-md px-2 text-[13px] font-semibold text-[#5F6368] transition-[background-color,color,transform] duration-150 hover:text-[#374151] active:scale-[0.97]",
              isDesktopSearchOpen ? "w-8 px-0" : "w-full",
            )}
            onClick={() => {
              if (!isDesktopSearchOpen) {
                setIsDesktopSearchOpen(true);
                return;
              }

              submitDesktopSearch();
            }}
            type="button"
          >
            <Search className="h-3.5 w-3.5" />
            {isDesktopSearchOpen ? null : <span>{t("companyList.search")}</span>}
          </button>
          <input
            ref={desktopSearchInputRef}
            aria-hidden={!isDesktopSearchOpen}
            className={cn(
              "min-w-0 flex-1 bg-transparent text-[13px] text-[#111827] outline-none transition-opacity duration-300 placeholder:text-[#9CA3AF]",
              isDesktopSearchOpen ? "opacity-100" : "opacity-0",
            )}
            onChange={(e) => setCompanyNameText(e.target.value)}
            placeholder={t("companyList.searchPlaceholder")}
            tabIndex={isDesktopSearchOpen ? 0 : -1}
            value={companyNameText}
          />
        </form>
        <div
          className="relative flex h-8 shrink-0 items-center overflow-hidden transition-[width] duration-500 ease-out"
          style={{
            width: isCompactFilterMode ? DESKTOP_FILTER_COLLAPSED_WIDTH : undefined,
          }}
        >
          <button
            ref={compactFilterButtonRef}
            aria-expanded={isCompactFilterOpen}
            aria-label={t("companyList.filter")}
            aria-hidden={!isCompactFilterMode}
	            className={cn(
	              "absolute left-0 top-0 inline-flex h-8 w-[72px] shrink-0 items-center justify-center gap-1.5 rounded-md border-0 bg-transparent px-2 text-[13px] font-semibold transition-[opacity,transform,background-color,color] duration-150 focus:outline-none active:scale-[0.97]",
	              isCompactFilterOpen
	                ? "bg-[#F3F4F6] text-[#374151]"
	                : hasTaxonomyFilters
	                  ? "text-[#1D4ED8] hover:bg-[#EFF6FF]"
	                  : "text-[#5F6368] hover:bg-[#F3F4F6]",
              isCompactFilterMode
                ? "scale-100 opacity-100"
                : "!hidden pointer-events-none scale-95 opacity-0",
            )}
            onClick={() => setIsCompactFilterOpen((open) => !open)}
            tabIndex={isCompactFilterMode ? 0 : -1}
            type="button"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>{t("companyList.filter")}</span>
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
            <CompanyTaxonomyFilterCombobox
              emptyText={t("companyList.fieldEmpty")}
              getLabel={(field) => field.field}
              icon={Tags}
              itemKindLabel={t("companyList.field")}
              items={fields}
              selectedIds={companyFieldIds}
              size="desktop"
              tone="blue"
              onCreateClick={() => setTaxonomyDialog({ kind: "field" })}
              onSelectedIdsChange={(ids) => {
                setCompanyFieldIds(ids);
                setPage(1);
              }}
            />
            <CompanyTaxonomyFilterCombobox
              emptyText={t("companyList.regionEmpty")}
              getLabel={(region) => formatCompanyRegionLabel(region, locale)}
              icon={MapPin}
              itemKindLabel={t("companyList.region")}
              items={regions}
              selectedIds={companyRegionIds}
              size="desktop"
              tone="blue"
              onCreateClick={() => setTaxonomyDialog({ kind: "region" })}
              onSelectedIdsChange={(ids) => {
                setCompanyRegionIds(ids);
                setPage(1);
              }}
            />
          </div>
        </div>
        <ListFilterSelect
          active={sort !== "createdAtDesc"}
          ariaLabel={t("dealList.sortAria")}
          icon={ArrowUpDown}
          className={
            isCompactFilterMode
              ? "w-[104px]"
              : "w-[clamp(136px,14vw,178px)]"
          }
          onChange={(nextSort) => {
            setSort(nextSort);
            setPage(1);
          }}
          options={sortOptions}
          searchable={false}
          value={sort}
        />
        </div>
        <span className="ml-2 shrink-0 text-[12px] text-[#9CA3AF]">
          {t("companyList.countItems", {
            values: { count: companyList?.totalCount ?? 0 },
          })}
        </span>
        <FilterChip
          active={hasSearch}
          icon={RotateCcw}
          label={t("common.reset")}
          onClick={() => {
            setCompanyName("");
            setCompanyNameText("");
            setIsDesktopSearchOpen(false);
            setCompanyFieldIds([]);
            setCompanyRegionIds([]);
            setSort("createdAtDesc");
            setPage(1);
          }}
        />
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
                {t("companyList.field")}
              </p>
              <CompanyTaxonomyFilterCombobox
                emptyText={t("companyList.fieldEmpty")}
                getLabel={(field) => field.field}
                icon={Tags}
                itemKindLabel={t("companyList.field")}
                items={fields}
                layout="full"
                selectedIds={companyFieldIds}
                size="desktop"
                tone="blue"
                onCreateClick={() => setTaxonomyDialog({ kind: "field" })}
                onSelectedIdsChange={(ids) => {
                  setCompanyFieldIds(ids);
                  setPage(1);
                }}
              />
            </div>
            <div className="grid gap-1.5">
              <p className="text-[12px] font-semibold text-[#64748B]">
                {t("companyList.region")}
              </p>
              <CompanyTaxonomyFilterCombobox
                emptyText={t("companyList.regionEmpty")}
                getLabel={(region) => formatCompanyRegionLabel(region, locale)}
                icon={MapPin}
                itemKindLabel={t("companyList.region")}
                items={regions}
                layout="full"
                selectedIds={companyRegionIds}
                size="desktop"
                tone="blue"
                onCreateClick={() => setTaxonomyDialog({ kind: "region" })}
                onSelectedIdsChange={(ids) => {
                  setCompanyRegionIds(ids);
                  setPage(1);
                }}
              />
            </div>
          </div>
        </div>
      ) : null}

      {/* 알림 */}
      {notice || exportCompaniesMutation.error ? (
        <div className="hidden px-5 pt-2 lg:block">
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
          {exportCompaniesMutation.error ? (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-600">
              {getApiErrorMessage(exportCompaniesMutation.error)}
            </p>
          ) : null}
        </div>
      ) : null}

      {/* 테이블 (데스크톱) */}
      <div
        className={cn(
          "hidden min-h-0 flex-1 gap-3 overflow-hidden px-5 pb-3 pt-1 lg:flex xl:gap-4",
          isCreatePanelResizing && "cursor-col-resize select-none",
        )}
      >
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <div
            className="flex min-h-0 w-full min-w-0 flex-col overflow-x-auto overflow-y-hidden bg-white"
            ref={tableContainerRef}
            style={tableContainerStyle}
          >
            <div className={LIST_TABLE_HEADER_ROW_CLASS_NAME}>
                <ListTableHeaderCell
                  icon={Building2}
                  {...getHeaderCellResizeProps("companyName", 0)}
                >
                  {t("companyList.name")}
                </ListTableHeaderCell>
                <ListTableHeaderCell
                  icon={Tags}
                  {...getHeaderCellResizeProps("field", 1)}
                >
                  {t("companyList.field")}
                </ListTableHeaderCell>
                <ListTableHeaderCell
                  icon={MapPin}
                  {...getHeaderCellResizeProps("region", 2)}
                >
                  {t("companyList.region")}
                </ListTableHeaderCell>
                <ListTableHeaderCell
                  icon={UsersRound}
                  {...getHeaderCellResizeProps("contactCount", 3)}
                >
                  {t("companyList.contactCount")}
                </ListTableHeaderCell>
                <ListTableHeaderCell
                  icon={BriefcaseBusiness}
                  {...getHeaderCellResizeProps("dealCount", 4)}
                >
                  {t("companyList.dealCount")}
                </ListTableHeaderCell>
                <ListTableHeaderCell
                  icon={Activity}
                  {...getHeaderCellResizeProps("createdAt", 5)}
                >
                  {t("companyList.activity")}
                </ListTableHeaderCell>
            </div>

            {companiesQuery.isLoading ? (
              <CompanyListSkeleton />
            ) : companiesQuery.isError ? (
              <CompanyListError
                error={companiesQuery.error}
                onRetry={() => void companiesQuery.refetch()}
              />
            ) : !companyList || companyList.items.length === 0 ? (
              <ListEmptyState
                actionIcon={Plus}
                actionLabel={t("companyList.createCompany")}
                icon={Building2}
                onAction={openCreatePanel}
                title={
                  hasSearch
                    ? t("companyList.emptyFiltered")
                    : t("companyList.dataEmpty")
                }
              />
            ) : (
              <div className="min-w-0">
                {companyList.items.map((company) => (
                  <CompanyRow
                    company={company}
                    displayTimeZone={displayTimeZone}
                    key={company.id}
                    locale={locale}
                  />
                ))}
              </div>
            )}
          </div>

          {companyList ? (
            <Pagination
              page={companyList.page}
              totalPages={companyList.totalPages}
              onPageChange={setPage}
            />
          ) : null}
        </div>

        {isDockedCreateMounted ? (
          <CompanyCreateDialog
            fields={fields}
            isFieldsLoading={fieldsQuery.isLoading}
            isRegionsLoading={regionsQuery.isLoading}
            mode="docked"
            onExpand={onCreateExpand}
            onCreated={onCompanyCreated}
            onOpenChange={onCreateOpenChange}
            onResizeStart={() => setIsCreatePanelResizing(true)}
            open={isDockedCreateOpen}
            regions={regions}
            width={createPanelWidth}
          />
        ) : null}
      </div>

      {/* 모바일 뷰 */}
      <section className="flex min-h-0 flex-1 flex-col lg:hidden">
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

        {/* 모바일 필터 칩 행 */}
        <div className="flex h-10 shrink-0 items-center gap-2 overflow-x-auto border-b border-[#E5E7EB] px-4">
          <CompanyTaxonomyFilterCombobox
              emptyText={t("companyList.fieldEmpty")}
            getLabel={(field) => field.field}
            icon={Tags}
            itemKindLabel={t("companyList.field")}
            items={fields}
            selectedIds={companyFieldIds}
            size="mobile"
            tone="blue"
            onCreateClick={() => setTaxonomyDialog({ kind: "field" })}
            onSelectedIdsChange={(ids) => {
              setCompanyFieldIds(ids);
              setPage(1);
            }}
          />
          <CompanyTaxonomyFilterCombobox
              emptyText={t("companyList.regionEmpty")}
            getLabel={(region) => formatCompanyRegionLabel(region, locale)}
            icon={MapPin}
            itemKindLabel={t("companyList.region")}
            items={regions}
            selectedIds={companyRegionIds}
            size="mobile"
            tone="blue"
            onCreateClick={() => setTaxonomyDialog({ kind: "region" })}
            onSelectedIdsChange={(ids) => {
              setCompanyRegionIds(ids);
              setPage(1);
            }}
          />
          <div className="flex-1" />
          <span className="shrink-0 text-[11px] text-[#9CA3AF]">
            {t("companyList.countItems", {
              values: { count: companyList?.totalCount ?? 0 },
            })}
          </span>
          <button
            aria-label={t("common.reset")}
            className={cn(
              "inline-flex h-7 shrink-0 items-center justify-center gap-1 rounded-md border-0 bg-transparent px-2 text-[12px] font-semibold transition-[background-color,color,transform] duration-150 focus:outline-none active:scale-[0.97]",
              hasSearch
                ? "text-[#1D4ED8] hover:bg-[#EFF6FF]"
                : "text-[#5F6368] hover:bg-[#F3F4F6]",
            )}
            onClick={() => {
              setCompanyName("");
              setCompanyNameText("");
              setIsDesktopSearchOpen(false);
              setCompanyFieldIds([]);
              setCompanyRegionIds([]);
              setSort("createdAtDesc");
              setPage(1);
            }}
            type="button"
          >
            <RotateCcw className="h-3 w-3" />
            <span>{t("common.reset")}</span>
          </button>
        </div>

        {/* 모바일 카드 목록 */}
        <div className="bg-white">
          {companiesQuery.isLoading ? (
            <div className="space-y-0">
              {Array.from({ length: 8 }, (_, i) => (
                <div
                  key={i}
                  className="h-[80px] animate-pulse border-b border-[#E5E7EB] bg-[#F9FAFB]"
                />
              ))}
            </div>
          ) : companiesQuery.isError ? (
            <div className="flex flex-col items-center justify-center px-5 py-14 text-center">
              <p className="text-[13px] text-red-500">
                {getApiErrorMessage(companiesQuery.error)}
              </p>
              <button
                className="mt-3 inline-flex h-8 items-center rounded-md border border-[#E2E5EC] bg-white px-3 text-[12px] text-[#6B7280]"
                onClick={() => void companiesQuery.refetch()}
                type="button"
              >
                {t("common.retry")}
              </button>
            </div>
          ) : !companyList || companyList.items.length === 0 ? (
            <ListEmptyState
              actionIcon={Plus}
              actionLabel={t("companyList.createCompany")}
              icon={Building2}
              onAction={openCreatePanel}
              title={
                hasSearch
                  ? t("companyList.emptyFiltered")
                  : t("companyList.dataEmpty")
              }
            />
          ) : (
            companyList.items.map((company) => (
              <CompanyMobileCard
                key={company.id}
                company={company}
                displayTimeZone={displayTimeZone}
                locale={locale}
              />
            ))
          )}
        </div>

        {/* 모바일 페이지네이션 */}
        {companyList ? (
          <div className="shrink-0 border-t border-[#E5E7EB] bg-white px-4 py-2">
            <Pagination
              page={companyList.page}
              totalPages={companyList.totalPages}
              onPageChange={setPage}
            />
          </div>
        ) : null}

        {/* FAB */}
        <button
          aria-label={t("companyList.createCompany")}
          className="fixed bottom-24 right-5 flex h-8 w-8 items-center justify-center rounded-full bg-[#4880EE] shadow-[0_4px_16px_rgba(59,130,246,0.27)] transition active:opacity-80"
          onClick={openCreatePanel}
          type="button"
        >
          <Plus className="h-4 w-4 text-white" strokeWidth={2.5} />
        </button>
      </section>
      <div className="lg:hidden">
        <CompanyCreateDialog
          fields={fields}
          isFieldsLoading={fieldsQuery.isLoading}
          isRegionsLoading={regionsQuery.isLoading}
          mode="overlay"
          onExpand={onCreateExpand}
          onCreated={onCompanyCreated}
          onOpenChange={onCreateOpenChange}
          open={isCreateOpen && !isDockedViewport}
          regions={regions}
        />
      </div>
      <CompanyTaxonomyCreateDialog
        kind={taxonomyDialog?.kind ?? "field"}
        fields={fields}
        regions={regions}
        onCreated={(name) => {
          if (taxonomyDialog?.kind === "field") setPendingFieldName(name);
          else if (taxonomyDialog?.kind === "region")
            setPendingRegionName(name);
        }}
        onOpenChange={(isOpen) => {
          if (!isOpen) setTaxonomyDialog(null);
        }}
        open={taxonomyDialog !== null}
      />
    </section>
  );
}

function CompanyRow({
  company,
  displayTimeZone,
  locale,
}: {
  readonly company: CompanyListItem;
  readonly displayTimeZone: string;
  readonly locale: AppLocale;
}) {
  const navigate = useNavigate();
  const { t } = useAppI18n();
  const numberFormatter = useMemo(
    () => new Intl.NumberFormat(getIntlLocale(locale)),
    [locale],
  );
  const companyRegionLabel = formatCompanyRegionLabel(
    company.companyRegion,
    locale
  );

  return (
    <div
      className={cn("group", COMPANY_LIST_TABLE_ROW_CLASS_NAME)}
      onClick={() => void navigate(`/app/companies/${company.id}`)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          void navigate(`/app/companies/${company.id}`);
        }
      }}
      role="button"
      tabIndex={0}
    >
      <div className="min-w-0">
        <span className="block truncate text-[13px] font-semibold text-[#111827]">
          {company.companyName}
        </span>
      </div>
      <div className="min-w-0">
        <span
          className="inline-flex h-5 max-w-full min-w-0 items-center overflow-hidden rounded-full bg-[#FFFBEB] px-2 text-[11px] font-medium text-[#B45309]"
          title={company.companyField.field}
        >
          <span className="min-w-0 truncate whitespace-nowrap">
            {company.companyField.field}
          </span>
        </span>
      </div>
      <div className="min-w-0">
        <span
          className="inline-flex h-5 max-w-full min-w-0 items-center overflow-hidden rounded-full bg-[#EFF6FF] px-2 text-[11px] font-medium text-[#4880EE]"
          title={companyRegionLabel}
        >
          <span className="min-w-0 truncate whitespace-nowrap">
            {companyRegionLabel}
          </span>
        </span>
      </div>
      <div className="min-w-0 truncate whitespace-nowrap text-[12px] font-medium text-[#475569]">
        {t("companyList.contactCountValue", {
          values: { count: numberFormatter.format(company.contactCount) },
        })}
      </div>
      <div className="min-w-0 truncate whitespace-nowrap text-[12px] font-medium text-[#475569]">
        {t("companyList.dealCountValue", {
          values: { count: numberFormatter.format(company.dealCount) },
        })}
      </div>
      <div
        className="min-w-0 truncate text-[12px] font-medium text-[#64748B]"
        title={formatCompanyCreatedActivity(
          company.createdAt,
          displayTimeZone,
          locale,
          t,
        )}
      >
        {formatCompanyCreatedActivity(
          company.createdAt,
          displayTimeZone,
          locale,
          t,
        )}
      </div>
    </div>
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
        "inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-md border-0 bg-transparent px-2 text-[13px] font-semibold transition-[background-color,color,transform] duration-150 focus:outline-none active:scale-[0.97]",
        active
          ? "text-[#1D4ED8] hover:bg-[#EFF6FF]"
          : "text-[#5F6368] hover:bg-[#F3F4F6]",
      )}
      onClick={onClick}
      type="button"
    >
      {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
      <span>{label}</span>
    </button>
  );
}

type FieldFilterPopoverPosition = {
  readonly left: number;
  readonly top: number;
  readonly width: number;
};

type CompanyTaxonomyFilterItem = {
  readonly id: string;
};

type CompanyTaxonomyFilterTone = "blue";

function CompanyTaxonomyFilterCombobox<
  TItem extends CompanyTaxonomyFilterItem,
>({
  emptyText,
  getLabel,
  icon: Icon,
  itemKindLabel,
  items,
  layout = "toolbar",
  selectedIds,
  size,
  tone,
  onCreateClick,
  onSelectedIdsChange,
}: {
  readonly emptyText: string;
  readonly getLabel: (item: TItem) => string;
  readonly icon: LucideIcon;
  readonly itemKindLabel: string;
  readonly items: readonly TItem[];
  readonly layout?: "full" | "toolbar";
  readonly selectedIds: readonly string[];
  readonly size: "desktop" | "mobile";
  readonly tone: CompanyTaxonomyFilterTone;
  readonly onCreateClick: () => void;
  readonly onSelectedIdsChange: (ids: string[]) => void;
}) {
  const { t } = useAppI18n();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [popoverPosition, setPopoverPosition] =
    useState<FieldFilterPopoverPosition | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const query = search.trim();
  const normalizedQuery = normalizeFilterText(query);
  const filteredItems =
    normalizedQuery.length > 0
      ? items.filter((item) =>
          normalizeFilterText(getLabel(item)).includes(normalizedQuery),
        )
      : items;
  const isMobile = size === "mobile";

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
      if (!triggerRef.current) {
        return;
      }

      setPopoverPosition(
        getFieldFilterPopoverPosition(triggerRef.current, isMobile),
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
    const focusFrame = window.requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
    document.addEventListener("mousedown", onMouseDown);
    window.addEventListener("resize", updatePopoverPosition);
    window.addEventListener("scroll", updatePopoverPosition, true);

    return () => {
      window.cancelAnimationFrame(focusFrame);
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

    if (triggerRef.current) {
      setPopoverPosition(
        getFieldFilterPopoverPosition(triggerRef.current, isMobile),
      );
    }

    setIsOpen(true);
  };

  return (
    <div
      ref={wrapperRef}
      className={cn(
        "relative shrink-0",
        layout === "full" ? "w-full" : "w-auto",
      )}
    >
      <div className="relative">
        <button
          ref={triggerRef}
          aria-expanded={isOpen}
          aria-label={t("common.searchName", {
            values: { name: itemKindLabel },
          })}
          className={cn(
            "inline-flex min-w-0 items-center gap-1.5 rounded-md border-0 bg-transparent px-2 font-semibold outline-none transition-[background-color,color,transform,opacity] duration-150 active:scale-[0.97]",
            layout === "full" && "w-full",
            isMobile ? "h-7 text-[12px]" : "h-8 text-[13px]",
            isOpen
              ? "bg-[#F3F4F6] text-[#374151]"
              : selectedIds.length > 0
                ? "text-[#1D4ED8] hover:bg-[#EFF6FF]"
                : "text-[#5F6368] hover:bg-[#F3F4F6]",
          )}
          onClick={() => (isOpen ? setIsOpen(false) : openOptions(""))}
          type="button"
        >
          <Icon
            className={
              isMobile ? "h-3 w-3 shrink-0" : "h-3.5 w-3.5 shrink-0"
            }
          />
          <span
            className={cn(
              "min-w-0 truncate text-left",
              layout === "full" && "flex-1",
            )}
          >
            {itemKindLabel}
          </span>
          <ChevronDown
            className={cn(
              isMobile
                ? "h-3 w-3 shrink-0 text-[#9CA3AF]"
                : "h-3.5 w-3.5 shrink-0 text-[#9CA3AF]",
              isOpen && "rotate-180",
            )}
          />
        </button>
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
          <FilterPopoverSearchHeader
            clearSearchLabel={t("common.clearSearchName", {
              values: { name: itemKindLabel },
            })}
            inputRef={inputRef}
            onClearSearch={() => setSearch("")}
            onReset={() => {
              setSearch("");
              setIsOpen(false);
              onSelectedIdsChange([]);
            }}
            onSearchChange={setSearch}
            onSearchKeyDown={(event) => {
              if (event.key === "Escape") {
                setIsOpen(false);
                setSearch("");
                triggerRef.current?.focus();
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
            placeholder={t("common.searchName", {
              values: { name: itemKindLabel },
            })}
            resetLabel={t("common.resetName", {
              values: { name: itemKindLabel },
            })}
            searchLabel={t("common.searchName", {
              values: { name: itemKindLabel },
            })}
            searchValue={search}
          />

          <div className="max-h-[184px] overflow-y-auto border-b border-[#E6EAF0] py-1">
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
            {t("companyList.addTaxonomy", {
              values: { label: itemKindLabel },
            })}
          </button>
        </div>
      ) : null}
    </div>
  );
}

function getFieldFilterPopoverPosition(
  trigger: HTMLElement,
  isMobile: boolean,
): FieldFilterPopoverPosition {
  const rect = trigger.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const margin = 16;
  const width = isMobile
    ? Math.min(256, Math.max(160, viewportWidth - margin * 2))
    : Math.max(256, Math.round(rect.width));
  const maxLeft = Math.max(margin, viewportWidth - width - margin);
  const left = Math.min(Math.max(rect.left, margin), maxLeft);

  return {
    left,
    top: rect.bottom + 4,
    width,
  };
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

function getTaxonomyFilterItemSelectedClass(
  tone: CompanyTaxonomyFilterTone,
) {
  switch (tone) {
    case "blue":
      return "bg-[#EFF6FF] font-semibold text-[#1D4ED8]";
  }
}

function getTaxonomyFilterCheckBorderClass(
  tone: CompanyTaxonomyFilterTone,
) {
  switch (tone) {
    case "blue":
      return "border-[#E2E5EC]";
  }
}

function getTaxonomyFilterCheckDotClass(tone: CompanyTaxonomyFilterTone) {
  switch (tone) {
    case "blue":
      return "bg-[#4880EE]";
  }
}

function CompanyListError({
  error,
  onRetry,
}: {
  readonly error: unknown;
  readonly onRetry: () => void;
}) {
  const { t } = useAppI18n();

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-5 py-14 text-center">
      <p className="text-[13px] text-red-500">{getApiErrorMessage(error)}</p>
      <button
        className="mt-3 inline-flex h-8 items-center rounded-md border border-[#E2E5EC] bg-white px-3 text-[12px] text-[#6B7280] hover:bg-[#F5F6F8]"
        onClick={onRetry}
        type="button"
      >
        {t("common.retry")}
      </button>
    </div>
  );
}

function CompanyListSkeleton() {
  return (
    <div className="overflow-hidden">
      {Array.from({ length: 10 }, (_, i) => (
        <div
          key={i}
          className="h-12 animate-pulse border-b border-[#E5E7EB] bg-[#F8FAFC] last:border-b-0"
        />
      ))}
    </div>
  );
}

function downloadBlobFile(file: ApiBlobResponse, fallbackFileName: string) {
  const url = window.URL.createObjectURL(file.blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = file.fileName ?? fallbackFileName;
  document.body.append(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

function formatCompanyCreatedAt(
  value: string,
  timeZone: string,
  locale: AppLocale,
) {
  return formatDateWithOptions(value, {
    day: "2-digit",
    locale: getIntlLocale(locale),
    month: "2-digit",
    timeZone,
    year: "numeric",
  });
}

function formatCompanyCreatedActivity(
  value: string,
  timeZone: string,
  locale: AppLocale,
  t: (key: AppI18nKey, options?: { readonly values?: Record<string, string> }) => string,
) {
  return t("companyList.registeredAt", {
    values: { date: formatCompanyCreatedAt(value, timeZone, locale) },
  });
}

function getBrowserTimeZoneFallback() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Seoul";
  } catch {
    return "Asia/Seoul";
  }
}

function getIntlLocale(locale: AppLocale) {
  return locale === "ko-KR" ? "ko-KR" : "en-US";
}

function getDesktopSearchExpandedWidth() {
  if (typeof window === "undefined") {
    return DESKTOP_SEARCH_MAX_WIDTH;
  }

  return Math.round(
    Math.min(
      Math.max(
        window.innerWidth * DESKTOP_SEARCH_VIEWPORT_RATIO,
        DESKTOP_SEARCH_MIN_WIDTH,
      ),
      DESKTOP_SEARCH_MAX_WIDTH,
    ),
  );
}

function normalizeFilterText(value: string) {
  return value.trim().toLowerCase();
}

function addUniqueId(ids: readonly string[], id: string) {
  return ids.includes(id) ? [...ids] : [...ids, id];
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

function getStoredCompanyCreatePanelWidth() {
  if (typeof window === "undefined") {
    return COMPANY_CREATE_PANEL_DEFAULT_WIDTH;
  }

  const storedWidth = Number(
    window.localStorage.getItem(COMPANY_CREATE_PANEL_STORAGE_KEY),
  );

  return clampCompanyCreatePanelWidth(storedWidth, window.innerWidth);
}

function clampCompanyCreatePanelWidth(width: number, viewportWidth?: number) {
  const fallbackWidth = Number.isFinite(width)
    ? width
    : COMPANY_CREATE_PANEL_DEFAULT_WIDTH;
  const maxWidth = getCompanyCreatePanelMaxWidth(viewportWidth);

  return Math.min(
    Math.max(fallbackWidth, COMPANY_CREATE_PANEL_MIN_WIDTH),
    maxWidth,
  );
}

function getCompanyCreatePanelMaxWidth(viewportWidth?: number) {
  if (!viewportWidth || viewportWidth <= 0) {
    return COMPANY_CREATE_PANEL_DEFAULT_WIDTH;
  }

  return Math.max(
    COMPANY_CREATE_PANEL_MIN_WIDTH,
    Math.floor(viewportWidth * COMPANY_CREATE_PANEL_MAX_RATIO),
  );
}

function CompanyMobileCard({
  company,
  displayTimeZone,
  locale,
}: {
  readonly company: CompanyListItem;
  readonly displayTimeZone: string;
  readonly locale: AppLocale;
}) {
  const navigate = useNavigate();
  const { t } = useAppI18n();
  const numberFormatter = useMemo(
    () => new Intl.NumberFormat(getIntlLocale(locale)),
    [locale],
  );
  const initial = company.companyName.charAt(0).toUpperCase();
  const companyRegionLabel = formatCompanyRegionLabel(
    company.companyRegion,
    locale
  );

  return (
    <button
      className="flex w-full items-start gap-3 border-b border-[#E5E7EB] bg-white px-4 py-[14px] text-left transition active:bg-[#F9FAFB]"
      onClick={() => void navigate(`/app/companies/${company.id}`)}
      type="button"
    >
      {/* 이니셜 아바타 */}
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#EEF4FF]">
        <span className="text-[13px] font-bold text-[#4880EE]">{initial}</span>
      </div>
      {/* 내용 */}
      <div className="min-w-0 flex-1">
        {/* Row1: 회사명 + 분야 배지 */}
        <div className="flex min-w-0 items-center gap-2">
          <span className="min-w-0 truncate text-[14px] font-semibold text-[#111827]">
            {company.companyName}
          </span>
          <span className="inline-flex h-5 shrink-0 items-center rounded-full bg-[#FFFBEB] px-2 text-[11px] font-semibold text-[#B45309]">
            {company.companyField.field}
          </span>
        </div>
        {/* Row2: 지역 */}
        <p className="mt-0.5 text-[12px] text-[#6B7280]">
          {companyRegionLabel}
        </p>
        {/* Row3: 연결 record + 현재 응답에서 가능한 활동 */}
        <div className="mt-1 flex items-center justify-between">
          <span className="text-[12px] text-[#6B7280]">
            {t("companyList.mobileRelation", {
              values: {
                contacts: numberFormatter.format(company.contactCount),
                deals: numberFormatter.format(company.dealCount),
              },
            })}
          </span>
          <span className="shrink-0 text-[11px] text-[#9CA3AF]">
            {formatCompanyCreatedActivity(
              company.createdAt,
              displayTimeZone,
              locale,
              t,
            )}
          </span>
        </div>
      </div>
    </button>
  );
}
