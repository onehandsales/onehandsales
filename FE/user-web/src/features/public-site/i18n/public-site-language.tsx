/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  publicSiteLanguageStorageKey,
  resolvePublicSiteLanguage,
} from "@/features/public-site/i18n/public-site-locale-routes";

export { publicSiteLanguageStorageKey } from "@/features/public-site/i18n/public-site-locale-routes";

export type PublicSiteLanguage =
  | "ko"
  | "en-US"
  | "en-CA";

export type PublicSiteCopyLanguage = Exclude<
  PublicSiteLanguage,
  "en-CA"
>;

type PublicSiteLanguageContextValue = {
  readonly language: PublicSiteLanguage;
  readonly setLanguage: (language: PublicSiteLanguage) => void;
  readonly copy: PublicSiteCopy;
};

type MenuColumnCopy = readonly [string, ...string[]];

type PublicSiteCopy = {
  readonly common: {
    readonly logoAria: string;
    readonly menuAria: string;
    readonly nav: {
      readonly product: string;
      readonly solutions: string;
      readonly resources: string;
      readonly pricing: string;
      readonly contact: string;
      readonly freeCta: string;
      readonly login: string;
    };
    readonly productMenuColumns: readonly MenuColumnCopy[];
    readonly solutionMenuColumns: readonly MenuColumnCopy[];
    readonly resourceMenuColumns: readonly MenuColumnCopy[];
    readonly footerColumns: readonly MenuColumnCopy[];
    readonly cookieSettings: string;
    readonly languageAria: string;
    readonly footerSocialAria: string;
    readonly copyright: string;
  };
  readonly landing: {
    readonly heroTitle: readonly [string, string];
    readonly heroDescription: string;
    readonly primaryCta: string;
    readonly secondaryCta: string;
    readonly customerStrip: string;
    readonly sectionWork: string;
    readonly sectionAssistants: string;
    readonly sectionWorkspace: string;
    readonly quote: string;
    readonly trustedTitle: string;
    readonly finalCta: string;
    readonly finalPrimary: string;
    readonly finalSecondary: string;
  };
  readonly pricing: {
    readonly title: string;
    readonly description: string;
    readonly tags: readonly string[];
    readonly mediaCaptions: readonly string[];
    readonly mediaAlts: readonly string[];
    readonly billingMonthly: string;
    readonly billingAnnual: string;
    readonly currency: string;
    readonly priceLabels: readonly string[];
    readonly pricePeriod: string;
    readonly recommended: string;
    readonly aiLabel: string;
    readonly aiTitle: string;
    readonly aiDescription: string;
    readonly aiCta: string;
    readonly aiImageAlt: string;
    readonly aiAvatarLabels: readonly string[];
    readonly setupTitle: string;
    readonly setupDescription: string;
    readonly featuresTitle: string;
    readonly featureColumn: string;
    readonly faqTitle: string;
    readonly finalTitle: string;
    readonly includedValues: readonly string[];
    readonly emptyCell: string;
    readonly plans: readonly {
      readonly name: string;
      readonly description: string;
      readonly cta: string;
      readonly features: readonly string[];
    }[];
    readonly comparisonGroups: readonly {
      readonly title: string;
      readonly rows: readonly (readonly string[])[];
    }[];
    readonly faqs: readonly string[];
  };
  readonly contact: {
    readonly title: readonly [string, string];
    readonly description: string;
    readonly trustedLabel: string;
    readonly companies: readonly string[];
    readonly quoteCompany: string;
    readonly quote: string;
    readonly quotePerson: string;
    readonly quoteRole: string;
    readonly labels: {
      readonly firstName: string;
      readonly lastName: string;
      readonly email: string;
      readonly title: string;
      readonly company: string;
      readonly companySize: string;
      readonly region: string;
      readonly phone: string;
      readonly reason: string;
      readonly detail: string;
    };
    readonly placeholders: {
      readonly firstName: string;
      readonly lastName: string;
      readonly email: string;
      readonly title: string;
      readonly company: string;
      readonly companySize: string;
      readonly region: string;
      readonly phone: string;
      readonly reason: string;
      readonly detail: string;
    };
    readonly marketingAgreement: string;
    readonly submit: string;
    readonly finePrint: string;
    readonly supportPrefix: string;
    readonly supportSuffix: string;
    readonly testimonials: readonly {
      readonly company: string;
      readonly quote: string;
      readonly person: string;
      readonly role: string;
    }[];
  };
};

export const publicSiteLanguageOptions: readonly {
  readonly value: PublicSiteLanguage;
  readonly labels: Record<PublicSiteCopyLanguage, string>;
  readonly htmlLang: string;
}[] = [
  {
    value: "ko",
    labels: { ko: "한국", "en-US": "Korea" },
    htmlLang: "ko-KR",
  },
  {
    value: "en-US",
    labels: { ko: "미국", "en-US": "United States" },
    htmlLang: "en-US",
  },
  {
    value: "en-CA",
    labels: { ko: "캐나다", "en-US": "Canada" },
    htmlLang: "en-CA",
  },
  // Future expansion:
  // { value: "ja", label: "日本語", htmlLang: "ja-JP" },
  // { value: "en-GB", label: "English (UK)", htmlLang: "en-GB" },
  // { value: "en-SG", label: "English (Singapore)", htmlLang: "en-SG" },
  // { value: "en-AU", label: "English (Australia)", htmlLang: "en-AU" },
];

const publicSiteHtmlLangByLanguage: Record<PublicSiteLanguage, string> = {
  ko: "ko-KR",
  "en-US": "en-US",
  "en-CA": "en-CA",
};

const publicSiteCopy: Record<PublicSiteLanguage, PublicSiteCopy> = {
  ko: {
    common: {
      logoAria: "OneHand 홈",
      menuAria: "메뉴 열기",
      nav: {
        product: "제품",
        solutions: "용도별",
        resources: "리소스",
        pricing: "요금제",
        contact: "문의하기",
        freeCta: "OneHand 시작",
        login: "로그인",
      },
      productMenuColumns: [
        ["제품 소개", "OneHand란?", "제품 소개"],
        ["주요 기능", "주요 기능 소개", "고객 관리", "영업 파이프라인", "일정/팔로업", "활동 기록"],
        ["AI/Data", "AI 영업 도우미", "리포트", "엑셀 가져오기/내보내기"],
      ],
      solutionMenuColumns: [
        ["전체", "전체 보기"],
        ["방식별", "개인", "현장 B2B"],
        ["업종별", "부동산 중개", "보험/자동차"],
      ],
      resourceMenuColumns: [
        ["도움받기", "도움말", "자주 묻는 질문", "문의하기"],
      ],
      footerColumns: [
        ["회사", "OneHand 소개", "보안", "서비스 이용약관", "개인정보 처리방침"],
        ["제품", "제품 소개", "주요 기능", "요금제", "다운로드"],
        ["리소스", "도움말", "자주 묻는 질문", "문의하기"],
        ["용도별", "개인", "현장 B2B", "부동산 중개", "보험/자동차"],
      ],
      cookieSettings: "쿠키 설정",
      languageAria: "지역 선택",
      footerSocialAria: "OneHand 소셜 링크",
      copyright: "© 2026 OneHand Labs, Inc.",
    },
    landing: {
      heroTitle: ["현장 영업자가", "고객을 놓치지 않는 곳"],
      heroDescription:
        "개인영업, 부동산 중개, B2B 외근, 보험·자동차 영업의 고객, 명함, 미팅, 일정, 딜, 팔로업을 한 화면에서 연결하세요.",
      primaryCta: "OneHand 시작",
      secondaryCta: "흐름 보기",
      customerStrip: "개인영업, 부동산 중개, B2B 현장 영업을 위해 설계한 CRM",
      sectionWork: "고객 미팅과 후속 연락을 하루 종일 놓치지 마세요.",
      sectionAssistants: "필요할 때 언제든지 요청하세요.",
      sectionWorkspace: "고객, 일정, 미팅노트, 딜을 한곳에서 관리하세요.",
      quote: "“AI보다 먼저, 영업의 흐름이 정리됩니다.”",
      trustedTitle: "혼자서도 영업 흐름을 놓치지 않는 사람들을 위해.",
      finalCta: "오늘 바로 시작하세요.",
      finalPrimary: "OneHand 시작",
      finalSecondary: "데모 요청",
    },
    pricing: {
      title: "영업 운영에 필요한 하나의 도구.",
      description:
        "1인 영업자, 부동산 중개사, 현장 B2B 영업자와 작은 팀의 파이프라인까지 필요한 기능을 단계별로 선택하세요.",
      tags: ["딜", "고객", "일정", "회의록", "검색", "AI"],
      mediaCaptions: ["고객 상담", "업무 설계", "팀 운영"],
      mediaAlts: ["고객 상담 장면", "화이트보드 업무 설계", "팀 발표와 회의"],
      billingMonthly: "월간 결제",
      billingAnnual: "연간 결제 20% 절약",
      currency: "KRW 기준",
      priceLabels: ["₩0", "₩14,000", "₩30,000", ""],
      pricePeriod: "/월",
      recommended: "추천",
      aiLabel: "AI 옵션",
      aiTitle: "중요한 업무를 위한 AI 영업 도우미.",
      aiDescription:
        "회의록 요약, 다음 행동 추천, 팔로업 알림을 파이프라인과 연결합니다.",
      aiCta: "AI 기능 알아보기",
      aiImageAlt: "회의실에서 팀이 영업 계획을 공유하는 모습",
      aiAvatarLabels: ["딜", "회", "일"],
      setupTitle: "도입 지원 포함",
      setupDescription:
        "고객 데이터 가져오기, 영업 단계 정리, 개인과 작은 팀의 온보딩을 함께 설계합니다.",
      featuresTitle: "요금제와 기능",
      featureColumn: "기능",
      faqTitle: "자주 묻는 질문",
      finalTitle: "맞는 요금제로 시작해요.",
      includedValues: ["포함"],
      emptyCell: "—",
      plans: [
        {
          name: "무료",
          description: "처음 영업 기록을 정리하는 개인에게",
          cta: "시작하기",
          features: ["회사/담당자 기본 관리", "딜 30개", "일정과 회의록", "모바일 브라우저 지원"],
        },
        {
          name: "플러스",
          description: "꾸준히 파이프라인을 관리하는 사용자에게",
          cta: "무료 체험",
          features: ["딜 무제한", "XLSX 다운로드", "휴지통 복구", "고급 필터와 정렬"],
        },
        {
          name: "비즈니스",
          description: "반복 영업 흐름을 자동화하는 개인과 작은 팀에게",
          cta: "시작하기",
          features: ["AI 회의록 요약", "우선순위 추천", "팀 공유 보기", "민감 메모 보호"],
        },
        {
          name: "엔터프라이즈",
          description: "보안, 권한, 운영 정책이 필요한 조직에게",
          cta: "문의하기",
          features: ["전담 도입 지원", "감사 로그", "권한 정책", "보안 검토 지원"],
        },
      ],
      comparisonGroups: [
        {
          title: "워크스페이스",
          rows: [
            ["회사/담당자 관리", "기본", "무제한", "무제한", "무제한"],
            ["제품 관리", "기본", "무제한", "무제한", "무제한"],
            ["딜 파이프라인", "30개", "무제한", "무제한", "무제한"],
            ["일정/회의록", "기본", "고급", "고급", "고급"],
            ["검색", "기본", "고급", "고급", "고급"],
          ],
        },
        {
          title: "AI와 자동화",
          rows: [
            ["회의록 요약", "", "", "포함", "포함"],
            ["다음 행동 추천", "", "", "포함", "포함"],
            ["팔로업 알림", "기본", "고급", "고급", "고급"],
            ["영업 리포트", "", "기본", "고급", "맞춤"],
            ["반복 업무 템플릿", "", "포함", "포함", "맞춤"],
          ],
        },
        {
          title: "데이터와 보안",
          rows: [
            ["도메인별 XLSX 다운로드", "", "포함", "포함", "포함"],
            ["휴지통 복구", "7일", "30일", "90일", "맞춤"],
            ["민감 메모 보호", "", "", "포함", "포함"],
            ["감사 로그", "", "", "기본", "고급"],
            ["도입/보안 검토", "", "", "", "지원"],
          ],
        },
        {
          title: "지원",
          rows: [
            ["도움말 문서", "포함", "포함", "포함", "포함"],
            ["이메일 지원", "", "포함", "포함", "우선"],
            ["온보딩 지원", "", "", "기본", "전담"],
            ["계약/세금계산서", "", "", "지원", "지원"],
          ],
        },
      ],
      faqs: [
        "무료 요금제로 언제까지 사용할 수 있나요?",
        "비즈니스 요금제의 AI 기능은 어떤 데이터를 사용하나요?",
        "팀 단위 권한 관리는 언제 제공되나요?",
        "기존 고객 데이터를 가져올 수 있나요?",
        "월간 결제와 연간 결제를 모두 지원하나요?",
        "개인영업이나 부동산 CRM 도입 상담을 받을 수 있나요?",
        "모바일 앱 없이 모바일 브라우저에서 사용할 수 있나요?",
        "데이터 삭제와 복구 정책은 어떻게 되나요?",
      ],
    },
    contact: {
      title: ["OneHand", "도입 문의하기"],
      description:
        "개인영업, 부동산 중개, B2B 현장 영업, 보험·자동차 영업에 맞는 요금제 상담, 데모 예약, 활용 사례 안내를 받아보세요.",
      trustedLabel: "반복 고객 상담과 팔로업이 많은 영업자가 사용하는 OneHand",
      companies: ["LG AI Research", "Sendbird", "HYOSUNG"],
      quoteCompany: "OpenAI",
      quote:
        "직원들은 같은 딜 목표와 고객 정보를 공유할 수 있는 단일 업무 공간이 필요합니다. OneHand는 영업 흐름을 한곳에서 처리할 수 있게 합니다.",
      quotePerson: "Nick Erdenberger",
      quoteRole: "GTM, OpenAI",
      labels: {
        firstName: "이름 *",
        lastName: "성 *",
        email: "업무용 이메일 *",
        title: "직함 *",
        company: "회사 이름 *",
        companySize: "회사 규모 *",
        region: "국가나 지역 *",
        phone: "전화번호 *",
        reason: "문의 이유 *",
        detail: "세부 정보를 제공해 주세요. *",
      },
      placeholders: {
        firstName: "길동",
        lastName: "홍",
        email: "you@company.com",
        title: "부동산 중개사",
        company: "가나다 주식회사",
        companySize: "선택 항목",
        region: "대한민국",
        phone: "(010) 1234-5678",
        reason: "선택 항목",
        detail: "OneHand를 어떻게 사용하고 싶은지 적어주세요.",
      },
      marketingAgreement: "OneHand의 마케팅 메시지를 수신하는 데 동의합니다.",
      submit: "도입 문의하기",
      finePrint:
        "언제든지 마케팅 메시지 수신을 거부할 수 있습니다. 제출된 정보는 문의 응대와 제품 도입 안내 목적으로 사용됩니다.",
      supportPrefix: "기술이나 제품 지원이 필요하면",
      supportSuffix: "으로 이메일을 보내 주세요.",
      testimonials: [
        {
          company: "MatchGroup",
          quote: "영업 워크플로우를 가장 효율적으로 단순화할 수 있었습니다.",
          person: "Rahim Makani",
          role: "프로덕트 팀장",
        },
        {
          company: "TOYOTA",
          quote: "전 세계 시장 진행 상황을 한눈에 파악하고 놓치지 않게 됐습니다.",
          person: "Taku Wakasugi",
          role: "Research Center",
        },
        {
          company: "ramp",
          quote: "반복 업무가 사라지고 고객과 계약 흐름에 집중할 수 있습니다.",
          person: "Geoff Charles",
          role: "운영 책임자",
        },
      ],
    },
  },  "en-US": makeEnglishCopy({
    title: "One tool for running sales.",
    contactTitle: "Contact Us",
    pricing: "Pricing",
    contact: "Request a Demo",
    languageRegion: "US",
  }),  "en-CA": makeEnglishCopy({
    title: "One tool for running sales.",
    contactTitle: "Contact Us",
    pricing: "Pricing",
    contact: "Request a Demo",
    languageRegion: "CA",
  }),
};

const PublicSiteLanguageContext =
  createContext<PublicSiteLanguageContextValue | null>(null);

// 기능 : 공개 사이트 언어 상태와 번역 copy를 하위 컴포넌트에 제공합니다.
export function PublicSiteLanguageProvider({
  children,
}: {
  readonly children: ReactNode;
}) {
  const [language, setLanguageState] = useState<PublicSiteLanguage>(() =>
    getInitialLanguage()
  );

  useEffect(() => {
    document.documentElement.lang =
      publicSiteHtmlLangByLanguage[language] ?? "ko-KR";
    window.localStorage.setItem(publicSiteLanguageStorageKey, language);
  }, [language]);

  const value = useMemo<PublicSiteLanguageContextValue>(
    () => ({
      language,
      setLanguage: setLanguageState,
      copy: publicSiteCopy[language],
    }),
    [language]
  );

  return (
    <PublicSiteLanguageContext.Provider value={value}>
      {children}
    </PublicSiteLanguageContext.Provider>
  );
}

// 기능 : 공개 사이트 언어 context를 조회합니다.
export function usePublicSiteLanguage() {
  const context = useContext(PublicSiteLanguageContext);

  if (!context) {
    throw new Error(
      "usePublicSiteLanguage must be used within PublicSiteLanguageProvider"
    );
  }

  return context;
}

// 기능 : copy가 같은 언어권을 공통 번역 언어로 정규화합니다.
export function getPublicSiteCopyLanguage(
  language: PublicSiteLanguage
): PublicSiteCopyLanguage {
  if (language === "en-CA") {
    return "en-US";
  }

  return language;
}

// 기능 : 현재 공개 사이트 언어에 맞는 지역 선택 옵션 라벨을 반환합니다.
export function getPublicSiteLanguageOptionLabel(
  option: (typeof publicSiteLanguageOptions)[number] | undefined,
  language: PublicSiteLanguage
) {
  const copyLanguage = getPublicSiteCopyLanguage(language);

  return (
    option?.labels[copyLanguage] ?? (copyLanguage === "ko" ? "한국" : "Korea")
  );
}

// 기능 : 공개 사이트 언어 provider의 초기 언어를 결정합니다.
function getInitialLanguage(): PublicSiteLanguage {
  return resolvePublicSiteLanguage();
}

// 기능 : 영어권 가격 페이지 copy를 공통 구조로 생성합니다.
function makeTranslatedPricing(copy: {
  readonly title: string;
  readonly description: string;
  readonly tags: readonly string[];
  readonly captions: readonly string[];
  readonly monthly: string;
  readonly annual: string;
  readonly currency: string;
  readonly recommended: string;
  readonly aiLabel: string;
  readonly aiTitle: string;
  readonly aiDescription: string;
  readonly aiCta: string;
  readonly setupTitle: string;
  readonly setupDescription: string;
  readonly featuresTitle: string;
  readonly featureColumn: string;
  readonly faqTitle: string;
  readonly finalTitle: string;
}): PublicSiteCopy["pricing"] {
  const isCad = copy.currency.includes("CAD");

  return {
    ...copy,
    mediaCaptions: copy.captions,
    mediaAlts: ["Customer call scene", "Whiteboard workflow planning", "Team presentation and meeting"],
    billingMonthly: copy.monthly,
    billingAnnual: copy.annual,
    priceLabels: isCad ? ["C$0", "C$14", "C$30", ""] : ["$0", "$10", "$22", ""],
    pricePeriod: "/mo",
    aiImageAlt: "Team sharing a sales plan in a meeting room",
    aiAvatarLabels: ["Deal", "Meet", "Task"],
    includedValues: ["Included"],
    emptyCell: "—",
    plans: [
      {
        name: "Free",
        description: "For individuals getting their sales records in order",
        cta: "Get started",
        features: ["Basic company/contact management", "30 deals", "Calendar and notes", "Mobile browser support"],
      },
      {
        name: "Plus",
        description: "For people actively managing a sales pipeline",
        cta: "Free trial",
        features: ["Unlimited deals", "XLSX export", "Trash restore", "Advanced filters and sorting"],
      },
      {
        name: "Business",
        description: "For teams automating repeat sales workflows",
        cta: "Get started",
        features: ["AI meeting summaries", "Priority suggestions", "Shared team views", "Sensitive note protection"],
      },
      {
        name: "Enterprise",
        description: "For organizations with security, access, and policy needs",
        cta: "Contact us",
        features: ["Dedicated onboarding", "Audit logs", "Access policies", "Security review support"],
      },
    ],
    comparisonGroups: [
      {
        title: "Workspace",
        rows: [
          ["Company/contact management", "Basic", "Unlimited", "Unlimited", "Unlimited"],
          ["Product management", "Basic", "Unlimited", "Unlimited", "Unlimited"],
          ["Deal pipeline", "30", "Unlimited", "Unlimited", "Unlimited"],
          ["Calendar/meeting notes", "Basic", "Advanced", "Advanced", "Advanced"],
          ["Search", "Basic", "Advanced", "Advanced", "Advanced"],
        ],
      },
      {
        title: "AI and automation",
        rows: [
          ["Meeting summaries", "", "", "Included", "Included"],
          ["Next action suggestions", "", "", "Included", "Included"],
          ["Follow-up reminders", "Basic", "Advanced", "Advanced", "Advanced"],
          ["Sales reports", "", "Basic", "Advanced", "Custom"],
          ["Repeat task templates", "", "Included", "Included", "Custom"],
        ],
      },
    ],
    faqs: [
      "How long can I use the free plan?",
      "What data does the Business AI use?",
      "When will team permissions be available?",
      "Can I import existing customer data?",
    ],
  };
}

// 기능 : 영어권 문의 페이지 copy를 공통 구조로 생성합니다.
function makeTranslatedContact(copy: {
  readonly title: readonly [string, string];
  readonly description: string;
  readonly trustedLabel: string;
  readonly labels: PublicSiteCopy["contact"]["labels"];
  readonly placeholders: PublicSiteCopy["contact"]["placeholders"];
  readonly submit: string;
  readonly agreement: string;
  readonly finePrint: string;
  readonly supportPrefix: string;
  readonly supportSuffix: string;
}): PublicSiteCopy["contact"] {
  return {
    title: copy.title,
    description: copy.description,
    trustedLabel: copy.trustedLabel,
    companies: ["LG AI Research", "Sendbird", "HYOSUNG"],
    quoteCompany: "OpenAI",
    quote: "Teams need one workspace where deal goals and customer context stay together. OneHand keeps the sales flow in one place.",
    quotePerson: "Nick Erdenberger",
    quoteRole: "GTM, OpenAI",
    labels: copy.labels,
    placeholders: copy.placeholders,
    marketingAgreement: copy.agreement,
    submit: copy.submit,
    finePrint: copy.finePrint,
    supportPrefix: copy.supportPrefix,
    supportSuffix: copy.supportSuffix,
    testimonials: [
      {
        company: "MatchGroup",
        quote: "We simplified our sales workflow more efficiently.",
        person: "Rahim Makani",
        role: "Product Lead",
      },
      {
        company: "TOYOTA",
        quote: "We can follow market progress without missing context.",
        person: "Taku Wakasugi",
        role: "Research Center",
      },
      {
        company: "ramp",
        quote: "With repeat work reduced, we can focus on customers and contracts.",
        person: "Geoff Charles",
        role: "Operations Lead",
      },
    ],
  };
}

// 기능 : 영어권 지역에 맞는 가격 통화 안내 문구를 반환합니다.
function getEnglishPricingCurrency(languageRegion: "US" | "CA") {
  if (languageRegion === "CA") return "CAD reference";
  return "USD reference";
}

// 기능 : 영어권 지역에 맞는 문의 국가 기본 문구를 반환합니다.
function getEnglishContactRegion(languageRegion: "US" | "CA") {
  if (languageRegion === "CA") return "Canada";
  return "United States";
}

// 기능 : 영어권 공개 사이트 전체 copy를 생성합니다.
function makeEnglishCopy(copy: {
  readonly title: string;
  readonly contactTitle: string;
  readonly pricing: string;
  readonly contact: string;
  readonly languageRegion: "US" | "CA";
}): PublicSiteCopy {
  const common: PublicSiteCopy["common"] = {
    logoAria: "OneHand home",
    menuAria: "Open menu",
    nav: {
      product: "Products",
      solutions: "Use Cases",
      resources: "Resources",
      pricing: copy.pricing,
      contact: copy.contact,
      freeCta: "Get OneHand",
      login: "Log in",
    },
    productMenuColumns: [
      ["Products", "OneHand?", "Products Guide"],
      ["Core Features", "Feature overview", "Customer management", "Sales pipeline", "Schedule and follow-up", "Activity records"],
      ["AI/Data", "AI sales assistant", "Reports", "Excel import/export"],
    ],
    solutionMenuColumns: [
      ["Overview", "View All"],
      ["Style", "Personal", "B2B Field"],
      ["Industry", "Real Estate", "Insurance/Automobile"],
    ],
    resourceMenuColumns: [
      ["Support", "Help", "FAQ", "Contact Us"],
    ],
    footerColumns: [
      ["Company", "About Us", "Security", "Terms of Service", "Your Privacy Policy"],
      ["Products", "Products Guide", "Features", "Pricing", "Download"],
      ["Resources", "Help", "FAQ", "Contact Us"],
      ["OneHand for", "Personal", "B2B Field", "Real Estate", "Insurance/Automobile"],
    ],
    cookieSettings: "Cookie settings",
    languageAria: "Select region",
    footerSocialAria: "OneHand social links",
    copyright: "© 2026 OneHand Labs, Inc.",
  };

  return {
    common,
    landing: {
      heroTitle: ["Where field sales", "keeps follow-up moving"],
      heroDescription:
        "Connect customers, contacts, business cards, meetings, schedules, deals, and follow-up for real estate, B2B, insurance, and car sales.",
      primaryCta: "Get OneHand",
      secondaryCta: "See the flow",
      customerStrip: "A CRM designed for individual and field sales workflows",
      sectionWork: "Keep customer follow-up moving all day.",
      sectionAssistants: "Ask whenever you need help.",
      sectionWorkspace: "Manage customers, schedules, meeting notes, and deals in one place.",
      quote: "“Before AI, the sales flow gets organized.”",
      trustedTitle: "For sellers who manage relationships directly.",
      finalCta: "Get started today.",
      finalPrimary: "Get OneHand",
      finalSecondary: "Request a Demo",
    },
    pricing: makeTranslatedPricing({
      title: copy.title,
      description:
        "Choose the right features for solo sellers, real estate agents, field salespeople, B2B salespeople, and small teams.",
      tags: ["Deals", "Customers", "Calendar", "Notes", "Search", "AI"],
      captions: ["Customer call", "Workflow design", "Team operations"],
      monthly: "Monthly billing",
      annual: "Save 20% annually",
      currency: getEnglishPricingCurrency(copy.languageRegion),
      recommended: "Recommended",
      aiLabel: "AI option",
      aiTitle: "AI sales assistant for important work.",
      aiDescription:
        "Connect meeting summaries, next actions, and follow-up reminders to your pipeline.",
      aiCta: "Explore AI features",
      setupTitle: "Onboarding included",
      setupDescription:
        "We help design data import, sales stages, and onboarding around your sales workflow.",
      featuresTitle: "Plans and features",
      featureColumn: "Feature",
      faqTitle: "Frequently asked questions",
      finalTitle: "Choose the plan that fits your sales work.",
    }),
    contact: makeTranslatedContact({
      title: ["OneHand", copy.contactTitle],
      description:
        "Get help with pricing, demos, and use cases for personal, real estate, field, B2B, insurance, and car sales.",
      trustedLabel: "Used by sellers with repeat customer follow-up",
      labels: {
        firstName: "First name *",
        lastName: "Last name *",
        email: "Work email *",
        title: "Job title *",
        company: "Company name *",
        companySize: "Company size *",
        region: "Country or region *",
        phone: "Phone number *",
        reason: "Reason for contact *",
        detail: "Tell us more. *",
      },
      placeholders: {
        firstName: "Jane",
        lastName: "Kim",
        email: "you@company.com",
        title: "Sales lead",
        company: "Example Inc.",
        companySize: "Select an option",
        region: getEnglishContactRegion(copy.languageRegion),
        phone: "(123) 456-7891",
        reason: "Select an option",
        detail: "Tell us how you want to use OneHand.",
      },
      submit: "Contact Us",
      agreement: "I agree to receive marketing messages from OneHand.",
      finePrint:
        "You can opt out of marketing messages at any time. Submitted information is used to respond to your request and guide product onboarding.",
      supportPrefix: "For technical or product support, email",
      supportSuffix: ".",
    }),
  };
}
