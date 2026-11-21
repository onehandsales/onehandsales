import { projectStages } from "./project-types";
import type { ProjectStage, ProjectView } from "./project-types";
export type ProjectViewOptions = { view: "board" | "list"; search: string; stage: ProjectStage | ""; clientId: string; sort: "title" | "start"; direction: "asc" | "desc" };
// 기능 : 직접 URL에서도 허용된 조회 조건만 읽고 원본 데이터 변경과 분리한다.
export function readProjectView(params: URLSearchParams): ProjectViewOptions { const stage = params.get("stage") as ProjectStage; return { view: params.get("view") === "list" ? "list" : "board", search: params.get("q") ?? "", stage: projectStages.includes(stage) ? stage : "", clientId: params.get("client") ?? "", sort: params.get("sort") === "start" ? "start" : "title", direction: params.get("dir") === "desc" ? "desc" : "asc" }; }
// 기능 : 보드와 표에서 검색·필터의 같은 프로젝트 ID 집합을 사용하고 날짜 없음은 마지막으로 정렬한다.
export function selectProjectViews(projects: ProjectView[], options: ProjectViewOptions) { const q = options.search.trim().toLocaleLowerCase(); const selected = projects.filter(item => (!options.stage || item.stage === options.stage) && (!options.clientId || item.clientId === options.clientId) && `${item.name} ${item.clientName} ${item.tags.map(tag => tag.name).join(" ")}`.toLocaleLowerCase().includes(q)); if (options.view === "board") return selected;
  return selected.sort((a, b) => { if (options.sort === "start" && (!a.startDate || !b.startDate)) return !a.startDate && !b.startDate ? a.id.localeCompare(b.id) : !a.startDate ? 1 : -1; const order = options.sort === "title" ? a.name.localeCompare(b.name, "en", { sensitivity: "base" }) : a.startDate!.localeCompare(b.startDate!); return (options.direction === "asc" ? order : -order) || a.id.localeCompare(b.id); }); }
// 기능 : 금액 minor-unit을 표시하고 Due를 날짜로 해석하지 않는다.
export function projectMoney(minor: number, currency: string) { return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(minor / 100); }
// 기능 : 달력 날짜를 UTC로 고정해 사용자 시간대에 따른 하루 이동을 방지한다.
export function projectDate(value: string | null) { return value ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`)) : "—"; }
