import { createContext, useContext, useSyncExternalStore } from "react";
import type { TeamStore } from "../model/team-types";
export const TeamContext = createContext<TeamStore | null>(null);
// 기능 : 주입한 팀 저장소와 변경 스냅샷을 함께 읽는다.
export function useTeamStore() { const store = useContext(TeamContext); if (!store) throw new Error("TeamProvider is required"); const state = useSyncExternalStore(store.subscribe, store.getSnapshot); return { store, state }; }
