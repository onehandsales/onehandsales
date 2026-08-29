import {
  BrainCircuit,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Camera,
  FileSpreadsheet,
  FileText,
  Search,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import {
  FinalSection,
  PublicContentContainer,
  PublicCtaPanel,
  PublicDocumentHero,
  PublicDocumentSection,
  PublicInfoCard,
  PublicPageSection,
  PublicSitePageShell,
  PublicTableOfContents,
} from "@/features/public-site";
import {
  getPublicSiteCopyLanguage,
  usePublicSiteLanguage,
  type PublicSiteCopyLanguage,
} from "@/features/public-site/i18n/public-site-language";

type FeatureItemCopy = {
  readonly id: string;
  readonly title: string;
  readonly summary: string;
  readonly bullets: readonly string[];
};

type FeaturesCopy = {
  readonly contentsLabel: string;
  readonly ctaDescription: string;
  readonly ctaLabel: string;
  readonly ctaTitle: string;
  readonly description: string;
  readonly eyebrow: string;
  readonly finalTitle: string;
  readonly items: readonly FeatureItemCopy[];
  readonly title: string;
};

const featureIcons: readonly LucideIcon[] = [
  Building2,
  BriefcaseBusiness,
  CalendarDays,
  FileText,
  Camera,
  FileSpreadsheet,
  BrainCircuit,
  Search,
  ShieldCheck,
];

const featuresCopyByLanguage: Record<PublicSiteCopyLanguage, FeaturesCopy> = {
  ko: {
    eyebrow: "Features",
    title: "영업 흐름을 놓치지 않기 위한 핵심 기능.",
    description:
      "고객, 딜, 일정, 기록, 파일, AI 초안까지 개인 영업자가 매일 확인해야 하는 일을 한 흐름으로 정리합니다.",
    finalTitle: "OneHand 기능으로 영업 흐름을 정리하세요.",
    contentsLabel: "기능 목차",
    ctaTitle: "기능을 보고 바로 시작해볼까요?",
    ctaDescription:
      "OneHand는 복잡한 CRM을 다시 배우는 도구가 아니라, 지금 흩어진 영업 기록을 정리하는 작업 공간입니다.",
    ctaLabel: "OneHand 시작",
    items: [
      {
        id: "customers",
        title: "고객/회사 관리",
        summary: "회사와 담당자를 함께 정리하고 관계의 맥락을 유지합니다.",
        bullets: [
          "회사, 담당자, 연락처를 한곳에서 관리",
          "고객별 메모와 영업 흐름 확인",
          "개인 영업과 작은 팀 모두에 맞는 기본 데이터 구조",
        ],
      },
      {
        id: "deals",
        title: "딜 관리",
        summary: "진행 중인 거래와 다음 확인 지점을 놓치지 않게 정리합니다.",
        bullets: [
          "딜 단계, 금액, 마감일 관리",
          "고객/회사/일정과 연결된 거래 흐름",
          "우선 확인해야 할 딜을 빠르게 파악",
        ],
      },
      {
        id: "schedules",
        title: "일정",
        summary: "방문, 미팅, 전화 후속 작업을 고객 흐름 안에서 확인합니다.",
        bullets: [
          "영업 일정과 고객 정보를 함께 확인",
          "Google Calendar 연동을 고려한 일정 흐름",
          "지난 미팅 이후 해야 할 일을 다시 찾기 쉽게 정리",
        ],
      },
      {
        id: "meeting-notes",
        title: "회의록",
        summary: "미팅에서 나온 내용을 고객과 딜에 연결되는 기록으로 남깁니다.",
        bullets: [
          "상담 내용과 결정사항 기록",
          "회의록을 고객/딜 맥락과 연결",
          "AI 요약과 초안 작성 흐름에 연결 가능",
        ],
      },
      {
        id: "business-cards",
        title: "명함 스캔",
        summary: "현장에서 받은 명함을 고객 기록으로 이어지게 만듭니다.",
        bullets: [
          "명함 이미지를 바탕으로 담당자 기록 생성",
          "수정 확인 후 저장하는 흐름",
          "현장 영업 후 연락처 누락을 줄이는 구조",
        ],
      },
      {
        id: "import-export",
        title: "엑셀 가져오기/내보내기",
        summary: "기존 엑셀 데이터를 가져오고 필요한 데이터를 다시 내려받습니다.",
        bullets: [
          "회사, 담당자, 딜 데이터를 엑셀에서 가져오기",
          "검토 후 저장하는 import 흐름",
          "업무 기록을 XLSX로 다운로드",
        ],
      },
      {
        id: "ai",
        title: "AI 초안/요약",
        summary: "AI가 초안을 만들고 사용자가 확인한 뒤 저장하는 방식으로 돕습니다.",
        bullets: [
          "회의록 요약과 후속 행동 초안",
          "AI 결과는 자동 저장이 아니라 사용자 확인 후 저장",
          "반복적인 정리 작업의 시작점을 빠르게 생성",
        ],
      },
      {
        id: "search",
        title: "통합 검색",
        summary: "회사, 담당자, 딜, 기록을 한 번에 찾을 수 있게 합니다.",
        bullets: [
          "흩어진 영업 데이터를 빠르게 검색",
          "고객명, 회사명, 딜 맥락을 함께 탐색",
          "급한 통화나 외근 중에도 필요한 기록 확인",
        ],
      },
      {
        id: "security",
        title: "보안/휴지통 복구",
        summary: "개인 데이터와 실수로 삭제한 기록을 더 신중하게 다룹니다.",
        bullets: [
          "개인 데이터 보호를 전제로 한 워크플로우",
          "휴지통 복구로 실수 삭제 대응",
          "민감한 영업 기록을 다루는 보안 기준",
        ],
      },
    ],
  },
  "en-US": {
    eyebrow: "Features",
    title: "Core tools for keeping sales work moving.",
    description:
      "Keep customers, deals, schedules, notes, files, and AI drafts in one workflow for everyday sales work.",
    finalTitle: "Turn OneHand features into your daily sales flow.",
    contentsLabel: "Feature index",
    ctaTitle: "Ready to try the workflow?",
    ctaDescription:
      "OneHand is not another heavy CRM to learn. It is a workspace for organizing the sales records you already have.",
    ctaLabel: "Get OneHand",
    items: [
      {
        id: "customers",
        title: "Customer and company management",
        summary: "Keep companies, contacts, and relationship context together.",
        bullets: [
          "Manage companies, contacts, and contact details in one place",
          "Review notes and sales context by customer",
          "Use a simple data model for solo sellers and small teams",
        ],
      },
      {
        id: "deals",
        title: "Deal management",
        summary: "Track active deals and the next checkpoint without losing context.",
        bullets: [
          "Manage stages, value, and due dates",
          "Connect deals to customers, companies, and schedules",
          "See which deals need attention first",
        ],
      },
      {
        id: "schedules",
        title: "Schedules",
        summary: "Track visits, meetings, calls, and follow-up in customer context.",
        bullets: [
          "Review sales schedules with customer information",
          "Support a schedule flow designed around Google Calendar",
          "Find what needs to happen after each meeting",
        ],
      },
      {
        id: "meeting-notes",
        title: "Meeting notes",
        summary: "Turn meeting details into records connected to customers and deals.",
        bullets: [
          "Capture consultation notes and decisions",
          "Connect notes to customer and deal context",
          "Use notes as input for AI summaries and drafts",
        ],
      },
      {
        id: "business-cards",
        title: "Business card scanning",
        summary: "Turn cards collected in the field into customer records.",
        bullets: [
          "Create contact records from card images",
          "Review and edit before saving",
          "Reduce missed contacts after field meetings",
        ],
      },
      {
        id: "import-export",
        title: "Excel import and export",
        summary: "Bring in existing spreadsheets and download records when needed.",
        bullets: [
          "Import company, contact, and deal data from Excel",
          "Review imported rows before saving",
          "Download work records as XLSX",
        ],
      },
      {
        id: "ai",
        title: "AI drafts and summaries",
        summary: "Let AI draft the starting point while you stay in control.",
        bullets: [
          "Draft meeting summaries and follow-up actions",
          "AI output is saved only after user review",
          "Create a faster starting point for repetitive cleanup",
        ],
      },
      {
        id: "search",
        title: "Unified search",
        summary: "Find companies, contacts, deals, and records from one place.",
        bullets: [
          "Search across scattered sales data",
          "Explore customer, company, and deal context together",
          "Check records quickly during calls or field work",
        ],
      },
      {
        id: "security",
        title: "Security and trash restore",
        summary: "Handle personal data and deleted records with more care.",
        bullets: [
          "Workflows designed around personal data protection",
          "Recover mistakenly deleted records from trash",
          "Apply security basics to sensitive sales records",
        ],
      },
    ],
  },
};

// 기능 : 공개 기능 소개 페이지를 렌더링합니다.
export function FeaturesPage() {
  const { language } = usePublicSiteLanguage();
  const copy = featuresCopyByLanguage[getPublicSiteCopyLanguage(language)];
  const tocItems = copy.items.map((item) => ({
    id: item.id,
    title: item.title,
  }));

  return (
    <PublicSitePageShell>
      <PublicPageSection>
        <PublicContentContainer>
          <PublicDocumentHero
            description={copy.description}
            eyebrow={copy.eyebrow}
            title={copy.title}
          />

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {copy.items.map((item, index) => (
              <PublicInfoCard
                description={item.summary}
                icon={featureIcons[index] ?? Building2}
                key={item.id}
                title={item.title}
              />
            ))}
          </div>

          <PublicTableOfContents
            className="mt-12"
            items={tocItems}
            label={copy.contentsLabel}
          />

          <div className="mt-12 grid gap-12">
            {copy.items.map((item) => (
              <PublicDocumentSection
                bullets={item.bullets}
                id={item.id}
                key={item.id}
                paragraphs={[item.summary]}
                title={item.title}
              />
            ))}
          </div>

          <PublicCtaPanel
            className="mt-14"
            description={copy.ctaDescription}
            primaryAction={{ label: copy.ctaLabel, to: "/signup" }}
            title={copy.ctaTitle}
          />
        </PublicContentContainer>
      </PublicPageSection>
      <FinalSection copy={{ title: copy.finalTitle }} />
    </PublicSitePageShell>
  );
}
