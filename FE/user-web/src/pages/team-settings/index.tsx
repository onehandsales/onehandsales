import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { Dialog } from "@/components/ui/dialog";
import { SettingsNavigation } from "@/features/company-settings/components/settings-navigation";
import { useTeam, InviteDialog, RemoveDialog, TeamTable, TeamTools } from "@/features/team";
import type { TeamRow } from "@/features/team";
import "@/styles/company-settings.css";
import "@/styles/team-settings.css";
// 기능 : 설정 Team 목록과 query 기반 초대·행별 제거 확인을 기존 앱 셸 안에 조합한다.
export function TeamSettingsPage() {
  const team = useTeam(); const [search, setSearch] = useSearchParams(); const location = useLocation(); const [target, setTarget] = useState<TeamRow | null>(null); const [notice, setNotice] = useState(""); const [unavailable, setUnavailable] = useState(""); const inviteLink = useRef<HTMLAnchorElement>(null);
  const inviteOpen = search.get("invite") === "1"; const contextKey = `${team.scope?.revision}:${team.state.scenario}:${team.scope ? team.store.fixture(team.scope.workspaceId) : ""}`;
  // 기능 : 탐색이나 검증 문맥 변경 시 이전 행·안내 상태를 폐기한다.
  useEffect(function clearContext() { setTarget(null); setUnavailable(""); }, [contextKey, location.key]);
  // 기능 : 팀 문맥 변경 시 이전 작업의 성공 안내를 폐기한다.
  useEffect(function clearNotice() { setNotice(""); }, [contextKey]);
  // 기능 : 초대 모달 닫기는 현재 이력의 query만 제거하고 원래 뒤로 복귀 경로를 보존한다.
  function closeInvite() { const next = new URLSearchParams(search); next.delete("invite"); void setSearch(next, { replace: true, preventScrollReset: true }); window.requestAnimationFrame(() => inviteLink.current?.focus()); }
  // 기능 : 목록 갱신과 성공 표시를 함께 제공하고 제거된 행 대신 살아 있는 초대 제어로 복귀한다.
  function removed() { setTarget(null); setNotice("Team member removed."); window.requestAnimationFrame(() => inviteLink.current?.focus()); }
  const inviteQuery = new URLSearchParams(search); inviteQuery.set("invite", "1");
  return <section className="company-settings team-settings" data-team-fixture={team.scope ? team.store.fixture(team.scope.workspaceId) : "inviting"}><SettingsNavigation /><div className="team-content"><div className="team-heading"><h2 className="sr-only">Team</h2>{team.canEdit ? <Link ref={inviteLink} className="team-primary" to={{ pathname: location.pathname, search: inviteQuery.toString() }} preventScrollReset>Invite Member</Link> : <button type="button" className="team-primary" disabled>Invite Member</button>}</div>
    {!team.canEdit && !team.denied && <p className="team-readonly" role="status">{team.state.scenario === "empty" ? "Empty preview. Choose Normal to restore the local team." : "This local member can view the team. Only the owner can change invitations."}</p>}
    {team.loading ? <p role="status" className="team-read-state">Loading team…</p> : team.error ? <div role="alert" className="team-read-state"><h3>{team.denied ? "Team access unavailable" : "Team could not be loaded"}</h3><p>{team.error}</p><button type="button" onClick={team.reload}>Retry team</button></div> : team.rows.length === 0 ? <p role="status" className="team-read-state">No team members to display.</p> : <TeamTable rows={team.rows} canEdit={team.canEdit} onRemove={setTarget} onUnavailable={setUnavailable} />}
    </div>{team.scope && <TeamTools store={team.store} state={team.state} scope={team.scope} owner={team.owner} />}
    {inviteOpen && team.scope && team.canEdit && <InviteDialog key={contextKey + location.key} store={team.store} scope={team.scope} onClose={closeInvite} onSuccess={() => { closeInvite(); setNotice("Invite sent."); }} />}
    {inviteOpen && !team.canEdit && <Dialog title="Invitation unavailable" onClose={closeInvite}><p>Inviting is unavailable in this local role or preview state.</p><button type="button" onClick={closeInvite}>Return to team</button></Dialog>}
    {target && team.scope && team.canEdit && <RemoveDialog key={contextKey + target.id} store={team.store} scope={team.scope} target={target} onClose={() => setTarget(null)} onSuccess={removed} />}
    {unavailable && <Dialog title={unavailable} onClose={() => setUnavailable("")}><p>This action’s result is not available in the recorded preview. The team is unchanged and no email has been sent.</p><button type="button" onClick={() => setUnavailable("")}>Return to team</button></Dialog>}
    {notice && <div role="status" className="company-save-notice team-notice"><span aria-hidden="true">✓</span>{notice}<button type="button" aria-label="Dismiss team message" onClick={() => setNotice("")}>×</button></div>}
  </section>;
}
