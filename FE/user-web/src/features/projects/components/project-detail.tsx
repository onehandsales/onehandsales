import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useNavigationType, useSearchParams } from "react-router-dom";
import { ProjectHeader } from "./project-header";
import { projectTabs } from "../model/project-tabs";
import type { ProjectTab } from "../model/project-tabs";
import { ProjectOverview } from "./project-overview";
import { ProjectSettingsForm } from "./project-settings-form";
import { ProjectTimePanel } from "./project-time-panel";
import { ProjectTeamPanel } from "./project-team-panel";
import type { ProjectView } from "../model/project-types";
// 기능 : 같은 프로젝트의 URL 탭·설정 저장·개요 복귀를 조합하고 후속 업무와의 경계를 표시한다.
export function ProjectDetail({ project, onUnavailable, onUpdated, taskBoard, taskSummary, taskNames, onTask }: { project: ProjectView; onUnavailable: (name: string) => void; onUpdated: () => void; taskBoard: ReactNode; taskSummary: ReactNode; taskNames: Record<string, string>; onTask: (id: string) => void }) {
  const [search] = useSearchParams(); const location = useLocation(); const navigate = useNavigate(); const navigationType = useNavigationType(); const [updatedEntry, setUpdatedEntry] = useState(""); const [dismissedEntry, setDismissedEntry] = useState(""); const raw = search.get("tab") ?? "Overview"; const tab = projectTabs.includes(raw as ProjectTab) ? raw as ProjectTab : null;
  const state = location.state as Record<string, unknown> | null;
  const updated = updatedEntry === location.key || (state?.updatedProjectId === project.id && navigationType !== "POP");
  // 기능 : 다른 이력에서 이전 이름 저장 알림을 다시 표시하지 않는다.
  useEffect(function clearPreviousUpdate() { setUpdatedEntry(""); }, [location.key]);
  // 기능 : 프로젝트 탭만 바꾸고 외부 복귀 문맥은 보존하며 이전 일회성 알림은 전달하지 않는다.
  function changeTab(nextTab: ProjectTab, updated = false) { const next = new URLSearchParams(search); next.set("tab", nextTab); const nextState = { ...state }; delete nextState.createdProjectId; delete nextState.updatedProjectId; if (updated) nextState.updatedProjectId = project.id; void navigate({ pathname: location.pathname, search: `?${next}`, hash: location.hash }, { state: nextState }); }
  // 기능 : 탭 선택은 실제 URL 이력에 남기고 편집 초안은 해당 화면 이탈로 폐기한다.
  function select(nextTab: ProjectTab) { if (nextTab !== tab) changeTab(nextTab); }
  // 기능 : 전체 설정 저장 성공 때 개요로 이동하고 저장 안내를 표시한다.
  function saved() { onUpdated(); changeTab("Overview", true); }
  // 기능 : 생성 안내를 소비한 뒤 현재 이력에 이름 저장 안내만 표시한다.
  function nameSaved() { onUpdated(); setDismissedEntry(""); setUpdatedEntry(location.key); }
  return <><ProjectHeader key={`header:${location.key}`} project={project} tab={tab ?? "Overview"} onTab={select} onUnavailable={onUnavailable} onUpdated={nameSaved} />{tab === "Overview" ? <ProjectOverview project={project} onUnavailable={onUnavailable} taskSummary={taskSummary} /> : tab === "Settings" ? <ProjectSettingsForm key={`settings:${location.key}`} project={project} onSaved={saved} onCancel={() => select("Overview")} /> : tab === "Tasks" ? taskBoard : tab === "Time Tracking" ? <ProjectTimePanel project={project} onUnavailable={onUnavailable} taskNames={taskNames} onTask={onTask} /> : tab === "Team" ? <ProjectTeamPanel project={project} onUnavailable={onUnavailable} /> : <section className="project-tab-pending"><h2>{tab ?? "Project section unavailable"}</h2><p>{tab === "Invoices" ? "Invoice management is not available in this preview yet." : "Choose an available project section."}</p><button className="client-text-action" onClick={() => select("Overview")}>Return to overview</button></section>}{updated && dismissedEntry !== location.key && <div className="client-notice project-updated-notice" role="status">✓ Your project has been successfully updated.<button aria-label="Dismiss project update" onClick={() => { setUpdatedEntry(""); setDismissedEntry(location.key); }}>×</button></div>}</>;
}
