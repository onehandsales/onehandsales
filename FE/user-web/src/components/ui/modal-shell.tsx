import { X } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

type ModalShellSize = "sm" | "md" | "lg" | "xl";
type ModalShellPlacement = "center" | "top" | "bottom";

type ModalShellProps = {
  readonly open: boolean;
  readonly title?: string;
  readonly description?: string;
  readonly children: ReactNode;
  readonly footer?: ReactNode;
  readonly size?: ModalShellSize;
  readonly placement?: ModalShellPlacement;
  readonly closeLabel?: string;
  readonly showCloseButton?: boolean;
  readonly panelClassName?: string;
  readonly bodyClassName?: string;
  readonly footerClassName?: string;
  readonly closeButtonClassName?: string;
  readonly onOpenChange: (open: boolean) => void;
};

const sizeClassNames: Record<ModalShellSize, string> = {
  sm: "max-w-[420px]",
  md: "max-w-[520px]",
  lg: "max-w-3xl",
  xl: "max-w-5xl",
};

const placementClassNames: Record<ModalShellPlacement, string> = {
  center: "place-items-center",
  top: "items-start justify-center pt-14 md:pt-24",
  bottom: "items-end justify-center pb-4 md:items-center md:pb-6",
};

// 기능 : 공통 모달 overlay, panel, header, body, footer 문법을 제공합니다.
export function ModalShell({
  open,
  title,
  description,
  children,
  footer,
  size = "md",
  placement = "center",
  closeLabel = "모달 닫기",
  showCloseButton = true,
  panelClassName,
  bodyClassName,
  footerClassName,
  closeButtonClassName,
  onOpenChange,
}: ModalShellProps) {
  if (!open) {
    return null;
  }

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 grid bg-black/[0.44] px-4 py-6 backdrop-blur-[3px]",
        placementClassNames[placement]
      )}
    >
      <section
        aria-labelledby={title ? "modal-shell-title" : undefined}
        aria-modal="true"
        className={cn(
          "relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-xl bg-white shadow-modal",
          sizeClassNames[size],
          panelClassName
        )}
        role="dialog"
      >
        {title || description ? (
          <header className="relative flex h-14 shrink-0 items-center border-b border-gray-200 px-6 pr-14">
            <div>
              {title ? (
                <h2 className="text-[15px] font-semibold text-foreground" id="modal-shell-title">
                  {title}
                </h2>
              ) : null}
              {description ? (
                <p className="text-xs text-muted-foreground">{description}</p>
              ) : null}
            </div>
            {showCloseButton ? (
              <button
                aria-label={closeLabel}
                className={cn(
                  "absolute right-4 top-1/2 -translate-y-1/2 grid h-8 w-8 shrink-0 place-items-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition",
                  closeButtonClassName
                )}
                onClick={() => onOpenChange(false)}
                type="button"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </header>
        ) : (
          showCloseButton ? (
            <button
              aria-label={closeLabel}
              className={cn(
                "absolute right-4 top-4 z-10 grid h-8 w-8 shrink-0 place-items-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition",
                closeButtonClassName
              )}
              onClick={() => onOpenChange(false)}
              type="button"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null
        )}

        <div className={cn("overflow-y-auto px-6 py-5", bodyClassName)}>
          {children}
        </div>

        {footer ? (
          <footer
            className={cn(
              "flex h-16 shrink-0 items-center justify-end gap-3 border-t border-gray-200 px-6",
              footerClassName
            )}
          >
            {footer}
          </footer>
        ) : null}
      </section>
    </div>
  );
}
