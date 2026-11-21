import { useRef, useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import type { PreviewScope } from "@/features/preview";
import type { ClientCompany, ClientStore, ClientTag } from "../model/client-types";
import { useClientCreation } from "../hooks/use-client-creation";
// 기능 : 원본 New Client 폼과 기존 태그 선택을 취소 가능한 로컬 초안으로 표시한다.
export function NewClientDialog({ store, scope, tags, onClose, onCreated }: { store: ClientStore; scope: PreviewScope; tags: ClientTag[]; onClose: () => void; onCreated: (value: ClientCompany) => void }) {
  const form = useClientCreation(store, scope, onCreated); const composing = useRef(false); const [tagOpen, setTagOpen] = useState(false);
  return <Dialog className="client-dialog" title="New Client" description="Simply adding a client will not notify them in any way." onClose={onClose} footer={<button className="client-primary" type="submit" form="new-client-form" disabled={form.pending}>{form.pending ? "Adding Client…" : "Add Client"}</button>}>
    <form id="new-client-form" noValidate onSubmit={event => { event.preventDefault(); if (!composing.current) void form.submit(); }} onCompositionStart={() => { composing.current = true; }} onCompositionEnd={() => { composing.current = false; }} onKeyDown={event => { if (event.key === "Enter" && (composing.current || event.nativeEvent.isComposing)) event.preventDefault(); }}>
      <label>Company Name<input placeholder="Smith Co." maxLength={200} value={form.draft.companyName} disabled={form.pending} onChange={event => { const companyName = event.currentTarget.value; form.setDraft(current => ({ ...current, companyName })); }} /></label>
      <label>Contact Name <span aria-hidden="true">*</span><input placeholder="Jane Smith" required maxLength={200} value={form.draft.contactName} disabled={form.pending} onChange={event => { const contactName = event.currentTarget.value; form.setDraft(current => ({ ...current, contactName })); }} /></label>
      <label>Email <span aria-hidden="true">*</span><input type="email" placeholder="jane@smith.com" required maxLength={254} value={form.draft.email} disabled={form.pending} onChange={event => { const email = event.currentTarget.value; form.setDraft(current => ({ ...current, email })); }} /></label>
      <fieldset disabled={form.pending}><legend>Tags</legend><div className="client-tag-selection">{tags.filter(tag => form.draft.tagIds.includes(tag.id)).map(tag => <span className="client-tag" key={tag.id}>{tag.name}</span>)}<button type="button" className="client-text-action" aria-expanded={tagOpen} onClick={() => setTagOpen(value => !value)}>{form.draft.tagIds.length ? "EDIT" : "+ Add Tag"}</button></div>
      {tagOpen && <div className="client-tag-options">{tags.map(tag => <label key={tag.id}><input type="checkbox" checked={form.draft.tagIds.includes(tag.id)} onChange={event => { const checked = event.currentTarget.checked; form.setDraft(current => ({ ...current, tagIds: checked ? [...current.tagIds, tag.id] : current.tagIds.filter(id => id !== tag.id) })); }} />{tag.name}</label>)}<button type="button" onClick={() => setTagOpen(false)}>Done</button></div>}</fieldset>
      {form.error && <p role="alert" className="client-error">{form.error}</p>}
    </form>
  </Dialog>;
}
