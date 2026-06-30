import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  AuthContext,
  type AuthContextValue,
} from "@/features/auth/auth-context";
import {
  authService,
  type AuthSessionState,
} from "@/features/auth/auth-service";
import { setApiRefreshHandler } from "@/lib/api-client";

export function AuthProvider({ children }: { readonly children: ReactNode }) {
  const [session, setSession] = useState<AuthSessionState | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    setApiRefreshHandler(async () => {
      // mock 세션은 refresh 없이 현재 토큰 그대로 유지
      const storedToken = window.localStorage.getItem("onehand.userWeb.accessToken");
      if (storedToken === "mock-user-web-access-token") {
        return storedToken;
      }

      try {
        const refreshedSession = await authService.refresh();

        if (isMounted) {
          setSession(refreshedSession);
        }

        return refreshedSession.accessToken;
      } catch {
        if (isMounted) {
          setSession(null);
        }
        authService.clearSession();

        return null;
      }
    });

    void authService
      .restoreStoredSession()
      .then((restoredSession) => {
        if (isMounted) {
          setSession(restoredSession);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsInitializing(false);
        }
      });

    return () => {
      isMounted = false;
      setApiRefreshHandler(null);
    };
  }, []);

  const runAuthAction = useCallback(
    async (action: () => Promise<AuthSessionState | null | void>) => {
      setIsPending(true);
      setError(null);

      try {
        const nextSession = await action();

        if (nextSession !== undefined) {
          setSession(nextSession);
        }
      } catch (nextError) {
        setError(
          nextError instanceof Error
            ? nextError.message
            : "인증 요청을 처리하지 못했어요."
        );
        throw nextError;
      } finally {
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
      isMockSession: session?.isMock ?? false,
      isPending,
      user: session?.user ?? null,
      clearError: () => setError(null),
      exchangeCurrentSupabaseSession: async () => {
        let exchanged = false;

        setIsPending(true);
        setError(null);

        try {
          const nextSession = await authService.exchangeCurrentSupabaseSession();
          exchanged = Boolean(nextSession);

          if (nextSession) {
            setSession(nextSession);
          }
        } catch (nextError) {
          setError(
            nextError instanceof Error
              ? nextError.message
              : "인증 요청을 처리하지 못했어요."
          );
          throw nextError;
        } finally {
          setIsPending(false);
        }

        return exchanged;
      },
      updateAuthUser: (patch) => {
        setSession((currentSession) => {
          if (!currentSession?.user) {
            return currentSession;
          }

          return {
            ...currentSession,
            user: {
              ...currentSession.user,
              ...patch,
            },
          };
        });
      },
      loginWithMock: async () => {
        await runAuthAction(async () => authService.loginWithMock());
      },
      logout: async () => {
        await runAuthAction(async () => {
          await authService.logout();
          return null;
        });
      },
      startProviderLogin: async (provider) => {
        await runAuthAction(async () => {
          await authService.startProviderLogin(provider);
        });
      },
    }),
    [error, isInitializing, isPending, runAuthAction, session]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
