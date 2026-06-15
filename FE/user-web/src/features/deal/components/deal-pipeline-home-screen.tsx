// 기능 : 딜 파이프라인 홈 화면 — split view (Desktop) / 카드 (Mobile)
import { AlertCircle, BriefcaseBusiness, Download, Plus, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/layout/page-header";
import { FilterChip, FilterChipGroup } from "@/components/ui/filter-chip";
import { DealCreateDialog } from "@/features/deal/components/deal-create-dialog";
import { DealDetailPanel } from "@/features/deal/components/deal-detail-panel";
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

type StageTab = "ALL" | DealStatus;

const stageTabs: Array<{ readonly value: StageTab; readonly label: string }> = [
  { value: "ALL", label: "전체" },
  ...DEAL_STATUS_LIST.map((s) => ({ value: s as StageTab, label: DEAL_STATUS_LABEL[s] })),
];

const SORT_OPTIONS: Array<{ readonly value: DealSort; readonly label: string }> = [
  { value: "createdAtDesc", label: "최신순" },
  { value: "dealCostDesc", label: "금액 높은순" },
  { value: "dealCostAsc", label: "금액 낮은순" },
  { value: "expectedEndDateAsc", label: "마감일 빠른순" },
];

type DealPipelineHomeScreenProps = {
  readonly initialCreateOpen?: boolean;
};

export function DealPipelineHomeScreen({
  initialCreateOpen = false,
}: DealPipelineHomeScreenProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<StageTab>("ALL");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<DealSort>("createdAtDesc");
  const [page, setPage] = useState(1);
  const [selectedDealId, setSelectedDealId] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const stageCountsQuery = useDealStageCounts();
  const dealsQuery = useDealList({
    page,
    search: search.trim() || undefined,
    dealStatus: activeTab === "ALL" ? undefined : activeTab,
    sort,
  });

  const deals = useMemo(
    () => dealsQuery.data?.items ?? [],
    [dealsQuery.data?.items]
  );

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

  const onSortChange = (value: DealSort) => {
    setSort(value);
    setPage(1);
  };

  const onExport = async () => {
    setIsExporting(true);
    try {
      const { blob, fileName } = await exportDealsXlsx({
        search: search.trim() || undefined,
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
      <section className="hidden flex-1 flex-col overflow-hidden md:flex">
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
          <div className="absolute bottom-0 left-0 right-0 h-px bg-[#E6EAF0]" />
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
          <div className="p-6">
            <ErrorState onRetry={() => void dealsQuery.refetch()} />
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 gap-5 overflow-hidden px-6 py-5">
            {/* Deal List */}
            <div className="flex min-w-0 flex-1 flex-col gap-3 overflow-hidden">
              {/* Controls bar — 한 줄 */}
              <div className="flex shrink-0 items-center gap-2 px-0.5">
                <div className="flex h-8 items-center gap-1.5 rounded-md border border-[#E2E5EC] bg-[#FAFAF8] px-3 transition focus-within:border-[#93C5FD] focus-within:bg-white">
                  <input
                    className="w-[220px] bg-transparent text-[13px] text-[#111827] outline-none placeholder:text-[#9CA3AF]"
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="딜명 검색"
                    value={search}
                  />
                </div>
                <FilterChipGroup className="flex-nowrap overflow-x-auto">
                  {SORT_OPTIONS.map((opt) => (
                    <FilterChip
                      active={sort === opt.value}
                      key={opt.value}
                      onClick={() => onSortChange(opt.value)}
                    >
                      {opt.label}
                    </FilterChip>
                  ))}
                </FilterChipGroup>
                <div className="flex-1" />
                <span className="shrink-0 text-[12px] text-[#9CA3AF]">
                  {dealsQuery.data?.totalCount ?? 0}건
                </span>
              </div>

              <div className="flex min-h-0 flex-col overflow-hidden rounded-lg border border-[#E2E5EC] bg-white shadow-sm">
                {/* Table header */}
                <div
                  className="flex shrink-0 items-center border-b border-[#E6EAF0] bg-[#FAFBFC] px-6"
                  style={{ height: 44 }}
                >
                  <TableHeaderCell width={220}>딜명</TableHeaderCell>
                  <TableHeaderCell width={170}>회사</TableHeaderCell>
                  <TableHeaderCell width={150}>거래처</TableHeaderCell>
                  <TableHeaderCell width={110}>단계</TableHeaderCell>
                  <TableHeaderCell width={130}>금액</TableHeaderCell>
                  <div className="min-w-0 flex-1" />
                </div>

                {/* Rows */}
                <div className="overflow-y-auto">
                  {deals.length === 0 ? (
                    <div className="flex flex-col items-center py-12 text-sm text-gray-400">
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
                        isActive={deal.id === selectedDealId}
                        key={deal.id}
                        onSelect={setSelectedDealId}
                      />
                    ))
                  )}
                </div>
              </div>

              {dealsQuery.data ? (
                <Pagination
                  onPageChange={setPage}
                  page={page}
                  totalPages={dealsQuery.data.totalPages ?? 1}
                  className="py-3"
                />
              ) : null}
            </div>

            {/* Right Detail Panel */}
            {selectedDealId ? (
              <div className="flex w-[380px] shrink-0 flex-col overflow-hidden rounded-lg border border-[#E5EAF0] bg-white">
                <div className="shrink-0 flex items-center justify-between border-b border-[#E6EAF0] px-4 py-2.5">
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
                <div className="flex-1 overflow-y-auto">
                  <DealDetailPanel dealId={selectedDealId} variant="panel" />
                </div>
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
          <FilterChipGroup className="flex-nowrap overflow-x-auto pb-0.5">
            {SORT_OPTIONS.map((opt) => (
              <FilterChip
                active={sort === opt.value}
                key={opt.value}
                onClick={() => onSortChange(opt.value)}
              >
                {opt.label}
              </FilterChip>
            ))}
          </FilterChipGroup>
        </div>

        {dealsQuery.isLoading ? (
          <MobileLoadingState />
        ) : dealsQuery.isError ? (
          <div className="px-4 pt-4">
            <ErrorState onRetry={() => void dealsQuery.refetch()} />
          </div>
        ) : deals.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-sm text-gray-400">
            <p>표시할 딜이 없습니다.</p>
          </div>
        ) : (
          <>
            <div className="grid gap-3 px-4 py-4 pb-4">
              {deals.map((deal) => (
                <MobileDealCard deal={deal} key={deal.id} />
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
  isActive,
  onSelect,
}: {
  readonly deal: DealListItem;
  readonly isActive: boolean;
  readonly onSelect: (id: string) => void;
}) {
  return (
    <button
      className={cn(
        "flex w-full items-center border-b border-[#E8EDF3] px-6 py-0 text-left transition-colors hover:bg-blue-50/60",
        isActive ? "bg-blue-50" : "bg-white"
      )}
      onClick={() => onSelect(deal.id)}
      style={{ height: 66 }}
      type="button"
    >
      {/* 딜명 */}
      <div className="min-w-0 shrink-0" style={{ width: 220 }}>
        <span className="block truncate text-[13px] font-semibold text-gray-900">
          {deal.dealName}
        </span>
      </div>

      {/* 회사 */}
      <div className="min-w-0 shrink-0" style={{ width: 170 }}>
        <span
          className="inline-flex h-[22px] max-w-full min-w-0 items-center overflow-hidden rounded-full bg-[#F1F5F9] px-2.5 text-[11px] font-semibold text-[#475569]"
          title={deal.company.companyName}
        >
          <span className="min-w-0 truncate whitespace-nowrap">{deal.company.companyName}</span>
        </span>
      </div>

      {/* 거래처 */}
      <div className="min-w-0 shrink-0" style={{ width: 150 }}>
        <span
          className="block truncate text-[12px] font-medium text-[#2563EB]"
          title={deal.contact.username}
        >
          {deal.contact.username}
        </span>
      </div>

      {/* 단계 */}
      <div className="min-w-0 shrink-0" style={{ width: 110 }}>
        <span className={cn("inline-flex h-6 items-center rounded-full px-2 text-[11px] font-semibold", getDealStatusClass(deal.dealStatus))}>
          {deal.dealStatusLabel}
        </span>
      </div>

      {/* 금액 */}
      <div className="min-w-0 shrink-0" style={{ width: 130 }}>
        <span className="block truncate text-[12px] font-semibold text-gray-900">
          {deal.dealCost.toLocaleString("ko-KR")}원
        </span>
      </div>

      <div className="min-w-0 flex-1" />
    </button>
  );
}

// ── 모바일 카드 ──

function MobileDealCard({ deal }: { readonly deal: DealListItem }) {
  return (
    <Link
      className="block rounded-2xl border border-border/70 bg-white p-4 shadow-sm transition hover:-translate-y-0.5"
      to={`/deals/${deal.id}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{deal.company.companyName}</p>
          <h2 className="mt-0.5 truncate text-[15px] font-semibold text-foreground">
            {deal.dealName}
          </h2>
        </div>
        <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold", getDealStatusClass(deal.dealStatus))}>
          {deal.dealStatusLabel}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
        <div>
          <p className="text-[11px] text-muted-foreground">거래처</p>
          <p className="truncate font-semibold">{deal.contact.username}</p>
        </div>
        <div>
          <p className="text-[11px] text-muted-foreground">금액</p>
          <p className="truncate font-semibold">{deal.dealCost.toLocaleString("ko-KR")}원</p>
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
    <div className="flex min-h-0 flex-1 gap-5 overflow-hidden px-6 py-5">
      <div className="flex min-w-0 flex-1 flex-col gap-3 overflow-hidden">
        <div className="flex h-10 shrink-0 items-center gap-2 px-0.5">
          <div className="h-7 w-20 animate-pulse rounded-md bg-gray-100" />
          <div className="h-7 w-14 animate-pulse rounded-md bg-gray-100" />
          <div className="h-7 w-16 animate-pulse rounded-md bg-gray-100" />
          <div className="flex-1" />
          <div className="h-4 w-8 animate-pulse rounded bg-gray-100" />
        </div>
        <div className="flex min-h-0 flex-1 flex-col gap-0 overflow-hidden rounded-lg border border-[#E5EAF0] bg-white">
          {Array.from({ length: 6 }).map((_, i) => (
            <div className="h-[66px] animate-pulse border-b border-[#E8EDF3] bg-gray-50" key={i} />
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
