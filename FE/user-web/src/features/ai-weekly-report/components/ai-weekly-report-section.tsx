import {
  AlertCircle,
  BarChart3,
  Bot,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Database,
  Loader2,
  MessageSquareText,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  Wrench,
} from "lucide-react";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import { AiWeeklyReportVersionList } from "@/features/ai-weekly-report/components/ai-weekly-report-version-list";
import { AiWeeklyReportSuggestionCard } from "@/features/ai-weekly-report/components/ai-weekly-report-suggestion-card";
import { useCreateAiWeeklyReportMutation } from "@/features/ai-weekly-report/hooks/use-ai-weekly-report-mutations";
import {
  useAiWeeklyReportDetail,
  useAiWeeklyReportSnapshotSummary,
  useAiWeeklyReportWeek,
} from "@/features/ai-weekly-report/hooks/use-ai-weekly-report-queries";
import { createAiWeeklyReportSchema } from "@/features/ai-weekly-report/schemas/ai-weekly-report-schema";
import type {
  AiWeeklyReportDataCoverage,
  AiWeeklyReportDetail,
  AiWeeklyReportSections,
  AiWeeklyReportSnapshotSummary,
  AiWeeklyReportSummary,
  AiWeeklyReportSuggestion,
  AiWeeklyReportWeekResponse,
} from "@/features/ai-weekly-report/types/ai-weekly-report";
import { ApiClientError } from "@/lib/api-client";
import { cn } from "@/utils/cn";

type AiWeeklyReportSectionProps = {
  readonly weekStart: string;
  readonly timeZone?: string;
  readonly className?: string;
};

export function AiWeeklyReportSection({
  className,
  timeZone,
  weekStart,
}: AiWeeklyReportSectionProps) {
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [snapshotOpen, setSnapshotOpen] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const weekParams = useMemo(
    () => ({
      includeFailed: true,
      ...(timeZone ? { timeZone } : {}),
      weekStart,
    }),
    [timeZone, weekStart]
  );
  const weekQuery = useAiWeeklyReportWeek(weekParams);
  const createMutation = useCreateAiWeeklyReportMutation();
  const weekData = weekQuery.data;
  const availableReports = useMemo(
    () =>
      mergeReports(
        weekData?.versions ?? [],
        weekData?.failedVersions ?? [],
        weekData?.generatingReport ?? null
      ),
    [weekData?.failedVersions, weekData?.generatingReport, weekData?.versions]
  );
  const latestFailedReport = weekData?.failedVersions[0] ?? null;
  const fallbackReport =
    weekData?.latestSuccessfulReport ??
    weekData?.generatingReport ??
    latestFailedReport;
  const selectedSummary =
    availableReports.find((report) => report.id === selectedReportId) ??
    fallbackReport ??
    null;
  const detailQuery = useAiWeeklyReportDetail(selectedSummary?.id ?? null, {
    shouldPoll: selectedSummary?.status === "GENERATING",
  });
  const selectedDetail = detailQuery.data;
  const isGenerating = Boolean(weekData?.generatingReport);
  const isCreateDisabled =
    createMutation.isPending || isGenerating || weekQuery.isLoading;

  useEffect(() => {
    setSelectedReportId(null);
    setSnapshotOpen(false);
    setCreateError(null);
  }, [timeZone, weekStart]);

  useEffect(() => {
    if (!weekData) {
      return;
    }

    setSelectedReportId((currentReportId) => {
      if (
        currentReportId &&
        availableReports.some((report) => report.id === currentReportId)
      ) {
        return currentReportId;
      }

      return fallbackReport?.id ?? null;
    });
  }, [availableReports, fallbackReport?.id, weekData]);

  const createReport = async () => {
    if (isCreateDisabled) {
      return;
    }

    const parsed = createAiWeeklyReportSchema.safeParse({
      locale: getPreferredLocale(),
      ...(timeZone ? { timeZone } : {}),
      weekStart,
    });

    if (!parsed.success) {
      setCreateError("주간 리포트 생성 조건을 확인해 주세요.");
      return;
    }

    try {
      setCreateError(null);
      const response = await createMutation.mutateAsync({
        ...parsed.data,
        idempotencyKey: createIdempotencyKey(),
      });
      setSelectedReportId(response.report.id);
      await weekQuery.refetch();
    } catch (error) {
      if (isAlreadyGeneratingError(error)) {
        setCreateError(null);
        await weekQuery.refetch();
        return;
      }

      setCreateError(getCreateErrorMessage(error));
    }
  };

  return (
    <section
      aria-busy={createMutation.isPending || isGenerating}
      className={cn("grid gap-4 border-t border-[#E2E5EC] pt-4", className)}
    >
      <div className="overflow-hidden rounded-md border border-[#D7DCE5] bg-white">
        <header className="flex flex-col gap-3 bg-[#F8FAFC] px-4 py-4 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-2">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-[#EEF2FF] text-[#2563EB]">
                <Sparkles className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <h2 className="truncate text-base font-semibold text-[#111827]">
                  AI 주간 영업 리포트
                </h2>
                <p className="mt-1 text-[12px] leading-5 text-[#64748B]">
                  일정, 딜, 회의록을 바탕으로 이번 주 리스크와 다음 액션을 정리합니다.
                </p>
              </div>
            </div>
          </div>

          <button
            aria-busy={createMutation.isPending}
            className="inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-md border border-[#1D4ED8] bg-[#2563EB] px-3 text-[13px] font-semibold text-white transition hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:border-[#93C5FD] disabled:bg-[#93C5FD]"
            disabled={isCreateDisabled}
            onClick={() => void createReport()}
            type="button"
          >
            {createMutation.isPending || isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Bot className="h-4 w-4" />
            )}
            {isGenerating ? "생성 중" : selectedSummary ? "다시 생성" : "AI 리포트 생성"}
          </button>
        </header>

        <div className="grid gap-4 px-4 py-4">
          {createError ? <InlineAlert message={createError} /> : null}

          {weekQuery.isLoading ? (
            <AiReportLoading />
          ) : weekQuery.isError ? (
            <AiReportError onRetry={() => void weekQuery.refetch()} />
          ) : selectedSummary ? (
            <AiReportBody
              detail={selectedDetail ?? null}
              detailError={detailQuery.isError}
              detailLoading={detailQuery.isLoading}
              generatingReport={weekData?.generatingReport ?? null}
              onCreateReport={() => void createReport()}
              onRetryDetail={() => void detailQuery.refetch()}
              onSelectReport={setSelectedReportId}
              onToggleSnapshot={() => setSnapshotOpen((value) => !value)}
              reports={availableReports}
              selectedReportId={selectedSummary.id}
              selectedSummary={selectedSummary}
              snapshotOpen={snapshotOpen}
              weekData={weekData ?? null}
            />
          ) : (
            <AiReportEmpty onCreateReport={() => void createReport()} />
          )}
        </div>
      </div>
    </section>
  );
}

function AiReportBody({
  detail,
  detailError,
  detailLoading,
  generatingReport,
  onCreateReport,
  onRetryDetail,
  onSelectReport,
  onToggleSnapshot,
  reports,
  selectedReportId,
  selectedSummary,
  snapshotOpen,
  weekData,
}: {
  readonly detail: AiWeeklyReportDetail | null;
  readonly detailError: boolean;
  readonly detailLoading: boolean;
  readonly generatingReport: AiWeeklyReportSummary | null;
  readonly onCreateReport: () => void;
  readonly onRetryDetail: () => void;
  readonly onSelectReport: (reportId: string) => void;
  readonly onToggleSnapshot: () => void;
  readonly reports: readonly AiWeeklyReportSummary[];
  readonly selectedReportId: string;
  readonly selectedSummary: AiWeeklyReportSummary;
  readonly snapshotOpen: boolean;
  readonly weekData: AiWeeklyReportWeekResponse | null;
}) {
  const readyDetail =
    detail?.status === "READY" && detail.sections ? detail : null;

  return (
    <>
      {selectedSummary.status === "GENERATING" ? (
        <AiReportGenerating report={selectedSummary} />
      ) : null}

      {generatingReport && selectedSummary.status !== "GENERATING" ? (
        <AiReportGenerating report={generatingReport} />
      ) : null}

      {selectedSummary.status === "FAILED" ? (
        <AiReportFailed
          message={
            detail?.safeErrorMessage ??
            selectedSummary.safeErrorMessage ??
            "리포트를 만들지 못했어요. 다시 시도해 주세요."
          }
          onRetry={onCreateReport}
          report={selectedSummary}
        />
      ) : null}

      {selectedSummary.status === "READY" && detailLoading ? (
        <AiReportLoading label="AI 리포트를 불러오고 있어요." />
      ) : null}

      {selectedSummary.status === "READY" && detailError ? (
        <AiReportError onRetry={onRetryDetail} />
      ) : null}

      {readyDetail ? (
        <AiReportReady
          detail={readyDetail}
          onToggleSnapshot={onToggleSnapshot}
          snapshotOpen={snapshotOpen}
        />
      ) : null}

      <AiWeeklyReportVersionList
        failedVersionCount={weekData?.failedVersionCount ?? 0}
        onSelectReport={onSelectReport}
        reports={reports}
        selectedReportId={selectedReportId}
      />
    </>
  );
}

function AiReportReady({
  detail,
  onToggleSnapshot,
  snapshotOpen,
}: {
  readonly detail: AiWeeklyReportDetail;
  readonly onToggleSnapshot: () => void;
  readonly snapshotOpen: boolean;
}) {
  const sections = detail.sections ?? {};
  const coverage = sections.dataCoverage ?? detail.dataCoverage;

  return (
    <div className="grid gap-4">
      <GenerationInfo report={detail} />

      <ExecutiveSummary sections={sections} />

      <PipelineSummary sections={sections} />

      <SuggestionSection
        actionLabel="딜 열기"
        emptyLabel="이번 주 주요 리스크가 아직 없습니다."
        icon={<ShieldAlert className="h-4 w-4" />}
        items={sections.riskSignals ?? []}
        title="리스크"
        tone="risk"
      />

      <SuggestionSection
        actionLabel="기록 열기"
        emptyLabel="다음 액션 제안이 아직 없습니다."
        icon={<ClipboardList className="h-4 w-4" />}
        items={sections.nextWeekActions ?? []}
        title="다음 액션"
        tone="next-action"
      />

      <SuggestionSection
        actionLabel="회의록 열기"
        emptyLabel="후속 연락 초안이 아직 없습니다."
        icon={<MessageSquareText className="h-4 w-4" />}
        items={sections.followUpDrafts ?? []}
        title="후속 연락 초안"
        tone="follow-up"
      />

      <SuggestionSection
        actionLabel="기록 열기"
        emptyLabel="데이터 정리 제안이 아직 없습니다."
        icon={<Wrench className="h-4 w-4" />}
        items={sections.dataCleanupSuggestions ?? []}
        title="데이터 정리"
        tone="cleanup"
      />

      <DataCoverage coverage={coverage} />

      <SnapshotSummaryPanel
        isOpen={snapshotOpen}
        onToggle={onToggleSnapshot}
        reportId={detail.id}
      />
    </div>
  );
}

function GenerationInfo({
  report,
}: {
  readonly report: AiWeeklyReportSummary;
}) {
  return (
    <div className="grid gap-2 rounded-md border border-[#E2E5EC] bg-[#F8FAFC] px-3 py-3 text-[12px] text-[#64748B] md:grid-cols-4">
      <InfoItem label="버전" value={`v${report.version}`} />
      <InfoItem label="상태" value="완료" />
      <InfoItem label="기준 시간대" value={report.timeZone} />
      <InfoItem label="생성 시각" value={formatDateTime(report.generatedAt)} />
    </div>
  );
}

function ExecutiveSummary({
  sections,
}: {
  readonly sections: AiWeeklyReportSections;
}) {
  const executiveSummary = sections.executiveSummary;

  if (!executiveSummary) {
    return null;
  }

  return (
    <section className="grid gap-3">
      <div className="flex min-w-0 items-center gap-2">
        <CheckCircle2 className="h-4 w-4 shrink-0 text-[#047857]" />
        <h3 className="text-sm font-semibold text-[#111827]">요약</h3>
      </div>
      <div className="grid gap-3 rounded-md border border-[#E2E5EC] bg-white p-3">
        <div className="min-w-0">
          <h4 className="break-words text-[15px] font-semibold leading-6 text-[#111827]">
            {executiveSummary.headline}
          </h4>
          <p className="mt-2 break-words text-[13px] leading-6 text-[#374151]">
            {executiveSummary.narrative}
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <BulletList
            emptyLabel="확인된 성과가 아직 없습니다."
            items={executiveSummary.wins}
            label="좋은 신호"
          />
          <BulletList
            emptyLabel="주의 신호가 아직 없습니다."
            items={executiveSummary.concerns.map(formatMissingSignal)}
            label="주의 신호"
          />
        </div>
      </div>
    </section>
  );
}

function PipelineSummary({
  sections,
}: {
  readonly sections: AiWeeklyReportSections;
}) {
  const pipelineSummary = sections.pipelineSummary;

  if (!pipelineSummary) {
    return null;
  }

  return (
    <section className="grid gap-3">
      <div className="flex min-w-0 items-center gap-2">
        <BarChart3 className="h-4 w-4 shrink-0 text-[#2563EB]" />
        <h3 className="text-sm font-semibold text-[#111827]">파이프라인</h3>
      </div>
      <div className="grid gap-3 rounded-md border border-[#E2E5EC] bg-white p-3">
        <div className="grid gap-2 sm:grid-cols-2">
          <Metric
            label="검토 금액"
            value={formatCurrency(pipelineSummary.totalDealCost)}
          />
          <Metric
            label="상태 수"
            value={`${pipelineSummary.statusCounts.length.toLocaleString(
              "ko-KR"
            )}개`}
          />
        </div>
        <p className="break-words text-[13px] leading-6 text-[#374151]">
          {pipelineSummary.narrative}
        </p>
        {pipelineSummary.statusCounts.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {pipelineSummary.statusCounts.map((item) => (
              <span
                className="rounded bg-[#F1F5F9] px-2 py-1 text-[12px] font-medium text-[#475569]"
                key={item.status}
              >
                {item.status} {item.count.toLocaleString("ko-KR")}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function SuggestionSection({
  actionLabel,
  emptyLabel,
  icon,
  items,
  title,
  tone,
}: {
  readonly actionLabel: string;
  readonly emptyLabel: string;
  readonly icon: ReactNode;
  readonly items: readonly AiWeeklyReportSuggestion[];
  readonly title: string;
  readonly tone: "cleanup" | "follow-up" | "next-action" | "risk";
}) {
  return (
    <section className="grid gap-3">
      <div className="flex min-w-0 items-center justify-between gap-3">
        <h3 className="inline-flex min-w-0 items-center gap-2 text-sm font-semibold text-[#111827]">
          <span className="text-[#64748B]">{icon}</span>
          {title}
        </h3>
        <span className="shrink-0 text-[12px] font-medium text-[#64748B]">
          {items.length.toLocaleString("ko-KR")}건
        </span>
      </div>

      {items.length > 0 ? (
        <div className="grid gap-2">
          {items.map((item) => (
            <AiWeeklyReportSuggestionCard
              actionLabel={actionLabel}
              key={item.key}
              suggestion={item}
              tone={tone}
            />
          ))}
        </div>
      ) : (
        <p className="rounded-md border border-dashed border-[#CBD5E1] bg-[#F8FAFC] px-3 py-4 text-[13px] text-[#64748B]">
          {emptyLabel}
        </p>
      )}
    </section>
  );
}

function DataCoverage({
  coverage,
}: {
  readonly coverage: AiWeeklyReportDataCoverage;
}) {
  return (
    <section className="grid gap-3">
      <div className="flex min-w-0 items-center gap-2">
        <Database className="h-4 w-4 shrink-0 text-[#64748B]" />
        <h3 className="text-sm font-semibold text-[#111827]">데이터 범위</h3>
      </div>
      <div className="grid gap-2 sm:grid-cols-4">
        <Metric
          label="일정"
          value={`${(coverage.scheduleCount ?? 0).toLocaleString("ko-KR")}건`}
        />
        <Metric
          label="딜"
          value={`${(coverage.dealCount ?? 0).toLocaleString("ko-KR")}건`}
        />
        <Metric
          label="회의록"
          value={`${(coverage.meetingNoteCount ?? 0).toLocaleString("ko-KR")}건`}
        />
        <Metric
          label="연결 딜"
          value={`${(coverage.linkedDealCount ?? 0).toLocaleString("ko-KR")}건`}
        />
      </div>
      {coverage.missingSignals && coverage.missingSignals.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {coverage.missingSignals.map((signal) => (
            <span
              className="rounded bg-[#FFFBEB] px-2 py-1 text-[12px] font-medium text-[#B45309]"
              key={signal}
            >
              {formatMissingSignal(signal)}
            </span>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function SnapshotSummaryPanel({
  isOpen,
  onToggle,
  reportId,
}: {
  readonly isOpen: boolean;
  readonly onToggle: () => void;
  readonly reportId: string;
}) {
  const snapshotQuery = useAiWeeklyReportSnapshotSummary(reportId, isOpen);

  return (
    <section className="grid gap-3 border-t border-[#E2E5EC] pt-4">
      <button
        aria-expanded={isOpen}
        className="inline-flex h-9 w-fit items-center gap-1.5 rounded-md border border-[#D7DCE5] bg-white px-3 text-[13px] font-semibold text-[#374151] transition hover:bg-[#F8FAFC]"
        onClick={onToggle}
        type="button"
      >
        <Database className="h-4 w-4" />
        입력 데이터 요약
        {isOpen ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </button>

      {isOpen ? (
        <div className="rounded-md border border-[#E2E5EC] bg-[#F8FAFC] p-3">
          {snapshotQuery.isLoading ? (
            <AiReportLoading label="입력 데이터 요약을 불러오고 있어요." />
          ) : snapshotQuery.isError ? (
            <InlineAlert message="입력 데이터 요약을 불러오지 못했어요." />
          ) : snapshotQuery.data ? (
            <SnapshotSummaryContent snapshot={snapshotQuery.data} />
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

function SnapshotSummaryContent({
  snapshot,
}: {
  readonly snapshot: AiWeeklyReportSnapshotSummary;
}) {
  return (
    <div className="grid gap-4">
      <div className="grid gap-2 sm:grid-cols-4">
        <Metric
          label="일정"
          value={`${(snapshot.counts.schedules ?? 0).toLocaleString("ko-KR")}건`}
        />
        <Metric
          label="딜"
          value={`${(snapshot.counts.deals ?? 0).toLocaleString("ko-KR")}건`}
        />
        <Metric
          label="회의록"
          value={`${(snapshot.counts.meetingNotes ?? 0).toLocaleString(
            "ko-KR"
          )}건`}
        />
        <Metric
          label="연결 딜"
          value={`${(snapshot.counts.linkedDeals ?? 0).toLocaleString(
            "ko-KR"
          )}건`}
        />
      </div>

      <SnapshotRecordGroup
        items={snapshot.records.schedules.map((item) => ({
          id: item.id,
          meta: [
            formatDateTime(item.startAt),
            item.sourceType,
            `딜 ${item.dealCount.toLocaleString("ko-KR")}건`,
          ],
          title: item.scheduleTitle ?? "제목 없는 일정",
        }))}
        title="일정 요약"
      />
      <SnapshotRecordGroup
        items={snapshot.records.deals.map((item) => ({
          id: item.id,
          meta: [
            item.dealStatus,
            formatCurrency(item.dealCost),
            `다음 액션 ${item.nextActionCount.toLocaleString("ko-KR")}건`,
          ],
          title: item.dealName ?? "제목 없는 딜",
        }))}
        title="딜 요약"
      />
      <SnapshotRecordGroup
        items={snapshot.records.meetingNotes.map((item) => ({
          id: item.id,
          meta: [
            formatDateTime(item.meetingAt),
            item.sourceType,
            `연결 딜 ${item.linkedDealCount.toLocaleString("ko-KR")}건`,
          ],
          title: item.title ?? "제목 없는 회의록",
        }))}
        title="회의록 요약"
      />
    </div>
  );
}

function SnapshotRecordGroup({
  items,
  title,
}: {
  readonly items: readonly {
    readonly id: string | null;
    readonly meta: readonly (string | null)[];
    readonly title: string;
  }[];
  readonly title: string;
}) {
  const visibleItems = items.slice(0, 5);

  return (
    <section className="grid gap-2">
      <h4 className="text-[13px] font-semibold text-[#111827]">{title}</h4>
      {visibleItems.length > 0 ? (
        <div className="grid gap-2">
          {visibleItems.map((item, index) => (
            <div
              className="grid gap-1 rounded-md border border-[#E2E5EC] bg-white px-3 py-2"
              key={item.id ?? `${title}-${index}`}
            >
              <p className="break-words text-[13px] font-semibold text-[#111827]">
                {item.title}
              </p>
              <p className="break-words text-[12px] text-[#64748B]">
                {item.meta.filter(Boolean).join(" · ")}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="rounded-md border border-dashed border-[#CBD5E1] bg-white px-3 py-3 text-[13px] text-[#64748B]">
          표시할 요약이 없습니다.
        </p>
      )}
      {items.length > visibleItems.length ? (
        <p className="text-[12px] text-[#64748B]">
          외 {items.length - visibleItems.length}건은 개수에만 반영됩니다.
        </p>
      ) : null}
    </section>
  );
}

function AiReportEmpty({
  onCreateReport,
}: {
  readonly onCreateReport: () => void;
}) {
  return (
    <div className="grid gap-3 rounded-md border border-dashed border-[#CBD5E1] bg-[#F8FAFC] px-4 py-5">
      <div className="flex min-w-0 items-start gap-3">
        <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-[#2563EB]" />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[#111827]">
            이 주의 AI 리포트가 없습니다.
          </p>
          <p className="mt-1 break-words text-[13px] leading-5 text-[#64748B]">
            현재 주간 데이터로 요약, 리스크, 다음 액션, 데이터 정리 제안을 생성할 수 있습니다.
          </p>
          <button
            className="mt-3 inline-flex h-9 items-center gap-1.5 rounded-md border border-[#1D4ED8] bg-[#2563EB] px-3 text-[13px] font-semibold text-white transition hover:bg-[#1D4ED8]"
            onClick={onCreateReport}
            type="button"
          >
            <Bot className="h-4 w-4" />
            AI 리포트 생성
          </button>
        </div>
      </div>
    </div>
  );
}

function AiReportGenerating({
  report,
}: {
  readonly report: AiWeeklyReportSummary;
}) {
  return (
    <div className="grid gap-3 rounded-md border border-[#C7D2FE] bg-[#EEF2FF] px-4 py-4 text-[#3730A3]">
      <div className="flex min-w-0 items-start gap-3">
        <Loader2 className="mt-0.5 h-5 w-5 shrink-0 animate-spin" />
        <div className="min-w-0">
          <p className="text-sm font-semibold">
            v{report.version} 리포트를 생성하고 있어요.
          </p>
          <p className="mt-1 break-words text-[13px] leading-5">
            완료되면 자동으로 최신 성공 버전을 표시합니다. 생성 중에는 중복 요청을 막습니다.
          </p>
        </div>
      </div>
    </div>
  );
}

function AiReportFailed({
  message,
  onRetry,
  report,
}: {
  readonly message: string;
  readonly onRetry: () => void;
  readonly report: AiWeeklyReportSummary;
}) {
  return (
    <div className="grid gap-3 rounded-md border border-[#FECACA] bg-[#FEF2F2] px-4 py-4 text-[#B91C1C]">
      <div className="flex min-w-0 items-start gap-3">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
        <div className="min-w-0">
          <p className="text-sm font-semibold">
            v{report.version} 생성에 실패했습니다.
          </p>
          <p className="mt-1 break-words text-[13px] leading-5">{message}</p>
          <button
            className="mt-3 inline-flex h-9 items-center gap-1.5 rounded-md border border-[#FECACA] bg-white px-3 text-[13px] font-semibold text-[#B91C1C] transition hover:bg-[#FFF7F7]"
            onClick={onRetry}
            type="button"
          >
            <RefreshCw className="h-4 w-4" />
            다시 생성
          </button>
        </div>
      </div>
    </div>
  );
}

function AiReportLoading({
  label = "AI 리포트를 확인하고 있어요.",
}: {
  readonly label?: string;
}) {
  return (
    <div className="flex min-h-[120px] items-center justify-center rounded-md border border-dashed border-[#CBD5E1] bg-[#F8FAFC] px-4 text-sm font-medium text-[#475569]">
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      {label}
    </div>
  );
}

function AiReportError({ onRetry }: { readonly onRetry: () => void }) {
  return (
    <div className="rounded-md border border-[#FECACA] bg-[#FEF2F2] p-4">
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#DC2626]" />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[#B91C1C]">
            AI 리포트를 불러오지 못했어요.
          </p>
          <button
            className="mt-3 inline-flex h-9 items-center gap-1.5 rounded-md border border-[#E2E5EC] bg-white px-3 text-[13px] font-medium text-[#374151] transition hover:bg-[#F5F6F8]"
            onClick={onRetry}
            type="button"
          >
            <RefreshCw className="h-4 w-4" />
            다시 시도
          </button>
        </div>
      </div>
    </div>
  );
}

function InlineAlert({ message }: { readonly message: string }) {
  return (
    <div className="rounded-md border border-[#FECACA] bg-[#FEF2F2] px-3 py-2 text-[13px] font-medium text-[#B91C1C]">
      <div className="flex items-start gap-2">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
        <span className="min-w-0 break-words">{message}</span>
      </div>
    </div>
  );
}

function BulletList({
  emptyLabel,
  items,
  label,
}: {
  readonly emptyLabel: string;
  readonly items: readonly string[];
  readonly label: string;
}) {
  return (
    <div className="grid gap-2 rounded-md border border-[#E2E5EC] bg-[#F8FAFC] p-3">
      <h5 className="text-[12px] font-semibold text-[#475569]">{label}</h5>
      {items.length > 0 ? (
        <ul className="grid gap-1 text-[13px] leading-5 text-[#374151]">
          {items.map((item) => (
            <li className="break-words" key={item}>
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-[13px] text-[#64748B]">{emptyLabel}</p>
      )}
    </div>
  );
}

function Metric({
  label,
  value,
}: {
  readonly label: string;
  readonly value: string;
}) {
  return (
    <div className="grid min-h-[68px] gap-1 rounded-md border border-[#E2E5EC] bg-white px-3 py-2">
      <span className="text-[12px] font-medium text-[#64748B]">{label}</span>
      <span className="break-words text-[18px] font-semibold leading-6 text-[#111827]">
        {value}
      </span>
    </div>
  );
}

function InfoItem({
  label,
  value,
}: {
  readonly label: string;
  readonly value: string;
}) {
  return (
    <div className="min-w-0">
      <span className="block text-[11px] font-medium text-[#64748B]">
        {label}
      </span>
      <span className="mt-1 block break-words text-[12px] font-semibold text-[#111827]">
        {value}
      </span>
    </div>
  );
}

function mergeReports(
  versions: readonly AiWeeklyReportSummary[],
  failedVersions: readonly AiWeeklyReportSummary[],
  generatingReport: AiWeeklyReportSummary | null
) {
  const reportsById = new Map<string, AiWeeklyReportSummary>();

  for (const report of [...versions, ...failedVersions]) {
    reportsById.set(report.id, report);
  }

  if (generatingReport) {
    reportsById.set(generatingReport.id, generatingReport);
  }

  return [...reportsById.values()].sort((first, second) => {
    if (first.version !== second.version) {
      return second.version - first.version;
    }

    return getReportSortTime(second) - getReportSortTime(first);
  });
}

function getReportSortTime(report: AiWeeklyReportSummary) {
  const value = report.generatedAt ?? report.failedAt ?? report.requestedAt;
  const time = new Date(value).getTime();

  return Number.isFinite(time) ? time : 0;
}

function formatDateTime(value: string | null | undefined) {
  if (!value) {
    return "-";
  }

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

function formatCurrency(value: number) {
  try {
    return new Intl.NumberFormat("ko-KR", {
      currency: "KRW",
      maximumFractionDigits: 0,
      style: "currency",
    }).format(value);
  } catch {
    return `${value.toLocaleString("ko-KR")} KRW`;
  }
}

function formatMissingSignal(signal: string) {
  switch (signal) {
    case "DEAL_NEXT_ACTION_MISSING":
      return "다음 액션 누락";
    case "NO_ACTIVE_OR_DUE_DEALS":
      return "검토 딜 없음";
    case "NO_WEEKLY_MEETING_NOTES":
      return "주간 회의록 없음";
    case "NO_WEEKLY_SCHEDULES":
      return "주간 일정 없음";
    default:
      return signal;
  }
}

function getPreferredLocale() {
  return navigator.languages[0] ?? navigator.language ?? "ko-KR";
}

function createIdempotencyKey() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `ai-weekly-report:${crypto.randomUUID()}`;
  }

  return `ai-weekly-report:${Date.now()}:${Math.random()
    .toString(36)
    .slice(2)}`;
}

function isAlreadyGeneratingError(error: unknown) {
  return (
    error instanceof ApiClientError &&
    error.statusCode === 409 &&
    error.code === "AiWeeklySalesReportAlreadyGenerating"
  );
}

function getCreateErrorMessage(error: unknown) {
  if (error instanceof ApiClientError) {
    return error.message || "AI 리포트를 생성하지 못했어요.";
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "AI 리포트를 생성하지 못했어요.";
}
