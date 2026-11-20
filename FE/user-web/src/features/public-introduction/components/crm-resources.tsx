import { useState } from "react";
import { PublicLink, SignupLink } from "@/features/public-web";
import { introductionContent, introductionAssets } from "../data/introduction-data";

// 기능 : 원본의 열두 양식을 같은 slug의 G06 목 목적지로 연결한다.
export function CrmTemplates() {
  return <section className="intro-templates public-container"><h2>Browse Bonsai’s form templates</h2>
    <div className="intro-template-grid">{introductionContent.crm.templates.map(template => <PublicLink className="intro-template-card" key={template.id} href={template.path}>
      <span><img src={template.icon} alt="" />{template.type}</span><h3>{template.title}</h3><span className="intro-card-arrow" aria-hidden="true">➜</span>
    </PublicLink>)}</div>
    <PublicLink className="public-button" href="/templates/forms">View all templates</PublicLink>
    <div className="intro-resource-cta"><span aria-hidden="true">➜</span><h3>Signup to access additional templates.</h3><p>Additional templates are only available within Bonsai.</p><SignupLink source="crm-templates">Signup</SignupLink></div>
  </section>;
}

// 기능 : 실제 CRM 처리 없이 원본 질문과 보관본 답변을 키보드로 펼치고 닫는다.
export function CrmFaq() {
  const [expanded, setExpanded] = useState<string | null>(null);
  return <section className="intro-faq public-container"><h2>Frequently asked questions</h2>
    <img className="intro-faq-branch" src={introductionAssets.branch} alt="" />
    <div className="intro-faq-list">{introductionContent.crm.faq.map(item => <div className="intro-faq-item" key={item.id}>
      <h3><button type="button" aria-expanded={expanded === item.id} aria-controls={`${item.id}-answer`} id={`${item.id}-question`}
        onClick={() => setExpanded(current => current === item.id ? null : item.id)}>{item.question}<span className="intro-faq-chevron" aria-hidden="true" /></button></h3>
      <div id={`${item.id}-answer`} role="region" aria-labelledby={`${item.id}-question`} hidden={expanded !== item.id}>
        {item.paragraphs.map((chunks, index) => <p key={index}>{chunks.map((chunk, chunkIndex) => chunk.href
          ? <PublicLink href={chunk.href} className="public-text-link" key={chunkIndex}>{chunk.text}</PublicLink> : chunk.text)}</p>)}
      </div>
    </div>)}</div>
  </section>;
}
