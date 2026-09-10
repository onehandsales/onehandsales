import { LogOut, Plus } from "lucide-react";
import type { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { OneHandLogoMark } from "@/components/brand/onehand-logo-mark";
import { useAuthSession } from "@/features/auth";
import { SidebarNav } from "@/components/navigation/sidebar-nav";
import { GlobalSearch } from "@/features/search";
import {
  resolvePublicSiteLanguage,
  toPublicSitePath,
} from "@/features/public-site/i18n/public-site-locale-routes";

const PAGE_TITLES: Record<string, { title: string }> = {
  "/app": { title: "Home" },
  "/app/companies": { title: "Companies" },
  "/app/companies/new": { title: "Companies" },
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
  const navigate = useNavigate();
  const { logout } = useAuthSession();
  const page = PAGE_TITLES[pathname] ?? { title: "OneHand Sales" };

  const handleLogout = async () => {
    await logout();
    navigate(toPublicSitePath(resolvePublicSiteLanguage(), "/login"));
  };

  return (
    <div className="hidden min-h-screen md:flex">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 flex w-[var(--sidebar-width)] flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
        {/* Brand */}
        <div className="flex items-center gap-3 px-5 py-5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center text-primary">
            <OneHandLogoMark className="h-8 w-8" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-[14px] font-semibold leading-tight tracking-[-0.02em] text-sidebar-foreground">
              ?쒖넀???곸뾽
            </p>
            <p className="text-[14px] text-sidebar-foreground/45">
              OneHand
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
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-[14px] font-semibold text-primary">
            媛?
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[14px] font-medium text-sidebar-foreground">
              媛뺣?踰?
            </p>
            <p className="text-[14px] text-sidebar-foreground/45">
              Store Manager
            </p>
          </div>
          <button
            className="shrink-0 rounded-md p-1.5 text-sidebar-foreground/40 transition-colors hover:bg-sidebar-border hover:text-sidebar-foreground"
            title="濡쒓렇?꾩썐"
            onClick={() => void handleLogout()}
          >
            <LogOut className="h-4 w-4" strokeWidth={1.75} />
          </button>
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
              to="/app/companies/new"
            >
              <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />????
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
