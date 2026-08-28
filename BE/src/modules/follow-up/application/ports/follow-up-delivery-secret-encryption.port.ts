// 역할 : Follow-up 발송 secret 암호화 port 구현체를 주입하기 위한 토큰입니다.
export const FOLLOW_UP_DELIVERY_SECRET_ENCRYPTION_PORT = Symbol(
  "FOLLOW_UP_DELIVERY_SECRET_ENCRYPTION_PORT"
);

// 역할 : 암호화된 Follow-up 이메일 OAuth token 값을 정의합니다.
export interface EncryptedFollowUpEmailToken {
  ciphertext: string;
}

// 역할 : 암호화된 SMS 발신번호와 조회용 hash/masking 값을 정의합니다.
export interface EncryptedFollowUpSmsSenderNumber {
  phoneE164Hash: string;
  phoneE164Ciphertext: string;
  phoneE164Masked: string;
}

// 역할 : SMS 인증 코드 검증에 사용할 hash 값을 정의합니다.
export interface EncryptedFollowUpSmsVerificationCode {
  verificationCodeHash: string;
}

// 역할 : Follow-up 발송 secret의 암호화, 복호화, hash 계약을 정의합니다.
export interface FollowUpDeliverySecretEncryptionPort {
  // 기능 : 발송 secret 암호화 설정이 사용 가능한 상태인지 확인합니다.
  assertReady(): void;
  // 기능 : 이메일 provider token 원문을 저장 가능한 ciphertext로 암호화합니다.
  encryptEmailToken(plaintext: string): EncryptedFollowUpEmailToken;
  // 기능 : 암호화된 이메일 provider token을 발송 처리에 사용할 원문으로 복호화합니다.
  decryptEmailToken(encrypted: EncryptedFollowUpEmailToken): string;
  // 기능 : SMS 발신번호를 저장용 ciphertext와 비교용 hash/masking 값으로 변환합니다.
  encryptSmsSenderNumber(phoneE164: string): EncryptedFollowUpSmsSenderNumber;
  // 기능 : 암호화된 SMS 발신번호를 provider 호출에 사용할 E.164 값으로 복호화합니다.
  decryptSmsSenderNumber(
    encrypted: Pick<EncryptedFollowUpSmsSenderNumber, "phoneE164Ciphertext">
  ): string;
  // 기능 : 이메일 OAuth state를 저장 없이 비교할 수 있는 hash로 변환합니다.
  hashOAuthState(state: string): string;
  // 기능 : SMS 인증 코드와 발신번호 ID를 함께 검증용 hash로 변환합니다.
  hashSmsVerificationCode(input: {
    code: string;
    senderNumberId: string;
  }): EncryptedFollowUpSmsVerificationCode;
}
