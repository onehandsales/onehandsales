import type { ButtonHTMLAttributes } from "react";
import { clsx } from "clsx";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "quiet"; pending?: boolean };

// 기능 : 공통 버튼의 시각 상태와 중복 조작 방지 표현을 일관되게 제공한다.
export function Button({ variant = "primary", pending = false, disabled, className, type = "button", ...props }: ButtonProps) {
  return <button {...props} type={type} className={clsx("button", "button--" + variant, className)}
    disabled={disabled || pending} aria-busy={pending || undefined} />;
}
