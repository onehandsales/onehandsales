import { useInvoiceGenerator } from "../hooks/use-invoice-generator";
import { InvoiceItems } from "./invoice-items";
import { formatInvoiceAmount, invoiceMaxLines } from "../model/invoice-draft";

// 기능 : 원본 공개 청구 폼과 합계·검증·로컬 가입 인계를 조립한다.
export function InvoiceGenerator() {
  const form = useInvoiceGenerator();
  const { draft, totals, issues } = form;
  const hasNumbers = draft.items.some(item => item.quantity || item.unitPrice);
  // 기능 : 입력을 시작하기 전의 원본 0 표기와 계산 후 두 자리 금액을 구별한다.
  function amount(value: bigint) { return hasNumbers ? formatInvoiceAmount(value) : "0"; }
  return <div className="invoice-generator-page"><form className="invoice-generator" noValidate onSubmit={form.submit}
    onCompositionStart={() => { form.composing.current = true; }} onCompositionEnd={() => { form.composing.current = false; }}
    onKeyDown={event => { if (event.key === "Enter" && (form.composing.current || event.nativeEvent.isComposing)) event.preventDefault(); }}>
    <h1>Invoice Generator</h1><div className="invoice-client-fields"><label htmlFor="invoice-client-name">Client Name:</label><input id="invoice-client-name" value={draft.clientName} maxLength={200} onChange={event => form.changeField("clientName", event.currentTarget.value)} autoComplete="off" />
      <label htmlFor="invoice-client-address">Client Address:</label><textarea id="invoice-client-address" rows={3} maxLength={2000} value={draft.clientAddress} onChange={event => form.changeField("clientAddress", event.currentTarget.value)} /></div>
    <table className="invoice-generator-table"><InvoiceItems items={draft.items} totals={totals.lines} issues={issues} onChange={form.changeLine} onRemove={form.removeLine} />
      <tfoot><tr><th scope="row" colSpan={3}>Subtotal:</th><td colSpan={2} data-testid="invoice-subtotal">{amount(totals.subtotal)}</td></tr><tr><th scope="row" colSpan={3}>Tax (15%):</th><td colSpan={2} data-testid="invoice-tax">{amount(totals.tax)}</td></tr><tr><th scope="row" colSpan={3}>Total:</th><td colSpan={2} data-testid="invoice-total">{amount(totals.total)}</td></tr>
        <tr><td colSpan={5} className="invoice-due"><label htmlFor="dueDate">Due Date:</label><input id="dueDate" type="date" min="1900-01-01" max="9999-12-31" value={draft.dueDate} onChange={event => form.changeField("dueDate", event.currentTarget.value)} aria-invalid={issues.some(issue => issue.field === "dueDate")} /></td></tr></tfoot></table>
    <div className="invoice-add-row"><button id="invoice-add-item" type="button" disabled={draft.items.length >= invoiceMaxLines} onClick={form.addLine}>Add Item</button></div>
    {issues.length > 0 && <ul id="invoice-issues" className="invoice-errors" role="alert">{issues.map(issue => <li key={issue.field}>{issue.message}</li>)}</ul>}
    {form.failure && <p className="invoice-errors" role="alert">{form.failure}</p>}
    {form.pending && <p role="status" className="invoice-pending">Preparing preview… <button type="button" onClick={form.cancelPending}>Cancel</button></p>}
    <button type="submit" className="public-button invoice-download" disabled={form.pending}>{form.pending ? "Please wait…" : "Download Invoice"}</button>
  </form></div>;
}
