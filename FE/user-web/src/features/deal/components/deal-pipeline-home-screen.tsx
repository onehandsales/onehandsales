// 기능 : 딜 파이프라인 홈 화면 — split view (Desktop) / 카드 (Mobile)
import {
  AlertCircle,
  ArrowUpDown,
  BriefcaseBusiness,
  Building2,
  ChevronDown,
  ChevronUp,
  Download,
  Plus,
  RotateCcw,
  Search,
  SlidersHorizontal,
  UserRound,
  X,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
  useOutletContext,
} from "react-router-dom";
import type { AppShellOutletContext } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { CollapsibleDesktopSearch } from "@/components/ui/collapsible-desktop-search";
import { ListFilterSelect } from "@/components/ui/list-filter-select";
import { ListEmptyState } from "@/components/ui/state";
import { Toast } from "@/components/ui/toast";
import { useAuthSession } from "@/features/auth";
import { DealCreateDialog } from "@/features/deal/components/deal-create-dialog";
import type { DealCreateFormValues } from "@/features/deal/schemas/deal-schema";
import {
  useDealCompanyOptions,
  useDealContactOptions,
} from "@/features/deal/hooks/use-deal-entity-options";
import {
  useDealList,
  useDealStageCounts,
} from "@/features/deal/hooks/use-deal-list";
import { exportDealsXlsx } from "@/features/deal/api/deal-api";
import { getApiErrorMessage } from "@/lib/api-client";
import {
  DEAL_STATUS_LABEL,
  DEAL_STATUS_LIST,
  type DealDetail,
  type DealListItem,
  type DealSort,
  type DealStatus,
} from "@/features/deal/types/deal";
import { Pagination } from "@/components/ui/pagination";
import { cn } from "@/utils/cn";
import { formatDateWithOptions } from "@/utils/format";
import {
  readLocationNotice,
  readLocationNoticeDescription,
} from "@/utils/location-state";

type StageTab = "ALL" | DealStatus;

const stageTabs: Array<{ readonly value: StageTab; readonly label: string }> = [
  { value: "ALL", label: "전체" },
  ...DEAL_STATUS_LIST.map((s) => ({
    value: s as StageTab,
    label: DEAL_STATUS_LABEL[s],
  })),
];

const SORT_OPTIONS: Array<{
  readonly value: DealSort;
  readonly label: string;
}> = [
  { value: "createdAtDesc", label: "최신순" },
  { value: "dealCostDesc", label: "금액 높은순" },
  { value: "dealCostAsc", label: "금액 낮은 순" },
  { value: "expectedEndDateAsc", label: "마감일순" },
];

const DEAL_TABLE_GRID_STYLE = {
  gridTemplateColumns:
    "minmax(0,1.05fr) minmax(0,0.7fr) minmax(0,0.5fr) minmax(0,0.5fr) minmax(0,1.45fr) minmax(0,0.5fr)",
};
const DEAL_CREATE_PANEL_STORAGE_KEY = "onehand.deal.createPanelWidth";
const DEAL_CREATE_PANEL_DEFAULT_WIDTH = 520;
const DEAL_CREATE_PANEL_MIN_WIDTH = 420;
const DEAL_CREATE_PANEL_MAX_RATIO = 0.55;
const DEAL_CREATE_PANEL_AUTO_SIDEBAR_RATIO = 0.45;
const DEAL_CREATE_PANEL_TRANSITION_MS = 500;
const DESKTOP_SEARCH_COMPACT_MAX_WIDTH = 170;
const DESKTOP_FILTER_COLLAPSED_WIDTH = 72;

type DealPipelineHomeScreenProps = {
  readonly initialCreateOpen?: boolean;
};

export function DealPipelineHomeScreen({
  initialCreateOpen = false,
}: DealPipelineHomeScreenProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const outletContext =
    useOutletContext<AppShellOutletContext | undefined>();
  const { user } = useAuthSession();
  const isDockedViewport = useMediaQuery("(min-width: 1024px)");
  const [activeTab, setActiveTab] = useState<StageTab>("ALL");
  const [searchText, setSearchText] = useState("");
  const [search, setSearch] = useState("");
  const [searchResetSignal, setSearchResetSignal] = useState(0);
  const [companyIds, setCompanyIds] = useState<string[]>([]);
  const [contactIds, setContactIds] = useState<string[]>([]);
  const [sort, setSort] = useState<DealSort>("createdAtDesc");
  const [page, setPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDockedCreateRendered, setIsDockedCreateRendered] = useState(false);
  const [createPanelWidth, setCreatePanelWidth] = useState(
    getStoredDealCreatePanelWidth,
  );
  const [isCreatePanelResizing, setIsCreatePanelResizing] = useState(false);
  const [isCompactFilterOpen, setIsCompactFilterOpen] = useState(false);
  const [compactFilterPosition, setCompactFilterPosition] =
    useState<DealFilterPopoverPosition | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [noticeDescription, setNoticeDescription] = useState<string | null>(null);
  const compactFilterButtonRef = useRef<HTMLButtonElement>(null);
  const compactFilterPopoverRef = useRef<HTMLDivElement>(null);
  const dealCreatedRef = useRef(false);
  const setAutoSidebarCollapsed = outletContext?.setAutoSidebarCollapsed;

  const searchQuery = search.trim() || undefined;
  const companyFilter = companyIds.length > 0 ? companyIds : undefined;
  const contactFilter = contactIds.length > 0 ? contactIds : undefined;

  const companyOptionsQuery = useDealCompanyOptions();
  const contactOptionsQuery = useDealContactOptions();
  const stageCountsQuery = useDealStageCounts({
    search: searchQuery,
    companyIds: companyFilter,
    contactIds: contactFilter,
  });
  const dealsQuery = useDealList({
    page,
    search: searchQuery,
    companyIds: companyFilter,
    contactIds: contactFilter,
    dealStatus: activeTab === "ALL" ? undefined : activeTab,
    sort,
  });

  const deals = useMemo(
    () => dealsQuery.data?.items ?? [],
    [dealsQuery.data?.items],
  );

  useEffect(() => {
    const message = readLocationNotice(location.state);
    if (!message) {
      return;
    }

    setNotice(message);
    setNoticeDescription(readLocationNoticeDescription(location.state));
    void navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate]);
  const filteredContactOptions = useMemo(() => {
    const contactOptions = contactOptionsQuery.data ?? [];
    return companyIds.length > 0
      ? contactOptions.filter((contact) => companyIds.includes(contact.companyId))
      : contactOptions;
  }, [companyIds, contactOptionsQuery.data]);
  const displayTimeZone = user?.timeZone ?? getBrowserTimeZoneFallback();
  const isDockedCreateOpen = isCreateOpen && isDockedViewport;
  const isDockedCreateMounted = isDockedCreateOpen || isDockedCreateRendered;
  const isCompactFilterMode = isDockedCreateOpen;
  const hasEntityFilters = companyIds.length > 0 || contactIds.length > 0;
  const entityFilterCount = companyIds.length + contactIds.length;
  const hasFilter =
    activeTab !== "ALL" ||
    search.trim().length > 0 ||
    companyIds.length > 0 ||
    contactIds.length > 0 ||
    sort !== "createdAtDesc";

  useEffect(() => {
    if (!initialCreateOpen) {
      return;
    }

    setCreatePanelWidth(DEAL_CREATE_PANEL_MIN_WIDTH);
    setIsCreateOpen(true);
  }, [initialCreateOpen]);

  useEffect(() => {
    if (isDockedCreateOpen) {
      setIsDockedCreateRendered(true);
      return;
    }

    const timerId = window.setTimeout(() => {
      setIsDockedCreateRendered(false);
    }, DEAL_CREATE_PANEL_TRANSITION_MS);

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
        getCompactDealFilterPopoverPosition(compactFilterButtonRef.current),
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
      DEAL_CREATE_PANEL_STORAGE_KEY,
      String(createPanelWidth),
    );
  }, [createPanelWidth]);

  useEffect(() => {
    const clampToViewport = () => {
      setCreatePanelWidth((currentWidth) =>
        clampDealCreatePanelWidth(currentWidth, window.innerWidth),
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
          DEAL_CREATE_PANEL_AUTO_SIDEBAR_RATIO;

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
        clampDealCreatePanelWidth(
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

  // 기능 : 회사 필터 변경으로 범위 밖이 된 담당자 필터를 정리합니다.
  useEffect(() => {
    if (contactIds.length === 0) {
      return;
    }

    const validContactIds = new Set(filteredContactOptions.map((contact) => contact.id));
    const nextContactIds = contactIds.filter((contactId) =>
      validContactIds.has(contactId),
    );

    if (nextContactIds.length !== contactIds.length) {
      setContactIds(nextContactIds);
      setPage(1);
    }
  }, [contactIds, filteredContactOptions]);

  const onTabChange = (tab: StageTab) => {
    setActiveTab(tab);
    setPage(1);
  };

  const onSearchSubmit = (nextSearch: string) => {
    setSearch(nextSearch);
    setPage(1);
  };

  const clearFilters = () => {
    setActiveTab("ALL");
    setSearchText("");
    setSearch("");
    setSearchResetSignal((signal) => signal + 1);
    setCompanyIds([]);
    setContactIds([]);
    setSort("createdAtDesc");
    setPage(1);
  };

  const onCompanyIdsChange = (ids: string[]) => {
    setCompanyIds(ids);
    setPage(1);
  };

  const onContactIdsChange = (ids: string[]) => {
    setContactIds(ids);
    setPage(1);
  };

  const onSortChange = (value: DealSort) => {
    setSort(value);
    setPage(1);
  };

  const onExport = async () => {
    setIsExporting(true);
    setExportError(null);
    try {
      const { blob, fileName } = await exportDealsXlsx({
        search: searchQuery,
        companyIds: companyFilter,
        contactIds: contactFilter,
        dealStatus: activeTab === "ALL" ? undefined : activeTab,
        sort,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName ?? "deals.xlsx";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setExportError(getApiErrorMessage(err));
    } finally {
      setIsExporting(false);
    }
  };

  const onCreateOpenChange = (open: boolean) => {
    setIsCreateOpen(open);

    if (!open && initialCreateOpen && !dealCreatedRef.current) {
      void navigate("/app/deals", { replace: true });
    }
  };

  const openCreatePanel = () => {
    setCreatePanelWidth(DEAL_CREATE_PANEL_MIN_WIDTH);
    setIsCreateOpen(true);
  };

  const onCreateExpand = (values: DealCreateFormValues) => {
    void navigate("/app/deals/new/full", {
      state: { dealCreateDraft: values },
    });
  };

  const onDealCreated = (deal: DealDetail) => {
    dealCreatedRef.current = true;
    setActiveTab("ALL");
    setPage(1);

    if (initialCreateOpen) {
      void navigate(`/app/deals/${deal.id}`, { replace: true });
    }
  };

  const getStageCount = (tab: StageTab): number => {
    const counts = stageCountsQuery.data?.items ?? [];
    if (tab === "ALL") return counts.reduce((sum, c) => sum + c.count, 0);
    return counts.find((c) => c.dealStatus === tab)?.count ?? 0;
  };

  return (
    <>
      {/* ── Desktop ── */}
      <section
        className="hidden min-h-full flex-col bg-white transition-[padding-right] duration-[500ms] ease-out md:flex"
        style={
          isDockedCreateMounted
            ? { paddingRight: isDockedCreateOpen ? createPanelWidth : 0 }
            : undefined
        }
      >
        {/* PageHeader */}
        <PageHeader
          breadcrumbs={[{ label: "딜", icon: BriefcaseBusiness }]}
          actions={[
            {
              icon: Download,
              tooltip: "엑셀 다운로드",
              onClick: () => void onExport(),
              disabled: isExporting,
            },
            {
              icon: Plus,
              tooltip: "딜 생성",
              onClick: openCreatePanel,
              hidden: isDockedCreateMounted,
              variant: "primary",
            },
          ]}
        />
        {/* 내보내기 에러 배너 */}
        {exportError ? (
          <div className="mx-5 mt-3 flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {exportError}
          </div>
        ) : null}
        {notice ? (
          <div className="mx-5 mt-3">
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
        {/* Stage Tabs */}
        <div className="relative flex shrink-0 items-end px-6">
          <div className="absolute bottom-0 left-5 right-5 h-px bg-[#E6EAF0]" />
          {stageTabs.map((tab) => {
            const count = getStageCount(tab.value);
            const isActive = activeTab === tab.value;
            return (
              <button
                className={cn(
                  "relative flex h-11 items-center gap-1.5 border-b-2 px-3.5 text-[13px] font-medium transition-colors",
                  isActive
                    ? "border-transparent text-[#4880EE]"
                    : "border-transparent text-[#6B7280] hover:text-[#111827]",
                )}
                key={tab.value}
                onClick={() => onTabChange(tab.value)}
                type="button"
              >
                {tab.label}
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[11px] font-semibold",
                    isActive
                      ? "bg-[#EFF6FF] text-[#4880EE]"
                      : "bg-[#F3F4F6] text-[#6B7280]",
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div
          className={cn(
            "flex min-h-0 gap-3 overflow-hidden px-5 pb-3 pt-3 xl:gap-5",
            isCreatePanelResizing && "cursor-col-resize select-none",
          )}
        >
          {/* Deal List */}
          <div className="flex min-w-0 flex-1 flex-col gap-3">
            {/* Controls bar — 한 줄 */}
            <div className="flex shrink-0 items-center gap-1.5 overflow-x-auto px-0.5 [scrollbar-width:none] lg:gap-2 [&::-webkit-scrollbar]:hidden">
                <CollapsibleDesktopSearch
                  appliedValue={search}
                  maxExpandedWidth={
                    isCompactFilterMode
                      ? DESKTOP_SEARCH_COMPACT_MAX_WIDTH
                      : undefined
                  }
                  placeholder="딜명을 검색하세요!"
                  resetSignal={searchResetSignal}
                  submitLabel="딜 검색 실행"
                  value={searchText}
                  onSubmit={onSearchSubmit}
                  onValueChange={setSearchText}
                />
                <button
                  aria-label="초기화"
                  className={cn(
                    "inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-md border-0 bg-transparent px-2 text-[13px] font-semibold transition-[background-color,color,transform] duration-150 focus:outline-none active:scale-[0.97]",
                    hasFilter
                      ? "text-[#1D4ED8] hover:bg-[#EFF6FF]"
                      : "text-[#5F6368] hover:bg-[#F3F4F6]",
                  )}
                  onClick={clearFilters}
                  type="button"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>초기화</span>
                </button>
                  <div
                    className="relative flex h-8 shrink-0 items-center overflow-hidden transition-[width] duration-500 ease-out"
                    style={{
                      width: isCompactFilterMode
                        ? DESKTOP_FILTER_COLLAPSED_WIDTH
                        : undefined,
                    }}
                  >
                  <button
                    ref={compactFilterButtonRef}
                    aria-expanded={isCompactFilterOpen}
                    aria-label="필터"
                    aria-hidden={!isCompactFilterMode}
	                    className={cn(
	                      "absolute left-0 top-0 inline-flex h-8 w-[72px] shrink-0 items-center justify-center gap-1.5 rounded-md border-0 bg-transparent px-2 text-[13px] font-semibold transition-[opacity,transform,background-color,color] duration-150 focus:outline-none active:scale-[0.97]",
	                      isCompactFilterOpen
	                        ? "bg-[#F3F4F6] text-[#374151]"
	                        : hasEntityFilters
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
                    <span>필터</span>
                    {hasEntityFilters ? (
                      <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-[#4880EE] px-1 text-[10px] font-bold leading-none text-white">
                        {entityFilterCount}
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
                    <DealFilterMultiSelect
                      emptyText="조건을 바꾸면 회사를 찾을 수 있어요."
                      getLabel={(company) => company.companyName}
                      icon={Building2}
                      itemKindLabel="회사"
                      items={companyOptionsQuery.data ?? []}
                      selectedIds={companyIds}
                      onSelectedIdsChange={onCompanyIdsChange}
                    />
                    <DealFilterMultiSelect
                      emptyText="조건을 바꾸면 담당자를 찾을 수 있어요."
                      getLabel={(contact) => contact.label}
                      icon={UserRound}
                      itemKindLabel="담당자"
                      items={filteredContactOptions}
                      selectedIds={contactIds}
                      onSelectedIdsChange={onContactIdsChange}
                    />
                  </div>
                </div>
                <ListFilterSelect
                  active={sort !== "createdAtDesc"}
                  ariaLabel="정렬 조건"
                  icon={ArrowUpDown}
                  className={
                    isCompactFilterMode
                      ? "w-[104px]"
                      : "w-[clamp(136px,14vw,178px)]"
                  }
                  onChange={onSortChange}
                  options={SORT_OPTIONS}
                  value={sort}
                />
                <div className="flex-1" />
                <span className="shrink-0 text-[12px] text-[#9CA3AF]">
                  {dealsQuery.data?.totalCount ?? 0}건
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
                        회사
                      </p>
                      <DealFilterMultiSelect
                        emptyText="조건을 바꾸면 회사를 찾을 수 있어요."
                        getLabel={(company) => company.companyName}
                        icon={Building2}
                        itemKindLabel="회사"
                        items={companyOptionsQuery.data ?? []}
                        layout="full"
                        selectedIds={companyIds}
                        onSelectedIdsChange={onCompanyIdsChange}
                      />
                    </div>
                    <div className="grid gap-1.5">
                      <p className="text-[12px] font-semibold text-[#64748B]">
                        담당자
                      </p>
                      <DealFilterMultiSelect
                        emptyText="조건을 바꾸면 담당자를 찾을 수 있어요."
                        getLabel={(contact) => contact.label}
                        icon={UserRound}
                        itemKindLabel="담당자"
                        items={filteredContactOptions}
                        layout="full"
                        selectedIds={contactIds}
                        onSelectedIdsChange={onContactIdsChange}
                      />
                    </div>
                  </div>
                </div>
              ) : null}

              {dealsQuery.isLoading ? (
                <DesktopLoadingState />
              ) : dealsQuery.isError ? (
                <ErrorState onRetry={() => void dealsQuery.refetch()} />
              ) : (
                <>
              <div className="flex w-full min-w-0 flex-col overflow-hidden rounded-lg border border-[#E2E5EC] bg-white shadow-sm">
                {/* Table header */}
                <div
                  className="grid h-11 shrink-0 items-center border-b border-[#E2E5EC] bg-[#F9FAFB] px-3 md:px-4 xl:px-6"
                  style={DEAL_TABLE_GRID_STYLE}
                >
                  <TableHeaderCell>딜이름</TableHeaderCell>
                  <TableHeaderCell>회사/담당자</TableHeaderCell>
                  <TableHeaderCell>단계</TableHeaderCell>
                  <TableHeaderCell>금액</TableHeaderCell>
                  <TableHeaderCell>다음 행동</TableHeaderCell>
                  <TableHeaderCell>등록일</TableHeaderCell>
                </div>

                {/* Rows */}
                {deals.length === 0 ? (
                  <ListEmptyState
                    actionIcon={Plus}
                    actionLabel="딜 생성"
                    icon={BriefcaseBusiness}
                    onAction={openCreatePanel}
                    title={
                      hasFilter
                        ? "조건을 바꾸면 딜을 찾을 수 있어요"
                        : "데이터가 존재하지 않아요"
                    }
                  />
                ) : (
                  <div className="min-w-0">
                    {deals.map((deal) => (
                      <DealListRow
                        deal={deal}
                        displayTimeZone={displayTimeZone}
                        key={deal.id}
                        onSelect={(dealId) => void navigate(`/app/deals/${dealId}`)}
                      />
                    ))}
                  </div>
                )}
              </div>

              {dealsQuery.data ? (
                <Pagination
                  onPageChange={setPage}
                  page={page}
                  totalPages={dealsQuery.data.totalPages ?? 1}
                />
              ) : null}
                </>
              )}
            </div>
            {isDockedCreateMounted ? (
              <DealCreateDialog
                mode="docked"
                onCreated={onDealCreated}
                onExpand={onCreateExpand}
                onOpenChange={onCreateOpenChange}
                onResizeStart={() => setIsCreatePanelResizing(true)}
                open={isDockedCreateOpen}
                width={createPanelWidth}
              />
            ) : null}
          </div>
      </section>

      {/* ── Mobile ── */}
      <section className="relative flex flex-col md:hidden">
        {/* 단계 탭 — 가로 스크롤 */}
        <div className="overflow-x-auto border-b border-[#E6EAF0] bg-white">
          <div className="flex min-w-max gap-0 px-2">
            {stageTabs.map((tab) => {
              const count = getStageCount(tab.value);
              const isActive = activeTab === tab.value;
              return (
                <button
                  className={cn(
                    "flex h-11 shrink-0 items-center gap-1 border-b-2 px-3 text-[13px] font-medium transition-colors",
                    isActive
                      ? "border-transparent text-[#4880EE]"
                      : "border-transparent text-[#6B7280]",
                  )}
                  key={tab.value}
                  onClick={() => onTabChange(tab.value)}
                  type="button"
                >
                  {tab.label}
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0.5 text-[11px] font-semibold",
                      isActive
                        ? "bg-[#EFF6FF] text-[#4880EE]"
                        : "bg-[#F3F4F6] text-[#6B7280]",
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 필터 칩 행 */}
        <div className="flex items-center gap-2 border-b border-[#E6EAF0] bg-white px-4 py-2">
          {/* 금액 정렬 칩: 비활성 → 높은순 → 낮은순 → 비활성 순환 */}
          <button
            className={cn(
              "inline-flex h-[26px] shrink-0 items-center gap-1 rounded-[13px] px-[10px] text-[12px] font-medium transition",
              sort === "dealCostDesc" || sort === "dealCostAsc"
                ? "border border-[#C7D7FE] bg-[#EAF2FF] font-bold text-[#1D4ED8]"
                : "bg-[#F3F4F6] text-[#4B5563]",
            )}
            onClick={() => {
              if (sort === "dealCostDesc") onSortChange("dealCostAsc");
              else if (sort === "dealCostAsc") onSortChange("createdAtDesc");
              else onSortChange("dealCostDesc");
            }}
            type="button"
          >
            {sort === "dealCostAsc" ? "금액 낮은순" : "금액 높은순"}
            {sort === "dealCostAsc" ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
          </button>
          {/* 마감일 정렬 칩: 비활성 → 마감일순(오름) → 비활성 토글 */}
          <button
            className={cn(
              "inline-flex h-[26px] shrink-0 items-center gap-1 rounded-[13px] px-[10px] text-[12px] font-medium transition",
              sort === "expectedEndDateAsc"
                ? "border border-[#C7D7FE] bg-[#EAF2FF] font-bold text-[#1D4ED8]"
                : "bg-[#F3F4F6] text-[#4B5563]",
            )}
            onClick={() =>
              onSortChange(
                sort === "expectedEndDateAsc"
                  ? "createdAtDesc"
                  : "expectedEndDateAsc",
              )
            }
            type="button"
          >
            마감일순
            <ChevronDown className="h-3 w-3" />
          </button>
          <div className="flex-1" />
          <span className="shrink-0 text-[11px] text-[#9CA3AF]">
            {dealsQuery.data?.totalCount ?? 0}건
          </span>
          <button
            aria-label="엑셀 다운로드"
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#F3F4F6] text-[#4B5563] disabled:opacity-40"
            disabled={isExporting}
            onClick={() => void onExport()}
            type="button"
          >
            <Download className="h-3.5 w-3.5" />
          </button>
        </div>
        {/* 내보내기 에러 배너 (모바일) */}
        {exportError ? (
          <div className="mx-4 mt-2 flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {exportError}
          </div>
        ) : null}

        {/* 딜 카드 목록 */}
        <div className="bg-white">
          {dealsQuery.isLoading ? (
            <MobileLoadingState />
          ) : dealsQuery.isError ? (
            <div className="px-4 pt-4">
              <ErrorState onRetry={() => void dealsQuery.refetch()} />
            </div>
          ) : deals.length === 0 ? (
            <ListEmptyState
              actionIcon={Plus}
              actionLabel="딜 생성"
              icon={BriefcaseBusiness}
              onAction={openCreatePanel}
              title={
                hasFilter ? "조건을 바꾸면 딜을 찾을 수 있어요" : "데이터가 존재하지 않아요"
              }
            />
          ) : (
            <>
              <div className="flex flex-col gap-3 px-4 py-4 pb-24">
                {deals.map((deal) => (
                  <MobileDealCard
                    deal={deal}
                    displayTimeZone={displayTimeZone}
                    key={deal.id}
                  />
                ))}
              </div>
              {dealsQuery.data ? (
                <div className="px-4 pb-8">
                  <Pagination
                    onPageChange={setPage}
                    page={page}
                    totalPages={dealsQuery.data.totalPages ?? 1}
                  />
                </div>
              ) : null}
            </>
          )}
        </div>

        {/* FAB */}
        <button
          className="fixed bottom-24 right-5 z-40 inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#4880EE] text-white shadow-[0_4px_16px_rgba(59,130,246,0.27)] transition hover:scale-[1.02]"
          onClick={openCreatePanel}
          type="button"
        >
          <Plus className="h-4 w-4" />
        </button>
      </section>

      <div className="lg:hidden">
        <DealCreateDialog
          mode="overlay"
          onCreated={onDealCreated}
          onExpand={onCreateExpand}
          onOpenChange={onCreateOpenChange}
          open={isCreateOpen && !isDockedViewport}
        />
      </div>
    </>
  );
}

// ── 테이블 행 ──

function DealListRow({
  deal,
  displayTimeZone,
  onSelect,
}: {
  readonly deal: DealListItem;
  readonly displayTimeZone: string;
  readonly onSelect: (id: string) => void;
}) {
  const contactLabel = formatDealContactLabel(deal);
  const companyLabel = formatDealCompanyLabel(deal);
  const nextActionLabel = formatDealNextActionLabel(deal);

  return (
    <div
      className="grid h-[66px] w-full cursor-pointer items-center border-b border-[#E2E5EC] bg-white px-3 py-0 text-left transition-colors last:border-b-0 hover:bg-blue-50/60 md:px-4 xl:px-6"
      onClick={() => onSelect(deal.id)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect(deal.id);
        }
      }}
      role="button"
      style={DEAL_TABLE_GRID_STYLE}
      tabIndex={0}
    >
      {/* 딜이름 */}
      <div className="min-w-0">
        <span className="block truncate text-[13px] font-semibold text-gray-900">
          {deal.dealName}
        </span>
      </div>

      {/* 회사/담당자 */}
      <div className="min-w-0 pr-3">
        <span
          className="block truncate text-[12px] text-[#111827]"
          title={companyLabel}
        >
          {companyLabel}
        </span>
        <span
          className="mt-0.5 block truncate text-[11px] text-[#4880EE]"
          title={contactLabel}
        >
          {contactLabel}
        </span>
      </div>

      {/* 단계 */}
      <div className="min-w-0">
        <span
          className={cn(
            "inline-flex h-6 items-center gap-1.5 rounded-full border px-2 text-[11px] font-semibold",
            getDealStatusClass(deal.dealStatus),
          )}
        >
          <span
            className={cn(
              "h-1.5 w-1.5 shrink-0 rounded-full",
              getDealStatusDotClass(deal.dealStatus),
            )}
          />
          {deal.dealStatusLabel}
        </span>
      </div>

      {/* 금액 */}
      <div className="min-w-0">
        <span className="block truncate text-[12px] text-gray-900">
          {deal.dealCost.toLocaleString("ko-KR")}원
        </span>
      </div>

      {/* 다음 행동 */}
      <div className="min-w-0 pr-3">
        <span
          className={cn(
            "block truncate text-[12px] font-semibold",
            deal.nextFollowingAction ? "text-[#111827]" : "text-[#9CA3AF]",
          )}
          title={nextActionLabel}
        >
          {nextActionLabel}
        </span>
      </div>

      {/* 등록일 */}
      <div className="min-w-0">
        <span className="block truncate text-[11px] font-medium text-[#64748B]">
          {formatDealCreatedAt(deal.createdAt, displayTimeZone)}
        </span>
      </div>
    </div>
  );
}

// ── 모바일 카드 ──

function MobileDealCard({
  deal,
}: {
  readonly deal: DealListItem;
  readonly displayTimeZone: string;
}) {
  const contactLabel = formatDealContactLabel(deal);
  const companyLabel = formatDealCompanyLabel(deal);
  const deadlineLabel = getDeadlineDDayLabel(deal.expectedEndDate);
  const deadlineColor = getDeadlineDDayColor(deal.expectedEndDate);
  const nextAction = deal.nextFollowingAction;
  const nextActionLabel = formatDealNextActionLabel(deal);

  return (
    <Link
      className="block rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-sm transition hover:-translate-y-0.5"
      to={`/app/deals/${deal.id}`}
    >
      {/* Row1: 단계 배지 */}
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "inline-flex h-[22px] items-center gap-1.5 rounded-full border px-2 text-[11px] font-semibold",
            getDealStatusClass(deal.dealStatus),
          )}
        >
          <span
            className={cn(
              "h-1.5 w-1.5 shrink-0 rounded-full",
              getDealStatusDotClass(deal.dealStatus),
            )}
          />
          {deal.dealStatusLabel}
        </span>
      </div>

      {/* Row2: 딜이름 */}
      <h2 className="mt-2 truncate text-[15px] font-semibold text-[#111827]">
        {deal.dealName}
      </h2>

      {/* Row3: 회사명 · 담당자명 */}
      <p className="mt-0.5 truncate text-[13px] text-[#6B7280]">
        {companyLabel} · {contactLabel}
      </p>

      {/* Divider */}
      <div className="my-3 h-px bg-[#E5E7EB]" />

      {/* Row4: 다음 행동 + D-day */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[12px] text-[#6B7280]">다음 행동</p>
          <p className="mt-0.5 truncate text-[13px] text-[#1F2937]">
            {nextActionLabel}
          </p>
        </div>
        {nextAction ? (
          <div className="shrink-0 text-right">
            <p className="text-[12px] text-[#6B7280]">마감 D-day</p>
            <p
              className="mt-0.5 text-[12px] font-semibold"
              style={{ color: deadlineColor }}
            >
              {deadlineLabel}
            </p>
          </div>
        ) : null}
      </div>

      {/* Row5: 금액 + 마감일 */}
      <div className="mt-3 flex items-center justify-between gap-2">
        <p className="text-[17px] text-[#111827]">
          ₩ {deal.dealCost.toLocaleString("ko-KR")}
        </p>
        <p className="text-[12px]" style={{ color: deadlineColor }}>
          마감 {formatDealDateShort(deal.expectedEndDate)}
        </p>
      </div>
    </Link>
  );
}

// ── 유틸 ──

function getDealStatusClass(status: DealStatus): string {
  switch (status) {
    case "INITIAL_CONTACT":
      return "border-[#22D3EE] bg-[#ECFEFF] text-[#0E7490]";
    case "NEEDS_CHECK":
      return "border-[#60A5FA] bg-[#EFF6FF] text-[#1D4ED8]";
    case "PROPOSAL_QUOTE":
      return "border-[#FACC15] bg-[#FEFCE8] text-[#A16207]";
    case "NEGOTIATION":
      return "border-[#FB923C] bg-[#FFF7ED] text-[#C2410C]";
    case "WON":
      return "border-[#34D399] bg-[#ECFDF5] text-[#047857]";
    case "LOST":
      return "border-[#FB7185] bg-[#FFF1F2] text-[#BE123C]";
  }
}

function getDealStatusDotClass(status: DealStatus): string {
  switch (status) {
    case "INITIAL_CONTACT":
      return "bg-[#0891B2]";
    case "NEEDS_CHECK":
      return "bg-[#4880EE]";
    case "PROPOSAL_QUOTE":
      return "bg-[#CA8A04]";
    case "NEGOTIATION":
      return "bg-[#EA580C]";
    case "WON":
      return "bg-[#059669]";
    case "LOST":
      return "bg-[#E11D48]";
  }
}

function formatDealContactLabel(deal: DealListItem) {
  return deal.contacts
    .map((contact) => {
      const jobGradeName = contact.contactJobGrade.jobGradeName.trim();
      const departmentName = contact.contactDepartment.departmentName.trim();
      const contactName = formatDeletedLabel(contact.username, contact.isDeleted);
      const nameWithJobGrade = jobGradeName
        ? `${contactName} ${jobGradeName}`
        : contactName;

      return departmentName
        ? `${nameWithJobGrade} · ${departmentName}`
        : nameWithJobGrade;
    })
    .join(", ");
}

function formatDealCompanyLabel(deal: DealListItem) {
  return (
    deal.companies
      .map((company) => formatDeletedLabel(company.companyName, company.isDeleted))
      .join(", ") || "-"
  );
}

function formatDeletedLabel(label: string, isDeleted: boolean): string {
  return isDeleted ? `${label} (삭제됨)` : label;
}

function formatDealNextActionLabel(deal: DealListItem) {
  const nextAction = deal.nextFollowingAction;

  if (!nextAction) {
    return "없음";
  }

  const remainingLabel =
    nextAction.remainingCount > 0 ? ` 외 ${nextAction.remainingCount}개` : "";

  return `${nextAction.followingAction}${remainingLabel}`;
}

function formatDealCreatedAt(value: string, timeZone: string) {
  return formatDateWithOptions(value, {
    day: "2-digit",
    month: "2-digit",
    timeZone,
    year: "numeric",
  });
}

function getDeadlineDDayLabel(value: string): string {
  if (!value) return "—";
  const deadline = new Date(value);
  if (Number.isNaN(deadline.getTime())) return "—";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  deadline.setHours(0, 0, 0, 0);
  const days = Math.ceil((deadline.getTime() - today.getTime()) / 86400000);
  if (days < 0) return `D+${Math.abs(days)}`;
  if (days === 0) return "D-day";
  return `D-${days}`;
}

function getDeadlineDDayColor(value: string): string {
  if (!value) return "#9CA3AF";
  const deadline = new Date(value);
  if (Number.isNaN(deadline.getTime())) return "#9CA3AF";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  deadline.setHours(0, 0, 0, 0);
  const days = Math.ceil((deadline.getTime() - today.getTime()) / 86400000);
  if (days < 0) return "#B91C1C";
  if (days <= 7) return "#B45309";
  return "#9CA3AF";
}

function formatDealDateShort(value: string): string {
  if (!value) return "—";
  const [, month, day] = value.slice(0, 10).split("-");
  if (!month || !day) return value || "—";
  return `${month}/${day}`;
}

function getBrowserTimeZoneFallback() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Seoul";
  } catch {
    return "Asia/Seoul";
  }
}

type DealFilterPopoverPosition = {
  readonly left: number;
  readonly top: number;
  readonly width: number;
};

type DealFilterItem = {
  readonly id: string;
};

// 기능 : 딜 목록에서 회사/담당자를 여러 개 선택할 수 있는 검색형 필터입니다.
function DealFilterMultiSelect<TItem extends DealFilterItem>({
  emptyText,
  getLabel,
  icon: Icon,
  itemKindLabel,
  items,
  layout = "compact",
  selectedIds,
  onSelectedIdsChange,
}: {
  readonly emptyText: string;
  readonly getLabel: (item: TItem) => string;
  readonly icon: LucideIcon;
  readonly itemKindLabel: string;
  readonly items: readonly TItem[];
  readonly layout?: "compact" | "full";
  readonly selectedIds: readonly string[];
  readonly onSelectedIdsChange: (ids: string[]) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [filterText, setFilterText] = useState("");
  const [popoverPosition, setPopoverPosition] =
    useState<DealFilterPopoverPosition | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const normalizedFilterText = normalizeDealFilterText(filterText.trim());
  const filteredItems =
    normalizedFilterText.length > 0
      ? items.filter((item) =>
          normalizeDealFilterText(getLabel(item)).includes(normalizedFilterText),
        )
      : items;

  useEffect(() => {
    if (!isOpen) {
      setFilterText("");
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

      setPopoverPosition(getDealFilterPopoverPosition(triggerRef.current));
    };
    const onMouseDown = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setFilterText("");
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
  }, [isOpen]);

  const openOptions = (nextFilterText: string) => {
    setFilterText(nextFilterText);

    if (triggerRef.current) {
      setPopoverPosition(getDealFilterPopoverPosition(triggerRef.current));
    }

    setIsOpen(true);
  };

  const toggleItem = (item: TItem) => {
    const nextIds = selectedIdSet.has(item.id)
      ? selectedIds.filter((id) => id !== item.id)
      : [...selectedIds, item.id];

    setFilterText("");
    onSelectedIdsChange(nextIds);
  };

  return (
    <div
      className={cn(
        "relative shrink-0",
        layout === "full" ? "w-full" : "w-auto",
      )}
      ref={wrapperRef}
    >
      <div className="relative">
        <button
          ref={triggerRef}
          aria-expanded={isOpen}
          aria-label={`${itemKindLabel} 필터`}
          className={cn(
            "inline-flex h-8 min-w-0 items-center gap-1.5 rounded-md border-0 bg-transparent px-2 text-[13px] font-semibold outline-none transition-[background-color,color,transform,opacity] duration-150 active:scale-[0.97]",
            layout === "full" && "w-full",
            isOpen
              ? "bg-[#F3F4F6] text-[#374151]"
              : selectedIds.length > 0
                ? "text-[#1D4ED8] hover:bg-[#EFF6FF]"
                : "text-[#5F6368] hover:bg-[#F3F4F6]",
          )}
          onClick={() => (isOpen ? setIsOpen(false) : openOptions(""))}
          type="button"
        >
          <Icon className="h-3.5 w-3.5 shrink-0" />
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
              "h-3.5 w-3.5 shrink-0 text-[#9CA3AF] transition-transform",
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
          <div className="border-b border-[#E6EAF0] p-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#6B7280]" />
              <input
                ref={inputRef}
                aria-label={`${itemKindLabel} 검색`}
                autoComplete="off"
                className="h-8 w-full rounded-md border-0 bg-[#F3F4F6] pl-8 pr-7 text-[13px] text-[#111827] outline-none placeholder:text-[#9CA3AF]"
                onChange={(event) => setFilterText(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    setIsOpen(false);
                    setFilterText("");
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
                placeholder={`${itemKindLabel} 검색`}
                value={filterText}
              />
              {filterText ? (
                <button
                  aria-label={`${itemKindLabel} 검색어 지우기`}
                  className="absolute right-1 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full text-[#9CA3AF] transition hover:bg-[#E5E7EB] hover:text-[#374151]"
                  onClick={() => setFilterText("")}
                  type="button"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              ) : null}
            </div>
          </div>
          <button
            className={cn(
              "flex h-9 w-full items-center gap-1.5 px-3 text-left text-[13px] transition hover:bg-[#F9FAFB]",
              selectedIds.length === 0
                ? "font-semibold text-[#1D4ED8]"
                : "font-medium text-[#475569]",
            )}
            onClick={() => {
              setFilterText("");
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
                      isSelected && "bg-[#EFF6FF] font-semibold text-[#1D4ED8]",
                    )}
                    key={item.id}
                    onClick={() => toggleItem(item)}
                    type="button"
                  >
                    <span
                      className={cn(
                        "grid h-3.5 w-3.5 shrink-0 place-items-center rounded-full border",
                        isSelected ? "border-[#E2E5EC]" : "border-[#CBD5E1]",
                      )}
                    >
                      {isSelected ? (
                        <span className="h-1.5 w-1.5 rounded-full bg-[#4880EE]" />
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
        </div>
      ) : null}
    </div>
  );
}

function getDealFilterPopoverPosition(
  input: HTMLElement,
): DealFilterPopoverPosition {
  const rect = input.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const margin = 16;
  const width = 256;
  const maxLeft = Math.max(margin, viewportWidth - width - margin);
  const left = Math.min(Math.max(rect.left, margin), maxLeft);

  return {
    left,
    top: rect.bottom + 4,
    width,
  };
}

function getCompactDealFilterPopoverPosition(
  trigger: HTMLButtonElement,
): DealFilterPopoverPosition {
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

function normalizeDealFilterText(value: string) {
  return value.trim().toLocaleLowerCase("ko-KR");
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

function getStoredDealCreatePanelWidth() {
  if (typeof window === "undefined") {
    return DEAL_CREATE_PANEL_DEFAULT_WIDTH;
  }

  const storedWidth = Number(
    window.localStorage.getItem(DEAL_CREATE_PANEL_STORAGE_KEY),
  );

  return clampDealCreatePanelWidth(storedWidth, window.innerWidth);
}

function clampDealCreatePanelWidth(width: number, viewportWidth?: number) {
  const fallbackWidth = Number.isFinite(width)
    ? width
    : DEAL_CREATE_PANEL_DEFAULT_WIDTH;
  const maxWidth = getDealCreatePanelMaxWidth(viewportWidth);

  return Math.min(
    Math.max(fallbackWidth, DEAL_CREATE_PANEL_MIN_WIDTH),
    maxWidth,
  );
}

function getDealCreatePanelMaxWidth(viewportWidth?: number) {
  if (!viewportWidth || viewportWidth <= 0) {
    return DEAL_CREATE_PANEL_DEFAULT_WIDTH;
  }

  return Math.max(
    DEAL_CREATE_PANEL_MIN_WIDTH,
    Math.floor(viewportWidth * DEAL_CREATE_PANEL_MAX_RATIO),
  );
}

function TableHeaderCell({
  children,
  align = "left",
}: {
  readonly children: string;
  readonly align?: "left" | "right";
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

function ErrorState({ onRetry }: { readonly onRetry: () => void }) {
  return (
    <div className="rounded-lg border border-red-100 bg-white p-8">
      <div className="flex items-center gap-3 text-red-600">
        <AlertCircle className="h-5 w-5" />
        <h2 className="text-sm font-semibold">
          딜 목록을 불러오지 못했어요.
        </h2>
      </div>
      <button
        className="mt-4 inline-flex h-9 items-center rounded-full border border-gray-200 px-4 text-sm text-gray-700"
        onClick={onRetry}
        type="button"
      >
        다시 시도
      </button>
    </div>
  );
}

function DesktopLoadingState() {
  return (
    <div className="flex w-full min-w-0 flex-col overflow-hidden rounded-lg border border-[#E2E5EC] bg-white shadow-sm">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          className="h-[66px] animate-pulse border-b border-[#E2E5EC] bg-[#F9FAFB] last:border-b-0"
          key={i}
        />
      ))}
    </div>
  );
}

function MobileLoadingState() {
  return (
    <div className="grid gap-3 px-4 py-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div className="h-36 animate-pulse rounded-2xl bg-gray-100" key={i} />
      ))}
    </div>
  );
}
