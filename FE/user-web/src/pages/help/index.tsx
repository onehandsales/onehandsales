import {
  BookOpenCheck,
  CalendarDays,
  Database,
  FileSpreadsheet,
  FileText,
  ListChecks,
  ScanLine,
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
    title: "OneHand를 쓰는 기본 흐름.",
    description:
      "고객을 등록하고, 딜을 만들고, 일정과 회의록으로 다음 행동을 이어 가는 기본 사용 방법을 정리했어요.",
    contentsLabel: "도움말 목차",
    ctaTitle: "지금 쓰는 흐름에 맞춰 정리해볼까요?",
    ctaDescription:
      "문의로 현재 업무 방식을 알려주면 시작 순서를 같이 잡아드려요.",
    quickCards: [
      {
        title: "처음 시작하기",
        description:
          "회사, 담당자, 제품, 딜을 어떤 순서로 잡으면 좋은지 확인해요.",
      },
      {
        title: "현장 업무 이어가기",
        description:
          "명함 스캔, 일정, 회의록, 팔로업을 고객 기록과 연결해요.",
      },
      {
        title: "데이터 정리하기",
        description:
          "엑셀 가져오기, 내보내기, 휴지통 복구 흐름을 확인해요.",
      },
    ],
    sections: [
      {
        id: "start",
        title: "처음 시작하기",
        paragraphs: [
          "OneHand는 회사, 담당자, 제품, 딜을 먼저 정리하면 이후 일정과 회의록을 자연스럽게 연결할 수 있어요.",
          "처음부터 모든 항목을 채우기보다 실제 영업에서 바로 쓰는 정보부터 입력하는 흐름이 좋아요.",
        ],
        bullets: [
          "회사와 담당자를 먼저 만들고 연락처, 메모, 관계 정보를 남겨요.",
          "판매하는 제품이나 서비스를 등록해 딜과 연결할 준비를 해요.",
          "진행 중인 상담은 딜로 만들고 단계, 금액, 마감일을 정리해요.",
        ],
      },
      {
        id: "records",
        title: "고객과 딜을 한 화면에서 이어 보기",
        paragraphs: [
          "고객 기록은 단순 연락처가 아니라 일정, 회의록, 딜이 쌓이는 기준점이에요.",
          "회사와 담당자, 진행 중인 딜을 함께 보면 다음에 연락할 이유와 맥락을 더 빨리 찾을 수 있어요.",
        ],
        bullets: [
          "회사 상세에서는 담당자와 관련 딜을 함께 확인해요.",
          "담당자 상세에서는 연락처, 메모, 상담 맥락을 이어 봐요.",
          "딜 상세에서는 단계 변경과 다음 행동을 같이 정리해요.",
        ],
      },
      {
        id: "follow-up",
        title: "일정과 팔로업 남기기",
        paragraphs: [
          "방문, 통화, 재연락 일정은 고객이나 딜과 연결해 남기면 다시 찾기 쉬워요.",
          "오늘 해야 할 일과 다음 미팅을 한 흐름으로 보면 고객 응대가 끊기지 않아요.",
        ],
        bullets: [
          "일정에는 날짜, 시간, 고객, 목적을 함께 남겨요.",
          "미팅 후에는 다음 연락 시점과 해야 할 일을 바로 추가해요.",
          "진행 중인 딜과 연결하면 팔로업이 거래 단계 안에 남아요.",
        ],
      },
      {
        id: "meeting-notes",
        title: "회의록과 AI 정리 사용하기",
        paragraphs: [
          "상담 내용은 회의록으로 남기고 고객, 회사, 딜과 연결해두면 다음 대화에서 바로 이어갈 수 있어요.",
          "AI는 요약과 다음 행동 초안을 돕고, 중요한 기록은 사용자가 확인한 뒤 저장하는 흐름을 기준으로 해요.",
        ],
        bullets: [
          "상담 배경, 요구사항, 결정사항, 다음 행동을 나눠서 기록해요.",
          "AI 초안을 사용해도 저장 전에는 내용을 직접 확인해요.",
          "회의록을 딜과 연결해 제안, 견적, 계약 흐름의 근거로 활용해요.",
        ],
      },
      {
        id: "business-cards",
        title: "명함 스캔으로 고객 만들기",
        paragraphs: [
          "현장에서 받은 명함은 사진으로 남긴 뒤 담당자 기록으로 바꿔 관리할 수 있어요.",
          "인식된 정보는 바로 확정하지 않고 확인과 수정을 거쳐 저장하는 방식이 좋아요.",
        ],
        bullets: [
          "명함 사진을 등록하고 이름, 회사, 직함, 연락처를 확인해요.",
          "기존 회사나 담당자와 중복되는지 저장 전에 살펴봐요.",
          "저장한 담당자에는 첫 만남 내용과 다음 연락 계획을 함께 남겨요.",
        ],
      },
      {
        id: "import-export",
        title: "엑셀 가져오기와 내보내기",
        paragraphs: [
          "기존 고객 목록이 엑셀에 있다면 가져오기 흐름으로 회사, 담당자, 딜 데이터를 옮길 수 있어요.",
          "업무 검토나 백업이 필요할 때는 필요한 데이터를 XLSX로 내려받는 흐름을 사용해요.",
        ],
        bullets: [
          "가져오기 전에 엑셀 컬럼을 OneHand의 필드와 맞춰요.",
          "검토 화면에서 누락되거나 이상한 값을 확인한 뒤 저장해요.",
          "내보내기는 데이터 이전, 월간 검토, 백업이 필요할 때 사용해요.",
        ],
      },
      {
        id: "trash",
        title: "삭제한 기록 복구하기",
        paragraphs: [
          "실수로 삭제한 고객, 딜, 일정, 회의록은 휴지통에서 다시 확인할 수 있어요.",
          "복구가 필요한 기록은 항목별로 확인한 뒤 원래 흐름으로 되돌리는 방식을 사용해요.",
        ],
        bullets: [
          "삭제 직후에는 휴지통에서 기록 이름과 삭제 시점을 확인해요.",
          "복구 전 관련 고객이나 딜 맥락이 맞는지 살펴봐요.",
          "복구 후에는 필요한 일정이나 후속 행동이 남아 있는지 다시 점검해요.",
        ],
      },
    ],
  },
  "en-US": {
    title: "The basic workflow for using OneHand.",
    description:
      "Learn how to add customers, create deals, and keep next actions moving through schedules and meeting notes.",
    contentsLabel: "Help guide",
    ctaTitle: "Want help mapping your current workflow?",
    ctaDescription:
      "Tell us how you work today and we can help you choose the right starting order.",
    quickCards: [
      {
        title: "Get started",
        description:
          "See the recommended order for companies, contacts, products, and deals.",
      },
      {
        title: "Keep field work moving",
        description:
          "Connect card scans, schedules, notes, and follow-up to customer records.",
      },
      {
        title: "Organize data",
        description:
          "Review Excel import, export, and trash restore workflows.",
      },
    ],
    sections: [
      {
        id: "start",
        title: "Get started",
        paragraphs: [
          "OneHand works best when companies, contacts, products, and deals are set up first. Schedules and meeting notes can then connect to that context.",
          "You do not need to fill in every field on day one. Start with the information you use in real sales conversations.",
        ],
        bullets: [
          "Create companies and contacts with contact details, notes, and relationship context.",
          "Add the products or services you sell so deals can reference them.",
          "Turn active opportunities into deals with stage, value, and due date.",
        ],
      },
      {
        id: "records",
        title: "Review customers and deals together",
        paragraphs: [
          "A customer record is more than a contact. It becomes the place where schedules, meeting notes, and deals stay connected.",
          "When companies, contacts, and active deals are visible together, the reason for the next follow-up is easier to find.",
        ],
        bullets: [
          "Use company detail pages to review contacts and related deals.",
          "Use contact detail pages to keep phone, email, notes, and context together.",
          "Use deal detail pages to track stage changes and next actions.",
        ],
      },
      {
        id: "follow-up",
        title: "Add schedules and follow-up",
        paragraphs: [
          "Visits, calls, and follow-up reminders are easier to find when they are connected to a customer or deal.",
          "Keeping today's work and upcoming meetings in one flow reduces missed customer follow-up.",
        ],
        bullets: [
          "Add date, time, customer, and purpose to each schedule.",
          "After a meeting, add the next contact timing and task while the context is fresh.",
          "Connect schedules to deals so follow-up stays inside the sales stage.",
        ],
      },
      {
        id: "meeting-notes",
        title: "Use meeting notes and AI drafts",
        paragraphs: [
          "Meeting notes keep consultation details connected to customers, companies, and deals, so the next conversation can continue from the same context.",
          "AI helps with summaries and next-action drafts. Important records should be reviewed by the user before saving.",
        ],
        bullets: [
          "Separate background, requirements, decisions, and next actions in the note.",
          "Review AI drafts before saving them to your workspace.",
          "Connect meeting notes to deals as evidence for proposals, quotes, and contracts.",
        ],
      },
      {
        id: "business-cards",
        title: "Create customers from business cards",
        paragraphs: [
          "Cards collected in the field can be turned into contact records from an image.",
          "Recognized information should be reviewed and corrected before it becomes a record.",
        ],
        bullets: [
          "Upload a card image and check name, company, title, and contact details.",
          "Look for duplicates before saving the new contact.",
          "Add first-meeting notes and the next follow-up plan after saving.",
        ],
      },
      {
        id: "import-export",
        title: "Import and export Excel data",
        paragraphs: [
          "If your customer list already lives in a spreadsheet, import can move company, contact, and deal data into OneHand.",
          "When you need a backup or review file, export the necessary records as XLSX.",
        ],
        bullets: [
          "Match spreadsheet columns to OneHand fields before importing.",
          "Use the review step to catch missing or unusual values before saving.",
          "Use export for migration, monthly review, or backup needs.",
        ],
      },
      {
        id: "trash",
        title: "Restore deleted records",
        paragraphs: [
          "Accidentally deleted customers, deals, schedules, and meeting notes can be reviewed in trash.",
          "Restore records after checking the item and its original context.",
        ],
        bullets: [
          "Check the record name and deletion timing soon after deletion.",
          "Review the related customer or deal context before restoring.",
          "After restore, confirm that any needed schedules or next actions are still in place.",
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
  ScanLine,
  FileSpreadsheet,
  Database,
];

// 기능 : 공개 도움말 페이지를 사용 흐름 중심으로 렌더링합니다.
export function HelpPage() {
  const { language } = usePublicSiteLanguage();
  const copy = helpCopyByLanguage[getPublicSiteCopyLanguage(language)];
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
