import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  acknowledgeFollowUpConsentNotice,
  createFollowUpDraft,
  disconnectFollowUpEmailConnection,
  requestFollowUpSmsSenderNumberVerification,
  retryFollowUpMessage,
  revokeFollowUpSmsSenderNumber,
  sendFollowUpMessage,
  startFollowUpEmailConnection,
  updateFollowUpMessage,
  verifyFollowUpSmsSenderNumber,
} from "@/features/follow-up-delivery/api/follow-up-delivery-api";
import { followUpDeliveryQueryKeys } from "@/features/follow-up-delivery/api/follow-up-delivery-query-keys";

export function useStartFollowUpEmailConnectionMutation() {
  return useMutation({
    mutationFn: startFollowUpEmailConnection,
  });
}

export function useDisconnectFollowUpEmailConnectionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: disconnectFollowUpEmailConnection,
    onSuccess: () => {
      invalidateFollowUpSettings(queryClient);
    },
  });
}

export function useRequestFollowUpSmsSenderNumberVerificationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: requestFollowUpSmsSenderNumberVerification,
    onSuccess: () => {
      invalidateFollowUpSettings(queryClient);
    },
  });
}

export function useVerifyFollowUpSmsSenderNumberMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: verifyFollowUpSmsSenderNumber,
    onSuccess: () => {
      invalidateFollowUpSettings(queryClient);
    },
  });
}

export function useRevokeFollowUpSmsSenderNumberMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: revokeFollowUpSmsSenderNumber,
    onSuccess: () => {
      invalidateFollowUpSettings(queryClient);
    },
  });
}

export function useAcknowledgeFollowUpConsentNoticeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: acknowledgeFollowUpConsentNotice,
    onSuccess: () => {
      invalidateFollowUpSettings(queryClient);
    },
  });
}

export function useCreateFollowUpDraftMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createFollowUpDraft,
    onSuccess: (message) => {
      invalidateFollowUpMessages(queryClient, message.id);
    },
  });
}

export function useUpdateFollowUpMessageMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateFollowUpMessage,
    onSuccess: (message) => {
      invalidateFollowUpMessages(queryClient, message.id);
    },
  });
}

export function useSendFollowUpMessageMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sendFollowUpMessage,
    onSuccess: (message) => {
      invalidateFollowUpMessages(queryClient, message.id);
    },
  });
}

export function useRetryFollowUpMessageMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: retryFollowUpMessage,
    onSuccess: (message) => {
      invalidateFollowUpMessages(queryClient, message.id);
    },
  });
}

function invalidateFollowUpSettings(
  queryClient: ReturnType<typeof useQueryClient>
) {
  void queryClient.invalidateQueries({
    queryKey: followUpDeliveryQueryKeys.settings(),
  });
}

function invalidateFollowUpMessages(
  queryClient: ReturnType<typeof useQueryClient>,
  messageId?: string
) {
  void queryClient.invalidateQueries({
    queryKey: followUpDeliveryQueryKeys.messages(),
  });

  if (messageId) {
    void queryClient.invalidateQueries({
      queryKey: followUpDeliveryQueryKeys.messageDetail(messageId),
    });
  }
}
