import {
  Bell,
  BellRing,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  MonitorSmartphone,
  Save,
  Settings,
  ShieldCheck,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { BrowserPushPermissionDialog } from "@/features/notification/components/browser-push-permission-dialog";
import {
  useCreateBrowserPushSubscriptionMutation,
  useMarkNotificationReadMutation,
  useRevokeBrowserPushSubscriptionMutation,
  useUpdateNotificationSettingsMutation,
} from "@/features/notification/hooks/use-notification-mutations";
import {
  useBrowserPushPublicKey,
  useNotificationList,
  useNotificationSettings,
} from "@/features/notification/hooks/use-notification-queries";
import type {
  BrowserPushPermissionRequest,
  BrowserPushPermissionState,
  NotificationItem,
  NotificationReadFilter,
  UserNotificationSetting,
} from "@/features/notification/types/notification";
import {
  emitMobilePushPermissionClientEvent,
  getBrowserPushPermission,
  getBrowserPushPermissionLabel,
  getStoredBrowserPushSubscriptionId,
  isBrowserPushSupported,
  removeStoredBrowserPushSubscriptionId,
  storeBrowserPushSubscriptionId,
  toBrowserPushSubscriptionInput,
  urlBase64ToUint8Array,
} from "@/features/notification/utils/browser-push-permission";
import { getApiErrorMessage } from "@/lib/api-client";
import { formatDateWithOptions } from "@/utils/format";

const PAGE_SIZE = 15;

const filterOptions: readonly {
  readonly value: NotificationReadFilter;
  readonly label: string;
}[] = [
  { value: "ALL", label: "전체" },
  { value: "UNREAD", label: "안읽음" },
  { value: "READ", label: "읽음" },
];

// 기능 : 알림 목록, 서비스 설정, 모바일 browser push 권한 UX를 렌더링합니다.
export function NotificationScreen() {
  const [read, setRead] = useState<NotificationReadFilter>("ALL");
  const [includeUpcoming, setIncludeUpcoming] = useState(false);
  const [page, setPage] = useState(1);
  const [settingsDraft, setSettingsDraft] =
    useState<UserNotificationSetting | null>(null);
  const [permissionState, setPermissionState] =
    useState<BrowserPushPermissionState>("unsupported");
  const [isPermissionDialogOpen, setIsPermissionDialogOpen] = useState(false);
  const [isPermissionFlowPending, setIsPermissionFlowPending] = useState(false);
  const [pushNotice, setPushNotice] = useState<string | null>(null);
  const [storedSubscriptionId, setStoredSubscriptionId] = useState("");
  const notificationListQuery = useNotificationList({
    page,
    pageSize: PAGE_SIZE,
    read,
    includeUpcoming,
  });
  const notificationTotalPages = Math.ceil(
    (notificationListQuery.data?.totalCount ?? 0) /
      (notificationListQuery.data?.pageSize ?? PAGE_SIZE)
  );
  const settingsQuery = useNotificationSettings();
  const settings = settingsDraft ?? settingsQuery.data ?? null;
  const pushSupported = useMemo(() => isBrowserPushSupported(), []);
  const publicKeyQuery = useBrowserPushPublicKey(pushSupported);
  const markReadMutation = useMarkNotificationReadMutation();
  const updateSettingsMutation = useUpdateNotificationSettingsMutation();
  const createSubscriptionMutation = useCreateBrowserPushSubscriptionMutation();
  const revokeSubscriptionMutation = useRevokeBrowserPushSubscriptionMutation();
  const actionError =
    notificationListQuery.error ??
    settingsQuery.error ??
    markReadMutation.error ??
    updateSettingsMutation.error ??
    createSubscriptionMutation.error ??
    revokeSubscriptionMutation.error ??
    null;
  const publicKey = publicKeyQuery.data?.publicKey ?? "";

  useEffect(() => {
    setPage(1);
  }, [includeUpcoming, read]);

  useEffect(() => {
    if (settingsQuery.data) {
      setSettingsDraft(settingsQuery.data);
    }
  }, [settingsQuery.data]);

  useEffect(() => {
    setPermissionState(getBrowserPushPermission());
    setStoredSubscriptionId(getStoredBrowserPushSubscriptionId());
  }, []);

  // 기능 : 읽지 않은 알림을 읽음 상태로 변경합니다.
  const onMarkRead = async (notification: NotificationItem) => {
    if (notification.readAt) {
      return;
    }

    await markReadMutation.mutateAsync(notification.id);
  };

  // 기능 : 서비스 알림 설정을 기존 notification settings API로 저장합니다.
  const onSaveSettings = async () => {
    if (!settings) {
      return;
    }

    const nextSettings = await updateSettingsMutation.mutateAsync({
      scheduleReminderEnabled: settings.scheduleReminderEnabled,
      dealDueReminderEnabled: settings.dealDueReminderEnabled,
      emailNotificationEnabled: settings.emailNotificationEnabled,
    });
    setSettingsDraft(nextSettings);
    setPushNotice("알림 설정을 저장했어요.");
  };

  // 기능 : 사용자의 첫 번째 명시 클릭으로 browser push 권한 안내 dialog를 엽니다.
  const onOpenBrowserPushPermissionDialog = () => {
    setPushNotice(null);

    if (!pushSupported || !("Notification" in window)) {
      setPermissionState("unsupported");
      emitMobilePushPermissionClientEvent({
        eventName: "mobile_push_permission_result",
        eventVersion: 1,
        payload: {
          browserPushEnabled: settings?.browserPushEnabled ?? false,
          permissionState: "unsupported",
        },
      });
      return;
    }

    emitMobilePushPermissionClientEvent({
      eventName: "mobile_push_permission_prompt_opened",
      eventVersion: 1,
      payload: {
        entryPoint: "notifications",
      },
    });
    setIsPermissionDialogOpen(true);
  };

  // 기능 : dialog의 계속 클릭 이후에만 browser permission prompt와 구독 등록을 진행합니다.
  const onConfirmBrowserPushPermission = async (
    request: BrowserPushPermissionRequest = { trigger: "USER_CLICK" }
  ) => {
    if (request.trigger !== "USER_CLICK") {
      return;
    }

    setIsPermissionFlowPending(true);
    setPushNotice(null);

    try {
      if (!pushSupported || !("Notification" in window)) {
        setPermissionState("unsupported");
        setPushNotice("이 브라우저에서는 푸시 알림을 사용할 수 없어요.");
        setIsPermissionDialogOpen(false);
        emitMobilePushPermissionClientEvent({
          eventName: "mobile_push_permission_result",
          eventVersion: 1,
          payload: {
            browserPushEnabled: settings?.browserPushEnabled ?? false,
            permissionState: "unsupported",
          },
        });
        return;
      }

      const permission = await window.Notification.requestPermission();
      setPermissionState(permission);

      if (permission !== "granted") {
        const nextNotice =
          permission === "denied"
            ? "브라우저에서 알림이 차단되어 있어요. 기기 설정에서 권한을 바꾼 뒤 다시 시도해 주세요."
            : "권한 요청을 닫았어요. 필요할 때 다시 켤 수 있어요.";

        setPushNotice(nextNotice);
        setIsPermissionDialogOpen(false);
        emitMobilePushPermissionClientEvent({
          eventName: "mobile_push_permission_result",
          eventVersion: 1,
          payload: {
            browserPushEnabled: settings?.browserPushEnabled ?? false,
            permissionState: permission,
          },
        });
        return;
      }

      const refetchedPublicKey =
        publicKey || (await publicKeyQuery.refetch()).data?.publicKey;
      const resolvedPublicKey = refetchedPublicKey ?? "";

      if (!resolvedPublicKey) {
        setPushNotice("브라우저 푸시 서버 설정을 가져오지 못했어요.");
        setIsPermissionDialogOpen(false);
        return;
      }

      const registration = await navigator.serviceWorker.register(
        "/notification-sw.js"
      );
      const existingSubscription =
        await registration.pushManager.getSubscription();

      if (existingSubscription) {
        await existingSubscription.unsubscribe();
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(resolvedPublicKey),
      });
      const payload = toBrowserPushSubscriptionInput(subscription);
      const response = await createSubscriptionMutation.mutateAsync(payload);

      storeBrowserPushSubscriptionId(response.id);
      setStoredSubscriptionId(response.id);
      setSettingsDraft((current) =>
        current ? { ...current, browserPushEnabled: true } : current
      );
      setIsPermissionDialogOpen(false);
      setPushNotice("브라우저 푸시 구독을 등록했어요.");
      emitMobilePushPermissionClientEvent({
        eventName: "mobile_push_permission_result",
        eventVersion: 1,
        payload: {
          browserPushEnabled: true,
          permissionState: "granted",
        },
      });
    } finally {
      setIsPermissionFlowPending(false);
    }
  };

  // 기능 : 현재 기기의 browser push 구독을 해제하고 서버 설정을 갱신합니다.
  const onRevokeBrowserPush = async () => {
    setPushNotice(null);

    const registration =
      (await navigator.serviceWorker.getRegistration("/notification-sw.js")) ??
      null;
    const subscription = registration
      ? await registration.pushManager.getSubscription()
      : null;

    if (subscription) {
      await subscription.unsubscribe();
    }

    if (storedSubscriptionId) {
      await revokeSubscriptionMutation.mutateAsync(storedSubscriptionId);
    }

    removeStoredBrowserPushSubscriptionId();
    setStoredSubscriptionId("");
    setSettingsDraft((current) =>
      current ? { ...current, browserPushEnabled: false } : current
    );
    setPushNotice("브라우저 푸시 구독을 해제했어요.");
  };

  return (
    <section className="mx-auto grid max-w-[1500px] gap-5 px-5 py-6">
      <header className="flex flex-col gap-2 border-b pb-5">
        <h1 className="text-2xl font-semibold">알림</h1>
        <p className="text-sm text-muted-foreground">
          일정 시작과 딜 마감 reminder를 확인하고 관련 기록으로 바로 이동해요.
        </p>
      </header>

      {pushNotice ? (
        <NoticeMessage message={pushNotice} onDismiss={() => setPushNotice(null)} />
      ) : null}

      {actionError ? <ErrorMessage message={getApiErrorMessage(actionError)} /> : null}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(340px,0.85fr)]">
        <section className="grid content-start gap-4 rounded-lg border bg-white p-4">
          <NotificationListHeader
            currentRead={read}
            includeUpcoming={includeUpcoming}
            isFetching={notificationListQuery.isFetching}
            onIncludeUpcomingChange={setIncludeUpcoming}
            onReadChange={setRead}
            unreadCount={notificationListQuery.data?.unreadCount ?? 0}
          />

          <NotificationList
            isLoading={notificationListQuery.isLoading}
            items={notificationListQuery.data?.items ?? []}
            onMarkRead={(notification) => void onMarkRead(notification)}
            pendingNotificationId={
              markReadMutation.isPending
                ? markReadMutation.variables ?? null
                : null
            }
          />

          <PaginationControls
            page={page}
            totalCount={notificationListQuery.data?.totalCount ?? 0}
            totalPages={notificationTotalPages}
            onNext={() => setPage((current) => current + 1)}
            onPrev={() => setPage((current) => Math.max(1, current - 1))}
          />
        </section>

        <section className="grid content-start gap-4 rounded-lg border bg-white p-4">
          <NotificationSettingsPanel
            isPending={updateSettingsMutation.isPending}
            settings={settings}
            onChange={setSettingsDraft}
            onSave={() => void onSaveSettings()}
          />

          <BrowserPushPanel
            hasPublicKeyError={publicKeyQuery.isError}
            isPermissionFlowPending={
              isPermissionFlowPending || createSubscriptionMutation.isPending
            }
            isRevoking={revokeSubscriptionMutation.isPending}
            browserPushEnabled={settings?.browserPushEnabled ?? false}
            permissionState={permissionState}
            pushSupported={pushSupported}
            storedSubscriptionId={storedSubscriptionId}
            onEnable={() => onOpenBrowserPushPermissionDialog()}
            onRevoke={() => void onRevokeBrowserPush()}
          />
        </section>
      </div>

      <BrowserPushPermissionDialog
        isPending={isPermissionFlowPending || createSubscriptionMutation.isPending}
        onConfirm={() => void onConfirmBrowserPushPermission()}
        onOpenChange={setIsPermissionDialogOpen}
        open={isPermissionDialogOpen}
      />
    </section>
  );
}

type NotificationListHeaderProps = {
  readonly currentRead: NotificationReadFilter;
  readonly includeUpcoming: boolean;
  readonly isFetching: boolean;
  readonly unreadCount: number;
  readonly onIncludeUpcomingChange: (includeUpcoming: boolean) => void;
  readonly onReadChange: (read: NotificationReadFilter) => void;
};

// 기능 : 알림 목록 필터와 안읽음 개수 요약을 렌더링합니다.
function NotificationListHeader({
  currentRead,
  includeUpcoming,
  isFetching,
  unreadCount,
  onIncludeUpcomingChange,
  onReadChange,
}: NotificationListHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
          <BellRing className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-base font-semibold">알림 목록</h2>
          <p className="text-sm text-muted-foreground">안읽음 {unreadCount}개</p>
        </div>
        {isFetching ? (
          <Loader2
            className="h-4 w-4 animate-spin text-muted-foreground"
            aria-hidden="true"
          />
        ) : null}
      </div>

      <div className="flex flex-col gap-2 sm:items-end">
        <div className="grid grid-cols-3 rounded-lg border bg-slate-50 p-1 text-sm">
          {filterOptions.map((option) => (
            <button
              key={option.value}
              className={`min-h-9 rounded-md px-3 font-semibold ${
                currentRead === option.value
                  ? "bg-white text-primary shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              type="button"
              onClick={() => onReadChange(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
        <label className="inline-flex items-center gap-2 text-sm text-muted-foreground">
          <input
            checked={includeUpcoming}
            className="h-4 w-4"
            type="checkbox"
            onChange={(event) =>
              onIncludeUpcomingChange(event.target.checked)
            }
          />
          예정 알림 포함
        </label>
      </div>
    </div>
  );
}

type NotificationListProps = {
  readonly isLoading: boolean;
  readonly items: readonly NotificationItem[];
  readonly pendingNotificationId: string | null;
  readonly onMarkRead: (notification: NotificationItem) => void;
};

// 기능 : 알림 목록의 loading, empty, row 상태를 렌더링합니다.
function NotificationList({
  isLoading,
  items,
  pendingNotificationId,
  onMarkRead,
}: NotificationListProps) {
  if (isLoading) {
    return (
      <div className="grid min-h-[260px] place-items-center rounded-lg border border-dashed text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          불러오는 중
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="grid min-h-[260px] place-items-center rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
        새 알림이 생기면 여기에서 볼 수 있어요.
      </div>
    );
  }

  return (
    <div className="grid gap-2">
      {items.map((notification) => (
        <NotificationRow
          key={notification.id}
          isPending={pendingNotificationId === notification.id}
          notification={notification}
          onMarkRead={() => onMarkRead(notification)}
        />
      ))}
    </div>
  );
}

type NotificationRowProps = {
  readonly isPending: boolean;
  readonly notification: NotificationItem;
  readonly onMarkRead: () => void;
};

// 기능 : 단일 알림 row와 관련 기록 이동/읽음 action을 렌더링합니다.
function NotificationRow({
  isPending,
  notification,
  onMarkRead,
}: NotificationRowProps) {
  const isUnread = notification.readAt === null;

  return (
    <article
      className={`grid gap-3 rounded-lg border p-4 ${
        isUnread ? "border-primary/40 bg-primary/5" : "border-slate-200 bg-white"
      }`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="break-words text-sm font-semibold">
              {notification.title}
            </h3>
            <TypeBadge type={notification.type} />
            <SourceBadge sourceType={notification.sourceType} />
            <StatusBadge notification={notification} />
          </div>
          {notification.body ? (
            <p className="mt-1 break-words text-sm text-muted-foreground">
              {notification.body}
            </p>
          ) : null}
          {notification.targetLabel ? (
            <p className="mt-1 text-xs font-medium text-slate-500">
              관련 기록: {notification.targetLabel}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2 sm:justify-end">
          <Link
            className="inline-flex min-h-9 items-center justify-center rounded-md border px-3 py-1.5 text-sm font-semibold hover:bg-muted"
            to={notification.targetPath}
          >
            관련 기록 열기
          </Link>
          <button
            className="inline-flex min-h-9 items-center justify-center gap-2 rounded-md border px-3 py-1.5 text-sm font-semibold hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
            disabled={!isUnread || isPending}
            type="button"
            onClick={onMarkRead}
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Check className="h-4 w-4" aria-hidden="true" />
            )}
            읽음
          </button>
        </div>
      </div>

      <dl className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-3">
        <InfoItem
          label="예정"
          value={formatDateWithOptions(notification.scheduledAt, {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        />
        <InfoItem
          label="발송"
          value={
            notification.sentAt
              ? formatDateWithOptions(notification.sentAt, {
                  dateStyle: "medium",
                  timeStyle: "short",
                })
              : "-"
          }
        />
        <InfoItem
          label="읽음"
          value={
            notification.readAt
              ? formatDateWithOptions(notification.readAt, {
                  dateStyle: "medium",
                  timeStyle: "short",
                })
              : "-"
          }
        />
      </dl>
    </article>
  );
}

type NotificationSettingsPanelProps = {
  readonly isPending: boolean;
  readonly settings: UserNotificationSetting | null;
  readonly onChange: (settings: UserNotificationSetting) => void;
  readonly onSave: () => void;
};

// 기능 : 서비스 알림 설정과 마케팅 알림 분리 안내를 렌더링합니다.
function NotificationSettingsPanel({
  isPending,
  settings,
  onChange,
  onSave,
}: NotificationSettingsPanelProps) {
  const resolvedSettings: UserNotificationSetting = {
    scheduleReminderEnabled: settings?.scheduleReminderEnabled ?? true,
    dealDueReminderEnabled: settings?.dealDueReminderEnabled ?? true,
    emailNotificationEnabled: settings?.emailNotificationEnabled ?? true,
    browserPushEnabled: settings?.browserPushEnabled ?? false,
    scheduleReminderMinutes: settings?.scheduleReminderMinutes ?? 30,
    dealDueReminderDaysBefore: settings?.dealDueReminderDaysBefore ?? 1,
    dealDueReminderLocalTime: settings?.dealDueReminderLocalTime ?? "09:00",
  };

  return (
    <div className="grid gap-4">
      <div className="flex items-center gap-2">
        <Settings className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
        <h2 className="text-base font-semibold">서비스 알림</h2>
      </div>

      <div className="grid gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
        <span className="font-medium">기본 reminder 시간</span>
        <span className="text-xs text-muted-foreground">
          일정은 시작 {resolvedSettings.scheduleReminderMinutes}분 전, 딜은 마감{" "}
          {resolvedSettings.dealDueReminderDaysBefore}일 전{" "}
          {resolvedSettings.dealDueReminderLocalTime}에 알려줘요.
        </span>
      </div>

      <label className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
        <input
          checked={resolvedSettings.scheduleReminderEnabled}
          className="mt-1 h-4 w-4"
          type="checkbox"
          onChange={(event) =>
            onChange({
              ...resolvedSettings,
              scheduleReminderEnabled: event.target.checked,
            })
          }
        />
        <span className="grid gap-1">
          <span className="text-sm font-semibold">일정 시작 알림</span>
          <span className="text-xs text-muted-foreground">
            일정 시작 전에 앱 안 알림을 만들어요.
          </span>
        </span>
      </label>

      <label className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
        <input
          checked={resolvedSettings.dealDueReminderEnabled}
          className="mt-1 h-4 w-4"
          type="checkbox"
          onChange={(event) =>
            onChange({
              ...resolvedSettings,
              dealDueReminderEnabled: event.target.checked,
            })
          }
        />
        <span className="grid gap-1">
          <span className="text-sm font-semibold">딜 마감 알림</span>
          <span className="text-xs text-muted-foreground">
            마감일이 가까운 딜을 업무 reminder로 보여줘요.
          </span>
        </span>
      </label>

      <label className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
        <input
          checked={resolvedSettings.emailNotificationEnabled}
          className="mt-1 h-4 w-4"
          type="checkbox"
          onChange={(event) =>
            onChange({
              ...resolvedSettings,
              emailNotificationEnabled: event.target.checked,
            })
          }
        />
        <span className="grid gap-1">
          <span className="text-sm font-semibold">이메일 알림</span>
          <span className="text-xs text-muted-foreground">
            이메일 발송 대상에 포함해요.
          </span>
        </span>
      </label>

      <div className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-3">
        <ShieldCheck
          className="mt-0.5 h-4 w-4 shrink-0 text-slate-500"
          aria-hidden="true"
        />
        <span className="grid gap-1">
          <span className="text-sm font-semibold">마케팅 알림</span>
          <span className="text-xs leading-5 text-muted-foreground">
            광고성 알림은 별도 동의가 필요해요. 여기서는 회의와 딜 같은
            서비스 알림만 설정해요.
          </span>
        </span>
      </div>

      <button
        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isPending || settings === null}
        type="button"
        onClick={onSave}
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          <Save className="h-4 w-4" aria-hidden="true" />
        )}
        저장
      </button>
    </div>
  );
}

type BrowserPushPanelProps = {
  readonly browserPushEnabled: boolean;
  readonly hasPublicKeyError: boolean;
  readonly isPermissionFlowPending: boolean;
  readonly isRevoking: boolean;
  readonly permissionState: BrowserPushPermissionState;
  readonly pushSupported: boolean;
  readonly storedSubscriptionId: string;
  readonly onEnable: () => void;
  readonly onRevoke: () => void;
};

// 기능 : browser push 권한과 구독 상태를 서비스 알림 설정과 분리해 안내합니다.
function BrowserPushPanel({
  browserPushEnabled,
  hasPublicKeyError,
  isPermissionFlowPending,
  isRevoking,
  permissionState,
  pushSupported,
  storedSubscriptionId,
  onEnable,
  onRevoke,
}: BrowserPushPanelProps) {
  const isRegisteredOnThisDevice = Boolean(storedSubscriptionId);
  const canOpenPermissionDialog = pushSupported && permissionState !== "denied";
  const shouldShowMismatch =
    browserPushEnabled &&
    (!isRegisteredOnThisDevice || permissionState !== "granted");

  return (
    <div className="grid gap-4 border-t pt-4">
      <div className="flex items-center gap-2">
        <MonitorSmartphone
          className="h-5 w-5 text-muted-foreground"
          aria-hidden="true"
        />
        <h2 className="text-base font-semibold">브라우저 푸시</h2>
      </div>

      <div className="grid gap-2 text-sm">
        <InfoItem
          label="권한"
          value={getBrowserPushPermissionLabel(permissionState)}
        />
        <InfoItem
          label="이 기기"
          value={isRegisteredOnThisDevice ? "등록됨" : "미등록"}
        />
      </div>

      <div className="grid gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
        <span className="font-semibold text-slate-800">서비스성 푸시 알림</span>
        <span>
          회의 리마인더와 딜 마감 알림을 이 브라우저로 받아요. 광고성
          알림은 별도 동의가 필요해요.
        </span>
      </div>

      {hasPublicKeyError ? (
        <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
          브라우저 푸시 서버 설정을 가져오지 못했어요.
        </p>
      ) : null}

      {!pushSupported ? (
        <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
          이 브라우저에서는 푸시 알림을 사용할 수 없어요.
        </p>
      ) : null}

      {permissionState === "denied" ? (
        <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
          브라우저에서 알림이 차단되어 있어요. 기기 설정에서 권한을 바꾼
          뒤 다시 시도해 주세요.
        </p>
      ) : null}

      {permissionState === "default" ? (
        <p className="rounded-lg bg-slate-50 p-3 text-sm text-muted-foreground">
          아직 이 브라우저에서 권한을 선택하지 않았어요.
        </p>
      ) : null}

      {permissionState === "granted" && !isRegisteredOnThisDevice ? (
        <p className="rounded-lg bg-slate-50 p-3 text-sm text-muted-foreground">
          권한은 허용됐어요. 이 기기에 구독을 등록하면 알림을 받을 수
          있어요.
        </p>
      ) : null}

      {permissionState === "granted" && isRegisteredOnThisDevice ? (
        <p className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">
          이 기기에서 푸시 알림을 받을 수 있어요.
        </p>
      ) : null}

      {shouldShowMismatch ? (
        <p className="rounded-lg bg-blue-50 p-3 text-sm text-blue-800">
          서비스 설정은 켜져 있지만 이 브라우저 권한이나 기기 구독은 아직
          준비되지 않았어요.
        </p>
      ) : null}

      <button
        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-[#4880EE] bg-[#4880EE] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1F4EF5] disabled:cursor-not-allowed disabled:opacity-60"
        disabled={!canOpenPermissionDialog || isPermissionFlowPending}
        type="button"
        onClick={onEnable}
      >
        {isPermissionFlowPending ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          <Bell className="h-4 w-4" aria-hidden="true" />
        )}
        푸시 알림 켜기
      </button>

      <button
        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={!isRegisteredOnThisDevice || isRevoking}
        type="button"
        onClick={onRevoke}
      >
        {isRevoking ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          <X className="h-4 w-4" aria-hidden="true" />
        )}
        구독 해제
      </button>
    </div>
  );
}

type PaginationControlsProps = {
  readonly page: number;
  readonly totalCount: number;
  readonly totalPages: number;
  readonly onNext: () => void;
  readonly onPrev: () => void;
};

// 기능 : 알림 목록 page 이동 버튼과 현재 page 정보를 렌더링합니다.
function PaginationControls({
  page,
  totalCount,
  totalPages,
  onNext,
  onPrev,
}: PaginationControlsProps) {
  const safeTotalPages = Math.max(totalPages, 1);

  return (
    <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-sm text-muted-foreground">
        {totalCount}개 · {page} / {safeTotalPages}페이지
      </span>
      <div className="flex gap-2">
        <button
          className="inline-flex min-h-9 items-center justify-center gap-2 rounded-md border px-3 py-1.5 text-sm font-semibold hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
          disabled={page <= 1}
          type="button"
          onClick={onPrev}
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          이전
        </button>
        <button
          className="inline-flex min-h-9 items-center justify-center gap-2 rounded-md border px-3 py-1.5 text-sm font-semibold hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
          disabled={page >= safeTotalPages}
          type="button"
          onClick={onNext}
        >
          다음
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

type InfoItemProps = {
  readonly label: string;
  readonly value: string;
};

// 기능 : 알림 화면의 짧은 label-value 상태 정보를 렌더링합니다.
function InfoItem({ label, value }: InfoItemProps) {
  return (
    <div className="grid gap-1 rounded-md bg-slate-50 p-3">
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="break-words text-sm font-semibold text-foreground">{value}</dd>
    </div>
  );
}

// 기능 : 알림 읽음 상태 badge를 렌더링합니다.
function StatusBadge({
  notification,
}: {
  readonly notification: NotificationItem;
}) {
  const read = notification.readAt !== null;

  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-1 text-xs font-semibold ${
        read
          ? "border-slate-200 bg-slate-50 text-slate-600"
          : "border-primary/30 bg-primary/10 text-primary"
      }`}
    >
      {read ? "읽음" : "안읽음"}
    </span>
  );
}

// 기능 : 알림 type code를 사용자용 badge로 렌더링합니다.
function TypeBadge({ type }: { readonly type: NotificationItem["type"] }) {
  return (
    <span className="inline-flex items-center rounded-md border bg-white px-2 py-1 text-xs font-semibold text-slate-700">
      {getNotificationTypeLabel(type)}
    </span>
  );
}

// 기능 : 알림 source type code를 사용자용 badge로 렌더링합니다.
function SourceBadge({
  sourceType,
}: {
  readonly sourceType: NotificationItem["sourceType"];
}) {
  return (
    <span className="inline-flex items-center rounded-md border bg-white px-2 py-1 text-xs font-semibold text-slate-700">
      {getSourceTypeLabel(sourceType)}
    </span>
  );
}

// 기능 : 알림 type code를 화면 label로 변환합니다.
function getNotificationTypeLabel(type: NotificationItem["type"]) {
  switch (type) {
    case "SCHEDULE_START_REMINDER":
      return "일정 reminder";
    case "DEAL_DUE_REMINDER":
      return "딜 마감 reminder";
    default:
      return "알림";
  }
}

// 기능 : 알림 source type code를 화면 label로 변환합니다.
function getSourceTypeLabel(sourceType: NotificationItem["sourceType"]) {
  switch (sourceType) {
    case "SCHEDULE":
      return "일정";
    case "DEAL":
      return "딜";
    default:
      return "기록";
  }
}

type NoticeMessageProps = {
  readonly message: string;
  readonly onDismiss: () => void;
};

// 기능 : 알림 화면 상단의 성공/안내 메시지를 렌더링합니다.
function NoticeMessage({ message, onDismiss }: NoticeMessageProps) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
      <div className="flex items-start gap-2">
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <span>{message}</span>
      </div>
      <button
        aria-label="알림 닫기"
        className="rounded-md p-1 hover:bg-emerald-100"
        type="button"
        onClick={onDismiss}
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}

// 기능 : 알림 화면 상단의 오류 메시지를 렌더링합니다.
function ErrorMessage({ message }: { readonly message: string }) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
      {message}
    </div>
  );
}
