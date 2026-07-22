import type {
  BrowserPushPublicKeyResponse,
  BrowserPushSubscriptionResponse,
  CreateBrowserPushSubscriptionInput,
  ListNotificationsInput,
  NotificationItem,
  NotificationListResponse,
  NotificationUnreadCountResponse,
  UpdateNotificationSettingsInput,
  UserNotificationSetting,
} from "@/features/notification/types/notification";
import { apiClient } from "@/lib/api-client";

export function listNotifications(input: ListNotificationsInput = {}) {
  const searchParams = new URLSearchParams();

  if (input.page !== undefined) {
    searchParams.set("page", String(input.page));
  }

  if (input.pageSize !== undefined) {
    searchParams.set("pageSize", String(input.pageSize));
  }

  if (input.read && input.read !== "ALL") {
    searchParams.set("read", input.read);
  }

  if (input.includeUpcoming !== undefined) {
    searchParams.set("includeUpcoming", String(input.includeUpcoming));
  }

  const query = searchParams.toString();

  return apiClient<NotificationListResponse>(
    `/api/notifications${query ? `?${query}` : ""}`
  );
}

export function markNotificationRead(notificationId: string) {
  return apiClient<NotificationItem>(
    `/api/notifications/${notificationId}/read`,
    {
      method: "PATCH",
    }
  );
}

export function getNotificationUnreadCount() {
  return apiClient<NotificationUnreadCountResponse>(
    "/api/notifications/unread-count"
  );
}

export function getNotificationSettings() {
  return apiClient<UserNotificationSetting>("/api/notifications/settings");
}

export function updateNotificationSettings(
  input: UpdateNotificationSettingsInput
) {
  return apiClient<UserNotificationSetting>("/api/notifications/settings", {
    method: "PATCH",
    body: input,
  });
}

export function getBrowserPushPublicKey() {
  return apiClient<BrowserPushPublicKeyResponse>(
    "/api/notifications/browser-push/public-key"
  );
}

export function createBrowserPushSubscription(
  input: CreateBrowserPushSubscriptionInput
) {
  return apiClient<BrowserPushSubscriptionResponse>(
    "/api/notifications/browser-subscriptions",
    {
      method: "POST",
      body: input,
    }
  );
}

export function revokeBrowserPushSubscription(subscriptionId: string) {
  return apiClient<BrowserPushSubscriptionResponse>(
    `/api/notifications/browser-subscriptions/${subscriptionId}`,
    {
      method: "DELETE",
    }
  );
}
