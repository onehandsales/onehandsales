import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, MoreHorizontal, Pencil } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { useTemplates } from "../hooks/use-templates";
import type { TaskTemplate } from "../model/template-types";
import { TemplateNameDialog } from "./template-name-dialog";
import { TemplateTaskEditor } from "./template-task-editor";
import { TemplateFileCard } from "./template-files";

// 기능 : 빈 안내 그림은 실제 템플릿 데이터와 분리하고 이름 생성으로 진입한다.
function TemplateIntro({ onCreate, disabled }: { onCreate: () => void; disabled: boolean }) {
  return <div className="task-templates-intro"><img src="/images/bonsai/tasks-template-guide.png" alt="Illustration of reusable task templates" /><div><h2>Prefill Tasks With Templates</h2><p>Make the process of managing a new project easier by adding preset task lists. You can add or edit the tasks anytime as your process evolves.</p><button type="button" className="task-primary" disabled={disabled} onClick={onCreate}>New Template</button></div><p className="task-template-support">Have questions? <Link to="/support">Contact Support</Link></p></div>;
}
// 기능 : 실제 템플릿 ID와 편집 query를 목록·직접 주소·앞뒤 이력에 연결한다.
export function TemplateWorkspace() {
  const query = useTemplates(); const [params] = useSearchParams(); const location = useLocation(); const navigate = useNavigate();
  const [message, setMessage] = useState(""); const [options, setOptions] = useState(false);
  const opening = useRef(false);
  const entryKey = `${query.scope.actorId}:${query.scope.workspaceId}:${query.scope.revision}:${location.key}`;
  // 기능 : 템플릿 소유의 진입 표식만 제거하고 외부 이력 상태는 보존한다.
  function retainedState() { const state = { ...location.state }; delete state.templateDialogEntry; return Object.keys(state).length ? state : null; }
  // 기능 : 새 이력에 도착한 뒤에만 다음 모달 진입을 허용한다.
  useEffect(function releaseOpening() { opening.current = false; }, [location.key]);
  const requested = params.get("template"); const id = requested ?? query.data?.[0]?.id ?? ""; const action = params.get("templateDialog"); const taskId = params.get("templateTask");
  // 기능 : 편집 진입을 한 이력으로 추가하고 원래 템플릿·탭을 보존한다.
  function openDialog(kind: "new" | "rename" | "task", target?: string) {
    if (opening.current || params.has("templateDialog") || params.has("templateTask")) return;
    opening.current = true;
    const next = new URLSearchParams(params); next.set("tab", "Templates"); next.delete("templateDialog"); next.delete("templateTask");
    if (id) next.set("template", id);
    if (kind === "task") next.set("templateTask", target ?? "new"); else next.set("templateDialog", kind);
    setOptions(false); void navigate({ pathname: location.pathname, search: next.toString(), hash: location.hash }, { state: { ...location.state, templateDialogEntry: true }, preventScrollReset: true });
  }
  // 기능 : 모달 진입 이력이 있으면 복귀하고 직접 URL이면 편집 query만 제거한다.
  function closeDialog() {
    if ((location.state as { templateDialogEntry?: boolean } | null)?.templateDialogEntry) { void navigate(-1); return; }
    const next = new URLSearchParams(params); next.delete("templateTask"); next.delete("templateDialog"); void navigate({ pathname: location.pathname, search: next.toString(), hash: location.hash }, { replace: true, state: retainedState(), preventScrollReset: true });
  }
  // 기능 : 성공한 템플릿 이름과 ID를 현재 이력에 반영하고 성공 안내를 표시한다.
  function named(template: TaskTemplate) { if (action === "rename") closeDialog(); else { const next = new URLSearchParams(params); next.set("template", template.id); next.delete("templateDialog"); void navigate({ pathname: location.pathname, search: next.toString(), hash: location.hash }, { replace: true, state: retainedState(), preventScrollReset: true }); } setMessage(action === "new" ? "Task template successfully created." : "Task template updated."); }
  // 기능 : 저장 성공 뒤 편집 이력을 닫고 실제 결과만 안내한다.
  function saved(value: string) { closeDialog(); setMessage(value); }
  // 기능 : 템플릿 선택은 별도 이력으로 남기고 이전 편집 초안을 폐기한다.
  function select(value: string) { const next = new URLSearchParams(params); next.set("template", value); next.delete("templateTask"); next.delete("templateDialog"); void navigate({ pathname: location.pathname, search: next.toString(), hash: location.hash }, { state: retainedState(), preventScrollReset: true }); setOptions(false); }

  if (query.isPending) return <p className="template-read-state" role="status">Loading task templates…</p>;
  if (query.isError || query.state.scenario === "denied") return <div className="template-read-state" role="alert"><h2>Task templates unavailable</h2><p>{query.error?.message ?? "Task templates are unavailable in this local access scenario."}</p><button type="button" onClick={() => void query.refetch()}>Retry templates</button></div>;
  const template = id ? query.data?.find(item => item.id === id) ?? query.store.current(query.scope, id) : null;
  const existingTask = template?.tasks.find(task => task.id === taskId);
  return <>
    {!query.editable && <p className="template-read-state">Only the workspace owner can edit task templates in this preview.</p>}
    {requested && !template ? <div className="template-read-state" role="alert"><h2>Task template unavailable</h2><p>This template is missing or outside this workspace.</p><Link to="/app/tasks?tab=Templates">Return to templates</Link></div> : template ? <div className="template-workspace">
      <header className="template-heading"><div><h2>{template.name}</h2><button type="button" aria-label="Edit template name" disabled={!query.editable} onClick={() => openDialog("rename")}><Pencil size={16} /></button><button type="button" aria-label="Template options" onClick={() => setOptions(true)}><MoreHorizontal size={18} /></button></div><button type="button" className="task-primary" disabled={!query.editable} onClick={() => openDialog("task")}>New Task</button></header>
      {!template.tasks.length ? <div className="task-template-empty">No tasks created yet.<br />Create a <button type="button" disabled={!query.editable} onClick={() => openDialog("task")}>new task</button>.</div> : <div className="template-task-list">{template.tasks.map(task => <details key={task.id} data-template-task-id={task.id}><summary>{task.title}</summary><div className="template-task-detail">{task.description && <p>{task.description}</p>}<div className="template-file-list">{task.files.map(file => <TemplateFileCard key={file.id} entry={file} />)}</div><ul>{task.subtasks.map(child => <li key={child.id}>{child.completed ? "✓" : "○"} {child.title}</li>)}</ul><button type="button" disabled={!query.editable} onClick={() => openDialog("task", task.id)}>Edit task</button></div></details>)}</div>}
    </div> : <TemplateIntro disabled={!query.editable} onCreate={() => openDialog("new")} />}
    {options && <Dialog title="Task templates" onClose={() => setOptions(false)}><nav aria-label="Choose task template">{query.data?.map(item => <button type="button" key={item.id} aria-current={id === item.id ? "true" : undefined} onClick={() => select(item.id)}>{item.name}</button>)}</nav><button type="button" className="task-primary" disabled={!query.editable} onClick={() => openDialog("new")}>New Template</button></Dialog>}
    {action === "new" && <TemplateNameDialog key={entryKey} onSaved={named} onClose={closeDialog} />}
    {action === "rename" && template && <TemplateNameDialog key={entryKey} existing={template} onSaved={named} onClose={closeDialog} />}
    {taskId && template && (taskId === "new" || existingTask ? <TemplateTaskEditor key={entryKey} templateId={template.id} existing={existingTask} onSaved={saved} onClose={closeDialog} /> : <Dialog title="Template task unavailable" onClose={closeDialog}><p>This template task is no longer available.</p><button type="button" onClick={closeDialog}>Return to template</button></Dialog>)}
    {message && <div className="template-feedback" role="status"><CheckCircle2 size={17} /><span>{message}</span><button type="button" aria-label="Dismiss template message" onClick={() => setMessage("")}>×</button></div>}
  </>;
}
