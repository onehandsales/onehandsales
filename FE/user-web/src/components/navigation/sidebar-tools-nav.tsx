import { Bell, Files, Mail, SquareCheck, StickyNote } from "lucide-react";
import { useAppI18n } from "@/features/app-i18n";

const SIDEBAR_TOOL_ITEMS = [
  { icon: Bell, labelKey: "navigation.notifications" },
  { icon: StickyNote, labelKey: "navigation.memos" },
  { icon: SquareCheck, labelKey: "navigation.tasks" },
  { icon: Mail, labelKey: "navigation.emails" },
  { icon: Files, labelKey: "navigation.reports" },
] as const;

// 기능 : 사이드바 상단에 알림, 메모, 할 일, 이메일, 레포트 메뉴를 표시합니다.
export function SidebarToolsNav() {
  const { t } = useAppI18n();

  return (
    <nav
      aria-label={t("navigation.toolsLabel")}
      className="flex shrink-0 flex-col gap-px px-2 py-1"
    >
      {SIDEBAR_TOOL_ITEMS.map(({ icon: Icon, labelKey }) => (
        <button
          className="group/sidebar-tool-row relative flex h-[30px] w-full max-w-[213px] items-center gap-2 rounded-md px-2 text-left text-[14px] font-medium text-[#4B5563] transition-colors hover:bg-[#E4E2DC] hover:text-[#111827] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#4880EE]/45 active:bg-[#D3D1CB] active:text-[#111827]"
          key={labelKey}
          type="button"
        >
          <Icon
            aria-hidden="true"
            className="h-5 w-5 shrink-0 text-[#9CA3AF] group-hover/sidebar-tool-row:text-[#6B7280]"
            strokeWidth={2}
          />
          <span className="min-w-0 flex-1 truncate">{t(labelKey)}</span>
        </button>
      ))}
    </nav>
  );
}
