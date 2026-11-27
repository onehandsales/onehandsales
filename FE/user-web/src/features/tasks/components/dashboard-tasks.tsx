import "@/styles/tasks.css";
import { ArrowRight } from "lucide-react";
import { useTasks } from "../hooks/use-tasks";
import { useTaskMutation } from "../hooks/use-task-mutation";
import { taskDueLabel, taskInitials } from "../model/task-values";
import type { TaskView } from "../model/task-types";
import { TaskLink } from "./task-link";
import { TaskActions } from "./task-actions";

// 기능 : 같은 작업 ID의 완료만 변경하고 완료된 행과 관련 시간·하위 작업을 유지한다.
function DashboardTaskRow({ task }: { task: TaskView }) {
  const query = useTasks(); const mutation = useTaskMutation(); const completed = task.status === "Done";
  // 기능 : 클릭 당시 완료 의도를 저장하고 충돌·실패 시 현재 행에서 다시 시도하게 한다.
  function toggle() { void mutation.run(signal => query.store.complete(query.scope, task.id, task.revision, !completed, signal)); }
  return <div className={`dashboard-task-row${completed ? " is-complete" : ""}`} data-dashboard-task-id={task.id}>
    <input type="checkbox" aria-label={`Complete ${task.title}`} checked={completed} disabled={mutation.pending} onChange={toggle} />
    <div><strong>{task.title}</strong><small>{taskDueLabel(task.dueDate)}</small>{mutation.error && <div role="alert">{mutation.error}<button type="button" onClick={toggle}>Retry completion</button></div>}</div>
    <span className="dashboard-task-open">{task.assigneeName && <span className="task-avatar" title={task.assigneeName}>{taskInitials(task.assigneeName)}</span>}<TaskLink id={task.id} label={`Open task ${task.title}`}><ArrowRight size={16} /></TaskLink></span>
    <TaskActions task={task} label={`Actions for ${task.title}`} />
  </div>;
}
// 기능 : 대시보드 작업 영역만 공유 원본에 연결하고 기존 재무·시간·활동 프레임은 확장하지 않는다.
export function DashboardTasks() {
  const query = useTasks();
  if (query.isPending) return <p role="status">Loading tasks…</p>;
  if (query.isError) return <div role="alert"><p>{query.error.message}</p><button type="button" onClick={() => void query.refetch()}>Retry dashboard tasks</button></div>;
  if (!query.data?.length) return <div className="setup-empty tasks"><p>No tasks yet.</p></div>;
  return <div className="dashboard-task-list">{query.data.map(task => <DashboardTaskRow key={task.id} task={task} />)}</div>;
}
