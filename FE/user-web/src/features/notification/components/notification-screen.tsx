import {
  Bell,
  BellRing,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Mail,
  MonitorSmartphone,
  Save,
  Settings,
  Smartphone,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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
  NotificationItem,
  NotificationReadFilter,
  UpdateNotificationSettingsInput,
  UserNotificationSetting,
} from "@/features/notification/types/notification";
import { getApiErrorMessage } from "@/lib/api-client";
import { formatDateWithOptions } from "@/utils/format";

const PAGE_SIZE = 10;
const PUSH_SUBSCRIPTION_ID_KEY = "onehand.sales.browserPushSubscriptionId";

const filterOptions: readonly {
  readonly value: NotificationReadFilter;
  readonly label: string;
}[] = [
  { value: "ALL", label: "전체" },
  { value: "UNREAD", label: "안읽음" },
  { value: "READ", label: "읽음" },
];

export function NotificationScreen() {
  const [status, setStatus] = useState<NotificationReadFilter>("ALL");
  const [page, setPage] = useState(1);
  const [settingsDraft, setSettingsDraft] =
    useState<UpdateNotificationSettingsInput | null>(null);
  const [permissionState, setPermissionState] =
    useState<NotificationPermission | "unsupported">("unsupported");
  const [pushNotice, setPushNotice] = useState<string | null>(null);
  const [storedSubscriptionId, setStoredSubscriptionId] = useState("");
  const notificationListQuery = useNotificationList({
    page,
    pageSize: PAGE_SIZE,
    status,
  });
  const notificationTotalPages = Math.ceil(
    (notificationListQuery.data?.totalCount ?? 0) / PAGE_SIZE
  );
  const settingsQuery = useNotificationSettings();
  const publicKeyQuery = useBrowserPushPublicKey();
  const markReadMutation = useMarkNotificationReadMutation();
  const updateSettingsMutation = useUpdateNotificationSettingsMutation();
  const createSubscriptionMutation = useCreateBrowserPushSubscriptionMutation();
  const revokeSubscriptionMutation = useRevokeBrowserPushSubscriptionMutation();
  const settings = settingsDraft ?? settingsQuery.data ?? null;
  const actionError =
    notificationListQuery.error ??
    settingsQuery.error ??
    publicKeyQuery.error ??
    markReadMutation.error ??
    updateSettingsMutation.error ??
    createSubscriptionMutation.error ??
    revokeSubscriptionMutation.error ??
    null;
  const pushSupported = useMemo(() => isBrowserPushSupported(), []);
  const publicKey = publicKeyQuery.data?.publicKey ?? "";

  useEffect(() => {
    setPage(1);
  }, [status]);

  useEffect(() => {
    if (settingsQuery.data) {
      setSettingsDraft(settingsQuery.data);
    }
  }, [settingsQuery.data]);

  useEffect(() => {
    setPermissionState(getBrowserPushPermission());
    setStoredSubscriptionId(
      window.localStorage.getItem(PUSH_SUBSCRIPTION_ID_KEY) ?? ""
    );
  }, []);

  const onMarkRead = async (notification: NotificationItem) => {
    if (notification.readAt) {
      return;
    }

    await markReadMutation.mutateAsync(notification.id);
  };

  const onSaveSettings = async () => {
    if (!settings) {
      return;
    }

    const nextSettings = await updateSettingsMutation.mutateAsync(settings);
    setSettingsDraft(nextSettings);
    setPushNotice("알림 설정을 저장했습니다.");
  };

  const onRequestPermission = async () => {
    if (!pushSupported || !("Notification" in window)) {
      setPermissionState("unsupported");
      return;
    }

    const permission = await window.Notification.requestPermission();
    setPermissionState(permission);
  };

  const onSubscribeBrowserPush = async () => {
    setPushNotice(null);

    if (!pushSupported || !publicKey) {
      setPushNotice("브라우저 푸시를 사용할 수 없습니다.");
      return;
    }

    const permission = await window.Notification.requestPermission();
    setPermissionState(permission);

    if (permission !== "granted") {
      setPushNotice("브라우저 푸시 권한이 필요합니다.");
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
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    });
    const payload = toBrowserPushSubscriptionInput(subscription);
    const response = await createSubscriptionMutation.mutateAsync(payload);

    window.localStorage.setItem(PUSH_SUBSCRIPTION_ID_KEY, response.id);
    setStoredSubscriptionId(response.id);
    setPushNotice("브라우저 푸시 구독을 등록했습니다.");
  };

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

    window.localStorage.removeItem(PUSH_SUBSCRIPTION_ID_KEY);
    setStoredSubscriptionId("");
    setPushNotice("브라우저 푸시 구독을 해제했습니다.");
  };

  return (
    <section className="mx-auto grid max-w-[1500px] gap-5 px-5 py-6">
      <header className="flex flex-col gap-2 border-b pb-5">
        <h1 className="text-2xl font-semibold">알림</h1>
        <p className="text-sm text-muted-foreground">
          일정, 딜 마감, 다음 행동, 회의록 알림을 확인합니다.
        </p>
      </header>

      {pushNotice ? (
        <NoticeMessage message={pushNotice} onDismiss={() => setPushNotice(null)} />
      ) : null}

      {actionError ? <ErrorMessage message={getApiErrorMessage(actionError)} /> : null}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(340px,0.85fr)]">
        <section className="grid content-start gap-4 rounded-lg border bg-white p-4">
          <NotificationListHeader
            currentStatus={status}
            isFetching={notificationListQuery.isFetching}
            onStatusChange={setStatus}
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
            isPublicKeyReady={publicKey.length > 0}
            isRegistering={createSubscriptionMutation.isPending}
            isRevoking={revokeSubscriptionMutation.isPending}
            permissionState={permissionState}
            pushSupported={pushSupported}
            storedSubscriptionId={storedSubscriptionId}
            onRequestPermission={() => void onRequestPermission()}
            onRevoke={() => void onRevokeBrowserPush()}
            onSubscribe={() => void onSubscribeBrowserPush()}
          />
        </section>
      </div>
    </section>
  );
}

type NotificationListHeaderProps = {
  readonly currentStatus: NotificationReadFilter;
  readonly isFetching: boolean;
  readonly unreadCount: number;
  readonly onStatusChange: (status: NotificationReadFilter) => void;
};

function NotificationListHeader({
  currentStatus,
  isFetching,
  unreadCount,
  onStatusChange,
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

      <div className="grid grid-cols-3 rounded-lg border bg-slate-50 p-1 text-sm">
        {filterOptions.map((option) => (
          <button
            key={option.value}
            className={`min-h-9 rounded-md px-3 font-semibold ${
              currentStatus === option.value
                ? "bg-white text-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
            type="button"
            onClick={() => onStatusChange(option.value)}
          >
            {option.label}
          </button>
        ))}
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
        표시할 알림이 없습니다.
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
            <ChannelBadge channel={notification.channel} />
            <StatusBadge notification={notification} />
          </div>
          {notification.content ? (
            <p className="mt-1 break-words text-sm text-muted-foreground">
              {notification.content}
            </p>
          ) : null}
        </div>

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
  readonly settings: UpdateNotificationSettingsInput | null;
  readonly onChange: (settings: UpdateNotificationSettingsInput) => void;
  readonly onSave: () => void;
};

function NotificationSettingsPanel({
  isPending,
  settings,
  onChange,
  onSave,
}: NotificationSettingsPanelProps) {
  const resolvedSettings: UserNotificationSetting = {
    defaultReminderMinutes: settings?.defaultReminderMinutes ?? 30,
    emailNotificationEnabled: settings?.emailNotificationEnabled ?? true,
    browserPushEnabled: settings?.browserPushEnabled ?? true,
  };

  return (
    <div className="grid gap-4">
      <div className="flex items-center gap-2">
        <Settings className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
        <h2 className="text-base font-semibold">알림 설정</h2>
      </div>

      <label className="grid gap-2 text-sm">
        <span className="font-medium">기본 알림 시간</span>
        <input
          className="min-h-10 rounded-md border px-3 py-2"
          max={10080}
          min={0}
          type="number"
          value={resolvedSettings.defaultReminderMinutes}
          onChange={(event) =>
            onChange({
              ...resolvedSettings,
              defaultReminderMinutes: Number(event.target.value),
            })
          }
        />
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
            SMTP 발송 대상에 포함합니다.
          </span>
        </span>
      </label>

      <label className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
        <input
          checked={resolvedSettings.browserPushEnabled}
          className="mt-1 h-4 w-4"
          type="checkbox"
          onChange={(event) =>
            onChange({
              ...resolvedSettings,
              browserPushEnabled: event.target.checked,
            })
          }
        />
        <span className="grid gap-1">
          <span className="text-sm font-semibold">브라우저 푸시</span>
          <span className="text-xs text-muted-foreground">
            등록된 브라우저 구독에 발송합니다.
          </span>
        </span>
      </label>

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
  readonly isPublicKeyReady: boolean;
  readonly isRegistering: boolean;
  readonly isRevoking: boolean;
  readonly permissionState: NotificationPermission | "unsupported";
  readonly pushSupported: boolean;
  readonly storedSubscriptionId: string;
  readonly onRequestPermission: () => void;
  readonly onRevoke: () => void;
  readonly onSubscribe: () => void;
};

function BrowserPushPanel({
  isPublicKeyReady,
  isRegistering,
  isRevoking,
  permissionState,
  pushSupported,
  storedSubscriptionId,
  onRequestPermission,
  onRevoke,
  onSubscribe,
}: BrowserPushPanelProps) {
  const canSubscribe =
    pushSupported && isPublicKeyReady && permissionState !== "denied";

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
          value={getPermissionLabel(permissionState)}
        />
        <InfoItem
          label="구독"
          value={storedSubscriptionId ? "등록됨" : "미등록"}
        />
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <button
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border px-4 py-2 text-sm font-semibold hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
          disabled={!pushSupported}
          type="button"
          onClick={onRequestPermission}
        >
          <Bell className="h-4 w-4" aria-hidden="true" />
          권한 요청
        </button>
        <button
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border px-4 py-2 text-sm font-semibold hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
          disabled={!canSubscribe || isRegistering}
          type="button"
          onClick={onSubscribe}
        >
          {isRegistering ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Smartphone className="h-4 w-4" aria-hidden="true" />
          )}
          구독 등록
        </button>
      </div>

      <button
        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={!storedSubscriptionId || isRevoking}
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

function InfoItem({ label, value }: InfoItemProps) {
  return (
    <div className="grid gap-1 rounded-md bg-slate-50 p-3">
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="break-words text-sm font-semibold text-foreground">{value}</dd>
    </div>
  );
}

function ChannelBadge({ channel }: { readonly channel: string }) {
  const isEmail = channel === "EMAIL";

  return (
    <span className="inline-flex items-center gap-1 rounded-md border bg-white px-2 py-1 text-xs font-semibold">
      {isEmail ? (
        <Mail className="h-3.5 w-3.5" aria-hidden="true" />
      ) : (
        <MonitorSmartphone className="h-3.5 w-3.5" aria-hidden="true" />
      )}
      {isEmail ? "Email" : "Push"}
    </span>
  );
}

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

type NoticeMessageProps = {
  readonly message: string;
  readonly onDismiss: () => void;
};

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

function ErrorMessage({ message }: { readonly message: string }) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
      {message}
    </div>
  );
}

function isBrowserPushSupported() {
  return (
    typeof window !== "undefined" &&
    "Notification" in window &&
    "serviceWorker" in navigator &&
    "PushManager" in window
  );
}

function getBrowserPushPermission(): NotificationPermission | "unsupported" {
  if (!isBrowserPushSupported()) {
    return "unsupported";
  }

  return window.Notification.permission;
}

function getPermissionLabel(value: NotificationPermission | "unsupported") {
  switch (value) {
    case "granted":
      return "허용";
    case "denied":
      return "차단";
    case "default":
      return "미설정";
    default:
      return "미지원";
  }
}

function toBrowserPushSubscriptionInput(subscription: PushSubscription) {
  const json = subscription.toJSON();
  const p256dh = json.keys?.p256dh;
  const auth = json.keys?.auth;

  if (!json.endpoint || !p256dh || !auth) {
    throw new Error("브라우저 푸시 구독 정보를 읽지 못했습니다.");
  }

  return {
    endpoint: json.endpoint,
    keys: { p256dh, auth },
    userAgent: navigator.userAgent,
    deviceLabel: "User Web",
  };
}

function urlBase64ToUint8Array(value: string) {
  const padding = "=".repeat((4 - (value.length % 4)) % 4);
  const base64 = `${value}${padding}`.replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const output = new Uint8Array(rawData.length);

  for (let index = 0; index < rawData.length; index += 1) {
    output[index] = rawData.charCodeAt(index);
  }

  return output;
}
