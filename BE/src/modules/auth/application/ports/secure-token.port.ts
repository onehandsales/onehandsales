export const SECURE_TOKEN_SERVICE = Symbol("SECURE_TOKEN_SERVICE");

export interface SecureTokenService {
  createToken(): string;
  hash(value: string): string;
}

