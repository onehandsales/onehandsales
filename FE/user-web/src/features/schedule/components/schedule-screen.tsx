import { useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  FileText,
  Loader2,
  RefreshCw,
  RotateCcw,
  Settings2,
} from "lucide-react";
import {
  type KeyboardEvent as ReactKeyboardEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuthSession } from "@/features/auth";
import { syncGoogleCalendar as syncGoogleCalendarApi } from "@/features/schedule/api/schedule-api";
import { scheduleQueryKeys } from "@/features/schedule/api/schedule-query-keys";
import { ScheduleFormDialog } from "@/features/schedule/components/schedule-form-dialog";
import {
  useGoogleCalendarStatus,
  useScheduleList,
} from "@/features/schedule/hooks/use-schedule-queries";
import {
  useStartGoogleCalendarConnectMutation,
} from "@/features/schedule/hooks/use-schedule-mutations";
import { getDefaultScheduleTimeZone } from "@/features/schedule/schemas/schedule-schema";
import type {
  GoogleCalendarStatusResponse,
  Schedule,
  ScheduleVisibility,
  ScheduleViewMode,
} from "@/features/schedule/types/schedule";
import {
  formatScheduleClockRange,
  formatScheduleClockText,
  getScheduleSourceBadgeClassName,
  getScheduleSourceBadgeLabel,
  getUrlDomainLabel,
} from "@/features/schedule/utils/google-calendar-display";
import { ApiClientError, getApiErrorMessage } from "@/lib/api-client";
import { formatDateWithOptions } from "@/utils/format";

const GOOGLE_CALENDAR_SYNC_PROGRESS_REFRESH_DELAY_MS = 1_500;

const weekDayLabels = ["월", "화", "수", "목", "금", "토", "일"];
const viewModeOptions: ReadonlyArray<{
  readonly value: ScheduleViewMode;
  readonly label: string;
}> = [
  { value: "month", label: "월" },
  { value: "week", label: "주" },
];
const visibilityOptions: ReadonlyArray<{
  readonly value: ScheduleVisibility;
  readonly label: string;
}> = [
  { value: "ACTIVE", label: "기본 일정" },
  { value: "HIDDEN_GOOGLE", label: "숨긴 Google 일정" },
  { value: "ALL", label: "전체" },
];

export function ScheduleScreen() {
  const { user } = useAuthSession();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const screenTimeZone = user?.timeZone ?? getDefaultScheduleTimeZone();
  const [viewMode, setViewMode] = useState<ScheduleViewMode>("month");
  const [visibility, setVisibility] = useState<ScheduleVisibility>("ACTIVE");
  const [anchorDate, setAnchorDate] = useState(() => new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(
    null,
  );
  const [initialStartAt, setInitialStartAt] = useState<Date | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [googleActionError, setGoogleActionError] = useState<string | null>(null);
  const [manualSyncPending, setManualSyncPending] = useState(false);
  const [manualSyncCooldownUntil, setManualSyncCooldownUntil] = useState(0);
  const [isTodayPressed, setIsTodayPressed] = useState(false);
  const autoSyncKeyRef = useRef<string | null>(null);
  const autoSyncInFlightRef = useRef(false);
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
    visibility,
    sourceType: "ALL",
  });
  const googleStatusQuery = useGoogleCalendarStatus();
  const startGoogleCalendarConnectMutation =
    useStartGoogleCalendarConnectMutation();
  const schedules = useMemo(
    () => schedulesQuery.data?.items ?? [],
    [schedulesQuery.data?.items],
  );
  const schedulesByDate = useMemo(
    () => groupSchedulesByDate(schedules, screenTimeZone),
    [schedules, screenTimeZone],
  );
  const title = formatMonthTitle(anchorDate);
  const weeklyReportWeekStart = useMemo(
    () => toDateKey(getWeekStart(anchorDate)),
    [anchorDate],
  );
  const isManualSyncCoolingDown = manualSyncCooldownUntil > Date.now();
  const refreshGoogleCalendarScheduleView = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: scheduleQueryKeys.google() });
    void queryClient.invalidateQueries({ queryKey: scheduleQueryKeys.lists() });
    void queryClient.invalidateQueries({
      queryKey: scheduleQueryKeys.weeklyReports(),
    });
    void queryClient.invalidateQueries({
      queryKey: scheduleQueryKeys.details(),
    });
  }, [queryClient]);
  const refreshGoogleCalendarScheduleViewSoon = useCallback(() => {
    window.setTimeout(
      refreshGoogleCalendarScheduleView,
      GOOGLE_CALENDAR_SYNC_PROGRESS_REFRESH_DELAY_MS,
    );
  }, [refreshGoogleCalendarScheduleView]);

  useEffect(() => {
    const result = searchParams.get("googleCalendar");

    if (!result) {
      return;
    }

    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.delete("googleCalendar");
    setSearchParams(nextSearchParams, { replace: true });

    if (result === "connected") {
      setNotice(null);
      setGoogleActionError(null);
      refreshGoogleCalendarScheduleView();
      return;
    }

    setNotice(null);
    setGoogleActionError(
      result === "denied"
        ? "Google Calendar 연결 권한이 거절됐어요."
        : "Google Calendar와 연결하지 못했어요. 다시 시도해 주세요.",
    );
  }, [refreshGoogleCalendarScheduleView, searchParams, setSearchParams]);

  useEffect(() => {
    if (manualSyncCooldownUntil <= Date.now()) {
      return;
    }

    const timeoutId = window.setTimeout(
      () => setManualSyncCooldownUntil(0),
      manualSyncCooldownUntil - Date.now(),
    );

    return () => window.clearTimeout(timeoutId);
  }, [manualSyncCooldownUntil]);

  useEffect(() => {
    const status = googleStatusQuery.data;

    if (
      !status?.autoSync.shouldSyncOnScheduleEntry ||
      autoSyncInFlightRef.current ||
      manualSyncPending
    ) {
      return;
    }

    const syncKey = [
      status.connection?.providerAccountEmail ?? "",
      status.connection?.lastSyncedAt ?? "",
      status.connection?.lastSyncStartedAt ?? "",
      status.connection?.lastSyncFailedAt ?? "",
      status.autoSync.nextAutoSyncAvailableAt ?? "",
    ].join("|");

    if (autoSyncKeyRef.current === syncKey) {
      return;
    }

    autoSyncKeyRef.current = syncKey;
    autoSyncInFlightRef.current = true;
    void syncGoogleCalendarApi({ trigger: "AUTO" })
      .then(() => {
        setGoogleActionError(null);
        refreshGoogleCalendarScheduleView();
        setNotice(null);
      })
      .catch((error) => {
        if (isGoogleCalendarSyncInProgressError(error)) {
          setGoogleActionError(null);
          setNotice("Google Calendar 동기화 중이에요. 곧 반영할게요.");
          refreshGoogleCalendarScheduleViewSoon();
          return;
        }

        setGoogleActionError(getApiErrorMessage(error));
      })
      .finally(() => {
        autoSyncInFlightRef.current = false;
      });
  }, [
    googleStatusQuery.data,
    manualSyncPending,
    refreshGoogleCalendarScheduleView,
    refreshGoogleCalendarScheduleViewSoon,
  ]);

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

  const connectGoogleCalendar = async () => {
    setGoogleActionError(null);

    try {
      const response = await startGoogleCalendarConnectMutation.mutateAsync({
        returnTo: "/app/schedules",
      });
      window.location.assign(response.connectUrl);
    } catch (error) {
      setGoogleActionError(getApiErrorMessage(error));
    }
  };

  const syncGoogleCalendar = async () => {
    if (manualSyncPending || isManualSyncCoolingDown) {
      return;
    }

    setGoogleActionError(null);
    setManualSyncPending(true);

    try {
      await syncGoogleCalendarApi({ trigger: "MANUAL" });
      refreshGoogleCalendarScheduleView();
      setNotice(null);
    } catch (error) {
      if (isGoogleCalendarSyncInProgressError(error)) {
        setGoogleActionError(null);
        setNotice("Google Calendar 동기화 중이에요. 곧 반영할게요.");
        refreshGoogleCalendarScheduleViewSoon();
        return;
      }

      setGoogleActionError(getApiErrorMessage(error));
    } finally {
      setManualSyncPending(false);
      setManualSyncCooldownUntil(Date.now() + 10_000);
    }
  };

  return (
    <section className="flex h-dvh min-h-0 flex-col overflow-hidden bg-white">
      <header className="app-page-header flex min-h-[var(--topbar-height)] shrink-0 flex-col gap-3 px-5 py-2 sm:flex-row sm:items-center sm:justify-between sm:py-0">
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
          <Link
            className="inline-flex h-10 items-center gap-1.5 rounded-md border border-[#E2E5EC] bg-white px-3 text-[13px] font-medium text-[#374151] transition hover:bg-[#F5F6F8]"
            to={`/app/schedules/week?weekStart=${weeklyReportWeekStart}`}
          >
            <FileText className="h-4 w-4" />
            주간 보고서
          </Link>
          <ScheduleViewModeSelect onChange={setViewMode} value={viewMode} />
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden px-5 pb-3 pt-1">
        {notice ? (
          <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            {notice}
          </p>
        ) : null}

        <GoogleCalendarStatusRow
          actionError={googleActionError}
          isConnectPending={startGoogleCalendarConnectMutation.isPending}
          isSyncCoolingDown={isManualSyncCoolingDown}
          isSyncPending={manualSyncPending}
          onConnect={() => void connectGoogleCalendar()}
          onSync={() => void syncGoogleCalendar()}
          status={googleStatusQuery.data}
          statusError={googleStatusQuery.error}
          statusLoading={googleStatusQuery.isLoading}
          visibility={visibility}
          onVisibilityChange={setVisibility}
        />

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
        defaultTimeZone={screenTimeZone}
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

function GoogleCalendarStatusRow({
  status,
  statusLoading,
  statusError,
  actionError,
  isConnectPending,
  isSyncPending,
  isSyncCoolingDown,
  visibility,
  onConnect,
  onSync,
  onVisibilityChange,
}: {
  readonly status: GoogleCalendarStatusResponse | undefined;
  readonly statusLoading: boolean;
  readonly statusError: unknown;
  readonly actionError: string | null;
  readonly isConnectPending: boolean;
  readonly isSyncPending: boolean;
  readonly isSyncCoolingDown: boolean;
  readonly visibility: ScheduleVisibility;
  readonly onConnect: () => void;
  readonly onSync: () => void;
  readonly onVisibilityChange: (value: ScheduleVisibility) => void;
}) {
  const connection = status?.connection ?? null;
  const isConnected = Boolean(
    status?.connected && connection?.status === "CONNECTED",
  );
  const requiresReconnect = connection?.status === "RECONNECT_REQUIRED";
  const accountLabel = connection?.providerAccountEmail ?? "Google Calendar";
  const statusLabel = statusLoading
    ? "상태 확인 중"
    : requiresReconnect
      ? "재연결 필요"
      : isConnected
        ? "연결됨"
        : "연결 안 됨";
  const detailLabel = isConnected
    ? `${status?.selectedCalendarCount ?? 0}/${status?.availableCalendarCount ?? 0}개 선택 · ${
        connection?.lastSyncedAt
          ? `마지막 ${formatStatusDateTime(connection.lastSyncedAt)}`
          : "동기화 전"
      }`
    : accountLabel;
  const syncDisabled = !isConnected || isSyncPending || isSyncCoolingDown;

  return (
    <div className="grid gap-2 rounded-md border border-[#E2E5EC] bg-[#F8FAFC] px-3 py-2 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
      <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2">
        <span
          className={`inline-flex h-7 shrink-0 items-center gap-1.5 rounded-md border px-2 text-[12px] font-semibold ${
            isConnected
              ? "border-[#BBF7D0] bg-[#F0FDF4] text-[#047857]"
              : requiresReconnect
                ? "border-[#FDE68A] bg-[#FFFBEB] text-[#92400E]"
                : "border-[#CBD5E1] bg-white text-[#475569]"
          }`}
        >
          {statusLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
          {statusLabel}
        </span>
        <span className="min-w-0 truncate text-[12px] font-medium text-[#374151]">
          {statusError ? getApiErrorMessage(statusError) : detailLabel}
        </span>
        {actionError ? (
          <span className="min-w-0 break-words text-[12px] font-medium text-[#B91C1C]">
            {actionError}
          </span>
        ) : null}
      </div>

      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <div className="inline-flex h-9 overflow-hidden rounded-md border border-[#D7DCE5] bg-white">
          {visibilityOptions.map((option) => {
            const selected = option.value === visibility;

            return (
              <button
                aria-pressed={selected}
                className={`min-w-[76px] px-2 text-[12px] font-medium transition sm:min-w-[96px] ${
                  selected
                    ? "bg-[#111827] text-white"
                    : "text-[#475569] hover:bg-[#F1F5F9]"
                }`}
                key={option.value}
                onClick={() => onVisibilityChange(option.value)}
                type="button"
              >
                {option.label}
              </button>
            );
          })}
        </div>

        {isConnected ? (
          <>
            <button
              aria-busy={isSyncPending}
              className="inline-flex h-9 items-center gap-1.5 rounded-md border border-[#D7DCE5] bg-white px-3 text-[12px] font-semibold text-[#374151] transition hover:bg-[#F1F5F9] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={syncDisabled}
              onClick={onSync}
              type="button"
            >
              {isSyncPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <RefreshCw className="h-3.5 w-3.5" />
              )}
              동기화
            </button>
            <Link
              className="grid h-9 w-9 place-items-center rounded-md border border-[#D7DCE5] bg-white text-[#475569] transition hover:bg-[#F1F5F9]"
              title="Google Calendar 설정"
              to="/app/settings"
            >
              <Settings2 className="h-3.5 w-3.5" />
            </Link>
          </>
        ) : (
          <button
            className="inline-flex h-9 items-center gap-1.5 rounded-md border border-[#2563EB] bg-[#2563EB] px-3 text-[12px] font-semibold text-white transition hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isConnectPending || statusLoading}
            onClick={onConnect}
            type="button"
          >
            {isConnectPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <ExternalLink className="h-3.5 w-3.5" />
            )}
            {requiresReconnect ? "재연결" : "연결"}
          </button>
        )}
      </div>
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
    <div className="flex h-full min-h-0 w-full min-w-[680px] flex-col lg:min-w-[820px]">
      <CalendarHeader />
      <div className="grid h-full min-h-0 flex-1 auto-rows-fr grid-cols-7">
        {cells.map((cell) => {
          const dateKey = toDateKey(cell);
          const daySchedules = schedulesByDate.get(dateKey) ?? [];
          const isOutsideMonth = cell.getMonth() !== currentMonth;

          return (
            <section
              className={`min-h-[92px] border-r border-t border-[#E2E5EC] px-1.5 pb-1.5 last:border-r-0 lg:min-h-[112px] lg:px-2 lg:pb-2 ${
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
    <div className="flex h-full min-h-0 w-full min-w-[680px] flex-col lg:min-w-[820px]">
      <CalendarHeader />
      <div className="grid h-full min-h-0 flex-1 auto-rows-fr grid-cols-7">
        {days.map((day) => {
          const dateKey = toDateKey(day);
          const daySchedules = schedulesByDate.get(dateKey) ?? [];

          return (
            <section
              className="min-h-[420px] border-r border-t border-[#E2E5EC] p-2 last:border-r-0 lg:min-h-[460px] lg:p-3"
              key={dateKey}
            >
              <button
                className={`mb-2 inline-flex h-9 items-center rounded-md px-2 text-[12px] font-semibold lg:mb-3 lg:h-11 lg:px-3 lg:text-sm ${
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
  const openSchedule = () => onClick();
  const openScheduleByKeyboard = (
    event: ReactKeyboardEvent<HTMLDivElement>,
  ) => {
    if (event.target !== event.currentTarget) {
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openSchedule();
    }
  };

  return (
    <div
      aria-label={`${schedule.scheduleTitle} 일정 열기`}
      className={`grid min-h-9 cursor-pointer grid-cols-[minmax(0,1fr)_auto] items-start gap-1 rounded-md border px-1.5 py-1 transition focus:outline-none focus:ring-2 focus:ring-[#93C5FD] lg:min-h-11 lg:px-2 lg:py-1.5 ${tone.pill}`}
      onClick={(event) => {
        event.stopPropagation();
        openSchedule();
      }}
      onKeyDown={openScheduleByKeyboard}
      role="button"
      tabIndex={0}
    >
      <span className="min-w-0 text-left">
        <span
          className={`block truncate text-[11px] font-semibold lg:text-xs ${tone.title}`}
        >
          {formatScheduleTime(schedule, timeZone)} {schedule.scheduleTitle}
        </span>
        <span className="mt-0.5 flex min-w-0 items-center gap-1">
          <ScheduleSourceBadge compact schedule={schedule} />
          <span className="min-w-0 truncate text-[11px] text-[#6B7280]">
            {formatScheduleContext(schedule)}
          </span>
        </span>
      </span>
      <MeetingUrlLink compact meetingUrl={schedule.meetingUrl} />
    </div>
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
  const openSchedule = () => onClick();
  const openScheduleByKeyboard = (
    event: ReactKeyboardEvent<HTMLElement>,
  ) => {
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
      aria-label={`${schedule.scheduleTitle} 일정 열기`}
      className={`grid cursor-pointer gap-2 rounded-lg border bg-white p-3 text-left transition focus:outline-none focus:ring-2 focus:ring-[#93C5FD] ${tone.card}`}
      onClick={openSchedule}
      onKeyDown={openScheduleByKeyboard}
      role="button"
      tabIndex={0}
    >
      <div className="flex min-w-0 items-start justify-between gap-2">
        <div className="min-w-0 text-left">
          <span className={`block truncate text-sm font-semibold ${tone.title}`}>
            {schedule.scheduleTitle}
          </span>
          <span className="mt-1 block text-xs text-muted-foreground">
            {formatScheduleTimeRange(schedule, timeZone)}
          </span>
        </div>
        <MeetingUrlLink meetingUrl={schedule.meetingUrl} />
      </div>
      <div className="flex min-w-0 flex-wrap items-center gap-1.5">
        <ScheduleSourceBadge schedule={schedule} />
        <span className="min-w-0 truncate text-xs text-slate-700">
          {formatScheduleContext(schedule)}
        </span>
      </div>
      {schedule.location ? (
        <p className="truncate text-xs text-muted-foreground">
          {schedule.location}
        </p>
      ) : null}
    </article>
  );
}

function ScheduleSourceBadge({
  schedule,
  compact = false,
}: {
  readonly schedule: Pick<Schedule, "sourceType" | "googleCalendar">;
  readonly compact?: boolean;
}) {
  const label = getScheduleSourceBadgeLabel(schedule);

  if (!label) {
    return null;
  }

  return (
    <span
      className={`inline-flex shrink-0 items-center rounded border font-semibold ${getScheduleSourceBadgeClassName(
        schedule,
      )} ${compact ? "h-4 px-1 text-[10px]" : "h-5 px-1.5 text-[11px]"}`}
    >
      {label}
    </span>
  );
}

function MeetingUrlLink({
  meetingUrl,
  compact = false,
}: {
  readonly meetingUrl: string | null;
  readonly compact?: boolean;
}) {
  if (!meetingUrl) {
    return null;
  }

  return (
    <a
      aria-label={`${getUrlDomainLabel(meetingUrl)} 열기`}
      className={`grid shrink-0 place-items-center rounded-md border border-[#D7DCE5] bg-white text-[#475569] transition hover:bg-[#F1F5F9] hover:text-[#111827] ${
        compact ? "h-6 w-6" : "h-8 w-8"
      }`}
      href={meetingUrl}
      onClick={(event) => event.stopPropagation()}
      rel="noopener noreferrer"
      target="_blank"
      title={getUrlDomainLabel(meetingUrl)}
    >
      <ExternalLink className={compact ? "h-3 w-3" : "h-3.5 w-3.5"} />
    </a>
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
  return formatScheduleClockText(schedule, timeZone);
}

function formatScheduleTimeRange(schedule: Schedule, timeZone: string) {
  return formatScheduleClockRange(schedule, timeZone);
}

function formatScheduleContext(schedule: Schedule) {
  return (
    schedule.deals.map((deal) => deal.dealName).join(" · ") || "연결 딜 없음"
  );
}

function formatStatusDateTime(value: string) {
  return formatDateWithOptions(value, {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isGoogleCalendarSyncInProgressError(error: unknown) {
  return (
    error instanceof ApiClientError &&
    error.code === "GoogleCalendarSyncInProgress"
  );
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}
