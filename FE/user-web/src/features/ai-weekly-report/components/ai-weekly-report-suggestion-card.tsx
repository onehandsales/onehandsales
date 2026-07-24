import { ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import type { AiWeeklyReportSuggestion } from "@/features/ai-weekly-report/types/ai-weekly-report";
import { cn } from "@/utils/cn";

type SuggestionTone = "cleanup" | "follow-up" | "next-action" | "risk";

type AiWeeklyReportSuggestionCardProps = {
  readonly suggestion: AiWeeklyReportSuggestion;
  readonly tone: SuggestionTone;
  readonly actionLabel?: string;
};

export function AiWeeklyReportSuggestionCard({
  actionLabel = "관련 기록 열기",
  suggestion,
  tone,
}: AiWeeklyReportSuggestionCardProps) {
  const targetPath = getSuggestionTargetPath(suggestion);

  return (
    <article
      className={cn(
        "grid min-w-0 gap-3 rounded-md border bg-white p-3",
        toneClassNames[tone]
      )}
    >
      <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <span
              className={cn(
                "inline-flex h-6 items-center rounded px-2 text-[11px] font-semibold",
                priorityClassNames[suggestion.priority]
              )}
            >
              {priorityLabel[suggestion.priority]}
            </span>
            {suggestion.targetLabel ? (
              <span className="min-w-0 break-words text-[12px] font-medium text-[#64748B]">
                {suggestion.targetLabel}
              </span>
            ) : null}
          </div>
          <h4 className="mt-2 break-words text-[13px] font-semibold leading-5 text-[#111827]">
            {suggestion.title}
          </h4>
        </div>

        {targetPath ? (
          <Link
            className="inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-md border border-[#D7DCE5] bg-white px-2.5 text-[12px] font-semibold text-[#374151] transition hover:border-[#93C5FD] hover:bg-[#F8FAFC] hover:text-[#1D4ED8]"
            to={targetPath}
          >
            <ExternalLink className="h-3.5 w-3.5" />
            {actionLabel}
          </Link>
        ) : null}
      </div>

      <p className="break-words text-[13px] leading-5 text-[#374151]">
        {suggestion.body}
      </p>
      {suggestion.reason ? (
        <p className="break-words border-t border-[#E2E5EC] pt-2 text-[12px] leading-5 text-[#64748B]">
          근거: {suggestion.reason}
        </p>
      ) : null}
    </article>
  );
}

function getSuggestionTargetPath(
  suggestion: Pick<
    AiWeeklyReportSuggestion,
    "targetId" | "targetPath" | "targetType"
  >
) {
  const normalizedPath = normalizeInternalPath(suggestion.targetPath);

  if (normalizedPath) {
    return normalizedPath;
  }

  if (!suggestion.targetId || !suggestion.targetType) {
    return null;
  }

  const targetType = suggestion.targetType.toUpperCase();

  switch (targetType) {
    case "COMPANY":
      return `/app/companies/${suggestion.targetId}`;
    case "CONTACT":
      return `/app/contacts/${suggestion.targetId}`;
    case "DEAL":
      return `/app/deals/${suggestion.targetId}`;
    case "MEETING_NOTE":
      return `/app/meeting-notes/${suggestion.targetId}`;
    case "PRODUCT":
      return `/app/products/${suggestion.targetId}`;
    case "SCHEDULE":
      return `/app/schedules/${suggestion.targetId}`;
    default:
      return null;
  }
}

const toneClassNames: Record<SuggestionTone, string> = {
  cleanup: "border-[#BFDBFE]",
  "follow-up": "border-[#C7D2FE]",
  "next-action": "border-[#BBF7D0]",
  risk: "border-[#FECACA]",
};

const priorityClassNames = {
  HIGH: "bg-[#FEF2F2] text-[#B91C1C]",
  LOW: "bg-[#F1F5F9] text-[#475569]",
  MEDIUM: "bg-[#FFFBEB] text-[#B45309]",
} as const;

const priorityLabel = {
  HIGH: "높음",
  LOW: "낮음",
  MEDIUM: "중간",
} as const;

function normalizeInternalPath(path: string | null | undefined) {
  if (!path || path.startsWith("http://") || path.startsWith("https://")) {
    return null;
  }

  if (path.startsWith("/app/")) {
    return path;
  }

  if (path.startsWith("/")) {
    return `/app${path}`;
  }

  return null;
}
