import type { Provider } from "@supabase/supabase-js";
import {
  exchangeExternalAuthAccessToken,
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

// 기능 : 현재 창이 OAuth 팝업 callback 창인지 판별합니다.
export function isAuthPopupCallbackWindow() {
  // 1. 팝업 window name, opener, 진행 중인 popup 요청 기록 중 하나라도 있으면 callback 창으로 본다.
  return (
    window.name.startsWith(authPopupWindowNamePrefix) ||
    Boolean(window.opener) ||
    hasActiveAuthPopupRequest()
  );
}

export const authService = {
  listProviders: listAuthProviders,

  // 기능 : 선택한 외부 인증 provider의 로그인 흐름을 시작합니다.
  async startProviderLogin(
    provider: AuthProviderId,
    options: StartProviderLoginOptions = {}
  ) {
    // 1. popup 모드 요청이면 팝업 전용 로그인 흐름으로 위임한다.
    if (options.mode === "popup") {
      return startPopupProviderLogin(provider);
    }

    // 2. redirect 모드에서는 이전 popup 요청 기록을 지우고 전체 페이지 이동을 준비한다.
    clearAuthPopupRequest();

    // 3. 현재 구현 provider인 Supabase 브라우저 클라이언트를 생성한다.
    const supabase = createBrowserSupabaseClient();

    // 4. 환경 변수가 없으면 사용자가 이해할 수 있는 설정 오류를 던진다.
    if (!supabase) {
      throw new Error("Supabase 환경 변수를 설정해 주세요.");
    }

    // 5. provider OAuth 페이지로 redirect하는 외부 인증 로그인을 시작한다.
    const { error } = await supabase.auth.signInWithOAuth({
      provider: toSupabaseProvider(provider),
      options: {
        redirectTo: env.supabaseRedirectUrl,
      },
    });

    // 6. 외부 인증 provider 시작 실패를 호출자에게 전달한다.
    if (error) {
      throw error;
    }
  },

  // 기능 : 현재 외부 인증 세션을 Backend 앱 세션으로 교환합니다.
  async exchangeCurrentExternalAuthSession() {
    // 1. 현재 구현 provider의 브라우저 클라이언트를 만든다.
    const supabase = createBrowserSupabaseClient();

    // 2. 외부 인증 클라이언트가 없으면 교환할 세션이 없는 것으로 처리한다.
    if (!supabase) {
      return null;
    }

    // 3. 브라우저에 저장된 외부 인증 세션을 읽는다.
    const { data, error } = await supabase.auth.getSession();

    // 4. 외부 인증 세션 조회 실패는 호출자에게 전달한다.
    if (error) {
      throw error;
    }

    // 5. 외부 인증 access token을 Backend exchange 입력으로 추출한다.
    const externalAuthAccessToken = data.session?.access_token;

    // 6. access token이 없으면 앱 세션 교환을 수행하지 않는다.
    if (!externalAuthAccessToken) {
      return null;
    }

    // 7. 외부 인증 token을 Backend 앱 token과 refresh cookie로 교환한다.
    return this.exchangeExternalAuthToken(externalAuthAccessToken);
  },

  // 기능 : 외부 인증 access token을 Backend 앱 세션으로 교환하고 저장합니다.
  async exchangeExternalAuthToken(externalAuthAccessToken: string) {
    // 1. 외부 인증 token과 현재 브라우저 기기 메타데이터를 Backend로 전달한다.
    const response = await exchangeExternalAuthAccessToken({
      externalAuthAccessToken,
      ...getDeviceExchangePayload(),
    });

    // 2. Backend가 발급한 앱 세션을 브라우저 저장소와 API client에 반영한다.
    persistSession(response);
    // 3. React auth state에서 쓰기 쉬운 세션 형태로 변환한다.
    return toSessionState(response);
  },

  // 기능 : refresh cookie로 앱 access token을 재발급하고 저장합니다.
  async refresh() {
    // 1. Backend refresh API로 새 앱 access token을 요청한다.
    const response = await refreshAppAccessToken();
    // 2. 새 앱 access token과 만료 시각을 저장한다.
    persistSession(response);
    // 3. React auth state에서 쓰기 쉬운 세션 형태로 변환한다.
    return toSessionState(response);
  },

  // 기능 : localStorage에 남은 앱 세션을 복원하고 유효성을 확인합니다.
  async restoreStoredSession() {
    // 1. 저장된 앱 access token과 만료 시각을 읽는다.
    const accessToken = window.localStorage.getItem(accessTokenStorageKey);
    const accessTokenExpiresAt = window.localStorage.getItem(
      accessTokenExpiresAtStorageKey
    );

    // 2. 저장된 access token이 없으면 복원할 세션이 없다.
    if (!accessToken) {
      return null;
    }

    // 3. API client에 token을 먼저 주입해 현재 사용자 조회가 인증되도록 한다.
    setApiAccessToken(accessToken);

    try {
      // 4. Backend 현재 사용자 API로 저장된 token이 아직 유효한지 확인한다.
      const user = await getMe();
      return {
        accessToken,
        accessTokenExpiresAt,
        user,
      };
    } catch {
      // 5. 저장된 token이 유효하지 않으면 브라우저 세션 흔적을 정리한다.
      clearStoredSession();
      return null;
    }
  },

  // 기능 : Backend 앱 세션과 외부 인증 세션을 모두 로그아웃합니다.
  async logout() {
    try {
      // 1. Backend 앱 세션을 폐기하고 refresh cookie를 정리한다.
      await logoutAppSession();
    } finally {
      // 2. 외부 인증 provider 세션도 정리한 뒤 로컬 token을 삭제한다.
      const supabase = createBrowserSupabaseClient();
      await supabase?.auth.signOut();
      clearStoredSession();
    }
  },

  clearSession: clearStoredSession,
};

// 기능 : 팝업 창을 사용해 외부 인증 provider 로그인을 진행합니다.
async function startPopupProviderLogin(provider: AuthProviderId) {
  // 1. OAuth provider로 이동할 빈 팝업 창을 먼저 연다.
  const popup = openAuthPopupWindow();

  // 2. 팝업 차단 시 기존 redirect 방식으로 fallback한다.
  if (!popup) {
    clearAuthPopupRequest();
    await authService.startProviderLogin(provider);
    return;
  }

  // 3. callback 창 판별을 위해 popup 요청 시작 시각을 저장한다.
  markAuthPopupRequest();

  try {
    // 4. 현재 구현 provider의 브라우저 클라이언트를 생성한다.
    const supabase = createBrowserSupabaseClient();

    // 5. 환경 변수가 없으면 popup 흐름을 중단한다.
    if (!supabase) {
      throw new Error("Supabase environment variables are not configured.");
    }

    // 6. redirect 없이 OAuth provider 이동 URL만 발급받는다.
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: toSupabaseProvider(provider),
      options: {
        redirectTo: env.supabaseRedirectUrl,
        skipBrowserRedirect: true,
      },
    });

    // 7. provider 시작 실패는 popup 정리 후 호출자에게 전달한다.
    if (error) {
      throw error;
    }

    // 8. provider URL이 없으면 인증을 시작할 수 없으므로 실패 처리한다.
    if (!data.url) {
      throw new Error("OAuth provider did not return a sign-in URL.");
    }

    // 9. 팝업을 provider URL로 이동시키고 callback 완료를 기다린다.
    navigatePopupToUrl(popup, data.url);
    await waitForPopupLoginCompletion(popup);

    // 10. callback 창에서 저장한 앱 세션을 부모 창에서 복원한다.
    const restoredSession = await authService.restoreStoredSession();

    // 11. 세션이 복원되지 않으면 로그인 미완료로 처리한다.
    if (!restoredSession) {
      throw new Error("Sign-in was not completed.");
    }

    // 12. 성공한 popup 창과 요청 상태를 정리한다.
    closePopupWindow(popup);
    clearAuthPopupRequest();
    return restoredSession;
  } catch (error) {
    // 13. 실패 시에도 popup과 요청 상태를 정리한 뒤 원래 오류를 유지한다.
    closePopupWindow(popup);
    clearAuthPopupRequest();
    throw error;
  }
}

// 기능 : 앱 세션 응답을 API client와 localStorage에 저장합니다.
function persistSession(response: AuthTokenResponse) {
  // 1. 현재 탭의 API client가 즉시 새 access token을 사용하게 한다.
  setApiAccessToken(response.accessToken);
  // 2. 새로고침 이후 복원을 위해 access token과 만료 시각을 저장한다.
  window.localStorage.setItem(accessTokenStorageKey, response.accessToken);
  window.localStorage.setItem(
    accessTokenExpiresAtStorageKey,
    response.accessTokenExpiresAt
  );
}

// 기능 : 브라우저에 저장된 앱 세션 정보를 제거합니다.
function clearStoredSession() {
  // 1. 현재 탭의 API client access token을 제거한다.
  clearApiAccessToken();
  // 2. 새로고침 복원용 localStorage 값을 제거한다.
  window.localStorage.removeItem(accessTokenStorageKey);
  window.localStorage.removeItem(accessTokenExpiresAtStorageKey);
}

// 기능 : OAuth popup 요청 시작 시각을 저장합니다.
function markAuthPopupRequest() {
  // 1. callback 창 판별에 사용할 timestamp를 localStorage에 남긴다.
  window.localStorage.setItem(authPopupRequestStorageKey, String(Date.now()));
}

// 기능 : OAuth popup 요청 상태를 제거합니다.
function clearAuthPopupRequest() {
  // 1. popup callback 판별에 사용한 요청 기록을 삭제한다.
  window.localStorage.removeItem(authPopupRequestStorageKey);
}

// 기능 : 최근에 시작한 OAuth popup 요청이 아직 유효한지 확인합니다.
function hasActiveAuthPopupRequest() {
  // 1. popup 요청 시작 시각을 localStorage에서 읽는다.
  const rawStartedAt = window.localStorage.getItem(authPopupRequestStorageKey);

  // 2. 시작 시각이 없으면 활성 popup 요청이 아니다.
  if (!rawStartedAt) {
    return false;
  }

  // 3. 숫자 timestamp로 변환해 유효 시간을 계산한다.
  const startedAt = Number(rawStartedAt);

  // 4. timeout 안에 시작된 요청만 활성 요청으로 인정한다.
  return (
    Number.isFinite(startedAt) &&
    startedAt > 0 &&
    Date.now() - startedAt <= authPopupTimeoutMs
  );
}

// 기능 : OAuth 로그인을 진행할 팝업 창을 엽니다.
function openAuthPopupWindow() {
  // 1. 인증 전용 이름과 크기로 빈 popup 창을 연다.
  const popup = window.open(
    "about:blank",
    `${authPopupWindowNamePrefix}-${Date.now()}`,
    getAuthPopupFeatures()
  );

  // 2. 브라우저가 popup을 차단하면 null을 반환한다.
  if (!popup) {
    return null;
  }

  try {
    // 3. 사용자가 빈 popup을 인지할 수 있도록 제목과 focus를 설정한다.
    popup.document.title = "OneHand sign-in";
    popup.focus();
  } catch {
    // The popup can become cross-origin as soon as navigation starts.
  }

  return popup;
}

// 기능 : OAuth popup 창의 위치와 브라우저 옵션 문자열을 생성합니다.
function getAuthPopupFeatures() {
  // 1. 로그인 popup의 기본 크기를 정의한다.
  const width = 480;
  const height = 720;
  // 2. 현재 브라우저 창 중앙에 popup이 뜨도록 좌표를 계산한다.
  const left = Math.max(0, window.screenX + (window.outerWidth - width) / 2);
  const top = Math.max(0, window.screenY + (window.outerHeight - height) / 2);

  // 3. 브라우저 window.open이 이해하는 feature 문자열로 변환한다.
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

// 기능 : 준비된 popup 창을 OAuth provider URL로 이동시킵니다.
function navigatePopupToUrl(popup: Window, url: string) {
  // 1. 인증 시작 전에 사용자가 popup을 닫았으면 실패로 처리한다.
  if (popup.closed) {
    throw new Error("Sign-in popup was closed before authentication started.");
  }

  // 2. popup을 provider URL로 이동시키고 focus를 되돌린다.
  popup.location.assign(url);
  popup.focus();
}

// 기능 : popup callback이 앱 세션을 저장하거나 popup이 닫힐 때까지 기다립니다.
function waitForPopupLoginCompletion(popup: Window) {
  return new Promise<void>((resolve, reject) => {
    // 1. 여러 이벤트가 동시에 들어와도 한 번만 완료되도록 상태를 둔다.
    let isSettled = false;
    let pollId: number | null = null;
    let timeoutId: number | null = null;

    // 2. 완료 후 interval, timeout, storage listener를 모두 해제한다.
    // 기능 : cleanup 기능을 수행합니다.
    const cleanup = () => {
      if (pollId !== null) {
        window.clearInterval(pollId);
      }

      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }

      window.removeEventListener("storage", onStorage);
    };

    // 3. 최초 완료 이벤트만 처리하고 이후 이벤트는 무시한다.
    // 기능 : settle 값을 설정합니다.
    const settle = (callback: () => void) => {
      // 1. 조건을 확인해 필요한 분기 처리를 수행한다.
      if (isSettled) {
        return;
      }

      // 2. 현재 단계에서 필요한 side effect를 실행한다.
      isSettled = true;
      // 3. 현재 단계에서 필요한 side effect를 실행한다.
      cleanup();
      // 4. 현재 단계에서 필요한 side effect를 실행한다.
      callback();
    };

    // 4. callback 창이 access token을 저장하면 부모 창의 대기를 종료한다.
    // 기능 : on Storage 기능을 수행합니다.
    const onStorage = (event: StorageEvent) => {
      if (event.key === accessTokenStorageKey && event.newValue) {
        settle(resolve);
      }
    };

    // 5. 사용자가 popup을 닫은 경우에도 부모 창 대기를 끝낸다.
    pollId = window.setInterval(() => {
      if (popup.closed) {
        settle(resolve);
      }
    }, authPopupPollIntervalMs);

    // 6. 제한 시간 내 완료되지 않으면 popup을 닫고 timeout 오류를 반환한다.
    timeoutId = window.setTimeout(() => {
      closePopupWindow(popup);
      settle(() => {
        reject(new Error("Sign-in took too long. Please try again."));
      });
    }, authPopupTimeoutMs);

    // 7. 다른 창의 localStorage 변경을 감지해 로그인 완료를 확인한다.
    window.addEventListener("storage", onStorage);
  });
}

// 기능 : OAuth popup 창이 열려 있으면 안전하게 닫습니다.
function closePopupWindow(popup: Window) {
  try {
    // 1. 이미 닫힌 창이 아니면 close를 호출한다.
    if (!popup.closed) {
      popup.close();
    }
  } catch {
    // The user may already have closed the popup.
  }
}

// 기능 : Backend 인증 응답을 React 상태용 세션 객체로 변환합니다.
function toSessionState(response: AuthTokenResponse): AuthSessionState {
  // 1. UI 상태에서 필요한 앱 token, 만료 시각, 사용자 정보만 남긴다.
  return {
    accessToken: response.accessToken,
    accessTokenExpiresAt: response.accessTokenExpiresAt,
    user: response.user,
  };
}

// 기능 : Backend exchange 요청에 필요한 브라우저 기기 메타데이터를 만듭니다.
function getDeviceExchangePayload(): {
  readonly deviceSlot: DeviceSlot;
  readonly deviceId: string;
  readonly deviceLabel: string;
  readonly locale: string;
  readonly replaceExistingDevice: boolean;
  readonly timeZone: string;
} {
  // 1. 현재 viewport 기준으로 모바일/개인 브라우저 slot을 선택한다.
  const isMobile = window.matchMedia("(max-width: 767px)").matches;

  // 2. Backend가 기기 등록과 로그인 메타데이터 갱신에 사용할 payload를 만든다.
  return {
    deviceSlot: isMobile ? "mobile" : "personal_laptop",
    deviceId: getOrCreateDeviceId(),
    deviceLabel: isMobile ? "Mobile browser" : "Personal browser",
    locale: getPreferredLocaleForExchange(),
    replaceExistingDevice: true,
    timeZone: getBrowserTimeZoneForExchange(),
  };
}

// 기능 : 브라우저별 고정 기기 식별자를 조회하거나 새로 생성합니다.
function getOrCreateDeviceId() {
  // 1. localStorage에 저장된 기존 기기 식별자를 조회한다.
  const storageKey = "onehand.userWeb.deviceId";
  const current = window.localStorage.getItem(storageKey);

  // 2. 기존 식별자가 최소 길이를 만족하면 그대로 재사용한다.
  if (current && current.length >= 8) {
    return current;
  }

  // 3. Web Crypto UUID를 우선 사용하고, 없으면 시간 기반 fallback 식별자를 만든다.
  const next =
    window.crypto?.randomUUID?.() ??
    `web-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
  // 4. 이후 로그인에서 같은 브라우저 기기로 인식되도록 저장한다.
  window.localStorage.setItem(storageKey, next);

  return next;
}

// 기능 : 앱 provider ID를 현재 외부 인증 provider가 요구하는 provider ID로 변환합니다.
function toSupabaseProvider(provider: AuthProviderId): Provider {
  // 1. Supabase custom provider로 등록된 LINE은 custom prefix를 붙인다.
  if (provider === "line") {
    return "custom:line" as Provider;
  }

  // 2. 표준 provider는 앱 provider ID를 그대로 사용한다.
  return provider as Provider;
}

// 기능 : 공개 사이트 언어와 브라우저 언어를 G02 지원 locale로 축소합니다.
function getPreferredLocaleForExchange() {
  // 1. 사용자가 공개 사이트에서 선택한 언어를 우선한다.
  const publicLanguage = window.localStorage.getItem(publicSiteLanguageStorageKey);

  // 2. 공개 사이트 언어가 한국어/영어면 Backend 지원 locale로 변환한다.
  if (publicLanguage === "ko" || publicLanguage === "ko-KR") return "ko-KR";
  if (publicLanguage === "en" || publicLanguage?.startsWith("en-")) {
    return "en";
  }

  // 3. 공개 사이트 언어가 없으면 브라우저 언어를 사용한다.
  const browserLanguage = window.navigator.language?.toLowerCase() ?? "";

  // 4. 브라우저 언어가 한국어면 ko-KR로 저장한다.
  if (browserLanguage === "ko" || browserLanguage === "ko-kr") {
    return "ko-KR";
  }

  // 5. 브라우저 언어가 영어 계열이면 en으로 저장한다.
  if (browserLanguage === "en" || browserLanguage.startsWith("en-")) {
    return "en";
  }

  // 6. 지원하지 않는 언어는 기본 한국어 locale로 대체한다.
  return "ko-KR";
}

// 기능 : 브라우저 시간대를 전달하고 없으면 사용자 기본 시간대로 대체합니다.
function getBrowserTimeZoneForExchange() {
  // 1. 브라우저 Intl API의 IANA timezone을 읽고 없으면 기본값을 사용한다.
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Seoul";
}
