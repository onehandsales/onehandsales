import {
  ArrowRight,
  Bell,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Database,
  FileText,
  FolderKanban,
  Handshake,
  Mail,
  MessageCircle,
  MessageSquareText,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { PublicSiteFooter } from "@/features/public-site/components/public-site-footer";
import { PublicSiteHeader } from "@/features/public-site/components/public-site-header";
import {
  getPublicSiteCopyLanguage,
  usePublicSiteLanguage,
  type PublicSiteCopyLanguage,
} from "@/features/public-site/i18n/public-site-language";

type AuthLandingPageProps = {
  readonly children?: ReactNode;
  readonly isModalOpen: boolean;
  readonly onOpenLogin: () => void;
};

type IconType = typeof BriefcaseBusiness;

type FeatureCopy = {
  readonly title: string;
  readonly description: string;
};

type FooterColumnCopy = {
  readonly title: string;
  readonly links: readonly string[];
};

type HeroRotatingItem = {
  readonly label: string;
  readonly suffix: string;
};

type LandingCopy = {
  readonly hero: {
    readonly eyebrow: string;
    readonly rotatingItems: readonly [HeroRotatingItem, ...HeroRotatingItem[]];
    readonly description: string;
    readonly primaryCta: string;
    readonly secondaryCta: string;
  };
  readonly partnerLabel: string;
  readonly partnerItems: readonly string[];
  readonly mock: {
    readonly workspaceName: string;
    readonly sidebar: readonly string[];
    readonly queueLabel: string;
    readonly sectionLabel: string;
    readonly shareAction: string;
    readonly newAction: string;
    readonly boardTitle: string;
    readonly columns: readonly {
      readonly label: string;
      readonly count: string;
      readonly cards: readonly string[];
    }[];
  };
  readonly work: {
    readonly eyebrow: string;
    readonly title: string;
    readonly description: string;
    readonly tabs: readonly FeatureCopy[];
    readonly previewTitle: string;
    readonly previewBoardTitle: string;
    readonly previewTableHeaders: readonly [string, string, string];
    readonly previewRequester: string;
    readonly previewQuestion: string;
    readonly previewAnswerTitle: string;
    readonly previewAnswer: string;
    readonly cardsLabel: string;
    readonly cards: readonly string[];
  };
  readonly workspace: {
    readonly eyebrow: string;
    readonly title: string;
    readonly description: string;
    readonly previewTitle: string;
    readonly previewEyebrow: string;
    readonly agentLabel: string;
    readonly metricLabels: readonly [string, string, string];
    readonly views: readonly FeatureCopy[];
    readonly tableHeaders: readonly string[];
    readonly rows: readonly string[][];
    readonly detailTitle: string;
    readonly detailItems: readonly FeatureCopy[];
  };
  readonly final: {
    readonly title: string;
    readonly description: string;
    readonly primaryCta: string;
    readonly secondaryCta: string;
  };
  readonly footer: {
    readonly tagline: string;
    readonly socialLabel: string;
    readonly columns: readonly FooterColumnCopy[];
  };
};

type ExpandedFeatureCopy = {
  readonly eyebrow: string;
  readonly title: string;
  readonly description: string;
  readonly items: readonly string[];
};

type ExpandedLandingCopy = {
  readonly assistants: {
    readonly eyebrow: string;
    readonly title: string;
    readonly description: string;
    readonly previewSearchQuery: string;
    readonly previewMeetingTitle: string;
    readonly previewNotesLabel: string;
    readonly previewAgentName: string;
    readonly cards: readonly ExpandedFeatureCopy[];
  };
  readonly together: {
    readonly eyebrow: string;
    readonly title: string;
    readonly description: string;
    readonly cards: readonly ExpandedFeatureCopy[];
  };
  readonly trust: {
    readonly title: string;
    readonly description: string;
    readonly testimonials: readonly {
      readonly company: string;
      readonly quote: string;
      readonly person: string;
      readonly tone: string;
    }[];
    readonly stats: readonly string[];
  };
};

const heroRotatingWordStyles = [
  {
    className: "bg-[#c9edeb] text-[#0f0f0f]",
  },
  {
    className: "bg-[#dbeafe] text-[#1d4ed8]",
  },
  {
    className: "bg-[#fee2e2] text-[#b91c1c]",
  },
  {
    className: "bg-[#ede9fe] text-[#6d28d9]",
  },
  {
    className: "bg-[#fef3c7] text-[#92400e]",
  },
] as const;

const expandedLandingCopyByLanguage: Record<
  PublicSiteCopyLanguage,
  ExpandedLandingCopy
> = {
  ko: {
    assistants: {
      eyebrow: "온디맨드 어시스턴트",
      title: "필요할 때 바로 묻는 세일즈 어시스턴트.",
      description:
        "검색, 회의록, 보안 답변, 후속 업무를 따로 열지 않아도 같은 워크스페이스 안에서 바로 요청하고 처리합니다.",
      previewSearchQuery: "이번 분기 고객 요청",
      previewMeetingTitle: "주간 고객 동기화",
      previewNotesLabel: "노트",
      previewAgentName: "Onehand 에이전트",
      cards: [
        {
          eyebrow: "세일즈 에이전트",
          title: "해야 할 일을 물으면 Onehand가 초안을 만듭니다.",
          description: "딜 상태와 고객 기록을 읽고 이메일, 다음 액션, 체크리스트를 제안합니다.",
          items: ["후속 이메일 작성", "담당자에게 업무 배정", "거래 위험 신호 표시"],
        },
        {
          eyebrow: "통합 검색",
          title: "고객 맥락을 한 번에 찾습니다.",
          description: "문서, 메모, 일정, CRM 기록을 연결해 필요한 근거를 바로 보여줍니다.",
          items: ["자료 통합 검색", "출처와 함께 답변", "팀 지식 재사용"],
        },
        {
          eyebrow: "회의 노트",
          title: "회의가 끝나면 기록이 완성됩니다.",
          description: "논의 내용, 결정 사항, 다음 액션을 자동으로 정리해 딜 화면에 남깁니다.",
          items: ["핵심 요약", "액션 아이템", "참석자별 후속 업무"],
        },
        {
          eyebrow: "매출 리뷰",
          title: "이번 주 움직인 거래를 바로 봅니다.",
          description: "진행률, 응답 지연, 예상 매출 변화를 팀이 같은 기준으로 확인합니다.",
          items: ["주간 매출 요약", "병목 계정 표시", "리더용 리포트"],
        },
      ],
    },
    together: {
      eyebrow: "업무 통합",
      title: "흩어진 업무를 한 흐름으로 모으세요.",
      description:
        "문서, 지식, 프로젝트, 고객 기록이 분리되지 않도록 Onehand 안에서 같은 구조로 쌓습니다.",
      cards: [
        {
          eyebrow: "문서",
          title: "제안서와 고객 자료를 간단하게 관리합니다.",
          description: "영업 자료를 딜과 연결해 필요한 순간 바로 찾을 수 있습니다.",
          items: ["제안서", "체크리스트", "승인 기록"],
        },
        {
          eyebrow: "지식 베이스",
          title: "팀과 에이전트가 같은 지식을 사용합니다.",
          description: "자주 묻는 질문과 내부 정책을 답변 가능한 지식으로 정리합니다.",
          items: ["보안 답변", "제품 설명", "가격 정책"],
        },
        {
          eyebrow: "출시 트래커",
          title: "출시와 온보딩 진행 상황을 놓치지 않습니다.",
          description: "고객 온보딩, 계약, 교육 일정을 하나의 진행판으로 봅니다.",
          items: ["온보딩", "교육 일정", "완료 기준"],
        },
      ],
    },
    trust: {
      title: "거래를 움직이는 팀이 신뢰합니다.",
      description:
        "Onehand는 고객 기록을 잃지 않고 반복 업무를 줄이려는 팀을 위해 설계되었습니다.",
      testimonials: [
        {
          company: "Cursor-style sales team",
          quote: "팀이 같은 딜 맥락을 보고 움직이니 후속 업무가 훨씬 빨라졌습니다.",
          person: "Revenue Lead",
          tone: "bg-[#e95a48]",
        },
        {
          company: "Pipeline operations",
          quote: "회의록과 검색, 업무 배정이 한 화면에 있어 매주 리뷰가 쉬워졌습니다.",
          person: "Sales Ops",
          tone: "bg-[#1f79b8]",
        },
        {
          company: "Growth team",
          quote: "작은 팀도 엔터프라이즈처럼 고객 히스토리를 관리할 수 있습니다.",
          person: "Founder",
          tone: "bg-[#d89c25]",
        },
      ],
      stats: ["고객 기록 통합", "반복 업무 자동화", "다국어 팀 지원", "모바일 대응"],
    },
  },
  ja: {
    assistants: {
      eyebrow: "オンデマンドアシスタント",
      title: "必要な時にすぐ聞ける営業アシスタント。",
      description:
        "検索、議事録、セキュリティ回答、フォローアップを同じワークスペース内で依頼して処理できます。",
      previewSearchQuery: "今四半期の顧客リクエスト",
      previewMeetingTitle: "週次顧客同期",
      previewNotesLabel: "ノート",
      previewAgentName: "Onehand エージェント",
      cards: [
        {
          eyebrow: "セールスエージェント",
          title: "やるべきことを聞くと Onehand が下書きを作ります。",
          description: "商談状況と顧客記録を読み、メール、次のアクション、チェックリストを提案します。",
          items: ["フォローアップ作成", "担当者へ割り当て", "リスク表示"],
        },
        {
          eyebrow: "統合検索",
          title: "顧客文脈を一度に探します。",
          description: "文書、メモ、予定、CRM 記録をつなげ、必要な根拠をすぐ表示します。",
          items: ["統合検索", "出典付き回答", "チーム知識の再利用"],
        },
        {
          eyebrow: "会議ノート",
          title: "会議が終わると記録が整います。",
          description: "議論、決定事項、次のアクションを自動で整理して商談画面に残します。",
          items: ["要約", "アクション項目", "参加者別フォロー"],
        },
        {
          eyebrow: "売上レビュー",
          title: "今週動いた商談をすぐ確認します。",
          description: "進捗、返信遅延、売上見込みの変化を同じ基準で確認できます。",
          items: ["週次売上要約", "ボトルネック表示", "リーダーレポート"],
        },
      ],
    },
    together: {
      eyebrow: "仕事を一つに",
      title: "散らばった仕事を一つの流れにまとめます。",
      description:
        "文書、ナレッジ、プロジェクト、顧客記録を Onehand 内で同じ構造にそろえます。",
      cards: [
        {
          eyebrow: "ドキュメント",
          title: "提案書と顧客資料を簡単に管理します。",
          description: "営業資料を商談に結び付け、必要な時にすぐ見つけられます。",
          items: ["提案書", "チェックリスト", "承認記録"],
        },
        {
          eyebrow: "ナレッジベース",
          title: "チームとエージェントが同じ知識を使います。",
          description: "よくある質問と社内ポリシーを回答できる知識として整理します。",
          items: ["セキュリティ回答", "製品説明", "価格ポリシー"],
        },
        {
          eyebrow: "ローンチトラッカー",
          title: "導入とオンボーディングの進行を逃しません。",
          description: "顧客オンボーディング、契約、研修日程を一つのボードで確認します。",
          items: ["オンボーディング", "研修日程", "完了基準"],
        },
      ],
    },
    trust: {
      title: "商談を動かすチームに信頼されています。",
      description:
        "Onehand は顧客記録を失わず、反復作業を減らしたいチームのために設計されています。",
      testimonials: [
        {
          company: "Cursor-style sales team",
          quote: "同じ商談文脈を見て動けるため、フォローアップが速くなりました。",
          person: "Revenue Lead",
          tone: "bg-[#e95a48]",
        },
        {
          company: "Pipeline operations",
          quote: "議事録、検索、割り当てが一画面にあり、週次レビューが簡単です。",
          person: "Sales Ops",
          tone: "bg-[#1f79b8]",
        },
        {
          company: "Growth team",
          quote: "小さなチームでも顧客履歴をエンタープライズ水準で管理できます。",
          person: "Founder",
          tone: "bg-[#d89c25]",
        },
      ],
      stats: ["顧客記録を統合", "反復作業を自動化", "多言語チーム対応", "モバイル対応"],
    },
  },
  "zh-TW": {
    assistants: {
      eyebrow: "按需助手",
      title: "随时可问的销售助手。",
      description:
        "搜索、会议记录、安全问答和跟进任务都可以在同一个工作区中请求和处理。",
      previewSearchQuery: "本季度客户请求",
      previewMeetingTitle: "每周客户同步",
      previewNotesLabel: "笔记",
      previewAgentName: "Onehand 代理",
      cards: [
        {
          eyebrow: "销售代理",
          title: "提出要做的事，Onehand 会生成草稿。",
          description: "读取交易状态和客户记录，建议邮件、下一步行动和检查清单。",
          items: ["跟进邮件", "分配负责人", "标记交易风险"],
        },
        {
          eyebrow: "统一搜索",
          title: "一次找到完整客户上下文。",
          description: "连接文档、笔记、日程和 CRM 记录，立即显示所需依据。",
          items: ["统一搜索", "带来源回答", "复用团队知识"],
        },
        {
          eyebrow: "会议记录",
          title: "会议结束后记录自动完成。",
          description: "自动整理讨论、决策和下一步行动，并写入交易页面。",
          items: ["核心摘要", "行动项", "按参会者跟进"],
        },
        {
          eyebrow: "收入复盘",
          title: "立即查看本周推进的交易。",
          description: "团队用同一标准查看进度、响应延迟和收入预测变化。",
          items: ["每周收入摘要", "瓶颈账户", "管理者报告"],
        },
      ],
    },
    together: {
      eyebrow: "整合工作",
      title: "把分散的工作汇成一条流程。",
      description:
        "文档、知识、项目和客户记录在 Onehand 中以同一结构沉淀。",
      cards: [
        {
          eyebrow: "文档",
          title: "轻松管理提案和客户资料。",
          description: "把销售资料连接到交易，在需要时快速找到。",
          items: ["提案", "检查清单", "审批记录"],
        },
        {
          eyebrow: "知识库",
          title: "团队和代理使用同一份知识。",
          description: "把常见问题和内部政策整理成可回答的知识。",
          items: ["安全回答", "产品说明", "价格政策"],
        },
        {
          eyebrow: "上线跟踪",
          title: "不错过上线和客户启用进度。",
          description: "在同一看板中查看客户启用、合同和培训日程。",
          items: ["客户启用", "培训日程", "完成标准"],
        },
      ],
    },
    trust: {
      title: "受到推动交易的团队信任。",
      description:
        "Onehand 为希望保留客户记录并减少重复工作的团队而设计。",
      testimonials: [
        {
          company: "Cursor-style sales team",
          quote: "团队基于同一交易上下文行动，跟进速度明显提升。",
          person: "Revenue Lead",
          tone: "bg-[#e95a48]",
        },
        {
          company: "Pipeline operations",
          quote: "会议记录、搜索和任务分配在同一屏，每周复盘更轻松。",
          person: "Sales Ops",
          tone: "bg-[#1f79b8]",
        },
        {
          company: "Growth team",
          quote: "小团队也能像企业团队一样管理客户历史。",
          person: "Founder",
          tone: "bg-[#d89c25]",
        },
      ],
      stats: ["整合客户记录", "自动化重复任务", "支持多语言团队", "适配移动端"],
    },
  },
  "en-US": {
    assistants: {
      eyebrow: "On-demand assistants",
      title: "Ask your on-demand assistants.",
      description:
        "Search, notes, security answers, and follow-up work stay inside the same workspace instead of becoming separate tools.",
      previewSearchQuery: "customer request this quarter",
      previewMeetingTitle: "Weekly customer sync",
      previewNotesLabel: "Notes",
      previewAgentName: "Onehand agent",
      cards: [
        {
          eyebrow: "Sales agent",
          title: "You ask the tasks. Onehand drafts the work.",
          description: "Read deal status and customer context to suggest emails, next steps, and checklists.",
          items: ["Draft follow-ups", "Assign owners", "Flag deal risk"],
        },
        {
          eyebrow: "Enterprise search",
          title: "One search for every customer signal.",
          description: "Connect docs, notes, meetings, and CRM records with answers that include context.",
          items: ["Unified search", "Source-backed answers", "Reusable team knowledge"],
        },
        {
          eyebrow: "Meeting notes",
          title: "Perfect notes, every time.",
          description: "Turn discussions, decisions, and next actions into records attached to the deal.",
          items: ["Executive summary", "Action items", "Owner follow-ups"],
        },
        {
          eyebrow: "Revenue review",
          title: "See what moved this week.",
          description: "Review progress, reply delays, and forecast changes from the same operating view.",
          items: ["Weekly revenue", "Bottleneck accounts", "Leader report"],
        },
      ],
    },
    together: {
      eyebrow: "Bring work together",
      title: "Bring every sales motion together.",
      description:
        "Docs, knowledge, projects, and customer records build on the same structure inside Onehand.",
      cards: [
        {
          eyebrow: "Docs",
          title: "Simple proposals and customer materials.",
          description: "Attach sales collateral to deals so teams can find the right source instantly.",
          items: ["Proposals", "Checklists", "Approvals"],
        },
        {
          eyebrow: "Knowledge base",
          title: "One source of truth for teams and agents.",
          description: "Turn FAQs and internal policies into knowledge your team can actually use.",
          items: ["Security answers", "Product notes", "Pricing policy"],
        },
        {
          eyebrow: "Launch tracker",
          title: "Less tracking. More progress.",
          description: "Track onboarding, contracts, and training plans from one launch board.",
          items: ["Onboarding", "Training dates", "Done criteria"],
        },
      ],
    },
    trust: {
      title: "Trusted by teams that move deals.",
      description:
        "Onehand is built for teams that need customer memory and repeated work to stay under control.",
      testimonials: [
        {
          company: "Cursor-style sales team",
          quote: "Follow-up got faster once everyone worked from the same deal context.",
          person: "Revenue Lead",
          tone: "bg-[#e95a48]",
        },
        {
          company: "Pipeline operations",
          quote: "Notes, search, and routing in one screen made weekly reviews much easier.",
          person: "Sales Ops",
          tone: "bg-[#1f79b8]",
        },
        {
          company: "Growth team",
          quote: "A small team can manage customer history with enterprise discipline.",
          person: "Founder",
          tone: "bg-[#d89c25]",
        },
      ],
      stats: ["Customer memory unified", "Repeated work automated", "Multilingual teams supported", "Responsive on mobile"],
    },
  },
  "en-GB": {
    assistants: {
      eyebrow: "On-demand assistants",
      title: "Ask your on-demand assistants.",
      description:
        "Search, notes, security answers, and follow-up work stay inside the same workspace instead of becoming separate tools.",
      previewSearchQuery: "customer request this quarter",
      previewMeetingTitle: "Weekly customer sync",
      previewNotesLabel: "Notes",
      previewAgentName: "Onehand agent",
      cards: [
        {
          eyebrow: "Sales agent",
          title: "You ask the tasks. Onehand drafts the work.",
          description: "Read deal status and customer context to suggest emails, next steps, and checklists.",
          items: ["Draft follow-ups", "Assign owners", "Flag deal risk"],
        },
        {
          eyebrow: "Enterprise search",
          title: "One search for every customer signal.",
          description: "Connect docs, notes, meetings, and CRM records with answers that include context.",
          items: ["Unified search", "Source-backed answers", "Reusable team knowledge"],
        },
        {
          eyebrow: "Meeting notes",
          title: "Perfect notes, every time.",
          description: "Turn discussions, decisions, and next actions into records attached to the deal.",
          items: ["Executive summary", "Action items", "Owner follow-ups"],
        },
        {
          eyebrow: "Revenue review",
          title: "See what moved this week.",
          description: "Review progress, reply delays, and forecast changes from the same operating view.",
          items: ["Weekly revenue", "Bottleneck accounts", "Leader report"],
        },
      ],
    },
    together: {
      eyebrow: "Bring work together",
      title: "Bring every sales motion together.",
      description:
        "Docs, knowledge, projects, and customer records build on the same structure inside Onehand.",
      cards: [
        {
          eyebrow: "Docs",
          title: "Simple proposals and customer materials.",
          description: "Attach sales collateral to deals so teams can find the right source instantly.",
          items: ["Proposals", "Checklists", "Approvals"],
        },
        {
          eyebrow: "Knowledge base",
          title: "One source of truth for teams and agents.",
          description: "Turn FAQs and internal policies into knowledge your team can actually use.",
          items: ["Security answers", "Product notes", "Pricing policy"],
        },
        {
          eyebrow: "Launch tracker",
          title: "Less tracking. More progress.",
          description: "Track onboarding, contracts, and training plans from one launch board.",
          items: ["Onboarding", "Training dates", "Done criteria"],
        },
      ],
    },
    trust: {
      title: "Trusted by teams that move deals.",
      description:
        "Onehand is built for teams that need customer memory and repeated work to stay under control.",
      testimonials: [
        {
          company: "Cursor-style sales team",
          quote: "Follow-up got faster once everyone worked from the same deal context.",
          person: "Revenue Lead",
          tone: "bg-[#e95a48]",
        },
        {
          company: "Pipeline operations",
          quote: "Notes, search, and routing in one screen made weekly reviews much easier.",
          person: "Sales Ops",
          tone: "bg-[#1f79b8]",
        },
        {
          company: "Growth team",
          quote: "A small team can manage customer history with enterprise discipline.",
          person: "Founder",
          tone: "bg-[#d89c25]",
        },
      ],
      stats: ["Customer memory unified", "Repeated work automated", "Multilingual teams supported", "Responsive on mobile"],
    },
  },
};

const landingCopyByLanguage: Record<PublicSiteCopyLanguage, LandingCopy> = {
  ko: {
    hero: {
      eyebrow: "",
      rotatingItems: [
        { label: "세일즈", suffix: "는 간단합니다." },
        { label: "모바일", suffix: "은 간단합니다." },
        { label: "Onehand", suffix: "는 간단합니다." },
        { label: "AI", suffix: "는 간단합니다." },
        { label: "모든 것", suffix: "이 간단합니다." },
      ],
      description:
        "고객 대화, 일정, 제안서, 후속 업무를 한 곳에서 정리하고 반복되는 세일즈 운영을 자동화하세요.",
      primaryCta: "Onehand 시작",
      secondaryCta: "데모 요청",
    },
    partnerLabel: "반복 업무를 줄이고 기록을 살리는 팀을 위해",
    partnerItems: ["CRM", "이메일", "캘린더", "메신저", "문서", "시트"],
    mock: {
      workspaceName: "Onehand HQ",
      sidebar: ["홈", "딜", "회사", "업무", "회의"],
      queueLabel: "에이전트 대기열",
      sectionLabel: "워크스페이스",
      shareAction: "공유",
      newAction: "새로 만들기",
      boardTitle: "매출 파이프라인",
      columns: [
        {
          label: "신규",
          count: "12",
          cards: ["리드 우선순위 정리", "인바운드 문의 배정"],
        },
        {
          label: "진행",
          count: "8",
          cards: ["견적서 검토", "데모 일정 확정"],
        },
        {
          label: "후속",
          count: "5",
          cards: ["회의록 요약", "다음 액션 전송"],
        },
        {
          label: "성사",
          count: "21",
          cards: ["계약 체크리스트", "온보딩 준비"],
        },
      ],
    },
    work: {
      eyebrow: "맞춤 에이전트",
      title: "세일즈가 24시간 끊기지 않게.",
      description:
        "문의가 들어오고 회의가 끝나는 순간마다 에이전트가 기록을 읽고 다음 업무를 만들어 줍니다.",
      tabs: [
        {
          title: "Q&A 에이전트",
          description: "영업 자료와 고객 히스토리에서 답을 바로 찾습니다.",
        },
        {
          title: "업무 라우팅",
          description: "담당자, 마감일, 우선순위를 자동으로 정리합니다.",
        },
        {
          title: "알림 에이전트",
          description: "놓치기 쉬운 후속 업무를 팀 채널로 보냅니다.",
        },
        {
          title: "보안 검토",
          description: "민감 정보와 승인 흐름을 분리해 관리합니다.",
        },
        {
          title: "직접 만들기",
          description: "팀의 반복 업무를 에이전트로 구성합니다.",
        },
      ],
      previewTitle: "딜 데스크 어시스턴트",
      previewBoardTitle: "영업 Q&A",
      previewTableHeaders: ["질문", "담당자", "답변"],
      previewRequester: "지수",
      previewQuestion: "이번 주 재계약 고객 중 위험 신호가 있는 곳은?",
      previewAnswerTitle: "Onehand 에이전트",
      previewAnswer:
        "3개 계정에서 응답 지연이 보입니다. 담당자에게 후속 이메일 초안과 미팅 제안을 만들었습니다.",
      cardsLabel: "맞춤 에이전트가 처리할 수 있는 일",
      cards: [
        "신규 리드 분류",
        "견적 후속 알림",
        "보안 질문 답변",
        "주간 매출 리포트",
        "맞춤 에이전트 만들기",
      ],
    },
    workspace: {
      eyebrow: "연결된 워크스페이스",
      title: "문서, 고객, 업무가 같은 맥락을 공유합니다.",
      description:
        "영업 활동의 흩어진 단서를 하나의 워크스페이스로 연결해 팀이 같은 화면에서 판단하게 합니다.",
      previewTitle: "계정",
      previewEyebrow: "연결된 기록",
      agentLabel: "에이전트",
      metricLabels: ["딜", "응답", "업무"],
      views: [
        {
          title: "고객 기록",
          description: "회사, 담당자, 대화 내역을 한 곳에 모읍니다.",
        },
        {
          title: "딜 진행",
          description: "단계별 상태와 위험 신호를 바로 확인합니다.",
        },
        {
          title: "회의 노트",
          description: "논의 내용과 다음 액션을 자동으로 정리합니다.",
        },
      ],
      tableHeaders: ["계정", "상태", "다음 액션"],
      rows: [
        ["Acme Korea", "진행", "가격 승인"],
        ["Blue Retail", "후속", "데모 일정"],
        ["North Labs", "성사", "온보딩"],
      ],
      detailTitle: "Acme Korea",
      detailItems: [
        {
          title: "최근 대화",
          description: "예산 승인 전에 보안 체크리스트를 요청했습니다.",
        },
        {
          title: "추천 액션",
          description: "법무 검토 자료와 다음 주 미팅 슬롯을 보내세요.",
        },
      ],
    },
    final: {
      title: "오늘 Onehand를 시작하세요.",
      description: "작게 시작해도 팀의 기록과 자동화 방식은 처음부터 같은 기준으로 쌓입니다.",
      primaryCta: "Onehand 시작",
      secondaryCta: "데모 요청",
    },
    footer: {
      tagline: "세일즈 팀을 위한 AI 워크스페이스",
      socialLabel: "Onehand 채널",
      columns: [
        {
          title: "Product",
          links: ["Workspace", "AI agents", "Pipeline", "Integrations"],
        },
        {
          title: "Company",
          links: ["About", "Careers", "Security", "Status"],
        },
        {
          title: "Resources",
          links: ["Help center", "Pricing", "Blog", "Templates"],
        },
        {
          title: "Onehand for",
          links: ["Enterprise", "Sales teams", "Startups", "Partners"],
        },
      ],
    },
  },
  ja: {
    hero: {
      eyebrow: "",
      rotatingItems: [
        { label: "営業", suffix: "はシンプルです。" },
        { label: "モバイル", suffix: "はシンプルです。" },
        { label: "Onehand", suffix: "はシンプルです。" },
        { label: "AI", suffix: "はシンプルです。" },
        { label: "すべて", suffix: "はシンプルです。" },
      ],
      description:
        "顧客との会話、予定、提案書、フォローアップを一か所に集め、反復的な営業業務を自動化します。",
      primaryCta: "Onehandを始める",
      secondaryCta: "デモを依頼",
    },
    partnerLabel: "記録を活かし、反復作業を減らすチームのために",
    partnerItems: ["CRM", "メール", "カレンダー", "メッセンジャー", "ドキュメント", "シート"],
    mock: {
      workspaceName: "Onehand HQ",
      sidebar: ["ホーム", "商談", "会社", "タスク", "会議"],
      queueLabel: "エージェントキュー",
      sectionLabel: "ワークスペース",
      shareAction: "共有",
      newAction: "新規",
      boardTitle: "売上パイプライン",
      columns: [
        {
          label: "新規",
          count: "12",
          cards: ["リード優先度を整理", "問い合わせを割り当て"],
        },
        {
          label: "進行中",
          count: "8",
          cards: ["見積もりを確認", "デモ日程を確定"],
        },
        {
          label: "フォロー",
          count: "5",
          cards: ["議事録を要約", "次のアクションを送信"],
        },
        {
          label: "成立",
          count: "21",
          cards: ["契約チェックリスト", "オンボーディング準備"],
        },
      ],
    },
    work: {
      eyebrow: "カスタムエージェント",
      title: "営業を 24 時間止めない。",
      description:
        "問い合わせが届いた時も会議が終わった時も、エージェントが記録を読み次の仕事を作ります。",
      tabs: [
        {
          title: "Q&A エージェント",
          description: "営業資料と顧客履歴から回答をすぐに探します。",
        },
        {
          title: "タスクルーティング",
          description: "担当者、期限、優先度を自動で整理します。",
        },
        {
          title: "通知エージェント",
          description: "見落としやすいフォローアップをチームへ送ります。",
        },
        {
          title: "セキュリティ確認",
          description: "機密情報と承認フローを分けて管理します。",
        },
        {
          title: "自分で作成",
          description: "チーム独自の反復業務をエージェント化します。",
        },
      ],
      previewTitle: "ディールデスクアシスタント",
      previewBoardTitle: "営業 Q&A",
      previewTableHeaders: ["質問", "担当", "回答"],
      previewRequester: "田中",
      previewQuestion: "今週更新予定の顧客でリスクがあるものは？",
      previewAnswerTitle: "Onehand エージェント",
      previewAnswer:
        "3 件のアカウントで返信遅延があります。担当者向けにフォローアップメール案と面談候補を作成しました。",
      cardsLabel: "カスタムエージェントが処理できること",
      cards: [
        "新規リードの分類",
        "見積もりフォロー通知",
        "セキュリティ質問への回答",
        "週次売上レポート",
        "カスタムエージェント作成",
      ],
    },
    workspace: {
      eyebrow: "接続されたワークスペース",
      title: "ドキュメント、顧客、タスクが同じ文脈を共有します。",
      description:
        "営業活動に散らばる手がかりを一つのワークスペースにつなぎ、チームが同じ画面で判断できます。",
      previewTitle: "アカウント",
      previewEyebrow: "接続された記録",
      agentLabel: "エージェント",
      metricLabels: ["商談", "返信", "タスク"],
      views: [
        {
          title: "顧客記録",
          description: "会社、担当者、会話履歴を一か所に集めます。",
        },
        {
          title: "商談進行",
          description: "段階ごとの状態とリスクをすぐ確認します。",
        },
        {
          title: "会議ノート",
          description: "議論と次のアクションを自動で整理します。",
        },
      ],
      tableHeaders: ["アカウント", "状態", "次のアクション"],
      rows: [
        ["Acme Japan", "進行中", "価格承認"],
        ["Blue Retail", "フォロー", "デモ日程"],
        ["North Labs", "成立", "オンボーディング"],
      ],
      detailTitle: "Acme Japan",
      detailItems: [
        {
          title: "最近の会話",
          description: "予算承認前にセキュリティチェックリストを依頼しました。",
        },
        {
          title: "おすすめアクション",
          description: "法務レビュー資料と来週の面談候補を送信します。",
        },
      ],
    },
    final: {
      title: "今日から Onehand を始めましょう。",
      description: "小さく始めても、記録と自動化の基準は最初からチーム全体でそろいます。",
      primaryCta: "Onehandを始める",
      secondaryCta: "デモを依頼",
    },
    footer: {
      tagline: "営業チームのための AI ワークスペース",
      socialLabel: "Onehand チャンネル",
      columns: [
        {
          title: "Product",
          links: ["Workspace", "AI agents", "Pipeline", "Integrations"],
        },
        {
          title: "Company",
          links: ["About", "Careers", "Security", "Status"],
        },
        {
          title: "Resources",
          links: ["Help center", "Pricing", "Blog", "Templates"],
        },
        {
          title: "Onehand for",
          links: ["Enterprise", "Sales teams", "Startups", "Partners"],
        },
      ],
    },
  },
  "zh-TW": {
    hero: {
      eyebrow: "",
      rotatingItems: [
        { label: "销售", suffix: "很简单。" },
        { label: "移动端", suffix: "很简单。" },
        { label: "Onehand", suffix: "很简单。" },
        { label: "AI", suffix: "很简单。" },
        { label: "一切", suffix: "都很简单。" },
      ],
      description:
        "把客户对话、日程、提案和跟进任务集中到一处，并自动化重复的销售运营。",
      primaryCta: "开始使用 Onehand",
      secondaryCta: "预约演示",
    },
    partnerLabel: "为减少重复工作、激活销售记录的团队而建",
    partnerItems: ["CRM", "邮箱", "日历", "消息", "文档", "表格"],
    mock: {
      workspaceName: "Onehand HQ",
      sidebar: ["首页", "商机", "公司", "任务", "会议"],
      queueLabel: "代理队列",
      sectionLabel: "工作区",
      shareAction: "共享",
      newAction: "新建",
      boardTitle: "收入管道",
      columns: [
        {
          label: "新线索",
          count: "12",
          cards: ["整理线索优先级", "分配入站咨询"],
        },
        {
          label: "进行中",
          count: "8",
          cards: ["审核报价", "确认演示日程"],
        },
        {
          label: "跟进",
          count: "5",
          cards: ["总结会议记录", "发送下一步行动"],
        },
        {
          label: "成交",
          count: "21",
          cards: ["合同检查清单", "准备客户启用"],
        },
      ],
    },
    work: {
      eyebrow: "自定义代理",
      title: "让销售 24 小时持续推进。",
      description:
        "无论咨询进入还是会议结束，代理都会读取记录并创建下一步任务。",
      tabs: [
        {
          title: "Q&A 代理",
          description: "从销售资料和客户历史中快速找到答案。",
        },
        {
          title: "任务路由",
          description: "自动整理负责人、截止日期和优先级。",
        },
        {
          title: "提醒代理",
          description: "把容易遗漏的跟进任务发送到团队频道。",
        },
        {
          title: "安全审核",
          description: "分离管理敏感信息和审批流程。",
        },
        {
          title: "自定义创建",
          description: "把团队的重复流程配置成代理。",
        },
      ],
      previewTitle: "商机工作台助手",
      previewBoardTitle: "销售问答",
      previewTableHeaders: ["问题", "负责人", "答案"],
      previewRequester: "陈伟",
      previewQuestion: "本周续约客户中有哪些风险信号？",
      previewAnswerTitle: "Onehand 代理",
      previewAnswer:
        "3 个账户出现响应延迟。我已为负责人生成跟进邮件草稿和会议建议时间。",
      cardsLabel: "自定义代理可以处理",
      cards: [
        "分类新线索",
        "报价跟进提醒",
        "回答安全问题",
        "每周收入报告",
        "创建自定义代理",
      ],
    },
    workspace: {
      eyebrow: "互联工作区",
      title: "文档、客户和任务共享同一上下文。",
      description:
        "把销售活动中分散的线索连接到一个工作区，让团队在同一画面中判断。",
      previewTitle: "账户",
      previewEyebrow: "已连接记录",
      agentLabel: "代理",
      metricLabels: ["商机", "回复", "任务"],
      views: [
        {
          title: "客户记录",
          description: "集中公司、联系人和对话历史。",
        },
        {
          title: "交易进度",
          description: "快速查看每个阶段的状态和风险。",
        },
        {
          title: "会议笔记",
          description: "自动整理讨论内容和下一步行动。",
        },
      ],
      tableHeaders: ["账户", "状态", "下一步"],
      rows: [
        ["Acme Taiwan", "进行中", "价格审批"],
        ["Blue Retail", "跟进", "演示日程"],
        ["North Labs", "成交", "客户启用"],
      ],
      detailTitle: "Acme Taiwan",
      detailItems: [
        {
          title: "最近对话",
          description: "客户在预算批准前请求安全检查清单。",
        },
        {
          title: "建议行动",
          description: "发送法务审核材料和下周会议时间。",
        },
      ],
    },
    final: {
      title: "今天开始使用 Onehand。",
      description: "即使从小范围开始，团队的记录和自动化标准也能从第一天保持一致。",
      primaryCta: "开始使用 Onehand",
      secondaryCta: "预约演示",
    },
    footer: {
      tagline: "面向销售团队的 AI 工作区",
      socialLabel: "Onehand 频道",
      columns: [
        {
          title: "Product",
          links: ["Workspace", "AI agents", "Pipeline", "Integrations"],
        },
        {
          title: "Company",
          links: ["About", "Careers", "Security", "Status"],
        },
        {
          title: "Resources",
          links: ["Help center", "Pricing", "Blog", "Templates"],
        },
        {
          title: "Onehand for",
          links: ["Enterprise", "Sales teams", "Startups", "Partners"],
        },
      ],
    },
  },
  "en-US": {
    hero: {
      eyebrow: "",
      rotatingItems: [
        { label: "Sales", suffix: "is Simple." },
        { label: "Mobile", suffix: "is Simple." },
        { label: "Onehand", suffix: "is Simple." },
        { label: "AI", suffix: "is Simple." },
        { label: "Everything", suffix: "is Simple." },
      ],
      description:
        "Organize customer conversations, schedules, proposals, and follow-ups in one place while agents automate repeated sales work.",
      primaryCta: "Get Onehand",
      secondaryCta: "Request a demo",
    },
    partnerLabel: "Built for teams that turn records into revenue",
    partnerItems: ["CRM", "Email", "Calendar", "Messenger", "Docs", "Sheets"],
    mock: {
      workspaceName: "Onehand HQ",
      sidebar: ["Home", "Deals", "Companies", "Tasks", "Meetings"],
      queueLabel: "Agent queue",
      sectionLabel: "Workspace",
      shareAction: "Share",
      newAction: "New",
      boardTitle: "Revenue pipeline",
      columns: [
        {
          label: "New",
          count: "12",
          cards: ["Prioritize inbound leads", "Assign website requests"],
        },
        {
          label: "In progress",
          count: "8",
          cards: ["Review quote", "Confirm demo slot"],
        },
        {
          label: "Follow-up",
          count: "5",
          cards: ["Summarize call notes", "Send next steps"],
        },
        {
          label: "Closed",
          count: "21",
          cards: ["Contract checklist", "Prepare onboarding"],
        },
      ],
    },
    work: {
      eyebrow: "Custom Agents",
      title: "Keep sales moving 24/7.",
      description:
        "When a question lands or a meeting ends, agents read the record and create the next piece of work.",
      tabs: [
        {
          title: "Q&A agents",
          description: "Find answers inside sales collateral and customer history.",
        },
        {
          title: "Task routing",
          description: "Assign owners, due dates, and priorities automatically.",
        },
        {
          title: "Reminder agents",
          description: "Send easy-to-miss follow-ups into team channels.",
        },
        {
          title: "Security review",
          description: "Separate sensitive data and approval workflows.",
        },
        {
          title: "Create your own",
          description: "Turn your repeated team process into an agent.",
        },
      ],
      previewTitle: "Deal desk assistant",
      previewBoardTitle: "Sales Q&A",
      previewTableHeaders: ["Question", "Owner", "Answer"],
      previewRequester: "Jason",
      previewQuestion: "Which renewal accounts show risk this week?",
      previewAnswerTitle: "Onehand agent",
      previewAnswer:
        "Three accounts have response delays. I drafted follow-up emails and suggested meeting times for each owner.",
      cardsLabel: "What Custom Agents can do",
      cards: [
        "Triage new leads",
        "Follow up on quotes",
        "Answer security questions",
        "Report weekly revenue",
        "Create a custom agent",
      ],
    },
    workspace: {
      eyebrow: "Connected workspace",
      title: "Docs, customers, and tasks share the same context.",
      description:
        "Connect the scattered clues of sales activity into one workspace, so teams can make decisions from the same screen.",
      previewTitle: "Accounts",
      previewEyebrow: "Connected records",
      agentLabel: "Agent",
      metricLabels: ["Deals", "Replies", "Tasks"],
      views: [
        {
          title: "Customer records",
          description: "Keep companies, contacts, and conversations together.",
        },
        {
          title: "Deal progress",
          description: "See stage status and risk signals at a glance.",
        },
        {
          title: "Meeting notes",
          description: "Summarize decisions and next actions automatically.",
        },
      ],
      tableHeaders: ["Account", "Status", "Next action"],
      rows: [
        ["Acme North", "In progress", "Price approval"],
        ["Blue Retail", "Follow-up", "Demo slot"],
        ["North Labs", "Closed", "Onboarding"],
      ],
      detailTitle: "Acme North",
      detailItems: [
        {
          title: "Latest conversation",
          description: "The buyer requested a security checklist before budget approval.",
        },
        {
          title: "Suggested action",
          description: "Send the legal review packet and meeting options for next week.",
        },
      ],
    },
    final: {
      title: "Get started today.",
      description: "",
      primaryCta: "Get Onehand",
      secondaryCta: "Request a demo",
    },
    footer: {
      tagline: "",
      socialLabel: "Onehand channels",
      columns: [
        {
          title: "Product",
          links: ["Workspace", "AI agents", "Pipeline", "Integrations"],
        },
        {
          title: "Company",
          links: ["About", "Careers", "Security", "Status"],
        },
        {
          title: "Resources",
          links: ["Help center", "Pricing", "Blog", "Templates"],
        },
        {
          title: "Onehand for",
          links: ["Enterprise", "Sales teams", "Startups", "Partners"],
        },
      ],
    },
  },
  "en-GB": {
    hero: {
      eyebrow: "",
      rotatingItems: [
        { label: "Sales", suffix: "is Simple." },
        { label: "Mobile", suffix: "is Simple." },
        { label: "Onehand", suffix: "is Simple." },
        { label: "AI", suffix: "is Simple." },
        { label: "Everything", suffix: "is Simple." },
      ],
      description:
        "Organise customer conversations, schedules, proposals, and follow-ups in one place while agents automate repeated sales work.",
      primaryCta: "Get Onehand",
      secondaryCta: "Request a demo",
    },
    partnerLabel: "Built for teams that turn records into revenue",
    partnerItems: ["CRM", "Email", "Calendar", "Messenger", "Docs", "Sheets"],
    mock: {
      workspaceName: "Onehand HQ",
      sidebar: ["Home", "Deals", "Companies", "Tasks", "Meetings"],
      queueLabel: "Agent queue",
      sectionLabel: "Workspace",
      shareAction: "Share",
      newAction: "New",
      boardTitle: "Revenue pipeline",
      columns: [
        {
          label: "New",
          count: "12",
          cards: ["Prioritise inbound leads", "Assign website requests"],
        },
        {
          label: "In progress",
          count: "8",
          cards: ["Review quote", "Confirm demo slot"],
        },
        {
          label: "Follow-up",
          count: "5",
          cards: ["Summarise call notes", "Send next steps"],
        },
        {
          label: "Closed",
          count: "21",
          cards: ["Contract checklist", "Prepare onboarding"],
        },
      ],
    },
    work: {
      eyebrow: "Custom Agents",
      title: "Keep sales moving 24/7.",
      description:
        "When a question lands or a meeting ends, agents read the record and create the next piece of work.",
      tabs: [
        {
          title: "Q&A agents",
          description: "Find answers inside sales collateral and customer history.",
        },
        {
          title: "Task routing",
          description: "Assign owners, due dates, and priorities automatically.",
        },
        {
          title: "Reminder agents",
          description: "Send easy-to-miss follow-ups into team channels.",
        },
        {
          title: "Security review",
          description: "Separate sensitive data and approval workflows.",
        },
        {
          title: "Create your own",
          description: "Turn your repeated team process into an agent.",
        },
      ],
      previewTitle: "Deal desk assistant",
      previewBoardTitle: "Sales Q&A",
      previewTableHeaders: ["Question", "Owner", "Answer"],
      previewRequester: "Oliver",
      previewQuestion: "Which renewal accounts show risk this week?",
      previewAnswerTitle: "Onehand agent",
      previewAnswer:
        "Three accounts have response delays. I drafted follow-up emails and suggested meeting times for each owner.",
      cardsLabel: "What Custom Agents can do",
      cards: [
        "Triage new leads",
        "Follow up on quotes",
        "Answer security questions",
        "Report weekly revenue",
        "Create a custom agent",
      ],
    },
    workspace: {
      eyebrow: "Connected workspace",
      title: "Docs, customers, and tasks share the same context.",
      description:
        "Connect the scattered clues of sales activity into one workspace, so teams can make decisions from the same screen.",
      previewTitle: "Accounts",
      previewEyebrow: "Connected records",
      agentLabel: "Agent",
      metricLabels: ["Deals", "Replies", "Tasks"],
      views: [
        {
          title: "Customer records",
          description: "Keep companies, contacts, and conversations together.",
        },
        {
          title: "Deal progress",
          description: "See stage status and risk signals at a glance.",
        },
        {
          title: "Meeting notes",
          description: "Summarise decisions and next actions automatically.",
        },
      ],
      tableHeaders: ["Account", "Status", "Next action"],
      rows: [
        ["Acme North", "In progress", "Price approval"],
        ["Blue Retail", "Follow-up", "Demo slot"],
        ["North Labs", "Closed", "Onboarding"],
      ],
      detailTitle: "Acme North",
      detailItems: [
        {
          title: "Latest conversation",
          description: "The buyer requested a security checklist before budget approval.",
        },
        {
          title: "Suggested action",
          description: "Send the legal review packet and meeting options for next week.",
        },
      ],
    },
    final: {
      title: "Get started today.",
      description: "",
      primaryCta: "Get Onehand",
      secondaryCta: "Request a demo",
    },
    footer: {
      tagline: "",
      socialLabel: "Onehand channels",
      columns: [
        {
          title: "Product",
          links: ["Workspace", "AI agents", "Pipeline", "Integrations"],
        },
        {
          title: "Company",
          links: ["About", "Careers", "Security", "Status"],
        },
        {
          title: "Resources",
          links: ["Help centre", "Pricing", "Blog", "Templates"],
        },
        {
          title: "Onehand for",
          links: ["Enterprise", "Sales teams", "Startups", "Partners"],
        },
      ],
    },
  },
};

const heroPersonas: readonly {
  readonly icon: IconType;
  readonly tone: string;
  readonly label: string;
}[] = [
  {
    icon: Users,
    tone: "border-[#0075DE] bg-[#e8f3ff] text-[#0075DE]",
    label: "team",
  },
  {
    icon: BriefcaseBusiness,
    tone: "border-[#111111] bg-white text-[#111111]",
    label: "sales",
  },
  {
    icon: MessageSquareText,
    tone: "border-[#ff5a45] bg-[#ffe9e4] text-[#d83b28]",
    label: "conversation",
  },
  {
    icon: CalendarDays,
    tone: "border-[#f3b321] bg-[#fff3ce] text-[#9d6a00]",
    label: "calendar",
  },
  {
    icon: CircleDollarSign,
    tone: "border-[#2f9f9a] bg-[#e6f7f6] text-[#0f7f7a]",
    label: "revenue",
  },
  {
    icon: Sparkles,
    tone: "border-[#a96bff] bg-[#f2eaff] text-[#7b37d7]",
    label: "agent",
  },
];

const sidebarIcons: readonly IconType[] = [
  Search,
  FolderKanban,
  Building2,
  Users,
  CalendarDays,
];

const workTabVisuals: readonly {
  readonly icon: IconType;
  readonly tone: string;
}[] = [
  { icon: MessageCircle, tone: "bg-[#fff0e4] text-[#d9571f]" },
  { icon: FolderKanban, tone: "bg-[#eee7ff] text-[#7547d8]" },
  { icon: Bell, tone: "bg-[#e7f4ff] text-[#0075DE]" },
  { icon: ShieldCheck, tone: "bg-[#e8f7ef] text-[#17824c]" },
  { icon: Sparkles, tone: "bg-[#07134a] text-white" },
];

const workspaceViewVisuals: readonly {
  readonly icon: IconType;
  readonly tone: string;
}[] = [
  { icon: Database, tone: "bg-[#e8f3ff] text-[#0075DE]" },
  { icon: CircleDollarSign, tone: "bg-[#e8f7ef] text-[#16814b]" },
  { icon: FileText, tone: "bg-[#fff1df] text-[#bb6400]" },
];

const assistantCardVisuals: readonly {
  readonly icon: IconType;
  readonly accent: string;
  readonly panel: string;
}[] = [
  { icon: Sparkles, accent: "text-[#0075DE]", panel: "bg-[#fff6d8]" },
  { icon: Search, accent: "text-[#e95a48]", panel: "bg-[#ffe9e4]" },
  { icon: MessageSquareText, accent: "text-[#1f79b8]", panel: "bg-[#e8f3ff]" },
  { icon: CircleDollarSign, accent: "text-[#16814b]", panel: "bg-[#e8f7ef]" },
];

const togetherCardVisuals: readonly {
  readonly icon: IconType;
  readonly accent: string;
  readonly panel: string;
}[] = [
  { icon: FileText, accent: "text-[#238f8d]", panel: "bg-[#dff3f1]" },
  { icon: Database, accent: "text-[#0075DE]", panel: "bg-[#e8f3ff]" },
  { icon: FolderKanban, accent: "text-[#b0744c]", panel: "bg-[#f1d8c5]" },
];

export function AuthLandingPage({
  children,
  isModalOpen,
  onOpenLogin,
}: AuthLandingPageProps) {
  const { language } = usePublicSiteLanguage();
  const copyLanguage = getPublicSiteCopyLanguage(language);
  const scrollProgress = useLandingScrollProgress();
  const copy = landingCopyByLanguage[copyLanguage];
  const expandedCopy = expandedLandingCopyByLanguage[copyLanguage];

  return (
    <div className="min-h-screen bg-[#f7f7f5] text-[#111111]">
      <LandingScrollStyles />
      <PublicSiteHeader onLogin={onOpenLogin} />
      <LandingScrollProgressBar progress={scrollProgress} />
      <main className="pt-14">
        <HeroSection copy={copy} />
        <WorkSection copy={copy} />
        <AssistantsSection copy={expandedCopy.assistants} />
        <TogetherSection copy={expandedCopy.together} />
        <WorkspaceSection copy={copy} />
        <TrustSection copy={expandedCopy.trust} />
        <FinalSection copy={copy} />
      </main>
      {isModalOpen ? children : null}
    </div>
  );
}

function useLandingScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    document.documentElement.classList.add("landing-scrollbar-hidden");
    document.body.classList.add("landing-scrollbar-hidden");

    const updateProgress = () => {
      const scrollableHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const nextProgress =
        scrollableHeight > 0
          ? Math.min(1, Math.max(0, window.scrollY / scrollableHeight))
          : 0;

      setProgress(nextProgress);
    };

    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);

    return () => {
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
      document.documentElement.classList.remove("landing-scrollbar-hidden");
      document.body.classList.remove("landing-scrollbar-hidden");
    };
  }, []);

  return progress;
}

function LandingScrollStyles() {
  return (
    <style>
      {`
        .landing-scrollbar-hidden {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        .landing-scrollbar-hidden::-webkit-scrollbar {
          display: none;
          width: 0;
          height: 0;
        }

        @keyframes landing-hero-word-enter {
          from {
            opacity: 0;
            transform: scale(0.97);
            filter: blur(6px);
          }

          45% {
            opacity: 0.82;
            filter: blur(2px);
          }

          to {
            opacity: 1;
            transform: scale(1);
            filter: blur(0);
          }
        }

        .landing-hero-word-pill {
          transition:
            background-color 1400ms cubic-bezier(0.16, 1, 0.3, 1),
            color 1400ms cubic-bezier(0.16, 1, 0.3, 1);
          will-change: background-color, color;
        }

        .landing-hero-word-enter {
          animation: landing-hero-word-enter 720ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }
      `}
    </style>
  );
}

function LandingScrollProgressBar({
  progress,
}: {
  readonly progress: number;
}) {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-x-0 top-14 z-40 h-px bg-transparent"
    >
      <div
        className="h-full origin-left bg-[#d9d9d4] transition-transform duration-150 ease-out"
        style={{
          transform: `scaleX(${progress})`,
        }}
      />
    </div>
  );
}

function HeroSection({ copy }: { readonly copy: LandingCopy }) {
  const [activeHeroWordIndex, setActiveHeroWordIndex] = useState(0);
  const rotatingItemsCount = copy.hero.rotatingItems.length;
  const activeHeroItem =
    copy.hero.rotatingItems[activeHeroWordIndex % rotatingItemsCount] ??
    copy.hero.rotatingItems[0];
  const activeHeroWordStyle =
    heroRotatingWordStyles[activeHeroWordIndex % heroRotatingWordStyles.length] ??
    heroRotatingWordStyles[0];

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveHeroWordIndex((currentIndex) =>
        (currentIndex + 1) % rotatingItemsCount
      );
    }, 3000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [rotatingItemsCount]);

  return (
    <section className="flex min-h-[calc(100vh-56px)] flex-col overflow-hidden bg-white">
      <div className="mx-auto flex w-full max-w-[1320px] flex-1 flex-col items-center px-4 pb-0 pt-14 text-center sm:px-6 md:pt-20 lg:px-8">
        <div className="flex flex-wrap items-center justify-center gap-2">
          {heroPersonas.map(({ icon: Icon, label, tone }) => (
            <span
              aria-label={label}
              className={`grid h-12 w-12 place-items-center rounded-full border-[3px] ${tone} sm:h-16 sm:w-16`}
              key={label}
            >
              <Icon className="h-5 w-5 sm:h-7 sm:w-7" />
            </span>
          ))}
        </div>

        {copy.hero.eyebrow ? (
          <p className="mt-7 text-[12px] font-black uppercase text-[#0075DE]">
            {copy.hero.eyebrow}
          </p>
        ) : null}
        <h1 className="mt-4 max-w-[1060px] break-keep text-[44px] font-normal leading-[0.98] text-[#0f0f0f] sm:text-[64px] md:text-[78px] lg:text-[94px] xl:text-[96px]">
          <span className="inline-flex flex-wrap items-center justify-center gap-x-[0.16em] gap-y-2 align-middle leading-none">
            <span
              className={[
                "landing-hero-word-pill inline-flex items-center gap-[0.14em] rounded-full px-[0.28em] py-[0.11em] leading-none",
                "font-normal",
                activeHeroWordStyle.className,
              ].join(" ")}
            >
              <span className="h-[0.13em] w-[0.13em] shrink-0 rounded-full bg-current opacity-85" />
              <span
                className="landing-hero-word-enter inline-block text-[0.9em] leading-none"
                key={activeHeroItem.label}
              >
                {activeHeroItem.label}
              </span>
            </span>
            <span className="inline-block leading-none">
              {activeHeroItem.suffix}
            </span>
          </span>
        </h1>

        <p className="mt-6 max-w-[760px] break-keep text-[17px] font-semibold leading-8 text-[#333330] md:text-[20px]">
          {copy.hero.description}
        </p>

        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link
            className="inline-flex h-11 items-center gap-2 rounded-[6px] bg-[#0075DE] px-5 text-[15px] font-black text-white hover:bg-[#006AC8]"
            to="/signup"
          >
            {copy.hero.primaryCta}
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            className="inline-flex h-11 items-center gap-2 rounded-[6px] bg-[#e7f2fc] px-5 text-[15px] font-black text-[#005aa8] hover:bg-[#d8ebfb]"
            to="/contact"
          >
            {copy.hero.secondaryCta}
          </Link>
        </div>

        <div className="mt-10 w-full flex-1">
          <ProductWorkspaceMock copy={copy} />
        </div>
      </div>

      <PartnerStrip copy={copy} />
    </section>
  );
}

function ProductWorkspaceMock({ copy }: { readonly copy: LandingCopy }) {
  return (
    <div className="mx-auto flex h-full min-h-[360px] max-w-[1060px] items-end">
      <div className="w-full overflow-hidden rounded-t-[8px] border border-[#dededa] bg-white shadow-[0_34px_110px_rgba(15,15,15,0.13)]">
        <div className="flex h-10 items-center gap-2 border-b border-[#eeeeec] bg-[#fafaf8] px-4">
          <span className="h-2.5 w-2.5 rounded-full bg-[#d8d8d3]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#d8d8d3]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#d8d8d3]" />
          <span className="ml-3 text-[12px] font-black text-[#555550]">
            {copy.mock.workspaceName}
          </span>
        </div>

        <div className="grid min-h-[320px] sm:grid-cols-[170px_1fr] md:grid-cols-[210px_1fr]">
          <aside className="hidden border-r border-[#eeeeec] bg-[#f7f7f5] p-4 sm:block">
            <div className="grid gap-1.5">
              {copy.mock.sidebar.map((item, index) => {
                const Icon = sidebarIcons[index] ?? Search;

                return (
                  <span
                    className={[
                      "flex h-8 items-center gap-2 rounded-[6px] px-2 text-[12px] font-bold",
                      index === 0
                        ? "bg-white text-[#111111] shadow-sm"
                        : "text-[#62625c]",
                    ].join(" ")}
                    key={item}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {item}
                  </span>
                );
              })}
            </div>

            <div className="mt-8 rounded-[8px] border border-[#e4e4df] bg-white p-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#0075DE]" />
                <span className="text-[12px] font-black">
                  {copy.mock.queueLabel}
                </span>
              </div>
              <div className="mt-3 space-y-2">
                <span className="block h-2 rounded-full bg-[#e7e7e2]" />
                <span className="block h-2 w-3/4 rounded-full bg-[#e7e7e2]" />
                <span className="block h-2 w-5/6 rounded-full bg-[#e7e7e2]" />
              </div>
            </div>
          </aside>

          <div className="min-w-0 p-4 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-3">
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-[#eef6ff]">
                    <BriefcaseBusiness className="h-6 w-6 text-[#0075DE]" />
                  </span>
                  <div>
                    <p className="text-[12px] font-black uppercase text-[#777770]">
                      {copy.mock.sectionLabel}
                    </p>
                    <h2 className="text-[24px] font-black text-[#222220] sm:text-[30px]">
                      {copy.mock.boardTitle}
                    </h2>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="hidden h-8 items-center rounded-[6px] bg-[#f1f1ef] px-3 text-[12px] font-bold text-[#555550] sm:inline-flex">
                  {copy.mock.shareAction}
                </span>
                <span className="inline-flex h-8 items-center rounded-[6px] bg-[#0075DE] px-3 text-[12px] font-black text-white">
                  {copy.mock.newAction}
                </span>
              </div>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-4">
              {copy.mock.columns.map((column, index) => (
                <div
                  className="min-h-[154px] rounded-[8px] border border-[#eeeeec] bg-[#fbfbfa] p-3"
                  key={column.label}
                >
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-[12px] font-black text-[#333330]">
                      <span
                        className={[
                          "h-2.5 w-2.5 rounded-full",
                          index === 0
                            ? "bg-[#ad7bd9]"
                            : index === 1
                              ? "bg-[#f0b13b]"
                              : index === 2
                                ? "bg-[#58a4e8]"
                                : "bg-[#5cbf86]",
                        ].join(" ")}
                      />
                      {column.label}
                    </span>
                    <span className="text-[11px] font-black text-[#777770]">
                      {column.count}
                    </span>
                  </div>
                  <div className="mt-3 space-y-2">
                    {column.cards.map((card) => (
                      <div
                        className="min-h-[42px] rounded-[6px] border border-[#eeeeec] bg-white p-2 text-left text-[12px] font-bold leading-5 text-[#333330]"
                        key={card}
                      >
                        {card}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PartnerStrip({ copy }: { readonly copy: LandingCopy }) {
  return (
    <div className="border-t border-[#e8e8e4] bg-white">
      <div className="mx-auto flex min-h-14 w-full max-w-[1320px] flex-col items-center gap-3 px-4 py-4 sm:px-6 md:flex-row md:justify-center lg:px-8">
        <span className="text-center text-[12px] font-bold uppercase text-[#777770]">
          {copy.partnerLabel}
        </span>
        <span className="hidden text-[#b6b6b0] md:inline">/</span>
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-[15px] font-black text-[#444440]">
          {copy.partnerItems.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function WorkSection({ copy }: { readonly copy: LandingCopy }) {
  const defaultVisual = {
    icon: MessageCircle,
    tone: "bg-[#fff0e4] text-[#d9571f]",
  };

  return (
    <section className="min-h-screen bg-[#f7f7f5] py-16 sm:py-20 lg:py-24">
      <div className="mx-auto w-full max-w-[1320px] px-4 sm:px-6 lg:px-8">
        <p className="text-[12px] font-black uppercase text-[#0075DE]">
          {copy.work.eyebrow}
        </p>
        <div className="mt-3 grid gap-5 lg:grid-cols-[0.95fr_1fr] lg:items-end">
          <h2 className="max-w-[760px] break-keep text-[42px] font-black leading-[1.02] text-[#0f0f0f] sm:text-[58px] lg:text-[54px]">
            {copy.work.title}
          </h2>
          <p className="max-w-[560px] break-keep text-[17px] font-semibold leading-8 text-[#555550] lg:justify-self-end">
            {copy.work.description}
          </p>
        </div>

        <div className="mt-9 grid overflow-hidden rounded-[8px] border border-[#e4e4df] bg-white lg:min-h-[570px] lg:grid-cols-[0.82fr_1.18fr]">
          <div className="flex flex-col justify-between p-5 sm:p-7">
            <div>
              <div className="inline-flex h-10 items-center rounded-full bg-[#111111] px-4 text-[13px] font-black text-white">
                {copy.work.eyebrow}
              </div>
              <h3 className="mt-5 max-w-[420px] text-[24px] font-black leading-tight text-[#111111] sm:text-[30px]">
                {copy.work.tabs[0]?.title}
              </h3>
            </div>

            <div className="mt-10 divide-y divide-[#eeeeec]">
              {copy.work.tabs.map((tab, index) => {
                const visual = workTabVisuals[index] ?? defaultVisual;
                const Icon = visual.icon;

                return (
                  <div className="flex gap-3 py-4" key={tab.title}>
                    <span
                      className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${visual.tone}`}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <h4 className="text-[15px] font-black text-[#111111]">
                        {tab.title}
                      </h4>
                      <p className="mt-1 text-[13px] font-semibold leading-6 text-[#666660]">
                        {tab.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <AutomationPreview copy={copy} />
        </div>

        <div className="mt-8">
          <p className="text-[13px] font-bold text-[#777770]">
            {copy.work.cardsLabel}
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {copy.work.cards.map((card, index) => (
              <Link
                className={[
                  "group flex min-h-[118px] flex-col justify-between rounded-[8px] border p-5 text-left text-[16px] font-black leading-6",
                  index === copy.work.cards.length - 1
                    ? "border-[#07134a] bg-[#07134a] text-white"
                    : "border-[#dededa] bg-white text-[#111111] hover:border-[#b8d8f4]",
                ].join(" ")}
                key={card}
                to="/contact"
              >
                <span>{card}</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function AutomationPreview({ copy }: { readonly copy: LandingCopy }) {
  return (
    <div className="relative min-h-[520px] overflow-hidden border-t border-[#eeeeec] bg-[#fff1e6] p-5 sm:p-7 lg:border-l lg:border-t-0">
      <div className="absolute inset-x-0 top-0 h-10 bg-[#ffd8bf]" />
      <div className="relative mt-5 h-full rounded-[8px] border border-[#eeeeec] bg-white p-5 shadow-[0_24px_90px_rgba(115,67,30,0.16)] sm:p-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[12px] font-black uppercase text-[#c06620]">
              {copy.work.previewTitle}
            </p>
            <h3 className="mt-2 text-[34px] font-black leading-none text-[#ddddda] sm:text-[48px]">
              {copy.work.previewBoardTitle}
            </h3>
          </div>
          <span className="grid h-10 w-10 place-items-center rounded-full bg-[#f7f7f5]">
            <ArrowRight className="h-5 w-5" />
          </span>
        </div>

        <div className="mt-10 grid gap-3 text-[13px] font-bold text-[#b8b8b2]">
          <div className="grid grid-cols-[1fr_0.5fr_0.6fr] gap-3 border-b border-[#eeeeec] pb-3">
            {copy.work.previewTableHeaders.map((header) => (
              <span key={header}>{header}</span>
            ))}
          </div>
          {[0, 1, 2, 3, 4].map((row) => (
            <div
              className="grid grid-cols-[1fr_0.5fr_0.6fr] gap-3 border-b border-[#f0f0ed] pb-3 opacity-55"
              key={row}
            >
              <span className="h-3 rounded-full bg-[#ecece8]" />
              <span className="h-3 rounded-full bg-[#ecece8]" />
              <span className="h-3 rounded-full bg-[#ecece8]" />
            </div>
          ))}
        </div>

        <div className="absolute bottom-9 right-5 w-[min(520px,calc(100%-40px))] overflow-hidden rounded-[8px] border border-[#e2e2dc] bg-white shadow-[0_20px_60px_rgba(15,15,15,0.16)] sm:right-10">
          <div className="flex gap-4 border-b border-[#eeeeec] p-5">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#eeeeec]">
              <Users className="h-6 w-6 text-[#111111]" />
            </span>
            <div>
              <p className="text-[13px] font-black text-[#777770]">
                {copy.work.previewRequester}
              </p>
              <p className="mt-1 break-keep text-[20px] font-black leading-tight text-[#111111]">
                {copy.work.previewQuestion}
              </p>
            </div>
          </div>
          <div className="flex gap-4 p-5">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-[8px] bg-[#ff8a34] text-white">
              <MessageCircle className="h-6 w-6" />
            </span>
            <div>
              <p className="text-[18px] font-black text-[#111111]">
                {copy.work.previewAnswerTitle}
              </p>
              <p className="mt-1 break-keep text-[17px] font-bold leading-7 text-[#111111]">
                {copy.work.previewAnswer}
              </p>
            </div>
          </div>
        </div>

        <div className="absolute bottom-4 left-5 flex items-center gap-2 rounded-full bg-white px-3 py-2 shadow-[0_12px_30px_rgba(15,15,15,0.12)]">
          <Clock3 className="h-4 w-4 text-[#0075DE]" />
          <span className="text-[12px] font-black text-[#333330]">24/7</span>
        </div>
      </div>
    </div>
  );
}

function AssistantsSection({
  copy,
}: {
  readonly copy: ExpandedLandingCopy["assistants"];
}) {
  return (
    <section className="bg-white py-16 sm:py-20 lg:py-24">
      <div className="mx-auto w-full max-w-[1320px] px-4 sm:px-6 lg:px-8">
        <div className="max-w-[760px]">
          <p className="text-[12px] font-black uppercase text-[#0075DE]">
            {copy.eyebrow}
          </p>
          <h2 className="mt-3 break-keep text-[40px] font-black leading-[1.05] text-[#0f0f0f] sm:text-[54px]">
            {copy.title}
          </h2>
          <p className="mt-4 break-keep text-[17px] font-semibold leading-8 text-[#555550]">
            {copy.description}
          </p>
        </div>

        <div className="mt-9 grid gap-4 lg:grid-cols-2">
          {copy.cards.map((card, index) => (
            <AssistantFeatureCard
              card={card}
              index={index}
              key={card.title}
              previewCopy={copy}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function AssistantFeatureCard({
  card,
  index,
  previewCopy,
}: {
  readonly card: ExpandedFeatureCopy;
  readonly index: number;
  readonly previewCopy: ExpandedLandingCopy["assistants"];
}) {
  const visual = assistantCardVisuals[index] ?? assistantCardVisuals[0]!;
  const Icon = visual.icon;

  return (
    <article className="overflow-hidden rounded-[8px] border border-[#dededa] bg-white">
      <div className="flex items-start justify-between gap-4 p-5 sm:p-6">
        <div>
          <p className="text-[12px] font-black uppercase text-[#777770]">
            {card.eyebrow}
          </p>
          <h3 className="mt-2 max-w-[420px] break-keep text-[24px] font-black leading-tight text-[#111111]">
            {card.title}
          </h3>
          <p className="mt-3 max-w-[520px] break-keep text-[14px] font-semibold leading-7 text-[#666660]">
            {card.description}
          </p>
        </div>
        <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${visual.panel}`}>
          <Icon className={`h-5 w-5 ${visual.accent}`} />
        </span>
      </div>

      <AssistantPreview
        card={card}
        index={index}
        previewCopy={previewCopy}
        visual={visual}
      />
    </article>
  );
}

function AssistantPreview({
  card,
  index,
  previewCopy,
  visual,
}: {
  readonly card: ExpandedFeatureCopy;
  readonly index: number;
  readonly previewCopy: ExpandedLandingCopy["assistants"];
  readonly visual: (typeof assistantCardVisuals)[number];
}) {
  if (index === 1) {
    return (
      <div className={`border-t border-[#eeeeec] p-5 ${visual.panel}`}>
        <div className="rounded-[8px] border border-[#dededa] bg-white p-4">
          <div className="flex items-center gap-2 rounded-[6px] border border-[#eeeeec] px-3 py-2">
            <Search className="h-4 w-4 text-[#777770]" />
            <span className="text-[13px] font-bold text-[#333330]">
              {previewCopy.previewSearchQuery}
            </span>
          </div>
          <div className="mt-4 grid gap-2">
            {card.items.map((item) => (
              <div className="flex items-center gap-3 rounded-[6px] bg-[#fbfbfa] p-3" key={item}>
                <span className="h-2.5 w-2.5 rounded-full bg-[#e95a48]" />
                <span className="text-[12px] font-bold text-[#333330]">
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (index === 2) {
    return (
      <div className={`border-t border-[#eeeeec] p-5 ${visual.panel}`}>
        <div className="rounded-[8px] border border-[#dededa] bg-white p-4">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-black text-[#111111]">
              {previewCopy.previewMeetingTitle}
            </span>
            <span className="rounded-full bg-[#e8f3ff] px-2 py-1 text-[11px] font-black text-[#0075DE]">
              {previewCopy.previewNotesLabel}
            </span>
          </div>
          <div className="mt-4 space-y-3">
            {card.items.map((item) => (
              <div className="grid gap-1" key={item}>
                <span className="text-[12px] font-black text-[#333330]">
                  {item}
                </span>
                <span className="h-2 rounded-full bg-[#e7e7e2]" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`border-t border-[#eeeeec] p-5 ${visual.panel}`}>
      <div className="rounded-[8px] border border-[#dededa] bg-white p-4">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[8px] bg-[#0075DE] text-white">
            <Sparkles className="h-5 w-5" />
          </span>
          <div>
            <p className="text-[13px] font-black text-[#111111]">
              {previewCopy.previewAgentName}
            </p>
            <p className="mt-1 text-[13px] font-semibold leading-6 text-[#555550]">
              {card.items[0] ?? card.title}
            </p>
          </div>
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          {card.items.map((item) => (
            <span
              className="rounded-[6px] border border-[#eeeeec] bg-[#fbfbfa] p-2 text-[12px] font-bold text-[#333330]"
              key={item}
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function TogetherSection({
  copy,
}: {
  readonly copy: ExpandedLandingCopy["together"];
}) {
  return (
    <section className="bg-[#f7f7f5] py-16 sm:py-20 lg:py-24">
      <div className="mx-auto w-full max-w-[1320px] px-4 sm:px-6 lg:px-8">
        <div className="max-w-[820px]">
          <p className="text-[12px] font-black uppercase text-[#0075DE]">
            {copy.eyebrow}
          </p>
          <h2 className="mt-3 break-keep text-[40px] font-black leading-[1.05] text-[#0f0f0f] sm:text-[54px]">
            {copy.title}
          </h2>
          <p className="mt-4 break-keep text-[17px] font-semibold leading-8 text-[#555550]">
            {copy.description}
          </p>
        </div>

        <div className="mt-9 grid gap-4 lg:grid-cols-3">
          {copy.cards.map((card, index) => (
            <TogetherCard card={card} index={index} key={card.title} />
          ))}
        </div>
      </div>
    </section>
  );
}

function TogetherCard({
  card,
  index,
}: {
  readonly card: ExpandedFeatureCopy;
  readonly index: number;
}) {
  const visual = togetherCardVisuals[index] ?? togetherCardVisuals[0]!;
  const Icon = visual.icon;

  return (
    <article className="overflow-hidden rounded-[8px] border border-[#dededa] bg-white">
      <div className="p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[12px] font-black uppercase text-[#777770]">
              {card.eyebrow}
            </p>
            <h3 className="mt-2 break-keep text-[22px] font-black leading-tight text-[#111111]">
              {card.title}
            </h3>
          </div>
          <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-[8px] ${visual.panel}`}>
            <Icon className={`h-5 w-5 ${visual.accent}`} />
          </span>
        </div>
        <p className="mt-3 break-keep text-[13px] font-semibold leading-6 text-[#666660]">
          {card.description}
        </p>
      </div>

      <div className={`border-t border-[#eeeeec] p-5 ${visual.panel}`}>
        <div className="rounded-[8px] border border-[#dededa] bg-white p-4">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-[13px] font-black text-[#111111]">
              {card.eyebrow}
            </span>
            <ArrowRight className="h-4 w-4 text-[#777770]" />
          </div>
          <div className="grid gap-2">
            {card.items.map((item, itemIndex) => (
              <div
                className="flex min-h-10 items-center justify-between rounded-[6px] border border-[#eeeeec] bg-[#fbfbfa] px-3 text-[12px] font-bold text-[#333330]"
                key={item}
              >
                <span>{item}</span>
                <span className="text-[#999993]">0{itemIndex + 1}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}

function TrustSection({
  copy,
}: {
  readonly copy: ExpandedLandingCopy["trust"];
}) {
  return (
    <section className="bg-[#f7f7f5] py-16 sm:py-20 lg:py-24">
      <div className="mx-auto w-full max-w-[1320px] px-4 sm:px-6 lg:px-8">
        <div className="max-w-[760px]">
          <h2 className="break-keep text-[40px] font-black leading-[1.05] text-[#0f0f0f] sm:text-[54px]">
            {copy.title}
          </h2>
          <p className="mt-4 break-keep text-[17px] font-semibold leading-8 text-[#555550]">
            {copy.description}
          </p>
        </div>

        <div className="mt-9 grid gap-4 lg:grid-cols-3">
          {copy.testimonials.map((testimonial) => (
            <article
              className={`${testimonial.tone} min-h-[320px] rounded-[8px] p-6 text-white`}
              key={testimonial.company}
            >
              <p className="text-[13px] font-black uppercase opacity-80">
                {testimonial.company}
              </p>
              <p className="mt-20 break-keep text-[24px] font-black leading-tight">
                “{testimonial.quote}”
              </p>
              <p className="mt-6 text-[13px] font-bold opacity-85">
                {testimonial.person}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-x-7 gap-y-3 border-t border-[#e3e3de] pt-5 text-[12px] font-black text-[#666660]">
          {copy.stats.map((stat) => (
            <span className="inline-flex items-center gap-2" key={stat}>
              <CheckCircle2 className="h-4 w-4 text-[#0075DE]" />
              {stat}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function WorkspaceSection({ copy }: { readonly copy: LandingCopy }) {
  const defaultVisual = {
    icon: Database,
    tone: "bg-[#e8f3ff] text-[#0075DE]",
  };

  return (
    <section className="min-h-screen bg-white py-16 sm:py-20 lg:py-24">
      <div className="mx-auto grid w-full max-w-[1320px] gap-10 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:px-8">
        <div>
          <p className="text-[12px] font-black uppercase text-[#0075DE]">
            {copy.workspace.eyebrow}
          </p>
          <h2 className="mt-3 max-w-[720px] break-keep text-[40px] font-black leading-[1.05] text-[#0f0f0f] sm:text-[56px] lg:text-[68px]">
            {copy.workspace.title}
          </h2>
          <p className="mt-5 max-w-[620px] break-keep text-[17px] font-semibold leading-8 text-[#555550]">
            {copy.workspace.description}
          </p>

          <div className="mt-8 grid gap-3">
            {copy.workspace.views.map((view, index) => {
              const visual = workspaceViewVisuals[index] ?? defaultVisual;
              const Icon = visual.icon;

              return (
                <div
                  className="flex gap-4 rounded-[8px] border border-[#eeeeec] bg-[#fbfbfa] p-4"
                  key={view.title}
                >
                  <span
                    className={`grid h-11 w-11 shrink-0 place-items-center rounded-[8px] ${visual.tone}`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-[15px] font-black text-[#111111]">
                      {view.title}
                    </h3>
                    <p className="mt-1 text-[13px] font-semibold leading-6 text-[#666660]">
                      {view.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <WorkspacePreview copy={copy} />
      </div>
    </section>
  );
}

function WorkspacePreview({ copy }: { readonly copy: LandingCopy }) {
  return (
    <div className="overflow-hidden rounded-[8px] border border-[#dededa] bg-[#f7f7f5] shadow-[0_28px_90px_rgba(15,15,15,0.11)]">
      <div className="flex h-11 items-center gap-2 border-b border-[#e7e7e2] bg-white px-4">
        <span className="h-2.5 w-2.5 rounded-full bg-[#d8d8d3]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#d8d8d3]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#d8d8d3]" />
        <span className="ml-3 text-[12px] font-black text-[#555550]">
          {copy.workspace.previewTitle}
        </span>
      </div>

      <div className="grid min-h-[520px] bg-white lg:grid-cols-[1fr_270px]">
        <div className="min-w-0 p-5 sm:p-7">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[12px] font-black uppercase text-[#777770]">
                {copy.workspace.previewEyebrow}
              </p>
              <h3 className="mt-1 text-[26px] font-black text-[#111111]">
                {copy.mock.boardTitle}
              </h3>
            </div>
            <span className="inline-flex h-9 items-center gap-2 rounded-[6px] bg-[#0075DE] px-3 text-[12px] font-black text-white">
              <Sparkles className="h-4 w-4" />
              {copy.workspace.agentLabel}
            </span>
          </div>

          <div className="mt-6 overflow-hidden rounded-[8px] border border-[#eeeeec]">
            <div className="grid grid-cols-3 bg-[#f7f7f5] text-[12px] font-black text-[#555550]">
              {copy.workspace.tableHeaders.map((header) => (
                <span className="border-r border-[#eeeeec] p-3 last:border-r-0" key={header}>
                  {header}
                </span>
              ))}
            </div>
            {copy.workspace.rows.map((row) => (
              <div
                className="grid grid-cols-3 border-t border-[#eeeeec] text-[13px] font-bold text-[#333330]"
                key={row.join("-")}
              >
                {row.map((cell, index) => (
                  <span
                    className="min-h-[54px] border-r border-[#eeeeec] p-3 last:border-r-0"
                    key={`${cell}-${index}`}
                  >
                    {index === 1 ? (
                      <span className="inline-flex rounded-full bg-[#e8f3ff] px-2 py-1 text-[11px] font-black text-[#0075DE]">
                        {cell}
                      </span>
                    ) : (
                      cell
                    )}
                  </span>
                ))}
              </div>
            ))}
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <MetricPill
              icon={Handshake}
              label={copy.workspace.metricLabels[0]}
              value="+18%"
            />
            <MetricPill
              icon={Mail}
              label={copy.workspace.metricLabels[1]}
              value="2.4h"
            />
            <MetricPill
              icon={CheckCircle2}
              label={copy.workspace.metricLabels[2]}
              value="96%"
            />
          </div>
        </div>

        <aside className="border-t border-[#eeeeec] bg-[#fbfbfa] p-5 lg:border-l lg:border-t-0">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-[#e8f3ff]">
            <Building2 className="h-6 w-6 text-[#0075DE]" />
          </span>
          <h3 className="mt-4 text-[24px] font-black text-[#111111]">
            {copy.workspace.detailTitle}
          </h3>
          <div className="mt-5 grid gap-3">
            {copy.workspace.detailItems.map((item) => (
              <div className="rounded-[8px] border border-[#eeeeec] bg-white p-3" key={item.title}>
                <p className="text-[13px] font-black text-[#111111]">
                  {item.title}
                </p>
                <p className="mt-1 text-[12px] font-semibold leading-5 text-[#666660]">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}

function MetricPill({
  icon: Icon,
  label,
  value,
}: {
  readonly icon: IconType;
  readonly label: string;
  readonly value: string;
}) {
  return (
    <div className="rounded-[8px] border border-[#eeeeec] bg-[#fbfbfa] p-3">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-[#0075DE]" />
        <span className="text-[12px] font-black text-[#555550]">{label}</span>
      </div>
      <p className="mt-3 text-[24px] font-black text-[#111111]">{value}</p>
    </div>
  );
}

function FinalSection({ copy }: { readonly copy: LandingCopy }) {
  return (
    <section className="flex min-h-screen flex-col bg-[#f7f7f5]">
      <div className="flex min-h-[48vh] flex-1 items-center justify-center px-4 py-16 text-center sm:px-6">
        <div>
          <h2 className="break-keep text-[38px] font-black leading-tight text-[#0f0f0f] sm:text-[42px]">
            {copy.final.title}
          </h2>
          {copy.final.description ? (
            <p className="mx-auto mt-4 max-w-[620px] break-keep text-[16px] font-semibold leading-7 text-[#555550]">
              {copy.final.description}
            </p>
          ) : null}
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link
              className="inline-flex h-11 items-center gap-2 rounded-[6px] bg-[#0075DE] px-5 text-[15px] font-black text-white hover:bg-[#006AC8]"
              to="/signup"
            >
              {copy.final.primaryCta}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              className="inline-flex h-11 items-center rounded-[6px] bg-white px-5 text-[15px] font-black text-[#005aa8] hover:bg-[#eef6ff]"
              to="/contact"
            >
              {copy.final.secondaryCta}
            </Link>
          </div>
        </div>
      </div>

      <PublicSiteFooter />
    </section>
  );
}
