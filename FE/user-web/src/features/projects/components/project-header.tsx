import { Plus } from "lucide-react";
import { useProjectMembers } from "../hooks/use-project-members";
import { Link } from "react-router-dom";
import { ProjectStagePicker } from "./project-stage-picker";
import { ProjectActionMenu } from "./project-action-menu";
import { ProjectNameEditor } from "./project-name-editor";
import type { ProjectView } from "../model/project-types";
import { projectTabs } from "../model/project-tabs";
import type { ProjectTab } from "../model/project-tabs";
// 기능 : 같은 프로젝트의 제목·고객·단계와 URL 기반 상세 탭을 공통 헤더에 조합한다.
export function ProjectHeader({ project, tab, onTab, onUnavailable, onUpdated }: { project: ProjectView; tab: ProjectTab; onTab: (tab: ProjectTab) => void; onUnavailable: (name: string) => void; onUpdated: () => void }) {
  const members = useProjectMembers(project); const firstMember = members[0];
  return <header className="project-detail-heading"><div className="project-title-row"><ProjectNameEditor project={project} onSaved={onUpdated} /><ProjectStagePicker project={project} /><ProjectActionMenu name={project.name} width={200} label="Project actions" actions={["Preview as Client", "Preview as Collaborator", "Mark Completed", "Archive", "Delete"].map(label => ({ label, run: () => onUnavailable(label) }))} /></div><div className="project-context-row"><Link to={`/app/clients/${encodeURIComponent(project.clientId)}`}><span className="project-member-avatar" aria-hidden="true">{project.clientName.split(/\s+/).slice(0, 2).map(name => name[0]).join("")}</span>{project.clientName}</Link><button onClick={() => onUnavailable("Automations")}><svg aria-hidden="true" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 18V3m-3 3 3-3 3 3M10 18v-6a5 5 0 0 0-5-5H3m3-3L3 7l3 3" /></svg>Automations</button><span className="project-people">{firstMember && <span className="project-member-avatar" title={firstMember.name}>{firstMember.name.slice(0, 2).toUpperCase()}</span>}<button aria-label="Add project team" onClick={() => onTab("Team")}><Plus size={20} /></button></span></div><nav aria-label="Project sections">{projectTabs.map(name => <button key={name} aria-current={name === tab ? "page" : undefined} onClick={() => onTab(name)}>{name}</button>)}</nav></header>;
}
