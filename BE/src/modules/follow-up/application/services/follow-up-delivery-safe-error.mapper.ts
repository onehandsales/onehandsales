import { Injectable } from "@nestjs/common";
import type {
  FollowUpDeliveryChannelValue,
  FollowUpProviderOperation,
} from "@/modules/follow-up/application/ports/follow-up-delivery.provider";

export type FollowUpProviderFailureKind =
  | "AUTH_EXPIRED"
  | "INVALID_RECIPIENT"
  | "POLICY_REJECTED"
  | "RATE_LIMIT"
  | "SMS_SENDER_INVALID"
  | "TIMEOUT"
  | "PROVIDER_UNAVAILABLE"
  | "UNKNOWN";

export interface FollowUpProviderFailureInput {
  provider: string;
  operation: FollowUpProviderOperation;
  channel: FollowUpDeliveryChannelValue;
  failureKind: FollowUpProviderFailureKind;
  providerStatusCode?: string | number;
  providerRequestId?: string;
  retryAfterSeconds?: number;
  rawError?: unknown;
  rawResponse?: unknown;
}

export interface FollowUpSafeProviderFailure {
  safeErrorCode: string;
  safeErrorMessage: string;
  retryable: boolean;
  detailJson: Record<string, unknown>;
}

interface FailureMapping {
  safeErrorCode: string;
  safeErrorMessage: string;
  retryable: boolean;
}

@Injectable()
export class FollowUpDeliverySafeErrorMapper {
  mapProviderFailure(
    input: FollowUpProviderFailureInput
  ): FollowUpSafeProviderFailure {
    const mapping = this.getMapping(input.failureKind);
    const detailJson = this.buildDetailJson(input, mapping);

    return {
      safeErrorCode: mapping.safeErrorCode,
      safeErrorMessage: mapping.safeErrorMessage,
      retryable: mapping.retryable,
      detailJson,
    };
  }

  private getMapping(kind: FollowUpProviderFailureKind): FailureMapping {
    switch (kind) {
      case "AUTH_EXPIRED":
        return {
          safeErrorCode: "FollowUpEmailReconnectRequired",
          safeErrorMessage:
            "Reconnect the email account before sending follow-up messages.",
          retryable: false,
        };
      case "INVALID_RECIPIENT":
        return {
          safeErrorCode: "FollowUpInvalidRecipient",
          safeErrorMessage:
            "Check the recipient contact information before sending again.",
          retryable: false,
        };
      case "SMS_SENDER_INVALID":
        return {
          safeErrorCode: "FollowUpSmsSenderNotVerified",
          safeErrorMessage: "Verify the SMS sender number before sending.",
          retryable: false,
        };
      case "RATE_LIMIT":
        return {
          safeErrorCode: "FollowUpProviderRateLimited",
          safeErrorMessage:
            "The provider is rate limiting follow-up delivery. Try again later.",
          retryable: true,
        };
      case "TIMEOUT":
        return {
          safeErrorCode: "FollowUpProviderTimeout",
          safeErrorMessage:
            "The provider did not respond in time. Try again later.",
          retryable: true,
        };
      case "POLICY_REJECTED":
        return {
          safeErrorCode: "FollowUpDeliveryPolicyRejected",
          safeErrorMessage:
            "The provider rejected this follow-up message by policy.",
          retryable: false,
        };
      case "PROVIDER_UNAVAILABLE":
      case "UNKNOWN":
        return {
          safeErrorCode: "FollowUpProviderUnavailable",
          safeErrorMessage:
            "The provider is temporarily unavailable. Try again later.",
          retryable: true,
        };
    }
  }

  private buildDetailJson(
    input: FollowUpProviderFailureInput,
    mapping: FailureMapping
  ): Record<string, unknown> {
    const detailJson: Record<string, unknown> = {
      provider: input.provider,
      operation: input.operation,
      channel: input.channel,
      failureKind: input.failureKind,
      safeErrorCode: mapping.safeErrorCode,
      retryable: mapping.retryable,
    };

    if (input.providerStatusCode !== undefined) {
      detailJson.providerStatusCode = String(input.providerStatusCode);
    }

    if (input.providerRequestId !== undefined) {
      detailJson.providerRequestId = input.providerRequestId;
    }

    if (input.retryAfterSeconds !== undefined) {
      detailJson.retryAfterSeconds = input.retryAfterSeconds;
    }

    const rawErrorName = this.getRawErrorName(input.rawError);
    if (rawErrorName !== undefined) {
      detailJson.rawErrorName = rawErrorName;
    }

    return detailJson;
  }

  private getRawErrorName(rawError: unknown): string | undefined {
    if (rawError instanceof Error && rawError.name.trim().length > 0) {
      return rawError.name;
    }

    if (
      typeof rawError === "object" &&
      rawError !== null &&
      "name" in rawError
    ) {
      const name = (rawError as { name?: unknown }).name;
      if (typeof name === "string" && name.trim().length > 0) {
        return name;
      }
    }

    return undefined;
  }
}
