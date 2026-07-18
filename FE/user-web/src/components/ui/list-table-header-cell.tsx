import type { LucideIcon } from "lucide-react";
import type { MouseEvent as ReactMouseEvent, ReactNode } from "react";
import { cn } from "@/utils/cn";

type ListTableHeaderCellProps = {
  readonly children: ReactNode;
  readonly className?: string;
  readonly icon: LucideIcon;
  readonly isResizable?: boolean;
  readonly isResizing?: boolean;
  readonly onResizeReset?: () => void;
  readonly onResizeStart?: (event: ReactMouseEvent<HTMLElement>) => void;
};

export const LIST_TABLE_HEADER_ROW_CLASS_NAME =
  "grid h-11 min-w-full w-max shrink-0 items-stretch border-b border-[#E5E7EB] bg-[#F9FAFB] [grid-template-columns:var(--list-table-grid-template)]";

export const LIST_TABLE_ROW_CLASS_NAME =
  "grid h-12 min-w-full w-max cursor-pointer items-stretch border-b border-[#E5E7EB] bg-white text-left transition-colors hover:bg-[#F8FAFC] focus:outline-none focus-visible:bg-[#F8FAFC] [grid-template-columns:var(--list-table-grid-template)] [&>*]:flex [&>*]:h-full [&>*]:min-w-0 [&>*]:items-center [&>*]:border-r [&>*]:border-[#EEF0F3] [&>*]:px-3 [&>*:last-child]:border-r-0 [&>*>*]:min-w-0 md:[&>*]:px-4 xl:[&>*]:px-6";

export const LIST_TABLE_SKELETON_ROW_CLASS_NAME =
  "grid h-12 min-w-full w-max items-stretch border-b border-[#E5E7EB] bg-[#F8FAFC] [grid-template-columns:var(--list-table-grid-template)] [&>*]:flex [&>*]:h-full [&>*]:min-w-0 [&>*]:items-center [&>*]:border-r [&>*]:border-[#EEF0F3] [&>*]:px-3 [&>*:last-child]:border-r-0 [&>*>*]:min-w-0 md:[&>*]:px-4 xl:[&>*]:px-6";

export function ListTableHeaderCell({
  children,
  className,
  icon: Icon,
  isResizable = false,
  isResizing = false,
  onResizeReset,
  onResizeStart,
}: ListTableHeaderCellProps) {
  return (
    <div
      className={cn(
        "relative flex h-full min-w-0 items-center gap-1.5 border-r border-[#EEF0F3] px-3 text-[12px] font-medium text-[#6B7280] last:border-r-0 md:px-4 xl:px-6",
        className,
      )}
    >
      <Icon className="h-3.5 w-3.5 shrink-0 text-[#9CA3AF]" strokeWidth={1.8} />
      <span className="min-w-0 truncate">{children}</span>
      {isResizable ? (
        <button
          aria-label="컬럼 너비 조절"
          className={cn(
            "group/resize absolute -right-1 top-0 z-20 h-full w-2 cursor-col-resize bg-transparent outline-none",
            "after:absolute after:left-1/2 after:top-1 after:h-[calc(100%-8px)] after:w-px after:-translate-x-1/2 after:bg-transparent after:transition-colors",
            "hover:after:bg-[#4880EE] focus-visible:after:bg-[#4880EE]",
            isResizing && "after:bg-[#4880EE]",
          )}
          onDoubleClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onResizeReset?.();
          }}
          onMouseDown={onResizeStart}
          title="드래그로 컬럼 너비 조절, 더블클릭으로 초기화"
          type="button"
        />
      ) : null}
    </div>
  );
}
