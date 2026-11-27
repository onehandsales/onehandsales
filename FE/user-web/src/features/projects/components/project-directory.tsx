import { useEffect, useRef, useState, type ChangeEvent, type CompositionEvent } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { ListFilter, Search } from "lucide-react";
import type { ProjectView } from "../model/project-types";
import { readProjectView, selectProjectViews } from "../model/project-view";
import { ProjectBoard } from "./project-board";
import { ProjectTable } from "./project-table";
import { ProjectFilters } from "./project-filters";
import { ProjectCreateLink } from "./project-create-link";
// 기능 : 보드·표가 같은 검색/필터/정렬 URL을 사용하게 하고 초안 필터를 저장 데이터와 분리한다.
export function ProjectDirectory({ projects, onUnavailable }: { projects: ProjectView[]; onUnavailable: (title: string) => void }) {
  const [params] = useSearchParams(); const location = useLocation(); const navigate = useNavigate(); const options = readProjectView(params); const [filters, setFilters] = useState(false); const visible = selectProjectViews(projects, options); const filtered = !!(options.search || options.stage || options.clientId);
  const [draft, setDraft] = useState<{ entry: string; value: string } | null>(null); const compositionEntry = useRef<string | null>(null); const inputValue = draft?.entry === location.key ? draft.value : options.search;
  // 기능 : 이력을 떠난 검색 조합과 적용하지 않은 필터 초안을 함께 폐기한다.
  useEffect(function discardMovedDrafts() { setDraft(null); compositionEntry.current = null; setFilters(false); }, [location.key]);
  // 기능 : 조회 변경은 일회성 생성 안내만 소비하고 외부 query·hash·상태를 보존하며 동일 값은 이력을 만들지 않는다.
  function update(values: Record<string, string>, replace = false) { const next = new URLSearchParams(params); for (const [key, value] of Object.entries(values)) { if (value) next.set(key, value); else next.delete(key); } if (next.toString() === params.toString()) return; const state = { ...location.state }; delete state.createdProjectId; delete state.createdStage; void navigate({ pathname: location.pathname, search: next.toString(), hash: location.hash }, { replace, preventScrollReset: true, state }); }
  // 기능 : 조합 중 검색은 현재 이력의 초안에만 두고 일반 입력만 URL에 반영한다.
  function changeSearch(event: ChangeEvent<HTMLInputElement>) { const value = event.currentTarget.value; setDraft({ entry: location.key, value }); if (compositionEntry.current !== location.key) update({ q: value }, true); }
  // 기능 : 현재 이력에서 확정한 조합만 검색하고 이동 전의 늦은 조합 완료는 버린다.
  function finishComposition(event: CompositionEvent<HTMLInputElement>) { if (compositionEntry.current !== location.key) return; compositionEntry.current = null; setDraft(null); update({ q: event.currentTarget.value }, true); }
  // 기능 : 현재 정렬 제목은 방향을 바꾸고 새 정렬 제목은 오름차순으로 시작한다.
  function sort(key: "title" | "start") { update({ sort: key, dir: options.sort === key && options.direction === "asc" ? "desc" : "asc" }); }
  return <><header className="clients-heading"><h1>Projects</h1><nav aria-label="Project views"><button aria-current={options.view === "board" ? "page" : undefined} onClick={() => { if (options.view !== "board") update({ view: "board" }); }}>Board View</button><button aria-current={options.view === "list" ? "page" : undefined} onClick={() => { if (options.view !== "list") update({ view: "list" }); }}>List View</button></nav></header><div className="projects-body"><div className="project-list-tools"><label className="client-search"><Search size={18} aria-hidden="true" /><input aria-label="Search projects" placeholder="Search..." value={inputValue} onChange={changeSearch} onCompositionStart={() => { compositionEntry.current = location.key; }} onCompositionEnd={finishComposition} /></label><button className="project-filter" aria-pressed={!!(options.stage || options.clientId)} onClick={() => setFilters(true)}><ListFilter size={17} aria-hidden="true" />Filters{(options.stage || options.clientId) && <span> •</span>}</button>{filtered && <button className="client-text-action" onClick={() => update({ q: "", stage: "", client: "" })}>Clear search and filters</button>}<ProjectCreateLink className="client-primary">New Project</ProjectCreateLink></div>{!visible.length && <p role="status" className="project-no-results">{filtered ? "No matching projects." : "No projects yet."}</p>}{options.view === "board" ? <ProjectBoard key={location.key} projects={visible} onUnavailable={onUnavailable} /> : <ProjectTable key={location.key} projects={visible} options={options} onSort={sort} onUnavailable={onUnavailable} />}</div>{filters && <ProjectFilters stage={options.stage} clientId={options.clientId} projects={projects} onClose={() => setFilters(false)} onApply={(stage, client) => { setFilters(false); update({ stage, client }); }} />}</>;
}
