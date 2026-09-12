import { LogOut } from "lucide-react";
import type { ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { OneHandLogoMark } from "@/components/brand/onehand-logo-mark";
import { useAuthSession } from "@/features/auth";
import { SidebarNav } from "@/components/navigation/sidebar-nav";
import {
  resolvePublicSiteLanguage,
  toPublicSitePath,
} from "@/features/public-site/i18n/public-site-locale-routes";

const PAGE_TITLES: Record<string, { title: string }> = {
  "/app": { title: "Home" },
};

type DesktopAppShellProps = {
  readonly children?: ReactNode;
  readonly noPadding?: boolean;
};

// 기능 : DesktopAppShell 컴포넌트를 렌더링합니다.
export function DesktopAppShell({
  children,
  noPadding = false,
}: DesktopAppShellProps) {
  // 1. 화면 상태와 동작에 필요한 { pathname } 값을 준비한다.
  const { pathname } = useLocation();
  // 2. 화면 상태와 동작에 필요한 navigate 값을 준비한다.
  const navigate = useNavigate();
  // 3. 화면 상태와 동작에 필요한 { logout } 값을 준비한다.
  const { logout } = useAuthSession();
  // 4. 이후 처리에 사용할 page을 계산한다.
  const page = PAGE_TITLES[pathname] ?? { title: "OneHand CRM" };

  // 기능 : handle Logout 이벤트를 처리합니다.
  // 5. 비동기 결과를 받아 handleLogout에 저장한다.
  const handleLogout = async () => {
    await logout();
    navigate(toPublicSitePath(resolvePublicSiteLanguage(), "/login"));
  };

  // 6. 계산된 결과를 호출자에게 반환한다.
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
              OneHand CRM
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
            O
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[14px] font-medium text-sidebar-foreground">
              OneHand User
            </p>
            <p className="text-[14px] text-sidebar-foreground/45">
              Workspace
            </p>
          </div>
          <button
            className="shrink-0 rounded-md p-1.5 text-sidebar-foreground/40 transition-colors hover:bg-sidebar-border hover:text-sidebar-foreground"
            title="Log out"
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
          <div className="flex items-center gap-2" />
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
