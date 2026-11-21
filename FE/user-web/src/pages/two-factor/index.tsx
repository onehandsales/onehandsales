import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { usePreviewEnvironment } from "@/features/preview";
import { useMockAuth } from "@/features/mock-auth";
import { AuthTools } from "@/features/mock-auth/components/auth-controls";
import { AuthIntentSummary } from "@/features/mock-auth/components/auth-intent-summary";

// 기능 : 관찰되지 않은 2FA를 명시적인 가상 코드·만료·재시도·취소 흐름으로 제공한다.
export function TwoFactorPage() {
  const { store, state } = useMockAuth(); const { state: preview, runtime } = usePreviewEnvironment(); const location = useLocation(); const navigate = useNavigate();
  const challenge = state.twoFactor; const [code, setCode] = useState(""); const [error, setError] = useState(""); const [pending, setPending] = useState(false); const request = useRef<AbortController | null>(null); const composing = useRef(false);
  // 기능 : 시나리오·경로 이탈에서 진행 확인을 취소하고 코드는 메모리 폼 수명에 한정한다.
  useEffect(function cancelPending() { request.current?.abort(); request.current = null; setPending(false); return function abortOnLeave() { request.current?.abort(); }; }, [state.scenario]);
  // 기능 : 샘플 코드를 현재 도전에만 확인하고 인증을 마친 계정의 안전한 목적지로 이동한다.
  async function submit() {
    if (request.current || !challenge || composing.current) return; const controller = new AbortController(); request.current = controller; setPending(true); setError("");
    try {
      const result = await store.verifyFactor(code, preview.revision, controller.signal); const current = runtime.getSnapshot();
      if (current.revision !== result.committedRevision || current.session?.id !== result.account.id) return;
      setCode(""); void navigate(!result.account.setupComplete ? "/onboarding" + (result.returnTo === "/app" ? "" : "?returnTo=" + encodeURIComponent(result.returnTo)) : challenge.intent ? "/auth/continue" : result.returnTo, { replace: true, state: { authRevision: result.committedRevision, actorId: result.account.id } });
    } catch (failure) { if (!controller.signal.aborted && !(failure instanceof DOMException && failure.name === "AbortError")) setError(failure instanceof Error ? failure.message : "Unable to verify sample code."); }
    finally { if (request.current === controller) { request.current = null; setPending(false); } }
  }
  return <section className="auth-card auth-boundary"><h1>Two-factor login · local preview</h1><p>This branch is not shown in the reference flow. No email or SMS is sent. Sample code: <strong>123456</strong>.</p>
    {challenge ? <><p>Sample code: {challenge.status}</p><AuthIntentSummary intent={challenge.intent} /><form onCompositionStart={() => { composing.current = true; }} onCompositionEnd={() => { composing.current = false; }} onKeyDown={event => { if (event.key === "Enter" && (event.nativeEvent.isComposing || composing.current || event.keyCode === 229)) event.preventDefault(); }} onSubmit={event => { event.preventDefault(); void submit(); }}><label htmlFor="factor-code">Sample verification code</label><input className="auth-factor-code" id="factor-code" inputMode="numeric" autoComplete="off" maxLength={6} value={code} disabled={pending || challenge.status !== "valid"} onChange={event => { request.current?.abort(); request.current = null; setPending(false); setCode(event.target.value.replace(/\D/g, "")); setError(""); }} />{error && <p role="alert" className="auth-error">{error}</p>}<button className="auth-primary" type="submit" disabled={pending || challenge.status !== "valid"}>Verify sample code</button></form>
      <button type="button" onClick={() => { request.current?.abort(); request.current = null; setPending(false); store.renewFactor(); setCode(""); setError(""); }}>Request another local code</button><button type="button" onClick={store.expireFactor}>Expire sample code</button></> : <p>This local challenge is unavailable. A refresh clears it.</p>}
    <Link to={"/login" + (challenge ? "?returnTo=" + encodeURIComponent(challenge.returnTo) : "")} state={location.state}>Cancel and return to login</Link><AuthTools /></section>;
}
