export function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted px-5">
      <section className="w-full max-w-sm rounded-lg border bg-white p-6">
        <p className="text-sm font-semibold text-primary">onehand.sales</p>
        <h1 className="mt-3 text-2xl font-semibold">로그인</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Auth 목표 작업에서 Supabase provider 로그인을 연결합니다.
        </p>
        <button className="mt-6 h-10 w-full rounded-md bg-primary text-sm font-medium text-primary-foreground">
          계속
        </button>
      </section>
    </main>
  );
}
