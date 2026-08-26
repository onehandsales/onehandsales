import { ArrowRight, LockKeyhole } from "lucide-react";
import { Link } from "react-router-dom";
import { PublicSitePageShell } from "@/features/public-site";
import { usePublicSitePath } from "@/features/public-site/i18n/public-site-locale-hooks";
import {
  getPublicSiteCopyLanguage,
  usePublicSiteLanguage,
  type PublicSiteCopyLanguage,
} from "@/features/public-site/i18n/public-site-language";

type DefinitionCopy = {
  readonly term: string;
  readonly description: string;
};

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

type PrivacyCopy = {
  readonly eyebrow: string;
  readonly title: string;
  readonly intro: readonly string[];
  readonly definitionsTitle: string;
  readonly definitions: readonly DefinitionCopy[];
  readonly contactTitle: string;
  readonly contactDescription: string;
  readonly contactCta: string;
  readonly lastUpdated: string;
  readonly tableHeaders: readonly [string, string, string];
  readonly californiaRows: readonly (readonly [string, string, string])[];
  readonly sections: readonly PrivacySection[];
};

const privacyCopyByLanguage: Record<PublicSiteCopyLanguage, PrivacyCopy> = {
  ko: {
    eyebrow: "OneHand 개인정보",
    title: "개인정보 처리방침",
    intro: [
      "OneHand는 2026년 7월 8일자로 이 개인정보 처리방침을 업데이트했습니다. 이전 버전은 OneHand 팀에 문의해 요청할 수 있습니다.",
      "이 방침은 OneHand가 정보를 수집, 사용, 공개하는 방법과 사용자가 특정 사용에 반대하거나 정보 접근 및 업데이트를 요청할 수 있는 선택권을 설명합니다.",
    ],
    definitionsTitle: "이 방침에서 사용하는 정의",
    definitions: [
      {
        term: "OneHand",
        description: "OneHand Labs, Inc. 및 관련 계열사를 의미합니다.",
      },
      {
        term: "웹사이트",
        description: "공개 웹사이트와 공개 제품 페이지를 의미합니다.",
      },
      {
        term: "서비스",
        description:
          "OneHand SaaS 플랫폼, 관련 API, 웹·모바일·데스크톱 애플리케이션을 의미합니다.",
      },
      {
        term: "워크스페이스",
        description:
          "사용자가 고객 기록과 관련 콘텐츠를 제출, 게시, 수정, 정리하는 분리된 공간입니다.",
      },
    ],
    contactTitle: "문의하기",
    contactDescription:
      "이 개인정보 처리방침 또는 개인정보 처리 관행에 대한 질문이 있으면 OneHand 팀에 문의하세요.",
    contactCta: "OneHand 문의",
    lastUpdated: "최종 업데이트: 2026년 7월 8일",
    tableHeaders: ["범주", "비즈니스 목적 공개", "적용 시 판매/공유"],
    californiaRows: [
      ["식별자", "서비스 제공자, 계열사, 법적 수신자, 광고 파트너", "적용 가능한 광고 파트너"],
      ["상업 정보", "서비스 제공자, 계열사, 법적 수신자", "무관한 제3자 제안을 위해 판매/공유하지 않음"],
      ["네트워크 활동", "서비스 제공자, 분석 제공자, 광고 파트너", "적용 가능한 광고 파트너"],
      ["일반 위치 정보", "서비스 제공자와 분석 제공자", "적용 가능한 광고 파트너"],
      ["직업 정보", "서비스 제공자, 계열사, 법적 수신자", "판매/공유하지 않음"],
      ["추론 정보", "서비스 제공자, 분석 제공자, 광고 파트너", "적용 가능한 광고 파트너"],
    ],
    sections: [
      {
        id: "information-we-collect",
        title: "1. 수집하는 정보",
        paragraphs: [
          "우리는 사용자가 제공하는 정보, 웹사이트 또는 서비스를 사용할 때 생성되는 정보, 그리고 다른 출처가 제공하는 정보를 수집합니다.",
        ],
        subsections: [
          {
            title: "A. 사용자가 제공하는 정보",
            bullets: [
              "계정 생성 정보: 이름, 이메일 주소, 역할, 회사 정보, 프로필 및 워크스페이스 세부정보.",
              "문의와 지원 정보: 이메일, 전화번호, 지원 메시지, 첨부파일, 사용자가 선택해 제공하는 정보.",
              "결제 정보: 결제 제공자를 통해 처리되는 청구 및 거래 정보.",
              "협업 콘텐츠: 양식, 댓글, 메시지, 공유 워크스페이스에 제출하는 내용.",
            ],
          },
          {
            title: "B. 자동으로 수집되는 정보",
            bullets: [
              "기기 및 사용 데이터: IP 주소, 브라우저, 운영체제, 언어, 시간대, 조회한 페이지와 클릭.",
              "쿠키와 유사 기술: 로그인, 보안, 선호도, 분석, 마케팅을 지원하는 쿠키와 로컬 저장소.",
              "분석 정보: 제품 성능과 서비스 개선을 이해하기 위한 집계 또는 이벤트 수준 사용 정보.",
            ],
          },
          {
            title: "C. 다른 출처의 정보",
            bullets: [
              "서드파티 로그인 또는 통합 제공자가 사용자의 설정에 따라 프로필이나 연결 정보를 제공할 수 있습니다.",
              "조직이 계정을 관리하는 경우 조직, 역할, 멤버십, 워크스페이스 정보를 받을 수 있습니다.",
            ],
          },
        ],
      },
      {
        id: "how-we-use",
        title: "2. 정보를 사용하는 방법",
        paragraphs: [
          "우리는 OneHand 제공, 보호, 지원, 개선과 관련된 비즈니스 및 운영 목적을 위해 정보를 사용합니다.",
        ],
        bullets: [
          "계정과 워크스페이스 생성, 인증, 관리.",
          "고객 기록, 노트, 업무, 딜 워크플로, AI 지원 기능 제공.",
          "구독, 청구, 결제, 고객 지원, 보안 문의, 개인정보 요청 처리.",
          "서비스 메시지, 제품 업데이트, 관리 공지 발송.",
          "플랫폼 안정성, 보안, 기능 개선, 사기와 오용 방지.",
        ],
      },
      {
        id: "disclosing",
        title: "3. 정보 공개",
        paragraphs: [
          "사용 방식과 선택에 따라 서비스 제공자, 비즈니스 파트너, 계열사, 광고 및 분석 파트너, 워크스페이스 사용자, 조직 관리자, 법적 수신자, 거래 관련 당사자에게 정보를 공개할 수 있습니다.",
        ],
      },
      {
        id: "international-transfers",
        title: "4. 국제 데이터 이전",
        paragraphs: [
          "OneHand에서 처리되는 정보는 사용자가 거주하는 국가 외의 국가로 이전, 처리, 저장될 수 있습니다.",
          "국제 이전 시 적용 법률이 요구하는 계약상 보호 또는 인정된 이전 메커니즘을 사용하려고 노력합니다.",
        ],
      },
      {
        id: "choices",
        title: "5. 사용자의 선택",
        bullets: [
          "동의에 기반한 처리에 대해서는 언제든지 동의를 철회할 수 있습니다.",
          "마케팅 이메일은 수신 거부 안내를 통해 중단할 수 있습니다.",
          "브라우저 설정 또는 제공되는 도구를 통해 쿠키를 관리할 수 있습니다.",
          "적용 법률이 요구하는 경우 법적으로 인정된 선호 신호에 대응합니다.",
        ],
      },
      {
        id: "privacy-rights",
        title: "6. 개인정보 권리",
        paragraphs: [
          "거주 지역과 적용 법률에 따라 접근, 정정, 삭제, 처리 제한, 반대, 이동, 차별 금지, 대리인 요청, 이의 제기 권리가 있을 수 있습니다.",
        ],
      },
      {
        id: "retention",
        title: "7. 데이터 보존",
        paragraphs: [
          "우리는 서비스 제공, 법적 의무 준수, 분쟁 해결, 계약 집행, 보안 유지, 감사, 정당한 비즈니스 목적에 필요한 기간 동안 정보를 보존합니다.",
          "워크스페이스 콘텐츠는 워크스페이스 설정, 고객 계약, 백업 관행, 법적 요구에 따라 보존될 수 있습니다.",
        ],
      },
      {
        id: "security",
        title: "8. 정보 보안",
        paragraphs: [
          "우리는 처리하는 정보의 성격에 맞는 관리적, 기술적, 조직적 보호 조치를 포함해 정보를 보호하기 위한 조치를 취합니다.",
          "어떤 시스템도 완전히 안전할 수 없으며, 법이 허용하는 범위에서 무단 접근이나 공개가 절대 발생하지 않는다고 보장할 수 없습니다.",
        ],
      },
      {
        id: "third-party-websites",
        title: "9. 제3자 웹사이트와 애플리케이션",
        paragraphs: [
          "웹사이트 또는 서비스에는 제3자 웹사이트, 애플리케이션, 통합, 서비스 링크가 포함될 수 있습니다. 해당 제3자의 개인정보 관행은 자체 정책을 따릅니다.",
        ],
      },
      {
        id: "children",
        title: "10. 아동 정보",
        paragraphs: [
          "서비스는 일반 비즈니스 이용자를 대상으로 하며 아동을 대상으로 하지 않습니다. 유효한 동의 없이 아동 정보를 수집한 사실을 알게 되면 관련 법률에 따라 삭제 조치를 취합니다.",
        ],
      },
      {
        id: "supervisory-authority",
        title: "11. 감독기관",
        paragraphs: [
          "유럽경제지역 또는 영국 등 관할권에 있는 경우, 정보 처리에 문제가 있다고 생각하면 데이터 보호 감독기관에 불만을 제기할 권리가 있을 수 있습니다.",
        ],
      },
      {
        id: "california",
        title: "12. 캘리포니아 거주자를 위한 추가 정보",
        paragraphs: [
          "캘리포니아 개인정보 보호법은 수집하는 개인정보 범주, 사용 목적, 공개·공유·판매 대상에 대한 추가 정보를 요구할 수 있습니다.",
          "이 섹션에서 개인정보, 판매, 공유, 민감한 개인정보 등 용어는 적용 가능한 캘리포니아 법률의 의미를 따릅니다.",
        ],
      },
      {
        id: "data-privacy-framework",
        title: "13. 데이터 개인정보 프레임워크",
        paragraphs: [
          "고객 계약, 이전 메커니즘, 개인정보 인증이 적용되는 경우 해당 계약 또는 인증 자료의 조건이 우선합니다.",
          "OneHand가 별도로 게시하거나 합의하지 않는 한 이 페이지는 특정 데이터 이전 인증을 주장하지 않습니다.",
        ],
      },
      {
        id: "changes",
        title: "14. 개인정보 처리방침 변경",
        paragraphs: [
          "우리는 이 방침을 수시로 개정할 수 있습니다. 변경이 중요한 경우 적용 법률에 따라 통지합니다.",
          "업데이트된 방침이 효력을 발생한 후 웹사이트 또는 서비스를 계속 사용하면 업데이트된 방침을 확인한 것으로 간주됩니다.",
        ],
      },
    ],
  },  "en-US": {
    eyebrow: "OneHand privacy",
    title: "Privacy policy",
    intro: [
      "OneHand has updated this Privacy Policy effective July 8, 2026. Previous versions may be requested by contacting the OneHand team.",
      "This Privacy Policy describes how OneHand collects, uses, and discloses your information. It also explains choices surrounding how we use personal information, including how you can object to certain uses, access information, or request updates.",
    ],
    definitionsTitle: "Definitions used in this policy",
    definitions: [
      {
        term: "OneHand",
        description: "refers to OneHand Labs, Inc. and relevant affiliates.",
      },
      {
        term: "Website",
        description: "refers to our public websites and public product pages.",
      },
      {
        term: "Services",
        description:
          "refers to the OneHand software-as-a-service platform, related APIs, and related web, mobile, or desktop applications.",
      },
      {
        term: "Workspaces",
        description:
          "are separated areas where users submit, post, modify, and organize customer records and related content.",
      },
    ],
    contactTitle: "Contact us",
    contactDescription:
      "If you have questions about this Privacy Policy or our privacy practices, contact the OneHand team.",
    contactCta: "Contact OneHand",
    lastUpdated: "Last updated: July 8, 2026",
    tableHeaders: ["Category", "Disclosed for business purposes", "Sold/shared where applicable"],
    californiaRows: [
      ["Identifiers", "Service providers, affiliates, legal recipients, advertising partners", "Advertising partners where applicable"],
      ["Commercial information", "Service providers, affiliates, legal recipients", "We do not sell/share for unrelated third-party offers"],
      ["Network activity", "Service providers, analytics providers, advertising partners", "Advertising partners where applicable"],
      ["General geolocation", "Service providers and analytics providers", "Advertising partners where applicable"],
      ["Professional information", "Service providers, affiliates, legal recipients", "We do not sell/share"],
      ["Inferences", "Service providers, analytics providers, advertising partners", "Advertising partners where applicable"],
    ],
    sections: [
      {
        id: "information-we-collect",
        title: "1. Information we collect",
        paragraphs: [
          "We collect information when you provide it to us, when you use our Website or Services, and when other sources provide it to us.",
        ],
        subsections: [
          {
            title: "A. Information you provide to us",
            bullets: [
              "Account creation information: name, email address, role, company information, profile details, and workspace details.",
              "Communications with us: email address, phone number, support messages, attachments, and other information you choose to provide.",
              "Payment information: billing details and transaction information processed through our payment providers.",
              "Collaborative content: content you submit in forms, comments, messages, shared workspaces, or other product areas.",
            ],
          },
          {
            title: "B. Information collected automatically",
            bullets: [
              "Device and usage data: IP address, browser type, operating system, language, time zone, pages viewed, and links clicked.",
              "Cookies and similar technologies: cookies and local storage that support login, security, preferences, analytics, and marketing where permitted.",
              "Analytics information: aggregated and event-level usage information that helps us improve the Services.",
            ],
          },
          {
            title: "C. Information from other sources",
            bullets: [
              "Third-party login or integration providers may provide profile, account, or connection information based on your settings.",
              "If your organization provisions or manages your account, we may receive organization, role, membership, or workspace information.",
            ],
          },
        ],
      },
      {
        id: "how-we-use",
        title: "2. How we use your information",
        paragraphs: [
          "We use information for business and operational purposes related to providing, securing, supporting, and improving OneHand.",
        ],
        bullets: [
          "Create, authenticate, and manage accounts and workspaces.",
          "Provide customer records, notes, tasks, deal workflows, and AI-assisted features.",
          "Process subscriptions, billing, payments, customer support, security inquiries, and privacy requests.",
          "Send service messages, product updates, and administrative notices.",
          "Improve platform reliability, security, and features while preventing fraud and abuse.",
        ],
      },
      {
        id: "disclosing",
        title: "3. Disclosing your information",
        paragraphs: [
          "Depending on how you use OneHand and the choices you make, we may disclose information to service providers, business partners, affiliates, advertising and analytics partners, workspace users, organizations that manage workspaces, legal recipients, or transaction parties.",
        ],
      },
      {
        id: "international-transfers",
        title: "4. International data transfers",
        paragraphs: [
          "Information processed by OneHand may be transferred to, processed in, and stored in countries other than where you live.",
          "When we transfer information internationally, we endeavor to use safeguards required by applicable law, such as contractual protections or other recognized transfer mechanisms.",
        ],
      },
      {
        id: "choices",
        title: "5. Your choices",
        bullets: [
          "Where processing is based on consent, you may withdraw that consent at any time.",
          "You can use unsubscribe instructions in marketing emails to stop future marketing messages.",
          "You may control cookies through browser settings and available preference tools.",
          "We respond to legally recognized preference signals where required by applicable law.",
        ],
      },
      {
        id: "privacy-rights",
        title: "6. Your privacy rights",
        paragraphs: [
          "Depending on your location and applicable law, you may have rights to access, correct, delete, restrict or object to processing, receive portability, avoid discrimination, use an authorized agent, or appeal a response.",
        ],
      },
      {
        id: "retention",
        title: "7. Data retention",
        paragraphs: [
          "We retain information for as long as needed to provide the Services, comply with legal obligations, resolve disputes, enforce agreements, maintain security, conduct audits, and support legitimate business purposes.",
          "Workspace content may be retained according to workspace settings, customer agreements, backup practices, and legal requirements.",
        ],
      },
      {
        id: "security",
        title: "8. Security of your information",
        paragraphs: [
          "We take steps designed to protect information, including administrative, technical, and organizational safeguards appropriate to the nature of the information we process.",
          "No system is completely secure. To the fullest extent permitted by law, we cannot guarantee that information will never be accessed, disclosed, altered, or destroyed without authorization.",
        ],
      },
      {
        id: "third-party-websites",
        title: "9. Third-party websites/applications",
        paragraphs: [
          "The Website or Services may contain links to third-party websites, applications, integrations, or services. These third parties are not controlled by OneHand, and their privacy practices are governed by their own policies.",
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
      },
      {
        id: "data-privacy-framework",
        title: "13. Data privacy framework",
        paragraphs: [
          "Where a customer agreement, transfer mechanism, or privacy certification applies to your use of OneHand, the controlling terms will be stated in that agreement or the related certification materials.",
          "This policy page does not claim a specific data transfer certification unless OneHand has separately published or agreed to that certification.",
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
    ],
  },};

// 기능 : 개인정보 페이지를 렌더링합니다.
export function PrivacyPage() {
  const { language } = usePublicSiteLanguage();
  const publicSitePath = usePublicSitePath();
  const copyLanguage = getPublicSiteCopyLanguage(language);
  const copy = privacyCopyByLanguage[copyLanguage];

  return (
    <PublicSitePageShell>
      <section className="bg-white py-16 sm:py-20 lg:py-24">
        <div className="mx-auto w-full max-w-[1320px] px-4 sm:px-6 lg:px-8">
          <article>
            <div className="max-w-[820px]">
              <p className="text-[13px] font-semibold text-[#777770]">
                {copy.eyebrow}
              </p>
              <h1 className="mt-3 break-keep text-[40px] font-black leading-[1.05] tracking-normal md:text-[58px]">
                {copy.title}
              </h1>
              <div className="mt-5 grid max-w-[760px] gap-4 break-keep text-[14px] leading-7 text-[#444440]">
                {copy.intro.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </div>

            <div className="mt-8 rounded-[8px] bg-[#f7f7f5] p-6">
              <div className="flex items-start gap-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[8px] bg-white text-[#0075DE]">
                  <LockKeyhole className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="break-keep text-[18px] font-black">
                    {copy.definitionsTitle}
                  </h2>
                  <ul className="mt-4 grid gap-3 break-keep text-[13px] leading-6 text-[#555550]">
                    {copy.definitions.map((definition) => (
                      <li key={definition.term}>
                        <strong className="text-[#222220]">
                          {definition.term}
                        </strong>
                        {copyLanguage === "en-US"
                          ? " "
                          : ": "}
                        {definition.description}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <nav className="mt-10 grid gap-2 rounded-[8px] bg-[#f7f7f5] p-4 text-[13px] font-bold text-[#333330] sm:grid-cols-2">
              {copy.sections.map((section, index) => (
                <a
                  className="rounded-[6px] px-2 py-1.5 hover:bg-white"
                  href={`#${section.id}`}
                  key={section.id}
                >
                  {index + 1}. {section.title.replace(/^\d+\.\s*/, "")}
                </a>
              ))}
            </nav>

            <div className="mt-12 grid gap-12">
              {copy.sections.map((section) => (
                <PrivacySectionBlock
                  copy={copy}
                  key={section.id}
                  section={section}
                />
              ))}
            </div>

            <section className="mt-14 rounded-[8px] bg-[#eef6ff] p-6">
              <h2 className="break-keep text-[20px] font-black">
                {copy.contactTitle}
              </h2>
              <p className="mt-3 break-keep text-[14px] leading-7 text-[#444440]">
                {copy.contactDescription}
              </p>
              <Link
                className="mt-4 inline-flex items-center gap-2 text-[13px] font-black text-[#0075DE] underline-offset-2 hover:underline"
                to={publicSitePath("/contact")}
              >
                {copy.contactCta}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <p className="mt-5 text-[12px] font-bold text-[#888880]">
                {copy.lastUpdated}
              </p>
            </section>
          </article>
        </div>
      </section>
    </PublicSitePageShell>
  );
}

// 기능 : 개인정보 섹션 블록 영역을 렌더링합니다.
function PrivacySectionBlock({
  copy,
  section,
}: {
  readonly copy: PrivacyCopy;
  readonly section: PrivacySection;
}) {
  return (
    <section id={section.id}>
      <h2 className="break-keep text-[28px] font-black leading-tight">
        {section.title}
      </h2>
      {section.paragraphs ? (
        <div className="mt-4 grid gap-4 break-keep text-[14px] leading-7 text-[#444440]">
          {section.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      ) : null}
      {section.bullets ? (
        <ul className="mt-4 grid gap-2 break-keep text-[14px] leading-7 text-[#444440]">
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
              <h3 className="break-keep text-[18px] font-black">
                {subsection.title}
              </h3>
              {subsection.paragraphs ? (
                <div className="mt-3 grid gap-4 break-keep text-[14px] leading-7 text-[#444440]">
                  {subsection.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              ) : null}
              {subsection.bullets ? (
                <ul className="mt-3 grid gap-2 break-keep text-[14px] leading-7 text-[#444440]">
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
            {copy.tableHeaders.map((header) => (
              <div className="p-3" key={header}>
                {header}
              </div>
            ))}
          </div>
          {copy.californiaRows.map((row) => (
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
