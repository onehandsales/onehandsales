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
import { PublicSitePageShell } from "@/features/public-site/components/public-site-page-shell";

type StoryBlock = {
  readonly icon: LucideIcon;
  readonly title: string;
  readonly description: string;
  readonly detail: string;
  readonly tone: string;
};

const storyBlocks: readonly StoryBlock[] = [
  {
    icon: MessageSquareText,
    title: "Sales work used to live in conversations.",
    description:
      "Customer context started in calls, chat, email, and notes. It moved fast, but it rarely stayed organized.",
    detail:
      "Teams could close deals, yet still lose the reason behind the next follow-up.",
    tone: "bg-[#f4f1ea] text-[#7c5a24]",
  },
  {
    icon: Search,
    title: "Then every tool became another place to search.",
    description:
      "CRMs, spreadsheets, call notes, proposals, tasks, and internal wikis each held a different part of the truth.",
    detail:
      "The work was documented, but finding the right answer still depended on memory.",
    tone: "bg-[#edf7ff] text-[#1677d2]",
  },
  {
    icon: Bot,
    title: "AI made the missing context easier to recover.",
    description:
      "Summaries, drafts, reminders, and answers can now be generated from the work that already happened.",
    detail:
      "Onehand is built around that shift: assistants that understand the sales record, not a blank prompt.",
    tone: "bg-[#e9f8f3] text-[#16856b]",
  },
  {
    icon: BriefcaseBusiness,
    title: "The workspace needed to become simpler.",
    description:
      "A small team should not need a complex stack just to know which account changed, what was promised, and what comes next.",
    detail:
      "Onehand keeps account work, customer notes, product details, and next steps in one quiet operating space.",
    tone: "bg-[#fff1ee] text-[#ca3f35]",
  },
  {
    icon: Clock3,
    title: "Our goal is less admin between every customer moment.",
    description:
      "The best sales tools should protect the customer relationship and remove repetitive work around it.",
    detail:
      "That is why Onehand focuses on clean records, fast capture, and AI help that stays close to the workflow.",
    tone: "bg-[#f2eefb] text-[#6f48c9]",
  },
];

const newsItems = [
  "Onehand introduces an AI workspace shaped for recurring customer work.",
  "How small sales teams keep follow-ups, notes, and deal context in sync.",
  "Designing practical AI agents that help without taking over the workflow.",
  "Why customer memory should live beside tasks, products, and meetings.",
  "Building a quieter CRM experience for teams that move quickly.",
  "What we are learning from teams replacing scattered spreadsheets.",
] as const;

export function AboutPage() {
  return (
    <PublicSitePageShell>
      <section className="bg-white py-16 sm:py-20 lg:py-24">
        <div className="mx-auto w-full max-w-[1320px] px-4 sm:px-6 lg:px-8">
          <p className="text-[13px] font-semibold text-[#777770]">
            About Onehand
          </p>
          <h1 className="mt-3 max-w-[760px] text-[40px] font-black leading-[1.05] tracking-normal md:text-[58px]">
            A story of customer work becoming easier to hold.
          </h1>

          <div className="mt-14 grid gap-10 md:grid-cols-[1fr_0.88fr] md:items-center">
            <LineScene />
            <div className="text-[14px] leading-7 text-[#444440]">
              <p>
                If you have ever finished a call, written the next step in one
                tool, updated the account in another, and then searched for the
                exact promise a week later, you already know why Onehand exists.
              </p>
              <p className="mt-5">
                We are building a sales workspace where records, tasks, product
                information, and AI assistance live together so teams can spend
                more time with customers and less time rebuilding context.
              </p>
            </div>
          </div>

          <div className="mt-20 grid gap-16">
            {storyBlocks.map((block, index) => (
              <StorySection
                block={block}
                index={index}
                key={block.title}
              />
            ))}
          </div>

          <section className="mt-24 border-t border-[#eeeeec] pt-12">
            <div className="grid gap-8 md:grid-cols-[0.8fr_1fr] md:items-start">
              <div>
                <h2 className="text-[28px] font-black leading-tight md:text-[36px]">
                  Join us
                </h2>
                <p className="mt-4 text-[14px] leading-7 text-[#555550]">
                  Onehand is made by people who care about practical software,
                  careful product design, and the day-to-day details that make
                  customer work feel lighter.
                </p>
              </div>
              <div className="rounded-[8px] bg-[#f7f7f5] p-6">
                <p className="text-[15px] font-black">
                  Interested in building focused tools for sales teams?
                </p>
                <Link
                  className="mt-4 inline-flex h-9 items-center gap-2 rounded-[6px] bg-[#0075DE] px-4 text-[13px] font-bold text-white hover:bg-[#006AC8]"
                  to="/contact"
                >
                  Talk to Onehand
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </section>

          <section className="mt-20 border-t border-[#eeeeec] pt-12">
            <h2 className="text-[28px] font-black leading-tight md:text-[36px]">
              In the news
            </h2>
            <p className="mt-3 max-w-[620px] text-[14px] leading-7 text-[#555550]">
              A few themes we keep sharing as we build Onehand with working
              teams.
            </p>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {newsItems.map((item) => (
                <article
                  className="min-h-[132px] rounded-[8px] bg-[#f7f7f5] p-5"
                  key={item}
                >
                  <FileText className="h-5 w-5 text-[#777770]" />
                  <p className="mt-5 text-[14px] font-bold leading-6 text-[#222220]">
                    {item}
                  </p>
                </article>
              ))}
            </div>
          </section>
        </div>
      </section>
    </PublicSitePageShell>
  );
}

function StorySection({
  block,
  index,
}: {
  readonly block: StoryBlock;
  readonly index: number;
}) {
  const Icon = block.icon;

  return (
    <section className="grid gap-8 md:grid-cols-[0.9fr_1fr] md:items-center">
      <div
        className={[
          "relative min-h-[220px] overflow-hidden rounded-[8px] bg-[#f7f7f5] p-8",
          index % 2 === 1 ? "md:order-2" : "",
        ].join(" ")}
      >
        <div className="absolute left-8 right-8 top-1/2 h-px bg-[#222220]" />
        <div className="relative grid min-h-[156px] place-items-center">
          <div className="grid h-20 w-20 place-items-center rounded-full bg-white shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
            <span
              className={`grid h-14 w-14 place-items-center rounded-full ${block.tone}`}
            >
              <Icon className="h-7 w-7" />
            </span>
          </div>
          <div className="absolute bottom-1 left-1/2 h-14 w-px -translate-x-1/2 bg-[#222220]" />
          <div className="absolute bottom-0 left-1/2 h-2 w-28 -translate-x-1/2 rounded-full bg-[#222220]" />
        </div>
      </div>

      <div>
        <p className="text-[12px] font-black uppercase tracking-[0.08em] text-[#888880]">
          Chapter {index + 1}
        </p>
        <h2 className="mt-3 text-[26px] font-black leading-tight md:text-[34px]">
          {block.title}
        </h2>
        <p className="mt-4 text-[14px] leading-7 text-[#444440]">
          {block.description}
        </p>
        <p className="mt-4 text-[14px] leading-7 text-[#666661]">
          {block.detail}
        </p>
      </div>
    </section>
  );
}

function LineScene() {
  return (
    <div className="relative min-h-[280px] overflow-hidden rounded-[8px] bg-[#f7f7f5] p-8">
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
      <div className="absolute bottom-8 left-8 right-8 grid grid-cols-3 gap-4 text-[12px] font-bold text-[#777770]">
        <span>Customers</span>
        <span>Context</span>
        <span>Assistants</span>
      </div>
    </div>
  );
}
