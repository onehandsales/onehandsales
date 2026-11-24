import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Dialog } from "@/components/ui/dialog";
import { Check, ArrowRight, UserRoundPlus, BadgeCheck, UsersRound, BriefcaseBusiness, Settings, CircleDollarSign, Clock } from "lucide-react";
import { SignupLink, usePublicOrigin } from "@/features/public-web";
import { InvoiceDownloads } from "./invoice-downloads";
import { templates } from "../data/template-catalog";
import observed from "../data/invoice-copy.json";

import { useTemplateIntent } from "../hooks/use-template-origin";

type CopyTitle = keyof typeof observed;
const varieties: CopyTitle[] = ["Blank Invoice Template", "Custom Invoice Template", "Printable Invoice Template"];
const formats: CopyTitle[] = ["Word Invoice Template", "Google Docs Invoice Template", "PDF Invoice Template", "Excel Invoice Template"];
const related: CopyTitle[] = ["Free Work Invoice Template", "Free Retainer Invoice Template", "Free Photography Invoice Templates", "Free Graphic Design Invoice Templates", "Free Pro Forma Invoice Templates"];
const benefits = [{ title: "Lasting Impression on Clients", Icon: BadgeCheck }, { title: "Increased Likelihood of Referrals", Icon: UsersRound }, { title: "Importance of Professionalism", Icon: BriefcaseBusiness }, { title: "Tracking when Clients View the Invoice", Icon: Settings }, { title: "Setting up Online Payments", Icon: CircleDollarSign }, { title: "Time Saved Creating an Invoice", Icon: Clock }];

// 기능 : 원본 본문에서 관찰한 세 링크만 로컬 상세로 연결하고 제목 링크와 구분한다.
function InvoiceCopy({ title }: { title: CopyTitle }) {
  const origin = usePublicOrigin();
  const linked = ["Printable Invoice Template", "Contractor Invoice Template", "Freelance Invoice Template"].includes(title);
  const link = linked ? observed[title].links[0] : undefined;
  // 기능 : 확인된 본문 링크 위치에만 출발 이력을 붙이고 다른 설명은 그대로 유지한다.
  function paragraph(text: string) {
    const index = link ? text.indexOf(link.text) : -1;
    return <p key={text}>{link && index >= 0 ? <>{text.slice(0, index)}<Link className="invoice-inline-link" to={new URL(link.href).pathname.replace(/\/$/, "")} state={{ templateOrigin: origin }}>{link.text}</Link>{text.slice(index + link.text.length)}</> : text}</p>;
  }
  return <>{observed[title].paragraphs.filter(text => text !== "Invoices").map(paragraph)}</>;
}

// 기능 : Word 비교의 관찰된 링크를 표시하고 미확인 목적지는 로컬 안내로 구분한다.
function InvoiceComparisonItem({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const headingEnd = text.indexOf(":") + 1;
  const label = "invoicing software";
  const position = text.startsWith("Limited Features:") ? text.indexOf(label) : -1;
  // 기능 : 목적지 근거가 없는 링크의 로컬 안내를 연다.
  function openBoundary() { setOpen(true); }
  // 기능 : 청구서 위치를 유지하며 링크 버튼으로 초점을 돌려준다.
  function closeBoundary() { setOpen(false); }
  return <li><strong>{text.slice(0, headingEnd)}</strong>{position < 0 ? text.slice(headingEnd) : <>{text.slice(headingEnd, position)}<button type="button" className="invoice-inline-link" onClick={openBoundary}>{label}</button>{text.slice(position + label.length)}</>}
    {open && <Dialog title="Invoicing software" onClose={closeBoundary}><p>원본에서 링크 표시는 확인했지만 연결 목적지와 이후 화면은 확인되지 않았습니다.</p><button type="button" className="public-button" onClick={closeBoundary}>Back to invoice templates</button></Dialog>}
  </li>;
}

// 기능 : 관찰된 청구서 소개·파일 형식·사용 사례를 조립하고 업무 기능은 로컬 인계로 구분한다.
export function InvoiceTemplate() {
  const location = useLocation();
  const origin = usePublicOrigin();
  const options = useTemplateIntent({ id: "invoice-template", path: "/invoice-template", title: "Invoice Template", type: "Invoices" });
  return <div className="invoice-template public-container">
    <section className="invoice-template-hero"><div><h1>Invoice Template</h1><p>Get started with the free customizable invoice template to create detailed invoices in minutes. Add branding, send invoices to clients, and get paid online.</p><div className="invoice-hero-actions"><SignupLink source="invoice-with-bonsai" className="public-button invoice-outline" intentOptions={options}>Invoice with Bonsai</SignupLink><Link className="public-button" to={{ pathname: location.pathname, search: location.search, hash: "#download-invoice" }} state={location.state}>Get Template</Link></div></div><img src="/bonsai-template/invoice-hero-observed.png" alt="Read-only invoice example" /></section>
    <section className="invoice-concept"><h2>What is an Invoice Template and<br />Who Should Use it?</h2><div><InvoiceCopy title="What is an Invoice Template and Who Should Use it?" /></div><Link to="/invoice-generator" className="invoice-generator-link">Try our Online Invoice Generator for an easy way to create professional invoices. <ArrowRight aria-hidden="true" /></Link></section>
    <section className="invoice-download-section"><h2>Downloadable Free Invoice Templates</h2><p>Want to create detailed invoices for your business? Now you can—with Bonsai’s free, downloadable invoice templates. Design, customize, edit, send, and share invoices with clients to get paid right away.</p><div className="invoice-varieties">{varieties.map(title => <article key={title}><h3><Check aria-hidden="true" /><Link state={{ templateOrigin: origin }} to={`/invoice-template/${title.split(" ")[0]?.toLowerCase()}`}>{title}</Link></h3><InvoiceCopy title={title} /></article>)}</div><InvoiceDownloads /></section>
    <section className="invoice-formats" aria-label="Invoice formats">{formats.map(title => <article key={title}><h3><Check aria-hidden="true" />{title}</h3><InvoiceCopy title={title} /></article>)}</section>
    <section className="invoice-industries" aria-label="Invoice examples">{[{ title: "Contractor Invoice Template" as const, image: "652d2a0529f6f7d9d27d1d5e.webp", path: "/a/independent-contractor-invoice" }, { title: "Freelance Invoice Template" as const, image: "652d2a06161daabd6b7d7038.webp", path: "/a/freelance-invoice-template" }].map(item => <article key={item.title}><div><h2>{item.title}</h2><InvoiceCopy title={item.title} /><Link state={{ templateOrigin: origin }} to={item.path} className="public-button">Get template</Link></div><img src={`/bonsai-template/${item.image}`} alt={`${item.title} read-only example`} loading="lazy" /></article>)}</section>
    <section className="invoice-related"><h2>Downloadable Free Invoice Templates</h2><div>{related.map(title => <Link key={title} state={{ templateOrigin: origin }} to={templates.find(item => item.title === title)?.path ?? "/templates?type=Invoices"}><p><UserRoundPlus aria-hidden="true" />Task management</p><h3>{title}</h3><InvoiceCopy title={title} /><span className="template-arrow"><ArrowRight aria-hidden="true" size={17} /></span></Link>)}</div></section>
    <section className="invoice-benefits"><h2>What are the Benefits of Using a<br />Great Invoice Template?</h2><p>There are many benefits to using invoice templates for your business. Forget about<br />designing your own invoices from scratch. The free, downloadable templates from Bonsai<br />empower you to create professional invoices in just a few clicks.</p><div>{benefits.map(({ title, Icon }) => <article key={title}><Icon aria-hidden="true" /><h3>{title}</h3>{title in observed ? <InvoiceCopy title={title as CopyTitle} /> : <p className="template-source-gap">원본 캡처에는 이 카드의 본문 전체가 수록되지 않았습니다.</p>}</article>)}</div></section>
    <section className="invoice-format-comparison"><h3>Word Template: Pros and Cons</h3><InvoiceCopy title="Word Template: Pros and Cons" /><div>{observed["Word Template: Pros and Cons"].lists.map((list, index) => <article key={index}><h4>{index ? "Cons" : "Pros"}</h4><ul>{list.map(text => <InvoiceComparisonItem key={text} text={text} />)}</ul></article>)}</div><h3>Excel Template: Benefits and Limitations</h3><p className="template-source-gap">이후 Excel 비교와 페이지 하단의 원본 화면은 미수록 상태입니다.</p></section>
  </div>;
}
