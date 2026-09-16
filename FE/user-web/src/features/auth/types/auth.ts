// 역할 : 지원하는 외부 인증 provider ID입니다.
export type AuthProviderId = "google" | "line" | "apple";

// 역할 : 외부 인증 provider 로그인 실행 방식입니다.
export type AuthProviderLoginMode = "redirect" | "popup";

// 역할 : provider 로그인 시작 시 전달할 선택 옵션입니다.
export type StartProviderLoginOptions = {
  readonly mode?: AuthProviderLoginMode;
};

// 역할 : 사용자 기기 등록 슬롯입니다.
export type DeviceSlot = "mobile" | "personal_laptop" | "work_laptop";

// 역할 : 로그인 화면에 표시할 인증 provider 옵션입니다.
export type AuthProviderOption = {
  readonly provider: AuthProviderId;
  readonly label: string;
  readonly enabled: boolean;
};

// 역할 : 인증 provider 목록 API 응답입니다.
export type AuthProvidersResponse = {
  readonly providers: AuthProviderOption[];
};

// 역할 : 인증 세션에서 사용하는 현재 사용자 정보입니다.
export type AuthUser = {
  readonly id: string;
  readonly externalAuthUserId: string | null;
  readonly name: string | null;
  readonly email: string | null;
  readonly platformRole: string;
  readonly status: string;
  readonly timeZone: string;
  readonly preferredLocale: string;
  readonly countryCode: string;
  readonly defaultCurrencyCode: string;
  readonly signupLocale: string | null;
  readonly signupCountryCode: string | null;
  readonly signupTimeZone: string | null;
  readonly lastLoginLocale: string | null;
  readonly lastLoginCountryCode: string | null;
  readonly lastLoginTimeZone: string | null;
  readonly jobSelectOnboardingCompletedAt: string | null;
  readonly settings: {
    readonly sensitiveWarningEnabled: boolean;
    readonly defaultReminderMinutes: number;
  };
};

// 역할 : 인증 응답에 포함되는 현재 기기 정보입니다.
export type AuthDevice = {
  readonly id: string;
  readonly slot: DeviceSlot | string;
  readonly label: string | null;
};

// 역할 : 로그인/토큰 갱신 API의 인증 토큰 응답입니다.
export type AuthTokenResponse = {
  readonly accessToken: string;
  readonly accessTokenExpiresAt: string;
  readonly refreshToken: null;
  readonly user: AuthUser;
  readonly device?: AuthDevice;
};

// 역할 : 외부 인증 token을 앱 세션으로 교환할 때의 입력값입니다.
export type ExchangeAuthTokenInput = {
  readonly externalAuthAccessToken: string;
  readonly deviceSlot: DeviceSlot;
  readonly deviceId: string;
  readonly deviceLabel?: string;
  readonly replaceExistingDevice?: boolean;
  readonly locale?: string;
  readonly timeZone?: string;
};

// 역할 : 사용자 프로필에서 사용하는 platform 역할 값입니다.
export type UserProfilePlatformRole = "USER" | "ADMIN";
// 역할 : 사용자 프로필에서 사용하는 계정 상태 값입니다.
export type UserProfileStatus = "ACTIVE" | "SUSPENDED" | "DELETED";

// 역할 : 사용자 프로필에 연결된 OAuth 계정 요약입니다.
export type UserProfileOAuthAccount = {
  readonly id: string;
  readonly provider: AuthProviderId | string;
  readonly providerEmail: string | null;
  readonly createdAt: string;
};

// 역할 : 내 프로필 조회 API 응답입니다.
export type UserProfileResponse = {
  readonly id: string;
  readonly email: string | null;
  readonly name: string | null;
  readonly platformRole: UserProfilePlatformRole | string;
  readonly status: UserProfileStatus | string;
  readonly timeZone: string;
  readonly preferredLocale: string;
  readonly countryCode: string;
  readonly defaultCurrencyCode: string;
  readonly signupLocale: string | null;
  readonly signupCountryCode: string | null;
  readonly signupTimeZone: string | null;
  readonly lastLoginLocale: string | null;
  readonly lastLoginCountryCode: string | null;
  readonly lastLoginTimeZone: string | null;
  readonly lastLoginAt: string | null;
  readonly jobSelectOnboardingCompletedAt: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly oauthAccounts: UserProfileOAuthAccount[];
};

// 역할 : 내 프로필 수정 API 입력값입니다.
export type UpdateUserProfileInput = {
  readonly name?: string | null;
  readonly timeZone?: string;
  readonly preferredLocale?: string;
  readonly countryCode?: string;
  readonly defaultCurrencyCode?: string;
};

// 역할 : 내 등록 기기 목록의 단일 기기 정보입니다.
export type MyDevice = {
  readonly id: string;
  readonly slot: DeviceSlot | string;
  readonly label: string | null;
  readonly status: string;
  readonly lastSeenAt: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly activeSessionCount: number;
  readonly isCurrentDevice: boolean;
};

// 역할 : 내 등록 기기 목록 API 응답입니다.
export type MyDeviceListResponse = {
  readonly devices: MyDevice[];
};

// 역할 : 직업 선택 온보딩 완료 API 응답입니다.
export type CompleteJobSelectionOnboardingResponse = {
  readonly jobSelectOnboardingCompletedAt: string;
};
