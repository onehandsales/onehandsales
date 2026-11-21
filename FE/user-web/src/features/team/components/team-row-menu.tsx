import { useEffect, useId, useRef, useState } from "react";
import { MoreHorizontal } from "lucide-react";
import type { TeamRow } from "../model/team-types";
// 기능 : 행별 메뉴를 키보드·외부 클릭으로 제어하고 선택한 초대 ID를 상위 확인 화면에 전달한다.
export function TeamRowMenu({ row, onRemove, onUnavailable }: { row: TeamRow; onRemove: (row: TeamRow) => void; onUnavailable: (title: string) => void }) {
  const [open, setOpen] = useState(false); const root = useRef<HTMLDivElement>(null); const trigger = useRef<HTMLButtonElement>(null); const menu = useRef<HTMLDivElement>(null); const id = useId();
  // 기능 : 열린 메뉴에 초점을 두고 바깥 포인터 이동 시 해당 메뉴를 닫는다.
  useEffect(function openMenu() { if (!open) return; menu.current?.querySelector<HTMLButtonElement>("button")?.focus(); function outside(event: PointerEvent) { if (event.target instanceof Node && !root.current?.contains(event.target)) setOpen(false); } document.addEventListener("pointerdown", outside); return function cleanup() { document.removeEventListener("pointerdown", outside); }; }, [open]);
  // 기능 : 후속 모달의 복귀 지점을 행 메뉴 트리거로 고정한다.
  function choose(action: () => void) { trigger.current?.focus(); setOpen(false); action(); }
  return <div ref={root} className="team-row-actions" onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }} onKeyDown={event => {
    if (event.key === "Escape" && open) { event.preventDefault(); event.stopPropagation(); setOpen(false); trigger.current?.focus(); }
    if (open && ["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) { event.preventDefault(); const buttons = Array.from(menu.current?.querySelectorAll<HTMLButtonElement>("button") ?? []); const current = buttons.findIndex(button => button === document.activeElement); const next = event.key === "Home" ? 0 : event.key === "End" ? buttons.length - 1 : (current + (event.key === "ArrowUp" ? -1 : 1) + buttons.length) % buttons.length; buttons[next]?.focus(); }
  }}>
    <button ref={trigger} type="button" className="team-menu-trigger" aria-label={"Actions for " + row.email} aria-haspopup="menu" aria-expanded={open} aria-controls={open ? id : undefined} onClick={() => setOpen(value => !value)} onKeyDown={event => { if (!open && event.key === "ArrowDown") { event.preventDefault(); setOpen(true); } }}><MoreHorizontal size={18} aria-hidden="true" /></button>
    {open && <div id={id} ref={menu} role="menu" aria-label={"Team actions for " + row.email} className="team-row-menu">{row.status !== "joined" && <button type="button" role="menuitem" onClick={() => choose(() => onUnavailable("Resend Invite"))}>Resend Invite</button>}<button type="button" role="menuitem" onClick={() => choose(() => row.status === "joined" ? onUnavailable("Remove joined member") : onRemove(row))}>Remove</button></div>}
  </div>;
}
