import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthSession } from "@/features/auth";
import {
  authService,
  isAuthPopupCallbackWindow,
} from "@/features/auth/auth-service";
import { AuthLandingPage } from "@/features/auth/components/auth-landing-page";
import { AuthLoginPage } from "@/features/auth/components/auth-login-page";
import { usePublicSitePath } from "@/features/public-site/i18n/public-site-locale-hooks";
import { stripPublicSiteLocaleFromPathname } from "@/features/public-site/i18n/public-site-locale-routes";
import type {
  AuthProviderId,
  AuthProviderOption,
} from "@/features/auth/types/auth";
import { getApiErrorMessage } from "@/lib/api-client";

const fallbackProviders: AuthProviderOption[] = [
  { provider: "kakao", label: "Kakao", enabled: true },
  { provider: "google", label: "Google", enabled: true },
];
const minimumLoginLoadingMs = 1500;

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

async function waitForMinimumDuration(startedAt: number, minimumMs: number) {
  const elapsed = performance.now() - startedAt;
  const remaining = Math.max(0, minimumMs - elapsed);

  if (remaining > 0) {
    await new Promise((resolve) => window.setTimeout(resolve, remaining));
  }
}

function closeAuthPopupCallbackWindow() {
  window.setTimeout(() => {
    window.close();
  }, 100);
}

function getRedirectPath(state: unknown) {
  if (!state || typeof state !== "object" || Array.isArray(state)) {
    return "/app";
  }

  const from = (state as Record<string, unknown>).from;

  return typeof from === "string" && from.startsWith("/") ? from : "/app";
}
