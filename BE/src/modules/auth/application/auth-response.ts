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
}

// 역할 : AdminMeResponse 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface AdminMeResponse {
  readonly id: string;
  readonly supabaseUserId: string | null;
  readonly name: string | null;
  readonly email: string | null;
  readonly role: "ADMIN";
  readonly timeZone: string;
  readonly preferredLocale: string;
}

// 기능 : 로그인/토큰 갱신 결과를 클라이언트 응답 형식으로 변환합니다.
export function createAuthTokenResponse(input: {
  readonly accessToken: string;
  readonly accessTokenExpiresAt: Date;
  readonly user: AuthMeRecord;
  readonly device?: AuthDeviceRecord;
}): AuthTokenResponse {
  const response: AuthTokenResponse = {
    accessToken: input.accessToken,
    accessTokenExpiresAt: input.accessTokenExpiresAt.toISOString(),
    refreshToken: null,
    user: toMeResponse(input.user),
  };

  if (!input.device) {
    return response;
  }

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
  return {
    id: user.id,
    supabaseUserId: user.supabaseUserId,
    name: user.displayName,
    email: user.email,
    role: user.role,
    status: user.status,
    timeZone: user.timeZone,
    preferredLocale: user.preferredLocale,
    signupLocale: user.signupLocale,
    signupCountryCode: user.signupCountryCode,
    signupTimeZone: user.signupTimeZone,
    lastLoginLocale: user.lastLoginLocale,
    lastLoginCountryCode: user.lastLoginCountryCode,
    lastLoginTimeZone: user.lastLoginTimeZone,
  };
}

// 기능 : 인증 사용자 레코드를 관리자 내 정보 응답으로 변환합니다.
export function toAdminMeResponse(user: AuthMeRecord): AdminMeResponse {
  return {
    id: user.id,
    supabaseUserId: user.supabaseUserId,
    name: user.displayName,
    email: user.email,
    role: "ADMIN",
    timeZone: user.timeZone,
    preferredLocale: user.preferredLocale,
  };
}
