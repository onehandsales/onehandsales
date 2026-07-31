import { RotateCcw, Trash2 } from "lucide-react";

type MobileLocalDraftRestorePromptProps = {
  readonly onDiscard: () => void;
  readonly onRestore: () => void;
};

// 기능 : 작성 중이던 local draft를 불러올지 사용자가 선택하는 prompt를 렌더링합니다.
export function MobileLocalDraftRestorePrompt({
  onDiscard,
  onRestore,
}: MobileLocalDraftRestorePromptProps) {
  return (
    <div
      className="grid gap-3 rounded-md border border-[#BFDBFE] bg-[#EFF6FF] px-3 py-3"
      data-testid="mobile-local-draft-restore-prompt"
    >
      <p className="text-[13px] font-semibold leading-5 text-[#1E3A8A]">
        작성 중이던 내용을 불러올까요?
      </p>
      <div className="flex flex-wrap justify-end gap-2">
        <button
          className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[#D8E0EA] bg-white px-3 text-[12px] font-semibold text-[#475569] hover:bg-[#F8FAFC]"
          onClick={onDiscard}
          type="button"
        >
          <Trash2 className="h-3.5 w-3.5" />
          버리기
        </button>
        <button
          className="inline-flex h-8 items-center gap-1.5 rounded-md bg-[#4880EE] px-3 text-[12px] font-semibold text-white hover:bg-[#1D4ED8]"
          onClick={onRestore}
          type="button"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          불러오기
        </button>
      </div>
    </div>
  );
}
