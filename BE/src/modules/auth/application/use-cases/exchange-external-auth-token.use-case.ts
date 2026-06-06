import { Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  type AuthDeviceRecord,
  type AuthDeviceSlot,
  AUTH_REPOSITORY,
  type AuthRepository,
  type AuthUserRecord,
} from "@/modules/auth/application/ports/auth.repository";
import {
  APP_TOKEN_ISSUER,
  type AppTokenIssuer,
} from "@/modules/auth/application/ports/app-token.port";
import {
  SECURE_TOKEN_SERVICE,
  type SecureTokenService,
} from "@/modules/auth/application/ports/secure-token.port";
import {
  DeviceSlotAlreadyRegisteredError,
  ExternalUserEmailMissingError,
  InactiveUserError,
  InvalidDeviceIdError,
  InvalidDeviceSlotError,
} from "@/modules/auth/domain/auth.errors";
import {
  EXTERNAL_AUTH_VERIFIER,
  type ExternalAuthVerifier,
  type VerifiedExternalUser,
} from "@/shared/application/ports/external-auth-verifier.port";
import { createAuthTokenResponse, type AuthTokenResponse } from "../auth-response";

export interface ExchangeExternalAuthTokenCommand {
  readonly supabaseAccessToken: string;
  readonly deviceSlot: string;
  readonly deviceId: string;
  readonly deviceLabel: string | null;
  readonly replaceExistingDevice: boolean;
  readonly userAgent: string | null;
  readonly ipAddress: string | null;
}

export interface ExchangeExternalAuthTokenResult {
  readonly response: AuthTokenResponse;
  readonly refreshToken: string;
}

@Injectable()
export class ExchangeExternalAuthTokenUseCase {
  constructor(
    @Inject(EXTERNAL_AUTH_VERIFIER)
    private readonly externalAuthVerifier: ExternalAuthVerifier,
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: AuthRepository,
    @Inject(APP_TOKEN_ISSUER)
    private readonly appTokenIssuer: AppTokenIssuer,
    @Inject(SECURE_TOKEN_SERVICE)
    private readonly secureTokenService: SecureTokenService,
    private readonly configService: ConfigService
  ) {}

  async execute(
    command: ExchangeExternalAuthTokenCommand
  ): Promise<ExchangeExternalAuthTokenResult> {
    const verifiedUser = await this.externalAuthVerifier.verifyAccessToken(
      command.supabaseAccessToken
    );
    const email = this.normalizeEmail(verifiedUser.email);
    const slot = this.parseDeviceSlot(command.deviceSlot);
    this.assertDeviceId(command.deviceId);

    return this.authRepository.runInTransaction(async (repository) => {
      const now = new Date();
      const user = await this.syncUser(repository, verifiedUser, email, now);
      this.assertActiveUser(user);

      const device = await this.resolveDevice(repository, {
        user,
        slot,
        deviceId: command.deviceId,
        deviceLabel: command.deviceLabel,
        replaceExistingDevice: command.replaceExistingDevice,
        now,
      });
      const refreshToken = this.secureTokenService.createToken();
      const session = await repository.createAuthSession({
        userId: user.id,
        authDeviceId: device.id,
        refreshTokenHash: this.hashRefreshToken(refreshToken),
        expiresAt: this.addDays(now, this.getSessionTtlDays()),
        userAgent: command.userAgent,
        ipAddressHash: command.ipAddress
          ? this.secureTokenService.hash(`ip:${command.ipAddress}`)
          : null,
        now,
      });
      const issuedToken = await this.appTokenIssuer.issueAccessToken({
        userId: user.id,
        sessionId: session.id,
      });
      const me = await repository.getMe(user.id);

      if (!me) {
        throw new InactiveUserError();
      }

      return {
        refreshToken,
        response: createAuthTokenResponse({
          accessToken: issuedToken.accessToken,
          accessTokenExpiresAt: issuedToken.accessTokenExpiresAt,
          user: me,
          device,
        }),
      };
    });
  }

  private async syncUser(
    repository: AuthRepository,
    verifiedUser: VerifiedExternalUser,
    email: string,
    now: Date
  ): Promise<AuthUserRecord> {
    const oauthAccount = await repository.findOAuthAccount(
      verifiedUser.provider,
      verifiedUser.providerAccountId
    );
    const adminRole = this.isInitialAdminEmail(email) ? "ADMIN" : undefined;

    if (oauthAccount) {
      const updateInput = {
        userId: oauthAccount.userId,
        email,
        displayName: verifiedUser.name,
      };

      if (adminRole) {
        return repository.updateUserAfterLogin(
          { ...updateInput, role: adminRole },
          now
        );
      }

      return repository.updateUserAfterLogin(updateInput, now);
    }

    return repository.createUserWithOAuthAccount(
      {
        email,
        displayName: verifiedUser.name,
        role: adminRole ?? "USER",
        provider: verifiedUser.provider,
        providerUserId: verifiedUser.providerAccountId,
        providerEmail: email,
      },
      now
    );
  }

  private async resolveDevice(
    repository: AuthRepository,
    input: {
      readonly user: AuthUserRecord;
      readonly slot: AuthDeviceSlot;
      readonly deviceId: string;
      readonly deviceLabel: string | null;
      readonly replaceExistingDevice: boolean;
      readonly now: Date;
    }
  ): Promise<AuthDeviceRecord> {
    const deviceIdHash = this.secureTokenService.hash(`device:${input.deviceId}`);
    const activeDevice = await repository.findActiveDeviceBySlot(
      input.user.id,
      input.slot
    );

    if (!activeDevice) {
      return repository.createAuthDevice({
        userId: input.user.id,
        slot: input.slot,
        deviceIdHash,
        label: input.deviceLabel,
        now: input.now,
      });
    }

    if (activeDevice.deviceIdHash === deviceIdHash) {
      return repository.updateAuthDeviceSeen(
        activeDevice.id,
        input.deviceLabel,
        input.now
      );
    }

    if (!input.replaceExistingDevice) {
      throw new DeviceSlotAlreadyRegisteredError();
    }

    await repository.replaceAuthDevice(activeDevice.id, input.now);
    await repository.revokeActiveSessionsByDevice(activeDevice.id, input.now);

    return repository.createAuthDevice({
      userId: input.user.id,
      slot: input.slot,
      deviceIdHash,
      label: input.deviceLabel,
      now: input.now,
    });
  }

  private parseDeviceSlot(value: string): AuthDeviceSlot {
    if (
      value === "mobile" ||
      value === "personal_laptop" ||
      value === "work_laptop"
    ) {
      return value;
    }

    throw new InvalidDeviceSlotError();
  }

  private assertDeviceId(deviceId: string): void {
    const trimmed = deviceId.trim();

    if (trimmed.length < 8 || trimmed.length > 200) {
      throw new InvalidDeviceIdError();
    }
  }

  private normalizeEmail(email: string): string {
    const normalized = email.trim().toLowerCase();

    if (normalized.length === 0) {
      throw new ExternalUserEmailMissingError();
    }

    return normalized;
  }

  private assertActiveUser(user: AuthUserRecord): void {
    if (user.status !== "ACTIVE" || user.deletedAt) {
      throw new InactiveUserError();
    }
  }

  private hashRefreshToken(refreshToken: string): string {
    return this.secureTokenService.hash(`refresh:${refreshToken}`);
  }

  private isInitialAdminEmail(email: string): boolean {
    return this.getInitialAdminEmails().includes(email);
  }

  private getInitialAdminEmails(): string[] {
    const value = this.configService.get<string>("INITIAL_ADMIN_EMAILS") ?? "";

    return value
      .split(",")
      .map((item) => item.trim().toLowerCase())
      .filter((item) => item.length > 0);
  }

  private getSessionTtlDays(): number {
    const value = Number(
      this.configService.get<string>("APP_SESSION_TTL_DAYS") ?? "7"
    );

    return Number.isFinite(value) && value > 0 ? value : 7;
  }

  private addDays(date: Date, days: number): Date {
    return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
  }
}

