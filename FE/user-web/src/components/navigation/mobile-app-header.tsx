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
    <header className="sticky top-0 z-20 border-b border-border/70 bg-background/90 px-4 pb-4 pt-3 backdrop-blur md:hidden">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
            onehand.sales
          </p>
          <h1 className="mt-1 text-xl font-semibold tracking-[-0.03em] text-foreground">
            {title}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-border bg-panel text-foreground shadow-soft"
            to="/notifications"
          >
            <Bell className="h-4 w-4" />
          </Link>
        </div>
      </div>
      <div className="mt-4">
        <GlobalSearch />
      </div>
    </header>
  );
}
