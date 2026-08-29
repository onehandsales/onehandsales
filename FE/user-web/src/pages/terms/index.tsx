import {
  FinalSection,
  PublicContentContainer,
  PublicDocumentHero,
  PublicDocumentSection,
  PublicPageSection,
  PublicSitePageShell,
  PublicTableOfContents,
} from "@/features/public-site";
import {
  getPublicSiteCopyLanguage,
  usePublicSiteLanguage,
  type PublicSiteCopyLanguage,
} from "@/features/public-site/i18n/public-site-language";

type TermsSection = {
  readonly id: string;
  readonly title: string;
  readonly body: readonly string[];
};

type TermsCopy = {
  readonly title: string;
  readonly contentsLabel: string;
  readonly finalTitle: string;
  readonly finalDescription: string;
  readonly sections: readonly TermsSection[];
};

const termsCopyByLanguage: Record<PublicSiteCopyLanguage, TermsCopy> = {
  ko: {
    title: "서비스 이용약관",
    contentsLabel: "목차",
    finalTitle: "정식 검토 자료가 필요한가요?",
    finalDescription:
      "영업, 개인정보, 보안 검토는 OneHand 팀에 문의해 주세요.",
    sections: [
      {
        id: "using-onehand",
        title: "1. OneHand 사용",
        body: [
          "OneHand는 세일즈 팀이 고객 기록, 딜 활동, 업무, 노트, AI 지원 워크플로를 관리하도록 돕는 워크스페이스를 제공합니다.",
          "사용자는 제출하는 정보와 계정 자격 증명의 보안을 책임지며, 관련 법률과 본 약관을 준수해야 합니다.",
        ],
      },
      {
        id: "accounts",
        title: "2. 계정과 워크스페이스",
        body: [
          "워크스페이스 소유자와 관리자는 초대 사용자, 권한, 청구 설정, 워크스페이스 데이터 제출을 관리합니다.",
          "정확한 계정 정보를 제공해야 하며, 무단 접근이 의심되면 OneHand에 알려야 합니다.",
        ],
      },
      {
        id: "acceptable-use",
        title: "3. 허용되는 사용",
        body: [
          "OneHand를 법률 위반, 권리 침해, 악성코드 배포, 무단 접근 시도, 서비스 운영 방해에 사용할 수 없습니다.",
          "법에서 허용하는 경우를 제외하고 서비스를 역설계하거나, 자동 접근을 남용하거나, 경쟁 제품 개발에 사용할 수 없습니다.",
        ],
      },
      {
        id: "customer-data",
        title: "4. 고객 데이터와 개인정보",
        body: [
          "고객 데이터는 이를 제출한 고객 또는 워크스페이스에 속합니다. OneHand는 개인정보 처리방침과 관련 계약에 따라 고객 데이터를 처리합니다.",
          "워크스페이스에 개인정보가 포함되는 경우, 해당 정보를 제출할 권리와 고지를 확보할 책임은 고객에게 있습니다.",
        ],
      },
      {
        id: "ai-features",
        title: "5. AI 지원 기능",
        body: [
          "OneHand에는 요약, 초안, 검색, 라우팅 등 AI 지원 기능이 포함될 수 있습니다.",
          "AI 결과는 유용할 수 있지만 불완전하거나 부정확할 수 있으므로 고객 약속이나 비즈니스 판단 전에 검토해야 합니다.",
        ],
      },
      {
        id: "subscriptions",
        title: "6. 구독과 청구",
        body: [
          "유료 플랜, 갱신 기간, 사용 제한, 세금, 취소 조건은 구매 시 또는 주문서에 표시됩니다.",
          "별도 명시가 없으면 구독료는 법에서 요구하거나 서면으로 합의한 경우를 제외하고 환불되지 않습니다.",
        ],
      },
      {
        id: "availability",
        title: "7. 서비스 가용성과 변경",
        body: [
          "OneHand는 안정적인 서비스를 위해 노력하지만 유지보수, 업데이트, 보안 작업, 통제할 수 없는 사건으로 일시적으로 사용할 수 없을 수 있습니다.",
          "기능, 플랜, 서비스 일부는 변경되거나 중단될 수 있으며, 중요한 영향이 있는 경우 합리적인 통지를 제공합니다.",
        ],
      },
      {
        id: "liability",
        title: "8. 면책과 책임",
        body: [
          "법이 허용하는 최대 범위에서 OneHand는 있는 그대로 제공되며, 중단 없음이나 오류 없음, AI 결과의 정확성을 보장하지 않습니다.",
          "법이 허용하는 최대 범위에서 OneHand는 간접 손해, 특별 손해, 수익 손실, 데이터 손실 등에 책임지지 않습니다.",
        ],
      },
      {
        id: "changes-contact",
        title: "9. 변경과 문의",
        body: [
          "OneHand는 본 약관을 수시로 업데이트할 수 있습니다. 중요한 변경은 관련 법률에 따라 통지합니다.",
          "약관 관련 질문은 OneHand 문의 페이지를 통해 보낼 수 있습니다.",
        ],
      },
    ],
  },  "en-US": {
    title: "Terms of Service",
    contentsLabel: "Contents",
    finalTitle: "Need a formal review packet?",
    finalDescription:
      "Contact the OneHand team for sales, privacy, and security questions related to your organization.",
    sections: [
      {
        id: "using-onehand",
        title: "1. Using OneHand",
        body: [
          "OneHand provides a workspace for sales teams to manage customer records, deal activity, tasks, notes, and AI-assisted workflows.",
          "You are responsible for the information you submit and for keeping your account credentials secure while using OneHand in compliance with applicable laws and these terms.",
        ],
      },
      {
        id: "accounts",
        title: "2. Accounts and workspaces",
        body: [
          "Workspace owners and administrators control invited users, permissions, billing settings, and the data submitted to their workspace.",
          "You agree to provide accurate account information and to notify us if you believe your account or workspace has been accessed without authorization.",
        ],
      },
      {
        id: "acceptable-use",
        title: "3. Acceptable use",
        body: [
          "You may not use OneHand to violate laws, infringe rights, distribute malware, attempt unauthorized access, or interfere with service operation.",
          "You may not reverse engineer the service, abuse automated access, scrape platform content in a way that harms the service, or use OneHand to develop a competing product except where allowed by law.",
        ],
      },
      {
        id: "customer-data",
        title: "4. Customer data and privacy",
        body: [
          "Customer data belongs to the customer or workspace that submitted it. OneHand processes customer data to provide, secure, support, and improve the service as described in the Privacy Policy and any applicable customer agreement.",
          "If your workspace includes personal information, you are responsible for ensuring that you have the rights and notices needed to submit that information to OneHand.",
        ],
      },
      {
        id: "ai-features",
        title: "5. AI-assisted features",
        body: [
          "OneHand may include AI-assisted summaries, drafts, search, routing, and other workflow support.",
          "AI output can be useful but may be incomplete or inaccurate, so you should review generated content before relying on it for customer commitments or business decisions.",
        ],
      },
      {
        id: "subscriptions",
        title: "6. Subscriptions and billing",
        body: [
          "Paid plans, renewal periods, usage limits, taxes, and cancellation terms are presented at purchase or in the applicable order form.",
          "Unless otherwise stated, subscription fees are non-refundable except where required by law or expressly agreed in writing.",
        ],
      },
      {
        id: "availability",
        title: "7. Service availability and changes",
        body: [
          "We work to keep OneHand reliable, but the service may occasionally be unavailable because of maintenance, updates, security work, or events outside our control.",
          "We may update features, modify plans, or discontinue parts of the service. When a change materially affects customers, we will use reasonable efforts to provide notice.",
        ],
      },
      {
        id: "liability",
        title: "8. Disclaimers and liability",
        body: [
          "OneHand is provided on an as-is and as-available basis to the fullest extent permitted by law. We do not guarantee that the service will be uninterrupted, error-free, or that AI-assisted content will always be accurate.",
          "To the fullest extent permitted by law, OneHand is not liable for indirect, incidental, special, consequential, or punitive damages, or for lost profits, revenues, data, or business opportunities.",
        ],
      },
      {
        id: "changes-contact",
        title: "9. Changes and contact",
        body: [
          "We may update these terms from time to time. If changes are material, we will provide notice as required by applicable law.",
          "Questions about these terms can be sent through the OneHand contact page.",
        ],
      },
    ],
  },};

// 기능 : 약관 페이지를 렌더링합니다.
export function TermsPage() {
  const { language } = usePublicSiteLanguage();
  const copy = termsCopyByLanguage[getPublicSiteCopyLanguage(language)];

  return (
    <PublicSitePageShell>
      <PublicPageSection>
        <PublicContentContainer>
          <PublicDocumentHero
            title={copy.title}
          />

          <div className="mt-16">
            <PublicTableOfContents
              items={copy.sections}
              label={copy.contentsLabel}
            />

            <article className="mt-10">
              <div className="grid gap-12">
                {copy.sections.map((section) => (
                  <PublicDocumentSection
                    id={section.id}
                    key={section.id}
                    paragraphs={section.body}
                    title={section.title}
                  />
                ))}
              </div>

            </article>
          </div>
        </PublicContentContainer>
      </PublicPageSection>
      <FinalSection
        copy={{
          description: copy.finalDescription,
          title: copy.finalTitle,
        }}
      />
    </PublicSitePageShell>
  );
}
