import { useState } from "react";
import { productGroups, publicAssets } from "../data/public-assets";
import { experiencePanels, financePanels, shortReviews, testimonials } from "../data/landing-content";
import { PublicLink, SignupLink } from "./public-link";
import { ReviewRating } from "./landing-hero";

// 기능 : 홍보용 대시보드·모바일 폼 이미지를 실제 업무 입력과 분리해 표시한다.
export function ProductOverview() {
  return <>
    <section className="public-overview" aria-label="Bonsai product overview" data-reference="landing-01">
      <img className="public-dashboard-promo" src={publicAssets.dashboard} alt="Illustrative Bonsai dashboard with project timeline, income and expenses" />
      <img className="public-phone-promo" src={publicAssets.phone} alt="Illustrative mobile client intake form" />
    </section>
    <section className="public-product-groups public-container" aria-label="Business management features" data-reference="landing-02">
      {productGroups.map(group => <div key={group.title}><h2>{group.title}</h2>{group.links.map(link => <PublicLink key={link.label} href={link.href}>
        <img src={`/bonsai-public/${link.icon}`} alt="" width="34" height="34" /><span>{link.label}</span>
      </PublicLink>)}</div>)}
    </section>
  </>;
}

// 기능 : 확인된 후기와 보관본의 두 번째 후기를 수동 선택 가능한 한 카드로 표시한다.
export function Testimonials() {
  const [selected, setSelected] = useState(2);
  const item = testimonials[selected] ?? testimonials[0]!;
  return <section className="public-testimonials" aria-label="Business owner testimonials" data-reference="landing-03-04">
    <div className="public-testimonial-copy" aria-live="polite" aria-atomic="true"><blockquote>“{item.quote}”</blockquote><p>{item.name}, <strong>{item.role}</strong></p></div>
    <img className="public-testimonial-photo" src={item.image} alt={`${item.name}, ${item.role}`} width="301" height="301" />
    <div className="public-testimonial-controls" aria-label="Choose a testimonial">
      {testimonials.map((testimonial, index) => <button key={testimonial.id} type="button" aria-label={`Testimonial ${testimonial.id}: ${testimonial.name}`} aria-pressed={selected === index}
        onClick={() => setSelected(index)}><span />{testimonial.id}</button>)}
    </div>
  </section>;
}

// 기능 : 금융 소개 선택에 따라 홍보 이미지만 전환하고 상세 설명은 후속 공개 페이지에 연결한다.
export function FinanceOverview() {
  const [selected, setSelected] = useState(0);
  const panel = financePanels[selected] ?? financePanels[0]!;
  return <section className="public-finance public-container" data-reference="landing-05">
    <h2>Manage your finances<br />from payments, to banking, to taxes</h2>
    <div className="public-finance-grid">
      <div className={`public-finance-art finance-art-${selected}`} role="img" aria-label={`${panel.title} product illustration`}><div className="public-orange-backdrop" /><img src={panel.image} alt="" />
        {selected === 0 && <div className="public-notice public-payment-notice"><img src={publicAssets.payment} alt="" /><div><span>Payment received</span><strong>+ $240.00</strong></div></div>}
      </div>
      <div className="public-finance-options">{financePanels.map((item, index) => <article key={item.title}>
        <h3><button type="button" aria-pressed={selected === index} onClick={() => setSelected(index)}>
          {selected === index && <img src={publicAssets.arrow} alt="" />}{item.title}</button></h3>
        <p>{item.text}</p><PublicLink className="public-text-link" href={item.path}>Learn more</PublicLink>
      </article>)}</div>
    </div>
  </section>;
}

// 기능 : 고객 경험의 세 홍보 이미지를 선택 상태와 연결하고 양옆 미리보기를 유지한다.
export function ClientExperience() {
  const [selected, setSelected] = useState(2);
  const [initialReference, setInitialReference] = useState(true);
  // 기능 : 사용자가 고른 패널만 강조하고 최초 캡처의 추가 진행선 표시는 해제한다.
  function selectPanel(index: number) { setInitialReference(false); setSelected(index); }
  return <section className="public-experience" data-reference="landing-06">
    <h2>Deliver great client experiences and win more work</h2>
    <div className="public-experience-art" aria-live="polite">
      {experiencePanels.map((item, index) => <img key={item.title} src={item.image} alt={selected === index ? `${item.title} product illustration` : ""}
        className={selected === index ? "is-current" : index === (selected + 1) % 3 ? "is-next" : "is-previous"} />)}
    </div>
    <div className="public-experience-options" aria-label="Client experience preview">{experiencePanels.map((item, index) => <button type="button" key={item.title}
      aria-pressed={selected === index} data-reference-accent={initialReference && index === 1}
      onClick={() => selectPanel(index)}><strong>{item.title}</strong><span>{item.text}</span></button>)}</div>
  </section>;
}

// 기능 : 원본의 리뷰 집계와 짧은 후기 칩을 외부 실시간 조회 없이 표시한다.
export function ReviewHighlights() {
  return <section className="public-reviews" data-reference="landing-07"><h2>Trusted by thousands<br />of business owners</h2><ReviewRating />
    <div className="public-review-chips">{shortReviews.map(item => <p key={item.emphasis}>“{item.before}<strong>{item.emphasis}</strong>{item.after}”</p>)}</div>
  </section>;
}

// 기능 : 고객 지원 홍보와 체험 CTA를 원본 카피 그대로 로컬 인계에 연결한다.
export function SupportAndTrial() {
  return <>
    <section className="public-support public-container" data-reference="landing-08">
      <div className="public-support-art"><img src={publicAssets.support} alt="Illustrative customer support conversation" /><img className="public-support-leaf" src={publicAssets.supportLeaf} alt="" /></div>
      <div><article><h2>Need help? We’ll<br />be right with you</h2><p>Our friendly, speedy, Customer Support has all the answers and is here to help you.</p><PublicLink className="public-text-link" href="/support">Contact us</PublicLink></article>
        <article><h2>Quick to set up<br />Even easier to use</h2><p>You get 7 days to try it for free. And if it’s not what you expected, we guarantee your money back within the first two weeks.</p><SignupLink source="support-trial">Get started</SignupLink></article></div>
    </section>
    <section className="public-trial-banner public-container" data-reference="landing-09"><h2>Get started in 30 seconds<br />Free for 7 days</h2><SignupLink source="footer-trial">Start free trial now</SignupLink></section>
  </>;
}
