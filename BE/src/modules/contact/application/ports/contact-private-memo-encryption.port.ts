export const CONTACT_PRIVATE_MEMO_ENCRYPTION_PORT = Symbol(
  "CONTACT_PRIVATE_MEMO_ENCRYPTION_PORT"
);

// 역할 : EncryptedContactPrivateMemo 인터페이스가 구현해야 하는 계약을 정의합니다.
export interface EncryptedContactPrivateMemo {
  readonly ciphertext: string;
  readonly keyVersion: string;
}

// 역할 : ContactPrivateMemoEncryptionPort 포트가 개인 비밀 메모 암호화 계약을 정의합니다.
export interface ContactPrivateMemoEncryptionPort {
  // 기능 : 개인 비밀 메모 평문을 저장용 암호문과 key version으로 변환합니다.
  encrypt(plaintext: string): EncryptedContactPrivateMemo;
  // 기능 : 저장된 암호문과 key version으로 개인 비밀 메모 평문을 복호화합니다.
  decrypt(ciphertext: string, keyVersion: string): string;
}
