import { createContext, useContext } from "react";
import type { InvoiceDraft } from "../model/invoice-draft";

export type InvoiceDraftStore = { draft: InvoiceDraft; update: (change: (draft: InvoiceDraft) => InvoiceDraft) => void; restore: (draft: InvoiceDraft) => void };
export const InvoiceContext = createContext<InvoiceDraftStore | null>(null);
// 기능 : 공개 생성기의 단일 초안 저장소를 화면과 가입 후 복귀에서 함께 사용한다.
export function useInvoiceDraftStore() { const value = useContext(InvoiceContext); if (!value) throw new Error("Invoice draft provider is missing"); return value; }
