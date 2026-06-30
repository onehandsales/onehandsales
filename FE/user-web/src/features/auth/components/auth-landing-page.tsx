import {
  ArrowRight,
  ArrowDownToLine,
  Bell,
  BriefcaseBusiness,
  Check,
  Circle,
  Plus,
  Search,
} from "lucide-react";
import type { ReactNode } from "react";

type AuthLandingPageProps = {
  readonly children?: ReactNode;
  readonly isModalOpen: boolean;
  readonly onOpenLogin: () => void;
};

export function AuthLandingPage({
  children,
  isModalOpen,
  onOpenLogin,
}: AuthLandingPageProps) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-white text-foreground">
      <LandingBackground isModalOpen={isModalOpen} onOpenLogin={onOpenLogin} />
      {isModalOpen ? children : null}
    </main>
  );
}

function LandingBackground({
  isModalOpen,
  onOpenLogin,
}: {
  readonly isModalOpen: boolean;
  readonly onOpenLogin: () => void;
}) {
  return (
    <div className="min-h-screen bg-white">
      <header className="flex h-[72px] items-center justify-between border-b border-[#F1F5F9] bg-white px-5 md:px-16">
        <div className="flex items-center gap-2.5">
          <div className="grid h-[30px] w-[30px] place-items-center rounded-[7px] bg-[#1D4ED8]">
            <BriefcaseBusiness className="h-4 w-4 text-white" />
          </div>
          <span className="text-base font-extrabold text-[#0F172A]">
            한손에 영업
          </span>
        </div>

        <nav className="hidden items-center gap-9 text-sm font-medium text-[#6B7280] md:flex">
          <span>서비스 소개</span>
          <span>요금제</span>
          <span>문의</span>
        </nav>

        <div className="hidden items-center gap-3.5 md:flex">
          <button
            className="text-sm font-medium text-[#6B7280]"
            onClick={onOpenLogin}
            type="button"
          >
            로그인
          </button>
          <button
            className="h-10 rounded-[10px] bg-[#4880EE] px-5 text-sm font-semibold text-white"
            onClick={onOpenLogin}
            type="button"
          >
            무료로 시작하기
          </button>
        </div>
      </header>

      <section className="grid min-h-[calc(100vh-72px)] md:grid-cols-[640px_minmax(0,1fr)]">
        <div className="flex min-h-[calc(100vh-72px)] flex-col justify-center px-6 pb-20 pt-10 md:px-0 md:pb-[60px] md:pl-20">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#BFDBFE] bg-[#EFF6FF] px-3.5 py-1.5">
            <span className="h-2 w-2 rounded-full bg-[#4880EE]" />
            <span className="text-xs font-semibold text-[#1D4ED8]">
              B2C Sales CRM
            </span>
          </div>

          <h1 className="mt-[26px] whitespace-pre-line text-[42px] font-extrabold leading-[1.15] tracking-[-0.04em] text-[#080812] md:text-[52px]">
            {isModalOpen ? "영업의 모든 것,\n이제 한손에" : "영업의 모든 것\n이제 한손에"}
          </h1>

          <p className="mt-[26px] whitespace-pre-line text-[15px] leading-[1.6] text-[#6B7280] md:text-[17px]">
          {"딜 관리, 고객 히스토리, 일정까지\n영업에 필요한 모든 것을 한 앱에서 관리해요."}
          </p>

          <div className="mt-[26px] flex flex-col gap-3 sm:flex-row">
            <button
              className="inline-flex h-[52px] items-center justify-center gap-3 rounded-[12px] bg-[#4880EE] px-6 text-[15px] font-semibold text-white shadow-[0_12px_28px_rgba(72,128,238,0.22)]"
              onClick={onOpenLogin}
              type="button"
            >
              무료로 시작하기
              <ArrowRight className="h-4 w-4" />
            </button>
            {!isModalOpen ? (
              <button
                className="h-[52px] rounded-[12px] border border-[#C7D2FE] bg-white px-7 text-base font-semibold text-[#374151]"
                type="button"
              >
                데모 보기
              </button>
            ) : null}
          </div>

          <div className="mt-[26px] flex flex-wrap items-center gap-2 text-sm text-[#6B7280]">
            <Check className="h-4 w-4 text-[#10B981]" />
            <span>구글·카카오로 30초 만에 시작</span>
            <Circle className="h-1.5 w-1.5 fill-[#D1D5DB] text-[#D1D5DB]" />
            <span>신용카드 불필요</span>
          </div>

          {!isModalOpen ? (
            <div className="mt-[26px] flex gap-6">
              <Metric value="₩2.3조" label="누적 딜 관리" />
              <span className="h-7 w-px bg-[#E5E7EB]" />
              <Metric value="47%" label="성사율 향상" />
              <span className="h-7 w-px bg-[#E5E7EB]" />
              <Metric value="30초" label="온보딩 완료" />
            </div>
          ) : null}
        </div>

        <div className="relative hidden items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_50%_45%,#DBEAFE_0%,#FFFFFF_80%)] md:flex">
          <div className="relative grid h-[590px] w-[296px] place-items-center rounded-[36px] bg-[#18181B] shadow-[0_28px_72px_-4px_rgba(29,78,216,0.22),0_6px_20px_rgba(0,0,0,0.13)]">
            <div className="h-[554px] w-[276px] overflow-hidden rounded-[27px] bg-white">
              <div className="flex h-[50px] items-center px-5 text-[15px] font-semibold text-[#111827]">
                <span>9:41</span>
                <span className="flex-1" />
                <span className="h-[10px] w-[17px] rounded-[3px] bg-[#111827]" />
              </div>
              <div className="flex h-14 items-center gap-3 px-4">
                <h2 className="text-lg font-bold text-[#4880EE]">한손에 영업</h2>
                <span className="flex-1" />
                <ArrowDownToLine className="h-4 w-4 text-[#6B7280]" />
                <Bell className="h-4 w-4 text-[#6B7280]" />
                <span className="grid h-8 w-8 place-items-center rounded-full bg-[#1F1D5B] text-xs font-bold text-white">
                  김
                </span>
              </div>
              <div className="flex h-[52px] items-center px-4 py-1.5">
                <div className="flex h-10 w-full items-center gap-2 rounded-full bg-[#F3F4F6] px-3 text-xs text-[#9CA3AF]">
                  <Search className="h-3.5 w-3.5" />
                  회사·담당자·딜 검색...
                </div>
              </div>
              <div className="flex h-11 items-end gap-5 border-b border-[#E5E7EB] px-4 text-xs whitespace-nowrap">
                {["전체", "초기 접촉", "니즈 확인", "제안/견적", "협상"].map(
                  (item, index) => (
                    <span
                      className={
                        index === 0
                          ? "border-b-2 border-[#4880EE] pb-3 font-semibold text-[#4880EE]"
                          : "pb-3 text-[#6B7280]"
                      }
                      key={item}
                    >
                      {item}
                    </span>
                  )
                )}
              </div>
              <div className="flex h-10 items-center gap-2 px-4">
                <span className="rounded-full border border-[#4880EE] px-3 py-1.5 text-xs font-semibold text-[#4880EE]">
                  다음 행동
                </span>
                <span className="rounded-full bg-[#F3F4F6] px-3 py-1.5 text-xs text-[#6B7280]">
                  가능성
                </span>
                <span className="rounded-full bg-[#F3F4F6] px-3 py-1.5 text-xs text-[#6B7280]">
                  금액
                </span>
                <span className="ml-auto text-xs text-[#9CA3AF]">24건</span>
              </div>
              <div className="grid gap-0">
                <PhoneDeal
                  amount="₩ 48,000,000"
                  company="삼성전자 · 김철수 부장"
                  due="마감 12/31"
                  next="계약서 검토 요청"
                  stage="협상"
                  title="삼성전자 ERP 도입"
                  tone="red"
                />
                <PhoneDeal
                  amount="₩ 12,500,000"
                  company="LG화학 · 박민준 이사"
                  due="마감 1/15"
                  next="첫 미팅 일정 조율"
                  stage="니즈 확인"
                  title="LG화학 솔루션 계약"
                  tone="amber"
                />
                <PhoneDeal
                  amount="₩ 230,000,000"
                  company="현대자동차 · 이지영 팀장"
                  due="마감 2/28"
                  next="기술 제안서 전달"
                  stage="제안/견적"
                  title="현대자동차 MES 구축"
                  tone="blue"
                />
              </div>
              <button
                className="absolute bottom-[82px] right-[-78px] grid h-[52px] w-[52px] place-items-center rounded-full bg-[#4880EE] text-white shadow-[0_4px_16px_rgba(59,130,246,0.27)]"
                type="button"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
            <div className="absolute left-[108px] top-2 h-6 w-20 rounded-[12px] bg-[#18181B]" />
          </div>

          <div className="absolute left-[42px] top-[138px] w-[214px] rounded-[14px] border border-[#F1F5F9] bg-white px-3.5 py-3 shadow-[0_8px_28px_rgba(0,0,0,0.11)]">
            <p className="text-xs font-semibold text-[#4880EE]">Next action</p>
            <p className="mt-1 truncate text-sm font-semibold text-[#111827]">
              견적서 확인 요청
            </p>
          </div>

          <div className="absolute bottom-[82px] right-[64px] w-[178px] rounded-[14px] border border-[#F1F5F9] bg-white px-4 py-3.5 shadow-[0_8px_28px_rgba(0,0,0,0.11)]">
            <p className="text-xs text-[#9CA3AF]">이번 주 진행 딜</p>
            <p className="mt-1 text-2xl font-extrabold text-[#111827]">24</p>
          </div>
        </div>
      </section>

      <section
        className={[
          "hidden h-[108px] flex-col items-center justify-center gap-3 border-t border-[#E2E8F0] bg-[#F8FAFF] md:flex",
          isModalOpen ? "md:hidden" : "",
        ].join(" ")}
      >
        <p className="text-[13px] font-medium text-[#9CA3AF]">
          이미 500개 이상의 영업팀이 선택했어요
        </p>
        <div className="flex gap-3">
          {["삼성전자", "LG전자", "현대자동차", "SK텔레콤"].map((name) => (
            <span
              className="rounded-full bg-[#F1F5F9] px-3.5 py-1.5 text-xs font-semibold text-[#64748B]"
              key={name}
            >
              {name}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}

function Metric({ value, label }: { readonly value: string; readonly label: string }) {
  return (
    <div>
      <p className="text-xl font-extrabold text-[#111827]">{value}</p>
      <p className="mt-1 text-xs font-medium text-[#9CA3AF]">{label}</p>
    </div>
  );
}

function PhoneDeal({
  amount,
  company,
  due,
  next,
  stage,
  title,
  tone,
}: {
  readonly amount: string;
  readonly company: string;
  readonly due: string;
  readonly next: string;
  readonly stage: string;
  readonly title: string;
  readonly tone: "red" | "amber" | "blue";
}) {
  const toneClass = {
    red: "text-[#B91C1C]",
    amber: "text-[#B45309]",
    blue: "text-[#4880EE]",
  }[tone];

  return (
    <div className="border-b border-[#F1F5F9] bg-white px-4 py-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-[#111827]">{title}</p>
          <p className="mt-1 truncate text-xs text-[#6B7280]">{company}</p>
        </div>
        <p className="shrink-0 text-xs font-bold text-[#111827]">{amount}</p>
      </div>
      <div className="mt-2 flex items-center gap-2 text-xs">
        <span className={`h-2 w-2 rounded-full bg-current ${toneClass}`} />
        <span className="text-[#374151]">{next}</span>
        <span className={`ml-auto font-semibold ${toneClass}`}>{due}</span>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <span className="rounded-full bg-[#FEF3C7] px-2 py-1 text-[11px] font-semibold text-[#B45309]">
          {stage}
        </span>
        <span className="rounded-full bg-[#CCFBF1] px-2 py-1 text-[11px] font-semibold text-[#15803D]">
          긍정
        </span>
      </div>
    </div>
  );
}
