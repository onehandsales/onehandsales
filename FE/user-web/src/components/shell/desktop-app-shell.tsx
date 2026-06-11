import type { ReactNode } from "react";
import { SidebarNav } from "@/components/navigation/sidebar-nav";
import { GlobalSearch } from "@/features/search";

type DesktopAppShellProps = {
  readonly children?: ReactNode;
};

export function DesktopAppShell({ children }: DesktopAppShellProps) {
  return (
    <div className="hidden min-h-screen md:block">
      <aside className="fixed inset-y-0 left-0 w-[var(--sidebar-width)] border-r border-white/10 bg-sidebar px-5 py-6 text-sidebar-foreground shadow-panel">
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
      <div className="pl-[var(--sidebar-width)]">
        <header className="sticky top-0 z-20 flex h-[var(--topbar-height)] items-center justify-between border-b border-border/80 bg-background/85 px-8 backdrop-blur">
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
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-sidebar text-sidebar-foreground">
              OS
            </div>
          </div>
        </header>
        <main className="min-h-[calc(100vh-var(--topbar-height))] px-8 py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
