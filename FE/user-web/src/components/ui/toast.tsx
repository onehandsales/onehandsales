import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import { cn } from "@/utils/cn";

export type ToastVariant = "success" | "error" | "info";

type ToastProps = {
  readonly variant?: ToastVariant;
  readonly message: string;
  readonly description?: string;
  readonly onClose?: () => void;
  readonly className?: string;
};

const variantClassNames: Record<ToastVariant, string> = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-900",
  error: "border-red-200 bg-red-50 text-red-900",
  info: "border-blue-200 bg-blue-50 text-blue-900",
};

const variantIcons = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
} as const;

export function Toast({
  variant = "info",
  message,
  description,
  onClose,
  className,
}: ToastProps) {
  const Icon = variantIcons[variant];

  return (
    <div
      className={cn(
        "fixed bottom-5 right-5 z-[60] flex max-w-sm items-start gap-3 rounded-lg border px-4 py-3 text-sm shadow-lg",
        variantClassNames[variant],
        className
      )}
      role="status"
    >
      <Icon className="h-5 w-5 shrink-0" />
      <span className="min-w-0 flex-1">
        <span className="block">{message}</span>
        {description ? (
          <span className="mt-0.5 block text-xs opacity-80">{description}</span>
        ) : null}
      </span>
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
