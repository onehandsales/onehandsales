import { createContext, useContext } from "react";
import type {
  AuthProviderId,
  AuthUser,
  StartProviderLoginOptions,
} from "@/features/auth/types/auth";

export type AuthContextValue = {
  readonly accessTokenExpiresAt: string | null;
  readonly error: string | null;
  readonly isAuthenticated: boolean;
  readonly isInitializing: boolean;
  readonly isPending: boolean;
  readonly user: AuthUser | null;
  readonly clearError: () => void;
  readonly exchangeCurrentExternalAuthSession: () => Promise<AuthUser | null>;
  readonly updateAuthUser: (patch: Partial<AuthUser>) => void;
  readonly logout: () => Promise<void>;
  readonly startProviderLogin: (
    provider: AuthProviderId,
    options?: StartProviderLoginOptions
  ) => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

// 기능 : AuthProvider가 제공하는 현재 인증 상태와 인증 액션을 반환합니다.
export function useAuthSession() {
  // 1. React context에서 인증 상태 값을 읽는다.
  const context = useContext(AuthContext);

  // 2. Provider 밖에서 사용하면 개발자가 바로 알 수 있도록 명확한 오류를 던진다.
  if (!context) {
    throw new Error("useAuthSession must be used within AuthProvider");
  }

  // 3. 정상 context 값을 호출자에게 반환한다.
  return context;
}
