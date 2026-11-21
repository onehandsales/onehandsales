import { authReturnQuery } from "@/features/preview/model/preview-return-path";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Dialog } from "@/components/ui/dialog";
import { usePublicExperience } from "@/features/public-web";
import type { PublicIntent } from "@/features/public-web";
import { useLogin } from "@/features/mock-auth/hooks/use-login";
import { AuthIntentSummary } from "@/features/mock-auth/components/auth-intent-summary";
import { AuthTools, LocalCaptcha } from "@/features/mock-auth/components/auth-controls";
import { AuthNotice } from "@/features/mock-auth/components/auth-notice";
import { LoginChangelog } from "@/features/mock-auth/components/login-changelog";

// 기능 : 로그인 이력마다 공개 인계를 연결하고 이전 비밀 초안을 재사용하지 않는다.
export function LoginPage() {
  const location = useLocation(); const { intents } = usePublicExperience(); const id = typeof location.state?.publicIntentId === "string" ? location.state.publicIntentId : undefined;
  return <LoginScreen key={location.key} intent={id ? intents[id] : undefined} />;
}
// 기능 : 관찰된 로그인/Changelog와 명시적 로컬 인증·복구·소셜 분기를 조립한다.
function LoginScreen({ intent }: { intent?: PublicIntent }) {
  const location = useLocation(); const form = useLogin(intent); const [social, setSocial] = useState<"google" | "apple" | null>(null);
  return <><div className="login-columns"><LoginChangelog /><div><section className="auth-card auth-login"><h1>Log in to Bonsai</h1>
    <div className="login-socials"><button type="button" className="auth-social" disabled={form.pending} onClick={() => setSocial("google")}><img src="/bonsai-auth/google.png" alt="" width="24" height="24" />Sign in with Google</button><button type="button" className="auth-social" disabled={form.pending} onClick={() => setSocial("apple")}><img src="/bonsai-auth/apple.png" alt="" width="24" height="24" />Sign in with Apple</button></div>
    <div className="auth-divider"><span>or</span></div>
    <form noValidate aria-busy={form.pending} onCompositionStart={() => { form.composing.current = true; }} onCompositionEnd={() => { form.composing.current = false; }} onKeyDown={event => { if (event.key === "Enter" && (event.nativeEvent.isComposing || form.composing.current || event.keyCode === 229)) event.preventDefault(); }} onSubmit={event => { event.preventDefault(); void form.submit(); }}>
      <fieldset disabled={form.pending}><div className="auth-field"><label className="sr-only" htmlFor="login-email">Email</label><input id="login-email" type="email" autoComplete="off" placeholder="Email" maxLength={256} value={form.email} onChange={event => form.edit("email", event.target.value)} /></div>
        <div className="auth-field"><label className="sr-only" htmlFor="login-password">Password</label><input id="login-password" type="password" autoComplete="off" placeholder="Password" maxLength={128} value={form.password} onChange={event => form.edit("password", event.target.value)} /></div>
        <LocalCaptcha checked={form.captcha} onChange={form.setCaptcha} />{form.error && <p className="auth-error-box" role="alert">{form.error}</p>}
        <button className="auth-primary" type="submit">{form.pending ? "Logging in locally..." : "Log in"}</button></fieldset>
    </form>
    {form.pending && <button className="auth-cancel-login" type="button" onClick={form.cancel}>Cancel login</button>}
    <div className="login-recovery"><Link to={"/password/reset" + authReturnQuery(location.search)} state={location.state}>Reset Password</Link><Link to="/verify-email/request" state={location.state}>Resend Verification Email</Link></div>
  </section><div className="auth-below"><AuthIntentSummary intent={intent} /><section className="auth-samples" aria-label="Sample accounts"><p>Sample accounts only · password: PreviewOnly123!</p><button type="button" disabled={form.pending} onClick={() => { void form.submit("password", "alex"); }}>Continue as Alex</button><button type="button" disabled={form.pending} onClick={() => { void form.submit("password", "blair"); }}>Continue as Blair</button></section><AuthTools /><button className="auth-secondary" type="button" onClick={form.expireCaptcha}>Expire local check</button></div></div></div>
  {social && <Dialog title={`${social === "google" ? "Google" : "Apple"} login · local preview`} description="No OAuth provider is contacted. Google uses the local Google signup account when present, otherwise Alex. Apple uses the Blair sample." onClose={() => setSocial(null)}><button className="auth-primary" type="button" onClick={() => { const method = social; setSocial(null); void form.submit(method); }}>Continue with sample identity</button><button type="button" onClick={() => setSocial(null)}>Cancel</button></Dialog>}
  <AuthNotice /></>;
}
