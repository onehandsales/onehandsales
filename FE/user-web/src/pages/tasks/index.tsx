import { useSearchParams } from "react-router-dom";
import { TaskBoard, TaskTools } from "@/features/tasks";
import { TemplateWorkspace, TemplateTools } from "@/features/task-template";
import "@/styles/tasks.css";
import "@/styles/task-templates.css";
// 기능 : 전체 작업과 템플릿 작성의 URL 탐색을 별도 원본과 화면에 조합한다.
export function TasksPage() { const [params, setParams] = useSearchParams(); const templates = params.get("tab") === "Templates"; return <section className="tasks-page"><header className="tasks-heading"><h1>Tasks</h1><nav aria-label="Task sections">{["Tasks", "Templates"].map(name => <button key={name} aria-current={(templates ? "Templates" : "Tasks") === name ? "page" : undefined} onClick={() => { const next = new URLSearchParams(params); next.set("tab", name); next.delete("templateDialog"); next.delete("templateTask"); void setParams(next, { state: null }); }}>{name}</button>)}</nav></header>{templates ? <TemplateWorkspace /> : <TaskBoard />}{templates ? <TemplateTools /> : <TaskTools />}</section>; }
