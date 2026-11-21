import { useCallback, useEffect, useRef, useState } from "react";
import { useClientStore } from "../data/client-context";
// 기능 : 한 편집기의 중복 실행·실패 표시·명시적 취소와 화면 이탈을 같은 요청 수명으로 처리한다.
export function useClientAction() {
  const { state } = useClientStore(); const request = useRef<AbortController | null>(null);
  const [pending, setPending] = useState(false); const [error, setError] = useState("");
  // 기능 : 이전 응답을 무효화하고 편집기의 요청 표시만 초기화한다.
  const cancel = useCallback(function cancel() { request.current?.abort(); request.current = null; setPending(false); setError(""); }, []);
  // 기능 : 시나리오 변경·편집기 종료 이후 응답을 적용하지 않는다.
  useEffect(function bindRequest() { cancel(); return function dispose() { request.current?.abort(); request.current = null; }; }, [cancel, state.scenario]);
  // 기능 : 성공한 현재 작업만 후속 UI에 전달하고 실패한 초안은 호출자가 유지한다.
  // 이유 : 재시도 시작에 오류 영역을 지우면 버튼이 이동해 더블클릭이 배경 닫기로 바뀔 수 있다.
  async function run(job: (signal: AbortSignal) => Promise<void>, onSuccess: () => void) {
    if (request.current) return;
    const controller = new AbortController(); request.current = controller; setPending(true);
    try { await job(controller.signal); if (!controller.signal.aborted && request.current === controller) { setError(""); onSuccess(); } }
    catch (reason) { if (!controller.signal.aborted && !(reason instanceof DOMException && reason.name === "AbortError")) setError(reason instanceof Error ? reason.message : "Unable to save. Please try again."); }
    finally { if (request.current === controller) { request.current = null; setPending(false); } }
  }
  return { pending, error, cancel, run };
}
