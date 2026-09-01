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
  "/product": {
    title: {
      ko: "제품 소개 | OneHand Sales",
      en: "Products Guide | OneHand Sales",
    },
    description: {
      ko: "고객, 회사, 딜, 일정, 회의록, AI 초안을 한 흐름으로 연결하는 OneHand Sales 제품 소개를 확인하세요.",
      en: "Explore the OneHand Sales product workflow for customers, companies, deals, schedules, meeting notes, and AI drafts.",
    },
    keywords: {
      ko: [
        "OneHand Sales 제품 소개",
        "OneHand란",
        "영업 CRM 제품",
        "개인 CRM 제품 소개",
        "현장 영업 CRM",
        "AI 영업 워크스페이스",
      ],
      en: [
        "Products Guide",
        "OneHand",
        "sales CRM product",
        "personal CRM overview",
        "field sales CRM",
        "AI sales workspace",
      ],
    },
  },
  "/features": {
    title: {
      ko: "기능 | OneHand Sales",
      en: "Features | OneHand Sales",
    },
    description: {
      ko: "고객 관리, 영업 파이프라인, 일정/팔로업, 활동 기록, AI 영업 도우미, 리포트, 엑셀 기능을 확인하세요.",
      en: "Explore OneHand Sales features for customer management, pipeline, schedules, follow-up, activity records, AI, reports, and Excel.",
    },
    keywords: {
      ko: [
        "OneHand Sales 기능",
        "영업 CRM 기능",
        "고객 관리 기능",
        "영업 파이프라인 기능",
        "영업 리포트",
        "엑셀 가져오기 CRM",
        "AI 영업 도우미",
      ],
      en: [
        "OneHand Sales features",
        "sales CRM features",
        "customer management features",
        "sales pipeline features",
        "sales reports",
        "Excel import CRM",
        "AI sales assistant",
      ],
    },
  },
  "/features/customers": {
    title: {
      ko: "고객 관리 | OneHand Sales",
      en: "Customer Management | OneHand Sales",
    },
    description: {
      ko: "회사, 담당자, 연락처, 상담 메모를 고객 맥락 안에서 함께 관리하는 OneHand Sales 고객 관리 기능을 확인하세요.",
      en: "See how OneHand Sales keeps companies, contacts, contact details, and consultation notes connected around each customer.",
    },
    keywords: {
      ko: ["고객 관리 CRM", "회사 관리 CRM", "담당자 관리", "영업 고객관리", "개인 CRM 고객관리"],
      en: ["customer management CRM", "company management CRM", "contact management", "sales customer management", "personal CRM"],
    },
  },
  "/features/pipeline": {
    title: {
      ko: "영업 파이프라인 | OneHand Sales",
      en: "Sales Pipeline | OneHand Sales",
    },
    description: {
      ko: "딜 단계, 금액, 마감일, 고객 맥락과 다음 행동을 함께 관리하는 OneHand Sales 영업 파이프라인 기능을 확인하세요.",
      en: "Explore OneHand Sales pipeline features for deal stages, value, due dates, customer context, and next actions.",
    },
    keywords: {
      ko: ["영업 파이프라인", "딜 관리 CRM", "거래 단계 관리", "영업 기회 관리", "후속 연락 관리"],
      en: ["sales pipeline", "deal management CRM", "deal stage management", "opportunity management", "follow-up CRM"],
    },
  },
  "/features/schedules-follow-up": {
    title: {
      ko: "일정/팔로업 | OneHand Sales",
      en: "Schedule and Follow-up | OneHand Sales",
    },
    description: {
      ko: "방문, 통화, 미팅 일정과 다음 연락을 고객과 딜에 연결하는 OneHand Sales 일정/팔로업 기능을 확인하세요.",
      en: "See how OneHand Sales connects visits, calls, meetings, and next follow-up timing to customers and deals.",
    },
    keywords: {
      ko: ["영업 일정 관리", "팔로업 관리", "후속 연락 CRM", "방문 일정 관리", "미팅 일정 관리"],
      en: ["sales schedule management", "follow-up management", "sales follow-up CRM", "visit scheduling", "meeting scheduling"],
    },
  },
  "/features/activity-records": {
    title: {
      ko: "활동 기록 | OneHand Sales",
      en: "Activity Records | OneHand Sales",
    },
    description: {
      ko: "회의록, 메모, 고객 반응, 다음 행동을 고객과 딜에 연결하는 OneHand Sales 활동 기록 기능을 확인하세요.",
      en: "Explore OneHand Sales activity records for meeting notes, memos, customer reactions, and next actions.",
    },
    keywords: {
      ko: ["영업 활동 기록", "회의록 CRM", "고객 메모", "상담 기록 관리", "미팅노트"],
      en: ["sales activity records", "meeting notes CRM", "customer memos", "consultation notes", "sales notes"],
    },
  },
  "/features/ai-sales-assistant": {
    title: {
      ko: "AI 영업 도우미 | OneHand Sales",
      en: "AI Sales Assistant | OneHand Sales",
    },
    description: {
      ko: "회의록 요약, 다음 행동 초안, 팔로업 정리를 사용자가 확인 가능한 방식으로 돕는 OneHand Sales AI 기능을 확인하세요.",
      en: "See how OneHand Sales AI helps summarize meeting notes, draft next actions, and organize follow-up under user review.",
    },
    keywords: {
      ko: ["AI 영업 도우미", "AI CRM", "회의록 요약 AI", "팔로업 초안", "영업 AI"],
      en: ["AI sales assistant", "AI CRM", "meeting summary AI", "follow-up drafts", "sales AI"],
    },
  },
  "/features/reports": {
    title: {
      ko: "리포트 | OneHand Sales",
      en: "Reports | OneHand Sales",
    },
    description: {
      ko: "주간 일정, 딜 흐름, 후속 행동, AI 요약을 점검하는 OneHand Sales 리포트 기능을 확인하세요.",
      en: "Explore OneHand Sales reports for weekly schedules, deal movement, follow-up, and AI summaries.",
    },
    keywords: {
      ko: ["영업 리포트", "주간 영업 리포트", "CRM 리포트", "일정 리포트", "AI 영업 리포트"],
      en: ["sales reports", "weekly sales report", "CRM reports", "schedule report", "AI sales report"],
    },
  },
  "/features/import-export": {
    title: {
      ko: "엑셀 가져오기/내보내기 | OneHand Sales",
      en: "Excel Import and Export | OneHand Sales",
    },
    description: {
      ko: "기존 엑셀 고객 데이터를 가져오고 필요한 업무 기록을 XLSX로 내려받는 OneHand Sales 데이터 기능을 확인하세요.",
      en: "See how OneHand Sales imports existing customer spreadsheets and exports work records as XLSX.",
    },
    keywords: {
      ko: ["CRM 엑셀 가져오기", "CRM 엑셀 내보내기", "고객 데이터 이전", "XLSX 다운로드", "엑셀 고객관리"],
      en: ["CRM Excel import", "CRM Excel export", "customer data migration", "XLSX download", "spreadsheet CRM"],
    },
  },
  "/solutions": {
    title: {
      ko: "솔루션 | OneHand Sales",
      en: "Solutions | OneHand Sales",
    },
    description: {
      ko: "개인 영업, 부동산 중개, 보험·자동차 영업, B2B 현장 영업에 맞는 OneHand Sales 활용 방식을 확인하세요.",
      en: "See how OneHand Sales fits personal sales, real estate, insurance, auto sales, and B2B field sales workflows.",
    },
    keywords: {
      ko: [
        "OneHand Sales 솔루션",
        "개인 영업 CRM",
        "부동산 CRM",
        "보험 영업 CRM",
        "자동차 영업 고객관리",
        "B2B 현장 영업 CRM",
      ],
      en: [
        "OneHand Sales solutions",
        "personal sales CRM",
        "real estate CRM",
        "insurance agent CRM",
        "auto sales CRM",
        "B2B field sales CRM",
      ],
    },
  },
  "/solutions/personal": {
    title: {
      ko: "개인 영업 CRM | OneHand Sales",
      en: "Personal Sales CRM | OneHand Sales",
    },
    description: {
      ko: "혼자 고객, 일정, 딜, 후속 연락을 관리하는 개인 영업자를 위한 OneHand Sales 활용 방식을 확인하세요.",
      en: "See how OneHand Sales helps personal sellers manage customers, schedules, deals, and follow-up on their own.",
    },
    keywords: {
      ko: [
        "개인 영업 CRM",
        "1인 영업 CRM",
        "개인 고객관리",
        "영업 후속 연락",
        "개인 딜 관리",
      ],
      en: [
        "personal sales CRM",
        "solo sales CRM",
        "individual sales CRM",
        "personal customer management",
        "sales follow-up CRM",
      ],
    },
  },
  "/solutions/real-estate": {
    title: {
      ko: "부동산 중개 CRM | OneHand Sales",
      en: "Real Estate CRM | OneHand Sales",
    },
    description: {
      ko: "부동산 중개 상담 고객, 관심 조건, 방문 일정, 계약 가능성을 고객별로 관리하는 OneHand Sales 활용 방식을 확인하세요.",
      en: "See how OneHand Sales helps real estate agents manage clients, property interest, visits, and deal readiness.",
    },
    keywords: {
      ko: [
        "부동산 CRM",
        "부동산 중개 CRM",
        "부동산 고객관리",
        "매물 문의 관리",
        "부동산 상담 관리",
      ],
      en: [
        "real estate CRM",
        "real estate agent CRM",
        "real estate client management",
        "property inquiry tracking",
        "real estate follow-up",
      ],
    },
  },
  "/solutions/insurance-auto": {
    title: {
      ko: "보험/자동차 영업 CRM | OneHand Sales",
      en: "Insurance and Auto Sales CRM | OneHand Sales",
    },
    description: {
      ko: "보험과 자동차 영업의 상담 이력, 견적, 서류, 계약 전후 연락, 갱신과 재구매 흐름을 관리하는 방식을 확인하세요.",
      en: "See how OneHand Sales helps insurance and auto sales teams manage consultations, quotes, documents, contracts, renewals, and repurchase timing.",
    },
    keywords: {
      ko: [
        "보험 영업 CRM",
        "자동차 영업 CRM",
        "자동차 영업 고객관리",
        "보험 설계사 고객관리",
        "견적 후속 연락",
      ],
      en: [
        "insurance agent CRM",
        "auto sales CRM",
        "car sales CRM",
        "quote follow-up CRM",
        "renewal follow-up CRM",
      ],
    },
  },
  "/solutions/b2b-field": {
    title: {
      ko: "B2B 현장 영업 CRM | OneHand Sales",
      en: "B2B Field Sales CRM | OneHand Sales",
    },
    description: {
      ko: "B2B 현장 영업의 거래처, 담당자, 미팅 기록, 딜 단계, 다음 행동을 한곳에서 관리하는 OneHand Sales 활용 방식을 확인하세요.",
      en: "See how OneHand Sales helps B2B field sellers connect accounts, contacts, meeting notes, deal stages, and next actions.",
    },
    keywords: {
      ko: [
        "B2B 현장 영업 CRM",
        "B2B 영업 CRM",
        "거래처 관리",
        "담당자 관리",
        "미팅 기록 CRM",
      ],
      en: [
        "B2B field sales CRM",
        "B2B sales CRM",
        "account management CRM",
        "meeting notes CRM",
        "field sales follow-up",
      ],
    },
  },
  "/download": {
    title: {
      ko: "다운로드 | OneHand Sales",
      en: "Download | OneHand Sales",
    },
    description: {
      ko: "iOS와 Android에서 OneHand Sales를 열고 모바일 영업 흐름을 확인하세요.",
      en: "Download OneHand Sales for iOS and Android and keep sales work moving on mobile.",
    },
    keywords: {
      ko: [
        "OneHand Sales 다운로드",
        "영업 CRM 앱",
        "모바일 CRM 앱",
        "iOS 영업 앱",
        "Android 영업 앱",
      ],
      en: [
        "OneHand Sales download",
        "sales CRM app",
        "mobile CRM app",
        "iOS sales app",
        "Android sales app",
      ],
    },
  },
  "/help": {
    title: {
      ko: "도움말 | OneHand Sales",
      en: "Help | OneHand Sales",
    },
    description: {
      ko: "OneHand Sales에서 고객, 딜, 일정, 회의록, 명함 스캔, 엑셀, 휴지통 복구를 시작하는 기본 사용 흐름을 확인하세요.",
      en: "Learn the basic OneHand Sales workflow for customers, deals, schedules, meeting notes, business card scanning, Excel, and trash restore.",
    },
    keywords: {
      ko: [
        "OneHand Sales 도움말",
        "OneHand Sales 사용법",
        "영업 CRM 도움말",
        "CRM 사용 가이드",
        "명함 스캔 도움말",
        "CRM 엑셀 가져오기",
      ],
      en: [
        "OneHand Sales help",
        "OneHand Sales guide",
        "sales CRM help",
        "CRM user guide",
        "business card scanning help",
        "CRM Excel import",
      ],
    },
  },
  "/faq": {
    title: {
      ko: "자주 묻는 질문 | OneHand Sales",
      en: "FAQ | OneHand Sales",
    },
    description: {
      ko: "OneHand Sales의 무료 사용, 모바일, AI, 엑셀 다운로드, 휴지통 복구, 로그인, 팀 사용 FAQ를 확인하세요.",
      en: "Find answers about OneHand Sales pricing, mobile use, AI, Excel export, trash restore, sign-in, and team usage.",
    },
    keywords: {
      ko: [
        "OneHand Sales FAQ",
        "OneHand Sales 자주 묻는 질문",
        "CRM 엑셀 다운로드",
        "CRM 휴지통 복구",
        "AI CRM 도움말",
      ],
      en: [
        "OneHand Sales FAQ",
        "OneHand Sales questions",
        "sales CRM FAQ",
        "CRM Excel export",
        "CRM trash restore",
        "AI CRM help",
      ],
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
      ko: "서비스 이용약관 | 한손에 영업",
      en: "Terms of Service | OneHand Sales",
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

// 기능 : 현재 공개 사이트 route에 맞는 브라우저 SEO 메타데이터를 적용합니다.
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

// 기능 : 공개 사이트 pathname에서 SEO 메타데이터 입력값을 계산합니다.
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

// 기능 : 공개 사이트 SEO 색인 대상 언어인지 확인합니다.
function isPublicSiteSeoLanguage(language: PublicSiteLanguage) {
  return publicSiteSeoLanguageValues.some((value) => value === language);
}

// 기능 : 언어별 SEO 문자열에서 현재 언어에 맞는 값을 선택합니다.
function getLocalizedSeoValue(
  values: Partial<Record<PublicSiteLanguage | "en", string>>,
  language: PublicSiteLanguage
) {
  return values[language] ?? values.en ?? values.ko ?? "OneHand Sales";
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

// 기능 : 계산된 SEO 메타데이터를 document head에 반영합니다.
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

// 기능 : Open Graph locale alternate meta 태그를 현재 언어 기준으로 교체합니다.
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

// 기능 : 현재 공개 사이트 route의 hreflang alternate link 태그를 교체합니다.
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

// 기능 : 현재 route의 JSON-LD 구조화 데이터를 교체합니다.
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

// 기능 : 현재 route와 언어에 맞는 JSON-LD 객체를 생성합니다.
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
