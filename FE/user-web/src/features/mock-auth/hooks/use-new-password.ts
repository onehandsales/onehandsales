import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useMockAuth } from "../data/auth-context";
import { authReturnQuery, usePreviewEnvironment } from "@/features/preview";

// 기능 : 일회용 가상 링크와 새 비밀번호 초안을 분리해 오류·재시도·빈 로그인 복귀를 처리한다.
export function useNewPassword() {
  const { store, state } = useMockAuth(); const { state: preview, runtime } = usePreviewEnvironment(); const location = useLocation(); const navigate = useNavigate();
  const [password, setPassword] = useState(""); const [error, setError] = useState(""); const [pending, setPending] = useState(false); const request = useRef<AbortController | null>(null); const composing = useRef(false);
  const challenge = state.resetChallenge; const valid = challenge?.id === location.state?.resetChallengeId && challenge?.status === "valid" && !!challenge.actorId && challenge.revision === preview.revision;
  // 기능 : 취소 뒤 지연 저장을 무효화하고 재시도 입력은 보존한다.
  function cancel() { request.current?.abort(); request.current = null; setPending(false); }
  // 기능 : 실행 문맥·시나리오·같은 경로의 이력 변경과 이탈에서 이전 저장을 취소한다.
  useEffect(function cancelScope() { request.current?.abort(); request.current = null; setPending(false); return function abortOnLeave() { request.current?.abort(); }; }, [state.scenario, preview.revision, location.key]);
  // 기능 : 링크·사용자·유효 상태가 바뀌면 다른 대상에게 이전 비밀 초안이나 오류를 넘기지 않는다.
  useEffect(function clearLinkDraft() {
    request.current?.abort(); request.current = null; setPending(false); setPassword(""); setError(""); composing.current = false;
  }, [challenge?.id, challenge?.status, preview.revision, location.state?.resetChallengeId]);
  // 기능 : 제출 종료 후 활성화된 입력으로 오류 초점을 돌리며 재입력 중에는 초점을 재설정하지 않는다.
  useEffect(function focusValidationFailure() { if (error === "Password is too weak" && !pending) document.getElementById("new-password")?.focus(); }, [error, pending]);
  // 기능 : 원본처럼 강도 오류를 다음 제출까지 유지하면서 새 입력을 받는다.
  function edit(value: string) { cancel(); setPassword(value); if (error !== "Password is too weak") setError(""); }
  // 기능 : 확인된 로컬 링크로만 저장하고 성공 후 자동 인증 없이 빈 로그인으로 돌아간다.
  async function submit() {
    if (request.current || composing.current || !valid || !challenge) return; const controller = new AbortController(); request.current = controller; setPending(true); setError("");
    try { const committedRevision = await store.resetPassword(challenge.id, password, preview.revision, controller.signal); if (runtime.getSnapshot().revision === committedRevision && store.getSnapshot().resetChallenge?.id === challenge.id && store.getSnapshot().resetChallenge?.status === "used") { setPassword(""); void navigate("/login" + authReturnQuery(location.search), { replace: true, state: { ...location.state, resetCompleted: true } }); } }
    catch (failure) { if (!controller.signal.aborted && !(failure instanceof DOMException && failure.name === "AbortError")) { const message = failure instanceof Error ? failure.message : "Unable to save the sample password."; setError(message); if (message === "Password is too weak") { setPassword(""); document.getElementById("new-password")?.focus(); } } }
    finally { if (request.current === controller) { request.current = null; setPending(false); } }
  }
  return { password, error, pending, composing, edit, submit, cancel, valid, challenge, expire: store.expireReset };
}
