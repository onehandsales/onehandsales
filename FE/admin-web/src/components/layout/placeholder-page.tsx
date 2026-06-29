export function PlaceholderPage({ title }: { readonly title: string }) {
  return (
    <section className="mx-auto max-w-7xl px-6 py-8">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        관리자 권한 확인만 제공 중입니다. 운영 조회 화면은 Backend Admin API
        구현 후 노출합니다.
      </p>
    </section>
  );
}
