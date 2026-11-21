import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Dialog } from "@/components/ui/dialog";
import { NewClientDialog, useClients } from "@/features/clients";
import { useTeamStore } from "@/features/team";
import type { Project, ProjectDraft } from "../model/project-types";
import { useProjectCreation } from "../hooks/use-project-creation";
import { ProjectClientPicker } from "./project-client-picker";
// 기능 : 두 생성 문맥의 고객/제목 초안을 보존하고 실제 생성 성공에만 목적지로 넘긴다.
export function NewProjectDialog({ initial, onClose, onCreated }: { initial: ProjectDraft; onClose: () => void; onCreated: (project: Project) => void }) {
  const clients = useClients(); const { store: team } = useTeamStore(); const form = useProjectCreation(initial, onCreated); const composing = useRef(false); const [newClient, setNewClient] = useState(false); const member = team.joinedMembers(clients.scope.workspaceId).find(row => row.role === "Owner");
  if (!clients.data) return null;
  if (newClient) return <NewClientDialog store={clients.store} scope={clients.scope} tags={clients.data.tags} onClose={() => setNewClient(false)} onCreated={client => { form.setDraft(value => ({ ...value, clientId: client.id })); setNewClient(false); }} />;
  const sample = form.draft.clientId === `${clients.scope.workspaceId}:client-sample`;
  return <Dialog className="project-dialog" title="New Project" onClose={onClose} footer={<><button className="client-primary" type="submit" form="new-project-form" disabled={form.pending}>{form.pending ? "Creating Project…" : "Create Project"}</button><p className="project-dialog-support">Have questions? <Link to="/support">Contact Support</Link></p></>}><form id="new-project-form" noValidate onCompositionStart={() => { composing.current = true; }} onCompositionEnd={() => { composing.current = false; }} onKeyDown={event => { if (event.key === "Enter" && (event.nativeEvent.isComposing || composing.current || event.keyCode === 229)) event.preventDefault(); }} onSubmit={event => { event.preventDefault(); if (!composing.current) void form.submit(); }}>
    {initial.origin !== "client" && <div className="project-client-field"><ProjectClientPicker data={clients.data} value={form.draft.clientId} disabled={form.pending} onChange={clientId => form.setDraft(value => ({ ...value, clientId }))} onNew={() => setNewClient(true)} />{sample && <p className="project-sample-note">This is your sample client. The proposals, contracts and invoices sent for this project will automatically be accepted or paid.<span className="sr-only">Recorded demonstration text only. This preview does not accept documents or make payments.</span></p>}</div>}
    <label className="project-title-field">Project Title<input maxLength={200} placeholder={initial.origin === "client" ? "Design Project" : "Consulting Project"} value={form.draft.name} disabled={form.pending} onChange={event => { const name = event.currentTarget.value; form.setDraft(value => ({ ...value, name })); }} /></label><div className="project-team-field"><span>Project Team</span><p><span className="project-member-avatar">{member?.name.slice(0, 2).toUpperCase()}</span>{member?.name ?? "Team unavailable"}</p></div>{form.error && <p className="client-error" role="alert">{form.error}</p>}
  </form></Dialog>;
}
