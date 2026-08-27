import { CircleHelp, Mail, MessageCircle, ShieldQuestion } from "lucide-react";
import {
  PublicContentContainer,
  PublicCtaPanel,
  PublicDocumentHero,
  PublicInfoCard,
  PublicPageSection,
  PublicSitePageShell,
} from "@/features/public-site";
import {
  getPublicSiteCopyLanguage,
  usePublicSiteLanguage,
  type PublicSiteCopyLanguage,
} from "@/features/public-site/i18n/public-site-language";

type FaqCopy = {
  readonly answer: string;
  readonly question: string;
};

type HelpCopy = {
  readonly ctaDescription: string;
  readonly ctaLabel: string;
  readonly ctaTitle: string;
  readonly description: string;
  readonly eyebrow: string;
  readonly faqs: readonly FaqCopy[];
  readonly quickCards: readonly {
    readonly description: string;
    readonly title: string;
  }[];
  readonly title: string;
};

const helpCopyByLanguage: Record<PublicSiteCopyLanguage, HelpCopy> = {
  ko: {
    eyebrow: "Help",
    title: "OneHand를 시작하기 전에 자주 묻는 질문.",
    description:
      "가격, 모바일, AI, 데이터, 로그인, 팀 사용처럼 도입 전에 확인하는 질문을 한곳에 모았습니다.",
    ctaTitle: "원하는 답을 찾지 못했나요?",
    ctaDescription:
      "현재 상황과 사용하려는 영업 흐름을 알려주시면 필요한 방식으로 안내하겠습니다.",
    ctaLabel: "문의하기",
    quickCards: [
      {
        title: "시작 전 확인",
        description: "무료 사용, 로그인, 모바일 사용 흐름을 먼저 확인합니다.",
      },
      {
        title: "데이터와 AI",
        description: "AI 저장 방식, 엑셀 다운로드, 삭제 복구 기준을 확인합니다.",
      },
      {
        title: "팀 사용",
        description: "개인, 작은 팀, 회사에서 사용할 때의 방향을 확인합니다.",
      },
    ],
    faqs: [
      {
        question: "무료로 사용할 수 있나요?",
        answer:
          "무료 요금제 또는 체험 흐름을 기준으로 시작할 수 있도록 설계합니다. 구체적인 제한과 포함 기능은 요금제 페이지에서 확인할 수 있습니다.",
      },
      {
        question: "모바일에서 사용할 수 있나요?",
        answer:
          "네. OneHand는 현장 영업자가 이동 중에도 고객, 일정, 딜 흐름을 확인할 수 있도록 모바일 사용을 고려합니다.",
      },
      {
        question: "AI가 내 데이터를 자동으로 저장하나요?",
        answer:
          "AI는 초안과 요약을 돕는 역할입니다. 중요한 기록은 사용자가 확인한 뒤 저장하는 흐름을 기준으로 합니다.",
      },
      {
        question: "엑셀로 다운로드할 수 있나요?",
        answer:
          "필요한 업무 기록을 XLSX 형태로 내보내는 흐름을 제공합니다. 데이터 이전이나 백업이 필요한 상황을 고려합니다.",
      },
      {
        question: "삭제한 데이터는 복구할 수 있나요?",
        answer:
          "휴지통 복구 흐름을 통해 실수로 삭제한 기록을 다시 확인하고 복구할 수 있게 설계합니다.",
      },
      {
        question: "Google/Apple/LINE으로 로그인할 수 있나요?",
        answer:
          "네. Google, Apple, LINE 기반 로그인 흐름을 지원하는 구조로 되어 있습니다.",
      },
      {
        question: "팀이나 회사에서도 사용할 수 있나요?",
        answer:
          "개인 사용을 기본으로 하되, 작은 팀과 조직 사용도 고려합니다. 보안, 권한, 도입 검토가 필요하면 문의를 통해 확인하는 것이 좋습니다.",
      },
      {
        question: "문의는 어디로 하나요?",
        answer:
          "공개 사이트의 문의 페이지에서 도입, 가격, 사용 방식에 대한 질문을 보낼 수 있습니다.",
      },
    ],
  },
  "en-US": {
    eyebrow: "Help",
    title: "Questions to check before starting OneHand.",
    description:
      "Find answers about pricing, mobile use, AI, data, sign-in, and team usage before adoption.",
    ctaTitle: "Did not find the answer you need?",
    ctaDescription:
      "Tell us about your current workflow and we can point you to the right starting point.",
    ctaLabel: "Contact us",
    quickCards: [
      {
        title: "Before you start",
        description: "Check free use, sign-in, and mobile workflow basics.",
      },
      {
        title: "Data and AI",
        description: "Review AI save behavior, Excel export, and trash restore.",
      },
      {
        title: "Team usage",
        description: "Understand how OneHand fits personal, small team, and company use.",
      },
    ],
    faqs: [
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
        question: "Does AI automatically save my data?",
        answer:
          "AI helps draft and summarize. Important records are designed to be reviewed by the user before they are saved.",
      },
      {
        question: "Can I download my data to Excel?",
        answer:
          "OneHand supports exporting work records as XLSX for data moves, review, and backup needs.",
      },
      {
        question: "Can I recover deleted data?",
        answer:
          "Trash restore is designed so accidentally deleted records can be reviewed and recovered.",
      },
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
};

const quickCardIcons = [CircleHelp, ShieldQuestion, MessageCircle] as const;

// 기능 : 공개 도움말과 FAQ 페이지를 렌더링합니다.
export function HelpPage() {
  const { language } = usePublicSiteLanguage();
  const copy = helpCopyByLanguage[getPublicSiteCopyLanguage(language)];

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

          <div className="mt-12 grid gap-3">
            {copy.faqs.map((faq) => (
              <details
                className="group rounded-[8px] bg-[#FAFAF8] p-5 open:bg-[#eeeeec]"
                key={faq.question}
              >
                <summary className="cursor-pointer list-none break-keep text-[15px] font-normal text-[#222220]">
                  <span className="inline-flex items-start gap-3">
                    <CircleHelp className="mt-0.5 h-4 w-4 shrink-0 text-[#0075DE]" />
                    {faq.question}
                  </span>
                </summary>
                <p className="mt-3 break-keep pl-7 text-[13px] leading-6 text-[#555550]">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>

          <PublicCtaPanel
            className="mt-14"
            description={copy.ctaDescription}
            icon={Mail}
            primaryAction={{ label: copy.ctaLabel, to: "/contact" }}
            title={copy.ctaTitle}
          />
        </PublicContentContainer>
      </PublicPageSection>
    </PublicSitePageShell>
  );
}
