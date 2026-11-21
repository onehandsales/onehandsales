import { Link } from "react-router-dom";
import { useBoardScroll } from "../hooks/use-board-scroll";
import { ProjectCreateLink } from "./project-create-link";
import { projectStages } from "../model/project-types";
import type { ProjectView } from "../model/project-types";
// 기능 : 생성 결과와 단계별 건수를 같은 프로젝트 ID로 표시하고 해당 열 생성 문맥을 전달한다.
export function ProjectBoard({ projects, onUnavailable }: { projects: ProjectView[]; onUnavailable: (title: string) => void }) { const root = useBoardScroll(projects);
  return <div className="project-board" ref={root} role="region" aria-label="Project board" tabIndex={0}>{projectStages.map((stage, index) => { const items = projects.filter(project => project.stage === stage); return <section className="project-column" key={stage} aria-label={stage}><div className="project-column-heading"><h2 className={`project-stage stage-${index}`}><span aria-hidden="true">●</span>{stage}</h2><span>{items.length}</span><div className="project-column-actions"><ProjectCreateLink stage={stage} label={`Create in ${stage}`}>＋</ProjectCreateLink><button aria-label={`Column settings for ${stage}`} onClick={() => onUnavailable(`${stage} column settings`)}>•••</button></div></div>{items.map(project => <Link className="project-card" key={project.id} data-project-id={project.id} to={`/app/projects/${encodeURIComponent(project.id)}`}><strong>{project.name}</strong><span>{project.clientName}</span>{project.tags.map(tag => <span className={`project-tag project-tag-${tag.color}`} key={tag.id}>{tag.name}</span>)}</Link>)}<ProjectCreateLink stage={stage} className="project-column-add" label={`New project in ${stage}`}>＋ New Project</ProjectCreateLink></section>; })}</div>;
}
