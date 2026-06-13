import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  CalendarClock,
  Check,
  Clock3,
  ExternalLink,
  MessageSquareText,
  Package,
  RefreshCw,
  X,
} from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useForm, type UseFormReturn } from "react-hook-form";
import { Link } from "react-router-dom";
import { DealActivitySection } from "@/features/deal/components/deal-activity-section";
import {
  useDealActivities,
  useDealDetail,
} from "@/features/deal/hooks/use-deal-detail";
import {
  useChangeDealStageMutation,
  useCompleteDealNextActionMutation,
  useSnoozeDealNextActionMutation,
} from "@/features/deal/hooks/use-deal-mutations";
import {
  dealSnoozeFormSchema,
  toDateTimeLocalValue,
  toSnoozeDealNextActionInput,
  type DealSnoozeFormValues,
} from "@/features/deal/schemas/deal-schema";
import {
  formatDealLikelihood,
  formatDealNextAction,
  getLikelihoodClass,
} from "@/features/deal/utils/deal-display";
import type {
  Deal,
  DealDetail,
  DealProduct,
  DealStage,
} from "@/features/deal/types/deal";
import { getApiErrorMessage } from "@/lib/api-client";
import { isDeletedResourceReadError } from "@/utils/api-error";
import { formatDate, formatDateTime, formatMoney } from "@/utils/format";

type DealDetailPanelProps = {
  readonly dealId: string;
  readonly variant?: "panel" | "page";
  readonly onClose?: () => void;
  readonly onChanged?: (message: string) => void;
};

const dealStages: Array<{ readonly value: DealStage; readonly label: string }> =
  [
    { value: "INITIAL_CONTACT", label: "초기 접촉" },
    { value: "NEEDS_ANALYSIS", label: "니즈 확인" },
    { value: "PROPOSAL", label: "제안/견적" },
    { value: "NEGOTIATION", label: "협상" },
    { value: "WON", label: "성사" },
    { value: "LOST", label: "실패" },
  ];

export function DealDetailPanel({
  dealId,
  variant = "panel",
  onClose,
  onChanged,
}: DealDetailPanelProps) {
  const [notice, setNotice] = useState<string | null>(null);
  const dealQuery = useDealDetail(dealId);
  const activitiesQuery = useDealActivities(dealId, { page: 1, pageSize: 20 });
  const changeStageMutation = useChangeDealStageMutation();
  const completeNextActionMutation = useCompleteDealNextActionMutation();
  const snoozeNextActionMutation = useSnoozeDealNextActionMutation();
  const snoozeForm = useForm<DealSnoozeFormValues>({
    resolver: zodResolver(dealSnoozeFormSchema),
    defaultValues: getDefaultSnoozeValues(null),
  });
  const detail = dealQuery.data;
  const deal = detail?.deal ?? null;
  const actionError =
    changeStageMutation.error ??
    completeNextActionMutation.error ??
    snoozeNextActionMutation.error ??
    null;

  useEffect(() => {
    if (deal) {
      snoozeForm.reset(getDefaultSnoozeValues(deal.nextActionDueAt));
    }
  }, [deal, snoozeForm]);

  const publishNotice = (message: string) => {
    if (onChanged) {
      onChanged(message);
      return;
    }

    setNotice(message);
  };

  const onStageChange = async (stage: DealStage) => {
    if (!deal || stage === deal.stage) {
      return;
    }

    await changeStageMutation.mutateAsync({
      dealId: deal.id,
      stage,
    });
    publishNotice("딜 단계가 변경되었습니다.");
  };

  const onCompleteNextAction = async () => {
    if (!deal) {
      return;
    }

    await completeNextActionMutation.mutateAsync({
      dealId: deal.id,
      completedAt: new Date().toISOString(),
    });
    publishNotice("다음 행동이 완료되었습니다.");
  };

  const onSnoozeNextAction = snoozeForm.handleSubmit(async (values) => {
    if (!deal) {
      return;
    }

    await snoozeNextActionMutation.mutateAsync(
      toSnoozeDealNextActionInput(deal.id, values)
    );
    publishNotice("다음 행동 일시가 미뤄졌습니다.");
  });

  if (!dealId) {
    return (
      <DetailShell variant={variant}>
        <EmptyPanelState />
      </DetailShell>
    );
  }

  if (dealQuery.isLoading) {
    return (
      <DetailShell variant={variant}>
        <DealDetailSkeleton />
      </DetailShell>
    );
  }

  if (dealQuery.isError) {
    if (isDeletedResourceReadError(dealQuery.error)) {
      return (
        <DetailShell variant={variant}>
          <DeletedDealState error={dealQuery.error} />
        </DetailShell>
      );
    }

    return (
      <DetailShell variant={variant}>
        <DealDetailError
          error={dealQuery.error}
          onRetry={() => void dealQuery.refetch()}
        />
      </DetailShell>
    );
  }

  if (!detail || !deal) {
    return (
      <DetailShell variant={variant}>
        <DealDetailSkeleton />
      </DetailShell>
    );
  }

  const activities = activitiesQuery.data?.items ?? detail.activities;

  return (
    <DetailShell variant={variant}>
      <header className="flex flex-col gap-3 border-b pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {variant === "page" ? (
              <Link
                className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary"
                to="/deals"
              >
                <ArrowLeft className="h-4 w-4" />
                딜 목록
              </Link>
            ) : null}
            <h2
              className={
                variant === "page"
                  ? "mt-3 truncate text-2xl font-semibold"
                  : "truncate text-lg font-semibold"
              }
            >
              {deal.title}
            </h2>
            <p className="mt-1 truncate text-sm text-muted-foreground">
              {[deal.companyName, deal.contactName].filter(Boolean).join(" · ") ||
                "연결 대상 없음"}
            </p>
          </div>
          {onClose ? (
            <button
              aria-label="상세 패널 닫기"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-md border text-muted-foreground hover:bg-muted"
              onClick={onClose}
              type="button"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>
        {variant === "panel" ? (
          <Link
            className="inline-flex w-fit items-center gap-2 text-sm font-medium text-primary hover:underline"
            to={`/deals/${deal.id}`}
          >
            상세 페이지
            <ExternalLink className="h-4 w-4" />
          </Link>
        ) : null}
      </header>

      {notice ? (
        <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {notice}
        </p>
      ) : null}

      {actionError ? (
        <p className="rounded-md border border-destructive/30 bg-red-50 px-3 py-2 text-sm text-destructive">
          {getApiErrorMessage(actionError)}
        </p>
      ) : null}

      <DealPrioritySummary
        deal={deal}
        isChangingStage={changeStageMutation.isPending}
        onStageChange={onStageChange}
      />

      <DealNextActionControls
        deal={deal}
        isCompleting={completeNextActionMutation.isPending}
        isSnoozing={snoozeNextActionMutation.isPending}
        onComplete={onCompleteNextAction}
        onSnooze={onSnoozeNextAction}
        snoozeForm={snoozeForm}
      />

      <DealActivitySection
        activities={activities}
        dealId={deal.id}
        error={activitiesQuery.error}
        isLoading={activitiesQuery.isLoading}
        onChanged={publishNotice}
        onRetry={() => void activitiesQuery.refetch()}
      />

      <div
        className={
          variant === "page"
            ? "grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]"
            : "grid gap-6"
        }
      >
        <div className="grid content-start gap-6">
          <DealBasicSection detail={detail} />
          <DealProductSection products={detail.products} />
        </div>
        <aside className="grid content-start gap-6">
          <DealMemoSection memos={detail.memos} />
          <DealRelatedPlaceholder detail={detail} />
        </aside>
      </div>
    </DetailShell>
  );
}

function DetailShell({
  children,
  variant,
}: {
  readonly children: ReactNode;
  readonly variant: "panel" | "page";
}) {
  return (
    <section
      className={
        variant === "page"
          ? "mx-auto grid max-w-7xl gap-6 px-5 py-6"
          : "grid max-h-[calc(100vh-160px)] gap-5 overflow-y-auto rounded-lg border bg-white p-4"
      }
    >
      {children}
    </section>
  );
}

function DealPrioritySummary({
  deal,
  isChangingStage,
  onStageChange,
}: {
  readonly deal: Deal;
  readonly isChangingStage: boolean;
  readonly onStageChange: (stage: DealStage) => Promise<void>;
}) {
  return (
    <section className="grid gap-3 rounded-lg border bg-white p-4">
      <div>
        <h2 className="text-lg font-semibold">핵심 요약</h2>
      </div>
      <dl className="grid gap-3 md:grid-cols-2">
        <SummaryItem label="회사/거래처">
          <div className="grid gap-1">
            {deal.companyId ? (
              <Link className="font-medium hover:text-primary" to={`/companies/${deal.companyId}`}>
                {deal.companyName}
              </Link>
            ) : (
              <span>-</span>
            )}
            {deal.contactId ? (
              <Link
                className="text-sm text-muted-foreground hover:text-primary"
                to={`/contacts/${deal.contactId}`}
              >
                {deal.contactName}
              </Link>
            ) : (
              <span className="text-sm text-muted-foreground">-</span>
            )}
          </div>
        </SummaryItem>
        <SummaryItem label="단계">
          <select
            aria-label="딜 단계"
            className="h-9 w-full rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isChangingStage}
            onChange={(event) =>
              void onStageChange(event.target.value as DealStage)
            }
            value={deal.stage}
          >
            {dealStages.map((stage) => (
              <option key={stage.value} value={stage.value}>
                {stage.label}
              </option>
            ))}
          </select>
        </SummaryItem>
        <SummaryItem label="금액">
          <span className="font-semibold">{formatMoney(deal.amount, deal.currency)}</span>
        </SummaryItem>
        <SummaryItem label="가능성">
          <span
            className={`inline-flex h-7 w-fit items-center rounded-md px-2 text-xs font-medium ${getLikelihoodClass(
              deal.likelihoodStatus
            )}`}
          >
            {formatDealLikelihood(deal)}
          </span>
        </SummaryItem>
        <SummaryItem label="다음 행동">
          <span>{formatDealNextAction(deal, { includeYear: true })}</span>
        </SummaryItem>
        <SummaryItem label="마감일">
          <span>{formatDate(deal.expectedCloseDate)}</span>
        </SummaryItem>
      </dl>
    </section>
  );
}

function SummaryItem({
  label,
  children,
}: {
  readonly label: string;
  readonly children: ReactNode;
}) {
  return (
    <div className="grid gap-1 rounded-md border bg-muted/30 px-3 py-2">
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="min-w-0 text-sm text-slate-800">{children}</dd>
    </div>
  );
}

function DealNextActionControls({
  deal,
  isCompleting,
  isSnoozing,
  onComplete,
  onSnooze,
  snoozeForm,
}: {
  readonly deal: Deal;
  readonly isCompleting: boolean;
  readonly isSnoozing: boolean;
  readonly onComplete: () => Promise<void>;
  readonly onSnooze: () => void;
  readonly snoozeForm: UseFormReturn<DealSnoozeFormValues>;
}) {
  const hasNextAction = Boolean(deal.nextActionText || deal.nextActionDueAt);
  const isDone = deal.nextActionStatus === "DONE";

  return (
    <section className="grid gap-3 rounded-lg border bg-white p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold">다음 행동</h2>
          <p className="mt-1 truncate text-sm text-muted-foreground">
            {formatDealNextAction(deal, { includeYear: true })}
          </p>
        </div>
        <button
          className="inline-flex h-9 w-fit items-center gap-2 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
          disabled={!hasNextAction || isDone || isCompleting}
          onClick={() => void onComplete()}
          type="button"
        >
          <Check className="h-4 w-4" />
          완료
        </button>
      </div>

      <form className="grid gap-3 md:grid-cols-2" onSubmit={onSnooze}>
        <div className="grid gap-2">
          <label className="text-sm font-medium" htmlFor="deal-snooze-due">
            미룰 일시
          </label>
          <input
            aria-describedby={
              snoozeForm.formState.errors.nextActionDueAt
                ? "deal-snooze-due-error"
                : undefined
            }
            aria-invalid={Boolean(snoozeForm.formState.errors.nextActionDueAt)}
            className="h-10 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            id="deal-snooze-due"
            type="datetime-local"
            {...snoozeForm.register("nextActionDueAt")}
          />
          {snoozeForm.formState.errors.nextActionDueAt ? (
            <p className="text-xs text-destructive" id="deal-snooze-due-error">
              {snoozeForm.formState.errors.nextActionDueAt.message}
            </p>
          ) : null}
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium" htmlFor="deal-snooze-reason">
            사유
          </label>
          <input
            className="h-10 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            id="deal-snooze-reason"
            {...snoozeForm.register("reason")}
          />
        </div>
        <button
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md border px-3 text-sm font-medium hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60 md:col-span-2 md:justify-self-end"
          disabled={!hasNextAction || isSnoozing}
          type="submit"
        >
          <Clock3 className="h-4 w-4" />
          미루기
        </button>
      </form>
    </section>
  );
}

function DealBasicSection({ detail }: { readonly detail: DealDetail }) {
  const { deal } = detail;
  const items = [
    { label: "생성일", value: formatDateTime(deal.createdAt), icon: CalendarClock },
    { label: "수정일", value: formatDateTime(deal.updatedAt), icon: RefreshCw },
    { label: "Memo", value: `${deal.memoCount}개`, icon: MessageSquareText },
    { label: "제품", value: `${detail.products.length}개`, icon: Package },
  ];

  return (
    <section className="grid gap-3">
      <h2 className="text-lg font-semibold">기본 정보</h2>
      <div className="grid gap-2 rounded-lg border bg-white p-4">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <div
              className="grid grid-cols-[20px_88px_minmax(0,1fr)] items-center gap-2 text-sm"
              key={item.label}
            >
              <Icon className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{item.label}</span>
              <span className="truncate font-medium">{item.value}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function DealProductSection({ products }: { readonly products: DealProduct[] }) {
  return (
    <section className="grid gap-3">
      <h2 className="text-lg font-semibold">제품/연결 정보</h2>
      <div className="overflow-hidden rounded-lg border bg-white">
        {products.length === 0 ? (
          <p className="px-4 py-5 text-sm text-muted-foreground">
            연결된 제품이 없습니다.
          </p>
        ) : (
          <div className="divide-y">
            {products.map((product) => (
              <article className="grid gap-1 px-4 py-4" key={product.id}>
                <Link
                  className="inline-flex w-fit items-center gap-2 text-sm font-semibold hover:text-primary"
                  to={`/products/${product.id}`}
                >
                  <Package className="h-4 w-4" />
                  {product.name}
                </Link>
                <p className="text-xs text-muted-foreground">
                  {[product.category, formatProductPrice(product)]
                    .filter(Boolean)
                    .join(" · ") || "-"}
                </p>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function DealMemoSection({
  memos,
}: {
  readonly memos: DealDetail["memos"];
}) {
  return (
    <section className="grid gap-3">
      <h2 className="text-lg font-semibold">Memo 기록</h2>
      <div className="overflow-hidden rounded-lg border bg-white">
        {memos.length === 0 ? (
          <p className="px-4 py-5 text-sm text-muted-foreground">
            등록된 Memo가 없습니다.
          </p>
        ) : (
          <div className="divide-y">
            {memos.map((memo) => (
              <article className="grid gap-2 px-4 py-4" key={memo.id}>
                <p className="text-xs text-muted-foreground">
                  {formatDateTime(memo.memoDate)}
                </p>
                {memo.title ? (
                  <h3 className="text-sm font-semibold">{memo.title}</h3>
                ) : null}
                <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
                  {memo.content}
                </p>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function DealRelatedPlaceholder({ detail }: { readonly detail: DealDetail }) {
  return (
    <section className="grid gap-3">
      <h2 className="text-lg font-semibold">일정/회의록</h2>
      <div className="grid gap-3 rounded-lg border bg-white p-4">
        <RelatedSummaryRow
          label="일정"
          value={`${detail.schedulesSummary.totalCount}개`}
        />
        <RelatedSummaryRow
          label="다가오는 일정"
          value={`${detail.schedulesSummary.upcomingCount}개`}
        />
        <RelatedSummaryRow
          label="회의록"
          value={`${detail.meetingNotesSummary.totalCount}개`}
        />
        <RelatedSummaryRow
          label="최근 회의"
          value={formatDateTime(detail.meetingNotesSummary.latestMeetingAt, {
            fallback: "-",
            includeYear: true,
          })}
        />
      </div>
    </section>
  );
}

function RelatedSummaryRow({
  label,
  value,
}: {
  readonly label: string;
  readonly value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function EmptyPanelState() {
  return (
    <div className="grid place-items-center rounded-lg border border-dashed px-4 py-12 text-center">
      <div>
        <h2 className="text-base font-semibold">딜을 선택해주세요.</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          선택한 딜의 상세 정보가 표시됩니다.
        </p>
      </div>
    </div>
  );
}

function DeletedDealState({ error }: { readonly error: unknown }) {
  return (
    <div className="grid place-items-center rounded-lg border border-destructive/30 bg-red-50 px-4 py-12 text-center">
      <div>
        <h2 className="text-base font-semibold text-destructive">
          삭제된 딜입니다.
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {getApiErrorMessage(error)}
        </p>
      </div>
    </div>
  );
}

function DealDetailError({
  error,
  onRetry,
}: {
  readonly error: unknown;
  readonly onRetry: () => void;
}) {
  return (
    <div className="grid place-items-center rounded-lg border px-4 py-12 text-center">
      <div>
        <h2 className="text-base font-semibold">딜 상세를 불러오지 못했습니다.</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {getApiErrorMessage(error)}
        </p>
        <button
          className="mt-4 inline-flex h-9 items-center rounded-md border px-3 text-sm font-medium hover:bg-muted"
          onClick={onRetry}
          type="button"
        >
          재시도
        </button>
      </div>
    </div>
  );
}

function DealDetailSkeleton() {
  return (
    <div className="grid gap-4">
      <div className="h-20 animate-pulse rounded-lg bg-muted" />
      <div className="grid gap-3 md:grid-cols-2">
        {Array.from({ length: 6 }, (_, index) => (
          <div className="h-16 animate-pulse rounded-md bg-muted" key={index} />
        ))}
      </div>
      <div className="h-44 animate-pulse rounded-lg bg-muted" />
    </div>
  );
}

function getDefaultSnoozeValues(value: string | null): DealSnoozeFormValues {
  return {
    nextActionDueAt: toDateTimeLocalValue(getNextDay(value)),
    reason: "",
  };
}

function getNextDay(value: string | null) {
  const base = value ? new Date(value) : new Date();

  if (Number.isNaN(base.getTime())) {
    base.setTime(Date.now());
  }

  base.setDate(base.getDate() + 1);

  return base;
}

function formatProductPrice(product: DealProduct) {
  return product.unitPrice === null
    ? ""
    : formatMoney(product.unitPrice, product.currency);
}
