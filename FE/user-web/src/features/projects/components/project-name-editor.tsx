import { useEffect, useId, useRef, useState } from "react";
import { Pencil, X } from "lucide-react";
import { useProjects } from "../hooks/use-projects";
import { useProjectAction } from "../hooks/use-project-action";
import type { ProjectView } from "../model/project-types";
import { projectTitle } from "../model/project-settings";
// 기능 : 제목 초안만 명시적으로 저장하고 취소·이탈·충돌 시 과거 이름과 생성 이력을 보존한다.
export function ProjectNameEditor({ project, onSaved }: { project: ProjectView; onSaved: () => void }) {
  const [draft, setDraft] = useState<{ name: string; revision: number } | null>(null); const action = useProjectAction(); const query = useProjects(); const input = useRef<HTMLInputElement>(null); const trigger = useRef<HTMLButtonElement>(null); const composing = useRef(false); const editing = !!draft;
  const [issue, setIssue] = useState(""); const errorId = useId(); const error = issue || action.error;
  // 기능 : 편집 진입 때 제목을 선택하고 닫은 뒤 연필로 초점을 복귀한다.
  useEffect(function focusEditor() { if (editing) { input.current?.focus(); input.current?.select(); } }, [editing]);
  // 기능 : 저장 직후 재진입에도 지연된 조회 대신 현재 원본으로 새 초안을 시작한다.
  function begin() { composing.current = false; setIssue(""); const saved = query.store.current(query.scope, project.id) ?? project; setDraft({ name: saved.name, revision: saved.revision }); }
  // 기능 : 미저장 제목과 늦은 저장을 함께 취소한다.
  function cancel() { composing.current = false; setIssue(""); action.cancel(); setDraft(null); requestAnimationFrame(() => trigger.current?.focus()); }
  // 기능 : 편집 시작 revision으로 저장해 다른 변경을 조용히 덮지 않는다.
  async function save() { if (!draft || action.pending || composing.current) return; try { projectTitle(draft.name); } catch (reason) { setIssue((reason as Error).message); input.current?.focus(); return; } setIssue(""); if (await action.run({ type: "rename", projectId: project.id, revision: draft.revision, name: draft.name })) { setDraft(null); onSaved(); requestAnimationFrame(() => trigger.current?.focus()); } }
  return draft ? <form className="project-name-editor" noValidate onSubmit={event => { event.preventDefault(); void save(); }} onCompositionStart={() => { composing.current = true; }} onCompositionEnd={() => { composing.current = false; }} onKeyDown={event => { if ((event.key === "Enter" || event.key === "Escape") && (event.nativeEvent.isComposing || composing.current || event.keyCode === 229)) { event.preventDefault(); return; } if (event.key === "Escape") { event.preventDefault(); cancel(); } }}><input ref={input} aria-label="Project name" aria-invalid={!!issue || undefined} aria-describedby={error ? errorId : undefined} value={draft.name} maxLength={200} disabled={action.pending} onChange={event => { setIssue(""); setDraft({ ...draft, name: event.currentTarget.value }); }} /><button className="client-primary" disabled={action.pending}>Save</button><button type="button" className="project-name-cancel project-edit-cancel" aria-label="Cancel project name edit" onClick={cancel}><X size={16} /></button>{action.pending && <span role="status">Saving name…</span>}{error && <p id={errorId} className="client-error" role="alert">{error} Cancel and reopen to review the saved name.</p>}</form> : <><h1>{project.name}</h1><button ref={trigger} aria-label="Edit project name" onClick={begin}><Pencil size={15} /></button></>;
}
