import { AlertCircle, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { DealCreateDialog } from "@/features/deal/components/deal-create-dialog";
import { DealDetailPanel } from "@/features/deal/components/deal-detail-panel";
import { useDealList } from "@/features/deal/hooks/use-deal-list";
import { useChangeDealStageMutation } from "@/features/deal/hooks/use-deal-mutations";
import type { Deal, DealStage, DealStageSummary } from "@/features/deal/types/deal";
import { DealListRow } from "@/features/deal-redesign/components/deal-list-row";
import { MobileDealCard } from "@/features/deal-redesign/components/mobile-deal-card";
import { getApiErrorMessage } from "@/lib/api-client";
import { cn } from "@/utils/cn";

type StageTab = "ALL" | DealStage;

const stageTabs: Array<{ readonly value: StageTab; readonly label: string }> = [
  { value: "ALL", label: "전체" },
  { value: "INITIAL_CONTACT", label: "초기 접촉" },
  { value: "NEEDS_ANALYSIS", label: "니즈 확인" },
  { value: "PROPOSAL", label: "제안/견적" },
  { value: "NEGOTIATION", label: "협상" },
  { value: "WON", label: "성사" },
  { value: "LOST", label: "실패" },
];

const emptyStageSummary: DealStageSummary = {};

export function DealPipelineHomeRedesignScreen() {
  const [stage, setStage] = useState<StageTab>("ALL");
  const [selectedDealId, setSelectedDealId] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [stageError, setStageError] = useState<string | null>(null);
  const [pendingStageDealId, setPendingStageDealId] = useState<string | null>(null);
  const [optimisticStageByDealId, setOptimisticStageByDealId] = useState<
    Record<string, DealStage>
  >({});
  const changeStageMutation = useChangeDealStageMutation();

  const dealsQuery = useDealList({
    page: 1,
    pageSize: 24,
    stage: stage === "ALL" ? undefined : stage,
  });
  const rawDeals = useMemo(() => dealsQuery.data?.items ?? [], [dealsQuery.data?.items]);
  const deals = useMemo(
    () =>
      rawDeals.map((deal) => ({
        ...deal,
        stage: optimisticStageByDealId[deal.id] ?? deal.stage,
      })),
    [optimisticStageByDealId, rawDeals]
  );
  const stageSummary = useMemo(
    () =>
      applyOptimisticStageSummary(
        dealsQuery.data?.stageSummary ?? emptyStageSummary,
        rawDeals,
        optimisticStageByDealId
      ),
    [dealsQuery.data?.stageSummary, optimisticStageByDealId, rawDeals]
  );
  const totalCount = Object.values(stageSummary).reduce((sum, n) => sum + n, 0);

  useEffect(() => {
    if (deals.length === 0) {
      setSelectedDealId("");
      return;
    }
    if (!deals.some((deal) => deal.id === selectedDealId)) {
      setSelectedDealId(deals[0]?.id ?? "");
    }
  }, [deals, selectedDealId]);

  useEffect(() => {
    if (rawDeals.length === 0) return;
    setOptimisticStageByDealId((current) => {
      let hasChanged = false;
      const next = { ...current };
      for (const deal of rawDeals) {
        if (next[deal.id] && next[deal.id] === deal.stage) {
          delete next[deal.id];
          hasChanged = true;
        }
      }
      return hasChanged ? next : current;
    });
  }, [rawDeals]);

  const onStageChange = async (deal: Deal, nextStage: DealStage) => {
    if (deal.stage === nextStage || pendingStageDealId) return;
    setNotice(null);
    setStageError(null);
    setPendingStageDealId(deal.id);
    setOptimisticStageByDealId((current) => ({ ...current, [deal.id]: nextStage }));
    try {
      const updatedDeal = await changeStageMutation.mutateAsync({ dealId: deal.id, stage: nextStage });
      setNotice(`${updatedDeal.title} 단계가 변경되었습니다.`);
      setSelectedDealId(updatedDeal.id);
    } catch (error) {
      setOptimisticStageByDealId((current) => {
        const next = { ...current };
        delete next[deal.id];
        return next;
      });
      setStageError(getApiErrorMessage(error));
    } finally {
      setPendingStageDealId(null);
    }
  };

  return (
    <>
      {/* ── Desktop ── */}
      <section className="hidden flex-1 flex-col overflow-hidden md:flex">
        {/* Stage Tabs */}
        <div className="flex shrink-0 items-end border-b border-[#E6EAF0] bg-white px-6">
          {stageTabs.map((tab) => {
            const count = getStageCount(tab.value, stageSummary);
            const isActive = stage === tab.value;
            return (
              <button
                className={cn(
                  "flex h-12 items-center gap-1.5 border-b-2 px-3.5 text-[13px] font-medium transition-colors",
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                )}
                key={tab.value}
                onClick={() => {
                  setStage(tab.value);
                  setNotice(null);
                  setStageError(null);
                }}
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

        {/* Notices */}
        {notice ? (
          <div className="mx-6 mt-3 shrink-0 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-800">
            {notice}
          </div>
        ) : null}
        {stageError ? (
          <div className="mx-6 mt-3 shrink-0 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
            {stageError}
          </div>
        ) : null}

        {/* Content */}
        {dealsQuery.isLoading ? (
          <DesktopLoadingState />
        ) : dealsQuery.isError ? (
          <div className="p-6"><ErrorState onRetry={() => void dealsQuery.refetch()} /></div>
        ) : deals.length === 0 ? (
          <div className="p-6"><EmptyState onCreate={() => setIsCreateOpen(true)} /></div>
        ) : (
          <div className="flex min-h-0 flex-1 gap-5 overflow-hidden px-6 py-5">
            {/* Deal List */}
            <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-lg border border-[#E5EAF0] bg-white">
              {/* Controls bar */}
              <div className="flex h-10 shrink-0 items-center gap-2 border-b border-[#E6EAF0] bg-[#FAFBFC] px-6">
                <span className="ml-auto text-[12px] text-gray-400">{totalCount}건</span>
              </div>
              {/* Table header */}
              <div className="flex shrink-0 items-center border-b border-[#E6EAF0] bg-[#FAFBFC] px-6" style={{ height: 44 }}>
                <TableHeaderCell width={175}>딜명</TableHeaderCell>
                <TableHeaderCell width={125}>회사/담당자</TableHeaderCell>
                <TableHeaderCell width={100}>단계</TableHeaderCell>
                <TableHeaderCell width={100}>금액</TableHeaderCell>
                <TableHeaderCell flex>다음 행동</TableHeaderCell>
                <TableHeaderCell width={78} align="right">마감일</TableHeaderCell>
              </div>
              {/* Rows */}
              <div className="flex-1 overflow-y-auto">
                {deals.map((deal) => (
                  <DealListRow
                    deal={deal}
                    isActive={deal.id === selectedDealId}
                    key={deal.id}
                    onSelect={setSelectedDealId}
                    onStageChange={onStageChange}
                  />
                ))}
              </div>
            </div>

            {/* Right Detail Panel — 380px */}
            <div className="flex w-[380px] shrink-0 flex-col overflow-hidden rounded-lg border border-[#E5EAF0] bg-white">
              {selectedDealId ? (
                <>
                  <div className="flex-1 overflow-y-auto">
                    <DealDetailPanel
                      dealId={selectedDealId}
                      onChanged={(msg) => setNotice(msg)}
                      variant="panel"
                    />
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
              const count = getStageCount(tab.value, stageSummary);
              const isActive = stage === tab.value;
              return (
                <button
                  className={cn(
                    "flex h-11 shrink-0 items-center gap-1 border-b-2 px-3 text-[13px] font-medium transition-colors",
                    isActive
                      ? "border-primary text-primary"
                      : "border-transparent text-gray-500"
                  )}
                  key={tab.value}
                  onClick={() => {
                    setStage(tab.value);
                    setNotice(null);
                    setStageError(null);
                  }}
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
        {notice ? (
          <p className="mx-4 mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-800">
            {notice}
          </p>
        ) : null}
        {stageError ? (
          <p className="mx-4 mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
            {stageError}
          </p>
        ) : null}
        {dealsQuery.isLoading ? (
          <MobileLoadingState />
        ) : dealsQuery.isError ? (
          <div className="px-4 pt-4">
            <ErrorState onRetry={() => void dealsQuery.refetch()} />
          </div>
        ) : deals.length === 0 ? (
          <div className="px-4 pt-4">
            <EmptyState onCreate={() => setIsCreateOpen(true)} />
          </div>
        ) : (
          <div className="grid gap-3 px-4 py-4 pb-8">
            {deals.map((deal) => (
              <MobileDealCard deal={deal} key={deal.id} />
            ))}
          </div>
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
          setStage("ALL");
          setNotice(`${deal.title} 딜이 추가되었습니다.`);
          setStageError(null);
        }}
        onOpenChange={setIsCreateOpen}
        open={isCreateOpen}
      />
    </>
  );
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

function EmptyState({ onCreate }: { readonly onCreate: () => void }) {
  return (
    <div className="rounded-lg border border-dashed border-gray-200 bg-white p-10 text-center">
      <h2 className="text-base font-semibold text-gray-800">표시할 딜이 없습니다.</h2>
      <p className="mt-2 text-sm text-gray-500">
        첫 딜을 등록하거나 필터를 조정해 파이프라인을 시작하세요.
      </p>
      <button
        className="mt-5 inline-flex h-10 items-center rounded-full bg-primary px-5 text-sm font-semibold text-white"
        onClick={onCreate}
        type="button"
      >
        딜 추가
      </button>
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
    <div className="grid gap-3 px-4 py-4 pb-8">
      {Array.from({ length: 4 }).map((_, i) => (
        <div className="h-44 animate-pulse rounded-[26px] bg-gray-100" key={i} />
      ))}
    </div>
  );
}

function getStageCount(stage: StageTab, summary: DealStageSummary) {
  if (stage === "ALL") {
    return Object.values(summary).reduce((total, count) => total + count, 0);
  }
  return summary[stage] ?? 0;
}

function applyOptimisticStageSummary(
  summary: DealStageSummary,
  deals: readonly Deal[],
  optimisticStageByDealId: Record<string, DealStage>
) {
  const next = { ...summary };
  for (const deal of deals) {
    const optimisticStage = optimisticStageByDealId[deal.id];
    if (!optimisticStage || optimisticStage === deal.stage) continue;
    next[deal.stage] = Math.max(0, (next[deal.stage] ?? 0) - 1);
    next[optimisticStage] = (next[optimisticStage] ?? 0) + 1;
  }
  return next;
}
