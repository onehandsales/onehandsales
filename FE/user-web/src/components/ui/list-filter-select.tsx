import { ChevronDown } from "lucide-react";
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
  onChange,
  options,
  value,
}: ListFilterSelectProps<TValue>) {
  const [isOpen, setIsOpen] = useState(false);
  const [popoverPosition, setPopoverPosition] =
    useState<PopoverPosition | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const selectedOption = useMemo(
    () => options.find((option) => option.value === value) ?? options[0],
    [options, value],
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const updatePopoverPosition = () => {
      if (!buttonRef.current) {
        return;
      }

      setPopoverPosition(getPopoverPosition(buttonRef.current));
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
        buttonRef.current?.focus();
      }
    };

    updatePopoverPosition();
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", updatePopoverPosition);
    window.addEventListener("scroll", updatePopoverPosition, true);

    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", updatePopoverPosition);
      window.removeEventListener("scroll", updatePopoverPosition, true);
    };
  }, [isOpen]);

  return (
    <div className={cn("relative shrink-0", className)} ref={wrapperRef}>
      <button
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={ariaLabel}
        className={cn(
          "inline-flex h-8 w-full min-w-0 items-center justify-between gap-2 rounded-full border pl-3.5 pr-2.5 text-[13px] outline-none transition disabled:cursor-not-allowed disabled:opacity-60",
          isOpen
            ? "border-[#4880EE] bg-white text-[#111827] ring-1 ring-[#4880EE]"
            : active
              ? "border-[#BFDBFE] bg-[#EFF6FF] font-semibold text-[#1D4ED8]"
              : "border-[#E2E5EC] bg-transparent text-[#6B7280] hover:border-[#D1D5DB] hover:bg-[#FAFAF8]",
        )}
        disabled={disabled}
        onClick={() => setIsOpen((current) => !current)}
        ref={buttonRef}
        type="button"
      >
        <span className="min-w-0 truncate">{selectedOption?.label ?? ""}</span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 shrink-0 transition-transform",
            isOpen && "rotate-180",
            active || isOpen ? "text-[#1D4ED8]" : "text-[#9CA3AF]",
          )}
        />
      </button>

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
            {options.map((option) => {
              const isSelected = option.value === value;

              return (
                <button
                  aria-selected={isSelected}
                  className={cn(
                    "flex h-8 w-full min-w-0 items-center gap-2 px-3 text-left text-[13px] transition hover:bg-[#F9FAFB]",
                    isSelected && "bg-[#EFF6FF] font-semibold text-[#1D4ED8]",
                  )}
                  key={option.value}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                    buttonRef.current?.focus();
                  }}
                  role="option"
                  type="button"
                >
                  <span
                    className={cn(
                      "grid h-3.5 w-3.5 shrink-0 place-items-center rounded-full border",
                      isSelected ? "border-[#4880EE]" : "border-[#CBD5E1]",
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

function getPopoverPosition(button: HTMLButtonElement): PopoverPosition {
  const rect = button.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const margin = 16;
  const width = Math.max(rect.width, 184);
  const maxLeft = Math.max(margin, viewportWidth - width - margin);
  const left = Math.min(Math.max(rect.left, margin), maxLeft);

  return {
    left,
    top: rect.bottom + 4,
    width,
  };
}
