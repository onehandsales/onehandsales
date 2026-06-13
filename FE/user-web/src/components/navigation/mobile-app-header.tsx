import { Bell } from "lucide-react";
import { Link } from "react-router-dom";
import { GlobalSearch } from "@/features/search";

type MobileAppHeaderProps = {
  readonly title: string;
  readonly subtitle?: string;
};

export function MobileAppHeader({
  title,
  subtitle = "오늘의 파이프라인을 먼저 확인하세요.",
}: MobileAppHeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-gray-200 bg-white px-4 pb-3 pt-3 md:hidden">
      <div className="flex min-h-[56px] items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
            onehand.sales
          </p>
          <h1 className="mt-0.5 text-xl font-semibold tracking-[-0.03em] text-foreground">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Link
            className="inline-flex h-9 w-9 items-center justify-center rounded-[10px] border border-gray-200 bg-white text-gray-500"
            to="/notifications"
          >
            <Bell className="h-4 w-4" />
          </Link>
        </div>
      </div>
      <div className="mt-2.5">
        <GlobalSearch />
      </div>
    </header>
  );
}
