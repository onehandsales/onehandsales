import type {
  AuthDeviceRecord,
  AuthMeRecord,
} from "@/modules/auth/application/ports/auth.repository";

// 역할 : AuthTokenResponse 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface AuthTokenResponse {
  readonly accessToken: string;
  readonly accessTokenExpiresAt: string;
  readonly refreshToken: null;
  readonly user: MeResponse;
  readonly device?: {
    readonly id: string;
    readonly slot: string;
    readonly label: string | null;
  };
}

// 역할 : MeResponse 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface MeResponse {
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
}

// 역할 : AdminMeResponse 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface AdminMeResponse {
  readonly id: string;
  readonly externalAuthUserId: string | null;
  readonly name: string | null;
  readonly email: string | null;
  readonly platformRole: "ADMIN";
  readonly timeZone: string;
  readonly preferredLocale: string;
  readonly countryCode: string;
  readonly defaultCurrencyCode: string;
}

// 기능 : 로그인/토큰 갱신 결과를 클라이언트 응답 형식으로 변환합니다.
export function createAuthTokenResponse(input: {
  readonly accessToken: string;
  readonly accessTokenExpiresAt: Date;
  readonly user: AuthMeRecord;
  readonly device?: AuthDeviceRecord;
}): AuthTokenResponse {
  // 1. 앱 토큰과 사용자 정보를 기본 응답 구조로 변환한다.
  const response: AuthTokenResponse = {
    accessToken: input.accessToken,
    accessTokenExpiresAt: input.accessTokenExpiresAt.toISOString(),
    refreshToken: null,
    user: toMeResponse(input.user),
  };

  // 2. 교환 과정에서 기기 정보가 없으면 기본 응답만 반환한다.
  if (!input.device) {
    return response;
  }

  // 3. 기기 정보가 있으면 클라이언트 표시용 기기 요약을 응답에 포함한다.
  return {
    ...response,
    device: {
      id: input.device.id,
      slot: input.device.slot,
      label: input.device.label,
    },
  };
}

// 기능 : 인증 사용자 레코드를 일반 사용자 내 정보 응답으로 변환합니다.
export function toMeResponse(user: AuthMeRecord): MeResponse {
  // 1. 저장소 레코드의 내부 필드를 사용자 API 응답 필드로 매핑한다.
  return {
    id: user.id,
    externalAuthUserId: user.externalAuthUserId,
    name: user.displayName,
    email: user.email,
    platformRole: user.platformRole,
    status: user.status,
    timeZone: user.timeZone,
    preferredLocale: user.preferredLocale,
    countryCode: user.countryCode,
    defaultCurrencyCode: user.defaultCurrencyCode,
    signupLocale: user.signupLocale,
    signupCountryCode: user.signupCountryCode,
    signupTimeZone: user.signupTimeZone,
    lastLoginLocale: user.lastLoginLocale,
    lastLoginCountryCode: user.lastLoginCountryCode,
    lastLoginTimeZone: user.lastLoginTimeZone,
    jobSelectOnboardingCompletedAt:
      user.jobSelectOnboardingCompletedAt?.toISOString() ?? null,
  };
}

// 기능 : 인증 사용자 레코드를 관리자 내 정보 응답으로 변환합니다.
export function toAdminMeResponse(user: AuthMeRecord): AdminMeResponse {
  // 1. 저장소 레코드의 내부 필드를 관리자 권한 확인 응답 필드로 매핑한다.
  return {
    id: user.id,
    externalAuthUserId: user.externalAuthUserId,
    name: user.displayName,
    email: user.email,
    platformRole: "ADMIN",
    timeZone: user.timeZone,
    preferredLocale: user.preferredLocale,
    countryCode: user.countryCode,
    defaultCurrencyCode: user.defaultCurrencyCode,
  };
}
