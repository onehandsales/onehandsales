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
import {
  getPublicSiteCopyLanguage,
  usePublicSiteLanguage,
  type PublicSiteCopyLanguage,
} from "@/features/public-site/i18n/public-site-language";

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

type TermsCopy = {
  readonly eyebrow: string;
  readonly title: string;
  readonly description: string;
  readonly lastUpdated: string;
  readonly contentsLabel: string;
  readonly openLabel: string;
  readonly shortTitle: string;
  readonly shortDescription: string;
  readonly reviewTitle: string;
  readonly reviewDescription: string;
  readonly reviewCta: string;
  readonly policyLinks: readonly PolicyLink[];
  readonly sections: readonly TermsSection[];
};

const policyIcons: readonly LucideIcon[] = [
  Scale,
  LockKeyhole,
  ShieldCheck,
  Users,
];

function makePolicyLinks(copy: {
  readonly terms: string;
  readonly termsDescription: string;
  readonly privacy: string;
  readonly privacyDescription: string;
  readonly security: string;
  readonly securityDescription: string;
  readonly contact: string;
  readonly contactDescription: string;
}): readonly PolicyLink[] {
  return [
    {
      title: copy.terms,
      description: copy.termsDescription,
      to: "/terms",
      icon: policyIcons[0]!,
    },
    {
      title: copy.privacy,
      description: copy.privacyDescription,
      to: "/privacy",
      icon: policyIcons[1]!,
    },
    {
      title: copy.security,
      description: copy.securityDescription,
      to: "/security",
      icon: policyIcons[2]!,
    },
    {
      title: copy.contact,
      description: copy.contactDescription,
      to: "/contact",
      icon: policyIcons[3]!,
    },
  ];
}

const termsCopyByLanguage: Record<PublicSiteCopyLanguage, TermsCopy> = {
  ko: {
    eyebrow: "Onehand 정책 센터",
    title: "이용약관과 개인정보.",
    description:
      "이 페이지는 Onehand 사용에 필요한 핵심 약관, 개인정보, 보안 정보를 함께 제공합니다. 제품 공개용 정책 초안이며 최종 법무 요구사항에 맞게 검토되어야 합니다.",
    lastUpdated: "최종 업데이트: 2026년 7월 8일",
    contentsLabel: "목차",
    openLabel: "열기",
    shortTitle: "짧게 말하면",
    shortDescription:
      "Onehand를 책임 있게 사용하고, 고객 데이터를 보호하며, AI 결과를 검토한 뒤 사용하고, 계정·개인정보·보안 질문이 있으면 문의해 주세요.",
    reviewTitle: "정식 검토 자료가 필요하신가요?",
    reviewDescription:
      "영업, 개인정보, 보안 검토와 관련해 Onehand 팀에 문의할 수 있습니다.",
    reviewCta: "문의하기",
    policyLinks: makePolicyLinks({
      terms: "서비스 이용약관",
      termsDescription:
        "Onehand 사용, 워크스페이스 생성, 계정 접근 관리에 관한 규칙입니다.",
      privacy: "개인정보 처리방침",
      privacyDescription:
        "Onehand가 정보를 수집, 사용, 공개, 보호하는 방법입니다.",
      security: "보안",
      securityDescription:
        "워크스페이스 접근, 인프라, 개인정보, 안정성에 대한 Onehand의 접근입니다.",
      contact: "문의",
      contactDescription:
        "구독, 개인정보 요청, 보안 질문에 대해 Onehand 팀에 연락하세요.",
    }),
    sections: [
      {
        id: "using-onehand",
        title: "1. Onehand 사용",
        body: [
          "Onehand는 세일즈 팀이 고객 기록, 딜 활동, 업무, 노트, AI 지원 워크플로를 관리하도록 돕는 워크스페이스를 제공합니다.",
          "사용자는 제출하는 정보와 계정 자격 증명의 보안을 책임지며, 관련 법률과 본 약관을 준수해야 합니다.",
        ],
      },
      {
        id: "accounts",
        title: "2. 계정과 워크스페이스",
        body: [
          "워크스페이스 소유자와 관리자는 초대 사용자, 권한, 청구 설정, 워크스페이스 데이터 제출을 관리합니다.",
          "정확한 계정 정보를 제공해야 하며, 무단 접근이 의심되면 Onehand에 알려야 합니다.",
        ],
      },
      {
        id: "acceptable-use",
        title: "3. 허용되는 사용",
        body: [
          "Onehand를 법률 위반, 권리 침해, 악성코드 배포, 무단 접근 시도, 서비스 운영 방해에 사용할 수 없습니다.",
          "법에서 허용하는 경우를 제외하고 서비스를 역설계하거나, 자동 접근을 남용하거나, 경쟁 제품 개발에 사용할 수 없습니다.",
        ],
      },
      {
        id: "customer-data",
        title: "4. 고객 데이터와 개인정보",
        body: [
          "고객 데이터는 이를 제출한 고객 또는 워크스페이스에 속합니다. Onehand는 개인정보 처리방침과 관련 계약에 따라 고객 데이터를 처리합니다.",
          "워크스페이스에 개인정보가 포함되는 경우, 해당 정보를 제출할 권리와 고지를 확보할 책임은 고객에게 있습니다.",
        ],
      },
      {
        id: "ai-features",
        title: "5. AI 지원 기능",
        body: [
          "Onehand에는 요약, 초안, 검색, 라우팅 등 AI 지원 기능이 포함될 수 있습니다.",
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
          "Onehand는 안정적인 서비스를 위해 노력하지만 유지보수, 업데이트, 보안 작업, 통제할 수 없는 사건으로 일시적으로 사용할 수 없을 수 있습니다.",
          "기능, 플랜, 서비스 일부는 변경되거나 중단될 수 있으며, 중요한 영향이 있는 경우 합리적인 통지를 제공합니다.",
        ],
      },
      {
        id: "liability",
        title: "8. 면책과 책임",
        body: [
          "법이 허용하는 최대 범위에서 Onehand는 있는 그대로 제공되며, 중단 없음이나 오류 없음, AI 결과의 정확성을 보장하지 않습니다.",
          "법이 허용하는 최대 범위에서 Onehand는 간접 손해, 특별 손해, 수익 손실, 데이터 손실 등에 책임지지 않습니다.",
        ],
      },
      {
        id: "changes-contact",
        title: "9. 변경과 문의",
        body: [
          "Onehand는 본 약관을 수시로 업데이트할 수 있습니다. 중요한 변경은 관련 법률에 따라 통지합니다.",
          "약관 관련 질문은 Onehand 문의 페이지를 통해 보낼 수 있습니다.",
        ],
      },
    ],
  },
  ja: {
    eyebrow: "Onehand ポリシーセンター",
    title: "利用規約とプライバシー。",
    description:
      "このページはOnehandを利用するための主要な規約、プライバシー、セキュリティ情報をまとめたものです。製品向けのポリシードラフトであり、最終的な法務要件に合わせて確認する必要があります。",
    lastUpdated: "最終更新日: 2026年7月8日",
    contentsLabel: "目次",
    openLabel: "開く",
    shortTitle: "要約",
    shortDescription:
      "Onehandを責任を持って利用し、顧客データを保護し、AI出力を確認してから使用し、アカウント、プライバシー、セキュリティの質問はお問い合わせください。",
    reviewTitle: "正式なレビュー資料が必要ですか？",
    reviewDescription:
      "営業、プライバシー、セキュリティに関する質問はOnehandチームにお問い合わせください。",
    reviewCta: "問い合わせる",
    policyLinks: makePolicyLinks({
      terms: "サービス利用規約",
      termsDescription:
        "Onehandの利用、ワークスペース作成、アカウントアクセス管理のルールです。",
      privacy: "プライバシーポリシー",
      privacyDescription:
        "Onehandが情報を収集、利用、開示、保護する方法です。",
      security: "セキュリティ",
      securityDescription:
        "ワークスペースアクセス、インフラ、プライバシー、信頼性へのOnehandの考え方です。",
      contact: "お問い合わせ",
      contactDescription:
        "サブスクリプション、プライバシー要求、セキュリティ質問についてOnehandチームに連絡できます。",
    }),
    sections: [
      {
        id: "using-onehand",
        title: "1. Onehandの利用",
        body: [
          "Onehandは営業チームが顧客記録、商談活動、タスク、ノート、AI支援ワークフローを管理するためのワークスペースを提供します。",
          "ユーザーは提出する情報とアカウント認証情報の安全管理に責任を持ち、適用法と本規約を遵守する必要があります。",
        ],
      },
      {
        id: "accounts",
        title: "2. アカウントとワークスペース",
        body: [
          "ワークスペースの所有者と管理者は、招待ユーザー、権限、請求設定、ワークスペースに提出されるデータを管理します。",
          "正確なアカウント情報を提供し、無断アクセスが疑われる場合はOnehandに通知してください。",
        ],
      },
      {
        id: "acceptable-use",
        title: "3. 許容される利用",
        body: [
          "Onehandを法律違反、権利侵害、マルウェア配布、無断アクセスの試み、サービス運営の妨害に使用することはできません。",
          "法律で認められる場合を除き、サービスをリバースエンジニアリングしたり、自動アクセスを悪用したり、競合製品開発に使用することはできません。",
        ],
      },
      {
        id: "customer-data",
        title: "4. 顧客データとプライバシー",
        body: [
          "顧客データはそれを提出した顧客またはワークスペースに帰属します。Onehandはプライバシーポリシーと関連契約に従って顧客データを処理します。",
          "ワークスペースに個人情報が含まれる場合、その情報をOnehandに提出する権利と通知を確保する責任は顧客にあります。",
        ],
      },
      {
        id: "ai-features",
        title: "5. AI支援機能",
        body: [
          "Onehandには要約、下書き、検索、ルーティングなどのAI支援機能が含まれる場合があります。",
          "AI出力は有用ですが不完全または不正確な場合があるため、顧客への約束や業務判断に使用する前に確認してください。",
        ],
      },
      {
        id: "subscriptions",
        title: "6. サブスクリプションと請求",
        body: [
          "有料プラン、更新期間、利用上限、税金、解約条件は購入時または注文書に表示されます。",
          "別途明記されない限り、サブスクリプション料金は法律で求められる場合または書面で合意された場合を除き返金されません。",
        ],
      },
      {
        id: "availability",
        title: "7. サービス可用性と変更",
        body: [
          "Onehandは信頼性の高いサービスを目指しますが、保守、更新、セキュリティ作業、制御できない事象により一時的に利用できない場合があります。",
          "機能、プラン、サービスの一部は変更または終了されることがあります。重要な影響がある場合は合理的な通知を行います。",
        ],
      },
      {
        id: "liability",
        title: "8. 免責と責任",
        body: [
          "法律で認められる最大限の範囲で、Onehandは現状有姿で提供され、中断がないこと、エラーがないこと、AI出力が常に正確であることを保証しません。",
          "法律で認められる最大限の範囲で、Onehandは間接損害、特別損害、収益損失、データ損失などについて責任を負いません。",
        ],
      },
      {
        id: "changes-contact",
        title: "9. 変更とお問い合わせ",
        body: [
          "Onehandは本規約を随時更新することがあります。重要な変更については適用法に従って通知します。",
          "規約に関する質問はOnehandのお問い合わせページから送信できます。",
        ],
      },
    ],
  },
  "zh-TW": {
    eyebrow: "Onehand 政策中心",
    title: "服务条款与隐私。",
    description:
      "本页面汇总使用 Onehand 所需的核心条款、隐私和安全信息。这是面向产品的政策草案，应根据最终法律要求进行审查。",
    lastUpdated: "最后更新：2026年7月8日",
    contentsLabel: "目录",
    openLabel: "打开",
    shortTitle: "简短说明",
    shortDescription:
      "请负责任地使用 Onehand，保护客户数据，审查 AI 输出后再使用，并在需要账户、隐私或安全帮助时联系我们。",
    reviewTitle: "需要正式审查资料？",
    reviewDescription:
      "如有销售、隐私和安全相关问题，请联系 Onehand 团队。",
    reviewCta: "联系我们",
    policyLinks: makePolicyLinks({
      terms: "服务条款",
      termsDescription: "使用 Onehand、创建工作区和管理账户访问的规则。",
      privacy: "隐私政策",
      privacyDescription: "Onehand 如何收集、使用、披露和保护信息。",
      security: "安全",
      securityDescription:
        "Onehand 对工作区访问、基础设施、隐私和可靠性的处理方式。",
      contact: "咨询",
      contactDescription:
        "就订阅、隐私请求或安全问题联系 Onehand 团队。",
    }),
    sections: [
      {
        id: "using-onehand",
        title: "1. 使用 Onehand",
        body: [
          "Onehand 提供工作区，帮助销售团队管理客户记录、交易活动、任务、笔记和 AI 辅助工作流。",
          "你需要对提交的信息和账户凭据安全负责，并遵守适用法律和本条款。",
        ],
      },
      {
        id: "accounts",
        title: "2. 账户和工作区",
        body: [
          "工作区所有者和管理员控制受邀用户、权限、计费设置以及提交到工作区的数据。",
          "你同意提供准确的账户信息，并在认为账户或工作区被未经授权访问时通知我们。",
        ],
      },
      {
        id: "acceptable-use",
        title: "3. 可接受使用",
        body: [
          "不得使用 Onehand 违法、侵权、传播恶意软件、尝试未经授权访问或干扰服务运行。",
          "除法律允许外，不得逆向工程服务、滥用自动访问、抓取平台内容损害服务，或使用 Onehand 开发竞争产品。",
        ],
      },
      {
        id: "customer-data",
        title: "4. 客户数据和隐私",
        body: [
          "客户数据归提交该数据的客户或工作区所有。Onehand 根据隐私政策和适用客户协议处理客户数据。",
          "如果工作区包含个人信息，你需要确保有权并已提供必要通知来向 Onehand 提交这些信息。",
        ],
      },
      {
        id: "ai-features",
        title: "5. AI 辅助功能",
        body: [
          "Onehand 可能包含 AI 辅助摘要、草稿、搜索、分配和其他工作流支持。",
          "AI 输出可能有用但不完整或不准确，因此在用于客户承诺或业务决策前应进行审查。",
        ],
      },
      {
        id: "subscriptions",
        title: "6. 订阅和计费",
        body: [
          "付费方案、续费周期、使用限制、税费和取消条件会在购买时或适用订单中展示。",
          "除非另有说明，订阅费用不予退还，法律要求或书面明确同意的情况除外。",
        ],
      },
      {
        id: "availability",
        title: "7. 服务可用性和变更",
        body: [
          "我们努力保持 Onehand 可靠，但服务可能因维护、更新、安全工作或不可控事件而暂时不可用。",
          "我们可能更新功能、修改方案或停止部分服务。若变更对客户产生重大影响，我们会尽合理努力提供通知。",
        ],
      },
      {
        id: "liability",
        title: "8. 免责声明和责任",
        body: [
          "在法律允许的最大范围内，Onehand 按现状和可用状态提供，不保证服务不中断、无错误或 AI 辅助内容始终准确。",
          "在法律允许的最大范围内，Onehand 不对间接、附带、特殊、后果性或惩罚性损害，或利润、收入、数据、商业机会损失负责。",
        ],
      },
      {
        id: "changes-contact",
        title: "9. 变更和联系",
        body: [
          "我们可能不时更新这些条款。如变更重大，我们会按适用法律提供通知。",
          "有关这些条款的问题可以通过 Onehand 联系页面发送。",
        ],
      },
    ],
  },
  "en-US": {
    eyebrow: "Onehand policy center",
    title: "Terms and privacy.",
    description:
      "This page brings together the core terms, privacy, and security information for using Onehand. It is a product-facing policy draft and should be reviewed for your final legal requirements.",
    lastUpdated: "Last updated: July 8, 2026",
    contentsLabel: "Contents",
    openLabel: "Open",
    shortTitle: "Short version",
    shortDescription:
      "Use Onehand responsibly, protect customer data, review AI output before using it, and contact us when you need help with account, privacy, or security questions.",
    reviewTitle: "Need a formal review packet?",
    reviewDescription:
      "Contact the Onehand team for sales, privacy, and security questions related to your organization.",
    reviewCta: "Contact us",
    policyLinks: makePolicyLinks({
      terms: "Terms of service",
      termsDescription:
        "The rules for using Onehand, creating a workspace, and managing account access.",
      privacy: "Privacy policy",
      privacyDescription:
        "How Onehand collects, uses, discloses, and protects information.",
      security: "Security",
      securityDescription:
        "How Onehand approaches workspace access, infrastructure, privacy, and reliability.",
      contact: "Contact",
      contactDescription:
        "Reach the Onehand team about subscriptions, privacy requests, or security questions.",
    }),
    sections: [
      {
        id: "using-onehand",
        title: "1. Using Onehand",
        body: [
          "Onehand provides a workspace for sales teams to manage customer records, deal activity, tasks, notes, and AI-assisted workflows.",
          "You are responsible for the information you submit and for keeping your account credentials secure while using Onehand in compliance with applicable laws and these terms.",
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
          "You may not use Onehand to violate laws, infringe rights, distribute malware, attempt unauthorized access, or interfere with service operation.",
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
          "Onehand may include AI-assisted summaries, drafts, search, routing, and other workflow support.",
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
          "We may update these terms from time to time. If changes are material, we will provide notice as required by applicable law.",
          "Questions about these terms can be sent through the Onehand contact page.",
        ],
      },
    ],
  },
  "en-GB": {
    eyebrow: "Onehand policy centre",
    title: "Terms and privacy.",
    description:
      "This page brings together the core terms, privacy, and security information for using Onehand. It is a product-facing policy draft and should be reviewed for your final legal requirements.",
    lastUpdated: "Last updated: 8 July 2026",
    contentsLabel: "Contents",
    openLabel: "Open",
    shortTitle: "Short version",
    shortDescription:
      "Use Onehand responsibly, protect customer data, review AI output before using it, and contact us when you need help with account, privacy, or security questions.",
    reviewTitle: "Need a formal review pack?",
    reviewDescription:
      "Contact the Onehand team for sales, privacy, and security questions related to your organisation.",
    reviewCta: "Contact us",
    policyLinks: makePolicyLinks({
      terms: "Terms of service",
      termsDescription:
        "The rules for using Onehand, creating a workspace, and managing account access.",
      privacy: "Privacy policy",
      privacyDescription:
        "How Onehand collects, uses, discloses, and protects information.",
      security: "Security",
      securityDescription:
        "How Onehand approaches workspace access, infrastructure, privacy, and reliability.",
      contact: "Contact",
      contactDescription:
        "Reach the Onehand team about subscriptions, privacy requests, or security questions.",
    }),
    sections: [
      {
        id: "using-onehand",
        title: "1. Using Onehand",
        body: [
          "Onehand provides a workspace for sales teams to manage customer records, deal activity, tasks, notes, and AI-assisted workflows.",
          "You are responsible for the information you submit and for keeping your account credentials secure while using Onehand in compliance with applicable laws and these terms.",
        ],
      },
      {
        id: "accounts",
        title: "2. Accounts and workspaces",
        body: [
          "Workspace owners and administrators control invited users, permissions, billing settings, and the data submitted to their workspace.",
          "You agree to provide accurate account information and to notify us if you believe your account or workspace has been accessed without authorisation.",
        ],
      },
      {
        id: "acceptable-use",
        title: "3. Acceptable use",
        body: [
          "You may not use Onehand to violate laws, infringe rights, distribute malware, attempt unauthorised access, or interfere with service operation.",
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
          "Onehand may include AI-assisted summaries, drafts, search, routing, and other workflow support.",
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
          "We may update these terms from time to time. If changes are material, we will provide notice as required by applicable law.",
          "Questions about these terms can be sent through the Onehand contact page.",
        ],
      },
    ],
  },
};

export function TermsPage() {
  const { language } = usePublicSiteLanguage();
  const copy = termsCopyByLanguage[getPublicSiteCopyLanguage(language)];

  return (
    <PublicSitePageShell>
      <section className="bg-white py-16 sm:py-20 lg:py-24">
        <div className="mx-auto w-full max-w-[1320px] px-4 sm:px-6 lg:px-8">
          <div className="max-w-[820px]">
            <p className="text-[13px] font-semibold text-[#777770]">
              {copy.eyebrow}
            </p>
            <h1 className="mt-3 break-keep text-[40px] font-black leading-[1.05] tracking-normal md:text-[58px]">
              {copy.title}
            </h1>
            <p className="mt-4 max-w-[720px] break-keep text-[15px] leading-7 text-[#555550]">
              {copy.description}
            </p>
            <p className="mt-4 text-[12px] font-bold text-[#888880]">
              {copy.lastUpdated}
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {copy.policyLinks.map((item) => (
              <PolicyCard item={item} key={item.title} openLabel={copy.openLabel} />
            ))}
          </div>

          <div className="mt-16">
            <nav className="rounded-[8px] bg-[#f7f7f5] p-4">
              <p className="text-[12px] font-black uppercase tracking-[0.08em] text-[#888880]">
                {copy.contentsLabel}
              </p>
              <div className="mt-4 grid gap-2 text-[13px] font-semibold text-[#555550] sm:grid-cols-2">
                {copy.sections.map((section) => (
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
                    <h2 className="break-keep text-[18px] font-black">
                      {copy.shortTitle}
                    </h2>
                    <p className="mt-2 break-keep text-[13px] leading-6 text-[#555550]">
                      {copy.shortDescription}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-10 grid gap-12">
                {copy.sections.map((section) => (
                  <section id={section.id} key={section.id}>
                    <h2 className="break-keep text-[26px] font-black leading-tight">
                      {section.title}
                    </h2>
                    <div className="mt-4 grid gap-4 break-keep text-[14px] leading-7 text-[#444440]">
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
                    <h2 className="break-keep text-[18px] font-black">
                      {copy.reviewTitle}
                    </h2>
                    <p className="mt-2 break-keep text-[13px] leading-6 text-[#555550]">
                      {copy.reviewDescription}
                    </p>
                    <Link
                      className="mt-4 inline-flex items-center gap-2 text-[13px] font-black text-[#0075DE] underline-offset-2 hover:underline"
                      to="/contact"
                    >
                      {copy.reviewCta}
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

function PolicyCard({
  item,
  openLabel,
}: {
  readonly item: PolicyLink;
  readonly openLabel: string;
}) {
  const Icon = item.icon;

  return (
    <Link
      className="group rounded-[8px] bg-[#f7f7f5] p-5 transition-colors hover:bg-[#eeeeec]"
      to={item.to}
    >
      <span className="grid h-10 w-10 place-items-center rounded-[8px] bg-white text-[#0075DE]">
        <Icon className="h-5 w-5" />
      </span>
      <h2 className="mt-5 break-keep text-[18px] font-black">{item.title}</h2>
      <p className="mt-2 break-keep text-[13px] leading-6 text-[#555550]">
        {item.description}
      </p>
      <span className="mt-5 inline-flex items-center gap-2 text-[13px] font-black text-[#0075DE]">
        {openLabel}
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}
