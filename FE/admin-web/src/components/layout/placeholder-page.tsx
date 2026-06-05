export function PlaceholderPage({ title }: { title: string }) {
  return (
    <section className="mx-auto max-w-7xl px-6 py-8">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        표, 필터, 상세 패널을 연결할 관리자 라우트입니다.
      </p>
    </section>
  );
}
