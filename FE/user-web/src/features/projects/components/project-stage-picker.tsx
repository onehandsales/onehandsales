import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { ProjectStage, ProjectView } from "../model/project-types";
import { projectStages } from "../model/project-types";
import { useProjectAction } from "../hooks/use-project-action";
// 기능 : 원본 단계 배지를 키보드로 선택하고 실패 시 이전 단계와 마지막 선택 의도를 보존한다.
export function ProjectStagePicker({ project }: { project: ProjectView }) {
  const [open, setOpen] = useState(false); const [target, setTarget] = useState<ProjectStage>(project.stage); const action = useProjectAction(); const root = useRef<HTMLDivElement>(null); const trigger = useRef<HTMLButtonElement>(null); const menu = useRef<HTMLDivElement>(null);
  // 기능 : 단계 메뉴에 초점을 주고 바깥 클릭으로 선택 없이 닫는다.
  useEffect(function followOpen() { if (!open) return; menu.current?.querySelector<HTMLButtonElement>('[aria-checked="true"]')?.focus();
    // 기능 : 메뉴 밖 클릭은 현재 진행 중 저장값을 바꾸지 않는다.
    function outside(event: PointerEvent) { if (event.target instanceof Node && !root.current?.contains(event.target)) setOpen(false); }
    document.addEventListener("pointerdown", outside); return function cleanup() { document.removeEventListener("pointerdown", outside); };
  }, [open]);
  // 기능 : 빠른 다음 선택은 이전 요청을 취소하고 마지막 단계만 저장한다.
  function select(stage: ProjectStage) { setOpen(false); trigger.current?.focus(); setTarget(stage); void action.run({ type: "move", projectId: project.id, revision: project.revision, stage, beforeId: null }, true); }
  return <div className="project-stage-control" ref={root} onKeyDown={event => { if (open && event.key === "Escape") { event.preventDefault(); event.stopPropagation(); setOpen(false); trigger.current?.focus(); } if (open && ["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) { event.preventDefault(); const buttons = Array.from(menu.current?.querySelectorAll<HTMLButtonElement>("button") ?? []); const index = buttons.findIndex(button => button === document.activeElement); buttons[event.key === "Home" ? 0 : event.key === "End" ? buttons.length - 1 : (index + (event.key === "ArrowUp" ? -1 : 1) + buttons.length) % buttons.length]?.focus(); } }}><button ref={trigger} type="button" className={`project-stage stage-${projectStages.indexOf(project.stage)}`} aria-label={`Project stage: ${project.stage}`} aria-expanded={open} aria-haspopup="menu" onClick={() => setOpen(value => !value)} onKeyDown={event => { if (!open && event.key === "ArrowDown") { event.preventDefault(); setOpen(true); } }}><span aria-hidden="true">●</span>{project.stage}<ChevronDown size={14} aria-hidden="true" /></button>{open && <div role="menu" aria-label="Project stages" className="project-stage-menu" ref={menu}>{projectStages.map((stage, index) => <button type="button" key={stage} role="menuitemradio" aria-checked={stage === project.stage} className={`project-stage stage-${index}`} onClick={() => select(stage)}><span aria-hidden="true">●</span>{stage}</button>)}</div>}{!open && (action.pending || action.error) && <div className="project-stage-feedback">{action.pending ? <p role="status">Updating stage…</p> : <p role="alert">{action.error}</p>}{action.error && !action.pending && <button onClick={() => select(target)}>Retry stage</button>}<button onClick={action.cancel}>Cancel stage change</button></div>}</div>;
}
