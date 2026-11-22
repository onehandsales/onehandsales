import { createContext, useContext, useSyncExternalStore } from "react";
import type { TaskStore } from "../model/task-types";
export const TaskContext = createContext<TaskStore | null>(null);
// 기능 : 앱에 주입된 단일 작업 원본과 불변 버전을 구독한다.
export function useTaskStore() { const store = useContext(TaskContext); if (!store) throw new Error("TaskProvider is required"); return { store, state: useSyncExternalStore(store.subscribe, store.getSnapshot) }; }
