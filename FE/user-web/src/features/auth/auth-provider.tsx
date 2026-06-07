import { useMemo, useState, type ReactNode } from "react";
import {
  AuthContext,
  type AuthContextValue,
} from "@/features/auth/auth-context";
import { clearApiAccessToken, setApiAccessToken } from "@/lib/api-client";

const mockAccessToken = "mock-user-web-access-token";

export function AuthProvider({ children }: { readonly children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated: Boolean(accessToken),
      loginWithMock: () => {
        setApiAccessToken(mockAccessToken);
        setAccessToken(mockAccessToken);
      },
      logout: () => {
        clearApiAccessToken();
        setAccessToken(null);
      },
    }),
    [accessToken]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
