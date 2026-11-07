import {
  Bot,
  FileCheck2,
  LockKeyhole,
  Server,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import {
  FinalSection,
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
  readonly finalTitle: string;
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
    finalTitle: "현재 제공 범위를 확인하고 시작해요.",
    sections: [
      {
        eyebrow: "보안",
        title: "계정과 업무 공간 접근",
        description:
          "로그인과 업무 공간 접근 기능을 중심으로 현재 제공 범위를 안내해요.",
        cards: [
          {
            title: "계정 로그인",
            description:
              "로그인한 계정으로 업무 공간에 접근해요.",
          },
          {
            title: "업무 공간 접근",
            description:
              "계정이 접근할 수 있는 업무 공간의 기록을 사용해요.",
          },
          {
            title: "기기와 세션",
            description:
              "계정 설정에서 제공하는 기기·세션 정보를 확인해요.",
          },
        ],
      },
      {
        eyebrow: "개인정보 보호",
        title: "개인정보 처리 안내",
        description:
          "수집·이용·제공에 관한 내용은 개인정보 처리방침에서 확인해 주세요.",
        cards: [
          {
            title: "수집 정보",
            description:
              "계정과 기록, 문의에서 처리하는 정보의 범위를 확인해 주세요.",
          },
          {
            title: "외부 서비스",
            description:
              "처리 위탁과 외부 서비스 관련 내용은 개인정보 처리방침을 확인해 주세요.",
          },
          {
            title: "사용자 요청",
            description:
              "개인정보에 관한 질문은 공개 문의 경로로 남길 수 있어요.",
          },
        ],
      },
      {
        eyebrow: "컴플라이언스",
        title: "현재 권한 기능의 범위",
        description:
          "업무 공간 접근과 조직 협업 기능은 구분해서 안내해요.",
        cards: [
          {
            title: "개인 사용",
            description:
              "현재는 개인의 기록 관리 흐름을 중심으로 제공해요.",
          },
          {
            title: "팀 권한",
            description:
              "팀 초대와 역할별 권한은 현재 제공 범위에 포함되지 않아요.",
          },
          {
            title: "조직 운영",
            description:
              "감사 기록과 조직 관리 기능의 제공 여부는 도입 전에 확인해 주세요.",
          },
        ],
      },
      {
        eyebrow: "AI 거버넌스",
        title: "AI 기능의 현재 범위",
        description:
          "AI 요약·초안·자동 실행은 현재 제공하지 않아요.",
        cards: [
          {
            title: "요약",
            description:
              "AI가 상담이나 회의 내용을 요약하는 기능은 현재 미제공이에요.",
          },
          {
            title: "초안",
            description:
              "AI 메시지 초안 작성은 현재 미제공이에요.",
          },
          {
            title: "자동 실행",
            description:
              "AI가 후속 업무를 자동 실행하는 기능은 현재 미제공이에요.",
          },
        ],
      },
      {
        eyebrow: "안정성",
        title: "운영 범위 확인",
        description:
          "구체적인 운영 조건이 필요하다면 도입 전에 문의해 주세요.",
        cards: [
          {
            title: "백업과 복구",
            description:
              "백업 주기·보관 기간·복구 범위는 별도로 확인해 주세요.",
          },
          {
            title: "서비스 상태",
            description:
              "가용성 보장이나 대응 시간이 필요하면 적용 조건을 문의해 주세요.",
          },
          {
            title: "문의",
            description:
              "계정·개인정보·보안 관련 질문을 공개 문의 경로로 전달할 수 있어요.",
          },
        ],
      },
    ],
  },
  "en-US": {
    title: "Security",
    finalTitle: "Review the current scope before getting started.",
    sections: [
      {
        eyebrow: "Security",
        title: "Account and workspace access",
        description:
          "Review the current scope of sign-in and workspace access features.",
        cards: [
          {
            title: "Account sign-in",
            description:
              "Sign in to access your workspace.",
          },
          {
            title: "Workspace access",
            description:
              "Use records in workspaces accessible to your account.",
          },
          {
            title: "Devices and sessions",
            description:
              "Review the device and session information available in account settings.",
          },
        ],
      },
      {
        eyebrow: "Privacy",
        title: "Privacy information",
        description:
          "Read the privacy policy for information about collection, use, and disclosure.",
        cards: [
          {
            title: "Information collected",
            description:
              "Review the scope of information processed for accounts, records, and inquiries.",
          },
          {
            title: "External services",
            description:
              "Check the privacy policy for service provider and processing information.",
          },
          {
            title: "User questions",
            description:
              "Submit privacy questions through the public contact flow.",
          },
        ],
      },
      {
        eyebrow: "Compliance",
        title: "Current permission scope",
        description:
          "Workspace access is separate from organization collaboration features.",
        cards: [
          {
            title: "Individual use",
            description:
              "The current product focuses on individual record management.",
          },
          {
            title: "Team permissions",
            description:
              "Team invitations and role-based permissions are not currently available.",
          },
          {
            title: "Organization controls",
            description:
              "Confirm the availability of audit and organization administration features before adoption.",
          },
        ],
      },
      {
        eyebrow: "AI governance",
        title: "Current AI scope",
        description:
          "AI summaries, drafts, and automatic actions are not currently available.",
        cards: [
          {
            title: "Summaries",
            description:
              "AI meeting and conversation summaries are not available.",
          },
          {
            title: "Drafts",
            description:
              "AI message drafts are not available.",
          },
          {
            title: "Automatic actions",
            description:
              "AI-driven follow-up execution is not available.",
          },
        ],
      },
      {
        eyebrow: "Reliability",
        title: "Confirm operating requirements",
        description:
          "Contact us before adoption if you need specific operating commitments.",
        cards: [
          {
            title: "Backup and recovery",
            description:
              "Confirm backup frequency, retention, and recovery scope separately.",
          },
          {
            title: "Service availability",
            description:
              "Ask about applicable conditions if you require availability or response-time commitments.",
          },
          {
            title: "Contact",
            description:
              "Send account, privacy, or security questions through the public contact flow.",
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
      <FinalSection copy={{ title: copy.finalTitle }} />
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
