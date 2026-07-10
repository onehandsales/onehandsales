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
  StartProviderLoginOptions,
} from "@/features/auth/types/auth";
import { clearApiAccessToken, setApiAccessToken } from "@/lib/api-client";
import { env } from "@/lib/env";
import { createBrowserSupabaseClient } from "@/lib/supabase-client";
import { publicSiteLanguageStorageKey } from "@/features/public-site/i18n/public-site-language";

const accessTokenStorageKey = "onehand.userWeb.accessToken";
const accessTokenExpiresAtStorageKey = "onehand.userWeb.accessTokenExpiresAt";
const authPopupRequestStorageKey = "onehand.userWeb.authPopupRequest";
const authPopupWindowNamePrefix = "onehand-auth-popup";
const authPopupPollIntervalMs = 500;
const authPopupTimeoutMs = 10 * 60 * 1000;

export type AuthSessionState = {
  readonly accessToken: string;
  readonly accessTokenExpiresAt: string | null;
  readonly user: AuthTokenResponse["user"] | null;
};

export function isAuthPopupCallbackWindow() {
  return (
    window.name.startsWith(authPopupWindowNamePrefix) ||
    Boolean(window.opener) ||
    hasActiveAuthPopupRequest()
  );
}

export const authService = {
  listProviders: listAuthProviders,

  async startProviderLogin(
    provider: AuthProviderId,
    options: StartProviderLoginOptions = {}
  ) {
    if (options.mode === "popup") {
      return startPopupProviderLogin(provider);
    }

    clearAuthPopupRequest();

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
    return toSessionState(response);
  },

  async refresh() {
    const response = await refreshAppAccessToken();
    persistSession(response);
    return toSessionState(response);
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

    try {
      const user = await getMe();
      return {
        accessToken,
        accessTokenExpiresAt,
        user,
      };
    } catch {
      clearStoredSession();
      return null;
    }
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

async function startPopupProviderLogin(provider: AuthProviderId) {
  const popup = openAuthPopupWindow();

  if (!popup) {
    clearAuthPopupRequest();
    await authService.startProviderLogin(provider);
    return;
  }

  markAuthPopupRequest();

  try {
    const supabase = createBrowserSupabaseClient();

    if (!supabase) {
      throw new Error("Supabase environment variables are not configured.");
    }

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: toSupabaseProvider(provider),
      options: {
        redirectTo: env.supabaseRedirectUrl,
        skipBrowserRedirect: true,
      },
    });

    if (error) {
      throw error;
    }

    if (!data.url) {
      throw new Error("OAuth provider did not return a sign-in URL.");
    }

    navigatePopupToUrl(popup, data.url);
    await waitForPopupLoginCompletion(popup);

    const restoredSession = await authService.restoreStoredSession();

    if (!restoredSession) {
      throw new Error("Sign-in was not completed.");
    }

    closePopupWindow(popup);
    clearAuthPopupRequest();
    return restoredSession;
  } catch (error) {
    closePopupWindow(popup);
    clearAuthPopupRequest();
    throw error;
  }
}

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

function markAuthPopupRequest() {
  window.localStorage.setItem(authPopupRequestStorageKey, String(Date.now()));
}

function clearAuthPopupRequest() {
  window.localStorage.removeItem(authPopupRequestStorageKey);
}

function hasActiveAuthPopupRequest() {
  const rawStartedAt = window.localStorage.getItem(authPopupRequestStorageKey);

  if (!rawStartedAt) {
    return false;
  }

  const startedAt = Number(rawStartedAt);

  return (
    Number.isFinite(startedAt) &&
    startedAt > 0 &&
    Date.now() - startedAt <= authPopupTimeoutMs
  );
}

function openAuthPopupWindow() {
  const popup = window.open(
    "about:blank",
    `${authPopupWindowNamePrefix}-${Date.now()}`,
    getAuthPopupFeatures()
  );

  if (!popup) {
    return null;
  }

  try {
    popup.document.title = "Onehand sign-in";
    popup.focus();
  } catch {
    // The popup can become cross-origin as soon as navigation starts.
  }

  return popup;
}

function getAuthPopupFeatures() {
  const width = 480;
  const height = 720;
  const left = Math.max(0, window.screenX + (window.outerWidth - width) / 2);
  const top = Math.max(0, window.screenY + (window.outerHeight - height) / 2);

  return [
    "popup=yes",
    "resizable=yes",
    "scrollbars=yes",
    "toolbar=no",
    "menubar=no",
    "status=no",
    `width=${width}`,
    `height=${height}`,
    `left=${Math.round(left)}`,
    `top=${Math.round(top)}`,
  ].join(",");
}

function navigatePopupToUrl(popup: Window, url: string) {
  if (popup.closed) {
    throw new Error("Sign-in popup was closed before authentication started.");
  }

  popup.location.assign(url);
  popup.focus();
}

function waitForPopupLoginCompletion(popup: Window) {
  return new Promise<void>((resolve, reject) => {
    let isSettled = false;
    let pollId: number | null = null;
    let timeoutId: number | null = null;

    const cleanup = () => {
      if (pollId !== null) {
        window.clearInterval(pollId);
      }

      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }

      window.removeEventListener("storage", onStorage);
    };

    const settle = (callback: () => void) => {
      if (isSettled) {
        return;
      }

      isSettled = true;
      cleanup();
      callback();
    };

    const onStorage = (event: StorageEvent) => {
      if (event.key === accessTokenStorageKey && event.newValue) {
        settle(resolve);
      }
    };

    pollId = window.setInterval(() => {
      if (popup.closed) {
        settle(resolve);
      }
    }, authPopupPollIntervalMs);

    timeoutId = window.setTimeout(() => {
      closePopupWindow(popup);
      settle(() => {
        reject(new Error("Sign-in took too long. Please try again."));
      });
    }, authPopupTimeoutMs);

    window.addEventListener("storage", onStorage);
  });
}

function closePopupWindow(popup: Window) {
  try {
    if (!popup.closed) {
      popup.close();
    }
  } catch {
    // The user may already have closed the popup.
  }
}

function toSessionState(response: AuthTokenResponse): AuthSessionState {
  return {
    accessToken: response.accessToken,
    accessTokenExpiresAt: response.accessTokenExpiresAt,
    user: response.user,
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
  if (publicLanguage === "zh" || publicLanguage === "zh-TW") return "zh-TW";
  if (
    publicLanguage === "en-US" ||
    publicLanguage === "en-GB" ||
    publicLanguage === "en-SG" ||
    publicLanguage === "en-AU" ||
    publicLanguage === "en-CA"
  ) {
    return publicLanguage;
  }

  return window.navigator.language || "ko-KR";
}

function getBrowserTimeZoneForExchange() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
}
