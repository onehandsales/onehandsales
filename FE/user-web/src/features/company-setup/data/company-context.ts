import { createContext, useContext, useSyncExternalStore } from "react";
import type { CompanyStore } from "../model/company-types";
export const CompanyContext = createContext<CompanyStore | null>(null);
// 기능 : 동일 회사의 저장 결과·초안을 공유하며 변경 시 현재 화면을 갱신한다.
export function useCompanySetup() { const store = useContext(CompanyContext); if (!store) throw new Error("Company provider is missing"); const state = useSyncExternalStore(store.subscribe, store.getSnapshot); return { store, state }; }
