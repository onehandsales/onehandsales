import {
  formatDealLikelihood,
  formatDealNextAction,
  getLikelihoodClass,
} from "@/features/deal/utils/deal-display";
import type { Deal } from "@/features/deal/types/deal";
import type { DealStage } from "@/features/deal/types/deal";
import { StageBadge } from "@/features/deal-redesign/components/stage-badge";
import { cn } from "@/utils/cn";
import { formatDate, formatMoney } from "@/utils/format";

type DealListRowProps = {
  readonly deal: Deal;
  readonly isActive?: boolean;
  readonly onSelect?: (dealId: string) => void;
  readonly onStageChange?: (deal: Deal, stage: DealStage) => void;
  readonly stageDisabled?: boolean;
};

export function DealListRow({
  deal,
  isActive = false,
  onSelect,
  onStageChange,
  stageDisabled = false,
}: DealListRowProps) {
  return (
    <article
      className={cn(
        "grid w-full grid-cols-[minmax(0,1.4fr)_0.8fr_0.9fr_0.8fr] items-center gap-4 rounded-[20px] border px-4 py-4 text-left transition",
        isActive
          ? "border-primary/25 bg-primary/5 shadow-soft"
          : "border-border/70 bg-panel hover:border-primary/20 hover:bg-white"
      )}
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2" onClick={() => onSelect?.(deal.id)}>
          <button
            className="min-w-0 text-left"
            onClick={() => onSelect?.(deal.id)}
            type="button"
          >
            <StageBadge className="shrink-0" stage={deal.stage} />
          </button>
          <span className="truncate text-sm text-muted-foreground">
            {deal.companyName ?? "미지정 회사"}
          </span>
        </div>
        <button
          className="mt-3 block w-full truncate text-left text-base font-semibold tracking-[-0.02em] text-foreground"
          onClick={() => onSelect?.(deal.id)}
          type="button"
        >
          {deal.title}
        </button>
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Likelihood
        </p>
        <span className={cn("mt-2 inline-flex", getLikelihoodClass(deal.likelihoodStatus))}>
          {formatDealLikelihood(deal)}
        </span>
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Next action
        </p>
        <p className="mt-2 truncate text-sm text-foreground">
          {formatDealNextAction(deal)}
        </p>
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Value
        </p>
        <p className="mt-2 text-sm font-semibold text-foreground">
          {formatMoney(deal.amount, deal.currency)}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {formatDate(deal.expectedCloseDate, { fallback: "-" })}
        </p>
        {onStageChange ? (
          <select
            className="mt-3 h-9 w-full rounded-md border bg-panel px-2 text-xs text-foreground outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
            disabled={stageDisabled}
            onChange={(event) =>
              onStageChange(deal, event.target.value as DealStage)
            }
            value={deal.stage}
          >
            <option value="INITIAL_CONTACT">초기 접촉</option>
            <option value="IN_DISCUSSION">논의 중</option>
            <option value="WON">성사</option>
            <option value="LOST">실패</option>
          </select>
        ) : null}
      </div>
    </article>
  );
}
