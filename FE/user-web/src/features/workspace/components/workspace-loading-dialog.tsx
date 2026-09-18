import { cn } from "@/utils/cn";

// 기능 : Workspace 처리 중 표시하는 공통 로딩 다이얼로그를 렌더링합니다.
export function WorkspaceLoadingDialog({
  overlayClassName,
  title,
}: {
  readonly overlayClassName?: string;
  readonly title: string;
}) {
  return (
    <div
      className={cn(
        "fixed inset-0 z-[90] grid place-items-center bg-black/25 px-6",
        overlayClassName,
      )}
    >
      <section
        aria-modal="true"
        className="grid w-full max-w-[360px] justify-items-center rounded-[8px] bg-white px-8 py-9 text-center shadow-[0_18px_50px_rgba(15,23,42,0.18)]"
        role="dialog"
      >
        <span
          aria-hidden="true"
          className="h-9 w-9 rounded-full border-[3px] border-[#E4E2DC] border-t-[#4880EE] animate-spin"
        />
        <h2 className="mt-5 break-keep text-[20px] font-normal leading-[1.3] text-[#050505]">
          {title}
        </h2>
      </section>
    </div>
  );
}
