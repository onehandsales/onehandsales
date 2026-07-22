import type { NotificationReadFilter } from "@/features/notification/types/notification";

export const notificationQueryKeys = {
  all: ["notification"] as const,
  lists: () => [...notificationQueryKeys.all, "list"] as const,
  list: (input: {
    readonly page: number;
    readonly pageSize: number;
    readonly read: NotificationReadFilter;
    readonly includeUpcoming: boolean;
  }) => [...notificationQueryKeys.lists(), input] as const,
  unreadCount: () => [...notificationQueryKeys.all, "unread-count"] as const,
  settings: () => [...notificationQueryKeys.all, "settings"] as const,
  browserPushPublicKey: () =>
    [...notificationQueryKeys.all, "browser-push-public-key"] as const,
};
