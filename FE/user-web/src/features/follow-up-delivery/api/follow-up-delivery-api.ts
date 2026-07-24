import type {
  AcknowledgeFollowUpConsentNoticeInput,
  CreateFollowUpDraftInput,
  DisconnectFollowUpEmailConnectionInput,
  FollowUpConsentNotice,
  FollowUpDeliverySettings,
  FollowUpEmailConnection,
  FollowUpMessage,
  FollowUpMessageListParams,
  FollowUpMessageListResponse,
  FollowUpSmsSenderNumber,
  RequestFollowUpSmsSenderNumberVerificationInput,
  RequestFollowUpSmsSenderNumberVerificationResponse,
  RevokeFollowUpSmsSenderNumberInput,
  StartFollowUpEmailConnectionInput,
  StartFollowUpEmailConnectionResponse,
  UpdateFollowUpMessageInput,
  VerifyFollowUpSmsSenderNumberInput,
} from "@/features/follow-up-delivery/types/follow-up-delivery";
import { apiClient } from "@/lib/api-client";

export function getFollowUpDeliverySettings() {
  return apiClient<FollowUpDeliverySettings>("/api/follow-up-delivery/settings");
}

export function startFollowUpEmailConnection(
  input: StartFollowUpEmailConnectionInput
) {
  return apiClient<StartFollowUpEmailConnectionResponse>(
    `/api/follow-up-delivery/email-connections/${input.provider.toLowerCase()}/connect`,
    {
      method: "POST",
      body: {
        redirectUri: input.redirectUri,
      },
    }
  );
}

export function disconnectFollowUpEmailConnection(
  input: DisconnectFollowUpEmailConnectionInput
) {
  return apiClient<FollowUpEmailConnection>(
    `/api/follow-up-delivery/email-connections/${input.connectionId}/disconnect`,
    {
      method: "POST",
    }
  );
}

export function requestFollowUpSmsSenderNumberVerification(
  input: RequestFollowUpSmsSenderNumberVerificationInput
) {
  return apiClient<RequestFollowUpSmsSenderNumberVerificationResponse>(
    "/api/follow-up-delivery/sms-sender-numbers",
    {
      method: "POST",
      body: input,
    }
  );
}

export function verifyFollowUpSmsSenderNumber(
  input: VerifyFollowUpSmsSenderNumberInput
) {
  return apiClient<FollowUpSmsSenderNumber>(
    `/api/follow-up-delivery/sms-sender-numbers/${input.senderNumberId}/verify`,
    {
      method: "POST",
      body: {
        code: input.code,
      },
    }
  );
}

export function revokeFollowUpSmsSenderNumber(
  input: RevokeFollowUpSmsSenderNumberInput
) {
  return apiClient<FollowUpSmsSenderNumber>(
    `/api/follow-up-delivery/sms-sender-numbers/${input.senderNumberId}/revoke`,
    {
      method: "POST",
    }
  );
}

export function acknowledgeFollowUpConsentNotice(
  input: AcknowledgeFollowUpConsentNoticeInput
) {
  return apiClient<FollowUpConsentNotice>(
    `/api/follow-up-delivery/consent-notices/${input.channel.toLowerCase()}/acknowledge`,
    {
      method: "POST",
    }
  );
}

export function createFollowUpDraft(input: CreateFollowUpDraftInput) {
  return apiClient<FollowUpMessage>("/api/follow-up-messages/drafts", {
    method: "POST",
    body: input,
  });
}

export function updateFollowUpMessage(input: UpdateFollowUpMessageInput) {
  const { messageId, ...body } = input;

  return apiClient<FollowUpMessage>(`/api/follow-up-messages/${messageId}`, {
    method: "PATCH",
    body: compactBody(body),
  });
}

export function getFollowUpMessage(messageId: string) {
  return apiClient<FollowUpMessage>(`/api/follow-up-messages/${messageId}`);
}

export function sendFollowUpMessage(messageId: string) {
  return apiClient<FollowUpMessage>(
    `/api/follow-up-messages/${messageId}/send`,
    {
      method: "POST",
    }
  );
}

export function retryFollowUpMessage(messageId: string) {
  return apiClient<FollowUpMessage>(
    `/api/follow-up-messages/${messageId}/retry`,
    {
      method: "POST",
    }
  );
}

export function listFollowUpMessages(params: FollowUpMessageListParams) {
  const query = new URLSearchParams();

  if (params.sourceReportId) {
    query.set("sourceReportId", params.sourceReportId);
  }

  if (params.targetType) {
    query.set("targetType", params.targetType);
  }

  if (params.targetId) {
    query.set("targetId", params.targetId);
  }

  query.set("page", String(params.page ?? 1));

  return apiClient<FollowUpMessageListResponse>(
    `/api/follow-up-messages?${query.toString()}`
  );
}

function compactBody(input: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(input).filter(([, value]) => value !== undefined)
  );
}
