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
  readonly to: string;
};

type SolutionsCopy = {
  readonly actionLabel: string;
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
    title: "용도별로 OneHand를 보는 방법.",
    description:
      "OneHand는 개인, 현장 B2B, 부동산 중개, 보험/자동차처럼 반복 상담과 후속 연락이 많은 흐름에 맞춰 다르게 사용할 수 있습니다.",
    actionLabel: "자세히 보기",
    contentsLabel: "용도별 선택 기준",
    ctaTitle: "어떤 용도가 가장 가까운지 함께 정리해볼까요?",
    ctaDescription:
      "현재 고객 관리 방식과 후속 업무를 알려주면 필요한 시작점을 함께 잡아드려요.",
    segments: [
      {
        id: "personal",
        title: "개인",
        to: "/solutions/personal",
        summary:
          "혼자 고객, 일정, 딜, 후속 연락을 챙기는 영업자를 위한 흐름입니다.",
        bullets: [
          "엑셀, 메모앱, 명함 사진에 기록이 흩어져 있는 경우",
          "팀 CRM보다 바로 쓸 수 있는 개인 CRM이 필요한 경우",
          "오늘 연락해야 할 고객과 진행 중인 딜을 빠르게 보고 싶은 경우",
        ],
      },
      {
        id: "b2b-field",
        title: "현장 B2B",
        to: "/solutions/b2b-field",
        summary:
          "외근 미팅, 담당자 관계, 딜 단계, 다음 행동을 함께 연결하는 흐름입니다.",
        bullets: [
          "여러 회사와 담당자를 오가며 미팅을 반복하는 경우",
          "미팅 기록과 제안, 견적, 계약 단계를 같이 봐야 하는 경우",
          "장기 검토 거래처의 다음 접점을 놓치지 않아야 하는 경우",
        ],
      },
      {
        id: "real-estate",
        title: "부동산 중개",
        to: "/solutions/real-estate",
        summary:
          "상담 고객, 관심 조건, 방문 일정, 계약 가능성을 이어서 보는 흐름입니다.",
        bullets: [
          "매수, 매도, 임대 고객의 조건을 계속 추적해야 하는 경우",
          "방문 이후 반응과 다음 연락을 고객별로 남겨야 하는 경우",
          "관심 매물과 계약 가능성을 단계별로 정리해야 하는 경우",
        ],
      },
      {
        id: "insurance-auto",
        title: "보험/자동차",
        to: "/solutions/insurance-auto",
        summary:
          "견적, 서류, 계약 전후 연락과 장기 관계를 고객별로 관리하는 흐름입니다.",
        bullets: [
          "상담 이후 재연락 시점과 필요 서류를 놓치기 쉬운 경우",
          "견적 발송 후 검토 상태를 고객별로 봐야 하는 경우",
          "갱신, 재구매, 소개 고객까지 이어서 관리해야 하는 경우",
        ],
      },
    ],
  },
  "en-US": {
    title: "Ways to use OneHand.",
    description:
      "OneHand can adapt to personal, B2B field, real estate, and insurance/automobile workflows where repeated consultation and follow-up matter.",
    actionLabel: "View details",
    contentsLabel: "Use case guide",
    ctaTitle: "Want to find the closest workflow?",
    ctaDescription:
      "Tell us how you manage customers and follow-up today, and we can map the right starting point.",
    segments: [
      {
        id: "personal",
        title: "Personal",
        to: "/solutions/personal",
        summary:
          "For sellers managing customers, schedules, deals, and follow-up on their own.",
        bullets: [
          "When records are scattered across spreadsheets, notes, and card photos",
          "When you need a personal CRM you can use without a team rollout",
          "When you want to see today's follow-up and active deals quickly",
        ],
      },
      {
        id: "b2b-field",
        title: "B2B Field",
        to: "/solutions/b2b-field",
        summary:
          "For connecting field meetings, stakeholder relationships, deal stages, and next actions.",
        bullets: [
          "When you move across many companies and contacts",
          "When meeting notes must connect to proposals, quotes, and contracts",
          "When long-cycle accounts need reliable next contact timing",
        ],
      },
      {
        id: "real-estate",
        title: "Real Estate",
        to: "/solutions/real-estate",
        summary:
          "For tracking client conditions, property interest, visits, and deal readiness.",
        bullets: [
          "When buyer, seller, and rental conditions need continuous tracking",
          "When visit reactions and next contact timing must stay by client",
          "When property interest and deal readiness need clearer stages",
        ],
      },
      {
        id: "insurance-auto",
        title: "Insurance/Automobile",
        to: "/solutions/insurance-auto",
        summary:
          "For managing quotes, documents, pre/post-contract follow-up, and long-term relationships.",
        bullets: [
          "When follow-up timing and required documents are easy to miss",
          "When quote review status needs to stay organized by customer",
          "When renewals, repurchases, and referrals continue after the first deal",
        ],
      },
    ],
  },
};

// 기능: 공개 고객 유형별 허브 페이지를 렌더링합니다.
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

            <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {copy.segments.map((segment) => {
                const Icon = solutionIcons[segment.id];

                return (
                  <PublicInfoCard
                    actionLabel={copy.actionLabel}
                    description={segment.summary}
                    icon={Icon}
                    key={segment.id}
                    title={segment.title}
                    to={segment.to}
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
