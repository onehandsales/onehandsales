import type { ReactNode } from "react";
import { useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { ProjectHeader } from "./project-header";
import { projectTabs } from "../model/project-tabs";
import type { ProjectTab } from "../model/project-tabs";
import { ProjectOverview } from "./project-overview";
import { ProjectSettingsForm } from "./project-settings-form";
import { ProjectTimePanel } from "./project-time-panel";
import { ProjectTeamPanel } from "./project-team-panel";
import type { ProjectView } from "../model/project-types";
// 기능 : 같은 프로젝트의 URL 탭·설정 저장·개요 복귀를 조합하고 후속 업무와의 경계를 표시한다.
export function ProjectDetail({ project, onUnavailable, taskBoard, taskSummary, taskNames, onTask }: { project: ProjectView; onUnavailable: (name: string) => void; taskBoard: ReactNode; taskSummary: ReactNode; taskNames: Record<string, string>; onTask: (id: string) => void }) {
  const [search, setSearch] = useSearchParams(); const location = useLocation(); const [updated, setUpdated] = useState(false); const raw = search.get("tab") ?? "Overview"; const tab = projectTabs.includes(raw as ProjectTab) ? raw as ProjectTab : null;
  // 기능 : 탭 선택은 실제 URL 이력에 남기고 편집 초안은 해당 화면 이탈로 폐기한다.
  function select(tab: ProjectTab) { setUpdated(false); const next = new URLSearchParams(search); next.set("tab", tab); void setSearch(next); }
  // 기능 : 전체 설정 저장 성공 때 개요로 이동하고 저장 안내를 표시한다.
  function saved() { const next = new URLSearchParams(search); next.set("tab", "Overview"); void setSearch(next); setUpdated(true); }
  return <><ProjectHeader key={`header:${location.key}`} project={project} tab={tab ?? "Overview"} onTab={select} onUnavailable={onUnavailable} onUpdated={() => setUpdated(true)} />{tab === "Overview" ? <ProjectOverview project={project} onUnavailable={onUnavailable} taskSummary={taskSummary} /> : tab === "Settings" ? <ProjectSettingsForm key={`settings:${location.key}`} project={project} onSaved={saved} onCancel={() => select("Overview")} /> : tab === "Tasks" ? taskBoard : tab === "Time Tracking" ? <ProjectTimePanel project={project} onUnavailable={onUnavailable} taskNames={taskNames} onTask={onTask} /> : tab === "Team" ? <ProjectTeamPanel project={project} onUnavailable={onUnavailable} /> : <section className="project-tab-pending"><h2>{tab ?? "Project section unavailable"}</h2><p>{tab === "Invoices" ? "Invoice management is not available in this preview yet." : "Choose an available project section."}</p><button className="client-text-action" onClick={() => select("Overview")}>Return to overview</button></section>}{updated && <div className="client-notice project-updated-notice" role="status">✓ Your project has been successfully updated.<button aria-label="Dismiss project update" onClick={() => setUpdated(false)}>×</button></div>}</>;
}
