import { useEffect, useRef, useState } from "react";
import { useMockAuth } from "../data/auth-context";
import { usePreviewEnvironment } from "@/features/preview";

// 기능 : 재설정 요청의 입력·취소·실패와 실제 메일 없는 안내 상태를 관리한다.
export function useResetRequest() {
  const { store, state } = useMockAuth(); const { state: preview } = usePreviewEnvironment();
  const [email, setEmail] = useState(state.resetChallenge?.status !== "used" ? state.resetChallenge?.email ?? "" : ""); const [captcha, setCaptcha] = useState(false); const [sent, setSent] = useState(!!state.resetChallenge && state.resetChallenge.status !== "used"); const [error, setError] = useState(""); const [pending, setPending] = useState(false); const request = useRef<AbortController | null>(null); const composing = useRef(false); const previousRevision = useRef(preview.revision);
  // 기능 : 취소 이후 요청이 안내나 도전을 새로 만들지 못하게 한다.
  function cancel() { request.current?.abort(); request.current = null; setPending(false); }
  // 기능 : 시나리오/실행 문맥 변경과 이탈에서 지연 요청을 취소한다.
  useEffect(function cancelScope() { request.current?.abort(); request.current = null; setPending(false); return function abortOnLeave() { request.current?.abort(); }; }, [state.scenario, preview.revision]);
  // 기능 : 다른 사용자 실행 범위로 바뀌면 이전 복구 이메일과 안내를 노출하지 않는다.
  useEffect(function clearPreviousScope() { if (previousRevision.current !== preview.revision) { setEmail(""); setCaptcha(false); setSent(false); setError(""); } previousRevision.current = preview.revision; }, [preview.revision]);
  // 기능 : 이메일 편집은 이전 요청을 무효화하고 현재 입력을 보존한다.
  function edit(value: string) { cancel(); setEmail(value); setError(""); }
  // 기능 : 일반 안내와 유효한 샘플 계정 링크를 분리해 생성한다.
  async function submit() {
    if (request.current || composing.current) return; setError("");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setError("Enter a valid email address."); document.getElementById("reset-email")?.focus(); return; }
    if (!captcha) { setError("Complete the local preview check."); return; }
    const controller = new AbortController(); request.current = controller; setPending(true);
    try { await store.requestReset(email, captcha, preview.revision, controller.signal); if (!controller.signal.aborted) { setSent(true); setCaptcha(false); } }
    catch (failure) { if (!controller.signal.aborted && !(failure instanceof DOMException && failure.name === "AbortError")) setError(failure instanceof Error ? failure.message : "Unable to prepare the local request."); }
    finally { if (request.current === controller) { request.current = null; setPending(false); } }
  }
  // 기능 : 실제 재발송과 구분해 이전 도전을 버리고 새 로컬 요청을 준비한다.
  function restart() { cancel(); store.cancelReset(); setSent(false); setCaptcha(false); setError(""); }
  return { email, captcha, setCaptcha, sent, error, pending, composing, edit, submit, cancel, restart, challenge: state.resetChallenge };
}
