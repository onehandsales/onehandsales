import type { ActorId, PreviewItem, PreviewScope, PreviewSession, PreviewState, Scenario } from "../model/preview-types";

// 의미 : 화면에 필요한 프론트 내부 경계이며 HTTP 요청·응답 계약이 아니다.
export interface PreviewDataSource {
  list(scope: PreviewScope, signal: AbortSignal): Promise<PreviewItem[]>;
  detail(scope: PreviewScope, id: string, signal: AbortSignal): Promise<PreviewItem>;
  rename(scope: PreviewScope, id: string, name: string, signal: AbortSignal): Promise<PreviewItem>;
  shared(id: string, signal: AbortSignal): Promise<PreviewItem>;
}
export interface PreviewRuntime {
  source: PreviewDataSource;
  getSnapshot(): PreviewState;
  subscribe(listener: () => void): () => void;
  setSession(actor: ActorId | null): void;
  openSession(session: PreviewSession): void;
  setWorkspace(id: string): void;
  setScenario(scenario: Scenario): void;
  reset(): void;
}
