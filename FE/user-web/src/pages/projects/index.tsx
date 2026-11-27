import { TaskBoard, TaskTools, ProjectTaskSummary, useTasks } from "@/features/tasks";
import "@/styles/tasks.css";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigationType, useParams, useSearchParams } from "react-router-dom";
import { Dialog } from "@/components/ui/dialog";
import { invitationAccess, usePreviewEnvironment } from "@/features/preview";
import { CollaborationProject, CollaborationProjects } from "@/features/invitations";
import { ProjectActivity, ProjectDirectory, ProjectDetail, ProjectTools, useProjects, ProjectTimePanel, projectDuration, projectTimeSummary } from "@/features/projects";
import "@/styles/projects.css";
import "@/styles/collaboration.css";
// 기능 : 고객·전체·초대 접근의 같은 프로젝트 원본을 실제 경로에 조합한다.
export function ProjectsPage() {
  const query = useProjects(); const tasks = useTasks(); const [params, setParams] = useSearchParams(); const { projectId } = useParams(); const { state } = usePreviewEnvironment(); const access = invitationAccess(state); const location = useLocation(); const [notice, setNotice] = useState(""); const [dismissed, setDismissed] = useState("");
  // 기능 : 경로를 떠나면 이전 화면의 인계 안내를 닫는다.
  useEffect(function closeNotice() { setNotice(""); }, [location.key]);
  const project = query.data?.find(item => item.id === projectId);
  // 기능 : 시간 행도 동일 작업 ID의 패널을 열고 원래 탭 이력으로 복귀한다.
  function openTask(id: string) { const next = new URLSearchParams(params); next.set("task", id); void setParams(next, { state: { taskPanelEntry: true }, preventScrollReset: true }); }
  const taskNames = Object.fromEntries((tasks.data ?? []).map(task => [task.id, task.title]));
  const taskBoard = project ? <TaskBoard projectId={project.id} /> : null;
  const taskSummary = project ? <ProjectTaskSummary projectId={project.id} onTemplates={() => setNotice("Task templates")} /> : null;
  const navigationType = useNavigationType();
  const created = (location.state as { createdProjectId?: string } | null)?.createdProjectId;
  // 기능 : 프로젝트 수정 성공은 이전 생성 알림을 대체하고 닫은 뒤에도 재생하지 않는다.
  function consumeCreationNotice() { if (created) setDismissed(created); }
  const accepted = (location.state as { invitationAccepted?: string } | null)?.invitationAccepted;
  return <section className="projects-page">{query.isPending ? <p role="status" className="clients-read-state">Loading projects…</p> : query.isError ? <div className="clients-read-state" role="alert"><h1>Projects unavailable</h1><p>{query.error.message}</p><button onClick={() => void query.refetch()}>Retry projects</button></div> : projectId ? project ? access ? <CollaborationProject project={project} taskBoard={taskBoard} taskSummary={taskSummary} unbilled={projectDuration(project.recordedOverview?.unbilledSeconds ?? projectTimeSummary(project).seconds)} billed={projectDuration(project.recordedOverview?.billedSeconds ?? 0)} activity={<ProjectActivity project={project} />} timePanel={<ProjectTimePanel project={project} onUnavailable={setNotice} taskNames={taskNames} onTask={openTask} restricted />} /> : <ProjectDetail key={`${query.scope.actorId}:${query.scope.workspaceId}:${query.scope.revision}:${project.id}`} project={project} onUnavailable={setNotice} onUpdated={consumeCreationNotice} taskBoard={taskBoard} taskSummary={taskSummary} taskNames={taskNames} onTask={openTask} /> : <div className="clients-read-state"><h1>Project unavailable</h1><p>This project is missing or outside your assigned workspace scope.</p><Link to="/app/projects">Return to projects</Link></div> : access ? <CollaborationProjects key={location.key} projects={query.data} /> : <ProjectDirectory key={`${query.scope.actorId}:${query.scope.workspaceId}:${query.scope.revision}`} projects={query.data} onUnavailable={setNotice} />}
    {!access && <ProjectTools />}{project && <TaskTools />}{notice && <Dialog title={notice} onClose={() => setNotice("")}><p>This action is not available in this preview. Your project remains unchanged.</p><button onClick={() => setNotice("")}>Return to project</button></Dialog>}
    {created && query.data?.some(item => item.id === created) && (!projectId || projectId === created) && created !== dismissed && navigationType !== "POP" && <div className="client-notice" role="status">✓ Project created successfully<button aria-label="Dismiss project message" onClick={() => setDismissed(created)}>×</button></div>}
    {access && accepted === access.teamRowId && accepted !== dismissed && <div className="collaboration-notice" role="status">✓ Your password was set successfully. You are now signed in.<button aria-label="Dismiss invitation message" onClick={() => setDismissed(accepted)}>×</button></div>}
  </section>;
}
