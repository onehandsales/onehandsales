import { invitationPath } from "@/features/team";
import { useInvitation } from "@/features/invitations";
import { Link, useParams } from "react-router-dom";
import { useTeamStore } from "@/features/team";
import { AuthTools } from "@/features/mock-auth";
import { usePreviewEnvironment } from "@/features/preview";
import { InvitationForm } from "@/features/invitations";
import "@/styles/invitations.css";
// 기능 : 초대 ID별 접근 상태를 조합하고 세션·시나리오 변경 때 이전 계정 입력을 폐기한다.
export function InvitationPage() {
  const { workspaceId = "", invitationId = "" } = useParams(); const { store, state: team } = useTeamStore(); const { state } = usePreviewEnvironment();
  const target = store.invitation(workspaceId, invitationId); const form = useInvitation(target);
  return <main className="invitation-page" id="main-content"><Link className="invitation-logo" to="/" aria-label="Bonsai home"><img src="/bonsai-auth/logo.png" alt="bonsai" /></Link><section className="invitation-card"><h1>Welcome to Bonsai.</h1><p>Joe Studio uses Bonsai to collaborate on projects.<br />Create your account below to get started.</p>
    {target?.status === "pending" ? <InvitationForm target={target} form={form} /> : <div className="invitation-unavailable"><h2>{target?.status === "joined" ? "Invitation already accepted" : target?.status === "expired" ? "Invitation expired" : "Invitation unavailable"}</h2><p>{target ? "This local invitation cannot be used again." : "This invitation was removed or is not available in this preview."}</p><Link to={state.session ? "/app" : "/login"}>Continue to your account</Link><Link to="/">Return to public site</Link></div>}
    </section>{target?.status === "pending" && <div className="invitation-alternatives"><Link to={"/login?returnTo=" + encodeURIComponent(invitationPath(target.workspaceId, target.id, true))}>Already have a local account? Log in</Link><Link to="/" onClick={form.cancel}>Cancel invitation</Link></div>}<details className="invitation-tools"><summary>Invitation preview controls</summary><p>Local sample only. Passwords use the G10 sample rule (10–128 characters). No email is sent. Reload restores seed invitations; logout preserves saved members in this tab.</p><AuthTools /><label>Invitation status<select value={team.scenario === "expired" ? "expired" : "normal"} onChange={event => store.setScenario(event.currentTarget.value === "expired" ? "expired" : "normal")}><option value="normal">Normal</option><option value="expired">Expired (mock)</option></select></label></details></main>;
}
