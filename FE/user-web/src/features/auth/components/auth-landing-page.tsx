import {
  ArrowRight,
  Bell,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Check,
  CircleDollarSign,
  Facebook,
  FileText,
  FolderKanban,
  Handshake,
  Instagram,
  LayoutDashboard,
  Linkedin,
  ListChecks,
  Mail,
  MessageSquareText,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  Youtube,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { PublicSiteHeader } from "@/features/public-site/components/public-site-header";
import { PublicSiteLanguageSelect } from "@/features/public-site/components/public-site-language-select";
import { publicSiteImages } from "@/features/public-site/constants/public-site-assets";
import { usePublicSiteLanguage } from "@/features/public-site/i18n/public-site-language";

type AuthLandingPageProps = {
  readonly children?: ReactNode;
  readonly isModalOpen: boolean;
  readonly onOpenLogin: () => void;
};

type IconType = typeof BriefcaseBusiness;

const sidebarItems: Array<{
  readonly label: string;
  readonly icon: IconType;
}> = [
  { label: "오늘", icon: LayoutDashboard },
  { label: "딜", icon: FolderKanban },
  { label: "회사", icon: Building2 },
  { label: "담당자", icon: Users },
  { label: "일정", icon: CalendarDays },
  { label: "회의록", icon: FileText },
];

const customerTypes = [
  "제조 영업",
  "유통 영업",
  "프랜차이즈",
  "B2B 서비스",
  "교육 상담",
  "로컬 세일즈",
];

const heroFloatingIcons: Array<{
  readonly icon: IconType;
  readonly className: string;
  readonly label: string;
}> = [
  {
    icon: Mail,
    label: "메일",
    className: "left-[13%] top-[28%] border-[#ffd874] bg-[#fff6ce] text-[#ad7a00]",
  },
  {
    icon: CalendarDays,
    label: "일정",
    className: "right-[15%] top-[31%] border-[#d8c3ff] bg-[#f2eaff] text-[#7c3aed]",
  },
  {
    icon: Handshake,
    label: "딜",
    className: "left-[18%] bottom-[29%] border-[#ffb4aa] bg-[#ffebe8] text-[#e04437]",
  },
  {
    icon: Bell,
    label: "알림",
    className: "right-[18%] bottom-[28%] border-[#aee6c0] bg-[#e8f8ee] text-[#159447]",
  },
  {
    icon: FileText,
    label: "회의록",
    className: "left-[10%] bottom-[10%] border-[#afd8ff] bg-[#eaf5ff] text-[#1874d1]",
  },
  {
    icon: CircleDollarSign,
    label: "금액",
    className: "right-[10%] bottom-[11%] border-[#ffc0e4] bg-[#fff0f8] text-[#c0267a]",
  },
];

const agentRows = [
  { icon: Sparkles, title: "다음 행동 추천", text: "미뤄진 연락과 만료 딜을 먼저 정리" },
  { icon: MessageSquareText, title: "회의록 요약", text: "통화와 미팅 메모를 딜에 연결" },
  { icon: Bell, title: "팔로업 알림", text: "고객별 약속을 놓치지 않게 표시" },
  { icon: ShieldCheck, title: "개인 정보 관리", text: "민감 메모와 삭제 이력을 분리" },
];

const workTabs = [
  { icon: FileText, title: "제품 피드백", text: "요청 사항 묶기", tone: "bg-[#f7f7f5] text-[#8a5b00]" },
  { icon: CalendarDays, title: "일정 조율", text: "다음 미팅 잡기", tone: "bg-[#f7f7f5] text-[#0b75bd]" },
  { icon: Handshake, title: "보류 딜 관리", text: "막힌 이유 확인", tone: "bg-[#f7f7f5] text-[#d6422b]" },
  { icon: Bell, title: "주간 리포트", text: "놓친 일 모으기", tone: "bg-[#f7f7f5] text-[#0f8f4a]" },
  { icon: Sparkles, title: "나만의 작업", text: "반복 업무 저장", tone: "bg-[#0d1b49] text-white" },
];

const workCards = [
  {
    eyebrow: "영업 메모",
    title: "작업을 말하면 구조화됩니다.",
    icon: Sparkles,
    accent: "border-[#ffd467]",
    body: <AssistantTaskMockup />,
  },
  {
    eyebrow: "통합 검색",
    title: "모든 기록을 한 번에 찾습니다.",
    icon: Search,
    accent: "border-[#ff7469]",
    body: <SearchMockup />,
  },
  {
    eyebrow: "미팅 노트",
    title: "회의가 끝나면 다음 행동이 남습니다.",
    icon: MessageSquareText,
    accent: "border-[#66b7ff]",
    body: <MeetingNoteMockup />,
  },
];

const workspaceCards = [
  {
    eyebrow: "문서",
    title: "제품과 제안 자료를 한 화면에서 봅니다.",
    icon: FileText,
    accent: "bg-[#2f9f9a]",
    body: <DocsMockup />,
  },
  {
    eyebrow: "회사",
    title: "고객사의 관계와 기회를 연결합니다.",
    icon: Building2,
    accent: "bg-[#55aefc]",
    body: <CompanyMockup />,
  },
  {
    eyebrow: "프로젝트",
    title: "딜 진행과 출시 준비를 같이 봅니다.",
    icon: FolderKanban,
    accent: "bg-[#b78563]",
    body: <ProjectMockup />,
  },
];

const testimonials = [
  {
    name: "영업 리더",
    quote: "딜, 일정, 회의록이 분리되지 않으니 하루 시작이 빨라졌습니다.",
    tone: "bg-[#e94f3f]",
    imageSrc: publicSiteImages.salesConversation,
  },
  {
    name: "고객 상담팀",
    quote: "담당자 히스토리를 찾는 시간이 줄고 다음 행동이 선명해졌습니다.",
    tone: "bg-[#1f79b8]",
    imageSrc: publicSiteImages.whiteboardPlanning,
  },
  {
    name: "개인 사업자",
    quote: "복잡한 CRM보다 가볍고, 놓친 연락을 바로 확인할 수 있습니다.",
    tone: "bg-[#d89c25]",
    imageSrc: publicSiteImages.teamPresentation,
  },
];

const proofPoints = [
  "1,000+ 영업 기록 정리",
  "12분 안에 첫 파이프라인 구성",
  "주간 후속조치 누락 감소",
  "모바일 웹 최적화",
  "개인과 작은 팀을 위한 CRM",
];

const footerSocialLinks = [
  { label: "Instagram", icon: Instagram },
  { label: "X", icon: MessageSquareText },
  { label: "LinkedIn", icon: Linkedin },
  { label: "Facebook", icon: Facebook },
  { label: "YouTube", icon: Youtube },
];

export function AuthLandingPage({
  children,
  isModalOpen,
  onOpenLogin,
}: AuthLandingPageProps) {
  const scrollProgress = useLandingScrollProgress();

  return (
    <main className="landing-scroll-root min-h-screen w-full overflow-x-hidden bg-white text-[#111111]">
      <LandingScrollStyles />
      <PublicSiteHeader onLogin={onOpenLogin} />
      <ScrollProgressBar progress={scrollProgress} />
      <div className="pt-14">
        <HeroSection onOpenLogin={onOpenLogin} />
        <CustomerStrip />
        <div className="w-full bg-[#f7f7f5]">
          <WorkMovingSection />
          <AssistantsSection />
          <WorkspaceSection />
          <QuoteSection />
          <TrustedSection />
          <ProofPointStrip />
          <FinalCta onOpenLogin={onOpenLogin} />
        </div>
        <LandingFooter />
      </div>
      {isModalOpen ? children : null}
    </main>
  );
}

function useLandingScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    document.documentElement.classList.add("landing-scrollbar-hidden");
    document.body.classList.add("landing-scrollbar-hidden");

    const updateProgress = () => {
      const scrollableHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const nextProgress =
        scrollableHeight > 0
          ? Math.min(1, Math.max(0, window.scrollY / scrollableHeight))
          : 0;

      setProgress(nextProgress);
    };

    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);

    return () => {
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
      document.documentElement.classList.remove("landing-scrollbar-hidden");
      document.body.classList.remove("landing-scrollbar-hidden");
    };
  }, []);

  return progress;
}

function LandingScrollStyles() {
  return (
    <style>
      {`
        .landing-scrollbar-hidden {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        .landing-scrollbar-hidden::-webkit-scrollbar {
          display: none;
          width: 0;
          height: 0;
        }
      `}
    </style>
  );
}

function ScrollProgressBar({ progress }: { readonly progress: number }) {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-x-0 top-14 z-50 h-[2px] bg-transparent"
    >
      <div
        className="h-full origin-left bg-[#111111] transition-transform duration-150 ease-out"
        style={{
          transform: `scaleX(${progress})`,
        }}
      />
    </div>
  );
}

function HeroSection({ onOpenLogin }: { readonly onOpenLogin: () => void }) {
  const { copy } = usePublicSiteLanguage();

  return (
    <section className="relative flex min-h-[calc(100svh-56px)] w-full flex-col justify-center bg-white px-4 pb-12 pt-10 md:px-6 md:pb-16 md:pt-14">
      <div className="mx-auto w-full max-w-[1180px] text-center">
        <PersonaRow />
        <h1 className="mx-auto mt-5 max-w-[980px] text-[44px] font-black leading-[0.98] tracking-normal text-[#111111] md:text-[82px]">
          {copy.landing.heroTitle[0]}
          <br />
          {copy.landing.heroTitle[1]}
        </h1>
        <p className="mx-auto mt-4 max-w-[620px] text-[15px] leading-7 text-[#5f5f5a] md:text-[17px]">
          {copy.landing.heroDescription}
        </p>
        <div className="mt-5 flex flex-col items-center justify-center gap-2 sm:flex-row">
          <button
            className="inline-flex h-9 items-center gap-2 rounded-[6px] bg-[#0077e6] px-4 text-[13px] font-bold text-white hover:bg-[#006bd1]"
            onClick={onOpenLogin}
            type="button"
          >
            {copy.landing.primaryCta}
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
          <a
            className="inline-flex h-9 items-center gap-2 rounded-[6px] bg-[#eef6ff] px-4 text-[13px] font-bold text-[#006bd1] hover:bg-[#e3f0ff]"
            href="#워크플로우"
          >
            {copy.landing.secondaryCta}
          </a>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 hidden md:block">
        {heroFloatingIcons.map(({ className, icon: Icon, label }) => (
          <span
            aria-label={label}
            className={`absolute grid h-10 w-10 place-items-center rounded-full border-2 shadow-sm ${className}`}
            key={label}
          >
            <Icon className="h-5 w-5" />
          </span>
        ))}
      </div>

      <div className="relative z-10 mx-auto mt-9 w-full max-w-[1120px]">
        <HeroWorkspacePreview />
      </div>
    </section>
  );
}

function PersonaRow() {
  const people = [
    { label: "영", tone: "border-[#2f80ed] bg-[#e8f3ff]" },
    { label: "담", tone: "border-[#222222] bg-white" },
    { label: "딜", tone: "border-[#f26b3a] bg-[#fff0e8]" },
    { label: "회", tone: "border-[#222222] bg-white" },
    { label: "일", tone: "border-[#2f80ed] bg-[#e8f3ff]" },
    { label: "고", tone: "border-[#222222] bg-white" },
  ];

  return (
    <div className="flex justify-center">
      <div className="flex items-center -space-x-2">
        {people.map((person) => (
          <span
            className={`grid h-10 w-10 place-items-center rounded-full border-2 text-[12px] font-black ${person.tone}`}
            key={person.label}
          >
            {person.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function HeroWorkspacePreview() {
  return (
    <div className="rounded-[8px] border border-[#e9e9e6] bg-white shadow-[0_24px_70px_rgba(0,0,0,0.12)]">
      <div className="flex h-9 items-center gap-2 border-b border-[#eeeeec] px-4">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff6b5f]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#ffca4d]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#37c16b]" />
        <span className="ml-3 text-[12px] font-semibold text-[#777770]">영업 HQ</span>
      </div>
      <div className="grid min-h-[390px] grid-cols-1 md:grid-cols-[190px_minmax(0,1fr)]">
        <aside className="hidden border-r border-[#eeeeec] bg-[#fbfbfa] p-4 md:block">
          <div className="mb-4 flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-[6px] bg-[#111111] text-[11px] font-bold text-white">
              OS
            </span>
            <div>
              <p className="text-[12px] font-bold">onehand HQ</p>
              <p className="text-[11px] text-[#8a8a85]">개인 영업 워크스페이스</p>
            </div>
          </div>
          {sidebarItems.map(({ icon: Icon, label }) => (
            <div
              className="mb-1 flex h-8 items-center gap-2 rounded-[6px] px-2 text-[12px] font-medium text-[#4f4f4b] first:bg-[#eeeeec]"
              key={label}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </div>
          ))}
        </aside>

        <div className="p-4 md:p-5">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-1 flex items-center gap-2 text-[12px] text-[#8a8a85]">
                <Building2 className="h-3.5 w-3.5" />
                Sales workspace
              </div>
              <h2 className="text-xl font-black text-[#111111] md:text-2xl">이번 주 파이프라인</h2>
            </div>
            <div className="flex flex-wrap gap-2 text-[12px]">
              <span className="rounded-[6px] bg-[#f1f1ef] px-2.5 py-1 font-semibold text-[#555550]">Table</span>
              <span className="rounded-[6px] bg-[#111111] px-2.5 py-1 font-semibold text-white">Board</span>
              <span className="rounded-[6px] bg-[#f1f1ef] px-2.5 py-1 font-semibold text-[#555550]">Calendar</span>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-4">
            {[
              { title: "신규 문의", color: "bg-[#f4f4f2]", deals: ["도입 상담 요청", "가격표 회신", "명함 OCR 확인"] },
              { title: "제안", color: "bg-[#fff4ca]", deals: ["연간 계약 제안", "기술 검토 미팅", "견적서 수정"] },
              { title: "협상", color: "bg-[#e8f3ff]", deals: ["최종 금액 협의", "계약 조건 정리", "내부 승인 대기"] },
              { title: "계약", color: "bg-[#e9f8ef]", deals: ["세금계산서 발행", "온보딩 일정", "첫 미팅 준비"] },
            ].map((column) => (
              <div className="min-h-[250px] rounded-[8px] bg-[#fafafa] p-2" key={column.title}>
                <div className={`mb-2 rounded-[6px] px-2 py-1.5 text-[12px] font-bold ${column.color}`}>
                  {column.title}
                </div>
                <div className="grid gap-2">
                  {column.deals.map((deal, index) => (
                    <div className="rounded-[6px] border border-[#eeeeec] bg-white p-2 text-left shadow-sm" key={deal}>
                      <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-[#0077e6]" />
                        <p className="truncate text-[12px] font-bold text-[#232320]">{deal}</p>
                      </div>
                      <p className="mt-2 text-[11px] text-[#777770]">
                        {index + 1}일 후 팔로업
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mx-auto mt-4 flex max-w-[620px] items-center gap-3 rounded-[8px] border border-[#e6e6e2] bg-white px-3 py-2 shadow-[0_10px_28px_rgba(0,0,0,0.08)]">
            <Search className="h-4 w-4 text-[#777770]" />
            <span className="text-[12px] font-semibold text-[#777770]">회사, 담당자, 딜, 회의록을 검색하세요</span>
            <span className="ml-auto rounded-[5px] bg-[#f1f1ef] px-2 py-1 text-[11px] font-bold text-[#777770]">⌘ K</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function CustomerStrip() {
  const { copy } = usePublicSiteLanguage();

  return (
    <section className="border-y border-[#eeeeec] bg-white px-4 py-5 md:px-6">
      <div className="mx-auto max-w-[900px] text-center">
        <p className="text-[12px] font-semibold text-[#8a8a85]">
          {copy.landing.customerStrip}
        </p>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[13px] font-bold text-[#555550]">
          {customerTypes.map((item) => (
            <span className="inline-flex items-center gap-2" key={item}>
              <span className="h-1 w-1 rounded-full bg-[#c8c8c2]" />
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function WorkMovingSection() {
  const { copy } = usePublicSiteLanguage();

  return (
    <section className="mx-auto max-w-[980px] px-4 py-16 md:px-6 md:py-20" id="워크플로우">
      <h2 className="max-w-[640px] text-[34px] font-black leading-[1.05] tracking-normal text-[#111111] md:text-[46px]">
        {copy.landing.sectionWork}
      </h2>

      <div className="mt-8 grid gap-5 md:grid-cols-[330px_minmax(0,1fr)]">
        <div className="rounded-[8px] bg-white p-5 shadow-sm">
          <p className="text-[12px] font-bold text-[#777770]">자동 정리</p>
          <h3 className="mt-2 text-[18px] font-black leading-tight">반복 확인은 시스템이 먼저 알려줍니다.</h3>
          <button className="mt-3 grid h-7 w-7 place-items-center rounded-full bg-[#111111] text-white" type="button">
            <ArrowRight className="h-3.5 w-3.5" />
          </button>

          <div className="mt-9 grid gap-3">
            {agentRows.map(({ icon: Icon, text, title }) => (
              <div className="flex items-start gap-3 border-b border-[#eeeeec] pb-3 last:border-0 last:pb-0" key={title}>
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-[6px] bg-[#f2f2ef]">
                  <Icon className="h-4 w-4 text-[#111111]" />
                </span>
                <div>
                  <p className="text-[13px] font-black">{title}</p>
                  <p className="mt-0.5 text-[12px] leading-5 text-[#777770]">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <StatusUpdateMockup />
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {workTabs.map(({ icon: Icon, text, title, tone }) => (
          <div className={`min-h-[112px] rounded-[8px] p-4 shadow-sm ${tone}`} key={title}>
            <Icon className="h-5 w-5" />
            <p className="mt-4 text-[13px] font-black">{title}</p>
            <p className="mt-1 text-[12px] opacity-75">{text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function StatusUpdateMockup() {
  const rows = [
    ["주간 회의", "제안 검토", "박민준"],
    ["견적 발송", "승인 대기", "김서연"],
    ["팔로업", "일정 조율", "이현우"],
    ["계약 협의", "조건 확인", "정하늘"],
    ["온보딩", "담당 배정", "최지우"],
  ];

  return (
    <div className="overflow-hidden rounded-[8px] border border-[#d7eeec] bg-[#bfece7] p-4 shadow-sm">
      <div className="rounded-[8px] bg-white p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-[24px] font-black">출시 상태 업데이트</h3>
          <span className="rounded-[6px] bg-[#f1f1ef] px-2 py-1 text-[11px] font-bold text-[#777770]">공유됨</span>
        </div>

        <div className="mt-5 overflow-hidden rounded-[8px] border border-[#eeeeec]">
          <div className="grid grid-cols-[1.2fr_1fr_0.9fr] bg-[#fafafa] px-3 py-2 text-[11px] font-bold text-[#777770]">
            <span>업무</span>
            <span>상태</span>
            <span>담당자</span>
          </div>
          {rows.map(([name, status, owner]) => (
            <div
              className="grid grid-cols-[1.2fr_1fr_0.9fr] border-t border-[#eeeeec] px-3 py-2 text-[12px]"
              key={name}
            >
              <span className="truncate font-semibold">{name}</span>
              <span className="truncate text-[#666661]">{status}</span>
              <span className="truncate text-[#666661]">{owner}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AssistantsSection() {
  const { copy } = usePublicSiteLanguage();

  return (
    <section className="mx-auto max-w-[980px] px-4 pb-16 md:px-6 md:pb-20" id="제품">
      <h2 className="max-w-[700px] text-[34px] font-black leading-[1.05] tracking-normal text-[#111111] md:text-[46px]">
        {copy.landing.sectionAssistants}
      </h2>

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {workCards.map(({ accent, body, eyebrow, icon: Icon, title }, index) => (
          <FeatureShowcaseCard
            accent={accent}
            body={body}
            className={index === 0 ? "md:col-span-2" : ""}
            eyebrow={eyebrow}
            icon={Icon}
            key={title}
            title={title}
          />
        ))}
      </div>
    </section>
  );
}

function WorkspaceSection() {
  const { copy } = usePublicSiteLanguage();

  return (
    <section className="mx-auto max-w-[980px] px-4 pb-16 md:px-6 md:pb-20" id="고객관리">
      <h2 className="max-w-[720px] text-[34px] font-black leading-[1.05] tracking-normal text-[#111111] md:text-[46px]">
        {copy.landing.sectionWorkspace}
      </h2>

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {workspaceCards.map(({ accent, body, eyebrow, icon: Icon, title }, index) => (
          <FeatureShowcaseCard
            accent={accent}
            body={body}
            className={index === 2 ? "md:col-span-2" : ""}
            eyebrow={eyebrow}
            icon={Icon}
            key={title}
            title={title}
          />
        ))}
      </div>
    </section>
  );
}

function FeatureShowcaseCard({
  accent,
  body,
  className = "",
  eyebrow,
  icon: Icon,
  title,
}: {
  readonly accent: string;
  readonly body: ReactNode;
  readonly className?: string;
  readonly eyebrow: string;
  readonly icon: IconType;
  readonly title: string;
}) {
  return (
    <article className={`overflow-hidden rounded-[8px] bg-white shadow-sm ${className}`}>
      <div className="flex min-h-[112px] items-start justify-between gap-6 p-5">
        <div>
          <p className="text-[12px] font-bold text-[#777770]">{eyebrow}</p>
          <h3 className="mt-2 max-w-[420px] text-[18px] font-black leading-tight">{title}</h3>
        </div>
        <button className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#111111] text-white" type="button">
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className={`border-l-[10px] ${accent}`}>
        <div className="min-h-[260px] bg-[#fbfbfa] p-4">
          <div className="mb-3 flex items-center gap-2 text-[12px] font-bold text-[#777770]">
            <Icon className="h-4 w-4" />
            onehand.sales
          </div>
          {body}
        </div>
      </div>
    </article>
  );
}

function AssistantTaskMockup() {
  return (
    <div className="grid gap-3 md:grid-cols-[240px_minmax(0,1fr)]">
      <div className="rounded-[8px] border border-[#eeeeec] bg-white p-4">
        <p className="text-[13px] font-black">오늘 할 일을 정리해줘</p>
        <div className="mt-4 grid gap-2 text-[12px] text-[#666661]">
          {["미팅 후속 메일 작성", "계약서 검토 요청", "견적 보류 사유 확인"].map((item) => (
            <div className="flex items-center gap-2" key={item}>
              <Check className="h-3.5 w-3.5 text-[#159447]" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-[8px] border border-[#eeeeec] bg-white p-4">
        <div className="flex items-center justify-between">
          <p className="text-[13px] font-black">상태 업데이트</p>
          <Sparkles className="h-4 w-4 text-[#d89c25]" />
        </div>
        <div className="mt-4 grid gap-3">
          {["김서연 담당자에게 회신 필요", "금요일 전 제안서 수정", "다음 주 온보딩 일정 확정"].map((item) => (
            <div className="rounded-[6px] bg-[#f7f7f5] px-3 py-2 text-[12px] font-semibold" key={item}>
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SearchMockup() {
  return (
    <div className="rounded-[8px] border border-[#eeeeec] bg-white p-4">
      <div className="flex h-10 items-center gap-2 rounded-[6px] border border-[#e1e1dd] px-3">
        <Search className="h-4 w-4 text-[#777770]" />
        <span className="text-[13px] font-semibold text-[#333330]">지난주 보류된 견적</span>
      </div>
      <div className="mt-4 grid gap-3">
        {["서울 매장 POS 교체", "연간 유지보수 계약", "제품 교육 일정"].map((item, index) => (
          <div className="rounded-[6px] border border-[#eeeeec] p-3" key={item}>
            <div className="flex items-center gap-2">
              <span className="grid h-6 w-6 place-items-center rounded-[6px] bg-[#f1f1ef] text-[11px] font-bold">
                {index + 1}
              </span>
              <p className="text-[13px] font-black">{item}</p>
            </div>
            <p className="mt-2 text-[12px] text-[#777770]">딜, 회의록, 담당자 메모에서 관련 기록을 찾았습니다.</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function MeetingNoteMockup() {
  return (
    <div className="rounded-[8px] border border-[#eeeeec] bg-white p-4">
      <div className="flex items-center justify-between border-b border-[#eeeeec] pb-3">
        <div>
          <p className="text-[13px] font-black">Joyce & Sam weekly 1:1</p>
          <p className="mt-1 text-[12px] text-[#777770]">요약 · 액션아이템 · 연결된 딜</p>
        </div>
        <span className="rounded-[6px] bg-[#eef6ff] px-2 py-1 text-[11px] font-bold text-[#006bd1]">AI 요약</span>
      </div>
      <div className="mt-4 grid gap-2 text-[12px]">
        {["현재 제안서의 ROI 근거 보강", "기술팀 검토 일정 확정", "다음 미팅 전 보안 문서 전달"].map((item) => (
          <div className="flex items-start gap-2" key={item}>
            <ListChecks className="mt-0.5 h-3.5 w-3.5 text-[#159447]" />
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DocsMockup() {
  return (
    <div className="rounded-[8px] border border-[#eeeeec] bg-white p-4">
      <img
        alt="화이트보드 앞에서 영업 업무 흐름을 정리하는 모습"
        className="mb-4 h-32 w-full rounded-[6px] object-cover"
        decoding="async"
        loading="eager"
        referrerPolicy="no-referrer"
        src={publicSiteImages.whiteboardPlanning}
      />
      <h4 className="text-[22px] font-black">상반기 계획</h4>
      <div className="mt-4 grid gap-3">
        {["핵심 고객군", "제품별 제안 전략", "분기별 목표"].map((item) => (
          <div className="rounded-[6px] bg-[#f7f7f5] px-3 py-2 text-[12px] font-semibold" key={item}>
            {item}
          </div>
        ))}
      </div>
      <div className="mt-4 h-20 rounded-[6px] bg-[#f0fbfa]" />
    </div>
  );
}

function CompanyMockup() {
  return (
    <div className="overflow-hidden rounded-[8px] border border-[#eeeeec] bg-white">
      <img
        alt="고객과 함께 노트북 화면을 보며 상담하는 모습"
        className="h-28 w-full object-cover"
        decoding="async"
        loading="eager"
        referrerPolicy="no-referrer"
        src={publicSiteImages.salesConversation}
      />
      <div className="p-4">
        <h4 className="text-[22px] font-black">회사 HQ</h4>
        <p className="mt-2 text-[12px] leading-5 text-[#666661]">
          회사 정보, 담당자, 진행 중인 딜, 최근 회의록을 한 페이지에서 확인합니다.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2 text-[12px]">
          {["담당자", "진행 딜", "회의록", "첨부"].map((item) => (
            <span className="rounded-[6px] bg-[#f7f7f5] px-3 py-2 font-semibold" key={item}>
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProjectMockup() {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <div className="rounded-[8px] border border-[#eeeeec] bg-white p-4">
        <h4 className="text-[18px] font-black">최종 QA</h4>
        <div className="mt-4 grid gap-2 text-[12px]">
          {["계약 조건 확인", "세금계산서 발행", "온보딩 자료 전달"].map((item) => (
            <label className="flex items-center gap-2" key={item}>
              <span className="grid h-4 w-4 place-items-center rounded-[4px] border border-[#c8c8c2]">
                <Check className="h-3 w-3" />
              </span>
              {item}
            </label>
          ))}
        </div>
      </div>
      <div className="rounded-[8px] border border-[#eeeeec] bg-white p-4">
        <h4 className="text-[18px] font-black">출시 트래커</h4>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {["준비", "진행", "완료"].map((stage) => (
            <div className="min-h-[96px] rounded-[6px] bg-[#f7f7f5] p-2" key={stage}>
              <p className="text-[11px] font-bold text-[#777770]">{stage}</p>
              <div className="mt-2 h-8 rounded-[5px] bg-white" />
              <div className="mt-2 h-8 rounded-[5px] bg-white" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function QuoteSection() {
  const { copy } = usePublicSiteLanguage();

  return (
    <section className="mx-auto max-w-[980px] px-4 pb-16 text-center md:px-6 md:pb-20">
      <p className="font-serif text-[24px] leading-9 text-[#333330]">
        {copy.landing.quote}
      </p>
      <p className="mt-2 text-[13px] font-bold text-[#555550]">onehand.sales</p>
    </section>
  );
}

function TrustedSection() {
  const { copy } = usePublicSiteLanguage();

  return (
    <section className="mx-auto max-w-[980px] px-4 pb-8 md:px-6 md:pb-10" id="자료">
      <h2 className="text-[30px] font-black leading-tight tracking-normal md:text-[42px]">
        {copy.landing.trustedTitle}
      </h2>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {testimonials.map((item) => (
          <article className={`overflow-hidden rounded-[8px] text-white ${item.tone}`} key={item.name}>
            <div className="relative h-32">
              <img
                alt={`${item.name} 업무 장면`}
                className="h-full w-full object-cover mix-blend-multiply opacity-80"
                decoding="async"
                loading="eager"
                referrerPolicy="no-referrer"
                src={item.imageSrc}
              />
              <div className="absolute left-5 top-5 grid h-12 w-12 place-items-center rounded-full bg-white/20 text-xl font-black">
                {item.name.slice(0, 1)}
              </div>
            </div>
            <div className="min-h-[150px] p-5">
              <p className="text-[14px] leading-6">“{item.quote}”</p>
              <p className="mt-4 text-[12px] font-bold opacity-80">{item.name}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function ProofPointStrip() {
  return (
    <section className="border-y border-[#eeeeec] bg-white/55 px-4 py-3 md:px-6">
      <div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-center gap-x-8 gap-y-2 text-[11px] font-semibold text-[#8a8a85]">
        {proofPoints.map((item) => (
          <span className="inline-flex items-center gap-2" key={item}>
            <span className="h-1 w-1 rounded-full bg-[#b8b8b2]" />
            {item}
          </span>
        ))}
      </div>
    </section>
  );
}

function FinalCta({ onOpenLogin }: { readonly onOpenLogin: () => void }) {
  const { copy } = usePublicSiteLanguage();

  return (
    <section className="mx-auto max-w-[980px] px-4 py-24 text-center md:px-6 md:py-28" id="가격">
      <h2 className="text-[30px] font-black tracking-normal md:text-[42px]">
        {copy.landing.finalCta}
      </h2>
      <div className="mt-4 flex flex-col items-center justify-center gap-2 sm:flex-row">
        <button
          className="inline-flex h-9 items-center gap-2 rounded-[6px] bg-[#0077e6] px-4 text-[13px] font-bold text-white hover:bg-[#006bd1]"
          onClick={onOpenLogin}
          type="button"
        >
          {copy.landing.finalPrimary}
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
        <a
          className="inline-flex h-9 items-center rounded-[6px] bg-white px-4 text-[13px] font-bold text-[#006bd1] hover:bg-[#f7f7f5]"
          href="/login"
        >
          로그인
        </a>
      </div>
    </section>
  );
}

function LandingFooter() {
  const { copy } = usePublicSiteLanguage();

  return (
    <footer className="border-t border-[#eeeeec] bg-white px-4 py-14 md:px-6">
      <div className="mx-auto grid max-w-[980px] gap-10 md:grid-cols-[1.8fr_repeat(4,1fr)]">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-[7px] border-2 border-[#111111] bg-white">
              <BriefcaseBusiness className="h-5 w-5" />
            </span>
            <span className="text-[24px] font-black leading-none">onehand</span>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-4 text-[#8a8a85]">
            {footerSocialLinks.map(({ icon: Icon, label }) => (
              <a
                aria-label={label}
                className="hover:text-[#111111]"
                href="/"
                key={label}
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>

          <PublicSiteLanguageSelect />

          <a className="mt-5 block text-[12px] text-[#777770] hover:text-[#111111]" href="/">
            {copy.common.cookieSettings}
          </a>
          <p className="mt-6 text-[11px] text-[#999993]">
            {copy.common.copyright}
          </p>
        </div>

        {copy.common.footerColumns.map(([title, ...links]) => (
          <div key={title}>
            <h3 className="text-[12px] font-black">{title}</h3>
            <ul className="mt-3 grid gap-2 text-[12px] text-[#777770]">
              {links.map((link) => (
                <li key={link}>
                  <a className="hover:text-[#111111]" href="/">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </footer>
  );
}
