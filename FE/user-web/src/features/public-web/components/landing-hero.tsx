import { publicAssets } from "../data/public-assets";
import { PublicLink } from "./public-link";
import { SignupForm } from "./signup-form";

// 기능 : 원본의 별·리뷰 집계 문구·플랫폼 이미지를 역사적 홍보 표시로 재현한다.
export function ReviewRating({ compact = false }: { compact?: boolean }) {
  return <div className={`public-rating ${compact ? "is-compact" : ""}`}>
    <img src={publicAssets.stars} alt="5 stars" /><span>based on 1,000+ reviews from</span>
    <img src={publicAssets.reviewBrands} alt="Review platforms" />
  </div>;
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
