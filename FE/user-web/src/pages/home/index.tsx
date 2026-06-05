import { Search, Plus } from "lucide-react";

const deals = [
  {
    title: "재계약 논의",
    company: "에이컴 코리아",
    stage: "논의 중",
    amount: "4,200만원",
    likelihood: "긍정",
    nextAction: "수정 견적 발송",
    due: "오늘",
  },
  {
    title: "신규 물류 도입",
    company: "블루하버",
    stage: "초기 접촉",
    amount: "1,850만원",
    likelihood: "보통",
    nextAction: "데모 일정 조율",
    due: "내일",
  },
];

export function HomePage() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-6">
      <header className="flex flex-col gap-4 border-b pb-5 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">딜 파이프라인</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            진행 중인 딜, 다음 액션, 일정 압박을 확인합니다.
          </p>
        </div>
        <div className="flex gap-2">
          <button className="inline-flex h-10 items-center gap-2 rounded-md border px-3 text-sm font-medium">
            <Search className="h-4 w-4" />
            검색
          </button>
          <button className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground">
            <Plus className="h-4 w-4" />
            딜 추가
          </button>
        </div>
      </header>

      <div className="mt-5 flex gap-2 overflow-x-auto">
        {["전체", "초기 접촉", "논의 중", "성사", "실패"].map((stage) => (
          <button
            className="h-9 shrink-0 rounded-md border px-3 text-sm font-medium first:bg-primary first:text-primary-foreground"
            key={stage}
          >
            {stage}
          </button>
        ))}
      </div>

      <div className="mt-5 overflow-hidden rounded-lg border bg-white">
        <div className="grid grid-cols-[1.3fr_1fr_0.9fr_0.8fr_0.9fr_1fr_0.7fr] border-b bg-muted px-4 py-3 text-xs font-medium text-muted-foreground">
          <span>딜</span>
          <span>회사</span>
          <span>단계</span>
          <span>금액</span>
          <span>가능성</span>
          <span>다음 액션</span>
          <span>기한</span>
        </div>
        {deals.map((deal) => (
          <button
            className="grid w-full grid-cols-[1.3fr_1fr_0.9fr_0.8fr_0.9fr_1fr_0.7fr] px-4 py-4 text-left text-sm hover:bg-muted/60"
            key={deal.title}
          >
            <span className="font-medium">{deal.title}</span>
            <span>{deal.company}</span>
            <span>{deal.stage}</span>
            <span className="font-medium">{deal.amount}</span>
            <span>{deal.likelihood}</span>
            <span>{deal.nextAction}</span>
            <span>{deal.due}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
