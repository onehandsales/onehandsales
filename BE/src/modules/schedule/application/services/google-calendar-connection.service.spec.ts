import { ConfigService } from "@nestjs/config";
import type {
  DisconnectGoogleCalendarConnectionInput,
  DisconnectGoogleCalendarConnectionResult,
  GoogleCalendarConnectionRecord,
  GoogleCalendarConnectionRepository,
  GoogleCalendarConnectionStatusAggregate,
  UpsertConnectedGoogleCalendarConnectionInput,
} from "@/modules/schedule/application/ports/google-calendar-connection.repository";
import type { GoogleCalendarOAuthProvider } from "@/modules/schedule/application/ports/google-calendar-oauth.provider";
import type { GoogleCalendarTokenEncryptionPort } from "@/modules/schedule/application/ports/google-calendar-token-encryption.port";
import { GoogleCalendarTokenEncryptionKeyMissingError } from "@/modules/schedule/domain/google-calendar.errors";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import type { AppLogger } from "@/shared/infrastructure/logger/app-logger.service";
import { GoogleCalendarConnectionService } from "./google-calendar-connection.service";

const CURRENT_USER: CurrentUserContext = {
  id: "00000000-0000-4000-8000-000000000001",
  sessionId: "session-1",
  email: "user@example.com",
  displayName: "User",
  role: "USER",
  status: "ACTIVE",
  timeZone: "Asia/Seoul",
};

const CONNECTED_CONNECTION: GoogleCalendarConnectionRecord = {
  id: "connection-1",
  status: "CONNECTED",
  providerAccountId: "google-sub",
  providerAccountEmail: "sales@example.com",
  connectedAt: new Date("2026-07-23T01:00:00.000Z"),
  reconnectRequiredAt: null,
  disconnectedAt: null,
  lastSyncedAt: null,
  lastSyncStartedAt: null,
  lastSyncFailedAt: null,
  lastSyncErrorCode: null,
  syncLockExpiresAt: null,
  hasRefreshToken: true,
};

// 역할 : Google Calendar 연결 서비스 테스트용 저장소를 메모리에서 구현합니다.
class FakeGoogleCalendarConnectionRepository
  implements GoogleCalendarConnectionRepository
{
  connection: GoogleCalendarConnectionRecord | null = null;
  selectedCalendarCount = 0;
  availableCalendarCount = 0;
  upsertInput: UpsertConnectedGoogleCalendarConnectionInput | null = null;
  disconnectInput: DisconnectGoogleCalendarConnectionInput | null = null;
  disconnectResult: DisconnectGoogleCalendarConnectionResult | null = null;
  transactionCount = 0;

  // 기능 : fake transaction을 현재 저장소에서 즉시 실행합니다.
  async runInTransaction<T>(
    work: (repository: GoogleCalendarConnectionRepository) => Promise<T>
  ): Promise<T> {
    this.transactionCount += 1;
    return work(this);
  }

  async findConnection(): Promise<GoogleCalendarConnectionRecord | null> {
    return this.connection;
  }

  // 기능 : fake 연결 상태와 calendar source 수 집계를 반환합니다.
  async getStatusAggregate(): Promise<GoogleCalendarConnectionStatusAggregate> {
    return {
      connection: this.connection,
      selectedCalendarCount: this.selectedCalendarCount,
      availableCalendarCount: this.availableCalendarCount,
    };
  }

  // 기능 : OAuth 성공 입력을 저장하고 연결된 fake connection을 갱신합니다.
  async upsertConnectedConnection(
    input: UpsertConnectedGoogleCalendarConnectionInput
  ): Promise<GoogleCalendarConnectionRecord> {
    this.upsertInput = input;
    this.connection = {
      ...CONNECTED_CONNECTION,
      providerAccountEmail: input.providerAccountEmail,
      connectedAt: input.connectedAt,
      hasRefreshToken: true,
    };

    return this.connection;
  }

  // 기능 : 연결 해제 입력을 기록하고 미리 준비한 fake 결과를 반환합니다.
  async disconnectConnection(
    input: DisconnectGoogleCalendarConnectionInput
  ): Promise<DisconnectGoogleCalendarConnectionResult | null> {
    this.disconnectInput = input;
    return this.disconnectResult;
  }
}

// 기능 : Google Calendar 연결 서비스와 fake 의존성을 테스트용으로 조립합니다.
function createService(options: { readonly userWebOrigin?: string | null } = {}) {
  const repository = new FakeGoogleCalendarConnectionRepository();
  const oauthProvider: GoogleCalendarOAuthProvider = {
    createAuthorizationUrl: jest.fn((input) => {
      const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
      url.searchParams.set("state", input.state);
      url.searchParams.set("scope", input.scopes.join(" "));
      return url.toString();
    }),
    exchangeAuthorizationCode: jest.fn().mockResolvedValue({
      accessToken: "access-token",
      refreshToken: "refresh-token",
      idToken: "id-token",
      expiresInSeconds: 3600,
      grantedScopes: [
        "openid",
        "email",
        "https://www.googleapis.com/auth/calendar.readonly",
      ],
    }),
    verifyIdToken: jest.fn().mockResolvedValue({
      providerAccountId: "google-sub",
      email: "sales@example.com",
      emailVerified: true,
    }),
  };
  const tokenEncryption: GoogleCalendarTokenEncryptionPort = {
    assertReady: jest.fn(),
    encrypt: jest.fn((plaintext) => `enc:${plaintext}`),
    decrypt: jest.fn((ciphertext) => ciphertext.replace(/^enc:/, "")),
  };
  const logger = {
    log: jest.fn(),
  } as unknown as AppLogger;
  const configService = {
    get: jest.fn((key: string) => {
      if (key === "APP_JWT_SECRET") {
        return "state-secret";
      }

      if (key === "USER_WEB_ORIGIN") {
        return options.userWebOrigin === undefined
          ? "http://localhost:5173"
          : options.userWebOrigin;
      }

      return undefined;
    }),
  } as unknown as ConfigService;
  const service = new GoogleCalendarConnectionService(
    repository,
    oauthProvider,
    tokenEncryption,
    configService,
    logger
  );

  return {
    oauthProvider,
    repository,
    service,
    tokenEncryption,
  };
}

describe("GoogleCalendarConnectionService", () => {
  it("creates a signed Google OAuth URL with the fixed calendar scope", () => {
    const { oauthProvider, service, tokenEncryption } = createService();

    const response = service.startConnect(CURRENT_USER, {
      returnTo: "/app?account=settings",
    });
    const url = new URL(response.connectUrl);

    expect(response.returnTo).toBe("/app?account=settings");
    expect(url.searchParams.get("scope")).toContain(
      "https://www.googleapis.com/auth/calendar.readonly"
    );
    expect(url.searchParams.get("state")).toBeTruthy();
    expect(tokenEncryption.assertReady).toHaveBeenCalled();
    expect(oauthProvider.createAuthorizationUrl).toHaveBeenCalled();
  });

  it("falls back to schedules when an unapproved return path is requested", () => {
    const { service } = createService();

    const response = service.startConnect(CURRENT_USER, {
      returnTo: "/app/not-allowed",
    });

    expect(response.returnTo).toBe("/app/schedules");
  });

  it("handles callback by exchanging code, verifying identity, and storing encrypted tokens", async () => {
    const { repository, service } = createService();
    const connect = service.startConnect(CURRENT_USER, {
      returnTo: "/app/schedules",
    });
    const state = new URL(connect.connectUrl).searchParams.get("state") ?? "";

    const result = await service.handleCallback({
      code: "authorization-code",
      state,
    });

    expect(result.redirectTo).toBe(
      "http://localhost:5173/app/schedules?googleCalendar=connected"
    );
    expect(repository.upsertInput).toMatchObject({
      userId: CURRENT_USER.id,
      providerAccountId: "google-sub",
      providerAccountEmail: "sales@example.com",
      encryptedAccessToken: "enc:access-token",
      encryptedRefreshToken: "enc:refresh-token",
    });
  });

  it("reuses an existing refresh token only for the same Google account", async () => {
    const { oauthProvider, repository, service } = createService();
    repository.connection = {
      ...CONNECTED_CONNECTION,
      hasRefreshToken: true,
      providerAccountId: "google-sub",
    };
    jest.mocked(oauthProvider.exchangeAuthorizationCode).mockResolvedValueOnce({
      accessToken: "access-token",
      refreshToken: null,
      idToken: "id-token",
      expiresInSeconds: 3600,
      grantedScopes: [],
    });
    const connect = service.startConnect(CURRENT_USER, {
      returnTo: "/app/schedules",
    });
    const state = new URL(connect.connectUrl).searchParams.get("state") ?? "";

    const result = await service.handleCallback({
      code: "authorization-code",
      state,
    });

    expect(result.redirectTo).toBe(
      "http://localhost:5173/app/schedules?googleCalendar=connected"
    );
    expect(repository.upsertInput).toMatchObject({
      providerAccountId: "google-sub",
      encryptedAccessToken: "enc:access-token",
    });
    expect(repository.upsertInput).not.toHaveProperty("encryptedRefreshToken");
  });

  it("rejects refresh token reuse when the Google account changed", async () => {
    const { oauthProvider, repository, service } = createService();
    repository.connection = {
      ...CONNECTED_CONNECTION,
      hasRefreshToken: true,
      providerAccountId: "old-google-sub",
    };
    jest.mocked(oauthProvider.exchangeAuthorizationCode).mockResolvedValueOnce({
      accessToken: "access-token",
      refreshToken: null,
      idToken: "id-token",
      expiresInSeconds: 3600,
      grantedScopes: [],
    });
    const connect = service.startConnect(CURRENT_USER, {
      returnTo: "/app/schedules",
    });
    const state = new URL(connect.connectUrl).searchParams.get("state") ?? "";

    const result = await service.handleCallback({
      code: "authorization-code",
      state,
    });

    expect(result.redirectTo).toBe(
      "http://localhost:5173/app/schedules?googleCalendar=failed"
    );
    expect(repository.upsertInput).toBeNull();
  });

  it("fails callback redirect when USER_WEB_ORIGIN is missing", async () => {
    const { service } = createService({ userWebOrigin: null });
    const connect = service.startConnect(CURRENT_USER, {
      returnTo: "/app/schedules",
    });
    const state = new URL(connect.connectUrl).searchParams.get("state") ?? "";

    await expect(
      service.handleCallback({
        code: "authorization-code",
        state,
      })
    ).rejects.toThrow("USER_WEB_ORIGIN is missing");
  });

  it("rethrows callback token encryption key failures for the HTTP filter", async () => {
    const { service, tokenEncryption } = createService();
    const connect = service.startConnect(CURRENT_USER, {
      returnTo: "/app/schedules",
    });
    const state = new URL(connect.connectUrl).searchParams.get("state") ?? "";
    jest
      .mocked(tokenEncryption.assertReady)
      .mockImplementationOnce(() => {
        throw new GoogleCalendarTokenEncryptionKeyMissingError();
      });

    await expect(
      service.handleCallback({
        code: "authorization-code",
        state,
      })
    ).rejects.toThrow(GoogleCalendarTokenEncryptionKeyMissingError);
  });

});
