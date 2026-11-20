import { useId } from "react";
import type { InputHTMLAttributes } from "react";
import { clsx } from "clsx";

type FieldProps = InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string; hint?: string; labelHidden?: boolean };

// 기능 : 입력의 이름·도움말·오류와 원본 기반 스타일을 하나의 접근 가능한 필드로 묶는다.
export function Field({ label, error, hint, labelHidden = false, id, className, ...props }: FieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const message = error || hint;
  return <div className="field">
    <label htmlFor={inputId} className={clsx("field__label", labelHidden && "sr-only")}>
      {label}{props.required && <span className="field__required" aria-hidden="true"> *</span>}
    </label>
    <input {...props} id={inputId} className={clsx("field__input", className)}
      aria-invalid={Boolean(error)} aria-describedby={message ? inputId + "-message" : undefined} />
    {message && <p id={inputId + "-message"} className={error ? "field__error" : "field__hint"}>{message}</p>}
  </div>;
}
