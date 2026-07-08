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
import {
  usePublicSiteLanguage,
  type PublicSiteLanguage,
} from "@/features/public-site/i18n/public-site-language";

type SecurityCard = {
  readonly title: string;
  readonly description: string;
};

type SecuritySectionCopy = {
  readonly eyebrow: string;
  readonly title: string;
  readonly description: string;
  readonly cards: readonly SecurityCard[];
};

type SecurityCopy = {
  readonly eyebrow: string;
  readonly title: string;
  readonly description: string;
  readonly trustItems: readonly string[];
  readonly sections: readonly SecuritySectionCopy[];
  readonly ctaTitle: string;
  readonly ctaDescription: string;
  readonly contactCta: string;
  readonly privacyCta: string;
};

const sectionIcons: readonly LucideIcon[] = [
  ShieldCheck,
  LockKeyhole,
  FileCheck2,
  Bot,
  Server,
];

const trustIcons: readonly LucideIcon[] = [Database, Globe2, CheckCircle2];

const securityCopyByLanguage: Record<PublicSiteLanguage, SecurityCopy> = {
  ko: {
    eyebrow: "Onehand 보안",
    title: "고객 업무를 위한 보안과 개인정보 보호.",
    description:
      "Onehand는 고객 기록, 세일즈 활동, AI 지원을 하나의 워크스페이스에서 관리하도록 돕습니다. 보안과 개인정보 보호는 그 맥락을 지키는 방식으로 설계됩니다.",
    trustItems: [
      "서비스 제공을 위한 데이터 처리",
      "적용 가능한 개인정보 권리 지원",
      "제품 업무에 포함된 보안 검토",
    ],
    sections: [
      {
        eyebrow: "보안",
        title: "캡처부터 후속 업무까지 고객 맥락을 보호합니다.",
        description:
          "Onehand는 계정 기록, 고객 대화, 세일즈 워크플로가 올바른 사람에게만 제공되어야 한다는 전제에서 설계됩니다.",
        cards: [
          {
            title: "워크스페이스 접근 제어",
            description:
              "팀은 워크스페이스, 역할, 계정 가시성을 분리해 고객 정보가 적절한 운영 그룹 안에 머물도록 관리할 수 있습니다.",
          },
          {
            title: "안전한 인프라",
            description:
              "애플리케이션 트래픽은 전송 중 보호되고, 민감한 플랫폼 데이터는 보안 우선 인프라 접근으로 관리됩니다.",
          },
          {
            title: "제품 보안 검토",
            description:
              "새 워크플로 화면은 출시 전 권한, 감사 가능성, 고객 기록 처리 방식을 기준으로 검토됩니다.",
          },
        ],
      },
      {
        eyebrow: "개인정보 보호",
        title: "개인정보 보호 제어는 페이지가 아니라 데이터를 따라갑니다.",
        description:
          "고객 기록, 업로드 파일, 회의 노트에는 개인정보가 포함될 수 있습니다. Onehand는 제품 수명주기 전반에서 개인정보 기대치를 명확히 유지합니다.",
        cards: [
          {
            title: "목적 기반 처리",
            description:
              "고객 데이터는 서비스 제공, 계정 지원, 플랫폼 보호, 사용자에게 설명된 워크플로 개선을 위해 사용됩니다.",
          },
          {
            title: "공급업체 검토",
            description:
              "하위 처리자와 서비스 제공자는 역할, 보안 수준, 고객 정보 보호 능력을 기준으로 검토됩니다.",
          },
          {
            title: "사용자 선택권",
            description:
              "사용자는 적용 가능한 경우 개인정보 문의 절차를 통해 접근, 정정, 삭제 등 권리를 요청할 수 있습니다.",
          },
        ],
      },
      {
        eyebrow: "컴플라이언스",
        title: "신뢰할 수 있는 시스템이 필요한 팀을 위한 통제.",
        description:
          "Onehand의 컴플라이언스 프로그램은 가용성, 접근 제어, 공급업체 관리, 데이터 처리 같은 실제 고객 요구를 중심으로 발전합니다.",
        cards: [
          {
            title: "정책 거버넌스",
            description:
              "보안과 개인정보 정책은 내부 접근, 사고 대응, 보존, 고객 지원 워크플로 관리 방식을 정의합니다.",
          },
          {
            title: "데이터 처리 지원",
            description:
              "엔터프라이즈 고객은 구매와 계정 검토 과정에서 데이터 처리 및 보안 자료를 요청할 수 있습니다.",
          },
          {
            title: "운영 준비성",
            description:
              "플랫폼 변경은 가동 시간, 복구 가능성, 예측 가능한 릴리스를 우선하는 검토 경로로 처리됩니다.",
          },
        ],
      },
      {
        eyebrow: "AI 거버넌스",
        title: "AI 지원은 책임 가능한 방식으로 남아야 합니다.",
        description:
          "Onehand 에이전트는 승인된 워크스페이스 맥락에서 요약, 초안 작성, 라우팅, 검색을 돕습니다. 팀이 사람의 검토를 유지할 수 있도록 설계됩니다.",
        cards: [
          {
            title: "고객이 제어하는 맥락",
            description:
              "AI 기능은 사용자가 이미 접근 권한을 가진 워크스페이스 정보에 기반합니다.",
          },
          {
            title: "숨겨진 위임 없음",
            description:
              "생성된 요약과 초안은 최종 고객 약속이 아니라 지원 결과로 표시됩니다.",
          },
          {
            title: "책임 있는 개선",
            description:
              "AI 기능은 정확성 기대치, 권한 경계, 사용자 투명성을 기준으로 검토됩니다.",
          },
        ],
      },
      {
        eyebrow: "안정성",
        title: "세일즈 업무는 고객이 준비된 순간에 사용할 수 있어야 합니다.",
        description:
          "안정성은 제품 품질로 다뤄집니다. 팀은 일상 업무 중 고객 데이터가 접근 가능하고 이해 가능한 상태로 유지되도록 워크플로를 설계합니다.",
        cards: [
          {
            title: "백업과 복구",
            description:
              "운영 데이터는 사고 발생 시 워크스페이스 기록을 복원할 수 있도록 복구 계획과 함께 관리됩니다.",
          },
          {
            title: "모니터링",
            description:
              "서비스 상태와 플랫폼 동작을 모니터링해 문제를 빠르게 조사하고 해결합니다.",
          },
          {
            title: "지원 준비",
            description:
              "고객은 공개 문의 흐름을 통해 계정, 개인정보, 보안 질문을 Onehand 팀에 전달할 수 있습니다.",
          },
        ],
      },
    ],
    ctaTitle: "팀에서 Onehand를 사용하는 방법을 알아보세요.",
    ctaDescription:
      "워크스페이스 접근, 개인정보 질문, 조직의 보안 검토 요청을 Onehand가 어떻게 처리하는지 공유할 수 있습니다.",
    contactCta: "문의하기",
    privacyCta: "개인정보 처리방침 보기",
  },
  ja: {
    eyebrow: "Onehand セキュリティ",
    title: "顧客業務のためのセキュリティとプライバシー。",
    description:
      "Onehandは顧客記録、営業活動、AI支援を一つのワークスペースで管理できるようにします。セキュリティとプライバシーは、その文脈を守るために設計されています。",
    trustItems: [
      "サービス提供のためのデータ処理",
      "適用されるプライバシー権利を支援",
      "製品開発に組み込まれたセキュリティレビュー",
    ],
    sections: [
      {
        eyebrow: "セキュリティ",
        title: "取得からフォローアップまで顧客文脈を保護します。",
        description:
          "Onehandはアカウント記録、顧客会話、営業ワークフローが適切な人だけに利用可能であるべきという考えで設計されています。",
        cards: [
          {
            title: "ワークスペースアクセス制御",
            description:
              "チームはワークスペース、役割、アカウント可視性を分け、顧客情報を正しい運用グループ内に保てます。",
          },
          {
            title: "安全なインフラ",
            description:
              "アプリケーショントラフィックは転送中に保護され、機密性の高いプラットフォームデータはセキュリティ重視で管理されます。",
          },
          {
            title: "製品セキュリティレビュー",
            description:
              "新しいワークフロー画面は、権限、監査可能性、顧客記録の扱いを基準にリリース前に確認されます。",
          },
        ],
      },
      {
        eyebrow: "プライバシー",
        title: "プライバシー制御はページではなくデータに沿って働きます。",
        description:
          "顧客記録、アップロードファイル、会議ノートには個人情報が含まれることがあります。Onehandは製品ライフサイクル全体でプライバシー期待値を明確に保ちます。",
        cards: [
          {
            title: "目的に基づく処理",
            description:
              "顧客データはサービス提供、アカウント支援、プラットフォーム保護、説明されたワークフロー改善のために使用されます。",
          },
          {
            title: "ベンダーレビュー",
            description:
              "サブプロセッサーとサービス提供者は、役割、セキュリティ姿勢、顧客情報保護能力に基づいて確認されます。",
          },
          {
            title: "ユーザーの選択",
            description:
              "ユーザーは適用される場合、プライバシー連絡プロセスを通じてアクセス、訂正、削除などの権利を要求できます。",
          },
        ],
      },
      {
        eyebrow: "コンプライアンス",
        title: "信頼できるシステムを必要とするチームのための統制。",
        description:
          "Onehandのコンプライアンスプログラムは、可用性、アクセス制御、ベンダー管理、データ処理といった実務的な顧客要件を中心に形作られています。",
        cards: [
          {
            title: "ポリシーガバナンス",
            description:
              "セキュリティとプライバシーポリシーは、内部アクセス、インシデント、保持、顧客サポートの管理方法を定義します。",
          },
          {
            title: "データ処理支援",
            description:
              "エンタープライズ顧客は調達やアカウントレビューの際に、データ処理とセキュリティ資料を依頼できます。",
          },
          {
            title: "運用準備",
            description:
              "プラットフォーム変更は、稼働率、復旧可能性、予測可能なリリースを優先するレビュー経路で扱われます。",
          },
        ],
      },
      {
        eyebrow: "AIガバナンス",
        title: "AI支援は説明責任を持つべきです。",
        description:
          "Onehandエージェントは承認されたワークスペース文脈を使って要約、下書き、ルーティング、検索を支援します。人間がワークフローに残れるように設計されています。",
        cards: [
          {
            title: "顧客が制御する文脈",
            description:
              "AI機能は、ユーザーがすでにアクセスを許可されているワークスペース情報に基づきます。",
          },
          {
            title: "隠れた引き継ぎなし",
            description:
              "生成された要約や下書きは、最終的な顧客約束ではなく支援として表示されます。",
          },
          {
            title: "責任ある改善",
            description:
              "AI機能は、正確性への期待、権限境界、ユーザー向け透明性を基準にレビューされます。",
          },
        ],
      },
      {
        eyebrow: "信頼性",
        title: "営業業務は顧客が準備できた瞬間に利用できる必要があります。",
        description:
          "信頼性は製品品質として扱われます。顧客データが日々の業務で到達可能で理解しやすい状態を保つよう、ワークフローを設計します。",
        cards: [
          {
            title: "バックアップと復旧",
            description:
              "運用データは、インシデント時にワークスペース記録を復元できるよう復旧計画とともに管理されます。",
          },
          {
            title: "モニタリング",
            description:
              "サービス状態とプラットフォーム動作を監視し、問題を迅速に調査して解決します。",
          },
          {
            title: "サポート準備",
            description:
              "顧客は公開問い合わせフローを通じて、アカウント、プライバシー、セキュリティの質問をOnehandチームに連絡できます。",
          },
        ],
      },
    ],
    ctaTitle: "チームでOnehandを使う方法を知る。",
    ctaDescription:
      "ワークスペースアクセス、プライバシーに関する質問、組織のセキュリティレビュー依頼への対応方法を共有できます。",
    contactCta: "問い合わせる",
    privacyCta: "プライバシーポリシーを読む",
  },
  zh: {
    eyebrow: "Onehand 安全",
    title: "面向客户工作的安全与隐私。",
    description:
      "Onehand 帮助团队在一个工作区管理客户记录、销售活动和 AI 协助。我们的安全与隐私工作围绕保护这些上下文而构建。",
    trustItems: [
      "为服务交付处理数据",
      "支持适用的隐私权利",
      "安全审查嵌入产品工作",
    ],
    sections: [
      {
        eyebrow: "安全",
        title: "从捕获到跟进，保护客户上下文。",
        description:
          "Onehand 围绕账户记录、客户对话和销售工作流设计，这些信息只应提供给合适的人。",
        cards: [
          {
            title: "工作区访问控制",
            description:
              "团队可以分离工作区、角色和账户可见性，让客户信息留在正确的运营组内。",
          },
          {
            title: "安全基础设施",
            description:
              "应用流量在传输中受到保护，敏感平台数据以安全优先的基础设施方式管理。",
          },
          {
            title: "产品安全审查",
            description:
              "新的工作流界面会在发布前围绕权限、审计能力和客户记录处理方式进行审查。",
          },
        ],
      },
      {
        eyebrow: "隐私",
        title: "隐私控制跟随数据，而不只是跟随页面。",
        description:
          "客户记录、上传文件和会议记录可能包含个人信息。Onehand 在产品生命周期中保持隐私预期清晰可见。",
        cards: [
          {
            title: "基于目的的处理",
            description:
              "我们使用客户数据来提供服务、支持账户、保护平台，并改进向用户说明的工作流。",
          },
          {
            title: "供应商审查",
            description:
              "我们会根据角色、安全状态和保护客户信息的能力审查子处理方和服务提供商。",
          },
          {
            title: "用户选择",
            description:
              "在适用情况下，用户可以通过隐私联系流程请求访问、更正、删除或其他权利。",
          },
        ],
      },
      {
        eyebrow: "合规",
        title: "为需要可靠系统的团队构建控制。",
        description:
          "随着 Onehand 成长，我们的合规计划围绕实际客户需求形成：可用性、访问控制、供应商管理和数据处理。",
        cards: [
          {
            title: "政策治理",
            description:
              "安全和隐私政策定义我们如何管理内部访问、事件、保留和客户支持流程。",
          },
          {
            title: "数据处理支持",
            description:
              "企业客户可以在采购和账户审查期间请求数据处理和安全材料。",
          },
          {
            title: "运营准备",
            description:
              "平台变更通过优先考虑正常运行、可恢复性和可预测发布行为的审查路径处理。",
          },
        ],
      },
      {
        eyebrow: "AI 治理",
        title: "AI 协助应保持可问责。",
        description:
          "Onehand 代理帮助在批准的工作区上下文中摘要、起草、分配和搜索。产品设计保留人在工作流中的判断。",
        cards: [
          {
            title: "客户控制的上下文",
            description: "AI 功能基于用户已经被允许访问的工作区信息。",
          },
          {
            title: "没有隐藏交接",
            description:
              "生成的摘要和草稿会作为协助呈现，而不是最终客户承诺。",
          },
          {
            title: "负责任的改进",
            description:
              "我们围绕准确性预期、权限边界和用户透明度审查 AI 功能。",
          },
        ],
      },
      {
        eyebrow: "可靠性",
        title: "当客户准备好时，销售工作必须可用。",
        description:
          "可靠性被视为产品质量。团队设计工作流，让客户数据在日常工作中保持可访问、可理解。",
        cards: [
          {
            title: "备份和恢复",
            description:
              "运营数据结合恢复计划进行管理，以便在事件发生时恢复工作区记录。",
          },
          {
            title: "监控",
            description:
              "我们监控服务健康和平台行为，以便快速调查并解决问题。",
          },
          {
            title: "支持准备",
            description:
              "客户可以通过公开联系流程向 Onehand 团队提出账户、隐私和安全问题。",
          },
        ],
      },
    ],
    ctaTitle: "了解如何在团队中使用 Onehand。",
    ctaDescription:
      "我们可以说明 Onehand 如何处理工作区访问、隐私问题以及贵组织的安全审查请求。",
    contactCta: "联系我们",
    privacyCta: "阅读隐私政策",
  },
  "en-US": {
    eyebrow: "Onehand security",
    title: "Security & privacy for customer work.",
    description:
      "Onehand helps teams manage customer records, sales activity, and AI assistance in one workspace. Our security and privacy work is built around protecting that context.",
    trustItems: [
      "Data handled for service delivery",
      "Privacy rights supported where applicable",
      "Security reviews built into product work",
    ],
    sections: [
      {
        eyebrow: "Security",
        title: "Protect customer context from capture to follow-up.",
        description:
          "Onehand is designed around account records, customer conversations, and sales workflows that should only be available to the right people.",
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
    ],
    ctaTitle: "Learn about using Onehand with your team.",
    ctaDescription:
      "We can share how Onehand handles workspace access, privacy questions, and security review requests for your organization.",
    contactCta: "Contact us",
    privacyCta: "Read privacy policy",
  },
  "en-GB": {
    eyebrow: "Onehand security",
    title: "Security & privacy for customer work.",
    description:
      "Onehand helps teams manage customer records, sales activity, and AI assistance in one workspace. Our security and privacy work is built around protecting that context.",
    trustItems: [
      "Data handled for service delivery",
      "Privacy rights supported where applicable",
      "Security reviews built into product work",
    ],
    sections: [
      {
        eyebrow: "Security",
        title: "Protect customer context from capture to follow-up.",
        description:
          "Onehand is designed around account records, customer conversations, and sales workflows that should only be available to the right people.",
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
          "As Onehand grows, our compliance programme is being shaped around practical customer requirements: availability, access control, vendor management, and data handling.",
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
              "Platform changes are handled with review paths that prioritise uptime, recoverability, and predictable release behaviour.",
          },
        ],
      },
      {
        eyebrow: "AI governance",
        title: "AI assistance should stay accountable.",
        description:
          "Onehand agents help summarise, draft, route, and search across approved workspace context. The product is designed so teams can keep humans in the workflow.",
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
        cards: [
          {
            title: "Backups and recovery",
            description:
              "Operational data is managed with recovery planning so workspace records can be restored when incidents occur.",
          },
          {
            title: "Monitoring",
            description:
              "Service health and platform behaviour are monitored so issues can be investigated and resolved quickly.",
          },
          {
            title: "Support readiness",
            description:
              "Customers can contact the Onehand team for account, privacy, and security questions through the public contact flow.",
          },
        ],
      },
    ],
    ctaTitle: "Learn about using Onehand with your team.",
    ctaDescription:
      "We can share how Onehand handles workspace access, privacy questions, and security review requests for your organisation.",
    contactCta: "Contact us",
    privacyCta: "Read privacy policy",
  },
};

export function SecurityPage() {
  const { language } = usePublicSiteLanguage();
  const copy = securityCopyByLanguage[language];

  return (
    <PublicSitePageShell>
      <section className="bg-white py-16 sm:py-20 lg:py-24">
        <div className="mx-auto w-full max-w-[1320px] px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-[13px] font-semibold text-[#777770]">
              {copy.eyebrow}
            </p>
            <h1 className="mx-auto mt-3 max-w-[760px] break-keep text-[40px] font-black leading-[1.05] tracking-normal md:text-[58px]">
              {copy.title}
            </h1>
            <p className="mx-auto mt-4 max-w-[680px] break-keep text-[15px] leading-7 text-[#555550]">
              {copy.description}
            </p>
          </div>

          <div className="mx-auto mt-10 grid max-w-[860px] gap-3 md:grid-cols-3">
            {copy.trustItems.map((label, index) => {
              const Icon = trustIcons[index] ?? CheckCircle2;

              return (
                <div
                  className="flex items-center gap-3 rounded-[8px] bg-[#f7f7f5] px-4 py-3"
                  key={label}
                >
                  <Icon className="h-4 w-4 text-[#0075DE]" />
                  <span className="break-keep text-[12px] font-bold text-[#333330]">
                    {label}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-16 grid gap-20">
            {copy.sections.map((section, index) => (
              <SecuritySectionBlock
                icon={sectionIcons[index] ?? ShieldCheck}
                key={section.eyebrow}
                section={section}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f7f7f5] py-16 sm:py-20 lg:py-24">
        <div className="mx-auto w-full max-w-[1320px] px-4 text-center sm:px-6 lg:px-8">
          <h2 className="break-keep text-[34px] font-black leading-tight md:text-[46px]">
            {copy.ctaTitle}
          </h2>
          <p className="mx-auto mt-4 max-w-[660px] break-keep text-[14px] leading-7 text-[#555550]">
            {copy.ctaDescription}
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link
              className="inline-flex h-9 items-center gap-2 rounded-[6px] bg-[#0075DE] px-4 text-[13px] font-bold text-white hover:bg-[#006AC8]"
              to="/contact"
            >
              {copy.contactCta}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              className="inline-flex h-9 items-center rounded-[6px] bg-white px-4 text-[13px] font-bold text-[#0075DE] hover:bg-[#eeeeec]"
              to="/privacy"
            >
              {copy.privacyCta}
            </Link>
          </div>
        </div>
      </section>
    </PublicSitePageShell>
  );
}

function SecuritySectionBlock({
  icon: Icon,
  section,
}: {
  readonly icon: LucideIcon;
  readonly section: SecuritySectionCopy;
}) {
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
          <h2 className="mt-2 break-keep text-[30px] font-black leading-tight md:text-[42px]">
            {section.title}
          </h2>
          <p className="mt-4 break-keep text-[14px] leading-7 text-[#555550]">
            {section.description}
          </p>
        </div>

        <div className="grid gap-3">
          {section.cards.map((card) => (
            <article className="rounded-[8px] bg-[#f7f7f5] p-5" key={card.title}>
              <h3 className="break-keep text-[15px] font-black">
                {card.title}
              </h3>
              <p className="mt-2 break-keep text-[13px] leading-6 text-[#555550]">
                {card.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
