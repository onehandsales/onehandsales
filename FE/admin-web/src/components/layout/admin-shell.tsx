import { LayoutDashboard, ScrollText, Trash2, UsersRound } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";

const navigationItems = [
  { label: "대시보드", path: "/", icon: LayoutDashboard },
  { label: "사용자", path: "/users", icon: UsersRound },
  { label: "Trash 요청", path: "/trash/recovery-requests", icon: Trash2 },
  { label: "감사 로그", path: "/audit-logs", icon: ScrollText },
];

// 기능 : Admin Web의 좌측 navigation과 본문 outlet을 렌더링합니다.
export function AdminShell() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside className="border-b bg-white px-4 py-4 md:fixed md:inset-y-0 md:left-0 md:w-64 md:border-b-0 md:border-r md:py-5">
        <div className="text-sm font-semibold text-primary">Onehand admin</div>
        <nav className="mt-5 grid gap-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/"}
                className={({ isActive }) => getNavLinkClassName(isActive)}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </aside>
      <main className="md:pl-64">
        <Outlet />
      </main>
    </div>
  );
}

// 기능 : Admin navigation 활성 상태에 맞는 className을 반환합니다.
function getNavLinkClassName(isActive: boolean): string {
  return [
    "inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-medium",
    isActive
      ? "bg-primary text-primary-foreground"
      : "text-muted-foreground hover:bg-muted hover:text-foreground",
  ].join(" ");
}
