// 기능 : 홈 페이지 준비중 상태를 렌더링합니다.

export function HomePage() {
  return (
    <section className="flex min-h-[calc(100vh-var(--topbar-height))] items-center justify-center px-5 py-10">
      <div className="grid max-w-sm justify-items-center gap-3 text-center">
        <h1 className="text-2xl font-semibold text-foreground">
          화면 준비중입니다
        </h1>
      </div>
    </section>
  );
}
