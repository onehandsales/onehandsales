import {
  BrainCircuit,
  BriefcaseBusiness,
  CalendarDays,
  FileText,
  ListChecks,
  Search,
  Smartphone,
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

type ProductSectionCopy = {
  readonly bullets: readonly string[];
  readonly id: string;
  readonly paragraphs: readonly string[];
  readonly title: string;
};

type ProductCopy = {
  readonly contentsLabel: string;
  readonly ctaDescription: string;
  readonly ctaTitle: string;
  readonly description: string;
  readonly quickCards: readonly {
    readonly description: string;
    readonly title: string;
  }[];
  readonly sections: readonly ProductSectionCopy[];
  readonly title: string;
};

const quickCardIcons: readonly LucideIcon[] = [
  UsersRound,
  BriefcaseBusiness,
  BrainCircuit,
];

const sectionIcons: readonly LucideIcon[] = [
  ListChecks,
  UsersRound,
  CalendarDays,
  BrainCircuit,
  Smartphone,
  Search,
];

const productCopyByLanguage: Record<PublicSiteCopyLanguage, ProductCopy> = {
  ko: {
    title: "고객과 업무 기록을 한곳에서 관리해요.",
    description:
      "고객과 업무 정보를 기록하고, 필요한 화면에서 다시 확인하는 CRM이에요.",
    contentsLabel: "제품 소개 목차",
    ctaTitle: "내 업무 기록부터 정리해 볼까요?",
    ctaDescription:
      "지금 관리할 고객과 업무 정보를 OneHand CRM에 남겨보세요.",
    quickCards: [
      {
        title: "기록하기",
        description:
          "필요한 정보를 기록으로 남겨요.",
      },
      {
        title: "살펴보기",
        description:
          "이용 가능한 보기에서 기록을 확인해요.",
      },
      {
        title: "다시 찾기",
        description:
          "검색과 즐겨찾기로 필요한 화면을 찾아요.",
      },
    ],
    sections: [
      {
        id: "overview",
        title: "내 업무를 담는 공간",
        paragraphs: [
          "고객과 업무 정보를 업무 공간 안에서 관리해요.",
          "필요한 공간으로 전환하고, 관리할 항목에서 기록을 확인해요.",
        ],
        bullets: [
          "업무 공간을 만들고 전환해요.",
          "사이드바에서 관리할 항목을 찾아요.",
          "기록을 추가하고 목록에서 확인해요.",
        ],
      },
      {
        id: "workspace",
        title: "관리할 항목 구분하기",
        paragraphs: [
          "고객, 회사 등 내 업무에서 관리하는 대상을 구분해요.",
          "모든 정보를 하나의 목록에 섞지 않고 항목별로 기록할 수 있어요.",
        ],
        bullets: [
          "업무에 맞는 이름으로 항목을 만들어요.",
          "아이콘과 설명으로 항목을 알아보기 쉽게 해요.",
          "항목을 만들면 기본 테이블에서 시작해요.",
        ],
      },
      {
        id: "pipeline",
        title: "기록 추가와 수정",
        paragraphs: [
          "새 기록을 추가하고 화면에 마련된 정보 칸을 채워요.",
          "변경된 정보는 목록에서 직접 수정할 수 있어요.",
        ],
        bullets: [
          "관리할 기록을 추가해요.",
          "수정할 수 있는 정보는 셀에서 고쳐요.",
          "저장 결과를 확인하고 작업을 이어가요.",
        ],
      },
      {
        id: "assistant",
        title: "기록을 보는 방식",
        paragraphs: [
          "테이블·칸반·리스트 등 이용 가능한 보기에서 기록을 확인해요.",
          "사용할 수 있는 보기 방식은 선택한 목록에 따라 달라요.",
        ],
        bullets: [
          "테이블에서 여러 기록을 함께 확인해요.",
          "칸반 보기가 있으면 상태별로 살펴봐요.",
          "새 보기 설정 저장과 카드 이동은 현재 제공하지 않아요.",
        ],
      },
      {
        id: "mobile",
        title: "검색과 즐겨찾기",
        paragraphs: [
          "현재 목록에서 검색해 필요한 기록을 찾아요.",
          "자주 사용하는 보기는 즐겨찾기에 모아두고 다시 열어요.",
        ],
        bullets: [
          "현재 보고 있는 목록에서 검색해요.",
          "자주 사용하는 보기를 즐겨찾기에 추가해요.",
          "브라우저에서 업무 공간으로 다시 접속해요.",
        ],
      },
      {
        id: "fit",
        title: "우리가 만들어가는 방향",
        paragraphs: [
          "CRM을 배우거나 설계하지 않아도 내 일에 맞는 시작 화면이 준비되는 경험을 목표로 해요.",
          "업무별 CRM 자동 준비는 현재 제공 기능과 구분해 안내해요.",
        ],
        bullets: [
          "사용자가 하는 일을 이해하는 CRM을 지향해요.",
          "시작할 때 필요한 결정을 줄이려 해요.",
          "현재 기능과 앞으로의 방향을 구분해요.",
        ],
      },
    ],
  },
  "en-US": {
    title: "Customer and work records, in one place.",
    description:
      "Record customer and work information, update it, and find it when you need it.",
    contentsLabel: "Products Guide",
    ctaTitle: "Start with your first record.",
    ctaDescription:
      "Bring the customer and work information you manage into OneHand CRM.",
    quickCards: [
      {
        title: "Capture",
        description:
          "Keep the information you need in records.",
      },
      {
        title: "Review",
        description:
          "See your records in available views.",
      },
      {
        title: "Find again",
        description:
          "Use search and favorites to return to your work.",
      },
    ],
    sections: [
      {
        id: "overview",
        title: "A space for your work",
        paragraphs: [
          "Manage customer and work information in a workspace.",
          "Switch spaces and open the records you need from the sidebar.",
        ],
        bullets: [
          "Create and switch workspaces.",
          "Find the items you manage in the sidebar.",
          "Add records and review them in a table.",
        ],
      },
      {
        id: "workspace",
        title: "Organize what you manage",
        paragraphs: [
          "Keep customers, companies, or other work items in their own collections.",
          "Give each collection a name that makes sense for your work.",
        ],
        bullets: [
          "Name the items you manage.",
          "Use an icon and description to recognize them.",
          "Start with the default table when you create a collection.",
        ],
      },
      {
        id: "pipeline",
        title: "Add and update records",
        paragraphs: [
          "Add a record and fill in the information available on screen.",
          "Update editable information directly in the table.",
        ],
        bullets: [
          "Add the records you need.",
          "Edit supported values in their cells.",
          "Check the save result before moving on.",
        ],
      },
      {
        id: "assistant",
        title: "Choose how to view records",
        paragraphs: [
          "Review records in available table, board, or list views.",
          "The views available depend on the collection you open.",
        ],
        bullets: [
          "Review multiple records in a table.",
          "Use an available board to see records by status.",
          "Saving new view settings and dragging cards are not currently available.",
        ],
      },
      {
        id: "mobile",
        title: "Search and favorites",
        paragraphs: [
          "Search the current collection for a record.",
          "Save frequently used views as favorites and return to them from the sidebar.",
        ],
        bullets: [
          "Search within the current collection.",
          "Add frequently used views to favorites.",
          "Return to your workspace in a browser.",
        ],
      },
      {
        id: "fit",
        title: "The experience we are building",
        paragraphs: [
          "Our goal is a CRM that is ready for your work without having to learn or design it.",
          "Automatic work-specific CRM setup is a product direction, separate from the features available today.",
        ],
        bullets: [
          "Start with an understanding of your work.",
          "Reduce the decisions needed to get started.",
          "Distinguish current features from future direction.",
        ],
      },
    ],
  },
};

// 기능 : 공개 제품 소개 페이지를 렌더링합니다.
export function ProductPage() {
  // 1. 처리 흐름에 필요한 { language } 값을 준비한다.
  const { language } = usePublicSiteLanguage();
  // 2. 이후 단계에서 사용할 copy 값을 준비한다.
  const copy = productCopyByLanguage[getPublicSiteCopyLanguage(language)];
  // 3. 이후 단계에서 사용할 tocItems 값을 준비한다.
  const tocItems = copy.sections.map((section) => ({
    id: section.id,
    title: section.title,
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

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {copy.quickCards.map((card, index) => {
                const Icon = quickCardIcons[index] ?? UsersRound;

                return (
                  <PublicInfoCard
                    description={card.description}
                    icon={Icon}
                    key={card.title}
                    title={card.title}
                  />
                );
              })}
            </div>
          </div>

          <PublicTableOfContents
            className="mt-12"
            items={tocItems}
            label={copy.contentsLabel}
          />

          <div className="mt-12 grid gap-12">
            {copy.sections.map((section, index) => {
              const Icon = sectionIcons[index] ?? FileText;

              return (
                <PublicDocumentSection
                  bullets={section.bullets}
                  id={section.id}
                  key={section.id}
                  paragraphs={section.paragraphs}
                  title={
                    <span className="inline-flex items-start gap-3">
                      <Icon className="mt-1 h-5 w-5 shrink-0 text-[#0075DE]" />
                      <span>{section.title}</span>
                    </span>
                  }
                />
              );
            })}
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
