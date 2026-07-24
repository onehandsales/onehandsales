import { ConfigService } from "@nestjs/config";
import { FollowUpDeliverySecretEncryptionKeyMissingError } from "@/modules/follow-up/domain/follow-up-delivery.errors";
import { NodeFollowUpDeliverySecretEncryptionService } from "./node-follow-up-delivery-secret-encryption.service";

describe("NodeFollowUpDeliverySecretEncryptionService", () => {
  it("encrypts and decrypts email tokens without exposing plaintext", () => {
    const service = createService();
    const plaintextToken = "ya29.raw-follow-up-access-token";

    const encrypted = service.encryptEmailToken(plaintextToken);
    const serialized = JSON.stringify(encrypted);

    expect(encrypted.ciphertext).toMatch(/^gcm:v-test:/);
    expect(encrypted.ciphertext).not.toBe(plaintextToken);
    expect(serialized).not.toContain(plaintextToken);
    expect(service.decryptEmailToken(encrypted)).toBe(plaintextToken);
  });

  it("hashes and encrypts SMS sender numbers without exposing raw E.164 text", () => {
    const service = createService();
    const phoneE164 = "+821012345678";

    const first = service.encryptSmsSenderNumber(phoneE164);
    const second = service.encryptSmsSenderNumber(phoneE164);
    const serialized = JSON.stringify({ first, second });

    expect(first.phoneE164Hash).toBe(second.phoneE164Hash);
    expect(first.phoneE164Ciphertext).not.toBe(second.phoneE164Ciphertext);
    expect(first.phoneE164Masked).toContain("5678");
    expect(first.phoneE164Masked).not.toBe(phoneE164);
    expect(serialized).not.toContain(phoneE164);
    expect(service.decryptSmsSenderNumber(first)).toBe(phoneE164);
  });

  it("hashes OAuth state and SMS verification codes without storing raw values", () => {
    const service = createService();
    const state = "raw-oauth-state-secret";
    const code = "123456";
    const senderNumberId = "00000000-0000-4000-8000-000000000099";

    const stateHash = service.hashOAuthState(state);
    const verificationCodeHash = service.hashSmsVerificationCode({
      code,
      senderNumberId,
    }).verificationCodeHash;
    const serialized = JSON.stringify({ stateHash, verificationCodeHash });

    expect(stateHash).toBe(service.hashOAuthState(state));
    expect(verificationCodeHash).toBe(
      service.hashSmsVerificationCode({ code, senderNumberId })
        .verificationCodeHash
    );
    expect(serialized).not.toContain(state);
    expect(serialized).not.toContain(code);
    expect(serialized).not.toContain(senderNumberId);
  });

  it("fails fast when no follow-up or master encryption key is configured", () => {
    const service = createService({});

    expect(() => service.assertReady()).toThrow(
      FollowUpDeliverySecretEncryptionKeyMissingError
    );
  });

  it("falls back to the master encryption key and version", () => {
    const service = createService({
      FOLLOW_UP_DELIVERY_ENCRYPTION_KEY: "   ",
      ENCRYPTION_MASTER_KEY: "test-master-key",
      ENCRYPTION_KEY_VERSION: "v-master",
    });

    const encrypted = service.encryptEmailToken("refresh-token");

    expect(encrypted.ciphertext).toMatch(/^gcm:v-master:/);
    expect(service.decryptEmailToken(encrypted)).toBe("refresh-token");
  });
});

function createService(values?: Record<string, string>) {
  const configValues: Record<string, string> = values ?? {
    FOLLOW_UP_DELIVERY_ENCRYPTION_KEY: "test-follow-up-delivery-key",
    FOLLOW_UP_DELIVERY_ENCRYPTION_KEY_VERSION: "v-test",
  };
  const configService = {
    get: jest.fn((key: string) => configValues[key]),
  } as unknown as ConfigService;

  return new NodeFollowUpDeliverySecretEncryptionService(configService);
}
