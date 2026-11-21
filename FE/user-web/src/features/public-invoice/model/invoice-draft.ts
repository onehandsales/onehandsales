export type InvoiceLine = Readonly<{ id: string; description: string; quantity: string; unitPrice: string }>;
export type InvoiceDraft = Readonly<{ id: string; clientName: string; clientAddress: string; dueDate: string; items: readonly InvoiceLine[] }>;
export type InvoiceIssue = { field: string; message: string };
export const invoiceTaxBasisPoints = 1500n;
export const invoiceMaxLines = 100;

// 기능 : 캡처 기준의 고정 기한을 가진 공개 초안을 만들며 실제 고객·계정 청구서는 생성하지 않는다.
export function createInvoiceDraft(id = "public-invoice-draft-1"): InvoiceDraft {
  return { id, clientName: "", clientAddress: "", dueDate: "2024-02-15", items: [{ id: "line-1", description: "", quantity: "", unitPrice: "" }] };
}
// 기능 : 제한된 소수를 정수 단위로 읽어 부동소수 오차·음수·지수·과도한 값을 거부한다.
export function decimalUnits(value: string, scale: number): bigint | null {
  if (!new RegExp(`^\\d{1,7}(?:\\.\\d{0,${scale}})?$`).test(value.trim())) return null;
  const [whole = "", fraction = ""] = value.trim().split(".");
  const units = BigInt(whole) * 10n ** BigInt(scale) + BigInt(fraction.padEnd(scale, "0"));
  return units <= 1_000_000n * 10n ** BigInt(scale) ? units : null;
}
// 기능 : 음수가 아닌 금액의 절반 이상을 올리는 목 반올림을 적용한다.
function roundUnits(value: bigint, divisor: bigint) { return (value + divisor / 2n) / divisor; }
// 기능 : 금액을 소수 두 자리로 표시하며 통화가 확인되지 않은 원본에 임의 기호를 붙이지 않는다.
export function formatInvoiceAmount(cents: bigint) { return `${cents / 100n}.${String(cents % 100n).padStart(2, "0")}`; }
// 기능 : 완전히 비어 있는 편집 행을 인계 대상 항목과 구분한다.
export function isBlankLine(line: InvoiceLine) { return !line.description.trim() && !line.quantity.trim() && !line.unitPrice.trim(); }
// 기능 : 행별 반올림·세금 반올림 후 합계를 구해 표시된 소계와 세금의 합이 총액과 일치하게 한다.
export function calculateInvoice(draft: InvoiceDraft) {
  const lines = draft.items.map(line => {
    const quantity = decimalUnits(line.quantity, 3); const price = decimalUnits(line.unitPrice, 2);
    return { id: line.id, cents: quantity === null || price === null ? null : roundUnits(quantity * price, 1000n) };
  });
  const subtotal = lines.reduce((sum, line) => sum + (line.cents ?? 0n), 0n);
  const tax = roundUnits(subtotal * invoiceTaxBasisPoints, 10_000n);
  return { lines, subtotal, tax, total: subtotal + tax };
}
// 기능 : 실제 달력에 있는 ISO 날짜인지 확인하고 시간대에 따른 날짜 이동을 막는다.
export function validInvoiceDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value && value >= "1900-01-01";
}
// 기능 : 선택적 고객 정보와 완전한 항목을 검증하고 빈 편집 행은 오류 없이 남겨 둔다.
export function validateInvoice(draft: InvoiceDraft): InvoiceIssue[] {
  const issues: InvoiceIssue[] = [];
  if (!validInvoiceDate(draft.dueDate)) issues.push({ field: "dueDate", message: "Enter a valid due date." });
  const active = draft.items.filter(line => !isBlankLine(line));
  if (!active.length) issues.push({ field: "items", message: "Add at least one complete item." });
  for (const line of active) {
    if (!line.description.trim()) issues.push({ field: `${line.id}-description`, message: "Enter an item description." });
    if (decimalUnits(line.quantity, 3) === null) issues.push({ field: `${line.id}-quantity`, message: "Use a quantity from 0 to 1,000,000 with up to 3 decimal places." });
    if (decimalUnits(line.unitPrice, 2) === null) issues.push({ field: `${line.id}-unitPrice`, message: "Use a unit price from 0 to 1,000,000 with up to 2 decimal places." });
  }
  return issues;
}
