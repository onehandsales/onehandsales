import { Plus } from "lucide-react";
import type { FormEvent, FormHTMLAttributes, ReactNode } from "react";
import { cn } from "@/utils/cn";

type ModalFormProps = FormHTMLAttributes<HTMLFormElement>;

// 기능 : Quick Create 계열 모달의 form 간격과 submit 문법을 통일합니다.
export function ModalForm({ className, ...props }: ModalFormProps) {
  return <form className={cn("grid gap-5", className)} {...props} />;
}

type ModalFormSectionProps = {
  readonly title?: string;
  readonly children: ReactNode;
  readonly className?: string;
};

// 기능 : 모달 내부 폼을 의미 단위 section으로 묶습니다.
export function ModalFormSection({
  title,
  children,
  className,
}: ModalFormSectionProps) {
  return (
    <section className={cn("grid gap-3", className)}>
      {title ? <ModalSectionHeader title={title} /> : null}
      {children}
    </section>
  );
}

type ModalSectionHeaderProps = {
  readonly title?: string;
};

// 기능 : 모달 내부 section 제목 문법을 통일합니다.
export function ModalSectionHeader({ title }: ModalSectionHeaderProps) {
  return (
    <div>
      {title ? <h3 className="text-sm font-semibold">{title}</h3> : null}
    </div>
  );
}

type ModalFormRowProps = {
  readonly children: ReactNode;
  readonly columns?: 1 | 2 | 3;
  readonly className?: string;
};

const rowClassNames: Record<1 | 2 | 3, string> = {
  1: "grid gap-4",
  2: "grid gap-4 md:grid-cols-2",
  3: "grid gap-4 md:grid-cols-3",
};

// 기능 : 모달 내부 field row의 반응형 열 문법을 통일합니다.
export function ModalFormRow({
  children,
  columns = 2,
  className,
}: ModalFormRowProps) {
  return <div className={cn(rowClassNames[columns], className)}>{children}</div>;
}

type ModalFieldGroupProps = {
  readonly id: string;
  readonly label?: string;
  readonly children: ReactNode;
  readonly error?: string;
  readonly helper?: string;
  readonly className?: string;
};

// 기능 : label, input 영역, helper/error text를 하나의 field group으로 묶습니다.
export function ModalFieldGroup({
  id,
  label,
  children,
  error,
  helper,
  className,
}: ModalFieldGroupProps) {
  const message = error ?? helper ?? "";

  return (
    <div className={cn("grid gap-2", className)}>
      {label ? (
        <label className="text-sm font-medium" htmlFor={id}>
          {label}
        </label>
      ) : null}
      {children}
      <ModalFieldMessage
        id={`${id}-message`}
        message={message}
        variant={error ? "error" : "helper"}
      />
    </div>
  );
}

type ModalFieldMessageProps = {
  readonly id: string;
  readonly message: string;
  readonly variant: "error" | "helper";
};

// 기능 : 오류/도움말 영역 높이를 항상 고정해 검증 상태 변화로 필드 위치가 밀리지 않게 합니다.
function ModalFieldMessage({
  id,
  message,
  variant,
}: ModalFieldMessageProps) {
  return (
    <p
      className={cn(
        "h-4 truncate text-xs leading-4",
        variant === "error" ? "text-destructive" : "text-muted-foreground"
      )}
      id={id}
      title={message || undefined}
    >
      {message}
    </p>
  );
}

type ModalHelperTextProps = {
  readonly children: ReactNode;
  readonly className?: string;
};

// 기능 : 모달 내부 보조 설명 문법을 통일합니다.
export function ModalHelperText({ children, className }: ModalHelperTextProps) {
  return (
    <p className={cn("text-xs text-muted-foreground", className)}>{children}</p>
  );
}

type ModalErrorTextProps = {
  readonly message: string;
  readonly id?: string;
  readonly className?: string;
};

// 기능 : 모달 내부 field 오류 문법을 통일합니다.
export function ModalErrorText({ message, id, className }: ModalErrorTextProps) {
  return (
    <p className={cn("text-xs text-destructive", className)} id={id}>
      {message}
    </p>
  );
}

type ModalInlineCreateAreaProps = {
  readonly title: string;
  readonly name: string;
  readonly actionLabel: string;
  readonly isPending: boolean;
  readonly onCreate: () => Promise<void>;
  readonly children?: ReactNode;
  readonly disabled?: boolean;
  readonly errorMessage?: string | null;
  readonly meta?: string;
};

// 기능 : 검색 결과가 없을 때 모달 내부 inline 생성 CTA 영역을 렌더링합니다.
export function ModalInlineCreateArea({
  title,
  name,
  actionLabel,
  isPending,
  onCreate,
  children,
  disabled = false,
  errorMessage,
  meta,
}: ModalInlineCreateAreaProps) {
  return (
    <div className="rounded-md border border-dashed bg-muted/30 px-3 py-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-medium">{title}</p>
          <p className="mt-1 truncate text-xs text-muted-foreground">{name}</p>
          {meta ? (
            <p className="mt-1 truncate text-xs text-muted-foreground">
              {meta}
            </p>
          ) : null}
        </div>

        {children}

        <button
          className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-md border bg-white px-3 text-sm font-medium hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
          disabled={disabled || isPending}
          onClick={() => {
            void onCreate();
          }}
          type="button"
        >
          <Plus className="h-4 w-4" />
          <span className="whitespace-nowrap">{actionLabel}</span>
        </button>
      </div>

      {errorMessage ? (
        <ModalErrorText className="mt-2" message={errorMessage} />
      ) : null}
    </div>
  );
}

type ModalAdvancedSectionProps = {
  readonly title: string;
  readonly children: ReactNode;
  readonly className?: string;
};

// 기능 : 모달 내부 고급 옵션 details 문법을 통일합니다.
export function ModalAdvancedSection({
  title,
  children,
  className,
}: ModalAdvancedSectionProps) {
  return (
    <details className={cn("rounded-md border px-4 py-3", className)}>
      <summary className="cursor-pointer text-sm font-medium">{title}</summary>
      <div className="mt-4 grid gap-4">{children}</div>
    </details>
  );
}

type ModalFooterActionsProps = {
  readonly formId: string;
  readonly submitLabel?: string;
  readonly pendingLabel?: string;
  readonly submitIcon?: ReactNode;
  readonly isSubmitting?: boolean;
  readonly disabled?: boolean;
  readonly onCancel: () => void;
  readonly onSubmit?: () => void;
};

// 기능 : Quick Create 계열 모달 footer의 취소/저장 액션을 통일합니다.
export function ModalFooterActions({
  formId,
  submitLabel = "저장",
  pendingLabel = "저장 중",
  submitIcon,
  isSubmitting = false,
  disabled = false,
  onCancel,
  onSubmit,
}: ModalFooterActionsProps) {
  return (
    <>
      <button
        className="h-10 rounded-md border px-4 text-sm font-medium hover:bg-muted"
        onClick={onCancel}
        type="button"
      >
        취소
      </button>
      {onSubmit ? (
        <button
          className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
          disabled={disabled || isSubmitting}
          onClick={onSubmit}
          type="button"
        >
          {submitIcon ?? <Plus className="h-4 w-4" />}
          {isSubmitting ? pendingLabel : submitLabel}
        </button>
      ) : (
        <button
          className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
          disabled={disabled || isSubmitting}
          form={formId}
          type="submit"
        >
          {submitIcon ?? <Plus className="h-4 w-4" />}
          {isSubmitting ? pendingLabel : submitLabel}
        </button>
      )}
    </>
  );
}

// 기능 : form submit 기본 이벤트 타입을 외부 파일에서 재사용할 수 있게 노출합니다.
export type ModalFormSubmitEvent = FormEvent<HTMLFormElement>;
