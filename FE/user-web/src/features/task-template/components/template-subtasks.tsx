import { useEffect, useId, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import type { TemplateSubtask } from "../model/template-types";
// 기능 : 하위 Save는 상위 작업 초안에만 항목을 추가하며 실제 작업 저장과 분리한다.
export function TemplateSubtasks({ items, disabled, parentErrorId, onChange, onDraftChange }: { items: TemplateSubtask[]; disabled: boolean; parentErrorId?: string; onChange: (items: TemplateSubtask[]) => void; onDraftChange: (dirty: boolean) => void }) {
  const [adding, setAdding] = useState(items.length === 0); const [title, setTitle] = useState(""); const [error, setError] = useState(""); const composing = useRef(false);
  const input = useRef<HTMLInputElement>(null); const add = useRef<HTMLButtonElement>(null); const errorId = useId(); const submitted = useRef(false);
  // 기능 : 입력행 전환 후 새 입력이나 다시 추가하는 버튼으로 초점을 옮긴다.
  useEffect(function focusInput() { submitted.current = false; if (adding) input.current?.focus(); else add.current?.focus(); }, [adding]);
  // 기능 : 빈 제목과 조합 중 제출을 막고 새로운 하위 ID를 초안에 한 번 추가한다.
  function save() {
    if (disabled || composing.current || submitted.current) return;
    const value = title.trim(); if (!value || value.length > 200) { setError("Enter a subtask title of 1–200 characters."); input.current?.focus(); return; }
    submitted.current = true;
    onChange([...items, { id: crypto.randomUUID(), title: value, completed: false }]); setAdding(false); setTitle(""); setError(""); onDraftChange(false);
  }
  // 기능 : 하위 입력의 취소는 저장된 상위 초안의 다른 항목을 바꾸지 않는다.
  function cancel() { composing.current = false; setAdding(false); setTitle(""); setError(""); onDraftChange(false); }
  // 기능 : 조합 중 취소·제출을 막고 하위 입력의 키가 상위 저장이나 모달 닫기로 전파되지 않게 한다.
  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!["Enter", "Escape"].includes(event.key)) return;
    event.preventDefault(); event.stopPropagation();
    if (composing.current || event.nativeEvent.isComposing || event.keyCode === 229) return;
    if (event.key === "Enter") save(); else cancel();
  }
  return <section className="template-subtasks"><h3>Subtasks</h3>{items.map(item => <label className="template-subtask" key={item.id}><input type="checkbox" aria-label={`Template subtask ${item.title}`} checked={item.completed} disabled={disabled} onChange={event => onChange(items.map(row => row.id === item.id ? { ...row, completed: event.currentTarget.checked } : row))} /><span>{item.title}</span></label>)}
    {adding ? <div className="template-subtask-form"><span className="template-empty-check" aria-hidden="true" /><input ref={input} aria-invalid={!!error || !!parentErrorId} aria-describedby={error ? errorId : parentErrorId} aria-label="New template subtask" placeholder="Enter your subtask..." maxLength={200} value={title} disabled={disabled} onChange={event => { setTitle(event.currentTarget.value); onDraftChange(!!event.currentTarget.value); }} onCompositionStart={event => { event.stopPropagation(); composing.current = true; }} onCompositionEnd={event => { event.stopPropagation(); composing.current = false; }} onBlur={() => { composing.current = false; }} onKeyDown={handleKeyDown} /><button type="button" disabled={disabled} onClick={save}>Save</button></div> : <button ref={add} className="template-text-button" type="button" disabled={disabled} onClick={() => setAdding(true)}>＋ Add Subtask</button>}
    {error && <p id={errorId} role="alert">{error}</p>}
  </section>;
}
