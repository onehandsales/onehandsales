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
  const [isOpen, setIsOpen] = useState(false);
  const [expandedWidth, setExpandedWidth] = useState(
    getDesktopSearchExpandedWidth,
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const resetSignalRef = useRef(resetSignal);
  const displayedExpandedWidth =
    maxExpandedWidth === undefined
      ? expandedWidth
      : Math.min(expandedWidth, maxExpandedWidth);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const animationFrameId = window.requestAnimationFrame(() => {
      inputRef.current?.focus();
    });

    return () => window.cancelAnimationFrame(animationFrameId);
  }, [isOpen]);

  useEffect(() => {
    if (appliedValue || value) {
      setIsOpen(true);
    }
  }, [appliedValue, value]);

  useEffect(() => {
    const syncExpandedWidth = () => {
      setExpandedWidth(getDesktopSearchExpandedWidth());
    };

    syncExpandedWidth();
    window.addEventListener("resize", syncExpandedWidth);

    return () => {
      window.removeEventListener("resize", syncExpandedWidth);
    };
  }, []);

  useEffect(() => {
    if (resetSignalRef.current === resetSignal) {
      return;
    }

    resetSignalRef.current = resetSignal;
    setIsOpen(false);
  }, [resetSignal]);

  const submitSearch = () => {
    const nextValue = value.trim();

    onSubmit(nextValue);
    if (!nextValue) {
      setIsOpen(false);
    }
  };

  const onFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submitSearch();
  };

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
