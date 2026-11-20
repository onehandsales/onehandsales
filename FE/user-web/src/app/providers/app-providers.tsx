import { useState, useSyncExternalStore } from "react";
import type { ReactNode } from "react";
import { PreviewContext } from "@/features/preview/data/preview-context";
import { createPreviewRuntime } from "@/mocks/create-preview-runtime";
import { PublicProvider } from "@/features/public-web";

// 기능 : 새 앱 전체에 로컬 목 공급자만 조립하고 브라우저 새로고침마다 seed를 새로 만든다.
export function AppProviders({ children }: { children: ReactNode }) {
  const [runtime] = useState(createPreviewRuntime);
  const state = useSyncExternalStore(runtime.subscribe, runtime.getSnapshot);
  return <PreviewContext.Provider value={{ runtime, state }}><PublicProvider resetRevision={state.revision}>{children}</PublicProvider></PreviewContext.Provider>;
}
