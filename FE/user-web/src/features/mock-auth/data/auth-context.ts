import { createContext, useContext, useSyncExternalStore } from "react";
import type { AuthStore } from "../model/auth-types";
export const AuthContext = createContext<AuthStore | null>(null);
// 기능 : 기능별 UI가 동일한 가상 계정 상태와 인계를 읽게 한다.
export function useMockAuth() {
  const store = useContext(AuthContext); if (!store) throw new Error("Mock authentication provider is missing");
  const state = useSyncExternalStore(store.subscribe, store.getSnapshot); return { store, state };
}
