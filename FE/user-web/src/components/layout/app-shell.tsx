import { Outlet, useLocation } from "react-router-dom";
import { BottomTabBar } from "@/components/navigation/bottom-tab-bar";
import { MobileAppHeader } from "@/components/navigation/mobile-app-header";
import { SidebarNav } from "@/components/navigation/sidebar-nav";
import { GlobalSearch } from "@/features/search";

export function AppShell() {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 hidden w-[var(--sidebar-width)] border-r border-white/10 bg-sidebar px-5 py-6 text-sidebar-foreground shadow-panel md:block">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-sidebar-foreground/60">
            CRM Workspace
          </p>
          <h1 className="mt-2 text-xl font-semibold tracking-[-0.03em]">
            onehand.sales
          </h1>
          <p className="mt-2 text-sm text-sidebar-foreground/65">
            파이프라인과 고객 활동을 한 화면에서 관리합니다.
          </p>
        </div>
        <SidebarNav className="mt-8" />
      </aside>

      <div className="md:pl-[var(--sidebar-width)]">
        <header className="sticky top-0 z-20 hidden h-[var(--topbar-height)] items-center justify-between border-b border-border/80 bg-background/85 px-8 backdrop-blur md:flex">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
              Deal Flow
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Desktop workspace
            </p>
          </div>
          <div className="flex min-w-[24rem] items-center justify-end gap-3">
            <GlobalSearch />
            <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sidebar text-sidebar-foreground">
              OS
            </div>
          </div>
        </header>

        <div className="md:hidden">
          {isHome ? <MobileAppHeader title="딜 파이프라인" /> : null}
        </div>

        <main className="min-h-[calc(100vh-var(--topbar-height))] pb-[calc(var(--mobile-tabbar-height)+1.5rem)] md:px-8 md:py-8 md:pb-8">
          <Outlet />
        </main>
      </div>

      <BottomTabBar />
    </div>
  );
}
