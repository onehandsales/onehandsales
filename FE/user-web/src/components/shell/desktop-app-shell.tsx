import { Plus } from "lucide-react";
import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { SidebarNav } from "@/components/navigation/sidebar-nav";
import { GlobalSearch } from "@/features/search";

const PAGE_TITLES: Record<string, { title: string }> = {
  "/": { title: "홈" },
  "/deals": { title: "딜" },
  "/deals/new": { title: "딜" },
  "/companies": { title: "회사" },
  "/companies/new": { title: "회사" },
  "/contacts": { title: "담당자" },
  "/products": { title: "제품" },
  "/products/new": { title: "제품" },
  "/schedules": { title: "일정" },
  "/meeting-notes": { title: "회의록" },
  "/notifications": { title: "알림" },
  "/settings": { title: "설정" },
};

type DesktopAppShellProps = {
  readonly children?: ReactNode;
  readonly noPadding?: boolean;
};

export function DesktopAppShell({
  children,
  noPadding = false,
}: DesktopAppShellProps) {
  const { pathname } = useLocation();
  const page = PAGE_TITLES[pathname] ?? { title: "한손에 영업" };

  return (
    <div className="hidden min-h-screen md:flex">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 flex w-[var(--sidebar-width)] flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
        {/* Brand */}
        <div className="flex items-center gap-3 px-5 py-5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-[15px] font-bold text-white shadow-md">
            한
          </div>
          <div className="min-w-0">
            <p className="truncate text-[14px] font-semibold leading-tight tracking-[-0.02em] text-sidebar-foreground">
              한손에 영업
            </p>
            <p className="text-[11px] text-sidebar-foreground/45">
              onehand.sales
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="mx-5 h-px bg-sidebar-border" />

        {/* Nav */}
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <SidebarNav />
        </div>

        {/* Divider */}
        <div className="mx-5 h-px bg-sidebar-border" />

        {/* User profile */}
        <div className="flex items-center gap-3 px-4 py-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-[12px] font-semibold text-primary">
            강
          </div>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-medium text-sidebar-foreground">
              강변범
            </p>
            <p className="text-[11px] text-sidebar-foreground/45">
              Store Manager
            </p>
          </div>
          {/*<Link
            aria-label="알림"
            className="ml-auto inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sidebar-foreground/60 transition hover:bg-sidebar-accent hover:text-sidebar-foreground"
            to="/notifications"
          >
            <Bell className="h-4 w-4" />
          </Link>
          */}
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col pl-[var(--sidebar-width)]">
        {/* TopBar */}
        <header className="sticky top-0 z-20 flex h-[var(--topbar-height)] items-center justify-between border-b border-border bg-white px-8">
          <div>
            <h1 className="text-[20px] font-bold leading-tight tracking-[-0.02em] text-foreground">
              {page.title}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <GlobalSearch />
            <Link
              className="inline-flex h-[34px] items-center gap-1.5 rounded-lg bg-primary px-3 text-[13px] font-semibold text-white transition hover:bg-primary/90"
              to="/deals/new"
            >
              <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />새 딜
            </Link>
          </div>
        </header>

        <main
          className={
            noPadding
              ? "flex flex-col overflow-hidden"
              : "min-h-[calc(100vh-var(--topbar-height))] px-8 py-8"
          }
        >
          {children}
        </main>
      </div>
    </div>
  );
}
