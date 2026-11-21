import { Dialog } from "@/components/ui/dialog";
import type { PreviewScope } from "@/features/preview/model/preview-types";
import type { TeamRow, TeamStore } from "../model/team-types";
import { useTeamAction } from "../hooks/use-team-action";
// 기능 : 선택한 대기 초대 snapshot을 확인하고 실패 후에도 같은 대상만 다시 제거한다.
export function RemoveDialog({ store, scope, target, onClose, onSuccess }: { store: TeamStore; scope: PreviewScope; target: TeamRow; onClose: () => void; onSuccess: () => void }) {
  const action = useTeamAction();
  return <Dialog className="team-dialog team-remove-dialog" title="Confirm Removal" onClose={onClose}><div className="team-remove-body"><p>Removing <strong>{target.email}</strong> from your team will revoke their access to all projects and documents.</p>{action.error && <p role="alert" className="team-error">{action.error}</p>}<button type="button" className="team-danger" disabled={action.pending} onClick={() => void action.run(signal => store.remove(scope, target, signal), onSuccess)}>{action.pending ? "Removing…" : "Remove Member"}</button></div></Dialog>;
}
