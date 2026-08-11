import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  authService,
  AuthLandingPage,
  AuthLoginPage,
  type AuthProviderId,
  type AuthProviderOption,
  isAuthPopupCallbackWindow,
  useAuthSession,
} from "@/features/auth";
import { usePublicSitePath } from "@/features/public-site/i18n/public-site-locale-hooks";
import { stripPublicSiteLocaleFromPathname } from "@/features/public-site/i18n/public-site-locale-routes";
import { getApiErrorMessage } from "@/lib/api-client";

const fallbackProviders: AuthProviderOption[] = [
  { provider: "google", label: "Google", enabled: true },
  { provider: "line", label: "LINE", enabled: true },
  { provider: "apple", label: "Apple", enabled: true },
];
const minimumLoginLoadingMs = 1500;

// 기능 : 로그인 페이지를 렌더링합니다.
export function LoginPage() {
  const {
    error: authError,
    exchangeCurrentSupabaseSession,
    isAuthenticated,
    isInitializing,
    isPending,
    startProviderLogin,
  } = useAuthSession();
  const location = useLocation();
  const navigate = useNavigate();
  const publicSitePath = usePublicSitePath();
  const [providers, setProviders] = useState<AuthProviderOption[]>([]);
  const [providersError, setProvidersError] = useState<string | null>(null);
  const [isProvidersLoading, setIsProvidersLoading] = useState(true);
  const [isCallbackLoginLoading, setIsCallbackLoginLoading] = useState(false);
  const publicPathname = stripPublicSiteLocaleFromPathname(location.pathname);
  const isCallbackRoute = location.pathname === "/auth/callback";
  const isPopupCallbackRoute =
    isCallbackRoute && isAuthPopupCallbackWindow();
  const isLoginRoute = publicPathname === "/login";
  const isSignupRoute = publicPathname === "/signup";
  const [pendingProvider, setPendingProvider] = useState<AuthProviderId | null>(
    null
  );
  const callbackExchangeRef = useRef<{
    readonly promise: Promise<boolean>;
    readonly startedAt: number;
  } | null>(null);
  const redirectTo = getRedirectPath(location.state);
  const enabledProviders = useMemo(
    () => providers.filter((provider) => provider.enabled),
    [providers]
  );

  useEffect(() => {
    let isMounted = true;

    void authService
      .listProviders()
      .then((response) => {
        if (isMounted) {
          setProviders(response.providers);
        }
      })
      .catch((error) => {
        if (isMounted) {
          setProviders(fallbackProviders);
          setProvidersError(getApiErrorMessage(error));
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsProvidersLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isCallbackRoute) {
      callbackExchangeRef.current = null;
      setIsCallbackLoginLoading(false);
      return;
    }

    if (isInitializing) {
      return;
    }

    let isMounted = true;
    const exchangeState =
      callbackExchangeRef.current ?? {
        promise: exchangeCurrentSupabaseSession(),
        startedAt: performance.now(),
      };
    callbackExchangeRef.current = exchangeState;
    setIsCallbackLoginLoading(true);

    void exchangeState.promise
      .then(async (exchanged) => {
        if (!isMounted) {
          return;
        }

        if (exchanged) {
          if (isPopupCallbackRoute) {
            closeAuthPopupCallbackWindow();
            return;
          }

          await waitForMinimumDuration(
            exchangeState.startedAt,
            minimumLoginLoadingMs
          );

          if (!isMounted) {
            return;
          }

          navigate(redirectTo, { replace: true });
          return;
        }

        setIsCallbackLoginLoading(false);

        if (isPopupCallbackRoute) {
          closeAuthPopupCallbackWindow();
        }
      })
      .catch(() => {
        if (isMounted) {
          callbackExchangeRef.current = null;
          setIsCallbackLoginLoading(false);

          if (isPopupCallbackRoute) {
            closeAuthPopupCallbackWindow();
          }
        }
      });

    return () => {
      isMounted = false;
    };
  }, [
    exchangeCurrentSupabaseSession,
    isInitializing,
    isCallbackRoute,
    isPopupCallbackRoute,
    navigate,
    redirectTo,
  ]);

  useEffect(() => {
    if (!isPending) {
      setPendingProvider(null);
    }
  }, [isPending]);

  useEffect(() => {
    if (isCallbackRoute || (!isLoginRoute && !isSignupRoute)) {
      return;
    }

    if (isAuthenticated) {
      navigate(redirectTo, { replace: true });
    }
  }, [
    isAuthenticated,
    isCallbackRoute,
    isLoginRoute,
    isSignupRoute,
    navigate,
    redirectTo,
  ]);

  // 기능 : 로그인 화면의 사용자 이벤트를 처리합니다.
  const onProviderLogin = (provider: AuthProviderId) => {
    setPendingProvider(provider);
    void startProviderLogin(provider, { mode: "popup" }).catch(() => {
      setPendingProvider(null);
    });
  };

  if (isLoginRoute || isSignupRoute || isCallbackRoute) {
    return (
      <AuthLoginPage
        authError={authError}
        enabledProviders={enabledProviders}
        isLoginLoading={isCallbackLoginLoading}
        isPending={isPending}
        isProvidersLoading={isProvidersLoading}
        mode={isSignupRoute ? "signup" : "login"}
        pendingProvider={pendingProvider}
        providersError={providersError}
        onProviderLogin={onProviderLogin}
      />
    );
  }

  // "/" — 랜딩 페이지
  return (
    <AuthLandingPage
      isModalOpen={false}
      onOpenLogin={() => void navigate(publicSitePath("/login"))}
    >
      {null}
    </AuthLandingPage>
  );
}

// 기능 : 로그인 전환 화면의 최소 표시 시간을 보장합니다.
async function waitForMinimumDuration(startedAt: number, minimumMs: number) {
  const elapsed = performance.now() - startedAt;
  const remaining = Math.max(0, minimumMs - elapsed);

  if (remaining > 0) {
    await new Promise((resolve) => window.setTimeout(resolve, remaining));
  }
}

// 기능 : 인증 팝업 callback 창을 닫습니다.
function closeAuthPopupCallbackWindow() {
  window.setTimeout(() => {
    window.close();
  }, 100);
}

// 기능 : 인증 완료 후 이동할 안전한 redirect 경로를 계산합니다.
function getRedirectPath(state: unknown) {
  if (!state || typeof state !== "object" || Array.isArray(state)) {
    return "/app";
  }

  const from = (state as Record<string, unknown>).from;

  return typeof from === "string" && from.startsWith("/") ? from : "/app";
}
