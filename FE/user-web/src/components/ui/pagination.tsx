import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/utils/cn";

type PaginationProps = {
  readonly page: number;
  readonly totalPages: number;
  readonly totalCount?: number;
  readonly onPageChange: (page: number) => void;
  readonly className?: string;
};

// 기능 : 목록 화면 페이지 이동 컴포넌트입니다.
export function Pagination({
  page,
  totalPages,
  totalCount,
  onPageChange,
  className,
}: PaginationProps) {
  const safeTotalPages = Math.max(totalPages, 1);
  const canPrev = page > 1;
  const canNext = page < safeTotalPages;

  return (
    <div
      className={cn(
        "flex h-12 shrink-0 items-center justify-center",
        className
      )}
    >
      {totalCount !== undefined ? (
        <span className="mr-3 text-[12px] text-[#9CA3AF]">
          총 {totalCount.toLocaleString("ko-KR")}개
        </span>
      ) : null}
      <div className="grid grid-cols-[44px_64px_44px] items-center gap-2">
        <button
          className="inline-flex h-11 w-11 items-center justify-center rounded-md text-[#6B7280] transition hover:bg-[#F3F4F6] disabled:cursor-not-allowed disabled:opacity-40"
          disabled={!canPrev}
          onClick={() => onPageChange(page - 1)}
          type="button"
          aria-label="이전 페이지"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="flex h-11 items-center justify-center text-center text-[12px] font-medium text-[#374151]">
          {page} / {safeTotalPages}
        </span>
        <button
          className="inline-flex h-11 w-11 items-center justify-center rounded-md text-[#6B7280] transition hover:bg-[#F3F4F6] disabled:cursor-not-allowed disabled:opacity-40"
          disabled={!canNext}
          onClick={() => onPageChange(page + 1)}
          type="button"
          aria-label="다음 페이지"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
