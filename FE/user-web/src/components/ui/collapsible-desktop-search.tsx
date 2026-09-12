import { Search } from "lucide-react";
import {
  type FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { cn } from "@/utils/cn";

type CollapsibleDesktopSearchProps = {
  readonly appliedValue: string;
  readonly maxExpandedWidth?: number;
  readonly placeholder: string;
  readonly resetSignal?: number;
  readonly submitLabel: string;
  readonly value: string;
  readonly onSubmit: (value: string) => void;
  readonly onValueChange: (value: string) => void;
};

const DESKTOP_SEARCH_COLLAPSED_WIDTH = 72;
const DESKTOP_SEARCH_MIN_WIDTH = 150;
const DESKTOP_SEARCH_MAX_WIDTH = 170;
const DESKTOP_SEARCH_VIEWPORT_RATIO = 0.2;

// 기능 : CollapsibleDesktopSearch 컴포넌트를 렌더링합니다.
export function CollapsibleDesktopSearch({
  appliedValue,
  maxExpandedWidth,
  placeholder,
  resetSignal,
  submitLabel,
  value,
  onSubmit,
  onValueChange,
}: CollapsibleDesktopSearchProps) {
  // 1. 처리 흐름에 필요한 [isOpen, setIsOpen] 값을 준비한다.
  const [isOpen, setIsOpen] = useState(false);
  // 2. 처리 흐름에 필요한 [expandedWidth, setExpandedWidth] 값을 준비한다.
  const [expandedWidth, setExpandedWidth] = useState(
    getDesktopSearchExpandedWidth,
  );
  // 3. 처리 흐름에 필요한 inputRef 값을 준비한다.
  const inputRef = useRef<HTMLInputElement>(null);
  // 4. 처리 흐름에 필요한 resetSignalRef 값을 준비한다.
  const resetSignalRef = useRef(resetSignal);
  // 5. 이후 단계에서 사용할 displayedExpandedWidth 값을 준비한다.
  const displayedExpandedWidth =
    maxExpandedWidth === undefined
      ? expandedWidth
      : Math.min(expandedWidth, maxExpandedWidth);

  // 6. 렌더링 이후 필요한 동작을 실행한다.
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const animationFrameId = window.requestAnimationFrame(() => {
      inputRef.current?.focus();
    });

    return () => window.cancelAnimationFrame(animationFrameId);
  }, [isOpen]);

  // 7. 화면 상태를 현재 흐름에 맞게 갱신한다.
  useEffect(() => {
    if (appliedValue || value) {
      setIsOpen(true);
    }
  }, [appliedValue, value]);

  // 8. 화면 상태를 현재 흐름에 맞게 갱신한다.
  useEffect(() => {
    // 기능 : sync Expanded Width 기능을 수행합니다.
    // 1. 이후 단계에서 사용할 syncExpandedWidth 값을 준비한다.
    const syncExpandedWidth = () => {
      setExpandedWidth(getDesktopSearchExpandedWidth());
    };

    // 2. 현재 단계에서 필요한 동작을 실행한다.
    syncExpandedWidth();
    // 3. 브라우저 이벤트 listener를 등록하거나 정리한다.
    window.addEventListener("resize", syncExpandedWidth);

    // 4. 계산된 결과를 호출자에게 반환한다.
    return () => {
      window.removeEventListener("resize", syncExpandedWidth);
    };
  }, []);

  // 9. 화면 상태를 현재 흐름에 맞게 갱신한다.
  useEffect(() => {
    if (resetSignalRef.current === resetSignal) {
      return;
    }

    resetSignalRef.current = resetSignal;
    setIsOpen(false);
  }, [resetSignal]);

  // 기능 : submit Search 제출 동작을 수행합니다.
  // 10. 이후 단계에서 사용할 submitSearch 값을 준비한다.
  const submitSearch = () => {
    const nextValue = value.trim();

    onSubmit(nextValue);
    if (!nextValue) {
      setIsOpen(false);
    }
  };

  // 기능 : on Form Submit 기능을 수행합니다.
  // 11. 이후 단계에서 사용할 onFormSubmit 값을 준비한다.
  const onFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submitSearch();
  };

  // 12. 계산된 결과를 호출자에게 반환한다.
  return (
    <form
      className={cn(
        "flex h-8 shrink-0 items-center overflow-hidden rounded-md bg-transparent transition-[width,background-color,padding] duration-500 ease-out focus-within:bg-[#F3F4F6]",
        isOpen ? "pr-3 hover:bg-[#F3F4F6]" : "pr-0 hover:bg-[#F3F4F6]",
      )}
      onBlur={(event) => {
        const nextTarget = event.relatedTarget;

        if (
          nextTarget instanceof Node &&
          event.currentTarget.contains(nextTarget)
        ) {
          return;
        }

        if (!value.trim() && !appliedValue) {
          setIsOpen(false);
        }
      }}
      onSubmit={onFormSubmit}
      style={{
        width: isOpen ? displayedExpandedWidth : DESKTOP_SEARCH_COLLAPSED_WIDTH,
      }}
    >
      <button
        aria-expanded={isOpen}
        aria-label={isOpen ? submitLabel : `${placeholder} 열기`}
        className={cn(
          "inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-md px-2 text-[13px] font-semibold text-[#5F6368] transition-[background-color,color,transform] duration-150 hover:text-[#374151] active:scale-[0.97]",
          isOpen ? "w-8 px-0" : "w-full",
        )}
        onClick={() => {
          if (!isOpen) {
            setIsOpen(true);
            return;
          }

          submitSearch();
        }}
        type="button"
      >
        <Search className="h-3.5 w-3.5" />
        {isOpen ? null : <span>검색</span>}
      </button>
      <input
        ref={inputRef}
        aria-hidden={!isOpen}
        className={cn(
          "min-w-0 flex-1 bg-transparent text-[13px] text-[#111827] outline-none transition-opacity duration-300 placeholder:text-[#9CA3AF]",
          isOpen ? "opacity-100" : "opacity-0",
        )}
        onChange={(event) => onValueChange(event.target.value)}
        placeholder={placeholder}
        tabIndex={isOpen ? 0 : -1}
        value={value}
      />
    </form>
  );
}

// 기능 : 데스크톱 검색 확장 너비를 조회합니다.
function getDesktopSearchExpandedWidth() {
  if (typeof window === "undefined") {
    return DESKTOP_SEARCH_MAX_WIDTH;
  }

  return Math.round(
    Math.min(
      Math.max(
        window.innerWidth * DESKTOP_SEARCH_VIEWPORT_RATIO,
        DESKTOP_SEARCH_MIN_WIDTH,
      ),
      DESKTOP_SEARCH_MAX_WIDTH,
    ),
  );
}
