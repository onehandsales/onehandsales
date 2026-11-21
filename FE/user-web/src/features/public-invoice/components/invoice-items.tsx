import type { InvoiceLine, InvoiceIssue } from "../model/invoice-draft";
import { formatInvoiceAmount } from "../model/invoice-draft";

type InvoiceItemsProps = { items: readonly InvoiceLine[]; totals: { id: string; cents: bigint | null }[]; issues: InvoiceIssue[]; onChange: (id: string, field: keyof Omit<InvoiceLine, "id">, value: string) => void; onRemove: (id: string) => void };
// 기능 : 안정적인 행 ID로 설명·수량·단가를 편집하고 빈 행과 계산 결과를 구분한다.
export function InvoiceItems({ items, totals, issues, onChange, onRemove }: InvoiceItemsProps) {
  return <><thead><tr><th scope="col">Description</th><th scope="col">Quantity</th><th scope="col">Unit Price</th><th scope="col">Total</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead>
    <tbody>{items.map((line, index) => <tr key={line.id} data-line-id={line.id}>
      {(["description", "quantity", "unitPrice"] as const).map(field => <td key={field} data-label={field === "unitPrice" ? "Unit Price" : field}><label className="sr-only" htmlFor={`${line.id}-${field}`}>{field === "unitPrice" ? "Unit price" : field === "quantity" ? "Quantity" : "Description"} {index + 1}</label>
        <input id={`${line.id}-${field}`} type={field === "description" ? "text" : "number"} min={field === "description" ? undefined : "0"} max={field === "description" ? undefined : "1000000"} step={field === "quantity" ? "0.001" : "0.01"} maxLength={field === "description" ? 300 : undefined}
          value={line[field]} onChange={event => onChange(line.id, field, event.currentTarget.value)} aria-invalid={issues.some(issue => issue.field === `${line.id}-${field}`)} aria-describedby={issues.some(issue => issue.field === `${line.id}-${field}`) ? "invoice-issues" : undefined} /></td>)}
      <td className="invoice-line-total" data-label="Total">{totals[index]?.cents !== null && totals[index]?.cents !== undefined ? formatInvoiceAmount(totals[index]!.cents!) : ""}</td><td><button type="button" className="invoice-remove-item" aria-label={`Remove item ${index + 1}`} onClick={() => onRemove(line.id)}>Remove</button></td>
    </tr>)}</tbody></>;
}
