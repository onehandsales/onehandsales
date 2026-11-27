import { useEffect, useId, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Dialog } from "@/components/ui/dialog";
import { useProjects } from "@/features/projects";
import { useTasks } from "@/features/tasks";
import { useTemplates } from "../hooks/use-templates";
import { useTemplateMutation } from "../hooks/use-template-mutation";
import { applyTaskTemplate } from "../data/apply-task-template";
// 기능 : 적용 선택·실패 초안을 URL 모달 수명에 묶고 실제 작업 원본으로 원자 복사한다.
export function TemplateApplyHost() {
  const templates = useTemplates(); const projects = useProjects(); const tasks = useTasks(); const mutation = useTemplateMutation();
  const [params] = useSearchParams(); const location = useLocation(); const navigate = useNavigate();
  const [templateId, setTemplateId] = useState(""); const [projectId, setProjectId] = useState(params.get("templateProject") ?? ""); const [submission, setSubmission] = useState(() => crypto.randomUUID());
  const templateField = useRef<HTMLSelectElement>(null); const errorRef = useRef<HTMLParagraphElement>(null); const errorId = useId();
  const retriedChoices = useRef(false);
  // 기능 : 적용 실패가 끝나면 보존된 선택과 연결된 오류 안내로 초점을 옮긴다.
  useEffect(function focusError() { if (mutation.error && !mutation.pending) errorRef.current?.focus(); }, [mutation.error, mutation.pending]);
  const selected = templates.data?.find(row => row.id === templateId); const target = projects.data?.find(row => row.id === projectId);
  const error = templates.error || projects.error || tasks.error;
  const loading = templates.isPending || projects.isPending || tasks.isPending;
  const unavailable = templates.state.scenario === "denied" || projects.state.scenario === "denied" || tasks.state.scenario === "denied" || tasks.state.scenario === "empty";
  // 기능 : 선택지 재조회가 성공하면 사라진 재시도 버튼 대신 첫 선택으로 초점을 돌린다.
  useEffect(function focusRetriedChoices() { if (retriedChoices.current && !loading && !error && !unavailable) { retriedChoices.current = false; templateField.current?.focus(); } }, [loading, error, unavailable]);
  // 기능 : 닫기·취소는 미완료 적용을 중단하고 원래 보드의 조건과 이력으로 복귀한다.
  function close() { mutation.cancel(); if ((location.state as { templateApplyEntry?: boolean } | null)?.templateApplyEntry) { void navigate(-1); return; } const next = new URLSearchParams(params); next.delete("applyTemplate"); next.delete("templateProject"); const state = { ...location.state }; delete state.templateApplyEntry; void navigate({ pathname: location.pathname, search: next.toString(), hash: location.hash }, { replace: true, state: Object.keys(state).length ? state : null, preventScrollReset: true }); }
  // 기능 : 적용 요청만 취소한 뒤 그대로 남은 템플릿 선택으로 초점을 복귀한다.
  function cancelCreation() { mutation.cancel(); requestAnimationFrame(() => templateField.current?.focus()); }
  // 기능 : 새 선택은 새로운 사용자 의도로 구분하고 이전 진행 적용을 취소한다.
  function choose(kind: "template" | "project", value: string) { mutation.cancel(); setSubmission(crypto.randomUUID()); if (kind === "template") setTemplateId(value); else setProjectId(value); }
  // 기능 : 원본 snapshot을 작업 저장소에 전달하고 실제 생성 성공 때만 보드로 돌아간다.
  async function submit(event: FormEvent) { event.preventDefault(); if (mutation.pending || loading || error || unavailable) return; const result = await mutation.run(signal => applyTaskTemplate(templates.store, projects.store, tasks.store, templates.scope, templateId, projectId, submission, signal)); if (result?.length) close(); }
  // 기능 : 실패한 선택지 조회만 다시 요청하며 이미 고른 ID는 유지한다.
  function retry() { retriedChoices.current = true; void templates.refetch(); void projects.refetch(); void tasks.refetch(); }
  return <Dialog className="template-apply-dialog template-dialog" title="Select Task Template" onClose={close}>
    {loading ? <p className="template-apply-state" role="status">Loading templates and projects…</p> : error || unavailable ? <div className="template-apply-state" role="alert"><p>{error?.message ?? "Task templates cannot be applied in this access scenario."}</p><button type="button" onClick={retry}>Retry template choices</button><button type="button" onClick={close}>Return to task board</button></div> : <form onSubmit={submit}>
      <div className="template-apply-fields"><p>Use one of your <Link to="/app/tasks?tab=Templates">Task Templates</Link> to add a preset list of Tasks to one of your projects.</p>
        <label>Template Name<select ref={templateField} aria-label="Template Name" className={templateId ? undefined : "is-empty"} value={templateId} disabled={mutation.pending} onChange={event => choose("template", event.currentTarget.value)}><option value="">Select...</option>{templates.data?.map((row, index) => <option key={row.id} value={row.id}>{row.name}{templates.data!.filter(other => other.name === row.name).length > 1 ? ` (${index + 1})` : ""}</option>)}</select></label>
        {!templates.data?.length && <p className="template-apply-note">No task templates yet. <Link to="/app/tasks?tab=Templates">Create a task template</Link>.</p>}
        {selected && !selected.tasks.length && <p className="template-apply-note" role="status">This template has no tasks. <Link to={`/app/tasks?tab=Templates&template=${encodeURIComponent(selected.id)}`}>Add template tasks</Link>.</p>}
        <label>Project<select aria-label="Template project" className={projectId ? undefined : "is-empty"} value={projectId} disabled={mutation.pending} onChange={event => choose("project", event.currentTarget.value)}><option value="">Select...</option>{projects.data?.map(row => <option key={row.id} value={row.id}>{row.name}</option>)}</select></label>
        {!projects.data?.length && <p className="template-apply-note">No accessible projects are available.</p>}
        {projectId && !target && <p role="alert">This project is unavailable or outside your assigned scope.</p>}
        {templateId && !selected && <p role="alert">This task template is no longer available.</p>}
        {mutation.error && <p ref={errorRef} id={errorId} role="alert" tabIndex={-1}>{mutation.error}</p>}
      </div><footer className={`template-apply-footer${templateId && !target ? " is-incomplete" : ""}`}><button type="submit" className="task-primary" aria-describedby={mutation.error ? errorId : undefined} disabled={mutation.pending || !selected?.tasks.length || !target}>{mutation.pending ? "Creating tasks…" : "Create New Tasks"}</button><button className="template-apply-cancel" type="button" disabled={!mutation.pending} style={{ visibility: mutation.pending ? "visible" : "hidden" }} onClick={cancelCreation}>Cancel creation</button></footer>
    </form>}<p className="template-dialog-support">Have questions? <Link to="/support">Contact Support</Link></p>
  </Dialog>;
}
