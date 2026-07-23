import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "node:crypto";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { GoogleCalendarTokenEncryptionPort } from "@/modules/schedule/application/ports/google-calendar-token-encryption.port";
import { GoogleCalendarTokenEncryptionKeyMissingError } from "@/modules/schedule/domain/google-calendar.errors";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH_BYTES = 12;
const AUTH_TAG_LENGTH_BYTES = 16;

@Injectable()
export class NodeGoogleCalendarTokenEncryptionAdapter
  implements GoogleCalendarTokenEncryptionPort
{
  constructor(private readonly configService: ConfigService) {}

  assertReady(): void {
    this.getRawKey();
  }

  encrypt(plaintext: string): string {
    const iv = randomBytes(IV_LENGTH_BYTES);
    const cipher = createCipheriv(ALGORITHM, this.getKey(), iv, {
      authTagLength: AUTH_TAG_LENGTH_BYTES,
    });
    const ciphertext = Buffer.concat([
      cipher.update(plaintext, "utf8"),
      cipher.final(),
    ]);
    const authTag = cipher.getAuthTag();

    return [
      "gcm",
      this.getKeyVersion(),
      iv.toString("base64url"),
      authTag.toString("base64url"),
      ciphertext.toString("base64url"),
    ].join(":");
  }

  decrypt(ciphertext: string): string {
    const parts = ciphertext.split(":");

    if (parts.length !== 5 || parts[0] !== "gcm") {
      throw new Error("Invalid Google Calendar token envelope");
    }

    const ivText = parts[2];
    const authTagText = parts[3];
    const ciphertextText = parts[4];

    if (!ivText || !authTagText || !ciphertextText) {
      throw new Error("Invalid Google Calendar token envelope");
    }

    const decipher = createDecipheriv(
      ALGORITHM,
      this.getKey(),
      Buffer.from(ivText, "base64url"),
      {
        authTagLength: AUTH_TAG_LENGTH_BYTES,
      }
    );
    decipher.setAuthTag(Buffer.from(authTagText, "base64url"));

    return Buffer.concat([
      decipher.update(Buffer.from(ciphertextText, "base64url")),
      decipher.final(),
    ]).toString("utf8");
  }

  private getKey(): Buffer {
    return createHash("sha256").update(this.getRawKey(), "utf8").digest();
  }

  private getRawKey(): string {
    const key =
      this.configService.get<string>("GOOGLE_CALENDAR_TOKEN_ENCRYPTION_KEY") ??
      this.configService.get<string>("ENCRYPTION_MASTER_KEY");

    if (!key || key.trim().length === 0) {
      throw new GoogleCalendarTokenEncryptionKeyMissingError();
    }

    return key;
  }

  private getKeyVersion(): string {
    return (
      this.configService.get<string>(
        "GOOGLE_CALENDAR_TOKEN_ENCRYPTION_KEY_VERSION"
      ) ??
      this.configService.get<string>("ENCRYPTION_KEY_VERSION") ??
      "v1"
    );
  }
}
