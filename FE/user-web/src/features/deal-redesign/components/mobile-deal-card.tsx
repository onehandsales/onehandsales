import { CalendarDays, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import {
  formatDealLikelihood,
  formatDealNextAction,
  getLikelihoodClass,
} from "@/features/deal/utils/deal-display";
import type { Deal } from "@/features/deal/types/deal";
import { StageBadge } from "@/features/deal-redesign/components/stage-badge";
import { formatDate, formatMoney } from "@/utils/format";

type MobileDealCardProps = {
  readonly deal: Deal;
};

export function MobileDealCard({ deal }: MobileDealCardProps) {
  return (
    <Link
      className="block rounded-[26px] border border-border/70 bg-panel p-4 shadow-soft transition hover:-translate-y-0.5"
      to={`/deals/${deal.id}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">
            {deal.companyName ?? "미지정 회사"}
          </p>
          <h2 className="mt-1 truncate text-base font-semibold tracking-[-0.02em] text-foreground">
            {deal.title}
          </h2>
        </div>
        <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <StageBadge stage={deal.stage} />
        <span className={getLikelihoodClass(deal.likelihoodStatus)}>
          {formatDealLikelihood(deal)}
        </span>
      </div>

      <div className="mt-4 grid gap-3 rounded-[20px] bg-panel-muted p-3">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-medium text-muted-foreground">
            예상 금액
          </span>
          <span className="text-sm font-semibold text-foreground">
            {formatMoney(deal.amount, deal.currency)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-medium text-muted-foreground">
            다음 액션
          </span>
          <span className="max-w-[60%] truncate text-sm text-foreground">
            {formatDealNextAction(deal)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
            <CalendarDays className="h-3.5 w-3.5" />
            종료 목표
          </span>
          <span className="text-sm text-foreground">
            {formatDate(deal.expectedCloseDate, { fallback: "-" })}
          </span>
        </div>
      </div>
    </Link>
  );
}
