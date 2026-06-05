import { Link, Outlet } from "react-router-dom";

export function AdminShell() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 w-64 border-r bg-white px-4 py-5">
        <div className="text-sm font-semibold text-primary">onehand.sales admin</div>
        <nav className="mt-6 grid gap-1 text-sm">
          <Link className="rounded-md px-3 py-2 hover:bg-muted" to="/">
            대시보드
          </Link>
          <Link className="rounded-md px-3 py-2 hover:bg-muted" to="/users">
            사용자
          </Link>
          <Link className="rounded-md px-3 py-2 hover:bg-muted" to="/organizations">
            조직
          </Link>
          <Link className="rounded-md px-3 py-2 hover:bg-muted" to="/subscriptions">
            구독
          </Link>
          <Link className="rounded-md px-3 py-2 hover:bg-muted" to="/analytics">
            사용량
          </Link>
          <Link className="rounded-md px-3 py-2 hover:bg-muted" to="/audit-logs">
            감사 로그
          </Link>
          <Link className="rounded-md px-3 py-2 hover:bg-muted" to="/system">
            시스템
          </Link>
          <Link className="rounded-md px-3 py-2 hover:bg-muted" to="/support">
            지원
          </Link>
        </nav>
      </aside>
      <main className="pl-64">
        <Outlet />
      </main>
    </div>
  );
}
