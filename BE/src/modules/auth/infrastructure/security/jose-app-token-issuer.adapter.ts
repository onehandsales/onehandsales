import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { jwtVerify, SignJWT } from "jose";
import {
  type AppAccessTokenPayload,
  type AppTokenIssuer,
  type IssuedAppAccessToken,
} from "@/modules/auth/application/ports/app-token.port";
import { UnauthorizedError } from "@/shared/domain/errors/common.errors";

type AppJwtPayload = {
  readonly sessionId?: unknown;
};

@Injectable()
export class JoseAppTokenIssuerAdapter implements AppTokenIssuer {
  constructor(private readonly configService: ConfigService) {}

  async issueAccessToken(
    payload: AppAccessTokenPayload
  ): Promise<IssuedAppAccessToken> {
    const expiresAt = this.addMinutes(new Date(), this.getAccessTokenTtlMinutes());
    const accessToken = await new SignJWT({ sessionId: payload.sessionId })
      .setProtectedHeader({ alg: "HS256" })
      .setSubject(payload.userId)
      .setIssuer(this.getIssuer())
      .setAudience(this.getAudience())
      .setIssuedAt()
      .setExpirationTime(Math.floor(expiresAt.getTime() / 1000))
      .sign(this.getSecret());

    return {
      accessToken,
      accessTokenExpiresAt: expiresAt,
    };
  }

  async verifyAccessToken(accessToken: string): Promise<AppAccessTokenPayload> {
    try {
      const { payload } = await jwtVerify(accessToken, this.getSecret(), {
        issuer: this.getIssuer(),
        audience: this.getAudience(),
      });
      const appPayload = payload as AppJwtPayload;

      if (!payload.sub || typeof appPayload.sessionId !== "string") {
        throw new UnauthorizedError("Invalid app token payload");
      }

      return {
        userId: payload.sub,
        sessionId: appPayload.sessionId,
      };
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        throw error;
      }

      throw new UnauthorizedError("Invalid app token");
    }
  }

  private getSecret(): Uint8Array {
    const secret = this.configService.get<string>("APP_JWT_SECRET");

    if (!secret || secret.trim().length === 0) {
      throw new Error("Missing required environment variable: APP_JWT_SECRET");
    }

    return new TextEncoder().encode(secret);
  }

  private getIssuer(): string {
    return this.configService.get<string>("APP_JWT_ISSUER") ?? "onehand-sales-api";
  }

  private getAudience(): string {
    return this.configService.get<string>("APP_JWT_AUDIENCE") ?? "onehand-sales";
  }

  private getAccessTokenTtlMinutes(): number {
    const value = Number(
      this.configService.get<string>("APP_ACCESS_TOKEN_TTL_MINUTES") ?? "15"
    );

    return Number.isFinite(value) && value > 0 ? value : 15;
  }

  private addMinutes(date: Date, minutes: number): Date {
    return new Date(date.getTime() + minutes * 60 * 1000);
  }
}

