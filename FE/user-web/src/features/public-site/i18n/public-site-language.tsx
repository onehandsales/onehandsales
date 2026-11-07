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
    readonly menuCloseAria: string;
    readonly nav: {
      readonly product: string;
      readonly solutions: string;
      readonly resources: string;
      readonly pricing: string;
      readonly contact: string;
      readonly downloadApp: string;
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
      logoAria: "OneHand CRM 홈",
      menuAria: "메뉴 열기",
      menuCloseAria: "메뉴 닫기",
      nav: {
        product: "제품",
        solutions: "용도별",
        resources: "리소스",
        pricing: "요금제",
        contact: "문의하기",
        downloadApp: "웹 이용 안내",
        freeCta: "OneHand CRM 시작",
        login: "로그인",
      },
      productMenuColumns: [
        ["제품 소개", "OneHand CRM이란?", "제품 소개"],
        ["주요 기능", "전체 기능", "고객 정보 관리", "진행 상태 보기", "일정·팔로업 안내", "업무 기록 관리"],
        ["기능 제공 안내", "AI 기능 안내", "리포트 안내", "전체 제공 범위"],
      ],
      solutionMenuColumns: [
        ["전체", "전체 보기"],
        ["방식별", "개인 업무", "B2B 고객 관리"],
        ["업종별", "부동산 중개", "보험·자동차 상담"],
      ],
      resourceMenuColumns: [
        ["도움받기", "시작 가이드", "자주 묻는 질문", "문의하기"],
      ],
      footerColumns: [
        ["회사", "OneHand CRM 소개", "보안", "서비스 이용약관", "개인정보 처리방침"],
        [
          "제품",
          "제품 소개",
          "주요 기능",
          // 가격 정책 확정 후 footerColumnRoutes의 경로와 함께 복원합니다.
          // "요금제",
          "웹 이용 안내",
        ],
        ["리소스", "시작 가이드", "자주 묻는 질문", "문의하기"],
        ["용도별", "개인 업무", "B2B 고객 관리", "부동산 중개", "보험·자동차 상담"],
      ],
      cookieSettings: "쿠키 설정",
      languageAria: "지역 선택",
      footerSocialAria: "OneHand CRM 소셜 링크",
      copyright: "© 2026 OneHand CRM Labs",
    },
    landing: {
      heroTitle: ["현장 영업자가", "고객을 놓치지 않는 곳"],
      heroDescription:
        "개인영업, 부동산 중개, B2B 외근, 보험·자동차 영업의 고객, 미팅, 일정, 딜, 팔로업을 한 화면에서 연결하세요.",
      primaryCta: "OneHand CRM 시작",
      secondaryCta: "흐름 보기",
      customerStrip: "개인영업, 부동산 중개, B2B 현장 영업을 위해 설계한 CRM",
      sectionWork: "고객 미팅과 후속 연락을 하루 종일 놓치지 마세요.",
      sectionAssistants: "필요할 때 언제든지 요청하세요.",
      sectionWorkspace: "고객, 일정, 미팅노트, 딜을 한곳에서 관리하세요.",
      quote: "“AI보다 먼저, 영업의 흐름이 정리됩니다.”",
      trustedTitle: "혼자서도 영업 흐름을 놓치지 않는 사람들을 위해.",
      finalCta: "오늘 바로 시작하세요.",
      finalPrimary: "OneHand CRM 시작",
      finalSecondary: "데모 요청",
    },
    pricing: {
      title: "가격 정책은 아직 정해지지 않았어요.",
      description:
        "아래 요금제와 포함 기능은 미확정 검토안이에요. 가격·무료 제공 범위·한도·결제 방식은 아직 확정하지 않았어요.",
      tags: ["가격 미정", "한도 미정", "개인 사용", "기록 관리", "검색", "기능 확인"],
      mediaCaptions: ["고객 상담", "업무 설계", "팀 운영"],
      mediaAlts: ["고객 상담 장면", "화이트보드 업무 설계", "팀 발표와 회의"],
      billingMonthly: "월간 결제 · 미정",
      billingAnnual: "연간 결제 · 미정",
      currency: "가격 정책 미확정",
      priceLabels: ["미정", "미정", "미정", ""],
      pricePeriod: "· 미확정",
      recommended: "검토안",
      aiLabel: "AI 제공 안내",
      aiTitle: "AI 기능은 현재 제공하지 않아요.",
      aiDescription:
        "AI 요약·초안·추천 기능은 현재 이용할 수 없어요. 요금제에 포함된 기능으로 안내하지 않아요.",
      aiCta: "AI 제공 안내",
      aiImageAlt: "회의실에서 팀이 영업 계획을 공유하는 모습",
      aiAvatarLabels: ["딜", "회", "일"],
      setupTitle: "도입 지원 범위 확인",
      setupDescription:
        "현재 업무와 필요한 기능을 알려주세요. 지원 범위와 조건은 별도 확인이 필요해요.",
      featuresTitle: "요금제별 기능 · 미확정",
      featureColumn: "기능",
      faqTitle: "자주 묻는 질문",
      finalTitle: "현재 기능을 먼저 살펴보세요.",
      includedValues: ["포함"],
      emptyCell: "—",
      plans: [
        {
          name: "무료",
          description: "제공 여부와 포함 기능이 확정되지 않은 요금제 검토안이에요.",
          cta: "정책 미정",
          features: ["가격 미확정", "사용 한도 미확정", "포함 기능 미확정", "결제 조건 미확정"],
        },
        {
          name: "플러스",
          description: "제공 여부와 포함 기능이 확정되지 않은 요금제 검토안이에요.",
          cta: "정책 미정",
          features: ["가격 미확정", "사용 한도 미확정", "포함 기능 미확정", "결제 조건 미확정"],
        },
        {
          name: "비즈니스",
          description: "제공 여부와 포함 기능이 확정되지 않은 요금제 검토안이에요.",
          cta: "정책 미정",
          features: ["가격 미확정", "사용 한도 미확정", "포함 기능 미확정", "결제 조건 미확정"],
        },
        {
          name: "엔터프라이즈",
          description: "제공 여부와 포함 기능이 확정되지 않은 요금제 검토안이에요.",
          cta: "정책 미정",
          features: ["가격 미확정", "사용 한도 미확정", "포함 기능 미확정", "결제 조건 미확정"],
        },
      ],
      comparisonGroups: [
        {
          title: "워크스페이스",
          rows: [
            ["회사/담당자 관리", "미정", "미정", "미정", "미정"],
            ["제품 관리", "미정", "미정", "미정", "미정"],
            ["딜 파이프라인", "미정", "미정", "미정", "미정"],
            ["일정/회의록", "미정", "미정", "미정", "미정"],
            ["검색", "미정", "미정", "미정", "미정"],
          ],
        },
        {
          title: "AI와 자동화",
          rows: [
            ["회의록 요약", "미정", "미정", "미정", "미정"],
            ["다음 행동 추천", "미정", "미정", "미정", "미정"],
            ["후속 연락", "미정", "미정", "미정", "미정"],
            ["영업 리포트", "미정", "미정", "미정", "미정"],
            ["반복 업무 템플릿", "미정", "미정", "미정", "미정"],
          ],
        },
        {
          title: "데이터와 보안",
          rows: [
            ["도메인별 XLSX 다운로드", "미정", "미정", "미정", "미정"],
            ["민감 메모 보호", "미정", "미정", "미정", "미정"],
            ["감사 로그", "미정", "미정", "미정", "미정"],
            ["도입/보안 검토", "미정", "미정", "미정", "미정"],
          ],
        },
        {
          title: "지원",
          rows: [
            ["도움말 문서", "미정", "미정", "미정", "미정"],
            ["이메일 지원", "미정", "미정", "미정", "미정"],
            ["온보딩 지원", "미정", "미정", "미정", "미정"],
            ["계약/세금계산서", "미정", "미정", "미정", "미정"],
          ],
        },
      ],
      faqs: [
        "가격 정책: 아직 미정이에요.",
        "무료 이용 범위: 아직 미정이에요.",
        "팀 권한: 현재 제공하지 않아요.",
        "엑셀 다운로드: 현재 제공하지 않아요.",
        "월간·연간 결제 방식: 아직 미정이에요.",
        "할인과 체험 조건: 아직 미정이에요.",
        "도입 지원 범위: 별도 확인이 필요해요.",
        "사용 한도와 포함 기능: 아직 미정이에요.",
      ],
    },
    contact: {
      title: ["OneHand CRM", "도입 문의하기"],
      description:
        "개인영업, 부동산 중개, B2B 현장 영업, 보험·자동차 영업에 맞는 요금제 상담, 데모 예약, 활용 사례 안내를 받아보세요.",
      trustedLabel: "반복 고객 상담과 팔로업이 많은 영업자가 사용하는 OneHand CRM",
      companies: ["LG AI Research", "Sendbird", "HYOSUNG"],
      quoteCompany: "OpenAI",
      quote:
        "직원들은 같은 딜 목표와 고객 정보를 공유할 수 있는 단일 업무 공간이 필요합니다. OneHand CRM은 영업 흐름을 한곳에서 처리할 수 있게 합니다.",
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
        detail: "OneHand CRM을 어떻게 사용하고 싶은지 적어주세요.",
      },
      marketingAgreement: "OneHand CRM의 마케팅 메시지를 수신하는 데 동의합니다.",
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
  },
  "en-US": makeEnglishCopy({
    title: "Pricing has not been finalized.",
    contactTitle: "Contact Us",
    pricing: "Pricing",
    contact: "Request a Demo",
    languageRegion: "US",
  }),
  "en-CA": makeEnglishCopy({
    title: "Pricing has not been finalized.",
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
  // 1. 처리 흐름에 필요한 [language, setLanguageState] 값을 준비한다.
  const [language, setLanguageState] = useState<PublicSiteLanguage>(() =>
    getInitialLanguage()
  );

  // 2. 화면 상태를 현재 흐름에 맞게 갱신한다.
  useEffect(() => {
    document.documentElement.lang =
      publicSiteHtmlLangByLanguage[language] ?? "ko-KR";
    window.localStorage.setItem(publicSiteLanguageStorageKey, language);
  }, [language]);

  // 3. 처리 흐름에 필요한 value 값을 준비한다.
  const value = useMemo<PublicSiteLanguageContextValue>(
    () => ({
      language,
      setLanguage: setLanguageState,
      copy: publicSiteCopy[language],
    }),
    [language]
  );

  // 4. 계산된 결과를 호출자에게 반환한다.
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
    priceLabels: isCad ? ["TBD", "TBD", "TBD", ""] : ["TBD", "TBD", "TBD", ""],
    pricePeriod: "· unconfirmed",
    aiImageAlt: "Team sharing a sales plan in a meeting room",
    aiAvatarLabels: ["Deal", "Meet", "Task"],
    includedValues: ["Included"],
    emptyCell: "—",
    plans: [
      {
        name: "Free",
        description: "Unconfirmed plan concept; availability and included features are undecided.",
        cta: "Policy pending",
        features: ["Pricing unconfirmed", "Limits unconfirmed", "Included features unconfirmed", "Billing terms unconfirmed"],
      },
      {
        name: "Plus",
        description: "Unconfirmed plan concept; availability and included features are undecided.",
        cta: "Policy pending",
        features: ["Pricing unconfirmed", "Limits unconfirmed", "Included features unconfirmed", "Billing terms unconfirmed"],
      },
      {
        name: "Business",
        description: "Unconfirmed plan concept; availability and included features are undecided.",
        cta: "Policy pending",
        features: ["Pricing unconfirmed", "Limits unconfirmed", "Included features unconfirmed", "Billing terms unconfirmed"],
      },
      {
        name: "Enterprise",
        description: "Unconfirmed plan concept; availability and included features are undecided.",
        cta: "Policy pending",
        features: ["Pricing unconfirmed", "Limits unconfirmed", "Included features unconfirmed", "Billing terms unconfirmed"],
      },
    ],
    comparisonGroups: [
      {
        title: "Workspace",
        rows: [
          ["Company/contact management", "TBD", "TBD", "TBD", "TBD"],
          ["Product management", "TBD", "TBD", "TBD", "TBD"],
          ["Deal pipeline", "TBD", "TBD", "TBD", "TBD"],
          ["Calendar/meeting notes", "TBD", "TBD", "TBD", "TBD"],
          ["Search", "TBD", "TBD", "TBD", "TBD"],
        ],
      },
      {
        title: "AI and automation",
        rows: [
          ["Meeting summaries", "TBD", "TBD", "TBD", "TBD"],
          ["Next action suggestions", "TBD", "TBD", "TBD", "TBD"],
          ["Follow-up workflow", "TBD", "TBD", "TBD", "TBD"],
          ["Sales reports", "TBD", "TBD", "TBD", "TBD"],
          ["Repeat task templates", "TBD", "TBD", "TBD", "TBD"],
        ],
      },
    ],
    faqs: [
      "Pricing: not finalized.",
      "Free access: not finalized.",
      "Team permissions: not currently available.",
      "Excel downloads: not currently available.",
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
    quote: "Teams need one workspace where deal goals and customer context stay together. OneHand CRM keeps the sales flow in one place.",
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
    logoAria: "OneHand CRM home",
    menuAria: "Open menu",
    menuCloseAria: "Close menu",
    nav: {
      product: "Products",
      solutions: "Use Cases",
      resources: "Resources",
      pricing: copy.pricing,
      contact: copy.contact,
      downloadApp: "Web access",
      freeCta: "Get OneHand CRM",
      login: "Log in",
    },
    productMenuColumns: [
      ["Products", "OneHand CRM?", "Product overview"],
      ["Record management", "Feature overview", "Customer records", "Progress views", "Schedule availability", "Work records"],
      ["Feature availability", "AI availability", "Report availability", "Current feature scope"],
    ],
    solutionMenuColumns: [
      ["Overview", "View All"],
      ["Style", "Personal work", "B2B customer work"],
      ["Industry", "Real Estate", "Insurance and auto"],
    ],
    resourceMenuColumns: [
      ["Support", "Getting started", "FAQ", "Contact Us"],
    ],
    footerColumns: [
      ["Company", "About Us", "Security", "Terms of Service", "Your Privacy Policy"],
      [
        "Products",
        "Product overview",
        "Features",
        // 가격 정책 확정 후 footerColumnRoutes의 경로와 함께 복원합니다.
        // "Pricing",
        "Web access",
      ],
      ["Resources", "Getting started", "FAQ", "Contact Us"],
      ["OneHand CRM for", "Personal work", "B2B customer work", "Real Estate", "Insurance and auto"],
    ],
    cookieSettings: "Cookie settings",
    languageAria: "Select region",
    footerSocialAria: "OneHand CRM social links",
    copyright: "© 2026 OneHand CRM Labs",
  };

  return {
    common,
    landing: {
      heroTitle: ["Where field sales", "keeps follow-up moving"],
      heroDescription:
        "Connect customers, contacts, meetings, schedules, deals, and follow-up for real estate, B2B, insurance, and car sales.",
      primaryCta: "Get OneHand CRM",
      secondaryCta: "See the flow",
      customerStrip: "A CRM designed for individual and field sales workflows",
      sectionWork: "Keep customer follow-up moving all day.",
      sectionAssistants: "Ask whenever you need help.",
      sectionWorkspace: "Manage customers, schedules, meeting notes, and deals in one place.",
      quote: "“Before AI, the sales flow gets organized.”",
      trustedTitle: "For sellers who manage relationships directly.",
      finalCta: "Get started today.",
      finalPrimary: "Get OneHand CRM",
      finalSecondary: "Request a Demo",
    },
    pricing: makeTranslatedPricing({
      title: copy.title,
      description:
        "The plans and included features below are unconfirmed concepts. Pricing, free access, limits, and billing terms have not been finalized.",
      tags: ["Pricing pending", "Limits pending", "Individual use", "Records", "Search", "Feature scope"],
      captions: ["Customer call", "Workflow design", "Team operations"],
      monthly: "Monthly · unconfirmed",
      annual: "Annual · unconfirmed",
      currency: getEnglishPricingCurrency(copy.languageRegion),
      recommended: "Draft",
      aiLabel: "AI availability",
      aiTitle: "AI features are not currently available.",
      aiDescription:
        "AI summaries, drafts, and recommendations are not currently available or included in a confirmed plan.",
      aiCta: "AI availability",
      setupTitle: "Confirm onboarding scope",
      setupDescription:
        "Tell us about your work and requirements. Support scope and conditions need separate confirmation.",
      featuresTitle: "Plans and features · unconfirmed",
      featureColumn: "Feature",
      faqTitle: "Frequently asked questions",
      finalTitle: "Explore the current features first.",
    }),
    contact: makeTranslatedContact({
      title: ["OneHand CRM", copy.contactTitle],
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
        detail: "Tell us how you want to use OneHand CRM.",
      },
      submit: "Contact Us",
      agreement: "I agree to receive marketing messages from OneHand CRM.",
      finePrint:
        "You can opt out of marketing messages at any time. Submitted information is used to respond to your request and guide product onboarding.",
      supportPrefix: "For technical or product support, email",
      supportSuffix: ".",
    }),
  };
}
