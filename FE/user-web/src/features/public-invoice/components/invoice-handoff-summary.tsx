import { calculateInvoice, formatInvoiceAmount } from "../model/invoice-draft";
import type { InvoiceDraft } from "../model/invoice-draft";

// 기능 : 가입으로 전달된 공개 초안을 표시하고 PDF 수신·계정 저장과 구분한다.
export function InvoiceHandoffSummary({ invoice }: { invoice: InvoiceDraft }) {
  const totals = calculateInvoice(invoice);
  return <section className="invoice-handoff-summary"><h2>Invoice draft</h2><dl><dt>Draft ID</dt><dd>{invoice.id}</dd><dt>Client</dt><dd>{invoice.clientName || "Not specified"}</dd><dt>Address</dt><dd>{invoice.clientAddress || "Not specified"}</dd><dt>Due date</dt><dd>{invoice.dueDate}</dd></dl>
    <ul>{invoice.items.map(line => <li key={line.id}>{line.description} · {line.quantity} × {line.unitPrice}</li>)}</ul><p>Total: {formatInvoiceAmount(totals.total)}</p><p>공개 초안의 가입 인계입니다. PDF 파일을 생성하거나 내려받지 않았으며 계정 청구서·고객도 생성하지 않았습니다.</p></section>;
}
