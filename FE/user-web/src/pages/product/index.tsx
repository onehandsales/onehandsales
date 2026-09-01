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
    title: "OneHand는 현장 영업을 위한 개인 CRM이에요.",
    description:
      "고객, 회사, 딜, 일정, 회의록, AI 초안을 한 흐름으로 연결해 반복 상담과 후속 연락을 놓치지 않게 돕는 영업 워크스페이스예요.",
    contentsLabel: "제품 소개 목차",
    ctaTitle: "제품 흐름을 보고 바로 시작해볼까요?",
    ctaDescription:
      "흩어진 고객 기록과 다음 행동을 OneHand에서 한 번에 정리해요.",
    quickCards: [
      {
        title: "고객 맥락",
        description:
          "회사, 담당자, 상담 기록, 일정이 고객 중심으로 이어져요.",
      },
      {
        title: "영업 파이프라인",
        description:
          "진행 중인 딜과 다음 행동을 같은 흐름에서 확인해요.",
      },
      {
        title: "AI/Data",
        description:
          "AI 초안과 엑셀 데이터를 사용자가 확인 가능한 기록으로 다뤄요.",
      },
    ],
    sections: [
      {
        id: "overview",
        title: "OneHand 제품 소개",
        paragraphs: [
          "OneHand는 복잡한 팀 CRM을 먼저 도입하기 어려운 개인 영업자와 작은 영업팀을 위해 만든 CRM이에요.",
          "엑셀, 메모앱, 명함 사진, 캘린더에 흩어진 고객 정보를 하나의 고객 흐름으로 묶고 다음 행동을 놓치지 않게 만드는 것이 핵심이에요.",
        ],
        bullets: [
          "고객과 회사 정보를 한곳에서 정리해요.",
          "딜, 일정, 회의록을 고객 맥락과 연결해요.",
          "AI는 자동 저장보다 확인 가능한 초안과 요약을 돕는 방식으로 사용해요.",
        ],
      },
      {
        id: "workspace",
        title: "고객 중심 워크스페이스",
        paragraphs: [
          "고객 관리는 이름과 연락처를 저장하는 일에서 끝나지 않아요. 이전 상담, 연결된 회사, 진행 중인 딜, 다음 일정이 함께 보여야 실제 영업에서 쓸 수 있어요.",
          "OneHand는 고객 기록을 중심으로 관련 업무가 이어지게 설계해요.",
        ],
        bullets: [
          "회사와 담당자 관계를 함께 확인해요.",
          "고객별 메모와 미팅 기록을 같은 맥락에 남겨요.",
          "다음 통화나 방문 전 필요한 정보를 빠르게 찾을 수 있어요.",
        ],
      },
      {
        id: "pipeline",
        title: "딜과 다음 행동을 함께 보는 구조",
        paragraphs: [
          "영업 파이프라인은 단계만 옮기는 칸반이 아니라 고객에게 다음에 무엇을 해야 하는지 알려주는 운영 흐름이어야 해요.",
          "OneHand는 딜 단계, 금액, 마감일, 일정, 회의록을 연결해 거래의 현재 상태를 더 분명하게 보여줘요.",
        ],
        bullets: [
          "진행 중인 딜을 단계별로 확인해요.",
          "각 딜에 연결된 고객, 일정, 회의록을 함께 봐요.",
          "마감일과 다음 연락 시점을 기준으로 우선순위를 잡아요.",
        ],
      },
      {
        id: "assistant",
        title: "AI 영업 도우미",
        paragraphs: [
          "AI는 영업자의 판단을 대신하기보다 반복 정리의 시작점을 만들어주는 도구로 두는 것이 좋아요.",
          "OneHand의 AI 흐름은 회의록 요약, 다음 행동 초안, 팔로업 정리처럼 사용자가 검토하고 저장할 수 있는 결과를 만드는 방향이에요.",
        ],
        bullets: [
          "회의 내용을 요약하고 후속 행동 초안을 만들어요.",
          "AI 결과는 사용자 확인 후 기록으로 남겨요.",
          "고객과 딜 맥락 안에서 필요한 정리를 돕는 방식이에요.",
        ],
      },
      {
        id: "mobile",
        title: "현장에서 바로 쓰는 모바일 기준",
        paragraphs: [
          "개인 영업과 현장 영업은 책상 앞보다 이동 중에 더 많은 일이 생겨요.",
          "OneHand는 외근 중에도 고객을 찾고, 명함을 등록하고, 미팅 후 다음 연락을 남길 수 있는 흐름을 중요하게 봐요.",
        ],
        bullets: [
          "이동 중에도 고객과 딜 정보를 빠르게 확인해요.",
          "명함 스캔으로 새 담당자를 기록으로 전환해요.",
          "미팅 직후 일정과 팔로업을 바로 남겨요.",
        ],
      },
      {
        id: "fit",
        title: "OneHand가 잘 맞는 상황",
        paragraphs: [
          "OneHand는 모든 조직의 복잡한 업무를 한 번에 대체하는 대형 CRM보다, 반복 상담과 후속 연락을 놓치지 않아야 하는 영업 흐름에 더 집중해요.",
          "개인 영업자, 부동산 중개, 보험/자동차 영업, B2B 현장 영업처럼 고객 맥락이 계속 이어지는 상황에 특히 잘 맞아요.",
        ],
        bullets: [
          "고객 기록이 엑셀, 메모, 사진, 캘린더에 흩어져 있어요.",
          "상담 이후 다음 연락과 진행 상태를 자주 놓쳐요.",
          "팀 CRM보다 바로 쓸 수 있는 가벼운 영업 워크스페이스가 필요해요.",
        ],
      },
    ],
  },
  "en-US": {
    title: "OneHand is a personal CRM for field sales.",
    description:
      "A sales workspace that connects customers, companies, deals, schedules, meeting notes, and AI drafts so repeated consultation and follow-up do not get lost.",
    contentsLabel: "Products Guide",
    ctaTitle: "Ready to try the product workflow?",
    ctaDescription:
      "Bring scattered customer records and next actions into one OneHand workflow.",
    quickCards: [
      {
        title: "Customer context",
        description:
          "Companies, contacts, notes, and schedules stay connected around each customer.",
      },
      {
        title: "Sales pipeline",
        description:
          "Track active deals and next actions in the same workflow.",
      },
      {
        title: "AI/Data",
        description:
          "Use AI drafts and spreadsheet data as records you can review and control.",
      },
    ],
    sections: [
      {
        id: "overview",
        title: "Products Guide",
        paragraphs: [
          "OneHand is a CRM for personal sellers and small sales teams that need something lighter than a complex team rollout.",
          "Its core job is to bring customer data scattered across spreadsheets, notes, card photos, and calendars into one customer workflow.",
        ],
        bullets: [
          "Organize customers and companies in one place.",
          "Connect deals, schedules, and meeting notes to customer context.",
          "Use AI for reviewable drafts and summaries instead of automatic saving.",
        ],
      },
      {
        id: "workspace",
        title: "A customer-centered workspace",
        paragraphs: [
          "Customer management is not just storing names and contact details. Sales work needs previous conversations, company relationships, active deals, and next schedules to stay together.",
          "OneHand is designed so related work continues from the customer record.",
        ],
        bullets: [
          "Review companies and contacts together.",
          "Keep notes and meeting records in the same customer context.",
          "Find the right information quickly before the next call or visit.",
        ],
      },
      {
        id: "pipeline",
        title: "Deals and next actions together",
        paragraphs: [
          "A sales pipeline should be more than moving cards between stages. It should show what needs to happen next for each customer.",
          "OneHand connects deal stage, value, due date, schedules, and meeting notes so the current state is easier to understand.",
        ],
        bullets: [
          "Review active deals by stage.",
          "See related customers, schedules, and notes beside each deal.",
          "Prioritize work by due dates and next follow-up timing.",
        ],
      },
      {
        id: "assistant",
        title: "AI sales assistant",
        paragraphs: [
          "AI should help create a starting point for repetitive cleanup, not replace the seller's judgment.",
          "OneHand's AI workflow is shaped around reviewable results such as meeting summaries, next-action drafts, and follow-up cleanup.",
        ],
        bullets: [
          "Summarize meeting notes and draft follow-up actions.",
          "Save AI output only after user review.",
          "Use customer and deal context to keep AI assistance close to the workflow.",
        ],
      },
      {
        id: "mobile",
        title: "Built around mobile field work",
        paragraphs: [
          "Personal and field sales work often happens away from a desk.",
          "OneHand emphasizes finding customers, saving business cards, and adding follow-up right after a meeting.",
        ],
        bullets: [
          "Check customer and deal information while moving.",
          "Turn business card scans into contact records.",
          "Add schedules and follow-up shortly after meetings.",
        ],
      },
      {
        id: "fit",
        title: "Where OneHand fits best",
        paragraphs: [
          "OneHand is more focused on repeated consultation and follow-up than replacing every complex workflow in a large organization.",
          "It fits personal sales, real estate, insurance and auto sales, and B2B field sales where customer context keeps carrying forward.",
        ],
        bullets: [
          "Customer records are scattered across spreadsheets, notes, photos, and calendars.",
          "Follow-up timing and deal status are easy to miss after consultations.",
          "You need a lighter sales workspace that can be used without a heavy CRM rollout.",
        ],
      },
    ],
  },
};

// 기능 : 공개 제품 소개 페이지를 렌더링합니다.
export function ProductPage() {
  const { language } = usePublicSiteLanguage();
  const copy = productCopyByLanguage[getPublicSiteCopyLanguage(language)];
  const tocItems = copy.sections.map((section) => ({
    id: section.id,
    title: section.title,
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
