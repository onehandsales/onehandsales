import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/utils/cn";

type PaginationProps = {
  readonly page: number;
  readonly totalPages: number;
  readonly onPageChange: (page: number) => void;
  readonly className?: string;
};

// 기능 : 목록 화면 하단의 단순한 페이지 이동 컴포넌트입니다.
export function Pagination({
  page,
  totalPages,
  onPageChange,
  className,
}: PaginationProps) {
  const safeTotalPages = Math.max(totalPages, 1);
  const canPrev = page > 1;
  const canNext = page < safeTotalPages;

  return (
    <div
      className={cn(
        "flex items-center justify-center gap-3 px-2 py-4 text-sm text-muted-foreground",
        className
      )}
    >
      <button
        aria-label="이전 페이지"
        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#E5E7EB] bg-white text-[#374151] transition hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:opacity-40"
        disabled={!canPrev}
        onClick={() => onPageChange(page - 1)}
        type="button"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <span className="min-w-16 text-center text-[13px] font-medium text-[#6B7280]">
        {page} / {safeTotalPages}
      </span>
      <button
        aria-label="다음 페이지"
        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#E5E7EB] bg-white text-[#374151] transition hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:opacity-40"
        disabled={!canNext}
        onClick={() => onPageChange(page + 1)}
        type="button"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
