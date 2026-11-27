import { useEffect, useId, useRef, useState } from "react";
import type { FormEvent, KeyboardEvent } from "react";
import { Link } from "react-router-dom";
import { Dialog } from "@/components/ui/dialog";
import { useTemplates } from "../hooks/use-templates";
import { useTemplateMutation } from "../hooks/use-template-mutation";
import { copyTemplateTask, emptyTemplateTask } from "../model/template-values";
import type { TemplateTask } from "../model/template-types";
import { TemplateFiles } from "./template-files";
import { TemplateSubtasks } from "./template-subtasks";

// 기능 : 구성 작업·첨부·하위 초안을 상위 Save Task에서 확정하고 전체 취소를 제공한다.
export function TemplateTaskEditor({ templateId, existing, onSaved, onClose }: { templateId: string; existing?: TemplateTask; onSaved: (message: string) => void; onClose: () => void }) {
  const query = useTemplates(); const mutation = useTemplateMutation(); const [draft, setDraft] = useState(() => existing ? copyTemplateTask(existing) : emptyTemplateTask());
  const [reading, setReading] = useState(false); const [childDirty, setChildDirty] = useState(false); const [localError, setLocalError] = useState(""); const [deleting, setDeleting] = useState(false);
  const [submission] = useState(() => crypto.randomUUID()); const composing = useRef(false); const locked = mutation.pending || !query.editable; const [revision] = useState(existing?.revision ?? 0);
  const form = useRef<HTMLFormElement>(null); const errorId = useId(); const error = localError || mutation.error;
  const titleInvalid = !!error && (!draft.title.trim() || draft.title.trim().length > 200); const descriptionInvalid = !!error && draft.description.length > 4000;
  // 기능 : 저장 실패가 끝나면 수정할 입력 또는 현재 오류 안내로 초점을 돌린다.
  useEffect(function focusError() {
    if (!error || mutation.pending) return;
    const selector = localError ? '[aria-label="New template subtask"]' : '[aria-invalid="true"], [role="alert"]';
    form.current?.querySelector<HTMLElement>(selector)?.focus();
  }, [error, localError, mutation.pending]);
  // 기능 : 하위 초안이 해소되면 상위 저장을 막던 안내도 함께 정리한다.
  function handleChildDraft(dirty: boolean) { setChildDirty(dirty); if (!dirty) setLocalError(""); }
  // 기능 : 제목·설명의 조합 확정 키를 저장이나 모달 닫기 명령으로 처리하지 않는다.
  function handleKeyDown(event: KeyboardEvent<HTMLFormElement>) {
    if ((composing.current || event.nativeEvent.isComposing || event.keyCode === 229) && ["Enter", "Escape"].includes(event.key)) { event.preventDefault(); event.stopPropagation(); }
  }
  // 기능 : 저장 요청만 취소한 뒤 보존된 작업 제목으로 초점을 복귀한다.
  function cancelSave() { mutation.cancel(); requestAnimationFrame(() => form.current?.querySelector<HTMLInputElement>('input[name="title"]')?.focus()); }
  // 기능 : 하위 미확정 입력을 조용히 버리지 않고 전체 구성 작업을 원자 저장한다.
  async function submit(event: FormEvent) {
    event.preventDefault(); if (composing.current || mutation.pending || reading) return;
    if (childDirty) { setLocalError("Save or cancel the subtask input before saving this task."); return; }
    setLocalError(""); const result = await mutation.run(signal => query.store.saveTask(query.scope, templateId, existing?.id ?? null, revision, draft, submission, signal));
    if (result) onSaved("Template task saved.");
  }
  // 기능 : 미저장 작업 전체와 진행 요청을 폐기하고 템플릿으로 돌아간다.
  function close() { mutation.cancel(); onClose(); }
  // 기능 : 저장되지 않은 새 구성 작업은 폐기하고 기존 항목은 별도 확인을 연다.
  function askDelete() { if (existing) setDeleting(true); else close(); }
  // 기능 : 현재 구성 작업 ID만 삭제하고 원본 템플릿 컨테이너를 유지한다.
  async function remove() {
    if (!existing) return;
    const result = await mutation.run(async signal => { await query.store.deleteTask(query.scope, templateId, existing.id, revision, signal); return true; });
    if (result) onSaved("Template task deleted.");
  }
  // 기능 : 삭제 확인의 취소는 기존 편집 초안을 보존한다.
  function cancelDelete() { mutation.cancel(); setDeleting(false); }
  return <Dialog className="template-editor-dialog template-dialog" title="Edit Template Task" onClose={close}>
    <form ref={form} onSubmit={submit} onKeyDown={handleKeyDown} onCompositionStart={() => { composing.current = true; }} onCompositionEnd={() => { composing.current = false; }} onBlur={() => { composing.current = false; }}>
      <div className="template-editor-fields"><label>Title<input name="title" aria-invalid={titleInvalid} aria-describedby={titleInvalid ? errorId : undefined} placeholder="Update company branding and style guide" maxLength={200} value={draft.title} disabled={locked} onChange={event => setDraft({ ...draft, title: event.currentTarget.value })} /></label>
        <label>Description<textarea aria-invalid={descriptionInvalid} aria-describedby={descriptionInvalid ? errorId : undefined} aria-label="Description" placeholder="Add a description..." maxLength={4000} value={draft.description} disabled={locked} onChange={event => setDraft({ ...draft, description: event.currentTarget.value })} /></label>
        <TemplateFiles files={draft.files} disabled={locked} onChange={files => setDraft(current => ({ ...current, files }))} onReading={setReading} />
        <TemplateSubtasks items={draft.subtasks} disabled={locked} parentErrorId={localError ? errorId : undefined} onChange={subtasks => { setDraft(current => ({ ...current, subtasks })); setLocalError(""); }} onDraftChange={handleChildDraft} />
        {error && <p id={errorId} role="alert" tabIndex={-1}>{error}</p>}
      </div><footer className="template-editor-footer"><button type="button" className="template-danger" disabled={locked || reading} onClick={askDelete}>Delete Task</button><button type="button" className="template-cancel-save" style={{ visibility: mutation.pending ? "visible" : "hidden" }} disabled={!mutation.pending} onClick={cancelSave}>Cancel save</button><button type="submit" className="task-primary" disabled={locked || reading}>{mutation.pending ? "Saving…" : "Save Task"}</button></footer>
    </form><p className="template-dialog-support">Have questions? <Link to="/support">Contact Support</Link></p>
    {deleting && <Dialog title="Delete template task" onClose={cancelDelete}><p>Delete “{existing?.title}” from this template? Existing project tasks will remain unchanged.</p>{mutation.error && <p role="alert">{mutation.error}</p>}<button type="button" onClick={cancelDelete}>Cancel</button><button type="button" disabled={mutation.pending} onClick={() => void remove()}>{mutation.pending ? "Deleting…" : "Delete template task"}</button></Dialog>}
  </Dialog>;
}
