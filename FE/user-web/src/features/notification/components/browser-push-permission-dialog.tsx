import { BellRing, Loader2 } from "lucide-react";
import { ModalShell } from "@/components/ui/modal-shell";

type BrowserPushPermissionDialogProps = {
  readonly isPending: boolean;
  readonly open: boolean;
  readonly onConfirm: () => void;
  readonly onOpenChange: (open: boolean) => void;
};

// 기능 : browser push 권한 요청 전에 서비스성 알림 목적을 설명하는 dialog를 렌더링합니다.
export function BrowserPushPermissionDialog({
  isPending,
  open,
  onConfirm,
  onOpenChange,
}: BrowserPushPermissionDialogProps) {
  return (
    <ModalShell
      bodyClassName="grid gap-4 px-5 py-5"
      footer={
        <div className="flex w-full flex-wrap justify-end gap-2">
          <button
            className="inline-flex min-h-10 items-center justify-center rounded-md border border-[#D8E0EA] bg-white px-4 text-sm font-semibold text-[#475569] hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isPending}
            onClick={() => onOpenChange(false)}
            type="button"
          >
            닫기
          </button>
          <button
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-[#4880EE] bg-[#4880EE] px-4 text-sm font-semibold text-white hover:bg-[#1F4EF5] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isPending}
            onClick={onConfirm}
            type="button"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <BellRing className="h-4 w-4" aria-hidden="true" />
            )}
            계속
          </button>
        </div>
      }
      footerClassName="h-auto px-5 py-4"
      onOpenChange={onOpenChange}
      open={open}
      placement="bottom"
      size="sm"
      title="중요한 영업 알림을 놓치지 않게 할까요?"
    >
      <p className="text-sm leading-6 text-[#334155]">
        회의 리마인더와 고객 후속 조치 알림을 이 기기에서 받을 수 있어요.
        브라우저 권한은 다음 단계에서 직접 허용해야 해요.
      </p>
      <div className="grid gap-2 rounded-md border border-[#E2E8F0] bg-[#F8FAFC] p-3 text-xs leading-5 text-[#64748B]">
        <span>
          서비스 알림은 일정과 딜 업무 알림이에요. 광고성 알림 동의와는
          별도로 다뤄요.
        </span>
      </div>
    </ModalShell>
  );
}
