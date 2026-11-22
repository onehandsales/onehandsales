import { useRef, useState } from "react";
import type { TemplateSubtask } from "../model/template-types";
// 기능 : 하위 Save는 상위 작업 초안에만 항목을 추가하며 실제 작업 저장과 분리한다.
export function TemplateSubtasks({ items, disabled, onChange, onDraftChange }: { items: TemplateSubtask[]; disabled: boolean; onChange: (items: TemplateSubtask[]) => void; onDraftChange: (dirty: boolean) => void }) {
  const [adding, setAdding] = useState(items.length === 0); const [title, setTitle] = useState(""); const [error, setError] = useState(""); const composing = useRef(false);
  // 기능 : 빈 제목과 조합 중 제출을 막고 새로운 하위 ID를 초안에 한 번 추가한다.
  function save() {
    if (disabled || composing.current) return;
    const value = title.trim(); if (!value || value.length > 200) { setError("Enter a subtask title of 1–200 characters."); return; }
    onChange([...items, { id: crypto.randomUUID(), title: value, completed: false }]); setAdding(false); setTitle(""); setError(""); onDraftChange(false);
  }
  // 기능 : 하위 입력의 취소는 저장된 상위 초안의 다른 항목을 바꾸지 않는다.
  function cancel() { setAdding(false); setTitle(""); setError(""); onDraftChange(false); }
  return <section className="template-subtasks"><h3>Subtasks</h3>{items.map(item => <label className="template-subtask" key={item.id}><input type="checkbox" aria-label={`Template subtask ${item.title}`} checked={item.completed} disabled={disabled} onChange={event => onChange(items.map(row => row.id === item.id ? { ...row, completed: event.currentTarget.checked } : row))} /><span>{item.title}</span></label>)}
    {adding ? <div className="template-subtask-form"><span className="template-empty-check" aria-hidden="true" /><input aria-label="New template subtask" placeholder="Enter your subtask..." maxLength={200} value={title} disabled={disabled} onChange={event => { setTitle(event.currentTarget.value); onDraftChange(!!event.currentTarget.value); }} onCompositionStart={() => { composing.current = true; }} onCompositionEnd={() => { composing.current = false; }} onKeyDown={event => { if (event.key === "Enter") { event.preventDefault(); if (!event.nativeEvent.isComposing && event.keyCode !== 229) save(); } if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); cancel(); } }} /><button type="button" disabled={disabled} onClick={save}>Save</button></div> : <button className="template-text-button" type="button" disabled={disabled} onClick={() => setAdding(true)}>＋ Add Subtask</button>}
    {error && <p role="alert">{error}</p>}
  </section>;
}
