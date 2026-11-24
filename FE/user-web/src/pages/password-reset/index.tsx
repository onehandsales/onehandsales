import { useRef, type KeyboardEvent } from "react";
import { Link, useLocation } from "react-router-dom";
import { authReturnQuery } from "@/features/preview";
import { AuthPendingCancel, AuthTools, LocalCaptcha, useResetRequest, useNewPassword } from "@/features/mock-auth";

// 기능 : 인증 메일 재발송과 구분한 비밀번호 복구 요청·가상 안내를 조립한다.
export function ResetRequestPage() {
  const form = useResetRequest(); const location = useLocation(); const submitButton = useRef<HTMLButtonElement>(null);
  const returnQuery = authReturnQuery(location.search);
  const emailError = form.issue?.field === "email" ? form.issue.message : undefined;
  // 기능 : 한국어 조합 중 Enter가 복구 요청을 제출하지 않도록 막는다.
  function handleKeyDown(event: KeyboardEvent<HTMLFormElement>) {
    if (event.key === "Enter" && (event.nativeEvent.isComposing || form.composing.current || event.keyCode === 229)) event.preventDefault();
  }
  return <><section className="auth-card auth-reset"><h1>Reset Your Password</h1>
    {form.sent ? <div className="auth-reset-message" role="status" aria-describedby="reset-local-notice">
      <p>We've sent you an email with a link to reset your password.</p><p>It should arrive in the next few minutes.</p><p>Don't forget to check your spam folder if you can't find the email.</p>
    </div> : <form noValidate aria-busy={form.pending} onCompositionStart={() => { form.composing.current = true; }} onCompositionEnd={() => { form.composing.current = false; }} onKeyDown={handleKeyDown} onSubmit={event => { event.preventDefault(); void form.submit(); }}>
      <fieldset disabled={form.pending}>
        <div className="auth-field"><label className="sr-only" htmlFor="reset-email">Reset email</label>
          <input id="reset-email" type="email" maxLength={256} autoComplete="off" placeholder="you@company.com" value={form.email} onChange={event => form.edit(event.target.value)} aria-invalid={!!emailError} aria-describedby={emailError ? "reset-email-error" : undefined} />
          {emailError && <p id="reset-email-error" className="auth-error" role="alert">{emailError}</p>}
        </div>
        <LocalCaptcha checked={form.captcha} onChange={form.editCaptcha} error={form.issue?.field === "captcha" ? form.issue.message : undefined} />
        {form.issue?.field === "form" && <p role="alert" className="auth-error-box">{form.issue.message}</p>}
        <button ref={submitButton} type="submit" className="auth-primary">{form.pending ? "Preparing local request…" : "Send password reset email"}</button>
      </fieldset>
    </form>}
    <Link className="auth-reset-verification" to={"/verify-email/request" + returnQuery} state={location.state}>Resend Verification Email</Link>
  </section>
  <div className="auth-reset-controls">
    {form.pending && <AuthPendingCancel onCancel={form.cancel} returnFocusRef={submitButton} className="auth-reset-cancel">Cancel request</AuthPendingCancel>}
    {form.sent && <><p id="reset-local-notice">Local simulation · no email was sent. The message above reproduces the reference. Only a local sample link is prepared.</p>
      {form.challenge?.actorId && form.challenge.status === "valid" ? <Link to={"/password/new" + returnQuery} state={{ ...location.state, resetChallengeId: form.challenge.id }}>Open local reset link</Link> : <p>No valid local sample link is available for this address.</p>}
      <button type="button" onClick={form.restart}>Prepare another local request</button>
    </>}
    <Link to={"/login" + returnQuery} state={location.state}>Cancel and return to login</Link><AuthTools />
  </div></>;
}

// 기능 : 원본 단일 비밀번호 필드와 강도 오류를 일회용 로컬 링크에 연결한다.
export function NewPasswordPage() {
  const form = useNewPassword(); const location = useLocation(); const submitButton = useRef<HTMLButtonElement>(null);
  const returnQuery = authReturnQuery(location.search);
  // 기능 : 조합 중 Enter와 합성 제출을 비밀번호 저장 완료로 처리하지 않는다.
  function handleKeyDown(event: KeyboardEvent<HTMLFormElement>) {
    if (event.key === "Enter" && (event.nativeEvent.isComposing || form.composing.current || event.keyCode === 229)) event.preventDefault();
  }
  return <><section className="auth-card auth-reset auth-reset-new"><h1>New Password</h1>
    {form.valid ? <form noValidate aria-busy={form.pending} onCompositionStart={() => { form.composing.current = true; }} onCompositionEnd={() => { form.composing.current = false; }} onKeyDown={handleKeyDown} onSubmit={event => { event.preventDefault(); void form.submit(); }}>
      {form.error && <div id="reset-password-error" className="auth-reset-error" role="alert"><strong>Whoops!</strong><p>{form.error}</p></div>}
      <fieldset disabled={form.pending}>
        <div className="auth-field"><label className="sr-only" htmlFor="new-password">New Password</label>
          <input id="new-password" type="password" placeholder="New Password" autoComplete="new-password" maxLength={128} aria-invalid={!!form.error} aria-describedby={form.error ? "reset-password-error" : undefined} value={form.password} onChange={event => form.edit(event.target.value)} />
        </div>
        <button ref={submitButton} className="auth-primary" type="submit">{form.pending ? "Saving locally…" : "Save New Password"}</button>
      </fieldset>
    </form> : <div role="status"><p>This local reset link is unavailable, expired or already used.</p><Link to={"/password/reset" + returnQuery} state={location.state}>Request a new local link</Link></div>}
    <Link className="auth-reset-verification" to={"/verify-email/request" + returnQuery} state={location.state}>Resend Verification Email</Link>
  </section>
  <div className="auth-reset-controls"><p>Use a sample password: at least 10 characters and three character types. This rule is a mock assumption.</p>
    {form.pending && <AuthPendingCancel onCancel={form.cancel} returnFocusRef={submitButton} className="auth-reset-cancel">Cancel password change</AuthPendingCancel>}
    {form.valid && <button type="button" onClick={form.expire}>Expire local reset link</button>}
    <Link to={"/login" + returnQuery} state={location.state}>Cancel and return to login</Link><AuthTools />
  </div></>;
}
