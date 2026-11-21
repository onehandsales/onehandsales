import { Link } from "react-router-dom";
import content from "../data/company-content.json";
import { CompanyOutboundLink } from "./company-outbound";
// 기능 : 제공된 정책 발췌의 제목·본문·외부 쿠키 목적지를 원문과 목 동작으로 구분한다.
function PrivacyBottom() {
  const paragraphs = content.legal.privacy.bottom.filter(text => text !== "\u200d");
  return <section className="privacy-bottom" aria-label="Captured lower privacy section">{paragraphs.map((text, index) => {
    if (text.startsWith("https://www.iubenda.com")) return null;
    if (text.startsWith("You can find our complete")) return <p key={index}>{text} <CompanyOutboundLink id="cookie-policy">https://www.iubenda.com/privacy-policy/35324406/cookie-policy</CompanyOutboundLink></p>;
    if (text.startsWith("- ")) {
      if (paragraphs[index - 1]?.startsWith("- ")) return null;
      const items = paragraphs.slice(index).slice(0, paragraphs.slice(index).findIndex(item => !item.startsWith("- ")));
      return <ul className="policy-request-items" key={index}>{items.map(item => <li key={item}>{item}</li>)}</ul>;
    }
    return ["Cookie Policy", "User Access Request", "Changes to the Privacy Policy"].includes(text) ? <h2 key={index} className={`policy-subtitle${text === "User Access Request" ? " is-access-request" : ""}`}>{text}</h2> : <p key={index}>{text}</p>;
  })}</section>;
}
// 기능 : 역사적 정책의 확인된 발췌와 버전 한계를 표시하고 실제 동의·정보 요청을 만들지 않는다.
export function LegalContent({ kind }: { kind: "privacy" | "terms" }) {
  const privacy = kind === "privacy"; const blocks = content.legal[kind].top;
  return <div className={`legal-content is-${kind}`}><h1>{privacy ? "Privacy" : "Terms & Conditions"}</h1><p className="legal-reference-label">Historical Bonsai reference · captured excerpts, not the policy of this preview</p><article className="policy-copy" aria-label={privacy ? "Historical Privacy excerpts" : "Historical Terms excerpts"}>
    {blocks.map((text, index) => ["Data Collected", "Bonsai’s Services", "General Rules About Creating Accounts"].includes(text) ? <h2 key={index} className="policy-subtitle">{text}</h2> : <p key={index}>{text}</p>)}
    <aside className="policy-omission"><h2>{privacy ? "Middle sections outside the supplied captures" : "Remaining terms outside the supplied capture"}</h2><p>This page shows the supplied screenshot excerpts. It is not the complete legal document. {privacy ? "No effective or revision date is visible in the reference." : "June 30, 2020 is the displayed update date, not a verified effective date or the screenshot date."}</p><p>A January 18, 2024 archived page was used to cross-check the reference. The version linked during the original signup has not been confirmed.</p></aside>
    {privacy && <PrivacyBottom />}
    <nav className="policy-links" aria-label="Historical policy references"><Link to={privacy ? "/legal/terms" : "/legal/privacy"}>{privacy ? "Terms & Conditions" : "Privacy"}</Link>{privacy && <CompanyOutboundLink id="privacy-contact">View historical privacy contact</CompanyOutboundLink>}</nav>
  </article></div>;
}
