import {
  AlertCircle,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Download,
  ExternalLink,
  FileText,
  Loader2,
  MapPin,
  RotateCcw,
  Users,
} from "lucide-react";
import {
  type KeyboardEvent,
  type ReactNode,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AiWeeklyReportSection } from "@/features/ai-weekly-report";
import { useAuthSession } from "@/features/auth";
import { downloadWeeklyScheduleReportXlsx } from "@/features/schedule/api/schedule-api";
import { useWeeklyScheduleReport } from "@/features/schedule/hooks/use-schedule-queries";
import type {
  WeeklyScheduleReportDay,
  WeeklyScheduleReportDeal,
  WeeklyScheduleReportSchedule,
} from "@/features/schedule/types/schedule";
import {
  formatScheduleClockRange as formatGoogleScheduleClockRange,
  getScheduleSourceBadgeClassName,
  getScheduleSourceBadgeLabel,
  getUrlDomainLabel,
} from "@/features/schedule/utils/google-calendar-display";
import type { ApiBlobResponse } from "@/lib/api-client";
import { formatDateWithOptions } from "@/utils/format";

const WEEKLY_REPORT_COPY = {
  loading: "주간 보고서를 불러오고 있어요.",
  emptyWeek: "일정을 등록하면 이번 주 계획을 한눈에 볼 수 있어요.",
  emptyDay: "이 날짜에는 등록된 일정이 없어요.",
  error: "보고서를 불러오지 못했어요. 다시 시도해 주세요.",
  exportError: "보고서를 다운로드하지 못했어요. 다시 시도해 주세요.",
  exportButton: "엑셀 다운로드",
} as const;

const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const FALLBACK_XLSX_FILE_NAME = "weekly_schedules.xlsx";

type CalendarDateParts = {
  readonly year: number;
  readonly month: number;
  readonly day: number;
};

export function ScheduleWeekReportScreen() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuthSession();
  const preferredTimeZone = useMemo(
    () => getPreferredReportTimeZone(user?.timeZone),
    [user?.timeZone]
  );
  const weekStart = useMemo(
    () =>
      normalizeWeekStartSearchParam(
        searchParams.get("weekStart"),
        preferredTimeZone
      ),
    [preferredTimeZone, searchParams]
  );
  const reportParams = useMemo(
    () => ({
      weekStart,
      ...(preferredTimeZone ? { timeZone: preferredTimeZone } : {}),
    }),
    [preferredTimeZone, weekStart]
  );
  const reportQuery = useWeeklyScheduleReport(reportParams);
  const report = reportQuery.data;
  const reportTimeZone = report?.timeZone ?? preferredTimeZone;
  const visibleWeekEnd = report?.weekEnd ?? addDaysToDateKey(weekStart, 6);
  const isCurrentWeek =
    weekStart === getCurrentWeekStartDateKey(preferredTimeZone);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams.get("weekStart") === weekStart) {
      return;
    }

    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.set("weekStart", weekStart);
    setSearchParams(nextSearchParams, { replace: true });
  }, [searchParams, setSearchParams, weekStart]);

  useEffect(() => {
    setExportError(null);
  }, [weekStart]);

  const moveWeek = (weekOffset: number) => {
    const nextWeekStart = addDaysToDateKey(weekStart, weekOffset * 7);
    updateWeekStartSearchParam(searchParams, setSearchParams, nextWeekStart);
  };

  const moveCurrentWeek = () => {
    updateWeekStartSearchParam(
      searchParams,
      setSearchParams,
      getCurrentWeekStartDateKey(preferredTimeZone)
    );
  };

  const downloadReport = async () => {
    if (isExporting) {
      return;
    }

    setIsExporting(true);
    setExportError(null);

    try {
      const exportTimeZone = report?.timeZone ?? preferredTimeZone;
      const file = await downloadWeeklyScheduleReportXlsx({
        weekStart,
        ...(exportTimeZone ? { timeZone: exportTimeZone } : {}),
      });
      downloadBlobFile(file, FALLBACK_XLSX_FILE_NAME);
    } catch {
      setExportError(WEEKLY_REPORT_COPY.exportError);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <section className="flex min-h-dvh flex-col overflow-hidden bg-white text-[#111827]">
      <header className="app-page-header flex min-h-[var(--topbar-height)] shrink-0 flex-col gap-3 border-b border-[#E2E5EC] px-4 py-3 md:flex-row md:items-center md:justify-between md:px-5">
        <div className="min-w-0">
          <Link
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#6B7280] transition hover:text-[#111827]"
            to="/app/schedules"
          >
            <CalendarDays className="h-4 w-4" />
            일정
          </Link>
          <div className="mt-1 flex min-w-0 items-center gap-2">
            <FileText className="h-5 w-5 shrink-0 text-[#4880EE]" />
            <h1 className="truncate text-xl font-semibold text-[#111827] md:text-2xl">
              주간 보고서
            </h1>
          </div>
        </div>

        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <button
            aria-label="이전 주"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-[#E2E5EC] bg-white text-[#374151] transition hover:bg-[#F5F6F8]"
            onClick={() => moveWeek(-1)}
            type="button"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="min-w-[176px] rounded-md border border-[#E2E5EC] bg-[#F8FAFC] px-3 py-2 text-center text-[13px] font-semibold text-[#111827] sm:min-w-[220px]">
            {formatDateOnlyRange(weekStart, visibleWeekEnd)}
          </div>
          <button
            aria-label="다음 주"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-[#E2E5EC] bg-white text-[#374151] transition hover:bg-[#F5F6F8]"
            onClick={() => moveWeek(1)}
            type="button"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            aria-pressed={isCurrentWeek}
            className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-md border border-[#E2E5EC] bg-white px-3 text-[13px] font-medium text-[#374151] transition hover:bg-[#F5F6F8] disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isCurrentWeek}
            onClick={moveCurrentWeek}
            type="button"
          >
            <RotateCcw className="h-4 w-4" />
            이번 주
          </button>
          <button
            aria-busy={isExporting}
            className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-md border border-[#1D4ED8] bg-[#2563EB] px-3 text-[13px] font-semibold text-white transition hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:border-[#93C5FD] disabled:bg-[#93C5FD]"
            disabled={isExporting || reportQuery.isLoading || reportQuery.isError}
            onClick={() => void downloadReport()}
            type="button"
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {WEEKLY_REPORT_COPY.exportButton}
          </button>
        </div>
      </header>

      {exportError ? (
        <div className="border-b border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm font-medium text-[#B91C1C] md:px-5">
          <div className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{exportError}</span>
          </div>
        </div>
      ) : null}

      <main className="min-h-0 flex-1 overflow-y-auto px-4 pb-[calc(var(--mobile-tabbar-height)+1rem)] pt-4 md:px-5 md:pb-6">
        {reportQuery.isLoading ? (
          <WeeklyReportLoading />
        ) : reportQuery.isError ? (
          <WeeklyReportError onRetry={() => void reportQuery.refetch()} />
        ) : report ? (
          <WeeklyReportContent
            aiReportSection={
              <AiWeeklyReportSection
                timeZone={reportTimeZone}
                weekStart={weekStart}
              />
            }
            onScheduleOpen={(scheduleId) => navigate(`/app/schedules/${scheduleId}`)}
            reportDays={report.days}
            reportTimeZone={reportTimeZone}
            summary={
              <WeeklyReportSummary
                generatedAt={report.generatedAt}
                summary={report.summary}
                timeZone={reportTimeZone}
              />
            }
            totalScheduleCount={report.summary.totalScheduleCount}
          />
        ) : null}
      </main>
    </section>
  );
}

function WeeklyReportContent({
  aiReportSection,
  reportDays,
  reportTimeZone,
  summary,
  totalScheduleCount,
  onScheduleOpen,
}: {
  readonly aiReportSection: ReactNode;
  readonly reportDays: WeeklyScheduleReportDay[];
  readonly reportTimeZone?: string;
  readonly summary: ReactNode;
  readonly totalScheduleCount: number;
  readonly onScheduleOpen: (scheduleId: string) => void;
}) {
  return (
    <div className="mx-auto grid max-w-7xl gap-4">
      {summary}
      {aiReportSection}

      {totalScheduleCount === 0 ? (
        <div className="rounded-md border border-dashed border-[#CBD5E1] bg-[#F8FAFC] px-4 py-5 text-sm font-medium text-[#475569]">
          {WEEKLY_REPORT_COPY.emptyWeek}
        </div>
      ) : null}

      <div className="grid gap-4">
        {reportDays.map((day) => (
          <WeeklyReportDaySection
            day={day}
            key={day.date}
            onScheduleOpen={onScheduleOpen}
            timeZone={reportTimeZone}
          />
        ))}
      </div>
    </div>
  );
}

function WeeklyReportSummary({
  generatedAt,
  summary,
  timeZone,
}: {
  readonly generatedAt: string;
  readonly summary: {
    readonly totalScheduleCount: number;
    readonly totalScheduleEntryCount: number;
    readonly scheduledDayCount: number;
    readonly unlinkedScheduleCount: number;
    readonly scheduleDealLinkCount: number;
    readonly distinctLinkedDealCount: number;
    readonly totalDealCost: number;
    readonly dealStatusCounts: ReadonlyArray<{
      readonly dealStatusLabel: string;
      readonly count: number;
    }>;
  };
  readonly timeZone?: string;
}) {
  return (
    <section className="grid gap-3 border-b border-[#E2E5EC] pb-4">
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        <WeeklyReportMetric
          icon={<CalendarDays className="h-4 w-4" />}
          label="일정"
          value={`${summary.totalScheduleCount.toLocaleString("ko-KR")}건`}
        />
        <WeeklyReportMetric
          icon={<Clock3 className="h-4 w-4" />}
          label="표시 row"
          value={`${summary.totalScheduleEntryCount.toLocaleString("ko-KR")}건`}
        />
        <WeeklyReportMetric
          icon={<BriefcaseBusiness className="h-4 w-4" />}
          label="연결 딜"
          value={`${summary.distinctLinkedDealCount.toLocaleString("ko-KR")}건`}
        />
        <WeeklyReportMetric
          icon={<FileText className="h-4 w-4" />}
          label="딜 금액"
          value={formatDealCost(summary.totalDealCost)}
        />
        <WeeklyReportMetric
          icon={<CalendarDays className="h-4 w-4" />}
          label="일정 있는 날"
          value={`${summary.scheduledDayCount.toLocaleString("ko-KR")}일`}
        />
      </div>
      <div className="flex flex-col gap-2 text-[12px] text-[#6B7280] md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span>딜 연결 {summary.scheduleDealLinkCount.toLocaleString("ko-KR")}건</span>
          <span className="text-[#CBD5E1]">/</span>
          <span>미연결 일정 {summary.unlinkedScheduleCount.toLocaleString("ko-KR")}건</span>
          {summary.dealStatusCounts.length > 0 ? (
            <>
              <span className="text-[#CBD5E1]">/</span>
              {summary.dealStatusCounts.map((item) => (
                <span
                  className="rounded-full bg-[#F1F5F9] px-2 py-1 text-[#475569]"
                  key={item.dealStatusLabel}
                >
                  {item.dealStatusLabel} {item.count.toLocaleString("ko-KR")}
                </span>
              ))}
            </>
          ) : null}
        </div>
        <span className="shrink-0">
          생성 {formatInstantDateTime(generatedAt, timeZone)}
        </span>
      </div>
    </section>
  );
}

function WeeklyReportMetric({
  icon,
  label,
  value,
}: {
  readonly icon: ReactNode;
  readonly label: string;
  readonly value: string;
}) {
  return (
    <div className="grid min-h-[76px] gap-2 rounded-md border border-[#E2E5EC] bg-white px-3 py-3">
      <div className="flex items-center gap-2 text-[12px] font-medium text-[#6B7280]">
        <span className="grid h-7 w-7 place-items-center rounded-md bg-[#EEF2FF] text-[#2563EB]">
          {icon}
        </span>
        {label}
      </div>
      <p className="min-w-0 break-words text-[20px] font-semibold leading-6 text-[#111827]">
        {value}
      </p>
    </div>
  );
}

function WeeklyReportDaySection({
  day,
  timeZone,
  onScheduleOpen,
}: {
  readonly day: WeeklyScheduleReportDay;
  readonly timeZone?: string;
  readonly onScheduleOpen: (scheduleId: string) => void;
}) {
  return (
    <section className="border-t border-[#E2E5EC] pt-4">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-[#111827]">
            {formatDateOnlyFull(day.date)} {day.weekdayLabel}
          </h2>
          <p className="mt-1 text-[12px] text-[#6B7280]">
            일정 {day.scheduleCount.toLocaleString("ko-KR")}건 · 연결 딜{" "}
            {day.linkedDealCount.toLocaleString("ko-KR")}건
          </p>
        </div>
      </header>

      {day.schedules.length === 0 ? (
        <div className="mt-3 rounded-md border border-dashed border-[#CBD5E1] bg-[#F8FAFC] px-4 py-5 text-sm text-[#64748B]">
          {WEEKLY_REPORT_COPY.emptyDay}
        </div>
      ) : (
        <div className="mt-3 grid gap-2">
          {day.schedules.map((schedule) => (
            <WeeklyReportScheduleRow
              key={`${day.date}-${schedule.id}`}
              onScheduleOpen={onScheduleOpen}
              schedule={schedule}
              timeZone={timeZone}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function WeeklyReportScheduleRow({
  schedule,
  timeZone,
  onScheduleOpen,
}: {
  readonly schedule: WeeklyScheduleReportSchedule;
  readonly timeZone?: string;
  readonly onScheduleOpen: (scheduleId: string) => void;
}) {
  const openSchedule = () => onScheduleOpen(schedule.id);
  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.target !== event.currentTarget) {
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openSchedule();
    }
  };

  return (
    <article
      className="group grid cursor-pointer gap-3 rounded-md border border-[#E2E5EC] bg-white p-3 transition hover:border-[#93C5FD] hover:bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#93C5FD] md:grid-cols-[142px_minmax(0,1fr)_minmax(260px,0.8fr)] md:items-start"
      onClick={openSchedule}
      onKeyDown={onKeyDown}
      role="link"
      tabIndex={0}
    >
      <div className="flex min-w-0 items-center gap-2 text-[13px] font-semibold text-[#111827] md:block">
        <Clock3 className="h-4 w-4 shrink-0 text-[#6B7280] md:mb-1" />
        <span className="break-words">
          {formatScheduleTimeRange(schedule, timeZone)}
        </span>
      </div>

      <div className="min-w-0">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <h3 className="break-words text-sm font-semibold text-[#111827]">
            {schedule.scheduleTitle}
          </h3>
          <ScheduleSourceBadge schedule={schedule} />
          <MeetingUrlLink meetingUrl={schedule.meetingUrl} />
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-[12px] text-[#6B7280]">
          {schedule.location ? (
            <span className="inline-flex min-w-0 items-center gap-1">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="min-w-0 break-words">{schedule.location}</span>
            </span>
          ) : null}
          {schedule.hasMemo ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#F1F5F9] px-2 py-1 text-[#475569]">
              <FileText className="h-3.5 w-3.5" />
              메모 있음
            </span>
          ) : null}
        </div>
      </div>

      <div className="min-w-0">
        {schedule.deals.length === 0 ? (
          <p className="rounded-md border border-dashed border-[#CBD5E1] px-3 py-3 text-[13px] text-[#64748B]">
            연결된 딜이 없어요.
          </p>
        ) : (
          <div className="grid gap-2">
            {schedule.deals.map((deal) => (
              <WeeklyReportDealLink deal={deal} key={deal.id} />
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

function WeeklyReportDealLink({
  deal,
}: {
  readonly deal: WeeklyScheduleReportDeal;
}) {
  return (
    <Link
      className="grid min-w-0 gap-2 rounded-md border border-[#E2E5EC] bg-[#F8FAFC] px-3 py-3 text-left transition hover:border-[#93C5FD] hover:bg-white"
      onClick={(event) => event.stopPropagation()}
      to={`/app/deals/${deal.id}`}
    >
      <div className="flex min-w-0 flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="break-words text-[13px] font-semibold text-[#111827]">
            {deal.dealName}
          </p>
          <p className="mt-1 text-[12px] text-[#6B7280]">
            {deal.dealStatusLabel} · 종료 예정 {formatDateOnlyCompact(deal.expectedEndDate)}
          </p>
        </div>
        <span className="shrink-0 text-[13px] font-semibold text-[#2563EB]">
          {formatDealCost(deal.dealCost)}
        </span>
      </div>

      <div className="grid gap-1 text-[12px] text-[#64748B]">
        {deal.companies.length > 0 ? (
          <span className="inline-flex min-w-0 items-start gap-1">
            <Building2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span className="min-w-0 break-words">
              {deal.companies.map((company) => company.companyName).join(", ")}
            </span>
          </span>
        ) : null}
        {deal.contacts.length > 0 ? (
          <span className="inline-flex min-w-0 items-start gap-1">
            <Users className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span className="min-w-0 break-words">
              {deal.contacts
                .map((contact) =>
                  contact.companyName
                    ? `${contact.username}(${contact.companyName})`
                    : contact.username
                )
                .join(", ")}
            </span>
          </span>
        ) : null}
        {deal.nextFollowingAction ? (
          <span className="inline-flex min-w-0 items-start gap-1">
            <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span className="min-w-0 break-words">
              다음 행동 {deal.nextFollowingAction.followingAction}
              {deal.nextFollowingAction.remainingCount > 0
                ? ` 외 ${deal.nextFollowingAction.remainingCount.toLocaleString("ko-KR")}건`
                : ""}
            </span>
          </span>
        ) : null}
      </div>
    </Link>
  );
}

function ScheduleSourceBadge({
  schedule,
}: {
  readonly schedule: Pick<
    WeeklyScheduleReportSchedule,
    "sourceType" | "googleCalendar"
  >;
}) {
  const label = getScheduleSourceBadgeLabel(schedule);

  if (!label) {
    return null;
  }

  return (
    <span
      className={`inline-flex h-5 shrink-0 items-center rounded border px-1.5 text-[11px] font-semibold ${getScheduleSourceBadgeClassName(
        schedule,
      )}`}
    >
      {label}
    </span>
  );
}

function MeetingUrlLink({ meetingUrl }: { readonly meetingUrl: string | null }) {
  if (!meetingUrl) {
    return null;
  }

  return (
    <a
      aria-label={`${getUrlDomainLabel(meetingUrl)} 열기`}
      className="grid h-7 w-7 shrink-0 place-items-center rounded-md border border-[#D7DCE5] bg-white text-[#475569] transition hover:bg-[#F1F5F9] hover:text-[#111827]"
      href={meetingUrl}
      onClick={(event) => event.stopPropagation()}
      rel="noopener noreferrer"
      target="_blank"
      title={getUrlDomainLabel(meetingUrl)}
    >
      <ExternalLink className="h-3.5 w-3.5" />
    </a>
  );
}

function WeeklyReportLoading() {
  return (
    <div className="flex min-h-[260px] items-center justify-center rounded-md border border-dashed border-[#CBD5E1] bg-[#F8FAFC] px-4 text-sm font-medium text-[#475569]">
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      {WEEKLY_REPORT_COPY.loading}
    </div>
  );
}

function WeeklyReportError({ onRetry }: { readonly onRetry: () => void }) {
  return (
    <div className="rounded-md border border-[#FECACA] bg-[#FEF2F2] p-5">
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#DC2626]" />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[#B91C1C]">
            {WEEKLY_REPORT_COPY.error}
          </p>
          <button
            className="mt-3 inline-flex h-10 items-center gap-1.5 rounded-md border border-[#E2E5EC] bg-white px-3 text-[13px] font-medium text-[#374151] transition hover:bg-[#F5F6F8]"
            onClick={onRetry}
            type="button"
          >
            <RotateCcw className="h-4 w-4" />
            다시 시도
          </button>
        </div>
      </div>
    </div>
  );
}

function updateWeekStartSearchParam(
  searchParams: URLSearchParams,
  setSearchParams: ReturnType<typeof useSearchParams>[1],
  weekStart: string
) {
  const nextSearchParams = new URLSearchParams(searchParams);
  nextSearchParams.set("weekStart", weekStart);
  setSearchParams(nextSearchParams);
}

function normalizeWeekStartSearchParam(
  value: string | null,
  timeZone?: string
) {
  if (!value) {
    return getCurrentWeekStartDateKey(timeZone);
  }

  const parsed = parseDateOnly(value);

  if (!parsed) {
    return getCurrentWeekStartDateKey(timeZone);
  }

  return getWeekStartDateKey(value);
}

function getPreferredReportTimeZone(userTimeZone: string | null | undefined) {
  const normalizedUserTimeZone = userTimeZone?.trim();

  if (normalizedUserTimeZone) {
    return normalizedUserTimeZone;
  }

  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || undefined;
  } catch {
    return undefined;
  }
}

function getCurrentWeekStartDateKey(timeZone?: string) {
  return getWeekStartDateKey(getCurrentDateKey(timeZone));
}

function getCurrentDateKey(timeZone?: string) {
  const now = new Date();

  if (timeZone) {
    try {
      const parts = new Map(
        new Intl.DateTimeFormat("en-CA", {
          day: "2-digit",
          month: "2-digit",
          timeZone,
          year: "numeric",
        })
          .formatToParts(now)
          .filter((part) => part.type !== "literal")
          .map((part) => [part.type, part.value])
      );

      const year = parts.get("year");
      const month = parts.get("month");
      const day = parts.get("day");

      if (year && month && day) {
        return `${year}-${month}-${day}`;
      }
    } catch {
      return toDateKey(now);
    }
  }

  return toDateKey(now);
}

function getWeekStartDateKey(dateKey: string) {
  const date = fromDateKey(dateKey);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);

  return toDateKey(date);
}

function addDaysToDateKey(dateKey: string, days: number) {
  const date = fromDateKey(dateKey);
  date.setDate(date.getDate() + days);

  return toDateKey(date);
}

function parseDateOnly(value: string): CalendarDateParts | null {
  const match = DATE_ONLY_PATTERN.exec(value);

  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return { year, month, day };
}

function fromDateKey(dateKey: string) {
  const parsed = parseDateOnly(dateKey);

  if (!parsed) {
    return new Date();
  }

  return new Date(parsed.year, parsed.month - 1, parsed.day);
}

function toDateKey(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}`;
}

function formatDateOnlyRange(startDateKey: string, endDateKey: string) {
  return `${formatDateOnlyCompact(startDateKey)} - ${formatDateOnlyCompact(
    endDateKey
  )}`;
}

function formatDateOnlyCompact(dateKey: string) {
  const parsed = parseDateOnly(dateKey);

  if (!parsed) {
    return dateKey;
  }

  return `${parsed.year}.${pad(parsed.month)}.${pad(parsed.day)}`;
}

function formatDateOnlyFull(dateKey: string) {
  const parsed = parseDateOnly(dateKey);

  if (!parsed) {
    return dateKey;
  }

  return `${parsed.year}년 ${parsed.month}월 ${parsed.day}일`;
}

function formatInstantDateTime(value: string, timeZone?: string) {
  try {
    return formatDateWithOptions(value, {
      ...(timeZone ? { timeZone } : {}),
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return formatDateWithOptions(value, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
}

function formatScheduleTimeRange(
  schedule: WeeklyScheduleReportSchedule,
  timeZone?: string
) {
  return formatGoogleScheduleClockRange(schedule, timeZone);
}

function formatDealCost(amount: number) {
  return `₩ ${amount.toLocaleString("ko-KR")}`;
}

function downloadBlobFile(file: ApiBlobResponse, fallbackFileName: string) {
  const url = URL.createObjectURL(file.blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = file.fileName ?? fallbackFileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}
