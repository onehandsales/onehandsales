import {
  createCipheriv,
  createDecipheriv,
  createHash,
  createHmac,
  randomBytes,
} from "node:crypto";
import type {
  ViewDataTokenCodec,
  ViewDataTokenPayload,
} from "../application/ports/view-data-token-codec.port";
import { ValidationDomainError } from "@/shared/domain/errors/common.errors";

// 역할 : API token key와 용도를 분리해 조회 cursor 내용을 암호화합니다.
export class EncryptedViewDataTokenCodec implements ViewDataTokenCodec {
  // 기능 : 기존 서버 비밀키에서 조회 cursor 전용 key를 유도합니다.
  constructor(
    private readonly secret: string | (() => string),
    private readonly now: () => number = Date.now,
  ) {}
  // 기능 : 암호화가 필요한 시점에만 서버 설정을 읽고 빈 key를 거부합니다.
  private key(): Buffer {
    const secret =
      typeof this.secret === "function" ? this.secret() : this.secret;
    if (!secret.trim()) throw new Error("Missing required APP_JWT_SECRET");
    return createHmac("sha256", secret)
      .update("onehandsales.view-data.cursor.v1")
      .digest();
  }
  // 기능 : 객체 키 순서에 영향받지 않는 설정 식별값을 반환합니다.
  fingerprint(value: unknown): string {
    return createHash("sha256")
      .update(JSON.stringify(canonical(value)))
      .digest("base64url");
  }
  // 기능 : 임의 nonce와 30분 만료로 payload를 암호화합니다.
  encode(payload: ViewDataTokenPayload): string {
    const nonce = randomBytes(12);
    const cipher = createCipheriv("aes-256-gcm", this.key(), nonce);
    const content = Buffer.concat([
      cipher.update(
        JSON.stringify({ ...payload, exp: this.now() + 30 * 60_000 }),
        "utf8",
      ),
      cipher.final(),
    ]);
    return Buffer.concat([nonce, cipher.getAuthTag(), content]).toString(
      "base64url",
    );
  }
  // 기능 : 인증 태그와 payload 모양을 확인하고 잘못된 cursor를 거부합니다.
  decode(token: string): ViewDataTokenPayload {
    try {
      if (token.length > 2048 || !/^[\w-]+$/.test(token))
        throw new Error("format");
      const bytes = Buffer.from(token, "base64url");
      if (bytes.length < 29) throw new Error("length");
      const decipher = createDecipheriv(
        "aes-256-gcm",
        this.key(),
        bytes.subarray(0, 12),
      );
      decipher.setAuthTag(bytes.subarray(12, 28));
      const value: unknown = JSON.parse(
        Buffer.concat([
          decipher.update(bytes.subarray(28)),
          decipher.final(),
        ]).toString("utf8"),
      );
      if (
        !value ||
        typeof value !== "object" ||
        !("exp" in value) ||
        typeof value.exp !== "number" ||
        value.exp < this.now()
      )
        throw new Error("expiry");
      const data = value as Record<string, unknown>;
      if (
        typeof data["context"] !== "string" ||
        typeof data["configuration"] !== "string" ||
        typeof data["part"] !== "string" ||
        !Number.isSafeInteger(data["offset"]) ||
        (data["offset"] as number) < 0 ||
        !(data["groupKey"] === null || typeof data["groupKey"] === "string")
      )
        throw new Error("shape");
      return {
        context: data["context"],
        configuration: data["configuration"],
        part: data["part"],
        offset: data["offset"] as number,
        groupKey: data["groupKey"],
      };
    } catch {
      throw new ValidationDomainError("Invalid or expired page token");
    }
  }
}

// 기능 : 배열 순서는 유지하고 객체 속성 순서만 정규화합니다.
function canonical(value: unknown): unknown {
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === "object")
    return Object.fromEntries(
      Object.entries(value)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => [k, canonical(v)]),
    );
  return value;
}
