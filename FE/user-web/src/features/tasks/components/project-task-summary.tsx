import { useSearchParams } from "react-router-dom";
import { Plus } from "lucide-react";
import { useTasks } from "../hooks/use-tasks";
import { taskSummary } from "../model/task-values";
import { TaskLink } from "./task-link";
// 기능 : 프로젝트 개요의 집계와 생성 진입을 같은 작업 ID 원본에 연결한다.
export function ProjectTaskSummary({ projectId, onTemplates }: { projectId: string; onTemplates: () => void }) { const query = useTasks(); const [params, setParams] = useSearchParams(); const tasks = query.data?.filter(task => task.projectId === projectId) ?? [];
  // 기능 : 선택한 집계의 프로젝트 작업 보드로 실제 URL 이력을 남긴다.
  function openBucket(bucket: string) { const next = new URLSearchParams(params); next.set("tab", "Tasks"); next.set("taskBucket", bucket); next.delete("taskQ"); next.delete("taskStage"); next.delete("taskProjectFilter"); void setParams(next); }
  return <section className="project-task-summary"><div className="client-panel-title"><h2>Tasks</h2><TaskLink projectId={projectId} className="client-round" label="Add project task"><Plus /></TaskLink></div>{query.isPending ? <p role="status">Loading tasks…</p> : query.isError ? <div role="alert"><p>{query.error.message}</p><button onClick={() => void query.refetch()}>Retry tasks</button></div> : tasks.length ? <div className="task-summary-counts">{Object.entries(taskSummary(tasks)).map(([name, count]) => <button key={name} onClick={() => openBucket(name)}><span>{name}</span><strong>{count} {count === 1 ? "Task" : "Tasks"}</strong></button>)}</div> : <div className="project-empty">Create a <TaskLink projectId={projectId}>new task</TaskLink> or create tasks <button onClick={onTemplates}>from a template</button>.</div>}</section>;
}
