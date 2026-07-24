import { FollowUpDeliverySafeErrorMapper } from "./follow-up-delivery-safe-error.mapper";
import type { FollowUpProviderFailureKind } from "./follow-up-delivery-safe-error.mapper";

describe("FollowUpDeliverySafeErrorMapper", () => {
  it("redacts provider raw error, response, token, phone, subject, and body", () => {
    const mapper = new FollowUpDeliverySafeErrorMapper();
    const rawToken = "ya29.raw-provider-token";
    const rawPhone = "+821012345678";
    const rawSubject = "Confidential renewal subject";
    const rawBody = "Confidential follow-up body with pricing";
    const rawProviderResponse =
      "provider says quota project secret and recipient details";

    const mapped = mapper.mapProviderFailure({
      provider: "google",
      operation: "EMAIL_SEND",
      channel: "EMAIL",
      failureKind: "AUTH_EXPIRED",
      providerStatusCode: 401,
      providerRequestId: "req-safe-123",
      rawError: new Error(
        `${rawProviderResponse} ${rawToken} ${rawPhone} ${rawSubject} ${rawBody}`
      ),
      rawResponse: {
        token: rawToken,
        phone: rawPhone,
        subject: rawSubject,
        body: rawBody,
        response: rawProviderResponse,
      },
    });

    const serialized = JSON.stringify(mapped);

    expect(mapped).toMatchObject({
      safeErrorCode: "FollowUpEmailReconnectRequired",
      retryable: false,
      detailJson: {
        provider: "google",
        operation: "EMAIL_SEND",
        channel: "EMAIL",
        failureKind: "AUTH_EXPIRED",
        providerStatusCode: "401",
        providerRequestId: "req-safe-123",
        rawErrorName: "Error",
      },
    });
    expect(serialized).not.toContain(rawToken);
    expect(serialized).not.toContain(rawPhone);
    expect(serialized).not.toContain(rawSubject);
    expect(serialized).not.toContain(rawBody);
    expect(serialized).not.toContain(rawProviderResponse);
  });

  it.each([
    ["TIMEOUT", true, "FollowUpProviderTimeout"],
    ["RATE_LIMIT", true, "FollowUpProviderRateLimited"],
    ["AUTH_EXPIRED", false, "FollowUpEmailReconnectRequired"],
    ["INVALID_RECIPIENT", false, "FollowUpInvalidRecipient"],
    ["SMS_SENDER_INVALID", false, "FollowUpSmsSenderNotVerified"],
    ["POLICY_REJECTED", false, "FollowUpDeliveryPolicyRejected"],
    ["PROVIDER_UNAVAILABLE", true, "FollowUpProviderUnavailable"],
    ["UNKNOWN", true, "FollowUpProviderUnavailable"],
  ] satisfies Array<[FollowUpProviderFailureKind, boolean, string]>)(
    "maps %s to retryable=%s and %s",
    (failureKind, retryable, safeErrorCode) => {
      const mapper = new FollowUpDeliverySafeErrorMapper();

      const mapped = mapper.mapProviderFailure({
        provider: "sms-provider",
        operation: "SMS_SEND",
        channel: "SMS",
        failureKind,
      });

      expect(mapped.retryable).toBe(retryable);
      expect(mapped.safeErrorCode).toBe(safeErrorCode);
      expect(mapped.detailJson.retryable).toBe(retryable);
      expect(mapped.detailJson.safeErrorCode).toBe(safeErrorCode);
    }
  );
});
