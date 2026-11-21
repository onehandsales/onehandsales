import { useRef, useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { useClients } from "../hooks/use-clients";
import { useClientAction } from "../hooks/use-client-action";
import type { ClientField } from "../model/client-edits";
// 기능 : 필드 정의의 저장 행과 새 편집 행을 분리하고 Done·취소·삭제를 같은 ID에 적용한다.
export function ClientFieldDefinitions({ fields }: { fields: ClientField[] }) {
  const { store, scope } = useClients(); const action = useClientAction(); const add = useRef<HTMLButtonElement>(null);
  const input = useRef<HTMLInputElement>(null); const composing = useRef(false);
  const [draft, setDraft] = useState<{ id: string; name: string; revision: number; isNew: boolean } | null>(null);
  const [deleting, setDeleting] = useState<ClientField | null>(null);
  // 기능 : 새 행을 중복으로 만들지 않고 현재 입력으로 포커스를 이동한다.
  function start(field?: ClientField) { if (draft) { input.current?.focus(); return; } action.cancel(); setDraft({ id: field?.id ?? `${scope.workspaceId}:client-field-${crypto.randomUUID()}`, name: field?.name ?? "", revision: field?.revision ?? 0, isNew: !field }); }
  // 기능 : 저장하지 않은 행과 지연 요청을 함께 폐기하고 추가 버튼으로 복귀한다.
  function cancel() { action.cancel(); setDraft(null); add.current?.focus(); }
  // 기능 : 필드 이름만 저장하고 연락처 이메일이나 고객별 값은 변경하지 않는다.
  function save() { if (!draft || composing.current) return; void action.run(signal => store.edit(scope, { kind: draft.isNew ? "add-field" : "rename-field", id: draft.id, name: draft.name, revision: draft.revision }, signal), () => { setDraft(null); add.current?.focus(); }); }
  // 기능 : 확인한 정의와 연결 값만 제거하고 실패하면 확인 화면을 유지한다.
  function remove() { if (!deleting) return; void action.run(signal => store.edit(scope, { kind: "delete-field", id: deleting.id, revision: deleting.revision }, signal), () => { setDeleting(null); add.current?.focus(); }); }
  const rows = draft?.isNew ? [draft, ...fields] : fields;
  return <section className="client-fields-section" aria-label="Client field definitions">
    <div className="client-panel-title"><h2>Client Fields</h2><button ref={add} className="client-primary" onClick={() => start()}>Add New Field</button></div>
    <div className="client-definition-table"><header><span>Field Name</span><span>{fields.length + (draft?.isNew ? 1 : 0)} Fields<span className="sr-only">; {fields.length} saved{draft?.isNew ? ", 1 unsaved row" : ""}</span></span></header>
      {rows.map(field => draft?.id === field.id ? <div key={field.id} className="client-definition-edit"><form onCompositionStart={() => { composing.current = true; }} onCompositionEnd={() => { composing.current = false; }} onKeyDown={event => { if (event.key === "Escape") { event.preventDefault(); cancel(); } if (event.key === "Enter" && (event.nativeEvent.isComposing || event.keyCode === 229)) event.preventDefault(); }} onSubmit={event => { event.preventDefault(); save(); }}><input ref={input} autoFocus aria-label="Field name" maxLength={100} value={draft.name} onChange={event => setDraft(value => value && { ...value, name: event.target.value })} disabled={action.pending} /><div><button type="button" onClick={cancel}>Cancel</button><button type="submit" disabled={action.pending}>{action.pending ? "Saving…" : "Done"}</button></div></form></div> : <div key={field.id} data-field-id={field.id}><span className="client-field-name">{field.name}</span><button aria-label={`Edit field ${field.name}`} disabled={!!draft || action.pending} onClick={() => start(field)}>Edit</button><button className="client-delete" aria-label={`Delete field ${field.name}`} disabled={!!draft || action.pending} onClick={() => { action.cancel(); setDeleting(field); }}>Delete</button></div>)}
    </div>{action.error && !deleting && <p role="alert" className="client-error">{action.error}</p>}
    {deleting && <Dialog title="Delete client field?" onClose={() => { action.cancel(); setDeleting(null); }}><p>Remove “{deleting.name}” and its saved values from all clients in this workspace? This local preview cannot undo this change.</p>{action.error && <p role="alert" className="client-error">{action.error}</p>}<div className="client-edit-actions"><button onClick={() => { action.cancel(); setDeleting(null); }}>Cancel</button><button className="client-primary" disabled={action.pending} onClick={remove}>Delete field</button></div></Dialog>}
  </section>;
}
