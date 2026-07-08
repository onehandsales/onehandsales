import type { Provider } from "@supabase/supabase-js";
import {
  exchangeSupabaseAccessToken,
  getMe,
  listAuthProviders,
  logoutAppSession,
  refreshAppAccessToken,
} from "@/features/auth/api/auth-api";
import type {
  AuthProviderId,
  AuthTokenResponse,
  DeviceSlot,
} from "@/features/auth/types/auth";
import { clearApiAccessToken, setApiAccessToken } from "@/lib/api-client";
import { env } from "@/lib/env";
import { createBrowserSupabaseClient } from "@/lib/supabase-client";
import { publicSiteLanguageStorageKey } from "@/features/public-site/i18n/public-site-language";

const accessTokenStorageKey = "onehand.userWeb.accessToken";
const accessTokenExpiresAtStorageKey = "onehand.userWeb.accessTokenExpiresAt";
const mockAccessToken = "mock-user-web-access-token";

export type AuthSessionState = {
  readonly accessToken: string;
  readonly accessTokenExpiresAt: string | null;
  readonly user: AuthTokenResponse["user"] | null;
  readonly isMock: boolean;
};

export const authService = {
  listProviders: listAuthProviders,

  async startProviderLogin(provider: AuthProviderId) {
    const supabase = createBrowserSupabaseClient();

    if (!supabase) {
      throw new Error("Supabase 환경 변수를 설정해 주세요.");
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: toSupabaseProvider(provider),
      options: {
        redirectTo: env.supabaseRedirectUrl,
      },
    });

    if (error) {
      throw error;
    }
  },

  async exchangeCurrentSupabaseSession() {
    const supabase = createBrowserSupabaseClient();

    if (!supabase) {
      return null;
    }

    const { data, error } = await supabase.auth.getSession();

    if (error) {
      throw error;
    }

    const supabaseAccessToken = data.session?.access_token;

    if (!supabaseAccessToken) {
      return null;
    }

    return this.exchangeSupabaseToken(supabaseAccessToken);
  },

  async exchangeSupabaseToken(supabaseAccessToken: string) {
    const response = await exchangeSupabaseAccessToken({
      supabaseAccessToken,
      ...getDeviceExchangePayload(),
    });

    persistSession(response);
    return toSessionState(response, false);
  },

  async refresh() {
    const response = await refreshAppAccessToken();
    persistSession(response);
    return toSessionState(response, false);
  },

  async restoreStoredSession() {
    const accessToken = window.localStorage.getItem(accessTokenStorageKey);
    const accessTokenExpiresAt = window.localStorage.getItem(
      accessTokenExpiresAtStorageKey
    );

    if (!accessToken) {
      return null;
    }

    setApiAccessToken(accessToken);

    if (accessToken === mockAccessToken) {
      return {
        accessToken,
        accessTokenExpiresAt,
        user: null,
        isMock: true,
      };
    }

    try {
      const user = await getMe();
      return {
        accessToken,
        accessTokenExpiresAt,
        user,
        isMock: false,
      };
    } catch {
      clearStoredSession();
      return null;
    }
  },

  loginWithMock() {
    const session = {
      accessToken: mockAccessToken,
      accessTokenExpiresAt: null,
      user: null,
      isMock: true,
    };

    setApiAccessToken(mockAccessToken);
    window.localStorage.setItem(accessTokenStorageKey, mockAccessToken);
    window.localStorage.removeItem(accessTokenExpiresAtStorageKey);

    return session;
  },

  async logout() {
    try {
      await logoutAppSession();
    } finally {
      const supabase = createBrowserSupabaseClient();
      await supabase?.auth.signOut();
      clearStoredSession();
    }
  },

  clearSession: clearStoredSession,
};

function persistSession(response: AuthTokenResponse) {
  setApiAccessToken(response.accessToken);
  window.localStorage.setItem(accessTokenStorageKey, response.accessToken);
  window.localStorage.setItem(
    accessTokenExpiresAtStorageKey,
    response.accessTokenExpiresAt
  );
}

function clearStoredSession() {
  clearApiAccessToken();
  window.localStorage.removeItem(accessTokenStorageKey);
  window.localStorage.removeItem(accessTokenExpiresAtStorageKey);
}

function toSessionState(
  response: AuthTokenResponse,
  isMock: boolean
): AuthSessionState {
  return {
    accessToken: response.accessToken,
    accessTokenExpiresAt: response.accessTokenExpiresAt,
    user: response.user,
    isMock,
  };
}

function getDeviceExchangePayload(): {
  readonly deviceSlot: DeviceSlot;
  readonly deviceId: string;
  readonly deviceLabel: string;
  readonly locale: string;
  readonly replaceExistingDevice: boolean;
  readonly timeZone: string;
} {
  const isMobile = window.matchMedia("(max-width: 767px)").matches;

  return {
    deviceSlot: isMobile ? "mobile" : "personal_laptop",
    deviceId: getOrCreateDeviceId(),
    deviceLabel: isMobile ? "Mobile browser" : "Personal browser",
    locale: getPreferredLocaleForExchange(),
    replaceExistingDevice: true,
    timeZone: getBrowserTimeZoneForExchange(),
  };
}

function getOrCreateDeviceId() {
  const storageKey = "onehand.userWeb.deviceId";
  const current = window.localStorage.getItem(storageKey);

  if (current && current.length >= 8) {
    return current;
  }

  const next =
    window.crypto?.randomUUID?.() ??
    `web-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
  window.localStorage.setItem(storageKey, next);

  return next;
}

function toSupabaseProvider(provider: AuthProviderId): Provider {
  return provider as Provider;
}

function getPreferredLocaleForExchange() {
  const publicLanguage = window.localStorage.getItem(publicSiteLanguageStorageKey);

  if (publicLanguage === "ko") return "ko-KR";
  if (publicLanguage === "ja") return "ja-JP";
  if (publicLanguage === "zh") return "zh-CN";
  if (publicLanguage === "en-US" || publicLanguage === "en-GB") {
    return publicLanguage;
  }

  return window.navigator.language || "ko-KR";
}

function getBrowserTimeZoneForExchange() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
}
