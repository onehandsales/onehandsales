import {
  ChevronDown,
  ChevronUp,
  CircleHelp,
  CreditCard,
  DatabaseZap,
  LogIn,
  Smartphone,
  Sparkles,
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

type FaqQuestionCopy = {
  readonly answer: string;
  readonly question: string;
};

type FaqSectionCopy = {
  readonly id: string;
  readonly questions: readonly FaqQuestionCopy[];
  readonly summary: string;
  readonly title: string;
};

type FaqCopy = {
  readonly contentsLabel: string;
  readonly ctaDescription: string;
  readonly ctaTitle: string;
  readonly description: string;
  readonly quickCards: readonly {
    readonly description: string;
    readonly title: string;
  }[];
  readonly sections: readonly FaqSectionCopy[];
  readonly title: string;
};

const quickCardIcons: readonly LucideIcon[] = [
  CircleHelp,
  DatabaseZap,
  UsersRound,
];

const questionIcons: readonly LucideIcon[] = [
  CreditCard,
  Smartphone,
  UsersRound,
  Sparkles,
  DatabaseZap,
  CircleHelp,
  LogIn,
  UsersRound,
  CircleHelp,
];

const faqCopyByLanguage: Record<PublicSiteCopyLanguage, FaqCopy> = {
  ko: {
    title: "자주 묻는 질문.",
    description:
      "요금제, 모바일 사용, AI, 데이터, 로그인, 팀 사용처럼 OneHand 도입 전에 자주 확인하는 질문을 모았어요.",
    contentsLabel: "질문 카테고리",
    ctaTitle: "답을 찾지 못했나요?",
    ctaDescription:
      "문의 페이지에서 현재 상황을 남겨주면 필요한 내용을 확인해드려요.",
    quickCards: [
      {
        title: "도입 전 확인",
        description:
          "무료 사용, 모바일 환경, 어떤 영업 방식에 맞는지 확인해요.",
      },
      {
        title: "데이터와 AI",
        description:
          "AI 저장 기준, 엑셀 가져오기와 내보내기, 삭제 복구를 확인해요.",
      },
      {
        title: "계정과 팀 사용",
        description:
          "소셜 로그인, 작은 팀 사용, 문의 흐름을 확인해요.",
      },
    ],
    sections: [
      {
        id: "before-adoption",
        title: "도입 전 확인",
        summary:
          "처음 OneHand를 검토할 때 많이 묻는 사용 범위와 시작 조건이에요.",
        questions: [
          {
            question: "무료로 사용할 수 있나요?",
            answer:
              "무료 요금제 또는 체험 흐름을 기준으로 시작할 수 있게 설계해요. 구체적인 제한과 포함 기능은 요금제 페이지에서 확인할 수 있어요.",
          },
          {
            question: "모바일에서 사용할 수 있나요?",
            answer:
              "네. OneHand는 현장 영업자가 이동 중에도 고객, 일정, 딜 흐름을 확인할 수 있도록 모바일 사용을 고려해요.",
          },
          {
            question: "어떤 영업 방식에 맞나요?",
            answer:
              "개인 영업, 부동산 중개, 보험/자동차 영업, B2B 현장 영업처럼 반복 상담과 후속 연락이 많은 흐름에 잘 맞아요.",
          },
        ],
      },
      {
        id: "data-ai",
        title: "데이터와 AI",
        summary:
          "고객 데이터, AI 초안, 엑셀, 삭제 복구처럼 기록 관리와 관련된 질문이에요.",
        questions: [
          {
            question: "AI가 내 데이터를 자동으로 저장하나요?",
            answer:
              "AI는 요약과 초안 작성을 돕는 역할이에요. 중요한 기록은 사용자가 확인한 뒤 저장하는 흐름을 기준으로 해요.",
          },
          {
            question: "엑셀로 가져오거나 다운로드할 수 있나요?",
            answer:
              "기존 데이터를 엑셀로 가져오고, 필요한 업무 기록을 XLSX 형태로 내보내는 흐름을 제공해요.",
          },
          {
            question: "삭제한 데이터는 복구할 수 있나요?",
            answer:
              "휴지통 복구 흐름을 통해 실수로 삭제한 기록을 다시 확인하고 복구할 수 있게 설계해요.",
          },
        ],
      },
      {
        id: "account-team",
        title: "계정과 팀 사용",
        summary:
          "로그인 방식, 개인과 팀 사용, 추가 문의가 필요한 상황을 정리했어요.",
        questions: [
          {
            question: "Google/Apple/LINE으로 로그인할 수 있나요?",
            answer:
              "네. Google, Apple, LINE 기반 로그인 흐름을 지원하는 구조로 되어 있어요.",
          },
          {
            question: "팀이나 회사에서도 사용할 수 있나요?",
            answer:
              "개인 사용을 기본으로 하되, 작은 팀과 조직 사용도 고려해요. 보안, 권한, 도입 검토가 필요하면 문의를 통해 확인하는 것이 좋아요.",
          },
          {
            question: "문의는 어디로 하나요?",
            answer:
              "공개 사이트의 문의 페이지에서 도입, 가격, 사용 방식에 대한 질문을 보낼 수 있어요.",
          },
        ],
      },
    ],
  },
  "en-US": {
    title: "Frequently asked questions.",
    description:
      "Answers for common questions about pricing, mobile use, AI, data, sign-in, and team usage before adopting OneHand.",
    contentsLabel: "Question categories",
    ctaTitle: "Did not find the answer you need?",
    ctaDescription:
      "Send your situation through the contact page and we can help clarify the right next step.",
    quickCards: [
      {
        title: "Before adoption",
        description:
          "Check free use, mobile access, and which sales workflows fit OneHand.",
      },
      {
        title: "Data and AI",
        description:
          "Review AI save behavior, Excel import/export, and deleted record recovery.",
      },
      {
        title: "Accounts and teams",
        description:
          "Check social sign-in, small team use, and when to contact us.",
      },
    ],
    sections: [
      {
        id: "before-adoption",
        title: "Before adoption",
        summary:
          "Common questions about starting conditions and the scope of OneHand.",
        questions: [
          {
            question: "Can I use OneHand for free?",
            answer:
              "OneHand is designed to support a free or trial starting flow. Check the pricing page for exact limits and included features.",
          },
          {
            question: "Can I use it on mobile?",
            answer:
              "Yes. OneHand is designed for field sellers who need to check customers, schedules, and deal flow while moving.",
          },
          {
            question: "Which sales workflows fit OneHand?",
            answer:
              "OneHand fits workflows with repeated consultations and follow-up, including personal sales, real estate, insurance and auto sales, and B2B field sales.",
          },
        ],
      },
      {
        id: "data-ai",
        title: "Data and AI",
        summary:
          "Questions about customer data, AI drafts, Excel, and deleted record recovery.",
        questions: [
          {
            question: "Does AI automatically save my data?",
            answer:
              "AI helps draft and summarize. Important records are designed to be reviewed by the user before they are saved.",
          },
          {
            question: "Can I import or download Excel data?",
            answer:
              "OneHand supports importing existing spreadsheet data and exporting work records as XLSX.",
          },
          {
            question: "Can I recover deleted data?",
            answer:
              "Trash restore is designed so accidentally deleted records can be reviewed and recovered.",
          },
        ],
      },
      {
        id: "account-team",
        title: "Accounts and teams",
        summary:
          "Questions about sign-in methods, personal and team usage, and contacting OneHand.",
        questions: [
          {
            question: "Can I log in with Google, Apple, or LINE?",
            answer:
              "Yes. OneHand supports a sign-in structure based on Google, Apple, and LINE.",
          },
          {
            question: "Can teams or companies use OneHand?",
            answer:
              "OneHand starts from personal sales use, while also considering small teams and organizations that need security, access, and adoption review.",
          },
          {
            question: "Where do I contact you?",
            answer:
              "Use the public contact page for adoption, pricing, and workflow questions.",
          },
        ],
      },
    ],
  },
};

function getQuestionIcon(sectionIndex: number, questionIndex: number) {
  const flatIndex = sectionIndex * 3 + questionIndex;

  return questionIcons[flatIndex] ?? CircleHelp;
}

// 기능 : 공개 FAQ 페이지를 카테고리별 질문 목록으로 렌더링합니다.
export function FaqPage() {
  const { language } = usePublicSiteLanguage();
  const copy = faqCopyByLanguage[getPublicSiteCopyLanguage(language)];
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
                const Icon = quickCardIcons[index] ?? CircleHelp;

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
            {copy.sections.map((section, sectionIndex) => (
              <PublicDocumentSection
                id={section.id}
                key={section.id}
                paragraphs={[section.summary]}
                title={section.title}
              >
                <div className="mt-5 grid gap-3">
                  {section.questions.map((faq, questionIndex) => {
                    const Icon = getQuestionIcon(sectionIndex, questionIndex);

                    return (
                      <details
                        className="group rounded-[8px] bg-[#FAFAF8] p-5 open:bg-[#eeeeec]"
                        key={faq.question}
                      >
                        <summary className="flex cursor-pointer list-none items-start justify-between gap-4 break-keep text-[15px] font-normal text-[#222220]">
                          <span className="inline-flex min-w-0 items-start gap-3">
                            <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[#0075DE]" />
                            <span>{faq.question}</span>
                          </span>
                          <span
                            aria-hidden="true"
                            className="mt-0.5 h-4 w-4 shrink-0 text-[#777770]"
                          >
                            <ChevronDown className="h-4 w-4 group-open:hidden" />
                            <ChevronUp className="hidden h-4 w-4 group-open:block" />
                          </span>
                        </summary>
                        <p className="mt-3 break-keep pl-7 text-[13px] leading-6 text-[#555550]">
                          {faq.answer}
                        </p>
                      </details>
                    );
                  })}
                </div>
              </PublicDocumentSection>
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
