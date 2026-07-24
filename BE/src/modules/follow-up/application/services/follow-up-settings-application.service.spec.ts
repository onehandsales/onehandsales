import { randomUUID } from "node:crypto";
import { ConfigService } from "@nestjs/config";
import type {
  FollowUpEmailDeliveryProvider,
  FollowUpEmailTokenSet,
  FollowUpProviderDeliveryResult,
  FollowUpSmsDeliveryProvider,
  FollowUpSmsVerificationInput,
} from "@/modules/follow-up/application/ports/follow-up-delivery.provider";
import type {
  ConsumeOAuthStateAndUpsertConnectionInput,
  CreateFollowUpEmailOAuthStateInput,
  DisconnectFollowUpEmailConnectionInput,
  FindEmailConnectionInput,
  FindOAuthStateInput,
  FindSmsSenderNumberInput,
  FollowUpConsentNoticeRecord,
  FollowUpDeliverySettingsAggregate,
  FollowUpEmailConnectionRecord,
  FollowUpEmailOAuthStateRecord,
  FollowUpSettingsRepository,
  RevokeSmsSenderNumberInput,
  SmsSenderNumberRecord,
  UpsertFollowUpConsentNoticeInput,
  UpsertSmsSenderNumberVerificationInput,
  VerifySmsSenderNumberInput,
} from "@/modules/follow-up/application/ports/follow-up-settings.repository";
import {
  FollowUpEmailOAuthStateInvalidError,
  SmsSenderVerificationCodeInvalidError,
} from "@/modules/follow-up/domain/follow-up-delivery.errors";
import { NodeFollowUpDeliverySecretEncryptionService } from "@/modules/follow-up/infrastructure/security/node-follow-up-delivery-secret-encryption.service";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { FollowUpSettingsApplicationService } from "./follow-up-settings-application.service";

const USER: CurrentUserContext = {
  id: "00000000-0000-4000-8000-000000000101",
  sessionId: "00000000-0000-4000-8000-000000000201",
  email: "owner@example.com",
  displayName: "Owner",
  role: "USER",
  status: "ACTIVE",
  timeZone: "Asia/Seoul",
};

describe("FollowUpSettingsApplicationService", () => {
  it("stores only hashed OAuth state and rejects callback replay", async () => {
    const fixture = createFixture();

    const started = await fixture.service.startEmailConnection(USER, "google", {
      redirectUri: "https://api.example.test/follow-up/callback",
    });
    const authorizationUrl = new URL(started.authorizationUrl);
    const rawState = authorizationUrl.searchParams.get("state");

    expect(rawState).toBeTruthy();
    expect(fixture.repository.oauthStates).toHaveLength(1);
    expect(fixture.repository.oauthStates[0]?.stateHash).not.toBe(rawState);

    const connected = await fixture.service.handleEmailConnectionCallback(
      "google",
      {
        code: "provider-code-secret",
        state: rawState ?? "",
      }
    );

    expect(connected.connection).toMatchObject({
      provider: "GOOGLE",
      providerAccountEmail: "connected@example.com",
      status: "CONNECTED",
    });
    expect(fixture.repository.oauthStates[0]?.consumedAt).toBeInstanceOf(Date);
    expect(JSON.stringify(fixture.repository.emailConnections)).not.toContain(
      "provider-code-secret"
    );
    expect(JSON.stringify(fixture.repository.emailConnections)).not.toContain(
      rawState
    );
    await expect(
      fixture.service.handleEmailConnectionCallback("google", {
        code: "provider-code-secret",
        state: rawState ?? "",
      })
    ).rejects.toBeInstanceOf(FollowUpEmailOAuthStateInvalidError);
  });

  it("requests SMS verification without storing raw phone or code and prevents code reuse", async () => {
    const fixture = createFixture();
    const phoneE164 = "+821012345678";

    const requested =
      await fixture.service.requestSmsSenderNumberVerification(USER, {
        phoneE164,
      });
    const sentCode = fixture.smsProvider.lastVerificationCode;

    expect(requested.senderNumber).toMatchObject({
      phoneE164Masked: "+82******5678",
      status: "PENDING_VERIFICATION",
    });
    expect(sentCode).toMatch(/^\d{6}$/);
    expect(JSON.stringify(fixture.repository.smsSenderNumbers)).not.toContain(
      phoneE164
    );
    expect(JSON.stringify(fixture.repository.smsSenderNumbers)).not.toContain(
      sentCode
    );

    const verified = await fixture.service.verifySmsSenderNumber(
      USER,
      requested.senderNumber.id,
      {
        code: sentCode,
      }
    );

    expect(verified.status).toBe("VERIFIED");
    await expect(
      fixture.service.verifySmsSenderNumber(USER, requested.senderNumber.id, {
        code: sentCode,
      })
    ).rejects.toBeInstanceOf(SmsSenderVerificationCodeInvalidError);
  });

  it("returns masked settings and omits token/code/ciphertext fields", async () => {
    const fixture = createFixture();
    await fixture.service.startEmailConnection(USER, "microsoft", {
      redirectUri: "https://api.example.test/follow-up/callback",
    });
    const rawState = fixture.emailProvider.lastState;
    await fixture.service.handleEmailConnectionCallback("microsoft", {
      code: "microsoft-code-secret",
      state: rawState,
    });
    const requested =
      await fixture.service.requestSmsSenderNumberVerification(USER, {
        phoneE164: "+821012345678",
      });
    await fixture.service.acknowledgeConsentNotice(USER, "sms");

    const settings = await fixture.service.getSettings(USER);
    const serialized = JSON.stringify(settings);

    expect(settings.emailConnections[0]?.providerAccountEmail).toBe(
      "c*******d@example.com"
    );
    expect(settings.smsSenderNumbers[0]?.id).toBe(requested.senderNumber.id);
    expect(settings.consentNotices[0]).toMatchObject({ channel: "SMS" });
    expect(serialized).not.toContain("access-token-secret");
    expect(serialized).not.toContain("refresh-token-secret");
    expect(serialized).not.toContain("microsoft-code-secret");
    expect(serialized).not.toContain("+821012345678");
    expect(serialized).not.toContain("phoneE164Ciphertext");
    expect(serialized).not.toContain("verificationCodeHash");
  });
});

function createFixture() {
  const repository = new InMemoryFollowUpSettingsRepository();
  const emailProvider = new FakeEmailProvider();
  const smsProvider = new FakeSmsProvider();
  const encryption = new NodeFollowUpDeliverySecretEncryptionService(
    createConfigService()
  );
  const logger = {
    log: jest.fn(),
  };
  const service = new FollowUpSettingsApplicationService(
    repository,
    emailProvider,
    smsProvider,
    encryption,
    logger as never
  );

  return {
    repository,
    emailProvider,
    smsProvider,
    service,
  };
}

function createConfigService(): ConfigService {
  const values: Record<string, string> = {
    FOLLOW_UP_DELIVERY_ENCRYPTION_KEY: "follow-up-settings-test-key",
    FOLLOW_UP_DELIVERY_ENCRYPTION_KEY_VERSION: "v-test",
  };

  return {
    get: jest.fn((key: string) => values[key]),
  } as unknown as ConfigService;
}

class FakeEmailProvider implements FollowUpEmailDeliveryProvider {
  lastState = "";

  createAuthorizationUrl(input: {
    provider: "GOOGLE" | "MICROSOFT";
    state: string;
    redirectUri: string;
    scopes: readonly string[];
  }) {
    this.lastState = input.state;
    const url = new URL("https://oauth.example.test/authorize");
    url.searchParams.set("provider", input.provider);
    url.searchParams.set("state", input.state);
    url.searchParams.set("redirect_uri", input.redirectUri);

    return Promise.resolve({ authorizationUrl: url.toString() });
  }

  exchangeAuthorizationCode(): Promise<FollowUpEmailTokenSet> {
    return Promise.resolve({
      accessToken: "access-token-secret",
      refreshToken: "refresh-token-secret",
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      scopes: ["email"],
      providerAccountId: "provider-account-1",
      providerAccountEmail: "connected@example.com",
    });
  }

  refreshAccessToken(): Promise<FollowUpEmailTokenSet> {
    return this.exchangeAuthorizationCode();
  }

  revokeConnection(): Promise<void> {
    return Promise.resolve();
  }

  sendEmail(): Promise<FollowUpProviderDeliveryResult> {
    return Promise.resolve({
      ok: false,
      provider: "fake",
      safeErrorCode: "NotImplemented",
      safeErrorMessage: "Not implemented",
      retryable: false,
      detailJson: {},
    });
  }
}

class FakeSmsProvider implements FollowUpSmsDeliveryProvider {
  lastVerificationCode = "";

  sendVerificationCode(
    input: FollowUpSmsVerificationInput
  ): Promise<FollowUpProviderDeliveryResult> {
    this.lastVerificationCode = input.verificationCode;

    return Promise.resolve({
      ok: true,
      provider: "fake-sms",
      providerMessageId: "sms-verification-message-1",
    });
  }

  sendSms(): Promise<FollowUpProviderDeliveryResult> {
    return Promise.resolve({
      ok: false,
      provider: "fake-sms",
      safeErrorCode: "NotImplemented",
      safeErrorMessage: "Not implemented",
      retryable: false,
      detailJson: {},
    });
  }
}

class InMemoryFollowUpSettingsRepository implements FollowUpSettingsRepository {
  oauthStates: FollowUpEmailOAuthStateRecord[] = [];
  emailConnections: FollowUpEmailConnectionRecord[] = [];
  smsSenderNumbers: SmsSenderNumberRecord[] = [];
  consentNotices: FollowUpConsentNoticeRecord[] = [];

  runInTransaction<T>(
    work: (repository: FollowUpSettingsRepository) => Promise<T>
  ): Promise<T> {
    return work(this);
  }

  getSettingsAggregate(
    userId: string
  ): Promise<FollowUpDeliverySettingsAggregate> {
    return Promise.resolve({
      emailConnections: this.emailConnections.filter(
        (connection) => connection.userId === userId
      ),
      smsSenderNumbers: this.smsSenderNumbers.filter(
        (senderNumber) => senderNumber.userId === userId
      ),
      consentNotices: this.consentNotices.filter(
        (notice) => notice.userId === userId
      ),
    });
  }

  createEmailOAuthState(
    input: CreateFollowUpEmailOAuthStateInput
  ): Promise<FollowUpEmailOAuthStateRecord> {
    for (const state of this.oauthStates) {
      if (
        state.userId === input.userId &&
        state.provider === input.provider &&
        state.consumedAt === null &&
        state.expiresAt.getTime() > input.now.getTime()
      ) {
        Object.assign(state, { consumedAt: input.now });
      }
    }

    const state: FollowUpEmailOAuthStateRecord = {
      id: randomUUID(),
      userId: input.userId,
      provider: input.provider,
      stateHash: input.stateHash,
      redirectUri: input.redirectUri,
      expiresAt: input.expiresAt,
      consumedAt: null,
      createdAt: input.now,
      updatedAt: input.now,
    };
    this.oauthStates.push(state);

    return Promise.resolve(state);
  }

  findUsableEmailOAuthState(
    input: FindOAuthStateInput
  ): Promise<FollowUpEmailOAuthStateRecord | null> {
    const state =
      this.oauthStates.find(
        (candidate) =>
          candidate.provider === input.provider &&
          candidate.stateHash === input.stateHash &&
          candidate.consumedAt === null &&
          candidate.expiresAt.getTime() > input.now.getTime()
      ) ?? null;

    return Promise.resolve(state);
  }

  consumeOAuthStateAndUpsertEmailConnection(
    input: ConsumeOAuthStateAndUpsertConnectionInput
  ): Promise<FollowUpEmailConnectionRecord | null> {
    const state = this.oauthStates.find(
      (candidate) =>
        candidate.id === input.stateId &&
        candidate.consumedAt === null &&
        candidate.expiresAt.getTime() > input.now.getTime()
    );

    if (!state) {
      return Promise.resolve(null);
    }

    Object.assign(state, { consumedAt: input.now });
    const existingIndex = this.emailConnections.findIndex(
      (connection) =>
        connection.userId === input.connection.userId &&
        connection.provider === input.connection.provider
    );
    const existing =
      existingIndex >= 0 ? this.emailConnections[existingIndex] : undefined;
    const connection: FollowUpEmailConnectionRecord = {
      id: existing?.id ?? randomUUID(),
      userId: input.connection.userId,
      provider: input.connection.provider,
      providerAccountId: input.connection.providerAccountId,
      providerAccountEmail: input.connection.providerAccountEmail,
      status: "CONNECTED",
      encryptedAccessToken: input.connection.encryptedAccessToken,
      encryptedRefreshToken:
        input.connection.encryptedRefreshToken ??
        existing?.encryptedRefreshToken ??
        null,
      tokenExpiresAt: input.connection.tokenExpiresAt,
      grantedScopes: input.connection.grantedScopes,
      connectedAt: input.connection.connectedAt,
      disconnectedAt: null,
      reconnectRequiredAt: null,
      lastSentAt: null,
      lastSendSafeErrorCode: null,
      createdAt: existing?.createdAt ?? input.now,
      updatedAt: input.now,
    };

    if (existingIndex >= 0) {
      this.emailConnections[existingIndex] = connection;
    } else {
      this.emailConnections.push(connection);
    }

    return Promise.resolve(connection);
  }

  findEmailConnectionForUser(
    input: FindEmailConnectionInput
  ): Promise<FollowUpEmailConnectionRecord | null> {
    return Promise.resolve(
      this.emailConnections.find(
        (connection) =>
          connection.id === input.connectionId &&
          connection.userId === input.userId
      ) ?? null
    );
  }

  disconnectEmailConnection(
    input: DisconnectFollowUpEmailConnectionInput
  ): Promise<FollowUpEmailConnectionRecord | null> {
    const connection = this.emailConnections.find(
      (candidate) =>
        candidate.id === input.connectionId && candidate.userId === input.userId
    );

    if (!connection) {
      return Promise.resolve(null);
    }

    Object.assign(connection, {
      status: "DISCONNECTED",
      encryptedAccessToken: null,
      encryptedRefreshToken: null,
      disconnectedAt: input.disconnectedAt,
      reconnectRequiredAt: null,
      updatedAt: input.disconnectedAt,
    });

    return Promise.resolve(connection);
  }

  upsertSmsSenderNumberVerification(
    input: UpsertSmsSenderNumberVerificationInput
  ): Promise<SmsSenderNumberRecord> {
    const existingIndex = this.smsSenderNumbers.findIndex(
      (senderNumber) =>
        senderNumber.userId === input.userId &&
        senderNumber.phoneE164Hash === input.phoneE164Hash
    );
    const existing =
      existingIndex >= 0 ? this.smsSenderNumbers[existingIndex] : undefined;
    const senderNumber: SmsSenderNumberRecord = {
      id: existing?.id ?? randomUUID(),
      userId: input.userId,
      phoneE164Hash: input.phoneE164Hash,
      phoneE164Ciphertext: input.phoneE164Ciphertext,
      phoneE164Masked: input.phoneE164Masked,
      status: "PENDING_VERIFICATION",
      provider: input.provider,
      providerSenderId: input.providerSenderId,
      verificationCodeHash: input.verificationCodeHash,
      verificationExpiresAt: input.verificationExpiresAt,
      verifiedAt: null,
      revokedAt: null,
      lastSentAt: null,
      lastSendSafeErrorCode: null,
      createdAt: existing?.createdAt ?? input.now,
      updatedAt: input.now,
    };

    if (existingIndex >= 0) {
      this.smsSenderNumbers[existingIndex] = senderNumber;
    } else {
      this.smsSenderNumbers.push(senderNumber);
    }

    return Promise.resolve(senderNumber);
  }

  findSmsSenderNumberForUser(
    input: FindSmsSenderNumberInput
  ): Promise<SmsSenderNumberRecord | null> {
    return Promise.resolve(
      this.smsSenderNumbers.find(
        (senderNumber) =>
          senderNumber.id === input.senderNumberId &&
          senderNumber.userId === input.userId
      ) ?? null
    );
  }

  markSmsSenderNumberVerified(
    input: VerifySmsSenderNumberInput
  ): Promise<SmsSenderNumberRecord | null> {
    const senderNumber = this.smsSenderNumbers.find(
      (candidate) =>
        candidate.id === input.senderNumberId &&
        candidate.userId === input.userId
    );

    if (!senderNumber) {
      return Promise.resolve(null);
    }

    Object.assign(senderNumber, {
      status: "VERIFIED",
      verifiedAt: input.verifiedAt,
      verificationCodeHash: null,
      verificationExpiresAt: null,
      revokedAt: null,
      updatedAt: input.verifiedAt,
    });

    return Promise.resolve(senderNumber);
  }

  revokeSmsSenderNumber(
    input: RevokeSmsSenderNumberInput
  ): Promise<SmsSenderNumberRecord | null> {
    const senderNumber = this.smsSenderNumbers.find(
      (candidate) =>
        candidate.id === input.senderNumberId &&
        candidate.userId === input.userId
    );

    if (!senderNumber) {
      return Promise.resolve(null);
    }

    Object.assign(senderNumber, {
      status: "REVOKED",
      revokedAt: input.revokedAt,
      verificationCodeHash: null,
      verificationExpiresAt: null,
      updatedAt: input.revokedAt,
    });

    return Promise.resolve(senderNumber);
  }

  upsertConsentNotice(
    input: UpsertFollowUpConsentNoticeInput
  ): Promise<FollowUpConsentNoticeRecord> {
    const existingIndex = this.consentNotices.findIndex(
      (notice) => notice.userId === input.userId && notice.channel === input.channel
    );
    const existing =
      existingIndex >= 0 ? this.consentNotices[existingIndex] : undefined;
    const notice: FollowUpConsentNoticeRecord = {
      id: existing?.id ?? randomUUID(),
      userId: input.userId,
      channel: input.channel,
      acknowledgedAt: input.acknowledgedAt,
      createdAt: existing?.createdAt ?? input.acknowledgedAt,
      updatedAt: input.acknowledgedAt,
    };

    if (existingIndex >= 0) {
      this.consentNotices[existingIndex] = notice;
    } else {
      this.consentNotices.push(notice);
    }

    return Promise.resolve(notice);
  }
}
