import { Check, ChevronDown, Search } from "lucide-react";
import { type KeyboardEvent, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { IconValueGlyph } from "@/components/ui/icon-value-glyph";
import type { SidebarCrmObjectListItem } from "@/features/crm-object";
import { cn } from "@/utils/cn";

type ListSourcePickerProps = {
  readonly label: string;
  readonly placeholder: string;
  readonly searchLabel: string;
  readonly emptyLabel: string;
  readonly items: readonly SidebarCrmObjectListItem[];
  readonly value: string;
  readonly onChange: (value: string) => void;
};

const optionClass = "flex h-8 w-full shrink-0 items-center gap-2 rounded px-2 text-left hover:bg-[#E4E2DC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#4880EE]/40";

// 기능 : 업무 목록의 관리 대상을 검색·아이콘·선택 표시가 있는 팝오버로 선택합니다.
export function ListSourcePicker({ label, placeholder, searchLabel, emptyLabel, items, value, onChange }: ListSourcePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [placement, setPlacement] = useState({ up: false, maxHeight: 296 });
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const panelId = useId();
  const labelId = useId();
  const selected = items.find(item => item.id === value);
  const query = search.trim().toLocaleLowerCase();
  const visibleItems = items.filter(item => item.singularName.toLocaleLowerCase().includes(query));

  // 기능 : 선택 메뉴를 열 때 이전 검색어를 비웁니다.
  function openMenu() {
    setSearch("");
    setIsOpen(true);
  }

  // 기능 : 메뉴를 닫고 관리 대상 선택창으로 초점을 돌립니다.
  function closeMenu() {
    setIsOpen(false);
    triggerRef.current?.focus({ preventScroll: true });
  }

  // 기능 : 관리 대상을 변경하고 기존 제목·상태 초기화 흐름을 호출합니다.
  function selectItem(id: string) {
    if (id !== value) onChange(id);
    closeMenu();
  }

  useLayoutEffect(() => {
    if (!isOpen) return;
    const trigger = triggerRef.current;
    const boundary = trigger?.closest("form");
    if (!trigger || !boundary) return;

    // 기능 : 모달의 스크롤 경계와 화면 안에서 메뉴 방향·최대 높이를 정합니다.
    function updatePlacement() {
      if (!trigger || !boundary) return;
      const rect = trigger.getBoundingClientRect();
      const bounds = boundary.getBoundingClientRect();
      const viewport = window.visualViewport;
      const top = Math.max(bounds.top, viewport?.offsetTop ?? 0) + 8;
      const bottom = Math.min(bounds.bottom, (viewport?.offsetTop ?? 0) + (viewport?.height ?? window.innerHeight)) - 8;
      const above = Math.max(0, rect.top - top - 6);
      const below = Math.max(0, bottom - rect.bottom - 6);
      const up = below < 296 && above > below;
      setPlacement({ up, maxHeight: Math.min(296, up ? above : below) });
    }

    updatePlacement();
    searchRef.current?.focus({ preventScroll: true });
    const observer = new ResizeObserver(updatePlacement);
    observer.observe(trigger);
    observer.observe(boundary);
    boundary.addEventListener("scroll", updatePlacement);
    window.addEventListener("resize", updatePlacement);
    window.visualViewport?.addEventListener("resize", updatePlacement);
    window.visualViewport?.addEventListener("scroll", updatePlacement);
    return () => {
      observer.disconnect();
      boundary.removeEventListener("scroll", updatePlacement);
      window.removeEventListener("resize", updatePlacement);
      window.visualViewport?.removeEventListener("resize", updatePlacement);
      window.visualViewport?.removeEventListener("scroll", updatePlacement);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    // 기능 : 메뉴 밖에서 다른 조작을 시작하면 초점을 빼앗지 않고 닫습니다.
    function handleOutsidePointer(event: PointerEvent) {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target)) setIsOpen(false);
    }
    document.addEventListener("pointerdown", handleOutsidePointer);
    return () => document.removeEventListener("pointerdown", handleOutsidePointer);
  }, [isOpen]);

  // 기능 : 모달을 유지한 채 Escape로 닫고 방향키·Enter로 항목을 선택합니다.
  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (!isOpen || event.nativeEvent.isComposing) return;
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      closeMenu();
      return;
    }
    const fromInput = event.target === searchRef.current;
    if (fromInput && event.key === "Enter") {
      event.preventDefault();
      if (visibleItems[0]) selectItem(visibleItems[0].id);
      return;
    }
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
    if (fromInput && (event.key === "Home" || event.key === "End")) return;
    const options = Array.from(rootRef.current?.querySelectorAll<HTMLButtonElement>('[role="option"]') ?? []);
    if (!options.length) return;
    event.preventDefault();
    const index = options.findIndex(option => option === document.activeElement);
    const next = event.key === "Home" ? 0 : event.key === "End" ? options.length - 1
      : event.key === "ArrowDown" ? (index + 1) % options.length
        : index <= 0 ? options.length - 1 : index - 1;
    options[next]?.focus({ preventScroll: true });
    options[next]?.scrollIntoView({ block: "nearest" });
  }

  return (
    <div className="grid min-w-0 gap-2 text-sm" onKeyDown={handleKeyDown} ref={rootRef}
      onBlur={event => {
        if (!event.currentTarget.contains(event.relatedTarget)) setIsOpen(false);
      }}>
      <label htmlFor="list-source" id={labelId}>{label}</label>
      <div className="relative min-w-0">
        <button
          aria-controls={isOpen ? panelId : undefined}
          aria-expanded={isOpen}
          aria-haspopup="dialog"
          aria-labelledby={labelId}
          className="flex h-11 w-full min-w-0 items-center gap-2 rounded-md border border-[#E4E2DC] bg-white px-3 text-left text-sm outline-none focus:border-[#E4E2DC]"
          id="list-source"
          onClick={() => isOpen ? closeMenu() : openMenu()}
          onKeyDown={event => {
            if (!isOpen && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
              event.preventDefault();
              openMenu();
            }
          }}
          ref={triggerRef}
          role="combobox"
          type="button"
        >
          {selected && <IconValueGlyph className="h-3.5 w-3.5 shrink-0 text-[#8E8D87]" name={selected.icon} />}
          <span className={cn("min-w-0 flex-1 truncate", !selected && "text-[#9B9A97]")}>{selected?.singularName ?? placeholder}</span>
          <ChevronDown aria-hidden="true" className={cn("h-3.5 w-3.5 shrink-0 text-[#A4A39E] transition-transform", isOpen && "rotate-180")} />
        </button>
        {isOpen && <div
          aria-label={label}
          className={cn("absolute left-0 z-50 flex w-full min-w-0 flex-col overflow-hidden rounded-lg border border-[#E7E6E2] bg-white p-1.5 text-[12px] text-[#37352F] shadow-[0_8px_28px_rgba(15,23,42,0.12)]", placement.up ? "bottom-[calc(100%+6px)]" : "top-[calc(100%+6px)]")}
          id={panelId}
          role="dialog"
          style={{ maxHeight: placement.maxHeight }}
        >
          <label className="m-1 mb-1.5 flex h-8 shrink-0 items-center gap-2 rounded bg-[#F4F3F0] px-2">
            <Search aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-[#9B9A97]" />
            <input aria-label={searchLabel} autoComplete="off" className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-[#9B9A97]" onChange={event => setSearch(event.target.value)} placeholder={searchLabel} ref={searchRef} value={search} />
          </label>
          <div aria-label={label} className="min-h-0 max-h-60 overflow-y-auto overscroll-contain" role="listbox">
            {!query && <button aria-selected={!value} className={cn(optionClass, "text-[#9B9A97]")} onClick={() => selectItem("")} role="option" tabIndex={-1} type="button">
              <span className="min-w-0 flex-1 truncate">{placeholder}</span>
              {!value && <Check aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />}
            </button>}
            {visibleItems.map(item => <button aria-selected={item.id === value} className={optionClass} key={item.id} onClick={() => selectItem(item.id)} role="option" tabIndex={-1} type="button">
              <IconValueGlyph className="h-3.5 w-3.5 shrink-0 text-[#8E8D87]" name={item.icon} />
              <span className="min-w-0 flex-1 truncate" title={item.singularName}>{item.singularName}</span>
              {item.id === value && <Check aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />}
            </button>)}
            {visibleItems.length === 0 && <p className="px-2 py-3 text-[#9B9A97]" role="status">{emptyLabel}</p>}
          </div>
        </div>}
      </div>
    </div>
  );
}
