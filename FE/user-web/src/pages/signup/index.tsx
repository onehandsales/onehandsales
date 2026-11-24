import { useRef, useState } from "react";
import type { FormEvent, KeyboardEvent, MouseEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Dialog } from "@/components/ui/dialog";
import { usePublicExperience, publicOriginState } from "@/features/public-web";
import type { PublicIntent } from "@/features/public-web";
import { useSignup, AuthIntentSummary, AuthTools, LocalCaptcha, PasswordField, SignupProgress } from "@/features/mock-auth";

// 기능 : 브라우저 이력별 공개 인계를 읽고 가입 폼의 비밀 초안을 다른 이력과 분리한다.
export function SignupPage() {
  const location = useLocation(); const { intents } = usePublicExperience();
  const intentId: string | undefined = typeof location.state?.publicIntentId === "string" ? location.state.publicIntentId : undefined;
  return <SignupScreen key={location.key} intentId={intentId} intent={intentId ? intents[intentId] : undefined} />;
}
// 기능 : 관찰된 가입 입력과 로컬 소셜·오류·취소를 연결하고 가입 목적지 정보를 보존한다.
function SignupScreen({ intentId, intent }: { intentId?: string; intent?: PublicIntent }) {
  const form = useSignup(intent); const { clear } = usePublicExperience(); const navigate = useNavigate(); const [social, setSocial] = useState(false);
  const submitButton = useRef<HTMLButtonElement>(null);
  // 기능 : 명시적 취소에서 출발 초안 정책을 적용하고 이전 공개 페이지로 돌아간다.
  function cancelSignup() { form.cancel(); clear(intentId); void navigate(intent?.returnTo ?? "/", { replace: true, state: publicOriginState(intent?.returnOrigin, intent?.returnOriginKind) }); }
  // 기능 : 네이티브 전송 없이 로컬 가입 검증과 제출을 시작한다.
  function submitSignup(event: FormEvent<HTMLFormElement>) { event.preventDefault(); void form.submit(); }
  // 기능 : 입력 조합 중 Enter로 가입이 실행되는 것을 막는다.
  function guardComposition(event: KeyboardEvent<HTMLFormElement>) { if (event.key === "Enter" && (event.nativeEvent.isComposing || form.composing.current || event.keyCode === 229)) event.preventDefault(); }
  // 기능 : 조합 시작을 제출 가드에 기록한다.
  function beginComposition() { form.composing.current = true; }
  // 기능 : 조합 종료 후 일반 제출을 다시 허용한다.
  function endComposition() { form.composing.current = false; }
  // 기능 : 로딩에 가려진 약관 링크가 처리 중 화면을 이탈시키지 않게 한다.
  function guardTerms(event: MouseEvent<HTMLAnchorElement>) { if (form.pending) event.preventDefault(); }
  // 기능 : 명시적으로 선택한 Google 표본만 로컬 가입에 전달한다.
  function submitGoogle() { setSocial(false); void form.submit("google"); }
  return <><section className="auth-card auth-signup" aria-labelledby="signup-title"><h1 id="signup-title">Create your free account</h1>
    <button className="auth-social" type="button" onClick={() => setSocial(true)} disabled={form.pending}><img src="/bonsai-auth/google.png" alt="" width="24" height="24" />Sign up with Google</button>
    <div className="auth-divider"><span>or</span></div>
    <form noValidate inert={form.pending} aria-busy={form.pending} onCompositionStart={beginComposition} onCompositionEnd={endComposition} onKeyDown={guardComposition} onSubmit={submitSignup}>
      <fieldset disabled={form.pending}>
        <div className="auth-field"><label htmlFor="signup-email">{intent?.invoice ? "Work Email" : "Email"}</label><input id="signup-email" type="email" autoComplete="off" placeholder={intent?.invoice ? "you@company.com" : undefined} value={form.email} maxLength={256} onChange={event => form.edit("email", event.target.value)} aria-invalid={!!form.errors.email} aria-describedby={form.errors.email ? "signup-email-error" : undefined} />{form.errors.email && <p id="signup-email-error" className="auth-error">{form.errors.email}</p>}</div>
        <div className="auth-field"><label htmlFor="signup-name">Full Name</label><input id="signup-name" autoComplete="off" placeholder="Jane Smith" value={form.name} maxLength={100} onChange={event => form.edit("name", event.target.value)} aria-invalid={!!form.errors.name} aria-describedby={form.errors.name ? "signup-name-error" : undefined} />{form.errors.name && <p id="signup-name-error" className="auth-error">{form.errors.name}</p>}</div>
        <PasswordField value={form.password} onChange={value => form.edit("password", value)} error={form.errors.password} />
        <LocalCaptcha checked={form.captcha} onChange={form.editCaptcha} error={form.errors.captcha} />
        <p className="auth-terms">By creating an account, you accept our <Link to="/legal/terms" tabIndex={form.pending ? -1 : undefined} aria-disabled={form.pending || undefined} onClick={guardTerms}>terms and conditions</Link></p>
        {form.failure && <p className="auth-error auth-error-box" role="alert">{form.failure}</p>}
        <button ref={submitButton} className="auth-primary" type="submit">Create Free Account</button>
      </fieldset>
    </form>
    {form.pending && <SignupProgress onCancel={form.cancel} returnFocusRef={submitButton} />}
  </section>
  <div className="auth-below"><AuthIntentSummary intent={intent} />{!intent && <p className="auth-hint">직접 URL·새 탭·새로고침에서는 인계가 초기화됩니다.</p>}<button className="auth-secondary" type="button" onClick={cancelSignup}>{intent?.invoice ? "Back to invoice" : "Cancel and clear draft"}</button><AuthTools /></div>
  {social && <Dialog title="Google signup · local preview" description="No Google account or OAuth service is opened. Continue with the sample identity below, or cancel." onClose={() => setSocial(false)}><p>Google Preview · google-preview@example.test</p><button className="auth-primary" type="button" onClick={submitGoogle}>Continue with sample Google identity</button><button type="button" onClick={() => setSocial(false)}>Cancel</button></Dialog>}
  </>;
}
