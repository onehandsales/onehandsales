import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

type BadgeVariant = "success" | "warning" | "danger" | "neutral" | "info" | "primary";
type BadgeSize = "sm" | "md";

type BadgeProps = {
  readonly variant?: BadgeVariant;
  readonly size?: BadgeSize;
  readonly className?: string;
  readonly children?: ReactNode;
};

const variantClassNames: Record<BadgeVariant, string> = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  warning: "border-amber-200 bg-amber-50 text-amber-800",
  danger: "border-red-200 bg-red-50 text-red-800",
  neutral: "border-slate-200 bg-slate-50 text-slate-700",
  info: "border-blue-200 bg-blue-50 text-blue-800",
  primary: "border-primary/30 bg-primary/10 text-primary",
};

const sizeClassNames: Record<BadgeSize, string> = {
  md: "h-7 text-xs",
  sm: "h-5 text-[10px] px-2",
};

// 기능 : 상태·단계·중립 표현을 위한 뱃지 컴포넌트입니다.
export function Badge({
  variant = "neutral",
  size = "md",
  className,
  children,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 font-medium",
        variantClassNames[variant],
        sizeClassNames[size],
        className
      )}
    >
      {children}
    </span>
  );
}
