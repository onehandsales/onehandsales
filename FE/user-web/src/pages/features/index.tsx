import {
  BrainCircuit,
  BriefcaseBusiness,
  CalendarDays,
  FileSpreadsheet,
  FileText,
  ListChecks,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import {
  FinalSection,
  PublicContentContainer,
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
  readonly bullets: readonly string[];
  readonly id: string;
  readonly summary: string;
  readonly title: string;
  readonly to: string;
};

type FeaturesCopy = {
  readonly actionLabel: string;
  readonly contentsLabel: string;
  readonly ctaDescription: string;
  readonly ctaTitle: string;
  readonly description: string;
  readonly items: readonly FeatureItemCopy[];
  readonly title: string;
};

const featureIcons: readonly LucideIcon[] = [
  UsersRound,
  BriefcaseBusiness,
  CalendarDays,
  FileText,
  BrainCircuit,
  ListChecks,
  FileSpreadsheet,
];

const featuresCopyByLanguage: Record<PublicSiteCopyLanguage, FeaturesCopy> = {
  ko: {
    title: "영업 흐름을 놓치지 않기 위한 주요 기능.",
    description:
      "고객 관리, 파이프라인, 일정/팔로업, 활동 기록, AI, 리포트, 엑셀 데이터를 한 흐름으로 정리해요.",
    actionLabel: "자세히 보기",
    contentsLabel: "주요 기능 목차",
    ctaTitle: "기능을 보고 바로 시작해볼까요?",
    ctaDescription:
      "흩어진 영업 기록을 OneHand에서 정리해요.",
    items: [
      {
        id: "customers",
        title: "고객 관리",
        to: "/features/customers",
        summary: "회사와 담당자를 함께 정리하고 상담 맥락을 유지해요.",
        bullets: [
          "회사, 담당자, 연락처를 한곳에서 관리",
          "고객별 메모와 상담 흐름 확인",
          "개인 영업과 작은 팀 모두에 맞는 기본 데이터 구조",
        ],
      },
      {
        id: "pipeline",
        title: "영업 파이프라인",
        to: "/features/pipeline",
        summary: "진행 중인 거래와 다음 확인 지점을 함께 정리해요.",
        bullets: [
          "딜 단계, 금액, 마감일 관리",
          "고객, 회사, 일정과 연결된 거래 흐름",
          "우선 확인해야 할 딜을 빠르게 파악",
        ],
      },
      {
        id: "schedules-follow-up",
        title: "일정/팔로업",
        to: "/features/schedules-follow-up",
        summary: "방문, 미팅, 전화 후속 작업을 고객 흐름 안에서 확인해요.",
        bullets: [
          "영업 일정과 고객 정보를 함께 확인",
          "미팅 이후 다음 연락 시점 정리",
          "진행 중인 딜과 이어지는 후속 업무 관리",
        ],
      },
      {
        id: "activity-records",
        title: "활동 기록",
        to: "/features/activity-records",
        summary: "회의록, 메모, 고객 반응을 다음 대화로 이어지는 기록으로 남겨요.",
        bullets: [
          "상담 내용과 결정사항 기록",
          "회의록을 고객과 딜 맥락에 연결",
          "다음 행동을 다시 찾기 쉽게 정리",
        ],
      },
      {
        id: "ai-sales-assistant",
        title: "AI 영업 도우미",
        to: "/features/ai-sales-assistant",
        summary: "AI가 초안과 요약을 만들고 사용자가 확인한 뒤 저장해요.",
        bullets: [
          "회의록 요약과 후속 행동 초안",
          "AI 결과는 사용자 확인 후 저장",
          "반복적인 정리 작업의 시작점 생성",
        ],
      },
      {
        id: "reports",
        title: "리포트",
        to: "/features/reports",
        summary: "이번 주 일정, 딜 흐름, 다음 행동을 리포트로 확인해요.",
        bullets: [
          "주간 일정과 고객 미팅 흐름 확인",
          "마감이 가까운 딜과 후속 연락 점검",
          "AI 요약과 XLSX 다운로드 흐름 연결",
        ],
      },
      {
        id: "import-export",
        title: "엑셀 가져오기/내보내기",
        to: "/features/import-export",
        summary: "기존 엑셀 데이터를 가져오고 필요한 데이터를 다시 내려받아요.",
        bullets: [
          "회사, 담당자, 딜 데이터를 엑셀에서 가져오기",
          "검토 후 저장하는 import 흐름",
          "업무 기록을 XLSX로 다운로드",
        ],
      },
    ],
  },
  "en-US": {
    title: "Key features for keeping sales work moving.",
    description:
      "Organize customer management, pipeline, schedules, follow-up, activity records, AI, reports, and Excel data in one flow.",
    actionLabel: "View details",
    contentsLabel: "Key features",
    ctaTitle: "Ready to try the workflow?",
    ctaDescription:
      "Organize scattered sales records in OneHand.",
    items: [
      {
        id: "customers",
        title: "Customer management",
        to: "/features/customers",
        summary: "Keep companies, contacts, and consultation context together.",
        bullets: [
          "Manage companies, contacts, and contact details in one place",
          "Review notes and consultation flow by customer",
          "Use a simple data model for solo sellers and small teams",
        ],
      },
      {
        id: "pipeline",
        title: "Sales pipeline",
        to: "/features/pipeline",
        summary: "Track active deals and the next checkpoint together.",
        bullets: [
          "Manage deal stages, value, and due dates",
          "Connect deal flow to customers, companies, and schedules",
          "See which deals need attention first",
        ],
      },
      {
        id: "schedules-follow-up",
        title: "Schedule and follow-up",
        to: "/features/schedules-follow-up",
        summary: "Track visits, meetings, calls, and follow-up in customer context.",
        bullets: [
          "Review sales schedules with customer information",
          "Organize next contact timing after meetings",
          "Manage follow-up connected to active deals",
        ],
      },
      {
        id: "activity-records",
        title: "Activity records",
        to: "/features/activity-records",
        summary: "Keep notes, customer reactions, and decisions ready for the next conversation.",
        bullets: [
          "Capture consultation notes and decisions",
          "Connect meeting notes to customer and deal context",
          "Make next actions easier to find again",
        ],
      },
      {
        id: "ai-sales-assistant",
        title: "AI sales assistant",
        to: "/features/ai-sales-assistant",
        summary: "Let AI draft and summarize while users review before saving.",
        bullets: [
          "Draft meeting summaries and follow-up actions",
          "Save AI output only after user review",
          "Create faster starting points for repetitive cleanup",
        ],
      },
      {
        id: "reports",
        title: "Reports",
        to: "/features/reports",
        summary: "Review this week's schedules, deal movement, and next actions.",
        bullets: [
          "Review weekly schedules and customer meetings",
          "Check deals close to due dates and missing follow-up",
          "Connect AI summaries and XLSX download workflows",
        ],
      },
      {
        id: "import-export",
        title: "Excel import/export",
        to: "/features/import-export",
        summary: "Bring in existing spreadsheets and download records when needed.",
        bullets: [
          "Import company, contact, and deal data from Excel",
          "Review imported rows before saving",
          "Download work records as XLSX",
        ],
      },
    ],
  },
};

// 기능 : 공개 기능 허브 페이지를 렌더링합니다.
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
          <PublicDocumentHero title={copy.title} />

          <div className="mt-16">
            <p className="max-w-[720px] break-keep text-[15px] leading-7 text-[#555550]">
              {copy.description}
            </p>

            <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {copy.items.map((item, index) => (
                <PublicInfoCard
                  actionLabel={copy.actionLabel}
                  description={item.summary}
                  icon={featureIcons[index] ?? UsersRound}
                  key={item.id}
                  title={item.title}
                  to={item.to}
                />
              ))}
            </div>
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
        </PublicContentContainer>
      </PublicPageSection>
      <FinalSection
        copy={{
          description: copy.ctaDescription,
          title: copy.ctaTitle,
        }}
      />
    </PublicSitePageShell>
  );
}
