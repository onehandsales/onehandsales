import { useCallback, useMemo, useState, type ReactNode } from "react";
import { getAdminMe } from "@/features/auth/api/admin-auth-api";
import {
  AdminAuthContext,
  type AdminAuthContextValue,
  type AdminAuthRole,
} from "@/features/auth/auth-context";
import type { AdminMe } from "@/features/auth/types/admin-auth";
import {
  clearAdminApiAccessToken,
  setAdminApiAccessToken,
} from "@/lib/admin-api-client";

// 기능 : Admin Web 인증 컨텍스트를 제공하고 서버 관리자 검증 결과를 상태로 보관합니다.
export function AdminAuthProvider({
  children,
}: {
  readonly children: ReactNode;
}) {
  const [user, setUser] = useState<AdminMe | null>(null);
  const [role, setRole] = useState<AdminAuthRole | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 기능 : 전달받은 access token으로 서버의 현재 관리자 정보를 검증합니다.
  const verifyAdminMe = useCallback(
    async (accessToken: string) => {
      setIsPending(true);
      setError(null);
      setAdminApiAccessToken(accessToken);

      try {
        const adminMe = await getAdminMe();
        setUser(adminMe);
        setRole(adminMe.role);
      } catch (nextError) {
        clearAdminApiAccessToken();
        setUser(null);
        setRole(null);
        setError(
          nextError instanceof Error
            ? nextError.message
            : "관리자 권한을 확인하지 못했습니다."
        );
      } finally {
        setIsPending(false);
      }
    },
    []
  );

  // 기능 : Admin Web 인증 상태와 저장된 access token을 초기화합니다.
  const logout = useCallback(() => {
    clearAdminApiAccessToken();
    setUser(null);
    setRole(null);
    setError(null);
  }, []);

  // 기능 : 현재 표시 중인 관리자 권한 확인 오류를 초기화합니다.
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // 기능 : access token을 전달해 Admin Web 로그인을 시도합니다.
  const loginWithAccessToken = useCallback(
    (accessToken: string) => verifyAdminMe(accessToken),
    [verifyAdminMe]
  );

  // 기능 : 인증 컨텍스트 소비자가 사용할 상태와 동작을 구성합니다.
  const value = useMemo<AdminAuthContextValue>(
    () => ({
      isAuthenticated: role === "ADMIN",
      isInitializing: false,
      isPending,
      error,
      role,
      user,
      clearError,
      loginWithAccessToken,
      logout,
    }),
    [clearError, error, isPending, loginWithAccessToken, logout, role, user]
  );

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}
