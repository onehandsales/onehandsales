import {
  ArrowRight,
  Bot,
  CheckCircle2,
  Database,
  FileCheck2,
  Globe2,
  LockKeyhole,
  Server,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { Link } from "react-router-dom";
import { PublicSitePageShell } from "@/features/public-site/components/public-site-page-shell";

type SecurityCard = {
  readonly title: string;
  readonly description: string;
};

type SecuritySection = {
  readonly eyebrow: string;
  readonly title: string;
  readonly description: string;
  readonly icon: LucideIcon;
  readonly cards: readonly SecurityCard[];
};

const sections: readonly SecuritySection[] = [
  {
    eyebrow: "Security",
    title: "Protect customer context from capture to follow-up.",
    description:
      "Onehand is designed around account records, customer conversations, and sales workflows that should only be available to the right people.",
    icon: ShieldCheck,
    cards: [
      {
        title: "Workspace access controls",
        description:
          "Teams can separate workspaces, roles, and account visibility so customer information stays within the right operating group.",
      },
      {
        title: "Secure infrastructure",
        description:
          "Application traffic is protected in transit and sensitive platform data is managed with a security-first infrastructure approach.",
      },
      {
        title: "Product security reviews",
        description:
          "New workflow surfaces are reviewed around permissions, auditability, and the handling of customer records before release.",
      },
    ],
  },
  {
    eyebrow: "Privacy",
    title: "Privacy controls follow the data, not just the page.",
    description:
      "Customer records, uploaded files, and meeting notes can include personal information. Onehand keeps privacy expectations visible across the product lifecycle.",
    icon: LockKeyhole,
    cards: [
      {
        title: "Purpose-based processing",
        description:
          "We use customer data to provide the service, support accounts, secure the platform, and improve workflows described to users.",
      },
      {
        title: "Vendor review",
        description:
          "Subprocessors and service providers are reviewed for their role, security posture, and ability to protect customer information.",
      },
      {
        title: "User choices",
        description:
          "Users can request access, correction, deletion, or other rights where applicable through the privacy contact process.",
      },
    ],
  },
  {
    eyebrow: "Compliance",
    title: "Controls built for teams that need a dependable system.",
    description:
      "As Onehand grows, our compliance program is being shaped around practical customer requirements: availability, access control, vendor management, and data handling.",
    icon: FileCheck2,
    cards: [
      {
        title: "Policy governance",
        description:
          "Security and privacy policies define how we manage internal access, incidents, retention, and customer support workflows.",
      },
      {
        title: "Data processing support",
        description:
          "Enterprise customers can request data processing and security materials during procurement and account review.",
      },
      {
        title: "Operational readiness",
        description:
          "Platform changes are handled with review paths that prioritize uptime, recoverability, and predictable release behavior.",
      },
    ],
  },
  {
    eyebrow: "AI governance",
    title: "AI assistance should stay accountable.",
    description:
      "Onehand agents help summarize, draft, route, and search across approved workspace context. The product is designed so teams can keep humans in the workflow.",
    icon: Bot,
    cards: [
      {
        title: "Customer controlled context",
        description:
          "AI features are grounded in workspace information the user is already allowed to access.",
      },
      {
        title: "No hidden handoff",
        description:
          "Generated summaries and drafts are presented as assistance, not as final customer commitments.",
      },
      {
        title: "Responsible improvement",
        description:
          "We review AI features for accuracy expectations, permission boundaries, and user-facing transparency.",
      },
    ],
  },
  {
    eyebrow: "Reliability",
    title: "Sales work needs to be available when the customer is ready.",
    description:
      "Reliability is treated as product quality. The team designs workflows so customer data remains reachable and understandable during daily work.",
    icon: Server,
    cards: [
      {
        title: "Backups and recovery",
        description:
          "Operational data is managed with recovery planning so workspace records can be restored when incidents occur.",
      },
      {
        title: "Monitoring",
        description:
          "Service health and platform behavior are monitored so issues can be investigated and resolved quickly.",
      },
      {
        title: "Support readiness",
        description:
          "Customers can contact the Onehand team for account, privacy, and security questions through the public contact flow.",
      },
    ],
  },
];

const trustItems = [
  { icon: Database, label: "Data handled for service delivery" },
  { icon: Globe2, label: "Privacy rights supported where applicable" },
  { icon: CheckCircle2, label: "Security reviews built into product work" },
] as const;

export function SecurityPage() {
  return (
    <PublicSitePageShell>
      <section className="bg-white py-16 sm:py-20 lg:py-24">
        <div className="mx-auto w-full max-w-[1320px] px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-[13px] font-semibold text-[#777770]">
              Onehand security
            </p>
            <h1 className="mx-auto mt-3 max-w-[760px] text-[40px] font-black leading-[1.05] tracking-normal md:text-[58px]">
              Security & privacy for customer work.
            </h1>
            <p className="mx-auto mt-4 max-w-[680px] text-[15px] leading-7 text-[#555550]">
              Onehand helps teams manage customer records, sales activity, and
              AI assistance in one workspace. Our security and privacy work is
              built around protecting that context.
            </p>
          </div>

          <div className="mx-auto mt-10 grid max-w-[860px] gap-3 md:grid-cols-3">
            {trustItems.map(({ icon: Icon, label }) => (
              <div
                className="flex items-center gap-3 rounded-[8px] bg-[#f7f7f5] px-4 py-3"
                key={label}
              >
                <Icon className="h-4 w-4 text-[#0075DE]" />
                <span className="text-[12px] font-bold text-[#333330]">
                  {label}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-16 grid gap-20">
            {sections.map((section) => (
              <SecuritySectionBlock key={section.eyebrow} section={section} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f7f7f5] py-16 sm:py-20 lg:py-24">
        <div className="mx-auto w-full max-w-[1320px] px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-[34px] font-black leading-tight md:text-[46px]">
            Learn about using Onehand with your team.
          </h2>
          <p className="mx-auto mt-4 max-w-[660px] text-[14px] leading-7 text-[#555550]">
            We can share how Onehand handles workspace access, privacy
            questions, and security review requests for your organization.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link
              className="inline-flex h-9 items-center gap-2 rounded-[6px] bg-[#0075DE] px-4 text-[13px] font-bold text-white hover:bg-[#006AC8]"
              to="/contact"
            >
              Contact us
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              className="inline-flex h-9 items-center rounded-[6px] bg-white px-4 text-[13px] font-bold text-[#0075DE] hover:bg-[#eeeeec]"
              to="/privacy"
            >
              Read privacy policy
            </Link>
          </div>
        </div>
      </section>
    </PublicSitePageShell>
  );
}

function SecuritySectionBlock({
  section,
}: {
  readonly section: SecuritySection;
}) {
  const Icon = section.icon;

  return (
    <section>
      <div className="grid gap-8 md:grid-cols-[0.72fr_1fr] md:items-start">
        <div>
          <div className="mb-5 grid h-16 w-16 place-items-center rounded-[8px] bg-[#edf7ff] text-[#0075DE]">
            <Icon className="h-8 w-8" />
          </div>
          <p className="text-[13px] font-semibold text-[#777770]">
            {section.eyebrow}
          </p>
          <h2 className="mt-2 text-[30px] font-black leading-tight md:text-[42px]">
            {section.title}
          </h2>
          <p className="mt-4 text-[14px] leading-7 text-[#555550]">
            {section.description}
          </p>
        </div>

        <div className="grid gap-3">
          {section.cards.map((card) => (
            <article className="rounded-[8px] bg-[#f7f7f5] p-5" key={card.title}>
              <h3 className="text-[15px] font-black">{card.title}</h3>
              <p className="mt-2 text-[13px] leading-6 text-[#555550]">
                {card.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
