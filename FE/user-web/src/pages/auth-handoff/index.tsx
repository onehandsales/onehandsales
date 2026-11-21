import { authReturnQuery } from "@/features/preview/model/preview-return-path";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { usePreviewEnvironment } from "@/features/preview";
import { useMockAuth } from "@/features/mock-auth";
import { AuthIntentSummary } from "@/features/mock-auth/components/auth-intent-summary";
import { AuthTools } from "@/features/mock-auth/components/auth-controls";

// 기능 : 미수록 이메일 확인을 명시적인 로컬 도전으로 제공하고 만료·취소·재시도를 연결한다.
export function EmailVerificationPage() {
  const { state: preview } = usePreviewEnvironment(); const { store, state } = useMockAuth(); const navigate = useNavigate(); const location = useLocation(); const request = useRef<AbortController | null>(null); const [pending, setPending] = useState(false); const [error, setError] = useState(""); const challenge = state.emailChallenge;
  // 기능 : 이탈·시나리오 변경은 지연 확인을 취소하며 미활성 계정을 다음 이력으로 노출하지 않는다.
  useEffect(function disposeVerification() { return function cancelOnLeave() { request.current?.abort(); }; }, [store]);
  // 기능 : 현재 화면의 유효한 도전만 확인하고 완료 뒤 동일 계정의 사업 설정으로 이동한다.
  async function confirm() {
    if (!challenge || request.current) return; const controller = new AbortController(); request.current = controller; setPending(true); setError("");
    try { await store.verifyEmail(challenge.id, preview.revision, controller.signal); if (!controller.signal.aborted) void navigate("/onboarding" + authReturnQuery(location.search), { replace: true }); }
    catch (failure) { if (!controller.signal.aborted && !(failure instanceof DOMException && failure.name === "AbortError")) setError(failure instanceof Error ? failure.message : "Unable to verify."); }
    finally { if (request.current === controller) { request.current = null; setPending(false); } }
  }
  return <section className="auth-card auth-boundary"><h1>Check your email · local preview</h1><p>No email has been sent. This is a sample verification branch, not an observed Bonsai screen.</p>
    {challenge ? <><p>Local link: {challenge.status}</p><p>{store.getAccount(challenge.actorId)?.email}</p><AuthIntentSummary intent={challenge.intent} />{error && <p role="alert">{error}</p>}<button className="auth-primary" type="button" disabled={pending || challenge.status !== "valid"} onClick={() => { void confirm(); }}>Confirm sample email</button><button type="button" disabled={pending || challenge.status !== "valid"} onClick={store.expireEmailChallenge}>Expire sample link</button></> : <p>This link is unavailable. A refresh clears local verification.</p>}
    <Link to={"/signup" + authReturnQuery(location.search)} state={location.state}>Cancel and return to signup</Link><AuthTools /></section>;
}
