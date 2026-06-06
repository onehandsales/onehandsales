import { randomBytes, createHmac } from "node:crypto";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { SecureTokenService } from "@/modules/auth/application/ports/secure-token.port";

@Injectable()
export class NodeSecureTokenService implements SecureTokenService {
  constructor(private readonly configService: ConfigService) {}

  createToken(): string {
    return randomBytes(48).toString("base64url");
  }

  hash(value: string): string {
    return createHmac("sha256", this.getSecret()).update(value).digest("hex");
  }

  private getSecret(): string {
    const secret =
      this.configService.get<string>("APP_REFRESH_TOKEN_SECRET") ??
      this.configService.get<string>("APP_JWT_SECRET");

    if (!secret || secret.trim().length === 0) {
      throw new Error(
        "Missing required environment variable: APP_REFRESH_TOKEN_SECRET"
      );
    }

    return secret;
  }
}

