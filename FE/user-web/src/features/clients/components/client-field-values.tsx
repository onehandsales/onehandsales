import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useClients } from "../hooks/use-clients";
import { useClientAction } from "../hooks/use-client-action";
import type { ClientData } from "../model/client-types";
import type { ClientField, ClientFieldValue } from "../model/client-edits";
// 기능 : 한 고객·한 정의의 값 초안을 저장값과 분리하고 최신 버전에서만 Done을 반영한다.
function ClientFieldValueRow({ clientId, field, saved }: { clientId: string; field: ClientField; saved?: ClientFieldValue }) {
  const { store, scope } = useClients(); const action = useClientAction(); const composing = useRef(false); const editButton = useRef<HTMLButtonElement>(null);
  const [draft, setDraft] = useState<{ value: string; revision: number; fieldRevision: number } | null>(null);
  // 기능 : 현재 값 편집을 취소하고 저장값 표시로 돌아간다.
  function cancel() { action.cancel(); setDraft(null); requestAnimationFrame(() => editButton.current?.focus()); }
  // 기능 : 이 고객의 이 필드 값만 저장하고 다른 고객·연락처 값은 보존한다.
  function save() { if (!draft || composing.current) return; void action.run(signal => store.edit(scope, { kind: "field-value", clientId, fieldId: field.id, ...draft }, signal), cancel); }
  return <div className="client-field-row" data-field-id={field.id}>{draft ? <form className="client-value-form" onCompositionStart={() => { composing.current = true; }} onCompositionEnd={() => { composing.current = false; }} onKeyDown={event => { if (event.key === "Escape") { event.preventDefault(); cancel(); } if (event.key === "Enter" && (event.nativeEvent.isComposing || event.keyCode === 229)) event.preventDefault(); }} onSubmit={event => { event.preventDefault(); save(); }}><label>{field.name}<input autoFocus value={draft.value} maxLength={1000} disabled={action.pending} onChange={event => setDraft(value => value && { ...value, value: event.target.value })} /></label><div><button type="button" onClick={cancel}>Cancel</button><button type="submit" disabled={action.pending}>{action.pending ? "Saving…" : "Done"}</button></div></form> : <>{field.name}<button ref={editButton} className="client-text-action" aria-label={`Edit value ${field.name}`} onClick={() => setDraft({ value: saved?.value ?? "", revision: saved?.revision ?? 0, fieldRevision: field.revision })}>EDIT</button>{saved?.value && <p className="client-field-value">{saved.value}</p>}</>}{action.error && <p role="alert" className="client-error">{action.error}</p>}</div>;
}
// 기능 : 정의 순서로 고객별 값만 조회하고 별도의 회사 주소는 후속 근거 경계를 유지한다.
export function ClientFieldValues({ clientId, data, onUnavailable }: { clientId: string; data: ClientData; onUnavailable: (name: string) => void }) {
  return <section className="client-additional"><div className="client-panel-title"><h2>Additional Info</h2><Link className="client-pill" to="/app/clients?tab=settings">Edit Fields</Link></div>{data.fields.map(field => <ClientFieldValueRow key={field.id} clientId={clientId} field={field} saved={data.fieldValues.find(value => value.clientId === clientId && value.fieldId === field.id)} />)}<div className="client-field-row client-address">Company Address<button className="client-text-action" onClick={() => onUnavailable("Client address")}>Add Address</button></div></section>;
}
