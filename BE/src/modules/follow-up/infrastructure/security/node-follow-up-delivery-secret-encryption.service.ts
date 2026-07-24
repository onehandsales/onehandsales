import { Buffer } from "node:buffer";
import {
  createCipheriv,
  createDecipheriv,
  createHash,
  createHmac,
  randomBytes,
} from "node:crypto";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type {
  EncryptedFollowUpEmailToken,
  EncryptedFollowUpSmsSenderNumber,
  EncryptedFollowUpSmsVerificationCode,
  FollowUpDeliverySecretEncryptionPort,
} from "@/modules/follow-up/application/ports/follow-up-delivery-secret-encryption.port";
import {
  FollowUpDeliverySecretDecryptFailedError,
  FollowUpDeliverySecretEncryptFailedError,
  FollowUpDeliverySecretEncryptionKeyMissingError,
} from "@/modules/follow-up/domain/follow-up-delivery.errors";

const CIPHER_ALGORITHM = "aes-256-gcm";
const CIPHER_PREFIX = "gcm";
const IV_BYTE_LENGTH = 12;
const AUTH_TAG_BYTE_LENGTH = 16;

@Injectable()
export class NodeFollowUpDeliverySecretEncryptionService
  implements FollowUpDeliverySecretEncryptionPort
{
  constructor(private readonly configService: ConfigService) {}

  assertReady(): void {
    this.getRawKey();
  }

  encryptEmailToken(plaintext: string): EncryptedFollowUpEmailToken {
    try {
      this.assertNonEmpty(plaintext);

      return {
        ciphertext: this.encryptValue(plaintext),
      };
    } catch (error) {
      this.rethrowKeyMissing(error);
      throw new FollowUpDeliverySecretEncryptFailedError();
    }
  }

  decryptEmailToken(encrypted: EncryptedFollowUpEmailToken): string {
    try {
      return this.decryptValue(encrypted.ciphertext);
    } catch (error) {
      this.rethrowKeyMissing(error);
      throw new FollowUpDeliverySecretDecryptFailedError();
    }
  }

  encryptSmsSenderNumber(phoneE164: string): EncryptedFollowUpSmsSenderNumber {
    try {
      const normalizedPhone = this.normalizeNonEmpty(phoneE164);

      return {
        phoneE164Hash: this.hashValue("sms-sender-number", normalizedPhone),
        phoneE164Ciphertext: this.encryptValue(normalizedPhone),
        phoneE164Masked: this.maskPhoneE164(normalizedPhone),
      };
    } catch (error) {
      this.rethrowKeyMissing(error);
      throw new FollowUpDeliverySecretEncryptFailedError();
    }
  }

  decryptSmsSenderNumber(
    encrypted: Pick<EncryptedFollowUpSmsSenderNumber, "phoneE164Ciphertext">
  ): string {
    try {
      return this.decryptValue(encrypted.phoneE164Ciphertext);
    } catch (error) {
      this.rethrowKeyMissing(error);
      throw new FollowUpDeliverySecretDecryptFailedError();
    }
  }

  hashOAuthState(state: string): string {
    return this.hashValue("email-oauth-state", this.normalizeNonEmpty(state));
  }

  hashSmsVerificationCode(input: {
    code: string;
    senderNumberId: string;
  }): EncryptedFollowUpSmsVerificationCode {
    const code = this.normalizeNonEmpty(input.code);
    const senderNumberId = this.normalizeNonEmpty(input.senderNumberId);

    return {
      verificationCodeHash: this.hashValue(
        "sms-verification-code",
        `${senderNumberId}:${code}`
      ),
    };
  }

  private encryptValue(value: string): string {
    const iv = randomBytes(IV_BYTE_LENGTH);
    const cipher = createCipheriv(CIPHER_ALGORITHM, this.getKey(), iv, {
      authTagLength: AUTH_TAG_BYTE_LENGTH,
    });
    const ciphertext = Buffer.concat([
      cipher.update(value, "utf8"),
      cipher.final(),
    ]);
    const authTag = cipher.getAuthTag();

    return [
      CIPHER_PREFIX,
      this.getKeyVersion(),
      iv.toString("base64url"),
      authTag.toString("base64url"),
      ciphertext.toString("base64url"),
    ].join(":");
  }

  private decryptValue(ciphertext: string): string {
    const parts = ciphertext.split(":");

    if (parts.length !== 5 || parts[0] !== CIPHER_PREFIX) {
      throw new Error("Invalid follow-up delivery secret envelope");
    }

    const ivText = parts[2];
    const authTagText = parts[3];
    const ciphertextText = parts[4];

    if (!ivText || !authTagText || !ciphertextText) {
      throw new Error("Invalid follow-up delivery secret envelope");
    }

    const decipher = createDecipheriv(
      CIPHER_ALGORITHM,
      this.getKey(),
      Buffer.from(ivText, "base64url"),
      {
        authTagLength: AUTH_TAG_BYTE_LENGTH,
      }
    );
    decipher.setAuthTag(Buffer.from(authTagText, "base64url"));

    return Buffer.concat([
      decipher.update(Buffer.from(ciphertextText, "base64url")),
      decipher.final(),
    ]).toString("utf8");
  }

  private hashValue(namespace: string, value: string): string {
    return createHmac("sha256", this.getKey())
      .update(namespace)
      .update(":")
      .update(value)
      .digest("hex");
  }

  private maskPhoneE164(phoneE164: string): string {
    if (phoneE164.length <= 5) {
      return `${phoneE164.slice(0, 1)}****`;
    }

    const prefixLength = Math.min(3, phoneE164.length - 4);
    const prefix = phoneE164.slice(0, prefixLength);
    const suffix = phoneE164.slice(-4);
    const hiddenLength = Math.max(phoneE164.length - prefix.length - suffix.length, 4);

    return `${prefix}${"*".repeat(hiddenLength)}${suffix}`;
  }

  private normalizeNonEmpty(value: string): string {
    const normalized = value.trim();
    this.assertNonEmpty(normalized);

    return normalized;
  }

  private assertNonEmpty(value: string): void {
    if (value.trim().length === 0) {
      throw new Error("Follow-up delivery secret value is empty");
    }
  }

  private getKey(): Buffer {
    return createHash("sha256").update(this.getRawKey(), "utf8").digest();
  }

  private getRawKey(): string {
    const key =
      this.configService
        .get<string>("FOLLOW_UP_DELIVERY_ENCRYPTION_KEY")
        ?.trim() ||
      this.configService.get<string>("ENCRYPTION_MASTER_KEY")?.trim();

    if (!key) {
      throw new FollowUpDeliverySecretEncryptionKeyMissingError();
    }

    return key;
  }

  private getKeyVersion(): string {
    return (
      this.configService
        .get<string>("FOLLOW_UP_DELIVERY_ENCRYPTION_KEY_VERSION")
        ?.trim() ||
      this.configService.get<string>("ENCRYPTION_KEY_VERSION")?.trim() ||
      "v1"
    );
  }

  private rethrowKeyMissing(error: unknown): void {
    if (error instanceof FollowUpDeliverySecretEncryptionKeyMissingError) {
      throw error;
    }
  }
}
