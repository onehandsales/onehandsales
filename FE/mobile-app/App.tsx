import { useCallback, useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { LoginScreen } from "./src/features/auth/screens/login-screen";
import type {
  AuthMode,
  AuthProviderId,
} from "./src/features/auth/types/auth-provider";

export default function App() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [pendingProvider, setPendingProvider] = useState<AuthProviderId | null>(
    null
  );
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    if (!pendingProvider) {
      return undefined;
    }

    const timeoutId = setTimeout(() => {
      setPendingProvider(null);
      setAuthError("OAuth 연결은 다음 단계에서 설정합니다.");
    }, 700);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [pendingProvider]);

  const handleModeChange = useCallback((nextMode: AuthMode) => {
    setMode(nextMode);
    setAuthError(null);
  }, []);

  const handleProviderPress = useCallback((provider: AuthProviderId) => {
    setAuthError(null);
    setPendingProvider(provider);
  }, []);

  return (
    <>
      <LoginScreen
        authError={authError}
        mode={mode}
        pendingProvider={pendingProvider}
        onModeChange={handleModeChange}
        onProviderPress={handleProviderPress}
      />
      <StatusBar style="auto" />
    </>
  );
}
