import { ChevronDown, type LucideIcon } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { FilterPopoverSearchHeader } from "@/components/ui/filter-popover-search-header";
import { cn } from "@/utils/cn";

export type ListFilterSelectOption<TValue extends string> = {
  readonly value: TValue;
  readonly label: string;
};

type ListFilterSelectProps<TValue extends string> = {
  readonly active?: boolean;
  readonly ariaLabel: string;
  readonly className?: string;
  readonly disabled?: boolean;
  readonly icon?: LucideIcon;
  readonly onChange: (value: TValue) => void;
  readonly options: readonly ListFilterSelectOption<TValue>[];
  readonly searchable?: boolean;
  readonly value: TValue;
};

type PopoverPosition = {
  readonly left: number;
  readonly top: number;
  readonly width: number;
};

// 기능 : 목록 필터 영역의 단일 선택 드롭다운을 렌더링합니다.
export function ListFilterSelect<TValue extends string>({
  active = false,
  ariaLabel,
  disabled = false,
  icon: Icon,
  onChange,
  options,
  searchable = true,
  value,
}: ListFilterSelectProps<TValue>) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [popoverPosition, setPopoverPosition] =
    useState<PopoverPosition | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const selectedOption = useMemo(
    () => options.find((option) => option.value === value) ?? options[0],
    [options, value],
  );
  const normalizedQuery = normalizeListFilterText(search.trim());
  const filteredOptions =
    searchable && normalizedQuery.length > 0
      ? options.filter((option) =>
          normalizeListFilterText(option.label).includes(normalizedQuery),
        )
      : options;
  const displayLabel = selectedOption?.label ?? ariaLabel;

  useEffect(() => {
    if (!isOpen) {
      setSearch("");
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const updatePopoverPosition = () => {
      if (!triggerRef.current) {
        return;
      }

      setPopoverPosition(getPopoverPosition(triggerRef.current));
    };
    const onMouseDown = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    updatePopoverPosition();
    const focusFrame = searchable
      ? window.requestAnimationFrame(() => {
          inputRef.current?.focus();
        })
      : null;
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", updatePopoverPosition);
    window.addEventListener("scroll", updatePopoverPosition, true);

    return () => {
      if (focusFrame !== null) {
        window.cancelAnimationFrame(focusFrame);
      }
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", updatePopoverPosition);
      window.removeEventListener("scroll", updatePopoverPosition, true);
    };
  }, [isOpen, searchable]);

  const openOptions = (nextSearch: string) => {
    if (disabled) {
      return;
    }

    setSearch(nextSearch);

    if (triggerRef.current) {
      setPopoverPosition(getPopoverPosition(triggerRef.current));
    }

    setIsOpen(true);
  };

  const selectOption = (nextValue: TValue) => {
    onChange(nextValue);
    setSearch("");
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  const resetOption = () => {
    const defaultOption = options[0];

    if (!defaultOption) {
      return;
    }

    selectOption(defaultOption.value);
  };

  return (
    <div className={cn("relative w-auto shrink-0")} ref={wrapperRef}>
      <div className="relative">
        <button
          ref={triggerRef}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-label={ariaLabel}
          className={cn(
            "inline-flex h-8 min-w-0 items-center gap-1.5 rounded-md border-0 bg-transparent px-2 text-[13px] font-semibold outline-none transition-[background-color,color,transform,opacity] duration-150 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60",
            isOpen
              ? "bg-[#F3F4F6] text-[#374151]"
              : active
                ? "text-[#1D4ED8] hover:bg-[#EFF6FF]"
                : "text-[#5F6368] hover:bg-[#F3F4F6]",
          )}
          disabled={disabled}
          onClick={() => (isOpen ? setIsOpen(false) : openOptions(""))}
          type="button"
        >
          {Icon ? <Icon className="h-3.5 w-3.5 shrink-0" /> : null}
          <span className="min-w-0 truncate text-left">{displayLabel}</span>
          <ChevronDown
            className={cn(
              "h-3.5 w-3.5 shrink-0 text-[#9CA3AF] transition-transform",
              isOpen && "rotate-180",
            )}
          />
        </button>
      </div>

      {isOpen ? (
        <div
          className={cn(
            "fixed z-50 overflow-hidden rounded-md border border-[#E6EAF0] bg-white shadow-lg",
            !popoverPosition && "invisible",
          )}
          role="listbox"
          style={{
            left: popoverPosition?.left ?? 0,
            top: popoverPosition?.top ?? 0,
            width: popoverPosition?.width ?? 184,
          }}
        >
          {searchable ? (
            <FilterPopoverSearchHeader
              clearSearchLabel={`${ariaLabel} 검색어 지우기`}
              inputRef={inputRef}
              onClearSearch={() => setSearch("")}
              onReset={resetOption}
              onSearchChange={setSearch}
              onSearchKeyDown={(event) => {
                if (event.key === "Escape") {
                  setIsOpen(false);
                  setSearch("");
                  triggerRef.current?.focus();
                  return;
                }

                if (event.key === "Enter") {
                  const firstOption = filteredOptions[0];

                  if (!firstOption) {
                    return;
                  }

                  event.preventDefault();
                  selectOption(firstOption.value);
                }
              }}
              placeholder={ariaLabel}
              resetLabel={`${ariaLabel} 초기화`}
              searchLabel={`${ariaLabel} 검색`}
              searchValue={search}
            />
          ) : null}
          <div className="max-h-[220px] overflow-y-auto py-1">
            {filteredOptions.length === 0 ? (
              <p className="px-3 py-3 text-[12px] text-[#9CA3AF]">
                검색어를 바꾸면 결과를 찾을 수 있어요.
              </p>
            ) : null}
            {filteredOptions.map((option) => {
              const isSelected = option.value === value;

              return (
                <button
                  aria-selected={isSelected}
                  className={cn(
                    "flex h-8 w-full min-w-0 items-center gap-2 px-3 text-left text-[13px] transition hover:bg-[#F9FAFB]",
                    isSelected && "bg-[#EFF6FF] font-semibold text-[#1D4ED8]",
                  )}
                  key={option.value}
                  onClick={() => selectOption(option.value)}
                  role="option"
                  type="button"
                >
                  <span
                    className={cn(
                      "grid h-3.5 w-3.5 shrink-0 place-items-center rounded-full border",
                      isSelected ? "border-[#E2E5EC]" : "border-[#CBD5E1]",
                    )}
                  >
                    {isSelected ? (
                      <span className="h-1.5 w-1.5 rounded-full bg-[#4880EE]" />
                    ) : null}
                  </span>
                  <span className="min-w-0 flex-1 truncate">{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function getPopoverPosition(trigger: HTMLButtonElement): PopoverPosition {
  const rect = trigger.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const margin = 16;
  const width = Math.max(rect.width, 256);
  const maxLeft = Math.max(margin, viewportWidth - width - margin);
  const left = Math.min(Math.max(rect.left, margin), maxLeft);

  return {
    left,
    top: rect.bottom + 4,
    width,
  };
}

function normalizeListFilterText(value: string) {
  return value.toLowerCase().replace(/\s+/g, "");
}
