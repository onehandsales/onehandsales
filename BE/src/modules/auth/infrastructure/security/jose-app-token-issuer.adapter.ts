import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  type AppAccessTokenPayload,
  type AppTokenIssuer,
  type IssuedAppAccessToken,
} from "@/modules/auth/application/ports/app-token.port";
import { UnauthorizedError } from "@/shared/domain/errors/common.errors";

type JoseModule = typeof import("jose");

type AppJwtPayload = {
  readonly sessionId?: unknown;
};

const importEsm = new Function("specifier", "return import(specifier)") as (
  specifier: string
) => Promise<JoseModule>;

const localMockTokens: Record<string, AppAccessTokenPayload> = {
  "mock-user-web-access-token": {
    userId: "00000000-0000-4000-8000-000000000001",
    sessionId: "00000000-0000-4000-8000-000000000101",
  },
  "mock-non-admin-web-access-token": {
    userId: "00000000-0000-4000-8000-000000000001",
    sessionId: "00000000-0000-4000-8000-000000000102",
  },
  "mock-admin-web-access-token": {
    userId: "00000000-0000-4000-8000-000000000002",
    sessionId: "00000000-0000-4000-8000-000000000201",
  },
};

// 역할 : JoseAppTokenIssuerAdapter 외부 의존성 포트를 실제 기술 어댑터로 구현합니다.
@Injectable()
export class JoseAppTokenIssuerAdapter implements AppTokenIssuer {
  private joseModule: Promise<JoseModule> | null = null;

  // 기능 : 앱 JWT 설정을 읽기 위한 설정 서비스를 주입받습니다.
  constructor(private readonly configService: ConfigService) {}

  // 기능 : 앱 access token을 JWT로 발급하고 만료 시각을 함께 반환합니다.
  async issueAccessToken(
    payload: AppAccessTokenPayload
  ): Promise<IssuedAppAccessToken> {
    const { SignJWT } = await this.getJose();
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

  // 기능 : 앱 access token JWT 또는 로컬 mock 토큰을 검증해 payload를 반환합니다.
  async verifyAccessToken(accessToken: string): Promise<AppAccessTokenPayload> {
    const localMockPayload = this.getLocalMockPayload(accessToken);

    if (localMockPayload) {
      return localMockPayload;
    }

    try {
      const { jwtVerify } = await this.getJose();
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

  // 기능 : CommonJS 빌드에서 ESM-only jose를 안전하게 지연 로드합니다.
  private getJose(): Promise<JoseModule> {
    this.joseModule ??= importEsm("jose");
    return this.joseModule;
  }

  // 기능 : local 환경에서 사용할 mock access token payload를 조회합니다.
  private getLocalMockPayload(
    accessToken: string
  ): AppAccessTokenPayload | null {
    if (this.configService.get<string>("NODE_ENV") !== "local") {
      return null;
    }

    return localMockTokens[accessToken] ?? null;
  }

  // 기능 : JWT 서명 검증에 사용할 비밀키를 환경 변수에서 읽습니다.
  private getSecret(): Uint8Array {
    const secret = this.configService.get<string>("APP_JWT_SECRET");

    if (!secret || secret.trim().length === 0) {
      throw new Error("Missing required environment variable: APP_JWT_SECRET");
    }

    return new TextEncoder().encode(secret);
  }

  // 기능 : 앱 JWT issuer 설정값을 반환합니다.
  private getIssuer(): string {
    return this.configService.get<string>("APP_JWT_ISSUER") ?? "onehand-sales-api";
  }

  // 기능 : 앱 JWT audience 설정값을 반환합니다.
  private getAudience(): string {
    return this.configService.get<string>("APP_JWT_AUDIENCE") ?? "onehand-sales";
  }

  // 기능 : access token TTL 설정값을 분 단위 숫자로 반환합니다.
  private getAccessTokenTtlMinutes(): number {
    const value = Number(
      this.configService.get<string>("APP_ACCESS_TOKEN_TTL_MINUTES") ?? "15"
    );

    return Number.isFinite(value) && value > 0 ? value : 15;
  }

  // 기능 : 기준 날짜에 지정한 분을 더한 날짜를 반환합니다.
  private addMinutes(date: Date, minutes: number): Date {
    return new Date(date.getTime() + minutes * 60 * 1000);
  }
}
