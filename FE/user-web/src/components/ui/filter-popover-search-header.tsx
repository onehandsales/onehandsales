import { RotateCcw, Search, X } from "lucide-react";
import type { KeyboardEventHandler, RefObject } from "react";
import { cn } from "@/utils/cn";

type FilterPopoverSearchHeaderProps = {
  readonly clearSearchLabel: string;
  readonly inputRef: RefObject<HTMLInputElement | null>;
  readonly onClearSearch: () => void;
  readonly onReset: () => void;
  readonly onSearchChange: (value: string) => void;
  readonly onSearchKeyDown?: KeyboardEventHandler<HTMLInputElement>;
  readonly placeholder: string;
  readonly resetLabel: string;
  readonly searchLabel: string;
  readonly searchValue: string;
};

// 기능 : 필터 팝오버 상단의 회색 초기화 버튼과 검색 입력을 렌더링합니다.
export function FilterPopoverSearchHeader({
  clearSearchLabel,
  inputRef,
  onClearSearch,
  onReset,
  onSearchChange,
  onSearchKeyDown,
  placeholder,
  resetLabel,
  searchLabel,
  searchValue,
}: FilterPopoverSearchHeaderProps) {
  return (
    <div className="border-b border-[#E6EAF0] p-2">
      <div className="flex items-center gap-2">
        <button
          aria-label={resetLabel}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-[#6B7280] transition hover:bg-[#E5E7EB] hover:text-[#374151] focus:outline-none active:scale-[0.97]"
          onClick={onReset}
          type="button"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#6B7280]" />
          <input
            ref={inputRef}
            aria-label={searchLabel}
            autoComplete="off"
            className="h-8 w-full rounded-md border-0 bg-[#F3F4F6] pl-8 pr-7 text-[13px] text-[#111827] outline-none placeholder:text-[#9CA3AF]"
            onChange={(event) => onSearchChange(event.target.value)}
            onKeyDown={onSearchKeyDown}
            placeholder={placeholder}
            value={searchValue}
          />
          {searchValue ? (
            <button
              aria-label={clearSearchLabel}
              className={cn(
                "absolute right-1 top-1/2 grid h-7 w-7 -translate-y-1/2",
                "place-items-center rounded-full text-[#9CA3AF] transition",
                "hover:bg-[#E5E7EB] hover:text-[#374151]",
              )}
              onClick={onClearSearch}
              type="button"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
