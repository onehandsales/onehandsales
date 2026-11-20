import { PublicLink } from "@/features/public-web";

// 기능 : 원본의 추가 상품 소개만 표시하고 세금 소개를 기존 G03 목 목적지로 연결한다.
export function PricingAddons() {
  return <section className="pricing-addons public-container">
    <h2>Take it to the <br />next level with add-ons</h2>
    <div className="pricing-addon-grid">
      <article><h3>Team Seat</h3><p>Invite teammates to collaborate on projects, track time and manage clients.</p><p className="pricing-addon-price"><strong>$10</strong> <span>/month</span></p></article>
      <article><h3>Bonsai Tax</h3><p>Track expenses, identify write-offs, and estimate quarterly taxes easily.</p><PublicLink className="public-text-link" href="/taxes">Learn more</PublicLink><p className="pricing-addon-price"><strong>$10</strong> <span>/month</span></p></article>
    </div>
  </section>;
}
