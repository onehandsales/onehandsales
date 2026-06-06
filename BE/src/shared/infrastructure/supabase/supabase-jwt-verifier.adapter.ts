import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createRemoteJWKSet, jwtVerify, type JWTPayload } from "jose";
import {
  type ExternalAuthProvider,
  type ExternalAuthVerifier,
  type VerifiedExternalUser,
} from "@/shared/application/ports/external-auth-verifier.port";
import { getRequiredConfig } from "./supabase-env";

type SupabaseJwtPayload = JWTPayload & {
  email?: string;
  app_metadata?: Record<string, unknown>;
  user_metadata?: Record<string, unknown>;
};

@Injectable()
export class SupabaseJwtVerifierAdapter implements ExternalAuthVerifier {
  private jwks: ReturnType<typeof createRemoteJWKSet> | null = null;

  constructor(private readonly configService: ConfigService) {}

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

  private async verifyJwt(
    accessToken: string,
    issuer: string
  ): Promise<SupabaseJwtPayload & { sub: string }> {
    const { payload } = await jwtVerify(accessToken, this.getJwks(), {
      issuer,
      audience: this.getAudience(),
    });

    if (!payload.sub) {
      throw new Error("Supabase access token has no subject");
    }

    return payload as SupabaseJwtPayload & { sub: string };
  }

  private getJwks() {
    if (!this.jwks) {
      const jwksUrl = getRequiredConfig(this.configService, "SUPABASE_JWKS_URL");
      this.jwks = createRemoteJWKSet(new URL(jwksUrl));
    }

    return this.jwks;
  }

  private getAudience(): string {
    return this.configService.get<string>("SUPABASE_JWT_AUDIENCE") ?? "authenticated";
  }

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

  private getEmail(payload: SupabaseJwtPayload): string {
    if (!payload.email || payload.email.trim().length === 0) {
      throw new Error("Supabase access token has no email");
    }

    return payload.email.trim().toLowerCase();
  }

  private getName(payload: SupabaseJwtPayload): string | null {
    const metadata = payload.user_metadata;
    const name =
      this.getString(metadata, "name") ??
      this.getString(metadata, "full_name") ??
      this.getString(metadata, "preferred_username");

    return name ? name.trim() : null;
  }

  private getString(
    metadata: Record<string, unknown> | undefined,
    key: string
  ): string | null {
    const value = metadata?.[key];
    return typeof value === "string" ? value : null;
  }
}
