import {
  BriefcaseBusiness,
  Building2,
  ShieldCheck,
  UserRound,
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

type SolutionSegmentCopy = {
  readonly bullets: readonly string[];
  readonly id: "personal" | "real-estate" | "insurance-auto" | "b2b-field";
  readonly summary: string;
  readonly title: string;
};

type SolutionsCopy = {
  readonly contentsLabel: string;
  readonly ctaDescription: string;
  readonly ctaTitle: string;
  readonly description: string;
  readonly segments: readonly SolutionSegmentCopy[];
  readonly title: string;
};

const solutionIcons: Record<SolutionSegmentCopy["id"], LucideIcon> = {
  personal: UserRound,
  "real-estate": Building2,
  "insurance-auto": ShieldCheck,
  "b2b-field": BriefcaseBusiness,
};

const solutionsCopyByLanguage: Record<PublicSiteCopyLanguage, SolutionsCopy> = {
  ko: {
    title: "영업 방식에 맞게, 고객과 후속 업무를 놓치지 않게.",
    description:
      "OneHand는 개인 영업, 부동산 중개, 보험·자동차 영업, B2B 현장 영업처럼 반복 상담과 후속 연락이 많은 흐름에 맞춰 고객, 일정, 딜, 기록을 연결합니다.",
    contentsLabel: "용도별 보기",
    ctaTitle: "내 영업 방식에 맞는 흐름이 궁금한가요?",
    ctaDescription:
      "현재 고객 관리 방식과 후속 업무를 알려주면 필요한 시작점을 함께 정리해요.",
    segments: [
      {
        id: "personal",
        title: "개인 영업",
        summary:
          "혼자 고객을 만나고, 연락하고, 딜을 챙기는 영업자를 위한 개인 작업 공간입니다.",
        bullets: [
          "고객, 명함, 일정, 딜을 혼자 관리하는 사람",
          "엑셀과 메모앱에 흩어진 기록을 한곳으로 모으고 싶은 사람",
          "복잡한 팀 CRM보다 바로 쓸 수 있는 개인 CRM이 필요한 사람",
        ],
      },
      {
        id: "real-estate",
        title: "부동산 중개",
        summary:
          "상담 고객, 매물 관심사, 방문 일정, 계약 가능성을 이어서 볼 수 있는 흐름입니다.",
        bullets: [
          "매수·매도·임대 상담 고객을 계속 추적해야 하는 중개사",
          "방문 일정과 후속 연락을 고객 기록에 함께 남기고 싶은 사람",
          "고객별 관심 조건과 진행 상황을 빠르게 다시 확인해야 하는 사람",
        ],
      },
      {
        id: "insurance-auto",
        title: "보험/자동차 영업",
        summary:
          "반복 상담, 견적, 계약 전후 연락을 고객별 기록으로 관리하는 방식입니다.",
        bullets: [
          "상담 이후 재연락 시점과 필요 서류를 놓치기 쉬운 영업자",
          "견적, 계약 가능성, 후속 연락을 고객별로 정리하고 싶은 사람",
          "장기 관계와 갱신·재구매 흐름을 꾸준히 관리해야 하는 사람",
        ],
      },
      {
        id: "b2b-field",
        title: "B2B 현장 영업",
        summary:
          "외근 미팅, 담당자 관계, 딜 단계, 다음 행동을 함께 연결하는 흐름입니다.",
        bullets: [
          "여러 회사와 담당자를 오가며 미팅을 반복하는 B2B 영업자",
          "미팅 기록과 딜 진행 상황을 같은 맥락에서 보고 싶은 사람",
          "다음 행동과 팔로업 우선순위를 빠르게 확인해야 하는 사람",
        ],
      },
    ],
  },
  "en-US": {
    title: "For the way your field sales work actually happens.",
    description:
      "OneHand connects customers, schedules, deals, notes, and follow-up for personal sales, real estate, insurance, auto sales, and B2B field sales workflows.",
    contentsLabel: "Use case index",
    ctaTitle: "Want to map OneHand to your sales workflow?",
    ctaDescription:
      "Tell us how you manage customers and follow-up today, and we can start from the right flow.",
    segments: [
      {
        id: "personal",
        title: "Personal sales",
        summary:
          "A personal workspace for sellers who meet customers, follow up, and manage deals on their own.",
        bullets: [
          "For people managing customers, cards, schedules, and deals alone",
          "For sellers who want to organize records scattered across spreadsheets and notes",
          "For people who need a personal CRM they can use immediately",
        ],
      },
      {
        id: "real-estate",
        title: "Real estate",
        summary:
          "A workflow for tracking client needs, property interest, visits, and deal potential.",
        bullets: [
          "For agents who keep tracking buyer, seller, and rental clients",
          "For people who want visits and follow-up tied to each customer record",
          "For people who need to quickly reopen each customer's conditions and status",
        ],
      },
      {
        id: "insurance-auto",
        title: "Insurance and auto sales",
        summary:
          "A way to manage repeat consultations, quotes, and pre/post-contract follow-up by customer.",
        bullets: [
          "For sellers who need reminders for follow-up timing and required documents",
          "For people who want quotes, deal potential, and next contact organized by customer",
          "For people managing long-term relationships, renewals, and repeat purchases",
        ],
      },
      {
        id: "b2b-field",
        title: "B2B field sales",
        summary:
          "A workflow for connecting field meetings, stakeholder context, deal stages, and next actions.",
        bullets: [
          "For B2B sellers who move across many companies and contacts",
          "For people who want meeting notes and deal progress in the same context",
          "For people who need to see next actions and follow-up priorities quickly",
        ],
      },
    ],
  },
};

// 기능: 공개 고객 유형별 랜딩 페이지를 렌더링합니다.
export function SolutionsPage() {
  const { language } = usePublicSiteLanguage();
  const copy = solutionsCopyByLanguage[getPublicSiteCopyLanguage(language)];
  const tocItems = copy.segments.map((segment) => ({
    id: segment.id,
    title: segment.title,
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

            <div className="mt-10 grid gap-4 md:grid-cols-4">
              {copy.segments.map((segment) => {
                const Icon = solutionIcons[segment.id];

                return (
                  <PublicInfoCard
                    description={segment.summary}
                    icon={Icon}
                    key={segment.id}
                    title={segment.title}
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
            {copy.segments.map((segment) => (
              <PublicDocumentSection
                bullets={segment.bullets}
                id={segment.id}
                key={segment.id}
                paragraphs={[segment.summary]}
                title={segment.title}
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
