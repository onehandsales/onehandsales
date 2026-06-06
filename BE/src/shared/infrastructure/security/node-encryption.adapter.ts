import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  type EncryptedText,
  type EncryptionPort,
} from "@/shared/application/ports/encryption.port";

@Injectable()
export class NodeEncryptionAdapter implements EncryptionPort {
  private readonly algorithm = "aes-256-gcm";

  constructor(private readonly configService: ConfigService) {}

  async encryptText(plaintext: string): Promise<EncryptedText> {
    const iv = randomBytes(12);
    const cipher = createCipheriv(this.algorithm, this.getKey(), iv);
    const encrypted = Buffer.concat([
      cipher.update(plaintext, "utf8"),
      cipher.final(),
    ]);
    const authTag = cipher.getAuthTag();

    return {
      ciphertext: Buffer.concat([iv, authTag, encrypted]).toString("base64url"),
      keyVersion: this.getKeyVersion(),
    };
  }

  async decryptText(input: EncryptedText): Promise<string> {
    const payload = Buffer.from(input.ciphertext, "base64url");
    const iv = payload.subarray(0, 12);
    const authTag = payload.subarray(12, 28);
    const encrypted = payload.subarray(28);
    const decipher = createDecipheriv(this.algorithm, this.getKey(), iv);
    decipher.setAuthTag(authTag);

    return Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]).toString("utf8");
  }

  private getKey(): Buffer {
    const masterKey = this.configService.get<string>("ENCRYPTION_MASTER_KEY");

    if (!masterKey || masterKey.trim().length === 0) {
      throw new Error("Missing required environment variable: ENCRYPTION_MASTER_KEY");
    }

    return createHash("sha256").update(masterKey).digest();
  }

  private getKeyVersion(): string {
    return this.configService.get<string>("ENCRYPTION_KEY_VERSION") ?? "v1";
  }
}

