import { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { SignupLink } from "@/features/public-web";
import downloads from "../data/download-content.json";
import { templateSelection } from "../data/template-catalog";

// 기능 : 실제 로컬 파일 수신과 외부 문서 복사·앱 가입 인계를 서로 다른 행동으로 제공한다.
export function InvoiceDownloads() {
  const [external, setExternal] = useState<{ title: string; format: string; source: string } | null>(null);
  // 기능 : 외부 요청 없이 선택한 Google 문서의 확인 범위를 닫고 원래 버튼으로 복귀한다.
  function closeExternal() { setExternal(null); }
  const appTemplate = templateSelection({ id: "invoice-template", path: "/invoice-template", title: "Invoice Template", type: "Invoices" });
  return <><div className="invoice-download-grid" id="download-invoice"><article className="invoice-download-card"><img src="/bonsai-template/652d258be4e95fb82f0b3533.webp" alt="Invoice editor illustration" /><div><h3>The Best Way to Invoice</h3><SignupLink source="invoice-app-template" intentOptions={{ template: appTemplate }}>Try Bonsai</SignupLink></div></article>
    {downloads.map(item => <article className="invoice-download-card" key={item.id} aria-label={item.title}><img src={item.image} alt={`${item.title} example`} loading="lazy" /><div><h3>{item.title}</h3><nav aria-label={`${item.title} formats`}>{item.formats.map(format => format.file ? <a key={format.label} href={format.file} download={`${item.id}.${format.file.split(".").at(-1)}`}>{format.label}</a> : <button key={format.label} type="button" onClick={() => setExternal({ title: item.title, format: format.label, source: format.source })}>{format.label}</button>)}</nav></div></article>)}</div>
    {external && <Dialog title={`${external.title} · ${external.format}`} onClose={closeExternal} description="외부 문서로 이동하는 링크의 로컬 미리보기입니다."><p>실제 Google 로그인이나 문서 복사를 실행하지 않았습니다. Word·Excel·PDF는 이 페이지에서 로컬 파일로 내려받을 수 있습니다.</p><p className="template-source-url">확인한 원본 목적지: {external.source}</p><button type="button" className="public-button" onClick={closeExternal}>Back to formats</button></Dialog>}
  </>;
}
