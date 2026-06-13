import { CircleDot } from "lucide-react";
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
  md: "h-[22px] text-[11px] font-semibold",
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
        "inline-flex items-center rounded-full border px-2.5 font-semibold",
        variantClassNames[variant],
        sizeClassNames[size],
        className
      )}
    >
      {children}
    </span>
  );
}

type StageBadgeVariant = "warning" | "info" | "success" | "danger" | "neutral";

type StageBadgeProps = {
  readonly variant?: StageBadgeVariant;
  readonly className?: string;
  readonly children?: ReactNode;
};

const stageBadgeVariantClassNames: Record<StageBadgeVariant, { wrap: string; icon: string }> = {
  warning: { wrap: "bg-amber-100 text-amber-700",  icon: "text-amber-700" },
  info:    { wrap: "bg-blue-100 text-blue-600",     icon: "text-blue-600" },
  success: { wrap: "bg-emerald-100 text-emerald-700", icon: "text-emerald-700" },
  danger:  { wrap: "bg-red-100 text-red-700",       icon: "text-red-700" },
  neutral: { wrap: "bg-gray-100 text-gray-500",     icon: "text-gray-400" },
};

// 기능 : pen StageBadge 기준 — icon(circle-dot 10px) + text(11px 600) pill 배지입니다.
export function StageBadge({ variant = "warning", className, children }: StageBadgeProps) {
  const styles = stageBadgeVariantClassNames[variant];
  return (
    <span
      className={cn(
        "inline-flex h-[22px] items-center gap-[5px] rounded-full px-[9px] text-[11px] font-semibold",
        styles.wrap,
        className
      )}
    >
      <CircleDot className={cn("h-2.5 w-2.5 shrink-0", styles.icon)} />
      {children}
    </span>
  );
}
