import { Link, Outlet } from "react-router-dom";

export function AppShell() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 hidden w-60 border-r bg-white px-4 py-5 md:block">
        <div className="text-sm font-semibold text-primary">onehand.sales</div>
        <nav className="mt-6 grid gap-1 text-sm">
          <Link className="rounded-md px-3 py-2 hover:bg-muted" to="/">
            파이프라인
          </Link>
          <Link className="rounded-md px-3 py-2 hover:bg-muted" to="/companies">
            회사
          </Link>
          <Link className="rounded-md px-3 py-2 hover:bg-muted" to="/contacts">
            거래처
          </Link>
          <Link className="rounded-md px-3 py-2 hover:bg-muted" to="/products">
            제품
          </Link>
          <Link className="rounded-md px-3 py-2 hover:bg-muted" to="/deals">
            딜
          </Link>
          <Link className="rounded-md px-3 py-2 hover:bg-muted" to="/schedules">
            일정
          </Link>
          <Link className="rounded-md px-3 py-2 hover:bg-muted" to="/meeting-notes">
            회의록
          </Link>
          <Link className="rounded-md px-3 py-2 hover:bg-muted" to="/import">
            가져오기
          </Link>
        </nav>
      </aside>
      <main className="md:pl-60">
        <Outlet />
      </main>
    </div>
  );
}
