import { Loader2 } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/utils/cn";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
type ButtonSize = "md" | "sm" | "lg" | "icon";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  readonly variant?: ButtonVariant;
  readonly size?: ButtonSize;
  readonly isPending?: boolean;
  readonly children?: ReactNode;
};

const variantClassNames: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-primary-foreground hover:bg-primary/90",
  secondary:
    "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50",
  danger:
    "border border-destructive/30 text-destructive hover:bg-red-50",
  ghost:
    "text-muted-foreground hover:bg-muted hover:text-foreground",
};

const sizeClassNames: Record<ButtonSize, string> = {
  md: "h-[38px] px-4 text-[13px] font-semibold",
  sm: "h-8 px-3 text-xs font-semibold",
  lg: "h-10 px-5 text-sm font-semibold",
  icon: "h-[38px] w-[38px]",
};

// 기능 : 공통 버튼 컴포넌트입니다. variant × size 조합을 지원합니다.
export function Button({
  variant = "secondary",
  size = "md",
  isPending,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg font-semibold disabled:cursor-not-allowed disabled:opacity-60 transition",
        variantClassNames[variant],
        sizeClassNames[size],
        className
      )}
      disabled={disabled ?? isPending}
      {...props}
    >
      {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      {children}
    </button>
  );
}
