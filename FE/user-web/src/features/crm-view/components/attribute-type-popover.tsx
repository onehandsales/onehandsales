import { Check, HelpCircle, Search } from "lucide-react";
import { Fragment, useCallback, useEffect, useRef, useState, type KeyboardEvent, type RefObject } from "react";
import { createPortal } from "react-dom";
import { useAppI18n, type AppI18nKey } from "@/features/app-i18n";
import type { AttributeDefinitionValueType } from "@/features/crm-object";
import { cn } from "@/utils/cn";
import { AttributeTypeIcon } from "./attribute-type-icon";
import { AttributeTypeTooltip } from "./attribute-type-tooltip";

const POPOVER_WIDTH = 340;
// 실제 사용 통계가 아닌 제품에서 정한 예상 사용 빈도 순서로 묶는다.
const ATTRIBUTE_TYPE_GROUPS: readonly (readonly AttributeDefinitionValueType[])[] = [
  ["Text", "Number", "Select", "Status", "Date", "Currency", "Checkbox", "PhoneNumber"],
  ["EmailAddress", "Location", "RecordReference", "ActorReference"],
  ["Timestamp", "Rating", "Domain", "PersonalName", "Interaction"],
];
const ORDERED_ATTRIBUTE_TYPES = ATTRIBUTE_TYPE_GROUPS.flat();
const GROUP_STARTS = new Set(ATTRIBUTE_TYPE_GROUPS.slice(1).map(group => group[0]));

type AttributeTypePopoverProps = {
  readonly id: string;
  readonly anchorRef: RefObject<HTMLDivElement | null>;
  readonly panelRef: RefObject<HTMLDivElement | null>;
  readonly value: AttributeDefinitionValueType | "";
  readonly disabled: boolean;
  readonly error: string | null;
  readonly onSelect: (type: AttributeDefinitionValueType) => void;
  readonly onRetry: () => void;
};

// 기능 : 열 헤더에 연결된 검색·2열 유형 목록을 표의 스크롤 밖에 표시합니다.
export function AttributeTypePopover({ id, anchorRef, panelRef, value, disabled, error, onSelect, onRetry }: AttributeTypePopoverProps) {
  const { t } = useAppI18n();
  const searchRef = useRef<HTMLInputElement>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [help, setHelp] = useState<{ type: AttributeDefinitionValueType; anchor: HTMLElement } | null>(null);
  const helpTimers = useRef<{ open?: number; close?: number }>({});
  const [placement, setPlacement] = useState<{ left: number; top: number; width: number; maxHeight: number } | null>(null);
  const query = search.trim().normalize("NFC").toLocaleLowerCase();
  const visible = ORDERED_ATTRIBUTE_TYPES.filter(type => (t("attributeTypes." + type as AppI18nKey) + " " + type).normalize("NFC").toLocaleLowerCase().includes(query));
  const helpId = id + "-type-help";

  // 기능 : 도움말 표시·닫기 예약을 정리해 빠른 이동과 unmount 뒤 잔여 표시를 막습니다.
  const clearHelpTimers = useCallback(() => {
    window.clearTimeout(helpTimers.current.open);
    window.clearTimeout(helpTimers.current.close);
    helpTimers.current = {};
  }, []);
  const closeHelp = useCallback(() => { clearHelpTimers(); setHelp(null); }, [clearHelpTimers]);

  // 기능 : 아이콘 hover는 잠시 기다리고 키보드 포커스·터치는 즉시 설명을 표시합니다.
  function showHelp(type: AttributeDefinitionValueType, anchor: HTMLElement, delay = 250) {
    clearHelpTimers();
    if (disabled || help?.type === type) return;
    if (delay === 0) { setHelp({ type, anchor }); return; }
    setHelp(null);
    helpTimers.current.open = window.setTimeout(() => {
      if (anchor.isConnected) setHelp({ type, anchor });
    }, delay);
  }

  // 기능 : 아이콘에서 도움말로 포인터를 옮길 수 있도록 짧은 닫기 유예를 둡니다.
  function leaveHelp() {
    clearHelpTimers();
    helpTimers.current.close = window.setTimeout(() => setHelp(null), 120);
  }

  useEffect(() => {
    // 기능 : 키보드로 이동한 항목이 화면 안에 있으면 스크롤 후에도 설명을 유지합니다.
    function handleScroll() {
      const focused = document.activeElement;
      if (focused instanceof HTMLElement && panelRef.current?.contains(focused)
        && focused.matches(":focus-visible") && focused.getAttribute("aria-describedby") === helpId) {
        const rect = focused.getBoundingClientRect();
        const list = focused.closest('[role="listbox"]')?.getBoundingClientRect();
        if (list && rect.top >= list.top && rect.bottom <= list.bottom) return;
      }
      closeHelp();
    }
    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", closeHelp);
    window.visualViewport?.addEventListener("resize", closeHelp);
    window.visualViewport?.addEventListener("scroll", closeHelp);
    return () => {
      clearHelpTimers();
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", closeHelp);
      window.visualViewport?.removeEventListener("resize", closeHelp);
      window.visualViewport?.removeEventListener("scroll", closeHelp);
    };
  }, [clearHelpTimers, closeHelp, helpId, panelRef]);

  useEffect(() => {
    if (!help) return;
    // 기능 : 도움말을 먼저 닫고 컬럼 초안과 포커스는 유지합니다.
    function dismissHelp(event: globalThis.KeyboardEvent) {
      if (event.key !== "Escape" || event.isComposing || event.keyCode === 229) return;
      event.preventDefault(); event.stopPropagation(); closeHelp();
    }
    document.addEventListener("keydown", dismissHelp, true);
    return () => document.removeEventListener("keydown", dismissHelp, true);
  }, [help, closeHelp]);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus({ preventScroll: true });
  }, [searchOpen]);

  useEffect(() => {
    // 1. 부모 헤더의 ref까지 연결된 뒤 위치를 읽어 첫 표시부터 해당 열에 붙인다.
    const anchor = anchorRef.current, panel = panelRef.current;
    if (!anchor || !panel) return;

    // 기능 : 화면 가장자리·스크롤·모바일 키보드에 맞춰 팝오버 위치와 높이를 보정합니다.
    function updatePlacement() {
      if (!anchor || !panel) return;
      const rect = anchor.getBoundingClientRect(), viewport = window.visualViewport;
      const leftEdge = (viewport?.offsetLeft ?? 0) + 8;
      const topEdge = (viewport?.offsetTop ?? 0) + 8;
      const rightEdge = leftEdge + (viewport?.width ?? window.innerWidth) - 16;
      const bottomEdge = topEdge + (viewport?.height ?? window.innerHeight) - 16;
      const width = Math.min(POPOVER_WIDTH, rightEdge - leftEdge);
      const below = Math.max(0, bottomEdge - rect.bottom - 4);
      const above = Math.max(0, rect.top - topEdge - 4);
      const up = below < 440 && above > below;
      const maxHeight = Math.min(440, up ? above : below);
      const height = Math.min(panel.getBoundingClientRect().height, maxHeight);
      const next = {
        left: Math.max(leftEdge, Math.min(rect.left, rightEdge - width)),
        top: Math.max(topEdge, Math.min(up ? rect.top - height - 4 : rect.bottom + 4, bottomEdge - height)),
        width, maxHeight,
      };
      setPlacement(current => current?.left === next.left && current.top === next.top && current.width === next.width && current.maxHeight === next.maxHeight ? current : next);
    }

    updatePlacement();
    const observer = new ResizeObserver(updatePlacement);
    observer.observe(anchor); observer.observe(panel);
    window.addEventListener("resize", updatePlacement);
    window.addEventListener("scroll", updatePlacement, true);
    window.visualViewport?.addEventListener("resize", updatePlacement);
    window.visualViewport?.addEventListener("scroll", updatePlacement);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updatePlacement);
      window.removeEventListener("scroll", updatePlacement, true);
      window.visualViewport?.removeEventListener("resize", updatePlacement);
      window.visualViewport?.removeEventListener("scroll", updatePlacement);
    };
  }, [anchorRef, panelRef]);

  // 기능 : 검색창과 2열 목록 사이에서 방향키로 이동하고 Enter로 선택합니다.
  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.nativeEvent.isComposing || event.keyCode === 229 || disabled) return;
    const fromSearch = event.target === searchRef.current;
    if (fromSearch && event.key === "Enter") {
      event.preventDefault(); event.stopPropagation();
      if (visible[0]) onSelect(visible[0]);
      return;
    }
    if (!["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    if (fromSearch && !["ArrowDown", "ArrowUp"].includes(event.key)) return;
    const options = Array.from(panelRef.current?.querySelectorAll<HTMLButtonElement>('[role="option"]') ?? []);
    if (!options.length) return;
    event.preventDefault(); event.stopPropagation();
    const index = options.findIndex(option => option === document.activeElement);
    const delta = event.key === "ArrowDown" ? 2 : event.key === "ArrowUp" ? -2 : event.key === "ArrowRight" ? 1 : -1;
    const next = event.key === "Home" ? 0 : event.key === "End" ? options.length - 1
      : index < 0 ? event.key === "ArrowUp" ? options.length - 1 : 0
        : Math.max(0, Math.min(options.length - 1, index + delta));
    options[next]?.focus({ preventScroll: true });
    options[next]?.scrollIntoView({ block: "nearest" });
  }

  return createPortal(<div ref={panelRef} id={id} role="dialog" aria-label={t("attributeColumn.typeTitle")}
    data-testid="attribute-type-popover" onKeyDown={handleKeyDown}
    className="fixed z-[100] flex flex-col rounded-xl border border-[#E7E7E5] bg-white p-2 font-sans text-[12px] font-normal text-[#4B5563] shadow-[0_8px_28px_rgba(0,0,0,0.12)]"
    style={placement ?? { left: 0, top: 0, width: POPOVER_WIDTH, maxHeight: 440, visibility: "hidden" }}>
    <div className="flex min-w-0 shrink-0 items-center gap-2 px-2 pb-2 pt-1 text-[12px]">
      <span className="shrink-0 whitespace-nowrap text-[#9CA3AF]">{t("attributeColumn.typeTitle")}</span>
      <button type="button" aria-label={t("attributeColumn.searchType")} title={t("attributeColumn.searchType")}
        aria-expanded={searchOpen} aria-controls={id + "-search"} disabled={disabled}
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-[#9B9A97] hover:bg-[#E4E2DC] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#4880EE]/45 active:bg-[#D3D1CB] disabled:opacity-50"
        onClick={() => { closeHelp(); setSearchOpen(current => !current); setSearch(""); }}>
        <Search aria-hidden="true" className="h-4 w-4 shrink-0" />
      </button>
      {searchOpen && <input ref={searchRef} id={id + "-search"} type="search" aria-label={t("attributeColumn.searchType")} autoComplete="off"
        placeholder={t("attributeColumn.searchPlaceholder")} disabled={disabled} value={search}
        onChange={event => { closeHelp(); setSearch(event.target.value); }}
        className="h-5 min-w-0 flex-1 rounded bg-[#F5F5F4] px-2 text-[12px] text-[#4B5563] outline-none placeholder:text-[#A3A3A0]" />}
    </div>
    <div role="listbox" aria-label={t("attributeColumn.typeTitle")} className="grid min-h-0 grid-cols-2 content-start gap-x-1 overflow-y-auto overscroll-contain">
      {visible.map((type, index) => <Fragment key={type}>
        {!query && GROUP_STARTS.has(type) && <div aria-hidden="true" className="col-span-2 mx-2 my-2 h-px bg-[#EEEDEA]" />}
        <button role="option" aria-selected={type === value}
          aria-label={t("attributeTypes." + type as AppI18nKey)}
          aria-describedby={help?.type === type ? helpId : id + "-description-" + type}
          type="button" disabled={disabled} tabIndex={index === 0 ? 0 : -1}
          className={cn("group/attribute-type-option flex min-h-9 min-w-0 items-center gap-2 rounded px-2 text-left transition-colors hover:bg-[#E4E2DC] hover:text-[#111827] focus-visible:bg-[#E4E2DC] focus-visible:text-[#111827] focus-visible:outline-none active:bg-[#D3D1CB] disabled:opacity-50",
            type === value ? "bg-[#E4E2DC] text-[#111827]" : "text-[#4B5563]")}
          onFocus={event => {
            if (event.currentTarget.matches(":focus-visible")) {
              const anchor = event.currentTarget.querySelector<HTMLElement>('[data-testid="attribute-type-help"]');
              if (anchor) showHelp(type, anchor, 0);
            }
          }}
          onBlur={closeHelp}
          onClick={() => { closeHelp(); onSelect(type); }}>
          <AttributeTypeIcon type={type} className={cn("transition-colors group-hover/attribute-type-option:text-[#6B7280] group-focus-visible/attribute-type-option:text-[#6B7280]", type === value && "text-[#6B7280]")} />
          <span className="min-w-0 flex-1">{t("attributeTypes." + type as AppI18nKey)}</span>
          <span className="relative h-4 w-4 shrink-0">
            {type === value && <Check aria-hidden="true" className="absolute inset-0 h-4 w-4 text-[#6B7280] transition-opacity group-hover/attribute-type-option:opacity-0 group-focus-visible/attribute-type-option:opacity-0 [@media(hover:none)]:opacity-0" />}
            <span data-testid="attribute-type-help" aria-hidden="true"
              className="absolute inset-0 cursor-help text-[#9CA3AF] opacity-0 transition-opacity duration-150 hover:text-[#6B7280] group-hover/attribute-type-option:opacity-100 group-focus-visible/attribute-type-option:opacity-100 motion-reduce:transition-none [@media(hover:none)]:opacity-100"
              onPointerEnter={event => { if (event.pointerType !== "touch") showHelp(type, event.currentTarget); }}
              onPointerLeave={event => { if (event.pointerType !== "touch") leaveHelp(); }}
              onPointerDown={event => {
                event.preventDefault(); event.stopPropagation();
                if (event.pointerType === "touch") showHelp(type, event.currentTarget, 0);
              }}
              onClick={event => { event.preventDefault(); event.stopPropagation(); }}>
              <HelpCircle className="h-4 w-4" />
            </span>
          </span>
          <span id={id + "-description-" + type} className="sr-only">{t("attributeTypeDescriptions." + type as AppI18nKey)}</span>
        </button>
      </Fragment>)}
    </div>
    {visible.length === 0 && <p role="status" className="px-2 py-4 text-[12px]">{t("attributeColumn.noTypes")}</p>}
    {help && !disabled && <AttributeTypeTooltip id={helpId} anchor={help.anchor}
      description={t("attributeTypeDescriptions." + help.type as AppI18nKey)}
      onEnter={clearHelpTimers} onLeave={leaveHelp} />}
    {error && <div className="mt-2 shrink-0 border-t border-[#EEEDEA] px-2 pt-2 text-[12px]">
      <p id={id + "-error"} role="alert" className="text-[#B91C1C]">{error}</p>
      <button type="button" onClick={onRetry} className="mt-1 rounded px-2 py-1 hover:bg-[#F1F1EF] hover:text-[#111827] focus-visible:text-[#111827] focus-visible:outline focus-visible:outline-2">{t("common.retry")}</button>
    </div>}
  </div>, document.body);
}
