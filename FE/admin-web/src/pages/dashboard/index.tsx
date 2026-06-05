const metrics = [
  { label: "사용자", value: "0" },
  { label: "조직", value: "0" },
  { label: "구독", value: "0" },
  { label: "원문 조회", value: "0" },
];

export function DashboardPage() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-8">
      <header className="border-b pb-5">
        <h1 className="text-2xl font-semibold">관리자 대시보드</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          운영 지표, 최근 기록, 감사 신호를 확인합니다.
        </p>
      </header>

      <div className="mt-5 grid grid-cols-4 gap-3">
        {metrics.map((metric) => (
          <div className="rounded-lg border bg-white p-4" key={metric.label}>
            <div className="text-xs font-medium text-muted-foreground">
              {metric.label}
            </div>
            <div className="mt-2 text-2xl font-semibold">{metric.value}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-lg border bg-white">
        <div className="border-b px-4 py-3 text-sm font-medium">
          최근 감사 로그
        </div>
        <div className="px-4 py-8 text-sm text-muted-foreground">
          Admin 목표 작업에서 감사 로그 표를 연결합니다.
        </div>
      </div>
    </section>
  );
}
