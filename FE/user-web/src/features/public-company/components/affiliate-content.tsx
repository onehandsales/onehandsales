import content from "../data/company-content.json";
import { CompanyCards } from "./company-cards";
import { CompanyOutboundLink } from "./company-outbound";
const base = "/bonsai-company/";
// 기능 : 제휴 홍보의 관찰된 비율·고정 표를 독립적으로 표시하고 신청은 로컬 목적지로 인계한다.
export function AffiliateContent() {
  return <div className="affiliate-content"><div className="affiliate-backdrop" aria-hidden="true" /><section className="affiliate-hero public-container"><div><h1>Grow your<br />business &amp; help others</h1><p>Refer visitors to Bonsai and earn competitive commissions. Join today to grow your revenue with the leading business management platform.</p><CompanyOutboundLink id="affiliate-application" className="public-button">Apply now</CompanyOutboundLink></div><img className="affiliate-person" src={base + "affiliate-person.png"} alt="Person working on a laptop" /></section>
    <img className="affiliate-branch" src={base + "636e402149cf125413320bca_branch 2.webp"} alt="" />
    <section className="affiliate-steps public-container"><h2>How the affiliate program works</h2><div className="affiliate-steps-grid"><div>{content.affiliate.steps.map(step => <section key={step.title}><h3>{step.title}</h3><p>{step.body}</p></section>)}<CompanyOutboundLink id="affiliate-application" className="public-button">Apply now</CompanyOutboundLink></div>
      <div className="affiliate-illustration"><img className="affiliate-reference-art" src={base + "affiliate-illustration.png"} alt="Illustration of promotional information and a reward message; no application or reward has been created" /></div></div></section>
    <section className="affiliate-benefits public-container"><h2>Why partner with Bonsai?</h2><CompanyCards cards={content.affiliate.cards} /></section>
    <section className="affiliate-join public-container"><h2>Ready to join?</h2><p>Sign up as an affiliate today and start earning commission on your referrals.</p><div><CompanyOutboundLink id="affiliate-application" className="public-button">Get started</CompanyOutboundLink><CompanyOutboundLink id="affiliate-contact" className="public-button company-secondary">Contact us</CompanyOutboundLink></div></section>
    <p className="company-history-note public-container">Historical reference content. The percentage examples and fixed commission table have not been reconciled into a payment policy. No affiliate application, approval or reward is created in this preview.</p>
  </div>;
}
