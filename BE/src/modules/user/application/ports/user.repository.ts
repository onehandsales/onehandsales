export const USER_REPOSITORY = Symbol("USER_REPOSITORY");

export type UserProfileRole = "USER" | "ADMIN";
export type UserProfileStatus = "ACTIVE" | "SUSPENDED" | "DELETED";
export type UserDeviceSlot = "mobile" | "personal_laptop" | "work_laptop";
export type UserDeviceStatus = "ACTIVE" | "REPLACED" | "REVOKED";

export interface UserOAuthAccountSummary {
  readonly id: string;
  readonly provider: "kakao" | "naver" | "google" | "apple";
  readonly providerEmail: string | null;
  readonly createdAt: Date;
}

export interface UserProfileRecord {
  readonly id: string;
  readonly email: string | null;
  readonly name: string | null;
  readonly role: UserProfileRole;
  readonly status: UserProfileStatus;
  readonly lastLoginAt: Date | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly oauthAccounts: UserOAuthAccountSummary[];
}

export interface UpdateUserProfileInput {
  readonly name?: string | null;
}

export interface UserDeviceRecord {
  readonly id: string;
  readonly slot: UserDeviceSlot;
  readonly label: string | null;
  readonly status: UserDeviceStatus;
  readonly lastSeenAt: Date | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly activeSessionCount: number;
  readonly isCurrentDevice: boolean;
}

export interface UserRepository {
  getProfile(userId: string): Promise<UserProfileRecord | null>;
  updateProfile(
    userId: string,
    input: UpdateUserProfileInput
  ): Promise<UserProfileRecord | null>;
  listActiveDevices(
    userId: string,
    currentSessionId: string,
    now: Date
  ): Promise<UserDeviceRecord[]>;
}

