import {
  AlertCircle,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { ScheduleFormDialog } from "@/features/schedule/components/schedule-form-dialog";
import { useScheduleList } from "@/features/schedule/hooks/use-schedule-queries";
import { getDefaultScheduleTimeZone } from "@/features/schedule/schemas/schedule-schema";
import type {
  Schedule,
  ScheduleViewMode,
} from "@/features/schedule/types/schedule";
import { getApiErrorMessage } from "@/lib/api-client";
import { formatDateWithOptions } from "@/utils/format";

const screenTimeZone = getDefaultScheduleTimeZone();
const weekDayLabels = ["월", "화", "수", "목", "금", "토", "일"];
const viewModeOptions: ReadonlyArray<{
  readonly value: ScheduleViewMode;
  readonly label: string;
}> = [
  { value: "month", label: "월" },
  { value: "week", label: "주" },
];

export function ScheduleScreen() {
  const [viewMode, setViewMode] = useState<ScheduleViewMode>("month");
  const [anchorDate, setAnchorDate] = useState(() => new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(
    null,
  );
  const [initialStartAt, setInitialStartAt] = useState<Date | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isTodayPressed, setIsTodayPressed] = useState(false);
  const range = useMemo(
    () =>
      viewMode === "month"
        ? getMonthRange(anchorDate)
        : getWeekRange(anchorDate),
    [anchorDate, viewMode],
  );
  const schedulesQuery = useScheduleList({
    view: viewMode,
    baseDate: toDateKey(anchorDate),
    timeZone: screenTimeZone,
  });
  const schedules = useMemo(
    () => schedulesQuery.data?.items ?? [],
    [schedulesQuery.data?.items],
  );
  const schedulesByDate = useMemo(
    () => groupSchedulesByDate(schedules, screenTimeZone),
    [schedules],
  );
  const title = formatMonthTitle(anchorDate);

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
      viewMode === "month" ? addMonths(current, -1) : addDays(current, -7),
    );
  };

  const moveNext = () => {
    setAnchorDate((current) =>
      viewMode === "month" ? addMonths(current, 1) : addDays(current, 7),
    );
  };

  const moveToday = () => {
    setIsTodayPressed(true);
    window.setTimeout(() => setIsTodayPressed(false), 180);
    setAnchorDate(new Date());
  };

  return (
    <section className="flex h-dvh min-h-0 flex-col overflow-hidden bg-[#FAFAF8]">
      <header className="flex h-[var(--topbar-height)] shrink-0 items-center justify-between gap-3 px-5">
        <div className="flex min-w-0 items-center gap-x-3">
          <span className="flex items-center gap-1.5 text-[13px] font-semibold text-[#111827]">
            <CalendarDays
              className="h-[15px] w-[15px] shrink-0 text-[#4880EE]"
              strokeWidth={1.75}
            />
            일정
          </span>
          <button
            className="relative inline-flex h-10 items-center overflow-hidden rounded-md border border-[#E2E5EC] bg-white px-4 text-[13px] font-medium text-[#374151] transition-colors duration-150 hover:bg-[#E9ECEF] active:bg-[#DDE1E8]"
            onClick={moveToday}
            type="button"
          >
            <span
              className={`pointer-events-none absolute inset-0 rounded-md bg-[#DDE1E8] transition-opacity duration-200 ease-out ${
                isTodayPressed ? "opacity-100" : "opacity-0"
              }`}
            />
            <span className="relative">오늘</span>
          </button>
          <button
            aria-label="이전 기간"
            className="grid h-8 w-8 place-items-center rounded-full text-[#374151] transition-colors duration-150 hover:bg-[#E9ECEF] hover:text-[#111827] active:bg-[#DDE1E8]"
            onClick={movePrevious}
            type="button"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            aria-label="다음 기간"
            className="grid h-8 w-8 place-items-center rounded-full text-[#374151] transition-colors duration-150 hover:bg-[#E9ECEF] hover:text-[#111827] active:bg-[#DDE1E8]"
            onClick={moveNext}
            type="button"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <span className="min-w-0 truncate text-[13px] font-normal text-[#111827]">
            {title}
          </span>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <ScheduleViewModeSelect onChange={setViewMode} value={viewMode} />
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden px-5 pb-3 pt-1">
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
          <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden">
            <div className="flex h-full min-h-0 flex-1 overflow-x-auto rounded-lg border border-[#E2E5EC] bg-white shadow-sm">
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

function ScheduleViewModeSelect({
  value,
  onChange,
}: {
  readonly value: ScheduleViewMode;
  readonly onChange: (value: ScheduleViewMode) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const selectedLabel =
    viewModeOptions.find((option) => option.value === value)?.label ?? "월";

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleMouseDown = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label="일정 보기 방식"
        className={`inline-flex h-10 w-[58px] items-center justify-center gap-1.5 rounded-md border bg-white px-2 text-[13px] font-medium text-[#374151] outline-none transition hover:bg-[#F5F6F8] ${
          isOpen ? "border-[#4880EE] ring-1 ring-[#4880EE]" : "border-[#E2E5EC]"
        }`}
        onClick={() => setIsOpen((current) => !current)}
        type="button"
      >
        <span>{selectedLabel}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform ${
            isOpen ? "rotate-180 text-[#4880EE]" : "text-[#6B7280]"
          }`}
        />
      </button>

      {isOpen ? (
        <div
          className="absolute right-0 top-full z-50 mt-1 w-[58px] overflow-hidden rounded-md border border-[#E2E5EC] bg-white py-1 shadow-lg"
          role="listbox"
        >
          {viewModeOptions.map((option) => {
            const isSelected = option.value === value;

            return (
              <button
                aria-selected={isSelected}
                className={`flex h-9 w-full items-center justify-between px-3 text-left text-[13px] transition hover:bg-[#F5F6F8] ${
                  isSelected
                    ? "bg-[#EFF6FF] font-semibold text-[#1D4ED8]"
                    : "text-[#374151]"
                }`}
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                role="option"
                type="button"
              >
                <span>{option.label}</span>
                {isSelected ? <Check className="h-3.5 w-3.5" /> : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
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
    <div className="flex h-full min-h-0 w-full min-w-[820px] flex-col">
      <CalendarHeader />
      <div className="grid h-full min-h-0 flex-1 auto-rows-fr grid-cols-7">
        {cells.map((cell) => {
          const dateKey = toDateKey(cell);
          const daySchedules = schedulesByDate.get(dateKey) ?? [];
          const isOutsideMonth = cell.getMonth() !== currentMonth;

          return (
            <section
              className={`min-h-[112px] border-r border-t border-[#E2E5EC] px-2 pb-2 last:border-r-0 ${
                isOutsideMonth ? "bg-[#FAFAFB] text-[#9CA3AF]" : "bg-white"
              }`}
              key={dateKey}
              onClick={() => onCreate(setHour(cell, 9))}
            >
              <div className="relative h-9">
                <span
                  className={`pointer-events-none absolute left-1/2 grid -translate-x-1/2 place-items-center text-[12px] font-medium ${
                    isToday(cell)
                      ? "top-[2px] h-[22px] w-[22px] rounded-full bg-[#4880EE] p-0 leading-none text-white"
                      : "top-0 h-8 min-w-8 rounded-md px-2 text-[#111827]"
                  }`}
                >
                  {cell.getDate()}
                </span>
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
  const days = Array.from({ length: 7 }, (_, index) =>
    addDays(rangeStart, index),
  );

  return (
    <div className="flex h-full min-h-0 w-full min-w-[820px] flex-col">
      <CalendarHeader />
      <div className="grid h-full min-h-0 flex-1 auto-rows-fr grid-cols-7">
        {days.map((day) => {
          const dateKey = toDateKey(day);
          const daySchedules = schedulesByDate.get(dateKey) ?? [];

          return (
            <section
              className="min-h-[460px] border-r border-t border-[#E2E5EC] p-3 last:border-r-0"
              key={dateKey}
            >
              <button
                className={`mb-3 inline-flex h-11 items-center rounded-md px-3 text-sm font-semibold ${
                  isToday(day)
                    ? "bg-[#4880EE] text-white"
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
          className={`px-3 py-1 text-center text-[11px] leading-4 text-[#6B7280] ${
            label === "토" || label === "일" ? "font-bold" : "font-medium"
          }`}
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
      className={`grid min-h-11 rounded-md border px-2 py-1.5 text-left transition ${tone.pill}`}
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
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
        <p className="truncate text-xs text-muted-foreground">
          {schedule.location}
        </p>
      ) : null}
    </button>
  );
}

function getScheduleTone(scheduleId: string) {
  const tones = [
    {
      pill: "border-[#A7F3D0] bg-[#ECFDF5] hover:border-[#34D399] hover:bg-[#D1FAE5]",
      card: "border-[#A7F3D0] hover:bg-[#ECFDF5]",
      title: "text-[#4880EE]",
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
      pill: "border-[#BFDBFE] bg-[#EFF6FF] hover:border-[#93C5FD] hover:bg-[#DBEAFE]",
      card: "border-[#BFDBFE] hover:bg-[#EFF6FF]",
      title: "text-[#4880EE]",
    },
    {
      pill: "border-[#CBD5E1] bg-[#F8FAFC] hover:border-[#94A3B8] hover:bg-[#F1F5F9]",
      card: "border-[#CBD5E1] hover:bg-[#F8FAFC]",
      title: "text-[#475569]",
    },
  ];
  const index = Array.from(scheduleId).reduce(
    (sum, char) => sum + char.charCodeAt(0),
    0,
  );

  return tones[index % tones.length] ?? tones[0]!;
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
            className="mt-3 inline-flex h-11 items-center gap-1.5 rounded-md border border-[#E2E5EC] bg-white px-4 text-[13px] font-medium text-[#374151] hover:bg-[#F5F6F8]"
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
        {Array.from({ length: 42 }).map((_, index) => (
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
  const monthStart = new Date(
    anchorDate.getFullYear(),
    anchorDate.getMonth(),
    1,
  );
  const gridStart = getWeekStart(monthStart);

  return Array.from({ length: 42 }, (_, index) => addDays(gridStart, index));
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
    date.getDate(),
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
      .map((part) => [part.type, part.value]),
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
    },
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
