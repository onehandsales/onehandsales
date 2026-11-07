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
    title: "사용 전에 궁금한 점을 확인해요.",
    description:
      "이용 방식, 현재 기능, 계정에 관한 질문을 모았어요.",
    contentsLabel: "질문 카테고리",
    ctaTitle: "답을 찾지 못했나요?",
    ctaDescription:
      "데모 요청에서 현재 업무와 궁금한 점을 알려주세요.",
    quickCards: [
      {
        title: "시작하기",
        description:
          "개인 사용과 가격, 웹 이용을 확인해요.",
      },
      {
        title: "기능과 데이터",
        description:
          "AI와 엑셀의 현재 제공 상태를 확인해요.",
      },
      {
        title: "계정과 문의",
        description:
          "로그인과 팀 기능의 범위를 확인해요.",
      },
    ],
    sections: [
      {
        id: "before-adoption",
        title: "시작하기",
        summary:
          "개인 사용과 가격, 웹 이용을 확인해요.",
        questions: [
          {
            question: "혼자 사용해도 되나요?",
            answer:
              "혼자 고객과 업무 정보를 관리하는 흐름을 중심으로 만들고 있어요.",
          },
          {
            question: "가격은 어떻게 되나요?",
            answer:
              "아직 가격 정책을 확정하지 않았어요. 무료 제공 범위나 장기 이용 조건도 미정이에요.",
          },
          {
            question: "앱을 설치해야 하나요?",
            answer:
              "현재 웹에서 시작할 수 있어요. 전용 앱 설치 경로는 확인된 정보가 있을 때 안내할게요.",
          },
        ],
      },
      {
        id: "data-ai",
        title: "기능과 데이터",
        summary:
          "AI와 엑셀의 현재 제공 상태를 확인해요.",
        questions: [
          {
            question: "AI가 기록을 요약해 주나요?",
            answer:
              "AI 요약과 초안 작성은 현재 제공하지 않아요.",
          },
          {
            question: "엑셀을 가져오거나 내보낼 수 있나요?",
            answer:
              "엑셀 가져오기와 내보내기는 현재 제공 기능에 포함되지 않아요.",
          },
        ],
      },
      {
        id: "account-team",
        title: "계정과 문의",
        summary:
          "로그인과 팀 기능의 범위를 확인해요.",
        questions: [
          {
            question: "어떤 방법으로 로그인하나요?",
            answer:
              "로그인 화면에 표시되는 사용 가능한 로그인 방식을 선택해 주세요.",
          },
          {
            question: "팀원을 초대하고 권한을 나눌 수 있나요?",
            answer:
              "업무 공간과 팀 협업 기능은 구분돼요. 팀 초대와 역할별 권한은 현재 제공 범위에 포함되지 않아요.",
          },
          {
            question: "내 업무에 맞는지 어디에 물어보나요?",
            answer:
              "데모 요청에서 관리하고 싶은 업무를 알려주세요. 현재 제품으로 가능한 범위를 확인할 수 있어요.",
          },
        ],
      },
    ],
  },
  "en-US": {
    title: "Questions before you get started.",
    description:
      "Answers about getting started, current features, and your account.",
    contentsLabel: "Question categories",
    ctaTitle: "Did not find the answer you need?",
    ctaDescription:
      "Tell us about your work and questions in a demo request.",
    quickCards: [
      {
        title: "Getting started",
        description:
          "Learn about individual use, pricing, and web access.",
      },
      {
        title: "Features and data",
        description:
          "Check current AI and Excel availability.",
      },
      {
        title: "Account and questions",
        description:
          "Review sign-in and team feature scope.",
      },
    ],
    sections: [
      {
        id: "before-adoption",
        title: "Getting started",
        summary:
          "Learn about individual use, pricing, and web access.",
        questions: [
          {
            question: "Can I use it on my own?",
            answer:
              "We are focusing on the experience of managing your own customer and work records.",
          },
          {
            question: "How much does it cost?",
            answer:
              "Pricing has not been finalized. Long-term free access and free-plan limits are not confirmed.",
          },
          {
            question: "Do I need to install an app?",
            answer:
              "You can start on the web. We will share dedicated app installation links when their availability is confirmed.",
          },
        ],
      },
      {
        id: "data-ai",
        title: "Features and data",
        summary:
          "Check current AI and Excel availability.",
        questions: [
          {
            question: "Can AI summarize my records?",
            answer:
              "AI summaries and drafts are not currently available.",
          },
          {
            question: "Can I import or export Excel files?",
            answer:
              "Excel import and export are not currently available.",
          },
        ],
      },
      {
        id: "account-team",
        title: "Account and questions",
        summary:
          "Review sign-in and team feature scope.",
        questions: [
          {
            question: "How do I sign in?",
            answer:
              "Choose from the sign-in methods currently displayed on the login screen.",
          },
          {
            question: "Can I invite teammates and assign roles?",
            answer:
              "Workspaces and team collaboration are separate features. Team invitations and role-based permissions are not currently available.",
          },
          {
            question: "How can I check whether it fits my work?",
            answer:
              "Describe the work you want to manage in a demo request. We can discuss the current product scope.",
          },
        ],
      },
    ],
  },
};

// 기능 : 질문 아이콘을 조회합니다.
function getQuestionIcon(sectionIndex: number, questionIndex: number) {
  const flatIndex = sectionIndex * 3 + questionIndex;

  return questionIcons[flatIndex] ?? CircleHelp;
}

// 기능 : 공개 FAQ 페이지를 카테고리별 질문 목록으로 렌더링합니다.
export function FaqPage() {
  // 1. 처리 흐름에 필요한 { language } 값을 준비한다.
  const { language } = usePublicSiteLanguage();
  // 2. 이후 단계에서 사용할 copy 값을 준비한다.
  const copy = faqCopyByLanguage[getPublicSiteCopyLanguage(language)];
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
                            <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[#0075Dx]" />
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
