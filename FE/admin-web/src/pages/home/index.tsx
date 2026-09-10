import { useAdminAuthSession } from "@/features/auth";

// 기능 : Admin 권한 확인 이후의 최소 화면을 렌더링합니다.
export function HomePage() {
  const { logout, user } = useAdminAuthSession();

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted px-5">
      <section className="grid w-full max-w-md gap-5 rounded-lg border bg-white p-6">
        <div>
          <p className="text-sm font-semibold text-primary">OneHand admin</p>
          <h1 className="mt-3 text-2xl font-semibold">Admin verified</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This app only verifies admin access with /admin/api/me.
          </p>
        </div>
        <dl className="grid gap-2 rounded-md bg-muted p-3 text-sm">
          <div className="flex items-center justify-between gap-3">
            <dt className="text-muted-foreground">Role</dt>
            <dd className="font-medium">{user?.role ?? "ADMIN"}</dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-muted-foreground">Email</dt>
            <dd className="truncate font-medium">{user?.email ?? "-"}</dd>
          </div>
        </dl>
        <button
          className="h-10 rounded-md border bg-white px-4 text-sm font-medium hover:bg-muted"
          onClick={logout}
          type="button"
        >
          Clear token
        </button>
      </section>
    </main>
  );
}
