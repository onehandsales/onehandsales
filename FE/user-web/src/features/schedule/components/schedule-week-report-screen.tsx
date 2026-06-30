import {
  AlertCircle,
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useScheduleList } from "@/features/schedule/hooks/use-schedule-queries";
import { getDefaultScheduleTimeZone } from "@/features/schedule/schemas/schedule-schema";
import type { Schedule } from "@/features/schedule/types/schedule";
import { getApiErrorMessage } from "@/lib/api-client";
import { formatDate, formatDateWithOptions } from "@/utils/format";

const screenTimeZone = getDefaultScheduleTimeZone();

export function ScheduleWeekReportScreen() {
  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date()));
  const scheduleListQuery = useScheduleList({
    view: "week",
    baseDate: toDateKey(weekStart),
    timeZone: screenTimeZone,
  });
  const weekEnd = addDays(weekStart, 6);
  const days = useMemo(
    () => buildWeekDays(weekStart, scheduleListQuery.data?.items ?? []),
    [scheduleListQuery.data?.items, weekStart]
  );

  return (
    <section className="mx-auto grid max-w-6xl gap-5 px-5 py-6">
      <header className="flex flex-col gap-4 border-b pb-5 md:flex-row md:items-center md:justify-between">
        <div>
          <Link
            className="text-sm font-medium text-muted-foreground hover:text-primary"
            to="/schedules"
          >
            일정
          </Link>
          <h1 className="mt-2 text-2xl font-semibold">주간 보고서</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            선택한 주의 영업 일정을 날짜별로 확인해요.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            aria-label="이전 주"
            className="grid h-9 w-9 place-items-center rounded-md border bg-white hover:bg-muted"
            onClick={() => setWeekStart((current) => addDays(current, -7))}
            type="button"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="min-w-[190px] text-center text-base font-semibold">
            {formatDateShort(weekStart)} - {formatDateShort(weekEnd)}
          </div>
          <button
            aria-label="다음 주"
            className="grid h-9 w-9 place-items-center rounded-md border bg-white hover:bg-muted"
            onClick={() => setWeekStart((current) => addDays(current, 7))}
            type="button"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            className="inline-flex h-9 items-center gap-2 rounded-md border bg-white px-3 text-sm font-medium hover:bg-muted"
            onClick={() => setWeekStart(getWeekStart(new Date()))}
            type="button"
          >
            <RotateCcw className="h-4 w-4" />
            이번 주
          </button>
        </div>
      </header>

      {scheduleListQuery.isLoading ? (
        <WeekReportSkeleton />
      ) : scheduleListQuery.isError ? (
        <WeekReportError
          error={scheduleListQuery.error}
          onRetry={() => void scheduleListQuery.refetch()}
        />
      ) : (
        <div className="grid gap-3">
          {days.map((day) => (
            <article className="rounded-lg border bg-white p-4" key={day.date}>
              <div className="flex items-center justify-between gap-3 border-b pb-3">
                <div>
                  <h2 className="text-base font-semibold">
                    {formatDateWithWeekday(day.dateObject)}
                  </h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {day.schedules.length}개 일정
                  </p>
                </div>
              </div>
              {day.schedules.length === 0 ? (
                <p className="py-5 text-sm text-muted-foreground">
                  일정을 만들면 여기에서 볼 수 있어요.
                </p>
              ) : (
                <div className="mt-3 grid gap-2">
                  {day.schedules.map((schedule) => (
                    <WeekReportScheduleRow
                      key={schedule.id}
                      schedule={schedule}
                      timeZone={screenTimeZone}
                    />
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function WeekReportScheduleRow({
  schedule,
  timeZone,
}: {
  readonly schedule: Schedule;
  readonly timeZone: string;
}) {
  return (
    <div className="grid gap-2 rounded-md border bg-muted/20 px-3 py-3 md:grid-cols-[130px_minmax(0,1fr)_160px] md:items-center">
      <span className="text-sm font-medium">
        {formatTimeRange(schedule, timeZone)}
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold">{schedule.scheduleTitle}</p>
        <p className="mt-1 truncate text-xs text-muted-foreground">
          {formatDealNames(schedule)}
        </p>
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <BriefcaseBusiness className="h-4 w-4" />
        {schedule.deals.length}개 딜
      </div>
    </div>
  );
}

function WeekReportError({
  error,
  onRetry,
}: {
  readonly error: unknown;
  readonly onRetry: () => void;
}) {
  return (
    <div className="rounded-lg border border-destructive/30 bg-red-50 p-5">
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 h-5 w-5 text-destructive" />
        <div>
          <p className="text-sm font-medium text-destructive">
            {getApiErrorMessage(error)}
          </p>
          <button
            className="mt-3 inline-flex h-9 items-center gap-2 rounded-md border bg-white px-3 text-sm font-medium hover:bg-muted"
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

function WeekReportSkeleton() {
  return (
    <div className="grid gap-3">
      {Array.from({ length: 7 }).map((_, index) => (
        <div
          className="h-28 animate-pulse rounded-lg border bg-muted"
          key={index}
        />
      ))}
    </div>
  );
}

function buildWeekDays(weekStart: Date, schedules: Schedule[]) {
  const schedulesByDate = groupSchedulesByDate(schedules);

  return Array.from({ length: 7 }, (_, index) => {
    const dateObject = addDays(weekStart, index);
    const date = toDateKey(dateObject);

    return {
      date,
      dateObject,
      schedules: schedulesByDate.get(date) ?? [],
    };
  });
}

function groupSchedulesByDate(schedules: Schedule[]) {
  const grouped = new Map<string, Schedule[]>();

  for (const schedule of schedules) {
    const key = toDateKeyInTimeZone(schedule.startAt, screenTimeZone);
    const items = grouped.get(key) ?? [];
    items.push(schedule);
    grouped.set(key, items);
  }

  return grouped;
}

function getWeekStart(date: Date) {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = start.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  start.setDate(start.getDate() + diff);

  return start;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);

  return next;
}

function toDateKey(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}`;
}

function toDateKeyInTimeZone(value: string, timeZone: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value.slice(0, 10);
  }

  const formatter = new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    timeZone,
    year: "numeric",
  });
  const parts = new Map(
    formatter
      .formatToParts(date)
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value])
  );

  return `${parts.get("year")}-${parts.get("month")}-${parts.get("day")}`;
}

function formatDateShort(date: Date) {
  return formatDate(date);
}

function formatDateWithWeekday(date: Date) {
  return formatDateWithOptions(date, {
    month: "long",
    day: "numeric",
    weekday: "long",
  });
}

function formatTimeRange(schedule: Schedule, timeZone: string) {
  return `${formatDateWithOptions(schedule.startAt, {
    hour: "2-digit",
    minute: "2-digit",
    timeZone,
  })} - ${formatDateWithOptions(schedule.endAt, {
    hour: "2-digit",
    minute: "2-digit",
    timeZone,
  })}`;
}

function formatDealNames(schedule: Schedule) {
  return (
    schedule.deals.map((deal) => deal.dealName).join(" · ") || "연결 딜 없음"
  );
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}
