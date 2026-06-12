import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

type FilterChipProps = {
  readonly active?: boolean;
  readonly onClick?: () => void;
  readonly className?: string;
  readonly children?: ReactNode;
};

type FilterChipGroupProps = {
  readonly className?: string;
  readonly children?: ReactNode;
};

// 기능 : 필터 선택 상태를 표현하는 칩 컴포넌트입니다.
export function FilterChip({
  active,
  onClick,
  className,
  children,
}: FilterChipProps) {
  return (
    <button
      className={cn(
        "inline-flex h-8 items-center rounded-full px-3 text-sm transition cursor-pointer",
        active
          ? "border border-primary/40 bg-primary/10 text-primary font-semibold"
          : "border bg-white text-slate-700 hover:bg-muted",
        className
      )}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

// 기능 : FilterChip을 가로로 나열하는 wrapper 컴포넌트입니다.
export function FilterChipGroup({ className, children }: FilterChipGroupProps) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>{children}</div>
  );
}
