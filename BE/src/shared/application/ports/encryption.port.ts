export const ENCRYPTION_PORT = Symbol("ENCRYPTION_PORT");

export interface EncryptedText {
  readonly ciphertext: string;
  readonly keyVersion: string;
}

export interface EncryptionPort {
  encryptText(plaintext: string): Promise<EncryptedText>;
  decryptText(input: EncryptedText): Promise<string>;
}

