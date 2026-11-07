import {
  BrainCircuit,
  BriefcaseBusiness,
  CalendarDays,
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
];

const featuresCopyByLanguage: Record<PublicSiteCopyLanguage, FeaturesCopy> = {
  ko: {
    title: "기록 관리에 필요한 기능.",
    description:
      "지금 사용할 수 있는 기능과 아직 제공하지 않는 기능을 확인해 보세요.",
    actionLabel: "자세히 보기",
    contentsLabel: "주요 기능 목차",
    ctaTitle: "지금 필요한 기록부터 시작해요.",
    ctaDescription:
      "고객과 업무 정보를 기록하고 다시 찾아보세요.",
    items: [
      {
        id: "customers",
        title: "고객 정보 관리",
        to: "/features/customers",
        summary: "고객 정보를 기록하고, 변경된 내용은 목록에서 바로 수정해요.",
        bullets: [
          "관리할 고객을 추가하고, 화면에 마련된 정보 칸을 채워요.",
          "바뀐 정보를 확인하면 현재 목록에서 내용을 고쳐요.",
          "현재 고객 목록에서 검색하고 자주 보는 화면을 즐겨찾기에 모아둬요.",
        ],
      },
      {
        id: "pipeline",
        title: "진행 상태 보기",
        to: "/features/pipeline",
        summary: "이용 가능한 테이블과 칸반 보기에서 기록의 현재 상태를 확인해요.",
        bullets: [
          "테이블에서 여러 기록과 정보를 함께 살펴봐요.",
          "칸반 보기가 마련된 목록에서는 같은 상태의 기록을 모아서 확인해요.",
          "조회 기능과 아직 제공하지 않는 자동화 기능을 구분해 안내해요.",
        ],
      },
      {
        id: "schedules-follow-up",
        title: "일정·팔로업 안내",
        to: "/features/schedules-follow-up",
        summary: "전용 캘린더, 일정 알림, 자동 후속 연락은 현재 제공하지 않아요.",
        bullets: [
          "현재 전용 캘린더와 외부 캘린더 연결을 제공하지 않아요.",
          "자동 연락과 연락 시점 알림은 현재 제공하지 않아요.",
          "현재는 고객과 업무 정보의 기록·수정·조회를 중심으로 제공해요.",
        ],
      },
      {
        id: "activity-records",
        title: "업무 기록 관리",
        to: "/features/activity-records",
        summary: "필요한 정보를 입력하고 수정하며, 다음에 다시 확인할 기록을 관리해요.",
        bullets: [
          "관리할 항목에 기록을 추가하고 지원하는 정보 칸을 채워요.",
          "업무에서 새롭게 확인한 내용은 목록에서 수정해요.",
          "기본 기록 관리와 전용 미팅·활동 기능은 구분돼요.",
        ],
      },
      {
        id: "ai-sales-assistant",
        title: "AI 기능 안내",
        to: "/features/ai-sales-assistant",
        summary: "AI 요약, 메시지 초안, 다음 행동 추천은 현재 제공 기능에 포함되지 않아요.",
        bullets: [
          "상담 내용을 AI가 요약하거나 메시지 초안을 만드는 기능은 현재 제공하지 않아요.",
          "AI가 고객 우선순위를 정하거나 후속 업무를 자동 실행하지 않아요.",
          "정보를 직접 기록하고 수정하며, 검색과 보기로 확인할 수 있어요.",
        ],
      },
      {
        id: "reports",
        title: "리포트 기능 안내",
        to: "/features/reports",
        summary: "자동 분석 대시보드, 주간 리포트, 리포트 다운로드는 현재 제공하지 않아요.",
        bullets: [
          "테이블과 이용 가능한 보기에서 등록한 기록을 확인할 수 있어요.",
          "자동 집계와 성과 분석 리포트는 현재 제공하지 않아요.",
          "리포트 자동 발송과 파일 다운로드는 현재 제공 범위에 포함되지 않아요.",
        ],
      },
    ],
  },
  "en-US": {
    title: "Features for managing your records.",
    description:
      "See what you can use today and which features are not currently available.",
    actionLabel: "View details",
    contentsLabel: "Core Features",
    ctaTitle: "Start with the records you need today.",
    ctaDescription:
      "Record customer and work information, then find it again.",
    items: [
      {
        id: "customers",
        title: "Customer records",
        to: "/features/customers",
        summary: "Record customer information and update supported details directly in the table.",
        bullets: [
          "Add a customer and fill in the information available on screen.",
          "Edit changed information in the collection you are viewing.",
          "Search the current customer collection and save frequently used views as favorites.",
        ],
      },
      {
        id: "pipeline",
        title: "Progress views",
        to: "/features/pipeline",
        summary: "See records in available table and board views.",
        bullets: [
          "See multiple records and their information together.",
          "When a board view is available, see records grouped by status.",
          "Record viewing is separate from automation that is not available today.",
        ],
      },
      {
        id: "schedules-follow-up",
        title: "Schedule availability",
        to: "/features/schedules-follow-up",
        summary: "A dedicated calendar, reminders, and automatic follow-up are not currently available.",
        bullets: [
          "A dedicated calendar and external calendar connections are not currently available.",
          "Automatic contact and reminders about when to follow up are not currently available.",
          "Current features focus on recording, updating, and viewing customer and work information.",
        ],
      },
      {
        id: "activity-records",
        title: "Work records",
        to: "/features/activity-records",
        summary: "Add and update information so you can return to it when you need it.",
        bullets: [
          "Choose a collection and fill in the supported information fields.",
          "Update supported details in the table as your work progresses.",
          "Basic record management is separate from dedicated meeting and activity features.",
        ],
      },
      {
        id: "ai-sales-assistant",
        title: "AI availability",
        to: "/features/ai-sales-assistant",
        summary: "AI summaries, message drafts, and next-action recommendations are not currently available.",
        bullets: [
          "AI conversation summaries and message drafts are not currently available.",
          "AI does not currently prioritize customers or execute follow-up work.",
          "Enter and edit information yourself, then use search and available views to review it.",
        ],
      },
      {
        id: "reports",
        title: "Report availability",
        to: "/features/reports",
        summary: "Automated dashboards, weekly reports, and report downloads are not currently available.",
        bullets: [
          "Review records in the table and other available views.",
          "Automatic reporting and performance analysis are not currently available.",
          "Automatic report delivery and file downloads are not currently available.",
        ],
      },
    ],
  },
};

// 기능 : 공개 기능 허브 페이지를 렌더링합니다.
export function FeaturesPage() {
  // 1. 처리 흐름에 필요한 { language } 값을 준비한다.
  const { language } = usePublicSiteLanguage();
  // 2. 이후 단계에서 사용할 copy 값을 준비한다.
  const copy = featuresCopyByLanguage[getPublicSiteCopyLanguage(language)];
  // 3. 이후 단계에서 사용할 tocItems 값을 준비한다.
  const tocItems = copy.items.map((item) => ({
    id: item.id,
    title: item.title,
  }));

  // 4. 계산된 결과를 호출자에게 반환한다.
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
