export type CurrentUserRole = "USER" | "ADMIN";
export type CurrentUserStatus = "ACTIVE" | "SUSPENDED" | "DELETED";

// 역할 : CurrentUserContext 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface CurrentUserContext {
  readonly id: string;
  readonly sessionId: string;
  readonly email: string | null;
  readonly displayName: string | null;
  readonly role: CurrentUserRole;
  readonly status: CurrentUserStatus;
  readonly preferredLocale?: string;
  readonly timeZone: string;
  readonly defaultCurrencyCode?: string;
}
