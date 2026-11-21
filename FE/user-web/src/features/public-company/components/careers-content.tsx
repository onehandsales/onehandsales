import content from "../data/company-content.json";
import { CompanyCards } from "./company-cards";
import { CompanyOutboundLink } from "./company-outbound";
// 기능 : 과거 채용 소개·사진·혜택·가치를 표시하고 실제 지원은 실행하지 않는다.
export function CareersContent() {
  return <div className="careers-content public-container"><section className="careers-gallery"><div className="careers-copy"><h1>We are hiring<br />a world-class team<br />to build the future of work</h1><p>We’re a growing team of ambitious leaders and talented doers who love tackling big challenges and operating at high velocity. If you feel like this is you, we'd love for you apply to one of our open positions below.</p><CompanyOutboundLink id="careers" className="public-button">View open positions</CompanyOutboundLink></div>{content.careers.photos.map((src, index) => <img key={src} src={src} alt={`Bonsai team activity from the historical careers page, photo ${index + 1}`} />)}</section>
    <section className="careers-benefits"><h2>Our benefits</h2><CompanyCards cards={content.careers.cards.slice(0, 6)} /></section><img className="careers-group" src={content.careers.groups[0]} alt="Group wearing Bonsai sweatshirts" />
    <section className="careers-values"><h2>Our values</h2><CompanyCards cards={content.careers.cards.slice(6)} /></section><img className="careers-group is-outdoor" src={content.careers.groups[1]} alt="Group gathered near an outdoor fountain" />
    <p className="company-history-note">Historical careers reference. Benefits and photographs describe the supplied Bonsai material; they are not current job openings or employment policies for this preview.</p>
  </div>;
}
