import { useEffect, useRef, useState } from "react";
// 기능 : 모달 한 번의 제출을 잠그고 취소·이탈 이후 성공이나 실패의 화면 반영을 막는다.
export function useTeamAction() {
  const request = useRef<AbortController | null>(null); const [pending, setPending] = useState(false); const [error, setError] = useState("");
  // 기능 : 모달이 사라지면 저장소 변경 전 진행 요청을 취소한다.
  useEffect(function cancelOnLeave() { return function cleanup() { request.current?.abort(); request.current = null; }; }, []);
  // 기능 : 중복 실행을 동기적으로 차단하고 실패할 때 같은 입력으로 재시도를 허용한다.
  async function run(action: (signal: AbortSignal) => Promise<unknown>, onSuccess: () => void) {
    if (request.current) return; const current = new AbortController(); request.current = current; setPending(true);
    // 이유 : 재시도 직후 오류 영역을 없애면 버튼이 이동해 두 번째 클릭이 배경 취소로 바뀐다. 오류는 다음 결과까지 유지한다.
    try { await action(current.signal); if (request.current === current && !current.signal.aborted) onSuccess(); }
    catch (reason) { if (request.current === current && !current.signal.aborted && !(reason instanceof DOMException && reason.name === "AbortError")) setError(reason instanceof Error ? reason.message : "Unable to update the local team."); }
    finally { if (request.current === current) { request.current = null; setPending(false); } }
  }
  return { pending, error, setError, run };
}
