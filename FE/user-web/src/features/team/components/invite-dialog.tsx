import { useRef, useState } from "react";
import type { FormEvent } from "react";
import { Dialog } from "@/components/ui/dialog";
import type { PreviewScope } from "@/features/preview/model/preview-types";
import { inviteError } from "../model/team-types";
import type { InviteDraft, TeamStore } from "../model/team-types";
import { useTeamAction } from "../hooks/use-team-action";
import { ProjectPicker } from "./project-picker";
// 기능 : 초대 입력은 모달에만 보관하고 성공한 Pending 행은 저장소에 명시적으로 생성한다.
export function InviteDialog({ store, scope, onClose, onSuccess }: { store: TeamStore; scope: PreviewScope; onClose: () => void; onSuccess: () => void }) {
  const [draft, setDraft] = useState<InviteDraft>({ email: "", role: "", projectIds: [] }); const action = useTeamAction(); const composing = useRef(false); const [emailTouched, setEmailTouched] = useState(false);
  const emailError = emailTouched && inviteError({ ...draft, role: "Collaborator" });
  // 기능 : 조합 중 Enter와 중복 제출을 제외하고 제출 시점 초안을 고정한다.
  function submit(event: FormEvent) { event.preventDefault(); if (composing.current) return; const error = inviteError(draft); if (error) { action.setError(error); return; } void action.run(signal => store.invite(scope, draft, signal), onSuccess); }
  return <Dialog className="team-dialog team-invite-dialog" title="Invite Member" onClose={onClose} footer={<button type="submit" form="team-invite-form" className="team-primary" disabled={action.pending || !!inviteError(draft)}>{action.pending ? "Inviting…" : draft.role ? "Invite " + draft.role : "Invite Team Member"}</button>}>
    <form id="team-invite-form" className="team-invite-fields" noValidate onSubmit={submit} onCompositionStart={() => { composing.current = true; }} onCompositionEnd={() => { composing.current = false; }} onKeyDown={event => { if (event.key === "Enter" && (event.nativeEvent.isComposing || composing.current)) event.preventDefault(); }}>
      <label>Email<input type="email" autoComplete="off" placeholder="john@yourcompany.com" maxLength={254} value={draft.email} disabled={action.pending} aria-invalid={!!emailError} aria-describedby={emailError ? "team-email-error" : undefined} onBlur={() => setEmailTouched(true)} onChange={event => { setDraft({ ...draft, email: event.currentTarget.value }); action.setError(""); }} /></label>{emailError && <p id="team-email-error" role="alert" className="team-error">{emailError}</p>}
      <label>Role<select className={draft.role ? undefined : "team-select-empty"} value={draft.role} disabled={action.pending} onChange={event => { const role = event.currentTarget.value; if (role === "Collaborator" || role === "Partner" || role === "") { setDraft({ ...draft, role }); action.setError(""); } }}><option value="">Select...</option><option value="Collaborator">Collaborator</option><option value="Partner">Partner</option></select></label>
      <ProjectPicker projects={store.projects(scope.workspaceId)} value={draft.projectIds} all={draft.role === "Partner"} disabled={action.pending} onChange={projectIds => setDraft({ ...draft, projectIds })} />
      {action.error && <p role="alert" className="team-error">{action.error}</p>}
    </form>
  </Dialog>;
}
