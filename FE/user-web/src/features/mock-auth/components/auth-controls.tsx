import { Link } from "react-router-dom";
import { useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useMockAuth } from "../data/auth-context";
import { passwordStrength } from "../model/auth-validation";
import type { AuthScenario } from "../model/auth-types";

// 기능 : 외부 CAPTCHA를 호출하지 않는 로컬 체크를 명시하고 키보드 선택을 제공한다.
export function LocalCaptcha({ checked, onChange, error }: { checked: boolean; onChange: (value: boolean) => void; error?: string }) {
  const id = useId();
  return <div className="auth-captcha-wrap"><label className="auth-captcha"><input type="checkbox" aria-invalid={!!error} checked={checked} onChange={event => onChange(event.target.checked)} aria-describedby={error ? id : undefined} />
    <span>I'm not a robot</span><small>Local<br />preview check</small></label>{error && <p id={id} className="auth-error">{error}</p>}</div>;
}
// 기능 : 비밀번호 원문을 컴포넌트 밖에 저장하지 않고 보기 전환·강도·오류를 표시한다.
export function PasswordField({ value, onChange, error, strength = true, autoComplete = "new-password" }: { value: string; onChange: (value: string) => void; error?: string; strength?: boolean; autoComplete?: string }) {
  const id = useId(); const [visible, setVisible] = useState(false); const rating = passwordStrength(value); const [blurred, setBlurred] = useState(false);
  const shortError = strength && value.length > 0 && value.length < 10 && (blurred || !!error);
  const message = shortError ? "The password must be no less than 10 characters long." : error;
  return <div className="auth-field"><div className="auth-label-row"><label htmlFor={id}>Password</label>{strength && !shortError && <span className={rating === "Strong" ? "auth-strength" : "auth-error"}>{rating}</span>}</div>
    <div className="auth-password">{shortError && <span id={id + "-tooltip"} className="auth-password-tooltip" role="alert">{message}</span>}<input id={id} type={visible ? "text" : "password"} value={value} maxLength={128} autoComplete={autoComplete} placeholder="••••••••••••" onChange={event => { setBlurred(false); onChange(event.target.value); }} onBlur={() => setBlurred(true)} aria-invalid={!!message} aria-describedby={shortError ? id + "-tooltip " + id + "-hint" : id + "-hint"} />
      <button type="button" aria-label={visible ? "Hide password" : "Show password"} aria-pressed={visible} onClick={() => setVisible(!visible)}>{visible ? <EyeOff size={20} /> : <Eye size={20} />}</button></div>
    <p id={id + "-hint"} className={error && !shortError ? "auth-error" : "auth-hint"}>{(shortError ? undefined : error) || (strength ? "Your password must be at least 10 characters" : "Use sample credentials only.")}</p></div>;
}
// 기능 : 정상 기본값을 유지하면서 관찰되지 않은 인증 실패·메일 분기를 별도 목 도구로 노출한다.
export function AuthTools() {
  const { store, state } = useMockAuth();
  return <details className="auth-tools"><summary>Local authentication scenarios</summary><label>Authentication scenario<select value={state.scenario} onChange={event => store.setScenario(event.target.value as AuthScenario)}>
    <option value="normal">Normal</option><option value="slow">Slow local response</option><option value="fail-once">Fail once, then retry</option><option value="verify-email">Local email verification</option><option value="two-factor">Local two-factor login</option></select></label>
    <p>These branches are mock assumptions. No CAPTCHA, OAuth or email service is contacted.</p><Link to="/components">Open preview controls</Link></details>;
}
// 기능 : 원본의 처리 중 표현을 정적 로컬 자산으로 보여 주고 중복 조작을 차단한다.
export function SignupProgress({ onCancel }: { onCancel: () => void }) {
  return <div className="auth-progress" role="status"><img src="/bonsai-auth/plant.png" alt="" width="128" height="220" /><p>Hold tight!<br />Your bonsai is being planted...</p><button type="button" onClick={onCancel}>Cancel this attempt</button></div>;
}
