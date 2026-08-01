import { Send, ShieldAlert, X } from "lucide-react";
import { useState, type FormEvent } from "react";
import {
  parseSensitiveRawAccessReason,
  sensitiveRawReasonMaxLength,
  sensitiveRawReasonMinLength,
} from "../schemas/sensitive-raw-access-schema";

type SensitiveRawAccessDialogProps = {
  readonly open: boolean;
  readonly title: string;
  readonly targetLabel: string;
  readonly isPending?: boolean;
  readonly onClose: () => void;
  readonly onConfirm: (reason: string) => void;
};

// 기능 : 민감 원문 조회 사유를 입력받고 10~1000자 검증 후 확인 이벤트를 전달합니다.
export function SensitiveRawAccessDialog({
  open,
  title,
  targetLabel,
  isPending = false,
  onClose,
  onConfirm,
}: SensitiveRawAccessDialogProps) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!open) {
    return null;
  }

  // 기능 : 사유 입력 form submit을 검증하고 상위 confirm handler로 전달합니다.
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      const normalizedReason = parseSensitiveRawAccessReason(reason);
      setError(null);
      onConfirm(normalizedReason);
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : "사유를 다시 확인해 주세요"
      );
    }
  }

  // 기능 : modal 닫힘 시 사유 입력과 오류 상태를 초기화합니다.
  function handleClose() {
    setReason("");
    setError(null);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 px-4">
      <form
        className="grid w-full max-w-xl gap-4 rounded-lg bg-white p-5 shadow-xl"
        onSubmit={handleSubmit}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3">
            <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
            <div className="min-w-0">
              <h2 className="text-base font-semibold">{title}</h2>
              <p className="mt-1 truncate text-sm text-muted-foreground">
                {targetLabel}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border text-muted-foreground hover:bg-muted"
            onClick={handleClose}
            aria-label="닫기"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <label className="grid gap-2">
          <span className="text-sm font-medium">조회 사유</span>
          <textarea
            className="min-h-32 resize-none rounded-md border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            maxLength={sensitiveRawReasonMaxLength}
            value={reason}
            onChange={(event) => {
              setReason(event.target.value);
              setError(null);
            }}
          />
        </label>

        <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
          <span>
            {reason.trim().length}/{sensitiveRawReasonMaxLength}
          </span>
          <span>최소 {sensitiveRawReasonMinLength}자</span>
        </div>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            className="inline-flex h-9 items-center justify-center rounded-md border px-3 text-sm font-medium hover:bg-muted"
            onClick={handleClose}
          >
            취소
          </button>
          <button
            type="submit"
            className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-3 text-sm font-semibold text-primary-foreground disabled:opacity-50"
            disabled={isPending}
          >
            <Send className="h-4 w-4" />
            확인
          </button>
        </div>
      </form>
    </div>
  );
}
