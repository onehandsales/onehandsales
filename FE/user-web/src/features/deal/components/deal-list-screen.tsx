import { Plus, Search } from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { DealCreateDialog } from "@/features/deal/components/deal-create-dialog";
import { DealDetailPanel } from "@/features/deal/components/deal-detail-panel";
import { useDealList } from "@/features/deal/hooks/use-deal-list";
import {
  formatDealLikelihood,
  formatDealNextAction,
  getDealNextActionTitle,
  getLikelihoodClass,
  getStageClass,
  getStageLabel,
} from "@/features/deal/utils/deal-display";
import type {
  Deal,
  DealLikelihoodStatus,
  DealStage,
  DealStageSummary,
  NextActionStatus,
} from "@/features/deal/types/deal";
import { getApiErrorMessage } from "@/lib/api-client";
import { formatDate, formatDateTime, formatMoney } from "@/utils/format";

type StageTabValue = "ALL" | DealStage;
type OptionalLikelihoodStatus = "ALL" | DealLikelihoodStatus;
type OptionalNextActionStatus = "ALL" | NextActionStatus;

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

const emptyStageSummary: DealStageSummary = {};

export function DealListScreen() {
  const [searchText, setSearchText] = useState("");
  const [search, setSearch] = useState("");
  const [stage, setStage] = useState<StageTabValue>("ALL");
  const [likelihoodStatus, setLikelihoodStatus] =
    useState<OptionalLikelihoodStatus>("ALL");
  const [nextActionStatus, setNextActionStatus] =
    useState<OptionalNextActionStatus>("ALL");
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [selectedDealId, setSelectedDealId] = useState("");
  const dealsQuery = useDealList({
    page: 1,
    pageSize: 20,
    search: search || undefined,
    stage: stage === "ALL" ? undefined : stage,
    likelihoodStatus:
      likelihoodStatus === "ALL" ? undefined : likelihoodStatus,
    nextActionStatus:
      nextActionStatus === "ALL" ? undefined : nextActionStatus,
    includeDeleted,
  });
  const dealList = dealsQuery.data;
  const stageSummary = dealList?.stageSummary ?? emptyStageSummary;

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

  const onSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSearch(searchText.trim());
  };

  return (
    <section className="mx-auto grid max-w-[1500px] gap-5 px-5 py-6">
      <header className="flex flex-col gap-4 border-b pb-5 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">딜</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            단계, 금액, 가능성과 다음 행동을 한 화면에서 비교합니다.
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

      <div className="flex gap-2 overflow-x-auto border-b pb-2">
        {stageTabs.map((tab) => (
          <button
            className={`inline-flex h-9 shrink-0 items-center gap-2 rounded-md px-3 text-sm font-medium ${
              stage === tab.value
                ? "bg-primary text-primary-foreground"
                : "border bg-white text-slate-700 hover:bg-muted"
            }`}
            key={tab.value}
            onClick={() => setStage(tab.value)}
            type="button"
          >
            <span>{tab.label}</span>
            <span
              className={`rounded px-1.5 text-xs ${
                stage === tab.value ? "bg-white/20" : "bg-muted"
              }`}
            >
              {getStageCount(tab.value, stageSummary)}
            </span>
          </button>
        ))}
      </div>

      <form
        className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px_180px_auto]"
        onSubmit={onSearchSubmit}
      >
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            className="h-10 w-full rounded-md border pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            onChange={(event) => setSearchText(event.target.value)}
            placeholder="딜명, 회사, 거래처 검색"
            value={searchText}
          />
        </div>
        <select
          className="h-10 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          onChange={(event) =>
            setLikelihoodStatus(event.target.value as OptionalLikelihoodStatus)
          }
          value={likelihoodStatus}
        >
          <option value="ALL">가능성 전체</option>
          <option value="POSITIVE">긍정</option>
          <option value="NEUTRAL">중립</option>
          <option value="NEGATIVE">부정</option>
        </select>
        <select
          className="h-10 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          onChange={(event) =>
            setNextActionStatus(event.target.value as OptionalNextActionStatus)
          }
          value={nextActionStatus}
        >
          <option value="ALL">다음 행동 전체</option>
          <option value="NONE">없음</option>
          <option value="SCHEDULED">예정</option>
          <option value="DUE_SOON">임박</option>
          <option value="OVERDUE">지연</option>
          <option value="DONE">완료</option>
        </select>
        <div className="flex flex-wrap items-end gap-2">
          <label className="inline-flex h-10 items-center gap-2 rounded-md border px-3 text-sm font-medium">
            <input
              checked={includeDeleted}
              className="h-4 w-4 rounded border"
              onChange={(event) => setIncludeDeleted(event.target.checked)}
              type="checkbox"
            />
            삭제 포함
          </label>
          <button
            className="inline-flex h-10 items-center gap-2 rounded-md border px-4 text-sm font-medium hover:bg-muted"
            type="submit"
          >
            <Search className="h-4 w-4" />
            검색
          </button>
        </div>
      </form>

      {notice ? (
        <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {notice}
        </p>
      ) : null}

      {dealsQuery.isLoading ? (
        <DealListSkeleton />
      ) : dealsQuery.isError ? (
        <DealListError
          error={dealsQuery.error}
          onRetry={() => void dealsQuery.refetch()}
        />
      ) : !dealList || dealList.items.length === 0 ? (
        <DealEmptyState
          hasSearch={
            search.length > 0 ||
            stage !== "ALL" ||
            likelihoodStatus !== "ALL" ||
            nextActionStatus !== "ALL"
          }
          onCreate={() => setIsCreateOpen(true)}
        />
      ) : (
        <DealListContent
          deals={dealList.items}
          onChanged={setNotice}
          onSelectDeal={setSelectedDealId}
          selectedDealId={selectedDealId}
        />
      )}

      <DealCreateDialog
        onCreated={(deal) => setNotice(`${deal.title} 딜이 추가되었습니다.`)}
        onOpenChange={setIsCreateOpen}
        open={isCreateOpen}
      />
    </section>
  );
}

type DealListContentProps = {
  readonly deals: Deal[];
  readonly selectedDealId: string;
  readonly onSelectDeal: (dealId: string) => void;
  readonly onChanged: (message: string) => void;
};

function DealListContent({
  deals,
  selectedDealId,
  onSelectDeal,
  onChanged,
}: DealListContentProps) {
  return (
    <>
      <div className="hidden gap-4 lg:grid lg:grid-cols-[minmax(0,1fr)_430px]">
        <div
          aria-label="딜 목록"
          className="overflow-hidden rounded-lg border bg-white"
        >
          <div
            aria-label="딜 목록 헤더"
            className="grid grid-cols-[1.35fr_1.2fr_0.85fr_0.95fr_0.8fr_1.15fr_0.9fr] border-b bg-muted px-4 py-3 text-xs font-medium text-muted-foreground"
          >
            <span>딜명</span>
            <span>회사/담당자</span>
            <span>단계</span>
            <span>금액</span>
            <span>가능성</span>
            <span>다음 행동</span>
            <span>마감일</span>
          </div>
          {deals.map((deal) => (
            <button
              aria-pressed={selectedDealId === deal.id}
              className={`grid w-full grid-cols-[1.35fr_1.2fr_0.85fr_0.95fr_0.8fr_1.15fr_0.9fr] items-center border-b px-4 py-4 text-left text-sm last:border-b-0 hover:bg-muted/50 ${
                selectedDealId === deal.id ? "bg-sky-50/70" : ""
              }`}
              key={deal.id}
              onClick={() => onSelectDeal(deal.id)}
              type="button"
            >
              <div className="min-w-0 font-medium text-slate-950">
                <span className="block truncate">{deal.title}</span>
                {deal.deletedAt ? (
                  <span className="mt-1 block text-xs text-destructive">
                    삭제됨
                  </span>
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
              <DealStageBadge stage={deal.stage} />
              <span className="truncate font-medium text-slate-800">
                {formatMoney(deal.amount, deal.currency)}
              </span>
              <DealLikelihoodBadge deal={deal} />
              <DealNextAction deal={deal} />
              <span className="text-slate-700">
                {formatDate(deal.expectedCloseDate)}
              </span>
            </button>
          ))}
        </div>

        <aside className="min-w-0">
          <DealDetailPanel
            dealId={selectedDealId}
            onChanged={onChanged}
            variant="panel"
          />
        </aside>
      </div>

      <div className="grid gap-3 lg:hidden">
        {deals.map((deal) => (
          <article className="rounded-lg border bg-white p-4" key={deal.id}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <Link
                  className="block truncate text-base font-semibold hover:text-primary"
                  to={`/deals/${deal.id}`}
                >
                  {deal.title}
                </Link>
                <p className="mt-1 text-sm text-muted-foreground">
                  {[deal.companyName, deal.contactName].filter(Boolean).join(" · ") ||
                    "-"}
                </p>
              </div>
              <DealStageBadge stage={deal.stage} />
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
    </>
  );
}

type FieldProps = {
  readonly label: string;
  readonly value: string;
};

function Field({ label, value }: FieldProps) {
  return (
    <div className="grid grid-cols-[72px_minmax(0,1fr)] gap-2">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="min-w-0 truncate font-medium">{value}</dd>
    </div>
  );
}

function DealStageBadge({ stage }: { readonly stage: DealStage }) {
  return (
    <span
      className={`inline-flex h-7 w-fit items-center whitespace-nowrap rounded-md px-2 text-xs font-medium ${getStageClass(
        stage
      )}`}
    >
      {getStageLabel(stage)}
    </span>
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

function DealListSkeleton() {
  return (
    <div className="grid gap-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          className="h-16 animate-pulse rounded-lg border bg-muted"
          key={index}
        />
      ))}
    </div>
  );
}

type DealListErrorProps = {
  readonly error: unknown;
  readonly onRetry: () => void;
};

function DealListError({ error, onRetry }: DealListErrorProps) {
  return (
    <div className="rounded-lg border border-destructive/30 bg-red-50 p-5">
      <p className="text-sm font-medium text-destructive">
        {getApiErrorMessage(error)}
      </p>
      <button
        className="mt-3 h-9 rounded-md border bg-white px-3 text-sm font-medium hover:bg-muted"
        onClick={onRetry}
        type="button"
      >
        다시 시도
      </button>
    </div>
  );
}

type DealEmptyStateProps = {
  readonly hasSearch: boolean;
  readonly onCreate: () => void;
};

function DealEmptyState({ hasSearch, onCreate }: DealEmptyStateProps) {
  return (
    <div className="grid place-items-center rounded-lg border bg-white px-5 py-12 text-center">
      <div>
        <p className="text-base font-semibold">
          {hasSearch ? "조건에 맞는 딜이 없습니다." : "등록된 딜이 없습니다."}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          새 딜을 만들면 단계별 목록에서 바로 확인할 수 있습니다.
        </p>
        <button
          className="mt-5 inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
          onClick={onCreate}
          type="button"
        >
          <Plus className="h-4 w-4" />
          딜 추가
        </button>
      </div>
    </div>
  );
}

function getStageCount(stage: StageTabValue, summary: DealStageSummary) {
  if (stage === "ALL") {
    return Object.values(summary).reduce((sum, n) => sum + (n ?? 0), 0);
  }

  return summary[stage] ?? 0;
}
