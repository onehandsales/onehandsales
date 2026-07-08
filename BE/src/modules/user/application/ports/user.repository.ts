export const USER_REPOSITORY = Symbol("USER_REPOSITORY");

export type UserProfileRole = "USER" | "ADMIN";
export type UserProfileStatus = "ACTIVE" | "SUSPENDED" | "DELETED";
export type UserDeviceSlot = "mobile" | "personal_laptop" | "work_laptop";
export type UserDeviceStatus = "ACTIVE" | "REPLACED" | "REVOKED";

// 역할 : UserOAuthAccountSummary 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface UserOAuthAccountSummary {
  readonly id: string;
  readonly provider: "kakao" | "naver" | "google" | "apple";
  readonly providerEmail: string | null;
  readonly createdAt: Date;
}

// 역할 : UserProfileRecord 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface UserProfileRecord {
  readonly id: string;
  readonly email: string | null;
  readonly name: string | null;
  readonly role: UserProfileRole;
  readonly status: UserProfileStatus;
  readonly timeZone: string;
  readonly preferredLocale: string;
  readonly signupLocale: string | null;
  readonly signupCountryCode: string | null;
  readonly signupTimeZone: string | null;
  readonly lastLoginLocale: string | null;
  readonly lastLoginCountryCode: string | null;
  readonly lastLoginTimeZone: string | null;
  readonly lastLoginAt: Date | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly oauthAccounts: UserOAuthAccountSummary[];
}

// 역할 : UpdateUserProfileInput 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface UpdateUserProfileInput {
  readonly name?: string | null;
  readonly timeZone?: string;
  readonly preferredLocale?: string;
}

// 역할 : UserDeviceRecord 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
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

// 역할 : UserRepository 저장소가 제공해야 하는 영속성 계약을 정의합니다.
export interface UserRepository {
  // 기능 : 사용자 ID로 개인 정보 프로필을 조회합니다.
  getProfile(userId: string): Promise<UserProfileRecord | null>;
  // 기능 : 사용자 프로필 수정 값을 저장하고 결과 프로필을 반환합니다.
  updateProfile(
    userId: string,
    input: UpdateUserProfileInput
  ): Promise<UserProfileRecord | null>;
  // 기능 : 사용자의 활성 등록 기기 목록을 조회합니다.
  listActiveDevices(
    userId: string,
    currentSessionId: string,
    now: Date
  ): Promise<UserDeviceRecord[]>;
}
