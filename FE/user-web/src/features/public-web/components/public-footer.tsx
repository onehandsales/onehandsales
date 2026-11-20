import { Link } from "react-router-dom";
import navigation from "../data/navigation-content.json";
import { publicAssets } from "../data/public-assets";
import { PublicLink } from "./public-link";

// 기능 : 원본 5열 푸터와 보관본에서 보완한 템플릿·비교 펼침을 표시한다.
export function PublicFooter() {
  return <footer className="public-footer public-wide" data-reference="landing-10-11">
    <div className="public-footer-grid">{navigation.footerGroups.map(group => <div key={group.title}>
      {group.title === "Company" && <Link className="public-footer-logo" to="/" aria-label="Bonsai home"><img src={publicAssets.logo} alt="bonsai" width="132" height="30" /></Link>}
      <h2>{group.title}</h2>
      {group.links.map(link => <PublicLink key={link.label} className={["Affiliate Program", "Reviews"].includes(link.label) ? "public-footer-separate" : undefined} href={link.sourceHref}>{link.label}</PublicLink>)}
      {group.disclosures.map(item => <details key={item.label}><summary>{item.label}<img src={publicAssets.chevron} alt="" /></summary>
        <div>{item.links.map(link => <PublicLink key={`${link.label}:${link.sourceHref}`} href={link.sourceHref}>{link.label}</PublicLink>)}</div>
      </details>)}
    </div>)}</div>
    <div className="public-footer-social">
      <div><PublicLink href="https://www.linkedin.com/company/bonsai/"><img src={publicAssets.linkedin} alt="LinkedIn" width="43" height="43" /></PublicLink>
        <PublicLink href="https://twitter.com/bonsaiinc"><img src={publicAssets.twitter} alt="Twitter" width="43" height="43" /></PublicLink></div>
      <p>FDIC insured up to $250k</p>
    </div>
    <p className="public-legal">© 2023 Bonsai Technologies Inc - Bonsai partners with Stripe Payments Company for money transmission services and account services with funds held at Evolve Bank &amp; Trust, Member FDIC. Bonsai cards are issued by Celtic Bank.<br />Bonsai is not a law firm, and does not provide legal services, advice, or representation. Some product imagery is for illustrative purposes only and the actual product experience may differ.</p>
  </footer>;
}
