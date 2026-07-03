import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthSession } from "@/features/auth";
import { authService } from "@/features/auth/auth-service";
import { AuthLandingPage } from "@/features/auth/components/auth-landing-page";
import { AuthLoginModal } from "@/features/auth/components/auth-login-modal";
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
    isInitializing,
    isPending,
    startProviderLogin,
  } = useAuthSession();
  const location = useLocation();
  const navigate = useNavigate();
  const [providers, setProviders] = useState<AuthProviderOption[]>([]);
  const [providersError, setProvidersError] = useState<string | null>(null);
  const [isProvidersLoading, setIsProvidersLoading] = useState(true);
  const [callbackMessage, setCallbackMessage] = useState<string | null>(null);
  const [isCallbackLoginLoading, setIsCallbackLoginLoading] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(true);
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
    if (location.pathname !== "/auth/callback") {
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
          setCallbackMessage(null);
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
      })
      .catch(() => {
        if (isMounted) {
          callbackExchangeRef.current = null;
          setIsCallbackLoginLoading(false);
          setCallbackMessage(null);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [
    exchangeCurrentSupabaseSession,
    isInitializing,
    location.pathname,
    navigate,
    redirectTo,
  ]);

  useEffect(() => {
    if (!isPending) {
      setPendingProvider(null);
    }
  }, [isPending]);

  const onProviderLogin = (provider: AuthProviderId) => {
    setPendingProvider(provider);
    void startProviderLogin(provider).catch(() => {
      setPendingProvider(null);
    });
  };

  return (
    <AuthLandingPage
      isModalOpen={isLoginModalOpen}
      onOpenLogin={() => setIsLoginModalOpen(true)}
    >
      {isLoginModalOpen ? (
        <AuthLoginModal
          authError={authError}
          callbackMessage={callbackMessage}
          enabledProviders={enabledProviders}
          isLoginLoading={isCallbackLoginLoading}
          isPending={isPending}
          isProvidersLoading={isProvidersLoading}
          pendingProvider={pendingProvider}
          providersError={providersError}
          onClose={() => setIsLoginModalOpen(false)}
          onProviderLogin={onProviderLogin}
        />
      ) : null}
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

function getRedirectPath(state: unknown) {
  if (!state || typeof state !== "object" || Array.isArray(state)) {
    return "/";
  }

  const from = (state as Record<string, unknown>).from;

  return typeof from === "string" && from.startsWith("/") ? from : "/";
}
