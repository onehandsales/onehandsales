import {
  Building2,
  Store,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import {
  FinalSection,
  PublicContentContainer,
  PublicCtaPanel,
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
  readonly id: "personal" | "small-business" | "enterprise";
  readonly summary: string;
  readonly title: string;
};

type SolutionsCopy = {
  readonly contentsLabel: string;
  readonly ctaDescription: string;
  readonly ctaLabel: string;
  readonly ctaTitle: string;
  readonly description: string;
  readonly eyebrow: string;
  readonly finalTitle: string;
  readonly segments: readonly SolutionSegmentCopy[];
  readonly title: string;
};

const solutionIcons: Record<SolutionSegmentCopy["id"], LucideIcon> = {
  personal: UserRound,
  "small-business": Store,
  enterprise: Building2,
};

const solutionsCopyByLanguage: Record<PublicSiteCopyLanguage, SolutionsCopy> = {
  ko: {
    eyebrow: "Solutions",
    title: "개인부터 조직까지, 영업 기록을 쓰는 방식에 맞게.",
    description:
      "OneHand는 업종별 사례보다 먼저 사용자의 규모와 운영 방식에 맞춰 설명하는 것이 자연스럽습니다.",
    finalTitle: "우리 방식에 맞는 OneHand를 찾아보세요.",
    contentsLabel: "대상별 보기",
    ctaTitle: "우리 방식에 맞는 도입이 궁금한가요?",
    ctaDescription:
      "개인 영업, 작은 팀, 조직 운영 중 어디에 가까운지 알려주시면 필요한 흐름부터 정리할 수 있습니다.",
    ctaLabel: "문의하기",
    segments: [
      {
        id: "personal",
        title: "Personal",
        summary:
          "혼자 고객을 만나고, 연락하고, 딜을 챙기는 개인 영업자를 위한 기본 작업 공간입니다.",
        bullets: [
          "고객, 명함, 일정, 딜을 혼자 관리하는 사람",
          "엑셀과 메모앱에 흩어진 기록을 정리하고 싶은 사람",
          "복잡한 팀 CRM보다 바로 쓸 수 있는 개인 CRM이 필요한 사람",
        ],
      },
      {
        id: "small-business",
        title: "Small business",
        summary:
          "소규모 팀이 고객과 후속 작업을 공유하면서도 운영 부담을 줄이는 방식입니다.",
        bullets: [
          "대표나 팀장이 영업 흐름을 직접 챙기는 작은 팀",
          "고객 데이터와 진행 딜을 팀 안에서 맞춰보고 싶은 조직",
          "도입과 교육이 무거운 CRM 대신 단순한 영업 기록 체계가 필요한 팀",
        ],
      },
      {
        id: "enterprise",
        title: "Enterprise",
        summary:
          "보안, 권한, 운영 정책, 도입 검토가 필요한 조직을 위한 방향입니다.",
        bullets: [
          "데이터 접근과 보안 검토가 중요한 조직",
          "팀별 권한과 운영 정책을 맞춰야 하는 회사",
          "도입 전에 보안/법무/운영 검토가 필요한 고객",
        ],
      },
    ],
  },
  "en-US": {
    eyebrow: "Solutions",
    title: "For the way your sales work is organized.",
    description:
      "Before splitting by industry, OneHand is clearer when it is explained by team size and operating style.",
    finalTitle: "Find the OneHand setup for your team.",
    contentsLabel: "Audience index",
    ctaTitle: "Want to map OneHand to your workflow?",
    ctaDescription:
      "Tell us whether you are closer to personal sales, a small team, or a larger organization, and we can start with the right flow.",
    ctaLabel: "Contact us",
    segments: [
      {
        id: "personal",
        title: "Personal",
        summary:
          "A personal workspace for sellers who meet customers, follow up, and manage deals on their own.",
        bullets: [
          "For people managing customers, cards, schedules, and deals alone",
          "For sellers who want to organize records scattered across spreadsheets and notes",
          "For people who need a personal CRM they can use immediately",
        ],
      },
      {
        id: "small-business",
        title: "Small business",
        summary:
          "A lighter way for small teams to share customer and follow-up context without heavy operations.",
        bullets: [
          "For small teams where founders or managers still run sales closely",
          "For teams that need shared visibility into customers and active deals",
          "For teams that need a simple sales record system instead of a heavy CRM rollout",
        ],
      },
      {
        id: "enterprise",
        title: "Enterprise",
        summary:
          "A direction for organizations that need security, access control, policy, and adoption review.",
        bullets: [
          "For organizations that care about data access and security review",
          "For companies that need team permissions and operating policies",
          "For customers that need legal, security, or operations review before adoption",
        ],
      },
    ],
  },
};

// 기능 : 공개 고객 유형별 솔루션 페이지를 렌더링합니다.
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
          <PublicDocumentHero
            description={copy.description}
            eyebrow={copy.eyebrow}
            title={copy.title}
          />

          <div className="mt-10 grid gap-4 md:grid-cols-3">
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

          <PublicCtaPanel
            className="mt-14"
            description={copy.ctaDescription}
            primaryAction={{ label: copy.ctaLabel, to: "/contact" }}
            title={copy.ctaTitle}
          />
        </PublicContentContainer>
      </PublicPageSection>
      <FinalSection copy={{ title: copy.finalTitle }} />
    </PublicSitePageShell>
  );
}
