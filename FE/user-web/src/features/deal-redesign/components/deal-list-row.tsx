import type { Deal, DealStage } from "@/features/deal/types/deal";
import { StageBadge } from "@/features/deal-redesign/components/stage-badge";
import { cn } from "@/utils/cn";
import { formatDate, formatMoney } from "@/utils/format";

type DealListRowProps = {
  readonly deal: Deal;
  readonly isActive?: boolean;
  readonly onSelect?: (dealId: string) => void;
  readonly onStageChange?: (deal: Deal, stage: DealStage) => void;
};

type NextActionStatusStyle = "overdue" | "soon" | "normal" | "done" | "none";

function getNextActionStatusStyle(
  status: Deal["nextActionStatus"]
): NextActionStatusStyle {
  switch (status) {
    case "OVERDUE":
      return "overdue";
    case "DUE_SOON":
      return "soon";
    case "DONE":
      return "done";
    case "NONE":
      return "none";
    default:
      return "normal";
  }
}

function getNextActionStatusLabel(status: Deal["nextActionStatus"], nextActionDueAt: string | null) {
  if (status === "OVERDUE") {
    if (!nextActionDueAt) return "기한 초과";
    const days = Math.floor(
      (Date.now() - new Date(nextActionDueAt).getTime()) / 86400000
    );
    return days > 0 ? `${days}일 초과` : "기한 초과";
  }
  if (status === "DUE_SOON") return "임박";
  if (status === "DONE") return "완료";
  if (status === "NONE") return "-";
  if (nextActionDueAt) return formatDate(nextActionDueAt, { fallback: "이번 주" });
  return "이번 주";
}

const nextActionStatusClass: Record<NextActionStatusStyle, string> = {
  overdue: "text-red-600",
  soon: "text-amber-600",
  normal: "text-gray-500",
  done: "text-gray-400",
  none: "text-gray-400",
};

const deadlineClass = (deal: Deal) => {
  if (!deal.expectedCloseDate) return "text-gray-400";
  const due = new Date(deal.expectedCloseDate);
  const now = new Date();
  const diff = (due.getTime() - now.getTime()) / 86400000;
  if (diff < 0) return "text-red-600 font-semibold";
  if (diff < 7) return "text-red-600";
  return "text-gray-600";
};

export function DealListRow({
  deal,
  isActive = false,
  onSelect,
}: DealListRowProps) {
  const naStyle = getNextActionStatusStyle(deal.nextActionStatus);
  const naStatusLabel = getNextActionStatusLabel(deal.nextActionStatus, deal.nextActionDueAt);
  const dlClass = deadlineClass(deal);

  return (
    <button
      className={cn(
        "flex w-full items-center border-b border-[#E8EDF3] px-6 py-0 text-left transition-colors hover:bg-blue-50/60",
        isActive ? "bg-blue-50" : "bg-white"
      )}
      onClick={() => onSelect?.(deal.id)}
      style={{ height: 62 }}
      type="button"
    >
      {/* 딜명 col — 175px */}
      <div className="flex shrink-0 flex-col gap-0.5" style={{ width: 175 }}>
        <span className="truncate text-[13px] font-semibold text-gray-900">
          {deal.title}
        </span>
        <span className="truncate text-[11px] text-gray-400">
          {deal.latestMemoAt
            ? `${formatDate(deal.latestMemoAt, { fallback: "" })} 활동`
            : "활동 없음"}
        </span>
      </div>

      {/* 회사/담당자 col — 125px */}
      <div className="flex shrink-0 flex-col gap-0.5" style={{ width: 125 }}>
        <span className="truncate text-[12px] text-gray-700">
          {deal.companyName ?? "미지정 회사"}
        </span>
        <span className="truncate text-[11px] text-gray-400">
          {deal.contactName ?? "담당자 미지정"}
        </span>
      </div>

      {/* 단계 col — 100px */}
      <div className="shrink-0" style={{ width: 100 }}>
        <StageBadge stage={deal.stage} />
      </div>

      {/* 금액 col — 100px */}
      <div className="shrink-0 overflow-hidden" style={{ width: 100 }}>
        <span className="text-[12px] font-medium text-gray-900">
          {formatMoney(deal.amount, deal.currency)}
        </span>
      </div>

      {/* 다음 행동 col — flex-1 */}
      <div className="min-w-0 flex-1 flex-col gap-0.5">
        <p className="truncate text-[12px] text-gray-700">
          {deal.nextActionText ?? "다음 행동 없음"}
        </p>
        <p className={cn("text-[11px]", nextActionStatusClass[naStyle])}>
          {naStatusLabel}
        </p>
      </div>

      {/* 마감일 col — 78px */}
      <div className="shrink-0 text-right" style={{ width: 78 }}>
        <span className={cn("text-[12px] font-medium", dlClass)}>
          {deal.expectedCloseDate
            ? formatDate(deal.expectedCloseDate, { fallback: "-" })
            : "-"}
        </span>
      </div>
    </button>
  );
}
