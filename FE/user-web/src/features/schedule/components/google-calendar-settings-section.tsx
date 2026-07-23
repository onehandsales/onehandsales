import {
  AlertCircle,
  CalendarDays,
  Check,
  ExternalLink,
  Settings2,
  Unlink,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ModalShell } from "@/components/ui/modal-shell";
import {
  useDisconnectGoogleCalendarMutation,
  useStartGoogleCalendarConnectMutation,
  useUpdateGoogleCalendarSelectionMutation,
} from "@/features/schedule/hooks/use-schedule-mutations";
import {
  useGoogleCalendars,
  useGoogleCalendarStatus,
} from "@/features/schedule/hooks/use-schedule-queries";
import type {
  GoogleCalendarDisconnectScheduleAction,
  GoogleCalendarSource,
  GoogleCalendarStatusResponse,
} from "@/features/schedule/types/schedule";
import { getApiErrorMessage } from "@/lib/api-client";
import { formatDateTime } from "@/utils/format";

type GoogleCalendarSettingsSectionProps = {
  readonly onNotice: (message: string) => void;
};

const disconnectActions: ReadonlyArray<{
  readonly value: GoogleCalendarDisconnectScheduleAction;
  readonly label: string;
  readonly description: string;
}> = [
  {
    value: "KEEP",
    label: "일정 유지",
    description: "가져온 Google 일정을 계속 표시합니다.",
  },
  {
    value: "HIDE",
    label: "기본 화면에서 숨김",
    description: "가져온 Google 일정을 기본 일정 화면에서 숨깁니다.",
  },
  {
    value: "TRASH",
    label: "휴지통으로 이동",
    description: "가져온 Google 일정을 휴지통으로 이동합니다.",
  },
];

export function GoogleCalendarSettingsSection({
  onNotice,
}: GoogleCalendarSettingsSectionProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const statusQuery = useGoogleCalendarStatus();
  const status = statusQuery.data;
  const connection = status?.connection ?? null;
  const canManageCalendars = connection?.status === "CONNECTED";
  const startConnectMutation = useStartGoogleCalendarConnectMutation();
  const updateSelectionMutation = useUpdateGoogleCalendarSelectionMutation();
  const disconnectMutation = useDisconnectGoogleCalendarMutation();
  const [calendarModalOpen, setCalendarModalOpen] = useState(false);
  const [disconnectModalOpen, setDisconnectModalOpen] = useState(false);
  const [selectedCalendarIds, setSelectedCalendarIds] = useState<string[]>([]);
  const [disconnectAction, setDisconnectAction] =
    useState<GoogleCalendarDisconnectScheduleAction>("KEEP");
  const [actionError, setActionError] = useState<string | null>(null);
  const [selectionError, setSelectionError] = useState<string | null>(null);
  const calendarsQuery = useGoogleCalendars(
    calendarModalOpen && canManageCalendars,
  );
  const calendars = useMemo(
    () => calendarsQuery.data?.calendars ?? [],
    [calendarsQuery.data?.calendars],
  );

  useEffect(() => {
    const result = searchParams.get("googleCalendar");

    if (!result) {
      return;
    }

    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.delete("googleCalendar");
    setSearchParams(nextSearchParams, { replace: true });

    if (result === "connected") {
      setActionError(null);
      onNotice("Google Calendar가 연결됐어요.");
      void statusQuery.refetch();
      return;
    }

    setActionError(
      result === "denied"
        ? "Google Calendar 연결 권한이 거절됐어요."
        : "Google Calendar와 연결하지 못했어요. 다시 시도해 주세요.",
    );
  }, [onNotice, searchParams, setSearchParams, statusQuery]);

  useEffect(() => {
    if (!calendarModalOpen || calendars.length === 0) {
      return;
    }

    setSelectedCalendarIds((current) => {
      if (current.length > 0) {
        return current;
      }

      const selected = calendars
        .filter((calendar) => calendar.status === "SELECTED")
        .map((calendar) => calendar.calendarId);

      if (selected.length > 0) {
        return selected;
      }

      return calendars
        .filter((calendar) => calendar.isPrimary)
        .map((calendar) => calendar.calendarId);
    });
  }, [calendarModalOpen, calendars]);

  const openCalendarModal = () => {
    setActionError(null);
    setSelectionError(null);
    setSelectedCalendarIds([]);
    setCalendarModalOpen(true);
  };

  const openDisconnectModal = () => {
    setActionError(null);
    setDisconnectAction("KEEP");
    setDisconnectModalOpen(true);
  };

  const connectGoogleCalendar = async () => {
    setActionError(null);

    try {
      const response = await startConnectMutation.mutateAsync({
        returnTo: "/app/settings",
      });
      window.location.assign(response.connectUrl);
    } catch (error) {
      setActionError(getApiErrorMessage(error));
    }
  };

  const saveCalendarSelection = async () => {
    const nextCalendarIds = Array.from(new Set(selectedCalendarIds));

    if (nextCalendarIds.length === 0) {
      setSelectionError("가져올 캘린더를 선택해 주세요.");
      return;
    }

    setSelectionError(null);

    try {
      await updateSelectionMutation.mutateAsync({
        selectedCalendarIds: nextCalendarIds,
      });
      setCalendarModalOpen(false);
      onNotice("캘린더 선택을 저장했어요.");
      void statusQuery.refetch();
    } catch (error) {
      setSelectionError(getApiErrorMessage(error));
    }
  };

  const disconnectGoogleCalendar = async () => {
    setActionError(null);

    try {
      const response = await disconnectMutation.mutateAsync({
        scheduleAction: disconnectAction,
      });
      setDisconnectModalOpen(false);
      onNotice(
        `Google Calendar 연결을 해제했어요. ${response.affectedScheduleCount.toLocaleString(
          "ko-KR",
        )}개 일정이 처리됐어요.`,
      );
      void statusQuery.refetch();
    } catch (error) {
      setActionError(getApiErrorMessage(error));
    }
  };

  const toggleCalendar = (calendarId: string) => {
    setSelectedCalendarIds((current) =>
      current.includes(calendarId)
        ? current.filter((item) => item !== calendarId)
        : [...current, calendarId],
    );
  };

  return (
    <section className="grid gap-3">
      <SettingsHeader />
      <div className="grid gap-4 rounded-lg border border-[#E2E5EC] bg-white p-5 shadow-sm">
        {statusQuery.isLoading ? (
          <GoogleCalendarSettingsSkeleton />
        ) : statusQuery.isError ? (
          <InlineError
            error={statusQuery.error}
            onRetry={() => void statusQuery.refetch()}
          />
        ) : (
          <GoogleCalendarStatusPanel
            onCalendarModalOpen={openCalendarModal}
            onConnect={() => void connectGoogleCalendar()}
            onDisconnectModalOpen={openDisconnectModal}
            isConnectPending={startConnectMutation.isPending}
            status={status}
          />
        )}

        {actionError ? (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
            {actionError}
          </p>
        ) : null}
      </div>

      <CalendarSelectionModal
        calendars={calendars}
        errorMessage={selectionError}
        isLoading={calendarsQuery.isLoading || calendarsQuery.isFetching}
        isPending={updateSelectionMutation.isPending}
        onClose={() => setCalendarModalOpen(false)}
        onSave={() => void saveCalendarSelection()}
        onToggle={toggleCalendar}
        open={calendarModalOpen}
        selectedCalendarIds={selectedCalendarIds}
      />
      <DisconnectGoogleCalendarModal
        action={disconnectAction}
        errorMessage={actionError}
        isPending={disconnectMutation.isPending}
        onActionChange={setDisconnectAction}
        onClose={() => setDisconnectModalOpen(false)}
        onConfirm={() => void disconnectGoogleCalendar()}
        open={disconnectModalOpen}
      />
    </section>
  );
}

function SettingsHeader() {
  return (
    <div className="flex items-start gap-3">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#EAF2FF] text-[#1D4ED8]">
        <CalendarDays className="h-4 w-4" strokeWidth={1.8} />
      </span>
      <div className="min-w-0">
        <h2 className="text-[15px] font-semibold text-[#111827]">
          Google Calendar
        </h2>
        <p className="mt-0.5 text-[12px] text-[#64748B]">
          계정 연결, 캘린더 선택, 연결 해제를 관리합니다.
        </p>
      </div>
    </div>
  );
}

function GoogleCalendarStatusPanel({
  status,
  isConnectPending,
  onConnect,
  onCalendarModalOpen,
  onDisconnectModalOpen,
}: {
  readonly status: GoogleCalendarStatusResponse | undefined;
  readonly isConnectPending: boolean;
  readonly onConnect: () => void;
  readonly onCalendarModalOpen: () => void;
  readonly onDisconnectModalOpen: () => void;
}) {
  const connection = status?.connection ?? null;
  const connected = connection?.status === "CONNECTED";
  const reconnectRequired = connection?.status === "RECONNECT_REQUIRED";

  return (
    <div className="grid gap-4">
      <dl className="grid gap-3 md:grid-cols-2">
        <StatusField
          icon={Settings2}
          label="상태"
          value={
            connected ? "연결됨" : reconnectRequired ? "재연결 필요" : "연결 안 됨"
          }
        />
        <StatusField
          icon={CalendarDays}
          label="계정"
          value={connection?.providerAccountEmail ?? "-"}
        />
        <StatusField
          icon={Check}
          label="선택 캘린더"
          value={`${status?.selectedCalendarCount ?? 0}/${status?.availableCalendarCount ?? 0}개`}
        />
        <StatusField
          icon={CalendarDays}
          label="마지막 동기화"
          value={formatDateTime(connection?.lastSyncedAt, {
            fallback: "동기화 전",
            includeYear: true,
          })}
        />
      </dl>

      <div className="flex flex-wrap justify-end gap-2">
        {connected ? (
          <>
            <Button
              onClick={onCalendarModalOpen}
              size="sm"
              type="button"
              variant="secondary"
            >
              <Settings2 className="h-3.5 w-3.5" />
              캘린더 선택
            </Button>
            <Button
              onClick={onDisconnectModalOpen}
              size="sm"
              type="button"
              variant="danger"
            >
              <Unlink className="h-3.5 w-3.5" />
              연결 해제
            </Button>
          </>
        ) : (
          <Button
            isPending={isConnectPending}
            onClick={onConnect}
            size="sm"
            type="button"
            variant="primary"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            {reconnectRequired ? "재연결" : "연결"}
          </Button>
        )}
      </div>
    </div>
  );
}

function StatusField({
  icon: Icon,
  label,
  value,
}: {
  readonly icon: typeof CalendarDays;
  readonly label: string;
  readonly value: string;
}) {
  return (
    <div className="rounded-md border border-[#E2E5EC] bg-white px-3 py-3">
      <dt className="flex items-center gap-2 text-xs font-medium text-[#64748B]">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </dt>
      <dd className="mt-1 truncate text-sm font-semibold text-[#111827]">
        {value}
      </dd>
    </div>
  );
}

function CalendarSelectionModal({
  open,
  calendars,
  selectedCalendarIds,
  isLoading,
  isPending,
  errorMessage,
  onClose,
  onToggle,
  onSave,
}: {
  readonly open: boolean;
  readonly calendars: GoogleCalendarSource[];
  readonly selectedCalendarIds: string[];
  readonly isLoading: boolean;
  readonly isPending: boolean;
  readonly errorMessage: string | null;
  readonly onClose: () => void;
  readonly onToggle: (calendarId: string) => void;
  readonly onSave: () => void;
}) {
  const selectedSet = useMemo(
    () => new Set(selectedCalendarIds),
    [selectedCalendarIds],
  );

  return (
    <ModalShell
      bodyClassName="px-4 py-4 sm:px-6"
      footer={
        <>
          <Button disabled={isPending} onClick={onClose} type="button">
            닫기
          </Button>
          <Button
            disabled={isPending}
            isPending={isPending}
            onClick={onSave}
            type="button"
            variant="primary"
          >
            저장
          </Button>
        </>
      }
      onOpenChange={onClose}
      open={open}
      placement="bottom"
      size="lg"
      title="캘린더 선택"
    >
      <div className="grid gap-3">
        <p className="text-[13px] leading-5 text-[#64748B]">
          기존 일정은 삭제하지 않고 기본 화면에서 숨겨집니다.
        </p>
        {errorMessage ? (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
            {errorMessage}
          </p>
        ) : null}

        {isLoading ? (
          <GoogleCalendarSettingsSkeleton />
        ) : calendars.length === 0 ? (
          <p className="rounded-md border border-dashed border-[#CBD5E1] bg-[#F8FAFC] px-3 py-4 text-sm text-[#64748B]">
            선택할 캘린더가 없습니다.
          </p>
        ) : (
          <div className="max-h-[56vh] overflow-y-auto rounded-md border border-[#E2E5EC]">
            {calendars.map((calendar) => (
              <CalendarOption
                calendar={calendar}
                checked={selectedSet.has(calendar.calendarId)}
                key={calendar.id}
                onToggle={onToggle}
              />
            ))}
          </div>
        )}
      </div>
    </ModalShell>
  );
}

function CalendarOption({
  calendar,
  checked,
  onToggle,
}: {
  readonly calendar: GoogleCalendarSource;
  readonly checked: boolean;
  readonly onToggle: (calendarId: string) => void;
}) {
  return (
    <label className="flex min-w-0 cursor-pointer items-start gap-3 border-b border-[#E2E5EC] px-3 py-3 last:border-b-0 hover:bg-[#F8FAFC]">
      <input
        checked={checked}
        className="mt-1 h-4 w-4 shrink-0 rounded border-[#CBD5E1]"
        onChange={() => onToggle(calendar.calendarId)}
        type="checkbox"
      />
      <span className="min-w-0 flex-1">
        <span className="flex min-w-0 flex-wrap items-center gap-2">
          <span className="min-w-0 break-words text-sm font-semibold text-[#111827]">
            {calendar.calendarName}
          </span>
          {calendar.isPrimary ? <CalendarLabel>기본</CalendarLabel> : null}
          {calendar.isSystemCalendar ? <CalendarLabel>시스템</CalendarLabel> : null}
        </span>
        <span className="mt-1 block break-all text-[12px] text-[#64748B]">
          {calendar.calendarId}
          {calendar.calendarTimeZone ? ` · ${calendar.calendarTimeZone}` : ""}
        </span>
      </span>
    </label>
  );
}

function CalendarLabel({ children }: { readonly children: string }) {
  return (
    <span className="inline-flex h-5 shrink-0 items-center rounded-md border border-[#CBD5E1] bg-[#F8FAFC] px-1.5 text-[11px] font-semibold text-[#475569]">
      {children}
    </span>
  );
}

function DisconnectGoogleCalendarModal({
  open,
  action,
  isPending,
  errorMessage,
  onActionChange,
  onClose,
  onConfirm,
}: {
  readonly open: boolean;
  readonly action: GoogleCalendarDisconnectScheduleAction;
  readonly isPending: boolean;
  readonly errorMessage: string | null;
  readonly onActionChange: (action: GoogleCalendarDisconnectScheduleAction) => void;
  readonly onClose: () => void;
  readonly onConfirm: () => void;
}) {
  return (
    <ModalShell
      footer={
        <>
          <Button disabled={isPending} onClick={onClose} type="button">
            닫기
          </Button>
          <Button
            disabled={isPending}
            isPending={isPending}
            onClick={onConfirm}
            type="button"
            variant="danger"
          >
            연결 해제
          </Button>
        </>
      }
      onOpenChange={onClose}
      open={open}
      placement="bottom"
      size="md"
      title="연결 해제"
    >
      <div className="grid gap-3">
        {disconnectActions.map((option) => (
          <label
            className={`flex cursor-pointer items-start gap-3 rounded-md border px-3 py-3 transition ${
              action === option.value
                ? "border-[#93C5FD] bg-[#EFF6FF]"
                : "border-[#E2E5EC] bg-white hover:bg-[#F8FAFC]"
            }`}
            key={option.value}
          >
            <input
              checked={action === option.value}
              className="mt-1 h-4 w-4 shrink-0"
              onChange={() => onActionChange(option.value)}
              type="radio"
            />
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-[#111827]">
                {option.label}
              </span>
              <span className="mt-1 block text-[12px] leading-5 text-[#64748B]">
                {option.description}
              </span>
            </span>
          </label>
        ))}
        {errorMessage ? (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
            {errorMessage}
          </p>
        ) : null}
      </div>
    </ModalShell>
  );
}

function InlineError({
  error,
  onRetry,
}: {
  readonly error: unknown;
  readonly onRetry: () => void;
}) {
  return (
    <div className="grid justify-items-start gap-3 rounded-md border border-destructive/30 bg-red-50 px-4 py-3">
      <div className="flex items-start gap-2">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
        <p className="text-sm text-destructive">{getApiErrorMessage(error)}</p>
      </div>
      <Button onClick={onRetry} size="sm" type="button">
        다시 시도
      </Button>
    </div>
  );
}

function GoogleCalendarSettingsSkeleton() {
  return (
    <div className="grid gap-3">
      {Array.from({ length: 4 }).map((_, index) => (
        <div className="h-12 animate-pulse rounded-md bg-muted" key={index} />
      ))}
    </div>
  );
}
