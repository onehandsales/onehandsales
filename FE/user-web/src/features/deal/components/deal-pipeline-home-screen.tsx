// 기능 : 딜 파이프라인 홈 화면 — split view (Desktop) / 카드 (Mobile)
import { AlertCircle, Download, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { DealCreateDialog } from "@/features/deal/components/deal-create-dialog";
import { DealDetailPanel } from "@/features/deal/components/deal-detail-panel";
import { useDealList, useDealStageCounts } from "@/features/deal/hooks/use-deal-list";
import { useExportDealsMutation } from "@/features/deal/hooks/use-deal-mutations";
import {
  DEAL_STATUS_LABEL,
  DEAL_STATUS_LIST,
  type DealListItem,
  type DealSort,
  type DealStatus,
} from "@/features/deal/types/deal";
import { getApiErrorMessage } from "@/lib/api-client";
import { Pagination } from "@/components/ui/pagination";
import { cn } from "@/utils/cn";
import { formatDate } from "@/utils/format";

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

export function DealPipelineHomeScreen() {
  const [activeTab, setActiveTab] = useState<StageTab>("ALL");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<DealSort>("createdAtDesc");
  const [page, setPage] = useState(1);
  const [selectedDealId, setSelectedDealId] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const stageCountsQuery = useDealStageCounts();
  const dealsQuery = useDealList({
    page,
    search: search.trim() || undefined,
    dealStatus: activeTab === "ALL" ? undefined : activeTab,
    sort,
  });
  const exportMutation = useExportDealsMutation();

  const deals = dealsQuery.data?.items ?? [];

  // 목록 변경 시 첫 항목 자동 선택
  useEffect(() => {
    if (deals.length === 0) {
      setSelectedDealId("");
      return;
    }
    if (!deals.some((d) => d.id === selectedDealId)) {
      setSelectedDealId(deals[0]?.id ?? "");
    }
  }, [deals, selectedDealId]);

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

  const onExport = () => {
    void exportMutation.mutateAsync({
      search: search.trim() || undefined,
      dealStatus: activeTab === "ALL" ? undefined : activeTab,
      sort,
    });
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
        {/* Stage Tabs */}
        <div className="flex shrink-0 items-end border-b border-[#E6EAF0] bg-white px-6">
          {stageTabs.map((tab) => {
            const count = getStageCount(tab.value);
            const isActive = activeTab === tab.value;
            return (
              <button
                className={cn(
                  "flex h-12 items-center gap-1.5 border-b-2 px-3.5 text-[13px] font-medium transition-colors",
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500 hover:text-gray-700"
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
            <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-lg border border-[#E5EAF0] bg-white">
              {/* Controls bar */}
              <div className="flex h-10 shrink-0 items-center gap-2 border-b border-[#E6EAF0] px-4">
                {/* 검색 */}
                <input
                  className="h-7 w-48 rounded-md border border-[#E6EAF0] px-2 text-[12px] outline-none placeholder:text-gray-400 focus:border-primary focus:ring-1 focus:ring-primary"
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="딜명 검색"
                  value={search}
                />
                {/* 정렬 */}
                <select
                  className="h-7 rounded-md border border-[#E6EAF0] px-2 text-[12px] outline-none focus:border-primary"
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
                <span className="text-[12px] text-gray-400">
                  {dealsQuery.data?.totalCount ?? 0}건
                </span>
                {/* Export */}
                <button
                  className="inline-flex h-7 items-center gap-1 rounded-md border border-[#E5E7EB] bg-white px-2.5 text-[12px] text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                  disabled={exportMutation.isPending}
                  onClick={onExport}
                  type="button"
                >
                  <Download className="h-3.5 w-3.5" />
                  {exportMutation.isPending ? "내보내는 중..." : "내보내기"}
                </button>
              </div>

              {/* Table header */}
              <div
                className="flex shrink-0 items-center border-b border-[#E6EAF0] bg-[#FAFBFC] px-6"
                style={{ height: 44 }}
              >
                <TableHeaderCell width={200}>딜명</TableHeaderCell>
                <TableHeaderCell width={140}>회사/거래처</TableHeaderCell>
                <TableHeaderCell width={100}>단계</TableHeaderCell>
                <TableHeaderCell width={110}>금액</TableHeaderCell>
                <TableHeaderCell flex>다음 행동</TableHeaderCell>
                <TableHeaderCell align="right" width={86}>마감일</TableHeaderCell>
              </div>

              {/* Rows */}
              <div className="flex-1 overflow-y-auto">
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

              {/* Pagination */}
              {(dealsQuery.data?.totalPages ?? 0) > 1 ? (
                <div className="shrink-0 border-t border-[#E6EAF0] px-4 py-2">
                  <Pagination
                    hasNext={page < (dealsQuery.data?.totalPages ?? 0)}
                    onPageChange={setPage}
                    page={page}
                  />
                </div>
              ) : null}
            </div>

            {/* Right Detail Panel */}
            <div className="flex w-[380px] shrink-0 flex-col overflow-hidden rounded-lg border border-[#E5EAF0] bg-white">
              {selectedDealId ? (
                <>
                  <div className="flex-1 overflow-y-auto">
                    <DealDetailPanel dealId={selectedDealId} variant="panel" />
                  </div>
                  <div className="shrink-0 border-t border-[#E6EAF0] px-5 py-3">
                    <Link
                      className="text-[13px] font-medium text-primary hover:underline"
                      to={`/deals/${selectedDealId}`}
                    >
                      전체 상세 열기 →
                    </Link>
                  </div>
                </>
              ) : (
                <div className="flex flex-1 items-center justify-center p-6">
                  <p className="text-sm text-gray-400">딜을 선택하면 상세 정보가 표시됩니다.</p>
                </div>
              )}
            </div>
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
        <div className="flex gap-2 border-b border-[#E6EAF0] px-4 py-2">
          <input
            className="h-8 flex-1 rounded-md border border-[#E6EAF0] px-2 text-[12px] outline-none placeholder:text-gray-400 focus:border-primary"
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="딜명 검색"
            value={search}
          />
          <select
            className="h-8 rounded-md border border-[#E6EAF0] px-2 text-[12px] outline-none focus:border-primary"
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
            {(dealsQuery.data?.totalPages ?? 0) > 1 ? (
              <div className="px-4 pb-8">
                <Pagination
                  hasNext={page < (dealsQuery.data?.totalPages ?? 0)}
                  onPageChange={setPage}
                  page={page}
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
        onCreated={(deal) => {
          setSelectedDealId(deal.id);
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
  const dlClass = getDeadlineClass(deal.expectedEndDate);

  return (
    <button
      className={cn(
        "flex w-full items-center border-b border-[#E8EDF3] px-6 py-0 text-left transition-colors hover:bg-blue-50/60",
        isActive ? "bg-blue-50" : "bg-white"
      )}
      onClick={() => onSelect(deal.id)}
      style={{ height: 62 }}
      type="button"
    >
      {/* 딜명 */}
      <div className="flex shrink-0 flex-col gap-0.5" style={{ width: 200 }}>
        <span className="truncate text-[13px] font-semibold text-gray-900">
          {deal.dealName}
        </span>
        <span className="truncate text-[11px] text-gray-400">
          {formatDate(deal.createdAt)} 등록
        </span>
      </div>

      {/* 회사/거래처 */}
      <div className="flex shrink-0 flex-col gap-0.5" style={{ width: 140 }}>
        <span className="truncate text-[12px] text-gray-700">
          {deal.company.companyName}
        </span>
        <span className="truncate text-[11px] text-gray-400">
          {deal.contact.username} {deal.contact.contactDepartment.departmentName}
        </span>
      </div>

      {/* 단계 */}
      <div className="shrink-0" style={{ width: 100 }}>
        <span className={cn("inline-flex h-6 items-center rounded-full px-2 text-[11px] font-semibold", getDealStatusClass(deal.dealStatus))}>
          {deal.dealStatusLabel}
        </span>
      </div>

      {/* 금액 */}
      <div className="shrink-0" style={{ width: 110 }}>
        <span className="text-[12px] font-medium text-gray-900">
          {deal.dealCost.toLocaleString("ko-KR")}원
        </span>
      </div>

      {/* 다음 행동 */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-[12px] text-gray-700">
          {deal.latestFollowingAction?.followingAction ?? "다음 행동 없음"}
        </p>
        {deal.latestFollowingAction ? (
          <p className={cn("text-[11px]", deal.latestFollowingAction.checkComplete ? "text-emerald-600" : "text-gray-400")}>
            {deal.latestFollowingAction.checkComplete ? "완료" : "진행 중"}
          </p>
        ) : null}
      </div>

      {/* 마감일 */}
      <div className="shrink-0 text-right" style={{ width: 86 }}>
        <span className={cn("text-[12px] font-medium", dlClass)}>
          {deal.expectedEndDate ? formatDate(deal.expectedEndDate) : "-"}
        </span>
      </div>
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
          <p className="text-[11px] text-muted-foreground">금액</p>
          <p className="font-semibold">{deal.dealCost.toLocaleString("ko-KR")}원</p>
        </div>
        <div>
          <p className="text-[11px] text-muted-foreground">마감일</p>
          <p className="font-semibold">{deal.expectedEndDate ? formatDate(deal.expectedEndDate) : "-"}</p>
        </div>
      </div>

      {deal.latestFollowingAction ? (
        <div className="mt-3 rounded-lg bg-[#F9FAFB] px-3 py-2">
          <p className="text-[11px] text-muted-foreground">다음 행동</p>
          <p className="mt-0.5 truncate text-[13px]">
            {deal.latestFollowingAction.followingAction}
          </p>
        </div>
      ) : null}
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

function getDeadlineClass(date: string): string {
  if (!date) return "text-gray-400";
  const diff = (new Date(date).getTime() - Date.now()) / 86400000;
  if (diff < 0) return "text-red-600 font-semibold";
  if (diff < 7) return "text-red-600";
  return "text-gray-600";
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
      <div className="flex min-w-0 flex-1 flex-col gap-0 overflow-hidden rounded-lg border border-[#E5EAF0] bg-white">
        {Array.from({ length: 6 }).map((_, i) => (
          <div className="h-[62px] animate-pulse border-b border-[#E8EDF3] bg-gray-50" key={i} />
        ))}
      </div>
      <div className="h-full w-[380px] animate-pulse rounded-lg bg-gray-50" />
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
