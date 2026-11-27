import { useId, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ListPlus } from "lucide-react";
// 기능 : 템플릿 적용 진입을 한 이력으로 남기고 프로젝트·수정키 링크 동작을 유지한다.
export function TaskTemplateLink({ projectId }: { projectId?: string }) {
  const location = useLocation(); const entering = useRef(false); const params = new URLSearchParams(location.search);
  const [hint, setHint] = useState(false); const hintId = useId();
  for (const key of ["task", "create", "taskProject", "taskStatus", "templateProject"]) params.delete(key);
  params.set("applyTemplate", "new"); if (projectId) params.set("templateProject", projectId);
  return <Link className="task-template-link" aria-label="Create tasks from template" aria-describedby={hint ? hintId : undefined} onMouseEnter={() => setHint(true)} onMouseLeave={() => setHint(false)} onFocus={() => setHint(true)} onBlur={() => setHint(false)} onKeyDown={event => { if (event.key === "Escape" && hint) { event.preventDefault(); setHint(false); } }} to={{ pathname: location.pathname, search: params.toString(), hash: location.hash }} state={{ ...location.state, templateApplyEntry: true }} preventScrollReset onClick={event => { if (event.button !== 0 || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return; if (event.detail > 1 || entering.current) { event.preventDefault(); return; } entering.current = true; requestAnimationFrame(() => { entering.current = false; }); }}><ListPlus size={23} />{hint && <span id={hintId} role="tooltip" className="task-template-hint">Add from a task template</span>}</Link>;
}
