import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { InvoiceContext } from "../data/invoice-context";
import { createInvoiceDraft } from "../model/invoice-draft";
import type { InvoiceDraft } from "../model/invoice-draft";

// 기능 : 라우트 이동 동안 공개 초안을 유지하고 사용자·검증 범위 변경에서 분리한다.
export function InvoiceProvider({ children, resetRevision }: { children: ReactNode; resetRevision: number }) {
  const [draft, setDraft] = useState(createInvoiceDraft);
  // 기능 : 이전 사용자의 초안을 새 검증 범위에 노출하지 않도록 폐기한다.
  useEffect(function resetDraftScope() { setDraft(createInvoiceDraft(`public-invoice-${resetRevision}`)); }, [resetRevision]);
  // 기능 : 가입 후 복귀에서 명시적으로 전달받은 snapshot만 새 편집 초안으로 복원한다.
  function restore(snapshot: InvoiceDraft) { setDraft(structuredClone(snapshot)); }
  return <InvoiceContext.Provider value={{ draft, update: setDraft, restore }}>{children}</InvoiceContext.Provider>;
}
