import type { PreviewRuntime } from "@/features/preview/data/preview-data-source";
import { PreviewError } from "@/features/preview/model/preview-types";
import type { ActorId, PreviewScope, PreviewSession, PreviewState, Scenario } from "@/features/preview/model/preview-types";
import { createPreviewSeed, PREVIEW_SESSIONS, SEED_TIME } from "./preview-seed";

// 기능 : 취소 신호를 받으면 타이머와 리스너를 정리하는 로컬 지연을 제공한다.
function waitForPreview(milliseconds: number, signal: AbortSignal): Promise<void> {
  // 기능 : 예약 작업과 취소 리스너를 같은 수명 안에서 등록한다.
  return new Promise(function scheduleDelay(resolve, reject) {
    if (signal.aborted) {
      reject(new DOMException("Preview cancelled", "AbortError"));
      return;
    }
    // 기능 : 취소된 화면의 예약 작업을 제거하고 취소 결과를 전달한다.
    function handleAbort() {
      clearTimeout(timer);
      reject(new DOMException("Preview cancelled", "AbortError"));
    }
    // 기능 : 정상 지연 종료 시 리스너를 해제하고 작업을 진행시킨다.
    function handleReady() {
      signal.removeEventListener("abort", handleAbort);
      resolve();
    }
    const timer = setTimeout(handleReady, milliseconds);
    signal.addEventListener("abort", handleAbort, { once: true });
  });
}

// 기능 : 네트워크와 브라우저 저장소 없이 세션·시나리오·공유 항목의 메모리 수명을 관리한다.
export function createPreviewRuntime(): PreviewRuntime {
  let state: PreviewState = { session: null, workspaceId: null, revision: 0, resetGeneration: 0, scenario: "normal" };
  let resetGeneration = 0;
  let records = createPreviewSeed();
  let writeNumber = 0;
  let failureArmed = false;
  const listeners = new Set<() => void>();

  // 기능 : 실행 경계를 교체하고 구독자에게 새 스냅샷을 한 번 전달한다.
  function publish(next: Omit<PreviewState, "revision" | "resetGeneration">) {
    state = Object.freeze({ ...next, revision: state.revision + 1, resetGeneration });
    listeners.forEach((listener) => listener());
  }
  // 기능 : 제출 당시 문맥이 아직 현재 세션·작업공간과 같은지 검증한다.
  function assertScope(scope: PreviewScope) {
    if (scope.revision !== state.revision || scope.actorId !== state.session?.id ||
      scope.workspaceId !== state.workspaceId) {
      throw new DOMException("Preview scope changed", "AbortError");
    }
  }
  // 기능 : 읽기·쓰기 지연과 실패를 재현하고 늦은 작업의 반영을 차단한다.
  async function prepare(scope: PreviewScope, signal: AbortSignal, operation: "read" | "write") {
    assertScope(scope);
    const scenario = state.scenario;
    await waitForPreview(scenario === "slow" ? 1500 : 180, signal);
    // 이유 : UI가 사라진 뒤에도 Promise는 종료될 수 있어 저장 직전에 실행 경계를 다시 확인한다.
    assertScope(scope);
    signal.throwIfAborted();
    if (scenario === "denied") throw new PreviewError("denied", "This preview is read-restricted.");
    if (failureArmed && scenario === operation + "-error") {
      failureArmed = false;
      throw new PreviewError(operation, operation === "read" ? "Unable to load this preview." : "Unable to save. Your changes are still here.");
    }
  }
  // 기능 : 입력한 가상 사용자로 전환하거나 세션을 비우고 정상 시나리오로 돌아간다.
  function setSession(actor: ActorId | null) {
    failureArmed = false;
    const session = PREVIEW_SESSIONS.find((entry) => entry.id === actor) ?? null;
    publish({ session, workspaceId: session?.workspaces[0]?.id ?? null, scenario: "normal" });
  }
  // 기능 : 가입으로 만든 독립 가상 계정을 기존 검증 계정과 합치지 않고 새 실행 범위로 연다.
  function openSession(session: PreviewSession) {
    failureArmed = false;
    publish({ session: structuredClone(session), workspaceId: session.workspaces[0]?.id ?? null, scenario: "normal" });
  }
  // 기능 : 현재 가상 사용자가 가진 작업공간으로만 이동한다.
  function setWorkspace(id: string) {
    if (!state.session?.workspaces.some((workspace) => workspace.id === id)) {
      throw new PreviewError("denied", "Workspace unavailable in this preview.");
    }
    publish({ ...state, workspaceId: id });
  }
  // 기능 : 시나리오 변경으로 기존 비동기 결과와 초안을 무효화한다.
  function setScenario(scenario: Scenario) {
    failureArmed = scenario === "read-error" || scenario === "write-error";
    publish({ ...state, scenario });
  }
  // 기능 : 항목·세션·시각 카운터·장애 설정을 최초 seed로 되돌린다.
  function reset() {
    resetGeneration += 1;
    records = createPreviewSeed();
    writeNumber = 0;
    failureArmed = false;
    publish({ session: null, workspaceId: null, scenario: "normal" });
  }
  // 기능 : 동일한 스냅샷 참조를 제공해 외부 저장소 구독을 안정적으로 유지한다.
  function getSnapshot() { return state; }
  // 기능 : 실행 문맥 변경을 구독하고 호출자가 구독을 해제할 수 있게 한다.
  function subscribe(listener: () => void) {
    listeners.add(listener);
    // 기능 : 종료된 화면의 구독을 제거한다.
    return function unsubscribe() { listeners.delete(listener); };
  }
  // 기능 : 현재 범위의 항목 목록을 복사해 UI의 직접 변경을 차단한다.
  async function list(scope: PreviewScope, signal: AbortSignal) {
    await prepare(scope, signal, "read");
    return structuredClone(state.scenario === "empty" ? [] : records.get(scope.actorId + "/" + scope.workspaceId) ?? []);
  }
  // 기능 : 목록과 같은 저장소에서 ID를 조회하고 없는 항목을 구분한다.
  async function detail(scope: PreviewScope, id: string, signal: AbortSignal) {
    const items = await list(scope, signal);
    const item = items.find((entry) => entry.id === id);
    if (!item) throw new PreviewError("missing", "This preview item could not be found.");
    return item;
  }
  // 기능 : 제출 시점의 ID와 이름을 검증한 후 같은 메모리 항목을 갱신한다.
  async function rename(scope: PreviewScope, id: string, name: string, signal: AbortSignal) {
    const submittedName = name.trim();
    if (!submittedName) throw new PreviewError("invalid", "Enter a name.");
    await prepare(scope, signal, "write");
    const items = records.get(scope.actorId + "/" + scope.workspaceId);
    const item = items?.find((entry) => entry.id === id);
    if (!item || state.scenario === "empty") throw new PreviewError("missing", "This preview item could not be found.");
    item.name = submittedName;
    item.updatedAt = new Date(Date.parse(SEED_TIME) + ++writeNumber * 1000).toISOString();
    return structuredClone(item);
  }
  // 기능 : 내부 세션과 무관한 공개용 고정 항목만 반환한다.
  async function shared(id: string, signal: AbortSignal) {
    await waitForPreview(180, signal);
    if (id !== "sample") throw new PreviewError("missing", "This shared preview could not be found.");
    return { id: "shared-sample", name: "Shared preview", updatedAt: SEED_TIME };
  }
  return { source: { list, detail, rename, shared }, getSnapshot, subscribe, setSession, openSession, setWorkspace, setScenario, reset };
}
