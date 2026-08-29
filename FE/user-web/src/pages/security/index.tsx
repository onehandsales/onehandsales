import {
  Bot,
  FileCheck2,
  LockKeyhole,
  Server,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import {
  PublicContentContainer,
  PublicDocumentHero,
  PublicInfoCard,
  PublicPageSection,
  PublicSitePageShell,
} from "@/features/public-site";
import {
  getPublicSiteCopyLanguage,
  usePublicSiteLanguage,
  type PublicSiteCopyLanguage,
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
  readonly title: string;
  readonly sections: readonly SecuritySectionCopy[];
};

const sectionIcons: readonly LucideIcon[] = [
  ShieldCheck,
  LockKeyhole,
  FileCheck2,
  Bot,
  Server,
];

const securityCopyByLanguage: Record<PublicSiteCopyLanguage, SecurityCopy> = {
  ko: {
    title: "보안",
    sections: [
      {
        eyebrow: "보안",
        title: "캡처부터 후속 업무까지 고객 맥락을 보호합니다.",
        description:
          "OneHand는 계정 기록, 고객 대화, 세일즈 워크플로가 올바른 사람에게만 제공되어야 한다는 전제에서 설계됩니다.",
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
          "고객 기록, 업로드 파일, 회의 노트에는 개인정보가 포함될 수 있습니다. OneHand는 제품 수명주기 전반에서 개인정보 기대치를 명확히 유지합니다.",
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
          "OneHand의 컴플라이언스 프로그램은 가용성, 접근 제어, 공급업체 관리, 데이터 처리 같은 실제 고객 요구를 중심으로 발전합니다.",
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
          "OneHand 에이전트는 승인된 워크스페이스 맥락에서 요약, 초안 작성, 라우팅, 검색을 돕습니다. 팀이 사람의 검토를 유지할 수 있도록 설계됩니다.",
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
              "고객은 공개 문의 흐름을 통해 계정, 개인정보, 보안 질문을 OneHand 팀에 전달할 수 있습니다.",
          },
        ],
      },
    ],
  },
  "en-US": {
    title: "Security",
    sections: [
      {
        eyebrow: "Security",
        title: "Protect customer context from capture to follow-up.",
        description:
          "OneHand is designed around account records, customer conversations, and sales workflows that should only be available to the right people.",
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
          "Customer records, uploaded files, and meeting notes can include personal information. OneHand keeps privacy expectations visible across the product lifecycle.",
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
          "As OneHand grows, our compliance program is being shaped around practical customer requirements: availability, access control, vendor management, and data handling.",
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
          "OneHand agents help summarize, draft, route, and search across approved workspace context. The product is designed so teams can keep humans in the workflow.",
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
              "Customers can contact the OneHand team for account, privacy, and security questions through the public contact flow.",
          },
        ],
      },
    ],
  },
};

// 기능 : 보안 페이지를 렌더링합니다.
export function SecurityPage() {
  const { language } = usePublicSiteLanguage();
  const copy = securityCopyByLanguage[getPublicSiteCopyLanguage(language)];

  return (
    <PublicSitePageShell>
      <PublicPageSection>
        <PublicContentContainer>
          <PublicDocumentHero
            title={copy.title}
          />

          <div className="mt-16 grid gap-20">
            {copy.sections.map((section, index) => (
              <SecuritySectionBlock
                icon={sectionIcons[index] ?? ShieldCheck}
                key={section.eyebrow}
                section={section}
              />
            ))}
          </div>
        </PublicContentContainer>
      </PublicPageSection>

    </PublicSitePageShell>
  );
}

// 기능 : 보안 섹션 블록 영역을 렌더링합니다.
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
        <div className="min-w-0">
          <div className="mb-5 grid h-16 w-16 place-items-center rounded-[8px] bg-[#edf7ff] text-[#0075DE]">
            <Icon className="h-8 w-8" />
          </div>
          <p className="text-[13px] font-normal text-[#777770]">
            {section.eyebrow}
          </p>
          <h2 className="mt-2 text-[30px] font-normal leading-tight md:text-[42px]">
            {section.title}
          </h2>
          <p className="mt-4 text-[14px] leading-7 text-[#555550]">
            {section.description}
          </p>
        </div>

        <div className="grid min-w-0 gap-3">
          {section.cards.map((card) => (
            <PublicInfoCard
              description={card.description}
              key={card.title}
              title={card.title}
              titleClassName="text-[15px]"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
