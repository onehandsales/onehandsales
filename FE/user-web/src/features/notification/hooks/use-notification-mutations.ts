import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createBrowserPushSubscription,
  markNotificationRead,
  revokeBrowserPushSubscription,
  updateNotificationSettings,
} from "@/features/notification/api/notification-api";
import { notificationQueryKeys } from "@/features/notification/api/notification-query-keys";
import type {
  CreateBrowserPushSubscriptionInput,
  UpdateNotificationSettingsInput,
} from "@/features/notification/types/notification";

export function useMarkNotificationReadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) => markNotificationRead(notificationId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: notificationQueryKeys.lists(),
      });
      void queryClient.invalidateQueries({
        queryKey: notificationQueryKeys.unreadCount(),
      });
    },
  });
}

export function useUpdateNotificationSettingsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateNotificationSettingsInput) =>
      updateNotificationSettings(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: notificationQueryKeys.settings(),
      });
    },
  });
}

export function useCreateBrowserPushSubscriptionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateBrowserPushSubscriptionInput) =>
      createBrowserPushSubscription(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: notificationQueryKeys.settings(),
      });
    },
  });
}

export function useRevokeBrowserPushSubscriptionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (subscriptionId: string) =>
      revokeBrowserPushSubscription(subscriptionId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: notificationQueryKeys.settings(),
      });
    },
  });
}
