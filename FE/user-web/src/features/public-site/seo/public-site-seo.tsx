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
  "OneHand CRM",
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
  "OneHand CRM",
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
  "customer follow-up",
  "sales follow-up",
  "marketing follow-up",
  "sales marketing",
  "meeting notes",
  "meeting note CRM",
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
      ko: "고객과 업무 기록을 한곳에 | OneHand CRM",
      en: "Customer and work records, in one place | OneHand CRM"
    },
    description: {
      ko: "고객과 업무 정보를 기록하고 수정하며, 검색과 이용 가능한 보기로 필요한 기록을 확인해요.",
      en: "Record and update customer and work information. Find what you need with search and available views."
    },
    keywords: {
      ko: [
        "OneHand CRM",
        "고객 기록",
        "업무 기록",
        "고객과 업무 기록을 한곳에"
      ],
      en: [
        "OneHand CRM",
        "customer records",
        "work records",
        "Customer and work records, in one place"
      ]
    },
  },
  "/product": {
    title: {
      ko: "고객과 업무 기록을 한곳에서 관리해요 | OneHand CRM",
      en: "Customer and work records, in one place | OneHand CRM"
    },
    description: {
      ko: "고객과 업무 정보를 기록하고, 필요한 화면에서 다시 확인하는 CRM이에요.",
      en: "Record customer and work information, update it, and find it when you need it."
    },
    keywords: {
      ko: [
        "OneHand CRM",
        "고객 기록",
        "업무 기록",
        "고객과 업무 기록을 한곳에서 관리해요"
      ],
      en: [
        "OneHand CRM",
        "customer records",
        "work records",
        "Customer and work records, in one place"
      ]
    },
  },
  "/features": {
    title: {
      ko: "기록 관리에 필요한 기능 | OneHand CRM",
      en: "Features for managing your records | OneHand CRM"
    },
    description: {
      ko: "지금 사용할 수 있는 기능과 아직 제공하지 않는 기능을 확인해 보세요.",
      en: "See what you can use today and which features are not currently available."
    },
    keywords: {
      ko: [
        "OneHand CRM",
        "고객 기록",
        "업무 기록",
        "기록 관리에 필요한 기능"
      ],
      en: [
        "OneHand CRM",
        "customer records",
        "work records",
        "Features for managing your records"
      ]
    },
  },
  "/features/customers": {
    title: {
      ko: "고객 정보를 남기고, 필요할 때 다시 찾아요 | OneHand CRM",
      en: "Keep customer details ready to find again | OneHand CRM"
    },
    description: {
      ko: "고객 정보를 기록하고, 변경된 내용은 목록에서 바로 수정해요.",
      en: "Record customer information and update supported details directly in the table."
    },
    keywords: {
      ko: [
        "OneHand CRM",
        "고객 기록",
        "업무 기록",
        "고객 정보를 남기고, 필요할 때 다시 찾아요"
      ],
      en: [
        "OneHand CRM",
        "customer records",
        "work records",
        "Keep customer details ready to find again"
      ]
    },
  },
  "/features/pipeline": {
    title: {
      ko: "진행 중인 기록을 상태별로 살펴봐요 | OneHand CRM",
      en: "Review records by their current status | OneHand CRM"
    },
    description: {
      ko: "이용 가능한 테이블과 칸반 보기에서 기록의 현재 상태를 확인해요.",
      en: "See records in available table and board views."
    },
    keywords: {
      ko: [
        "OneHand CRM",
        "고객 기록",
        "업무 기록",
        "진행 중인 기록을 상태별로 살펴봐요"
      ],
      en: [
        "OneHand CRM",
        "customer records",
        "work records",
        "Review records by their current status"
      ]
    },
  },
  "/features/schedules-follow-up": {
    title: {
      ko: "일정·팔로업 제공 범위를 확인해요 | OneHand CRM",
      en: "Schedule and follow-up availability | OneHand CRM"
    },
    description: {
      ko: "전용 캘린더, 일정 알림, 자동 후속 연락은 현재 제공하지 않아요.",
      en: "A dedicated calendar, reminders, and automatic follow-up are not currently available."
    },
    keywords: {
      ko: [
        "OneHand CRM",
        "고객 기록",
        "업무 기록",
        "일정·팔로업 제공 범위를 확인해요"
      ],
      en: [
        "OneHand CRM",
        "customer records",
        "work records",
        "Schedule and follow-up availability"
      ]
    },
  },
  "/features/activity-records": {
    title: {
      ko: "업무에서 확인한 내용을 기록으로 남겨요 | OneHand CRM",
      en: "Keep the information your work depends on | OneHand CRM"
    },
    description: {
      ko: "필요한 정보를 입력하고 수정하며, 다음에 다시 확인할 기록을 관리해요.",
      en: "Add and update information so you can return to it when you need it."
    },
    keywords: {
      ko: [
        "OneHand CRM",
        "고객 기록",
        "업무 기록",
        "업무에서 확인한 내용을 기록으로 남겨요"
      ],
      en: [
        "OneHand CRM",
        "customer records",
        "work records",
        "Keep the information your work depends on"
      ]
    },
  },
  "/features/ai-sales-assistant": {
    title: {
      ko: "AI 기능의 현재 제공 상태를 안내해요 | OneHand CRM",
      en: "Current availability of AI features | OneHand CRM"
    },
    description: {
      ko: "AI 요약, 메시지 초안, 다음 행동 추천은 현재 제공 기능에 포함되지 않아요.",
      en: "AI summaries, message drafts, and next-action recommendations are not currently available."
    },
    keywords: {
      ko: [
        "OneHand CRM",
        "고객 기록",
        "업무 기록",
        "AI 기능의 현재 제공 상태를 안내해요"
      ],
      en: [
        "OneHand CRM",
        "customer records",
        "work records",
        "Current availability of AI features"
      ]
    },
  },
  "/features/reports": {
    title: {
      ko: "리포트의 현재 제공 범위를 안내해요 | OneHand CRM",
      en: "Current availability of reports | OneHand CRM"
    },
    description: {
      ko: "자동 분석 대시보드, 주간 리포트, 리포트 다운로드는 현재 제공하지 않아요.",
      en: "Automated dashboards, weekly reports, and report downloads are not currently available."
    },
    keywords: {
      ko: [
        "OneHand CRM",
        "고객 기록",
        "업무 기록",
        "리포트의 현재 제공 범위를 안내해요"
      ],
      en: [
        "OneHand CRM",
        "customer records",
        "work records",
        "Current availability of reports"
      ]
    },
  },
  "/solutions": {
    title: {
      ko: "내 업무에서는 어떻게 활용할 수 있을까요? | OneHand CRM",
      en: "How could OneHand CRM fit your work? | OneHand CRM"
    },
    description: {
      ko: "고객과 업무 정보를 정리하는 예시를 살펴보세요. 업종별 자동 설정이나 전용 기능의 제공을 뜻하지는 않아요.",
      en: "Explore examples of organizing customer and work information. These examples do not imply industry-specific setup or dedicated features."
    },
    keywords: {
      ko: [
        "OneHand CRM",
        "고객 기록",
        "업무 기록",
        "내 업무에서는 어떻게 활용할 수 있을까요?"
      ],
      en: [
        "OneHand CRM",
        "customer records",
        "work records",
        "How could OneHand CRM fit your work?"
      ]
    },
  },
  "/solutions/personal": {
    title: {
      ko: "혼자 관리하는 고객과 업무 기록을 한곳에 | OneHand CRM",
      en: "Your customer and work records, together | OneHand CRM"
    },
    description: {
      ko: "기억에 의존하던 정보를 남기고, 필요할 때 다시 꺼내 확인하는 활용 예시예요.",
      en: "Keep information you would otherwise rely on memory for, then find it when you need it."
    },
    keywords: {
      ko: [
        "OneHand CRM",
        "고객 기록",
        "업무 기록",
        "혼자 관리하는 고객과 업무 기록을 한곳에"
      ],
      en: [
        "OneHand CRM",
        "customer records",
        "work records",
        "Your customer and work records, together"
      ]
    },
  },
  "/solutions/real-estate": {
    title: {
      ko: "고객과 매물 정보를 다시 찾기 쉽게 | OneHand CRM",
      en: "Keep customer and property details easy to find | OneHand CRM"
    },
    description: {
      ko: "상담에서 확인할 고객·매물 정보를 기록으로 정리하는 활용 예시예요. 업종별 자동 설정 기능은 현재 제공하지 않아요.",
      en: "An example of organizing information for property work. Automatic industry-specific setup is not currently available."
    },
    keywords: {
      ko: [
        "OneHand CRM",
        "고객 기록",
        "업무 기록",
        "고객과 매물 정보를 다시 찾기 쉽게"
      ],
      en: [
        "OneHand CRM",
        "customer records",
        "work records",
        "Keep customer and property details easy to find"
      ]
    },
  },
  "/solutions/insurance-auto": {
    title: {
      ko: "고객별로 다시 확인할 상담 정보를 정리해요 | OneHand CRM",
      en: "Keep information for your next customer conversation | OneHand CRM"
    },
    description: {
      ko: "반복되는 상담에서 필요한 정보를 남기고 다시 확인하는 활용 예시예요. 전용 업무 자동화는 현재 제공하지 않아요.",
      en: "An example of recording and reviewing consultation information. Dedicated industry automation is not currently available."
    },
    keywords: {
      ko: [
        "OneHand CRM",
        "고객 기록",
        "업무 기록",
        "고객별로 다시 확인할 상담 정보를 정리해요"
      ],
      en: [
        "OneHand CRM",
        "customer records",
        "work records",
        "Keep information for your next customer conversation"
      ]
    },
  },
  "/solutions/b2b-field": {
    title: {
      ko: "회사와 담당자 정보를 한곳에서 정리해요 | OneHand CRM",
      en: "Keep company and contact information together | OneHand CRM"
    },
    description: {
      ko: "업무에서 만나는 회사와 담당자 정보를 기록하고 다시 확인하는 활용 예시예요.",
      en: "An example of recording and reviewing the companies and contacts you work with."
    },
    keywords: {
      ko: [
        "OneHand CRM",
        "고객 기록",
        "업무 기록",
        "회사와 담당자 정보를 한곳에서 정리해요"
      ],
      en: [
        "OneHand CRM",
        "customer records",
        "work records",
        "Keep company and contact information together"
      ]
    },
  },
  "/download": {
    title: {
      ko: "OneHand CRM을 웹에서 시작해요 | OneHand CRM",
      en: "Start with OneHand CRM on the web | OneHand CRM"
    },
    description: {
      ko: "브라우저에서 계정에 로그인해 기록을 관리해요. 아래 버튼은 일반 앱 스토어 링크이며 OneHand CRM 설치 링크가 아니에요. 웹 이용은 하단 시작 버튼을 이용해 주세요.",
      en: "Sign in through your browser to manage records. The buttons below open general app stores, not OneHand CRM installation pages. Use the start button below to access the web product."
    },
    keywords: {
      ko: [
        "OneHand CRM",
        "고객 기록",
        "업무 기록",
        "OneHand CRM을 웹에서 시작해요"
      ],
      en: [
        "OneHand CRM",
        "customer records",
        "work records",
        "Start with OneHand CRM on the web"
      ]
    },
  },
  "/help": {
    title: {
      ko: "첫 기록부터, 다시 찾는 방법까지 | OneHand CRM",
      en: "From your first record to finding it again | OneHand CRM"
    },
    description: {
      ko: "OneHand CRM에서 기록을 추가하고 관리하는 기본 순서를 안내해요.",
      en: "Learn the basic steps for adding and managing records in OneHand CRM."
    },
    keywords: {
      ko: [
        "OneHand CRM",
        "고객 기록",
        "업무 기록",
        "첫 기록부터, 다시 찾는 방법까지"
      ],
      en: [
        "OneHand CRM",
        "customer records",
        "work records",
        "From your first record to finding it again"
      ]
    },
  },
  "/faq": {
    title: {
      ko: "사용 전에 궁금한 점을 확인해요 | OneHand CRM",
      en: "Questions before you get started | OneHand CRM"
    },
    description: {
      ko: "이용 방식, 현재 기능, 계정에 관한 질문을 모았어요.",
      en: "Answers about getting started, current features, and your account."
    },
    keywords: {
      ko: [
        "OneHand CRM",
        "고객 기록",
        "업무 기록",
        "사용 전에 궁금한 점을 확인해요"
      ],
      en: [
        "OneHand CRM",
        "customer records",
        "work records",
        "Questions before you get started"
      ]
    },
  },
  "/pricing": {
    title: {
      ko: "가격 정책 안내 | OneHand CRM",
      en: "Pricing availability | OneHand CRM"
    },
    description: {
      ko: "가격과 과금 기준은 아직 미정이에요. 요금제별 가격·무료 제공 범위·한도·포함 기능은 확정되지 않았어요.",
      en: "Pricing is not finalized. Plan prices, free access, limits, and included features remain unconfirmed."
    },
    keywords: {
      ko: [
        "OneHand CRM",
        "고객 기록",
        "업무 기록",
        "가격 정책 안내"
      ],
      en: [
        "OneHand CRM",
        "customer records",
        "work records",
        "Pricing availability"
      ]
    },
  },
  "/contact": {
    title: {
      ko: "문의 | 한손에 영업",
      en: "Contact | OneHand CRM",
    },
    description: {
      ko: "개인영업, 부동산, B2B 현장 영업, 보험·자동차 영업, 마케팅 후속관리 업무에 맞는 CRM 도입과 제품 문의를 남겨주세요.",
      en: "Contact OneHand CRM about CRM adoption for personal sales, real estate, field sales, B2B sales, and marketing follow-up workflows.",
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
        "OneHand CRM contact",
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
      ko: "OneHand CRM 소개 | OneHand CRM",
      en: "About OneHand CRM | OneHand CRM"
    },
    description: {
      ko: "고객과 업무 기록의 관리 부담을 줄이고, 내 일에 맞는 CRM을 만들어가는 제품 방향을 소개해요.",
      en: "Our direction: reduce the work of managing records and build a CRM shaped for the work you do."
    },
    keywords: {
      ko: [
        "OneHand CRM",
        "고객 기록",
        "업무 기록",
        "OneHand CRM 소개"
      ],
      en: [
        "OneHand CRM",
        "customer records",
        "work records",
        "About OneHand CRM"
      ]
    },
    schemaType: "AboutPage",
  },
  "/security": {
    title: {
      ko: "보안 및 제공 범위 | OneHand CRM",
      en: "Security and current scope | OneHand CRM"
    },
    description: {
      ko: "현재 계정·업무 공간 접근 기능과 개인정보·운영 범위를 확인하는 방법을 안내해요.",
      en: "Review current account and workspace access features and how to confirm privacy and operating requirements."
    },
    keywords: {
      ko: [
        "OneHand CRM",
        "고객 기록",
        "업무 기록",
        "보안 및 제공 범위"
      ],
      en: [
        "OneHand CRM",
        "customer records",
        "work records",
        "Security and current scope"
      ]
    },
  },
  "/terms": {
    title: {
      ko: "이용약관 | OneHand CRM",
      en: "Terms of service | OneHand CRM"
    },
    description: {
      ko: "OneHand CRM 서비스 이용에 적용되는 조건과 관련 안내를 확인해 주세요.",
      en: "Read the conditions and information that apply to the use of OneHand CRM."
    },
    keywords: {
      ko: [
        "OneHand CRM",
        "고객 기록",
        "업무 기록",
        "이용약관"
      ],
      en: [
        "OneHand CRM",
        "customer records",
        "work records",
        "Terms of service"
      ]
    },
  },
  "/privacy": {
    title: {
      ko: "개인정보 처리방침 | OneHand CRM",
      en: "Privacy policy | OneHand CRM"
    },
    description: {
      ko: "OneHand CRM의 개인정보 수집·이용·처리 관련 안내를 확인해 주세요.",
      en: "Read information about the collection, use, and processing of personal information by OneHand CRM."
    },
    keywords: {
      ko: [
        "OneHand CRM",
        "고객 기록",
        "업무 기록",
        "개인정보 처리방침"
      ],
      en: [
        "OneHand CRM",
        "customer records",
        "work records",
        "Privacy policy"
      ]
    },
  },
  "/login": {
    title: {
      ko: "로그인 | 한손에 영업",
      en: "Log in | OneHand CRM",
    },
    description: {
      ko: "한손에 영업 워크스페이스에 로그인하세요.",
      en: "Log in to your OneHand CRM workspace.",
    },
    keywords: {
      ko: ["한손에 영업 로그인"],
      en: ["OneHand CRM login"],
    },
    noindex: true,
  },
  "/signup": {
    title: {
      ko: "회원가입 | 한손에 영업",
      en: "Sign up | OneHand CRM",
    },
    description: {
      ko: "한손에 영업 계정을 만들고 개인 영업 워크스페이스를 시작하세요.",
      en: "Create a OneHand CRM account and start your sales workspace.",
    },
    keywords: {
      ko: ["한손에 영업 회원가입"],
      en: ["OneHand CRM sign up"],
    },
    noindex: true,
  },
};

// 기능 : 현재 공개 사이트 route에 맞는 브라우저 SEO 메타데이터를 적용합니다.
export function PublicSiteSeo() {
  // 1. 처리 흐름에 필요한 location 값을 준비한다.
  const location = useLocation();
  // 2. 처리 흐름에 필요한 metadata 값을 준비한다.
  const metadata = useMemo(
    () => getPublicSiteSeoMetadata(location.pathname),
    [location.pathname]
  );

  // 3. 렌더링 이후 필요한 동작을 실행한다.
  useEffect(() => {
    applyPublicSiteSeo(metadata);
  }, [metadata]);

  // 4. 계산된 결과를 호출자에게 반환한다.
  return null;
}

// 기능 : 공개 사이트 pathname에서 SEO 메타데이터 입력값을 계산합니다.
function getPublicSiteSeoMetadata(pathname: string): PublicSiteSeoMetadata {
  // 1. 이후 단계에서 사용할 language 값을 준비한다.
  const language = getPublicSiteLanguageFromPathname(pathname) ?? "ko";
  // 2. 이후 단계에서 사용할 publicPath 값을 준비한다.
  const publicPath = stripPublicSiteLocaleFromPathname(pathname);
  // 3. 이후 단계에서 사용할 routePath 값을 준비한다.
  const routePath = isPublicSiteLocalizedPath(publicPath) ? publicPath : "/";
  // 4. 이후 단계에서 사용할 copy 값을 준비한다.
  const copy = routeSeoCopy[routePath];
  // 5. 이후 단계에서 사용할 title 값을 준비한다.
  const title = getLocalizedSeoValue(copy.title, language);
  // 6. 이후 단계에서 사용할 description 값을 준비한다.
  const description = getLocalizedSeoValue(copy.description, language);

  // 7. 계산된 결과를 호출자에게 반환한다.
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

// 기능 : 공개 사이트 SEO 색인 대상 언어인지 확인합니다.
function isPublicSiteSeoLanguage(language: PublicSiteLanguage) {
  return publicSiteSeoLanguageValues.some((value) => value === language);
}

// 기능 : 언어별 SEO 문자열에서 현재 언어에 맞는 값을 선택합니다.
function getLocalizedSeoValue(
  values: Partial<Record<PublicSiteLanguage | "en", string>>,
  language: PublicSiteLanguage
) {
  return values[language] ?? values.en ?? values.ko ?? "OneHand CRM";
}

// 기능 : 언어별 SEO 키워드 목록에서 현재 언어에 맞는 값을 선택합니다.
function getLocalizedSeoKeywords(
  values: Partial<Record<PublicSiteLanguage | "en", readonly string[]>>,
  language: PublicSiteLanguage
) {
  return values[language] ?? values.en ?? values.ko ?? [];
}

// 기능 : 소프트웨어 스키마에 사용할 언어별 키워드 목록을 반환합니다.
function getSoftwareSeoKeywords(language: PublicSiteLanguage) {
  return language === "ko" ? homeKoreanSeoKeywords : homeEnglishSeoKeywords;
}

// 기능 : 소프트웨어 스키마에 사용할 언어별 대상 고객 목록을 반환합니다.
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

// 기능 : 소프트웨어 스키마에 사용할 언어별 기능 목록을 반환합니다.
function getSoftwareFeatureList(language: PublicSiteLanguage) {
  return language === "ko"
    ? [
        "고객 및 담당자 관리",
        "거래처 관리",
        "딜 파이프라인 관리",
        "영업 일정 및 재방문 일정 관리",
        "미팅노트와 회의록 정리",
        "후속 연락 관리",
        "제안, 견적, 계약 흐름 관리",
      ]
    : [
        "Customer and contact management",
        "Account management",
        "Deal pipeline tracking",
        "Sales schedule and revisit management",
        "Meeting notes",
        "Proposal, quote, and contract workflow tracking",
      ];
}

// 기능 : 계산된 SEO 메타데이터를 document head에 반영합니다.
function applyPublicSiteSeo(metadata: PublicSiteSeoMetadata) {
  const preserveCopy = ["/login", "/signup", "/contact"].includes(metadata.routePath);
  const brandName = preserveCopy ? "한손에 영업" : "OneHand CRM";
  const imageUrl = preserveCopy ? publicSiteOgImageUrl : `${publicSiteOrigin}/brand/og-onehand-crm-1200x630.png`;
  // 1. 현재 단계에서 필요한 동작을 실행한다.
  document.documentElement.lang = metadata.htmlLang;
  // 2. 현재 단계에서 필요한 동작을 실행한다.
  document.title = metadata.title;

  // 3. 현재 단계에서 필요한 동작을 실행한다.
  upsertMeta("name", "description", metadata.description);
  // 4. 현재 단계에서 필요한 동작을 실행한다.
  upsertMeta(
    "name",
    "robots",
    metadata.noindex
      ? "noindex,nofollow,noarchive"
      : "index,follow,max-image-preview:large"
  );
  // 5. 현재 단계에서 필요한 동작을 실행한다.
  upsertMeta("property", "og:type", "website");
  // 6. 현재 단계에서 필요한 동작을 실행한다.
  upsertMeta("property", "og:site_name", brandName);
  // 7. 현재 단계에서 필요한 동작을 실행한다.
  upsertMeta("property", "og:title", metadata.title);
  // 8. 현재 단계에서 필요한 동작을 실행한다.
  upsertMeta("property", "og:description", metadata.description);
  // 9. 현재 단계에서 필요한 동작을 실행한다.
  upsertMeta("property", "og:url", metadata.canonicalUrl);
  // 10. 현재 단계에서 필요한 동작을 실행한다.
  upsertMeta("property", "og:locale", metadata.ogLocale);
  // 11. 현재 단계에서 필요한 동작을 실행한다.
  replaceOgLocaleAlternates(metadata.language);
  // 12. 현재 단계에서 필요한 동작을 실행한다.
  upsertMeta("property", "og:image", imageUrl);
  // 13. 현재 단계에서 필요한 동작을 실행한다.
  upsertMeta("property", "og:image:width", "1200");
  // 14. 현재 단계에서 필요한 동작을 실행한다.
  upsertMeta("property", "og:image:height", "630");
  // 15. 현재 단계에서 필요한 동작을 실행한다.
  upsertMeta("property", "og:image:alt", metadata.title);
  // 16. 현재 단계에서 필요한 동작을 실행한다.
  upsertMeta("name", "twitter:card", "summary_large_image");
  // 17. 현재 단계에서 필요한 동작을 실행한다.
  upsertMeta("name", "twitter:title", metadata.title);
  // 18. 현재 단계에서 필요한 동작을 실행한다.
  upsertMeta("name", "twitter:description", metadata.description);
  // 19. 현재 단계에서 필요한 동작을 실행한다.
  upsertMeta("name", "twitter:image", imageUrl);
  // 20. 현재 단계에서 필요한 동작을 실행한다.
  upsertMeta("name", "twitter:image:alt", metadata.title);
  // 21. 현재 단계에서 필요한 동작을 실행한다.
  upsertMeta("name", "application-name", brandName);
  // 22. 현재 단계에서 필요한 동작을 실행한다.
  upsertMeta("name", "apple-mobile-web-app-title", brandName);
  // 23. 현재 단계에서 필요한 동작을 실행한다.
  upsertMeta(
    "name",
    "keywords",
    getLocalizedSeoKeywords(routeSeoCopy[metadata.routePath].keywords, metadata.language).join(", ")
  );
  // 24. 현재 단계에서 필요한 동작을 실행한다.
  upsertMeta("name", "theme-color", "#ffffff");

  // 25. 현재 단계에서 필요한 동작을 실행한다.
  upsertCanonical(metadata.canonicalUrl);
  // 26. 현재 단계에서 필요한 동작을 실행한다.
  replaceAlternateLinks(metadata.routePath);
  // 27. 현재 단계에서 필요한 동작을 실행한다.
  replaceJsonLd(metadata);
}

// 기능 : Open Graph locale alternate meta 태그를 현재 언어 기준으로 교체합니다.
function replaceOgLocaleAlternates(currentLanguage: PublicSiteLanguage) {
  document.head
    .querySelectorAll<HTMLMetaElement>('meta[data-onehand-seo="og-locale-alternate"]')
    .forEach((meta) => meta.remove());

  publicSiteSeoLanguageValues
    .filter((language) => language !== currentLanguage)
    .forEach((language) => {
      // 1. 이후 단계에서 사용할 meta 값을 준비한다.
      const meta = document.createElement("meta");
      // 2. 현재 단계에서 필요한 동작을 실행한다.
      meta.dataset.onehandSeo = "og-locale-alternate";
      // 3. 화면 상태를 현재 흐름에 맞게 갱신한다.
      meta.setAttribute("property", "og:locale:alternate");
      // 4. 현재 단계에서 필요한 동작을 실행한다.
      meta.content = ogLocaleByLanguage[language];
      // 5. 현재 단계에서 필요한 동작을 실행한다.
      document.head.appendChild(meta);
    });
}

// 기능 : head meta 태그를 생성하거나 기존 값을 갱신합니다.
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

// 기능 : canonical link 태그를 하나만 유지하며 갱신합니다.
function upsertCanonical(href: string) {
  // 1. 이후 단계에서 사용할 canonical 값을 준비한다.
  let canonical = document.head.querySelector<HTMLLinkElement>(
    'link[rel="canonical"]'
  );

  // 2. 조건을 확인해 필요한 분기 처리를 수행한다.
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.rel = "canonical";
    document.head.appendChild(canonical);
  }

  // 3. 현재 단계에서 필요한 동작을 실행한다.
  canonical.href = href;

  // 4. 이후 단계에서 사용할 extraCanonicals 값을 준비한다.
  const extraCanonicals = Array.from(
    document.head.querySelectorAll<HTMLLinkElement>('link[rel="canonical"]')
  ).slice(1);

  // 5. 현재 단계에서 필요한 동작을 실행한다.
  extraCanonicals.forEach((link) => link.remove());
}

// 기능 : 현재 공개 사이트 route의 hreflang alternate link 태그를 교체합니다.
function replaceAlternateLinks(routePath: PublicSiteLocalizedPath) {
  // 1. 현재 단계에서 필요한 동작을 실행한다.
  document.head
    .querySelectorAll<HTMLLinkElement>('link[data-onehand-seo="alternate"]')
    .forEach((link) => link.remove());

  // 2. 현재 단계에서 필요한 동작을 실행한다.
  publicSiteSeoLanguageValues.forEach((language) => {
    // 1. 이후 단계에서 사용할 link 값을 준비한다.
    const link = document.createElement("link");
    // 2. 현재 단계에서 필요한 동작을 실행한다.
    link.dataset.onehandSeo = "alternate";
    // 3. 현재 단계에서 필요한 동작을 실행한다.
    link.href = `${publicSiteOrigin}${toPublicSitePath(language, routePath)}`;
    // 4. 현재 단계에서 필요한 동작을 실행한다.
    link.hreflang = htmlLangByLanguage[language];
    // 5. 현재 단계에서 필요한 동작을 실행한다.
    link.rel = "alternate";
    // 6. 현재 단계에서 필요한 동작을 실행한다.
    document.head.appendChild(link);
  });

  // 3. 이후 단계에서 사용할 defaultLink 값을 준비한다.
  const defaultLink = document.createElement("link");
  // 4. 현재 단계에서 필요한 동작을 실행한다.
  defaultLink.dataset.onehandSeo = "alternate";
  // 5. 현재 단계에서 필요한 동작을 실행한다.
  defaultLink.href = `${publicSiteOrigin}${toPublicSitePath("ko", routePath)}`;
  // 6. 현재 단계에서 필요한 동작을 실행한다.
  defaultLink.hreflang = "x-default";
  // 7. 현재 단계에서 필요한 동작을 실행한다.
  defaultLink.rel = "alternate";
  // 8. 현재 단계에서 필요한 동작을 실행한다.
  document.head.appendChild(defaultLink);
}

// 기능 : 현재 route의 JSON-LD 구조화 데이터를 교체합니다.
function replaceJsonLd(metadata: PublicSiteSeoMetadata) {
  // 1. 현재 단계에서 필요한 동작을 실행한다.
  document.head
    .querySelectorAll<HTMLScriptElement>('script[data-onehand-seo="json-ld"]')
    .forEach((script) => script.remove());

  // 2. 이후 단계에서 사용할 script 값을 준비한다.
  const script = document.createElement("script");
  // 3. 현재 단계에서 필요한 동작을 실행한다.
  script.dataset.onehandSeo = "json-ld";
  // 4. 현재 단계에서 필요한 동작을 실행한다.
  script.type = "application/ld+json";
  // 5. 현재 단계에서 필요한 동작을 실행한다.
  script.textContent = JSON.stringify(getJsonLd(metadata));
  // 6. 현재 단계에서 필요한 동작을 실행한다.
  document.head.appendChild(script);
}

// 기능 : 현재 route와 언어에 맞는 JSON-LD 객체를 생성합니다.
function getJsonLd(metadata: PublicSiteSeoMetadata) {
  const keywords = getLocalizedSeoKeywords(
    routeSeoCopy[metadata.routePath].keywords,
    metadata.language
  );

  const preserveCopy = ["/login", "/signup", "/contact"].includes(metadata.routePath);
  const currentSoftware = {
    "@id": `${publicSiteOrigin}/#software`,
    "@type": "SoftwareApplication",
    applicationCategory: "BusinessApplication",
    applicationSubCategory: "Customer and work record management",
    name: "OneHand CRM",
    operatingSystem: "Web",
    url: `${publicSiteOrigin}/ko`,
    description: metadata.language === "ko" ? "고객과 업무 정보를 기록하고 수정하며, 검색과 보기로 확인하는 CRM이에요." : "A CRM for recording, updating, and finding customer and work information.",
    featureList: metadata.language === "ko" ? ["업무 공간", "기록 추가와 수정", "테이블·칸반·리스트 조회", "목록 검색", "보기 즐겨찾기"] : ["Workspaces", "Record creation and editing", "Table, board, and list views", "Collection search", "View favorites"],
  };
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@id": `${publicSiteOrigin}/#organization`,
        "@type": "Organization",
        alternateName: preserveCopy ? "한손에 영업" : "OneHandCRM",
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "customer support",
          email: "team@onehandsales.com",
        },
        logo: publicSiteLogoUrl,
        name: "OneHand CRM",
        url: publicSiteOrigin,
      },
      {
        "@id": `${publicSiteOrigin}/#website`,
        "@type": "WebSite",
        inLanguage: metadata.htmlLang,
        name: "OneHand CRM",
        publisher: { "@id": `${publicSiteOrigin}/#organization` },
        url: publicSiteOrigin,
      },
      preserveCopy ? {
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
        name: "OneHand CRM",
        offers: {
          "@type": "Offer",
          category: "SaaS",
          url: `${publicSiteOrigin}/ko/pricing`,
        },
        operatingSystem: "Web",
        url: `${publicSiteOrigin}/ko`,
      } : currentSoftware,
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
