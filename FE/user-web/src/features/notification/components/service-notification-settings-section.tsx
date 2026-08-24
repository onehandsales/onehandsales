import { useEffect, useMemo, useState } from "react";
import { useAppI18n } from "@/features/app-i18n";
import { BrowserPushPermissionDialog } from "@/features/notification/components/browser-push-permission-dialog";
import {
  useCreateBrowserPushSubscriptionMutation,
  useRevokeBrowserPushSubscriptionMutation,
  useUpdateNotificationSettingsMutation,
} from "@/features/notification/hooks/use-notification-mutations";
import {
  useBrowserPushPublicKey,
  useNotificationSettings,
} from "@/features/notification/hooks/use-notification-queries";
import type {
  BrowserPushPermissionRequest,
  BrowserPushPermissionState,
  UserNotificationSetting,
} from "@/features/notification/types/notification";
import {
  emitMobilePushPermissionClientEvent,
  getBrowserPushPermission,
  getStoredBrowserPushSubscriptionId,
  isBrowserPushSupported,
  removeStoredBrowserPushSubscriptionId,
  storeBrowserPushSubscriptionId,
  toBrowserPushSubscriptionInput,
  urlBase64ToUint8Array,
} from "@/features/notification/utils/browser-push-permission";
import { getApiErrorMessage } from "@/lib/api-client";
import { BrowserPushSettingsPanel } from "./browser-push-settings-panel";
import { NotificationSettingsPanel } from "./notification-settings-panel";

// 기능 : 계정 모달 안에서 서비스 알림과 브라우저 푸시 설정을 조회하고 저장합니다.
export function ServiceNotificationSettingsSection() {
  const { t } = useAppI18n();
  const settingsQuery = useNotificationSettings();
  const updateSettingsMutation = useUpdateNotificationSettingsMutation();
  const createSubscriptionMutation = useCreateBrowserPushSubscriptionMutation();
  const revokeSubscriptionMutation = useRevokeBrowserPushSubscriptionMutation();
  const [settingsDraft, setSettingsDraft] =
    useState<UserNotificationSetting | null>(null);
  const [permissionState, setPermissionState] =
    useState<BrowserPushPermissionState>("unsupported");
  const [isPermissionDialogOpen, setIsPermissionDialogOpen] = useState(false);
  const [isPermissionFlowPending, setIsPermissionFlowPending] = useState(false);
  const [storedSubscriptionId, setStoredSubscriptionId] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [browserPushError, setBrowserPushError] = useState<string | null>(null);
  const settings = settingsDraft ?? settingsQuery.data ?? null;
  const pushSupported = useMemo(() => isBrowserPushSupported(), []);
  const publicKeyQuery = useBrowserPushPublicKey(pushSupported);
  const publicKey = publicKeyQuery.data?.publicKey ?? "";
  const errorMessage =
    saveError ??
    browserPushError ??
    (settingsQuery.error ? getApiErrorMessage(settingsQuery.error) : null);

  useEffect(() => {
    if (settingsQuery.data) {
      setSettingsDraft(settingsQuery.data);
    }
  }, [settingsQuery.data]);

  useEffect(() => {
    setPermissionState(getBrowserPushPermission());
    setStoredSubscriptionId(getStoredBrowserPushSubscriptionId());
  }, []);

  // 기능 : 서비스 알림 설정 변경사항을 저장합니다.
  const onSaveSettings = async () => {
    if (!settings) {
      return;
    }

    setNotice(null);
    setSaveError(null);
    setBrowserPushError(null);

    try {
      const nextSettings = await updateSettingsMutation.mutateAsync({
        scheduleReminderEnabled: settings.scheduleReminderEnabled,
        dealDueReminderEnabled: settings.dealDueReminderEnabled,
        emailNotificationEnabled: settings.emailNotificationEnabled,
      });
      setSettingsDraft(nextSettings);
      setNotice("알림 설정을 저장했어요.");
    } catch (error) {
      setSaveError(getApiErrorMessage(error));
    }
  };

  // 기능 : 브라우저 푸시 권한 안내 dialog를 엽니다.
  const onOpenBrowserPushPermissionDialog = () => {
    setNotice(null);
    setSaveError(null);
    setBrowserPushError(null);

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
        entryPoint: "settings",
      },
    });
    setIsPermissionDialogOpen(true);
  };

  // 기능 : 사용자 확인 이후 브라우저 푸시 권한 요청과 구독 등록을 진행합니다.
  const onConfirmBrowserPushPermission = async (
    request: BrowserPushPermissionRequest = { trigger: "USER_CLICK" }
  ) => {
    if (request.trigger !== "USER_CLICK") {
      return;
    }

    setIsPermissionFlowPending(true);
    setNotice(null);
    setSaveError(null);
    setBrowserPushError(null);

    try {
      if (!pushSupported || !("Notification" in window)) {
        setPermissionState("unsupported");
        setBrowserPushError("이 브라우저에서는 푸시 알림을 사용할 수 없어요.");
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
        const nextError =
          permission === "denied"
            ? "브라우저에서 알림이 차단되어 있어요. 기기 설정에서 권한을 바꾼 뒤 다시 시도해 주세요."
            : "권한 요청을 닫았어요. 필요할 때 다시 켤 수 있어요.";

        setBrowserPushError(nextError);
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
        setBrowserPushError("브라우저 푸시 서버 설정을 가져오지 못했어요.");
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
      setNotice("브라우저 푸시 구독을 등록했어요.");
      emitMobilePushPermissionClientEvent({
        eventName: "mobile_push_permission_result",
        eventVersion: 1,
        payload: {
          browserPushEnabled: true,
          permissionState: "granted",
        },
      });
    } catch (error) {
      setBrowserPushError(getApiErrorMessage(error));
    } finally {
      setIsPermissionFlowPending(false);
    }
  };

  // 기능 : 현재 기기의 브라우저 푸시 구독을 해제합니다.
  const onRevokeBrowserPush = async () => {
    setNotice(null);
    setSaveError(null);
    setBrowserPushError(null);

    try {
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
      setNotice("브라우저 푸시 구독을 해제했어요.");
    } catch (error) {
      setBrowserPushError(getApiErrorMessage(error));
    }
  };

  return (
    <section className="min-h-full bg-white px-8 py-10 md:px-12">
      <div className="mx-auto w-full max-w-[760px]">
        <div>
          <h2 className="text-[28px] font-bold leading-tight text-[#111827]">
            {t("navigation.notifications")}
          </h2>
        </div>

        <div className="mt-8 grid gap-4">
          {notice ? (
            <div className="rounded-md border border-[#D1FAE5] bg-[#ECFDF5] px-3 py-2 text-[13px] font-medium text-[#047857]">
              {notice}
            </div>
          ) : null}

          {errorMessage ? (
            <ServiceNotificationError
              message={errorMessage}
              onRetry={() => void settingsQuery.refetch()}
            />
          ) : null}

          {settingsQuery.isLoading && settings === null ? (
            <ServiceNotificationSettingsSkeleton />
          ) : settingsQuery.error && settings === null ? null : (
            <NotificationSettingsPanel
              isPending={updateSettingsMutation.isPending}
              settings={settings}
              onChange={setSettingsDraft}
              onSave={() => void onSaveSettings()}
            />
          )}

          <BrowserPushSettingsPanel
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
        </div>
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

// 기능 : 서비스 알림 설정 로딩 상태를 렌더링합니다.
function ServiceNotificationSettingsSkeleton() {
  return (
    <div className="grid gap-3">
      {Array.from({ length: 5 }).map((_, index) => (
        <div className="h-16 animate-pulse rounded-md bg-[#F3F4F6]" key={index} />
      ))}
    </div>
  );
}

// 기능 : 서비스 알림 설정 조회 또는 저장 오류를 렌더링합니다.
function ServiceNotificationError({
  message,
  onRetry,
}: {
  readonly message: string;
  readonly onRetry: () => void;
}) {
  return (
    <div className="grid justify-items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-3">
      <p className="text-[13px] text-red-700">{message}</p>
      <button
        className="h-8 rounded-md border border-red-200 bg-white px-3 text-[13px] font-medium text-red-700 transition hover:bg-red-50 active:bg-red-100"
        onClick={onRetry}
        type="button"
      >
        다시 시도
      </button>
    </div>
  );
}
