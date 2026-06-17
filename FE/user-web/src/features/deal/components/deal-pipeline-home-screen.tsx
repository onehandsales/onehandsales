// 기능 : 딜 파이프라인 홈 화면 — split view (Desktop) / 카드 (Mobile)
import { AlertCircle, BriefcaseBusiness, Download, Plus, Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/layout/page-header";
import { ListEmptyState } from "@/components/ui/state";
import { useAuthSession } from "@/features/auth";
import { DealCreateDialog } from "@/features/deal/components/deal-create-dialog";
import { DealDetailPanel } from "@/features/deal/components/deal-detail-panel";
import {
  useDealCompanyOptions,
  useDealContactOptions,
} from "@/features/deal/hooks/use-deal-entity-options";
import { useDealList, useDealStageCounts } from "@/features/deal/hooks/use-deal-list";
import { exportDealsXlsx } from "@/features/deal/api/deal-api";
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

type StageTab = "ALL" | DealStatus;

const stageTabs: Array<{ readonly value: StageTab; readonly label: string }> = [
  { value: "ALL", label: "전체" },
  ...DEAL_STATUS_LIST.map((s) => ({ value: s as StageTab, label: DEAL_STATUS_LABEL[s] })),
];

const SORT_OPTIONS: Array<{ readonly value: DealSort; readonly label: string }> = [
  { value: "createdAtDesc", label: "최신순" },
  { value: "dealCostDesc", label: "금액 높은순" },
  { value: "dealCostAsc", label: "금액 낮은 순" },
  { value: "expectedEndDateAsc", label: "마감일순" },
];

type DealPipelineHomeScreenProps = {
  readonly initialCreateOpen?: boolean;
};

export function DealPipelineHomeScreen({
  initialCreateOpen = false,
}: DealPipelineHomeScreenProps) {
  const navigate = useNavigate();
  const { user } = useAuthSession();
  const [activeTab, setActiveTab] = useState<StageTab>("ALL");
  const [search, setSearch] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [contactId, setContactId] = useState("");
  const [sort, setSort] = useState<DealSort>("createdAtDesc");
  const [page, setPage] = useState(1);
  const [selectedDealId, setSelectedDealId] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const searchQuery = search.trim() || undefined;
  const companyFilter = companyId || undefined;
  const contactFilter = contactId || undefined;

  const companyOptionsQuery = useDealCompanyOptions();
  const contactOptionsQuery = useDealContactOptions();
  const stageCountsQuery = useDealStageCounts({
    search: searchQuery,
    companyId: companyFilter,
    contactId: contactFilter,
  });
  const dealsQuery = useDealList({
    page,
    search: searchQuery,
    companyId: companyFilter,
    contactId: contactFilter,
    dealStatus: activeTab === "ALL" ? undefined : activeTab,
    sort,
  });

  const deals = useMemo(
    () => dealsQuery.data?.items ?? [],
    [dealsQuery.data?.items]
  );
  const filteredContactOptions = useMemo(
    () => {
      const contactOptions = contactOptionsQuery.data ?? [];
      return companyId
        ? contactOptions.filter((contact) => contact.companyId === companyId)
        : contactOptions;
    },
    [companyId, contactOptionsQuery.data]
  );
  const displayTimeZone = user?.timeZone ?? getBrowserTimeZoneFallback();
  const hasFilter =
    activeTab !== "ALL" ||
    search.trim().length > 0 ||
    companyId.length > 0 ||
    contactId.length > 0 ||
    sort !== "createdAtDesc";

  // 기능 : 사용자가 클릭한 딜이 현재 목록에서 사라진 경우에만 상세 선택을 해제합니다.
  useEffect(() => {
    if (selectedDealId && !deals.some((deal) => deal.id === selectedDealId)) {
      setSelectedDealId("");
    }
  }, [deals, selectedDealId]);

  useEffect(() => {
    if (initialCreateOpen) {
      setIsCreateOpen(true);
    }
  }, [initialCreateOpen]);

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
    setCompanyId("");
    setContactId("");
    setSort("createdAtDesc");
    setPage(1);
  };

  const onCompanyChange = (value: string) => {
    setCompanyId(value);
    setContactId("");
    setPage(1);
  };

  const onContactChange = (value: string) => {
    setContactId(value);
    setPage(1);
  };

  const onSortChange = (value: DealSort) => {
    setSort(value);
    setPage(1);
  };

  const onExport = async () => {
    setIsExporting(true);
    try {
      const { blob, fileName } = await exportDealsXlsx({
        search: searchQuery,
        companyId: companyFilter,
        contactId: contactFilter,
        dealStatus: activeTab === "ALL" ? undefined : activeTab,
        sort,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName ?? "deals.xlsx";
      a.click();
      URL.revokeObjectURL(url);
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
              icon: Plus,
              tooltip: "새 딜 추가",
              onClick: () => void navigate("/deals/new"),
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
                    : "border-transparent text-[#6B7280] hover:text-[#111827]"
                )}
                key={tab.value}
                onClick={() => onTabChange(tab.value)}
                type="button"
              >
                {tab.label}
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[11px] font-semibold",
                    isActive ? "bg-[#EFF6FF] text-[#2563EB]" : "bg-[#F3F4F6] text-[#6B7280]"
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
          <div className="flex gap-5 px-5 pb-3 pt-3">
            <div className="flex min-w-0 flex-1 flex-col gap-3">
              <ErrorState onRetry={() => void dealsQuery.refetch()} />
            </div>
          </div>
        ) : (
          <div className="flex gap-5 px-5 pb-3 pt-3">
            {/* Deal List */}
            <div className="flex min-w-0 flex-1 flex-col gap-3">
              {/* Controls bar — 한 줄 */}
              <div className="flex shrink-0 items-center gap-2 px-0.5">
                <div className="flex h-8 items-center gap-1.5 rounded-md border border-[#E2E5EC] bg-[#FAFAF8] px-3 transition focus-within:border-[#93C5FD] focus-within:bg-white">
                  <Search className="h-3 w-3 shrink-0 text-[#9CA3AF]" />
                  <input
                    className="w-[220px] bg-transparent text-[13px] text-[#111827] outline-none placeholder:text-[#9CA3AF]"
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="딜명 검색"
                    value={search}
                  />
                </div>
                <button
                  className={cn(
                    "inline-flex h-8 items-center rounded-[6px] border px-3 text-[13px] transition",
                    !hasFilter
                      ? "border-[#C7D7FE] bg-[#EAF2FF] font-bold text-[#1D4ED8]"
                      : "border-[#E6EAF0] bg-white font-medium text-[#475569] hover:bg-[#F9FAFB]"
                  )}
                  onClick={clearFilters}
                  type="button"
                >
                  전체
                </button>
                <select
                  aria-label="회사 필터"
                  className={cn(
                    "h-8 min-w-[140px] appearance-none rounded-md border px-3 text-[13px] outline-none transition",
                    companyId
                      ? "border-[#BFDBFE] bg-[#EFF6FF] text-[#1D4ED8]"
                      : "border-[#E2E5EC] bg-transparent text-[#6B7280] hover:bg-[#FAFAF8]"
                  )}
                  onChange={(e) => onCompanyChange(e.target.value)}
                  value={companyId}
                >
                  <option value="">회사</option>
                  {(companyOptionsQuery.data ?? []).map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.companyName}
                    </option>
                  ))}
                </select>
                <select
                  aria-label="담당자 필터"
                  className={cn(
                    "h-8 min-w-[140px] appearance-none rounded-md border px-3 text-[13px] outline-none transition",
                    contactId
                      ? "border-[#BFDBFE] bg-[#EFF6FF] text-[#1D4ED8]"
                      : "border-[#E2E5EC] bg-transparent text-[#6B7280] hover:bg-[#FAFAF8]"
                  )}
                  onChange={(e) => onContactChange(e.target.value)}
                  value={contactId}
                >
                  <option value="">담당자</option>
                  {filteredContactOptions.map((contact) => (
                    <option key={contact.id} value={contact.id}>
                      {contact.label}
                    </option>
                  ))}
                </select>
                <select
                  aria-label="정렬 조건"
                  className={cn(
                    "h-8 min-w-[136px] appearance-none rounded-md border px-3 text-[13px] outline-none transition",
                    sort !== "createdAtDesc"
                      ? "border-[#BFDBFE] bg-[#EFF6FF] text-[#1D4ED8]"
                      : "border-[#E2E5EC] bg-transparent text-[#6B7280] hover:bg-[#FAFAF8]"
                  )}
                  onChange={(e) => onSortChange(e.target.value as DealSort)}
                  value={sort}
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <div className="flex-1" />
                <span className="shrink-0 text-[12px] text-[#9CA3AF]">
                  {dealsQuery.data?.totalCount ?? 0}건
                </span>
              </div>

              <div className="flex flex-col rounded-lg border border-[#E2E5EC] bg-white shadow-sm">
                {/* Table header */}
                <div className="flex h-11 shrink-0 items-center border-b border-[#E2E5EC] bg-[#F9FAFB] px-6">
                  <TableHeaderCell width={170}>딜명</TableHeaderCell>
                  <TableHeaderCell width={180}>회사/담당자</TableHeaderCell>
                  <TableHeaderCell width={96}>단계</TableHeaderCell>
                  <TableHeaderCell width={104}>금액</TableHeaderCell>
                  <TableHeaderCell width={190}>다음 행동 마감일</TableHeaderCell>
                  <TableHeaderCell align="right" width={104}>등록일</TableHeaderCell>
                  <div className="min-w-0 flex-1" />
                </div>

                {/* Rows */}
                {deals.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-sm text-gray-400">
                    <p>표시할 딜이 없습니다.</p>
                    <button
                      className="mt-3 inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-4 text-sm font-medium text-white"
                      onClick={() => setIsCreateOpen(true)}
                      type="button"
                    >
                      <Plus className="h-4 w-4" />딜 추가
                    </button>
                  </div>
                ) : (
                  deals.map((deal) => (
                    <DealListRow
                      deal={deal}
                      displayTimeZone={displayTimeZone}
                      isActive={deal.id === selectedDealId}
                      key={deal.id}
                      onSelect={setSelectedDealId}
                    />
                  ))
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

            {/* Right Detail Panel */}
            {selectedDealId ? (
              <div className="flex w-[380px] shrink-0 flex-col rounded-lg border border-[#E5EAF0] bg-white">
                <div className="flex h-11 shrink-0 items-center justify-between border-b border-[#E6EAF0] px-4">
                  <div className="flex items-center gap-2">
                    <button
                      aria-label="미리보기 닫기"
                      className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-[#E2E5EC] text-[#64748B] transition hover:bg-blue-50/60 hover:text-[#2563EB]"
                      onClick={() => setSelectedDealId("")}
                      title="닫기"
                      type="button"
                    >
                      <X className="h-3.5 w-3.5" strokeWidth={2} />
                    </button>
                    <span className="text-[12px] font-medium text-[#6B7280]">미리보기</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Link
                      className="inline-flex h-7 items-center gap-1 rounded-md border border-[#E2E5EC] bg-white px-2.5 text-[12px] font-medium text-[#374151] transition hover:bg-[#F5F6F8]"
                      to={`/deals/${selectedDealId}`}
                    >
                      상세
                    </Link>
                  </div>
                </div>
                <DealDetailPanel dealId={selectedDealId} variant="panel" />
              </div>
            ) : null}
          </div>
        )}
      </section>

      {/* ── Mobile ── */}
      <section className="md:hidden">
        <div className="overflow-x-auto border-b border-[#E6EAF0] bg-white">
          <div className="flex gap-0 px-2">
            {stageTabs.map((tab) => {
              const count = getStageCount(tab.value);
              const isActive = activeTab === tab.value;
              return (
                <button
                  className={cn(
                    "flex h-11 shrink-0 items-center gap-1 border-b-2 px-3 text-[13px] font-medium transition-colors",
                    isActive
                      ? "border-primary text-primary"
                      : "border-transparent text-gray-500"
                  )}
                  key={tab.value}
                  onClick={() => onTabChange(tab.value)}
                  type="button"
                >
                  {tab.label}
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0.5 text-[11px] font-semibold",
                      isActive ? "bg-primary/10 text-primary" : "bg-gray-100 text-gray-500"
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 검색 + 정렬 */}
        <div className="grid gap-2 border-b border-[#E6EAF0] px-4 py-2">
          <input
            className="h-8 w-full rounded-md border border-[#E6EAF0] px-2 text-[12px] outline-none placeholder:text-gray-400 focus:border-primary"
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="딜명 검색"
            value={search}
          />
          <button
            className={cn(
              "inline-flex h-8 w-full items-center justify-center rounded-[6px] border px-3 text-[13px] transition",
              !hasFilter
                ? "border-[#C7D7FE] bg-[#EAF2FF] font-bold text-[#1D4ED8]"
                : "border-[#E6EAF0] bg-white font-medium text-[#475569] hover:bg-[#F9FAFB]"
            )}
            onClick={clearFilters}
            type="button"
          >
            전체
          </button>
          <select
            aria-label="회사 필터"
            className={cn(
              "h-8 w-full appearance-none rounded-md border px-2 text-[12px] outline-none transition",
              companyId
                ? "border-[#BFDBFE] bg-[#EFF6FF] text-[#1D4ED8]"
                : "border-[#E6EAF0] bg-white text-gray-500 focus:border-primary"
            )}
            onChange={(e) => onCompanyChange(e.target.value)}
            value={companyId}
          >
            <option value="">회사</option>
            {(companyOptionsQuery.data ?? []).map((company) => (
              <option key={company.id} value={company.id}>
                {company.companyName}
              </option>
            ))}
          </select>
          <select
            aria-label="담당자 필터"
            className={cn(
              "h-8 w-full appearance-none rounded-md border px-2 text-[12px] outline-none transition",
              contactId
                ? "border-[#BFDBFE] bg-[#EFF6FF] text-[#1D4ED8]"
                : "border-[#E6EAF0] bg-white text-gray-500 focus:border-primary"
            )}
            onChange={(e) => onContactChange(e.target.value)}
            value={contactId}
          >
            <option value="">담당자</option>
            {filteredContactOptions.map((contact) => (
              <option key={contact.id} value={contact.id}>
                {contact.label}
              </option>
            ))}
          </select>
          <select
            aria-label="정렬 조건"
            className={cn(
              "h-8 w-full appearance-none rounded-md border px-2 text-[12px] outline-none transition",
              sort !== "createdAtDesc"
                ? "border-[#BFDBFE] bg-[#EFF6FF] text-[#1D4ED8]"
                : "border-[#E6EAF0] bg-white text-gray-500 focus:border-primary"
            )}
            onChange={(e) => onSortChange(e.target.value as DealSort)}
            value={sort}
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

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
            className="min-h-[280px] -translate-y-7"
            icon={BriefcaseBusiness}
            onAction={() => setIsCreateOpen(true)}
            title={hasFilter ? "조건에 맞는 딜이 없습니다" : "등록된 딜이 없습니다"}
          />
        ) : (
          <>
            <div className="grid gap-3 px-4 py-4 pb-4">
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

        <button
          className="fixed bottom-24 right-5 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full bg-fab text-fab-foreground shadow-fab transition hover:scale-[1.02]"
          onClick={() => setIsCreateOpen(true)}
          type="button"
        >
          <Plus className="h-6 w-6" />
        </button>
      </section>

      <DealCreateDialog
        onCreated={() => {
          setActiveTab("ALL");
          setPage(1);
        }}
        onOpenChange={setIsCreateOpen}
        open={isCreateOpen}
      />
    </>
  );
}

// ── 테이블 행 ──

function DealListRow({
  deal,
  displayTimeZone,
  isActive,
  onSelect,
}: {
  readonly deal: DealListItem;
  readonly displayTimeZone: string;
  readonly isActive: boolean;
  readonly onSelect: (id: string) => void;
}) {
  const contactLabel = formatDealContactLabel(deal);

  return (
    <button
      className={cn(
        "flex h-[66px] w-full items-center border-b border-[#E2E5EC] px-6 py-0 text-left transition-colors last:border-b-0 hover:bg-blue-50/60",
        isActive ? "bg-blue-50" : "bg-white"
      )}
      onClick={() => onSelect(deal.id)}
      type="button"
    >
      {/* 딜명 */}
      <div className="min-w-0 shrink-0" style={{ width: 170 }}>
        <span className="block truncate text-[13px] font-semibold text-gray-900">
          {deal.dealName}
        </span>
      </div>

      {/* 회사/담당자 */}
      <div className="min-w-0 shrink-0 pr-3" style={{ width: 180 }}>
        <span className="block truncate text-[12px] font-semibold text-[#111827]" title={deal.company.companyName}>
          {deal.company.companyName}
        </span>
        <span className="mt-0.5 block truncate text-[11px] font-medium text-[#2563EB]" title={contactLabel}>
          {contactLabel}
        </span>
      </div>

      {/* 단계 */}
      <div className="min-w-0 shrink-0" style={{ width: 96 }}>
        <span className={cn("inline-flex h-6 items-center rounded-full px-2 text-[11px] font-semibold", getDealStatusClass(deal.dealStatus))}>
          {deal.dealStatusLabel}
        </span>
      </div>

      {/* 금액 */}
      <div className="min-w-0 shrink-0" style={{ width: 104 }}>
        <span className="block truncate text-[12px] font-semibold text-gray-900">
          {deal.dealCost.toLocaleString("ko-KR")}원
        </span>
      </div>

      {/* 다음 행동 마감일 */}
      <div className="min-w-0 shrink-0 pr-3" style={{ width: 190 }}>
        <span
          className="block truncate text-[12px] font-semibold text-[#111827]"
          title={formatDealDateOnly(deal.expectedEndDate)}
        >
          {formatDealDateOnly(deal.expectedEndDate)}
        </span>
      </div>

      {/* 등록일 */}
      <div className="min-w-0 shrink-0 text-right" style={{ width: 104 }}>
        <span className="block truncate text-[11px] font-medium text-[#64748B]">
          {formatDealCreatedAt(deal.createdAt, displayTimeZone)}
        </span>
      </div>

      <div className="min-w-0 flex-1" />
    </button>
  );
}

// ── 모바일 카드 ──

function MobileDealCard({
  deal,
  displayTimeZone,
}: {
  readonly deal: DealListItem;
  readonly displayTimeZone: string;
}) {
  const contactLabel = formatDealContactLabel(deal);

  return (
    <Link
      className="block rounded-2xl border border-border/70 bg-white p-4 shadow-sm transition hover:-translate-y-0.5"
      to={`/deals/${deal.id}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h2 className="mt-0.5 truncate text-[15px] font-semibold text-foreground">
            {deal.dealName}
          </h2>
          <div className="mt-1 min-w-0">
            <p className="truncate text-[12px] font-semibold text-[#111827]">{deal.company.companyName}</p>
            <p className="truncate text-[12px] font-medium text-[#2563EB]">{contactLabel}</p>
          </div>
        </div>
        <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold", getDealStatusClass(deal.dealStatus))}>
          {deal.dealStatusLabel}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
        <div>
          <p className="text-[11px] text-muted-foreground">금액</p>
          <p className="truncate font-semibold">{deal.dealCost.toLocaleString("ko-KR")}원</p>
        </div>
        <div className="min-w-0">
          <p className="text-[11px] text-muted-foreground">다음 행동 마감일</p>
          <p className="truncate font-semibold">{formatDealDateOnly(deal.expectedEndDate)}</p>
        </div>
        <div>
          <p className="text-[11px] text-muted-foreground">등록일</p>
          <p className="truncate font-semibold">{formatDealCreatedAt(deal.createdAt, displayTimeZone)}</p>
        </div>
      </div>
    </Link>
  );
}

// ── 유틸 ──

function getDealStatusClass(status: DealStatus): string {
  switch (status) {
    case "INITIAL_CONTACT": return "bg-sky-100 text-sky-700";
    case "NEEDS_CHECK": return "bg-blue-100 text-blue-700";
    case "PROPOSAL_QUOTE": return "bg-yellow-100 text-yellow-700";
    case "NEGOTIATION": return "bg-amber-100 text-amber-700";
    case "WON": return "bg-emerald-100 text-emerald-700";
    case "LOST": return "bg-rose-100 text-rose-700";
  }
}

function formatDealContactLabel(deal: DealListItem) {
  const departmentName = deal.contact.contactDepartment.departmentName.trim();
  return departmentName
    ? `${deal.contact.username} ${departmentName}`
    : deal.contact.username;
}

function formatDealCreatedAt(value: string, timeZone: string) {
  return formatDateWithOptions(value, {
    day: "2-digit",
    month: "2-digit",
    timeZone,
    year: "numeric",
  });
}

function formatDealDateOnly(value: string) {
  const [year, month, day] = value.slice(0, 10).split("-");

  if (!year || !month || !day) {
    return value || "-";
  }

  return `${year}. ${month}. ${day}.`;
}

function getBrowserTimeZoneFallback() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Seoul";
  } catch {
    return "Asia/Seoul";
  }
}

function TableHeaderCell({
  children,
  width,
  flex = false,
  align = "left",
}: {
  readonly children: string;
  readonly width?: number;
  readonly flex?: boolean;
  readonly align?: "left" | "right";
}) {
  return (
    <div
      className={cn(
        "shrink-0 text-[12px] font-semibold text-[#64748B]",
        flex && "min-w-0 flex-1",
        align === "right" && "text-right"
      )}
      style={width ? { width } : undefined}
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
        <h2 className="text-sm font-semibold">딜 목록을 불러오지 못했습니다.</h2>
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
    <div className="flex gap-5 px-5 pb-3 pt-3">
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="flex h-10 shrink-0 items-center gap-2 px-0.5">
          <div className="h-7 w-20 animate-pulse rounded-md bg-gray-100" />
          <div className="h-7 w-14 animate-pulse rounded-md bg-gray-100" />
          <div className="h-7 w-16 animate-pulse rounded-md bg-gray-100" />
          <div className="flex-1" />
          <div className="h-4 w-8 animate-pulse rounded bg-gray-100" />
        </div>
        <div className="flex flex-col rounded-lg border border-[#E2E5EC] bg-white shadow-sm">
          {Array.from({ length: 6 }).map((_, i) => (
            <div className="h-[66px] animate-pulse border-b border-[#E2E5EC] bg-[#F9FAFB] last:border-b-0" key={i} />
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
