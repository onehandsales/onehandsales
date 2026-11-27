import { useId, useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import { Dialog } from "@/components/ui/dialog";
import { useClients } from "../hooks/use-clients";
import { useClientAction } from "../hooks/use-client-action";
import type { ClientField } from "../model/client-edits";
// 기능 : 필드 정의의 저장 행과 새 편집 행을 분리하고 Done·취소·삭제를 같은 ID에 적용한다.
export function ClientFieldDefinitions({ fields }: { fields: ClientField[] }) {
  const { store, scope } = useClients(); const action = useClientAction(); const add = useRef<HTMLButtonElement>(null);
  const input = useRef<HTMLInputElement>(null); const composing = useRef(false);
  const section = useRef<HTMLElement>(null); const returnField = useRef<string | null>(null); const restoreFocus = useRef(false); const errorId = useId();
  const [draft, setDraft] = useState<{ id: string; name: string; revision: number; isNew: boolean } | null>(null);
  const [deleting, setDeleting] = useState<ClientField | null>(null);
  // 기능 : 새 행을 중복으로 만들지 않고 현재 입력으로 포커스를 이동한다.
  function start(field?: ClientField) { if (draft) { input.current?.focus(); return; } action.cancel(); composing.current = false; returnField.current = field?.id ?? null; setDraft({ id: field?.id ?? `${scope.workspaceId}:client-field-${crypto.randomUUID()}`, name: field?.name ?? "", revision: field?.revision ?? 0, isNew: !field }); }
  // 기능 : 저장하지 않은 행과 지연 요청·조합 상태를 함께 폐기한다.
  function cancel() { action.cancel(); composing.current = false; restoreFocus.current = true; setDraft(null); }
  // 기능 : 입력 행이 표시 행으로 돌아온 뒤 원래 편집 버튼 또는 추가 버튼에 초점을 돌린다.
  useLayoutEffect(function restoreEditorFocus() {
    if (draft || !restoreFocus.current) return;
    restoreFocus.current = false;
    const row = Array.from(section.current?.querySelectorAll<HTMLElement>("[data-field-id]") ?? []).find(value => value.dataset.fieldId === returnField.current);
    (row?.querySelector<HTMLButtonElement>("button") ?? add.current)?.focus();
  }, [draft]);
  // 기능 : 한글 조합 중 확정·취소 키를 막고 일반 Escape만 편집 취소로 처리한다.
  function handleKeyDown(event: KeyboardEvent<HTMLFormElement>) {
    if ((event.key === "Enter" || event.key === "Escape") && (composing.current || event.nativeEvent.isComposing || event.keyCode === 229)) { event.preventDefault(); event.stopPropagation(); return; }
    if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); cancel(); }
  }
  // 기능 : 필드 이름만 저장하고 연락처 이메일이나 고객별 값은 변경하지 않는다.
  function save() { if (!draft || composing.current) return; if (!draft.name.trim() || fields.some(field => field.id !== draft.id && field.name.toLocaleLowerCase() === draft.name.trim().toLocaleLowerCase())) input.current?.focus(); void action.run(signal => store.edit(scope, { kind: draft.isNew ? "add-field" : "rename-field", id: draft.id, name: draft.name, revision: draft.revision }, signal), cancel); }
  // 기능 : 확인한 정의와 연결 값만 제거하고 실패하면 확인 화면을 유지한다.
  function remove() { if (!deleting) return; void action.run(signal => store.edit(scope, { kind: "delete-field", id: deleting.id, revision: deleting.revision }, signal), () => { setDeleting(null); add.current?.focus(); }); }
  const rows = draft?.isNew ? [draft, ...fields] : fields;
  return <section ref={section} className="client-fields-section" aria-label="Client field definitions">
    <div className="client-panel-title"><h2>Client Fields</h2><button ref={add} className="client-primary" onClick={() => start()}>Add New Field</button></div>
    <div className="client-definition-table"><header><span>Field Name</span><span>{fields.length + (draft?.isNew ? 1 : 0)} Fields<span className="sr-only">; {fields.length} saved{draft?.isNew ? ", 1 unsaved row" : ""}</span></span></header>
      {rows.map(field => draft?.id === field.id ? <div key={field.id} className="client-definition-edit"><form onCompositionStart={() => { composing.current = true; }} onCompositionEnd={() => { composing.current = false; }} onKeyDown={handleKeyDown} onSubmit={event => { event.preventDefault(); save(); }}><input ref={input} autoFocus aria-label="Field name" aria-describedby={action.error ? errorId : undefined} maxLength={100} value={draft.name} onChange={event => setDraft(value => value && { ...value, name: event.target.value })} disabled={action.pending} /><div><button type="button" onClick={cancel}>Cancel</button><button type="submit" disabled={action.pending}>{action.pending ? "Saving…" : "Done"}</button></div></form></div> : <div key={field.id} data-field-id={field.id}><span className="client-field-name">{field.name}</span><button aria-label={`Edit field ${field.name}`} disabled={!!draft || action.pending} onClick={() => start(field)}>Edit</button><button className="client-delete" aria-label={`Delete field ${field.name}`} disabled={!!draft || action.pending} onClick={() => { action.cancel(); setDeleting(field); }}>Delete</button></div>)}
    </div>{action.error && !deleting && <p id={errorId} role="alert" className="client-error">{action.error}</p>}
    {deleting && <Dialog title="Delete client field?" onClose={() => { action.cancel(); setDeleting(null); }}><p>Remove “{deleting.name}” and its saved values from all clients in this workspace? This local preview cannot undo this change.</p>{action.error && <p role="alert" className="client-error">{action.error}</p>}<div className="client-edit-actions"><button onClick={() => { action.cancel(); setDeleting(null); }}>Cancel</button><button className="client-primary" disabled={action.pending} onClick={remove}>Delete field</button></div></Dialog>}
  </section>;
}
