import { ChevronLeft, ChevronRight, Loader2, RefreshCw } from "lucide-react";

export type PageHeaderProps = {
  readonly title: string;
  readonly description: string;
};

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <header className="border-b pb-5">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </header>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  readonly message: string;
  readonly onRetry: () => void;
}) {
  return (
    <div className="grid gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
      <p>{message}</p>
      <button
        type="button"
        className="inline-flex h-9 w-fit items-center gap-2 rounded-md border border-red-200 bg-white px-3 font-medium"
        onClick={onRetry}
      >
        <RefreshCw className="h-4 w-4" aria-hidden />
        재시도
      </button>
    </div>
  );
}

export function EmptyState({ message }: { readonly message: string }) {
  return (
    <div className="grid min-h-44 place-items-center rounded-lg border border-dashed bg-white px-4 text-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}

export function LoadingState() {
  return (
    <div className="grid min-h-44 place-items-center rounded-lg border bg-white">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        불러오는 중입니다.
      </div>
    </div>
  );
}

export function PaginationControls({
  page,
  totalCount,
  hasNext,
  onPrev,
  onNext,
}: {
  readonly page: number;
  readonly totalCount: number;
  readonly hasNext: boolean;
  readonly onPrev: () => void;
  readonly onNext: () => void;
}) {
  return (
    <div className="flex items-center justify-between border-t bg-white px-4 py-3 text-sm">
      <div className="text-muted-foreground">
        총 {totalCount.toLocaleString()}개 · {page}페이지
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="grid h-9 w-9 place-items-center rounded-md border hover:bg-muted disabled:opacity-50"
          disabled={page <= 1}
          aria-label="이전 페이지"
          onClick={onPrev}
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
        </button>
        <button
          type="button"
          className="grid h-9 w-9 place-items-center rounded-md border hover:bg-muted disabled:opacity-50"
          disabled={!hasNext}
          aria-label="다음 페이지"
          onClick={onNext}
        >
          <ChevronRight className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}
