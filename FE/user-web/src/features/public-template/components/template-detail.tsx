import { Link, useLocation, useNavigate } from "react-router-dom";
import { SignupForm, SignupLink, publicAssets } from "@/features/public-web";
import { quotePath, templates, templateSelection, readTemplateType } from "../data/template-catalog";
import type { PublicTemplate } from "../data/template-catalog";
import copy from "../data/quote-content.json";
import { Send } from "lucide-react";
import { useTemplateCustomize } from "../hooks/use-template-customize";

// 기능 : 견적 상세의 관찰된 단순 헤더에서 같은 공개 템플릿을 가입에 인계한다.
export function TemplateDetailHeader() {
  const item = templates.find(item => item.path === quotePath)!;
  return <header className="template-detail-header"><div className="public-wide"><Link to="/" className="public-logo" aria-label="Bonsai home"><img src={publicAssets.logo} alt="bonsai" /></Link><SignupLink source="template-header" intentOptions={{ template: templateSelection(item) }}>Get template</SignupLink></div></header>;
}

// 기능 : 공개 상세와 목록의 실제 이력을 연결하고 없는 본문은 복제된 원문처럼 표시하지 않는다.
export function TemplateDetail({ item }: { item: PublicTemplate }) {
  const location = useLocation();
  const navigate = useNavigate();
  const known = item.path === quotePath;
  const customizeVisible = useTemplateCustomize();
  const origin: string = typeof location.state?.templateOrigin === "string" && location.state.templateOrigin.startsWith("/templates") ? location.state.templateOrigin : "/templates";
  // 기능 : 목록에서 들어온 상세는 해당 필터·스크롤 이력으로, 직접 진입은 목록으로 복귀한다.
  function goBack(event: React.MouseEvent<HTMLAnchorElement>) {
    if (location.state?.templateOriginKey && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey && event.button === 0) { event.preventDefault(); void navigate(-1); }
  }
  const options = { template: templateSelection(item) };
  return <div className={`template-detail ${known ? "is-observed-quote" : "is-metadata-detail"}`}>
    <nav className="template-breadcrumb public-container" aria-label="Breadcrumb"><Link to="/">Home</Link><span>›</span><Link to={origin} onClick={goBack}>{known ? "Quotes" : "Templates"}</Link><span>›</span><Link to={`/templates?type=${readTemplateType(item.type)}`}>{known ? "Quote templates" : item.type}</Link><span>›</span><span>{item.title}</span></nav>
    <section className="template-detail-hero public-container"><h1>{item.title}</h1>{known && <p>Fully editable with custom branding and pre-written services. Send and get read receipts.</p>}<SignupLink source="template-hero" intentOptions={options}>Get template</SignupLink></section>
    {known ? <>
      <section className="template-trust public-container" aria-label="Historical template ratings"><p>Bonsai has helped create <strong>1,023,928</strong> documents and counting.</p><h2>Trusted by 500,000+<br />business owners</h2><div><img src="/bonsai-template/64ad4736c8a40abcb7cf43cd.svg" alt="G2 Top software" /><img src="/bonsai-template/64ad47362f435960a742f956.svg" alt="Capterra Best app for businesses 4.7" /></div></section>
      <div className="quote-reading public-container"><aside><h2>Table of contents</h2>{copy.headings.map((heading, index) => <Link key={heading} replace state={location.state} to={`#quote-section-${index}`}>{heading}</Link>)}</aside><article>{copy.intro.map(text => <p key={text}>{text}</p>)}{copy.headings.map((heading, index) => <section key={heading} id={`quote-section-${index}`}><h2>{heading}</h2>{index === 2 ? <>{copy.pricing.map(text => <p key={text}>{text}</p>)}<figure><img src={item.image} alt="Read-only eCommerce Website Quotation example" /><figcaption><span aria-label="Five stars">★★★★★</span> Rating: 4.9</figcaption></figure></> : <p className="template-source-gap">이 구간의 전체 본문은 채택한 화면에 수록되지 않았습니다.</p>}</section>)}</article></div>
      <section className="quote-faq public-container"><h2>Frequently Asked Questions</h2><p>Questions about this template.</p>{copy.faq.map(faq => <section key={faq.question}><h3>{faq.question}</h3><p>{faq.answer}</p></section>)}</section>
      <section className="quote-more public-container"><h2>Get more template for your business.</h2><p>Discover 1,000 additional templates to use in your industry.</p><div>No items found.</div><Link className="public-text-link" to={origin} onClick={goBack}>Back to templates</Link></section>
      {customizeVisible && <div className="template-customize"><div className="public-container"><h2><Send aria-hidden="true" size={18} />Customize your eCommerce Website Quotation Template</h2><SignupForm source="template-customize" buttonLabel="Customize" intentOptions={options} /></div></div>}
    </> : <section className="template-metadata public-container">{item.image && <img src={item.image} alt={`${item.title} preview`} />}<h2>Template preview</h2><p>목록에서 확인한 제목·분류·이미지입니다. 이 템플릿의 상세 본문과 계정 편집 화면은 아직 확인되지 않았습니다.</p><dl><dt>Public template</dt><dd>{item.id}</dd><dt>Type</dt><dd>{item.type}</dd></dl><Link to={origin} onClick={goBack} className="public-text-link">Back to templates</Link></section>}
  </div>;
}
