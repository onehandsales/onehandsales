import { useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import {
  getPublicSiteLanguageFromPathname,
  isPublicSiteLocalizedPath,
  stripPublicSiteLocaleFromPathname,
  toPublicSitePath,
  type PublicSiteLocalizedPath,
} from "@/features/public-site/i18n/public-site-locale-routes";
import type { PublicSiteLanguage } from "@/features/public-site/i18n/public-site-language";

export const publicSiteOrigin = "https://www.onehandsales.com";

const publicSiteOgImageUrl = `${publicSiteOrigin}/brand/og-image-1200x630.png`;
const publicSiteLogoUrl = `${publicSiteOrigin}/brand/seo-icon-white-square.svg`;
const publicSiteSeoLanguageValues = [
  "ko",
  "en-US",
  "en-CA",
] as const satisfies readonly PublicSiteLanguage[];

// Future SEO locale candidates: ja, en-GB, en-SG, en-AU.
// Do not add them to alternates or sitemap output until launch readiness is confirmed.

type PublicSiteSeoRouteCopy = {
  readonly title: Partial<Record<PublicSiteLanguage | "en", string>>;
  readonly description: Partial<Record<PublicSiteLanguage | "en", string>>;
  readonly keywords: Partial<Record<PublicSiteLanguage | "en", readonly string[]>>;
  readonly noindex?: boolean;
  readonly schemaType?: "WebPage" | "AboutPage" | "ContactPage";
};

type PublicSiteSeoMetadata = {
  readonly title: string;
  readonly description: string;
  readonly canonicalUrl: string;
  readonly htmlLang: string;
  readonly ogLocale: string;
  readonly routePath: PublicSiteLocalizedPath;
  readonly language: PublicSiteLanguage;
  readonly noindex: boolean;
  readonly schemaType: "WebPage" | "AboutPage" | "ContactPage";
};

const htmlLangByLanguage: Record<PublicSiteLanguage, string> = {
  ko: "ko-KR",
  "en-US": "en-US",
  "en-CA": "en-CA",
};

const ogLocaleByLanguage: Record<PublicSiteLanguage, string> = {
  ko: "ko_KR",
  "en-US": "en_US",
  "en-CA": "en_CA",
};

const coreKoreanSeoKeywords = [
  "한손에 영업",
  "OneHand Sales",
  "원핸드세일즈",
  "원핸드 세일즈",
  "영업",
  "세일즈",
  "Sales",
  "CRM",
  "영업 CRM",
  "세일즈 CRM",
  "개인 CRM",
  "개인영업",
  "개인 영업",
  "개인영업 CRM",
  "개인 영업 CRM",
  "1인 영업",
  "1인 영업 CRM",
  "혼자 쓰는 CRM",
  "소규모 영업 CRM",
  "중소기업 영업 CRM",
  "B2B 영업 CRM",
] as const;

const workflowKoreanSeoKeywords = [
  "고객 관리",
  "고객관리",
  "고객관리 CRM",
  "영업 고객 관리",
  "거래처 관리",
  "담당자 관리",
  "리드 관리",
  "잠재고객 관리",
  "영업 파이프라인",
  "딜 관리",
  "계약 관리",
  "견적 관리",
  "제안 관리",
  "영업 일정 관리",
  "방문 일정 관리",
  "재방문 일정",
  "미팅 관리",
  "미팅노트",
  "회의록 정리",
  "명함 스캔",
  "명함 OCR",
  "후속 연락",
  "팔로업 관리",
  "영업 후속관리",
  "세일즈 후속관리",
  "마케팅 후속관리",
  "세일즈 마케팅",
  "영업 관리 앱",
  "영업 관리 프로그램",
  "세일즈 관리 툴",
  "모바일 CRM",
] as const;

const personaKoreanSeoKeywords = [
  "현장 영업",
  "외근 영업",
  "관계형 영업",
  "중소기업 B2B 영업",
  "산업재 영업",
  "기계 영업",
  "부품 영업",
  "원자재 영업",
  "의료기기 영업",
  "제약 영업",
  "무역 영업",
  "수출입 영업",
  "도매 영업",
  "IT 서비스 영업",
  "SI 영업",
  "부동산",
  "부동산 영업",
  "부동산 세일즈",
  "부동산 CRM",
  "부동산 고객관리",
  "부동산 중개사 CRM",
  "부동산 중개 고객관리",
  "중개보조원 고객관리",
  "매물 문의 관리",
  "부동산 상담 관리",
  "보험설계사 고객관리",
  "재무상담 고객관리",
  "자동차 영업 고객관리",
  "헤드헌터 고객관리",
  "채용 컨설턴트 고객관리",
  "광고대행사 영업관리",
  "개발사 영업관리",
  "프랜차이즈 가맹 영업",
  "기업교육 영업관리",
  "교육제품 영업관리",
  "세무사 고객관리",
  "노무사 고객관리",
  "변리사 고객관리",
  "법무사 고객관리",
  "프리랜서 고객관리",
  "1인 에이전시 CRM",
  "컨설턴트 고객관리",
  "웨딩 상담 고객관리",
  "인테리어 상담 고객관리",
  "이벤트 상담 고객관리",
  "여행 상담 고객관리",
  "유학 상담 고객관리",
  "이민 상담 고객관리",
] as const;

const coreEnglishSeoKeywords = [
  "OneHand Sales",
  "onehandsales",
  "sales",
  "Sales",
  "CRM",
  "sales CRM",
  "personal CRM",
  "personal sales",
  "individual sales",
  "personal sales CRM",
  "individual sales CRM",
  "solo sales CRM",
  "small business sales CRM",
  "B2B sales CRM",
  "field sales CRM",
] as const;

const workflowEnglishSeoKeywords = [
  "customer management",
  "contact management",
  "client management",
  "account management",
  "lead management",
  "prospect management",
  "deal tracking",
  "deal management",
  "pipeline management",
  "sales pipeline",
  "quote tracking",
  "proposal tracking",
  "sales schedule management",
  "visit schedule management",
  "follow-up reminders",
  "customer follow-up",
  "sales follow-up",
  "marketing follow-up",
  "sales marketing",
  "meeting notes",
  "meeting note CRM",
  "business card scanning",
  "business card OCR",
  "mobile CRM",
  "sales management app",
  "sales management software",
] as const;

const personaEnglishSeoKeywords = [
  "field sales",
  "outside sales",
  "relationship sales",
  "SMB B2B sales",
  "industrial sales",
  "machinery sales",
  "parts sales",
  "raw material sales",
  "medical device sales",
  "pharmaceutical sales",
  "trade sales",
  "import export sales",
  "wholesale sales",
  "IT service sales",
  "SI sales",
  "real estate",
  "real estate sales",
  "real estate CRM",
  "real estate agent CRM",
  "real estate customer management",
  "real estate client management",
  "property inquiry tracking",
  "insurance agent CRM",
  "financial advisor CRM",
  "car sales CRM",
  "automotive sales CRM",
  "headhunter CRM",
  "recruiting consultant CRM",
  "agency sales CRM",
  "software agency sales CRM",
  "franchise sales CRM",
  "education sales CRM",
  "tax accountant CRM",
  "labor consultant CRM",
  "patent attorney CRM",
  "legal scrivener CRM",
  "freelancer CRM",
  "consultant CRM",
  "wedding consultant CRM",
  "interior design sales CRM",
  "event sales CRM",
  "travel consultant CRM",
  "study abroad consultant CRM",
  "immigration consultant CRM",
] as const;

const homeKoreanSeoKeywords = [
  ...coreKoreanSeoKeywords,
  ...workflowKoreanSeoKeywords,
  ...personaKoreanSeoKeywords,
] as const;

const homeEnglishSeoKeywords = [
  ...coreEnglishSeoKeywords,
  ...workflowEnglishSeoKeywords,
  ...personaEnglishSeoKeywords,
] as const;

const routeSeoCopy: Record<PublicSiteLocalizedPath, PublicSiteSeoRouteCopy> = {
  "/": {
    title: {
      ko: "한손에 영업 | 개인·현장 영업 CRM",
      en: "OneHand Sales | Personal Field Sales CRM",
    },
    description: {
      ko: "개인영업, 부동산 중개, B2B 현장 영업, 보험·자동차 영업의 고객관리, 미팅, 일정, 딜, 후속 연락을 한곳에서 관리하는 영업 CRM.",
      en: "A personal field sales CRM for real estate agents, B2B salespeople, insurance agents, car salespeople, schedules, meeting notes, deals, and follow-up.",
    },
    keywords: {
      ko: homeKoreanSeoKeywords,
      en: homeEnglishSeoKeywords,
    },
  },
  "/pricing": {
    title: {
      ko: "가격 | 한손에 영업",
      en: "Pricing | OneHand Sales",
    },
    description: {
      ko: "개인영업, 부동산 중개, B2B 현장 영업, 보험·자동차 영업에 맞는 한손에 영업 CRM 요금제와 기능을 확인하세요.",
      en: "Compare OneHand Sales plans for personal sales, field sales, real estate agents, B2B salespeople, and customer follow-up workflows.",
    },
    keywords: {
      ko: [
        "영업 CRM 가격",
        "세일즈 CRM 가격",
        "개인영업 CRM 가격",
        "1인 영업 CRM 가격",
        "부동산 CRM 가격",
        "부동산 중개사 CRM 가격",
        "B2B 영업 CRM 가격",
        "현장 영업 CRM 가격",
        "보험설계사 고객관리 가격",
        "자동차 영업 고객관리 가격",
        "개인 CRM 요금제",
        "영업 관리 앱 가격",
        "영업 관리 프로그램 가격",
        "CRM 요금제",
      ],
      en: [
        "sales CRM pricing",
        "personal sales CRM pricing",
        "field sales CRM pricing",
        "real estate CRM pricing",
        "real estate agent CRM pricing",
        "B2B sales CRM pricing",
        "solo sales CRM pricing",
        "small business CRM pricing",
        "sales management software pricing",
      ],
    },
  },
  "/contact": {
    title: {
      ko: "문의 | 한손에 영업",
      en: "Contact | OneHand Sales",
    },
    description: {
      ko: "개인영업, 부동산, B2B 현장 영업, 보험·자동차 영업, 마케팅 후속관리 업무에 맞는 CRM 도입과 제품 문의를 남겨주세요.",
      en: "Contact OneHand Sales about CRM adoption for personal sales, real estate, field sales, B2B sales, and marketing follow-up workflows.",
    },
    keywords: {
      ko: [
        "한손에 영업 문의",
        "영업 CRM 문의",
        "세일즈 CRM 문의",
        "개인영업 CRM 문의",
        "부동산 CRM 문의",
        "부동산 중개사 CRM 문의",
        "B2B 영업 CRM 문의",
        "현장 영업 CRM 문의",
        "보험설계사 고객관리 문의",
        "자동차 영업 고객관리 문의",
        "마케팅 후속관리 문의",
        "CRM 도입 문의",
      ],
      en: [
        "OneHand Sales contact",
        "sales CRM contact",
        "personal sales CRM inquiry",
        "real estate CRM contact",
        "field sales CRM inquiry",
        "B2B sales CRM inquiry",
        "marketing follow-up CRM inquiry",
        "CRM sales inquiry",
      ],
    },
    schemaType: "ContactPage",
  },
  "/about": {
    title: {
      ko: "소개 | 한손에 영업",
      en: "About | OneHand Sales",
    },
    description: {
      ko: "한손에 영업이 1인 영업자, 중소기업 B2B 영업, 부동산 중개사, 보험·자동차 영업자의 고객 관리와 후속 업무를 돕는 방식.",
      en: "Learn how OneHand Sales helps solo sellers, B2B salespeople, real estate agents, insurance agents, and car salespeople manage customers and follow-ups.",
    },
    keywords: {
      ko: [
        "한손에 영업 소개",
        "개인영업 관리",
        "현장 영업 관리",
        "B2B 영업 관리",
        "부동산 영업 관리",
        "보험 영업 관리",
        "자동차 영업 관리",
        "산업재 영업 관리",
        "의료기기 영업 관리",
        "무역 영업 관리",
        "1인 사업자 고객관리",
        "세일즈 후속 업무",
        "고객 업무 관리",
      ],
      en: [
        "about OneHand Sales",
        "personal sales management",
        "field sales management",
        "B2B sales management",
        "real estate sales management",
        "insurance sales management",
        "car sales management",
        "industrial sales management",
        "sales follow-up management",
      ],
    },
    schemaType: "AboutPage",
  },
  "/security": {
    title: {
      ko: "보안 | 한손에 영업",
      en: "Security | OneHand Sales",
    },
    description: {
      ko: "개인영업, 부동산, B2B 현장 영업의 고객 데이터, 미팅 메모, 개인정보, 접근 권한을 보호하기 위한 한손에 영업의 보안 기준.",
      en: "Security and privacy practices for customer data, meeting notes, permissions, and field sales workflows.",
    },
    keywords: {
      ko: [
        "CRM 보안",
        "영업 CRM 보안",
        "개인영업 CRM 보안",
        "부동산 CRM 보안",
        "B2B 영업 CRM 보안",
        "고객 데이터 보호",
        "고객 정보 보호",
        "미팅 메모 보안",
        "CRM 개인정보 보호",
      ],
      en: [
        "CRM security",
        "sales CRM security",
        "personal sales CRM security",
        "field sales CRM security",
        "real estate CRM security",
        "customer data protection",
        "meeting notes security",
      ],
    },
  },
  "/terms": {
    title: {
      ko: "이용약관 | 한손에 영업",
      en: "Terms | OneHand Sales",
    },
    description: {
      ko: "한손에 영업 서비스 이용 조건과 사용자 책임을 확인하세요.",
      en: "Review the OneHand Sales terms of service and user responsibilities.",
    },
    keywords: {
      ko: ["한손에 영업 이용약관", "OneHand Sales terms"],
      en: ["OneHand Sales terms", "sales CRM terms"],
    },
  },
  "/privacy": {
    title: {
      ko: "개인정보 처리방침 | 한손에 영업",
      en: "Privacy Policy | OneHand Sales",
    },
    description: {
      ko: "한손에 영업의 개인정보 수집, 이용, 보관, 보호 기준을 확인하세요.",
      en: "Review how OneHand Sales collects, uses, stores, and protects personal information.",
    },
    keywords: {
      ko: [
        "한손에 영업 개인정보 처리방침",
        "영업 CRM 개인정보 보호",
        "개인영업 CRM 개인정보 보호",
        "부동산 CRM 개인정보 보호",
        "B2B 영업 CRM 개인정보 보호",
        "CRM 개인정보 보호",
        "고객 데이터 개인정보",
        "고객 정보 개인정보",
      ],
      en: [
        "OneHand Sales privacy",
        "CRM privacy",
        "sales CRM privacy",
        "personal sales CRM privacy",
        "real estate CRM privacy",
        "customer data privacy",
        "client data privacy",
      ],
    },
  },
  "/login": {
    title: {
      ko: "로그인 | 한손에 영업",
      en: "Log in | OneHand Sales",
    },
    description: {
      ko: "한손에 영업 워크스페이스에 로그인하세요.",
      en: "Log in to your OneHand Sales workspace.",
    },
    keywords: {
      ko: ["한손에 영업 로그인"],
      en: ["OneHand Sales login"],
    },
    noindex: true,
  },
  "/signup": {
    title: {
      ko: "회원가입 | 한손에 영업",
      en: "Sign up | OneHand Sales",
    },
    description: {
      ko: "한손에 영업 계정을 만들고 개인 영업 워크스페이스를 시작하세요.",
      en: "Create a OneHand Sales account and start your sales workspace.",
    },
    keywords: {
      ko: ["한손에 영업 회원가입"],
      en: ["OneHand Sales sign up"],
    },
    noindex: true,
  },
};

export function PublicSiteSeo() {
  const location = useLocation();
  const metadata = useMemo(
    () => getPublicSiteSeoMetadata(location.pathname),
    [location.pathname]
  );

  useEffect(() => {
    applyPublicSiteSeo(metadata);
  }, [metadata]);

  return null;
}

function getPublicSiteSeoMetadata(pathname: string): PublicSiteSeoMetadata {
  const language = getPublicSiteLanguageFromPathname(pathname) ?? "ko";
  const publicPath = stripPublicSiteLocaleFromPathname(pathname);
  const routePath = isPublicSiteLocalizedPath(publicPath) ? publicPath : "/";
  const copy = routeSeoCopy[routePath];
  const title = getLocalizedSeoValue(copy.title, language);
  const description = getLocalizedSeoValue(copy.description, language);

  return {
    canonicalUrl: `${publicSiteOrigin}${toPublicSitePath(language, routePath)}`,
    description,
    htmlLang: htmlLangByLanguage[language],
    language,
    noindex: (copy.noindex ?? false) || !isPublicSiteSeoLanguage(language),
    ogLocale: ogLocaleByLanguage[language],
    routePath,
    schemaType: copy.schemaType ?? "WebPage",
    title,
  };
}

function isPublicSiteSeoLanguage(language: PublicSiteLanguage) {
  return publicSiteSeoLanguageValues.some((value) => value === language);
}

function getLocalizedSeoValue(
  values: Partial<Record<PublicSiteLanguage | "en", string>>,
  language: PublicSiteLanguage
) {
  return values[language] ?? values.en ?? values.ko ?? "OneHand Sales";
}

function getLocalizedSeoKeywords(
  values: Partial<Record<PublicSiteLanguage | "en", readonly string[]>>,
  language: PublicSiteLanguage
) {
  return values[language] ?? values.en ?? values.ko ?? [];
}

function getSoftwareSeoKeywords(language: PublicSiteLanguage) {
  return language === "ko" ? homeKoreanSeoKeywords : homeEnglishSeoKeywords;
}

function getSoftwareSeoAudience(language: PublicSiteLanguage) {
  return language === "ko"
    ? [
        "1인 영업자",
        "중소기업 B2B 영업사원",
        "현장 영업 담당자",
        "부동산 중개사",
        "보험설계사",
        "자동차 영업사원",
        "산업재·의료기기·무역 영업사원",
        "프리랜서·컨설턴트·1인 에이전시",
      ]
    : [
        "Individual salespeople",
        "SMB B2B salespeople",
        "Field sales professionals",
        "Real estate agents",
        "Insurance agents",
        "Car salespeople",
        "Industrial, medical device, and trade salespeople",
        "Freelancers, consultants, and solo agencies",
      ];
}

function getSoftwareFeatureList(language: PublicSiteLanguage) {
  return language === "ko"
    ? [
        "고객 및 담당자 관리",
        "거래처 관리",
        "딜 파이프라인 관리",
        "영업 일정 및 재방문 일정 관리",
        "미팅노트와 회의록 정리",
        "명함 스캔 및 명함 OCR",
        "후속 연락과 팔로업 알림",
        "제안, 견적, 계약 흐름 관리",
      ]
    : [
        "Customer and contact management",
        "Account management",
        "Deal pipeline tracking",
        "Sales schedule and revisit management",
        "Meeting notes",
        "Business card scanning and OCR",
        "Follow-up reminders",
        "Proposal, quote, and contract workflow tracking",
      ];
}

function applyPublicSiteSeo(metadata: PublicSiteSeoMetadata) {
  document.documentElement.lang = metadata.htmlLang;
  document.title = metadata.title;

  upsertMeta("name", "description", metadata.description);
  upsertMeta(
    "name",
    "robots",
    metadata.noindex
      ? "noindex,nofollow,noarchive"
      : "index,follow,max-image-preview:large"
  );
  upsertMeta("property", "og:type", "website");
  upsertMeta("property", "og:site_name", "한손에 영업");
  upsertMeta("property", "og:title", metadata.title);
  upsertMeta("property", "og:description", metadata.description);
  upsertMeta("property", "og:url", metadata.canonicalUrl);
  upsertMeta("property", "og:locale", metadata.ogLocale);
  replaceOgLocaleAlternates(metadata.language);
  upsertMeta("property", "og:image", publicSiteOgImageUrl);
  upsertMeta("property", "og:image:width", "1200");
  upsertMeta("property", "og:image:height", "630");
  upsertMeta("property", "og:image:alt", metadata.title);
  upsertMeta("name", "twitter:card", "summary_large_image");
  upsertMeta("name", "twitter:title", metadata.title);
  upsertMeta("name", "twitter:description", metadata.description);
  upsertMeta("name", "twitter:image", publicSiteOgImageUrl);
  upsertMeta("name", "twitter:image:alt", metadata.title);
  upsertMeta("name", "application-name", "한손에 영업");
  upsertMeta("name", "apple-mobile-web-app-title", "한손에 영업");
  upsertMeta(
    "name",
    "keywords",
    getLocalizedSeoKeywords(routeSeoCopy[metadata.routePath].keywords, metadata.language).join(", ")
  );
  upsertMeta("name", "theme-color", "#ffffff");

  upsertCanonical(metadata.canonicalUrl);
  replaceAlternateLinks(metadata.routePath);
  replaceJsonLd(metadata);
}

function replaceOgLocaleAlternates(currentLanguage: PublicSiteLanguage) {
  document.head
    .querySelectorAll<HTMLMetaElement>('meta[data-onehand-seo="og-locale-alternate"]')
    .forEach((meta) => meta.remove());

  publicSiteSeoLanguageValues
    .filter((language) => language !== currentLanguage)
    .forEach((language) => {
      const meta = document.createElement("meta");
      meta.dataset.onehandSeo = "og-locale-alternate";
      meta.setAttribute("property", "og:locale:alternate");
      meta.content = ogLocaleByLanguage[language];
      document.head.appendChild(meta);
    });
}

function upsertMeta(
  attribute: "name" | "property",
  key: string,
  content: string
) {
  let meta = document.head.querySelector<HTMLMetaElement>(
    `meta[${attribute}="${key}"]`
  );

  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute(attribute, key);
    document.head.appendChild(meta);
  }

  meta.content = content;
}

function upsertCanonical(href: string) {
  let canonical = document.head.querySelector<HTMLLinkElement>(
    'link[rel="canonical"]'
  );

  if (!canonical) {
    canonical = document.createElement("link");
    canonical.rel = "canonical";
    document.head.appendChild(canonical);
  }

  canonical.href = href;

  const extraCanonicals = Array.from(
    document.head.querySelectorAll<HTMLLinkElement>('link[rel="canonical"]')
  ).slice(1);

  extraCanonicals.forEach((link) => link.remove());
}

function replaceAlternateLinks(routePath: PublicSiteLocalizedPath) {
  document.head
    .querySelectorAll<HTMLLinkElement>('link[data-onehand-seo="alternate"]')
    .forEach((link) => link.remove());

  publicSiteSeoLanguageValues.forEach((language) => {
    const link = document.createElement("link");
    link.dataset.onehandSeo = "alternate";
    link.href = `${publicSiteOrigin}${toPublicSitePath(language, routePath)}`;
    link.hreflang = htmlLangByLanguage[language];
    link.rel = "alternate";
    document.head.appendChild(link);
  });

  const defaultLink = document.createElement("link");
  defaultLink.dataset.onehandSeo = "alternate";
  defaultLink.href = `${publicSiteOrigin}${toPublicSitePath("ko", routePath)}`;
  defaultLink.hreflang = "x-default";
  defaultLink.rel = "alternate";
  document.head.appendChild(defaultLink);
}

function replaceJsonLd(metadata: PublicSiteSeoMetadata) {
  document.head
    .querySelectorAll<HTMLScriptElement>('script[data-onehand-seo="json-ld"]')
    .forEach((script) => script.remove());

  const script = document.createElement("script");
  script.dataset.onehandSeo = "json-ld";
  script.type = "application/ld+json";
  script.textContent = JSON.stringify(getJsonLd(metadata));
  document.head.appendChild(script);
}

function getJsonLd(metadata: PublicSiteSeoMetadata) {
  const keywords = getLocalizedSeoKeywords(
    routeSeoCopy[metadata.routePath].keywords,
    metadata.language
  );

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@id": `${publicSiteOrigin}/#organization`,
        "@type": "Organization",
        alternateName: "한손에 영업",
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "customer support",
          email: "team@onehandsales.com",
        },
        logo: publicSiteLogoUrl,
        name: "OneHand Sales",
        url: publicSiteOrigin,
      },
      {
        "@id": `${publicSiteOrigin}/#website`,
        "@type": "WebSite",
        inLanguage: metadata.htmlLang,
        name: "OneHand Sales",
        publisher: { "@id": `${publicSiteOrigin}/#organization` },
        url: publicSiteOrigin,
      },
      {
        "@id": `${publicSiteOrigin}/#software`,
        "@type": "SoftwareApplication",
        applicationCategory: "BusinessApplication",
        applicationSubCategory: "Personal field sales CRM",
        audience: getSoftwareSeoAudience(metadata.language).map((audienceType) => ({
          "@type": "Audience",
          audienceType,
        })),
        description:
          metadata.language === "ko"
            ? "개인영업, 부동산 중개, B2B 현장 영업, 보험·자동차 영업의 고객관리, 미팅, 일정, 딜, 후속 연락을 한곳에서 관리하는 영업 CRM."
            : "A personal field sales CRM for real estate agents, B2B salespeople, insurance agents, car salespeople, schedules, meeting notes, deals, and follow-up.",
        featureList: getSoftwareFeatureList(metadata.language),
        keywords: getSoftwareSeoKeywords(metadata.language),
        name: "OneHand Sales",
        offers: {
          "@type": "Offer",
          category: "SaaS",
          url: `${publicSiteOrigin}/ko/pricing`,
        },
        operatingSystem: "Web",
        url: `${publicSiteOrigin}/ko`,
      },
      {
        "@id": `${metadata.canonicalUrl}#webpage`,
        "@type": metadata.schemaType,
        description: metadata.description,
        inLanguage: metadata.htmlLang,
        isPartOf: { "@id": `${publicSiteOrigin}/#website` },
        keywords,
        name: metadata.title,
        url: metadata.canonicalUrl,
      },
    ],
  };
}
