import { trackMobileFieldAnalyticsEvent } from "@/features/analytics";
import type {
  BrowserPushPermissionState,
  CreateBrowserPushSubscriptionInput,
  MobilePushPermissionClientEvent,
} from "@/features/notification/types/notification";

export const PUSH_SUBSCRIPTION_ID_KEY =
  "onehand.sales.browserPushSubscriptionId";

// 기능 : 현재 브라우저가 Notification, Service Worker, PushManager 조합을 지원하는지 확인합니다.
export function isBrowserPushSupported() {
  return (
    typeof window !== "undefined" &&
    typeof window.Notification !== "undefined" &&
    typeof navigator.serviceWorker !== "undefined" &&
    typeof window.PushManager !== "undefined"
  );
}

// 기능 : 브라우저 push 권한 상태를 G05 permission UX 상태값으로 변환합니다.
export function getBrowserPushPermission(): BrowserPushPermissionState {
  if (!isBrowserPushSupported()) {
    return "unsupported";
  }

  return window.Notification.permission;
}

// 기능 : 브라우저 push 권한 상태를 사용자에게 보일 짧은 라벨로 바꿉니다.
export function getBrowserPushPermissionLabel(
  value: BrowserPushPermissionState
) {
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

// 기능 : 저장된 browser push subscription ID를 안전하게 읽습니다.
export function getStoredBrowserPushSubscriptionId() {
  if (typeof window === "undefined") {
    return "";
  }

  try {
    return window.localStorage.getItem(PUSH_SUBSCRIPTION_ID_KEY) ?? "";
  } catch {
    return "";
  }
}

// 기능 : 현재 기기 browser push subscription ID를 localStorage에 저장합니다.
export function storeBrowserPushSubscriptionId(subscriptionId: string) {
  try {
    window.localStorage.setItem(PUSH_SUBSCRIPTION_ID_KEY, subscriptionId);
  } catch {
    // 기능 : localStorage 차단 환경에서도 서버 구독 생성 흐름은 유지합니다.
  }
}

// 기능 : 현재 기기 browser push subscription ID 저장값을 제거합니다.
export function removeStoredBrowserPushSubscriptionId() {
  try {
    window.localStorage.removeItem(PUSH_SUBSCRIPTION_ID_KEY);
  } catch {
    // 기능 : storage 정리 실패가 구독 해제 UX를 막지 않도록 합니다.
  }
}

// 기능 : PushSubscription에서 서버 등록에 필요한 endpoint와 key만 고릅니다.
export function toBrowserPushSubscriptionInput(
  subscription: PushSubscription
): CreateBrowserPushSubscriptionInput {
  const json = subscription.toJSON();
  const p256dh = json.keys?.p256dh;
  const auth = json.keys?.auth;

  if (!json.endpoint || !p256dh || !auth) {
    throw new Error("브라우저 푸시 구독 정보를 읽지 못했어요.");
  }

  return {
    endpoint: json.endpoint,
    keys: { p256dh, auth },
    userAgent: navigator.userAgent,
    deviceLabel: "User Web",
  };
}

// 기능 : VAPID public key를 PushManager subscribe가 받는 byte 배열로 변환합니다.
export function urlBase64ToUint8Array(value: string) {
  const padding = "=".repeat((4 - (value.length % 4)) % 4);
  const base64 = `${value}${padding}`.replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const output = new Uint8Array(rawData.length);

  for (let index = 0; index < rawData.length; index += 1) {
    output[index] = rawData.charCodeAt(index);
  }

  return output;
}

// 기능 : push permission client event를 collector로 전송하고 기존 브라우저 내부 event도 발행합니다.
export function emitMobilePushPermissionClientEvent(
  event: MobilePushPermissionClientEvent
) {
  trackMobileFieldAnalyticsEvent(event);

  if (typeof window === "undefined" || typeof CustomEvent === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent("onehand:mobile-push-permission-analytics", {
      detail: event,
    })
  );
}
