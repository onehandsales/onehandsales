import {
  BrainCircuit,
  Building2,
  CalendarDays,
  FileText,
  ListChecks,
  Search,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import {
  FinalSection,
  PublicContentContainer,
  PublicDocumentHero,
  PublicDocumentSection,
  PublicInfoCard,
  PublicPageSection,
  PublicSitePageShell,
  PublicTableOfContents,
} from "@/features/public-site";
import {
  getPublicSiteCopyLanguage,
  usePublicSiteLanguage,
  type PublicSiteCopyLanguage,
} from "@/features/public-site/i18n/public-site-language";

export type PublicFeatureDetailId =
  | "customers"
  | "pipeline"
  | "schedules-follow-up"
  | "activity-records"
  | "ai-sales-assistant"
  | "reports"
  | "import-export";

type FeatureDetailSectionCopy = {
  readonly bullets: readonly string[];
  readonly id: string;
  readonly paragraphs: readonly string[];
  readonly title: string;
};

type FeatureDetailCopy = {
  readonly contentsLabel: string;
  readonly ctaDescription: string;
  readonly ctaTitle: string;
  readonly description: string;
  readonly quickCards: readonly {
    readonly description: string;
    readonly title: string;
  }[];
  readonly sections: readonly FeatureDetailSectionCopy[];
  readonly title: string;
};

const quickCardIcons: readonly LucideIcon[] = [
  Building2,
  ListChecks,
  Search,
];

const sectionIcons: readonly LucideIcon[] = [
  ListChecks,
  UsersRound,
  CalendarDays,
  BrainCircuit,
];

const featureDetailCopyByLanguage: Record<
  PublicSiteCopyLanguage,
  Record<PublicFeatureDetailId, FeatureDetailCopy>
> = {
  ko: {
    customers: {
      title: "고객 관리를 한 흐름으로 정리해요.",
      description:
        "회사, 담당자, 연락처, 상담 메모를 따로 보관하지 않고 고객 맥락 안에서 이어 볼 수 있게 정리해요.",
      contentsLabel: "고객 관리 목차",
      ctaTitle: "고객 기록부터 정리해볼까요?",
      ctaDescription:
        "흩어진 연락처와 상담 메모를 OneHand의 고객 흐름으로 옮겨요.",
      quickCards: [
        {
          title: "회사와 담당자",
          description:
            "거래처와 실제 연락하는 담당자를 나눠서 관리해요.",
        },
        {
          title: "상담 맥락",
          description:
            "메모, 일정, 딜, 회의록을 고객 기록과 함께 봐요.",
        },
        {
          title: "빠른 확인",
          description:
            "다음 통화나 방문 전에 필요한 정보를 바로 찾을 수 있어요.",
        },
      ],
      sections: [
        {
          id: "company-contact",
          title: "회사와 담당자를 나눠 관리",
          paragraphs: [
            "영업에서는 회사와 담당자가 항상 같은 의미가 아니에요. 거래처는 회사로 남기고, 실제 대화하는 사람은 담당자로 관리해야 관계가 선명해져요.",
          ],
          bullets: [
            "회사에는 업종, 주소, 대표 연락처, 거래 맥락을 남겨요.",
            "담당자에는 이름, 직함, 전화번호, 이메일을 정리해요.",
            "한 회사 안의 여러 담당자를 함께 볼 수 있어요.",
          ],
        },
        {
          id: "context",
          title: "상담 기록을 고객 맥락에 연결",
          paragraphs: [
            "고객을 다시 만날 때 중요한 것은 마지막 대화와 다음 약속이에요. OneHand는 고객 기록 옆에 일정, 회의록, 딜을 연결해 이전 맥락을 다시 찾기 쉽게 해요.",
          ],
          bullets: [
            "고객별 메모와 회의록을 한곳에서 확인해요.",
            "관련 딜과 일정이 고객 상세 안에 이어져요.",
            "다음 연락 이유를 기록 안에서 바로 확인해요.",
          ],
        },
        {
          id: "field-check",
          title: "현장 전에 빠르게 확인",
          paragraphs: [
            "외근이나 통화 직전에 고객 정보를 다시 확인할 수 있어야 후속 응대가 자연스러워요.",
          ],
          bullets: [
            "최근 미팅 내용과 진행 중인 딜을 함께 확인해요.",
            "고객명, 회사명, 연락처 기준으로 빠르게 찾아요.",
            "방문 후에는 새 메모와 다음 일정을 바로 남겨요.",
          ],
        },
      ],
    },
    pipeline: {
      title: "영업 파이프라인을 다음 행동까지 이어 봐요.",
      description:
        "딜 단계, 금액, 마감일, 고객 맥락을 함께 관리해 지금 어떤 거래를 먼저 챙겨야 하는지 확인해요.",
      contentsLabel: "파이프라인 목차",
      ctaTitle: "진행 중인 딜을 정리해볼까요?",
      ctaDescription:
        "상담, 견적, 계약 전환까지 이어지는 거래 흐름을 OneHand에서 관리해요.",
      quickCards: [
        {
          title: "딜 단계",
          description:
            "상담부터 계약까지 진행 상태를 단계별로 정리해요.",
        },
        {
          title: "다음 행동",
          description:
            "각 딜에서 다음에 해야 할 연락과 일정을 함께 봐요.",
        },
        {
          title: "거래 우선순위",
          description:
            "금액, 마감일, 고객 반응을 기준으로 먼저 볼 딜을 찾아요.",
        },
      ],
      sections: [
        {
          id: "stages",
          title: "단계별로 딜 상태 확인",
          paragraphs: [
            "파이프라인은 현재 거래가 어디까지 왔는지 보여주는 기준이에요. 단계가 분명하면 지금 막힌 딜과 곧 마감되는 딜을 빠르게 구분할 수 있어요.",
          ],
          bullets: [
            "신규 상담, 제안, 견적, 계약 같은 단계를 정리해요.",
            "딜마다 금액, 마감일, 담당 고객을 함께 남겨요.",
            "진행 상태가 바뀌면 단계 변경으로 흐름을 업데이트해요.",
          ],
        },
        {
          id: "relationships",
          title: "고객, 일정, 회의록과 연결",
          paragraphs: [
            "딜은 혼자 존재하지 않아요. 어떤 고객과 연결됐고, 어떤 미팅에서 논의됐으며, 다음 일정이 무엇인지 함께 보여야 해요.",
          ],
          bullets: [
            "딜에서 관련 회사와 담당자를 바로 확인해요.",
            "회의록과 일정을 딜 맥락 안에 남겨요.",
            "제안 이후 후속 연락이 필요한 이유를 기록으로 확인해요.",
          ],
        },
        {
          id: "priority",
          title: "우선 챙길 거래 찾기",
          paragraphs: [
            "영업자는 모든 딜을 같은 강도로 볼 수 없어요. OneHand는 마감일, 다음 행동, 고객 반응을 기준으로 챙길 거래를 찾는 흐름을 돕습니다.",
          ],
          bullets: [
            "마감일이 가까운 딜을 먼저 확인해요.",
            "후속 연락이 끊긴 딜을 다시 살펴봐요.",
            "중요한 거래는 일정과 회의록을 함께 점검해요.",
          ],
        },
      ],
    },
    "schedules-follow-up": {
      title: "일정과 팔로업을 고객 맥락 안에 남겨요.",
      description:
        "방문, 통화, 재연락 일정을 고객과 딜에 연결해 미팅 이후 해야 할 일을 놓치지 않게 해요.",
      contentsLabel: "일정/팔로업 목차",
      ctaTitle: "다음 연락을 놓치지 않게 정리해볼까요?",
      ctaDescription:
        "고객 일정과 팔로업을 한 화면에서 이어 보세요.",
      quickCards: [
        {
          title: "방문과 통화",
          description:
            "현장 미팅과 전화 일정을 고객 기록과 함께 남겨요.",
        },
        {
          title: "다음 연락",
          description:
            "미팅 직후 재연락 시점과 해야 할 일을 바로 정리해요.",
        },
        {
          title: "주간 흐름",
          description:
            "이번 주 일정과 진행 중인 딜을 함께 확인해요.",
        },
      ],
      sections: [
        {
          id: "schedule",
          title: "고객과 연결된 일정",
          paragraphs: [
            "일정은 날짜와 시간만 있으면 다시 찾기 어려워요. 어떤 고객을 왜 만나는지까지 연결돼야 실제 영업 일정이 됩니다.",
          ],
          bullets: [
            "일정에 고객, 회사, 딜을 함께 연결해요.",
            "방문, 통화, 온라인 미팅 같은 목적을 구분해요.",
            "미팅 전 필요한 고객 정보를 빠르게 확인해요.",
          ],
        },
        {
          id: "follow-up",
          title: "미팅 이후 팔로업",
          paragraphs: [
            "상담이 끝난 직후 다음 행동을 남기면 후속 연락이 끊기지 않아요.",
          ],
          bullets: [
            "다음 통화나 방문 일정을 바로 추가해요.",
            "고객 요청사항과 약속한 내용을 회의록에 남겨요.",
            "딜 단계와 연결해 거래 흐름 안에서 팔로업을 봐요.",
          ],
        },
        {
          id: "weekly",
          title: "주간 일정 점검",
          paragraphs: [
            "이번 주에 어떤 고객을 만나고 어떤 딜을 챙겨야 하는지 한 번에 볼 수 있으면 하루 계획이 빨라져요.",
          ],
          bullets: [
            "주간 일정에서 고객과 딜 맥락을 함께 확인해요.",
            "누락된 후속 연락을 다시 정리해요.",
            "필요한 경우 일정 데이터를 XLSX로 내려받아요.",
          ],
        },
      ],
    },
    "activity-records": {
      title: "활동 기록으로 상담 이후를 이어 가요.",
      description:
        "회의록, 메모, 통화 후속 내용을 고객과 딜에 연결해 다음 대화에서 같은 맥락으로 이어갈 수 있게 해요.",
      contentsLabel: "활동 기록 목차",
      ctaTitle: "상담 기록을 놓치지 않게 남겨볼까요?",
      ctaDescription:
        "고객별 활동과 회의록을 OneHand에서 이어 보세요.",
      quickCards: [
        {
          title: "회의록",
          description:
            "상담 내용, 결정사항, 다음 행동을 구조화해서 남겨요.",
        },
        {
          title: "메모",
          description:
            "작은 고객 힌트와 내부 확인 사항을 기록해요.",
        },
        {
          title: "활동 흐름",
          description:
            "고객, 딜, 일정 옆에 기록이 함께 쌓여요.",
        },
      ],
      sections: [
        {
          id: "meeting-notes",
          title: "회의록을 업무 기록으로 남기기",
          paragraphs: [
            "미팅에서 나온 말은 시간이 지나면 흐려져요. 회의록은 고객 요구사항과 약속한 다음 행동을 다시 꺼내 보기 위한 기록이에요.",
          ],
          bullets: [
            "상담 배경, 요구사항, 결정사항을 나눠서 남겨요.",
            "회의록을 고객과 딜에 연결해요.",
            "다음 미팅 전에 이전 회의록을 빠르게 확인해요.",
          ],
        },
        {
          id: "memo",
          title: "고객별 메모와 내부 기록",
          paragraphs: [
            "짧은 메모도 고객 관계에서는 중요한 단서가 될 수 있어요. 연락 선호 시간, 관심 제품, 확인해야 할 이슈를 고객 기록에 남겨요.",
          ],
          bullets: [
            "고객별 메모로 작은 맥락을 잃지 않아요.",
            "제품이나 제안과 관련된 내부 확인 내용을 남겨요.",
            "사적인 메모가 필요한 경우 별도로 관리할 수 있어요.",
          ],
        },
        {
          id: "continuity",
          title: "다음 대화로 이어지는 기록",
          paragraphs: [
            "활동 기록의 목표는 많이 쓰는 것이 아니라 다음 대화를 쉽게 이어가는 것이에요.",
          ],
          bullets: [
            "미팅 후 다음 행동을 일정이나 딜에 연결해요.",
            "고객 반응과 결정 지연 이유를 남겨요.",
            "후속 연락 때 이전 맥락을 다시 확인해요.",
          ],
        },
      ],
    },
    "ai-sales-assistant": {
      title: "AI 영업 도우미로 반복 정리를 줄여요.",
      description:
        "회의록 요약, 다음 행동 초안, 팔로업 정리를 AI가 돕고 사용자가 확인한 뒤 기록으로 남기는 흐름이에요.",
      contentsLabel: "AI 영업 도우미 목차",
      ctaTitle: "반복 정리를 AI와 줄여볼까요?",
      ctaDescription:
        "중요한 판단은 직접 유지하고, 반복 기록의 시작점은 AI로 빠르게 만들어요.",
      quickCards: [
        {
          title: "요약",
          description:
            "긴 상담 내용을 읽기 쉬운 요약으로 정리해요.",
        },
        {
          title: "다음 행동",
          description:
            "미팅 이후 해야 할 팔로업 초안을 만들어요.",
        },
        {
          title: "사용자 확인",
          description:
            "AI 결과는 자동 저장이 아니라 검토 후 저장해요.",
        },
      ],
      sections: [
        {
          id: "summary",
          title: "회의록 요약",
          paragraphs: [
            "AI는 긴 회의록에서 고객 요구사항, 결정사항, 다음 행동을 정리하는 출발점을 만들 수 있어요.",
          ],
          bullets: [
            "상담 내용을 핵심 문장으로 요약해요.",
            "고객 요청과 내부 확인 사항을 구분해요.",
            "다음 미팅 전에 빠르게 다시 읽을 수 있게 정리해요.",
          ],
        },
        {
          id: "drafts",
          title: "팔로업 초안",
          paragraphs: [
            "미팅 후 바로 정리해야 하는 다음 행동은 놓치기 쉬워요. AI는 후속 연락과 업무 항목의 초안을 만드는 데 도움을 줘요.",
          ],
          bullets: [
            "연락해야 할 내용의 초안을 만들어요.",
            "해야 할 일을 고객이나 딜 맥락에 맞춰 정리해요.",
            "반복적인 기록 정리 시간을 줄여요.",
          ],
        },
        {
          id: "control",
          title: "사용자가 확인하고 저장",
          paragraphs: [
            "AI가 만든 결과는 영업자의 판단을 거쳐야 해요. OneHand는 자동 저장보다 검토 가능한 초안을 기준으로 설계해요.",
          ],
          bullets: [
            "AI 결과를 읽고 필요한 내용을 수정해요.",
            "확인한 내용만 고객 기록에 저장해요.",
            "민감한 고객 정보는 사용자가 직접 판단해요.",
          ],
        },
      ],
    },
    reports: {
      title: "리포트로 이번 주 영업 흐름을 확인해요.",
      description:
        "일정, 딜, 후속 행동, AI 요약을 리포트로 정리해 현재 영업 상태와 다음 우선순위를 확인해요.",
      contentsLabel: "리포트 목차",
      ctaTitle: "이번 주 영업 상태를 정리해볼까요?",
      ctaDescription:
        "흩어진 일정과 딜 흐름을 리포트로 확인해요.",
      quickCards: [
        {
          title: "주간 일정",
          description:
            "이번 주 고객 미팅과 방문 일정을 한 번에 확인해요.",
        },
        {
          title: "딜 점검",
          description:
            "진행 중인 거래와 마감이 가까운 딜을 살펴봐요.",
        },
        {
          title: "AI 요약",
          description:
            "중요한 흐름과 다음 행동을 요약해서 확인해요.",
        },
      ],
      sections: [
        {
          id: "weekly",
          title: "주간 영업 흐름 보기",
          paragraphs: [
            "리포트는 기록을 쌓는 것에서 끝나지 않고 이번 주에 무엇을 챙겨야 하는지 보여주는 역할을 해요.",
          ],
          bullets: [
            "주간 일정과 고객 미팅을 함께 확인해요.",
            "진행 중인 딜과 연결된 일정을 살펴봐요.",
            "누락된 후속 행동을 다시 찾는 데 사용해요.",
          ],
        },
        {
          id: "deal-review",
          title: "딜과 후속 행동 점검",
          paragraphs: [
            "영업 리포트는 어떤 딜이 멈췄는지, 어떤 고객에게 연락해야 하는지 확인하는 기준이 돼요.",
          ],
          bullets: [
            "마감일이 가까운 딜을 먼저 확인해요.",
            "연락이 끊긴 고객과 거래를 다시 살펴봐요.",
            "필요한 경우 다음 일정을 바로 정리해요.",
          ],
        },
        {
          id: "export",
          title: "공유와 다운로드",
          paragraphs: [
            "리포트는 개인 점검뿐 아니라 팀 공유나 월간 검토에도 사용할 수 있어요.",
          ],
          bullets: [
            "필요한 일정 데이터를 XLSX로 내려받아요.",
            "AI 리포트로 핵심 흐름을 빠르게 확인해요.",
            "반복 검토에 필요한 기록을 한곳에 모아요.",
          ],
        },
      ],
    },
    "import-export": {
      title: "엑셀 가져오기와 내보내기로 데이터를 옮겨요.",
      description:
        "기존 엑셀 고객 데이터를 OneHand로 가져오고, 필요한 업무 기록은 XLSX로 내려받아 검토와 백업에 활용해요.",
      contentsLabel: "엑셀 데이터 목차",
      ctaTitle: "기존 데이터를 OneHand로 옮겨볼까요?",
      ctaDescription:
        "엑셀에 흩어진 고객, 담당자, 딜 기록을 정리해요.",
      quickCards: [
        {
          title: "가져오기",
          description:
            "회사, 담당자, 딜 데이터를 엑셀에서 가져와요.",
        },
        {
          title: "검토",
          description:
            "저장 전에 누락된 값과 잘못된 값을 확인해요.",
        },
        {
          title: "내보내기",
          description:
            "필요한 업무 데이터를 XLSX로 내려받아요.",
        },
      ],
      sections: [
        {
          id: "prepare",
          title: "엑셀 데이터 준비",
          paragraphs: [
            "가져오기 전에 엑셀 컬럼이 OneHand의 필드와 잘 맞는지 확인하면 저장 이후 정리 시간이 줄어들어요.",
          ],
          bullets: [
            "회사명, 담당자명, 연락처 같은 기본 컬럼을 정리해요.",
            "딜 단계나 금액처럼 필요한 업무 컬럼을 분리해요.",
            "중복 고객과 비어 있는 값을 미리 확인해요.",
          ],
        },
        {
          id: "review",
          title: "가져오기 전 검토",
          paragraphs: [
            "데이터는 바로 저장하기보다 검토 단계를 거치는 것이 좋아요. 잘못된 값이 들어가면 고객 기록 전체의 신뢰도가 낮아질 수 있어요.",
          ],
          bullets: [
            "매칭된 필드와 누락된 값을 확인해요.",
            "수정이 필요한 행을 저장 전에 정리해요.",
            "검토가 끝난 데이터만 OneHand 기록으로 만들어요.",
          ],
        },
        {
          id: "export",
          title: "필요한 데이터 내보내기",
          paragraphs: [
            "내보내기는 백업, 월간 검토, 다른 도구와의 이전 작업에 사용할 수 있어요.",
          ],
          bullets: [
            "필요한 고객이나 업무 데이터를 XLSX로 내려받아요.",
            "팀 공유나 월간 보고에 맞춰 데이터를 활용해요.",
            "중요한 기록은 정기적으로 검토하고 보관해요.",
          ],
        },
      ],
    },
  },
  "en-US": {
    customers: {
      title: "Customer management that keeps context together.",
      description:
        "Keep companies, contacts, phone numbers, and consultation notes connected around the customer instead of scattering them across tools.",
      contentsLabel: "Customer management guide",
      ctaTitle: "Ready to organize customer records?",
      ctaDescription:
        "Bring scattered contacts and notes into a OneHand customer workflow.",
      quickCards: [
        {
          title: "Companies and contacts",
          description:
            "Manage accounts and the people you actually talk to separately.",
        },
        {
          title: "Sales context",
          description:
            "See notes, schedules, deals, and meeting records beside the customer.",
        },
        {
          title: "Fast review",
          description:
            "Find what you need before the next call or visit.",
        },
      ],
      sections: [
        {
          id: "company-contact",
          title: "Separate companies and contacts",
          paragraphs: [
            "In sales, a company and a contact are not the same thing. Keep the account as the company and manage real conversations through contacts.",
          ],
          bullets: [
            "Store industry, address, main phone, and relationship context on companies.",
            "Store name, title, phone, and email on contacts.",
            "Review multiple contacts under the same company.",
          ],
        },
        {
          id: "context",
          title: "Connect notes to customer context",
          paragraphs: [
            "The important thing before the next customer touch is the last conversation and the next promise. OneHand keeps schedules, meeting notes, and deals near the customer record.",
          ],
          bullets: [
            "Review customer notes and meeting records in one place.",
            "See related deals and schedules from customer detail.",
            "Find the reason for the next follow-up inside the record.",
          ],
        },
        {
          id: "field-check",
          title: "Check details before field work",
          paragraphs: [
            "Customer information should be easy to reopen before a visit or call, so follow-up can continue naturally.",
          ],
          bullets: [
            "Review recent meetings and active deals together.",
            "Search by customer, company, or contact detail.",
            "Add new notes and the next schedule after the visit.",
          ],
        },
      ],
    },
    pipeline: {
      title: "A sales pipeline connected to next actions.",
      description:
        "Track deal stages, value, due dates, and customer context so you know which opportunities need attention first.",
      contentsLabel: "Pipeline guide",
      ctaTitle: "Ready to organize active deals?",
      ctaDescription:
        "Manage the flow from consultation to proposal and close in OneHand.",
      quickCards: [
        {
          title: "Deal stages",
          description:
            "Track progress from first consultation to contract.",
        },
        {
          title: "Next actions",
          description:
            "Keep follow-up and schedules beside each deal.",
        },
        {
          title: "Priority",
          description:
            "Use value, due dates, and customer reaction to choose what to review first.",
        },
      ],
      sections: [
        {
          id: "stages",
          title: "Review deal status by stage",
          paragraphs: [
            "A pipeline is the shared view of where each opportunity stands. Clear stages make blocked and soon-to-close deals easier to spot.",
          ],
          bullets: [
            "Track stages such as new consultation, proposal, quote, and contract.",
            "Keep value, due date, and customer on each deal.",
            "Update the stage as the opportunity moves.",
          ],
        },
        {
          id: "relationships",
          title: "Connect customers, schedules, and notes",
          paragraphs: [
            "A deal does not stand alone. It needs the related customer, meeting history, and next schedule to make sense.",
          ],
          bullets: [
            "Open related companies and contacts from the deal.",
            "Keep meeting notes and schedules in deal context.",
            "Review why follow-up is needed after a proposal.",
          ],
        },
        {
          id: "priority",
          title: "Find the deals that need attention",
          paragraphs: [
            "Salespeople cannot review every deal with the same intensity. OneHand helps identify work by due dates, next actions, and customer response.",
          ],
          bullets: [
            "Check deals with approaching due dates first.",
            "Revisit deals where follow-up has gone quiet.",
            "Review schedules and notes for important opportunities.",
          ],
        },
      ],
    },
    "schedules-follow-up": {
      title: "Schedules and follow-up in customer context.",
      description:
        "Connect visits, calls, and next contact timing to customers and deals so post-meeting work is not missed.",
      contentsLabel: "Schedule and follow-up guide",
      ctaTitle: "Ready to protect the next follow-up?",
      ctaDescription:
        "Keep customer schedules and follow-up in one workflow.",
      quickCards: [
        {
          title: "Visits and calls",
          description:
            "Save field meetings and calls beside customer records.",
        },
        {
          title: "Next contact",
          description:
            "Add the next touch and task right after the meeting.",
        },
        {
          title: "Weekly flow",
          description:
            "Review this week's schedules and active deals together.",
        },
      ],
      sections: [
        {
          id: "schedule",
          title: "Schedules connected to customers",
          paragraphs: [
            "A schedule with only date and time is hard to use later. It needs the customer and reason for the meeting.",
          ],
          bullets: [
            "Connect schedules to customers, companies, and deals.",
            "Classify visits, calls, and online meetings by purpose.",
            "Review customer information before the meeting.",
          ],
        },
        {
          id: "follow-up",
          title: "Follow-up after meetings",
          paragraphs: [
            "Adding the next action right after a consultation helps keep follow-up from breaking.",
          ],
          bullets: [
            "Add the next call or visit timing immediately.",
            "Record customer requests and promises in meeting notes.",
            "Connect follow-up to the deal stage.",
          ],
        },
        {
          id: "weekly",
          title: "Weekly schedule review",
          paragraphs: [
            "Seeing who you meet this week and which deals are attached makes daily planning faster.",
          ],
          bullets: [
            "Review customer and deal context in the weekly schedule.",
            "Find missing follow-up and add it back.",
            "Export schedule data as XLSX when needed.",
          ],
        },
      ],
    },
    "activity-records": {
      title: "Activity records that carry work forward.",
      description:
        "Connect meeting notes, memos, and follow-up details to customers and deals so the next conversation starts from the same context.",
      contentsLabel: "Activity records guide",
      ctaTitle: "Ready to keep consultation records organized?",
      ctaDescription:
        "Keep customer activities and meeting notes connected in OneHand.",
      quickCards: [
        {
          title: "Meeting notes",
          description:
            "Capture consultation details, decisions, and next actions.",
        },
        {
          title: "Memos",
          description:
            "Save small customer signals and internal checks.",
        },
        {
          title: "Activity flow",
          description:
            "Keep records beside customers, deals, and schedules.",
        },
      ],
      sections: [
        {
          id: "meeting-notes",
          title: "Turn meeting notes into work records",
          paragraphs: [
            "Meeting details fade quickly. Notes help you reopen customer requirements and promised next actions.",
          ],
          bullets: [
            "Separate background, requirements, and decisions.",
            "Connect meeting notes to customers and deals.",
            "Review previous notes before the next meeting.",
          ],
        },
        {
          id: "memo",
          title: "Customer memos and internal notes",
          paragraphs: [
            "Short notes can become important relationship context, such as preferred contact time, product interest, or an issue to confirm.",
          ],
          bullets: [
            "Keep small context by customer.",
            "Record internal checks related to products or proposals.",
            "Use private memo flows when a note needs separation.",
          ],
        },
        {
          id: "continuity",
          title: "Records that support the next conversation",
          paragraphs: [
            "The goal is not writing more. The goal is making the next conversation easier to continue.",
          ],
          bullets: [
            "Connect next actions to schedules or deals.",
            "Record customer reactions and reasons for delay.",
            "Review past context during follow-up.",
          ],
        },
      ],
    },
    "ai-sales-assistant": {
      title: "An AI sales assistant for reducing repetitive cleanup.",
      description:
        "AI helps summarize meeting notes, draft next actions, and organize follow-up while users review before saving.",
      contentsLabel: "AI sales assistant guide",
      ctaTitle: "Ready to reduce repetitive cleanup with AI?",
      ctaDescription:
        "Keep important judgment with the seller and let AI create faster starting points.",
      quickCards: [
        {
          title: "Summaries",
          description:
            "Turn long consultation notes into easier summaries.",
        },
        {
          title: "Next actions",
          description:
            "Draft follow-up tasks after each meeting.",
        },
        {
          title: "User review",
          description:
            "AI output is reviewed before it becomes a record.",
        },
      ],
      sections: [
        {
          id: "summary",
          title: "Meeting note summaries",
          paragraphs: [
            "AI can create a starting point by pulling out customer requirements, decisions, and next actions from longer notes.",
          ],
          bullets: [
            "Summarize consultation details into key points.",
            "Separate customer requests from internal checks.",
            "Make notes easier to review before the next meeting.",
          ],
        },
        {
          id: "drafts",
          title: "Follow-up drafts",
          paragraphs: [
            "Next actions are easy to miss after a meeting. AI can help draft follow-up and task cleanup.",
          ],
          bullets: [
            "Draft what needs to be sent or checked next.",
            "Organize tasks using customer and deal context.",
            "Reduce time spent rewriting repetitive records.",
          ],
        },
        {
          id: "control",
          title: "Review and save under user control",
          paragraphs: [
            "AI output should pass through seller judgment. OneHand is designed around reviewable drafts rather than automatic saving.",
          ],
          bullets: [
            "Read and edit AI output before saving.",
            "Save only confirmed content to customer records.",
            "Let users make the final call on sensitive customer information.",
          ],
        },
      ],
    },
    reports: {
      title: "Reports for reviewing the week's sales flow.",
      description:
        "Use reports to review schedules, deals, follow-up, and AI summaries so current status and next priorities are easier to see.",
      contentsLabel: "Reports guide",
      ctaTitle: "Ready to review this week's sales flow?",
      ctaDescription:
        "Turn scattered schedules and deal movement into a clearer report.",
      quickCards: [
        {
          title: "Weekly schedules",
          description:
            "Review this week's customer meetings and visits together.",
        },
        {
          title: "Deal review",
          description:
            "Check active opportunities and deals close to due dates.",
        },
        {
          title: "AI summary",
          description:
            "Review key movement and next actions in a summary.",
        },
      ],
      sections: [
        {
          id: "weekly",
          title: "Review the weekly sales flow",
          paragraphs: [
            "Reports should not stop at showing records. They should clarify what needs attention this week.",
          ],
          bullets: [
            "Review weekly schedules and customer meetings.",
            "Check schedules connected to active deals.",
            "Use reports to find missing follow-up.",
          ],
        },
        {
          id: "deal-review",
          title: "Check deals and next actions",
          paragraphs: [
            "Sales reports help identify stalled deals and customers who need another touch.",
          ],
          bullets: [
            "Review deals with approaching due dates.",
            "Find customers where contact has gone quiet.",
            "Add the next schedule when needed.",
          ],
        },
        {
          id: "export",
          title: "Share and download",
          paragraphs: [
            "Reports can support personal review, team sharing, or monthly check-ins.",
          ],
          bullets: [
            "Download schedule data as XLSX when needed.",
            "Use AI reports to review key movement quickly.",
            "Keep records for repeated review in one place.",
          ],
        },
      ],
    },
    "import-export": {
      title: "Import and export Excel data without losing control.",
      description:
        "Bring existing customer spreadsheets into OneHand and export work records as XLSX for review, backup, or migration.",
      contentsLabel: "Excel data guide",
      ctaTitle: "Ready to move existing data into OneHand?",
      ctaDescription:
        "Organize customer, contact, and deal records that currently live in spreadsheets.",
      quickCards: [
        {
          title: "Import",
          description:
            "Bring company, contact, and deal data from Excel.",
        },
        {
          title: "Review",
          description:
            "Check missing or invalid values before saving.",
        },
        {
          title: "Export",
          description:
            "Download needed work records as XLSX.",
        },
      ],
      sections: [
        {
          id: "prepare",
          title: "Prepare spreadsheet data",
          paragraphs: [
            "Before import, make sure spreadsheet columns map cleanly to OneHand fields. This reduces cleanup after saving.",
          ],
          bullets: [
            "Prepare basic columns such as company, contact, and phone.",
            "Separate work columns such as deal stage and value.",
            "Review duplicate customers and empty values first.",
          ],
        },
        {
          id: "review",
          title: "Review before import",
          paragraphs: [
            "Data should be checked before it becomes a record. Bad values can reduce trust in the customer database.",
          ],
          bullets: [
            "Check matched fields and missing values.",
            "Clean rows that need edits before saving.",
            "Save only reviewed data into OneHand records.",
          ],
        },
        {
          id: "export",
          title: "Export the data you need",
          paragraphs: [
            "Export can support backup, monthly review, or migration to another workflow.",
          ],
          bullets: [
            "Download customer or work data as XLSX.",
            "Use exported records for team sharing or monthly reporting.",
            "Review and archive important records regularly.",
          ],
        },
      ],
    },
  },
};

export function FeatureDetailPage({
  featureId,
}: {
  readonly featureId: PublicFeatureDetailId;
}) {
  const { language } = usePublicSiteLanguage();
  const copy =
    featureDetailCopyByLanguage[getPublicSiteCopyLanguage(language)][featureId];
  const tocItems = copy.sections.map((section) => ({
    id: section.id,
    title: section.title,
  }));

  return (
    <PublicSitePageShell>
      <PublicPageSection>
        <PublicContentContainer>
          <PublicDocumentHero title={copy.title} />

          <div className="mt-16">
            <p className="max-w-[720px] break-keep text-[15px] leading-7 text-[#555550]">
              {copy.description}
            </p>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {copy.quickCards.map((card, index) => {
                const Icon = quickCardIcons[index] ?? ListChecks;

                return (
                  <PublicInfoCard
                    description={card.description}
                    icon={Icon}
                    key={card.title}
                    title={card.title}
                  />
                );
              })}
            </div>
          </div>

          <PublicTableOfContents
            className="mt-12"
            items={tocItems}
            label={copy.contentsLabel}
          />

          <div className="mt-12 grid gap-12">
            {copy.sections.map((section, index) => {
              const Icon = sectionIcons[index] ?? FileText;

              return (
                <PublicDocumentSection
                  bullets={section.bullets}
                  id={section.id}
                  key={section.id}
                  paragraphs={section.paragraphs}
                  title={
                    <span className="inline-flex items-start gap-3">
                      <Icon className="mt-1 h-5 w-5 shrink-0 text-[#0075DE]" />
                      <span>{section.title}</span>
                    </span>
                  }
                />
              );
            })}
          </div>
        </PublicContentContainer>
      </PublicPageSection>
      <FinalSection
        copy={{
          description: copy.ctaDescription,
          title: copy.ctaTitle,
        }}
      />
    </PublicSitePageShell>
  );
}
