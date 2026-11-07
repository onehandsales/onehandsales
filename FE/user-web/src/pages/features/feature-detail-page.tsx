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
      title: "고객 정보를 남기고, 필요할 때 다시 찾아요.",
      description:
        "고객 정보를 기록하고, 변경된 내용은 목록에서 바로 수정해요.",
      contentsLabel: "고객 정보 관리 목차",
      ctaTitle: "첫 고객 기록을 남겨볼까요?",
      ctaDescription:
        "현재 제공 범위를 확인하고, 내 업무에 맞는 활용 방법을 살펴보세요.",
      quickCards: [
        {
          title: "고객 기록 추가",
          description:
            "관리할 고객을 추가하고, 화면에 마련된 정보 칸을 채워요.",
        },
        {
          title: "정보 수정",
          description:
            "바뀐 정보를 확인하면 현재 목록에서 내용을 고쳐요.",
        },
        {
          title: "필요한 고객 찾기",
          description:
            "현재 고객 목록에서 검색하고 자주 보는 화면을 즐겨찾기에 모아둬요.",
        },
      ],
      sections: [
        {
          id: "company-contact",
          title: "고객 기록 추가",
          paragraphs: [
            "관리할 고객을 추가하고, 화면에 마련된 정보 칸을 채워요.",
          ],
          bullets: [
            "고객을 기록으로 추가해요.",
            "지원하는 정보 칸에 내용을 입력해요.",
            "등록한 기록을 목록에서 확인해요.",
          ],
        },
        {
          id: "context",
          title: "정보 수정",
          paragraphs: [
            "바뀐 정보를 확인하면 현재 목록에서 내용을 고쳐요.",
          ],
          bullets: [
            "수정할 기록을 찾아요.",
            "편집 가능한 셀의 값을 고쳐요.",
            "저장 결과를 확인해요.",
          ],
        },
        {
          id: "field-check",
          title: "필요한 고객 찾기",
          paragraphs: [
            "현재 고객 목록에서 검색하고 자주 보는 화면을 즐겨찾기에 모아둬요.",
          ],
          bullets: [
            "현재 목록 안에서 검색해요.",
            "필요한 보기를 선택해요.",
            "즐겨찾기로 자주 보는 화면을 열어요.",
          ],
        },
      ],
    },
    pipeline: {
      title: "진행 중인 기록을 상태별로 살펴봐요.",
      description:
        "이용 가능한 테이블과 칸반 보기에서 기록의 현재 상태를 확인해요.",
      contentsLabel: "진행 상태 보기 목차",
      ctaTitle: "내 기록을 보기 편한 화면에서 확인해요.",
      ctaDescription:
        "현재 제공 범위를 확인하고, 내 업무에 맞는 활용 방법을 살펴보세요.",
      quickCards: [
        {
          title: "테이블로 확인",
          description:
            "테이블에서 여러 기록과 정보를 함께 살펴봐요.",
        },
        {
          title: "상태별로 보기",
          description:
            "칸반 보기가 마련된 목록에서는 같은 상태의 기록을 모아서 확인해요.",
        },
        {
          title: "현재 제공 범위",
          description:
            "조회 기능과 아직 제공하지 않는 자동화 기능을 구분해 안내해요.",
        },
      ],
      sections: [
        {
          id: "stages",
          title: "테이블로 확인",
          paragraphs: [
            "테이블에서 여러 기록과 정보를 함께 살펴봐요.",
          ],
          bullets: [
            "목록에서 기록을 확인해요.",
            "수정 가능한 정보는 셀에서 고쳐요.",
            "필요한 기록을 검색해요.",
          ],
        },
        {
          id: "relationships",
          title: "상태별로 보기",
          paragraphs: [
            "칸반 보기가 마련된 목록에서는 같은 상태의 기록을 모아서 확인해요.",
          ],
          bullets: [
            "저장된 칸반 보기를 선택해요.",
            "상태별로 모인 기록을 살펴봐요.",
            "보기 방식은 선택한 목록에 따라 달라요.",
          ],
        },
        {
          id: "priority",
          title: "현재 제공 범위",
          paragraphs: [
            "조회 기능과 아직 제공하지 않는 자동화 기능을 구분해 안내해요.",
          ],
          bullets: [
            "카드 드래그로 단계 변경은 현재 제공하지 않아요.",
            "자동 우선순위 선정은 현재 제공하지 않아요.",
            "후속 행동 자동화는 현재 제공하지 않아요.",
          ],
        },
      ],
    },
    "schedules-follow-up": {
      title: "일정·팔로업 제공 범위를 확인해요.",
      description:
        "전용 캘린더, 일정 알림, 자동 후속 연락은 현재 제공하지 않아요.",
      contentsLabel: "일정·팔로업 안내 목차",
      ctaTitle: "현재 제공하는 기록 관리부터 살펴봐요.",
      ctaDescription:
        "현재 제공 범위를 확인하고, 내 업무에 맞는 활용 방법을 살펴보세요.",
      quickCards: [
        {
          title: "일정 관리 안내",
          description:
            "현재 전용 캘린더와 외부 캘린더 연결을 제공하지 않아요.",
        },
        {
          title: "팔로업 안내",
          description:
            "자동 연락과 연락 시점 알림은 현재 제공하지 않아요.",
        },
        {
          title: "지금 가능한 일",
          description:
            "현재는 고객과 업무 정보의 기록·수정·조회를 중심으로 제공해요.",
        },
      ],
      sections: [
        {
          id: "schedule",
          title: "일정 관리 안내",
          paragraphs: [
            "현재 전용 캘린더와 외부 캘린더 연결을 제공하지 않아요.",
          ],
          bullets: [
            "전용 일정 화면은 미제공이에요.",
            "외부 캘린더 연동은 미제공이에요.",
            "일정 기능의 공개 시점은 미정이에요.",
          ],
        },
        {
          id: "follow-up",
          title: "팔로업 안내",
          paragraphs: [
            "자동 연락과 연락 시점 알림은 현재 제공하지 않아요.",
          ],
          bullets: [
            "자동 메시지 발송은 미제공이에요.",
            "후속 연락 알림은 미제공이에요.",
            "자동 업무 실행은 미제공이에요.",
          ],
        },
        {
          id: "weekly",
          title: "지금 가능한 일",
          paragraphs: [
            "현재는 고객과 업무 정보의 기록·수정·조회를 중심으로 제공해요.",
          ],
          bullets: [
            "고객과 업무 정보를 기록해요.",
            "목록에서 정보를 수정해요.",
            "현재 목록의 기록을 검색해요.",
          ],
        },
      ],
    },
    "activity-records": {
      title: "업무에서 확인한 내용을 기록으로 남겨요.",
      description:
        "필요한 정보를 입력하고 수정하며, 다음에 다시 확인할 기록을 관리해요.",
      contentsLabel: "업무 기록 관리 목차",
      ctaTitle: "다음에 다시 볼 기록을 남겨볼까요?",
      ctaDescription:
        "현재 제공 범위를 확인하고, 내 업무에 맞는 활용 방법을 살펴보세요.",
      quickCards: [
        {
          title: "기록 추가",
          description:
            "관리할 항목에 기록을 추가하고 지원하는 정보 칸을 채워요.",
        },
        {
          title: "내용 수정",
          description:
            "업무에서 새롭게 확인한 내용은 목록에서 수정해요.",
        },
        {
          title: "현재 제공 범위",
          description:
            "기본 기록 관리와 전용 미팅·활동 기능은 구분돼요.",
        },
      ],
      sections: [
        {
          id: "meeting-notes",
          title: "기록 추가",
          paragraphs: [
            "관리할 항목에 기록을 추가하고 지원하는 정보 칸을 채워요.",
          ],
          bullets: [
            "관리할 항목을 선택해요.",
            "새 기록을 추가해요.",
            "화면에 있는 정보 칸을 채워요.",
          ],
        },
        {
          id: "memo",
          title: "내용 수정",
          paragraphs: [
            "업무에서 새롭게 확인한 내용은 목록에서 수정해요.",
          ],
          bullets: [
            "필요한 기록을 찾아요.",
            "편집 가능한 내용을 고쳐요.",
            "현재 정보로 기록을 관리해요.",
          ],
        },
        {
          id: "continuity",
          title: "현재 제공 범위",
          paragraphs: [
            "기본 기록 관리와 전용 미팅·활동 기능은 구분돼요.",
          ],
          bullets: [
            "기록 입력·수정·조회는 가능해요.",
            "전용 미팅 노트와 통화 녹음은 미제공이에요.",
            "자동 활동 타임라인은 미제공이에요.",
          ],
        },
      ],
    },
    "ai-sales-assistant": {
      title: "AI 기능의 현재 제공 상태를 안내해요.",
      description:
        "AI 요약, 메시지 초안, 다음 행동 추천은 현재 제공 기능에 포함되지 않아요.",
      contentsLabel: "AI 기능 안내 목차",
      ctaTitle: "현재 제품의 기록 관리 기능을 살펴봐요.",
      ctaDescription:
        "현재 제공 범위를 확인하고, 내 업무에 맞는 활용 방법을 살펴보세요.",
      quickCards: [
        {
          title: "요약과 초안",
          description:
            "상담 내용을 AI가 요약하거나 메시지 초안을 만드는 기능은 현재 제공하지 않아요.",
        },
        {
          title: "추천과 자동 실행",
          description:
            "AI가 고객 우선순위를 정하거나 후속 업무를 자동 실행하지 않아요.",
        },
        {
          title: "지금 가능한 일",
          description:
            "정보를 직접 기록하고 수정하며, 검색과 보기로 확인할 수 있어요.",
        },
      ],
      sections: [
        {
          id: "summary",
          title: "요약과 초안",
          paragraphs: [
            "상담 내용을 AI가 요약하거나 메시지 초안을 만드는 기능은 현재 제공하지 않아요.",
          ],
          bullets: [
            "회의 요약은 미제공이에요.",
            "상담 요약은 미제공이에요.",
            "메시지 초안 작성은 미제공이에요.",
          ],
        },
        {
          id: "drafts",
          title: "추천과 자동 실행",
          paragraphs: [
            "AI가 고객 우선순위를 정하거나 후속 업무를 자동 실행하지 않아요.",
          ],
          bullets: [
            "자동 우선순위 선정은 미제공이에요.",
            "다음 행동 추천은 미제공이에요.",
            "자동 후속 연락은 미제공이에요.",
          ],
        },
        {
          id: "control",
          title: "지금 가능한 일",
          paragraphs: [
            "정보를 직접 기록하고 수정하며, 검색과 보기로 확인할 수 있어요.",
          ],
          bullets: [
            "기록을 직접 입력해요.",
            "목록에서 정보를 수정해요.",
            "AI 기능 공개 시점은 미정이에요.",
          ],
        },
      ],
    },
    reports: {
      title: "리포트의 현재 제공 범위를 안내해요.",
      description:
        "자동 분석 대시보드, 주간 리포트, 리포트 다운로드는 현재 제공하지 않아요.",
      contentsLabel: "리포트 기능 안내 목차",
      ctaTitle: "등록한 기록부터 확인해 보세요.",
      ctaDescription:
        "현재 제공 범위를 확인하고, 내 업무에 맞는 활용 방법을 살펴보세요.",
      quickCards: [
        {
          title: "기록 조회",
          description:
            "테이블과 이용 가능한 보기에서 등록한 기록을 확인할 수 있어요.",
        },
        {
          title: "분석 리포트 안내",
          description:
            "자동 집계와 성과 분석 리포트는 현재 제공하지 않아요.",
        },
        {
          title: "공유와 다운로드 안내",
          description:
            "리포트 자동 발송과 파일 다운로드는 현재 제공 범위에 포함되지 않아요.",
        },
      ],
      sections: [
        {
          id: "weekly",
          title: "기록 조회",
          paragraphs: [
            "테이블과 이용 가능한 보기에서 등록한 기록을 확인할 수 있어요.",
          ],
          bullets: [
            "현재 목록의 기록을 확인해요.",
            "이용 가능한 보기로 전환해요.",
            "목록 안에서 검색해요.",
          ],
        },
        {
          id: "deal-review",
          title: "분석 리포트 안내",
          paragraphs: [
            "자동 집계와 성과 분석 리포트는 현재 제공하지 않아요.",
          ],
          bullets: [
            "매출 예측은 미제공이에요.",
            "전환율 분석은 미제공이에요.",
            "주간 보고서 자동 생성은 미제공이에요.",
          ],
        },
        {
          id: "export",
          title: "공유와 다운로드 안내",
          paragraphs: [
            "리포트 자동 발송과 파일 다운로드는 현재 제공 범위에 포함되지 않아요.",
          ],
          bullets: [
            "리포트 자동 발송은 미제공이에요.",
            "리포트 다운로드는 미제공이에요.",
            "리포트 기능 공개 시점은 미정이에요.",
          ],
        },
      ],
    },
  },
  "en-US": {
    customers: {
      title: "Keep customer details ready to find again.",
      description:
        "Record customer information and update supported details directly in the table.",
      contentsLabel: "Customer records",
      ctaTitle: "Start with your first customer record.",
      ctaDescription:
        "Check the current feature scope and explore how it fits your work.",
      quickCards: [
        {
          title: "Add customer records",
          description:
            "Add a customer and fill in the information available on screen.",
        },
        {
          title: "Update information",
          description:
            "Edit changed information in the collection you are viewing.",
        },
        {
          title: "Find a customer",
          description:
            "Search the current customer collection and save frequently used views as favorites.",
        },
      ],
      sections: [
        {
          id: "company-contact",
          title: "Add customer records",
          paragraphs: [
            "Add a customer and fill in the information available on screen.",
          ],
          bullets: [
            "Add the customers you manage.",
            "Fill in the supported information fields.",
            "Review saved records in the table.",
          ],
        },
        {
          id: "context",
          title: "Update information",
          paragraphs: [
            "Edit changed information in the collection you are viewing.",
          ],
          bullets: [
            "Find the record you need.",
            "Update an editable cell.",
            "Check the save result.",
          ],
        },
        {
          id: "field-check",
          title: "Find a customer",
          paragraphs: [
            "Search the current customer collection and save frequently used views as favorites.",
          ],
          bullets: [
            "Search within the current collection.",
            "Choose an available view.",
            "Open frequently used views from favorites.",
          ],
        },
      ],
    },
    pipeline: {
      title: "Review records by their current status.",
      description:
        "See records in available table and board views.",
      contentsLabel: "Progress views",
      ctaTitle: "Review your records in an available view.",
      ctaDescription:
        "Check the current feature scope and explore how it fits your work.",
      quickCards: [
        {
          title: "Review the table",
          description:
            "See multiple records and their information together.",
        },
        {
          title: "Review by status",
          description:
            "When a board view is available, see records grouped by status.",
        },
        {
          title: "Current scope",
          description:
            "Record viewing is separate from automation that is not available today.",
        },
      ],
      sections: [
        {
          id: "stages",
          title: "Review the table",
          paragraphs: [
            "See multiple records and their information together.",
          ],
          bullets: [
            "Review records in the collection.",
            "Edit supported values in the table.",
            "Search for a record.",
          ],
        },
        {
          id: "relationships",
          title: "Review by status",
          paragraphs: [
            "When a board view is available, see records grouped by status.",
          ],
          bullets: [
            "Choose a saved board view.",
            "Review records in each status.",
            "Available views depend on the collection.",
          ],
        },
        {
          id: "priority",
          title: "Current scope",
          paragraphs: [
            "Record viewing is separate from automation that is not available today.",
          ],
          bullets: [
            "Dragging cards between stages is not available.",
            "Automatic prioritization is not available.",
            "Follow-up automation is not available.",
          ],
        },
      ],
    },
    "schedules-follow-up": {
      title: "Schedule and follow-up availability.",
      description:
        "A dedicated calendar, reminders, and automatic follow-up are not currently available.",
      contentsLabel: "Schedule availability",
      ctaTitle: "Explore the record management available today.",
      ctaDescription:
        "Check the current feature scope and explore how it fits your work.",
      quickCards: [
        {
          title: "Calendar availability",
          description:
            "A dedicated calendar and external calendar connections are not currently available.",
        },
        {
          title: "Follow-up availability",
          description:
            "Automatic contact and reminders about when to follow up are not currently available.",
        },
        {
          title: "What you can do today",
          description:
            "Current features focus on recording, updating, and viewing customer and work information.",
        },
      ],
      sections: [
        {
          id: "schedule",
          title: "Calendar availability",
          paragraphs: [
            "A dedicated calendar and external calendar connections are not currently available.",
          ],
          bullets: [
            "No dedicated calendar view.",
            "No external calendar sync.",
            "No confirmed calendar release date.",
          ],
        },
        {
          id: "follow-up",
          title: "Follow-up availability",
          paragraphs: [
            "Automatic contact and reminders about when to follow up are not currently available.",
          ],
          bullets: [
            "No automatic message sending.",
            "No follow-up reminders.",
            "No automatic task execution.",
          ],
        },
        {
          id: "weekly",
          title: "What you can do today",
          paragraphs: [
            "Current features focus on recording, updating, and viewing customer and work information.",
          ],
          bullets: [
            "Add customer and work records.",
            "Update information in a table.",
            "Search the current collection.",
          ],
        },
      ],
    },
    "activity-records": {
      title: "Keep the information your work depends on.",
      description:
        "Add and update information so you can return to it when you need it.",
      contentsLabel: "Work records",
      ctaTitle: "Keep a record for your next conversation.",
      ctaDescription:
        "Check the current feature scope and explore how it fits your work.",
      quickCards: [
        {
          title: "Add a record",
          description:
            "Choose a collection and fill in the supported information fields.",
        },
        {
          title: "Update information",
          description:
            "Update supported details in the table as your work progresses.",
        },
        {
          title: "Current scope",
          description:
            "Basic record management is separate from dedicated meeting and activity features.",
        },
      ],
      sections: [
        {
          id: "meeting-notes",
          title: "Add a record",
          paragraphs: [
            "Choose a collection and fill in the supported information fields.",
          ],
          bullets: [
            "Choose what you manage.",
            "Add a record.",
            "Fill in the fields available on screen.",
          ],
        },
        {
          id: "memo",
          title: "Update information",
          paragraphs: [
            "Update supported details in the table as your work progresses.",
          ],
          bullets: [
            "Find the record you need.",
            "Edit supported information.",
            "Keep your records up to date.",
          ],
        },
        {
          id: "continuity",
          title: "Current scope",
          paragraphs: [
            "Basic record management is separate from dedicated meeting and activity features.",
          ],
          bullets: [
            "Record creation, editing, and viewing are available.",
            "Dedicated meeting notes and call recording are not available.",
            "An automatic activity timeline is not available.",
          ],
        },
      ],
    },
    "ai-sales-assistant": {
      title: "Current availability of AI features.",
      description:
        "AI summaries, message drafts, and next-action recommendations are not currently available.",
      contentsLabel: "AI availability",
      ctaTitle: "Explore the record management available today.",
      ctaDescription:
        "Check the current feature scope and explore how it fits your work.",
      quickCards: [
        {
          title: "Summaries and drafts",
          description:
            "AI conversation summaries and message drafts are not currently available.",
        },
        {
          title: "Recommendations and actions",
          description:
            "AI does not currently prioritize customers or execute follow-up work.",
        },
        {
          title: "What you can do today",
          description:
            "Enter and edit information yourself, then use search and available views to review it.",
        },
      ],
      sections: [
        {
          id: "summary",
          title: "Summaries and drafts",
          paragraphs: [
            "AI conversation summaries and message drafts are not currently available.",
          ],
          bullets: [
            "No AI meeting summaries.",
            "No AI consultation summaries.",
            "No AI message drafts.",
          ],
        },
        {
          id: "drafts",
          title: "Recommendations and actions",
          paragraphs: [
            "AI does not currently prioritize customers or execute follow-up work.",
          ],
          bullets: [
            "No automatic prioritization.",
            "No next-action recommendations.",
            "No automatic follow-up.",
          ],
        },
        {
          id: "control",
          title: "What you can do today",
          paragraphs: [
            "Enter and edit information yourself, then use search and available views to review it.",
          ],
          bullets: [
            "Enter records directly.",
            "Update supported information in the table.",
            "There is no confirmed AI release date.",
          ],
        },
      ],
    },
    reports: {
      title: "Current availability of reports.",
      description:
        "Automated dashboards, weekly reports, and report downloads are not currently available.",
      contentsLabel: "Report availability",
      ctaTitle: "Start by reviewing your records.",
      ctaDescription:
        "Check the current feature scope and explore how it fits your work.",
      quickCards: [
        {
          title: "View your records",
          description:
            "Review records in the table and other available views.",
        },
        {
          title: "Analysis availability",
          description:
            "Automatic reporting and performance analysis are not currently available.",
        },
        {
          title: "Sharing and downloads",
          description:
            "Automatic report delivery and file downloads are not currently available.",
        },
      ],
      sections: [
        {
          id: "weekly",
          title: "View your records",
          paragraphs: [
            "Review records in the table and other available views.",
          ],
          bullets: [
            "Review records in the current collection.",
            "Switch between available views.",
            "Search within the collection.",
          ],
        },
        {
          id: "deal-review",
          title: "Analysis availability",
          paragraphs: [
            "Automatic reporting and performance analysis are not currently available.",
          ],
          bullets: [
            "No revenue forecasting.",
            "No conversion analysis.",
            "No automatically generated weekly reports.",
          ],
        },
        {
          id: "export",
          title: "Sharing and downloads",
          paragraphs: [
            "Automatic report delivery and file downloads are not currently available.",
          ],
          bullets: [
            "No automatic report delivery.",
            "No report downloads.",
            "There is no confirmed reporting release date.",
          ],
        },
      ],
    },
  },
};

// 기능 : FeatureDetailPage 화면을 렌더링합니다.
export function FeatureDetailPage({
  featureId,
}: {
  readonly featureId: PublicFeatureDetailId;
}) {
  // 1. 처리 흐름에 필요한 { language } 값을 준비한다.
  const { language } = usePublicSiteLanguage();
  // 2. 이후 단계에서 사용할 copy 값을 준비한다.
  const copy =
    featureDetailCopyByLanguage[getPublicSiteCopyLanguage(language)][featureId];
  // 3. 이후 단계에서 사용할 tocItems 값을 준비한다.
  const tocItems = copy.sections.map((section) => ({
    id: section.id,
    title: section.title,
  }));

  // 4. 계산된 결과를 호출자에게 반환한다.
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
