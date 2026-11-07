import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, "../dist");
const indexPath = path.join(distDir, "index.html");
const origin = "https://www.onehandsales.com";
const ogImageUrl = `${origin}/brand/og-image-1200x630.png`;
const logoUrl = `${origin}/brand/seo-icon-white-square.svg`;

const languages = [
  { value: "ko", slug: "ko", htmlLang: "ko-KR", ogLocale: "ko_KR" },
  { value: "en-US", slug: "en-us", htmlLang: "en-US", ogLocale: "en_US" },
  { value: "en-CA", slug: "en-ca", htmlLang: "en-CA", ogLocale: "en_CA" },
];

// Future static SEO locale candidates: ja, en-gb, en-sg, en-au.
// Keep them out of generated pages until copy, legal, pricing, support, SEO, and QA are confirmed.

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
];

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
];

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
];

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
];

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
];

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
];

const homeKoreanSeoKeywords = [
  ...coreKoreanSeoKeywords,
  ...workflowKoreanSeoKeywords,
  ...personaKoreanSeoKeywords,
];

const homeEnglishSeoKeywords = [
  ...coreEnglishSeoKeywords,
  ...workflowEnglishSeoKeywords,
  ...personaEnglishSeoKeywords,
];

const routeSeo = {
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
    priority: "1.0",
    changefreq: "weekly",
    schemaType: "WebPage",
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
    priority: "0.8",
    changefreq: "monthly",
    schemaType: "WebPage",
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
    priority: "0.8",
    changefreq: "monthly",
    schemaType: "WebPage",
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
    priority: "0.7",
    changefreq: "monthly",
    schemaType: "WebPage",
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
    priority: "0.7",
    changefreq: "monthly",
    schemaType: "WebPage",
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
    priority: "0.7",
    changefreq: "monthly",
    schemaType: "WebPage",
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
    priority: "0.7",
    changefreq: "monthly",
    schemaType: "WebPage",
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
    priority: "0.7",
    changefreq: "monthly",
    schemaType: "WebPage",
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
    priority: "0.7",
    changefreq: "monthly",
    schemaType: "WebPage",
  },
  "/features/import-export": {
    title: { ko: "엑셀 가져오기/내보내기 | OneHand CRM", en: "Excel Import and Export | OneHand CRM" },
    description: {
          ko: "기존 엑셀 고객 데이터를 가져오고 필요한 업무 기록을 XLSX로 내려받는 OneHand CRM 데이터 기능을 확인하세요.",
          en: "See how OneHand CRM imports existing customer spreadsheets and exports work records as XLSX.",
        },
    keywords: {
          ko: ["CRM 엑셀 가져오기", "CRM 엑셀 내보내기", "고객 데이터 이전", "XLSX 다운로드", "엑셀 고객관리"],
          en: ["CRM Excel import", "CRM Excel export", "customer data migration", "XLSX download", "spreadsheet CRM"],
        },
    priority: "0.7",
    changefreq: "monthly",
    schemaType: "WebPage",
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
    priority: "0.7",
    changefreq: "monthly",
    schemaType: "WebPage",
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
    priority: "0.7",
    changefreq: "monthly",
    schemaType: "WebPage",
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
    priority: "0.7",
    changefreq: "monthly",
    schemaType: "WebPage",
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
    priority: "0.7",
    changefreq: "monthly",
    schemaType: "WebPage",
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
    priority: "0.7",
    changefreq: "monthly",
    schemaType: "WebPage",
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
    priority: "0.6",
    changefreq: "monthly",
    schemaType: "WebPage",
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
    priority: "0.6",
    changefreq: "monthly",
    schemaType: "WebPage",
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
    priority: "0.6",
    changefreq: "monthly",
    schemaType: "WebPage",
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
    priority: "0.8",
    changefreq: "monthly",
    schemaType: "WebPage",
  },
  "/contact": {
    title: { ko: "문의 | 한손에 영업", en: "Contact | OneHand CRM" },
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
    priority: "0.7",
    changefreq: "monthly",
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
    priority: "0.7",
    changefreq: "monthly",
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
    priority: "0.6",
    changefreq: "monthly",
    schemaType: "WebPage",
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
    priority: "0.4",
    changefreq: "yearly",
    schemaType: "WebPage",
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
    priority: "0.4",
    changefreq: "yearly",
    schemaType: "WebPage",
  },
  "/login": {
    title: { ko: "로그인 | 한손에 영업", en: "Log in | OneHand CRM" },
    description: { ko: "한손에 영업 워크스페이스에 로그인하세요.", en: "Log in to your OneHand CRM workspace." },
    keywords: { ko: ["한손에 영업 로그인"], en: ["OneHand CRM login"] },
    noindex: true,
    schemaType: "WebPage",
  },
  "/signup": {
    title: { ko: "회원가입 | 한손에 영업", en: "Sign up | OneHand CRM" },
    description: { ko: "한손에 영업 계정을 만들고 개인 영업 워크스페이스를 시작하세요.", en: "Create a OneHand CRM account and start your sales workspace." },
    keywords: { ko: ["한손에 영업 회원가입"], en: ["OneHand CRM sign up"] },
    noindex: true,
    schemaType: "WebPage",
  },
};

const indexableRoutes = Object.entries(routeSeo).filter(([, route]) => !route.noindex);

const baseHtml = await fs.readFile(indexPath, "utf8");
const renderedRootHtml = renderHtml(baseHtml, languages[0], "/");
await fs.writeFile(indexPath, renderedRootHtml);

for (const language of languages) {
  for (const routePath of Object.keys(routeSeo)) {
    const localizedPath = toLocalizedPath(language, routePath);
    const html = renderHtml(baseHtml, language, routePath);
    const outputPath = path.join(distDir, localizedPath.slice(1), "index.html");

    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, html);
  }
}

await fs.writeFile(path.join(distDir, "sitemap.xml"), renderSitemap());

// 기능 : 정적 SEO HTML에 route와 언어별 메타데이터를 렌더링합니다.
function renderHtml(html, language, routePath) {
  const route = routeSeo[routePath];
  const preserveCopy = ["/login", "/signup", "/contact"].includes(routePath);
  const brandName = preserveCopy ? "한손에 영업" : "OneHand CRM";
  const imageUrl = preserveCopy ? ogImageUrl : `${origin}/brand/og-onehand-crm-1200x630.png`;
  const title = localized(route.title, language);
  const description = localized(route.description, language);
  const keywords = localizedList(route.keywords, language).join(", ");
  const canonicalUrl = `${origin}${toLocalizedPath(language, routePath)}`;
  const robots = route.noindex ? "noindex,nofollow,noarchive" : "index,follow,max-image-preview:large";
  const jsonLd = JSON.stringify(getJsonLd({ canonicalUrl, description, language, route, title, routePath }));

  let nextHtml = html
    .replace(/<html\s+lang="[^"]*"/i, `<html lang="${escapeAttribute(language.htmlLang)}"`)
    .replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(title)}</title>`);

  nextHtml = upsertMeta(nextHtml, "name", "description", description);
  nextHtml = upsertMeta(nextHtml, "name", "robots", robots);
  nextHtml = upsertMeta(nextHtml, "name", "keywords", keywords);
  nextHtml = upsertMeta(nextHtml, "property", "og:type", "website");
  nextHtml = upsertMeta(nextHtml, "property", "og:site_name", brandName);
  nextHtml = upsertMeta(nextHtml, "property", "og:title", title);
  nextHtml = upsertMeta(nextHtml, "property", "og:description", description);
  nextHtml = upsertMeta(nextHtml, "property", "og:url", canonicalUrl);
  nextHtml = upsertMeta(nextHtml, "property", "og:locale", language.ogLocale);
  nextHtml = upsertMeta(nextHtml, "property", "og:image", imageUrl);
  nextHtml = upsertMeta(nextHtml, "property", "og:image:alt", title);
  nextHtml = upsertMeta(nextHtml, "name", "twitter:title", title);
  nextHtml = upsertMeta(nextHtml, "name", "twitter:description", description);
  nextHtml = upsertMeta(nextHtml, "name", "twitter:image", imageUrl);
  nextHtml = upsertMeta(nextHtml, "name", "twitter:image:alt", title);
  nextHtml = upsertMeta(nextHtml, "name", "application-name", brandName);
  nextHtml = upsertMeta(nextHtml, "name", "apple-mobile-web-app-title", brandName);
  nextHtml = upsertCanonical(nextHtml, canonicalUrl);
  nextHtml = replaceGeneratedMeta(nextHtml, "og-locale-alternate", renderOgLocaleAlternates(language));
  nextHtml = replaceGeneratedLinks(nextHtml, "alternate", renderAlternateLinks(routePath));
  nextHtml = nextHtml.replace(
    /<script(?=[^>]*data-onehand-seo="json-ld")[^>]*>[\s\S]*?<\/script>/i,
    `<script data-onehand-seo="json-ld" type="application/ld+json">${jsonLd}</script>`
  );

  return nextHtml;
}

// 기능 : 정적 HTML 안의 meta 태그를 생성하거나 값을 교체합니다.
function upsertMeta(html, attribute, key, content) {
  const pattern = new RegExp(`<meta(?=[^>]*\\s${attribute}="${escapeRegExp(key)}")[^>]*>`, "i");
  const tag = `<meta ${attribute}="${escapeAttribute(key)}" content="${escapeAttribute(content)}" />`;

  return pattern.test(html)
    ? html.replace(pattern, tag)
    : html.replace("</head>", `    ${tag}\n  </head>`);
}

// 기능 : 정적 HTML 안의 canonical link 태그를 생성하거나 값을 교체합니다.
function upsertCanonical(html, href) {
  const tag = `<link rel="canonical" href="${escapeAttribute(href)}" />`;
  const pattern = /<link(?=[^>]*rel="canonical")[^>]*>/i;

  return pattern.test(html)
    ? html.replace(pattern, tag)
    : html.replace("</head>", `    ${tag}\n  </head>`);
}

// 기능 : 정적 HTML의 생성 메타 영역을 지정한 내용으로 교체합니다.
function replaceGeneratedMeta(html, marker, replacement) {
  return html
    .replace(new RegExp(`\\n?\\s*<meta(?=[^>]*data-onehand-seo="${marker}")[^>]*>`, "gi"), "")
    .replace(/(<meta\s+property="og:locale"[^>]*>)/i, `$1\n${replacement}`);
}

// 기능 : 정적 HTML의 생성 링크 영역을 지정한 내용으로 교체합니다.
function replaceGeneratedLinks(html, marker, replacement) {
  return html
    .replace(new RegExp(`\\n?\\s*<link(?=[^>]*data-onehand-seo="${marker}")[^>]*>`, "gi"), "")
    .replace(/(<link\s+rel="canonical"[^>]*>)/i, `$1\n${replacement}`);
}

// 기능 : 정적 HTML에 넣을 Open Graph locale alternate meta 문자열을 생성합니다.
function renderOgLocaleAlternates(currentLanguage) {
  return languages
    .filter((language) => language.value !== currentLanguage.value)
    .map((language) => `    <meta data-onehand-seo="og-locale-alternate" property="og:locale:alternate" content="${language.ogLocale}" />`)
    .join("\n");
}

// 기능 : 정적 HTML에 넣을 hreflang alternate link 문자열을 생성합니다.
function renderAlternateLinks(routePath) {
  const alternateLinks = languages.map(
    (language) =>
      `    <link data-onehand-seo="alternate" rel="alternate" hreflang="${language.htmlLang}" href="${origin}${toLocalizedPath(language, routePath)}" />`
  );

  alternateLinks.push(
    `    <link data-onehand-seo="alternate" rel="alternate" hreflang="x-default" href="${origin}${toLocalizedPath(languages[0], routePath)}" />`
  );

  return alternateLinks.join("\n");
}

// 기능 : 공개 사이트 색인 대상 route로 sitemap XML을 생성합니다.
function renderSitemap() {
  const urls = [];

  for (const language of languages) {
    for (const [routePath, route] of indexableRoutes) {
      const priority = language.value === "ko" ? route.priority : lowerPriority(route.priority);
      urls.push(
        `  <url><loc>${origin}${toLocalizedPath(language, routePath)}</loc><lastmod>2026-08-25</lastmod><changefreq>${route.changefreq}</changefreq><priority>${priority}</priority></url>`
      );
    }
  }

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`;
}

// 기능 : 정적 JSON-LD에 사용할 언어별 키워드 목록을 반환합니다.
function getSoftwareSeoKeywords(language) {
  return language.value === "ko" ? homeKoreanSeoKeywords : homeEnglishSeoKeywords;
}

// 기능 : 정적 JSON-LD에 사용할 언어별 대상 고객 목록을 반환합니다.
function getSoftwareSeoAudience(language) {
  return language.value === "ko"
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

// 기능 : 정적 JSON-LD에 사용할 언어별 기능 목록을 반환합니다.
function getSoftwareFeatureList(language) {
  return language.value === "ko"
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

// 기능 : 정적 SEO 페이지에 삽입할 JSON-LD 객체를 생성합니다.
function getJsonLd({ canonicalUrl, description, language, route, title, routePath }) {
  const keywords = localizedList(route.keywords, language);

  const preserveCopy = ["/login", "/signup", "/contact"].includes(routePath);
  const currentSoftware = {
    "@id": `${origin}/#software`,
    "@type": "SoftwareApplication",
    applicationCategory: "BusinessApplication",
    applicationSubCategory: "Customer and work record management",
    name: "OneHand CRM",
    operatingSystem: "Web",
    url: `${origin}/ko`,
    description: language.value === "ko" ? "고객과 업무 정보를 기록하고 수정하며, 검색과 보기로 확인하는 CRM이에요." : "A CRM for recording, updating, and finding customer and work information.",
    featureList: language.value === "ko" ? ["업무 공간", "기록 추가와 수정", "테이블·칸반·리스트 조회", "목록 검색", "보기 즐겨찾기"] : ["Workspaces", "Record creation and editing", "Table, board, and list views", "Collection search", "View favorites"],
  };
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@id": `${origin}/#organization`,
        "@type": "Organization",
        alternateName: preserveCopy ? "한손에 영업" : "OneHandCRM",
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "customer support",
          email: "team@onehandsales.com",
        },
        logo: logoUrl,
        name: "OneHand CRM",
        url: origin,
      },
      {
        "@id": `${origin}/#website`,
        "@type": "WebSite",
        inLanguage: language.htmlLang,
        name: "OneHand CRM",
        publisher: { "@id": `${origin}/#organization` },
        url: origin,
      },
      preserveCopy ? {
        "@id": `${origin}/#software`,
        "@type": "SoftwareApplication",
        applicationCategory: "BusinessApplication",
        applicationSubCategory: "Personal field sales CRM",
        audience: getSoftwareSeoAudience(language).map((audienceType) => ({
          "@type": "Audience",
          audienceType,
        })),
        description:
          language.value === "ko"
            ? "개인영업, 부동산 중개, B2B 현장 영업, 보험·자동차 영업의 고객관리, 미팅, 일정, 딜, 후속 연락을 한곳에서 관리하는 영업 CRM."
            : "A personal field sales CRM for real estate agents, B2B salespeople, insurance agents, car salespeople, schedules, meeting notes, deals, and follow-up.",
        featureList: getSoftwareFeatureList(language),
        keywords: getSoftwareSeoKeywords(language),
        name: "OneHand CRM",
        offers: {
          "@type": "Offer",
          category: "SaaS",
          url: `${origin}/ko/pricing`,
        },
        operatingSystem: "Web",
        url: `${origin}/ko`,
      } : currentSoftware,
      {
        "@id": `${canonicalUrl}#webpage`,
        "@type": route.schemaType,
        description,
        inLanguage: language.htmlLang,
        isPartOf: { "@id": `${origin}/#website` },
        keywords,
        name: title,
        url: canonicalUrl,
      },
    ],
  };
}

// 기능 : 언어와 공개 route를 locale prefix가 있는 정적 경로로 변환합니다.
function toLocalizedPath(language, routePath) {
  return routePath === "/" ? `/${language.slug}` : `/${language.slug}${routePath}`;
}

// 기능 : 언어별 문자열 map에서 현재 언어의 값을 선택합니다.
function localized(values, language) {
  return values[language.value] ?? values.en ?? values.ko;
}

// 기능 : 언어별 문자열 배열 map에서 현재 언어의 값을 선택합니다.
function localizedList(values, language) {
  return values[language.value] ?? values.en ?? values.ko ?? [];
}

// 기능 : sitemap alternate route에 사용할 우선순위 값을 한 단계 낮춥니다.
function lowerPriority(priority) {
  return Math.max(0.3, Number(priority) - 0.1).toFixed(1);
}

// 기능 : HTML attribute 값으로 안전하게 사용할 문자열로 이스케이프합니다.
function escapeAttribute(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

// 기능 : HTML 본문에 안전하게 넣을 수 있는 문자열로 이스케이프합니다.
function escapeHtml(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

// 기능 : 정규식 문자열 조합에 안전한 패턴으로 이스케이프합니다.
function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
