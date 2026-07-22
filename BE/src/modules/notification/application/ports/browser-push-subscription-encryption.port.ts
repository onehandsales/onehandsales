export const BROWSER_PUSH_SUBSCRIPTION_ENCRYPTION_PORT = Symbol(
  "BROWSER_PUSH_SUBSCRIPTION_ENCRYPTION_PORT"
);

// 역할 : BrowserPushSubscriptionPlaintext 저장 전 암호화해야 하는 push 구독 원문 값을 정의합니다.
export interface BrowserPushSubscriptionPlaintext {
  readonly endpoint: string;
  readonly p256dh: string;
  readonly auth: string;
}

// 역할 : EncryptedBrowserPushSubscription 저장 가능한 push 구독 암호화 결과를 정의합니다.
export interface EncryptedBrowserPushSubscription {
  readonly endpointHash: string;
  readonly endpointCiphertext: string;
  readonly p256dhCiphertext: string;
  readonly authCiphertext: string;
  readonly contentKeyVersion: string;
}

// 역할 : BrowserPushSubscriptionEncryptionPort push 구독 원문을 저장 가능한 값으로 변환하는 계약을 정의합니다.
export interface BrowserPushSubscriptionEncryptionPort {
  // 기능 : endpoint, p256dh, auth 원문을 hash/ciphertext 저장값으로 변환합니다.
  encrypt(
    plaintext: BrowserPushSubscriptionPlaintext
  ): EncryptedBrowserPushSubscription;
  // 기능 : 저장된 ciphertext와 key version으로 push 구독 원문을 복원합니다.
  decrypt(
    encrypted: EncryptedBrowserPushSubscription
  ): BrowserPushSubscriptionPlaintext;
}
