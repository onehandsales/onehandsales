import type {
  Deal,
  DealLikelihoodStatus,
  DealStage,
  NextActionStatus,
} from "@/features/deal/types/deal";
import { formatDateTime } from "@/utils/format";

export function getStageLabel(stage: DealStage) {
  switch (stage) {
    case "INITIAL_CONTACT":
      return "초기 접촉";
    case "NEEDS_ANALYSIS":
      return "니즈 확인";
    case "PROPOSAL":
      return "제안/견적";
    case "NEGOTIATION":
      return "협상";
    case "WON":
      return "성사";
    case "LOST":
      return "실패";
  }
}

export function getStageClass(stage: DealStage) {
  switch (stage) {
    case "INITIAL_CONTACT":
      return "bg-sky-50 text-sky-700";
    case "NEEDS_ANALYSIS":
      return "bg-blue-50 text-blue-700";
    case "PROPOSAL":
      return "bg-yellow-50 text-yellow-700";
    case "NEGOTIATION":
      return "bg-amber-50 text-amber-700";
    case "WON":
      return "bg-emerald-50 text-emerald-700";
    case "LOST":
      return "bg-slate-100 text-slate-600";
  }
}

export function getLikelihoodLabel(status: DealLikelihoodStatus) {
  switch (status) {
    case "POSITIVE":
      return "긍정";
    case "NEUTRAL":
      return "중립";
    case "NEGATIVE":
      return "부정";
  }
}

export function getLikelihoodClass(status: DealLikelihoodStatus) {
  switch (status) {
    case "POSITIVE":
      return "bg-emerald-50 text-emerald-700";
    case "NEUTRAL":
      return "bg-slate-100 text-slate-700";
    case "NEGATIVE":
      return "bg-red-50 text-red-700";
  }
}

export function getNextActionStatusLabel(status: NextActionStatus) {
  switch (status) {
    case "NONE":
      return "없음";
    case "SCHEDULED":
      return "예정";
    case "DUE_SOON":
      return "임박";
    case "OVERDUE":
      return "지연";
    case "DONE":
      return "완료";
  }
}

export function getDealNextActionTitle(deal: Deal) {
  return deal.nextActionText ?? getNextActionStatusLabel(deal.nextActionStatus);
}

export function formatDealLikelihood(deal: Deal) {
  const label = getLikelihoodLabel(deal.likelihoodStatus);

  return deal.likelihoodPercent === null
    ? label
    : `${label} · ${deal.likelihoodPercent}%`;
}

export function formatDealNextAction(
  deal: Deal,
  options: { readonly includeYear?: boolean } = {}
) {
  const title = getDealNextActionTitle(deal);
  const dueAt = formatDateTime(deal.nextActionDueAt, {
    fallback: "-",
    includeYear: options.includeYear,
  });

  return dueAt === "-" ? title : `${title} · ${dueAt}`;
}
