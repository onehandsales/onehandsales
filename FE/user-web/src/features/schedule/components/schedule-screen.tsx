import {
  AlertCircle,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  FileText,
  Plus,
  RotateCcw,
} from "lucide-react";
import { useMemo, useState } from "react";
import { ScheduleFormDialog } from "@/features/schedule/components/schedule-form-dialog";
import { useScheduleList } from "@/features/schedule/hooks/use-schedule-queries";
import { getDefaultScheduleTimeZone } from "@/features/schedule/schemas/schedule-schema";
import type {
  Schedule,
  ScheduleViewMode,
} from "@/features/schedule/types/schedule";
import { getApiErrorMessage } from "@/lib/api-client";
import { formatDate, formatDateWithOptions } from "@/utils/format";
import { PageHeader } from "@/components/layout/page-header";

const screenTimeZone = getDefaultScheduleTimeZone();
const weekDayLabels = ["월", "화", "수", "목", "금", "토", "일"];

export function ScheduleScreen() {
  const [viewMode, setViewMode] = useState<ScheduleViewMode>("month");
  const [anchorDate, setAnchorDate] = useState(() => new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [initialStartAt, setInitialStartAt] = useState<Date | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const range = useMemo(
    () =>
      viewMode === "month"
        ? getMonthRange(anchorDate)
        : getWeekRange(anchorDate),
    [anchorDate, viewMode]
  );
  const schedulesQuery = useScheduleList({
    view: viewMode,
    baseDate: toDateKey(anchorDate),
    timeZone: screenTimeZone,
  });
  const schedules = useMemo(
    () => schedulesQuery.data?.items ?? [],
    [schedulesQuery.data?.items]
  );
  const schedulesByDate = useMemo(
    () => groupSchedulesByDate(schedules, screenTimeZone),
    [schedules]
  );
  const title =
    viewMode === "month"
      ? formatMonthTitle(anchorDate)
      : `${formatDateShort(range.start)} - ${formatDateShort(
          addDays(range.end, -1)
        )}`;

  const openCreateDialog = (startAt: Date | null = null) => {
    setSelectedSchedule(null);
    setInitialStartAt(startAt);
    setIsDialogOpen(true);
  };

  const openEditDialog = (schedule: Schedule) => {
    setSelectedSchedule(schedule);
    setInitialStartAt(null);
    setIsDialogOpen(true);
  };

  const movePrevious = () => {
    setAnchorDate((current) =>
      viewMode === "month" ? addMonths(current, -1) : addDays(current, -7)
    );
  };

  const moveNext = () => {
    setAnchorDate((current) =>
      viewMode === "month" ? addMonths(current, 1) : addDays(current, 7)
    );
  };

  return (
    <section className="flex min-h-full flex-col bg-[#FAFAF8]">
      <PageHeader
        breadcrumbs={[{ label: "일정", icon: CalendarDays }]}
        actions={[
          { icon: FileText, tooltip: "주간 보고서", href: "/schedules/week" },
          { icon: Plus, tooltip: "일정 생성", onClick: () => openCreateDialog() },
        ]}
      />

      <div className="flex flex-col gap-4 px-5 pb-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="inline-flex w-fit rounded-md border border-[#E2E5EC] bg-white p-1">
            <button
              className={`h-7 rounded-md px-3 text-[12px] font-medium ${
                viewMode === "month"
                  ? "bg-[#047857] text-white"
                  : "text-[#374151] hover:bg-[#F5F6F8]"
              }`}
              onClick={() => setViewMode("month")}
              type="button"
            >
              월간
            </button>
            <button
              className={`h-7 rounded-md px-3 text-[12px] font-medium ${
                viewMode === "week"
                  ? "bg-[#047857] text-white"
                  : "text-[#374151] hover:bg-[#F5F6F8]"
              }`}
              onClick={() => setViewMode("week")}
              type="button"
            >
              주간
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              aria-label="이전 기간"
              className="grid h-7 w-7 place-items-center rounded-md border border-[#E2E5EC] bg-white text-[#374151] hover:bg-[#F5F6F8]"
              onClick={movePrevious}
              type="button"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="min-w-[190px] text-center text-[13px] font-semibold text-[#111827]">
              {title}
            </div>
            <button
              aria-label="다음 기간"
              className="grid h-7 w-7 place-items-center rounded-md border border-[#E2E5EC] bg-white text-[#374151] hover:bg-[#F5F6F8]"
              onClick={moveNext}
              type="button"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              className="inline-flex h-7 items-center gap-1.5 rounded-md border border-[#E2E5EC] bg-white px-2.5 text-[12px] font-medium text-[#374151] hover:bg-[#F5F6F8]"
              onClick={() => setAnchorDate(new Date())}
              type="button"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              오늘
            </button>
          </div>
        </div>

        {notice ? (
          <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            {notice}
          </p>
        ) : null}

        {schedulesQuery.isLoading ? (
          <CalendarSkeleton />
        ) : schedulesQuery.isError ? (
          <ScheduleError
            error={schedulesQuery.error}
            onRetry={() => void schedulesQuery.refetch()}
          />
        ) : (
          <div className="grid gap-4">
            <div className="overflow-x-auto rounded-lg border border-[#E2E5EC] bg-white shadow-sm">
              {viewMode === "month" ? (
                <MonthCalendar
                  anchorDate={anchorDate}
                  onCreate={openCreateDialog}
                  onEdit={openEditDialog}
                  schedulesByDate={schedulesByDate}
                  timeZone={screenTimeZone}
                />
              ) : (
                <WeekCalendar
                  onCreate={openCreateDialog}
                  onEdit={openEditDialog}
                  rangeStart={range.start}
                  schedulesByDate={schedulesByDate}
                  timeZone={screenTimeZone}
                />
              )}
            </div>

            {schedules.length === 0 ? (
              <ScheduleEmptyState
                mode={viewMode}
                onCreate={() => openCreateDialog(range.start)}
              />
            ) : null}
          </div>
        )}
      </div>

      <ScheduleFormDialog
        initialStartAt={initialStartAt}
        onOpenChange={setIsDialogOpen}
        onSaved={setNotice}
        open={isDialogOpen}
        schedule={selectedSchedule}
      />
    </section>
  );
}

type CalendarProps = {
  readonly schedulesByDate: Map<string, Schedule[]>;
  readonly timeZone: string;
  readonly onCreate: (startAt: Date) => void;
  readonly onEdit: (schedule: Schedule) => void;
};

function MonthCalendar({
  anchorDate,
  schedulesByDate,
  timeZone,
  onCreate,
  onEdit,
}: CalendarProps & { readonly anchorDate: Date }) {
  const cells = getMonthCells(anchorDate);
  const currentMonth = anchorDate.getMonth();

  return (
    <div className="min-w-[820px]">
      <CalendarHeader />
      <div className="grid grid-cols-7">
        {cells.map((cell) => {
          const dateKey = toDateKey(cell);
          const daySchedules = schedulesByDate.get(dateKey) ?? [];
          const isOutsideMonth = cell.getMonth() !== currentMonth;

          return (
            <section
              className={`min-h-[142px] border-r border-t border-[#E2E5EC] p-2 last:border-r-0 ${
                isOutsideMonth ? "bg-[#F5F6F8] text-[#9CA3AF]" : "bg-white"
              }`}
              key={dateKey}
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <button
                  className={`grid h-7 w-7 place-items-center rounded-md text-sm font-medium ${
                    isToday(cell)
                      ? "bg-[#F59E0B] text-white"
                      : "text-[#111827] hover:bg-[#F5F6F8]"
                  }`}
                  onClick={() => onCreate(setHour(cell, 9))}
                  type="button"
                >
                  {cell.getDate()}
                </button>
                <button
                  aria-label={`${formatDateShort(cell)} 일정 생성`}
                  className="grid h-7 w-7 place-items-center rounded-md text-[#64748B] hover:bg-[#F3F4F6]"
                  onClick={() => onCreate(setHour(cell, 9))}
                  type="button"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <div className="grid gap-1">
                {daySchedules.slice(0, 4).map((schedule) => (
                  <SchedulePill
                    key={schedule.id}
                    onClick={() => onEdit(schedule)}
                    schedule={schedule}
                    timeZone={timeZone}
                  />
                ))}
                {daySchedules.length > 4 ? (
                  <span className="truncate text-xs text-muted-foreground">
                    +{daySchedules.length - 4}개
                  </span>
                ) : null}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function WeekCalendar({
  rangeStart,
  schedulesByDate,
  timeZone,
  onCreate,
  onEdit,
}: CalendarProps & { readonly rangeStart: Date }) {
  const days = Array.from({ length: 7 }, (_, index) => addDays(rangeStart, index));

  return (
    <div className="min-w-[820px]">
      <CalendarHeader />
      <div className="grid grid-cols-7">
        {days.map((day) => {
          const dateKey = toDateKey(day);
          const daySchedules = schedulesByDate.get(dateKey) ?? [];

          return (
            <section
              className="min-h-[460px] border-r border-t border-[#E2E5EC] p-3 last:border-r-0"
              key={dateKey}
            >
              <button
                className={`mb-3 inline-flex h-8 items-center rounded-md px-2 text-sm font-semibold ${
                  isToday(day)
                    ? "bg-[#F59E0B] text-white"
                    : "text-[#111827] hover:bg-[#F5F6F8]"
                }`}
                onClick={() => onCreate(setHour(day, 9))}
                type="button"
              >
                {formatMonthDay(day)}
              </button>
              <div className="grid gap-2">
                {daySchedules.length === 0 ? (
                  <button
                    className="h-16 rounded-md border border-dashed text-sm text-[#64748B] hover:bg-[#F3F4F6]"
                    onClick={() => onCreate(setHour(day, 9))}
                    type="button"
                  >
                    일정 생성
                  </button>
                ) : (
                  daySchedules.map((schedule) => (
                    <ScheduleCard
                      key={schedule.id}
                      onClick={() => onEdit(schedule)}
                      schedule={schedule}
                      timeZone={timeZone}
                    />
                  ))
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function CalendarHeader() {
  return (
    <div className="grid grid-cols-7 border-b border-[#E2E5EC] bg-[#F5F6F8]">
      {weekDayLabels.map((label) => (
        <div
          className="px-3 py-2 text-center text-[12px] font-semibold text-[#6B7280]"
          key={label}
        >
          {label}
        </div>
      ))}
    </div>
  );
}

function SchedulePill({
  schedule,
  timeZone,
  onClick,
}: {
  readonly schedule: Schedule;
  readonly timeZone: string;
  readonly onClick: () => void;
}) {
  const tone = getScheduleTone(schedule.id);

  return (
    <button
      className={`grid min-h-8 rounded-md border px-2 py-1 text-left transition ${tone.pill}`}
      onClick={onClick}
      type="button"
    >
      <span className={`truncate text-xs font-semibold ${tone.title}`}>
        {formatScheduleTime(schedule, timeZone)} {schedule.scheduleTitle}
      </span>
      <span className="truncate text-[11px] text-[#6B7280]">
        {formatScheduleContext(schedule)}
      </span>
    </button>
  );
}

function ScheduleCard({
  schedule,
  timeZone,
  onClick,
}: {
  readonly schedule: Schedule;
  readonly timeZone: string;
  readonly onClick: () => void;
}) {
  const tone = getScheduleTone(schedule.id);

  return (
    <button
      className={`grid gap-2 rounded-lg border bg-white p-3 text-left transition ${tone.card}`}
      onClick={onClick}
      type="button"
    >
      <div className="min-w-0">
        <p className={`truncate text-sm font-semibold ${tone.title}`}>
          {schedule.scheduleTitle}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {formatScheduleTimeRange(schedule, timeZone)}
        </p>
      </div>
      <p className="truncate text-xs text-slate-700">
        {formatScheduleContext(schedule)}
      </p>
      {schedule.location ? (
        <p className="truncate text-xs text-muted-foreground">{schedule.location}</p>
      ) : null}
    </button>
  );
}

function getScheduleTone(scheduleId: string) {
  const tones = [
    {
      pill: "border-[#A7F3D0] bg-[#ECFDF5] hover:border-[#34D399] hover:bg-[#D1FAE5]",
      card: "border-[#A7F3D0] hover:bg-[#ECFDF5]",
      title: "text-[#047857]",
    },
    {
      pill: "border-[#FDE68A] bg-[#FFFBEB] hover:border-[#FBBF24] hover:bg-[#FEF3C7]",
      card: "border-[#FDE68A] hover:bg-[#FFFBEB]",
      title: "text-[#B45309]",
    },
    {
      pill: "border-[#FECDD3] bg-[#FFF1F2] hover:border-[#FB7185] hover:bg-[#FFE4E6]",
      card: "border-[#FECDD3] hover:bg-[#FFF1F2]",
      title: "text-[#BE123C]",
    },
    {
      pill: "border-[#DDD6FE] bg-[#F5F3FF] hover:border-[#A78BFA] hover:bg-[#EDE9FE]",
      card: "border-[#DDD6FE] hover:bg-[#F5F3FF]",
      title: "text-[#6D28D9]",
    },
    {
      pill: "border-[#CBD5E1] bg-[#F8FAFC] hover:border-[#94A3B8] hover:bg-[#F1F5F9]",
      card: "border-[#CBD5E1] hover:bg-[#F8FAFC]",
      title: "text-[#475569]",
    },
  ];
  const index = Array.from(scheduleId).reduce(
    (sum, char) => sum + char.charCodeAt(0),
    0
  );

  return tones[index % tones.length] ?? tones[0]!;
}

function ScheduleEmptyState({
  mode,
  onCreate,
}: {
  readonly mode: ScheduleViewMode;
  readonly onCreate: () => void;
}) {
  return (
    <div className="grid place-items-center rounded-lg border border-[#E2E5EC] bg-white px-5 py-10 text-center">
      <div>
        <CalendarDays className="mx-auto h-8 w-8 text-[#9CA3AF]" />
        <p className="mt-3 text-base font-semibold text-[#111827]">
          {mode === "month" ? "이번 달 일정이 없습니다." : "이번 주 일정이 없습니다."}
        </p>
        <p className="mt-2 text-sm text-[#6B7280]">
          새 일정을 만들면 캘린더에서 바로 확인할 수 있습니다.
        </p>
        <button
          className="mt-5 inline-flex h-7 items-center gap-1.5 rounded-md bg-[#047857] px-3 text-[12px] font-medium text-white hover:bg-[#065F46]"
          onClick={onCreate}
          type="button"
        >
          <Plus className="h-4 w-4" />
          일정 생성
        </button>
      </div>
    </div>
  );
}

function ScheduleError({
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
            className="mt-3 inline-flex h-7 items-center gap-1.5 rounded-md border border-[#E2E5EC] bg-white px-2.5 text-[12px] font-medium text-[#374151] hover:bg-[#F5F6F8]"
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

function CalendarSkeleton() {
  return (
    <div className="grid gap-3 rounded-lg border bg-white p-4">
      <div className="h-8 w-48 animate-pulse rounded-md bg-muted" />
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: 35 }).map((_, index) => (
          <div className="h-28 animate-pulse rounded-md bg-muted" key={index} />
        ))}
      </div>
    </div>
  );
}

function groupSchedulesByDate(schedules: Schedule[], timeZone: string) {
  const grouped = new Map<string, Schedule[]>();

  for (const schedule of schedules) {
    const key = toDateKeyInTimeZone(schedule.startAt, timeZone);
    const items = grouped.get(key) ?? [];
    items.push(schedule);
    grouped.set(key, items);
  }

  return grouped;
}

function getMonthCells(anchorDate: Date) {
  const monthStart = new Date(anchorDate.getFullYear(), anchorDate.getMonth(), 1);
  const monthEnd = new Date(anchorDate.getFullYear(), anchorDate.getMonth() + 1, 0);
  const gridStart = getWeekStart(monthStart);
  const gridEnd = addDays(getWeekStart(monthEnd), 7);
  const cells: Date[] = [];

  for (
    let current = new Date(gridStart);
    current < gridEnd;
    current = addDays(current, 1)
  ) {
    cells.push(current);
  }

  return cells;
}

function getMonthRange(anchorDate: Date) {
  return {
    start: new Date(anchorDate.getFullYear(), anchorDate.getMonth(), 1),
    end: new Date(anchorDate.getFullYear(), anchorDate.getMonth() + 1, 1),
  };
}

function getWeekRange(anchorDate: Date) {
  const start = getWeekStart(anchorDate);

  return { start, end: addDays(start, 7) };
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

function addMonths(date: Date, months: number) {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

function setHour(date: Date, hour: number) {
  const next = new Date(date);
  next.setHours(hour, 0, 0, 0);

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

function isToday(date: Date) {
  return toDateKey(date) === toDateKey(new Date());
}

function formatMonthTitle(date: Date) {
  return formatDateWithOptions(date, {
    year: "numeric",
    month: "long",
  });
}

function formatDateShort(date: Date) {
  return formatDate(date);
}

function formatMonthDay(date: Date) {
  return formatDateWithOptions(date, {
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  });
}

function formatScheduleTime(schedule: Schedule, timeZone: string) {
  return formatDateWithOptions(schedule.startAt, {
    hour: "2-digit",
    minute: "2-digit",
    timeZone,
  });
}

function formatScheduleTimeRange(schedule: Schedule, timeZone: string) {
  return `${formatScheduleTime(schedule, timeZone)} - ${formatDateWithOptions(
    schedule.endAt,
    {
      hour: "2-digit",
      minute: "2-digit",
      timeZone,
    }
  )}`;
}

function formatScheduleContext(schedule: Schedule) {
  return (
    schedule.deals.map((deal) => deal.dealName).join(" · ") || "연결 딜 없음"
  );
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}
