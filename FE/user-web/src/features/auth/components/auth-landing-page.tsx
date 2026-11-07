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
import {
  FinalSection,
  PublicSiteFooter,
  PublicSiteHeader,
} from "@/features/public-site";
import {
  getPublicSiteCopyLanguage,
  usePublicSiteLanguage,
  type PublicSiteCopyLanguage,
} from "@/features/public-site/i18n/public-site-language";
import { usePublicProductImage } from "@/features/public-site/use-public-product-image";

type AuthLandingPageProps = {
  readonly children?: ReactNode;
  readonly isModalOpen: boolean;
  readonly onOpenLogin: () => void;
};

type IconType = typeof MessageCircle;

type HeroRotatingItem = {
  readonly label: string;
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
    readonly title: string;
    readonly description: string;
    readonly inputs: readonly [string, string, string, string];
    readonly recordLabel: string;
    readonly followUpLabel: string;
    readonly resultLabel: string;
  };
  readonly persona: {
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
const landingCenteredSectionClassName =
  `${landingSectionHeightClassName} flex items-center justify-center`;

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
        { label: "OneHand CRM" },
        { label: "영업 CRM" },
        { label: "마케팅 CRM" },
        { label: "보험 CRM" },
        { label: "부동산 CRM" },
        { label: "간편한 CRM" },
      ],
    },
    realMoment: {
      title: "고객과 업무 기록을\n한눈에 확인해요.",
      imageAlt: "신규 고객 상담 업무 목록을 단계별로 보여주는 실제 OneHand CRM 칸반 예시",
    },
    flow: {
      title: "남긴 기록을, 다음 업무에서 다시 꺼내요.",
      description:
        "고객과 업무 정보를 기록하고, 필요할 때 찾아 확인해요.",
      inputs: ["고객 정보", "회사 정보", "담당자", "상담 내용"],
      recordLabel: "업무 기록",
      followUpLabel: "기록 찾기",
      resultLabel: "업무에 활용",
    },
    persona: {
      title: "고객과의 관계를 직접 챙기는 사람을 위해.",
      description:
        "어떤 일을 하든, 다시 찾아볼 정보가 있다면 기록부터 정리해 보세요.",
      personas: [
        {
          title: "B2B 고객 관리",
          description: "회사와 담당자 정보를 정리하고 싶은 사람",
        },
        {
          title: "보험 · 부동산 · 자동차",
          description: "고객별로 확인할 정보를 모아두고 싶은 사람",
        },
        {
          title: "프리랜서 · 컨설턴트",
          description: "여러 고객의 업무 정보를 구분하고 싶은 사람",
        },
        {
          title: "혼자 일하는 사람",
          description: "기억에 의존하던 고객 관리를 정리하고 싶은 사람",
        },
      ],
    },
    trustProof: {
      title: "기록하고, 고치고, 다시 찾는 일을 간단하게.",
      description:
        "자주 하는 기록 관리에 필요한 기능을 한곳에서 사용해요.",
      proofs: [
        {
          title: "목록에서 바로 수정",
          description: "바뀐 내용을 현재 화면에서 고쳐요.",
        },
        {
          title: "보기 전환",
          description: "이용할 수 있는 보기 중 필요한 화면을 선택해요.",
        },
        {
          title: "필요한 기록 검색",
          description: "보고 있는 목록에서 원하는 기록을 찾아요.",
        },
        {
          title: "즐겨찾기",
          description: "자주 사용하는 보기를 다시 열기 쉽게 모아둬요.",
        },
      ],
    },
    final: {
      title: "첫 기록부터 시작해 보세요.",
      description: "",
      primaryCta: "OneHand CRM 시작",
      secondaryCta: "데모 요청",
    },
  },
  "en-US": {
    hero: {
      eyebrow: "",
      rotatingItems: [
        { label: "OneHand CRM" },
        { label: "Sales CRM" },
        { label: "Marketing CRM" },
        { label: "Insurance CRM" },
        { label: "Real Estate CRM" },
        { label: "Simple CRM" },
      ],
    },
    realMoment: {
      title: "Your customers and work,\nat a glance.",
      imageAlt: "Actual OneHand CRM work-list kanban showing illustrative customer inquiries by stage",
    },
    flow: {
      title: "Keep records ready for your next conversation.",
      description:
        "Record customer and work information, then find it when you need it.",
      inputs: ["Customers", "Companies", "Contacts", "Notes"],
      recordLabel: "Work records",
      followUpLabel: "Find a record",
      resultLabel: "Use it at work",
    },
    persona: {
      title: "For people who look after customer relationships.",
      description:
        "Keep the information you need to return to, whatever your work involves.",
      personas: [
        {
          title: "B2B customer work",
          description: "For people organizing company and contact information",
        },
        {
          title: "Property · Insurance · Auto",
          description: "For people keeping information for each customer",
        },
        {
          title: "Freelancers · Consultants",
          description: "For people managing information across clients",
        },
        {
          title: "Independent professionals",
          description: "For people moving customer details out of memory",
        },
      ],
    },
    trustProof: {
      title: "Capture, update, and find your records.",
      description:
        "Keep everyday record management close to the work.",
      proofs: [
        {
          title: "Edit in the table",
          description: "Update supported information in the current view.",
        },
        {
          title: "Switch views",
          description: "Choose from the views available for your records.",
        },
        {
          title: "Search your records",
          description:
            "Find a record in the collection you are viewing.",
        },
        {
          title: "Favorites",
          description: "Keep frequently used views easy to open again.",
        },
      ],
    },
    final: {
      title: "Start with your first record.",
      description: "",
      primaryCta: "Get OneHand CRM",
      secondaryCta: "Request a Demo",
    },
  },
};

// 기능 : 인증 랜딩 페이지를 렌더링합니다.
export function AuthLandingPage({
  children,
  isModalOpen,
  onOpenLogin,
}: AuthLandingPageProps) {
  // 1. 처리 흐름에 필요한 { language } 값을 준비한다.
  const { language } = usePublicSiteLanguage();
  // 2. 이후 단계에서 사용할 copyLanguage 값을 준비한다.
  const copyLanguage = getPublicSiteCopyLanguage(language);
  // 3. 처리 흐름에 필요한 scrollProgress 값을 준비한다.
  const scrollProgress = useLandingScrollProgress();
  // 4. 이후 단계에서 사용할 copy 값을 준비한다.
  const copy = landingCopyByLanguage[copyLanguage];
  // 5. 현재 단계에서 필요한 동작을 실행한다.
  useLandingViewportHeightVariable();

  // 6. 계산된 결과를 호출자에게 반환한다.
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
        <FinalSection copy={copy.final} />
      </main>
      <PublicSiteFooter compactDesktop showTopDivider />
      {isModalOpen ? children : null}
    </div>
  );
}

// 기능 : Landing Scroll Progress hook으로 상태와 동작을 제공합니다.
function useLandingScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // 1. 현재 단계에서 필요한 동작을 실행한다.
    document.documentElement.classList.add("landing-scrollbar-hidden");
    // 2. 현재 단계에서 필요한 동작을 실행한다.
    document.body.classList.add("landing-scrollbar-hidden");

    // 기능 : update Progress 정보를 수정합니다.
    // 3. 이후 단계에서 사용할 updateProgress 값을 준비한다.
    const updateProgress = () => {
      const scrollableHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const nextProgress =
        scrollableHeight > 0
          ? Math.min(1, Math.max(0, window.scrollY / scrollableHeight))
          : 0;

      setProgress(nextProgress);
    };

    // 4. 현재 단계에서 필요한 동작을 실행한다.
    updateProgress();
    // 5. 브라우저 이벤트 listener를 등록하거나 정리한다.
    window.addEventListener("scroll", updateProgress, { passive: true });
    // 6. 브라우저 이벤트 listener를 등록하거나 정리한다.
    window.addEventListener("resize", updateProgress);

    // 7. 계산된 결과를 호출자에게 반환한다.
    return () => {
      // 1. 브라우저 이벤트 listener를 등록하거나 정리한다.
      window.removeEventListener("scroll", updateProgress);
      // 2. 브라우저 이벤트 listener를 등록하거나 정리한다.
      window.removeEventListener("resize", updateProgress);
      // 3. 현재 단계에서 필요한 동작을 실행한다.
      document.documentElement.classList.remove("landing-scrollbar-hidden");
      // 4. 현재 단계에서 필요한 동작을 실행한다.
      document.body.classList.remove("landing-scrollbar-hidden");
    };
  }, []);

  return progress;
}

// 기능 : Landing Viewport Height Variable hook으로 상태와 동작을 제공합니다.
function useLandingViewportHeightVariable() {
  useEffect(() => {
    // 기능 : update Viewport Height 정보를 수정합니다.
    // 1. 이후 단계에서 사용할 updateViewportHeight 값을 준비한다.
    const updateViewportHeight = () => {
      // 1. 이후 단계에서 사용할 userAgent 값을 준비한다.
      const userAgent = window.navigator.userAgent;
      // 2. 이후 단계에서 사용할 viewportHeightCandidates 값을 준비한다.
      const viewportHeightCandidates = [
        window.innerHeight,
        document.documentElement.clientHeight,
        window.visualViewport?.height ?? 0,
      ];
      // 3. 이후 단계에서 사용할 isIos 값을 준비한다.
      const isIos =
        /iPad|iPhone|iPod/.test(userAgent) ||
        (window.navigator.platform === "MacIntel" &&
          window.navigator.maxTouchPoints > 1);
      // 4. 이후 단계에서 사용할 isSafari 값을 준비한다.
      const isSafari =
        /Safari/.test(userAgent) &&
        !/(CriOS|FxiOS|EdgiOS|OPiOS|DuckDuckGo|GSA)/.test(userAgent);
      // 5. 이후 단계에서 사용할 isNarrowTouchViewport 값을 준비한다.
      const isNarrowTouchViewport =
        window.matchMedia("(max-width: 767px)").matches &&
        window.matchMedia("(pointer: coarse)").matches;
      // 6. 이후 단계에서 사용할 shouldUseScreenHeight 값을 준비한다.
      const shouldUseScreenHeight =
        isIos && isSafari && isNarrowTouchViewport;

      // 7. 조건을 확인해 필요한 분기 처리를 수행한다.
      if (shouldUseScreenHeight) {
        viewportHeightCandidates.push(window.screen.height);
      }

      // 8. 이후 단계에서 사용할 viewportHeight 값을 준비한다.
      const viewportHeight = Math.ceil(Math.max(...viewportHeightCandidates));

      // 9. 화면 상태를 현재 흐름에 맞게 갱신한다.
      document.documentElement.style.setProperty(
        "--landing-viewport-height",
        `${viewportHeight}px`,
      );
    };

    // 2. 현재 단계에서 필요한 동작을 실행한다.
    updateViewportHeight();
    // 3. 브라우저 이벤트 listener를 등록하거나 정리한다.
    window.addEventListener("orientationchange", updateViewportHeight);
    // 4. 브라우저 이벤트 listener를 등록하거나 정리한다.
    window.addEventListener("resize", updateViewportHeight);
    // 5. 브라우저 이벤트 listener를 등록하거나 정리한다.
    window.visualViewport?.addEventListener("resize", updateViewportHeight);
    // 6. 브라우저 이벤트 listener를 등록하거나 정리한다.
    window.visualViewport?.addEventListener("scroll", updateViewportHeight);

    // 7. 계산된 결과를 호출자에게 반환한다.
    return () => {
      // 1. 브라우저 이벤트 listener를 등록하거나 정리한다.
      window.removeEventListener("orientationchange", updateViewportHeight);
      // 2. 브라우저 이벤트 listener를 등록하거나 정리한다.
      window.removeEventListener("resize", updateViewportHeight);
      // 3. 브라우저 이벤트 listener를 등록하거나 정리한다.
      window.visualViewport?.removeEventListener("resize", updateViewportHeight);
      // 4. 브라우저 이벤트 listener를 등록하거나 정리한다.
      window.visualViewport?.removeEventListener("scroll", updateViewportHeight);
      // 5. 현재 단계에서 필요한 동작을 실행한다.
      document.documentElement.style.removeProperty(
        "--landing-viewport-height",
      );
    };
  }, []);
}

// 기능 : LandingScrollStyles 컴포넌트를 렌더링합니다.
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

// 기능 : LandingScrollProgressBar 컴포넌트를 렌더링합니다.
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

// 기능 : HeroSection section UI를 렌더링합니다.
function HeroSection({ copy }: { readonly copy: LandingCopy }) {
  // 1. 처리 흐름에 필요한 [activeHeroWordIndex, setActiveHeroWordIndex] 값을 준비한다.
  const [activeHeroWordIndex, setActiveHeroWordIndex] = useState(0);
  // 2. 이후 단계에서 사용할 rotatingItemsCount 값을 준비한다.
  const rotatingItemsCount = copy.hero.rotatingItems.length;
  // 3. 이후 단계에서 사용할 activeHeroItem 값을 준비한다.
  const activeHeroItem =
    copy.hero.rotatingItems[activeHeroWordIndex % rotatingItemsCount] ??
    copy.hero.rotatingItems[0];
  // 4. 이후 단계에서 사용할 activeHeroWordStyle 값을 준비한다.
  const activeHeroWordStyle =
    heroRotatingWordStyles[
      activeHeroWordIndex % heroRotatingWordStyles.length
    ] ?? heroRotatingWordStyles[0];

  // 5. 화면 상태를 현재 흐름에 맞게 갱신한다.
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

  // 6. 계산된 결과를 호출자에게 반환한다.
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
          </span>
        </h1>
      </div>
    </section>
  );
}

// 기능 : RealMomentSection section UI를 렌더링합니다.
function RealMomentSection({ copy }: { readonly copy: LandingCopy }) {
  const { language } = usePublicSiteLanguage();
  const productImage = usePublicProductImage("/public-site/product/overview.jpg", language);
  return (
    <section
      className={`relative ${landingSectionHeightClassName} overflow-hidden bg-white`}
    >
      <img
        alt={copy.realMoment.imageAlt}
        className="absolute inset-0 h-full w-full object-cover"
        loading="lazy"
        src={productImage}
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

// 기능 : FlowMotionSection section UI를 렌더링합니다.
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
        <h2 className="landing-heading break-keep text-[36px] font-normal leading-[1.05] text-[#0f0f0f] sm:text-[52px] md:text-[64px] lg:text-[76px] xl:text-[78px]">
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

// 기능 : FlowCompactItem 컴포넌트를 렌더링합니다.
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

// 기능 : FlowInputCluster 컴포넌트를 렌더링합니다.
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

// 기능 : FlowArrow 컴포넌트를 렌더링합니다.
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

// 기능 : FlowCustomerCard 컴포넌트를 렌더링합니다.
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

// 기능 : FlowOutcomeCard 컴포넌트를 렌더링합니다.
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

// 기능 : PersonaSection section UI를 렌더링합니다.
function PersonaSection({ copy }: { readonly copy: LandingCopy }) {
  return (
    <section className={`${landingCenteredSectionClassName} bg-white`}>
      <div className="landing-container text-center">
        <h2 className="landing-heading break-keep text-[36px] font-normal leading-[1.05] text-[#0f0f0f] sm:text-[52px] md:text-[64px] lg:text-[76px] xl:text-[78px]">
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

// 기능 : TrustSection section UI를 렌더링합니다.
function TrustSection({ copy }: { readonly copy: LandingCopy }) {
  return (
    <section className={`${landingCenteredSectionClassName} bg-white`}>
      <div className="landing-container text-center">
        <h2 className="landing-heading break-keep text-[36px] font-normal leading-[1.05] text-[#0f0f0f] sm:text-[52px] md:text-[64px] lg:text-[76px] xl:text-[78px]">
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
