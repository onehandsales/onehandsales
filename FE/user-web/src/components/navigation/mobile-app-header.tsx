import { Bell, Search } from "lucide-react";
import { useAuthSession } from "@/features/auth";
import { useAppI18n } from "@/features/app-i18n";

type MobileAppHeaderProps = {
  readonly logoColor?: string;
};

// 기능 : MobileAppHeader 컴포넌트를 렌더링합니다.
export function MobileAppHeader({
  logoColor = "#4880EE",
}: MobileAppHeaderProps) {
  // 1. 화면 상태와 동작에 필요한 { user } 값을 준비한다.
  const { user } = useAuthSession();
  // 2. 화면 상태와 동작에 필요한 { t } 값을 준비한다.
  const { t } = useAppI18n();
  // 3. 이후 처리에 사용할 initial을 계산한다.
  const initial = user?.name ? user.name.charAt(0) : "?";

  // 4. 계산된 결과를 호출자에게 반환한다.
  return (
    <header
      className="sticky top-0 z-20 border-b border-gray-200 bg-white lg:hidden"
      data-testid="mobile-app-header"
      style={{ height: 56 }}
    >
      <div className="flex h-full items-center gap-3 px-4">
        {/* 기능 : 모바일 앱 헤더의 브랜드명을 현재 앱 locale 문구로 표시합니다. */}
        <span className="text-[17px] font-bold" style={{ color: logoColor }}>
          {t("shell.appFallbackTitle")}
        </span>

        <div className="flex-1" />

        <button
          aria-label={t("shell.notificationsAria")}
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[#6B7280] transition hover:bg-[#F3F4F6] hover:text-[#374151] active:bg-[#E5E7EB]"
          type="button"
        >
          <Bell className="h-5 w-5" strokeWidth={2} />
        </button>
        <button
          aria-label={t("shell.searchAria")}
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[#6B7280] transition hover:bg-[#F3F4F6] hover:text-[#374151] active:bg-[#E5E7EB]"
          type="button"
        >
          <Search className="h-5 w-5" strokeWidth={2} />
        </button>

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
