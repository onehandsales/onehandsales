import { useId, useRef, useState } from "react";
import type { FormEvent, ChangeEvent, KeyboardEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { usePublicExperience } from "../data/public-context";
import type { PublicIntentOptions } from "../data/public-context";

// 기능 : hero 이메일을 검증하고 URL에 노출하지 않은 채 로컬 가입 경계에 인계한다.
export function SignupForm({ source = "hero-email", placeholder = "Enter your email", buttonLabel = "Start free", intentOptions }: { source?: string; placeholder?: string; buttonLabel?: string; intentOptions?: PublicIntentOptions }) {
  const { emails, setEmail, start } = usePublicExperience();
  const { pathname } = useLocation();
  const email = emails[pathname] ?? "";
  const id = useId();
  const [error, setError] = useState("");
  const composing = useRef(false);
  const submitted = useRef(false);
  const input = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  // 기능 : 조합 중 제출을 막고 잘못된 이메일은 보존하여 재입력하게 한다.
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    // 1. 실제 폼 전송과 조합 중 Enter를 막아 로컬 입력을 보존한다.
    event.preventDefault();
    if (composing.current || submitted.current) return;
    // 2. 검증 실패는 입력 초점을 돌리고 성공할 때만 메모리 인계를 고정한다.
    if (!email.trim() || !input.current?.validity.valid) {
      setError("Enter a valid email address."); input.current?.focus(); return;
    }
    // 이유 : 같은 이벤트 주기의 연속 제출도 history에 가입 화면을 두 번 쌓지 않는다.
    submitted.current = true;
    setError("");
    const publicIntentId = start(source, pathname, true, intentOptions);
    void navigate("/signup", { state: { publicIntentId } });
  }
  // 기능 : 수정한 초안을 보존하고 이전 검증 오류를 해제한다.
  function handleChange(event: ChangeEvent<HTMLInputElement>) { setEmail(pathname, event.currentTarget.value); setError(""); }
  // 기능 : 한글 등 입력 조합의 시작을 제출 가드에 반영한다.
  function beginComposition() { composing.current = true; }
  // 기능 : 입력 조합이 끝난 뒤 일반 제출을 다시 허용한다.
  function endComposition() { composing.current = false; }
  // 기능 : 조합 확정 Enter가 가입 인계로 이어지지 않도록 막는다.
  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" && (composing.current || event.nativeEvent.isComposing)) event.preventDefault();
  }
  return <form className="public-signup-form" noValidate onSubmit={handleSubmit}>
    <label className="sr-only" htmlFor={id}>Email address</label>
    <div className="public-email-pill"><input ref={input} id={id} type="email" required maxLength={256} autoComplete="email"
      value={email} placeholder={placeholder} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined}
      onChange={handleChange} onCompositionStart={beginComposition} onCompositionEnd={endComposition} onKeyDown={handleKeyDown} />
      <button className="public-button" type="submit">{buttonLabel}</button></div>
    {error && <p id={`${id}-error`} className="public-input-error" role="alert">{error}</p>}
  </form>;
}
