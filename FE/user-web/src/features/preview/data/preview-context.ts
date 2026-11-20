import { createContext, useContext } from "react";
import type { PreviewRuntime } from "./preview-data-source";
import type { PreviewState } from "../model/preview-types";

export const PreviewContext = createContext<{ runtime: PreviewRuntime; state: PreviewState } | null>(null);

// 기능 : 조립 지점에서 주입한 목 실행 문맥을 가져오고 공급자 누락을 명시적으로 알린다.
export function usePreviewEnvironment() {
  const environment = useContext(PreviewContext);
  if (!environment) throw new Error("PreviewProvider is required");
  return environment;
}
