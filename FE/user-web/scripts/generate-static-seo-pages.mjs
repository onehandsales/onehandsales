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
    priority: "1.0",
    changefreq: "weekly",
    schemaType: "WebPage",
  },
  "/pricing": {
    title: { ko: "가격 | 한손에 영업", en: "Pricing | OneHand Sales" },
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
    priority: "0.8",
    changefreq: "monthly",
    schemaType: "WebPage",
  },
  "/contact": {
    title: { ko: "문의 | 한손에 영업", en: "Contact | OneHand Sales" },
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
    priority: "0.7",
    changefreq: "monthly",
    schemaType: "ContactPage",
  },
  "/about": {
    title: { ko: "소개 | 한손에 영업", en: "About | OneHand Sales" },
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
    priority: "0.7",
    changefreq: "monthly",
    schemaType: "AboutPage",
  },
  "/security": {
    title: { ko: "보안 | 한손에 영업", en: "Security | OneHand Sales" },
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
    priority: "0.6",
    changefreq: "monthly",
    schemaType: "WebPage",
  },
  "/terms": {
    title: { ko: "이용약관 | 한손에 영업", en: "Terms | OneHand Sales" },
    description: {
      ko: "한손에 영업 서비스 이용 조건과 사용자 책임을 확인하세요.",
      en: "Review the OneHand Sales terms of service and user responsibilities.",
    },
    keywords: { ko: ["한손에 영업 이용약관", "OneHand Sales terms"], en: ["OneHand Sales terms", "sales CRM terms"] },
    priority: "0.4",
    changefreq: "yearly",
    schemaType: "WebPage",
  },
  "/privacy": {
    title: { ko: "개인정보 처리방침 | 한손에 영업", en: "Privacy Policy | OneHand Sales" },
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
    priority: "0.4",
    changefreq: "yearly",
    schemaType: "WebPage",
  },
  "/login": {
    title: { ko: "로그인 | 한손에 영업", en: "Log in | OneHand Sales" },
    description: { ko: "한손에 영업 워크스페이스에 로그인하세요.", en: "Log in to your OneHand Sales workspace." },
    keywords: { ko: ["한손에 영업 로그인"], en: ["OneHand Sales login"] },
    noindex: true,
    schemaType: "WebPage",
  },
  "/signup": {
    title: { ko: "회원가입 | 한손에 영업", en: "Sign up | OneHand Sales" },
    description: { ko: "한손에 영업 계정을 만들고 개인 영업 워크스페이스를 시작하세요.", en: "Create a OneHand Sales account and start your sales workspace." },
    keywords: { ko: ["한손에 영업 회원가입"], en: ["OneHand Sales sign up"] },
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

function renderHtml(html, language, routePath) {
  const route = routeSeo[routePath];
  const title = localized(route.title, language);
  const description = localized(route.description, language);
  const keywords = localizedList(route.keywords, language).join(", ");
  const canonicalUrl = `${origin}${toLocalizedPath(language, routePath)}`;
  const robots = route.noindex ? "noindex,nofollow,noarchive" : "index,follow,max-image-preview:large";
  const jsonLd = JSON.stringify(getJsonLd({ canonicalUrl, description, language, route, title }));

  let nextHtml = html
    .replace(/<html\s+lang="[^"]*"/i, `<html lang="${escapeAttribute(language.htmlLang)}"`)
    .replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(title)}</title>`);

  nextHtml = upsertMeta(nextHtml, "name", "description", description);
  nextHtml = upsertMeta(nextHtml, "name", "robots", robots);
  nextHtml = upsertMeta(nextHtml, "name", "keywords", keywords);
  nextHtml = upsertMeta(nextHtml, "property", "og:type", "website");
  nextHtml = upsertMeta(nextHtml, "property", "og:site_name", "한손에 영업");
  nextHtml = upsertMeta(nextHtml, "property", "og:title", title);
  nextHtml = upsertMeta(nextHtml, "property", "og:description", description);
  nextHtml = upsertMeta(nextHtml, "property", "og:url", canonicalUrl);
  nextHtml = upsertMeta(nextHtml, "property", "og:locale", language.ogLocale);
  nextHtml = upsertMeta(nextHtml, "property", "og:image", ogImageUrl);
  nextHtml = upsertMeta(nextHtml, "property", "og:image:alt", title);
  nextHtml = upsertMeta(nextHtml, "name", "twitter:title", title);
  nextHtml = upsertMeta(nextHtml, "name", "twitter:description", description);
  nextHtml = upsertMeta(nextHtml, "name", "twitter:image", ogImageUrl);
  nextHtml = upsertMeta(nextHtml, "name", "twitter:image:alt", title);
  nextHtml = upsertCanonical(nextHtml, canonicalUrl);
  nextHtml = replaceGeneratedMeta(nextHtml, "og-locale-alternate", renderOgLocaleAlternates(language));
  nextHtml = replaceGeneratedLinks(nextHtml, "alternate", renderAlternateLinks(routePath));
  nextHtml = nextHtml.replace(
    /<script(?=[^>]*data-onehand-seo="json-ld")[^>]*>[\s\S]*?<\/script>/i,
    `<script data-onehand-seo="json-ld" type="application/ld+json">${jsonLd}</script>`
  );

  return nextHtml;
}

function upsertMeta(html, attribute, key, content) {
  const pattern = new RegExp(`<meta(?=[^>]*\\s${attribute}="${escapeRegExp(key)}")[^>]*>`, "i");
  const tag = `<meta ${attribute}="${escapeAttribute(key)}" content="${escapeAttribute(content)}" />`;

  return pattern.test(html)
    ? html.replace(pattern, tag)
    : html.replace("</head>", `    ${tag}\n  </head>`);
}

function upsertCanonical(html, href) {
  const tag = `<link rel="canonical" href="${escapeAttribute(href)}" />`;
  const pattern = /<link(?=[^>]*rel="canonical")[^>]*>/i;

  return pattern.test(html)
    ? html.replace(pattern, tag)
    : html.replace("</head>", `    ${tag}\n  </head>`);
}

function replaceGeneratedMeta(html, marker, replacement) {
  return html
    .replace(new RegExp(`\\n?\\s*<meta(?=[^>]*data-onehand-seo="${marker}")[^>]*>`, "gi"), "")
    .replace(/(<meta\s+property="og:locale"[^>]*>)/i, `$1\n${replacement}`);
}

function replaceGeneratedLinks(html, marker, replacement) {
  return html
    .replace(new RegExp(`\\n?\\s*<link(?=[^>]*data-onehand-seo="${marker}")[^>]*>`, "gi"), "")
    .replace(/(<link\s+rel="canonical"[^>]*>)/i, `$1\n${replacement}`);
}

function renderOgLocaleAlternates(currentLanguage) {
  return languages
    .filter((language) => language.value !== currentLanguage.value)
    .map((language) => `    <meta data-onehand-seo="og-locale-alternate" property="og:locale:alternate" content="${language.ogLocale}" />`)
    .join("\n");
}

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

function getSoftwareSeoKeywords(language) {
  return language.value === "ko" ? homeKoreanSeoKeywords : homeEnglishSeoKeywords;
}

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

function getJsonLd({ canonicalUrl, description, language, route, title }) {
  const keywords = localizedList(route.keywords, language);

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@id": `${origin}/#organization`,
        "@type": "Organization",
        alternateName: "한손에 영업",
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "customer support",
          email: "team@onehandsales.com",
        },
        logo: logoUrl,
        name: "OneHand Sales",
        url: origin,
      },
      {
        "@id": `${origin}/#website`,
        "@type": "WebSite",
        inLanguage: language.htmlLang,
        name: "OneHand Sales",
        publisher: { "@id": `${origin}/#organization` },
        url: origin,
      },
      {
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
        name: "OneHand Sales",
        offers: {
          "@type": "Offer",
          category: "SaaS",
          url: `${origin}/ko/pricing`,
        },
        operatingSystem: "Web",
        url: `${origin}/ko`,
      },
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

function toLocalizedPath(language, routePath) {
  return routePath === "/" ? `/${language.slug}` : `/${language.slug}${routePath}`;
}

function localized(values, language) {
  return values[language.value] ?? values.en ?? values.ko;
}

function localizedList(values, language) {
  return values[language.value] ?? values.en ?? values.ko ?? [];
}

function lowerPriority(priority) {
  return Math.max(0.3, Number(priority) - 0.1).toFixed(1);
}

function escapeAttribute(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function escapeHtml(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
