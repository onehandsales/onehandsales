import { useEffect } from "react";
import { cn } from "@/utils/cn";

type ConfirmDialogProps = {
  readonly open: boolean;
  readonly title: string;
  readonly cancelLabel: string;
  readonly confirmLabel: string;
  readonly errorMessage?: string | null;
  readonly isPending?: boolean;
  readonly onCancel: () => void;
  readonly onConfirm: () => void;
};

export function ConfirmDialog({
  open,
  title,
  cancelLabel,
  confirmLabel,
  errorMessage,
  isPending = false,
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCancel();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onCancel, open]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/35 px-4">
      <div
        aria-modal="true"
        className="w-full max-w-[288px] rounded-lg border border-[#E5E7EB] bg-white p-5 shadow-xl"
        role="dialog"
      >
        <p className="text-center text-sm font-semibold text-[#111827]">{title}</p>
        {errorMessage ? (
          <p className="mt-3 text-center text-xs font-medium text-[#B91C1C]">
            {errorMessage}
          </p>
        ) : null}
        <div className="mt-5 flex justify-center gap-2">
          <button
            className="h-11 rounded-md border border-[#D1D5DB] px-4 text-sm font-medium text-[#374151] hover:bg-[#F9FAFB]"
            disabled={isPending}
            onClick={onCancel}
            type="button"
          >
            {cancelLabel}
          </button>
          <button
            className={cn(
              "h-11 rounded-md bg-[#DC2626] px-4 text-sm font-semibold text-white hover:bg-[#B91C1C]",
              isPending ? "cursor-not-allowed opacity-70" : ""
            )}
            disabled={isPending}
            onClick={onConfirm}
            type="button"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
