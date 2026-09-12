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

// 기능 : SummaryTaxonomySelect 선택 UI를 렌더링합니다.
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
  // 1. 처리 흐름에 필요한 [isOpen, setIsOpen] 값을 준비한다.
  const [isOpen, setIsOpen] = useState(false);
  // 2. 처리 흐름에 필요한 [search, setSearch] 값을 준비한다.
  const [search, setSearch] = useState("");
  // 3. 처리 흐름에 필요한 [popoverPosition, setPopoverPosition] 값을 준비한다.
  const [popoverPosition, setPopoverPosition] =
    useState<SummaryTaxonomyPopoverPosition | null>(null);
  // 4. 처리 흐름에 필요한 wrapperRef 값을 준비한다.
  const wrapperRef = useRef<HTMLDivElement>(null);
  // 5. 처리 흐름에 필요한 inputRef 값을 준비한다.
  const inputRef = useRef<HTMLInputElement>(null);
  // 6. 처리 흐름에 필요한 selectedItem 값을 준비한다.
  const selectedItem = useMemo(
    () => items.find((item) => item.id === selectedId),
    [items, selectedId]
  );
  // 7. 이후 단계에서 사용할 selectedLabel 값을 준비한다.
  const selectedLabel = selectedItem ? getLabel(selectedItem) : "";
  // 8. 이후 단계에서 사용할 normalizedQuery 값을 준비한다.
  const normalizedQuery = normalizeSummaryTaxonomyText(search);
  // 9. 이후 단계에서 사용할 filteredItems 값을 준비한다.
  const filteredItems =
    normalizedQuery.length > 0
      ? items.filter((item) =>
          normalizeSummaryTaxonomyText(getLabel(item)).includes(normalizedQuery)
        )
      : items;
  // 10. 이후 단계에서 사용할 inputValue 값을 준비한다.
  const inputValue = isOpen ? search : selectedLabel;

  // 11. 화면 상태를 현재 흐름에 맞게 갱신한다.
  useEffect(() => {
    if (!isOpen) {
      setSearch("");
    }
  }, [isOpen]);

  // 12. 렌더링 이후 필요한 동작을 실행한다.
  useEffect(() => {
    // 1. 조건을 확인해 필요한 분기 처리를 수행한다.
    if (!isOpen) {
      return;
    }

    // 기능 : update Popover Position 정보를 수정합니다.
    // 2. 이후 단계에서 사용할 updatePopoverPosition 값을 준비한다.
    const updatePopoverPosition = () => {
      if (!inputRef.current) {
        return;
      }

      setPopoverPosition(getSummaryTaxonomyPopoverPosition(inputRef.current));
    };
    // 기능 : on Mouse Down 기능을 수행합니다.
    // 3. 처리 흐름에 필요한 onMouseDown 값을 준비한다.
    const onMouseDown = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearch("");
      }
    };

    // 4. 현재 단계에서 필요한 동작을 실행한다.
    updatePopoverPosition();
    // 5. 브라우저 이벤트 listener를 등록하거나 정리한다.
    document.addEventListener("mousedown", onMouseDown);
    // 6. 브라우저 이벤트 listener를 등록하거나 정리한다.
    window.addEventListener("resize", updatePopoverPosition);
    // 7. 브라우저 이벤트 listener를 등록하거나 정리한다.
    window.addEventListener("scroll", updatePopoverPosition, true);

    // 8. 계산된 결과를 호출자에게 반환한다.
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("resize", updatePopoverPosition);
      window.removeEventListener("scroll", updatePopoverPosition, true);
    };
  }, [isOpen]);

  // 기능 : open Options 창 또는 상태를 엽니다.
  // 13. 이후 단계에서 사용할 openOptions 값을 준비한다.
  const openOptions = (nextSearch: string) => {
    setSearch(nextSearch);

    if (inputRef.current) {
      setPopoverPosition(getSummaryTaxonomyPopoverPosition(inputRef.current));
    }

    setIsOpen(true);
  };

  // 기능 : select Item 기능을 수행합니다.
  // 14. 이후 단계에서 사용할 selectItem 값을 준비한다.
  const selectItem = (id: string) => {
    // 1. 현재 단계에서 필요한 동작을 실행한다.
    onSelect(id);
    // 2. 화면 상태를 현재 흐름에 맞게 갱신한다.
    setSearch("");
    // 3. 화면 상태를 현재 흐름에 맞게 갱신한다.
    setIsOpen(false);
    // 4. 현재 단계에서 필요한 동작을 실행한다.
    inputRef.current?.blur();
  };

  // 기능 : clear Selection 상태를 초기화합니다.
  // 15. 이후 단계에서 사용할 clearSelection 값을 준비한다.
  const clearSelection = () => {
    // 1. 현재 단계에서 필요한 동작을 실행한다.
    onSelect("");
    // 2. 화면 상태를 현재 흐름에 맞게 갱신한다.
    setSearch("");
    // 3. 현재 단계에서 필요한 동작을 실행한다.
    inputRef.current?.focus();
    // 4. 현재 단계에서 필요한 동작을 실행한다.
    openOptions("");
  };

  // 16. 계산된 결과를 호출자에게 반환한다.
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
                ? "border-[#4880EE] bg-white pl-8 pr-7 text-[#111827] ring-1 ring-[#4880EE]"
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

// 기능 : 요약 분류 팝오버 위치를 조회합니다.
function getSummaryTaxonomyPopoverPosition(
  input: HTMLInputElement
): SummaryTaxonomyPopoverPosition {
  // 1. 이후 단계에서 사용할 rect 값을 준비한다.
  const rect = input.getBoundingClientRect();
  // 2. 이후 단계에서 사용할 viewportWidth 값을 준비한다.
  const viewportWidth = window.innerWidth;
  // 3. 이후 단계에서 사용할 margin 값을 준비한다.
  const margin = 16;
  // 4. 이후 단계에서 사용할 width 값을 준비한다.
  const width = Math.min(256, Math.max(200, viewportWidth - margin * 2));
  // 5. 이후 단계에서 사용할 maxLeft 값을 준비한다.
  const maxLeft = Math.max(margin, viewportWidth - width - margin);
  // 6. 이후 단계에서 사용할 left 값을 준비한다.
  const left = Math.min(Math.max(rect.left, margin), maxLeft);

  // 7. 계산된 결과를 호출자에게 반환한다.
  return {
    left,
    top: rect.bottom + 4,
    width,
  };
}

// 기능 : normalize Summary Taxonomy Text 값을 내부 기준으로 정규화합니다.
function normalizeSummaryTaxonomyText(value: string) {
  return value.trim().toLowerCase();
}

// 기능 : 요약 분류 입력 선택 클래스를 조회합니다.
function getSummaryTaxonomyInputSelectedClass(tone: SummaryTaxonomyTone) {
  // 1. 조건을 확인해 필요한 분기 처리를 수행한다.
  if (tone === "amber") {
    return "border-[#FDE68A] bg-[#FFFBEB] font-semibold text-[#B45309]";
  }

  // 2. 조건을 확인해 필요한 분기 처리를 수행한다.
  if (tone === "green") {
    return "border-[#BBF7D0] bg-[#F0FDF4] font-semibold text-[#15803D]";
  }

  // 3. 조건을 확인해 필요한 분기 처리를 수행한다.
  if (tone === "blue") {
    return "border-[#BFDBFE] bg-[#EFF6FF] font-semibold text-[#1D4ED8]";
  }

  // 4. 계산된 결과를 호출자에게 반환한다.
  return "border-[#E2E8F0] bg-[#F8FAFC] font-semibold text-[#475569]";
}

// 기능 : 요약 분류 항목 선택 클래스를 조회합니다.
function getSummaryTaxonomyItemSelectedClass(tone: SummaryTaxonomyTone) {
  // 1. 조건을 확인해 필요한 분기 처리를 수행한다.
  if (tone === "amber") {
    return "bg-[#FFFBEB] font-semibold text-[#B45309]";
  }

  // 2. 조건을 확인해 필요한 분기 처리를 수행한다.
  if (tone === "green") {
    return "bg-[#F0FDF4] font-semibold text-[#15803D]";
  }

  // 3. 조건을 확인해 필요한 분기 처리를 수행한다.
  if (tone === "blue") {
    return "bg-[#EFF6FF] font-semibold text-[#1D4ED8]";
  }

  // 4. 계산된 결과를 호출자에게 반환한다.
  return "bg-[#F8FAFC] font-semibold text-[#475569]";
}

// 기능 : 요약 분류 체크 테두리 클래스를 조회합니다.
function getSummaryTaxonomyCheckBorderClass(tone: SummaryTaxonomyTone) {
  // 1. 조건을 확인해 필요한 분기 처리를 수행한다.
  if (tone === "amber") {
    return "border-[#B45309]";
  }

  // 2. 조건을 확인해 필요한 분기 처리를 수행한다.
  if (tone === "green") {
    return "border-[#15803D]";
  }

  // 3. 조건을 확인해 필요한 분기 처리를 수행한다.
  if (tone === "blue") {
    return "border-[#1D4ED8]";
  }

  // 4. 계산된 결과를 호출자에게 반환한다.
  return "border-[#475569]";
}

// 기능 : 요약 분류 체크 표시 클래스를 조회합니다.
function getSummaryTaxonomyCheckDotClass(tone: SummaryTaxonomyTone) {
  // 1. 조건을 확인해 필요한 분기 처리를 수행한다.
  if (tone === "amber") {
    return "bg-[#B45309]";
  }

  // 2. 조건을 확인해 필요한 분기 처리를 수행한다.
  if (tone === "green") {
    return "bg-[#15803D]";
  }

  // 3. 조건을 확인해 필요한 분기 처리를 수행한다.
  if (tone === "blue") {
    return "bg-[#1D4ED8]";
  }

  // 4. 계산된 결과를 호출자에게 반환한다.
  return "bg-[#475569]";
}
