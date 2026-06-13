import {
  AlertCircle,
  CalendarDays,
  ClipboardList,
  MessageSquareText,
  Plus,
  RotateCcw,
} from "lucide-react";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { DealCreateDialog } from "@/features/deal/components/deal-create-dialog";
import { DealDetailPanel } from "@/features/deal/components/deal-detail-panel";
import { useDealList } from "@/features/deal/hooks/use-deal-list";
import { useChangeDealStageMutation } from "@/features/deal/hooks/use-deal-mutations";
import {
  formatDealLikelihood,
  formatDealNextAction,
  getDealNextActionTitle,
  getLikelihoodClass,
} from "@/features/deal/utils/deal-display";
import type {
  Deal,
  DealStage,
  DealStageSummary,
} from "@/features/deal/types/deal";
import { getApiErrorMessage } from "@/lib/api-client";
import { formatDate, formatDateTime, formatMoney } from "@/utils/format";

type StageTabValue = "ALL" | DealStage;

const stageTabs: Array<{ readonly value: StageTabValue; readonly label: string }> =
  [
    { value: "ALL", label: "전체" },
    { value: "INITIAL_CONTACT", label: "초기 접촉" },
    { value: "NEEDS_ANALYSIS", label: "니즈 확인" },
    { value: "PROPOSAL", label: "제안/견적" },
    { value: "NEGOTIATION", label: "협상" },
    { value: "WON", label: "성사" },
    { value: "LOST", label: "실패" },
  ];

const dealStages: Array<{ readonly value: DealStage; readonly label: string }> =
  [
    { value: "INITIAL_CONTACT", label: "초기 접촉" },
    { value: "NEEDS_ANALYSIS", label: "니즈 확인" },
    { value: "PROPOSAL", label: "제안/견적" },
    { value: "NEGOTIATION", label: "협상" },
    { value: "WON", label: "성사" },
    { value: "LOST", label: "실패" },
  ];

const emptyStageSummary: DealStageSummary = {};

export function DealPipelineHomeScreen() {
  const [stage, setStage] = useState<StageTabValue>("ALL");
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
  const dealsQuery = useDealList({
    page: 1,
    pageSize: 30,
    stage: stage === "ALL" ? undefined : stage,
  });
  const dealList = dealsQuery.data;
  const rawDeals = useMemo(() => dealList?.items ?? [], [dealList?.items]);
  const visibleDeals = useMemo(
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
        dealList?.stageSummary ?? emptyStageSummary,
        rawDeals,
        optimisticStageByDealId
      ),
    [dealList?.stageSummary, optimisticStageByDealId, rawDeals]
  );
  const hasStageFilter = stage !== "ALL";
  const totalStageCount = getStageCount("ALL", stageSummary);
  const changeStageMutation = useChangeDealStageMutation();

  useEffect(() => {
    if (!dealList || dealList.items.length === 0) {
      setSelectedDealId("");
      return;
    }

    const hasSelectedDeal = dealList.items.some(
      (deal) => deal.id === selectedDealId
    );

    if (!hasSelectedDeal) {
      setSelectedDealId(dealList.items[0]?.id ?? "");
    }
  }, [dealList, selectedDealId]);

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

  const onResetFilter = () => {
    setStage("ALL");
    setStageError(null);
    setNotice(null);
  };

  return (
    <section className="mx-auto grid max-w-[1500px] gap-5 px-5 py-6">
      <header className="flex flex-col gap-4 border-b pb-5 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold">딜 파이프라인</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            진행 중인 딜, 다음 행동, 마감 압박을 먼저 확인합니다.
          </p>
        </div>
        <button
          className="inline-flex h-10 w-fit items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
          onClick={() => setIsCreateOpen(true)}
          type="button"
        >
          <Plus className="h-4 w-4" />
          딜 추가
        </button>
      </header>

      <StageTabs
        onChange={(value) => {
          setStage(value);
          setStageError(null);
          setNotice(null);
        }}
        stage={stage}
        summary={stageSummary}
      />

      {notice ? (
        <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {notice}
        </p>
      ) : null}

      {stageError ? (
        <p className="rounded-md border border-destructive/30 bg-red-50 px-3 py-2 text-sm text-destructive">
          {stageError}
        </p>
      ) : null}

      {dealsQuery.isLoading ? (
        <PipelineSkeleton />
      ) : dealsQuery.isError ? (
        <PipelineError
          error={dealsQuery.error}
          onRetry={() => void dealsQuery.refetch()}
        />
      ) : visibleDeals.length === 0 ? (
        <PipelineEmptyState
          hasFilter={hasStageFilter && totalStageCount > 0}
          onCreate={() => setIsCreateOpen(true)}
          onReset={onResetFilter}
        />
      ) : (
        <>
          <div className="hidden gap-4 lg:grid lg:grid-cols-[minmax(0,1fr)_430px]">
            <PipelineTable
              deals={visibleDeals}
              onSelectDeal={setSelectedDealId}
              onStageChange={onStageChange}
              pendingStageDealId={pendingStageDealId}
              selectedDealId={selectedDealId}
            />
            <aside className="min-w-0">
              <DealDetailPanel
                dealId={selectedDealId}
                onChanged={setNotice}
                variant="panel"
              />
            </aside>
          </div>

          <MobileDealCards
            deals={visibleDeals}
            onStageChange={onStageChange}
            pendingStageDealId={pendingStageDealId}
          />

          <PipelineSupportSummary deals={visibleDeals} />
        </>
      )}

      <DealCreateDialog
        onCreated={(deal) => {
          setNotice(`${deal.title} 딜이 추가되었습니다.`);
          setStage("ALL");
          setSelectedDealId(deal.id);
        }}
        onOpenChange={setIsCreateOpen}
        open={isCreateOpen}
      />
    </section>
  );
}

type StageTabsProps = {
  readonly stage: StageTabValue;
  readonly summary: DealStageSummary;
  readonly onChange: (stage: StageTabValue) => void;
};

function StageTabs({ stage, summary, onChange }: StageTabsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto border-b pb-2">
      {stageTabs.map((tab) => (
        <button
          className={`inline-flex h-9 shrink-0 items-center gap-2 rounded-md px-3 text-sm font-medium ${
            stage === tab.value
              ? "bg-primary text-primary-foreground"
              : "border bg-white text-slate-700 hover:bg-muted"
          }`}
          key={tab.value}
          onClick={() => onChange(tab.value)}
          type="button"
        >
          <span>{tab.label}</span>
          <span
            className={`rounded px-1.5 text-xs ${
              stage === tab.value ? "bg-white/20" : "bg-muted"
            }`}
          >
            {getStageCount(tab.value, summary)}
          </span>
        </button>
      ))}
    </div>
  );
}

type PipelineTableProps = {
  readonly deals: Deal[];
  readonly selectedDealId: string;
  readonly pendingStageDealId: string | null;
  readonly onSelectDeal: (dealId: string) => void;
  readonly onStageChange: (deal: Deal, stage: DealStage) => Promise<void>;
};

function PipelineTable({
  deals,
  selectedDealId,
  pendingStageDealId,
  onSelectDeal,
  onStageChange,
}: PipelineTableProps) {
  return (
    <div aria-label="홈 딜 파이프라인" className="overflow-hidden rounded-lg border bg-white">
      <div className="grid grid-cols-[1.3fr_1.05fr_0.95fr_0.85fr_0.85fr_1.2fr_0.8fr] border-b bg-muted px-4 py-3 text-xs font-medium text-muted-foreground">
        <span>딜</span>
        <span>회사/담당자</span>
        <span>단계</span>
        <span>금액</span>
        <span>가능성</span>
        <span>다음 행동</span>
        <span>마감일</span>
      </div>
      {deals.map((deal) => (
        <div
          aria-selected={selectedDealId === deal.id}
          className={`grid min-h-[72px] cursor-pointer grid-cols-[1.3fr_1.05fr_0.95fr_0.85fr_0.85fr_1.2fr_0.8fr] items-center border-b px-4 py-3 text-left text-sm last:border-b-0 hover:bg-muted/50 ${
            selectedDealId === deal.id ? "bg-sky-50/70" : ""
          }`}
          key={deal.id}
          onClick={() => onSelectDeal(deal.id)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              onSelectDeal(deal.id);
            }
          }}
          role="button"
          tabIndex={0}
        >
          <div className="min-w-0">
            <span className="block truncate font-medium text-slate-950">
              {deal.title}
            </span>
            {deal.deletedAt ? (
              <span className="mt-1 block text-xs text-destructive">삭제됨</span>
            ) : null}
          </div>
          <div className="min-w-0">
            <span className="block truncate text-slate-800">
              {deal.companyName ?? "-"}
            </span>
            <span className="mt-1 block truncate text-xs text-muted-foreground">
              {deal.contactName ?? "-"}
            </span>
          </div>
          <DealStageSelect
            disabled={pendingStageDealId !== null}
            isPending={pendingStageDealId === deal.id}
            onChange={(stage) => onStageChange(deal, stage)}
            value={deal.stage}
          />
          <span className="truncate font-medium text-slate-800">
            {formatPipelineMoney(deal.amount, deal.currency)}
          </span>
          <DealLikelihoodBadge deal={deal} />
          <DealNextAction deal={deal} />
          <span className="text-slate-700">
            {formatDate(deal.expectedCloseDate)}
          </span>
        </div>
      ))}
    </div>
  );
}

type MobileDealCardsProps = {
  readonly deals: Deal[];
  readonly pendingStageDealId: string | null;
  readonly onStageChange: (deal: Deal, stage: DealStage) => Promise<void>;
};

function MobileDealCards({
  deals,
  pendingStageDealId,
  onStageChange,
}: MobileDealCardsProps) {
  return (
    <div className="grid gap-3 lg:hidden">
      {deals.map((deal) => (
        <article className="rounded-lg border bg-white p-4" key={deal.id}>
          <div className="grid gap-3">
            <div className="min-w-0">
              <Link
                className="block truncate text-base font-semibold hover:text-primary"
                to={`/deals/${deal.id}`}
              >
                {deal.title}
              </Link>
              <p className="mt-1 truncate text-sm text-muted-foreground">
                {[deal.companyName, deal.contactName].filter(Boolean).join(" · ") ||
                  "-"}
              </p>
            </div>
            <DealStageSelect
              disabled={pendingStageDealId !== null}
              isPending={pendingStageDealId === deal.id}
              onChange={(stage) => onStageChange(deal, stage)}
              value={deal.stage}
            />
          </div>

          <dl className="mt-4 grid gap-3 text-sm">
            <Field label="금액" value={formatMoney(deal.amount, deal.currency)} />
            <Field label="가능성" value={formatDealLikelihood(deal)} />
            <Field label="다음 행동" value={formatDealNextAction(deal)} />
            <Field label="마감일" value={formatDate(deal.expectedCloseDate)} />
          </dl>
        </article>
      ))}
    </div>
  );
}

type DealStageSelectProps = {
  readonly value: DealStage;
  readonly disabled: boolean;
  readonly isPending: boolean;
  readonly onChange: (stage: DealStage) => Promise<void>;
};

function DealStageSelect({
  value,
  disabled,
  isPending,
  onChange,
}: DealStageSelectProps) {
  return (
    <select
      aria-label="딜 단계 변경"
      className="h-9 w-full rounded-md border bg-white px-2 text-sm outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
      disabled={disabled}
      onChange={(event) => {
        event.stopPropagation();
        void onChange(event.target.value as DealStage);
      }}
      onClick={(event) => event.stopPropagation()}
      value={value}
    >
      {dealStages.map((stage) => (
        <option key={stage.value} value={stage.value}>
          {isPending && stage.value === value ? "변경 중" : stage.label}
        </option>
      ))}
    </select>
  );
}

function PipelineSupportSummary({ deals }: { readonly deals: Deal[] }) {
  const summary = getFollowUpSummary(deals);

  return (
    <section className="grid gap-3 lg:grid-cols-3">
      <SupportSummaryBlock icon={CalendarDays} label="오늘 일정">
        <p className="text-sm font-medium text-slate-900">연결된 일정 없음</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {summary.scheduledCount > 0
            ? `예정된 다음 행동 ${summary.scheduledCount}건`
            : "오늘 확인할 일정이 없습니다."}
        </p>
      </SupportSummaryBlock>
      <SupportSummaryBlock icon={ClipboardList} label="후속 조치">
        <div className="grid grid-cols-3 gap-2 text-center">
          <MiniMetric label="지연" value={summary.overdueCount} />
          <MiniMetric label="임박" value={summary.dueSoonCount} />
          <MiniMetric label="예정" value={summary.scheduledCount} />
        </div>
        <p className="mt-3 truncate text-xs text-muted-foreground">
          {summary.nextActionLabel}
        </p>
      </SupportSummaryBlock>
      <SupportSummaryBlock icon={MessageSquareText} label="최근 회의록">
        <p className="text-sm font-medium text-slate-900">최근 회의록 없음</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {summary.memoCount > 0
            ? `Memo 보유 딜 ${summary.memoCount}건`
            : "회의록 연결 전입니다."}
        </p>
      </SupportSummaryBlock>
    </section>
  );
}

function SupportSummaryBlock({
  icon: Icon,
  label,
  children,
}: {
  readonly icon: typeof CalendarDays;
  readonly label: string;
  readonly children: ReactNode;
}) {
  return (
    <article className="rounded-lg border bg-white p-4">
      <div className="mb-3 flex items-center gap-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-sm font-semibold">{label}</h2>
      </div>
      {children}
    </article>
  );
}

function MiniMetric({
  label,
  value,
}: {
  readonly label: string;
  readonly value: number;
}) {
  return (
    <div className="rounded-md border bg-muted/30 px-2 py-2">
      <p className="text-base font-semibold">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function Field({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <div className="grid grid-cols-[72px_minmax(0,1fr)] gap-2">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="min-w-0 truncate font-medium">{value}</dd>
    </div>
  );
}

function DealLikelihoodBadge({ deal }: { readonly deal: Deal }) {
  return (
    <span
      className={`inline-flex h-7 w-fit items-center whitespace-nowrap rounded-md px-2 text-xs font-medium ${getLikelihoodClass(
        deal.likelihoodStatus
      )}`}
    >
      {formatDealLikelihood(deal)}
    </span>
  );
}

function DealNextAction({ deal }: { readonly deal: Deal }) {
  return (
    <div className="min-w-0">
      <span className="block truncate text-slate-800">
        {getDealNextActionTitle(deal)}
      </span>
      <span className="mt-1 block truncate text-xs text-muted-foreground">
        {formatDateTime(deal.nextActionDueAt)}
      </span>
    </div>
  );
}

function PipelineSkeleton() {
  return (
    <div className="hidden gap-4 lg:grid lg:grid-cols-[minmax(0,1fr)_430px]">
      <div className="grid gap-2 rounded-lg border bg-white p-3">
        {Array.from({ length: 7 }).map((_, index) => (
          <div
            className="h-[58px] animate-pulse rounded-md bg-muted"
            key={index}
          />
        ))}
      </div>
      <div className="h-[520px] animate-pulse rounded-lg border bg-muted" />
    </div>
  );
}

function PipelineError({
  error,
  onRetry,
}: {
  readonly error: unknown;
  readonly onRetry: () => void;
}) {
  return (
    <div className="rounded-lg border border-destructive/30 bg-red-50 p-5">
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 h-5 w-5 text-destructive" />
        <div>
          <p className="text-sm font-medium text-destructive">
            {getApiErrorMessage(error)}
          </p>
          <button
            className="mt-3 inline-flex h-9 items-center gap-2 rounded-md border bg-white px-3 text-sm font-medium hover:bg-muted"
            onClick={onRetry}
            type="button"
          >
            <RotateCcw className="h-4 w-4" />
            다시 시도
          </button>
        </div>
      </div>
    </div>
  );
}

function PipelineEmptyState({
  hasFilter,
  onCreate,
  onReset,
}: {
  readonly hasFilter: boolean;
  readonly onCreate: () => void;
  readonly onReset: () => void;
}) {
  return (
    <div className="grid place-items-center rounded-lg border bg-white px-5 py-12 text-center">
      <div>
        <p className="text-base font-semibold">
          {hasFilter ? "선택한 단계의 딜이 없습니다." : "등록된 딜이 없습니다."}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          {hasFilter
            ? "전체 파이프라인으로 돌아가 다른 딜을 확인할 수 있습니다."
            : "새 딜을 만들면 파이프라인에서 바로 확인할 수 있습니다."}
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {hasFilter ? (
            <button
              className="inline-flex h-10 items-center gap-2 rounded-md border px-4 text-sm font-medium hover:bg-muted"
              onClick={onReset}
              type="button"
            >
              <RotateCcw className="h-4 w-4" />
              전체 보기
            </button>
          ) : null}
          <button
            className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
            onClick={onCreate}
            type="button"
          >
            <Plus className="h-4 w-4" />
            딜 추가
          </button>
        </div>
      </div>
    </div>
  );
}

function applyOptimisticStageSummary(
  summary: DealStageSummary,
  deals: Deal[],
  optimisticStageByDealId: Record<string, DealStage>
) {
  const next = { ...summary };

  for (const deal of deals) {
    const optimisticStage = optimisticStageByDealId[deal.id];

    if (optimisticStage && optimisticStage !== deal.stage) {
      next[deal.stage] = Math.max(0, (next[deal.stage] ?? 0) - 1);
      next[optimisticStage] = (next[optimisticStage] ?? 0) + 1;
    }
  }

  return next;
}

function getStageCount(stage: StageTabValue, summary: DealStageSummary) {
  if (stage === "ALL") {
    return Object.values(summary).reduce((sum, n) => sum + (n ?? 0), 0);
  }

  return summary[stage] ?? 0;
}

function getFollowUpSummary(deals: Deal[]) {
  const overdueCount = deals.filter(
    (deal) => deal.nextActionStatus === "OVERDUE"
  ).length;
  const dueSoonCount = deals.filter(
    (deal) => deal.nextActionStatus === "DUE_SOON"
  ).length;
  const scheduledCount = deals.filter(
    (deal) => deal.nextActionStatus === "SCHEDULED"
  ).length;
  const memoCount = deals.filter((deal) => deal.hasMemo).length;
  const nextActionDeal = [...deals]
    .filter((deal) => deal.nextActionStatus !== "DONE")
    .sort((left, right) => getActionTime(left) - getActionTime(right))[0];
  const nextActionLabel = nextActionDeal
    ? `${nextActionDeal.title} · ${formatDealNextAction(nextActionDeal)}`
    : "남은 후속 조치가 없습니다.";

  return {
    overdueCount,
    dueSoonCount,
    scheduledCount,
    memoCount,
    nextActionLabel,
  };
}

function getActionTime(deal: Deal) {
  const date = new Date(
    deal.nextActionDueAt ?? deal.expectedCloseDate ?? deal.updatedAt
  );

  return Number.isNaN(date.getTime()) ? Number.MAX_SAFE_INTEGER : date.getTime();
}

function formatPipelineMoney(amount: number, currency: string) {
  if (currency === "KRW" && Math.abs(amount) >= 10_000) {
    const unit = Math.abs(amount) >= 100_000_000 ? 100_000_000 : 10_000;
    const suffix = unit === 100_000_000 ? "억원" : "만원";

    return `${new Intl.NumberFormat("ko-KR", {
      maximumFractionDigits: 1,
    }).format(amount / unit)}${suffix}`;
  }

  return formatMoney(amount, currency);
}
