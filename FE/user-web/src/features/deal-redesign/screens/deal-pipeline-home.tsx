import { AlertCircle, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { DealCreateDialog } from "@/features/deal/components/deal-create-dialog";
import { DealDetailPanel } from "@/features/deal/components/deal-detail-panel";
import { useDealList } from "@/features/deal/hooks/use-deal-list";
import { useChangeDealStageMutation } from "@/features/deal/hooks/use-deal-mutations";
import type { Deal, DealStage, DealStageSummary } from "@/features/deal/types/deal";
import { DealListRow } from "@/features/deal-redesign/components/deal-list-row";
import { FilterChip } from "@/features/deal-redesign/components/filter-chip";
import { MobileDealCard } from "@/features/deal-redesign/components/mobile-deal-card";
import { getApiErrorMessage } from "@/lib/api-client";

type StageTab = "ALL" | DealStage;

const stageTabs: Array<{ readonly value: StageTab; readonly label: string }> = [
  { value: "ALL", label: "전체" },
  { value: "INITIAL_CONTACT", label: "초기 접촉" },
  { value: "IN_DISCUSSION", label: "논의 중" },
  { value: "WON", label: "성사" },
  { value: "LOST", label: "실패" },
];

const emptyStageSummary: DealStageSummary = {
  INITIAL_CONTACT: 0,
  IN_DISCUSSION: 0,
  WON: 0,
  LOST: 0,
};

export function DealPipelineHomeRedesignScreen() {
  const [stage, setStage] = useState<StageTab>("ALL");
  const [selectedDealId, setSelectedDealId] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [stageError, setStageError] = useState<string | null>(null);
  const [pendingStageDealId, setPendingStageDealId] = useState<string | null>(
    null
  );
  const [optimisticStageByDealId, setOptimisticStageByDealId] = useState<
    Record<string, DealStage>
  >({});
  const changeStageMutation = useChangeDealStageMutation();

  const dealsQuery = useDealList({
    page: 1,
    pageSize: 24,
    stage: stage === "ALL" ? undefined : stage,
  });
  const rawDeals = useMemo(
    () => dealsQuery.data?.items ?? [],
    [dealsQuery.data?.items]
  );
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
    if (rawDeals.length === 0) {
      return;
    }

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
    if (deal.stage === nextStage || pendingStageDealId) {
      return;
    }

    setNotice(null);
    setStageError(null);
    setPendingStageDealId(deal.id);
    setOptimisticStageByDealId((current) => ({
      ...current,
      [deal.id]: nextStage,
    }));

    try {
      const updatedDeal = await changeStageMutation.mutateAsync({
        dealId: deal.id,
        stage: nextStage,
      });
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
      <section className="hidden gap-6 md:grid">
        <DesktopHero onCreate={() => setIsCreateOpen(true)} />
        <DesktopStageTabs
          onChange={(nextStage) => {
            setStage(nextStage);
            setNotice(null);
            setStageError(null);
          }}
          stage={stage}
          summary={stageSummary}
        />
        {notice ? (
          <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {notice}
          </p>
        ) : null}
        {stageError ? (
          <p className="rounded-2xl border border-destructive/30 bg-red-50 px-4 py-3 text-sm text-destructive">
            {stageError}
          </p>
        ) : null}
        {dealsQuery.isLoading ? (
          <DesktopLoadingState />
        ) : dealsQuery.isError ? (
          <ErrorState onRetry={() => void dealsQuery.refetch()} />
        ) : deals.length === 0 ? (
          <EmptyState onCreate={() => setIsCreateOpen(true)} />
        ) : (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_var(--detail-panel-width)]">
            <div className="grid gap-3">
              {deals.map((deal) => (
                <DealListRow
                  deal={deal}
                  isActive={deal.id === selectedDealId}
                  key={deal.id}
                  onSelect={setSelectedDealId}
                  onStageChange={onStageChange}
                  stageDisabled={pendingStageDealId === deal.id}
                />
              ))}
            </div>
            <DesktopDealPreview dealId={selectedDealId} />
          </div>
        )}
      </section>

      <section className="md:hidden">
        <div className="px-4 pb-4">
          <MobileStageTabs
            onChange={(nextStage) => {
              setStage(nextStage);
              setNotice(null);
              setStageError(null);
            }}
            stage={stage}
            summary={stageSummary}
          />
        </div>
        {notice ? (
          <p className="mx-4 mb-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {notice}
          </p>
        ) : null}
        {stageError ? (
          <p className="mx-4 mb-3 rounded-2xl border border-destructive/30 bg-red-50 px-4 py-3 text-sm text-destructive">
            {stageError}
          </p>
        ) : null}
        {dealsQuery.isLoading ? (
          <MobileLoadingState />
        ) : dealsQuery.isError ? (
          <div className="px-4">
            <ErrorState onRetry={() => void dealsQuery.refetch()} />
          </div>
        ) : deals.length === 0 ? (
          <div className="px-4">
            <EmptyState onCreate={() => setIsCreateOpen(true)} />
          </div>
        ) : (
          <div className="grid gap-3 px-4 pb-8">
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

function DesktopHero({ onCreate }: { readonly onCreate: () => void }) {
  return (
    <div className="grid gap-5 rounded-[32px] bg-sidebar px-7 py-7 text-sidebar-foreground shadow-panel lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sidebar-foreground/65">
          Deal pipeline
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">
          핵심 딜과 다음 행동을 한 화면에서 관리합니다.
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-sidebar-foreground/70">
          모바일 카드 경험과 데스크탑 분할 화면을 같은 데이터 구조 위에 올려, 이후 상세 패널과 빠른등록 흐름을 계속 확장할 수 있게 설계합니다.
        </p>
      </div>
      <button
        className="inline-flex h-12 items-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-sidebar shadow-soft"
        onClick={onCreate}
        type="button"
      >
        <Plus className="h-4 w-4" />
        빠른 등록
      </button>
    </div>
  );
}

function DesktopStageTabs({
  onChange,
  stage,
  summary,
}: {
  readonly onChange: (value: StageTab) => void;
  readonly stage: StageTab;
  readonly summary: DealStageSummary;
}) {
  return (
    <div className="flex flex-wrap gap-3">
      {stageTabs.map((item) => (
        <FilterChip
          active={stage === item.value}
          key={item.value}
          onClick={() => onChange(item.value)}
        >
          {item.label} {getStageCount(item.value, summary)}
        </FilterChip>
      ))}
    </div>
  );
}

function MobileStageTabs({
  onChange,
  stage,
  summary,
}: {
  readonly onChange: (value: StageTab) => void;
  readonly stage: StageTab;
  readonly summary: DealStageSummary;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {stageTabs.map((item) => (
        <FilterChip
          active={stage === item.value}
          key={item.value}
          onClick={() => onChange(item.value)}
        >
          {item.label} {getStageCount(item.value, summary)}
        </FilterChip>
      ))}
    </div>
  );
}

function DesktopDealPreview({ dealId }: { readonly dealId: string }) {
  if (!dealId) {
    return (
      <aside className="rounded-[28px] border border-border/70 bg-panel p-6 shadow-soft">
        <p className="text-sm text-muted-foreground">선택된 딜이 없습니다.</p>
      </aside>
    );
  }

  return (
    <div className="overflow-hidden rounded-[28px] border border-border/70 bg-panel shadow-soft">
      <DealDetailPanel dealId={dealId} variant="panel" />
      <div className="border-t border-border/70 px-5 py-4">
        <Link className="text-sm font-medium text-primary" to={`/deals/${dealId}`}>
          전체 상세 열기
        </Link>
      </div>
    </div>
  );
}

function EmptyState({ onCreate }: { readonly onCreate: () => void }) {
  return (
    <div className="rounded-[28px] border border-dashed border-border bg-panel p-8 text-center shadow-soft">
      <h2 className="text-lg font-semibold text-foreground">표시할 딜이 없습니다.</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        첫 딜을 등록하거나 필터를 조정해 파이프라인을 시작하세요.
      </p>
      <button
        className="mt-5 inline-flex h-11 items-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground"
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
    <div className="rounded-[28px] border border-destructive/15 bg-panel p-8 shadow-soft">
      <div className="flex items-center gap-3 text-destructive">
        <AlertCircle className="h-5 w-5" />
        <h2 className="text-base font-semibold">딜 목록을 불러오지 못했습니다.</h2>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">
        네트워크 상태를 확인한 뒤 다시 시도하세요.
      </p>
      <button
        className="mt-5 inline-flex h-10 items-center rounded-full border border-border px-4 text-sm font-medium text-foreground"
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
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_var(--detail-panel-width)]">
      <div className="grid gap-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            className="h-28 animate-pulse rounded-[20px] bg-white/70"
            key={index}
          />
        ))}
      </div>
      <div className="h-[34rem] animate-pulse rounded-[28px] bg-white/70" />
    </div>
  );
}

function MobileLoadingState() {
  return (
    <div className="grid gap-3 px-4 pb-8">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          className="h-44 animate-pulse rounded-[26px] bg-white/70"
          key={index}
        />
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

    if (!optimisticStage || optimisticStage === deal.stage) {
      continue;
    }

    next[deal.stage] = Math.max(0, (next[deal.stage] ?? 0) - 1);
    next[optimisticStage] = (next[optimisticStage] ?? 0) + 1;
  }

  return next;
}
