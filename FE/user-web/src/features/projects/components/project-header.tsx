import { Link } from "react-router-dom";
import { ProjectStagePicker } from "./project-stage-picker";
import { ProjectActionMenu } from "./project-action-menu";
import { ProjectNameEditor } from "./project-name-editor";
import type { ProjectView } from "../model/project-types";
import { projectTabs } from "../model/project-tabs";
import type { ProjectTab } from "../model/project-tabs";
// 기능 : 같은 프로젝트의 제목·고객·단계와 URL 기반 상세 탭을 공통 헤더에 조합한다.
export function ProjectHeader({ project, tab, onTab, onUnavailable, onUpdated }: { project: ProjectView; tab: ProjectTab; onTab: (tab: ProjectTab) => void; onUnavailable: (name: string) => void; onUpdated: () => void }) {
  return <header className="project-detail-heading"><div className="project-title-row"><ProjectNameEditor project={project} onSaved={onUpdated} /><ProjectStagePicker project={project} /><ProjectActionMenu name={project.name} width={200} label="Project actions" actions={["Preview as Client", "Preview as Collaborator", "Mark Completed", "Archive", "Delete"].map(label => ({ label, run: () => onUnavailable(label) }))} /></div><div className="project-context-row"><Link to={`/app/clients/${encodeURIComponent(project.clientId)}`}><span className="project-member-avatar" aria-hidden="true">{project.clientName.split(/\s+/).slice(0, 2).map(name => name[0]).join("")}</span>{project.clientName}</Link><button onClick={() => onUnavailable("Automations")}>⚒ Automations</button><span className="project-people">AL <button aria-label="Add project team" onClick={() => onTab("Team")}>＋</button></span></div><nav aria-label="Project sections">{projectTabs.map(name => <button key={name} aria-current={name === tab ? "page" : undefined} onClick={() => onTab(name)}>{name}</button>)}</nav></header>;
}
