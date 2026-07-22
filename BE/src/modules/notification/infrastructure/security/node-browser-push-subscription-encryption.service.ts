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
  BrowserPushSubscriptionEncryptionPort,
  BrowserPushSubscriptionPlaintext,
  EncryptedBrowserPushSubscription,
} from "@/modules/notification/application/ports/browser-push-subscription-encryption.port";
import {
  BrowserPushSubscriptionDecryptFailedError,
  BrowserPushSubscriptionEncryptFailedError,
} from "@/modules/notification/domain/notification.errors";

const CIPHER_ALGORITHM = "aes-256-gcm";
const CIPHER_PREFIX = "aes-256-gcm";
const IV_BYTE_LENGTH = 12;

// 역할 : NodeBrowserPushSubscriptionEncryptionService browser push 구독 비밀값 암복호화를 제공합니다.
@Injectable()
export class NodeBrowserPushSubscriptionEncryptionService
  implements BrowserPushSubscriptionEncryptionPort
{
  // 기능 : push 구독 암호화에 필요한 설정 서비스를 주입받습니다.
  constructor(private readonly configService: ConfigService) {}

  // 기능 : push endpoint, p256dh, auth 원문을 저장 가능한 hash/ciphertext로 변환합니다.
  encrypt(
    plaintext: BrowserPushSubscriptionPlaintext
  ): EncryptedBrowserPushSubscription {
    try {
      return {
        endpointHash: this.hashEndpoint(plaintext.endpoint),
        endpointCiphertext: this.encryptValue(plaintext.endpoint),
        p256dhCiphertext: this.encryptValue(plaintext.p256dh),
        authCiphertext: this.encryptValue(plaintext.auth),
        contentKeyVersion: this.getKeyVersion(),
      };
    } catch {
      throw new BrowserPushSubscriptionEncryptFailedError();
    }
  }

  // 기능 : 저장된 push subscription ciphertext를 발송에 필요한 원문으로 복호화합니다.
  decrypt(
    encrypted: EncryptedBrowserPushSubscription
  ): BrowserPushSubscriptionPlaintext {
    try {
      if (encrypted.contentKeyVersion !== this.getKeyVersion()) {
        throw new Error("Unsupported browser push subscription key version");
      }

      return {
        endpoint: this.decryptValue(encrypted.endpointCiphertext),
        p256dh: this.decryptValue(encrypted.p256dhCiphertext),
        auth: this.decryptValue(encrypted.authCiphertext),
      };
    } catch {
      throw new BrowserPushSubscriptionDecryptFailedError();
    }
  }

  // 기능 : endpoint 원문을 저장하지 않고 중복 감지용 HMAC hash로 변환합니다.
  private hashEndpoint(endpoint: string): string {
    return createHmac("sha256", this.getKey()).update(endpoint).digest("hex");
  }

  // 기능 : 단일 push 구독 비밀값을 AES-256-GCM ciphertext로 변환합니다.
  private encryptValue(value: string): string {
    const iv = randomBytes(IV_BYTE_LENGTH);
    const cipher = createCipheriv(CIPHER_ALGORITHM, this.getKey(), iv);
    const ciphertext = Buffer.concat([
      cipher.update(value, "utf8"),
      cipher.final(),
    ]);
    const authTag = cipher.getAuthTag();

    return [
      CIPHER_PREFIX,
      iv.toString("base64url"),
      authTag.toString("base64url"),
      ciphertext.toString("base64url"),
    ].join(":");
  }

  // 기능 : AES-256-GCM ciphertext를 단일 push 구독 비밀값 원문으로 복호화합니다.
  private decryptValue(ciphertext: string): string {
    const parts = ciphertext.split(":");

    if (parts.length !== 4 || parts[0] !== CIPHER_PREFIX) {
      throw new Error("Invalid browser push subscription ciphertext");
    }

    const iv = Buffer.from(parts[1] ?? "", "base64url");
    const authTag = Buffer.from(parts[2] ?? "", "base64url");
    const encryptedBody = Buffer.from(parts[3] ?? "", "base64url");
    const decipher = createDecipheriv(CIPHER_ALGORITHM, this.getKey(), iv);
    decipher.setAuthTag(authTag);

    return Buffer.concat([
      decipher.update(encryptedBody),
      decipher.final(),
    ]).toString("utf8");
  }

  // 기능 : 설정된 비밀값을 AES-256 key로 파생합니다.
  private getKey(): Buffer {
    const secret =
      this.configService
        .get<string>("BROWSER_PUSH_SUBSCRIPTION_ENCRYPTION_KEY")
        ?.trim() ||
      this.configService.get<string>("ENCRYPTION_MASTER_KEY")?.trim();

    if (!secret) {
      throw new Error("Missing browser push subscription encryption key");
    }

    return createHash("sha256").update(secret).digest();
  }

  // 기능 : 저장할 push 구독 암호화 key version을 조회합니다.
  private getKeyVersion(): string {
    return (
      this.configService
        .get<string>("BROWSER_PUSH_SUBSCRIPTION_ENCRYPTION_KEY_VERSION")
        ?.trim() ||
      this.configService.get<string>("ENCRYPTION_KEY_VERSION")?.trim() ||
      "v1"
    );
  }
}
