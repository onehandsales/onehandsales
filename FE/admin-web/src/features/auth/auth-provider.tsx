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
  // 1. 처리 흐름에 필요한 [user, setUser] 값을 준비한다.
  const [user, setUser] = useState<AdminMe | null>(null);
  // 2. 처리 흐름에 필요한 [role, setRole] 값을 준비한다.
  const [role, setRole] = useState<AdminAuthRole | null>(null);
  // 3. 처리 흐름에 필요한 [isPending, setIsPending] 값을 준비한다.
  const [isPending, setIsPending] = useState(false);
  // 4. 처리 흐름에 필요한 [error, setError] 값을 준비한다.
  const [error, setError] = useState<string | null>(null);

  // 기능 : 전달받은 access token으로 서버의 현재 관리자 정보를 검증합니다.
  // 5. 처리 흐름에 필요한 verifyAdminMe 값을 준비한다.
  const verifyAdminMe = useCallback(
    async (accessToken: string) => {
      // 1. 화면 상태를 현재 흐름에 맞게 갱신한다.
      setIsPending(true);
      // 2. 화면 상태를 현재 흐름에 맞게 갱신한다.
      setError(null);
      // 3. 화면 상태를 현재 흐름에 맞게 갱신한다.
      setAdminApiAccessToken(accessToken);

      // 4. 실패 가능성이 있는 작업을 실행하고 오류를 처리한다.
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
  // 6. 처리 흐름에 필요한 logout 값을 준비한다.
  const logout = useCallback(() => {
    // 1. 현재 단계에서 필요한 동작을 실행한다.
    clearAdminApiAccessToken();
    // 2. 화면 상태를 현재 흐름에 맞게 갱신한다.
    setUser(null);
    // 3. 화면 상태를 현재 흐름에 맞게 갱신한다.
    setRole(null);
    // 4. 화면 상태를 현재 흐름에 맞게 갱신한다.
    setError(null);
  }, []);

  // 기능 : 현재 표시 중인 관리자 권한 확인 오류를 초기화합니다.
  // 7. 처리 흐름에 필요한 clearError 값을 준비한다.
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // 기능 : access token을 전달해 Admin Web 로그인을 시도합니다.
  // 8. 처리 흐름에 필요한 loginWithAccessToken 값을 준비한다.
  const loginWithAccessToken = useCallback(
    (accessToken: string) => verifyAdminMe(accessToken),
    [verifyAdminMe]
  );

  // 기능 : 인증 컨텍스트 소비자가 사용할 상태와 동작을 구성합니다.
  // 9. 처리 흐름에 필요한 value 값을 준비한다.
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

  // 10. 계산된 결과를 호출자에게 반환한다.
  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}
