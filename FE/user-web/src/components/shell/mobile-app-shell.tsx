import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { BottomTabBar } from "@/components/navigation/bottom-tab-bar";
import { MobileAppHeader } from "@/components/navigation/mobile-app-header";

type MobileAppShellProps = {
  readonly children?: ReactNode;
};

export function MobileAppShell({ children }: MobileAppShellProps) {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <div className="min-h-screen md:hidden">
      {isHome ? <MobileAppHeader /> : null}
      <main className="pb-[calc(var(--mobile-tabbar-height)+1.5rem)]">
        {children}
      </main>
      <BottomTabBar />
    </div>
  );
}
