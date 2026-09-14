import { apiClient } from "@/lib/api-client";
import type {
  AuthProvidersResponse,
  AuthTokenResponse,
  AuthUser,
  CompleteJobSelectionOnboardingResponse,
  ExchangeAuthTokenInput,
  MyDeviceListResponse,
  UpdateUserProfileInput,
  UserProfileResponse,
} from "@/features/auth/types/auth";

// 기능 : User Web에 노출할 외부 인증 provider 목록을 조회합니다.
export function listAuthProviders() {
  // 1. 인증 전 화면에서도 호출할 수 있도록 refresh 재시도를 건너뛴다.
  return apiClient<AuthProvidersResponse>("/api/auth/providers", {
    skipAuthRefresh: true,
  });
}

// 기능 : 외부 인증 access token을 Backend 앱 세션으로 교환합니다.
export function exchangeExternalAuthAccessToken(input: ExchangeAuthTokenInput) {
  // 1. 외부 인증 token은 Authorization header로 보내고 기기 메타데이터는 body로 보낸다.
  return apiClient<AuthTokenResponse>("/api/auth/exchange", {
    accessToken: input.externalAuthAccessToken,
    body: {
      deviceSlot: input.deviceSlot,
      deviceId: input.deviceId,
      deviceLabel: input.deviceLabel,
      locale: input.locale,
      replaceExistingDevice: input.replaceExistingDevice,
      timeZone: input.timeZone,
    },
    method: "POST",
    skipAuthRefresh: true,
    withCredentials: true,
  });
}

// 기능 : refresh cookie로 앱 access token을 재발급합니다.
export function refreshAppAccessToken() {
  // 1. httpOnly refresh cookie가 전송되도록 credentials를 포함한다.
  return apiClient<AuthTokenResponse>("/api/auth/refresh", {
    method: "POST",
    skipAuthRefresh: true,
    withCredentials: true,
  });
}

// 기능 : 현재 Backend 앱 세션을 로그아웃합니다.
export function logoutAppSession() {
  // 1. refresh cookie 폐기를 위해 credentials를 포함한다.
  return apiClient<{ readonly ok?: boolean }>("/api/auth/logout", {
    method: "POST",
    skipAuthRefresh: true,
    withCredentials: true,
  });
}

// 기능 : 현재 로그인한 사용자 정보를 조회합니다.
export function getMe() {
  // 1. API client에 저장된 앱 access token으로 현재 사용자를 요청한다.
  return apiClient<AuthUser>("/api/me");
}

// 기능 : 현재 사용자의 프로필 상세 정보를 조회합니다.
export function getMyProfile() {
  // 1. 인증된 사용자 프로필 API를 호출한다.
  return apiClient<UserProfileResponse>("/api/users/me/profile");
}

// 기능 : 현재 사용자의 프로필 상세 정보를 수정합니다.
export function updateMyProfile(input: UpdateUserProfileInput) {
  // 1. 수정할 프로필 필드를 PATCH body로 전달한다.
  return apiClient<UserProfileResponse>("/api/users/me/profile", {
    method: "PATCH",
    body: input,
  });
}

// 기능 : 현재 사용자의 직업 선택 온보딩 완료 시각을 저장합니다.
export function completeJobSelectionOnboarding() {
  // 1. 선택한 직업 값은 저장하지 않고 온보딩 완료 시각만 서버에 기록한다.
  return apiClient<CompleteJobSelectionOnboardingResponse>(
    "/api/users/me/onboarding/job-selection",
    {
      method: "POST",
    }
  );
}

// 기능 : 현재 사용자의 등록 기기 목록을 조회합니다.
export function listMyDevices() {
  // 1. 내 계정에 연결된 인증 기기 목록 API를 호출한다.
  return apiClient<MyDeviceListResponse>("/api/users/me/devices");
}
