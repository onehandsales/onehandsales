import { useSearchParams } from "react-router-dom";
import { TaskBoard, TaskTemplatesIntro, TaskTools } from "@/features/tasks";
import "@/styles/tasks.css";
// 기능 : 전체 작업과 템플릿 소개의 URL 탐색을 실제 작업 기능에 조합한다.
export function TasksPage() { const [params, setParams] = useSearchParams(); const templates = params.get("tab") === "Templates"; return <section className="tasks-page"><header className="tasks-heading"><h1>Tasks</h1><nav aria-label="Task sections">{["Tasks", "Templates"].map(name => <button key={name} aria-current={(templates ? "Templates" : "Tasks") === name ? "page" : undefined} onClick={() => { const next = new URLSearchParams(params); next.set("tab", name); void setParams(next); }}>{name}</button>)}</nav></header>{templates ? <TaskTemplatesIntro /> : <TaskBoard />}<TaskTools /></section>; }
