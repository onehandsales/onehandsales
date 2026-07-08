import { apiClient } from "@/lib/api-client";
import type {
  AuthProvidersResponse,
  AuthTokenResponse,
  AuthUser,
  ExchangeAuthTokenInput,
  MyDeviceListResponse,
  UpdateUserProfileInput,
  UserProfileResponse,
} from "@/features/auth/types/auth";

export function listAuthProviders() {
  return apiClient<AuthProvidersResponse>("/api/auth/providers", {
    skipAuthRefresh: true,
  });
}

export function exchangeSupabaseAccessToken(input: ExchangeAuthTokenInput) {
  return apiClient<AuthTokenResponse>("/api/auth/exchange", {
    accessToken: input.supabaseAccessToken,
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

export function refreshAppAccessToken() {
  return apiClient<AuthTokenResponse>("/api/auth/refresh", {
    method: "POST",
    skipAuthRefresh: true,
    withCredentials: true,
  });
}

export function logoutAppSession() {
  return apiClient<{ readonly ok?: boolean }>("/api/auth/logout", {
    method: "POST",
    skipAuthRefresh: true,
    withCredentials: true,
  });
}

export function getMe() {
  return apiClient<AuthUser>("/api/me");
}

export function getMyProfile() {
  return apiClient<UserProfileResponse>("/api/users/me/profile");
}

export function updateMyProfile(input: UpdateUserProfileInput) {
  return apiClient<UserProfileResponse>("/api/users/me/profile", {
    method: "PATCH",
    body: input,
  });
}

export function listMyDevices() {
  return apiClient<MyDeviceListResponse>("/api/users/me/devices");
}
