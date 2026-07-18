import { Search } from "lucide-react";
import { useAuthSession } from "@/features/auth";

type MobileAppHeaderProps = {
  readonly logoColor?: string;
  readonly onSearchClick?: () => void;
};

export function MobileAppHeader({
  logoColor = "#4880EE",
  onSearchClick,
}: MobileAppHeaderProps) {
  const { user } = useAuthSession();
  const initial = user?.name ? user.name.charAt(0) : "?";

  return (
    <header className="sticky top-0 z-20 border-b border-gray-200 bg-white lg:hidden" style={{ height: 56 }}>
      <div className="flex h-full items-center gap-3 px-4">
        {/* Logo */}
        <span className="text-[17px] font-bold" style={{ color: logoColor }}>
          한손에 영업
        </span>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Search icon */}
        <button
          type="button"
          aria-label="통합검색"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full transition hover:bg-[#F8FAFC]"
          onClick={onSearchClick}
        >
          <Search className="h-5 w-5" style={{ color: "#6B7280" }} />
        </button>

        {/* Avatar */}
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
