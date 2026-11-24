import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useMockAuth } from "@/features/mock-auth";
import { usePreviewEnvironment } from "@/features/preview";
import { AuthIntentSummary } from "@/features/mock-auth/components/auth-intent-summary";
import { usePublicExperience } from "@/features/public-web";
import { useInvoiceDraftStore } from "@/features/public-invoice";
import { subscriptionHandoffPath } from "@/features/public-commercial";

// 기능 : 현재 계정·실행 이력에 귀속된 공개 선택만 복원해 실제 로컬 목적지로 연결한다.
export function AuthContinuePage() {
  const { state } = useMockAuth(); const { state: preview } = usePreviewEnvironment();
  const location = useLocation(); const navigate = useNavigate(); const { restore } = usePublicExperience(); const { restore: restoreInvoice } = useInvoiceDraftStore();
  if (!preview.session) return <Navigate replace to="/login" />;
  const handoff = state.handoff;
  const valid = handoff?.actorId === preview.session.id && handoff.workspaceId === preview.workspaceId && handoff.revision === preview.revision && location.state?.authRevision === preview.revision && location.state?.actorId === preview.session.id;
  const intent = valid ? handoff.intent : undefined;
  // 기능 : 인증 시 선택했던 초안만 복사하고 다른 이력의 공개 선택을 덮어쓰지 않는다.
  function resume(original = false) {
    if (!intent) return;
    const publicIntentId = restore(intent); if (intent.invoice) restoreInvoice(intent.invoice);
    const templateReturn = intent.template && intent.returnTo.split(/[?#]/)[0] === intent.template.path ? intent.returnTo : intent.template?.path;
    const to = original ? intent.returnTo : intent.selection ? subscriptionHandoffPath : templateReturn ?? (intent.invoice ? "/invoice-generator" : intent.returnTo);
    void navigate(to, { state: { publicIntentId } });
  }
  return <section className="auth-card auth-boundary"><h1>Your local selection</h1>{intent ? <><AuthIntentSummary intent={intent} /><p>Your selected details are ready in this local preview. Plans do not change a subscription; templates are not copied to an account; invoice drafts remain editable without generating a PDF.</p><button className="auth-primary" type="button" onClick={() => resume()}>Continue with selected details</button><button className="auth-secondary" type="button" onClick={() => resume(true)}>Return to original page</button></> : <p>This selection is unavailable in the current account or browser history. Return to the public site to make a new selection.</p>}<Link to="/app">Continue to workspace preview</Link><Link to="/">Return to public site</Link></section>;
}
// 기능 : 아직 구현하지 않은 후속 화면을 실제 처리 성공과 구분해 로컬 복귀 경계를 제공한다.
export function AuthFuturePage() {
  const location = useLocation(); const verification = location.pathname === "/verify-email/request";
  return <section className="auth-card auth-boundary"><h1>{verification ? "Resend Verification Email" : "Password reset"}</h1><p>{verification ? "Email verification is separate from password recovery. No real email is sent. Use the local verification scenario when creating a sample account." : "The password recovery flow is the next G12 task. No reset request has been sent."}</p><Link to="/login" state={location.state}>Return to login</Link>{verification && <Link to="/signup" state={location.state}>Create a sample account</Link>}</section>;
}
// 기능 : 계정 메뉴의 후속 업무 목적지를 가상 인계로 표시한다.
export function AppFuturePage() {
  const { pathname } = useLocation();
  return <section className="page-content"><h1>Local destination</h1><p>{pathname}</p><p>This workspace feature belongs to a later Goal. The sidebar connection is available; no business record, subscription, invitation or payment has been created.</p><Link to="/app">Return to workspace</Link></section>;
}
