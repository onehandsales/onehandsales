import { ChevronRight } from "lucide-react";
import { useState } from "react";
import { useAppI18n } from "@/features/app-i18n";
import { cn } from "@/utils/cn";

type SidebarNavProps = {
  readonly className?: string;
};

// 기능 : SidebarNav 컴포넌트를 렌더링합니다.
export function SidebarNav({ className }: SidebarNavProps) {
  const { t } = useAppI18n();
  const [isMainGroupOpen, setMainGroupOpen] = useState(true);

  return (
    <nav
      aria-label="Workspace navigation"
      className={cn("flex flex-col gap-3", className)}
    >
      <div>
        <button
          aria-label={t(
            isMainGroupOpen
              ? "navigation.mainGroupClose"
              : "navigation.mainGroupOpen"
          )}
          aria-expanded={isMainGroupOpen}
          className="group/sidebar-tooltip relative mb-1 flex h-6 w-full items-center gap-1 rounded-md px-2 text-left text-[14px] font-semibold tracking-[0.02em] text-[#9CA3AF] transition hover:bg-[#E4E2DC] hover:text-[#6B7280] active:bg-[#D3D1CB]"
          onClick={() => setMainGroupOpen((current) => !current)}
          type="button"
        >
          <ChevronRight
            className={cn(
              "h-5 w-5 shrink-0 transition-transform",
              isMainGroupOpen ? "rotate-90" : "rotate-0"
            )}
            strokeWidth={2}
          />
          <span>{t("navigation.mainGroup")}</span>
          <span className="pointer-events-none absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2 whitespace-nowrap rounded-md bg-[#111827] px-2 py-1 text-[14px] font-medium leading-none text-white opacity-0 shadow-lg transition-opacity group-hover/sidebar-tooltip:opacity-100">
            {t(
              isMainGroupOpen
                ? "navigation.mainGroupClose"
                : "navigation.mainGroupOpen"
            )}
          </span>
        </button>
        {isMainGroupOpen ? <div className="flex flex-col gap-px" /> : null}
      </div>
    </nav>
  );
}
