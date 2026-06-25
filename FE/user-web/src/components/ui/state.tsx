import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/utils/cn";

type StateVariant = "panel" | "inline";

type LoadingStateProps = {
  readonly title?: string;
  readonly description?: string;
  readonly variant?: StateVariant;
  readonly className?: string;
};

// 기능 : 도메인 공용 로딩 상태를 렌더링합니다.
export function LoadingState({
  title = "불러오는 중입니다.",
  description,
  variant = "panel",
  className,
}: LoadingStateProps) {
  return (
    <div
      className={cn(
        getStateClassName(variant),
        "text-muted-foreground",
        className
      )}
    >
      <Loader2 className="h-5 w-5 animate-spin" />
      <div className="min-w-0">
        <p className="text-sm font-medium">{title}</p>
        {description ? <p className="mt-1 text-xs">{description}</p> : null}
      </div>
    </div>
  );
}

type EmptyStateProps = {
  readonly title: string;
  readonly description?: string;
  readonly icon?: LucideIcon;
  readonly action?: ReactNode;
  readonly variant?: StateVariant;
  readonly className?: string;
};

// 기능 : 도메인 공용 빈 상태를 렌더링합니다.
export function EmptyState({
  title,
  description,
  icon: Icon,
  action,
  variant = "panel",
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        getStateClassName(variant),
        variant === "panel" ? "justify-items-center text-center" : "",
        className
      )}
    >
      {Icon ? <Icon className="h-6 w-6 text-muted-foreground" /> : null}
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-950">{title}</p>
        {description ? (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  );
}

type ListEmptyStateProps = {
  readonly title: string;
  readonly icon: LucideIcon;
  readonly actionLabel?: string;
  readonly actionIcon?: LucideIcon;
  readonly actionTo?: string;
  readonly onAction?: () => void;
  readonly className?: string;
};

// 기능 : 목록 테이블/카드 내부에서 쓰는 공통 빈 상태를 렌더링합니다.
export function ListEmptyState({
  title,
  icon: Icon,
  actionLabel,
  actionIcon: ActionIcon,
  actionTo,
  onAction,
  className,
}: ListEmptyStateProps) {
  const actionContent = actionLabel ? (
    <>
      {ActionIcon ? <ActionIcon className="h-3.5 w-3.5" strokeWidth={2} /> : null}
      {actionLabel}
    </>
  ) : null;
  const actionClassName =
    "mt-5 inline-flex h-8 items-center gap-1.5 rounded-md bg-[#4880EE] px-3.5 text-[13px] font-medium text-white transition hover:bg-[#1D4ED8]";

  return (
    <div
      className={cn(
        "flex min-h-[320px] flex-col items-center justify-center px-5 py-12 text-center",
        className
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#E2E5EC] bg-[#FAFAF8]">
        <Icon className="h-5 w-5 text-[#9CA3AF]" strokeWidth={1.5} />
      </div>
      <p className="mt-4 text-[14px] font-semibold text-[#111827]">{title}</p>
      {actionContent && actionTo ? (
        <Link className={actionClassName} to={actionTo}>
          {actionContent}
        </Link>
      ) : null}
      {actionContent && !actionTo ? (
        <button className={actionClassName} onClick={onAction} type="button">
          {actionContent}
        </button>
      ) : null}
    </div>
  );
}

type ErrorStateProps = {
  readonly message: string;
  readonly title?: string;
  readonly onRetry?: () => void;
  readonly variant?: StateVariant;
  readonly className?: string;
};

// 기능 : 도메인 공용 오류 상태를 렌더링합니다.
export function ErrorState({
  message,
  title = "요청을 처리하지 못했습니다.",
  onRetry,
  variant = "panel",
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        getStateClassName(variant),
        "border-destructive/30 bg-red-50 text-destructive",
        className
      )}
    >
      <AlertCircle className="h-5 w-5" />
      <div className="min-w-0">
        <p className="text-sm font-medium">{title}</p>
        <p className="mt-1 text-xs">{message}</p>
      </div>
      {onRetry ? (
        <button
          className="h-9 rounded-md border bg-white px-3 text-sm font-medium text-slate-900 hover:bg-muted"
          onClick={onRetry}
          type="button"
        >
          다시 시도
        </button>
      ) : null}
    </div>
  );
}

type SuccessToastProps = {
  readonly message: string;
  readonly onClose?: () => void;
  readonly className?: string;
};

// 기능 : 도메인 공용 성공 toast를 렌더링합니다.
export function SuccessToast({
  message,
  onClose,
  className,
}: SuccessToastProps) {
  return (
    <div
      className={cn(
        "fixed bottom-5 right-5 z-[60] flex max-w-sm items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 shadow-lg",
        className
      )}
      role="status"
    >
      <CheckCircle2 className="h-5 w-5 shrink-0" />
      <span className="min-w-0 flex-1">{message}</span>
      {onClose ? (
        <button
          className="rounded-md px-2 py-1 text-xs font-medium hover:bg-emerald-100"
          onClick={onClose}
          type="button"
        >
          닫기
        </button>
      ) : null}
    </div>
  );
}

// 기능 : 상태 UI variant별 외곽 문법을 반환합니다.
function getStateClassName(variant: StateVariant) {
  return variant === "panel"
    ? "grid gap-3 rounded-lg border bg-white p-5"
    : "flex items-start gap-3 rounded-md border px-3 py-2";
}
