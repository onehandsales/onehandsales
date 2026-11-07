import {
  BookOpenCheck,
  CalendarDays,
  Database,
  FileText,
  ListChecks,
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

type HelpSectionCopy = {
  readonly bullets: readonly string[];
  readonly id: string;
  readonly paragraphs: readonly string[];
  readonly title: string;
};

type HelpCopy = {
  readonly contentsLabel: string;
  readonly ctaDescription: string;
  readonly ctaTitle: string;
  readonly description: string;
  readonly quickCards: readonly {
    readonly description: string;
    readonly title: string;
  }[];
  readonly sections: readonly HelpSectionCopy[];
  readonly title: string;
};

const quickCardIcons: readonly LucideIcon[] = [
  BookOpenCheck,
  CalendarDays,
  Database,
];

const helpCopyByLanguage: Record<PublicSiteCopyLanguage, HelpCopy> = {
  ko: {
    title: "첫 기록부터, 다시 찾는 방법까지.",
    description:
      "OneHand CRM에서 기록을 추가하고 관리하는 기본 순서를 안내해요.",
    contentsLabel: "도움말 목차",
    ctaTitle: "첫 기록을 추가해 볼까요?",
    ctaDescription:
      "현재 관리하는 고객과 업무 정보부터 시작해 보세요.",
    quickCards: [
      {
        title: "처음 시작",
        description:
          "업무 공간과 관리할 항목을 열어요.",
      },
      {
        title: "기록 관리",
        description:
          "새 기록을 추가하고 내용을 수정해요.",
      },
      {
        title: "다시 찾기",
        description:
          "검색과 즐겨찾기를 사용해요.",
      },
    ],
    sections: [
      {
        id: "start",
        title: "내 업무 공간 열기",
        paragraphs: [
          "계정에 로그인하고 업무 공간을 열어요.",
          "여러 공간이 있다면 사용할 공간을 선택해 주세요.",
        ],
        bullets: [
          "로그인해 업무 공간으로 이동해요.",
          "공간 선택 메뉴에서 사용할 공간을 골라요.",
          "사이드바에서 관리할 항목을 찾아요.",
        ],
      },
      {
        id: "records",
        title: "관리할 항목과 기록",
        paragraphs: [
          "사이드바에서 관리할 항목을 선택해요.",
          "항목이 없다면 관리할 항목을 추가하고 기본 테이블에서 시작할 수 있어요.",
        ],
        bullets: [
          "관리할 항목을 선택해요.",
          "새 기록을 추가해요.",
          "화면에 있는 정보 칸을 채워요.",
        ],
      },
      {
        id: "follow-up",
        title: "내용 수정과 보기",
        paragraphs: [
          "목록에서 수정할 수 있는 정보를 고쳐요.",
          "다른 보기가 마련되어 있다면 필요한 보기로 전환해요.",
        ],
        bullets: [
          "편집 가능한 셀을 선택해요.",
          "내용을 고치고 저장 결과를 확인해요.",
          "보기 선택 메뉴에서 이용 가능한 화면을 골라요.",
        ],
      },
      {
        id: "meeting-notes",
        title: "검색과 즐겨찾기",
        paragraphs: [
          "현재 목록에서 검색어를 입력해 기록을 찾아요.",
          "자주 사용하는 보기는 즐겨찾기에 추가해 주세요.",
        ],
        bullets: [
          "현재 목록의 검색을 사용해요.",
          "자주 사용하는 보기를 즐겨찾기에 추가해요.",
          "사이드바의 즐겨찾기에서 다시 열어요.",
        ],
      },
    ],
  },
  "en-US": {
    title: "From your first record to finding it again.",
    description:
      "Learn the basic steps for adding and managing records in OneHand CRM.",
    contentsLabel: "Help guide",
    ctaTitle: "Ready to add your first record?",
    ctaDescription:
      "Start with the customer and work information you manage today.",
    quickCards: [
      {
        title: "Get started",
        description:
          "Open your workspace and collection.",
      },
      {
        title: "Manage records",
        description:
          "Add records and update their information.",
      },
      {
        title: "Find again",
        description:
          "Use search and favorites.",
      },
    ],
    sections: [
      {
        id: "start",
        title: "Open your workspace",
        paragraphs: [
          "Sign in and open your workspace.",
          "If you have more than one space, choose the one you want to use.",
        ],
        bullets: [
          "Sign in to your workspace.",
          "Choose a space from the workspace menu.",
          "Find what you manage in the sidebar.",
        ],
      },
      {
        id: "records",
        title: "Choose a collection and add a record",
        paragraphs: [
          "Choose a collection from the sidebar.",
          "If you do not have one, add a collection and start with its default table.",
        ],
        bullets: [
          "Choose what you manage.",
          "Add a record.",
          "Fill in the information fields on screen.",
        ],
      },
      {
        id: "follow-up",
        title: "Edit information and switch views",
        paragraphs: [
          "Update supported information in the table.",
          "If other views are available, choose the one you need.",
        ],
        bullets: [
          "Select an editable cell.",
          "Update the value and check the save result.",
          "Choose an available view from the view menu.",
        ],
      },
      {
        id: "meeting-notes",
        title: "Search and favorites",
        paragraphs: [
          "Enter a search term to find a record in the current collection.",
          "Add frequently used views to favorites.",
        ],
        bullets: [
          "Search the current collection.",
          "Add a useful view to favorites.",
          "Open it again from the sidebar.",
        ],
      },
    ],
  },
};

const sectionIcons: readonly LucideIcon[] = [
  BookOpenCheck,
  ListChecks,
  CalendarDays,
  FileText,
  Database,
];

// 기능 : 공개 도움말 페이지를 사용 흐름 중심으로 렌더링합니다.
export function HelpPage() {
  // 1. 처리 흐름에 필요한 { language } 값을 준비한다.
  const { language } = usePublicSiteLanguage();
  // 2. 이후 단계에서 사용할 copy 값을 준비한다.
  const copy = helpCopyByLanguage[getPublicSiteCopyLanguage(language)];
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
                const Icon = quickCardIcons[index] ?? BookOpenCheck;

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
              const Icon = sectionIcons[index] ?? BookOpenCheck;

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
