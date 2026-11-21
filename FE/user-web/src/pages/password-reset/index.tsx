import { authReturnQuery } from "@/features/preview/model/preview-return-path";
import { Link, useLocation } from "react-router-dom";
import { AuthTools, LocalCaptcha } from "@/features/mock-auth/components/auth-controls";
import { useResetRequest } from "@/features/mock-auth/hooks/use-reset-request";
import { useNewPassword } from "@/features/mock-auth/hooks/use-new-password";

// 기능 : 인증 메일 재발송과 구분한 비밀번호 복구 요청·가상 안내를 조립한다.
export function ResetRequestPage() {
  const form = useResetRequest(); const location = useLocation();
  return <><section className="auth-card auth-reset"><h1>Reset Your Password</h1>
    {form.sent ? <div className="auth-reset-message" role="status"><small>Local simulation · no email was sent</small><p>We've sent you an email with a link to reset your password.</p><p>It should arrive in the next few minutes.</p><p>Don't forget to check your spam folder if you can't find the email.</p></div> : <form noValidate aria-busy={form.pending} onCompositionStart={() => { form.composing.current = true; }} onCompositionEnd={() => { form.composing.current = false; }} onKeyDown={event => { if (event.key === "Enter" && (event.nativeEvent.isComposing || form.composing.current || event.keyCode === 229)) event.preventDefault(); }} onSubmit={event => { event.preventDefault(); void form.submit(); }}>
      <fieldset disabled={form.pending}><div className="auth-field"><label className="sr-only" htmlFor="reset-email">Reset email</label><input id="reset-email" type="email" maxLength={256} autoComplete="off" placeholder="you@company.com" value={form.email} onChange={event => form.edit(event.target.value)} /></div><LocalCaptcha checked={form.captcha} onChange={form.setCaptcha} />{form.error && <p role="alert" className="auth-error-box">{form.error}</p>}<button type="submit" className="auth-primary">{form.pending ? "Preparing local request…" : "Send password reset email"}</button></fieldset></form>}
    <Link className="auth-reset-verification" to="/verify-email/request" state={location.state}>Resend Verification Email</Link></section>
    <div className="auth-reset-controls">{form.pending && <button type="button" onClick={form.cancel}>Cancel request</button>}{form.sent && <><p>The message above reproduces the reference. Only a local sample link is prepared; no email leaves this browser.</p>{form.challenge?.actorId && form.challenge.status === "valid" ? <Link to={"/password/new" + authReturnQuery(location.search)} state={{ ...location.state, resetChallengeId: form.challenge.id }}>Open local reset link</Link> : <p>No valid local sample link is available for this address.</p>}<button type="button" onClick={form.restart}>Prepare another local request</button></>}
      <Link to={"/login" + authReturnQuery(location.search)} state={location.state}>Cancel and return to login</Link><AuthTools /></div></>;
}
// 기능 : 원본 단일 비밀번호 필드와 강도 오류를 일회용 로컬 링크에 연결한다.
export function NewPasswordPage() {
  const form = useNewPassword(); const location = useLocation();
  return <><section className="auth-card auth-reset auth-reset-new"><h1>New Password</h1>
    {form.valid ? <form noValidate aria-busy={form.pending} onCompositionStart={() => { form.composing.current = true; }} onCompositionEnd={() => { form.composing.current = false; }} onKeyDown={event => { if (event.key === "Enter" && (event.nativeEvent.isComposing || form.composing.current || event.keyCode === 229)) event.preventDefault(); }} onSubmit={event => { event.preventDefault(); void form.submit(); }}>
      {form.error && <div id="reset-password-error" className="auth-reset-error" role="alert"><strong>Whoops!</strong><p>{form.error}</p></div>}<fieldset disabled={form.pending}><div className="auth-field"><label className="sr-only" htmlFor="new-password">New Password</label><input id="new-password" type="password" placeholder="New Password" autoComplete="new-password" maxLength={128} aria-invalid={!!form.error} aria-describedby={form.error ? "reset-password-error" : undefined} value={form.password} onChange={event => form.edit(event.target.value)} /></div><button className="auth-primary" type="submit">{form.pending ? "Saving locally…" : "Save New Password"}</button></fieldset></form>
      : <div role="status"><p>This local reset link is unavailable, expired or already used.</p><Link to={"/password/reset" + authReturnQuery(location.search)} state={location.state}>Request a new local link</Link></div>}
    <Link className="auth-reset-verification" to="/verify-email/request" state={location.state}>Resend Verification Email</Link></section>
    <div className="auth-reset-controls"><p>Use a sample password: at least 10 characters and three character types. This rule is a mock assumption.</p>{form.pending && <button type="button" onClick={form.cancel}>Cancel password change</button>}{form.valid && <button type="button" onClick={form.expire}>Expire local reset link</button>}<Link to={"/login" + authReturnQuery(location.search)} state={location.state}>Cancel and return to login</Link><AuthTools /></div></>;
}
