import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

type ListTableHeaderCellProps = {
  readonly children: ReactNode;
  readonly className?: string;
  readonly icon: LucideIcon;
};

export function ListTableHeaderCell({
  children,
  className,
  icon: Icon,
}: ListTableHeaderCellProps) {
  return (
    <div
      className={cn(
        "flex min-w-0 items-center gap-1.5 text-[12px] font-medium text-[#6B7280]",
        className,
      )}
    >
      <Icon className="h-3.5 w-3.5 shrink-0 text-[#9CA3AF]" strokeWidth={1.8} />
      <span className="min-w-0 truncate">{children}</span>
    </div>
  );
}
