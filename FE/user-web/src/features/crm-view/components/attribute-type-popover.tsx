import { Check, Search } from "lucide-react";
import { useEffect, useRef, useState, type KeyboardEvent, type RefObject } from "react";
import { createPortal } from "react-dom";
import { useAppI18n, type AppI18nKey } from "@/features/app-i18n";
import type { AttributeDefinitionValueType } from "@/features/crm-object";
import { AttributeTypeIcon } from "./attribute-type-icon";
import { ATTRIBUTE_TYPE_ICONS } from "./attribute-type-icons";

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
  const [placement, setPlacement] = useState<{ left: number; top: number; width: number; maxHeight: number } | null>(null);
  const types = Object.keys(ATTRIBUTE_TYPE_ICONS) as AttributeDefinitionValueType[];
  const query = search.trim().normalize("NFC").toLocaleLowerCase();
  const visible = types.filter(type => (t("attributeTypes." + type as AppI18nKey) + " " + type).normalize("NFC").toLocaleLowerCase().includes(query));

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
      const width = Math.min(408, rightEdge - leftEdge);
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
    className="fixed z-[100] flex flex-col overflow-hidden rounded-xl border border-[#E7E7E5] bg-white p-2 font-sans text-[14px] font-normal text-[#37352F] shadow-[0_8px_28px_rgba(0,0,0,0.12)]"
    style={placement ?? { left: 0, top: 0, width: 408, maxHeight: 440, visibility: "hidden" }}>
    <div className="flex min-w-0 shrink-0 items-center gap-2 px-2 pb-2 pt-1 text-[12px] text-[#8E8D87]">
      <span className="shrink-0 whitespace-nowrap">{t("attributeColumn.typeTitle")}</span>
      <button type="button" aria-label={t("attributeColumn.searchType")} title={t("attributeColumn.searchType")}
        aria-expanded={searchOpen} aria-controls={id + "-search"} disabled={disabled}
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-[#9B9A97] hover:bg-[#F1F1EF] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#4880EE]/45 disabled:opacity-50"
        onClick={() => { setSearchOpen(current => !current); setSearch(""); }}>
        <Search aria-hidden="true" className="h-3.5 w-3.5" />
      </button>
      {searchOpen && <input ref={searchRef} id={id + "-search"} type="search" aria-label={t("attributeColumn.searchType")} autoComplete="off"
        placeholder={t("attributeColumn.searchPlaceholder")} disabled={disabled} value={search}
        onChange={event => setSearch(event.target.value)}
        className="h-5 min-w-0 flex-1 rounded bg-[#F5F5F4] px-2 text-[13px] text-[#37352F] outline-none placeholder:text-[#A3A3A0]" />}
    </div>
    <div role="listbox" aria-label={t("attributeColumn.typeTitle")} className="grid min-h-0 grid-cols-2 content-start gap-x-1 overflow-y-auto overscroll-contain">
      {visible.map((type, index) => <button key={type} role="option" aria-selected={type === value}
        type="button" disabled={disabled} tabIndex={index === 0 ? 0 : -1}
        className="flex min-h-9 min-w-0 items-center gap-2 rounded px-2 text-left hover:bg-[#F1F1EF] focus-visible:bg-[#F1F1EF] focus-visible:outline-none disabled:opacity-50"
        onClick={() => onSelect(type)}>
        <AttributeTypeIcon type={type} />
        <span className="min-w-0 flex-1">{t("attributeTypes." + type as AppI18nKey)}</span>
        {type === value && <Check aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-[#8E8D87]" />}
      </button>)}
    </div>
    {visible.length === 0 && <p role="status" className="px-2 py-4 text-[13px] text-[#8E8D87]">{t("attributeColumn.noTypes")}</p>}
    {error && <div className="mt-2 shrink-0 border-t border-[#EEEDEA] px-2 pt-2 text-[12px]">
      <p id={id + "-error"} role="alert" className="text-[#B91C1C]">{error}</p>
      <button type="button" onClick={onRetry} className="mt-1 rounded px-2 py-1 text-[#37352F] hover:bg-[#F1F1EF] focus-visible:outline focus-visible:outline-2">{t("common.retry")}</button>
    </div>}
  </div>, document.body);
}
