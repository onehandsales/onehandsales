import { useEffect, useMemo, useState } from "react";
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
  { provider: "naver", label: "Naver", enabled: true },
  { provider: "google", label: "Google", enabled: true },
];

export function LoginPage() {
  const {
    error: authError,
    exchangeCurrentSupabaseSession,
    isInitializing,
    isPending,
    loginWithMock,
    startProviderLogin,
  } = useAuthSession();
  const location = useLocation();
  const navigate = useNavigate();
  const [providers, setProviders] = useState<AuthProviderOption[]>([]);
  const [providersError, setProvidersError] = useState<string | null>(null);
  const [isProvidersLoading, setIsProvidersLoading] = useState(true);
  const [callbackMessage, setCallbackMessage] = useState<string | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(true);
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
    if (isInitializing) {
      return;
    }

    if (location.pathname !== "/auth/callback") {
      return;
    }

    let isMounted = true;

    void exchangeCurrentSupabaseSession()
      .then((exchanged) => {
        if (isMounted && exchanged) {
          setCallbackMessage("외부 인증 토큰을 앱 세션으로 교환했어요.");
          navigate(redirectTo, { replace: true });
        }
      })
      .catch(() => {
        if (isMounted) {
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

  const onProviderLogin = (provider: AuthProviderId) => {
    void startProviderLogin(provider);
  };

  const onMockLogin = async () => {
    await loginWithMock();
    navigate(redirectTo, { replace: true });
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
          isPending={isPending}
          isProvidersLoading={isProvidersLoading}
          providersError={providersError}
          onClose={() => setIsLoginModalOpen(false)}
          onMockLogin={onMockLogin}
          onProviderLogin={onProviderLogin}
        />
      ) : null}
    </AuthLandingPage>
  );
}

function getRedirectPath(state: unknown) {
  if (!state || typeof state !== "object" || Array.isArray(state)) {
    return "/";
  }

  const from = (state as Record<string, unknown>).from;

  return typeof from === "string" && from.startsWith("/") ? from : "/";
}
