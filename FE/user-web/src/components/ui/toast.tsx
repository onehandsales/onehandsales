import { AlertCircle, Check, Info, X } from "lucide-react";
import { cn } from "@/utils/cn";

export type ToastVariant = "success" | "error" | "info";

type ToastProps = {
  readonly variant?: ToastVariant;
  readonly message: string;
  readonly description?: string;
  readonly onClose?: () => void;
  readonly className?: string;
};

const variantIconClassNames: Record<ToastVariant, string> = {
  success: "bg-[#4880EE] text-white ring-1 ring-[#4880EE]",
  error: "bg-red-50 text-red-600",
  info: "bg-blue-50 text-blue-600",
};

const variantIcons = {
  success: Check,
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
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/35 px-4">
      <div
        aria-modal="true"
        className={cn(
          "relative w-full max-w-[288px] rounded-lg border border-[#E5E7EB] bg-white p-5 text-center shadow-xl",
          className
        )}
        role="dialog"
      >
        {onClose ? (
          <button
            className="absolute right-3 top-3 rounded-md p-1 text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111827]"
            onClick={onClose}
            type="button"
            aria-label="닫기"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
        <span
          className={cn(
            "mx-auto flex h-10 w-10 items-center justify-center rounded-full",
            variantIconClassNames[variant]
          )}
        >
          <Icon className="h-5 w-5" />
        </span>
        <span className="mt-3 block text-sm font-semibold text-[#111827]">
          {message}
        </span>
        {description ? (
          <span className="mt-1 block text-xs leading-5 text-[#6B7280]">
            {description}
          </span>
        ) : null}
      </div>
    </div>
  );
}
