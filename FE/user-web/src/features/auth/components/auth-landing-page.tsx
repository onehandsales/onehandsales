import {
  ArrowRight,
  Building2,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Database,
  FileText,
  Handshake,
  Mail,
  MessageCircle,
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

type HeroRotatingItem = {
  readonly label: string;
  readonly suffix: string;
};

type FeatureCopy = {
  readonly title: string;
  readonly description: string;
};

type LandingCopy = {
  readonly hero: {
    readonly eyebrow: string;
    readonly rotatingItems: readonly [HeroRotatingItem, ...HeroRotatingItem[]];
  };
  readonly realMoment: {
    readonly title: string;
    readonly imageAlt: string;
  };
  readonly flow: {
    readonly eyebrow: string;
    readonly title: string;
    readonly description: string;
    readonly inputs: readonly [string, string, string, string];
    readonly recordLabel: string;
    readonly followUpLabel: string;
    readonly resultLabel: string;
  };
  readonly persona: {
    readonly eyebrow: string;
    readonly title: string;
    readonly description: string;
    readonly personas: readonly [
      FeatureCopy,
      FeatureCopy,
      FeatureCopy,
      FeatureCopy,
    ];
  };
  readonly trustProof: {
    readonly eyebrow: string;
    readonly title: string;
    readonly description: string;
    readonly proofs: readonly [
      FeatureCopy,
      FeatureCopy,
      FeatureCopy,
      FeatureCopy,
    ];
  };
  readonly final: {
    readonly title: string;
    readonly description: string;
    readonly primaryCta: string;
    readonly secondaryCta: string;
  };
};

const landingHeroSectionHeightClassName = "landing-hero-section-height";
const landingSectionHeightClassName = "landing-section-height";
const landingFinalSectionHeightClassName = "landing-final-section-height";
const landingCenteredSectionClassName =
  `${landingSectionHeightClassName} flex items-center justify-center`;
const realMomentImageUrl =
  "https://images.pexels.com/photos/13801454/pexels-photo-13801454.jpeg?auto=compress&cs=tinysrgb&w=2400";

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

const flowInputVisuals: readonly IconType[] = [
  FileText,
  MessageCircle,
  Database,
  Clock3,
];

const personaVisuals: readonly IconType[] = [
  Building2,
  CircleDollarSign,
  Handshake,
  Mail,
];

const trustProofVisuals: readonly IconType[] = [
  ShieldCheck,
  Sparkles,
  FileText,
  CheckCircle2,
];

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
    realMoment: {
      title: "언제든 어디서든\n업무를 확인하세요.",
      imageAlt: "도심에서 스마트폰으로 업무를 확인하는 영업자",
    },
    flow: {
      eyebrow: "한 흐름",
      title: "흩어진 기록이 거래 성사까지 이어져요.",
      description:
        "명함, 메모, 엑셀, 일정이 고객 흐름으로 모이고 후속 연락과 거래 성사로 이어집니다.",
      inputs: ["명함", "메모", "엑셀", "일정"],
      recordLabel: "고객 흐름",
      followUpLabel: "후속 연락",
      resultLabel: "거래 성사",
    },
    persona: {
      eyebrow: "누구에게 맞나요",
      title: "관계를 들고 움직이는 영업자를 위해 만들었어요.",
      description:
        "고객 앞에서 필요한 정보를 바로 찾고, 미팅 후 정리를 미루고 싶지 않은 사람에게 맞췄어요.",
      personas: [
        {
          title: "B2B 영업",
          description: "회사, 담당자, 제품, 딜을 함께 봐야 하는 영업자",
        },
        {
          title: "보험 · 부동산 · 자동차",
          description: "상담 기록과 후속 연락을 놓치기 쉬운 영업자",
        },
        {
          title: "컨설턴트",
          description: "고객별 맥락을 오래 기억해야 하는 전문가",
        },
        {
          title: "개인 영업자",
          description: "회사 CRM보다 빠른 개인 정리가 필요한 사람",
        },
      ],
    },
    trustProof: {
      eyebrow: "신뢰 기준",
      title: "기록은 가볍게 다루지 않아요.",
      description:
        "OneHand는 개인 영업자의 고객 기록을 빠르게 다루되, 저장과 복구의 기준은 분명하게 둡니다.",
      proofs: [
        {
          title: "개인 데이터 기준",
          description: "사용자 본인 기록만 다루고 관리자 영역은 분리해요.",
        },
        {
          title: "AI는 초안만",
          description: "AI가 만든 내용은 사용자가 확인한 뒤 저장해요.",
        },
        {
          title: "엑셀 다운로드",
          description: "회사, 담당자, 제품, 딜 기록을 내려받을 수 있어요.",
        },
        {
          title: "휴지통 복구",
          description: "삭제한 기록은 7일 안에 다시 복구할 수 있어요.",
        },
      ],
    },
    final: {
      title: "오늘 바로 시작하세요.",
      description: "",
      primaryCta: "OneHand 시작",
      secondaryCta: "데모 요청",
    },
  },
  "en-US": {
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
    realMoment: {
      title: "Anytime, Anywhere.\nCheck your Work.",
      imageAlt: "A salesperson checking work on a smartphone in the city",
    },
    flow: {
      eyebrow: "One flow",
      title: "Scattered records become closed deals.",
      description:
        "Cards, notes, Excel, and calendar moments become customer flow, follow-up, and closed deals.",
      inputs: ["Cards", "Notes", "Excel", "Calendar"],
      recordLabel: "Customer flow",
      followUpLabel: "Follow-up",
      resultLabel: "Closed deal",
    },
    persona: {
      eyebrow: "Who it is for",
      title: "Made for relationship-driven sellers.",
      description:
        "For people who need customer context and a clear next step after every meeting.",
      personas: [
        {
          title: "B2B sales",
          description: "Manage companies, contacts, products, and deals together.",
        },
        {
          title: "Insurance, real estate, auto",
          description: "Keep consultation notes and follow-ups close.",
        },
        {
          title: "Consultants",
          description: "Keep long-running customer context in one place.",
        },
        {
          title: "Independent sellers",
          description: "Use a faster personal layer than company CRM.",
        },
      ],
    },
    trustProof: {
      eyebrow: "Trust basics",
      title: "Your records stay intentional.",
      description:
        "OneHand helps you move fast without turning customer records into automatic guesswork.",
      proofs: [
        {
          title: "Personal data boundary",
          description: "User records stay scoped to the person who owns them.",
        },
        {
          title: "AI drafts only",
          description: "AI output is reviewed by the user before it is saved.",
        },
        {
          title: "Excel download",
          description:
            "Companies, contacts, products, and deals can be exported.",
        },
        {
          title: "Trash recovery",
          description: "Deleted records can be restored within 7 days.",
        },
      ],
    },
    final: {
      title: "Get started today.",
      description: "",
      primaryCta: "Get OneHand",
      secondaryCta: "Request Demo",
    },
  },
};

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
  useLandingViewportHeightVariable();

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#111111]">
      <LandingScrollStyles />
      <PublicSiteHeader onLogin={onOpenLogin} />
      <LandingScrollProgressBar progress={scrollProgress} />
      <main>
        <HeroSection copy={copy} />
        <RealMomentSection copy={copy} />
        <FlowMotionSection copy={copy} />
        <PersonaSection copy={copy} />
        <TrustSection copy={copy} />
        <FinalSection copy={copy} />
      </main>
      <PublicSiteFooter compactDesktop showTopDivider />
      {isModalOpen ? children : null}
    </div>
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

function useLandingViewportHeightVariable() {
  useEffect(() => {
    const updateViewportHeight = () => {
      const userAgent = window.navigator.userAgent;
      const viewportHeightCandidates = [
        window.innerHeight,
        document.documentElement.clientHeight,
        window.visualViewport?.height ?? 0,
      ];
      const isIos =
        /iPad|iPhone|iPod/.test(userAgent) ||
        (window.navigator.platform === "MacIntel" &&
          window.navigator.maxTouchPoints > 1);
      const isSafari =
        /Safari/.test(userAgent) &&
        !/(CriOS|FxiOS|EdgiOS|OPiOS|DuckDuckGo|GSA)/.test(userAgent);
      const isNarrowTouchViewport =
        window.matchMedia("(max-width: 767px)").matches &&
        window.matchMedia("(pointer: coarse)").matches;
      const shouldUseScreenHeight =
        isIos && isSafari && isNarrowTouchViewport;

      if (shouldUseScreenHeight) {
        viewportHeightCandidates.push(window.screen.height);
      }

      const viewportHeight = Math.ceil(Math.max(...viewportHeightCandidates));

      document.documentElement.style.setProperty(
        "--landing-viewport-height",
        `${viewportHeight}px`,
      );
    };

    updateViewportHeight();
    window.addEventListener("orientationchange", updateViewportHeight);
    window.addEventListener("resize", updateViewportHeight);
    window.visualViewport?.addEventListener("resize", updateViewportHeight);
    window.visualViewport?.addEventListener("scroll", updateViewportHeight);

    return () => {
      window.removeEventListener("orientationchange", updateViewportHeight);
      window.removeEventListener("resize", updateViewportHeight);
      window.visualViewport?.removeEventListener("resize", updateViewportHeight);
      window.visualViewport?.removeEventListener("scroll", updateViewportHeight);
      document.documentElement.style.removeProperty(
        "--landing-viewport-height",
      );
    };
  }, []);
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

        .landing-container {
          width: calc(100% - 32px);
          max-width: 1100px;
          margin-inline: auto;
        }

        .landing-heading {
          max-width: 900px;
          margin-inline: auto;
        }

        .landing-copy {
          max-width: 680px;
          margin-inline: auto;
        }

        .landing-grid {
          max-width: 1040px;
          margin-inline: auto;
        }

        .landing-flow-stage {
          max-width: 1080px;
          margin-inline: auto;
        }

        .landing-flow-compact-grid {
          max-width: 360px;
          margin-inline: auto;
        }

        .landing-flow-input-cluster {
          max-width: 240px;
        }

        .landing-hero-heading {
          max-width: 1060px;
        }

        .landing-real-copy {
          max-width: 680px;
        }

        .landing-final-copy {
          max-width: 620px;
          margin-inline: auto;
        }

        .landing-hero-section-height,
        .landing-section-height,
        .landing-final-section-height {
          box-sizing: border-box;
          min-height: 100vh;
          min-height: 100svh;
          min-height: 100dvh;
          min-height: var(--landing-viewport-height, 100dvh);
        }

        .landing-section-height,
        .landing-final-section-height {
          padding-top: 56px;
        }

        @media (min-width: 640px) {
          .landing-container {
            width: calc(100% - 48px);
          }

          .landing-flow-input-cluster {
            max-width: 240px;
          }
        }

        @media (min-width: 1024px) {
          .landing-container {
            width: calc(100% - 64px);
          }

          .landing-hero-section-height {
            min-height: 100vh;
          }

          .landing-section-height {
            min-height: 100vh;
          }

          .landing-final-section-height {
            min-height: calc(100vh - 400px);
          }
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

        @keyframes landing-flow-float {
          0%, 100% {
            opacity: 0.88;
            transform: translateY(0);
          }

          50% {
            opacity: 1;
            transform: translateY(-6px);
          }
        }

        @keyframes landing-flow-line {
          0% {
            opacity: 0.25;
            transform: translateX(-8px);
          }

          50% {
            opacity: 1;
            transform: translateX(0);
          }

          100% {
            opacity: 0.25;
            transform: translateX(8px);
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

        .landing-flow-float {
          animation: landing-flow-float 3600ms ease-in-out infinite;
        }

        .landing-flow-line {
          animation: landing-flow-line 2200ms ease-in-out infinite;
        }

        .landing-flow-delay-1 {
          animation-delay: 180ms;
        }

        .landing-flow-delay-2 {
          animation-delay: 360ms;
        }

        .landing-flow-delay-3 {
          animation-delay: 540ms;
        }
      `}
    </style>
  );
}

function LandingScrollProgressBar({ progress }: { readonly progress: number }) {
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

function HeroSection({ copy }: { readonly copy: LandingCopy }) {
  const [activeHeroWordIndex, setActiveHeroWordIndex] = useState(0);
  const rotatingItemsCount = copy.hero.rotatingItems.length;
  const activeHeroItem =
    copy.hero.rotatingItems[activeHeroWordIndex % rotatingItemsCount] ??
    copy.hero.rotatingItems[0];
  const activeHeroWordStyle =
    heroRotatingWordStyles[
      activeHeroWordIndex % heroRotatingWordStyles.length
    ] ?? heroRotatingWordStyles[0];

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
    <section
      className={`${landingHeroSectionHeightClassName} flex items-center justify-center overflow-hidden bg-white text-center`}
    >
      <div className="landing-container flex flex-col items-center justify-center">
        {copy.hero.eyebrow ? (
          <p className="text-[12px] font-normal uppercase text-[#0075DE]">
            {copy.hero.eyebrow}
          </p>
        ) : null}
        <h1
          className={[
            "landing-hero-heading break-keep text-[36px] font-normal leading-[0.98] text-[#0f0f0f]",
            "sm:text-[52px] md:text-[64px] lg:text-[76px] xl:text-[78px]",
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

function RealMomentSection({ copy }: { readonly copy: LandingCopy }) {
  return (
    <section
      className={`relative ${landingSectionHeightClassName} overflow-hidden bg-white`}
    >
      <img
        alt={copy.realMoment.imageAlt}
        className="absolute inset-0 h-full w-full object-cover"
        loading="lazy"
        src={realMomentImageUrl}
        style={{ objectPosition: "58% center" }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.68)_0%,rgba(0,0,0,0.36)_43%,rgba(0,0,0,0.08)_100%)]"
      />
      <div
        className={`relative z-10 flex ${landingSectionHeightClassName} items-center`}
      >
        <div className="landing-container">
          <div className="landing-real-copy text-white">
            <h2 className="whitespace-pre-line break-keep text-[36px] font-normal leading-[1.04] sm:text-[52px] md:text-[64px] lg:text-[76px] xl:text-[78px]">
              {copy.realMoment.title}
            </h2>
          </div>
        </div>
      </div>
    </section>
  );
}

function FlowMotionSection({ copy }: { readonly copy: LandingCopy }) {
  const compactFlowItems = [
    ...copy.flow.inputs.map((label, index) => ({
      icon: flowInputVisuals[index] ?? FileText,
      isResult: false,
      label,
      tone: "bg-[#FAFAF8]",
    })),
    {
      icon: Users,
      isResult: false,
      label: copy.flow.recordLabel,
      tone: "bg-white",
    },
    {
      icon: Mail,
      isResult: false,
      label: copy.flow.followUpLabel,
      tone: "bg-white",
    },
    {
      icon: CircleDollarSign,
      isResult: true,
      label: copy.flow.resultLabel,
      tone: "bg-[#111827]",
    },
  ];

  return (
    <section className={`${landingCenteredSectionClassName} bg-white`}>
      <div className="landing-container text-center">
        <p className="text-[12px] font-normal uppercase text-[#6B7280]">
          {copy.flow.eyebrow}
        </p>
        <h2 className="landing-heading mt-3 break-keep text-[36px] font-normal leading-[1.05] text-[#0f0f0f] sm:text-[52px] md:text-[64px] lg:text-[76px] xl:text-[78px]">
          {copy.flow.title}
        </h2>
        <p className="landing-copy mt-5 break-keep text-[16px] font-normal leading-7 text-[#555550] sm:text-[18px] sm:leading-8">
          {copy.flow.description}
        </p>

        <div className="landing-flow-compact-grid mt-8 grid grid-cols-2 gap-3 lg:hidden">
          {compactFlowItems.map((item, index) => (
            <FlowCompactItem
              icon={item.icon}
              index={index}
              isResult={item.isResult}
              key={item.label}
              label={item.label}
              tone={item.tone}
            />
          ))}
        </div>

        <div className="landing-flow-stage mt-12 hidden lg:block">
          <div className="grid items-center justify-center gap-4 lg:grid-cols-[240px_48px_300px_48px_300px]">
            <FlowInputCluster copy={copy} />
            <FlowArrow delayClassName="" />
            <FlowCustomerCard copy={copy} />
            <FlowArrow delayClassName="landing-flow-delay-1" />
            <div className="grid gap-3">
              <FlowOutcomeCard
                delayClassName="landing-flow-delay-2"
                icon={Mail}
                label={copy.flow.followUpLabel}
              />
              <FlowOutcomeCard
                delayClassName="landing-flow-delay-3"
                icon={CircleDollarSign}
                isResult
                label={copy.flow.resultLabel}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FlowCompactItem({
  icon: Icon,
  index,
  isResult = false,
  label,
  tone,
}: {
  readonly icon: IconType;
  readonly index: number;
  readonly isResult?: boolean;
  readonly label: string;
  readonly tone: string;
}) {
  return (
    <div
      className={[
        `landing-flow-float landing-flow-delay-${index % 4} flex min-h-[72px] items-center gap-3 rounded-[8px] border p-3 text-left shadow-[0_12px_32px_rgba(17,24,39,0.05)]`,
        isResult
          ? "col-span-2 border-[#111827] bg-[#111827] text-white"
          : `border-[#E5E7EB] ${tone} text-[#111827]`,
      ].join(" ")}
    >
      <span
        className={[
          "grid h-9 w-9 shrink-0 place-items-center rounded-[8px]",
          isResult ? "bg-white/12 text-white" : "bg-white text-[#374151]",
        ].join(" ")}
      >
        <Icon className="h-[18px] w-[18px]" />
      </span>
      <span className="break-keep text-[13px] font-normal leading-5">
        {label}
      </span>
    </div>
  );
}

function FlowInputCluster({ copy }: { readonly copy: LandingCopy }) {
  return (
    <div className="landing-flow-input-cluster grid w-full grid-cols-1 gap-3">
      {copy.flow.inputs.map((input, index) => {
        const Icon = flowInputVisuals[index] ?? FileText;

        return (
          <div
            className={`landing-flow-float landing-flow-delay-${index} flex min-h-[76px] items-center gap-3 rounded-[8px] border border-[#E5E7EB] bg-[#FAFAF8] px-4 text-left shadow-[0_14px_40px_rgba(17,24,39,0.06)]`}
            key={input}
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[8px] bg-white text-[#374151]">
              <Icon className="h-5 w-5" />
            </span>
            <span className="text-[15px] font-normal text-[#111827]">
              {input}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function FlowArrow({ delayClassName }: { readonly delayClassName: string }) {
  return (
    <span
      aria-hidden="true"
      className="flex w-full rotate-90 items-center justify-center lg:rotate-0"
    >
      <ArrowRight
        className={`landing-flow-line ${delayClassName} h-6 w-6 text-[#9CA3AF]`}
      />
    </span>
  );
}

function FlowCustomerCard({ copy }: { readonly copy: LandingCopy }) {
  return (
    <div className="landing-flow-float landing-flow-delay-1 rounded-[8px] border border-[#D3D1CB] bg-white p-5 text-left shadow-[0_18px_55px_rgba(17,24,39,0.08)]">
      <div className="flex items-center gap-3">
        <span className="grid h-12 w-12 place-items-center rounded-[8px] bg-[#111827] text-white">
          <Users className="h-6 w-6" />
        </span>
        <div>
          <h3 className="break-keep text-[18px] font-normal leading-6 text-[#111827]">
            {copy.flow.recordLabel}
          </h3>
          <div className="mt-1 h-2 w-24 rounded-full bg-[#E5E7EB]" />
        </div>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-2">
        {copy.flow.inputs.map((input) => (
          <span
            className="rounded-[6px] border border-[#E5E7EB] bg-[#FAFAF8] px-3 py-2 text-[12px] font-normal text-[#4B5563]"
            key={input}
          >
            {input}
          </span>
        ))}
      </div>
    </div>
  );
}

function FlowOutcomeCard({
  delayClassName,
  icon: Icon,
  isResult = false,
  label,
}: {
  readonly delayClassName: string;
  readonly icon: IconType;
  readonly isResult?: boolean;
  readonly label: string;
}) {
  return (
    <div
      className={[
        `landing-flow-float ${delayClassName} flex min-h-[94px] items-center gap-4 rounded-[8px] border px-5 text-left shadow-[0_18px_55px_rgba(17,24,39,0.08)]`,
        isResult
          ? "border-[#111827] bg-[#111827] text-white"
          : "border-[#D3D1CB] bg-white text-[#111827]",
      ].join(" ")}
    >
      <span
        className={[
          "grid h-12 w-12 shrink-0 place-items-center rounded-[8px]",
          isResult ? "bg-white/12 text-white" : "bg-[#FAFAF8] text-[#111827]",
        ].join(" ")}
      >
        <Icon className="h-6 w-6" />
      </span>
      <div>
        <span className="break-keep text-[18px] font-normal leading-6">
          {label}
        </span>
        <div
          className={[
            "mt-2 h-2 w-20 rounded-full",
            isResult ? "bg-white/20" : "bg-[#E5E7EB]",
          ].join(" ")}
        />
      </div>
    </div>
  );
}

function PersonaSection({ copy }: { readonly copy: LandingCopy }) {
  return (
    <section className={`${landingCenteredSectionClassName} bg-white`}>
      <div className="landing-container text-center">
        <p className="text-[12px] font-normal uppercase text-[#6B7280]">
          {copy.persona.eyebrow}
        </p>
        <h2 className="landing-heading mt-3 break-keep text-[36px] font-normal leading-[1.05] text-[#0f0f0f] sm:text-[52px] md:text-[64px] lg:text-[76px] xl:text-[78px]">
          {copy.persona.title}
        </h2>
        <p className="landing-copy mt-4 break-keep text-[15px] font-normal leading-6 text-[#555550] sm:mt-5 sm:text-[18px] sm:leading-8">
          {copy.persona.description}
        </p>

        <div className="landing-grid mt-8 grid grid-cols-2 gap-3 sm:mt-10">
          {copy.persona.personas.map((persona, index) => {
            const Icon = personaVisuals[index] ?? Users;

            return (
              <article
                className="flex min-h-[136px] flex-col rounded-[8px] border border-[#E5E7EB] bg-white p-3 text-left sm:min-h-[132px] sm:flex-row sm:items-start sm:gap-4 sm:p-5"
                key={persona.title}
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[8px] bg-[#F1F2F0] text-[#374151] sm:h-11 sm:w-11">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="mt-3 break-keep text-[15px] font-normal leading-5 text-[#111827] sm:mt-0 sm:text-[19px] sm:leading-normal">
                    {persona.title}
                  </h3>
                  <p className="mt-1.5 break-keep text-[12px] font-normal leading-5 text-[#6B7280] sm:mt-2 sm:text-[14px] sm:leading-6">
                    {persona.description}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function TrustSection({ copy }: { readonly copy: LandingCopy }) {
  return (
    <section className={`${landingCenteredSectionClassName} bg-white`}>
      <div className="landing-container text-center">
        <p className="text-[12px] font-normal uppercase text-[#6B7280]">
          {copy.trustProof.eyebrow}
        </p>
        <h2 className="landing-heading mt-3 break-keep text-[36px] font-normal leading-[1.05] text-[#0f0f0f] sm:text-[52px] md:text-[64px] lg:text-[76px] xl:text-[78px]">
          {copy.trustProof.title}
        </h2>
        <p className="landing-copy mt-5 break-keep text-[16px] font-normal leading-7 text-[#555550] sm:text-[18px] sm:leading-8">
          {copy.trustProof.description}
        </p>

        <div className="landing-grid mt-10 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {copy.trustProof.proofs.map((proof, index) => {
            const Icon = trustProofVisuals[index] ?? ShieldCheck;

            return (
              <article
                className="min-h-[176px] rounded-[8px] border border-[#E5E7EB] bg-[#FAFAF8] p-4 text-left sm:p-5"
                key={proof.title}
              >
                <span className="grid h-10 w-10 place-items-center rounded-[8px] bg-white text-[#111827]">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 break-keep text-[15px] font-normal leading-5 text-[#111827] sm:mt-5 sm:text-[17px] sm:leading-normal">
                  {proof.title}
                </h3>
                <p className="mt-2 break-keep text-[12px] font-normal leading-5 text-[#6B7280] sm:text-[13px] sm:leading-6">
                  {proof.description}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function FinalSection({ copy }: { readonly copy: LandingCopy }) {
  const publicSitePath = usePublicSitePath();

  return (
    <section
      className={`${landingFinalSectionHeightClassName} flex flex-col bg-white`}
    >
      <div className="flex flex-1 items-center justify-center text-center">
        <div className="landing-container">
          <h2 className="break-keep text-[36px] font-normal leading-tight text-[#0f0f0f] sm:text-[52px] md:text-[64px] lg:text-[76px] xl:text-[78px]">
            {copy.final.title}
          </h2>
          {copy.final.description ? (
            <p className="landing-final-copy mt-4 break-keep text-[16px] font-normal leading-7 text-[#555550]">
              {copy.final.description}
            </p>
          ) : null}
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link
              className="inline-flex h-11 items-center gap-2 rounded-[6px] bg-[#4880EE] px-5 text-[15px] font-normal text-white hover:bg-[#336FE0]"
              to={publicSitePath("/signup")}
            >
              {copy.final.primaryCta}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              className="inline-flex h-11 items-center rounded-[6px] bg-white px-5 text-[15px] font-normal text-[#4880EE] hover:bg-[#EFF6FF]"
              to={publicSitePath("/contact")}
            >
              {copy.final.secondaryCta}
            </Link>
          </div>
        </div>
      </div>

    </section>
  );
}
