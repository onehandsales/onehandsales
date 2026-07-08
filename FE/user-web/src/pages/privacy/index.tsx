import { ArrowRight, LockKeyhole } from "lucide-react";
import { Link } from "react-router-dom";
import { PublicSitePageShell } from "@/features/public-site/components/public-site-page-shell";

type PrivacySubsection = {
  readonly title: string;
  readonly paragraphs?: readonly string[];
  readonly bullets?: readonly string[];
};

type PrivacySection = {
  readonly id: string;
  readonly title: string;
  readonly paragraphs?: readonly string[];
  readonly bullets?: readonly string[];
  readonly subsections?: readonly PrivacySubsection[];
};

const tableOfContents = [
  "Information we collect",
  "How we use your information",
  "Disclosing your information",
  "International data transfers",
  "Your choices",
  "Your privacy rights",
  "Data retention",
  "Security of your information",
  "Third-party websites/applications",
  "Children's information",
  "Supervisory authority",
  "Additional information for California residents",
  "Data privacy framework",
  "Changes to our privacy policy",
] as const;

const privacySections: readonly PrivacySection[] = [
  {
    id: "information-we-collect",
    title: "1. Information we collect",
    paragraphs: [
      "We collect information when you provide it to us, when you use our Website or Services, and when other sources provide it to us. The categories below describe the information that may be collected depending on how you use Onehand.",
    ],
    subsections: [
      {
        title: "A. Information you provide to us",
        bullets: [
          "Account creation: name, email address, password, role, company information, optional profile photo, and workspace details.",
          "Communications with us: email address, phone number, support messages, attachments, and other information you choose to provide.",
          "Payment information: billing details and transaction information processed through our payment providers. We do not directly store full payment card details in the Services.",
          "Surveys and research: responses, contact details, and product feedback when you choose to participate.",
          "Interactive features: content you submit in forms, comments, messages, shared workspaces, or other collaborative product areas.",
          "Events and business outreach: contact information collected when you interact with us at events, webinars, or other business conversations.",
          "Job applications: application materials, resume information, and related communications if you apply to work with us.",
        ],
      },
      {
        title: "B. Information collected automatically",
        bullets: [
          "Device and usage data: IP address, browser type, operating system, device identifiers, browser language, time zone, country code or approximate location derived from network signals, pages viewed, links clicked, and activity frequency or duration.",
          "Cookies and similar technologies: cookies, local storage, pixel tags, and related technologies that support login, security, preferences, analytics, and marketing where permitted.",
          "Analytics information: aggregated and event-level usage information that helps us understand product performance and improve the Services.",
          "Advertising information: where permitted, information from advertising partners may help us measure campaigns and show relevant information about Onehand.",
        ],
      },
      {
        title: "C. Information from other sources",
        bullets: [
          "Third-party login or integration providers may provide profile, account, or connection information based on your settings with that provider.",
          "If you connect calendar, contacts, email, file, CRM, or communication tools, we process the information needed to provide the integration you requested.",
          "If your organization provisions or manages your account, we may receive organization, role, membership, or workspace information from that organization.",
          "We may receive business contact information from data providers for business-to-business marketing and sales outreach where permitted by law.",
        ],
      },
    ],
  },
  {
    id: "how-we-use",
    title: "2. How we use your information",
    paragraphs: [
      "We use information for business and operational purposes related to providing, securing, supporting, and improving Onehand.",
    ],
    subsections: [
      {
        title: "Provide the Services or requested information",
        bullets: [
          "Create, authenticate, and manage accounts and workspaces.",
          "Provide access to customer records, notes, tasks, products, deal workflows, and AI-assisted features.",
          "Process subscriptions, invoices, payments, and purchase orders through service providers.",
          "Respond to questions, customer support requests, security inquiries, and privacy requests.",
          "Send service messages, product updates, administrative notices, and support communications.",
        ],
      },
      {
        title: "Operate and improve Onehand",
        bullets: [
          "Measure interest and engagement in the Website and Services.",
          "Debug, monitor, protect, and improve platform reliability and security.",
          "Research, develop, and improve product features, including AI-assisted workflows.",
          "Prevent fraud, abuse, unauthorized access, and activity that violates our terms.",
          "Comply with legal obligations, enforce agreements, and protect rights and safety.",
        ],
      },
      {
        title: "Facilitate collaboration in a workspace",
        paragraphs: [
          "If you join or collaborate in a workspace, basic account information such as name, email address, profile photo, workspace role, and workspace activity may be visible to other users in that workspace or to the organization that manages it.",
        ],
      },
      {
        title: "Marketing and de-identified information",
        paragraphs: [
          "Where permitted, we may use information to provide marketing about Onehand and related services. We may also use de-identified or aggregated information that can no longer reasonably identify you for analytics, research, and other legally permissible purposes.",
        ],
      },
    ],
  },
  {
    id: "disclosing",
    title: "3. Disclosing your information",
    paragraphs: [
      "We may disclose information to the categories of recipients below, depending on how you use Onehand and the choices you make.",
    ],
    bullets: [
      "Service providers that help provide hosting, analytics, payments, customer support, communications, security, fraud prevention, and other operational services.",
      "Business partners when you request or authorize a product, service, integration, or joint offering.",
      "Affiliates and entities under common ownership or control, where applicable.",
      "Advertising and analytics partners to measure campaigns and provide information about Onehand where permitted by law.",
      "Other workspace users when you submit content to a shared workspace or collaborate with other users.",
      "Organizations that provision, own, or manage workspaces to validate membership, manage access, and administer the workspace.",
      "Authorities, legal process participants, or third parties when we believe disclosure is required or appropriate to comply with law, protect rights, enforce policies, collect amounts owed, or investigate suspected illegal activity.",
      "Successors or transaction parties in connection with a merger, acquisition, financing, reorganization, bankruptcy, sale of assets, or transition of service.",
    ],
  },
  {
    id: "international-transfers",
    title: "4. International data transfers",
    paragraphs: [
      "Information processed by Onehand may be transferred to, processed in, and stored in countries other than where you live. These countries may have data protection laws that differ from the laws in your jurisdiction.",
      "When we transfer information internationally, we endeavor to use safeguards required by applicable law, such as contractual protections or other legally recognized transfer mechanisms.",
    ],
  },
  {
    id: "choices",
    title: "5. Your choices",
    subsections: [
      {
        title: "General choices",
        paragraphs: [
          "You may have the right to object to or opt out of certain uses of your information. Where processing is based on consent, you may withdraw that consent at any time, though withdrawal does not affect processing that occurred before withdrawal.",
        ],
      },
      {
        title: "Email communications",
        paragraphs: [
          "You can use unsubscribe instructions in marketing emails to stop receiving future marketing messages. You may still receive transactional, service, security, and administrative messages related to your account or workspace.",
        ],
      },
      {
        title: "Cookies and similar technologies",
        paragraphs: [
          "You may control cookies through browser settings and, where available, product or website preference tools. Some features may not work correctly if necessary cookies are disabled.",
        ],
      },
      {
        title: "Do Not Track and preference signals",
        paragraphs: [
          "Some browsers offer signals such as Do Not Track or Global Privacy Control. We respond to legally recognized preference signals where required by applicable law.",
        ],
      },
    ],
  },
  {
    id: "privacy-rights",
    title: "6. Your privacy rights",
    paragraphs: [
      "Depending on your location and applicable law, you may have the rights listed below. We will process requests in accordance with applicable law and may need to verify your identity before fulfilling a request.",
    ],
    bullets: [
      "Access information about you and receive certain information in a portable format where required.",
      "Request correction of inaccurate or incomplete information.",
      "Request deletion of information, subject to legal and operational exceptions.",
      "Request restriction of or object to certain processing.",
      "Opt out of certain targeted advertising, sharing, or sale of personal information where applicable.",
      "Not be discriminated against for exercising privacy rights.",
      "Submit a request through an authorized agent where permitted by law.",
      "Appeal our response to a privacy request where applicable.",
    ],
  },
  {
    id: "retention",
    title: "7. Data retention",
    paragraphs: [
      "We retain information for as long as needed to provide the Services, fulfill the purposes described in this Privacy Policy, comply with legal obligations, resolve disputes, enforce agreements, maintain security, conduct audits, and support legitimate business purposes.",
      "Workspace content may be retained according to workspace settings, customer agreements, backup practices, and legal requirements.",
    ],
  },
  {
    id: "security",
    title: "8. Security of your information",
    paragraphs: [
      "We take steps designed to protect information in accordance with this Privacy Policy, including administrative, technical, and organizational safeguards appropriate to the nature of the information we process.",
      "No system is completely secure. To the fullest extent permitted by law, we cannot guarantee that information will never be accessed, disclosed, altered, or destroyed without authorization.",
      "If we learn of a security incident that requires notice, we will provide notice as required by applicable law and through appropriate channels.",
    ],
  },
  {
    id: "third-party-websites",
    title: "9. Third-party websites/applications",
    paragraphs: [
      "The Website or Services may contain links to third-party websites, applications, integrations, or services. These third parties are not controlled by Onehand, and their privacy practices are governed by their own policies.",
      "We encourage you to review the privacy policies of any third-party services you use with or through Onehand.",
    ],
  },
  {
    id: "children",
    title: "10. Children's information",
    paragraphs: [
      "The Services are intended for general business audiences and are not directed to children. If we learn that we have collected personal information from a child without legally valid consent, we will take reasonable steps to delete it as required by applicable law.",
    ],
  },
  {
    id: "supervisory-authority",
    title: "11. Supervisory authority",
    paragraphs: [
      "If you are located in a jurisdiction such as the European Economic Area or the United Kingdom, you may have the right to lodge a complaint with a data protection supervisory authority if you believe our processing of your information violates applicable law.",
    ],
  },
  {
    id: "california",
    title: "12. Additional information for California residents",
    paragraphs: [
      "If you are a California resident, applicable California privacy law may require us to provide additional information about categories of personal information we collect, the purposes for which we use them, and the categories of third parties to whom we disclose, share, or sell them.",
      "For purposes of this section, terms such as personal information, sale, sharing, and sensitive personal information have the meanings given under applicable California law.",
    ],
    bullets: [
      "Identifiers may be disclosed to affiliates, service providers, advertising partners, entities for legal purposes, transaction parties, or entities with your consent.",
      "Commercial information may be disclosed to affiliates, service providers, legal recipients, transaction parties, or entities with your consent.",
      "Internet or other electronic network activity may be disclosed to service providers, analytics providers, advertising partners, legal recipients, transaction parties, or entities with your consent.",
      "General geolocation information may be disclosed to service providers, analytics providers, advertising partners, legal recipients, transaction parties, or entities with your consent.",
      "Professional or employment-related information may be disclosed to affiliates, service providers, legal recipients, transaction parties, or entities with your consent.",
      "Inferences may be disclosed to service providers, analytics providers, advertising partners, legal recipients, transaction parties, or entities with your consent.",
    ],
  },
  {
    id: "data-privacy-framework",
    title: "13. Data privacy framework",
    paragraphs: [
      "Where a customer agreement, transfer mechanism, or privacy certification applies to your use of Onehand, the controlling terms will be stated in that agreement or the related certification materials.",
      "This policy page does not claim a specific data transfer certification unless Onehand has separately published or agreed to that certification. Contact us if your organization needs information about international transfer safeguards.",
    ],
  },
  {
    id: "changes",
    title: "14. Changes to our privacy policy",
    paragraphs: [
      "We may revise this Privacy Policy from time to time. If changes are material, we will provide notice as required by applicable law.",
      "Your continued use of the Website or Services after the updated Privacy Policy takes effect means you acknowledge the updated policy.",
    ],
  },
];

const californiaTable = [
  ["Identifiers", "Service providers, affiliates, legal recipients, advertising partners", "Advertising partners where applicable"],
  ["Commercial information", "Service providers, affiliates, legal recipients", "We do not sell/share for unrelated third-party offers"],
  ["Network activity", "Service providers, analytics providers, advertising partners", "Advertising partners where applicable"],
  ["General geolocation", "Service providers and analytics providers", "Advertising partners where applicable"],
  ["Professional information", "Service providers, affiliates, legal recipients", "We do not sell/share"],
  ["Inferences", "Service providers, analytics providers, advertising partners", "Advertising partners where applicable"],
] as const;

export function PrivacyPage() {
  return (
    <PublicSitePageShell>
      <section className="bg-white py-16 sm:py-20 lg:py-24">
        <div className="mx-auto w-full max-w-[1320px] px-4 sm:px-6 lg:px-8">
          <article>
            <div className="max-w-[820px]">
              <p className="text-[13px] font-semibold text-[#777770]">
                Onehand privacy
              </p>
              <h1 className="mt-3 text-[40px] font-black leading-[1.05] tracking-normal md:text-[58px]">
                Privacy policy
              </h1>
              <p className="mt-5 max-w-[760px] text-[14px] leading-7 text-[#444440]">
                Onehand has updated this Privacy Policy effective July 8, 2026.
                Previous versions may be requested by contacting the Onehand
                team.
              </p>
              <p className="mt-4 max-w-[760px] text-[14px] leading-7 text-[#444440]">
                This Privacy Policy describes how Onehand collects, uses, and
                discloses your information. It also explains choices surrounding
                how we use personal information, including how you can object to
                certain uses, access information, or request updates.
              </p>
            </div>

              <div className="mt-8 rounded-[8px] bg-[#f7f7f5] p-6">
                <div className="flex items-start gap-4">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[8px] bg-white text-[#0075DE]">
                    <LockKeyhole className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 className="text-[18px] font-black">
                      Definitions used in this policy
                    </h2>
                    <ul className="mt-4 grid gap-3 text-[13px] leading-6 text-[#555550]">
                      <li>
                        <strong className="text-[#222220]">Onehand</strong>,
                        "we", "us", and "our" refer to Onehand Labs, Inc. and
                        relevant affiliates.
                      </li>
                      <li>
                        <strong className="text-[#222220]">Website</strong>{" "}
                        refers to our public websites and public product pages.
                      </li>
                      <li>
                        <strong className="text-[#222220]">Services</strong>{" "}
                        refers to the Onehand software-as-a-service platform,
                        related APIs, and related web, mobile, or desktop
                        applications.
                      </li>
                      <li>
                        <strong className="text-[#222220]">Workspaces</strong>{" "}
                        are separated areas where users submit, post, modify,
                        and organize customer records and related content.
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <nav className="mt-10 grid gap-2 rounded-[8px] bg-[#f7f7f5] p-4 text-[13px] font-bold text-[#333330] sm:grid-cols-2">
                {tableOfContents.map((item, index) => (
                  <a
                    className="rounded-[6px] px-2 py-1.5 hover:bg-white"
                    href={`#${privacySections[index]?.id}`}
                    key={item}
                  >
                    {index + 1}. {item}
                  </a>
                ))}
              </nav>

              <div className="mt-12 grid gap-12">
                {privacySections.map((section) => (
                  <PrivacySectionBlock key={section.id} section={section} />
                ))}
              </div>

              <section className="mt-14 rounded-[8px] bg-[#eef6ff] p-6">
                <h2 className="text-[20px] font-black">Contact us</h2>
                <p className="mt-3 text-[14px] leading-7 text-[#444440]">
                  If you have questions about this Privacy Policy or our privacy
                  practices, contact the Onehand team.
                </p>
                <Link
                  className="mt-4 inline-flex items-center gap-2 text-[13px] font-black text-[#0075DE] underline-offset-2 hover:underline"
                  to="/contact"
                >
                  Contact Onehand
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <p className="mt-5 text-[12px] font-bold text-[#888880]">
                  Last updated: July 8, 2026
                </p>
              </section>
          </article>
        </div>
      </section>
    </PublicSitePageShell>
  );
}

function PrivacySectionBlock({
  section,
}: {
  readonly section: PrivacySection;
}) {
  return (
    <section id={section.id}>
      <h2 className="text-[28px] font-black leading-tight">{section.title}</h2>
      {section.paragraphs ? (
        <div className="mt-4 grid gap-4 text-[14px] leading-7 text-[#444440]">
          {section.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      ) : null}
      {section.bullets ? (
        <ul className="mt-4 grid gap-2 text-[14px] leading-7 text-[#444440]">
          {section.bullets.map((bullet) => (
            <li className="flex gap-3" key={bullet}>
              <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-[#111111]" />
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      ) : null}
      {section.subsections ? (
        <div className="mt-6 grid gap-7">
          {section.subsections.map((subsection) => (
            <div key={subsection.title}>
              <h3 className="text-[18px] font-black">{subsection.title}</h3>
              {subsection.paragraphs ? (
                <div className="mt-3 grid gap-4 text-[14px] leading-7 text-[#444440]">
                  {subsection.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              ) : null}
              {subsection.bullets ? (
                <ul className="mt-3 grid gap-2 text-[14px] leading-7 text-[#444440]">
                  {subsection.bullets.map((bullet) => (
                    <li className="flex gap-3" key={bullet}>
                      <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-[#111111]" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
      {section.id === "california" ? (
        <div className="mt-6 overflow-hidden rounded-[8px] border border-[#eeeeec]">
          <div className="grid grid-cols-[1fr_1.1fr_1.1fr] bg-[#f7f7f5] text-[12px] font-black text-[#333330]">
            <div className="p-3">Category</div>
            <div className="p-3">Disclosed for business purposes</div>
            <div className="p-3">Sold/shared where applicable</div>
          </div>
          {californiaTable.map((row) => (
            <div
              className="grid grid-cols-[1fr_1.1fr_1.1fr] border-t border-[#eeeeec] text-[12px] leading-5 text-[#555550]"
              key={row[0]}
            >
              {row.map((cell) => (
                <div className="p-3" key={cell}>
                  {cell}
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
