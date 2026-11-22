import { Link } from "react-router-dom";
import { Plus, Trash2 } from "lucide-react";
import { useProjectMembers } from "../hooks/use-project-members";
import type { ProjectView } from "../model/project-types";
// 기능 : 같은 팀 멤버/배정 ID를 프로젝트에서 조회하고 초대는 기존 G17 경로로 인계한다.
export function ProjectTeamPanel({ project, onUnavailable }: { project: ProjectView; onUnavailable: (name: string) => void }) {
  const members = useProjectMembers(project);
  return <div className="project-team-layout"><section><div className="client-panel-title"><h2>Project Team</h2><Link className="client-round" to="/app/settings/team" aria-label="Invite project team through workspace team"><Plus /></Link></div><div className="project-members">{members.length === 0 ? <p>No project members.</p> : members.map(member => <div key={member.id} data-member-id={member.id}><span className="project-member-avatar">{member.name.slice(0, 2).toUpperCase()}</span><div><strong>{member.name}</strong><span>{member.email}</span></div><button aria-label={`Remove project member ${member.name}`} onClick={() => onUnavailable("Project member removal")}><Trash2 size={16} /></button></div>)}</div></section><aside><h2>Project Collaborators</h2><p>Invite collaborators to your projects with limited access and functionality.</p><p>Collaborators do not have access to your company data or any of the documents on this project.</p><Link to="/app/settings/team">See Details</Link></aside></div>;
}
