import { MoreHorizontal } from "lucide-react";
import { usePreviewEnvironment } from "@/features/preview";
import type { Task, TaskActivity } from "../model/task-types";
import { TaskCommentForm } from "./task-comment-form";

// 기능 : 사용자 댓글과 담당자·상태 자동 활동의 내용과 표현을 분리한다.
function ActivityRow({ event, onUnavailable }: { event: TaskActivity; onUnavailable: () => void }) {
  const text = event.kind === "comment" ? event.body : event.kind === "status" ? `Marked task as ${event.status.toLowerCase()}` : event.assigneeName ? `Assigned ${event.assigneeName}` : "Removed assignee";
  return <div className={`task-event${event.kind === "comment" ? " is-comment" : ""}`} data-activity-id={event.id} data-activity-kind={event.kind}>
    <span className="task-avatar" aria-hidden="true">{event.actorName.slice(0, 2).toUpperCase()}</span>
    <div><strong>{event.actorName}</strong><time dateTime={event.at} title={event.at}>{new Date(event.at).toLocaleTimeString("en-US", { timeZone: "UTC", hour: "numeric", minute: "2-digit" })} UTC</time><p>{text}</p></div>
    {event.kind === "comment" && <button type="button" className="task-comment-actions" aria-label={`Comment actions by ${event.actorName}`} onClick={onUnavailable}><MoreHorizontal size={20} /></button>}
  </div>;
}

// 기능 : 같은 저장 원본의 자동 활동과 댓글을 원본 배치로 표시하고 저장된 작업에만 입력을 허용한다.
export function TaskActivitySection({ task, onUnavailable }: { task: Task | null; onUnavailable: () => void }) {
  const { state } = usePreviewEnvironment();
  const automatic = (task?.activities ?? []).filter(event => event.kind !== "comment").reverse();
  const comments = (task?.activities ?? []).filter(event => event.kind === "comment");
  return <section className="task-activity"><h3>Activity</h3><div aria-live="polite" aria-relevant="additions">{[...automatic, ...comments].map(event => <ActivityRow key={event.id} event={event} onUnavailable={onUnavailable} />)}</div>
    {task ? <TaskCommentForm key={task.id} taskId={task.id} actorName={state.session?.name ?? "Member"} /> : <p className="task-muted">Save a task title and project before adding comments.</p>}
  </section>;
}
