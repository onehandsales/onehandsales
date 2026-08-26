import {
  ArrowRight,
  Bell,
  Building2,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Database,
  FileText,
  FolderKanban,
  Handshake,
  Mail,
  MessageCircle,
  MessageSquareText,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { PublicSiteFooter, PublicSiteHeader } from "@/features/public-site";
import { usePublicSitePath } from "@/features/public-site/i18n/public-site-locale-hooks";
import {
  getPublicSiteCopyLanguage,
  usePublicSiteLanguage,
  type PublicSiteCopyLanguage,
} from "@/features/public-site/i18n/public-site-language";

type AuthLandingPageProps = {
  readonly children?: ReactNode;
  readonly isModalOpen: boolean;
  readonly onOpenLogin: () => void;
};

type IconType = typeof MessageCircle;

type FeatureCopy = {
  readonly title: string;
  readonly description: string;
};

type FooterColumnCopy = {
  readonly title: string;
  readonly links: readonly string[];
};

type HeroRotatingItem = {
  readonly label: string;
  readonly suffix: string;
};

type LandingCopy = {
  readonly hero: {
    readonly eyebrow: string;
    readonly rotatingItems: readonly [HeroRotatingItem, ...HeroRotatingItem[]];
  };
  readonly work: {
    readonly eyebrow: string;
    readonly title: string;
    readonly description: string;
    readonly tabs: readonly FeatureCopy[];
    readonly previewTitle: string;
    readonly previewBoardTitle: string;
    readonly previewTableHeaders: readonly [string, string, string];
    readonly previewRequester: string;
    readonly previewQuestion: string;
    readonly previewAnswerTitle: string;
    readonly previewAnswer: string;
    readonly cardsLabel: string;
    readonly cards: readonly string[];
  };
  readonly workspace: {
    readonly eyebrow: string;
    readonly title: string;
    readonly description: string;
    readonly previewTitle: string;
    readonly previewEyebrow: string;
    readonly previewBoardTitle: string;
    readonly agentLabel: string;
    readonly metricLabels: readonly [string, string, string];
    readonly views: readonly FeatureCopy[];
    readonly tableHeaders: readonly string[];
    readonly rows: readonly string[][];
    readonly detailTitle: string;
    readonly detailItems: readonly FeatureCopy[];
  };
  readonly final: {
    readonly title: string;
    readonly description: string;
    readonly primaryCta: string;
    readonly secondaryCta: string;
  };
  readonly footer: {
    readonly tagline: string;
    readonly socialLabel: string;
    readonly columns: readonly FooterColumnCopy[];
  };
};

type ExpandedFeatureCopy = {
  readonly eyebrow: string;
  readonly title: string;
  readonly description: string;
  readonly items: readonly string[];
};

type ExpandedLandingCopy = {
  readonly assistants: {
    readonly eyebrow: string;
    readonly title: string;
    readonly description: string;
    readonly previewSearchQuery: string;
    readonly previewMeetingTitle: string;
    readonly previewNotesLabel: string;
    readonly previewAgentName: string;
    readonly cards: readonly ExpandedFeatureCopy[];
  };
  readonly together: {
    readonly eyebrow: string;
    readonly title: string;
    readonly description: string;
    readonly cards: readonly ExpandedFeatureCopy[];
  };
  readonly trust: {
    readonly title: string;
    readonly description: string;
    readonly testimonials: readonly {
      readonly company: string;
      readonly quote: string;
      readonly person: string;
      readonly tone: string;
    }[];
    readonly stats: readonly string[];
  };
};

const heroRotatingWordStyles = [
  {
    className: "bg-[#fee2e2] text-[#b91c1c]",
  },
  {
    className: "bg-[#ffedd5] text-[#c2410c]",
  },
  {
    className: "bg-[#fef3c7] text-[#92400e]",
  },
  {
    className: "bg-[#dcfce7] text-[#166534]",
  },
  {
    className: "bg-[#dbeafe] text-[#1d4ed8]",
  },
  {
    className: "bg-[#e0e7ff] text-[#4338ca]",
  },
  {
    className: "bg-[#ede9fe] text-[#6d28d9]",
  },
] as const;

const expandedLandingCopyByLanguage: Record<
  PublicSiteCopyLanguage,
  ExpandedLandingCopy
> = {
  ko: {
    assistants: {
      eyebrow: "온디맨드 어시스턴트",
      title: "필요할 때 바로 묻는 세일즈 어시스턴트.",
      description:
        "검색, 회의록, 보안 답변, 후속 업무를 따로 열지 않아도 같은 워크스페이스 안에서 바로 요청하고 처리합니다.",
      previewSearchQuery: "이번 분기 고객 요청",
      previewMeetingTitle: "주간 고객 동기화",
      previewNotesLabel: "노트",
      previewAgentName: "OneHand 에이전트",
      cards: [
        {
          eyebrow: "세일즈 에이전트",
          title: "해야 할 일을 물으면 OneHand가 초안을 만듭니다.",
          description: "딜 상태와 고객 기록을 읽고 이메일, 다음 액션, 체크리스트를 제안합니다.",
          items: ["후속 이메일 작성", "담당자에게 업무 배정", "거래 위험 신호 표시"],
        },
        {
          eyebrow: "통합 검색",
          title: "고객 맥락을 한 번에 찾습니다.",
          description: "문서, 메모, 일정, CRM 기록을 연결해 필요한 근거를 바로 보여줍니다.",
          items: ["자료 통합 검색", "출처와 함께 답변", "팀 지식 재사용"],
        },
        {
          eyebrow: "회의 노트",
          title: "회의가 끝나면 기록이 완성됩니다.",
          description: "논의 내용, 결정 사항, 다음 액션을 자동으로 정리해 딜 화면에 남깁니다.",
          items: ["핵심 요약", "액션 아이템", "참석자별 후속 업무"],
        },
        {
          eyebrow: "매출 리뷰",
          title: "이번 주 움직인 거래를 바로 봅니다.",
          description: "진행률, 응답 지연, 예상 매출 변화를 팀이 같은 기준으로 확인합니다.",
          items: ["주간 매출 요약", "병목 계정 표시", "리더용 리포트"],
        },
      ],
    },
    together: {
      eyebrow: "업무 통합",
      title: "흩어진 업무를 한 흐름으로 모으세요.",
      description:
        "문서, 지식, 프로젝트, 고객 기록이 분리되지 않도록 OneHand 안에서 같은 구조로 쌓습니다.",
      cards: [
        {
          eyebrow: "문서",
          title: "제안서와 고객 자료를 간단하게 관리합니다.",
          description: "영업 자료를 딜과 연결해 필요한 순간 바로 찾을 수 있습니다.",
          items: ["제안서", "체크리스트", "승인 기록"],
        },
        {
          eyebrow: "지식 베이스",
          title: "팀과 에이전트가 같은 지식을 사용합니다.",
          description: "자주 묻는 질문과 내부 정책을 답변 가능한 지식으로 정리합니다.",
          items: ["보안 답변", "제품 설명", "가격 정책"],
        },
        {
          eyebrow: "출시 트래커",
          title: "출시와 온보딩 진행 상황을 놓치지 않습니다.",
          description: "고객 온보딩, 계약, 교육 일정을 하나의 진행판으로 봅니다.",
          items: ["온보딩", "교육 일정", "완료 기준"],
        },
      ],
    },
    trust: {
      title: "거래를 움직이는 팀이 신뢰합니다.",
      description:
        "OneHand는 고객 기록을 잃지 않고 반복 업무를 줄이려는 팀을 위해 설계되었습니다.",
      testimonials: [
        {
          company: "Cursor-style sales team",
          quote: "팀이 같은 딜 맥락을 보고 움직이니 후속 업무가 훨씬 빨라졌습니다.",
          person: "Revenue Lead",
          tone: "bg-[#e95a48]",
        },
        {
          company: "Pipeline operations",
          quote: "회의록과 검색, 업무 배정이 한 화면에 있어 매주 리뷰가 쉬워졌습니다.",
          person: "Sales Ops",
          tone: "bg-[#1f79b8]",
        },
        {
          company: "Growth team",
          quote: "작은 팀도 엔터프라이즈처럼 고객 히스토리를 관리할 수 있습니다.",
          person: "Founder",
          tone: "bg-[#d89c25]",
        },
      ],
      stats: ["고객 기록 통합", "반복 업무 자동화", "다국어 팀 지원", "모바일 대응"],
    },
  },  "en-US": {
    assistants: {
      eyebrow: "On-demand assistants",
      title: "Ask your on-demand assistants.",
      description:
        "Search, notes, security answers, and follow-up work stay inside the same workspace instead of becoming separate tools.",
      previewSearchQuery: "customer request this quarter",
      previewMeetingTitle: "Weekly customer sync",
      previewNotesLabel: "Notes",
      previewAgentName: "OneHand agent",
      cards: [
        {
          eyebrow: "Sales agent",
          title: "You ask the tasks. OneHand drafts the work.",
          description: "Read deal status and customer context to suggest emails, next steps, and checklists.",
          items: ["Draft follow-ups", "Assign owners", "Flag deal risk"],
        },
        {
          eyebrow: "Enterprise search",
          title: "One search for every customer signal.",
          description: "Connect docs, notes, meetings, and CRM records with answers that include context.",
          items: ["Unified search", "Source-backed answers", "Reusable team knowledge"],
        },
        {
          eyebrow: "Meeting notes",
          title: "Perfect notes, every time.",
          description: "Turn discussions, decisions, and next actions into records attached to the deal.",
          items: ["Executive summary", "Action items", "Owner follow-ups"],
        },
        {
          eyebrow: "Revenue review",
          title: "See what moved this week.",
          description: "Review progress, reply delays, and forecast changes from the same operating view.",
          items: ["Weekly revenue", "Bottleneck accounts", "Leader report"],
        },
      ],
    },
    together: {
      eyebrow: "Bring work together",
      title: "Bring every sales motion together.",
      description:
        "Docs, knowledge, projects, and customer records build on the same structure inside OneHand.",
      cards: [
        {
          eyebrow: "Docs",
          title: "Simple proposals and customer materials.",
          description: "Attach sales collateral to deals so teams can find the right source instantly.",
          items: ["Proposals", "Checklists", "Approvals"],
        },
        {
          eyebrow: "Knowledge base",
          title: "One source of truth for teams and agents.",
          description: "Turn FAQs and internal policies into knowledge your team can actually use.",
          items: ["Security answers", "Product notes", "Pricing policy"],
        },
        {
          eyebrow: "Launch tracker",
          title: "Less tracking. More progress.",
          description: "Track onboarding, contracts, and training plans from one launch board.",
          items: ["Onboarding", "Training dates", "Done criteria"],
        },
      ],
    },
    trust: {
      title: "Trusted by teams that move deals.",
      description:
        "OneHand is built for teams that need customer memory and repeated work to stay under control.",
      testimonials: [
        {
          company: "Cursor-style sales team",
          quote: "Follow-up got faster once everyone worked from the same deal context.",
          person: "Revenue Lead",
          tone: "bg-[#e95a48]",
        },
        {
          company: "Pipeline operations",
          quote: "Notes, search, and routing in one screen made weekly reviews much easier.",
          person: "Sales Ops",
          tone: "bg-[#1f79b8]",
        },
        {
          company: "Growth team",
          quote: "A small team can manage customer history with enterprise discipline.",
          person: "Founder",
          tone: "bg-[#d89c25]",
        },
      ],
      stats: ["Customer memory unified", "Repeated work automated", "Multilingual teams supported", "Responsive on mobile"],
    },
  },};

const landingCopyByLanguage: Record<PublicSiteCopyLanguage, LandingCopy> = {
  ko: {
    hero: {
      eyebrow: "",
      rotatingItems: [
        { label: "OneHand", suffix: "가 간단해요." },
        { label: "세일즈", suffix: "가 간단해요." },
        { label: "AI", suffix: "가 간단해요." },
        { label: "B2C", suffix: "가 간단해요." },
        { label: "B2B", suffix: "가 간단해요." },
        { label: "CRM", suffix: "이 간단해요." },
        { label: "모든 것", suffix: "이 간단해요." },
      ],
    },
    work: {
      eyebrow: "맞춤 에이전트",
      title: "세일즈가 24시간 끊기지 않게.",
      description:
        "문의가 들어오고 회의가 끝나는 순간마다 에이전트가 기록을 읽고 다음 업무를 만들어 줍니다.",
      tabs: [
        {
          title: "Q&A 에이전트",
          description: "영업 자료와 고객 히스토리에서 답을 바로 찾습니다.",
        },
        {
          title: "업무 라우팅",
          description: "담당자, 마감일, 우선순위를 자동으로 정리합니다.",
        },
        {
          title: "알림 에이전트",
          description: "놓치기 쉬운 후속 업무를 팀 채널로 보냅니다.",
        },
        {
          title: "보안 검토",
          description: "민감 정보와 승인 흐름을 분리해 관리합니다.",
        },
        {
          title: "직접 만들기",
          description: "팀의 반복 업무를 에이전트로 구성합니다.",
        },
      ],
      previewTitle: "딜 데스크 어시스턴트",
      previewBoardTitle: "영업 Q&A",
      previewTableHeaders: ["질문", "담당자", "답변"],
      previewRequester: "지수",
      previewQuestion: "이번 주 재계약 고객 중 위험 신호가 있는 곳은?",
      previewAnswerTitle: "OneHand 에이전트",
      previewAnswer:
        "3개 계정에서 응답 지연이 보입니다. 담당자에게 후속 이메일 초안과 미팅 제안을 만들었습니다.",
      cardsLabel: "맞춤 에이전트가 처리할 수 있는 일",
      cards: [
        "신규 리드 분류",
        "견적 후속 알림",
        "보안 질문 답변",
        "주간 매출 리포트",
        "맞춤 에이전트 만들기",
      ],
    },
    workspace: {
      eyebrow: "연결된 워크스페이스",
      title: "문서, 고객, 업무가 같은 맥락을 공유합니다.",
      description:
        "영업 활동의 흩어진 단서를 하나의 워크스페이스로 연결해 팀이 같은 화면에서 판단하게 합니다.",
      previewTitle: "계정",
      previewEyebrow: "연결된 기록",
      previewBoardTitle: "매출 파이프라인",
      agentLabel: "에이전트",
      metricLabels: ["딜", "응답", "업무"],
      views: [
        {
          title: "고객 기록",
          description: "회사, 담당자, 대화 내역을 한 곳에 모읍니다.",
        },
        {
          title: "딜 진행",
          description: "단계별 상태와 위험 신호를 바로 확인합니다.",
        },
        {
          title: "회의 노트",
          description: "논의 내용과 다음 액션을 자동으로 정리합니다.",
        },
      ],
      tableHeaders: ["계정", "상태", "다음 액션"],
      rows: [
        ["Acme Korea", "진행", "가격 승인"],
        ["Blue Retail", "후속", "데모 일정"],
        ["North Labs", "성사", "온보딩"],
      ],
      detailTitle: "Acme Korea",
      detailItems: [
        {
          title: "최근 대화",
          description: "예산 승인 전에 보안 체크리스트를 요청했습니다.",
        },
        {
          title: "추천 액션",
          description: "법무 검토 자료와 다음 주 미팅 슬롯을 보내세요.",
        },
      ],
    },
    final: {
      title: "오늘 바로 시작하세요.",
      description: "",
      primaryCta: "OneHand 시작",
      secondaryCta: "데모 요청",
    },
    footer: {
      tagline: "세일즈 팀을 위한 AI 워크스페이스",
      socialLabel: "OneHand 채널",
      columns: [
        {
          title: "Product",
          links: ["Workspace", "AI agents", "Pipeline", "Integrations"],
        },
        {
          title: "Company",
          links: ["About", "Careers", "Security", "Status"],
        },
        {
          title: "Resources",
          links: ["Help center", "Pricing", "Blog", "Templates"],
        },
        {
          title: "OneHand for",
          links: ["Enterprise", "Sales teams", "Startups", "Partners"],
        },
      ],
    },
  },  "en-US": {
    hero: {
      eyebrow: "",
      rotatingItems: [
        { label: "OneHand", suffix: "is Simple." },
        { label: "Sales", suffix: "is Simple." },
        { label: "AI", suffix: "is Simple." },
        { label: "B2C", suffix: "is Simple." },
        { label: "B2B", suffix: "is Simple." },
        { label: "CRM", suffix: "is Simple." },
        { label: "Everything", suffix: "is Simple." },
      ],
    },
    work: {
      eyebrow: "Custom Agents",
      title: "Keep sales moving 24/7.",
      description:
        "When a question lands or a meeting ends, agents read the record and create the next piece of work.",
      tabs: [
        {
          title: "Q&A agents",
          description: "Find answers inside sales collateral and customer history.",
        },
        {
          title: "Task routing",
          description: "Assign owners, due dates, and priorities automatically.",
        },
        {
          title: "Reminder agents",
          description: "Send easy-to-miss follow-ups into team channels.",
        },
        {
          title: "Security review",
          description: "Separate sensitive data and approval workflows.",
        },
        {
          title: "Create your own",
          description: "Turn your repeated team process into an agent.",
        },
      ],
      previewTitle: "Deal desk assistant",
      previewBoardTitle: "Sales Q&A",
      previewTableHeaders: ["Question", "Owner", "Answer"],
      previewRequester: "Jason",
      previewQuestion: "Which renewal accounts show risk this week?",
      previewAnswerTitle: "OneHand agent",
      previewAnswer:
        "Three accounts have response delays. I drafted follow-up emails and suggested meeting times for each owner.",
      cardsLabel: "What Custom Agents can do",
      cards: [
        "Triage new leads",
        "Follow up on quotes",
        "Answer security questions",
        "Report weekly revenue",
        "Create a custom agent",
      ],
    },
    workspace: {
      eyebrow: "Connected workspace",
      title: "Docs, customers, and tasks share the same context.",
      description:
        "Connect the scattered clues of sales activity into one workspace, so teams can make decisions from the same screen.",
      previewTitle: "Accounts",
      previewEyebrow: "Connected records",
      previewBoardTitle: "Revenue pipeline",
      agentLabel: "Agent",
      metricLabels: ["Deals", "Replies", "Tasks"],
      views: [
        {
          title: "Customer records",
          description: "Keep companies, contacts, and conversations together.",
        },
        {
          title: "Deal progress",
          description: "See stage status and risk signals at a glance.",
        },
        {
          title: "Meeting notes",
          description: "Summarize decisions and next actions automatically.",
        },
      ],
      tableHeaders: ["Account", "Status", "Next action"],
      rows: [
        ["Acme North", "In progress", "Price approval"],
        ["Blue Retail", "Follow-up", "Demo slot"],
        ["North Labs", "Closed", "Onboarding"],
      ],
      detailTitle: "Acme North",
      detailItems: [
        {
          title: "Latest conversation",
          description: "The buyer requested a security checklist before budget approval.",
        },
        {
          title: "Suggested action",
          description: "Send the legal review packet and meeting options for next week.",
        },
      ],
    },
    final: {
      title: "Get started today.",
      description: "",
      primaryCta: "Get OneHand",
      secondaryCta: "Request a demo",
    },
    footer: {
      tagline: "",
      socialLabel: "OneHand channels",
      columns: [
        {
          title: "Product",
          links: ["Workspace", "AI agents", "Pipeline", "Integrations"],
        },
        {
          title: "Company",
          links: ["About", "Careers", "Security", "Status"],
        },
        {
          title: "Resources",
          links: ["Help center", "Pricing", "Blog", "Templates"],
        },
        {
          title: "OneHand for",
          links: ["Enterprise", "Sales teams", "Startups", "Partners"],
        },
      ],
    },
  },};

const workTabVisuals: readonly {
  readonly icon: IconType;
  readonly tone: string;
}[] = [
  { icon: MessageCircle, tone: "bg-[#fff0e4] text-[#d9571f]" },
  { icon: FolderKanban, tone: "bg-[#eee7ff] text-[#7547d8]" },
  { icon: Bell, tone: "bg-[#e7f4ff] text-[#0075DE]" },
  { icon: ShieldCheck, tone: "bg-[#e8f7ef] text-[#17824c]" },
  { icon: Sparkles, tone: "bg-[#07134a] text-white" },
];

const workspaceViewVisuals: readonly {
  readonly icon: IconType;
  readonly tone: string;
}[] = [
  { icon: Database, tone: "bg-[#e8f3ff] text-[#0075DE]" },
  { icon: CircleDollarSign, tone: "bg-[#e8f7ef] text-[#16814b]" },
  { icon: FileText, tone: "bg-[#fff1df] text-[#bb6400]" },
];

const assistantCardVisuals: readonly {
  readonly icon: IconType;
  readonly accent: string;
  readonly panel: string;
}[] = [
  { icon: Sparkles, accent: "text-[#0075DE]", panel: "bg-[#fff6d8]" },
  { icon: Search, accent: "text-[#e95a48]", panel: "bg-[#ffe9e4]" },
  { icon: MessageSquareText, accent: "text-[#1f79b8]", panel: "bg-[#e8f3ff]" },
  { icon: CircleDollarSign, accent: "text-[#16814b]", panel: "bg-[#e8f7ef]" },
];

const togetherCardVisuals: readonly {
  readonly icon: IconType;
  readonly accent: string;
  readonly panel: string;
}[] = [
  { icon: FileText, accent: "text-[#238f8d]", panel: "bg-[#dff3f1]" },
  { icon: Database, accent: "text-[#0075DE]", panel: "bg-[#e8f3ff]" },
  { icon: FolderKanban, accent: "text-[#b0744c]", panel: "bg-[#f1d8c5]" },
];

// 기능 : 인증 랜딩 페이지를 렌더링합니다.
export function AuthLandingPage({
  children,
  isModalOpen,
  onOpenLogin,
}: AuthLandingPageProps) {
  const { language } = usePublicSiteLanguage();
  const copyLanguage = getPublicSiteCopyLanguage(language);
  const scrollProgress = useLandingScrollProgress();
  const copy = landingCopyByLanguage[copyLanguage];
  const expandedCopy = expandedLandingCopyByLanguage[copyLanguage];

  return (
    <div className="min-h-screen bg-[#f7f7f5] text-[#111111]">
      <LandingScrollStyles />
      <PublicSiteHeader onLogin={onOpenLogin} />
      <LandingScrollProgressBar progress={scrollProgress} />
      <main className="pt-14">
        <HeroSection copy={copy} />
        <WorkSection copy={copy} />
        <AssistantsSection copy={expandedCopy.assistants} />
        <TogetherSection copy={expandedCopy.together} />
        <WorkspaceSection copy={copy} />
        <TrustSection copy={expandedCopy.trust} />
        <FinalSection copy={copy} />
      </main>
      {isModalOpen ? children : null}
    </div>
  );
}

// 기능 : 인증 목록 조회 훅을 제공합니다.
function useLandingScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    document.documentElement.classList.add("landing-scrollbar-hidden");
    document.body.classList.add("landing-scrollbar-hidden");

    // 기능 : 랜딩 페이지 스크롤 진행률을 갱신합니다.
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

// 기능 : 랜딩 스크롤 스타일 영역을 렌더링합니다.
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

        @keyframes landing-hero-word-enter {
          from {
            opacity: 0;
            transform: scale(0.97);
            filter: blur(6px);
          }

          45% {
            opacity: 0.82;
            filter: blur(2px);
          }

          to {
            opacity: 1;
            transform: scale(1);
            filter: blur(0);
          }
        }

        .landing-hero-word-pill {
          transition:
            background-color 1400ms cubic-bezier(0.16, 1, 0.3, 1),
            color 1400ms cubic-bezier(0.16, 1, 0.3, 1);
          will-change: background-color, color;
        }

        .landing-hero-word-enter {
          animation: landing-hero-word-enter 720ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }
      `}
    </style>
  );
}

// 기능 : 랜딩 스크롤 진행률 바 영역을 렌더링합니다.
function LandingScrollProgressBar({
  progress,
}: {
  readonly progress: number;
}) {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-x-0 top-14 z-40 h-px bg-transparent"
    >
      <div
        className="h-full origin-left bg-[#d9d9d4] transition-transform duration-150 ease-out"
        style={{
          transform: `scaleX(${progress})`,
        }}
      />
    </div>
  );
}

// 기능 : 히어로 섹션을 렌더링합니다.
function HeroSection({ copy }: { readonly copy: LandingCopy }) {
  const [activeHeroWordIndex, setActiveHeroWordIndex] = useState(0);
  const rotatingItemsCount = copy.hero.rotatingItems.length;
  const activeHeroItem =
    copy.hero.rotatingItems[activeHeroWordIndex % rotatingItemsCount] ??
    copy.hero.rotatingItems[0];
  const activeHeroWordStyle =
    heroRotatingWordStyles[activeHeroWordIndex % heroRotatingWordStyles.length] ??
    heroRotatingWordStyles[0];

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveHeroWordIndex((currentIndex) =>
        (currentIndex + 1) % rotatingItemsCount
      );
    }, 2500);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [rotatingItemsCount]);

  return (
    <section className="relative flex min-h-[calc(100vh-56px)] items-center justify-center overflow-hidden bg-white px-4 py-12 text-center sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-[1320px] flex-col items-center justify-center">
        {copy.hero.eyebrow ? (
          <p className="text-[12px] font-black uppercase text-[#0075DE]">
            {copy.hero.eyebrow}
          </p>
        ) : null}
        <h1
          className={[
            "max-w-[1060px] break-keep text-[44px] font-normal leading-[0.98] text-[#0f0f0f]",
            "sm:text-[64px] md:text-[78px] lg:text-[94px] xl:text-[96px]",
            copy.hero.eyebrow ? "mt-4" : "",
          ].join(" ")}
        >
          <span className="inline-flex flex-wrap items-center justify-center gap-x-[0.16em] gap-y-2 align-middle leading-none">
            <span
              className={[
                "landing-hero-word-pill inline-flex items-center gap-[0.14em] rounded-full px-[0.28em] py-[0.11em] leading-none",
                "font-normal",
                activeHeroWordStyle.className,
              ].join(" ")}
            >
              <span className="h-[0.13em] w-[0.13em] shrink-0 rounded-full bg-current opacity-85" />
              <span
                className="landing-hero-word-enter inline-block text-[0.9em] leading-none"
                key={activeHeroItem.label}
              >
                {activeHeroItem.label}
              </span>
            </span>
            <span className="inline-block leading-none">
              {activeHeroItem.suffix}
            </span>
          </span>
        </h1>
      </div>

    </section>
  );
}

// 기능 : 업무 섹션을 렌더링합니다.
function WorkSection({ copy }: { readonly copy: LandingCopy }) {
  const publicSitePath = usePublicSitePath();
  const defaultVisual = {
    icon: MessageCircle,
    tone: "bg-[#fff0e4] text-[#d9571f]",
  };

  return (
    <section className="min-h-screen bg-[#f7f7f5] py-16 sm:py-20 lg:py-24">
      <div className="mx-auto w-full max-w-[1320px] px-4 sm:px-6 lg:px-8">
        <p className="text-[12px] font-black uppercase text-[#0075DE]">
          {copy.work.eyebrow}
        </p>
        <div className="mt-3 grid gap-5 lg:grid-cols-[0.95fr_1fr] lg:items-end">
          <h2 className="max-w-[760px] break-keep text-[42px] font-black leading-[1.02] text-[#0f0f0f] sm:text-[58px] lg:text-[54px]">
            {copy.work.title}
          </h2>
          <p className="max-w-[560px] break-keep text-[17px] font-semibold leading-8 text-[#555550] lg:justify-self-end">
            {copy.work.description}
          </p>
        </div>

        <div className="mt-9 grid overflow-hidden rounded-[8px] border border-[#e4e4df] bg-white lg:min-h-[570px] lg:grid-cols-[0.82fr_1.18fr]">
          <div className="flex flex-col justify-between p-5 sm:p-7">
            <div>
              <div className="inline-flex h-10 items-center rounded-full bg-[#111111] px-4 text-[13px] font-black text-white">
                {copy.work.eyebrow}
              </div>
              <h3 className="mt-5 max-w-[420px] text-[24px] font-black leading-tight text-[#111111] sm:text-[30px]">
                {copy.work.tabs[0]?.title}
              </h3>
            </div>

            <div className="mt-10 divide-y divide-[#eeeeec]">
              {copy.work.tabs.map((tab, index) => {
                const visual = workTabVisuals[index] ?? defaultVisual;
                const Icon = visual.icon;

                return (
                  <div className="flex gap-3 py-4" key={tab.title}>
                    <span
                      className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${visual.tone}`}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <h4 className="text-[15px] font-black text-[#111111]">
                        {tab.title}
                      </h4>
                      <p className="mt-1 text-[13px] font-semibold leading-6 text-[#666660]">
                        {tab.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <AutomationPreview copy={copy} />
        </div>

        <div className="mt-8">
          <p className="text-[13px] font-bold text-[#777770]">
            {copy.work.cardsLabel}
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {copy.work.cards.map((card, index) => (
              <Link
                className={[
                  "group flex min-h-[118px] flex-col justify-between rounded-[8px] border p-5 text-left text-[16px] font-black leading-6",
                  index === copy.work.cards.length - 1
                    ? "border-[#07134a] bg-[#07134a] text-white"
                    : "border-[#dededa] bg-white text-[#111111] hover:border-[#b8d8f4]",
                ].join(" ")}
                key={card}
                to={publicSitePath("/contact")}
              >
                <span>{card}</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// 기능 : 자동화 미리보기 영역을 렌더링합니다.
function AutomationPreview({ copy }: { readonly copy: LandingCopy }) {
  return (
    <div className="relative min-h-[520px] overflow-hidden border-t border-[#eeeeec] bg-[#fff1e6] p-5 sm:p-7 lg:border-l lg:border-t-0">
      <div className="absolute inset-x-0 top-0 h-10 bg-[#ffd8bf]" />
      <div className="relative mt-5 h-full rounded-[8px] border border-[#eeeeec] bg-white p-5 shadow-[0_24px_90px_rgba(115,67,30,0.16)] sm:p-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[12px] font-black uppercase text-[#c06620]">
              {copy.work.previewTitle}
            </p>
            <h3 className="mt-2 text-[34px] font-black leading-none text-[#ddddda] sm:text-[48px]">
              {copy.work.previewBoardTitle}
            </h3>
          </div>
          <span className="grid h-10 w-10 place-items-center rounded-full bg-[#f7f7f5]">
            <ArrowRight className="h-5 w-5" />
          </span>
        </div>

        <div className="mt-10 grid gap-3 text-[13px] font-bold text-[#b8b8b2]">
          <div className="grid grid-cols-[1fr_0.5fr_0.6fr] gap-3 border-b border-[#eeeeec] pb-3">
            {copy.work.previewTableHeaders.map((header) => (
              <span key={header}>{header}</span>
            ))}
          </div>
          {[0, 1, 2, 3, 4].map((row) => (
            <div
              className="grid grid-cols-[1fr_0.5fr_0.6fr] gap-3 border-b border-[#f0f0ed] pb-3 opacity-55"
              key={row}
            >
              <span className="h-3 rounded-full bg-[#ecece8]" />
              <span className="h-3 rounded-full bg-[#ecece8]" />
              <span className="h-3 rounded-full bg-[#ecece8]" />
            </div>
          ))}
        </div>

        <div className="absolute bottom-9 right-5 w-[min(520px,calc(100%-40px))] overflow-hidden rounded-[8px] border border-[#e2e2dc] bg-white shadow-[0_20px_60px_rgba(15,15,15,0.16)] sm:right-10">
          <div className="flex gap-4 border-b border-[#eeeeec] p-5">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#eeeeec]">
              <Users className="h-6 w-6 text-[#111111]" />
            </span>
            <div>
              <p className="text-[13px] font-black text-[#777770]">
                {copy.work.previewRequester}
              </p>
              <p className="mt-1 break-keep text-[20px] font-black leading-tight text-[#111111]">
                {copy.work.previewQuestion}
              </p>
            </div>
          </div>
          <div className="flex gap-4 p-5">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-[8px] bg-[#ff8a34] text-white">
              <MessageCircle className="h-6 w-6" />
            </span>
            <div>
              <p className="text-[18px] font-black text-[#111111]">
                {copy.work.previewAnswerTitle}
              </p>
              <p className="mt-1 break-keep text-[17px] font-bold leading-7 text-[#111111]">
                {copy.work.previewAnswer}
              </p>
            </div>
          </div>
        </div>

        <div className="absolute bottom-4 left-5 flex items-center gap-2 rounded-full bg-white px-3 py-2 shadow-[0_12px_30px_rgba(15,15,15,0.12)]">
          <Clock3 className="h-4 w-4 text-[#0075DE]" />
          <span className="text-[12px] font-black text-[#333330]">24/7</span>
        </div>
      </div>
    </div>
  );
}

// 기능 : 어시스턴트 섹션을 렌더링합니다.
function AssistantsSection({
  copy,
}: {
  readonly copy: ExpandedLandingCopy["assistants"];
}) {
  return (
    <section className="bg-white py-16 sm:py-20 lg:py-24">
      <div className="mx-auto w-full max-w-[1320px] px-4 sm:px-6 lg:px-8">
        <div className="max-w-[760px]">
          <p className="text-[12px] font-black uppercase text-[#0075DE]">
            {copy.eyebrow}
          </p>
          <h2 className="mt-3 break-keep text-[40px] font-black leading-[1.05] text-[#0f0f0f] sm:text-[54px]">
            {copy.title}
          </h2>
          <p className="mt-4 break-keep text-[17px] font-semibold leading-8 text-[#555550]">
            {copy.description}
          </p>
        </div>

        <div className="mt-9 grid gap-4 lg:grid-cols-2">
          {copy.cards.map((card, index) => (
            <AssistantFeatureCard
              card={card}
              index={index}
              key={card.title}
              previewCopy={copy}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// 기능 : 어시스턴트 기능 카드 항목을 렌더링합니다.
function AssistantFeatureCard({
  card,
  index,
  previewCopy,
}: {
  readonly card: ExpandedFeatureCopy;
  readonly index: number;
  readonly previewCopy: ExpandedLandingCopy["assistants"];
}) {
  const visual = assistantCardVisuals[index] ?? assistantCardVisuals[0]!;
  const Icon = visual.icon;

  return (
    <article className="overflow-hidden rounded-[8px] border border-[#dededa] bg-white">
      <div className="flex items-start justify-between gap-4 p-5 sm:p-6">
        <div>
          <p className="text-[12px] font-black uppercase text-[#777770]">
            {card.eyebrow}
          </p>
          <h3 className="mt-2 max-w-[420px] break-keep text-[24px] font-black leading-tight text-[#111111]">
            {card.title}
          </h3>
          <p className="mt-3 max-w-[520px] break-keep text-[14px] font-semibold leading-7 text-[#666660]">
            {card.description}
          </p>
        </div>
        <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${visual.panel}`}>
          <Icon className={`h-5 w-5 ${visual.accent}`} />
        </span>
      </div>

      <AssistantPreview
        card={card}
        index={index}
        previewCopy={previewCopy}
        visual={visual}
      />
    </article>
  );
}

// 기능 : 어시스턴트 미리보기 영역을 렌더링합니다.
function AssistantPreview({
  card,
  index,
  previewCopy,
  visual,
}: {
  readonly card: ExpandedFeatureCopy;
  readonly index: number;
  readonly previewCopy: ExpandedLandingCopy["assistants"];
  readonly visual: (typeof assistantCardVisuals)[number];
}) {
  if (index === 1) {
    return (
      <div className={`border-t border-[#eeeeec] p-5 ${visual.panel}`}>
        <div className="rounded-[8px] border border-[#dededa] bg-white p-4">
          <div className="flex items-center gap-2 rounded-[6px] border border-[#eeeeec] px-3 py-2">
            <Search className="h-4 w-4 text-[#777770]" />
            <span className="text-[13px] font-bold text-[#333330]">
              {previewCopy.previewSearchQuery}
            </span>
          </div>
          <div className="mt-4 grid gap-2">
            {card.items.map((item) => (
              <div className="flex items-center gap-3 rounded-[6px] bg-[#fbfbfa] p-3" key={item}>
                <span className="h-2.5 w-2.5 rounded-full bg-[#e95a48]" />
                <span className="text-[12px] font-bold text-[#333330]">
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (index === 2) {
    return (
      <div className={`border-t border-[#eeeeec] p-5 ${visual.panel}`}>
        <div className="rounded-[8px] border border-[#dededa] bg-white p-4">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-black text-[#111111]">
              {previewCopy.previewMeetingTitle}
            </span>
            <span className="rounded-full bg-[#e8f3ff] px-2 py-1 text-[11px] font-black text-[#0075DE]">
              {previewCopy.previewNotesLabel}
            </span>
          </div>
          <div className="mt-4 space-y-3">
            {card.items.map((item) => (
              <div className="grid gap-1" key={item}>
                <span className="text-[12px] font-black text-[#333330]">
                  {item}
                </span>
                <span className="h-2 rounded-full bg-[#e7e7e2]" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`border-t border-[#eeeeec] p-5 ${visual.panel}`}>
      <div className="rounded-[8px] border border-[#dededa] bg-white p-4">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[8px] bg-[#0075DE] text-white">
            <Sparkles className="h-5 w-5" />
          </span>
          <div>
            <p className="text-[13px] font-black text-[#111111]">
              {previewCopy.previewAgentName}
            </p>
            <p className="mt-1 text-[13px] font-semibold leading-6 text-[#555550]">
              {card.items[0] ?? card.title}
            </p>
          </div>
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          {card.items.map((item) => (
            <span
              className="rounded-[6px] border border-[#eeeeec] bg-[#fbfbfa] p-2 text-[12px] font-bold text-[#333330]"
              key={item}
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// 기능 : 협업 섹션을 렌더링합니다.
function TogetherSection({
  copy,
}: {
  readonly copy: ExpandedLandingCopy["together"];
}) {
  return (
    <section className="bg-[#f7f7f5] py-16 sm:py-20 lg:py-24">
      <div className="mx-auto w-full max-w-[1320px] px-4 sm:px-6 lg:px-8">
        <div className="max-w-[820px]">
          <p className="text-[12px] font-black uppercase text-[#0075DE]">
            {copy.eyebrow}
          </p>
          <h2 className="mt-3 break-keep text-[40px] font-black leading-[1.05] text-[#0f0f0f] sm:text-[54px]">
            {copy.title}
          </h2>
          <p className="mt-4 break-keep text-[17px] font-semibold leading-8 text-[#555550]">
            {copy.description}
          </p>
        </div>

        <div className="mt-9 grid gap-4 lg:grid-cols-3">
          {copy.cards.map((card, index) => (
            <TogetherCard card={card} index={index} key={card.title} />
          ))}
        </div>
      </div>
    </section>
  );
}

// 기능 : 협업 카드 항목을 렌더링합니다.
function TogetherCard({
  card,
  index,
}: {
  readonly card: ExpandedFeatureCopy;
  readonly index: number;
}) {
  const visual = togetherCardVisuals[index] ?? togetherCardVisuals[0]!;
  const Icon = visual.icon;

  return (
    <article className="overflow-hidden rounded-[8px] border border-[#dededa] bg-white">
      <div className="p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[12px] font-black uppercase text-[#777770]">
              {card.eyebrow}
            </p>
            <h3 className="mt-2 break-keep text-[22px] font-black leading-tight text-[#111111]">
              {card.title}
            </h3>
          </div>
          <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-[8px] ${visual.panel}`}>
            <Icon className={`h-5 w-5 ${visual.accent}`} />
          </span>
        </div>
        <p className="mt-3 break-keep text-[13px] font-semibold leading-6 text-[#666660]">
          {card.description}
        </p>
      </div>

      <div className={`border-t border-[#eeeeec] p-5 ${visual.panel}`}>
        <div className="rounded-[8px] border border-[#dededa] bg-white p-4">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-[13px] font-black text-[#111111]">
              {card.eyebrow}
            </span>
            <ArrowRight className="h-4 w-4 text-[#777770]" />
          </div>
          <div className="grid gap-2">
            {card.items.map((item, itemIndex) => (
              <div
                className="flex min-h-10 items-center justify-between rounded-[6px] border border-[#eeeeec] bg-[#fbfbfa] px-3 text-[12px] font-bold text-[#333330]"
                key={item}
              >
                <span>{item}</span>
                <span className="text-[#999993]">0{itemIndex + 1}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}

// 기능 : 신뢰 섹션을 렌더링합니다.
function TrustSection({
  copy,
}: {
  readonly copy: ExpandedLandingCopy["trust"];
}) {
  return (
    <section className="bg-[#f7f7f5] py-16 sm:py-20 lg:py-24">
      <div className="mx-auto w-full max-w-[1320px] px-4 sm:px-6 lg:px-8">
        <div className="max-w-[760px]">
          <h2 className="break-keep text-[40px] font-black leading-[1.05] text-[#0f0f0f] sm:text-[54px]">
            {copy.title}
          </h2>
          <p className="mt-4 break-keep text-[17px] font-semibold leading-8 text-[#555550]">
            {copy.description}
          </p>
        </div>

        <div className="mt-9 grid gap-4 lg:grid-cols-3">
          {copy.testimonials.map((testimonial) => (
            <article
              className={`${testimonial.tone} min-h-[320px] rounded-[8px] p-6 text-white`}
              key={testimonial.company}
            >
              <p className="text-[13px] font-black uppercase opacity-80">
                {testimonial.company}
              </p>
              <p className="mt-20 break-keep text-[24px] font-black leading-tight">
                “{testimonial.quote}”
              </p>
              <p className="mt-6 text-[13px] font-bold opacity-85">
                {testimonial.person}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-x-7 gap-y-3 border-t border-[#e3e3de] pt-5 text-[12px] font-black text-[#666660]">
          {copy.stats.map((stat) => (
            <span className="inline-flex items-center gap-2" key={stat}>
              <CheckCircle2 className="h-4 w-4 text-[#0075DE]" />
              {stat}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

// 기능 : 워크스페이스 섹션을 렌더링합니다.
function WorkspaceSection({ copy }: { readonly copy: LandingCopy }) {
  const defaultVisual = {
    icon: Database,
    tone: "bg-[#e8f3ff] text-[#0075DE]",
  };

  return (
    <section className="min-h-screen bg-white py-16 sm:py-20 lg:py-24">
      <div className="mx-auto grid w-full max-w-[1320px] gap-10 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:px-8">
        <div>
          <p className="text-[12px] font-black uppercase text-[#0075DE]">
            {copy.workspace.eyebrow}
          </p>
          <h2 className="mt-3 max-w-[720px] break-keep text-[40px] font-black leading-[1.05] text-[#0f0f0f] sm:text-[56px] lg:text-[68px]">
            {copy.workspace.title}
          </h2>
          <p className="mt-5 max-w-[620px] break-keep text-[17px] font-semibold leading-8 text-[#555550]">
            {copy.workspace.description}
          </p>

          <div className="mt-8 grid gap-3">
            {copy.workspace.views.map((view, index) => {
              const visual = workspaceViewVisuals[index] ?? defaultVisual;
              const Icon = visual.icon;

              return (
                <div
                  className="flex gap-4 rounded-[8px] border border-[#eeeeec] bg-[#fbfbfa] p-4"
                  key={view.title}
                >
                  <span
                    className={`grid h-11 w-11 shrink-0 place-items-center rounded-[8px] ${visual.tone}`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-[15px] font-black text-[#111111]">
                      {view.title}
                    </h3>
                    <p className="mt-1 text-[13px] font-semibold leading-6 text-[#666660]">
                      {view.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <WorkspacePreview copy={copy} />
      </div>
    </section>
  );
}

// 기능 : 워크스페이스 미리보기 영역을 렌더링합니다.
function WorkspacePreview({ copy }: { readonly copy: LandingCopy }) {
  return (
    <div className="overflow-hidden rounded-[8px] border border-[#dededa] bg-[#f7f7f5] shadow-[0_28px_90px_rgba(15,15,15,0.11)]">
      <div className="flex h-11 items-center gap-2 border-b border-[#e7e7e2] bg-white px-4">
        <span className="h-2.5 w-2.5 rounded-full bg-[#d8d8d3]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#d8d8d3]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#d8d8d3]" />
        <span className="ml-3 text-[12px] font-black text-[#555550]">
          {copy.workspace.previewTitle}
        </span>
      </div>

      <div className="grid min-h-[520px] bg-white lg:grid-cols-[1fr_270px]">
        <div className="min-w-0 p-5 sm:p-7">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[12px] font-black uppercase text-[#777770]">
                {copy.workspace.previewEyebrow}
              </p>
              <h3 className="mt-1 text-[26px] font-black text-[#111111]">
                {copy.workspace.previewBoardTitle}
              </h3>
            </div>
            <span className="inline-flex h-9 items-center gap-2 rounded-[6px] bg-[#0075DE] px-3 text-[12px] font-black text-white">
              <Sparkles className="h-4 w-4" />
              {copy.workspace.agentLabel}
            </span>
          </div>

          <div className="mt-6 overflow-hidden rounded-[8px] border border-[#eeeeec]">
            <div className="grid grid-cols-3 bg-[#f7f7f5] text-[12px] font-black text-[#555550]">
              {copy.workspace.tableHeaders.map((header) => (
                <span className="border-r border-[#eeeeec] p-3 last:border-r-0" key={header}>
                  {header}
                </span>
              ))}
            </div>
            {copy.workspace.rows.map((row) => (
              <div
                className="grid grid-cols-3 border-t border-[#eeeeec] text-[13px] font-bold text-[#333330]"
                key={row.join("-")}
              >
                {row.map((cell, index) => (
                  <span
                    className="min-h-[54px] border-r border-[#eeeeec] p-3 last:border-r-0"
                    key={`${cell}-${index}`}
                  >
                    {index === 1 ? (
                      <span className="inline-flex rounded-full bg-[#e8f3ff] px-2 py-1 text-[11px] font-black text-[#0075DE]">
                        {cell}
                      </span>
                    ) : (
                      cell
                    )}
                  </span>
                ))}
              </div>
            ))}
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <MetricPill
              icon={Handshake}
              label={copy.workspace.metricLabels[0]}
              value="+18%"
            />
            <MetricPill
              icon={Mail}
              label={copy.workspace.metricLabels[1]}
              value="2.4h"
            />
            <MetricPill
              icon={CheckCircle2}
              label={copy.workspace.metricLabels[2]}
              value="96%"
            />
          </div>
        </div>

        <aside className="border-t border-[#eeeeec] bg-[#fbfbfa] p-5 lg:border-l lg:border-t-0">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-[#e8f3ff]">
            <Building2 className="h-6 w-6 text-[#0075DE]" />
          </span>
          <h3 className="mt-4 text-[24px] font-black text-[#111111]">
            {copy.workspace.detailTitle}
          </h3>
          <div className="mt-5 grid gap-3">
            {copy.workspace.detailItems.map((item) => (
              <div className="rounded-[8px] border border-[#eeeeec] bg-white p-3" key={item.title}>
                <p className="text-[13px] font-black text-[#111111]">
                  {item.title}
                </p>
                <p className="mt-1 text-[12px] font-semibold leading-5 text-[#666660]">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}

// 기능 : 지표 필 영역을 렌더링합니다.
function MetricPill({
  icon: Icon,
  label,
  value,
}: {
  readonly icon: IconType;
  readonly label: string;
  readonly value: string;
}) {
  return (
    <div className="rounded-[8px] border border-[#eeeeec] bg-[#fbfbfa] p-3">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-[#0075DE]" />
        <span className="text-[12px] font-black text-[#555550]">{label}</span>
      </div>
      <p className="mt-3 text-[24px] font-black text-[#111111]">{value}</p>
    </div>
  );
}

// 기능 : 마지막 섹션을 렌더링합니다.
function FinalSection({ copy }: { readonly copy: LandingCopy }) {
  const publicSitePath = usePublicSitePath();

  return (
    <section className="flex min-h-screen flex-col bg-[#f7f7f5]">
      <div className="flex min-h-[48vh] flex-1 items-center justify-center px-4 py-16 text-center sm:px-6">
        <div>
          <h2 className="break-keep text-[38px] font-black leading-tight text-[#0f0f0f] sm:text-[42px]">
            {copy.final.title}
          </h2>
          {copy.final.description ? (
            <p className="mx-auto mt-4 max-w-[620px] break-keep text-[16px] font-semibold leading-7 text-[#555550]">
              {copy.final.description}
            </p>
          ) : null}
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link
              className="inline-flex h-11 items-center gap-2 rounded-[6px] bg-[#0075DE] px-5 text-[15px] font-black text-white hover:bg-[#006AC8]"
              to={publicSitePath("/signup")}
            >
              {copy.final.primaryCta}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              className="inline-flex h-11 items-center rounded-[6px] bg-white px-5 text-[15px] font-black text-[#005aa8] hover:bg-[#eef6ff]"
              to={publicSitePath("/contact")}
            >
              {copy.final.secondaryCta}
            </Link>
          </div>
        </div>
      </div>

      <PublicSiteFooter />
    </section>
  );
}
