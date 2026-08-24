import { CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";

// 기능 : 도움말 모달과 같은 등장 전환으로 성공 상태 메시지를 표시합니다.
export function SuccessStatusOverlay({
  message,
}: {
  readonly message: string;
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      setIsVisible(true);
    });

    return () => window.cancelAnimationFrame(frameId);
  }, []);

  return (
    <div
      className={`absolute inset-0 z-20 flex items-center justify-center bg-white/70 px-5 backdrop-blur-[1px] transition-opacity duration-300 ease-out ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        aria-live="polite"
        className={`grid max-w-[280px] origin-center justify-items-center gap-2 rounded-xl bg-white px-5 py-4 text-center shadow-2xl ring-1 ring-[#E5E7EB] transition-all duration-300 ease-out ${
          isVisible
            ? "translate-y-0 scale-100 opacity-100"
            : "-translate-y-3 scale-[0.97] opacity-0"
        }`}
        role="status"
      >
        <CheckCircle2 className="h-7 w-7 text-[#16A34A]" strokeWidth={2} />
        <p className="text-[13px] font-semibold leading-6 text-[#111827]">
          {message}
        </p>
      </div>
    </div>
  );
}

