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
  PublicContentContainer,
  PublicDocumentHero,
  PublicInfoCard,
  PublicPageSection,
  PublicRelatedPolicyLinks,
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
    title: "OneHand 소개",
    intro: [
      "통화를 끝낸 뒤 다음 액션은 다른 도구에 적고, 계정 정보는 또 다른 곳에 업데이트하고, 일주일 뒤 약속 내용을 다시 찾느라 시간을 쓴 적이 있다면 OneHand가 왜 필요한지 이미 알고 있습니다.",
      "우리는 기록, 업무, 제품 정보, AI 지원이 한곳에 있는 세일즈 워크스페이스를 만들고 있습니다. 팀이 맥락을 다시 조립하는 시간보다 고객과 보내는 시간을 늘리기 위해서입니다.",
    ],
    chapterLabel: "챕터",
    storyBlocks: [
      {
        title: "세일즈 업무는 대화 속에서 시작됐습니다.",
        description:
          "고객 맥락은 통화, 채팅, 이메일, 메모에서 빠르게 움직였지만 오래 정리되어 남지는 못했습니다.",
        detail: "팀은 거래를 성사시켜도 다음 후속 업무의 이유를 잃곤 했습니다.",
      },
      {
        title: "이후 모든 도구가 또 하나의 검색 장소가 됐습니다.",
        description:
          "CRM, 스프레드시트, 회의록, 제안서, 업무, 위키가 각자 다른 사실을 담았습니다.",
        detail: "업무는 기록됐지만 적절한 답을 찾는 일은 여전히 기억에 의존했습니다.",
      },
      {
        title: "AI는 사라진 맥락을 복구하기 쉽게 만들었습니다.",
        description:
          "이미 일어난 업무에서 요약, 초안, 알림, 답변을 만들 수 있게 됐습니다.",
        detail:
          "OneHand는 빈 프롬프트가 아니라 세일즈 기록을 이해하는 어시스턴트를 중심으로 설계됩니다.",
      },
      {
        title: "워크스페이스는 더 단순해져야 했습니다.",
        description:
          "작은 팀이 어떤 계정이 바뀌었는지, 무엇을 약속했는지, 다음 일이 무엇인지 알기 위해 복잡한 스택을 가질 필요는 없습니다.",
        detail:
          "OneHand는 계정 업무, 고객 메모, 제품 정보, 다음 액션을 조용한 하나의 운영 공간에 모읍니다.",
      },
      {
        title: "우리의 목표는 고객 순간 사이의 관리 업무를 줄이는 것입니다.",
        description:
          "좋은 세일즈 도구는 고객 관계를 지키고 그 주변의 반복 업무를 덜어야 합니다.",
        detail:
          "그래서 OneHand는 깔끔한 기록, 빠른 캡처, 실제 업무 흐름에 가까운 AI 지원에 집중합니다.",
      },
    ],
    joinTitle: "함께 만들기",
    joinDescription:
      "OneHand는 실용적인 소프트웨어, 세심한 제품 설계, 고객 업무를 가볍게 만드는 작은 디테일을 중요하게 여기는 사람들이 만듭니다.",
    joinCardTitle: "세일즈 팀을 위한 집중된 도구를 함께 만들고 싶으신가요?",
    joinCta: "OneHand에 문의",
    newsTitle: "새 소식",
    newsDescription: "OneHand를 실제 팀과 함께 만들며 계속 공유하는 주제들입니다.",
    newsItems: [
      "반복 고객 업무에 맞춘 AI 워크스페이스를 소개합니다.",
      "작은 세일즈 팀이 후속 업무, 메모, 딜 맥락을 맞추는 방법.",
      "업무를 대신하지 않고 돕는 실용적인 AI 에이전트 설계.",
      "고객 기억이 업무, 제품, 회의 옆에 있어야 하는 이유.",
      "빠르게 움직이는 팀을 위한 더 조용한 CRM 경험 만들기.",
      "흩어진 스프레드시트를 대체하는 팀에게서 배우는 것.",
    ],
    sceneLabels: ["고객", "맥락", "어시스턴트"],
  },  "en-US": {
    title: "OneHand Introduction",
    intro: [
      "If you have ever finished a call, written the next step in one tool, updated the account in another, and then searched for the exact promise a week later, you already know why OneHand exists.",
      "We are building a sales workspace where records, tasks, product information, and AI assistance live together so teams can spend more time with customers and less time rebuilding context.",
    ],
    chapterLabel: "Chapter",
    storyBlocks: [
      {
        title: "Sales work used to live in conversations.",
        description:
          "Customer context started in calls, chat, email, and notes. It moved fast, but it rarely stayed organized.",
        detail:
          "Teams could close deals, yet still lose the reason behind the next follow-up.",
      },
      {
        title: "Then every tool became another place to search.",
        description:
          "CRMs, spreadsheets, call notes, proposals, tasks, and internal wikis each held a different part of the truth.",
        detail:
          "The work was documented, but finding the right answer still depended on memory.",
      },
      {
        title: "AI made the missing context easier to recover.",
        description:
          "Summaries, drafts, reminders, and answers can now be generated from the work that already happened.",
        detail:
          "OneHand is built around that shift: assistants that understand the sales record, not a blank prompt.",
      },
      {
        title: "The workspace needed to become simpler.",
        description:
          "A small team should not need a complex stack just to know which account changed, what was promised, and what comes next.",
        detail:
          "OneHand keeps account work, customer notes, product details, and next steps in one quiet operating space.",
      },
      {
        title: "Our goal is less admin between every customer moment.",
        description:
          "The best sales tools should protect the customer relationship and remove repetitive work around it.",
        detail:
          "That is why OneHand focuses on clean records, fast capture, and AI help that stays close to the workflow.",
      },
    ],
    joinTitle: "Join us",
    joinDescription:
      "OneHand is made by people who care about practical software, careful product design, and the day-to-day details that make customer work feel lighter.",
    joinCardTitle: "Interested in building focused tools for sales teams?",
    joinCta: "Talk to OneHand",
    newsTitle: "In the news",
    newsDescription:
      "A few themes we keep sharing as we build OneHand with working teams.",
    newsItems: [
      "OneHand introduces an AI workspace shaped for recurring customer work.",
      "How small sales teams keep follow-ups, notes, and deal context in sync.",
      "Designing practical AI agents that help without taking over the workflow.",
      "Why customer memory should live beside tasks, products, and meetings.",
      "Building a quieter CRM experience for teams that move quickly.",
      "What we are learning from teams replacing scattered spreadsheets.",
    ],
    sceneLabels: ["Customers", "Context", "Assistants"],
  },};

// 기능 : 서비스 소개 페이지를 렌더링합니다.
export function AboutPage() {
  const { language } = usePublicSiteLanguage();
  const publicSitePath = usePublicSitePath();
  const copy = aboutCopyByLanguage[getPublicSiteCopyLanguage(language)];

  return (
    <PublicSitePageShell>
      <PublicPageSection>
        <PublicContentContainer>
          <PublicDocumentHero title={copy.title} />

          <PublicRelatedPolicyLinks className="mt-10" currentPath="/about" />

          <div className="mt-14 grid gap-10 md:grid-cols-[1fr_0.88fr] md:items-center">
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
