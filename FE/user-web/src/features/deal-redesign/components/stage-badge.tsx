import type { DealStage } from "@/features/deal/types/deal";
import { cn } from "@/utils/cn";

const stageStyles: Record<DealStage, string> = {
  INITIAL_CONTACT: "bg-sky-100 text-sky-700",
  NEEDS_ANALYSIS: "bg-blue-100 text-blue-700",
  PROPOSAL: "bg-yellow-100 text-yellow-700",
  NEGOTIATION: "bg-amber-100 text-amber-700",
  WON: "bg-emerald-100 text-emerald-700",
  LOST: "bg-rose-100 text-rose-700",
};

const stageLabels: Record<DealStage, string> = {
  INITIAL_CONTACT: "초기 접촉",
  NEEDS_ANALYSIS: "니즈 확인",
  PROPOSAL: "제안/견적",
  NEGOTIATION: "협상",
  WON: "성사",
  LOST: "실패",
};

type StageBadgeProps = {
  readonly stage: DealStage;
  readonly className?: string;
};

export function StageBadge({ className, stage }: StageBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex h-7 items-center rounded-full px-3 text-xs font-semibold",
        stageStyles[stage],
        className
      )}
    >
      {stageLabels[stage]}
    </span>
  );
}
