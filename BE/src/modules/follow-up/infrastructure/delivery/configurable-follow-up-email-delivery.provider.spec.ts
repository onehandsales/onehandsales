import { ConfigService } from "@nestjs/config";
import { FollowUpEmailReconnectRequiredError } from "@/modules/follow-up/domain/follow-up-delivery.errors";
import { ConfigurableFollowUpEmailDeliveryProvider } from "./configurable-follow-up-email-delivery.provider";

// 역할 : ConfigService 테스트 double이 환경 변수 조회를 제공합니다.
class FakeConfigService {
  constructor(private readonly values: Record<string, string>) {}

  // 기능 : 테스트 환경 변수 값을 ConfigService.get 형식으로 반환합니다.
  get<T = string>(key: string): T | undefined {
    return this.values[key] as T | undefined;
  }
}

describe("ConfigurableFollowUpEmailDeliveryProvider", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it("sends Gmail messages with base64url plain text MIME", async () => {
    const fetchMock = mockFetch(
      new Response(JSON.stringify({ id: "gmail-message-1" }), { status: 200 })
    );
    const provider = createProvider({
      FOLLOW_UP_GOOGLE_CLIENT_ID: "google-client",
      FOLLOW_UP_GOOGLE_CLIENT_SECRET: "google-secret",
    });

    const result = await provider.sendEmail({
      provider: "GOOGLE",
      accessToken: "access-token-secret",
      from: { displayName: "Owner", email: "owner@example.com" },
      to: { name: "Buyer", email: "buyer@example.com" },
      subject: "견적 검토",
      body: "지난 미팅에서 논의한 견적 검토 건 확인 부탁드려요.",
      idempotencyKey: "attempt-1",
    });

    const request = fetchMock.mock.calls[0]?.[1] as RequestInit;
    const body = JSON.parse(String(request.body)) as { raw: string };
    const mime = decodeBase64Url(body.raw);

    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      "https://gmail.googleapis.com/gmail/v1/users/me/messages/send"
    );
    expect(request.headers).toMatchObject({
      authorization: "Bearer access-token-secret",
      "content-type": "application/json",
    });
    expect(mime).toContain("Content-Type: text/plain; charset=UTF-8");
    expect(mime).toContain("Subject: =?UTF-8?B?");
    expect(mime).toContain("지난 미팅에서 논의한 견적 검토 건 확인 부탁드려요.");
    expect(result).toMatchObject({
      ok: true,
      provider: "google",
      providerMessageId: "gmail-message-1",
      providerStatusCode: "200",
    });
  });

  it("sends Microsoft Graph messages as JSON text body", async () => {
    const fetchMock = mockFetch(new Response(null, { status: 202 }));
    const provider = createProvider({
      FOLLOW_UP_MICROSOFT_CLIENT_ID: "microsoft-client",
      FOLLOW_UP_MICROSOFT_CLIENT_SECRET: "microsoft-secret",
    });

    const result = await provider.sendEmail({
      provider: "MICROSOFT",
      accessToken: "access-token-secret",
      from: { email: "owner@example.com" },
      to: { name: "Buyer", email: "buyer@example.com" },
      subject: "Follow-up",
      body: "Please review the quote.",
      idempotencyKey: "attempt-2",
    });

    const request = fetchMock.mock.calls[0]?.[1] as RequestInit;
    const body = JSON.parse(String(request.body)) as Record<string, unknown>;

    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      "https://graph.microsoft.com/v1.0/me/sendMail"
    );
    expect(body).toMatchObject({
      message: {
        subject: "Follow-up",
        body: {
          contentType: "Text",
          content: "Please review the quote.",
        },
        toRecipients: [
          {
            emailAddress: {
              address: "buyer@example.com",
              name: "Buyer",
            },
          },
        ],
      },
      saveToSentItems: true,
    });
    expect(result).toMatchObject({
      ok: true,
      provider: "microsoft",
      providerStatusCode: "202",
    });
  });

  it("blocks smoke recipients outside allowlist before provider calls", async () => {
    const fetchMock = mockFetch(new Response(null, { status: 202 }));
    const provider = createProvider({
      FOLLOW_UP_GOOGLE_CLIENT_ID: "google-client",
      FOLLOW_UP_GOOGLE_CLIENT_SECRET: "google-secret",
      FOLLOW_UP_EMAIL_SMOKE_MODE: "true",
      FOLLOW_UP_EMAIL_SMOKE_ALLOWED_RECIPIENTS: "allowed@example.com",
    });

    const result = await provider.sendEmail({
      provider: "GOOGLE",
      accessToken: "access-token-secret",
      from: { email: "owner@example.com" },
      to: { email: "blocked@example.com" },
      subject: "Follow-up",
      body: "Please review the quote.",
      idempotencyKey: "attempt-3",
    });

    expect(fetchMock).not.toHaveBeenCalled();
    expect(result).toMatchObject({
      ok: false,
      safeErrorCode: "FollowUpEmailSmokeRecipientNotAllowed",
      retryable: false,
      detailJson: {
        externalCallSkipped: true,
        smokeMode: true,
      },
    });
  });

  it("maps provider auth failures to reconnect-required without raw response", async () => {
    mockFetch(
      new Response(
        JSON.stringify({
          error: {
            code: "InvalidAuthenticationToken",
            message: "raw provider message with owner@example.com",
          },
        }),
        { status: 401 }
      )
    );
    const provider = createProvider({
      FOLLOW_UP_MICROSOFT_CLIENT_ID: "microsoft-client",
      FOLLOW_UP_MICROSOFT_CLIENT_SECRET: "microsoft-secret",
    });

    const result = await provider.sendEmail({
      provider: "MICROSOFT",
      accessToken: "access-token-secret",
      from: { email: "owner@example.com" },
      to: { email: "buyer@example.com" },
      subject: "Confidential subject",
      body: "Confidential body",
      idempotencyKey: "attempt-4",
    });
    const serialized = JSON.stringify(result);

    expect(result).toMatchObject({
      ok: false,
      providerStatusCode: "401",
      safeErrorCode: "FollowUpEmailReconnectRequired",
      retryable: false,
      detailJson: {
        providerStatusReason: "InvalidAuthenticationToken",
      },
    });
    expect(serialized).not.toContain("owner@example.com");
    expect(serialized).not.toContain("buyer@example.com");
    expect(serialized).not.toContain("Confidential subject");
    expect(serialized).not.toContain("Confidential body");
    expect(serialized).not.toContain("raw provider message");
  });

  it("maps 429 provider responses to retryable temporary failure", async () => {
    mockFetch(
      new Response(JSON.stringify({ error: { code: "TooManyRequests" } }), {
        headers: { "retry-after": "30" },
        status: 429,
      })
    );
    const provider = createProvider({
      FOLLOW_UP_GOOGLE_CLIENT_ID: "google-client",
      FOLLOW_UP_GOOGLE_CLIENT_SECRET: "google-secret",
    });

    const result = await provider.sendEmail({
      provider: "GOOGLE",
      accessToken: "access-token-secret",
      from: { email: "owner@example.com" },
      to: { email: "buyer@example.com" },
      subject: "Follow-up",
      body: "Please review the quote.",
      idempotencyKey: "attempt-5",
    });

    expect(result).toMatchObject({
      ok: false,
      safeErrorCode: "FollowUpProviderTemporaryFailure",
      retryable: true,
      detailJson: {
        providerStatusReason: "TooManyRequests",
        retryAfterSeconds: 30,
      },
    });
  });

  it("maps refresh invalid_grant to reconnect-required", async () => {
    mockFetch(
      new Response(JSON.stringify({ error: "invalid_grant" }), {
        status: 400,
      })
    );
    const provider = createProvider({
      FOLLOW_UP_GOOGLE_CLIENT_ID: "google-client",
      FOLLOW_UP_GOOGLE_CLIENT_SECRET: "google-secret",
    });

    await expect(
      provider.refreshAccessToken({
        provider: "GOOGLE",
        refreshToken: "revoked-refresh-token",
      })
    ).rejects.toBeInstanceOf(FollowUpEmailReconnectRequiredError);
  });
});

// 기능 : provider 테스트 instance를 production 설정과 mock logger로 생성합니다.
function createProvider(values: Record<string, string>) {
  const logger = {
    warn: jest.fn(),
  };

  return new ConfigurableFollowUpEmailDeliveryProvider(
    new FakeConfigService({
      NODE_ENV: "production",
      ...values,
    }) as unknown as ConfigService,
    logger as never
  );
}

// 기능 : global fetch를 Jest mock으로 교체하고 지정 응답을 반환합니다.
function mockFetch(response: Response) {
  const fetchMock = jest.fn().mockResolvedValue(response);
  global.fetch = fetchMock as unknown as typeof fetch;

  return fetchMock;
}

// 기능 : Gmail raw 필드의 base64url MIME 문자열을 디코딩합니다.
function decodeBase64Url(value: string): string {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");

  return Buffer.from(padded, "base64").toString("utf8");
}
