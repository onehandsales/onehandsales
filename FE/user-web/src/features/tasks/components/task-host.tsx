import { useEffect, useRef } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Dialog } from "@/components/ui/dialog";
import { useProjects } from "@/features/projects";
import { useTasks } from "../hooks/use-tasks";
import { newTaskDraft } from "../model/task-values";
import { taskStatuses } from "../model/task-types";
import type { Task, TaskStatus } from "../model/task-types";
import { TaskPanel } from "./task-panel";
// 기능 : 작업 query를 접근 가능한 같은 원본에 연결하고 직접 URL·뒤로/앞으로·닫기를 실제 이력으로 처리한다.
export function TaskHost() { const [params, setParams] = useSearchParams(); const location = useLocation(); const navigate = useNavigate(); const query = useTasks(); const projects = useProjects(); const id = params.get("task") ?? ""; const projectId = params.get("taskProject") ?? ""; const candidate = params.get("taskStatus") as TaskStatus; const status = taskStatuses.includes(candidate) ? candidate : "To Do";
  const closeRef = useRef(close);
  // 기능 : 삭제 결과 처리에서는 가장 최근 이력 닫기를 사용한다.
  useEffect(function updateClose() { closeRef.current = close; });
  const seenRemoval = useRef(query.state.lifecycle?.sequence);
  // 기능 : 열린 대상이 방금 보관·삭제되면 원래 이력으로 닫되 이미 없는 ID의 새 진입은 안내를 유지한다.
  useEffect(function closeRemovedTarget() {
    const result = query.state.lifecycle; if (!result || result.sequence === seenRemoval.current) return; seenRemoval.current = result.sequence;
    if (result.id === id) closeRef.current();
  }, [query.state.lifecycle, id]);
  // 기능 : 패널 진입 이력이 있으면 원래 화면으로 돌아가고 직접 URL은 관련 query만 제거한다.
  function close() { if ((location.state as { taskPanelEntry?: boolean } | null)?.taskPanelEntry) { void navigate(-1); return; } const next = new URLSearchParams(params); for (const key of ["task", "taskProject", "taskStatus"]) next.delete(key); void setParams(next, { replace: true, preventScrollReset: true }); }
  // 기능 : 첫 저장 이후 같은 이력의 초안 URL을 실제 작업 ID로 교체한다.
  function created(task: Task) { const next = new URLSearchParams(params); next.set("task", task.id); next.delete("taskProject"); next.delete("taskStatus"); void setParams(next, { replace: true, preventScrollReset: true, state: location.state }); }
  if (query.isError || projects.isError || !query.data || !projects.data) return <Dialog title="Task details" onClose={close}>{query.isError || projects.isError ? <div role="alert"><p>{query.error?.message ?? projects.error?.message}</p><button onClick={() => { void query.refetch(); void projects.refetch(); }}>Retry task details</button></div> : <p role="status">Preparing task…</p>}</Dialog>;
  if (query.state.scenario === "denied" || projects.state.scenario === "denied") return <Dialog title="Task access restricted" onClose={close}><p>Tasks are unavailable in this local access scenario.</p><button onClick={close}>Return to tasks</button></Dialog>;
  const current = id === "new" ? null : query.store.current(query.scope, id); const invalid = id !== "new" && !current || id === "new" && projectId && !projects.data.some(project => project.id === projectId);
  if (invalid || query.state.scenario === "empty") return <Dialog title="Task unavailable" onClose={close}><p>This task or project is unavailable or outside your assigned scope. The empty preview is read-only.</p><button onClick={close}>Return to tasks</button></Dialog>;
  return <TaskPanel key={id} initial={current ?? newTaskDraft(projectId, status)} existing={current} projects={projects.data} onCreated={created} onClose={close} />;
}
