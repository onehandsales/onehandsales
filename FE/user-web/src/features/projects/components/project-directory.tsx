import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ListFilter, Search } from "lucide-react";
import type { ProjectView } from "../model/project-types";
import { readProjectView, selectProjectViews } from "../model/project-view";
import { ProjectBoard } from "./project-board";
import { ProjectTable } from "./project-table";
import { ProjectFilters } from "./project-filters";
import { ProjectCreateLink } from "./project-create-link";
// 기능 : 보드·표가 같은 검색/필터/정렬 URL을 사용하게 하고 초안 필터를 저장 데이터와 분리한다.
export function ProjectDirectory({ projects, onUnavailable }: { projects: ProjectView[]; onUnavailable: (title: string) => void }) {
  const [params, setParams] = useSearchParams(); const options = readProjectView(params); const [filters, setFilters] = useState(false); const visible = selectProjectViews(projects, options); const filtered = !!(options.search || options.stage || options.clientId);
  // 기능 : 변경한 조회 키만 갱신하고 검색 입력은 이력을 쌓지 않는다.
  function update(values: Record<string, string>, replace = false) { const next = new URLSearchParams(params); for (const [key, value] of Object.entries(values)) { if (value) next.set(key, value); else next.delete(key); } void setParams(next, { replace, preventScrollReset: true }); }
  // 기능 : 현재 정렬 제목은 방향을 바꾸고 새 정렬 제목은 오름차순으로 시작한다.
  function sort(key: "title" | "start") { update({ sort: key, dir: options.sort === key && options.direction === "asc" ? "desc" : "asc" }); }
  return <><header className="clients-heading"><h1>Projects</h1><nav aria-label="Project views"><button aria-current={options.view === "board" ? "page" : undefined} onClick={() => { if (options.view !== "board") update({ view: "board" }); }}>Board View</button><button aria-current={options.view === "list" ? "page" : undefined} onClick={() => { if (options.view !== "list") update({ view: "list" }); }}>List View</button></nav></header><div className="projects-body"><div className="project-list-tools"><label className="client-search"><Search size={18} aria-hidden="true" /><input aria-label="Search projects" placeholder="Search..." value={options.search} onChange={event => update({ q: event.currentTarget.value }, true)} /></label><button className="project-filter" aria-pressed={!!(options.stage || options.clientId)} onClick={() => setFilters(true)}><ListFilter size={17} aria-hidden="true" />Filters{(options.stage || options.clientId) && <span> •</span>}</button>{filtered && <button className="client-text-action" onClick={() => update({ q: "", stage: "", client: "" })}>Clear search and filters</button>}<ProjectCreateLink className="client-primary">New Project</ProjectCreateLink></div>{!visible.length && <p role="status" className="project-no-results">{filtered ? "No matching projects." : "No projects yet."}</p>}{options.view === "board" ? <ProjectBoard projects={visible} onUnavailable={onUnavailable} /> : <ProjectTable projects={visible} options={options} onSort={sort} onUnavailable={onUnavailable} />}</div>{filters && <ProjectFilters stage={options.stage} clientId={options.clientId} projects={projects} onClose={() => setFilters(false)} onApply={(stage, client) => { setFilters(false); update({ stage, client }); }} />}</>;
}
