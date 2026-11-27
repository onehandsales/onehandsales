import { useId, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { Dialog } from "@/components/ui/dialog";
import type { PreviewScope } from "@/features/preview";
import type { ClientCompany, ClientStore, ClientTag } from "../model/client-types";
import { useClientCreation } from "../hooks/use-client-creation";
import { clientDraftIssue } from "../model/client-types";
// 기능 : 원본 New Client 폼과 기존 태그 선택을 취소 가능한 로컬 초안으로 표시한다.
export function NewClientDialog({ store, scope, tags, onClose, onCreated }: { store: ClientStore; scope: PreviewScope; tags: ClientTag[]; onClose: () => void; onCreated: (value: ClientCompany) => void }) {
  const form = useClientCreation(store, scope, onCreated); const composing = useRef(false); const [tagOpen, setTagOpen] = useState(false);
  const tagTrigger = useRef<HTMLButtonElement>(null); const errorId = useId(); const tagsId = useId();
  const currentIssue = clientDraftIssue(form.draft);
  const invalid = form.error === currentIssue?.message ? currentIssue.field : undefined;
  // 기능 : 태그 선택만 닫고 모달의 입력과 진입 초점을 보존한다.
  function closeTags() { setTagOpen(false); tagTrigger.current?.focus(); }
  // 기능 : 조합 확정 키를 차단하고 태그 선택의 Escape를 모달 취소와 분리한다.
  function handleKeyDown(event: KeyboardEvent<HTMLFormElement>) {
    if ((event.key === "Enter" || event.key === "Escape") && (composing.current || event.nativeEvent.isComposing || event.keyCode === 229)) { event.preventDefault(); event.stopPropagation(); return; }
    if (event.key === "Escape" && tagOpen) { event.preventDefault(); event.stopPropagation(); closeTags(); }
  }
  // 기능 : 같은 검증 결과로 오류 입력에 초점을 주고 조합·중복 제출은 저장하지 않는다.
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (composing.current || form.pending) return;
    const issue = clientDraftIssue(form.draft);
    if (issue) event.currentTarget.querySelector<HTMLInputElement>(`input[name="${issue.field}"]`)?.focus();
    void form.submit();
  }
  return <Dialog className="client-dialog" title="New Client" description="Simply adding a client will not notify them in any way." onClose={onClose} footer={<button className="client-primary" type="submit" form="new-client-form" disabled={form.pending}>{form.pending ? "Adding Client…" : "Add Client"}</button>}>
    <form id="new-client-form" noValidate data-has-input={!!(form.draft.companyName || form.draft.contactName || form.draft.email)} onSubmit={handleSubmit} onCompositionStart={() => { composing.current = true; }} onCompositionEnd={() => { composing.current = false; }} onKeyDown={handleKeyDown}>
      <label>Company Name<input name="companyName" aria-invalid={invalid === "companyName" || undefined} aria-describedby={invalid === "companyName" ? errorId : undefined} placeholder="Smith Co." maxLength={200} value={form.draft.companyName} disabled={form.pending} onChange={event => { const companyName = event.currentTarget.value; form.setDraft(current => ({ ...current, companyName })); }} /></label>
      <label>Contact Name <span aria-hidden="true">*</span><input name="contactName" aria-invalid={invalid === "contactName" || undefined} aria-describedby={invalid === "contactName" ? errorId : undefined} placeholder="Jane Smith" required maxLength={200} value={form.draft.contactName} disabled={form.pending} onChange={event => { const contactName = event.currentTarget.value; form.setDraft(current => ({ ...current, contactName })); }} /></label>
      <label>Email <span aria-hidden="true">*</span><input name="email" aria-invalid={invalid === "email" || undefined} aria-describedby={invalid === "email" ? errorId : undefined} type="email" placeholder="jane@smith.com" required maxLength={254} value={form.draft.email} disabled={form.pending} onChange={event => { const email = event.currentTarget.value; form.setDraft(current => ({ ...current, email })); }} /></label>
      <fieldset disabled={form.pending}><legend>Tags</legend><div className="client-tag-selection">{tags.filter(tag => form.draft.tagIds.includes(tag.id)).map(tag => <span className="client-tag" key={tag.id}>{tag.name}</span>)}<button ref={tagTrigger} type="button" className="client-text-action" aria-controls={tagOpen ? tagsId : undefined} aria-expanded={tagOpen} onClick={() => setTagOpen(value => !value)}>{form.draft.tagIds.length ? "EDIT" : "+ Add Tag"}</button></div>
      {tagOpen && <div id={tagsId} className="client-tag-options">{tags.map(tag => <label key={tag.id}><input type="checkbox" checked={form.draft.tagIds.includes(tag.id)} onChange={event => { const checked = event.currentTarget.checked; form.setDraft(current => ({ ...current, tagIds: checked ? [...current.tagIds, tag.id] : current.tagIds.filter(id => id !== tag.id) })); }} />{tag.name}</label>)}<button type="button" onClick={closeTags}>Done</button></div>}</fieldset>
      {form.error && <p id={errorId} role="alert" className="client-error">{form.error}</p>}
    </form>
  </Dialog>;
}
