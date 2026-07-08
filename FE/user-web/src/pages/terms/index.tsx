import {
  ArrowRight,
  CheckCircle2,
  LockKeyhole,
  Scale,
  ShieldCheck,
  Sparkles,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Link } from "react-router-dom";
import { PublicSitePageShell } from "@/features/public-site/components/public-site-page-shell";

type PolicyLink = {
  readonly title: string;
  readonly description: string;
  readonly to: string;
  readonly icon: LucideIcon;
};

type TermsSection = {
  readonly id: string;
  readonly title: string;
  readonly body: readonly string[];
};

const policyLinks: readonly PolicyLink[] = [
  {
    title: "Terms of service",
    description:
      "The rules for using Onehand, creating a workspace, and managing account access.",
    to: "/terms",
    icon: Scale,
  },
  {
    title: "Privacy policy",
    description:
      "How Onehand collects, uses, discloses, and protects information.",
    to: "/privacy",
    icon: LockKeyhole,
  },
  {
    title: "Security",
    description:
      "How Onehand approaches workspace access, infrastructure, privacy, and reliability.",
    to: "/security",
    icon: ShieldCheck,
  },
  {
    title: "Contact",
    description:
      "Reach the Onehand team about subscriptions, privacy requests, or security questions.",
    to: "/contact",
    icon: Users,
  },
];

const termsSections: readonly TermsSection[] = [
  {
    id: "using-onehand",
    title: "1. Using Onehand",
    body: [
      "Onehand provides a workspace for sales teams to manage customer records, deal activity, tasks, notes, and AI-assisted workflows. You are responsible for the information you submit and for keeping your account credentials secure.",
      "You may use Onehand only in compliance with applicable laws, these terms, and the policies referenced from this page. If you use Onehand on behalf of an organization, you represent that you have authority to accept these terms for that organization.",
    ],
  },
  {
    id: "accounts",
    title: "2. Accounts and workspaces",
    body: [
      "Workspace owners and administrators control invited users, permissions, billing settings, and the data submitted to their workspace. Onehand may provide tools to help manage access, but each customer remains responsible for deciding who should have access.",
      "You agree to provide accurate account information and to notify us if you believe your account or workspace has been accessed without authorization.",
    ],
  },
  {
    id: "acceptable-use",
    title: "3. Acceptable use",
    body: [
      "You may not use Onehand to violate laws, infringe rights, distribute malware, attempt unauthorized access, interfere with service operation, or process data that you are not permitted to handle.",
      "You may not reverse engineer the service, abuse automated access, scrape platform content in a way that harms the service, or use Onehand to develop a competing product except where allowed by law.",
    ],
  },
  {
    id: "customer-data",
    title: "4. Customer data and privacy",
    body: [
      "Customer data belongs to the customer or workspace that submitted it. Onehand processes customer data to provide, secure, support, and improve the service as described in the Privacy Policy and any applicable customer agreement.",
      "If your workspace includes personal information, you are responsible for ensuring that you have the rights and notices needed to submit that information to Onehand.",
    ],
  },
  {
    id: "ai-features",
    title: "5. AI-assisted features",
    body: [
      "Onehand may include AI-assisted summaries, drafts, search, routing, and other workflow support. AI output can be useful but may be incomplete or inaccurate, so you should review generated content before relying on it for customer commitments or business decisions.",
      "AI features are intended to help users work with approved workspace context. They do not replace human review, professional judgment, or customer-specific validation.",
    ],
  },
  {
    id: "subscriptions",
    title: "6. Subscriptions and billing",
    body: [
      "Paid plans, renewal periods, usage limits, taxes, and cancellation terms are presented at purchase or in the applicable order form. You authorize Onehand and its payment providers to process charges for the selected plan.",
      "Unless otherwise stated, subscription fees are non-refundable except where required by law or expressly agreed in writing.",
    ],
  },
  {
    id: "availability",
    title: "7. Service availability and changes",
    body: [
      "We work to keep Onehand reliable, but the service may occasionally be unavailable because of maintenance, updates, security work, or events outside our control.",
      "We may update features, modify plans, or discontinue parts of the service. When a change materially affects customers, we will use reasonable efforts to provide notice.",
    ],
  },
  {
    id: "liability",
    title: "8. Disclaimers and liability",
    body: [
      "Onehand is provided on an as-is and as-available basis to the fullest extent permitted by law. We do not guarantee that the service will be uninterrupted, error-free, or that AI-assisted content will always be accurate.",
      "To the fullest extent permitted by law, Onehand is not liable for indirect, incidental, special, consequential, or punitive damages, or for lost profits, revenues, data, or business opportunities.",
    ],
  },
  {
    id: "changes-contact",
    title: "9. Changes and contact",
    body: [
      "We may update these terms from time to time. If changes are material, we will provide notice as required by applicable law. Continued use of Onehand after an update means you accept the updated terms.",
      "Questions about these terms can be sent through the Onehand contact page.",
    ],
  },
];

export function TermsPage() {
  return (
    <PublicSitePageShell>
      <section className="bg-white py-16 sm:py-20 lg:py-24">
        <div className="mx-auto w-full max-w-[1320px] px-4 sm:px-6 lg:px-8">
          <div className="max-w-[820px]">
            <p className="text-[13px] font-semibold text-[#777770]">
              Onehand policy center
            </p>
            <h1 className="mt-3 text-[40px] font-black leading-[1.05] tracking-normal md:text-[58px]">
              Terms and privacy.
            </h1>
            <p className="mt-4 max-w-[720px] text-[15px] leading-7 text-[#555550]">
              This page brings together the core terms, privacy, and security
              information for using Onehand. It is a product-facing policy draft
              and should be reviewed for your final legal requirements.
            </p>
            <p className="mt-4 text-[12px] font-bold text-[#888880]">
              Last updated: July 8, 2026
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {policyLinks.map((item) => (
              <PolicyCard item={item} key={item.title} />
            ))}
          </div>

          <div className="mt-16">
            <nav className="rounded-[8px] bg-[#f7f7f5] p-4">
              <p className="text-[12px] font-black uppercase tracking-[0.08em] text-[#888880]">
                Contents
              </p>
              <div className="mt-4 grid gap-2 text-[13px] font-semibold text-[#555550] sm:grid-cols-2">
                {termsSections.map((section) => (
                  <a
                    className="rounded-[6px] px-2 py-1.5 hover:bg-white hover:text-[#111111]"
                    href={`#${section.id}`}
                    key={section.id}
                  >
                    {section.title}
                  </a>
                ))}
              </div>
            </nav>

            <article className="mt-10">
              <div className="rounded-[8px] bg-[#f7f7f5] p-6">
                <div className="flex items-start gap-4">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[8px] bg-white text-[#0075DE]">
                    <Sparkles className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 className="text-[18px] font-black">
                      Short version
                    </h2>
                    <p className="mt-2 text-[13px] leading-6 text-[#555550]">
                      Use Onehand responsibly, protect customer data, review AI
                      output before using it, and contact us when you need help
                      with account, privacy, or security questions.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-10 grid gap-12">
                {termsSections.map((section) => (
                  <section id={section.id} key={section.id}>
                    <h2 className="text-[26px] font-black leading-tight">
                      {section.title}
                    </h2>
                    <div className="mt-4 grid gap-4 text-[14px] leading-7 text-[#444440]">
                      {section.body.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                      ))}
                    </div>
                  </section>
                ))}
              </div>

              <div className="mt-14 rounded-[8px] bg-[#eef6ff] p-6">
                <div className="flex items-start gap-4">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#0075DE]" />
                  <div>
                    <h2 className="text-[18px] font-black">
                      Need a formal review packet?
                    </h2>
                    <p className="mt-2 text-[13px] leading-6 text-[#555550]">
                      Contact the Onehand team for sales, privacy, and security
                      questions related to your organization.
                    </p>
                    <Link
                      className="mt-4 inline-flex items-center gap-2 text-[13px] font-black text-[#0075DE] underline-offset-2 hover:underline"
                      to="/contact"
                    >
                      Contact us
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>
    </PublicSitePageShell>
  );
}

function PolicyCard({ item }: { readonly item: PolicyLink }) {
  const Icon = item.icon;

  return (
    <Link
      className="group rounded-[8px] bg-[#f7f7f5] p-5 transition-colors hover:bg-[#eeeeec]"
      to={item.to}
    >
      <span className="grid h-10 w-10 place-items-center rounded-[8px] bg-white text-[#0075DE]">
        <Icon className="h-5 w-5" />
      </span>
      <h2 className="mt-5 text-[18px] font-black">{item.title}</h2>
      <p className="mt-2 text-[13px] leading-6 text-[#555550]">
        {item.description}
      </p>
      <span className="mt-5 inline-flex items-center gap-2 text-[13px] font-black text-[#0075DE]">
        Open
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}
