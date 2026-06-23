import { ChevronDown, RotateCcw, Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/utils/cn";

type SummaryTaxonomyItem = {
  readonly id: string;
};

type SummaryTaxonomyTone = "amber" | "green" | "blue" | "slate";

type SummaryTaxonomyPopoverPosition = {
  readonly left: number;
  readonly top: number;
  readonly width: number;
};

export function SummaryTaxonomySelect<TItem extends SummaryTaxonomyItem>({
  emptyText,
  getLabel,
  id,
  invalid,
  itemKindLabel,
  items,
  selectedId,
  tone,
  widthClassName,
  onSelect,
}: {
  readonly emptyText: string;
  readonly getLabel: (item: TItem) => string;
  readonly id: string;
  readonly invalid: boolean;
  readonly itemKindLabel: string;
  readonly items: readonly TItem[];
  readonly selectedId: string;
  readonly tone: SummaryTaxonomyTone;
  readonly widthClassName: string;
  readonly onSelect: (id: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [popoverPosition, setPopoverPosition] =
    useState<SummaryTaxonomyPopoverPosition | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const selectedItem = useMemo(
    () => items.find((item) => item.id === selectedId),
    [items, selectedId]
  );
  const selectedLabel = selectedItem ? getLabel(selectedItem) : "";
  const normalizedQuery = normalizeSummaryTaxonomyText(search);
  const filteredItems =
    normalizedQuery.length > 0
      ? items.filter((item) =>
          normalizeSummaryTaxonomyText(getLabel(item)).includes(normalizedQuery)
        )
      : items;
  const inputValue = isOpen ? search : selectedLabel;

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

      setPopoverPosition(getSummaryTaxonomyPopoverPosition(inputRef.current));
    };
    const onMouseDown = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearch("");
      }
    };

    updatePopoverPosition();
    document.addEventListener("mousedown", onMouseDown);
    window.addEventListener("resize", updatePopoverPosition);
    window.addEventListener("scroll", updatePopoverPosition, true);

    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("resize", updatePopoverPosition);
      window.removeEventListener("scroll", updatePopoverPosition, true);
    };
  }, [isOpen]);

  const openOptions = (nextSearch: string) => {
    setSearch(nextSearch);

    if (inputRef.current) {
      setPopoverPosition(getSummaryTaxonomyPopoverPosition(inputRef.current));
    }

    setIsOpen(true);
  };

  const selectItem = (id: string) => {
    onSelect(id);
    setSearch("");
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const clearSelection = () => {
    onSelect("");
    setSearch("");
    inputRef.current?.focus();
    openOptions("");
  };

  return (
    <div className="flex items-center gap-1.5 text-[13px]">
      <label className="shrink-0 font-semibold text-[#9CA3AF]" htmlFor={id}>
        {itemKindLabel}
      </label>
      <div ref={wrapperRef} className={cn("relative shrink-0", widthClassName)}>
        <div className="relative">
          {isOpen ? (
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3 w-3 -translate-y-1/2 text-[#9CA3AF]" />
          ) : null}
          <input
            ref={inputRef}
            aria-autocomplete="list"
            aria-expanded={isOpen}
            aria-invalid={invalid}
            aria-label={`${itemKindLabel} 선택`}
            autoComplete="off"
            className={cn(
              "h-8 w-full min-w-0 rounded-full border outline-none transition",
              isOpen
                ? "border-[#2563EB] bg-white pl-8 pr-7 text-[#111827] ring-1 ring-[#2563EB]"
                : selectedId
                  ? cn(
                      getSummaryTaxonomyInputSelectedClass(tone),
                      "cursor-pointer pl-3.5 pr-7"
                    )
                  : "cursor-pointer border-[#E2E5EC] bg-transparent pl-3.5 pr-7 text-[#6B7280] hover:border-[#D1D5DB] hover:bg-[#F5F6F8]",
              invalid && "border-[#B91C1C] ring-1 ring-[#B91C1C]"
            )}
            id={id}
            onChange={(event) => openOptions(event.target.value)}
            onFocus={() => openOptions("")}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                setIsOpen(false);
                setSearch("");
                inputRef.current?.blur();
                return;
              }

              if (event.key === "Enter") {
                const firstItem = filteredItems[0];
                if (!firstItem) {
                  return;
                }

                event.preventDefault();
                selectItem(firstItem.id);
              }
            }}
            placeholder={`${itemKindLabel} 선택`}
            value={inputValue}
          />
          {selectedId || search ? (
            <button
              aria-label={`${itemKindLabel} 선택 지우기`}
              className="absolute right-1 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full text-[#9CA3AF] transition hover:bg-white hover:text-[#374151]"
              onClick={clearSelection}
              type="button"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : (
            <ChevronDown
              className={cn(
                "pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9CA3AF] transition-transform",
                isOpen && "rotate-180"
              )}
            />
          )}
        </div>

        {isOpen ? (
          <div
            className={cn(
              "fixed z-50 overflow-hidden rounded-md border border-[#E6EAF0] bg-white shadow-lg",
              !popoverPosition && "invisible"
            )}
            style={{
              left: popoverPosition?.left ?? 0,
              top: popoverPosition?.top ?? 0,
              width: popoverPosition?.width ?? 256,
            }}
          >
            <button
              className={cn(
                "flex h-9 w-full items-center gap-1.5 px-3 text-left text-[13px] transition hover:bg-[#F9FAFB]",
                selectedId
                  ? "font-medium text-[#475569]"
                  : "font-semibold text-[#1D4ED8]"
              )}
              onClick={() => selectItem("")}
              type="button"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              {itemKindLabel} 초기화
            </button>

            <div className="max-h-[184px] overflow-y-auto border-t border-[#E6EAF0] py-1">
              {filteredItems.length === 0 ? (
                <p className="px-3 py-3 text-[12px] text-[#9CA3AF]">
                  {emptyText}
                </p>
              ) : (
                filteredItems.map((item) => {
                  const isSelected = selectedId === item.id;

                  return (
                    <button
                      className={cn(
                        "flex h-8 w-full min-w-0 items-center gap-2 px-3 text-left text-[13px] transition hover:bg-[#F9FAFB]",
                        isSelected && getSummaryTaxonomyItemSelectedClass(tone)
                      )}
                      key={item.id}
                      onClick={() => selectItem(item.id)}
                      type="button"
                    >
                      <span
                        className={cn(
                          "grid h-3.5 w-3.5 shrink-0 place-items-center rounded-full border",
                          isSelected
                            ? getSummaryTaxonomyCheckBorderClass(tone)
                            : "border-[#CBD5E1]"
                        )}
                      >
                        {isSelected ? (
                          <span
                            className={cn(
                              "h-1.5 w-1.5 rounded-full",
                              getSummaryTaxonomyCheckDotClass(tone)
                            )}
                          />
                        ) : null}
                      </span>
                      <span className="min-w-0 flex-1 truncate">
                        {getLabel(item)}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function getSummaryTaxonomyPopoverPosition(
  input: HTMLInputElement
): SummaryTaxonomyPopoverPosition {
  const rect = input.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const margin = 16;
  const width = Math.min(256, Math.max(200, viewportWidth - margin * 2));
  const maxLeft = Math.max(margin, viewportWidth - width - margin);
  const left = Math.min(Math.max(rect.left, margin), maxLeft);

  return {
    left,
    top: rect.bottom + 4,
    width,
  };
}

function normalizeSummaryTaxonomyText(value: string) {
  return value.trim().toLowerCase();
}

function getSummaryTaxonomyInputSelectedClass(tone: SummaryTaxonomyTone) {
  if (tone === "amber") {
    return "border-[#FDE68A] bg-[#FFFBEB] font-semibold text-[#B45309]";
  }

  if (tone === "green") {
    return "border-[#BBF7D0] bg-[#F0FDF4] font-semibold text-[#15803D]";
  }

  if (tone === "blue") {
    return "border-[#BFDBFE] bg-[#EFF6FF] font-semibold text-[#1D4ED8]";
  }

  return "border-[#E2E8F0] bg-[#F8FAFC] font-semibold text-[#475569]";
}

function getSummaryTaxonomyItemSelectedClass(tone: SummaryTaxonomyTone) {
  if (tone === "amber") {
    return "bg-[#FFFBEB] font-semibold text-[#B45309]";
  }

  if (tone === "green") {
    return "bg-[#F0FDF4] font-semibold text-[#15803D]";
  }

  if (tone === "blue") {
    return "bg-[#EFF6FF] font-semibold text-[#1D4ED8]";
  }

  return "bg-[#F8FAFC] font-semibold text-[#475569]";
}

function getSummaryTaxonomyCheckBorderClass(tone: SummaryTaxonomyTone) {
  if (tone === "amber") {
    return "border-[#B45309]";
  }

  if (tone === "green") {
    return "border-[#15803D]";
  }

  if (tone === "blue") {
    return "border-[#1D4ED8]";
  }

  return "border-[#475569]";
}

function getSummaryTaxonomyCheckDotClass(tone: SummaryTaxonomyTone) {
  if (tone === "amber") {
    return "bg-[#B45309]";
  }

  if (tone === "green") {
    return "bg-[#15803D]";
  }

  if (tone === "blue") {
    return "bg-[#1D4ED8]";
  }

  return "bg-[#475569]";
}
