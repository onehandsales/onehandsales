export const GOOGLE_CALENDAR_TOKEN_ENCRYPTION_PORT = Symbol(
  "GOOGLE_CALENDAR_TOKEN_ENCRYPTION_PORT"
);

export interface GoogleCalendarTokenEncryptionPort {
  assertReady(): void;
  encrypt(plaintext: string): string;
  decrypt(ciphertext: string): string;
}
