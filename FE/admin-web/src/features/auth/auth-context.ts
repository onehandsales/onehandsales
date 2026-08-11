import { createContext, useContext } from "react";
import type { AdminMe } from "@/features/auth/types/admin-auth";

// 역할 : Admin Web이 서버 검증 결과에서 신뢰하는 관리자 역할 값을 정의합니다.
export type AdminAuthRole = "ADMIN";

// 역할 : Admin Web 인증 컨텍스트가 화면에 제공하는 상태와 동작 계약을 정의합니다.
export type AdminAuthContextValue = {
  readonly isAuthenticated: boolean;
  readonly isInitializing: boolean;
  readonly isPending: boolean;
  readonly error: string | null;
  readonly role: AdminAuthRole | null;
  readonly user: AdminMe | null;
  readonly loginWithAccessToken: (accessToken: string) => Promise<void>;
  readonly logout: () => void;
  readonly clearError: () => void;
};

// 역할 : Admin Web 인증 상태를 React tree에 전달하는 컨텍스트를 보관합니다.
export const AdminAuthContext = createContext<AdminAuthContextValue | null>(
  null
);

// 기능 : Admin Web 인증 컨텍스트를 현재 React tree에서 조회합니다.
export function useAdminAuthSession() {
  const context = useContext(AdminAuthContext);

  if (!context) {
    throw new Error("useAdminAuthSession must be used within AdminAuthProvider");
  }

  return context;
}
