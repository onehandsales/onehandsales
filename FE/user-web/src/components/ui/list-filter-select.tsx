import { ChevronDown, type LucideIcon } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { FilterPopoverSearchHeader } from "@/components/ui/filter-popover-search-header";
import { useAppI18n } from "@/features/app-i18n";
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
  // 1. 화면 상태와 동작에 필요한 { t } 값을 준비한다.
  const { t } = useAppI18n();
  // 2. 화면 상태와 동작에 필요한 [isOpen, setIsOpen] 값을 준비한다.
  const [isOpen, setIsOpen] = useState(false);
  // 3. 화면 상태와 동작에 필요한 [search, setSearch] 값을 준비한다.
  const [search, setSearch] = useState("");
  // 4. 화면 상태와 동작에 필요한 [popoverPosition, setPopoverPosition] 값을 준비한다.
  const [popoverPosition, setPopoverPosition] =
    useState<PopoverPosition | null>(null);
  // 5. 화면 상태와 동작에 필요한 wrapperRef 값을 준비한다.
  const wrapperRef = useRef<HTMLDivElement>(null);
  // 6. 화면 상태와 동작에 필요한 triggerRef 값을 준비한다.
  const triggerRef = useRef<HTMLButtonElement>(null);
  // 7. 화면 상태와 동작에 필요한 inputRef 값을 준비한다.
  const inputRef = useRef<HTMLInputElement>(null);
  // 8. 화면 상태와 동작에 필요한 selectedOption 값을 준비한다.
  const selectedOption = useMemo(
    () => options.find((option) => option.value === value) ?? options[0],
    [options, value],
  );
  // 9. 이후 처리에 사용할 normalizedQuery을 계산한다.
  const normalizedQuery = normalizeListFilterText(search.trim());
  // 10. 이후 처리에 사용할 filteredOptions을 계산한다.
  const filteredOptions =
    searchable && normalizedQuery.length > 0
      ? options.filter((option) =>
          normalizeListFilterText(option.label).includes(normalizedQuery),
        )
      : options;
  // 11. 이후 처리에 사용할 displayLabel을 계산한다.
  const displayLabel = selectedOption?.label ?? ariaLabel;

  // 12. 화면 상태를 현재 흐름에 맞게 갱신한다.
  useEffect(() => {
    if (!isOpen) {
      setSearch("");
    }
  }, [isOpen]);

  // 13. 현재 단계에서 필요한 side effect를 실행한다.
  useEffect(() => {
    // 1. 조건을 확인해 필요한 분기 처리를 수행한다.
    if (!isOpen) {
      return;
    }

    // 기능 : update Popover Position 정보를 수정합니다.
    // 2. 이후 처리에 사용할 updatePopoverPosition을 계산한다.
    const updatePopoverPosition = () => {
      if (!triggerRef.current) {
        return;
      }

      setPopoverPosition(getPopoverPosition(triggerRef.current));
    };
    // 기능 : on Mouse Down 기능을 수행합니다.
    // 3. 화면 상태와 동작에 필요한 onMouseDown 값을 준비한다.
    const onMouseDown = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    // 기능 : on Key Down 기능을 수행합니다.
    // 4. 이후 처리에 사용할 onKeyDown을 계산한다.
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    // 5. 현재 단계에서 필요한 side effect를 실행한다.
    updatePopoverPosition();
    // 6. 이후 처리에 사용할 focusFrame을 계산한다.
    const focusFrame = searchable
      ? window.requestAnimationFrame(() => {
          inputRef.current?.focus();
        })
      : null;
    // 7. 브라우저 이벤트 listener를 등록하거나 정리한다.
    document.addEventListener("mousedown", onMouseDown);
    // 8. 브라우저 이벤트 listener를 등록하거나 정리한다.
    document.addEventListener("keydown", onKeyDown);
    // 9. 브라우저 이벤트 listener를 등록하거나 정리한다.
    window.addEventListener("resize", updatePopoverPosition);
    // 10. 브라우저 이벤트 listener를 등록하거나 정리한다.
    window.addEventListener("scroll", updatePopoverPosition, true);

    // 11. 계산된 결과를 호출자에게 반환한다.
    return () => {
      // 1. 조건을 확인해 필요한 분기 처리를 수행한다.
      if (focusFrame !== null) {
        window.cancelAnimationFrame(focusFrame);
      }
      // 2. 브라우저 이벤트 listener를 등록하거나 정리한다.
      document.removeEventListener("mousedown", onMouseDown);
      // 3. 브라우저 이벤트 listener를 등록하거나 정리한다.
      document.removeEventListener("keydown", onKeyDown);
      // 4. 브라우저 이벤트 listener를 등록하거나 정리한다.
      window.removeEventListener("resize", updatePopoverPosition);
      // 5. 브라우저 이벤트 listener를 등록하거나 정리한다.
      window.removeEventListener("scroll", updatePopoverPosition, true);
    };
  }, [isOpen, searchable]);

  // 기능 : open Options 창 또는 상태를 엽니다.
  // 14. 이후 처리에 사용할 openOptions을 계산한다.
  const openOptions = (nextSearch: string) => {
    // 1. 조건을 확인해 필요한 분기 처리를 수행한다.
    if (disabled) {
      return;
    }

    // 2. 화면 상태를 현재 흐름에 맞게 갱신한다.
    setSearch(nextSearch);

    // 3. 조건을 확인해 필요한 분기 처리를 수행한다.
    if (triggerRef.current) {
      setPopoverPosition(getPopoverPosition(triggerRef.current));
    }

    // 4. 화면 상태를 현재 흐름에 맞게 갱신한다.
    setIsOpen(true);
  };

  // 기능 : select Option 기능을 수행합니다.
  // 15. 이후 처리에 사용할 selectOption을 계산한다.
  const selectOption = (nextValue: TValue) => {
    // 1. 현재 단계에서 필요한 side effect를 실행한다.
    onChange(nextValue);
    // 2. 화면 상태를 현재 흐름에 맞게 갱신한다.
    setSearch("");
    // 3. 화면 상태를 현재 흐름에 맞게 갱신한다.
    setIsOpen(false);
    // 4. 현재 단계에서 필요한 side effect를 실행한다.
    triggerRef.current?.focus();
  };

  // 기능 : reset Option 기능을 수행합니다.
  // 16. 이후 처리에 사용할 resetOption을 계산한다.
  const resetOption = () => {
    const defaultOption = options[0];

    if (!defaultOption) {
      return;
    }

    selectOption(defaultOption.value);
  };

  // 17. 계산된 결과를 호출자에게 반환한다.
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
              clearSearchLabel={t("common.clearSearchName", {
                values: { name: ariaLabel },
              })}
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
              resetLabel={t("common.resetName", {
                values: { name: ariaLabel },
              })}
              searchLabel={t("common.searchName", {
                values: { name: ariaLabel },
              })}
              searchValue={search}
            />
          ) : null}
          <div className="max-h-[220px] overflow-y-auto py-1">
            {filteredOptions.length === 0 ? (
              <p className="px-3 py-3 text-[12px] text-[#9CA3AF]">
                {t("common.searchEmpty")}
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

// 기능 : get Popover Position 값을 조회합니다.
function getPopoverPosition(trigger: HTMLButtonElement): PopoverPosition {
  // 1. 이후 처리에 사용할 rect을 계산한다.
  const rect = trigger.getBoundingClientRect();
  // 2. 이후 처리에 사용할 viewportWidth을 계산한다.
  const viewportWidth = window.innerWidth;
  // 3. 이후 처리에 사용할 margin을 계산한다.
  const margin = 16;
  // 4. 이후 처리에 사용할 width을 계산한다.
  const width = Math.max(rect.width, 256);
  // 5. 이후 처리에 사용할 maxLeft을 계산한다.
  const maxLeft = Math.max(margin, viewportWidth - width - margin);
  // 6. 이후 처리에 사용할 left을 계산한다.
  const left = Math.min(Math.max(rect.left, margin), maxLeft);

  // 7. 계산된 결과를 호출자에게 반환한다.
  return {
    left,
    top: rect.bottom + 4,
    width,
  };
}

// 기능 : normalize List Filter Text 값을 내부 기준으로 정규화합니다.
function normalizeListFilterText(value: string) {
  return value.toLowerCase().replace(/\s+/g, "");
}
