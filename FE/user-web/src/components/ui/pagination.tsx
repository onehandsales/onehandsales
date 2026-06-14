import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/utils/cn";

type PaginationProps = {
  readonly page: number;
  readonly totalCount?: number;
  readonly onPageChange: (page: number) => void;
  readonly className?: string;
} & (
  | { readonly totalPages: number; readonly hasNext?: never }
  | { readonly hasNext: boolean; readonly totalPages?: never }
);

// 기능 : 목록 화면 페이지 이동 컴포넌트입니다.
// totalPages 또는 hasNext 둘 중 하나를 전달합니다.
export function Pagination({
  page,
  totalPages,
  hasNext,
  totalCount,
  onPageChange,
  className,
}: PaginationProps) {
  const canNext = totalPages !== undefined ? page < Math.max(totalPages, 1) : (hasNext ?? false);
  const pageLabel = totalPages !== undefined
    ? `${page} / ${Math.max(totalPages, 1)}페이지`
    : `${page}페이지`;

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
        {pageLabel}
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
          disabled={!canNext}
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
