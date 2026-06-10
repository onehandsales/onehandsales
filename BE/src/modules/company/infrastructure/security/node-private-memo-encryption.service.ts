import { Buffer } from "node:buffer";
import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "node:crypto";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type {
  EncryptedPrivateMemo,
  PrivateMemoEncryptionPort,
} from "@/modules/company/application/ports/private-memo-encryption.port";
import {
  PrivateMemoDecryptFailedError,
  PrivateMemoEncryptFailedError,
} from "@/modules/company/domain/company.errors";

const CIPHER_ALGORITHM = "aes-256-gcm";
const CIPHER_PREFIX = "aes-256-gcm";
const IV_BYTE_LENGTH = 12;

@Injectable()
export class NodePrivateMemoEncryptionService
  implements PrivateMemoEncryptionPort
{
  // 기능 : 개인 비밀 메모 암호화에 필요한 설정 서비스를 주입받습니다.
  constructor(private readonly configService: ConfigService) {}

  // 기능 : 개인 비밀 메모 평문을 AES-256-GCM 암호문으로 변환합니다.
  encrypt(plaintext: string): EncryptedPrivateMemo {
    try {
      const iv = randomBytes(IV_BYTE_LENGTH);
      const cipher = createCipheriv(CIPHER_ALGORITHM, this.getKey(), iv);
      const ciphertext = Buffer.concat([
        cipher.update(plaintext, "utf8"),
        cipher.final(),
      ]);
      const authTag = cipher.getAuthTag();

      return {
        ciphertext: [
          CIPHER_PREFIX,
          iv.toString("base64url"),
          authTag.toString("base64url"),
          ciphertext.toString("base64url"),
        ].join(":"),
        keyVersion: this.getKeyVersion(),
      };
    } catch {
      throw new PrivateMemoEncryptFailedError();
    }
  }

  // 기능 : AES-256-GCM 암호문을 개인 비밀 메모 평문으로 복호화합니다.
  decrypt(ciphertext: string, keyVersion: string): string {
    try {
      if (keyVersion !== this.getKeyVersion()) {
        throw new Error("Unsupported key version");
      }

      const parts = ciphertext.split(":");

      if (parts.length !== 4 || parts[0] !== CIPHER_PREFIX) {
        throw new Error("Invalid ciphertext");
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
    } catch {
      throw new PrivateMemoDecryptFailedError();
    }
  }

  // 기능 : 설정된 비밀값을 AES-256 key로 파생합니다.
  private getKey(): Buffer {
    const secret =
      this.configService
        .get<string>("COMPANY_PRIVATE_MEMO_ENCRYPTION_KEY")
        ?.trim() ||
      this.configService.get<string>("ENCRYPTION_MASTER_KEY")?.trim();

    if (!secret) {
      throw new Error("Missing company private memo encryption key");
    }

    return createHash("sha256").update(secret).digest();
  }

  // 기능 : 저장할 개인 비밀 메모 암호화 key version을 조회합니다.
  private getKeyVersion(): string {
    return (
      this.configService
        .get<string>("COMPANY_PRIVATE_MEMO_ENCRYPTION_KEY_VERSION")
        ?.trim() ||
      this.configService.get<string>("ENCRYPTION_KEY_VERSION")?.trim() ||
      "v1"
    );
  }
}
