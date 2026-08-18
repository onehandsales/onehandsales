import { AlertCircle } from "lucide-react";

// 기능 : 삭제되었거나 존재하지 않는 상세 URL 접근을 공통 안내 다이얼로그로 표시합니다.
export function InvalidDetailPathDialog({
  onConfirm,
}: {
  readonly onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/35 px-4">
      <div
        aria-label="올바르지 않은 경로"
        aria-modal="true"
        className="w-full max-w-[288px] rounded-lg border border-[#E5E7EB] bg-white p-5 text-center shadow-xl"
        role="dialog"
      >
        <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-600">
          <AlertCircle className="h-5 w-5" />
        </span>
        <p className="mt-3 text-sm font-semibold text-[#111827]">
          올바르지 않은 경로입니다.
        </p>
        <button
          className="mt-5 h-11 rounded-md bg-[#2563EB] px-5 text-sm font-semibold text-white hover:bg-[#1D4ED8]"
          onClick={onConfirm}
          type="button"
        >
          확인
        </button>
      </div>
    </div>
  );
}
