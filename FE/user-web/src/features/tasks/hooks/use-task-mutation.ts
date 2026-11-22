import { useEffect, useRef, useState } from "react";
import { useTasks } from "./use-tasks";

// 기능 : 작업 하위 변경의 중복·취소·문맥 이탈과 실패 입력 수명을 분리한다.
export function useTaskMutation() {
  const { scope, state } = useTasks(); const request = useRef<AbortController | null>(null);
  const [pending, setPending] = useState(false); const [error, setError] = useState("");
  // 기능 : 한 의도를 실행하고 살아 있는 요청의 결과만 호출자에게 전달한다.
  async function run<T>(operation: (signal: AbortSignal) => Promise<T>): Promise<T | undefined> {
    if (request.current) return; const controller = new AbortController(); request.current = controller; setPending(true); setError("");
    try { const result = await operation(controller.signal); if (!controller.signal.aborted && request.current === controller) return result; }
    catch (reason) { if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : "Unable to save. Please try again."); }
    finally { if (request.current === controller) { request.current = null; setPending(false); } }
  }
  // 기능 : 취소한 요청의 후속 결과와 오류를 폐기한다.
  function cancel() { request.current?.abort(); request.current = null; setPending(false); setError(""); }
  // 기능 : 계정·workspace·시나리오와 컴포넌트 수명을 넘는 요청을 중단한다.
  useEffect(function bindLifetime() {
    setPending(false); setError("");
    // 기능 : 이전 문맥의 요청이 현재 화면을 변경하지 못하게 한다.
    return function abortPrevious() { request.current?.abort(); request.current = null; };
  }, [scope.actorId, scope.workspaceId, scope.revision, state.scenario]);
  return { run, cancel, pending, error };
}
