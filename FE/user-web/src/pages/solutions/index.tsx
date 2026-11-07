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
    title: "내 업무에서는 어떻게 활용할 수 있을까요?",
    description:
      "고객과 업무 정보를 정리하는 예시를 살펴보세요. 업종별 자동 설정이나 전용 기능의 제공을 뜻하지는 않아요.",
    actionLabel: "자세히 보기",
    contentsLabel: "용도별 선택 기준",
    ctaTitle: "내 업무에 맞는 활용 방법을 살펴볼까요?",
    ctaDescription:
      "현재 관리하는 정보와 업무 방식을 데모 요청에서 알려주세요.",
    segments: [
      {
        id: "personal",
        title: "개인 업무",
        to: "/solutions/personal",
        summary:
          "기억에 의존하던 정보를 남기고, 필요할 때 다시 꺼내 확인하는 활용 예시예요.",
        bullets: [
          "관리할 고객과 업무 정보를 기록해요.",
          "업무에서 새롭게 확인한 정보는 목록에서 수정해요.",
          "현재 목록에서 검색하고 자주 보는 화면을 즐겨찾기에 모아둬요.",
        ],
      },
      {
        id: "b2b-field",
        title: "B2B 고객 관리",
        to: "/solutions/b2b-field",
        summary:
          "업무에서 만나는 회사와 담당자 정보를 기록하고 다시 확인하는 활용 예시예요.",
        bullets: [
          "거래하거나 상담하는 회사의 정보를 기록해요.",
          "업무에서 확인한 담당자 정보를 남기고 변경된 내용을 수정해요.",
          "다음 업무 전에 필요한 기록을 다시 찾아보세요.",
        ],
      },
      {
        id: "real-estate",
        title: "부동산 중개",
        to: "/solutions/real-estate",
        summary:
          "상담에서 확인할 고객·매물 정보를 기록으로 정리하는 활용 예시예요. 업종별 자동 설정 기능은 현재 제공하지 않아요.",
        bullets: [
          "고객별로 확인할 정보를 현재 지원하는 정보 칸에 기록해요.",
          "관리하는 매물의 정보를 목록에서 확인하는 활용 예시예요.",
          "필요한 기록을 찾아 상담 전에 살펴보세요.",
        ],
      },
      {
        id: "insurance-auto",
        title: "보험·자동차 상담",
        to: "/solutions/insurance-auto",
        summary:
          "반복되는 상담에서 필요한 정보를 남기고 다시 확인하는 활용 예시예요. 전용 업무 자동화는 현재 제공하지 않아요.",
        bullets: [
          "다음 상담에서 확인할 고객 정보를 기록해요.",
          "새롭게 확인한 내용을 기록하고 변경된 정보를 수정해요.",
          "칸반 보기가 마련된 목록에서 상태별로 기록을 확인해요.",
        ],
      },
    ],
  },
  "en-US": {
    title: "How could OneHand CRM fit your work?",
    description:
      "Explore examples of organizing customer and work information. These examples do not imply industry-specific setup or dedicated features.",
    actionLabel: "View details",
    contentsLabel: "Use case guide",
    ctaTitle: "Explore how it could fit your work.",
    ctaDescription:
      "Tell us what you manage and how you work when requesting a demo.",
    segments: [
      {
        id: "personal",
        title: "Personal work",
        to: "/solutions/personal",
        summary:
          "Keep information you would otherwise rely on memory for, then find it when you need it.",
        bullets: [
          "Record the customer and work information you manage.",
          "Update supported details in the table as your work changes.",
          "Search the current collection and save useful views as favorites.",
        ],
      },
      {
        id: "b2b-field",
        title: "B2B customer work",
        to: "/solutions/b2b-field",
        summary:
          "An example of recording and reviewing the companies and contacts you work with.",
        bullets: [
          "Record information about the companies you work with.",
          "Keep contact information and update it when it changes.",
          "Review the information you need before your next task.",
        ],
      },
      {
        id: "real-estate",
        title: "Real estate",
        to: "/solutions/real-estate",
        summary:
          "An example of organizing information for property work. Automatic industry-specific setup is not currently available.",
        bullets: [
          "Keep customer information in the fields currently supported.",
          "See an example of reviewing property information in a table.",
          "Find the records you need before your next conversation.",
        ],
      },
      {
        id: "insurance-auto",
        title: "Insurance and auto",
        to: "/solutions/insurance-auto",
        summary:
          "An example of recording and reviewing consultation information. Dedicated industry automation is not currently available.",
        bullets: [
          "Keep the information you need for your next consultation.",
          "Record what you learn and update changed information.",
          "Use an available board view to review records grouped by status.",
        ],
      },
    ],
  },
};

// 기능: 공개 고객 유형별 허브 페이지를 렌더링합니다.
// 기능 : SolutionsPage 화면을 렌더링합니다.
export function SolutionsPage() {
  // 1. 처리 흐름에 필요한 { language } 값을 준비한다.
  const { language } = usePublicSiteLanguage();
  // 2. 이후 단계에서 사용할 copy 값을 준비한다.
  const copy = solutionsCopyByLanguage[getPublicSiteCopyLanguage(language)];
  // 3. 이후 단계에서 사용할 tocItems 값을 준비한다.
  const tocItems = copy.segments.map((segment) => ({
    id: segment.id,
    title: segment.title,
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
