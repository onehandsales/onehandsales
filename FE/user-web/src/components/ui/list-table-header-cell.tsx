import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

type ListTableHeaderCellProps = {
  readonly children: ReactNode;
  readonly className?: string;
  readonly icon: LucideIcon;
};

export const LIST_TABLE_HEADER_ROW_CLASS_NAME =
  "grid h-11 shrink-0 items-stretch border-b border-[#E5E7EB] bg-[#F9FAFB]";

export const LIST_TABLE_ROW_CLASS_NAME =
  "grid h-[66px] w-full cursor-pointer items-stretch border-b border-[#E5E7EB] bg-white text-left transition-colors hover:bg-[#F8FAFC] focus:outline-none focus-visible:bg-[#F8FAFC] [&>*]:flex [&>*]:h-full [&>*]:min-w-0 [&>*]:items-center [&>*]:border-r [&>*]:border-[#EEF0F3] [&>*]:px-3 [&>*:last-child]:border-r-0 [&>*>*]:min-w-0 md:[&>*]:px-4 xl:[&>*]:px-6";

export const LIST_TABLE_SKELETON_ROW_CLASS_NAME =
  "grid h-[66px] items-stretch border-b border-[#E5E7EB] bg-[#F8FAFC] [&>*]:flex [&>*]:h-full [&>*]:min-w-0 [&>*]:items-center [&>*]:border-r [&>*]:border-[#EEF0F3] [&>*]:px-3 [&>*:last-child]:border-r-0 [&>*>*]:min-w-0 md:[&>*]:px-4 xl:[&>*]:px-6";

export function ListTableHeaderCell({
  children,
  className,
  icon: Icon,
}: ListTableHeaderCellProps) {
  return (
    <div
      className={cn(
        "flex h-full min-w-0 items-center gap-1.5 border-r border-[#EEF0F3] px-3 text-[12px] font-medium text-[#6B7280] last:border-r-0 md:px-4 xl:px-6",
        className,
      )}
    >
      <Icon className="h-3.5 w-3.5 shrink-0 text-[#9CA3AF]" strokeWidth={1.8} />
      <span className="min-w-0 truncate">{children}</span>
    </div>
  );
}
