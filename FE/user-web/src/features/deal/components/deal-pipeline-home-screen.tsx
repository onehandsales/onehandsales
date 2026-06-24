// 기능 : 딜 파이프라인 홈 화면 — split view (Desktop) / 카드 (Mobile)
import {
  AlertCircle,
  BriefcaseBusiness,
  ChevronDown,
  ChevronUp,
  Download,
  Plus,
  RotateCcw,
  Search,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/layout/page-header";
import { ListFilterSelect } from "@/components/ui/list-filter-select";
import { ListEmptyState } from "@/components/ui/state";
import { Toast } from "@/components/ui/toast";
import { useAuthSession } from "@/features/auth";
import { DealCreateDialog } from "@/features/deal/components/deal-create-dialog";
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
  type DealListItem,
  type DealSort,
  type DealStatus,
} from "@/features/deal/types/deal";
import { Pagination } from "@/components/ui/pagination";
import { cn } from "@/utils/cn";
import { formatDateWithOptions } from "@/utils/format";
import { readLocationNotice } from "@/utils/location-state";

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
    "minmax(96px,1.05fr) minmax(88px,0.7fr) minmax(58px,0.5fr) minmax(64px,0.5fr) minmax(148px,1.45fr) minmax(70px,0.5fr)",
};

type DealPipelineHomeScreenProps = {
  readonly initialCreateOpen?: boolean;
};

export function DealPipelineHomeScreen({
  initialCreateOpen = false,
}: DealPipelineHomeScreenProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthSession();
  const [activeTab, setActiveTab] = useState<StageTab>("ALL");
  const [search, setSearch] = useState("");
  const [companyIds, setCompanyIds] = useState<string[]>([]);
  const [contactIds, setContactIds] = useState<string[]>([]);
  const [sort, setSort] = useState<DealSort>("createdAtDesc");
  const [page, setPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const dealCreatedRef = useRef(false);

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
    void navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate]);
  const filteredContactOptions = useMemo(() => {
    const contactOptions = contactOptionsQuery.data ?? [];
    return companyIds.length > 0
      ? contactOptions.filter((contact) => companyIds.includes(contact.companyId))
      : contactOptions;
  }, [companyIds, contactOptionsQuery.data]);
  const displayTimeZone = user?.timeZone ?? getBrowserTimeZoneFallback();
  const hasFilter =
    activeTab !== "ALL" ||
    search.trim().length > 0 ||
    companyIds.length > 0 ||
    contactIds.length > 0 ||
    sort !== "createdAtDesc";

  useEffect(() => {
    if (initialCreateOpen) {
      setIsCreateOpen(true);
    }
  }, [initialCreateOpen]);

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

  const onSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const clearFilters = () => {
    setActiveTab("ALL");
    setSearch("");
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

  const getStageCount = (tab: StageTab): number => {
    const counts = stageCountsQuery.data?.items ?? [];
    if (tab === "ALL") return counts.reduce((sum, c) => sum + c.count, 0);
    return counts.find((c) => c.dealStatus === tab)?.count ?? 0;
  };

  return (
    <>
      {/* ── Desktop ── */}
      <section className="hidden min-h-full flex-col md:flex">
        {/* PageHeader */}
        <PageHeader
          breadcrumbs={[{ label: "딜", icon: BriefcaseBusiness }]}
          actions={[
            {
              icon: Download,
              tooltip: "액셀 다운로드",
              onClick: () => void onExport(),
              disabled: isExporting,
            },
            {
              icon: Plus,
              tooltip: "새 딜 추가",
              onClick: () => void navigate("/deals/new"),
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
              message={notice}
              onClose={() => setNotice(null)}
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
                    ? "border-[#2563EB] text-[#2563EB]"
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
                      ? "bg-[#EFF6FF] text-[#2563EB]"
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
        {dealsQuery.isLoading ? (
          <DesktopLoadingState />
        ) : dealsQuery.isError ? (
          <div className="flex gap-3 overflow-x-auto px-5 pb-3 pt-3 xl:gap-5">
            <div className="flex min-w-0 flex-1 flex-col gap-3">
              <ErrorState onRetry={() => void dealsQuery.refetch()} />
            </div>
          </div>
        ) : (
          <div className="flex gap-3 overflow-x-auto px-5 pb-3 pt-3 xl:gap-5">
            {/* Deal List */}
            <div className="flex min-w-0 flex-1 flex-col gap-3">
              {/* Controls bar — 한 줄 */}
              <div className="flex shrink-0 items-center gap-1.5 px-0.5 lg:gap-2">
                <div className="flex h-8 w-[clamp(120px,18vw,220px)] shrink-0 items-center gap-1.5 rounded-md border border-[#E2E5EC] bg-[#FAFAF8] px-3 transition focus-within:border-[#93C5FD] focus-within:bg-white">
                  <Search className="h-3 w-3 shrink-0 text-[#9CA3AF]" />
                  <input
                    className="min-w-0 flex-1 bg-transparent text-[13px] text-[#111827] outline-none placeholder:text-[#9CA3AF]"
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="딜명 검색"
                    value={search}
                  />
                </div>
                <button
                  className={cn(
                    "inline-flex h-8 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-[6px] border px-3 text-[13px] transition",
                    !hasFilter
                      ? "border-[#C7D7FE] bg-[#EAF2FF] font-bold text-[#1D4ED8]"
                      : "border-[#E6EAF0] bg-white font-medium text-[#475569] hover:bg-[#F9FAFB]",
                  )}
                  onClick={clearFilters}
                  type="button"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  초기화
                </button>
                <DealFilterMultiSelect
                  emptyText="조건에 맞는 회사가 없습니다."
                  getLabel={(company) => company.companyName}
                  itemKindLabel="회사"
                  items={companyOptionsQuery.data ?? []}
                  selectedIds={companyIds}
                  onSelectedIdsChange={onCompanyIdsChange}
                />
                <DealFilterMultiSelect
                  emptyText="조건에 맞는 담당자가 없습니다."
                  getLabel={(contact) => contact.label}
                  itemKindLabel="담당자"
                  items={filteredContactOptions}
                  selectedIds={contactIds}
                  onSelectedIdsChange={onContactIdsChange}
                />
                <ListFilterSelect
                  active={sort !== "createdAtDesc"}
                  ariaLabel="정렬 조건"
                  className="w-[clamp(112px,12vw,144px)]"
                  onChange={onSortChange}
                  options={SORT_OPTIONS}
                  value={sort}
                />
                <div className="flex-1" />
                <span className="shrink-0 text-[12px] text-[#9CA3AF]">
                  {dealsQuery.data?.totalCount ?? 0}건
                </span>
              </div>

              <div className="flex w-full min-w-[600px] flex-col overflow-hidden rounded-lg border border-[#E2E5EC] bg-white shadow-sm">
                {/* Table header */}
                <div
                  className="grid h-11 shrink-0 items-center border-b border-[#E2E5EC] bg-[#F9FAFB] px-3 md:px-4 xl:px-6"
                  style={DEAL_TABLE_GRID_STYLE}
                >
                  <TableHeaderCell>딜명</TableHeaderCell>
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
                    actionLabel="딜 추가"
                    icon={BriefcaseBusiness}
                    onAction={() => setIsCreateOpen(true)}
                    title={
                      hasFilter
                        ? "조건에 맞는 딜이 없습니다"
                        : "등록된 딜이 없습니다"
                    }
                  />
                ) : (
                  <div className="min-w-0">
                    {deals.map((deal) => (
                      <DealListRow
                        deal={deal}
                        displayTimeZone={displayTimeZone}
                        key={deal.id}
                        onSelect={(dealId) => void navigate(`/deals/${dealId}`)}
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
            </div>
          </div>
        )}
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
                      ? "border-[#2563EB] text-[#2563EB]"
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
                        ? "bg-[#EFF6FF] text-[#2563EB]"
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
            aria-label="액셀 다운로드"
            className="inline-flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-md bg-[#F3F4F6] text-[#4B5563] disabled:opacity-40"
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
              actionLabel="딜 추가"
              icon={BriefcaseBusiness}
              onAction={() => setIsCreateOpen(true)}
              title={
                hasFilter ? "조건에 맞는 딜이 없습니다" : "등록된 딜이 없습니다"
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
          className="fixed bottom-24 right-5 z-40 inline-flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[#2563EB] text-white shadow-[0_4px_16px_rgba(59,130,246,0.27)] transition hover:scale-[1.02]"
          onClick={() => void navigate("/deals/new")}
          type="button"
        >
          <Plus className="h-6 w-6" />
        </button>
      </section>

      <DealCreateDialog
        onCreated={(deal) => {
          dealCreatedRef.current = true;
          setActiveTab("ALL");
          setPage(1);
          if (initialCreateOpen) {
            void navigate(`/deals/${deal.id}`, { replace: true });
          }
        }}
        onOpenChange={(open) => {
          setIsCreateOpen(open);
          if (!open && initialCreateOpen && !dealCreatedRef.current) {
            void navigate("/deals", { replace: true });
          }
        }}
        open={isCreateOpen}
      />
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
      {/* 딜명 */}
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
          className="mt-0.5 block truncate text-[11px] text-[#2563EB]"
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
      to={`/deals/${deal.id}`}
    >
      {/* Row1: 단계 배지 + 가능성 배지 자리 */}
      <div className="flex items-center justify-between gap-2">
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
        {/* 가능성 배지 — 현재 데이터 없으므로 placeholder */}
        <span className="inline-flex h-[22px] items-center rounded-full bg-[#F3F4F6] px-2 text-[11px] font-semibold text-[#6B7280]">
          중립
        </span>
      </div>

      {/* Row2: 딜명 */}
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
      return "bg-[#2563EB]";
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
      const nameWithJobGrade = jobGradeName
        ? `${contact.username} ${jobGradeName}`
        : contact.username;

      return departmentName
        ? `${nameWithJobGrade} · ${departmentName}`
        : nameWithJobGrade;
    })
    .join(", ");
}

function formatDealCompanyLabel(deal: DealListItem) {
  return deal.companies.map((company) => company.companyName).join(", ") || "-";
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
  itemKindLabel,
  items,
  selectedIds,
  onSelectedIdsChange,
}: {
  readonly emptyText: string;
  readonly getLabel: (item: TItem) => string;
  readonly itemKindLabel: string;
  readonly items: readonly TItem[];
  readonly selectedIds: readonly string[];
  readonly onSelectedIdsChange: (ids: string[]) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [filterText, setFilterText] = useState("");
  const [popoverPosition, setPopoverPosition] =
    useState<DealFilterPopoverPosition | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const selectedItems = useMemo(
    () => items.filter((item) => selectedIdSet.has(item.id)),
    [items, selectedIdSet],
  );
  const selectedSummary = getSelectedDealFilterSummary(
    selectedItems,
    getLabel,
    itemKindLabel,
  );
  const normalizedFilterText = normalizeDealFilterText(filterText.trim());
  const filteredItems =
    normalizedFilterText.length > 0
      ? items.filter((item) =>
          normalizeDealFilterText(getLabel(item)).includes(normalizedFilterText),
        )
      : items;
  const inputValue = isOpen ? filterText : selectedSummary;

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
      if (!inputRef.current) {
        return;
      }

      setPopoverPosition(getDealFilterPopoverPosition(inputRef.current));
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
    document.addEventListener("mousedown", onMouseDown);
    window.addEventListener("resize", updatePopoverPosition);
    window.addEventListener("scroll", updatePopoverPosition, true);

    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("resize", updatePopoverPosition);
      window.removeEventListener("scroll", updatePopoverPosition, true);
    };
  }, [isOpen]);

  const openOptions = (nextFilterText: string) => {
    setFilterText(nextFilterText);

    if (inputRef.current) {
      setPopoverPosition(getDealFilterPopoverPosition(inputRef.current));
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

  const clearSelection = () => {
    setFilterText("");
    onSelectedIdsChange([]);
    inputRef.current?.focus();
    openOptions("");
  };

  return (
    <div
      className="relative w-[clamp(136px,14vw,178px)] shrink-0"
      ref={wrapperRef}
    >
      <div className="relative">
        {isOpen ? (
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3 w-3 shrink-0 -translate-y-1/2 text-[#9CA3AF]" />
        ) : null}
        <input
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-label={`${itemKindLabel} 필터`}
          autoComplete="off"
          className={cn(
            "h-8 w-full min-w-0 border text-[13px] outline-none transition",
            isOpen
              ? "rounded-full border-[#2563EB] bg-white pl-8 pr-7 text-[#111827] ring-1 ring-[#2563EB]"
              : selectedIds.length > 0
                ? "rounded-full border-[#BFDBFE] bg-[#EFF6FF] pl-3.5 pr-7 font-semibold text-[#1D4ED8]"
                : "cursor-pointer rounded-full border-[#E2E5EC] bg-transparent pl-3.5 pr-7 text-[#6B7280] hover:border-[#D1D5DB] hover:bg-[#FAFAF8]",
          )}
          onChange={(event) => openOptions(event.target.value)}
          onFocus={() => openOptions("")}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setIsOpen(false);
              setFilterText("");
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
          ref={inputRef}
          value={inputValue}
        />
        {selectedIds.length > 0 || filterText ? (
          <button
            aria-label={`${itemKindLabel} 필터 지우기`}
            className="absolute right-1 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full text-[#9CA3AF] transition hover:bg-white hover:text-[#374151]"
            onClick={clearSelection}
            type="button"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : (
          <ChevronDown
            className={cn(
              "pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9CA3AF] transition-transform",
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
                        isSelected ? "border-[#2563EB]" : "border-[#CBD5E1]",
                      )}
                    >
                      {isSelected ? (
                        <span className="h-1.5 w-1.5 rounded-full bg-[#2563EB]" />
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
  input: HTMLInputElement,
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

function getSelectedDealFilterSummary<TItem extends DealFilterItem>(
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

function normalizeDealFilterText(value: string) {
  return value.trim().toLocaleLowerCase("ko-KR");
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
          딜 목록을 불러오지 못했습니다.
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
    <div className="flex gap-3 overflow-x-auto px-5 pb-3 pt-3 xl:gap-5">
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="flex h-10 shrink-0 items-center gap-2 px-0.5">
          <div className="h-7 w-20 animate-pulse rounded-md bg-gray-100" />
          <div className="h-7 w-14 animate-pulse rounded-md bg-gray-100" />
          <div className="h-7 w-16 animate-pulse rounded-md bg-gray-100" />
          <div className="flex-1" />
          <div className="h-4 w-8 animate-pulse rounded bg-gray-100" />
        </div>
        <div className="flex w-full min-w-[600px] flex-col overflow-hidden rounded-lg border border-[#E2E5EC] bg-white shadow-sm">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              className="h-[66px] animate-pulse border-b border-[#E2E5EC] bg-[#F9FAFB] last:border-b-0"
              key={i}
            />
          ))}
        </div>
      </div>
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
