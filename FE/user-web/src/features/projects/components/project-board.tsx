import { useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { ProjectCreateLink } from "./project-create-link";
import { projectStages } from "../model/project-types";
import type { ProjectView } from "../model/project-types";
// 기능 : 생성 결과와 단계별 건수를 같은 프로젝트 ID로 표시하고 해당 열 생성 문맥을 전달한다.
export function ProjectBoard({ projects }: { projects: ProjectView[] }) { const root = useRef<HTMLDivElement>(null); const location = useLocation();
  // 기능 : 생성 직후 실제 카드가 준비되면 해당 단계가 보이도록 가로 위치를 맞춘다.
  useEffect(function revealCreated() { const id = (location.state as { createdProjectId?: string } | null)?.createdProjectId; const node = Array.from(root.current?.querySelectorAll<HTMLElement>("[data-project-id]") ?? []).find(node => node.dataset.projectId === id); if (node && root.current) root.current.scrollLeft = Math.max(0, node.offsetLeft - root.current.offsetLeft - 440); }, [location.key, location.state, projects]);
  return <div className="project-board" ref={root} role="region" aria-label="Project board" tabIndex={0}>{projectStages.map((stage, index) => { const items = projects.filter(project => project.stage === stage); return <section className="project-column" key={stage} aria-label={stage}><div className="project-column-heading"><h2 className={`project-stage stage-${index}`}><span aria-hidden="true">●</span>{stage}</h2><span>{items.length}</span></div>{items.map(project => <Link className="project-card" key={project.id} data-project-id={project.id} to={`/app/projects/${encodeURIComponent(project.id)}`}><strong>{project.name}</strong><span>{project.clientName}</span></Link>)}<ProjectCreateLink stage={stage} className="project-column-add" label={`New project in ${stage}`}>＋ New Project</ProjectCreateLink></section>; })}</div>;
}
