import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { JWTPayload } from "jose";
import {
  type ExternalAuthProvider,
  type ExternalAuthVerifier,
  type VerifiedExternalUser,
} from "@/shared/application/ports/external-auth-verifier.port";
import { getRequiredConfig } from "./supabase-env";

type JoseModule = typeof import("jose");
type RemoteJWKSet = ReturnType<JoseModule["createRemoteJWKSet"]>;

type SupabaseJwtPayload = JWTPayload & {
  email?: string;
  app_metadata?: Record<string, unknown>;
  user_metadata?: Record<string, unknown>;
};

const importEsm = new Function("specifier", "return import(specifier)") as (
  specifier: string
) => Promise<JoseModule>;

// 역할 : SupabaseJwtVerifierAdapter 외부 의존성 포트를 실제 기술 어댑터로 구현합니다.
@Injectable()
export class SupabaseJwtVerifierAdapter implements ExternalAuthVerifier {
  private joseModule: Promise<JoseModule> | null = null;
  private jwks: RemoteJWKSet | null = null;

  // 기능 : Supabase JWT 검증 설정을 읽기 위한 설정 서비스를 주입받습니다.
  constructor(private readonly configService: ConfigService) {}

  // 기능 : Supabase access token을 검증하고 외부 인증 사용자 정보로 변환합니다.
  async verifyAccessToken(accessToken: string): Promise<VerifiedExternalUser> {
    const issuer = getRequiredConfig(this.configService, "SUPABASE_JWT_ISSUER");
    const payload = await this.verifyJwt(accessToken, issuer);
    const provider = this.getProvider(payload);
    const email = this.getEmail(payload);
    const name = this.getName(payload);

    return {
      provider,
      providerAccountId: payload.sub,
      authUserId: payload.sub,
      email,
      name,
    };
  }

  // 기능 : Supabase JWT의 서명, issuer, audience를 검증하고 subject를 보장합니다.
  private async verifyJwt(
    accessToken: string,
    issuer: string
  ): Promise<SupabaseJwtPayload & { sub: string }> {
    const [{ jwtVerify }, jwks] = await Promise.all([this.getJose(), this.getJwks()]);
    const { payload } = await jwtVerify(accessToken, jwks, {
      issuer,
      audience: this.getAudience(),
    });

    if (!payload.sub) {
      throw new Error("Supabase access token has no subject");
    }

    return payload as SupabaseJwtPayload & { sub: string };
  }

  // 기능 : Supabase JWKS 원격 키 세트를 지연 생성해 반환합니다.
  private async getJwks(): Promise<RemoteJWKSet> {
    if (!this.jwks) {
      const { createRemoteJWKSet } = await this.getJose();
      const jwksUrl = getRequiredConfig(this.configService, "SUPABASE_JWKS_URL");
      this.jwks = createRemoteJWKSet(new URL(jwksUrl));
    }

    return this.jwks;
  }

  // 기능 : CommonJS 빌드에서 ESM-only jose를 안전하게 지연 로드합니다.
  private getJose(): Promise<JoseModule> {
    this.joseModule ??= importEsm("jose");
    return this.joseModule;
  }

  // 기능 : Supabase JWT audience 설정값을 반환합니다.
  private getAudience(): string {
    return this.configService.get<string>("SUPABASE_JWT_AUDIENCE") ?? "authenticated";
  }

  // 기능 : Supabase JWT metadata에서 지원 OAuth 제공자를 추출합니다.
  private getProvider(payload: SupabaseJwtPayload): ExternalAuthProvider {
    const provider = payload.app_metadata?.provider;

    if (
      provider === "kakao" ||
      provider === "naver" ||
      provider === "google" ||
      provider === "apple"
    ) {
      return provider;
    }

    throw new Error("Unsupported Supabase auth provider");
  }

  // 기능 : Supabase JWT에서 이메일을 추출하고 표준 형식으로 정규화합니다.
  private getEmail(payload: SupabaseJwtPayload): string {
    if (!payload.email || payload.email.trim().length === 0) {
      throw new Error("Supabase access token has no email");
    }

    return payload.email.trim().toLowerCase();
  }

  // 기능 : Supabase 사용자 metadata에서 표시 이름 후보를 추출합니다.
  private getName(payload: SupabaseJwtPayload): string | null {
    const metadata = payload.user_metadata;
    const name =
      this.getString(metadata, "name") ??
      this.getString(metadata, "full_name") ??
      this.getString(metadata, "preferred_username");

    return name ? name.trim() : null;
  }

  // 기능 : metadata에서 지정 키의 문자열 값을 안전하게 읽습니다.
  private getString(
    metadata: Record<string, unknown> | undefined,
    key: string
  ): string | null {
    const value = metadata?.[key];
    return typeof value === "string" ? value : null;
  }
}
