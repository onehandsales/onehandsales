import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  AuthContext,
  type AuthContextValue,
} from "@/features/auth/auth-context";
import {
  authService,
  type AuthSessionState,
} from "@/features/auth/auth-service";
import { setApiRefreshHandler } from "@/lib/api-client";

// 기능 : User Web 전역 인증 상태와 인증 액션을 제공합니다.
export function AuthProvider({ children }: { readonly children: ReactNode }) {
  const [session, setSession] = useState<AuthSessionState | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const refreshPromiseRef = useRef<Promise<string | null> | null>(null);

  useEffect(() => {
    // 1. unmount 이후 비동기 결과가 상태를 바꾸지 않도록 mounted flag를 둔다.
    let isMounted = true;

    // 2. API client가 401 refresh를 요청할 때 하나의 refresh promise를 공유하게 한다.
    setApiRefreshHandler(() => {
      refreshPromiseRef.current ??= authService
        .refresh()
        .then((refreshedSession) => {
          // 3. refresh 성공 시 최신 앱 세션을 전역 상태에 반영한다.
          if (isMounted) {
            setSession(refreshedSession);
          }

          return refreshedSession.accessToken;
        })
        .catch(() => {
          // 4. refresh 실패 시 앱 세션과 저장된 token을 모두 정리한다.
          if (isMounted) {
            setSession(null);
          }
          authService.clearSession();

          return null;
        })
        .finally(() => {
          // 5. refresh가 끝나면 다음 refresh 요청이 새 promise를 만들 수 있게 비운다.
          refreshPromiseRef.current = null;
        });

      return refreshPromiseRef.current;
    });

    // 6. 앱 최초 진입 시 저장된 세션을 복원한다.
    void authService
      .restoreStoredSession()
      .then((restoredSession) => {
        // 7. 복원 결과를 전역 인증 상태에 반영한다.
        if (isMounted) {
          setSession(restoredSession);
        }
      })
      .finally(() => {
        // 8. 복원 시도가 끝나면 초기화 상태를 해제한다.
        if (isMounted) {
          setIsInitializing(false);
        }
      });

    return () => {
      // 9. provider unmount 시 진행 중 표시와 refresh handler를 정리한다.
      isMounted = false;
      refreshPromiseRef.current = null;
      setApiRefreshHandler(null);
    };
  }, []);

  const runAuthAction = useCallback(
    // 기능 : 인증 액션의 pending/error/session 상태 처리를 공통화합니다.
    async (action: () => Promise<AuthSessionState | null | void>) => {
      // 1. 사용자 액션 시작 시 pending 상태와 이전 오류를 초기화한다.
      setIsPending(true);
      setError(null);

      try {
        // 2. 실제 인증 액션을 실행한다.
        const nextSession = await action();

        // 3. 액션이 세션 값을 반환하면 전역 인증 상태에 반영한다.
        if (nextSession !== undefined) {
          setSession(nextSession);
        }
      } catch (nextError) {
        // 4. 오류는 UI에서 표시 가능한 메시지로 저장하고 원래 오류를 다시 던진다.
        setError(
          nextError instanceof Error
            ? nextError.message
            : "인증 요청을 처리하지 못했어요."
        );
        throw nextError;
      } finally {
        // 5. 성공/실패와 관계없이 pending 상태를 종료한다.
        setIsPending(false);
      }
    },
    []
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      accessTokenExpiresAt: session?.accessTokenExpiresAt ?? null,
      error,
      isAuthenticated: Boolean(session?.accessToken),
      isInitializing,
      isPending,
      user: session?.user ?? null,
      clearError: () => setError(null),
      exchangeCurrentExternalAuthSession: async () => {
        // 1. callback route가 호출한 외부 인증 세션 교환을 시작한다.
        // 2. callback 교환 중 UI pending 상태와 이전 오류를 정리한다.
        setIsPending(true);
        setError(null);

        try {
          // 3. 브라우저의 외부 인증 세션을 Backend 앱 세션으로 교환한다.
          const nextSession =
            await authService.exchangeCurrentExternalAuthSession();
          // 4. 교환 성공 시 새 앱 세션을 전역 상태에 저장한다.
          if (nextSession) {
            setSession(nextSession);
          }

          return nextSession?.user ?? null;
        } catch (nextError) {
          // 5. 교환 실패 메시지를 저장하고 로그인 페이지가 후속 처리를 할 수 있게 다시 던진다.
          setError(
            nextError instanceof Error
              ? nextError.message
              : "인증 요청을 처리하지 못했어요."
          );
          throw nextError;
        } finally {
          // 6. callback 교환 pending 상태를 종료한다.
          setIsPending(false);
        }

      },
      updateAuthUser: (patch) => {
        // 1. 현재 세션의 사용자 정보만 부분 갱신한다.
        setSession((currentSession) => {
          // 2. 세션이나 사용자 정보가 없으면 기존 상태를 유지한다.
          if (!currentSession?.user) {
            return currentSession;
          }

          // 3. 기존 세션은 유지하고 user 필드만 patch로 덮어쓴다.
          return {
            ...currentSession,
            user: {
              ...currentSession.user,
              ...patch,
            },
          };
        });
      },
      logout: async () => {
        // 1. 로그아웃은 공통 인증 액션 wrapper로 pending/error 상태를 처리한다.
        await runAuthAction(async () => {
          // 2. Backend와 외부 인증 provider 세션을 정리한다.
          await authService.logout();
          // 3. 전역 인증 세션을 비우도록 null을 반환한다.
          return null;
        });
      },
      startProviderLogin: async (provider, options) => {
        // 1. provider 로그인 시작도 공통 인증 액션 wrapper로 상태를 처리한다.
        await runAuthAction(async () => {
          // 2. 선택한 provider의 redirect 또는 popup 로그인 흐름을 시작한다.
          return authService.startProviderLogin(provider, options);
        });
      },
    }),
    [error, isInitializing, isPending, runAuthAction, session]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
