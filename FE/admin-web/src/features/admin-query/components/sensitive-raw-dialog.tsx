import { AlertTriangle, Eye, Loader2, X } from "lucide-react";
import { useState } from "react";
import { useAdminSensitiveRawMutation } from "@/features/admin-query/hooks/use-admin-query";
import type {
  AdminSensitiveRawRequest,
  AdminSensitiveRawResponse,
} from "@/features/admin-query/types/admin-query";

type SensitiveRawDialogProps = {
  readonly request: Omit<AdminSensitiveRawRequest, "reason"> & {
    readonly label: string;
  };
  readonly onClose: () => void;
  readonly onSuccess: (response: AdminSensitiveRawResponse) => void;
};

const minimumReasonLength = 10;

export function SensitiveRawDialog({
  request,
  onClose,
  onSuccess,
}: SensitiveRawDialogProps) {
  const [reason, setReason] = useState("");
  const mutation = useAdminSensitiveRawMutation();
  const canSubmit =
    reason.trim().replace(/\s+/g, " ").length >= minimumReasonLength &&
    !mutation.isPending;

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    const response = await mutation.mutateAsync({
      targetType: request.targetType,
      targetId: request.targetId,
      fields: request.fields,
      reason,
    });
    onSuccess(response);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 px-4">
      <form
        className="grid w-full max-w-lg gap-4 rounded-lg border bg-white p-5 shadow-xl"
        onSubmit={onSubmit}
      >
        <div className="flex items-start justify-between gap-4 border-b pb-4">
          <div className="flex items-start gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-amber-50">
              <AlertTriangle className="h-5 w-5 text-amber-600" aria-hidden />
            </div>
            <div>
              <h2 className="text-base font-semibold">민감 원문 조회</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {request.label}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="grid h-9 w-9 place-items-center rounded-md border hover:bg-muted"
            aria-label="닫기"
            disabled={mutation.isPending}
            onClick={onClose}
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>

        <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          원문 조회는 감사 로그에 기록되며, 필요한 필드만 일시적으로 표시됩니다.
        </div>

        <label className="grid gap-2 text-sm">
          <span className="font-medium">조회 사유</span>
          <textarea
            className="min-h-28 resize-none rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="최소 10자 이상 입력"
          />
        </label>

        {mutation.isError ? (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            원문 조회에 실패했습니다. 사유와 권한, 대상 상태를 확인하세요.
          </div>
        ) : null}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            className="h-10 rounded-md border px-4 text-sm font-semibold hover:bg-muted"
            disabled={mutation.isPending}
            onClick={onClose}
          >
            취소
          </button>
          <button
            type="submit"
            className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-50"
            disabled={!canSubmit}
          >
            {mutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Eye className="h-4 w-4" aria-hidden />
            )}
            원문 보기
          </button>
        </div>
      </form>
    </div>
  );
}
