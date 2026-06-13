import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/utils/cn";

type ToastVariant = "success" | "error" | "info";

type ToastProps = {
  readonly variant?: ToastVariant;
  readonly message: string;
  readonly onClose?: () => void;
  readonly className?: string;
};

const variantClassNames: Record<ToastVariant, string> = {
  success:
    "border-emerald-200 bg-emerald-50 text-emerald-900",
  error:
    "border-red-200 bg-red-50 text-red-900",
  info:
    "border-blue-200 bg-blue-50 text-blue-900",
};

const variantIcons = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
} as const;

// 기능 : 성공/오류/정보 알림을 표시하는 Toast 컴포넌트입니다.
export function Toast({
  variant = "info",
  message,
  onClose,
  className,
}: ToastProps) {
  const Icon = variantIcons[variant];

  return (
    <div
      className={cn(
        "fixed bottom-5 right-5 z-[60] flex max-w-sm items-center gap-3 rounded-lg border px-4 py-3 text-sm shadow-lg",
        variantClassNames[variant],
        className
      )}
      role="status"
    >
      <Icon className="h-5 w-5 shrink-0" />
      <span className="min-w-0 flex-1">{message}</span>
      {onClose ? (
        <button
          className="rounded-md p-1 hover:opacity-70"
          onClick={onClose}
          type="button"
          aria-label="닫기"
        >
          <X className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  );
}

// ---- useToast hook ----

type ToastOptions = {
  readonly variant?: ToastVariant;
  readonly message: string;
  readonly duration?: number;
};

type ToastState = ToastOptions & { readonly id: number };

let _nextId = 0;

// 기능 : useState 기반 간단한 Toast 상태 훅입니다.
export function useToast() {
  const [current, setCurrent] = useState<ToastState | null>(null);

  const toast = (options: ToastOptions) => {
    _nextId += 1;
    setCurrent({ ...options, id: _nextId });
  };

  const dismiss = () => {
    setCurrent(null);
  };

  // auto-dismiss
  useEffect(() => {
    if (!current) {
      return;
    }

    const duration = current.duration ?? 3000;
    const timer = setTimeout(() => {
      setCurrent(null);
    }, duration);

    return () => {
      clearTimeout(timer);
    };
  }, [current]);

  const node =
    current ? (
      <Toast
        key={current.id}
        message={current.message}
        variant={current.variant}
        onClose={dismiss}
      />
    ) : null;

  return { toast, dismiss, node };
}
