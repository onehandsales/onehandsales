import { ChevronDown, Search, X, type LucideIcon } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
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
  readonly value: TValue;
};

type PopoverPosition = {
  readonly left: number;
  readonly top: number;
  readonly width: number;
};

// 기능 : 목록 필터 영역의 커스텀 단일 선택 드롭다운을 렌더링합니다.
export function ListFilterSelect<TValue extends string>({
  active = false,
  ariaLabel,
  className,
  disabled = false,
  icon: Icon,
  onChange,
  options,
  value,
}: ListFilterSelectProps<TValue>) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [popoverPosition, setPopoverPosition] =
    useState<PopoverPosition | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const selectedOption = useMemo(
    () => options.find((option) => option.value === value) ?? options[0],
    [options, value],
  );
  const normalizedQuery = normalizeListFilterText(search.trim());
  const filteredOptions =
    normalizedQuery.length > 0
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
      if (!inputRef.current) {
        return;
      }

      setPopoverPosition(getPopoverPosition(inputRef.current));
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
        inputRef.current?.focus();
      }
    };

    updatePopoverPosition();
    const focusFrame = window.requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", updatePopoverPosition);
    window.addEventListener("scroll", updatePopoverPosition, true);

    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", updatePopoverPosition);
      window.removeEventListener("scroll", updatePopoverPosition, true);
    };
  }, [isOpen]);

  const openOptions = (nextSearch: string) => {
    if (disabled) {
      return;
    }

    setSearch(nextSearch);

    if (inputRef.current) {
      setPopoverPosition(getPopoverPosition(inputRef.current));
    }

    setIsOpen(true);
  };

  const selectOption = (nextValue: TValue) => {
    onChange(nextValue);
    setSearch("");
    setIsOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div className={cn("relative shrink-0", className)} ref={wrapperRef}>
      <div className="relative">
        {!isOpen ? (
          <button
            aria-expanded={false}
            aria-haspopup="listbox"
            aria-label={ariaLabel}
            className={cn(
              "inline-flex h-8 w-full min-w-0 items-center gap-1.5 rounded-md border-0 bg-transparent px-2 text-[13px] font-semibold outline-none transition-[background-color,color,transform,opacity] duration-150 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60",
              active
                ? "text-[#1D4ED8] hover:bg-[#EFF6FF]"
                : "text-[#5F6368] hover:bg-[#F3F4F6]",
            )}
            disabled={disabled}
            onClick={() => openOptions("")}
            type="button"
          >
            {Icon ? <Icon className="h-3.5 w-3.5 shrink-0" /> : null}
            <span className="min-w-0 flex-1 truncate text-left">
              {displayLabel}
            </span>
            <ChevronDown className="h-3.5 w-3.5 shrink-0 text-[#9CA3AF]" />
          </button>
        ) : (
          <>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 shrink-0 -translate-y-1/2 text-[#6B7280]" />
            <input
              ref={inputRef}
              aria-autocomplete="list"
              aria-expanded={isOpen}
              aria-haspopup="listbox"
              aria-label={ariaLabel}
              autoComplete="off"
              className="h-8 w-full min-w-0 rounded-md border-0 bg-[#F3F4F6] pl-8 pr-7 text-[13px] text-[#111827] outline-none transition-[background-color,color,transform,opacity] duration-150 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={disabled}
              onChange={(event) => openOptions(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  setIsOpen(false);
                  setSearch("");
                  inputRef.current?.blur();
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
              value={search}
            />
            <button
              aria-label={`${ariaLabel} 닫기`}
              className="absolute right-1 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full text-[#9CA3AF] transition hover:bg-[#E5E7EB] hover:text-[#374151]"
              onClick={() => {
                setIsOpen(false);
                setSearch("");
              }}
              type="button"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </>
        )}
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
          <div className="max-h-[220px] overflow-y-auto py-1">
            {filteredOptions.length === 0 ? (
              <p className="px-3 py-3 text-[12px] text-[#9CA3AF]">
                검색 결과가 없습니다.
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

function getPopoverPosition(input: HTMLInputElement): PopoverPosition {
  const rect = input.getBoundingClientRect();
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
