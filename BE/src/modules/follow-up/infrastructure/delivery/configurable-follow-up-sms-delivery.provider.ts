import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type {
  FollowUpProviderDeliveryResult,
  FollowUpSmsDeliveryProvider,
  FollowUpSmsSendInput,
  FollowUpSmsVerificationInput,
} from "@/modules/follow-up/application/ports/follow-up-delivery.provider";
import { FollowUpProviderUnavailableError } from "@/modules/follow-up/domain/follow-up-delivery.errors";

@Injectable()
export class ConfigurableFollowUpSmsDeliveryProvider
  implements FollowUpSmsDeliveryProvider
{
  constructor(private readonly configService: ConfigService) {}

  sendVerificationCode(
    input: FollowUpSmsVerificationInput
  ): Promise<FollowUpProviderDeliveryResult> {
    if (!this.canUseTestProvider()) {
      throw new FollowUpProviderUnavailableError(
        "Follow-up SMS provider is not configured."
      );
    }

    return Promise.resolve({
      ok: true,
      provider: input.provider ?? "test-sms",
      providerMessageId: `test-verification-${input.idempotencyKey}`,
      providerStatusCode: "202",
      detailJson: {
        providerStatusReason: "TEST_PROVIDER",
      },
    });
  }

  sendSms(input: FollowUpSmsSendInput): Promise<FollowUpProviderDeliveryResult> {
    return Promise.resolve({
      ok: false,
      provider: input.provider ?? "test-sms",
      safeErrorCode: "FollowUpSendNotImplemented",
      safeErrorMessage:
        "Follow-up SMS sending is implemented in the send backend goal.",
      retryable: false,
      detailJson: {
        providerStatusReason: "G07_REQUIRED",
      },
    });
  }

  private canUseTestProvider(): boolean {
    return this.configService.get<string>("NODE_ENV") !== "production";
  }
}
