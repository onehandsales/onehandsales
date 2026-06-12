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
  const normalizedTotalPages = Math.max(totalPages, 1);

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-lg border bg-white px-4 py-3 text-sm md:flex-row md:items-center md:justify-between",
        className
      )}
    >
      <span className="text-muted-foreground">
        {totalCount !== undefined
          ? `총 ${totalCount.toLocaleString("ko-KR")}개 · `
          : null}
        {page} / {normalizedTotalPages}페이지
      </span>
      <div className="flex gap-2">
        <button
          className="h-9 rounded-md border px-3 font-medium hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60 inline-flex items-center gap-1"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          type="button"
        >
          <ChevronLeft className="h-4 w-4" />
          이전
        </button>
        <button
          className="h-9 rounded-md border px-3 font-medium hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60 inline-flex items-center gap-1"
          disabled={page >= normalizedTotalPages}
          onClick={() => onPageChange(page + 1)}
          type="button"
        >
          다음
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
