import { Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  APP_TOKEN_ISSUER,
  type AppTokenIssuer,
} from "@/modules/auth/application/ports/app-token.port";
import {
  AUTH_REPOSITORY,
  type AuthRepository,
} from "@/modules/auth/application/ports/auth.repository";
import {
  SECURE_TOKEN_SERVICE,
  type SecureTokenService,
} from "@/modules/auth/application/ports/secure-token.port";
import {
  InactiveUserError,
  InvalidRefreshOriginError,
} from "@/modules/auth/domain/auth.errors";
import { UnauthorizedError } from "@/shared/domain/errors/common.errors";
import { createAuthTokenResponse, type AuthTokenResponse } from "../auth-response";

export interface RefreshAppTokenCommand {
  readonly refreshToken: string;
  readonly origin: string | null;
}

export interface RefreshAppTokenResult {
  readonly response: AuthTokenResponse;
  readonly refreshToken: string;
}

@Injectable()
export class RefreshAppTokenUseCase {
  constructor(
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: AuthRepository,
    @Inject(APP_TOKEN_ISSUER)
    private readonly appTokenIssuer: AppTokenIssuer,
    @Inject(SECURE_TOKEN_SERVICE)
    private readonly secureTokenService: SecureTokenService,
    private readonly configService: ConfigService
  ) {}

  async execute(command: RefreshAppTokenCommand): Promise<RefreshAppTokenResult> {
    this.assertAllowedOrigin(command.origin);
    const refreshTokenHash = this.secureTokenService.hash(
      `refresh:${command.refreshToken}`
    );
    const record =
      await this.authRepository.findSessionByRefreshTokenHash(refreshTokenHash);

    if (!record) {
      throw new UnauthorizedError("Invalid refresh token");
    }

    if (
      record.session.status !== "ACTIVE" ||
      record.session.revokedAt ||
      record.session.expiresAt.getTime() <= Date.now()
    ) {
      throw new UnauthorizedError("Expired refresh session");
    }

    if (record.user.status !== "ACTIVE") {
      throw new InactiveUserError();
    }

    const now = new Date();
    const nextRefreshToken = this.secureTokenService.createToken();
    await this.authRepository.rotateRefreshToken(
      record.session.id,
      this.secureTokenService.hash(`refresh:${nextRefreshToken}`),
      this.addDays(now, this.getSessionTtlDays()),
      now
    );
    const issuedToken = await this.appTokenIssuer.issueAccessToken({
      userId: record.user.id,
      sessionId: record.session.id,
    });
    const me = await this.authRepository.getMe(record.user.id);

    if (!me) {
      throw new InactiveUserError();
    }

    return {
      refreshToken: nextRefreshToken,
      response: createAuthTokenResponse({
        accessToken: issuedToken.accessToken,
        accessTokenExpiresAt: issuedToken.accessTokenExpiresAt,
        user: me,
      }),
    };
  }

  private assertAllowedOrigin(origin: string | null): void {
    if (!origin || !this.getAllowedOrigins().includes(origin)) {
      throw new InvalidRefreshOriginError();
    }
  }

  private getAllowedOrigins(): string[] {
    const explicit = this.configService.get<string>("APP_ALLOWED_ORIGINS");

    if (explicit && explicit.trim().length > 0) {
      return explicit
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item.length > 0);
    }

    return [
      this.configService.get<string>("USER_WEB_ORIGIN") ?? "http://localhost:5173",
      this.configService.get<string>("ADMIN_WEB_ORIGIN") ?? "http://localhost:5174",
    ];
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

