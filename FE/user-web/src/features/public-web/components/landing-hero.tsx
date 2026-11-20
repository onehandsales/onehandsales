import { useRef, useState } from "react";
import type { FormEvent, ChangeEvent, KeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";
import { publicAssets } from "../data/public-assets";
import { usePublicExperience } from "../data/public-context";
import { PublicLink } from "./public-link";

// 기능 : 원본의 별·리뷰 집계 문구·플랫폼 이미지를 역사적 홍보 표시로 재현한다.
export function ReviewRating({ compact = false }: { compact?: boolean }) {
  return <div className={`public-rating ${compact ? "is-compact" : ""}`}>
    <img src={publicAssets.stars} alt="5 stars" /><span>based on 1,000+ reviews from</span>
    <img src={publicAssets.reviewBrands} alt="Review platforms" />
  </div>;
}

// 기능 : hero 이메일을 검증하고 URL에 노출하지 않은 채 로컬 가입 경계에 인계한다.
function SignupForm() {
  const { email, setEmail, start } = usePublicExperience();
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
    setError(""); start("hero-email", true); void navigate("/signup");
  }
  // 기능 : 수정한 초안을 보존하고 이전 검증 오류를 해제한다.
  function handleChange(event: ChangeEvent<HTMLInputElement>) { setEmail(event.currentTarget.value); setError(""); }
  // 기능 : 한글 등 입력 조합의 시작을 제출 가드에 반영한다.
  function beginComposition() { composing.current = true; }
  // 기능 : 입력 조합이 끝난 뒤 일반 제출을 다시 허용한다.
  function endComposition() { composing.current = false; }
  // 기능 : 조합 확정 Enter가 가입 인계로 이어지지 않도록 막는다.
  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" && (composing.current || event.nativeEvent.isComposing)) event.preventDefault();
  }
  return <form className="public-signup-form" noValidate onSubmit={handleSubmit}>
    <label className="sr-only" htmlFor="landing-email">Email address</label>
    <div className="public-email-pill"><input ref={input} id="landing-email" type="email" required maxLength={256} autoComplete="email"
      value={email} placeholder="Enter your email" aria-invalid={Boolean(error)} aria-describedby={error ? "landing-email-error" : undefined}
      onChange={handleChange} onCompositionStart={beginComposition} onCompositionEnd={endComposition} onKeyDown={handleKeyDown} />
      <button className="public-button" type="submit">Start free</button></div>
    {error && <p id="landing-email-error" className="public-input-error" role="alert">{error}</p>}
  </form>;
}

// 기능 : 관련 인증 흐름 첫 캡처로 보완한 공개 hero와 정적인 알림 이미지를 조합한다.
export function LandingHero() {
  return <>
    <nav className="public-audiences public-wide" aria-label="Business types">
      <PublicLink href="/software/small-businesses">Small businesses</PublicLink><PublicLink href="/software/agencies">Agencies</PublicLink><PublicLink href="/software/freelancing">Freelancers</PublicLink>
    </nav>
    <section className="public-hero" data-reference="hero">
      <div className="public-container public-hero-grid">
        <div className="public-hero-copy"><h1>Run your entire<br />business in<br />one place</h1>
          <p>The only business management tool that combines CRM, time tracking, project management, invoicing and payments.</p>
          <SignupForm /><ReviewRating compact />
        </div>
        <div className="public-hero-art" role="img" aria-label="Business owner with illustrative paid invoice, new lead and expense notifications">
          <img className="public-hero-branch" src={publicAssets.branch} alt="" />
          <div className="public-hero-portrait"><div /><img src={publicAssets.girl} alt="" /></div>
          <div className="public-notice notice-paid"><img src={publicAssets.paid} alt="" /><div><span>$4,500</span><strong>Invoice paid</strong></div></div>
          <div className="public-notice notice-lead"><img src={publicAssets.lead} alt="" /><div><span>New lead</span><strong>Intake form completed</strong></div></div>
          <div className="public-notice notice-expense"><img src={publicAssets.expense} alt="" /><div><span>$300</span><strong>Expense deducted</strong></div></div>
        </div>
      </div>
    </section>
  </>;
}
