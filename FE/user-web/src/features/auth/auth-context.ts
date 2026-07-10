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
  readonly exchangeCurrentSupabaseSession: () => Promise<boolean>;
  readonly updateAuthUser: (patch: Partial<AuthUser>) => void;
  readonly logout: () => Promise<void>;
  readonly startProviderLogin: (
    provider: AuthProviderId,
    options?: StartProviderLoginOptions
  ) => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuthSession() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuthSession must be used within AuthProvider");
  }

  return context;
}
