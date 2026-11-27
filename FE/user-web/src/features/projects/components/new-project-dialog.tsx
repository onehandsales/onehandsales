import { useId, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { Link } from "react-router-dom";
import { Dialog } from "@/components/ui/dialog";
import { NewClientDialog, useClients } from "@/features/clients";
import { useTeamStore } from "@/features/team";
import { projectDraftIssue } from "../model/project-types";
import type { Project, ProjectDraft } from "../model/project-types";
import { useProjectCreation } from "../hooks/use-project-creation";
import { ProjectClientPicker } from "./project-client-picker";
// 기능 : 두 생성 문맥의 고객/제목 초안을 보존하고 실제 생성 성공에만 목적지로 넘긴다.
export function NewProjectDialog({ initial, onClose, onCreated }: { initial: ProjectDraft; onClose: () => void; onCreated: (project: Project) => void }) {
  const clients = useClients(); const { store: team } = useTeamStore(); const form = useProjectCreation(initial, onCreated); const composing = useRef(false); const [newClient, setNewClient] = useState(false); const member = team.joinedMembers(clients.scope.workspaceId).find(row => row.role === "Owner");
  const errorId = useId(); const issue = projectDraftIssue(form.draft); const invalid = form.error === issue?.message ? issue.field : undefined;
  // 기능 : 조합 확정과 취소 키가 부모 모달 닫기·제출로 전파되지 않게 한다.
  function handleKeyDown(event: KeyboardEvent<HTMLFormElement>) {
    if (["Enter", "Escape"].includes(event.key) && (event.nativeEvent.isComposing || composing.current || event.keyCode === 229)) { event.preventDefault(); event.stopPropagation(); }
  }
  // 기능 : 첫 오류 입력으로 초점을 옮기고 현재 확정 초안만 제출한다.
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (composing.current || form.pending) return;
    if (issue) event.currentTarget.querySelector<HTMLElement>(issue.field === "name" ? '[name="name"]' : ".project-client-trigger")?.focus();
    void form.submit();
  }
  // 기능 : 고객 하위 폼으로 전환할 때 프로젝트 입력의 미완료 조합 상태를 종료한다.
  function openClient() { composing.current = false; setNewClient(true); }
  if (!clients.data) return null;
  if (newClient) return <NewClientDialog store={clients.store} scope={clients.scope} tags={clients.data.tags} onClose={() => setNewClient(false)} onCreated={client => { form.setDraft(value => ({ ...value, clientId: client.id })); setNewClient(false); }} />;
  const sample = form.draft.clientId === `${clients.scope.workspaceId}:client-sample`;
  return <Dialog className="project-dialog" title="New Project" onClose={onClose} footer={<><button className="client-primary" type="submit" form="new-project-form" disabled={form.pending}>{form.pending ? "Creating Project…" : "Create Project"}</button><p className="project-dialog-support">Have questions? <Link to="/support">Contact Support</Link></p></>}><form id="new-project-form" noValidate onCompositionStart={() => { composing.current = true; }} onCompositionEnd={() => { composing.current = false; }} onKeyDown={handleKeyDown} onSubmit={handleSubmit}>
    {initial.origin !== "client" && <div className="project-client-field"><ProjectClientPicker data={clients.data} value={form.draft.clientId} disabled={form.pending} errorId={invalid === "clientId" ? errorId : undefined} onChange={clientId => form.setDraft(value => ({ ...value, clientId }))} onNew={openClient} />{sample && <p className="project-sample-note">This is your sample client. The proposals, contracts and invoices sent for this project will automatically be accepted or paid.<span className="sr-only">Recorded demonstration text only. This preview does not accept documents or make payments.</span></p>}</div>}
    <label className="project-title-field">Project Title<input name="name" aria-invalid={invalid === "name" || undefined} aria-describedby={invalid === "name" ? errorId : undefined} maxLength={200} placeholder={initial.origin === "client" ? "Design Project" : "Consulting Project"} value={form.draft.name} disabled={form.pending} onChange={event => { const name = event.currentTarget.value; form.setDraft(value => ({ ...value, name })); }} /></label><div className="project-team-field"><span>Project Team</span><p><span className="project-member-avatar">{member?.name.replace(/\(preview\)/g, "").trim().split(/\s+/).slice(0, 2).map(word => word[0]?.toUpperCase()).join("")}</span>{member?.name ?? "Team unavailable"}</p></div>{form.error && <p id={errorId} className="client-error" role="alert">{form.error}</p>}
  </form></Dialog>;
}
