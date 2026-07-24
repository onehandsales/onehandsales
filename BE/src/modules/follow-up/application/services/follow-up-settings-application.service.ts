import { randomInt, randomUUID, timingSafeEqual } from "node:crypto";
import { Inject, Injectable } from "@nestjs/common";
import {
  FOLLOW_UP_EMAIL_DELIVERY_PROVIDER,
  FOLLOW_UP_SMS_DELIVERY_PROVIDER,
  type ExternalEmailProviderValue,
  type FollowUpEmailDeliveryProvider,
  type FollowUpSmsDeliveryProvider,
} from "@/modules/follow-up/application/ports/follow-up-delivery.provider";
import {
  FOLLOW_UP_DELIVERY_SECRET_ENCRYPTION_PORT,
  type FollowUpDeliverySecretEncryptionPort,
} from "@/modules/follow-up/application/ports/follow-up-delivery-secret-encryption.port";
import {
  FOLLOW_UP_SETTINGS_REPOSITORY,
  type FollowUpDeliveryChannelValue,
  type FollowUpEmailConnectionRecord,
  type FollowUpSettingsRepository,
  type SmsSenderNumberRecord,
} from "@/modules/follow-up/application/ports/follow-up-settings.repository";
import {
  FollowUpEmailConnectionNotFoundError,
  FollowUpEmailOAuthStateInvalidError,
  FollowUpProviderRequestFailedError,
  SmsSenderNumberNotFoundError,
  SmsSenderVerificationCodeInvalidError,
  SmsSenderVerificationExpiredError,
} from "@/modules/follow-up/domain/follow-up-delivery.errors";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { ValidationDomainError } from "@/shared/domain/errors/common.errors";
import { AppLogger } from "@/shared/infrastructure/logger/app-logger.service";

const OAUTH_STATE_TTL_MS = 10 * 60 * 1000;
const SMS_VERIFICATION_TTL_MS = 10 * 60 * 1000;
const MAX_REDIRECT_URI_LENGTH = 2048;
const E164_REGEX = /^\+[1-9]\d{7,14}$/;
const VERIFICATION_CODE_REGEX = /^\d{4,8}$/;
const GOOGLE_SCOPES = [
  "openid",
  "email",
  "https://www.googleapis.com/auth/gmail.send",
] as const;
const MICROSOFT_SCOPES = [
  "openid",
  "email",
  "offline_access",
  "User.Read",
  "Mail.Send",
] as const;

export interface StartEmailConnectionCommand {
  readonly redirectUri?: unknown;
}

export interface EmailConnectionCallbackCommand {
  readonly code?: unknown;
  readonly state?: unknown;
}

export interface RequestSmsSenderNumberVerificationCommand {
  readonly phoneE164?: unknown;
}

export interface VerifySmsSenderNumberCommand {
  readonly code?: unknown;
}

export interface FollowUpDeliverySettingsResponse {
  readonly emailConnections: readonly FollowUpEmailConnectionSettingsResponse[];
  readonly smsSenderNumbers: readonly SmsSenderNumberResponse[];
  readonly consentNotices: readonly FollowUpConsentNoticeResponse[];
}

export interface FollowUpEmailConnectionSettingsResponse {
  readonly id: string;
  readonly provider: ExternalEmailProviderValue;
  readonly providerAccountEmail: string;
  readonly status: string;
  readonly connectedAt: string;
  readonly reconnectRequiredAt: string | null;
  readonly disconnectedAt: string | null;
}

export interface StartEmailConnectionResponse {
  readonly authorizationUrl: string;
  readonly stateExpiresAt: string;
}

export interface EmailConnectionResponse {
  readonly id: string;
  readonly provider: ExternalEmailProviderValue;
  readonly providerAccountEmail: string;
  readonly status: string;
  readonly connectedAt?: string;
  readonly disconnectedAt?: string | null;
}

export interface EmailConnectionCallbackResponse {
  readonly connection: EmailConnectionResponse;
}

export interface SmsSenderNumberVerificationRequestedResponse {
  readonly senderNumber: SmsSenderNumberVerificationResponse;
}

export interface SmsSenderNumberVerificationResponse {
  readonly id: string;
  readonly phoneE164Masked: string;
  readonly status: string;
  readonly verificationExpiresAt: string | null;
}

export interface SmsSenderNumberResponse {
  readonly id: string;
  readonly phoneE164Masked: string;
  readonly status: string;
  readonly verifiedAt: string | null;
  readonly revokedAt: string | null;
  readonly verificationExpiresAt: string | null;
}

export interface FollowUpConsentNoticeResponse {
  readonly channel: FollowUpDeliveryChannelValue;
  readonly acknowledgedAt: string;
}

@Injectable()
export class FollowUpSettingsApplicationService {
  constructor(
    @Inject(FOLLOW_UP_SETTINGS_REPOSITORY)
    private readonly repository: FollowUpSettingsRepository,
    @Inject(FOLLOW_UP_EMAIL_DELIVERY_PROVIDER)
    private readonly emailProvider: FollowUpEmailDeliveryProvider,
    @Inject(FOLLOW_UP_SMS_DELIVERY_PROVIDER)
    private readonly smsProvider: FollowUpSmsDeliveryProvider,
    @Inject(FOLLOW_UP_DELIVERY_SECRET_ENCRYPTION_PORT)
    private readonly secretEncryption: FollowUpDeliverySecretEncryptionPort,
    private readonly logger: AppLogger
  ) {}

  async getSettings(
    currentUser: CurrentUserContext
  ): Promise<FollowUpDeliverySettingsResponse> {
    const aggregate = await this.repository.getSettingsAggregate(currentUser.id);

    this.logEvent("followUp.settings.viewed", {
      userId: currentUser.id,
      emailConnectionCount: aggregate.emailConnections.length,
      smsSenderNumberCount: aggregate.smsSenderNumbers.length,
      consentNoticeCount: aggregate.consentNotices.length,
    });

    return {
      emailConnections: aggregate.emailConnections.map((connection) =>
        this.toEmailConnectionSettingsResponse(connection)
      ),
      smsSenderNumbers: aggregate.smsSenderNumbers.map((senderNumber) =>
        this.toSmsSenderNumberResponse(senderNumber)
      ),
      consentNotices: aggregate.consentNotices.map((notice) => ({
        channel: notice.channel,
        acknowledgedAt: notice.acknowledgedAt.toISOString(),
      })),
    };
  }

  async startEmailConnection(
    currentUser: CurrentUserContext,
    providerInput: string,
    input: StartEmailConnectionCommand
  ): Promise<StartEmailConnectionResponse> {
    this.secretEncryption.assertReady();
    const provider = this.normalizeEmailProvider(providerInput);
    const redirectUri = this.normalizeRedirectUri(input.redirectUri);
    const now = new Date();
    const stateExpiresAt = new Date(now.getTime() + OAUTH_STATE_TTL_MS);
    const state = randomUUID();
    const stateHash = this.secretEncryption.hashOAuthState(state);
    const authorization = await this.emailProvider.createAuthorizationUrl({
      provider,
      state,
      redirectUri,
      scopes: this.getEmailScopes(provider),
    });

    await this.repository.runInTransaction((repository) =>
      repository.createEmailOAuthState({
        userId: currentUser.id,
        provider,
        stateHash,
        redirectUri,
        expiresAt: stateExpiresAt,
        now,
      })
    );

    this.logEvent("followUp.emailConnection.connectStarted", {
      userId: currentUser.id,
      provider,
      stateExpiresAt: stateExpiresAt.toISOString(),
    });

    return {
      authorizationUrl: authorization.authorizationUrl,
      stateExpiresAt: stateExpiresAt.toISOString(),
    };
  }

  async handleEmailConnectionCallback(
    providerInput: string,
    input: EmailConnectionCallbackCommand
  ): Promise<EmailConnectionCallbackResponse> {
    this.secretEncryption.assertReady();
    const provider = this.normalizeEmailProvider(providerInput);
    const code = this.normalizeRequiredText(input.code, "code");
    const state = this.normalizeRequiredText(input.state, "state");
    const now = new Date();
    const stateRecord = await this.repository.findUsableEmailOAuthState({
      provider,
      stateHash: this.secretEncryption.hashOAuthState(state),
      now,
    });

    if (!stateRecord) {
      this.logEvent("followUp.emailConnection.callbackRejected", {
        provider,
        errorCode: "FollowUpEmailOAuthStateInvalid",
      });
      throw new FollowUpEmailOAuthStateInvalidError();
    }

    const tokenSet = await this.emailProvider.exchangeAuthorizationCode({
      provider,
      code,
      redirectUri: stateRecord.redirectUri,
    });
    const encryptedAccessToken = this.secretEncryption.encryptEmailToken(
      tokenSet.accessToken
    ).ciphertext;
    const encryptedRefreshToken = tokenSet.refreshToken
      ? this.secretEncryption.encryptEmailToken(tokenSet.refreshToken).ciphertext
      : undefined;
    const connection = await this.repository.runInTransaction((repository) =>
      repository.consumeOAuthStateAndUpsertEmailConnection({
        stateId: stateRecord.id,
        now: new Date(),
        connection: {
          userId: stateRecord.userId,
          provider,
          providerAccountId: tokenSet.providerAccountId ?? null,
          providerAccountEmail: tokenSet.providerAccountEmail,
          encryptedAccessToken,
          ...(encryptedRefreshToken ? { encryptedRefreshToken } : {}),
          tokenExpiresAt: tokenSet.expiresAt ?? null,
          grantedScopes: tokenSet.scopes,
          connectedAt: new Date(),
        },
      })
    );

    if (!connection) {
      this.logEvent("followUp.emailConnection.callbackRejected", {
        provider,
        errorCode: "FollowUpEmailOAuthStateInvalid",
      });
      throw new FollowUpEmailOAuthStateInvalidError();
    }

    this.logEvent("followUp.emailConnection.connected", {
      userId: connection.userId,
      provider,
      connectionId: connection.id,
    });

    return {
      connection: this.toEmailConnectionResponse(connection, false),
    };
  }

  async disconnectEmailConnection(
    currentUser: CurrentUserContext,
    connectionId: string
  ): Promise<EmailConnectionResponse> {
    const connection = await this.repository.findEmailConnectionForUser({
      userId: currentUser.id,
      connectionId,
    });

    if (!connection) {
      throw new FollowUpEmailConnectionNotFoundError();
    }

    await this.revokeProviderConnectionIfPossible(connection);
    const disconnected = await this.repository.runInTransaction((repository) =>
      repository.disconnectEmailConnection({
        userId: currentUser.id,
        connectionId,
        disconnectedAt: new Date(),
      })
    );

    if (!disconnected) {
      throw new FollowUpEmailConnectionNotFoundError();
    }

    this.logEvent("followUp.emailConnection.disconnected", {
      userId: currentUser.id,
      provider: disconnected.provider,
      connectionId,
    });

    return this.toEmailConnectionResponse(disconnected, false);
  }

  async requestSmsSenderNumberVerification(
    currentUser: CurrentUserContext,
    input: RequestSmsSenderNumberVerificationCommand
  ): Promise<SmsSenderNumberVerificationRequestedResponse> {
    this.secretEncryption.assertReady();
    const phoneE164 = this.normalizePhoneE164(input.phoneE164);
    const verificationCode = this.createVerificationCode();
    const encrypted = this.secretEncryption.encryptSmsSenderNumber(phoneE164);
    const now = new Date();
    const verificationExpiresAt = new Date(
      now.getTime() + SMS_VERIFICATION_TTL_MS
    );
    const result = await this.smsProvider.sendVerificationCode({
      senderPhoneE164: phoneE164,
      verificationCode,
      locale: "ko-KR",
      idempotencyKey: randomUUID(),
    });

    if (!result.ok) {
      throw new FollowUpProviderRequestFailedError(result.safeErrorMessage);
    }

    const verificationCodeHash =
      this.secretEncryption.hashSmsVerificationCode({
        code: verificationCode,
        senderNumberId: encrypted.phoneE164Hash,
      }).verificationCodeHash;
    const senderNumber = await this.repository.runInTransaction((repository) =>
      repository.upsertSmsSenderNumberVerification({
        userId: currentUser.id,
        phoneE164Hash: encrypted.phoneE164Hash,
        phoneE164Ciphertext: encrypted.phoneE164Ciphertext,
        phoneE164Masked: encrypted.phoneE164Masked,
        provider: result.provider,
        providerSenderId: result.providerMessageId ?? null,
        verificationCodeHash,
        verificationExpiresAt,
        now,
      })
    );

    this.logEvent("followUp.smsSender.verificationRequested", {
      userId: currentUser.id,
      senderNumberId: senderNumber.id,
      provider: result.provider,
    });

    return {
      senderNumber: this.toSmsSenderNumberVerificationResponse(senderNumber),
    };
  }

  async verifySmsSenderNumber(
    currentUser: CurrentUserContext,
    senderNumberId: string,
    input: VerifySmsSenderNumberCommand
  ): Promise<SmsSenderNumberResponse> {
    const code = this.normalizeVerificationCode(input.code);
    const verified = await this.repository.runInTransaction(
      async (repository) => {
        const senderNumber = await repository.findSmsSenderNumberForUser({
          userId: currentUser.id,
          senderNumberId,
        });

        if (!senderNumber) {
          throw new SmsSenderNumberNotFoundError();
        }

        this.assertVerificationCodeMatches(senderNumber, code);
        const updated = await repository.markSmsSenderNumberVerified({
          userId: currentUser.id,
          senderNumberId,
          verifiedAt: new Date(),
        });

        if (!updated) {
          throw new SmsSenderNumberNotFoundError();
        }

        return updated;
      }
    );

    this.logEvent("followUp.smsSender.verified", {
      userId: currentUser.id,
      senderNumberId,
    });

    return this.toSmsSenderNumberResponse(verified);
  }

  async revokeSmsSenderNumber(
    currentUser: CurrentUserContext,
    senderNumberId: string
  ): Promise<SmsSenderNumberResponse> {
    const revoked = await this.repository.runInTransaction(
      async (repository) => {
        const existing = await repository.findSmsSenderNumberForUser({
          userId: currentUser.id,
          senderNumberId,
        });

        if (!existing) {
          throw new SmsSenderNumberNotFoundError();
        }

        const updated = await repository.revokeSmsSenderNumber({
          userId: currentUser.id,
          senderNumberId,
          revokedAt: new Date(),
        });

        if (!updated) {
          throw new SmsSenderNumberNotFoundError();
        }

        return updated;
      }
    );

    this.logEvent("followUp.smsSender.revoked", {
      userId: currentUser.id,
      senderNumberId,
    });

    return this.toSmsSenderNumberResponse(revoked);
  }

  async acknowledgeConsentNotice(
    currentUser: CurrentUserContext,
    channelInput: string
  ): Promise<FollowUpConsentNoticeResponse> {
    const channel = this.normalizeChannel(channelInput);
    const notice = await this.repository.runInTransaction((repository) =>
      repository.upsertConsentNotice({
        userId: currentUser.id,
        channel,
        acknowledgedAt: new Date(),
      })
    );

    this.logEvent("followUp.consentNotice.acknowledged", {
      userId: currentUser.id,
      channel,
    });

    return {
      channel: notice.channel,
      acknowledgedAt: notice.acknowledgedAt.toISOString(),
    };
  }

  private assertVerificationCodeMatches(
    senderNumber: SmsSenderNumberRecord,
    code: string
  ): void {
    if (
      senderNumber.status !== "PENDING_VERIFICATION" ||
      !senderNumber.verificationCodeHash ||
      !senderNumber.verificationExpiresAt
    ) {
      throw new SmsSenderVerificationCodeInvalidError();
    }

    if (senderNumber.verificationExpiresAt.getTime() <= Date.now()) {
      throw new SmsSenderVerificationExpiredError();
    }

    const expected =
      this.secretEncryption.hashSmsVerificationCode({
        code,
        senderNumberId: senderNumber.phoneE164Hash,
      }).verificationCodeHash;

    if (!this.safeEqual(expected, senderNumber.verificationCodeHash)) {
      throw new SmsSenderVerificationCodeInvalidError();
    }
  }

  private async revokeProviderConnectionIfPossible(
    connection: FollowUpEmailConnectionRecord
  ): Promise<void> {
    if (!connection.encryptedAccessToken) {
      return;
    }

    try {
      await this.emailProvider.revokeConnection({
        provider: connection.provider,
        accessToken: this.secretEncryption.decryptEmailToken({
          ciphertext: connection.encryptedAccessToken,
        }),
        ...(connection.encryptedRefreshToken
          ? {
              refreshToken: this.secretEncryption.decryptEmailToken({
                ciphertext: connection.encryptedRefreshToken,
              }),
            }
          : {}),
      });
    } catch (error) {
      this.logEvent("followUp.emailConnection.revokeProviderFailed", {
        userId: connection.userId,
        provider: connection.provider,
        connectionId: connection.id,
        errorCode:
          error instanceof Error
            ? error.name
            : "FollowUpProviderRequestFailed",
      });
    }
  }

  private normalizeEmailProvider(value: string): ExternalEmailProviderValue {
    const normalized = value.trim().toUpperCase();

    if (normalized === "GOOGLE" || normalized === "MICROSOFT") {
      return normalized;
    }

    throw new ValidationDomainError("provider must be google or microsoft");
  }

  private normalizeChannel(value: string): FollowUpDeliveryChannelValue {
    const normalized = value.trim().toUpperCase();

    if (normalized === "EMAIL" || normalized === "SMS") {
      return normalized;
    }

    throw new ValidationDomainError("channel must be email or sms");
  }

  private normalizeRedirectUri(value: unknown): string {
    const redirectUri = this.normalizeRequiredText(value, "redirectUri");

    if (redirectUri.length > MAX_REDIRECT_URI_LENGTH) {
      throw new ValidationDomainError("redirectUri is too long");
    }

    try {
      const url = new URL(redirectUri);
      if (url.protocol !== "https:" && url.protocol !== "http:") {
        throw new Error("Invalid protocol");
      }

      return url.toString();
    } catch {
      throw new ValidationDomainError("redirectUri must be a valid URL");
    }
  }

  private normalizePhoneE164(value: unknown): string {
    const phoneE164 = this.normalizeRequiredText(value, "phoneE164");

    if (!E164_REGEX.test(phoneE164)) {
      throw new ValidationDomainError("phoneE164 must be valid E.164");
    }

    return phoneE164;
  }

  private normalizeVerificationCode(value: unknown): string {
    const code = this.normalizeRequiredText(value, "code");

    if (!VERIFICATION_CODE_REGEX.test(code)) {
      throw new ValidationDomainError("code must be 4 to 8 digits");
    }

    return code;
  }

  private normalizeRequiredText(value: unknown, fieldName: string): string {
    if (typeof value !== "string") {
      throw new ValidationDomainError(`${fieldName} must be a string`);
    }

    const normalized = value.trim();

    if (normalized.length === 0) {
      throw new ValidationDomainError(`${fieldName} is required`);
    }

    return normalized;
  }

  private createVerificationCode(): string {
    return String(randomInt(100_000, 1_000_000));
  }

  private safeEqual(left: string, right: string): boolean {
    const leftBuffer = Buffer.from(left);
    const rightBuffer = Buffer.from(right);

    return (
      leftBuffer.length === rightBuffer.length &&
      timingSafeEqual(leftBuffer, rightBuffer)
    );
  }

  private getEmailScopes(
    provider: ExternalEmailProviderValue
  ): readonly string[] {
    return provider === "GOOGLE" ? GOOGLE_SCOPES : MICROSOFT_SCOPES;
  }

  private toEmailConnectionSettingsResponse(
    connection: FollowUpEmailConnectionRecord
  ): FollowUpEmailConnectionSettingsResponse {
    return {
      id: connection.id,
      provider: connection.provider,
      providerAccountEmail: this.maskEmail(connection.providerAccountEmail),
      status: connection.status,
      connectedAt: connection.connectedAt.toISOString(),
      reconnectRequiredAt: connection.reconnectRequiredAt?.toISOString() ?? null,
      disconnectedAt: connection.disconnectedAt?.toISOString() ?? null,
    };
  }

  private toEmailConnectionResponse(
    connection: FollowUpEmailConnectionRecord,
    maskEmail: boolean
  ): EmailConnectionResponse {
    return {
      id: connection.id,
      provider: connection.provider,
      providerAccountEmail: maskEmail
        ? this.maskEmail(connection.providerAccountEmail)
        : connection.providerAccountEmail,
      status: connection.status,
      connectedAt: connection.connectedAt.toISOString(),
      disconnectedAt: connection.disconnectedAt?.toISOString() ?? null,
    };
  }

  private toSmsSenderNumberVerificationResponse(
    senderNumber: SmsSenderNumberRecord
  ): SmsSenderNumberVerificationResponse {
    return {
      id: senderNumber.id,
      phoneE164Masked: senderNumber.phoneE164Masked,
      status: senderNumber.status,
      verificationExpiresAt:
        senderNumber.verificationExpiresAt?.toISOString() ?? null,
    };
  }

  private toSmsSenderNumberResponse(
    senderNumber: SmsSenderNumberRecord
  ): SmsSenderNumberResponse {
    return {
      id: senderNumber.id,
      phoneE164Masked: senderNumber.phoneE164Masked,
      status: senderNumber.status,
      verifiedAt: senderNumber.verifiedAt?.toISOString() ?? null,
      revokedAt: senderNumber.revokedAt?.toISOString() ?? null,
      verificationExpiresAt:
        senderNumber.verificationExpiresAt?.toISOString() ?? null,
    };
  }

  private maskEmail(email: string): string {
    const [localPart, domain] = email.split("@");

    if (!localPart || !domain) {
      return "***";
    }

    const visiblePrefix = localPart.slice(0, 1);
    const visibleSuffix =
      localPart.length > 3 ? localPart.slice(-1) : "";

    return `${visiblePrefix}${"*".repeat(
      Math.max(localPart.length - visiblePrefix.length - visibleSuffix.length, 3)
    )}${visibleSuffix}@${domain}`;
  }

  private logEvent(event: string, fields: Record<string, unknown>): void {
    this.logger.log(
      JSON.stringify({
        event,
        ...fields,
      }),
      "FollowUpSettingsApplicationService"
    );
  }
}
