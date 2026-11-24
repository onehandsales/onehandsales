import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { industries } from "../model/company-types";

// 기능 : 원본에 보인 업종만 검색·키보드·목록 선택으로 제공하고 미수록 자유 입력을 저장하지 않는다.
export function IndustryPicker({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false); const [query, setQuery] = useState(""); const [active, setActive] = useState(0); const id = useId(); const root = useRef<HTMLDivElement>(null); const input = useRef<HTMLInputElement>(null);
  const composing = useRef(false);
  const options = industries.filter(item => item.toLowerCase().includes(query.toLowerCase()));
  // 기능 : 선택 목록 밖 클릭은 입력값을 저장하지 않고 목록만 닫는다.
  useEffect(function listenOutside() {
    if (!open) return;
    // 기능 : 목록 밖의 포인터 선택은 현재 업종을 바꾸지 않고 닫는다.
    function close(event: PointerEvent) { if (event.target instanceof Node && !root.current?.contains(event.target)) setOpen(false); }
    document.addEventListener("pointerdown", close);
    // 기능 : 닫힌 목록의 전역 포인터 구독을 해제한다.
    return function cleanup() { document.removeEventListener("pointerdown", close); };
  }, [open]);
  // 기능 : 화살표로 이동한 활성 옵션이 스크롤 영역 안에 보이도록 한다.
  useEffect(function revealActive() { if (open) document.getElementById(id + "-" + active)?.scrollIntoView({ block: "nearest" }); }, [active, open, id]);
  // 기능 : 선택을 확정한 뒤 기존 입력으로 초점을 복귀한다.
  function choose(option: string) { if (composing.current) return; onChange(option); setOpen(false); setQuery(""); input.current?.focus(); }
  return <div className="setup-field setup-picker" ref={root} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}>
    <label htmlFor={id}>What kind of work does your business do?</label><div className="setup-picker-input"><input ref={input} id={id} role="combobox" aria-autocomplete="list" aria-expanded={open} aria-controls={open ? id + "-list" : undefined} aria-activedescendant={open && options[active] ? id + "-" + active : undefined} value={open ? query : value} placeholder="Type or select an option" autoComplete="off" maxLength={80} onCompositionStart={() => { composing.current = true; }} onCompositionEnd={() => { composing.current = false; }} onClick={() => { setOpen(true); setQuery(""); setActive(0); }} onChange={event => { setQuery(event.target.value); setActive(0); setOpen(true); }} onKeyDown={event => {
      if (composing.current || event.nativeEvent.isComposing || event.keyCode === 229) return;
      if (event.key === "ArrowDown" || event.key === "ArrowUp") { event.preventDefault(); if (!open) setQuery(""); setOpen(true); setActive(previous => open ? Math.max(0, Math.min(options.length - 1, previous + (event.key === "ArrowDown" ? 1 : -1))) : 0); }
      if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); setOpen(false); }
      if (event.key === "Enter" && open) { event.preventDefault(); if (options[active]) choose(options[active]); }
    }} /><ChevronDown size={14} aria-hidden="true" /></div>
    {open && <ul id={id + "-list"} role="listbox" aria-label="Observed industries">{options.map((option, index) => <li role="option" aria-selected={value === option} className={index === active ? "is-active" : ""} id={id + "-" + index} key={option} onPointerDown={event => event.preventDefault()} onPointerMove={() => setActive(index)} onClick={() => choose(option)}>{option}</li>)}{!options.length && <li role="presentation">No recorded option matches.</li>}</ul>}
  </div>;
}
