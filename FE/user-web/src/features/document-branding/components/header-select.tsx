import { useEffect, useId, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { ChevronDown, Crown } from "lucide-react";
import type { HeaderPreset } from "../model/branding-types";
const options = [{ id: "none", label: "No image" }, { id: "abstract", label: "Abstract" }, { id: "plant", label: "Plant" }, { id: "desk", label: "Desk" }, { id: "custom", label: "Custom Header" }];
// 기능 : 관찰된 헤더 목록과 키보드 선택을 제공하고 미수록 옵션은 현재 선택을 바꾸지 않고 안내한다.
export function HeaderSelect({ value, disabled, onChange, onUnavailable }: { value: HeaderPreset; disabled: boolean; onChange: (value: HeaderPreset) => void; onUnavailable: (name: string) => void }) {
  const [open, setOpen] = useState(false); const [active, setActive] = useState(0); const root = useRef<HTMLDivElement>(null); const trigger = useRef<HTMLButtonElement>(null); const id = useId();
  // 기능 : 외부 클릭·초점 이탈은 현재 선택을 그대로 두고 목록만 닫는다.
  useEffect(function watchOutside() {
    if (!open) return;
    // 기능 : 목록 바깥으로 향한 사용자 의도를 감지한다.
    function outside(event: Event) { if (event.target instanceof Node && !root.current?.contains(event.target)) setOpen(false); }
    document.addEventListener("pointerdown", outside); document.addEventListener("focusin", outside);
    return function cleanup() { document.removeEventListener("pointerdown", outside); document.removeEventListener("focusin", outside); };
  }, [open]);
  // 기능 : 확대나 짧은 목록에서 키보드 활성 행을 스크롤 영역 안에 유지한다.
  useEffect(function revealActive() { if (open) document.getElementById(id + "-" + active)?.scrollIntoView({ block: "nearest" }); }, [open, active, id]);
  // 기능 : 열 때 저장된 선택을 활성 행으로 맞춘다.
  function toggle() { setActive(options.findIndex(option => option.id === value)); setOpen(!open); }
  // 기능 : 선택 결과와 미수록 안내를 분리하고 목록 트리거에 초점을 복원한다.
  function select(index: number) {
    const option = options[index]; if (!option) return;
    setOpen(false); trigger.current?.focus();
    if (option.id === "none" || option.id === "abstract" || option.id === "plant") onChange(option.id); else onUnavailable(option.label);
  }
  // 기능 : 화살표·처음/끝·Enter·Escape로 목록을 조작하며 조합 입력은 확정하지 않는다.
  function keyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.nativeEvent.isComposing) return;
    if (event.key === "Escape") { if (open) { event.preventDefault(); event.stopPropagation(); setOpen(false); } return; }
    if (event.key === "Tab") { setOpen(false); return; }
    if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
      event.preventDefault(); const current = open ? active : options.findIndex(option => option.id === value);
      setOpen(true); setActive(event.key === "Home" ? 0 : event.key === "End" ? options.length - 1 : (current + (event.key === "ArrowDown" ? 1 : -1) + options.length) % options.length);
    } else if (open && (event.key === "Enter" || event.key === " ")) { event.preventDefault(); select(active); }
  }
  return <div className="brand-header-select" ref={root}><span id={id + "-label"}>Header Image</span><button type="button" ref={trigger} role="combobox" aria-labelledby={id + "-label"} aria-expanded={open} aria-controls={id} aria-haspopup="listbox" aria-activedescendant={open ? id + "-" + active : undefined} disabled={disabled} onClick={toggle} onKeyDown={keyDown}>{options.find(option => option.id === value)?.label}<ChevronDown aria-hidden="true" size={16} /></button>
    {open && <div id={id} role="listbox" aria-labelledby={id + "-label"} className="brand-header-options">{options.map((option, index) => <button type="button" role="option" tabIndex={-1} id={id + "-" + index} aria-selected={option.id === value} data-active={index === active} key={option.id} onPointerMove={() => setActive(index)} onClick={() => select(index)}>{option.label}{option.id === "custom" && <Crown size={15} aria-hidden="true" />}</button>)}</div>}
  </div>;
}
