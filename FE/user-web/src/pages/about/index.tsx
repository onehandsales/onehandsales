import {
  ArrowRight,
  Bot,
  BriefcaseBusiness,
  Clock3,
  FileText,
  MessageSquareText,
  Search,
  Sparkles,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  FinalSection,
  PublicContentContainer,
  PublicDocumentHero,
  PublicInfoCard,
  PublicPageSection,
  PublicSitePageShell,
} from "@/features/public-site";
import { usePublicSitePath } from "@/features/public-site/i18n/public-site-locale-hooks";
import {
  getPublicSiteCopyLanguage,
  usePublicSiteLanguage,
  type PublicSiteCopyLanguage,
} from "@/features/public-site/i18n/public-site-language";

type StoryBlockCopy = {
  readonly title: string;
  readonly description: string;
  readonly detail: string;
};

type AboutCopy = {
  readonly title: string;
  readonly finalTitle: string;
  readonly intro: readonly string[];
  readonly chapterLabel: string;
  readonly storyBlocks: readonly StoryBlockCopy[];
  readonly joinTitle: string;
  readonly joinDescription: string;
  readonly joinCardTitle: string;
  readonly joinCta: string;
  readonly newsTitle: string;
  readonly newsDescription: string;
  readonly newsItems: readonly string[];
  readonly sceneLabels: readonly [string, string, string];
};

const storyVisuals: readonly {
  readonly icon: LucideIcon;
  readonly tone: string;
}[] = [
  { icon: MessageSquareText, tone: "bg-[#f4f1ea] text-[#7c5a24]" },
  { icon: Search, tone: "bg-[#edf7ff] text-[#1677d2]" },
  { icon: Bot, tone: "bg-[#e9f8f3] text-[#16856b]" },
  { icon: BriefcaseBusiness, tone: "bg-[#fff1ee] text-[#ca3f35]" },
  { icon: Clock3, tone: "bg-[#f2eefb] text-[#6f48c9]" },
];

const aboutCopyByLanguage: Record<PublicSiteCopyLanguage, AboutCopy> = {
  ko: {
    title: "OneHand CRM을 만드는 이유.",
    finalTitle: "지금의 OneHand CRM을 살펴보세요.",
    intro: [
      "고객과 업무에 관한 정보를 남기고도 필요한 순간에 다시 찾기 어려울 때가 있어요. OneHand CRM은 기록을 관리하는 기본 경험에 집중해요.",
      "CRM을 잘 다루는 일보다 내 일을 잘하는 데 집중할 수 있도록, 내 업무에 맞는 CRM을 만드는 것이 목표예요.",
    ],
    chapterLabel: "챕터",
    storyBlocks: [
      {
        title: "필요한 순간에 찾는 기록",
        description:
          "기록은 남기는 것만큼 다시 찾을 수 있는 것이 중요해요.",
        detail: "고객과 업무 정보를 확인하고 수정하는 기본 흐름부터 다듬어요.",
      },
      {
        title: "일마다 다른 관리 방식",
        description:
          "부동산 중개사와 컨설턴트가 관리하는 정보는 달라요.",
        detail: "사용자가 하는 일을 이해하는 CRM을 지향해요.",
      },
      {
        title: "시작부터 복잡하지 않게",
        description:
          "CRM 구조를 공부하기보다 첫 기록을 남기는 일에 집중할 수 있어야 해요.",
        detail:
          "시작할 때 필요한 결정을 줄이는 경험을 목표로 해요.",
      },
      {
        title: "일이 바뀌어도 이어서",
        description:
          "처음의 관리 방식이 나중의 업무를 제한하지 않아야 해요.",
        detail:
          "필요에 맞춰 확장되는 경험을 목표로 해요.",
      },
      {
        title: "우리가 지향하는 OneHand CRM",
        description:
          "CRM을 배우거나 설계할 필요 없이, 내 일에 맞는 CRM이 바로 준비되는 것.",
        detail:
          "업무별 자동 준비는 현재 제공 기능과 구분되는 제품 방향이에요.",
      },
    ],
    joinTitle: "함께 만들기",
    joinDescription:
      "고객과 업무 정보를 관리하는 실제 경험을 제품에 반영하고 싶어요.",
    joinCardTitle: "어떤 일을 하고 계신가요?",
    joinCta: "내 업무 이야기하기",
    newsTitle: "새 소식",
    newsDescription: "현재 제품에서 확인할 수 있는 기능과 활용 예시를 정리했어요.",
    newsItems: [
      "고객 정보를 기록하고 수정하는 현재 기능 안내",
      "테이블·칸반·리스트 보기의 제공 범위 안내",
      "현재 목록에서 필요한 기록을 검색하는 방법",
      "자주 보는 화면을 즐겨찾기에 모으는 방법",
      "개인 업무에서 기록을 정리하는 활용 예시",
      "현재 기능과 앞으로의 제품 방향 안내",
    ],
    sceneLabels: ["고객", "기록", "내 업무"],
  },
  "en-US": {
    title: "Why we are building OneHand CRM.",
    finalTitle: "Explore OneHand CRM today.",
    intro: [
      "Information is only useful if you can find it again when you need it. OneHand CRM focuses on the everyday experience of managing records.",
      "Our goal is a CRM shaped for your work, so you can focus on doing that work rather than learning how to design a CRM.",
    ],
    chapterLabel: "Chapter",
    storyBlocks: [
      {
        title: "Records you can return to",
        description:
          "Finding a record again matters as much as capturing it.",
        detail:
          "We are refining the basics of viewing and updating customer and work information.",
      },
      {
        title: "Different work needs different information",
        description:
          "A property professional and a consultant manage different information.",
        detail:
          "We aim to build a CRM that understands the work you do.",
      },
      {
        title: "A simpler start",
        description:
          "Getting started should focus on your first record.",
        detail:
          "Our goal is to reduce the decisions needed before useful work begins.",
      },
      {
        title: "Room for work to change",
        description:
          "Your starting structure should not limit the work you do later.",
        detail:
          "We aim for an experience that can grow with your needs.",
      },
      {
        title: "The OneHand CRM we are building",
        description:
          "A CRM ready for your work, without having to learn or design it.",
        detail:
          "Automatic work-specific setup is our direction, separate from the current feature set.",
      },
    ],
    joinTitle: "Join us",
    joinDescription:
      "We want the product to reflect how people actually manage customer and work information.",
    joinCardTitle: "What does your work involve?",
    joinCta: "Tell us about your work",
    newsTitle: "In the news",
    newsDescription:
      "Updates on the current feature scope and examples of how to use it.",
    newsItems: [
      "Current features for adding and updating customer records",
      "Availability of table, board, and list views",
      "Finding a record in your current collection",
      "Keeping useful views in favorites",
      "An example of organizing records for individual work",
      "Current features and the product direction ahead",
    ],
    sceneLabels: ["Customers", "Records", "Your work"],
  },
};

// 기능 : 서비스 소개 페이지를 렌더링합니다.
export function AboutPage() {
  // 1. 처리 흐름에 필요한 { language } 값을 준비한다.
  const { language } = usePublicSiteLanguage();
  // 2. 처리 흐름에 필요한 publicSitePath 값을 준비한다.
  const publicSitePath = usePublicSitePath();
  // 3. 이후 단계에서 사용할 copy 값을 준비한다.
  const copy = aboutCopyByLanguage[getPublicSiteCopyLanguage(language)];

  // 4. 계산된 결과를 호출자에게 반환한다.
  return (
    <PublicSitePageShell>
      <PublicPageSection>
        <PublicContentContainer>
          <PublicDocumentHero title={copy.title} />

          <div className="mt-16 grid gap-10 md:grid-cols-[1fr_0.88fr] md:items-center">
            <LineScene labels={copy.sceneLabels} />
            <div className="break-keep text-[14px] leading-7 text-[#444440]">
              {copy.intro.map((paragraph) => (
                <p className="mt-5 first:mt-0" key={paragraph}>
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          <div className="mt-20 grid gap-16">
            {copy.storyBlocks.map((block, index) => (
              <StorySection
                block={block}
                chapterLabel={copy.chapterLabel}
                index={index}
                key={block.title}
              />
            ))}
          </div>

          <section className="mt-24 border-t border-[#eeeeec] pt-12">
            <div className="grid gap-8 md:grid-cols-[0.8fr_1fr] md:items-start">
              <div>
                <h2 className="break-keep text-[28px] font-normal leading-tight md:text-[36px]">
                  {copy.joinTitle}
                </h2>
                <p className="mt-4 break-keep text-[14px] leading-7 text-[#555550]">
                  {copy.joinDescription}
                </p>
              </div>
              <PublicInfoCard className="p-6" title={copy.joinCardTitle}>
                <Link
                  className="mt-4 inline-flex h-9 items-center gap-2 rounded-[6px] bg-[#0075DE] px-4 text-[13px] font-normal text-white hover:bg-[#006AC8]"
                  to={publicSitePath("/contact")}
                >
                  {copy.joinCta}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </PublicInfoCard>
            </div>
          </section>

          <section className="mt-20 border-t border-[#eeeeec] pt-12">
            <h2 className="break-keep text-[28px] font-normal leading-tight md:text-[36px]">
              {copy.newsTitle}
            </h2>
            <p className="mt-3 max-w-[620px] break-keep text-[14px] leading-7 text-[#555550]">
              {copy.newsDescription}
            </p>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {copy.newsItems.map((item) => (
                <PublicInfoCard
                  className="min-h-[132px] rounded-[8px] bg-[#FAFAF8] p-5"
                  icon={FileText}
                  key={item}
                  title={item}
                  titleClassName="text-[14px] leading-6"
                />
              ))}
            </div>
          </section>
        </PublicContentContainer>
      </PublicPageSection>
      <FinalSection copy={{ title: copy.finalTitle }} />
    </PublicSitePageShell>
  );
}

// 기능 : 스토리 섹션을 렌더링합니다.
function StorySection({
  block,
  chapterLabel,
  index,
}: {
  readonly block: StoryBlockCopy;
  readonly chapterLabel: string;
  readonly index: number;
}) {
  const visual = storyVisuals[index] ?? storyVisuals[0]!;
  const Icon = visual.icon;

  return (
    <section className="grid gap-8 md:grid-cols-[0.9fr_1fr] md:items-center">
      <div
        className={[
          "relative min-h-[220px] overflow-hidden rounded-[8px] bg-[#FAFAF8] p-8",
          index % 2 === 1 ? "md:order-2" : "",
        ].join(" ")}
      >
        <div className="absolute left-8 right-8 top-1/2 h-px bg-[#222220]" />
        <div className="relative grid min-h-[156px] place-items-center">
          <div className="grid h-20 w-20 place-items-center rounded-full bg-white shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
            <span
              className={`grid h-14 w-14 place-items-center rounded-full ${visual.tone}`}
            >
              <Icon className="h-7 w-7" />
            </span>
          </div>
          <div className="absolute bottom-1 left-1/2 h-14 w-px -translate-x-1/2 bg-[#222220]" />
          <div className="absolute bottom-0 left-1/2 h-2 w-28 -translate-x-1/2 rounded-full bg-[#222220]" />
        </div>
      </div>

      <div>
        <p className="text-[12px] font-normal uppercase tracking-[0.08em] text-[#888880]">
          {chapterLabel} {index + 1}
        </p>
        <h2 className="mt-3 break-keep text-[26px] font-normal leading-tight md:text-[34px]">
          {block.title}
        </h2>
        <p className="mt-4 break-keep text-[14px] leading-7 text-[#444440]">
          {block.description}
        </p>
        <p className="mt-4 break-keep text-[14px] leading-7 text-[#666661]">
          {block.detail}
        </p>
      </div>
    </section>
  );
}

// 기능 : 라인 장면 영역을 렌더링합니다.
function LineScene({
  labels,
}: {
  readonly labels: readonly [string, string, string];
}) {
  return (
    <div className="relative min-h-[280px] overflow-hidden rounded-[8px] bg-[#FAFAF8] p-8">
      <div className="absolute left-8 right-8 top-[184px] h-px bg-[#222220]" />
      <div className="relative mx-auto grid max-w-[420px] grid-cols-3 gap-5">
        {[Users, MessageSquareText, Sparkles].map((Icon, index) => (
          <div className="grid justify-items-center gap-4" key={index}>
            <span className="grid h-16 w-16 place-items-center rounded-full bg-white shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
              <Icon className="h-7 w-7 text-[#111111]" />
            </span>
            <span className="h-20 w-px bg-[#222220]" />
          </div>
        ))}
      </div>
      <div className="absolute bottom-8 left-8 right-8 grid grid-cols-3 gap-4 text-[12px] font-normal text-[#777770]">
        {labels.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
    </div>
  );
}
