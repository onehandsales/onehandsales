import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { ChevronDown, Settings } from "lucide-react";
import type { TaskStatus, TaskStatusDefinition } from "../model/task-types";
import { taskStatusStyle } from "../model/task-status-values";
import { TaskStatusSettingsDialog } from "./task-status-settings";

// 기능 : 작업 상태 선택과 정의 설정을 분리하고 메뉴의 키보드·외부 클릭·초점 복귀를 관리한다.
export function TaskStatusPicker({ items, value, disabled, onChange }: { items: TaskStatusDefinition[]; value: TaskStatus; disabled: boolean; onChange: (value: TaskStatus) => void }) {
  const [open, setOpen] = useState(false); const [settings, setSettings] = useState(false);
  const root = useRef<HTMLDivElement>(null); const trigger = useRef<HTMLButtonElement>(null);
  const selected = items.find(item => item.id === value)!;
  // 기능 : 메뉴가 열릴 때 현재 상태에 초점을 두고 바깥 클릭 감지를 수명에 맞춰 해제한다.
  useEffect(function bindMenu() {
    if (!open) return; root.current?.querySelector<HTMLElement>('[aria-selected="true"]')?.focus();
    // 기능 : 상태 선택 영역 밖을 누르면 해당 메뉴만 닫는다.
    function outside(event: PointerEvent) { if (event.target instanceof Node && !root.current?.contains(event.target)) setOpen(false); }
    document.addEventListener("pointerdown", outside);
    // 기능 : 닫힌 메뉴의 전역 이벤트 구독을 정리한다.
    return function cleanup() { document.removeEventListener("pointerdown", outside); };
  }, [open]);
  // 기능 : 메뉴 종료 후 살아 있는 트리거로 초점을 돌린다.
  function closeMenu() { setOpen(false); trigger.current?.focus(); }
  // 기능 : 상태 의도를 한 번 전달하고 설정 변경과 독립적으로 저장한다.
  function choose(id: TaskStatus) { if (disabled) return; closeMenu(); onChange(id); }
  // 기능 : 상태와 설정 항목을 키보드로 탐색하고 Escape가 부모 패널까지 닫지 않게 한다.
  function keydown(event: KeyboardEvent<HTMLDivElement>) {
    if (!open || event.nativeEvent.isComposing) return;
    if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); closeMenu(); }
    if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
      event.preventDefault(); const buttons = [...root.current!.querySelectorAll<HTMLButtonElement>(".task-status-menu button")];
      const index = buttons.findIndex(button => button === document.activeElement);
      buttons[event.key === "Home" ? 0 : event.key === "End" ? buttons.length - 1 : (index + (event.key === "ArrowUp" ? -1 : 1) + buttons.length) % buttons.length]?.focus();
    }
  }
  // 기능 : 저장 중 선택을 막고 현재 메뉴의 열림만 전환한다.
  function toggleMenu() { if (!disabled) setOpen(!open); }
  // 기능 : 상태 설정은 메뉴 트리거를 복귀 대상으로 삼는 별도 모달로 연다.
  function openSettings() { closeMenu(); setSettings(true); }
  return <div ref={root} className="task-status-picker" onKeyDown={keydown}>
    <button type="button" ref={trigger} className="task-status" style={taskStatusStyle(selected)} aria-label="Task status" aria-haspopup="listbox" aria-expanded={open} aria-disabled={disabled} onClick={toggleMenu}><span aria-hidden="true">●</span><span>{selected.name}</span><ChevronDown size={14} /></button>
    {open && <div className="task-status-menu"><div role="listbox" aria-label="Task status options">{items.map(item => <button key={item.id} type="button" role="option" aria-selected={item.id === value} style={taskStatusStyle(item)} onClick={() => choose(item.id)}><i aria-hidden="true" />{item.name}</button>)}</div><button type="button" className="task-status-settings-link" onClick={openSettings}><Settings size={15} />Settings</button></div>}
    {settings && <TaskStatusSettingsDialog onClose={() => setSettings(false)} />}
  </div>;
}
