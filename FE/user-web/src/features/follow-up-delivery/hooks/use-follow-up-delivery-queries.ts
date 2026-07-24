import { useQuery } from "@tanstack/react-query";
import {
  getFollowUpDeliverySettings,
  getFollowUpMessage,
  listFollowUpMessages,
} from "@/features/follow-up-delivery/api/follow-up-delivery-api";
import { followUpDeliveryQueryKeys } from "@/features/follow-up-delivery/api/follow-up-delivery-query-keys";
import type { FollowUpMessageListParams } from "@/features/follow-up-delivery/types/follow-up-delivery";

export function useFollowUpDeliverySettings(options?: {
  readonly enabled?: boolean;
}) {
  return useQuery({
    enabled: options?.enabled ?? true,
    queryKey: followUpDeliveryQueryKeys.settings(),
    queryFn: getFollowUpDeliverySettings,
  });
}

export function useFollowUpMessageList(
  params: FollowUpMessageListParams,
  options?: { readonly enabled?: boolean }
) {
  return useQuery({
    enabled: options?.enabled ?? true,
    queryKey: followUpDeliveryQueryKeys.messageList(params),
    queryFn: () => listFollowUpMessages(params),
  });
}

export function useFollowUpMessageDetail(
  messageId: string | null,
  options?: { readonly enabled?: boolean }
) {
  const resolvedMessageId = messageId ?? "";

  return useQuery({
    enabled:
      (options?.enabled ?? true) && resolvedMessageId.trim().length > 0,
    queryKey: followUpDeliveryQueryKeys.messageDetail(resolvedMessageId),
    queryFn: () => getFollowUpMessage(resolvedMessageId),
  });
}
