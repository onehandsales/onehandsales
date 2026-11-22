import { createContext, useContext, useSyncExternalStore } from "react";
import type { TemplateStore } from "../model/template-types";
export const TemplateContext = createContext<TemplateStore | null>(null);
// 기능 : 앱에 주입된 템플릿 원본과 변경 버전을 구독한다.
export function useTemplateStore() { const store = useContext(TemplateContext); if (!store) throw new Error("TemplateProvider is required"); return { store, state: useSyncExternalStore(store.subscribe, store.getSnapshot) }; }
