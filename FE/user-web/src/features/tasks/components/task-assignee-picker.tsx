import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { ChevronDown, UserRoundPlus } from "lucide-react";
import { taskInitials } from "../model/task-values";
import type { TeamRow } from "@/features/team";
// 기능 : 수락된 프로젝트 팀 중 한 담당자를 검색·선택하고 메뉴 초점과 닫기를 관리한다.
export function TaskAssigneePicker({ members, value, disabled, onChange, label = "Task assignee", compact = false }: { members: TeamRow[]; value: string | null; disabled: boolean; onChange: (value: string | null) => void; label?: string; compact?: boolean }) {
  const composing = useRef(false); const [open, setOpen] = useState(false); const [search, setSearch] = useState(""); const root = useRef<HTMLDivElement>(null); const trigger = useRef<HTMLButtonElement>(null); const input = useRef<HTMLInputElement>(null); const selected = members.find(member => member.id === value); const matches = members.filter(member => `${member.name} ${member.email}`.toLowerCase().includes(search.trim().toLowerCase()));
  // 기능 : 메뉴 수명 동안만 외부 클릭을 감지하고 검색 입력으로 초점을 옮긴다.
  useEffect(function followOpen() { if (!open) return; input.current?.focus();
    // 기능 : 담당자 선택 영역 밖의 클릭으로 메뉴만 닫는다.
    function outside(event: PointerEvent) { if (event.target instanceof Node && !root.current?.contains(event.target)) setOpen(false); } document.addEventListener("pointerdown", outside);
    // 기능 : 메뉴가 닫히면 외부 클릭 감지를 해제한다.
    return function cleanup() { document.removeEventListener("pointerdown", outside); }; }, [open]);
  // 기능 : 선택 후 메뉴를 닫고 저장 중에도 원래 제어에 초점을 복귀한다.
  function choose(id: string | null) { if (disabled) return; setOpen(false); onChange(id); requestAnimationFrame(() => trigger.current?.focus()); }
  // 기능 : 조합 입력을 보호하고 검색에서의 첫 방향 이동과 선택지 순환 및 닫기 초점을 관리한다.
  function handleMenuKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (composing.current || event.nativeEvent.isComposing || event.keyCode === 229) {
      if (["Enter", "Escape"].includes(event.key)) { event.preventDefault(); event.stopPropagation(); }
      return;
    }
    if (open && event.key === "Escape") {
      event.preventDefault(); event.stopPropagation(); setOpen(false);
      requestAnimationFrame(() => trigger.current?.focus());
      return;
    }
    if (!open || !["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const items = [...root.current!.querySelectorAll<HTMLButtonElement>('[role="option"]')];
    const index = items.findIndex(item => item === document.activeElement);
    const next = event.key === "Home" ? 0 : event.key === "End" ? items.length - 1
      : index < 0 ? event.key === "ArrowUp" ? items.length - 1 : 0
      : (index + (event.key === "ArrowUp" ? -1 : 1) + items.length) % items.length;
    items[next]?.focus();
  }
  return <div ref={root} className={`task-assignee-picker${compact ? " is-compact" : ""}`} onKeyDown={handleMenuKeyDown}><button type="button" ref={trigger} aria-label={label} aria-haspopup="listbox" aria-expanded={open} aria-disabled={disabled} onClick={() => { if (!disabled) { composing.current = false; setSearch(""); setOpen(value => !value); } }}>{selected ? <><span className="task-avatar">{taskInitials(selected.name)}</span>{!compact && selected.name}</> : compact ? <UserRoundPlus size={19} aria-hidden="true" /> : <span className="task-muted">Unassigned</span>}</button>{open && <div className="task-assignee-menu"><div><input ref={input} onCompositionStart={event => { event.stopPropagation(); composing.current = true; }} onCompositionEnd={event => { event.stopPropagation(); composing.current = false; }} onBlur={() => { composing.current = false; }} aria-label={`Search ${label.toLowerCase()}`} placeholder="Select…" value={search} onChange={event => setSearch(event.currentTarget.value)} /><ChevronDown size={14} /></div><p>PROJECT TEAM</p><div role="listbox" aria-label={label}>{matches.map(member => <button key={member.id} type="button" role="option" aria-selected={member.id === value} onClick={() => choose(member.id)}><span className="task-avatar">{taskInitials(member.name)}</span>{member.name}</button>)}{!matches.length && <p>No matching project members.</p>}{value && <button type="button" role="option" aria-selected={false} onClick={() => choose(null)}>Unassigned</button>}</div></div>}</div>;
}
