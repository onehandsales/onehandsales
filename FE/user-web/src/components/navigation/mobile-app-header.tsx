import { Search } from "lucide-react";
import type { ReactNode } from "react";
import { useAuthSession } from "@/features/auth";
import { useAppI18n } from "@/features/app-i18n";

type MobileAppHeaderProps = {
  readonly logoColor?: string;
  readonly onSearchClick?: () => void;
  readonly rightSlot?: ReactNode;
};

export function MobileAppHeader({
  logoColor = "#4880EE",
  onSearchClick,
  rightSlot,
}: MobileAppHeaderProps) {
  const { user } = useAuthSession();
  const { t } = useAppI18n();
  const initial = user?.name ? user.name.charAt(0) : "?";

  return (
    <header className="sticky top-0 z-20 border-b border-gray-200 bg-white lg:hidden" style={{ height: 56 }}>
      <div className="flex h-full items-center gap-3 px-4">
        {/* 기능 : 모바일 앱 헤더의 브랜드명을 현재 앱 locale 문구로 표시합니다. */}
        <span className="text-[17px] font-bold" style={{ color: logoColor }}>
          {t("shell.appFallbackTitle")}
        </span>

        <div className="flex-1" />

        <button
          type="button"
          aria-label={t("shell.integratedSearch")}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full transition hover:bg-[#F8FAFC]"
          onClick={onSearchClick}
        >
          <Search className="h-5 w-5" style={{ color: "#6B7280" }} />
        </button>

        {rightSlot}

        <div
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[13px] font-semibold"
          style={{ backgroundColor: "#EEF4FF", color: "#4880EE" }}
        >
          {initial}
        </div>
      </div>
    </header>
  );
}
