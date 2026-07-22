import { ConfigService } from "@nestjs/config";
import { NodeBrowserPushSubscriptionEncryptionService } from "./node-browser-push-subscription-encryption.service";
import { BrowserPushSubscriptionDecryptFailedError } from "@/modules/notification/domain/notification.errors";

const PLAINTEXT = {
  endpoint: "https://push.example.test/send/subscription-id",
  p256dh: "p256dh-secret",
  auth: "auth-secret",
};

describe("NodeBrowserPushSubscriptionEncryptionService", () => {
  it("encrypts and decrypts browser push subscription secrets without exposing plaintext", () => {
    const service = createService();

    const encrypted = service.encrypt(PLAINTEXT);
    const serialized = JSON.stringify(encrypted);

    expect(encrypted.endpointHash).not.toBe(PLAINTEXT.endpoint);
    expect(encrypted.endpointCiphertext).not.toBe(PLAINTEXT.endpoint);
    expect(encrypted.p256dhCiphertext).not.toBe(PLAINTEXT.p256dh);
    expect(encrypted.authCiphertext).not.toBe(PLAINTEXT.auth);
    expect(serialized).not.toContain(PLAINTEXT.endpoint);
    expect(serialized).not.toContain(PLAINTEXT.p256dh);
    expect(serialized).not.toContain(PLAINTEXT.auth);
    expect(service.decrypt(encrypted)).toEqual(PLAINTEXT);
  });

  it("keeps endpoint hash stable while rotating ciphertext IV per encryption", () => {
    const service = createService();

    const first = service.encrypt(PLAINTEXT);
    const second = service.encrypt(PLAINTEXT);

    expect(first.endpointHash).toBe(second.endpointHash);
    expect(first.endpointCiphertext).not.toBe(second.endpointCiphertext);
    expect(first.p256dhCiphertext).not.toBe(second.p256dhCiphertext);
    expect(first.authCiphertext).not.toBe(second.authCiphertext);
  });

  it("rejects ciphertext created for a different key version", () => {
    const service = createService();
    const encrypted = service.encrypt(PLAINTEXT);

    expect(() =>
      service.decrypt({ ...encrypted, contentKeyVersion: "v2" })
    ).toThrow(BrowserPushSubscriptionDecryptFailedError);
  });
});

function createService() {
  const configService = {
    get: jest.fn((key: string) => {
      const values: Record<string, string> = {
        ENCRYPTION_MASTER_KEY: "test-browser-push-master-key",
        ENCRYPTION_KEY_VERSION: "v1",
      };

      return values[key];
    }),
  } as unknown as ConfigService;

  return new NodeBrowserPushSubscriptionEncryptionService(configService);
}
