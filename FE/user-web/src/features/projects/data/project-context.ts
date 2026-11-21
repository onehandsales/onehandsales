import { createContext, useContext, useSyncExternalStore } from "react";
import type { ProjectStore } from "../model/project-types";
export const ProjectContext = createContext<ProjectStore | null>(null);
// 기능 : 앱의 단일 프로젝트 원본과 버전을 조회한다.
export function useProjectStore() { const store = useContext(ProjectContext); if (!store) throw new Error("ProjectProvider is required"); return { store, state: useSyncExternalStore(store.subscribe, store.getSnapshot) }; }
