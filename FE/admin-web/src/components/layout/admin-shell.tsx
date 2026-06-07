import { Link, Outlet } from "react-router-dom";

export function AdminShell() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside className="border-b bg-white px-4 py-4 md:fixed md:inset-y-0 md:left-0 md:w-64 md:border-b-0 md:border-r md:py-5">
        <div className="text-sm font-semibold text-primary">onehand.sales admin</div>
        <nav className="mt-4 flex gap-1 overflow-x-auto pb-1 text-sm md:mt-6 md:grid md:overflow-visible md:pb-0">
          <Link className="shrink-0 rounded-md px-3 py-2 hover:bg-muted" to="/">
            대시보드
          </Link>
          <Link className="shrink-0 rounded-md px-3 py-2 hover:bg-muted" to="/users">
            사용자
          </Link>
          <Link className="shrink-0 rounded-md px-3 py-2 hover:bg-muted" to="/organizations">
            데이터
          </Link>
          <Link className="shrink-0 rounded-md px-3 py-2 hover:bg-muted" to="/subscriptions">
            구독
          </Link>
          <Link className="shrink-0 rounded-md px-3 py-2 hover:bg-muted" to="/analytics">
            사용량
          </Link>
          <Link className="shrink-0 rounded-md px-3 py-2 hover:bg-muted" to="/audit-logs">
            감사 로그
          </Link>
          <Link className="shrink-0 rounded-md px-3 py-2 hover:bg-muted" to="/system">
            시스템
          </Link>
          <Link className="shrink-0 rounded-md px-3 py-2 hover:bg-muted" to="/support">
            지원
          </Link>
        </nav>
      </aside>
      <main className="md:pl-64">
        <Outlet />
      </main>
    </div>
  );
}
