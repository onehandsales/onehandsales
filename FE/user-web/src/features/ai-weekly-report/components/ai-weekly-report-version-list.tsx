import {
  AlertCircle,
  CheckCircle2,
  History,
  Loader2,
} from "lucide-react";
import type { AiWeeklyReportSummary } from "@/features/ai-weekly-report/types/ai-weekly-report";
import { cn } from "@/utils/cn";

type AiWeeklyReportVersionListProps = {
  readonly failedVersionCount: number;
  readonly reports: readonly AiWeeklyReportSummary[];
  readonly selectedReportId: string | null;
  readonly onSelectReport: (reportId: string) => void;
};

export function AiWeeklyReportVersionList({
  failedVersionCount,
  onSelectReport,
  reports,
  selectedReportId,
}: AiWeeklyReportVersionListProps) {
  if (reports.length === 0) {
    return null;
  }

  return (
    <section className="grid gap-3 border-t border-[#E2E5EC] pt-4">
      <div className="flex min-w-0 flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h3 className="inline-flex items-center gap-2 text-sm font-semibold text-[#111827]">
            <History className="h-4 w-4 text-[#64748B]" />
            버전 이력
          </h3>
          <p className="mt-1 text-[12px] text-[#64748B]">
            실패 이력 {failedVersionCount.toLocaleString("ko-KR")}건 포함
          </p>
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {reports.map((report) => {
          const isSelected = report.id === selectedReportId;

          return (
            <button
              aria-pressed={isSelected}
              className={cn(
                "grid min-h-[84px] min-w-0 gap-2 rounded-md border bg-white p-3 text-left transition hover:border-[#93C5FD] hover:bg-[#F8FAFC]",
                isSelected
                  ? "border-[#2563EB] ring-2 ring-[#DBEAFE]"
                  : "border-[#E2E5EC]"
              )}
              key={report.id}
              onClick={() => onSelectReport(report.id)}
              type="button"
            >
              <div className="flex min-w-0 items-center justify-between gap-2">
                <span className="text-[13px] font-semibold text-[#111827]">
                  v{report.version}
                </span>
                <VersionStatusBadge report={report} />
              </div>
              <p className="break-words text-[12px] leading-5 text-[#64748B]">
                {formatReportTime(report)}
              </p>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function VersionStatusBadge({
  report,
}: {
  readonly report: AiWeeklyReportSummary;
}) {
  if (report.status === "READY") {
    return (
      <span className="inline-flex h-6 shrink-0 items-center gap-1 rounded bg-[#ECFDF5] px-2 text-[11px] font-semibold text-[#047857]">
        <CheckCircle2 className="h-3.5 w-3.5" />
        완료
      </span>
    );
  }

  if (report.status === "FAILED") {
    return (
      <span className="inline-flex h-6 shrink-0 items-center gap-1 rounded bg-[#FEF2F2] px-2 text-[11px] font-semibold text-[#B91C1C]">
        <AlertCircle className="h-3.5 w-3.5" />
        실패
      </span>
    );
  }

  return (
    <span className="inline-flex h-6 shrink-0 items-center gap-1 rounded bg-[#EEF2FF] px-2 text-[11px] font-semibold text-[#3730A3]">
      <Loader2 className="h-3.5 w-3.5 animate-spin" />
      생성 중
    </span>
  );
}

function formatReportTime(report: AiWeeklyReportSummary) {
  const value = report.generatedAt ?? report.failedAt ?? report.requestedAt;

  try {
    return new Intl.DateTimeFormat("ko-KR", {
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      month: "2-digit",
    }).format(new Date(value));
  } catch {
    return value;
  }
}
