import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { usePreviewEnvironment } from "@/features/preview";
import { usePublicExperience } from "@/features/public-web";
import { useInvoiceDraftStore } from "../data/invoice-context";
import { calculateInvoice, invoiceMaxLines, isBlankLine, validateInvoice } from "../model/invoice-draft";
import type { InvoiceDraft, InvoiceIssue, InvoiceLine } from "../model/invoice-draft";

// 기능 : 초안 편집·항목·검증과 취소 가능한 로컬 가입 인계를 조정한다.
export function useInvoiceGenerator() {
  const { draft, update } = useInvoiceDraftStore();
  const { state } = usePreviewEnvironment();
  const { start } = usePublicExperience();
  const navigate = useNavigate();
  const [issues, setIssues] = useState<InvoiceIssue[]>([]);
  const [pending, setPending] = useState(false);
  const [failure, setFailure] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const operation = useRef(0);
  const submitted = useRef(false);
  const composing = useRef(false);
  const failedRevision = useRef<number | null>(null);
  const focusFrame = useRef<number | null>(null);
  // 기능 : 문맥·라우트 이탈 뒤 늦은 완료가 다른 화면을 가입으로 바꾸지 못하게 한다.
  useEffect(function registerHandoffLifetime() {
    setPending(false); setIssues([]); setFailure("");
    return () => { operation.current += 1; if (timer.current) clearTimeout(timer.current); if (focusFrame.current) cancelAnimationFrame(focusFrame.current); submitted.current = false; };
  }, [state.revision]);
  // 기능 : 마지막 행 조작의 초점만 예약하고 화면 이탈 시 정리할 핸들을 보관한다.
  function focusAfterRender(id: string) { if (focusFrame.current) cancelAnimationFrame(focusFrame.current); focusFrame.current = requestAnimationFrame(() => document.getElementById(id)?.focus()); }
  // 기능 : 편집 또는 취소가 시작되면 이전 제출을 무효화하고 입력을 보존한다.
  function cancelPending() { operation.current += 1; if (timer.current) clearTimeout(timer.current); submitted.current = false; setPending(false); }
  // 기능 : 고객 정보·기한을 단일 초안에 반영하고 이전 검증 메시지를 지운다.
  function changeField(field: "clientName" | "clientAddress" | "dueDate", value: string) { cancelPending(); setIssues([]); setFailure(""); update(current => ({ ...current, [field]: value })); }
  // 기능 : 행 ID로 변경 대상을 찾아 삭제된 행이나 다른 행을 수정하지 않는다.
  function changeLine(id: string, field: keyof Omit<InvoiceLine, "id">, value: string) { cancelPending(); setIssues([]); setFailure(""); update(current => ({ ...current, items: current.items.map(line => line.id === id ? { ...line, [field]: value } : line) })); }
  // 기능 : 새 고유 편집 행을 추가하며 기존 합계와 항목 ID를 보존한다.
  function addLine() {
    cancelPending(); setIssues([]); setFailure("");
    const id = `line-${crypto.randomUUID()}`;
    update(current => current.items.length >= invoiceMaxLines ? current : { ...current, items: [...current.items, { id, description: "", quantity: "", unitPrice: "" }] });
    focusAfterRender(`${id}-description`);
  }
  // 기능 : 선택 행만 제거하고 다음 입력 또는 추가 버튼으로 초점을 복구한다.
  function removeLine(id: string) {
    cancelPending(); setIssues([]); setFailure("");
    const index = draft.items.findIndex(line => line.id === id);
    const next = draft.items[index + 1] ?? draft.items[index - 1];
    update(current => ({ ...current, items: current.items.filter(line => line.id !== id) }));
    focusAfterRender(next ? `${next.id}-description` : "invoice-add-item");
  }
  // 기능 : 완성된 항목 snapshot을 로컬 가입에 한 번만 전달하고 PDF 성공을 만들지 않는다.
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (composing.current || submitted.current) return;
    const found = validateInvoice(draft);
    // 이유 : number 입력의 불완전 지수처럼 DOM이 빈 문자열로 노출한 잘못된 편집도 인계하지 않는다.
    event.currentTarget.querySelectorAll<HTMLInputElement>('input[type="number"]').forEach(input => { if (input.validity.badInput && !found.some(issue => issue.field === input.id)) found.push({ field: input.id, message: "Enter a valid number." }); });
    setIssues(found); setFailure("");
    if (found.length) { document.getElementById(found[0]!.field === "items" ? draft.items[0] ? `${draft.items[0].id}-description` : "invoice-add-item" : found[0]!.field)?.focus(); return; }
    submitted.current = true; setPending(true);
    const token = ++operation.current;
    const snapshot: InvoiceDraft = structuredClone({ ...draft, items: draft.items.filter(line => !isBlankLine(line)) });
    // 기능 : 취소되지 않은 제출만 성공시키고 일회 실패 뒤에는 같은 입력으로 재시도를 허용한다.
    function completeHandoff() {
      if (token !== operation.current) return;
      if (state.scenario === "write-error" && failedRevision.current !== state.revision) { failedRevision.current = state.revision; submitted.current = false; setPending(false); setFailure("The preview could not continue. Your invoice is still here. Please try again."); return; }
      const publicIntentId = start("invoicegenerator", "/invoice-generator", false, { invoice: snapshot });
      void navigate("/signup", { state: { publicIntentId } });
    }
    timer.current = setTimeout(completeHandoff, state.scenario === "slow" ? 1500 : 80);
  }
  return { draft, totals: calculateInvoice(draft), issues, pending, failure, composing, changeField, changeLine, addLine, removeLine, submit, cancelPending };
}
