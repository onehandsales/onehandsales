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
    exchangeCurrentExternalAuthSession,
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
    // 1. provider 목록 요청이 끝난 뒤 unmount된 컴포넌트 상태를 바꾸지 않도록 flag를 둔다.
    let isMounted = true;

    // 2. Backend에서 현재 노출 가능한 로그인 provider 목록을 조회한다.
    void authService
      .listProviders()
      .then((response) => {
        // 3. 조회 성공 시 provider 버튼 목록을 API 응답으로 갱신한다.
        if (isMounted) {
          setProviders(response.providers);
        }
      })
      .catch((error) => {
        // 4. 조회 실패 시 기본 provider 목록을 보여주고 오류 메시지를 보관한다.
        if (isMounted) {
          setProviders(fallbackProviders);
          setProvidersError(getApiErrorMessage(error));
        }
      })
      .finally(() => {
        // 5. provider 목록 로딩 상태를 종료한다.
        if (isMounted) {
          setIsProvidersLoading(false);
        }
      });

    return () => {
      // 6. effect cleanup 이후 비동기 응답이 상태를 바꾸지 못하게 한다.
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    // 1. callback route가 아니면 이전 callback exchange 상태를 초기화한다.
    if (!isCallbackRoute) {
      callbackExchangeRef.current = null;
      setIsCallbackLoginLoading(false);
      return;
    }

    // 2. 저장 세션 복원 중이면 callback 교환을 잠시 미룬다.
    if (isInitializing) {
      return;
    }

    // 3. StrictMode나 재렌더에서도 callback 교환 요청이 중복되지 않도록 promise를 재사용한다.
    let isMounted = true;
    const exchangeState =
      callbackExchangeRef.current ?? {
        promise: exchangeCurrentExternalAuthSession(),
        startedAt: performance.now(),
      };
    callbackExchangeRef.current = exchangeState;
    setIsCallbackLoginLoading(true);

    // 4. 외부 인증 세션을 Backend 앱 세션으로 교환한 뒤 이동 여부를 결정한다.
    void exchangeState.promise
      .then(async (exchanged) => {
        // 5. unmount 이후에는 callback 결과를 화면에 반영하지 않는다.
        if (!isMounted) {
          return;
        }

        // 6. 교환 성공 시 popup callback이면 창을 닫고 일반 callback이면 앱으로 이동한다.
        if (exchanged) {
          if (isPopupCallbackRoute) {
            closeAuthPopupCallbackWindow();
            return;
          }

          await waitForMinimumDuration(
            exchangeState.startedAt,
            minimumLoginLoadingMs
          );

          // 7. 최소 로딩 시간 대기 중 unmount되었으면 redirect를 중단한다.
          if (!isMounted) {
            return;
          }

          navigate(redirectTo, { replace: true });
          return;
        }

        // 8. 교환할 세션이 없으면 loading을 종료하고 popup callback 창은 닫는다.
        setIsCallbackLoginLoading(false);

        if (isPopupCallbackRoute) {
          closeAuthPopupCallbackWindow();
        }
      })
      .catch(() => {
        // 9. 교환 실패 시 callback 상태를 초기화하고 popup callback 창은 닫는다.
        if (isMounted) {
          callbackExchangeRef.current = null;
          setIsCallbackLoginLoading(false);

          if (isPopupCallbackRoute) {
            closeAuthPopupCallbackWindow();
          }
        }
      });

    return () => {
      // 10. effect cleanup 이후 callback 결과가 상태를 바꾸지 못하게 한다.
      isMounted = false;
    };
  }, [
    exchangeCurrentExternalAuthSession,
    isInitializing,
    isCallbackRoute,
    isPopupCallbackRoute,
    navigate,
    redirectTo,
  ]);

  useEffect(() => {
    // 1. 로그인 요청이 끝나면 버튼별 pending 표시를 초기화한다.
    if (!isPending) {
      setPendingProvider(null);
    }
  }, [isPending]);

  useEffect(() => {
    // 1. callback/login/signup 이외의 라우트에서는 인증 redirect를 처리하지 않는다.
    if (isCallbackRoute || (!isLoginRoute && !isSignupRoute)) {
      return;
    }

    // 2. 이미 인증된 사용자가 로그인/회원가입 화면에 오면 원래 목적지로 보낸다.
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
    // 1. 클릭한 provider 버튼에 진행 중 상태를 표시한다.
    setPendingProvider(provider);
    // 2. popup 로그인 흐름을 시작하고 실패하면 버튼 상태를 되돌린다.
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
  // 1. callback 교환 시작 이후 지난 시간을 계산한다.
  const elapsed = performance.now() - startedAt;
  // 2. 최소 표시 시간보다 짧게 끝났으면 남은 시간을 계산한다.
  const remaining = Math.max(0, minimumMs - elapsed);

  // 3. 남은 시간이 있을 때만 timeout으로 대기한다.
  if (remaining > 0) {
    await new Promise((resolve) => window.setTimeout(resolve, remaining));
  }
}

// 기능 : 인증 팝업 callback 창을 닫습니다.
function closeAuthPopupCallbackWindow() {
  // 1. callback 처리 완료 후 브라우저가 렌더링을 마칠 짧은 시간을 둔다.
  window.setTimeout(() => {
    // 2. popup callback 창을 닫아 부모 창으로 흐름을 돌려준다.
    window.close();
  }, 100);
}

// 기능 : 인증 완료 후 이동할 안전한 redirect 경로를 계산합니다.
function getRedirectPath(state: unknown) {
  // 1. 라우터 state가 객체가 아니면 기본 앱 홈으로 이동한다.
  if (!state || typeof state !== "object" || Array.isArray(state)) {
    return "/app";
  }

  // 2. 로그인 전 접근하려던 경로 후보를 읽는다.
  const from = (state as Record<string, unknown>).from;

  // 3. 내부 절대 경로만 redirect 대상으로 허용하고 나머지는 앱 홈으로 보낸다.
  return typeof from === "string" && from.startsWith("/") ? from : "/app";
}
