import { Bell, Plus } from "lucide-react";
import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { SidebarNav } from "@/components/navigation/sidebar-nav";
import { GlobalSearch } from "@/features/search";

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  "/": { title: "홈", subtitle: "오늘 파이프라인을 확인 하세요." },
  "/deals": { title: "딜", subtitle: "진행 중인 딜을 관리합니다." },
  "/deals/new": { title: "딜", subtitle: "진행 중인 딜을 관리합니다." },
  "/companies": { title: "회사", subtitle: "등록된 회사를 관리합니다." },
  "/companies/new": { title: "회사", subtitle: "등록된 회사를 관리합니다." },
  "/contacts": { title: "거래처", subtitle: "거래처 담당자를 관리합니다." },
  "/products": { title: "제품", subtitle: "제품과 서비스를 관리합니다." },
  "/products/new": { title: "제품", subtitle: "제품과 서비스를 관리합니다." },
  "/schedules": { title: "일정", subtitle: "예정된 일정을 확인합니다." },
  "/meeting-notes": { title: "회의록", subtitle: "회의 내용을 기록합니다." },
  "/notifications": { title: "알림", subtitle: "최근 알림을 확인합니다." },
  "/settings": { title: "설정", subtitle: "계정과 환경을 설정합니다." },
};

type DesktopAppShellProps = {
  readonly children?: ReactNode;
  readonly noPadding?: boolean;
};

export function DesktopAppShell({ children, noPadding = false }: DesktopAppShellProps) {
  const { pathname } = useLocation();
  const page = PAGE_TITLES[pathname] ?? { title: "한손에 영업", subtitle: "" };

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
            {page.subtitle ? (
              <p className="text-[13px] text-muted-foreground">{page.subtitle}</p>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <GlobalSearch />
            <Link
              className="inline-flex h-[34px] items-center gap-1.5 rounded-lg bg-primary px-3 text-[13px] font-semibold text-white transition hover:bg-primary/90"
              to="/deals/new"
            >
              <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
              새 딜
            </Link>
            <Link
              className="inline-flex h-[34px] w-[34px] items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition hover:bg-gray-50"
              to="/notifications"
            >
              <Bell className="h-4 w-4" />
            </Link>
            <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-[12px] font-semibold text-white">
              강
            </div>
          </div>
        </header>

        <main className={noPadding ? "flex flex-col overflow-hidden" : "min-h-[calc(100vh-var(--topbar-height))] px-8 py-8"}>
          {children}
        </main>
      </div>
    </div>
  );
}
