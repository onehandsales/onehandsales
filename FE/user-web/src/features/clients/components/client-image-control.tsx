import { useRef, useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { useObjectUrl } from "@/lib/use-object-url";
import { useClients } from "../hooks/use-clients";
import { useClientAction } from "../hooks/use-client-action";
import { useClientImageDraft } from "../hooks/use-client-image-draft";
import { ClientAvatar } from "./client-avatar";
import type { ClientCompany } from "../model/client-types";
// 기능 : 현재 고객 이미지와 새 파일 미리보기를 분리하고 Save 성공에만 저장 원본을 교체한다.
function ClientImageEditor({ client, onClose, onSaved }: { client: ClientCompany; onClose: () => void; onSaved: () => void }) {
  const { store, scope } = useClients(); const action = useClientAction(); const draft = useClientImageDraft(client.image);
  const input = useRef<HTMLInputElement>(null); const [revision] = useState(client.imageRevision); const url = useObjectUrl(draft.image?.file ?? null);
  // 기능 : 편집 시작 버전의 이미지 속성만 저장해 다른 필드 변경을 덮지 않는다.
  function save() { if (!draft.changed || draft.reading || draft.error) return; void action.run(signal => store.edit(scope, { kind: "image", clientId: client.id, revision, image: draft.image }, signal), onSaved); }
  return <Dialog title="Update Image" onClose={onClose}><p>Choose a PNG, JPEG or WebP image up to 2 MB. The file stays in this local preview.</p><div className="client-image-preview">{url ? <img src={url} alt="Selected client image preview" /> : <span>No image selected</span>}</div><input ref={input} type="file" aria-label="Choose client image" accept="image/png,image/jpeg,image/webp" hidden disabled={action.pending} onChange={event => { const file = event.target.files?.[0]; event.target.value = ""; if (file) void draft.select(file); }} /><button className="client-pill" disabled={action.pending} onClick={() => input.current?.click()}>Choose image</button>{draft.image && <p className="client-image-filename">{draft.image.name}</p>}{draft.reading && <p role="status">Reading image…</p>}{draft.error && <div role="alert" className="client-error"><p>{draft.error}</p><button onClick={draft.retry}>Retry image</button></div>}{action.error && <p role="alert" className="client-error">{action.error}</p>}<div className="client-edit-actions"><button onClick={onClose}>Cancel</button><button className="client-primary" onClick={save} disabled={!draft.changed || draft.reading || !!draft.error || action.pending}>{action.pending ? "Saving…" : "Save Image"}</button></div></Dialog>;
}
// 기능 : 관찰된 이미지 오버레이·제거 진입과 명시한 로컬 저장/확인 상태를 연결한다.
export function ClientImageControl({ client }: { client: ClientCompany }) {
  const { store, scope } = useClients(); const action = useClientAction(); const [editing, setEditing] = useState(false); const [removing, setRemoving] = useState<number | null>(null); const [notice, setNotice] = useState(false);
  // 기능 : 현재 선택 이미지 버전만 제거하고 이니셜로 복귀한다.
  function remove() { if (removing === null) return; void action.run(signal => store.edit(scope, { kind: "image", clientId: client.id, revision: removing, image: null }, signal), () => { setRemoving(null); setNotice(true); }); }
  return <><div className="client-image-control"><button className="client-avatar client-large-avatar" aria-label="Update client image" onClick={() => { setNotice(false); setEditing(true); }}><ClientAvatar client={client} /><span className="client-image-overlay">Update<br />Image</span></button>{client.image && <button className="client-image-remove" aria-label="Remove client image" onClick={() => { action.cancel(); setRemoving(client.imageRevision); }}>×</button>}</div>
    {editing && <ClientImageEditor client={client} onClose={() => setEditing(false)} onSaved={() => { setEditing(false); setNotice(true); }} />}
    {removing !== null && <Dialog title="Remove client image?" onClose={() => { action.cancel(); setRemoving(null); }}><p>The saved image will be replaced by this client’s initials in the list and detail.</p>{action.error && <p role="alert" className="client-error">{action.error}</p>}<div className="client-edit-actions"><button onClick={() => { action.cancel(); setRemoving(null); }}>Cancel</button><button className="client-primary" disabled={action.pending} onClick={remove}>Remove image</button></div></Dialog>}
    {notice && <div className="client-notice" role="status">✓ Your client has been successfully updated.<button aria-label="Dismiss image message" onClick={() => setNotice(false)}>×</button></div>}
  </>;
}
