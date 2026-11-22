import { useEffect, useLayoutEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MoreHorizontal } from "lucide-react";
type Action = { label: string; run: () => void };
// 기능 : 가로 스크롤 표 밖에서도 행 메뉴를 온전히 표시하고 키보드·닫기·복귀 초점을 관리한다.
export function ProjectActionMenu({ name, actions, label, width = 160 }: { name: string; actions: Action[]; label?: string; width?: number }) {
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null); const trigger = useRef<HTMLButtonElement>(null); const menu = useRef<HTMLDivElement>(null); const id = useId(); const anchor = useRef<DOMRect | null>(null);
  // 기능 : 실제 메뉴 높이와 폭으로 화면 경계를 다시 계산해 테두리·문구 확대도 잘리지 않게 한다.
  useLayoutEffect(function fitMenu() { const node = menu.current; if (!node || !position) return; const rect = node.getBoundingClientRect(); const top = Math.max(8, Math.min(position.top, window.innerHeight - rect.height - 8)); const left = Math.max(8, Math.min(position.left, window.innerWidth - rect.width - 8)); if (top !== position.top || left !== position.left) setPosition({ top, left }); }, [position]);
  // 기능 : 메뉴에 초점을 두고 외부 클릭/스크롤/폭 변경 때 원래 행을 유지하며 닫는다.
  useEffect(function observeOpen() { if (!position) return; menu.current?.querySelector<HTMLButtonElement>("button")?.focus({ preventScroll: true });
    // 기능 : 메뉴와 트리거 외부 클릭만 닫기로 해석한다.
    function outside(event: PointerEvent) { if (event.target instanceof Node && !menu.current?.contains(event.target) && !trigger.current?.contains(event.target)) setPosition(null); }
    // 기능 : 실제 트리거 위치가 바뀐 이동만 닫고 열기 전 지연 스크롤/메뉴 내부 스크롤은 무시한다.
    function moved(event: Event) { const rect = trigger.current?.getBoundingClientRect(); const previous = anchor.current; if (event.type === "scroll" && rect && previous && rect.top === previous.top && rect.left === previous.left && rect.right === previous.right && rect.bottom === previous.bottom) return; setPosition(null); if (menu.current?.contains(document.activeElement)) trigger.current?.focus({ preventScroll: true }); }
    document.addEventListener("pointerdown", outside); window.addEventListener("resize", moved); window.addEventListener("scroll", moved, true);
    return function cleanup() { document.removeEventListener("pointerdown", outside); window.removeEventListener("resize", moved); window.removeEventListener("scroll", moved, true); };
  }, [position]);
  // 기능 : 화면 경계 안에 메뉴를 배치하며 연속 클릭은 열림/닫힘으로 처리한다.
  function toggle() { if (position) { setPosition(null); return; } const rect = trigger.current?.getBoundingClientRect(); if (rect) { anchor.current = rect; setPosition({ left: Math.max(8, Math.min(rect.right - width, window.innerWidth - width - 8)), top: Math.max(8, Math.min(rect.bottom + 8, window.innerHeight - actions.length * 40 - 32)) }); } }
  return <><button ref={trigger} type="button" className="project-actions-trigger" aria-label={label ?? `Actions for ${name}`} aria-expanded={!!position} aria-haspopup="menu" aria-controls={position ? id : undefined} onClick={toggle} onKeyDown={event => { if (!position && event.key === "ArrowDown") { event.preventDefault(); toggle(); } }}><MoreHorizontal size={20} aria-hidden="true" /></button>{position && createPortal(<div ref={menu} id={id} role="menu" aria-label={`Project actions for ${name}`} className="project-action-menu" style={{ ...position, width }} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget) && !trigger.current?.contains(event.relatedTarget)) setPosition(null); }} onKeyDown={event => { if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); setPosition(null); trigger.current?.focus(); } if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) { event.preventDefault(); const items = Array.from(menu.current?.querySelectorAll<HTMLButtonElement>("button") ?? []); const current = items.findIndex(item => item === document.activeElement); items[event.key === "Home" ? 0 : event.key === "End" ? items.length - 1 : (current + (event.key === "ArrowUp" ? -1 : 1) + items.length) % items.length]?.focus(); } }}>{actions.map(action => <button key={action.label} type="button" role="menuitem" onClick={() => { trigger.current?.focus(); setPosition(null); action.run(); }}>{action.label}</button>)}</div>, document.body)}</>;
}
