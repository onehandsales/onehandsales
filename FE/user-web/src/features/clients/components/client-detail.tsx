import type { ReactNode } from "react";
import { ClientFieldValues } from "./client-field-values";
import { ClientImageControl } from "./client-image-control";
import { useState } from "react";
import { Copy, MoreHorizontal, Plus, Info } from "lucide-react";
import type { ClientCompany, ClientData } from "../model/client-types";
// 기능 : 고객 상세의 회사·연락처·빈 업무 패널을 같은 ID에 연결하고 후속 행동 경계를 표시한다.
export function ClientDetail({ client, data, onUnavailable, onUpdated, projectPanel }: { client: ClientCompany; data: ClientData; onUnavailable: (name: string) => void; projectPanel: ReactNode; onUpdated: () => void }) {
  const [copyMessage, setCopyMessage] = useState("");
  const contact = data.contacts.find(value => value.id === client.defaultContactId);
  // 기능 : 연락처 이메일을 로컬 클립보드에 복사하고 브라우저 실패를 안내한다.
  async function copyEmail() { if (!contact) return; try { await navigator.clipboard.writeText(contact.email); setCopyMessage("Email copied."); } catch { setCopyMessage("Copy unavailable. Select and copy the displayed email."); } }
  return <div className="client-detail"><header className="client-detail-heading"><ClientImageControl client={client} onUpdated={onUpdated} /><div><h1>{client.displayName}</h1>{data.tags.filter(tag => client.tagIds.includes(tag.id)).map(tag => <span key={tag.id} className="client-tag">{tag.name}</span>)}</div></header>
    <div className="client-detail-grid"><div className="client-main-panels">{projectPanel}<section><div className="client-panel-title"><h2>Notes <Info size={14} aria-hidden="true" /></h2><button className="client-pill" onClick={() => onUnavailable("Client notes")}>Edit</button></div><div className="client-empty client-empty-notes">No notes added yet.</div></section><section><div className="client-panel-title"><h2>Invoices</h2><div><button className="client-pill" onClick={() => onUnavailable("Invoice currency")}>USD⌄</button><button className="client-round" aria-label="Add invoice" onClick={() => onUnavailable("New invoice")}><Plus /></button></div></div><div className="client-invoice-totals">{["Outstanding", "Overdue", "Paid / Pending"].map(value => <div key={value}><span>{value}</span><strong>$0.00</strong></div>)}</div><div className="client-empty client-empty-invoices">No invoices yet.</div></section></div>
    <aside className="client-side-panels"><section className="client-contact-card"><div className="client-contact-status"><span>● Active</span><button aria-label="Client status actions" onClick={() => onUnavailable("Client status")}><MoreHorizontal /></button></div><div className="client-contact"><button className="client-contact-menu" aria-label="Contact actions" onClick={() => onUnavailable("Contact actions")}><MoreHorizontal size={21} /></button><h2>{contact?.name}</h2><div className="client-contact-email"><span title={contact?.email}>{contact?.email}</span><button aria-label="Copy contact email" onClick={() => void copyEmail()}><Copy size={18} /></button></div><p>✓ Default Contact</p>{copyMessage && <p role="status">{copyMessage}</p>}</div><button className="client-contact-add" onClick={() => onUnavailable("Add New Contact")}>Add New Contact</button></section>
    <ClientFieldValues clientId={client.id} data={data} onUnavailable={onUnavailable} />
    <section><div className="client-panel-title"><h2>Forms</h2><button className="client-pill" onClick={() => onUnavailable("Send Form")}>Send Form</button></div><div className="client-empty client-empty-forms">No forms have been completed yet.</div></section></aside></div>
  </div>;
}
