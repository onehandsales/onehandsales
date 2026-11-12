import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { RecordFormScope, RecordFormAttribute } from "../api/record-form-api";
import type { WorkspaceObjectRecordAttributeValuePatchValue as Value } from "../api/record-definition-api";
import { RecordValueInput } from "./record-value-input";

// 기능 : 참조 값을 이름으로 선택해 기존 단일 셀 수정 API에 전달합니다.
export function RecordReferenceValueEditor(props: { scope: RecordFormScope; field: RecordFormAttribute; value: Value; label: string; onSave: (value: Value) => Promise<void> }) {
  const [open, setOpen] = useState(false);
  return <><button type="button" aria-label={`${props.field.title} 수정`} className="h-full w-full truncate px-3 text-left hover:bg-[#F1F0EC]" onClick={() => setOpen(true)}>{props.label || "—"}</button>
    {open && <ReferenceDialog {...props} onClose={() => setOpen(false)} />}</>;
}
// 기능 : 실패 시 편집값을 유지하고 저장 중 중복 클릭과 닫기를 막습니다.
function ReferenceDialog({ scope, field, value, label, onSave, onClose }: { scope: RecordFormScope; field: RecordFormAttribute; value: Value; label: string; onSave: (value: Value) => Promise<void>; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null), busy = useRef(false);
  const [draft, setDraft] = useState(value), [saving, setSaving] = useState(false), [error, setError] = useState(false);
  useEffect(() => { const element = ref.current; element?.showModal(); return () => element?.close(); }, []);
  async function save() { if (busy.current) return; busy.current = true; setSaving(true); setError(false);
    try { await onSave(draft); onClose(); } catch { setError(true); } finally { busy.current = false; setSaving(false); } }
  return createPortal(<dialog ref={ref} aria-label={`${field.title} 수정`} className="m-auto w-[calc(100vw_-_2rem)] max-w-[400px] rounded-xl bg-white p-5 shadow-xl backdrop:bg-black/30" onCancel={event => { event.preventDefault(); if (!busy.current) onClose(); }}>
    <h2 className="mb-4 font-semibold">{field.title} 수정</h2><RecordValueInput scope={scope} field={field} value={draft} onChange={setDraft} disabled={saving} currentLabel={label} />
    {error && <p role="alert" className="mt-3 text-sm text-red-600">저장하지 못했습니다. 연결 대상과 현재 값을 확인해 주세요.</p>}
    <div className="mt-5 flex justify-end gap-2"><button type="button" disabled={saving} onClick={onClose}>취소</button><button type="button" disabled={saving} onClick={() => { void save(); }} className="rounded bg-[#4880EE] px-3 py-2 text-white disabled:opacity-50">{saving ? "저장 중…" : "저장"}</button></div>
  </dialog>, document.body);
}
