import { createContext, useContext, useSyncExternalStore } from "react";
import type { ClientStore } from "../model/client-types";
export const ClientContext = createContext<ClientStore | null>(null);
// 기능 : 앱에서 주입한 고객 저장소와 변경 버전을 읽는다.
export function useClientStore() { const store = useContext(ClientContext); if (!store) throw new Error("ClientProvider is required"); const state = useSyncExternalStore(store.subscribe, store.getSnapshot); return { store, state }; }
