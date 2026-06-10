export const PRIVATE_MEMO_ENCRYPTION_PORT = Symbol(
  "PRIVATE_MEMO_ENCRYPTION_PORT"
);

export interface EncryptedPrivateMemo {
  readonly ciphertext: string;
  readonly keyVersion: string;
}

export interface PrivateMemoEncryptionPort {
  // 기능 : 개인 비밀 메모 평문을 저장용 암호문과 key version으로 변환합니다.
  encrypt(plaintext: string): EncryptedPrivateMemo;
  // 기능 : 저장된 암호문과 key version으로 개인 비밀 메모 평문을 복호화합니다.
  decrypt(ciphertext: string, keyVersion: string): string;
}
