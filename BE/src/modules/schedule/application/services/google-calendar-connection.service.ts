import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { CancelScheduleNotificationReminderUseCase } from "@/modules/notification/application/use-cases/notification-reminder-scheduling.use-cases";
import {
  GOOGLE_CALENDAR_CONNECTION_REPOSITORY,
  type GoogleCalendarConnectionRecord,
  type GoogleCalendarConnectionRepository,
  type GoogleCalendarDisconnectScheduleAction,
} from "@/modules/schedule/application/ports/google-calendar-connection.repository";
import {
  GOOGLE_CALENDAR_OAUTH_PROVIDER,
  type GoogleCalendarOAuthProvider,
} from "@/modules/schedule/application/ports/google-calendar-oauth.provider";
import {
  GOOGLE_CALENDAR_TOKEN_ENCRYPTION_PORT,
  type GoogleCalendarTokenEncryptionPort,
} from "@/modules/schedule/application/ports/google-calendar-token-encryption.port";
import {
  GoogleCalendarConnectionNotFoundError,
  GoogleCalendarOAuthStateInvalidError,
  GoogleCalendarProviderUnavailableError,
  GoogleCalendarTokenEncryptionKeyMissingError,
} from "@/modules/schedule/domain/google-calendar.errors";
import { createTrashRetentionTimestamps } from "@/shared/application/trash/trash-retention";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { AppLogger } from "@/shared/infrastructure/logger/app-logger.service";

const GOOGLE_CALENDAR_SCOPES = [
  "openid",
  "email",
  "https://www.googleapis.com/auth/calendar.readonly",
] as const;
const RETURN_TO_ALLOWLIST = new Set(["/app/schedules", "/app/settings"]);
const DEFAULT_RETURN_TO = "/app/schedules";
const STATE_TTL_MS = 10 * 60 * 1000;
const AUTO_SYNC_FRESHNESS_MINUTES = 10;
const MINUTE_MS = 60_000;

interface GoogleCalendarOAuthStatePayload {
  readonly userId: string;
  readonly returnTo: string;
  readonly nonce: string;
  readonly issuedAt: string;
  readonly expiresAt: string;
}

export interface StartGoogleCalendarConnectCommand {
  readonly returnTo?: string;
}

export interface StartGoogleCalendarConnectResponse {
  readonly connectUrl: string;
  readonly expiresAt: string;
  readonly returnTo: string;
}

export interface HandleGoogleCalendarCallbackCommand {
  readonly code?: string;
  readonly state?: string;
  readonly error?: string;
}

export interface HandleGoogleCalendarCallbackResponse {
  readonly redirectTo: string;
}

export interface GoogleCalendarStatusResponse {
  readonly connected: boolean;
  readonly connection: GoogleCalendarConnectionResponse | null;
  readonly selectedCalendarCount: number;
  readonly availableCalendarCount: number;
  readonly autoSync: {
    readonly enabled: boolean;
    readonly freshnessMinutes: number;
    readonly shouldSyncOnScheduleEntry: boolean;
    readonly nextAutoSyncAvailableAt: string | null;
  };
}

export interface GoogleCalendarConnectionResponse {
  readonly provider: "GOOGLE";
  readonly status: string;
  readonly providerAccountEmail: string | null;
  readonly connectedAt: string | null;
  readonly reconnectRequiredAt: string | null;
  readonly disconnectedAt: string | null;
  readonly lastSyncedAt: string | null;
  readonly lastSyncStartedAt: string | null;
  readonly lastSyncFailedAt: string | null;
  readonly lastSyncErrorCode: string | null;
  readonly syncLockExpiresAt: string | null;
}

export interface DisconnectGoogleCalendarCommand {
  readonly scheduleAction?: GoogleCalendarDisconnectScheduleAction;
}

export interface DisconnectGoogleCalendarResponse {
  readonly connectionStatus: "DISCONNECTED";
  readonly scheduleAction: GoogleCalendarDisconnectScheduleAction;
  readonly affectedScheduleCount: number;
  readonly trashedScheduleCount: number;
  readonly hiddenScheduleCount: number;
  readonly keptScheduleCount: number;
  readonly disconnectedAt: string;
}

@Injectable()
export class GoogleCalendarConnectionService {
  constructor(
    @Inject(GOOGLE_CALENDAR_CONNECTION_REPOSITORY)
    private readonly connectionRepository: GoogleCalendarConnectionRepository,
    @Inject(GOOGLE_CALENDAR_OAUTH_PROVIDER)
    private readonly oauthProvider: GoogleCalendarOAuthProvider,
    @Inject(GOOGLE_CALENDAR_TOKEN_ENCRYPTION_PORT)
    private readonly tokenEncryption: GoogleCalendarTokenEncryptionPort,
    private readonly cancelScheduleNotificationReminder: CancelScheduleNotificationReminderUseCase,
    private readonly configService: ConfigService,
    private readonly logger: AppLogger
  ) {}

  startConnect(
    currentUser: CurrentUserContext,
    input: StartGoogleCalendarConnectCommand
  ): StartGoogleCalendarConnectResponse {
    this.tokenEncryption.assertReady();
    const returnTo = this.normalizeReturnTo(input.returnTo);
    const issuedAt = new Date();
    const expiresAt = new Date(issuedAt.getTime() + STATE_TTL_MS);
    const state = this.createState({
      userId: currentUser.id,
      returnTo,
      nonce: randomUUID(),
      issuedAt: issuedAt.toISOString(),
      expiresAt: expiresAt.toISOString(),
    });
    const connectUrl = this.oauthProvider.createAuthorizationUrl({
      state,
      scopes: GOOGLE_CALENDAR_SCOPES,
    });

    this.logEvent("schedule.google.connect.started", {
      userId: currentUser.id,
      returnTo,
      expiresAt: expiresAt.toISOString(),
    });

    return {
      connectUrl,
      expiresAt: expiresAt.toISOString(),
      returnTo,
    };
  }

  async handleCallback(
    input: HandleGoogleCalendarCallbackCommand
  ): Promise<HandleGoogleCalendarCallbackResponse> {
    const state = this.verifyStateOrNull(input.state);
    const returnTo = state?.returnTo ?? DEFAULT_RETURN_TO;

    if (!state) {
      this.logEvent("schedule.google.connect.failed", {
        errorCode: "GoogleCalendarOAuthStateInvalid",
      });
      return { redirectTo: this.createRedirectUrl(returnTo, "failed") };
    }

    if (input.error) {
      this.logEvent("schedule.google.connect.failed", {
        userId: state.userId,
        errorCode: "OAUTH_DENIED",
      });
      return { redirectTo: this.createRedirectUrl(returnTo, "denied") };
    }

    try {
      this.tokenEncryption.assertReady();

      if (!input.code) {
        throw new GoogleCalendarOAuthStateInvalidError();
      }

      const tokenResult = await this.oauthProvider.exchangeAuthorizationCode(
        input.code
      );
      const identity = await this.oauthProvider.verifyIdToken(
        tokenResult.idToken
      );
      const existing = await this.connectionRepository.findConnection(
        state.userId
      );

      const canReuseExistingRefreshToken =
        !tokenResult.refreshToken &&
        existing?.hasRefreshToken === true &&
        existing.providerAccountId === identity.providerAccountId;

      if (!tokenResult.refreshToken && !canReuseExistingRefreshToken) {
        throw new GoogleCalendarProviderUnavailableError(
          "Google Calendar refresh token was missing"
        );
      }

      const now = new Date();
      const connection =
        await this.connectionRepository.upsertConnectedConnection({
          userId: state.userId,
          providerAccountId: identity.providerAccountId,
          providerAccountEmail: identity.email,
          encryptedAccessToken: this.tokenEncryption.encrypt(
            tokenResult.accessToken
          ),
          ...(tokenResult.refreshToken
            ? {
                encryptedRefreshToken: this.tokenEncryption.encrypt(
                  tokenResult.refreshToken
                ),
              }
            : {}),
          tokenExpiresAt: tokenResult.expiresInSeconds
            ? new Date(now.getTime() + tokenResult.expiresInSeconds * 1000)
            : null,
          grantedScopes:
            tokenResult.grantedScopes.length > 0
              ? tokenResult.grantedScopes
              : [...GOOGLE_CALENDAR_SCOPES],
          connectedAt: now,
        });

      this.logEvent("schedule.google.connect.completed", {
        userId: state.userId,
        connectionId: connection.id,
      });

      return { redirectTo: this.createRedirectUrl(returnTo, "connected") };
    } catch (error) {
      if (error instanceof GoogleCalendarTokenEncryptionKeyMissingError) {
        this.logEvent("schedule.google.connect.failed", {
          userId: state.userId,
          errorCode: error.code,
        });
        throw error;
      }

      this.logEvent("schedule.google.connect.failed", {
        userId: state.userId,
        errorCode: this.getSafeErrorCode(error),
      });

      return { redirectTo: this.createRedirectUrl(returnTo, "failed") };
    }
  }

  async getStatus(
    currentUser: CurrentUserContext
  ): Promise<GoogleCalendarStatusResponse> {
    const aggregate = await this.connectionRepository.getStatusAggregate(
      currentUser.id
    );
    const connection = aggregate.connection;
    const connected = Boolean(connection && connection.status !== "DISCONNECTED");
    const autoSync = this.createAutoSyncStatus(connection);

    return {
      connected,
      connection: connection ? this.toConnectionResponse(connection) : null,
      selectedCalendarCount: aggregate.selectedCalendarCount,
      availableCalendarCount: aggregate.availableCalendarCount,
      autoSync,
    };
  }

  async disconnect(
    currentUser: CurrentUserContext,
    input: DisconnectGoogleCalendarCommand
  ): Promise<DisconnectGoogleCalendarResponse> {
    this.tokenEncryption.assertReady();
    const scheduleAction = input.scheduleAction ?? "KEEP";
    const now = new Date();
    const timestamps = createTrashRetentionTimestamps(now);
    const result = await this.connectionRepository.runInTransaction(
      async (repository) => {
        const disconnected = await repository.disconnectConnection({
          userId: currentUser.id,
          scheduleAction,
          disconnectedAt: now,
          deletedAt: timestamps.deletedAt,
          trashExpiresAt: timestamps.trashExpiresAt,
        });

        if (!disconnected) {
          throw new GoogleCalendarConnectionNotFoundError();
        }

        for (const scheduleId of disconnected.trashedScheduleIds) {
          await this.cancelScheduleNotificationReminder.executeWithRepository(
            {
              userId: currentUser.id,
              scheduleId,
              cancelReason: "SOURCE_DELETED",
              now,
            },
            repository
          );
        }

        return disconnected;
      }
    );

    this.logEvent("schedule.google.disconnect.completed", {
      userId: currentUser.id,
      scheduleAction,
      affectedScheduleCount: result.affectedScheduleCount,
      trashedScheduleCount: result.trashedScheduleCount,
      hiddenScheduleCount: result.hiddenScheduleCount,
      keptScheduleCount: result.keptScheduleCount,
    });

    return {
      connectionStatus: result.connectionStatus,
      scheduleAction: result.scheduleAction,
      affectedScheduleCount: result.affectedScheduleCount,
      trashedScheduleCount: result.trashedScheduleCount,
      hiddenScheduleCount: result.hiddenScheduleCount,
      keptScheduleCount: result.keptScheduleCount,
      disconnectedAt: result.disconnectedAt.toISOString(),
    };
  }

  private createAutoSyncStatus(
    connection: GoogleCalendarConnectionRecord | null
  ): GoogleCalendarStatusResponse["autoSync"] {
    const enabled = Boolean(connection && connection.status === "CONNECTED");
    const freshnessAt = connection ? this.getFreshnessAt(connection) : null;
    const nextAutoSyncAvailableAt = freshnessAt
      ? new Date(
          freshnessAt.getTime() + AUTO_SYNC_FRESHNESS_MINUTES * MINUTE_MS
        )
      : null;
    const lockActive = Boolean(
      connection?.syncLockExpiresAt &&
        connection.syncLockExpiresAt.getTime() > Date.now()
    );
    const shouldSyncOnScheduleEntry =
      enabled &&
      !lockActive &&
      (!nextAutoSyncAvailableAt ||
        nextAutoSyncAvailableAt.getTime() <= Date.now());

    return {
      enabled,
      freshnessMinutes: AUTO_SYNC_FRESHNESS_MINUTES,
      shouldSyncOnScheduleEntry,
      nextAutoSyncAvailableAt: nextAutoSyncAvailableAt?.toISOString() ?? null,
    };
  }

  private getFreshnessAt(
    connection: GoogleCalendarConnectionRecord
  ): Date | null {
    return [
      connection.lastSyncedAt,
      connection.lastSyncStartedAt,
      connection.lastSyncFailedAt,
    ]
      .filter((value): value is Date => value !== null)
      .sort((left, right) => right.getTime() - left.getTime())[0] ?? null;
  }

  private toConnectionResponse(
    connection: GoogleCalendarConnectionRecord
  ): GoogleCalendarConnectionResponse {
    return {
      provider: "GOOGLE",
      status: connection.status,
      providerAccountEmail: connection.providerAccountEmail,
      connectedAt: connection.connectedAt?.toISOString() ?? null,
      reconnectRequiredAt: connection.reconnectRequiredAt?.toISOString() ?? null,
      disconnectedAt: connection.disconnectedAt?.toISOString() ?? null,
      lastSyncedAt: connection.lastSyncedAt?.toISOString() ?? null,
      lastSyncStartedAt: connection.lastSyncStartedAt?.toISOString() ?? null,
      lastSyncFailedAt: connection.lastSyncFailedAt?.toISOString() ?? null,
      lastSyncErrorCode: connection.lastSyncErrorCode,
      syncLockExpiresAt: connection.syncLockExpiresAt?.toISOString() ?? null,
    };
  }

  private normalizeReturnTo(value: string | undefined): string {
    if (!value || !RETURN_TO_ALLOWLIST.has(value)) {
      return DEFAULT_RETURN_TO;
    }

    return value;
  }

  private createState(payload: GoogleCalendarOAuthStatePayload): string {
    const body = Buffer.from(JSON.stringify(payload), "utf8").toString(
      "base64url"
    );
    const signature = this.signStateBody(body);

    return `${body}.${signature}`;
  }

  private verifyStateOrNull(
    state: string | undefined
  ): GoogleCalendarOAuthStatePayload | null {
    try {
      if (!state) {
        throw new GoogleCalendarOAuthStateInvalidError();
      }

      const [body, signature] = state.split(".");

      if (!body || !signature) {
        throw new GoogleCalendarOAuthStateInvalidError();
      }

      const expectedSignature = this.signStateBody(body);
      const signatureBuffer = Buffer.from(signature, "base64url");
      const expectedSignatureBuffer = Buffer.from(
        expectedSignature,
        "base64url"
      );

      if (
        signatureBuffer.length !== expectedSignatureBuffer.length ||
        !timingSafeEqual(signatureBuffer, expectedSignatureBuffer)
      ) {
        throw new GoogleCalendarOAuthStateInvalidError();
      }

      const payload = JSON.parse(
        Buffer.from(body, "base64url").toString("utf8")
      ) as GoogleCalendarOAuthStatePayload;

      if (
        typeof payload.userId !== "string" ||
        typeof payload.returnTo !== "string" ||
        typeof payload.expiresAt !== "string" ||
        new Date(payload.expiresAt).getTime() <= Date.now()
      ) {
        throw new GoogleCalendarOAuthStateInvalidError();
      }

      return {
        ...payload,
        returnTo: this.normalizeReturnTo(payload.returnTo),
      };
    } catch {
      return null;
    }
  }

  private signStateBody(body: string): string {
    return createHmac("sha256", this.getStateSecret())
      .update(body)
      .digest("base64url");
  }

  private getStateSecret(): string {
    const secret =
      this.configService.get<string>("GOOGLE_CALENDAR_OAUTH_STATE_SECRET") ??
      this.configService.get<string>("APP_JWT_SECRET");

    if (!secret || secret.trim().length === 0) {
      throw new GoogleCalendarProviderUnavailableError(
        "Google Calendar OAuth state secret is missing"
      );
    }

    return secret;
  }

  private createRedirectUrl(
    returnTo: string,
    status: "connected" | "denied" | "failed"
  ): string {
    const url = new URL(returnTo, this.getUserWebOrigin());
    url.searchParams.set("googleCalendar", status);

    return url.toString();
  }

  private getUserWebOrigin(): string {
    const origin = this.configService.get<string>("USER_WEB_ORIGIN");

    if (!origin || origin.trim().length === 0) {
      throw new GoogleCalendarProviderUnavailableError(
        "USER_WEB_ORIGIN is missing"
      );
    }

    return origin.replace(/\/+$/, "");
  }

  private getSafeErrorCode(error: unknown): string {
    if (
      error instanceof GoogleCalendarOAuthStateInvalidError ||
      error instanceof GoogleCalendarProviderUnavailableError
    ) {
      return error.code;
    }

    return "GoogleCalendarProviderUnavailable";
  }

  private logEvent(event: string, fields: Record<string, unknown>): void {
    this.logger.log(
      JSON.stringify({
        event,
        ...fields,
      }),
      "GoogleCalendarConnectionService"
    );
  }
}
