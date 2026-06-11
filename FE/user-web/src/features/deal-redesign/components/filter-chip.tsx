import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

type FilterChipProps = {
  readonly active?: boolean;
  readonly children: ReactNode;
  readonly onClick?: () => void;
};

export function FilterChip({
  active = false,
  children,
  onClick,
}: FilterChipProps) {
  return (
    <button
      className={cn(
        "inline-flex h-10 items-center rounded-full border px-4 text-sm font-medium transition",
        active
          ? "border-chip-active bg-chip-active text-chip-foreground shadow-soft"
          : "border-border bg-panel text-foreground"
      )}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}
