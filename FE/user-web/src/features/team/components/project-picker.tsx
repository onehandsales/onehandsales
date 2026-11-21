import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown, X } from "lucide-react";
import type { TeamProject } from "../model/team-types";
// 기능 : 선택한 프로젝트 chip과 키보드 가능한 체크 목록을 같은 초안 ID 집합에 연결한다.
export function ProjectPicker({ projects, value, disabled, all, onChange }: { projects: TeamProject[]; value: string[]; disabled: boolean; all: boolean; onChange: (ids: string[]) => void }) {
  const [open, setOpen] = useState(false); const root = useRef<HTMLDivElement>(null); const trigger = useRef<HTMLButtonElement>(null); const id = useId();
  // 기능 : 선택기 밖 클릭은 패널만 닫고 선택값과 외부 포커스를 유지한다.
  useEffect(function outside() { if (!open) return; function close(event: PointerEvent) { if (event.target instanceof Node && !root.current?.contains(event.target)) setOpen(false); } document.addEventListener("pointerdown", close); return function cleanup() { document.removeEventListener("pointerdown", close); }; }, [open]);
  return <div className="team-project-picker" ref={root} onKeyDown={event => { if (event.key === "Escape" && open) { event.preventDefault(); event.stopPropagation(); setOpen(false); trigger.current?.focus(); } }}>
    <span id={id + "-label"} className="team-field-label">Projects</span>
    <div className="team-project-control">{all ? <span>All Projects</span> : value.map(projectId => <span className="team-project-chip" key={projectId}>{projects.find(project => project.id === projectId)?.name}<button type="button" disabled={disabled} aria-label={"Remove project " + projects.find(project => project.id === projectId)?.name} onClick={() => onChange(value.filter(item => item !== projectId))}><X size={12} aria-hidden="true" /></button></span>)}
      {!all && value.length > 0 && <button type="button" className="team-project-clear" disabled={disabled} aria-label="Clear all projects" onClick={() => onChange([])}><X size={16} aria-hidden="true" /></button>}<button ref={trigger} type="button" className="team-project-trigger" aria-labelledby={id + "-label"} aria-expanded={open && !all} aria-controls={id} disabled={disabled || all} onClick={() => setOpen(current => !current)}>{!all && value.length === 0 && <span>Select...</span>}<ChevronDown size={16} aria-hidden="true" /></button>
    </div>
    {open && !all && <fieldset id={id} className="team-project-options"><legend className="sr-only">Available projects</legend>{projects.map(project => <label key={project.id}><input type="checkbox" checked={value.includes(project.id)} disabled={disabled} onChange={() => onChange(value.includes(project.id) ? value.filter(item => item !== project.id) : [...value, project.id])} />{project.name}</label>)}</fieldset>}
  </div>;
}
