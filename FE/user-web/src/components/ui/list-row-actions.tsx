import { Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/utils/cn";

type ListRowActionsProps = {
  readonly detailTo: string;
  readonly deleteLabel: string;
  readonly disabled?: boolean;
  readonly onDelete: () => void;
};

// 기능 : 데스크톱 목록 행의 상세/삭제 액션을 공통으로 렌더링합니다.
export function ListRowActions({
  detailTo,
  deleteLabel,
  disabled = false,
  onDelete,
}: ListRowActionsProps) {
  return (
    <div
      className="flex min-w-0 items-center  gap-1.5"
      onClick={(event) => event.stopPropagation()}
    >
      <Link
        className="inline-flex h-7 shrink-0 items-center rounded-full border border-[#CBD5E1] bg-white px-3 text-[12px] font-semibold text-[#334155] transition hover:border-[#94A3B8] hover:bg-[#F8FAFC]"
        to={detailTo}
      >
        상세
      </Link>
      <button
        aria-label={deleteLabel}
        className={cn(
          "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-red-200 bg-white text-red-600 transition hover:border-red-300 hover:bg-red-50",
          disabled && "cursor-not-allowed opacity-50",
        )}
        disabled={disabled}
        onClick={onDelete}
        type="button"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
