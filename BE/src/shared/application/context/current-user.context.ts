export type CurrentUserRole = "USER" | "ADMIN";
export type CurrentUserStatus = "ACTIVE" | "SUSPENDED" | "DELETED";

export interface CurrentUserContext {
  readonly id: string;
  readonly sessionId: string;
  readonly email: string | null;
  readonly displayName: string | null;
  readonly role: CurrentUserRole;
  readonly status: CurrentUserStatus;
}

