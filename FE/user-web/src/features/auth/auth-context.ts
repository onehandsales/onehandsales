import { createContext, useContext } from "react";

export type AuthContextValue = {
  readonly isAuthenticated: boolean;
  readonly loginWithMock: () => void;
  readonly logout: () => void;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuthSession() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuthSession must be used within AuthProvider");
  }

  return context;
}
