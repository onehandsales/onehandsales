export const FOLLOW_UP_DELIVERY_SECRET_ENCRYPTION_PORT = Symbol(
  "FOLLOW_UP_DELIVERY_SECRET_ENCRYPTION_PORT"
);

export interface EncryptedFollowUpEmailToken {
  ciphertext: string;
}

export interface EncryptedFollowUpSmsSenderNumber {
  phoneE164Hash: string;
  phoneE164Ciphertext: string;
  phoneE164Masked: string;
}

export interface EncryptedFollowUpSmsVerificationCode {
  verificationCodeHash: string;
}

export interface FollowUpDeliverySecretEncryptionPort {
  assertReady(): void;
  encryptEmailToken(plaintext: string): EncryptedFollowUpEmailToken;
  decryptEmailToken(encrypted: EncryptedFollowUpEmailToken): string;
  encryptSmsSenderNumber(phoneE164: string): EncryptedFollowUpSmsSenderNumber;
  decryptSmsSenderNumber(
    encrypted: Pick<EncryptedFollowUpSmsSenderNumber, "phoneE164Ciphertext">
  ): string;
  hashOAuthState(state: string): string;
  hashSmsVerificationCode(input: {
    code: string;
    senderNumberId: string;
  }): EncryptedFollowUpSmsVerificationCode;
}
