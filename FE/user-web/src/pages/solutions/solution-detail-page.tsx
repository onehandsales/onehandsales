import {
  CalendarClock,
  ListChecks,
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
import { publicSiteImages } from "@/features/public-site/constants/public-site-assets";
import {
  getPublicSiteCopyLanguage,
  usePublicSiteLanguage,
  type PublicSiteCopyLanguage,
} from "@/features/public-site/i18n/public-site-language";

export type SolutionUseCaseId =
  | "personal"
  | "real-estate"
  | "insurance-auto"
  | "b2b-field";

type SolutionDetailCardCopy = {
  readonly description: string;
  readonly title: string;
};

type SolutionDetailSectionCopy = {
  readonly bullets: readonly string[];
  readonly id: string;
  readonly paragraphs: readonly string[];
  readonly title: string;
};

type SolutionDetailCopy = {
  readonly cards: readonly [
    SolutionDetailCardCopy,
    SolutionDetailCardCopy,
    SolutionDetailCardCopy,
  ];
  readonly contentsLabel: string;
  readonly ctaDescription: string;
  readonly ctaTitle: string;
  readonly description: string;
  readonly imageAlt: string;
  readonly imageCaption: string;
  readonly sections: readonly SolutionDetailSectionCopy[];
  readonly title: string;
};

type SolutionDetailPageProps = {
  readonly solutionId: SolutionUseCaseId;
};

const detailCardIcons: readonly [LucideIcon, LucideIcon, LucideIcon] = [
  UsersRound,
  CalendarClock,
  ListChecks,
];

const solutionImageById: Record<SolutionUseCaseId, string> = {
  personal: publicSiteImages.solutionPersonal,
  "real-estate": publicSiteImages.solutionRealEstate,
  "insurance-auto": publicSiteImages.solutionInsuranceAuto,
  "b2b-field": publicSiteImages.solutionB2bField,
};

const solutionDetailCopyByLanguage: Record<
  PublicSiteCopyLanguage,
  Record<SolutionUseCaseId, SolutionDetailCopy>
> = {
  ko: {
    personal: {
      title: "개인 영업자가 고객을 놓치지 않는 작업 공간.",
      description:
        "혼자 고객을 만나고, 기록하고, 다시 연락해야 하는 영업자에게는 팀 CRM보다 가볍고 빠른 개인 영업 흐름이 필요합니다.",
      imageAlt: "혼자 노트북으로 상담 내용을 확인하는 개인 영업자",
      imageCaption: "혼자 진행하는 상담, 메모, 후속 연락 흐름을 한 화면에서 정리합니다.",
      cards: [
        {
          title: "고객 맥락",
          description:
            "연락처, 명함, 상담 메모, 관심사를 고객 단위로 정리합니다.",
        },
        {
          title: "후속 연락",
          description:
            "다시 연락할 날짜와 해야 할 일을 일정으로 이어 놓습니다.",
        },
        {
          title: "딜 진행",
          description:
            "상담 중인 고객이 어떤 단계에 있는지 혼자서도 빠르게 확인합니다.",
        },
      ],
      contentsLabel: "개인 흐름",
      sections: [
        {
          id: "customer-context",
          title: "고객 기록이 흩어지지 않게",
          paragraphs: [
            "개인 영업은 고객 정보가 메신저, 메모앱, 엑셀, 명함 사진에 나뉘기 쉽습니다. OneHand는 연락처와 상담 기록을 고객 중심으로 묶어 다음 대화에 필요한 맥락을 바로 찾게 합니다.",
          ],
          bullets: [
            "고객별 연락처, 회사, 메모, 관심 내용을 한 화면에서 확인",
            "명함 스캔 이후 고객 정보로 자연스럽게 연결",
            "오래된 상담도 검색과 기록으로 빠르게 복기",
          ],
        },
        {
          id: "follow-up",
          title: "다음 연락을 일정으로 남기기",
          paragraphs: [
            "혼자 일할수록 중요한 것은 기억력이 아니라 시스템입니다. 상담이 끝난 뒤 바로 다음 연락일, 방문 일정, 확인할 일을 남기면 팔로업 누락을 줄일 수 있습니다.",
          ],
          bullets: [
            "상담 직후 다음 연락일과 할 일을 등록",
            "방문, 견적, 재연락 일정을 고객 기록과 연결",
            "오늘 챙겨야 할 고객을 빠르게 확인",
          ],
        },
        {
          id: "simple-pipeline",
          title: "가볍게 쓰는 개인 파이프라인",
          paragraphs: [
            "복잡한 조직용 CRM 설정 없이도 상담, 제안, 계약 가능성, 보류 상태를 구분해 볼 수 있어야 합니다. 개인 영업자는 필요한 단계만 남겨도 충분합니다.",
          ],
          bullets: [
            "상담 중, 제안 중, 계약 검토 등 필요한 단계만 관리",
            "고객별 딜 금액과 가능성을 간단히 기록",
            "매일 봐야 할 기회를 우선순위로 정리",
          ],
        },
      ],
      ctaTitle: "개인 흐름부터 정리해볼까요?",
      ctaDescription:
        "지금 쓰는 메모, 엑셀, 일정 방식에 맞춰 OneHand 시작 흐름을 잡아드려요.",
    },
    "real-estate": {
      title: "부동산 중개 상담과 매물 관심사를 이어서 관리.",
      description:
        "부동산 중개는 고객 조건, 방문 일정, 매물 관심도, 계약 가능성이 계속 바뀝니다. OneHand는 고객별 진행 상황을 놓치지 않게 정리합니다.",
      imageAlt: "수영장과 정원이 있는 단독주택 외관",
      imageCaption: "매물 조건과 방문 일정, 관심 고객을 집과 매물 단위로 정리합니다.",
      cards: [
        {
          title: "상담 고객",
          description:
            "매수, 매도, 임대 고객의 조건과 진행 상황을 구분합니다.",
        },
        {
          title: "방문 일정",
          description:
            "방문 약속과 재연락 시점을 고객 기록에 함께 남깁니다.",
        },
        {
          title: "계약 가능성",
          description:
            "관심 매물, 예산, 의사결정 상태를 다음 행동으로 연결합니다.",
        },
      ],
      contentsLabel: "부동산 중개 흐름",
      sections: [
        {
          id: "client-needs",
          title: "고객 조건을 다시 찾기 쉽게",
          paragraphs: [
            "고객마다 원하는 지역, 예산, 입주 시점, 거래 유형이 다릅니다. 상담 때마다 같은 질문을 반복하지 않도록 고객 조건을 구조화해 남기는 것이 중요합니다.",
          ],
          bullets: [
            "매수, 매도, 임대 상담 고객을 구분해 관리",
            "지역, 예산, 일정, 선호 조건을 고객 메모로 축적",
            "재상담 때 이전 대화와 관심 조건을 빠르게 확인",
          ],
        },
        {
          id: "visits",
          title: "방문 일정과 후속 연락을 연결",
          paragraphs: [
            "중개 업무는 방문 이후의 후속 연락이 계약 가능성을 크게 좌우합니다. 방문 일정과 결과 메모를 고객 기록에 붙이면 다음 연락이 명확해집니다.",
          ],
          bullets: [
            "방문 약속, 재방문, 서류 확인 일정을 등록",
            "방문 후 반응과 보류 사유를 고객별로 기록",
            "다음 안내가 필요한 고객을 일정 기준으로 확인",
          ],
        },
        {
          id: "deal-readiness",
          title: "계약 가능성을 흐름으로 보기",
          paragraphs: [
            "관심은 있지만 시점이 애매한 고객, 특정 조건만 맞으면 움직이는 고객, 계약 직전 고객은 다르게 봐야 합니다. 단계별로 정리하면 우선순위가 선명해집니다.",
          ],
          bullets: [
            "관심, 비교, 협의, 계약 검토 등 단계별 상태 관리",
            "고객별 계약 가능성과 다음 액션 기록",
            "놓치기 쉬운 장기 검토 고객을 다시 확인",
          ],
        },
      ],
      ctaTitle: "중개 상담 흐름에 맞춰 정리해볼까요?",
      ctaDescription:
        "고객 조건과 방문 이후 팔로업 방식을 기준으로 필요한 구성을 함께 잡아드려요.",
    },
    "insurance-auto": {
      title: "보험과 자동차 영업의 긴 상담 흐름을 고객별로 관리.",
      description:
        "보험과 자동차 영업은 첫 상담 이후 견적, 비교, 서류, 계약, 갱신까지 이어지는 시간이 깁니다. OneHand는 다음 연락과 진행 상태를 고객별로 묶어 관리합니다.",
      imageAlt: "쇼룸 안에 전시된 흰색 자동차",
      imageCaption: "차량 상담과 견적, 계약 전후 연락을 고객별 흐름으로 관리합니다.",
      cards: [
        {
          title: "상담 이력",
          description:
            "가족 구성, 예산, 차량 조건처럼 반복 확인하는 정보를 남깁니다.",
        },
        {
          title: "견적 후속",
          description:
            "견적 발송 후 확인할 날짜와 보완할 내용을 놓치지 않습니다.",
        },
        {
          title: "갱신과 재구매",
          description:
            "계약 이후에도 갱신, 재구매, 소개 고객 흐름을 이어갑니다.",
        },
      ],
      contentsLabel: "보험/자동차 흐름",
      sections: [
        {
          id: "consultation",
          title: "반복 상담 정보를 고객별로 축적",
          paragraphs: [
            "보험과 자동차 영업은 고객 상황을 정확히 기억하는 것이 신뢰로 이어집니다. 상담 때 나온 조건과 우려사항을 고객 기록에 남기면 다음 대화가 자연스러워집니다.",
          ],
          bullets: [
            "고객 니즈, 예산, 가족 구성, 차량 조건 등을 기록",
            "이전 상담에서 나온 걱정과 검토 사유를 복기",
            "소개 고객과 기존 고객의 관계를 메모로 연결",
          ],
        },
        {
          id: "quotes",
          title: "견적 이후의 다음 행동을 놓치지 않기",
          paragraphs: [
            "견적을 보낸 뒤 언제 확인할지, 어떤 자료가 필요한지, 어떤 조건을 다시 설명해야 하는지가 중요합니다. OneHand는 견적 이후의 행동을 일정과 딜 단계로 이어줍니다.",
          ],
          bullets: [
            "견적 발송, 조건 비교, 서류 요청 상태를 딜 단계로 관리",
            "다음 연락일과 확인할 내용을 일정으로 등록",
            "계약 가능성이 높은 고객을 우선적으로 확인",
          ],
        },
        {
          id: "relationship",
          title: "계약 후 관계를 장기 흐름으로 관리",
          paragraphs: [
            "한 번의 계약으로 끝나지 않는 업종일수록 사후 연락이 중요합니다. 갱신, 재구매, 보장 변경, 차량 교체 시점을 고객 기록과 함께 볼 수 있어야 합니다.",
          ],
          bullets: [
            "계약 이후 감사 연락과 점검 일정을 등록",
            "갱신, 만기, 재구매 가능 시점을 메모",
            "장기 고객과 소개 고객의 흐름을 꾸준히 관리",
          ],
        },
      ],
      ctaTitle: "상담부터 갱신까지 이어지는 흐름을 잡아볼까요?",
      ctaDescription:
        "견적, 서류, 계약 전후 연락 방식에 맞춰 필요한 고객 관리 구성을 제안드려요.",
    },
    "b2b-field": {
      title: "B2B 현장 영업의 미팅, 담당자, 딜 단계를 한곳에.",
      description:
        "B2B 현장 영업은 여러 회사와 담당자를 오가며 미팅을 반복합니다. OneHand는 미팅 기록과 다음 행동을 딜 흐름에 연결해 우선순위를 분명하게 만듭니다.",
      imageAlt: "사무실에서 악수하는 두 명의 비즈니스 담당자",
      imageCaption: "기업 담당자, 미팅 메모, 계약 단계를 하나의 흐름으로 봅니다.",
      cards: [
        {
          title: "회사와 담당자",
          description:
            "거래처, 의사결정자, 실무자 정보를 관계 중심으로 정리합니다.",
        },
        {
          title: "현장 미팅",
          description:
            "방문 결과와 요청사항을 미팅 기록으로 남겨 다음 행동에 연결합니다.",
        },
        {
          title: "딜 우선순위",
          description:
            "제안, 견적, 검토, 계약 단계의 기회를 빠르게 구분합니다.",
        },
      ],
      contentsLabel: "현장 B2B 흐름",
      sections: [
        {
          id: "accounts",
          title: "회사와 담당자를 같은 맥락에서 보기",
          paragraphs: [
            "B2B 영업에서는 회사 정보와 담당자 관계가 분리되면 미팅 준비가 늦어집니다. 거래처별 담당자와 이전 대화 맥락을 함께 보면 다음 접점이 명확해집니다.",
          ],
          bullets: [
            "거래처와 담당자를 함께 관리",
            "의사결정자, 실무자, 소개자를 메모로 구분",
            "회사별 최근 미팅과 진행 중인 딜을 빠르게 확인",
          ],
        },
        {
          id: "meeting-notes",
          title: "현장 미팅 기록을 다음 행동으로 연결",
          paragraphs: [
            "미팅 직후 기록하지 않으면 요청사항과 약속한 자료가 빠르게 흐려집니다. 방문 결과, 질문, 다음 액션을 바로 남기면 팀 없이도 업무 흐름이 안정됩니다.",
          ],
          bullets: [
            "방문 미팅 결과와 고객 요청사항 기록",
            "제안서, 견적, 샘플 전달 같은 다음 일을 일정으로 연결",
            "이전 미팅 내용을 기반으로 다음 대화 준비",
          ],
        },
        {
          id: "pipeline",
          title: "딜 단계와 팔로업 우선순위 정리",
          paragraphs: [
            "B2B 현장 영업은 기회마다 검토 기간과 의사결정 속도가 다릅니다. 딜 단계와 다음 연락일을 함께 보면 오늘 집중할 고객이 뚜렷해집니다.",
          ],
          bullets: [
            "리드, 미팅, 제안, 견적, 계약 검토 단계 관리",
            "딜 금액과 가능성을 기준으로 우선순위 확인",
            "장기 검토 거래처의 재접점 시점을 놓치지 않기",
          ],
        },
      ],
      ctaTitle: "현장 미팅과 딜 흐름을 함께 정리해볼까요?",
      ctaDescription:
        "현재 거래처 관리 방식과 미팅 기록 방식을 기준으로 OneHand 적용 흐름을 잡아드려요.",
    },
  },
  "en-US": {
    personal: {
      title: "A workspace for personal sellers who cannot miss a customer.",
      description:
        "Solo sellers need a lighter workflow than team CRM: customers, notes, schedules, deals, and follow-up in one place.",
      imageAlt: "A personal seller reviewing consultation details alone on a laptop",
      imageCaption: "Organize solo consultations, notes, and follow-up in one view.",
      cards: [
        {
          title: "Customer context",
          description:
            "Keep contacts, business cards, notes, and interests organized by customer.",
        },
        {
          title: "Follow-up timing",
          description:
            "Turn every next contact date and task into a schedule you can revisit.",
        },
        {
          title: "Deal progress",
          description:
            "See which customers are active and what stage each opportunity is in.",
        },
      ],
      contentsLabel: "Personal workflow",
      sections: [
        {
          id: "customer-context",
          title: "Keep customer records from scattering",
          paragraphs: [
            "Personal customer records often split across messengers, notes, spreadsheets, and business card photos. OneHand keeps the customer context close to the next conversation.",
          ],
          bullets: [
            "Review contact, company, notes, and interests on one screen",
            "Connect scanned business cards to customer records",
            "Find older conversations quickly through search and notes",
          ],
        },
        {
          id: "follow-up",
          title: "Save the next contact as a schedule",
          paragraphs: [
            "When you sell alone, the system matters more than memory. Save the next call, visit, or task right after a conversation so fewer opportunities fall through.",
          ],
          bullets: [
            "Register the next contact date right after each conversation",
            "Tie visits, quotes, and follow-up tasks to customer records",
            "See which customers need attention today",
          ],
        },
        {
          id: "simple-pipeline",
          title: "Use a lightweight personal pipeline",
          paragraphs: [
            "You do not need heavy CRM setup to track consultation, proposal, contract review, and paused opportunities. Keep only the stages you actually use.",
          ],
          bullets: [
            "Manage simple stages such as consulting, proposal, and contract review",
            "Record deal value and likelihood by customer",
            "Prioritize the opportunities you should check every day",
          ],
        },
      ],
      ctaTitle: "Want to organize your personal workflow?",
      ctaDescription:
        "Tell us how you use notes, spreadsheets, and schedules today, and we can map the starting flow.",
    },
    "real-estate": {
      title: "Manage real estate clients, property interest, and visits together.",
      description:
        "Real estate work changes constantly across client needs, visits, property interest, and deal timing. OneHand keeps every client status easy to reopen.",
      imageAlt: "A detached house exterior with a pool and garden",
      imageCaption: "Organize property conditions, visit schedules, and interested clients around each listing.",
      cards: [
        {
          title: "Client needs",
          description:
            "Separate buyer, seller, and rental clients with their conditions and status.",
        },
        {
          title: "Visits",
          description:
            "Keep appointments and next contact timing attached to each client.",
        },
        {
          title: "Deal readiness",
          description:
            "Connect property interest, budget, and decision status to the next action.",
        },
      ],
      contentsLabel: "Real estate workflow",
      sections: [
        {
          id: "client-needs",
          title: "Make client needs easy to reopen",
          paragraphs: [
            "Every client has different areas, budgets, move-in dates, and transaction types. Structured client notes help you avoid repeating the same questions.",
          ],
          bullets: [
            "Manage buyer, seller, and rental clients separately",
            "Keep area, budget, schedule, and preference notes by client",
            "Review previous conversations and conditions before follow-up",
          ],
        },
        {
          id: "visits",
          title: "Connect visits and follow-up",
          paragraphs: [
            "In brokerage work, the follow-up after a visit often decides the next step. Attach visit results and next contact timing to the client record.",
          ],
          bullets: [
            "Register visits, revisits, and document check schedules",
            "Record client reactions and reasons for delay after visits",
            "Find clients who need the next update by schedule",
          ],
        },
        {
          id: "deal-readiness",
          title: "Track deal readiness as a workflow",
          paragraphs: [
            "Interested clients, conditionally ready clients, and near-contract clients need different handling. Stages make the priority clearer.",
          ],
          bullets: [
            "Track status such as interest, comparison, negotiation, and contract review",
            "Record deal likelihood and next actions by client",
            "Revisit long-consideration clients before they go cold",
          ],
        },
      ],
      ctaTitle: "Want to map OneHand to your brokerage flow?",
      ctaDescription:
        "We can start from your client conditions, visits, and follow-up process.",
    },
    "insurance-auto": {
      title: "Manage long insurance/automobile conversations by customer.",
      description:
        "Insurance and automobile workflows often continue through quotes, comparison, documents, contracts, renewals, and repurchase. OneHand keeps the next contact and status connected by customer.",
      imageAlt: "A white car displayed inside a showroom",
      imageCaption: "Manage vehicle consultations, quotes, and pre/post-contract follow-up by customer.",
      cards: [
        {
          title: "Consultation history",
          description:
            "Keep repeat details such as family context, budget, and vehicle preferences.",
        },
        {
          title: "Quote follow-up",
          description:
            "Track when to check back after sending a quote and what to clarify.",
        },
        {
          title: "Renewal and repurchase",
          description:
            "Continue the relationship after the first contract or purchase.",
        },
      ],
      contentsLabel: "Insurance/Automobile workflow",
      sections: [
        {
          id: "consultation",
          title: "Build customer context across repeat consultations",
          paragraphs: [
            "Trust grows when you remember each customer's situation accurately. Keep conditions, concerns, and objections in the customer record for the next conversation.",
          ],
          bullets: [
            "Record needs, budget, family context, and vehicle conditions",
            "Review previous concerns and reasons for delay",
            "Connect referred customers to the existing relationship context",
          ],
        },
        {
          id: "quotes",
          title: "Do not lose the next action after a quote",
          paragraphs: [
            "After sending a quote, you need to know when to follow up, which documents are needed, and which conditions require another explanation.",
          ],
          bullets: [
            "Track quote sent, comparison, document request, and contract review stages",
            "Register the next contact date and what to confirm",
            "Prioritize customers with higher contract likelihood",
          ],
        },
        {
          id: "relationship",
          title: "Keep post-contract relationships active",
          paragraphs: [
            "The first contract is not the end. Renewals, policy changes, vehicle replacement, and repurchase timing should stay visible with the customer record.",
          ],
          bullets: [
            "Add thank-you contacts and check-in schedules after contracts",
            "Record renewal, maturity, and repurchase timing",
            "Manage long-term customers and referrals consistently",
          ],
        },
      ],
      ctaTitle: "Want to connect consultation, quote, and renewal work?",
      ctaDescription:
        "We can map OneHand to your quote, document, contract, and follow-up process.",
    },
    "b2b-field": {
      title: "Keep B2B field meetings, stakeholders, and deal stages together.",
      description:
        "B2B field sellers move across many companies and contacts. OneHand connects meeting notes and next actions to deal progress so priorities stay clear.",
      imageAlt: "Two business stakeholders shaking hands in an office",
      imageCaption: "See company contacts, meeting notes, and contract stages in one flow.",
      cards: [
        {
          title: "Accounts and contacts",
          description:
            "Organize companies, decision makers, and working contacts around the relationship.",
        },
        {
          title: "Field meetings",
          description:
            "Turn visit outcomes and requests into meeting notes and next tasks.",
        },
        {
          title: "Deal priority",
          description:
            "Separate proposal, quote, review, and contract opportunities quickly.",
        },
      ],
      contentsLabel: "B2B Field workflow",
      sections: [
        {
          id: "accounts",
          title: "View accounts and contacts in the same context",
          paragraphs: [
            "When company information and contact relationships are separated, meeting preparation slows down. Keep stakeholders and recent context attached to each account.",
          ],
          bullets: [
            "Manage companies and contacts together",
            "Separate decision makers, operators, and introducers in notes",
            "Review recent meetings and open deals by company",
          ],
        },
        {
          id: "meeting-notes",
          title: "Connect field meeting notes to next actions",
          paragraphs: [
            "Requests and promised materials fade quickly after a meeting. Capture outcomes, questions, and next actions immediately to keep the workflow stable.",
          ],
          bullets: [
            "Record visit outcomes and customer requests",
            "Schedule next actions such as proposals, quotes, and sample delivery",
            "Prepare the next conversation from previous meeting notes",
          ],
        },
        {
          id: "pipeline",
          title: "Clarify deal stage and follow-up priority",
          paragraphs: [
            "Every B2B opportunity has a different review cycle and decision speed. Deal stage plus next contact date makes today's focus obvious.",
          ],
          bullets: [
            "Manage stages such as lead, meeting, proposal, quote, and contract review",
            "Prioritize by deal value and likelihood",
            "Revisit long-cycle accounts before the opportunity goes cold",
          ],
        },
      ],
      ctaTitle: "Want to connect field meetings and deal progress?",
      ctaDescription:
        "We can start from how you manage accounts, meeting notes, and follow-up today.",
    },
  },
};

export function SolutionDetailPage({ solutionId }: SolutionDetailPageProps) {
  const { language } = usePublicSiteLanguage();
  const copy =
    solutionDetailCopyByLanguage[getPublicSiteCopyLanguage(language)][solutionId];
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

            <figure className="mt-10 overflow-hidden rounded-[10px] border border-[#eeeeec] bg-white p-2 shadow-sm">
              <img
                alt={copy.imageAlt}
                className="h-[260px] w-full rounded-[8px] object-cover sm:h-[340px] lg:h-[420px]"
                decoding="async"
                loading="eager"
                src={solutionImageById[solutionId]}
              />
              <figcaption className="px-2 pb-1 pt-3 break-keep text-[12px] font-normal leading-5 text-[#777770]">
                {copy.imageCaption}
              </figcaption>
            </figure>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {copy.cards.map((card, cardIndex) => {
                const Icon = detailCardIcons[cardIndex];

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
            {copy.sections.map((section) => (
              <PublicDocumentSection
                bullets={section.bullets}
                id={section.id}
                key={section.id}
                paragraphs={section.paragraphs}
                title={section.title}
              />
            ))}
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
