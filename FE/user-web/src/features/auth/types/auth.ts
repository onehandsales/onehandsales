export type AuthProviderId = "kakao" | "google";

export type AuthProviderLoginMode = "redirect" | "popup";

export type StartProviderLoginOptions = {
  readonly mode?: AuthProviderLoginMode;
};

export type DeviceSlot = "mobile" | "personal_laptop" | "work_laptop";

export type AuthProviderOption = {
  readonly provider: AuthProviderId;
  readonly label: string;
  readonly enabled: boolean;
};

export type AuthProvidersResponse = {
  readonly providers: AuthProviderOption[];
};

export type AuthUser = {
  readonly id: string;
  readonly supabaseUserId: string | null;
  readonly name: string | null;
  readonly email: string | null;
  readonly role: string;
  readonly status: string;
  readonly timeZone: string;
  readonly preferredLocale: string;
  readonly signupLocale: string | null;
  readonly signupCountryCode: string | null;
  readonly signupTimeZone: string | null;
  readonly lastLoginLocale: string | null;
  readonly lastLoginCountryCode: string | null;
  readonly lastLoginTimeZone: string | null;
  readonly settings: {
    readonly sensitiveWarningEnabled: boolean;
    readonly defaultReminderMinutes: number;
    readonly emailNotificationEnabled: boolean;
    readonly browserPushEnabled: boolean;
  };
};

export type AuthDevice = {
  readonly id: string;
  readonly slot: DeviceSlot | string;
  readonly label: string | null;
};

export type AuthTokenResponse = {
  readonly accessToken: string;
  readonly accessTokenExpiresAt: string;
  readonly refreshToken: null;
  readonly user: AuthUser;
  readonly device?: AuthDevice;
};

export type ExchangeAuthTokenInput = {
  readonly supabaseAccessToken: string;
  readonly deviceSlot: DeviceSlot;
  readonly deviceId: string;
  readonly deviceLabel?: string;
  readonly replaceExistingDevice?: boolean;
  readonly locale?: string;
  readonly timeZone?: string;
};

export type UserProfileRole = "USER" | "ADMIN";
export type UserProfileStatus = "ACTIVE" | "SUSPENDED" | "DELETED";

export type UserProfileOAuthAccount = {
  readonly id: string;
  readonly provider: AuthProviderId | string;
  readonly providerEmail: string | null;
  readonly createdAt: string;
};

export type UserProfileResponse = {
  readonly id: string;
  readonly email: string | null;
  readonly name: string | null;
  readonly role: UserProfileRole | string;
  readonly status: UserProfileStatus | string;
  readonly timeZone: string;
  readonly preferredLocale: string;
  readonly signupLocale: string | null;
  readonly signupCountryCode: string | null;
  readonly signupTimeZone: string | null;
  readonly lastLoginLocale: string | null;
  readonly lastLoginCountryCode: string | null;
  readonly lastLoginTimeZone: string | null;
  readonly lastLoginAt: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly oauthAccounts: UserProfileOAuthAccount[];
};

export type UpdateUserProfileInput = {
  readonly name?: string | null;
  readonly timeZone?: string;
  readonly preferredLocale?: string;
};

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

export type MyDeviceListResponse = {
  readonly devices: MyDevice[];
};
