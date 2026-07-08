/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type PublicSiteLanguage = "ko" | "ja" | "zh" | "en-US" | "en-GB";

type PublicSiteLanguageContextValue = {
  readonly language: PublicSiteLanguage;
  readonly setLanguage: (language: PublicSiteLanguage) => void;
  readonly copy: PublicSiteCopy;
};

type ProductMenuItemCopy = {
  readonly title: string;
  readonly description: string;
};

type FooterColumnCopy = readonly [string, ...string[]];

type PublicSiteCopy = {
  readonly common: {
    readonly logoAria: string;
    readonly nav: {
      readonly product: string;
      readonly pricing: string;
      readonly contact: string;
      readonly freeCta: string;
      readonly login: string;
    };
    readonly productMenuGroups: readonly ProductMenuItemCopy[][];
    readonly productTour: string;
    readonly productApp: string;
    readonly footerColumns: readonly FooterColumnCopy[];
    readonly cookieSettings: string;
    readonly languageAria: string;
    readonly copyright: string;
  };
  readonly landing: {
    readonly heroTitle: readonly [string, string];
    readonly heroDescription: string;
    readonly primaryCta: string;
    readonly secondaryCta: string;
    readonly customerStrip: string;
    readonly sectionWork: string;
    readonly sectionAssistants: string;
    readonly sectionWorkspace: string;
    readonly quote: string;
    readonly trustedTitle: string;
    readonly finalCta: string;
    readonly finalPrimary: string;
  };
  readonly pricing: {
    readonly title: string;
    readonly description: string;
    readonly tags: readonly string[];
    readonly mediaCaptions: readonly string[];
    readonly billingMonthly: string;
    readonly billingAnnual: string;
    readonly currency: string;
    readonly recommended: string;
    readonly aiLabel: string;
    readonly aiTitle: string;
    readonly aiDescription: string;
    readonly aiCta: string;
    readonly setupTitle: string;
    readonly setupDescription: string;
    readonly featuresTitle: string;
    readonly featureColumn: string;
    readonly faqTitle: string;
    readonly plans: readonly {
      readonly name: string;
      readonly description: string;
      readonly cta: string;
      readonly features: readonly string[];
    }[];
    readonly comparisonGroups: readonly {
      readonly title: string;
      readonly rows: readonly (readonly string[])[];
    }[];
    readonly faqs: readonly string[];
  };
  readonly contact: {
    readonly title: readonly [string, string];
    readonly description: string;
    readonly trustedLabel: string;
    readonly companies: readonly string[];
    readonly quoteCompany: string;
    readonly quote: string;
    readonly quotePerson: string;
    readonly quoteRole: string;
    readonly labels: {
      readonly firstName: string;
      readonly lastName: string;
      readonly email: string;
      readonly title: string;
      readonly company: string;
      readonly companySize: string;
      readonly region: string;
      readonly phone: string;
      readonly reason: string;
      readonly detail: string;
    };
    readonly placeholders: {
      readonly firstName: string;
      readonly lastName: string;
      readonly email: string;
      readonly title: string;
      readonly company: string;
      readonly companySize: string;
      readonly region: string;
      readonly phone: string;
      readonly reason: string;
      readonly detail: string;
    };
    readonly marketingAgreement: string;
    readonly submit: string;
    readonly finePrint: string;
    readonly supportPrefix: string;
    readonly supportSuffix: string;
    readonly testimonials: readonly {
      readonly company: string;
      readonly quote: string;
      readonly person: string;
      readonly role: string;
    }[];
  };
};

const storageKey = "onehand.sales.publicLanguage";

export const publicSiteLanguageOptions: readonly {
  readonly value: PublicSiteLanguage;
  readonly label: string;
  readonly htmlLang: string;
}[] = [
  { value: "ko", label: "한국어", htmlLang: "ko" },
  { value: "ja", label: "日本語", htmlLang: "ja" },
  { value: "zh", label: "中文", htmlLang: "zh-CN" },
  { value: "en-US", label: "English (US)", htmlLang: "en-US" },
  { value: "en-GB", label: "English (UK)", htmlLang: "en-GB" },
];

const publicSiteCopy: Record<PublicSiteLanguage, PublicSiteCopy> = {
  ko: {
    common: {
      logoAria: "onehand.sales 홈",
      nav: {
        product: "제품",
        pricing: "요금제",
        contact: "문의",
        freeCta: "onehand 무료로 사용하기",
        login: "로그인",
      },
      productMenuGroups: [
        [
          { title: "AI 딜 도우미", description: "다음 행동과 우선순위를 정리" },
          { title: "자동 팔로업", description: "놓친 연락과 일정 알림" },
          { title: "회의록 정리", description: "메모를 요약하고 딜에 연결" },
          { title: "통합 검색", description: "회사, 담당자, 딜을 한 번에 검색" },
        ],
        [
          { title: "고객 데이터베이스", description: "회사와 담당자를 한곳에 모음" },
          { title: "문서", description: "제안서와 자료를 정돈" },
          { title: "프로젝트", description: "딜과 실행 업무를 같이 관리" },
          { title: "일정", description: "미팅과 후속 작업을 추적" },
        ],
        [
          { title: "연결", description: "영업 기록을 서로 연결" },
          { title: "보안", description: "민감 메모와 권한을 분리" },
          { title: "템플릿", description: "반복 업무 구조를 저장" },
          { title: "리포트", description: "성과와 리스크를 확인" },
        ],
      ],
      productTour: "onehand.sales 1.0 둘러보기",
      productApp: "앱으로 이동",
      footerColumns: [
        ["회사 소개", "onehand 소개", "채용", "보안", "서비스 상태", "이용약관 및 개인정보 보호정책", "개인정보 보호 권한"],
        ["다운로드", "웹 앱", "모바일 웹", "데스크톱 웹", "브라우저 바로가기"],
        ["리소스", "도움말 센터", "가격", "블로그", "커뮤니티", "연결", "템플릿", "파트너 프로그램"],
        ["용도별", "회사", "팀", "개인", "더 살펴보기"],
      ],
      cookieSettings: "쿠키 설정",
      languageAria: "언어 선택",
      copyright: "© 2026 onehand Labs, Inc.",
    },
    landing: {
      heroTitle: ["영업팀과 고객이", "함께 움직이는 곳"],
      heroDescription:
        "딜, 담당자, 일정, 회의록을 한 화면에서 연결하고 오늘 해야 할 일을 바로 확인하세요.",
      primaryCta: "onehand.sales 시작하기",
      secondaryCta: "흐름 보기",
      customerStrip: "반복 영업 업무가 많은 팀을 위해 설계한 CRM",
      sectionWork: "영업 흐름을 하루 종일 놓치지 마세요.",
      sectionAssistants: "필요할 때 언제든지 요청하세요.",
      sectionWorkspace: "모든 영업 작업을 한곳에서 관리하세요.",
      quote: "“AI보다 먼저, 영업의 흐름이 정리됩니다.”",
      trustedTitle: "결과로 말하는 영업팀을 위해.",
      finalCta: "지금 시작하세요.",
      finalPrimary: "onehand.sales 시작",
    },
    pricing: {
      title: "영업 운영에 필요한 하나의 도구.",
      description:
        "개인 영업부터 작은 팀의 파이프라인까지, 필요한 기능을 단계별로 선택하세요.",
      tags: ["딜", "고객", "일정", "회의록", "검색", "AI"],
      mediaCaptions: ["고객 상담", "업무 설계", "팀 운영"],
      billingMonthly: "월간 결제",
      billingAnnual: "연간 결제 20% 절약",
      currency: "KRW 기준",
      recommended: "추천",
      aiLabel: "AI 옵션",
      aiTitle: "중요한 업무를 위한 AI 영업 도우미.",
      aiDescription:
        "회의록 요약, 다음 행동 추천, 팔로업 알림을 파이프라인과 연결합니다.",
      aiCta: "AI 기능 알아보기",
      setupTitle: "도입 지원 포함",
      setupDescription:
        "데이터 가져오기, 영업 단계 정리, 팀 온보딩을 함께 설계합니다.",
      featuresTitle: "요금제와 기능",
      featureColumn: "기능",
      faqTitle: "자주 묻는 질문",
      plans: [
        {
          name: "무료",
          description: "처음 영업 기록을 정리하는 개인에게",
          cta: "시작하기",
          features: ["회사/담당자 기본 관리", "딜 30개", "일정과 회의록", "모바일 브라우저 지원"],
        },
        {
          name: "플러스",
          description: "꾸준히 파이프라인을 관리하는 사용자에게",
          cta: "무료 체험",
          features: ["딜 무제한", "XLSX 다운로드", "휴지통 복구", "고급 필터와 정렬"],
        },
        {
          name: "비즈니스",
          description: "반복 영업 흐름을 자동화하는 팀에게",
          cta: "시작하기",
          features: ["AI 회의록 요약", "우선순위 추천", "팀 공유 보기", "민감 메모 보호"],
        },
        {
          name: "엔터프라이즈",
          description: "보안, 권한, 운영 정책이 필요한 조직에게",
          cta: "문의하기",
          features: ["전담 도입 지원", "감사 로그", "권한 정책", "보안 검토 지원"],
        },
      ],
      comparisonGroups: [
        {
          title: "워크스페이스",
          rows: [
            ["회사/담당자 관리", "기본", "무제한", "무제한", "무제한"],
            ["제품 관리", "기본", "무제한", "무제한", "무제한"],
            ["딜 파이프라인", "30개", "무제한", "무제한", "무제한"],
            ["일정/회의록", "기본", "고급", "고급", "고급"],
            ["검색", "기본", "고급", "고급", "고급"],
          ],
        },
        {
          title: "AI와 자동화",
          rows: [
            ["회의록 요약", "", "", "포함", "포함"],
            ["다음 행동 추천", "", "", "포함", "포함"],
            ["팔로업 알림", "기본", "고급", "고급", "고급"],
            ["영업 리포트", "", "기본", "고급", "맞춤"],
            ["반복 업무 템플릿", "", "포함", "포함", "맞춤"],
          ],
        },
        {
          title: "데이터와 보안",
          rows: [
            ["도메인별 XLSX 다운로드", "", "포함", "포함", "포함"],
            ["휴지통 복구", "7일", "30일", "90일", "맞춤"],
            ["민감 메모 보호", "", "", "포함", "포함"],
            ["감사 로그", "", "", "기본", "고급"],
            ["도입/보안 검토", "", "", "", "지원"],
          ],
        },
        {
          title: "지원",
          rows: [
            ["도움말 문서", "포함", "포함", "포함", "포함"],
            ["이메일 지원", "", "포함", "포함", "우선"],
            ["온보딩 지원", "", "", "기본", "전담"],
            ["계약/세금계산서", "", "", "지원", "지원"],
          ],
        },
      ],
      faqs: [
        "무료 요금제로 언제까지 사용할 수 있나요?",
        "비즈니스 요금제의 AI 기능은 어떤 데이터를 사용하나요?",
        "팀 단위 권한 관리는 언제 제공되나요?",
        "기존 고객 데이터를 가져올 수 있나요?",
        "월간 결제와 연간 결제를 모두 지원하나요?",
        "영업팀 도입 상담을 받을 수 있나요?",
        "모바일 앱 없이 모바일 브라우저에서 사용할 수 있나요?",
        "데이터 삭제와 복구 정책은 어떻게 되나요?",
      ],
    },
    contact: {
      title: ["onehand.sales", "영업팀 문의하기"],
      description:
        "가격 및 요금제 상담부터 데모 예약과 팀에 맞는 활용 사례 안내까지, 필요한 지원을 받아보실 수 있습니다.",
      trustedLabel: "반복 영업 업무가 많은 팀이 사용하는 onehand.sales",
      companies: ["LG AI Research", "Sendbird", "HYOSUNG"],
      quoteCompany: "OpenAI",
      quote:
        "직원들은 같은 딜 목표와 고객 정보를 공유할 수 있는 단일 업무 공간이 필요합니다. onehand.sales는 영업 흐름을 한곳에서 처리할 수 있게 합니다.",
      quotePerson: "Nick Erdenberger",
      quoteRole: "GTM, OpenAI",
      labels: {
        firstName: "이름 *",
        lastName: "성 *",
        email: "업무용 이메일 *",
        title: "직함 *",
        company: "회사 이름 *",
        companySize: "회사 규모 *",
        region: "국가나 지역 *",
        phone: "전화번호 *",
        reason: "문의 이유 *",
        detail: "세부 정보를 제공해 주세요. *",
      },
      placeholders: {
        firstName: "길동",
        lastName: "홍",
        email: "you@company.com",
        title: "영업 리더",
        company: "가나다 주식회사",
        companySize: "선택 항목",
        region: "대한민국",
        phone: "(010) 1234-5678",
        reason: "선택 항목",
        detail: "onehand.sales를 어떻게 사용하고 싶은지 적어주세요.",
      },
      marketingAgreement: "onehand.sales의 마케팅 메시지를 수신하는 데 동의합니다.",
      submit: "영업팀에 문의하기",
      finePrint:
        "언제든지 마케팅 메시지 수신을 거부할 수 있습니다. 제출된 정보는 문의 응대와 제품 도입 안내 목적으로 사용됩니다.",
      supportPrefix: "기술이나 제품 지원이 필요하면",
      supportSuffix: "으로 이메일을 보내 주세요.",
      testimonials: [
        {
          company: "MatchGroup",
          quote: "영업 워크플로우를 가장 효율적으로 단순화할 수 있었습니다.",
          person: "Rahim Makani",
          role: "프로덕트 팀장",
        },
        {
          company: "TOYOTA",
          quote: "전 세계 시장 진행 상황을 한눈에 파악하고 놓치지 않게 됐습니다.",
          person: "Taku Wakasugi",
          role: "Research Center",
        },
        {
          company: "ramp",
          quote: "반복 업무가 사라지고 고객과 계약 흐름에 집중할 수 있습니다.",
          person: "Geoff Charles",
          role: "운영 책임자",
        },
      ],
    },
  },
  ja: {
    common: {
      logoAria: "onehand.sales ホーム",
      nav: {
        product: "製品",
        pricing: "料金",
        contact: "お問い合わせ",
        freeCta: "onehandを無料で使う",
        login: "ログイン",
      },
      productMenuGroups: [
        [
          { title: "AI 商談アシスタント", description: "次のアクションと優先順位を整理" },
          { title: "自動フォローアップ", description: "抜け漏れた連絡と予定を通知" },
          { title: "議事録整理", description: "メモを要約して商談に接続" },
          { title: "横断検索", description: "会社、担当者、商談を一度に検索" },
        ],
        [
          { title: "顧客データベース", description: "会社と担当者を一か所に集約" },
          { title: "ドキュメント", description: "提案書と資料を整理" },
          { title: "プロジェクト", description: "商談と実行タスクを同時に管理" },
          { title: "カレンダー", description: "ミーティングと後続タスクを追跡" },
        ],
        [
          { title: "連携", description: "営業記録を相互に接続" },
          { title: "セキュリティ", description: "機密メモと権限を分離" },
          { title: "テンプレート", description: "反復業務の構造を保存" },
          { title: "レポート", description: "成果とリスクを確認" },
        ],
      ],
      productTour: "onehand.sales 1.0 を見る",
      productApp: "アプリへ移動",
      footerColumns: [
        ["会社紹介", "onehandについて", "採用", "セキュリティ", "サービス状況", "利用規約とプライバシーポリシー", "プライバシー権限"],
        ["ダウンロード", "Webアプリ", "モバイルWeb", "デスクトップWeb", "ブラウザショートカット"],
        ["リソース", "ヘルプセンター", "料金", "ブログ", "コミュニティ", "連携", "テンプレート", "パートナープログラム"],
        ["用途別", "会社", "チーム", "個人", "もっと見る"],
      ],
      cookieSettings: "Cookie設定",
      languageAria: "言語を選択",
      copyright: "© 2026 onehand Labs, Inc.",
    },
    landing: {
      heroTitle: ["営業チームと顧客が", "一緒に動く場所"],
      heroDescription:
        "商談、担当者、予定、議事録を一つの画面でつなぎ、今日やるべきことをすぐ確認できます。",
      primaryCta: "onehand.sales を始める",
      secondaryCta: "流れを見る",
      customerStrip: "反復営業が多いチームのためのCRM",
      sectionWork: "営業の流れを一日中見失わない。",
      sectionAssistants: "必要なときにいつでも依頼。",
      sectionWorkspace: "すべての営業作業を一か所で管理。",
      quote: "“AIの前に、営業の流れが整います。”",
      trustedTitle: "成果で語る営業チームのために。",
      finalCta: "今すぐ始めましょう。",
      finalPrimary: "onehand.sales を開始",
    },
    pricing: makeTranslatedPricing({
      title: "営業運営に必要な一つのツール。",
      description:
        "個人営業から小規模チームのパイプラインまで、必要な機能を段階的に選べます。",
      tags: ["商談", "顧客", "予定", "議事録", "検索", "AI"],
      captions: ["顧客相談", "業務設計", "チーム運営"],
      monthly: "月払い",
      annual: "年払いで20%節約",
      currency: "JPY基準",
      recommended: "おすすめ",
      aiLabel: "AIオプション",
      aiTitle: "重要な業務のためのAI営業アシスタント。",
      aiDescription: "議事録要約、次の行動、フォローアップ通知をパイプラインに接続します。",
      aiCta: "AI機能を見る",
      setupTitle: "導入支援込み",
      setupDescription: "データ移行、営業ステージ整理、チームオンボーディングを一緒に設計します。",
      featuresTitle: "料金と機能",
      featureColumn: "機能",
      faqTitle: "よくある質問",
    }),
    contact: makeTranslatedContact({
      title: ["onehand.sales", "営業チームに問い合わせる"],
      description:
        "料金相談、デモ予約、チームに合った活用方法まで、必要な支援を受けられます。",
      trustedLabel: "反復営業が多いチームが使う onehand.sales",
      labels: {
        firstName: "名 *",
        lastName: "姓 *",
        email: "仕事用メール *",
        title: "役職 *",
        company: "会社名 *",
        companySize: "会社規模 *",
        region: "国または地域 *",
        phone: "電話番号 *",
        reason: "お問い合わせ理由 *",
        detail: "詳細をご記入ください。*",
      },
      placeholders: {
        firstName: "太郎",
        lastName: "山田",
        email: "you@company.com",
        title: "営業リーダー",
        company: "株式会社サンプル",
        companySize: "選択してください",
        region: "日本",
        phone: "(090) 1234-5678",
        reason: "選択してください",
        detail: "onehand.salesをどのように使いたいかご記入ください。",
      },
      submit: "営業チームに問い合わせる",
      agreement: "onehand.salesからのマーケティングメッセージを受け取ることに同意します。",
      finePrint:
        "マーケティングメッセージはいつでも配信停止できます。送信された情報はお問い合わせ対応と導入案内に使用されます。",
      supportPrefix: "技術または製品サポートが必要な場合は",
      supportSuffix: "までメールをお送りください。",
    }),
  },
  zh: {
    common: {
      logoAria: "onehand.sales 首页",
      nav: {
        product: "产品",
        pricing: "价格",
        contact: "咨询",
        freeCta: "免费使用 onehand",
        login: "登录",
      },
      productMenuGroups: [
        [
          { title: "AI 销售助手", description: "整理下一步行动和优先级" },
          { title: "自动跟进", description: "提醒遗漏的联系和日程" },
          { title: "会议记录整理", description: "总结笔记并连接到商机" },
          { title: "全局搜索", description: "一次搜索公司、联系人和商机" },
        ],
        [
          { title: "客户数据库", description: "集中管理公司和联系人" },
          { title: "文档", description: "整理方案书和资料" },
          { title: "项目", description: "同时管理商机和执行任务" },
          { title: "日程", description: "追踪会议和后续工作" },
        ],
        [
          { title: "连接", description: "连接所有销售记录" },
          { title: "安全", description: "分离敏感笔记和权限" },
          { title: "模板", description: "保存重复工作的结构" },
          { title: "报表", description: "查看成果和风险" },
        ],
      ],
      productTour: "查看 onehand.sales 1.0",
      productApp: "进入应用",
      footerColumns: [
        ["公司介绍", "关于 onehand", "招聘", "安全", "服务状态", "条款与隐私政策", "隐私权限"],
        ["下载", "Web 应用", "移动网页", "桌面网页", "浏览器快捷方式"],
        ["资源", "帮助中心", "价格", "博客", "社区", "连接", "模板", "合作伙伴计划"],
        ["适用对象", "公司", "团队", "个人", "查看更多"],
      ],
      cookieSettings: "Cookie 设置",
      languageAria: "选择语言",
      copyright: "© 2026 onehand Labs, Inc.",
    },
    landing: {
      heroTitle: ["销售团队与客户", "协同工作的地方"],
      heroDescription:
        "在一个界面连接商机、联系人、日程和会议记录，立即查看今天要完成的工作。",
      primaryCta: "开始使用 onehand.sales",
      secondaryCta: "查看流程",
      customerStrip: "为重复销售工作较多的团队设计的 CRM",
      sectionWork: "全天掌握销售流程。",
      sectionAssistants: "需要时随时请求帮助。",
      sectionWorkspace: "在一个地方管理所有销售工作。",
      quote: "“在 AI 之前，先把销售流程整理清楚。”",
      trustedTitle: "为用结果说话的销售团队。",
      finalCta: "现在开始。",
      finalPrimary: "开始 onehand.sales",
    },
    pricing: makeTranslatedPricing({
      title: "运营销售所需的一体化工具。",
      description: "从个人销售到小团队管道，按阶段选择需要的功能。",
      tags: ["商机", "客户", "日程", "会议记录", "搜索", "AI"],
      captions: ["客户咨询", "流程设计", "团队运营"],
      monthly: "月付",
      annual: "年付节省 20%",
      currency: "CNY 基准",
      recommended: "推荐",
      aiLabel: "AI 选项",
      aiTitle: "面向重要工作的 AI 销售助手。",
      aiDescription: "将会议摘要、下一步行动和跟进提醒连接到销售管道。",
      aiCta: "了解 AI 功能",
      setupTitle: "包含导入支持",
      setupDescription: "一起设计数据导入、销售阶段和团队入门流程。",
      featuresTitle: "价格与功能",
      featureColumn: "功能",
      faqTitle: "常见问题",
    }),
    contact: makeTranslatedContact({
      title: ["onehand.sales", "联系销售团队"],
      description: "从价格咨询、演示预约到适合团队的使用方案，我们会提供所需支持。",
      trustedLabel: "重复销售工作较多的团队正在使用 onehand.sales",
      labels: {
        firstName: "名 *",
        lastName: "姓 *",
        email: "工作邮箱 *",
        title: "职位 *",
        company: "公司名称 *",
        companySize: "公司规模 *",
        region: "国家或地区 *",
        phone: "电话号码 *",
        reason: "咨询原因 *",
        detail: "请提供详细信息。*",
      },
      placeholders: {
        firstName: "小明",
        lastName: "王",
        email: "you@company.com",
        title: "销售负责人",
        company: "示例有限公司",
        companySize: "请选择",
        region: "中国",
        phone: "(010) 1234-5678",
        reason: "请选择",
        detail: "请写下您希望如何使用 onehand.sales。",
      },
      submit: "联系销售团队",
      agreement: "我同意接收 onehand.sales 的营销消息。",
      finePrint:
        "您可以随时取消接收营销消息。提交的信息将用于回复咨询和产品导入说明。",
      supportPrefix: "如果需要技术或产品支持，请发送邮件至",
      supportSuffix: "。",
    }),
  },
  "en-US": makeEnglishCopy({
    organise: "organize",
    organizing: "organizing",
    title: "One tool for running sales.",
    contactTitle: "Contact sales",
    pricing: "Pricing",
    contact: "Contact",
    languageRegion: "US",
  }),
  "en-GB": makeEnglishCopy({
    organise: "organise",
    organizing: "organising",
    title: "One tool for running sales.",
    contactTitle: "Contact sales",
    pricing: "Pricing",
    contact: "Contact",
    languageRegion: "UK",
  }),
};

const PublicSiteLanguageContext =
  createContext<PublicSiteLanguageContextValue | null>(null);

export function PublicSiteLanguageProvider({
  children,
}: {
  readonly children: ReactNode;
}) {
  const [language, setLanguageState] = useState<PublicSiteLanguage>(() =>
    getInitialLanguage()
  );

  useEffect(() => {
    const option = publicSiteLanguageOptions.find(
      (item) => item.value === language
    );

    document.documentElement.lang = option?.htmlLang ?? "ko";
    window.localStorage.setItem(storageKey, language);
  }, [language]);

  const value = useMemo<PublicSiteLanguageContextValue>(
    () => ({
      language,
      setLanguage: setLanguageState,
      copy: publicSiteCopy[language],
    }),
    [language]
  );

  return (
    <PublicSiteLanguageContext.Provider value={value}>
      {children}
    </PublicSiteLanguageContext.Provider>
  );
}

export function usePublicSiteLanguage() {
  const context = useContext(PublicSiteLanguageContext);

  if (!context) {
    throw new Error(
      "usePublicSiteLanguage must be used within PublicSiteLanguageProvider"
    );
  }

  return context;
}

function getInitialLanguage(): PublicSiteLanguage {
  if (typeof window === "undefined") {
    return "ko";
  }

  const storedLanguage = window.localStorage.getItem(storageKey);
  if (isPublicSiteLanguage(storedLanguage)) {
    return storedLanguage;
  }

  const browserLanguage = window.navigator.language;

  if (browserLanguage.startsWith("ja")) {
    return "ja";
  }

  if (browserLanguage.startsWith("zh")) {
    return "zh";
  }

  if (browserLanguage === "en-GB") {
    return "en-GB";
  }

  if (browserLanguage.startsWith("en")) {
    return "en-US";
  }

  return "ko";
}

function isPublicSiteLanguage(value: unknown): value is PublicSiteLanguage {
  return publicSiteLanguageOptions.some((option) => option.value === value);
}

function makeTranslatedPricing(copy: {
  readonly title: string;
  readonly description: string;
  readonly tags: readonly string[];
  readonly captions: readonly string[];
  readonly monthly: string;
  readonly annual: string;
  readonly currency: string;
  readonly recommended: string;
  readonly aiLabel: string;
  readonly aiTitle: string;
  readonly aiDescription: string;
  readonly aiCta: string;
  readonly setupTitle: string;
  readonly setupDescription: string;
  readonly featuresTitle: string;
  readonly featureColumn: string;
  readonly faqTitle: string;
}): PublicSiteCopy["pricing"] {
  return {
    ...copy,
    mediaCaptions: copy.captions,
    billingMonthly: copy.monthly,
    billingAnnual: copy.annual,
    plans: [
      {
        name: copy.title.includes("営業") ? "無料" : copy.title.includes("销售") ? "免费" : "Free",
        description:
          copy.title.includes("営業")
            ? "最初の営業記録を整理する個人向け"
            : copy.title.includes("销售")
              ? "适合刚开始整理销售记录的个人"
              : "For individuals getting their sales records in order",
        cta: copy.title.includes("销售") ? "开始使用" : copy.title.includes("営業") ? "始める" : "Get started",
        features:
          copy.title.includes("销售")
            ? ["公司/联系人基础管理", "30 个商机", "日程和会议记录", "移动浏览器支持"]
            : copy.title.includes("営業")
              ? ["会社/担当者の基本管理", "商談30件", "予定と議事録", "モバイルブラウザ対応"]
              : ["Basic company/contact management", "30 deals", "Calendar and notes", "Mobile browser support"],
      },
      {
        name: copy.title.includes("営業") ? "プラス" : copy.title.includes("销售") ? "Plus" : "Plus",
        description:
          copy.title.includes("営業")
            ? "パイプラインを継続的に管理するユーザー向け"
            : copy.title.includes("销售")
              ? "适合持续管理销售管道的用户"
              : "For people actively managing a sales pipeline",
        cta: copy.title.includes("销售") ? "免费试用" : copy.title.includes("営業") ? "無料で試す" : "Free trial",
        features:
          copy.title.includes("销售")
            ? ["商机无限", "XLSX 下载", "回收站恢复", "高级筛选和排序"]
            : copy.title.includes("営業")
              ? ["商談無制限", "XLSXダウンロード", "ゴミ箱復元", "高度なフィルターと並び替え"]
              : ["Unlimited deals", "XLSX export", "Trash restore", "Advanced filters and sorting"],
      },
      {
        name: copy.title.includes("営業") ? "ビジネス" : copy.title.includes("销售") ? "商务" : "Business",
        description:
          copy.title.includes("営業")
            ? "反復営業フローを自動化するチーム向け"
            : copy.title.includes("销售")
              ? "适合自动化重复销售流程的团队"
              : "For teams automating repeat sales workflows",
        cta: copy.title.includes("销售") ? "开始使用" : copy.title.includes("営業") ? "始める" : "Get started",
        features:
          copy.title.includes("销售")
            ? ["AI 会议摘要", "优先级推荐", "团队共享视图", "敏感笔记保护"]
            : copy.title.includes("営業")
              ? ["AI議事録要約", "優先順位の提案", "チーム共有ビュー", "機密メモ保護"]
              : ["AI meeting summaries", "Priority suggestions", "Shared team views", "Sensitive note protection"],
      },
      {
        name: copy.title.includes("営業") ? "エンタープライズ" : copy.title.includes("销售") ? "企业" : "Enterprise",
        description:
          copy.title.includes("営業")
            ? "セキュリティ、権限、運用ポリシーが必要な組織向け"
            : copy.title.includes("销售")
              ? "适合需要安全、权限和运营政策的组织"
              : "For organizations with security, access, and policy needs",
        cta: copy.title.includes("销售") ? "联系我们" : copy.title.includes("営業") ? "問い合わせる" : "Contact us",
        features:
          copy.title.includes("销售")
            ? ["专属导入支持", "审计日志", "权限策略", "安全审查支持"]
            : copy.title.includes("営業")
              ? ["専任導入支援", "監査ログ", "権限ポリシー", "セキュリティレビュー支援"]
              : ["Dedicated onboarding", "Audit logs", "Access policies", "Security review support"],
      },
    ],
    comparisonGroups:
      copy.title.includes("销售")
        ? [
            {
              title: "工作区",
              rows: [
                ["公司/联系人管理", "基础", "无限", "无限", "无限"],
                ["产品管理", "基础", "无限", "无限", "无限"],
                ["销售管道", "30个", "无限", "无限", "无限"],
                ["日程/会议记录", "基础", "高级", "高级", "高级"],
                ["搜索", "基础", "高级", "高级", "高级"],
              ],
            },
            {
              title: "AI 与自动化",
              rows: [
                ["会议摘要", "", "", "包含", "包含"],
                ["下一步推荐", "", "", "包含", "包含"],
                ["跟进提醒", "基础", "高级", "高级", "高级"],
                ["销售报表", "", "基础", "高级", "定制"],
                ["重复任务模板", "", "包含", "包含", "定制"],
              ],
            },
          ]
        : copy.title.includes("営業")
          ? [
              {
                title: "ワークスペース",
                rows: [
                  ["会社/担当者管理", "基本", "無制限", "無制限", "無制限"],
                  ["製品管理", "基本", "無制限", "無制限", "無制限"],
                  ["商談パイプライン", "30件", "無制限", "無制限", "無制限"],
                  ["予定/議事録", "基本", "高度", "高度", "高度"],
                  ["検索", "基本", "高度", "高度", "高度"],
                ],
              },
              {
                title: "AIと自動化",
                rows: [
                  ["議事録要約", "", "", "含む", "含む"],
                  ["次の行動提案", "", "", "含む", "含む"],
                  ["フォローアップ通知", "基本", "高度", "高度", "高度"],
                  ["営業レポート", "", "基本", "高度", "カスタム"],
                  ["反復タスクテンプレート", "", "含む", "含む", "カスタム"],
                ],
              },
            ]
          : [
              {
                title: "Workspace",
                rows: [
                  ["Company/contact management", "Basic", "Unlimited", "Unlimited", "Unlimited"],
                  ["Product management", "Basic", "Unlimited", "Unlimited", "Unlimited"],
                  ["Deal pipeline", "30", "Unlimited", "Unlimited", "Unlimited"],
                  ["Calendar/meeting notes", "Basic", "Advanced", "Advanced", "Advanced"],
                  ["Search", "Basic", "Advanced", "Advanced", "Advanced"],
                ],
              },
              {
                title: "AI and automation",
                rows: [
                  ["Meeting summaries", "", "", "Included", "Included"],
                  ["Next action suggestions", "", "", "Included", "Included"],
                  ["Follow-up reminders", "Basic", "Advanced", "Advanced", "Advanced"],
                  ["Sales reports", "", "Basic", "Advanced", "Custom"],
                  ["Repeat task templates", "", "Included", "Included", "Custom"],
                ],
              },
            ],
    faqs:
      copy.title.includes("销售")
        ? [
            "免费方案可以使用多久？",
            "商务方案的 AI 功能会使用哪些数据？",
            "团队权限管理何时提供？",
            "可以导入现有客户数据吗？",
          ]
        : copy.title.includes("営業")
          ? [
              "無料プランはいつまで使えますか？",
              "ビジネスプランのAI機能はどのデータを使いますか？",
              "チーム権限管理はいつ提供されますか？",
              "既存の顧客データを取り込めますか？",
            ]
          : [
              "How long can I use the free plan?",
              "What data does the Business AI use?",
              "When will team permissions be available?",
              "Can I import existing customer data?",
            ],
  };
}

function makeTranslatedContact(copy: {
  readonly title: readonly [string, string];
  readonly description: string;
  readonly trustedLabel: string;
  readonly labels: PublicSiteCopy["contact"]["labels"];
  readonly placeholders: PublicSiteCopy["contact"]["placeholders"];
  readonly submit: string;
  readonly agreement: string;
  readonly finePrint: string;
  readonly supportPrefix: string;
  readonly supportSuffix: string;
}): PublicSiteCopy["contact"] {
  return {
    title: copy.title,
    description: copy.description,
    trustedLabel: copy.trustedLabel,
    companies: ["LG AI Research", "Sendbird", "HYOSUNG"],
    quoteCompany: "OpenAI",
    quote:
      copy.title[1].includes("問い合わせ")
        ? "社員は同じ商談目標と顧客情報を共有できる一つの業務空間を必要としています。onehand.salesは営業の流れを一か所で処理できるようにします。"
        : copy.title[1].includes("联系")
          ? "员工需要一个可以共享同一销售目标和客户信息的工作空间。onehand.sales 让销售流程集中处理。"
          : "Teams need one workspace where deal goals and customer context stay together. onehand.sales keeps the sales flow in one place.",
    quotePerson: "Nick Erdenberger",
    quoteRole: "GTM, OpenAI",
    labels: copy.labels,
    placeholders: copy.placeholders,
    marketingAgreement: copy.agreement,
    submit: copy.submit,
    finePrint: copy.finePrint,
    supportPrefix: copy.supportPrefix,
    supportSuffix: copy.supportSuffix,
    testimonials: [
      {
        company: "MatchGroup",
        quote:
          copy.title[1].includes("联系")
            ? "我们能够更高效地简化销售工作流。"
            : copy.title[1].includes("問い合わせ")
              ? "営業ワークフローをより効率的に単純化できました。"
              : "We simplified our sales workflow more efficiently.",
        person: "Rahim Makani",
        role: copy.title[1].includes("联系") ? "产品负责人" : copy.title[1].includes("問い合わせ") ? "プロダクト責任者" : "Product Lead",
      },
      {
        company: "TOYOTA",
        quote:
          copy.title[1].includes("联系")
            ? "我们可以掌握全球市场进展，不再遗漏。"
            : copy.title[1].includes("問い合わせ")
              ? "世界中の市場進捗を把握し、見落としを減らせました。"
              : "We can follow market progress without missing context.",
        person: "Taku Wakasugi",
        role: "Research Center",
      },
      {
        company: "ramp",
        quote:
          copy.title[1].includes("联系")
            ? "重复工作减少后，我们能专注于客户和合同流程。"
            : copy.title[1].includes("問い合わせ")
              ? "反復業務が減り、顧客と契約の流れに集中できました。"
              : "With repeat work reduced, we can focus on customers and contracts.",
        person: "Geoff Charles",
        role: copy.title[1].includes("联系") ? "运营负责人" : copy.title[1].includes("問い合わせ") ? "運用責任者" : "Operations Lead",
      },
    ],
  };
}

function makeEnglishCopy(copy: {
  readonly organise: string;
  readonly organizing: string;
  readonly title: string;
  readonly contactTitle: string;
  readonly pricing: string;
  readonly contact: string;
  readonly languageRegion: "US" | "UK";
}): PublicSiteCopy {
  const common: PublicSiteCopy["common"] = {
    logoAria: "onehand.sales home",
    nav: {
      product: "Product",
      pricing: copy.pricing,
      contact: copy.contact,
      freeCta: "Get Onehand",
      login: "Log in",
    },
    productMenuGroups: [
      [
        { title: "AI deal assistant", description: `Prioritize and ${copy.organise} next actions` },
        { title: "Automatic follow-up", description: "Reminders for missed calls and meetings" },
        { title: "Meeting notes", description: "Summarize notes and connect them to deals" },
        { title: "Unified search", description: "Search companies, contacts, and deals at once" },
      ],
      [
        { title: "Customer database", description: "Keep companies and contacts together" },
        { title: "Documents", description: `${capitalize(copy.organise)} proposals and materials` },
        { title: "Projects", description: "Manage deals and execution together" },
        { title: "Calendar", description: "Track meetings and follow-up work" },
      ],
      [
        { title: "Connections", description: "Connect every sales record" },
        { title: "Security", description: "Separate sensitive notes and permissions" },
        { title: "Templates", description: "Save repeat workflow structures" },
        { title: "Reports", description: "Review performance and risk" },
      ],
    ],
    productTour: "Explore onehand.sales 1.0",
    productApp: "Go to app",
    footerColumns: [
      ["Company", "About us", "Careers", "Security", "Status", "Terms and privacy", "Privacy rights"],
      ["Download", "Web app", "Mobile web", "Desktop web", "Browser shortcut"],
      ["Resources", "Help center", copy.pricing, "Blog", "Community", "Connections", "Templates", "Partner program"],
      ["onehand for", "Company", "Team", "Personal", "Explore more"],
    ],
    cookieSettings: "Cookie settings",
    languageAria: "Select language",
    copyright: "© 2026 onehand Labs, Inc.",
  };

  return {
    common,
    landing: {
      heroTitle: ["Where sales teams", "move with customers"],
      heroDescription:
        "Connect deals, contacts, calendar, and meeting notes in one place and see today's next actions immediately.",
      primaryCta: "Get started with onehand.sales",
      secondaryCta: "See the flow",
      customerStrip: `A CRM designed for teams ${copy.organizing} repeat sales work`,
      sectionWork: "Keep your sales flow moving all day.",
      sectionAssistants: "Ask whenever you need help.",
      sectionWorkspace: "Manage all sales work in one place.",
      quote: "“Before AI, the sales flow gets organized.”",
      trustedTitle: "For sales teams that ship results.",
      finalCta: "Get started today.",
      finalPrimary: "Start onehand.sales",
    },
    pricing: makeTranslatedPricing({
      title: copy.title,
      description:
        "Choose the right set of features for solo selling, small teams, and pipeline operations.",
      tags: ["Deals", "Customers", "Calendar", "Notes", "Search", "AI"],
      captions: ["Customer call", "Workflow design", "Team operations"],
      monthly: "Monthly billing",
      annual: "Save 20% annually",
      currency: copy.languageRegion === "UK" ? "GBP reference" : "USD reference",
      recommended: "Recommended",
      aiLabel: "AI option",
      aiTitle: "AI sales assistant for important work.",
      aiDescription:
        "Connect meeting summaries, next actions, and follow-up reminders to your pipeline.",
      aiCta: "Explore AI features",
      setupTitle: "Onboarding included",
      setupDescription:
        "We help design data import, sales stages, and team onboarding.",
      featuresTitle: "Plans and features",
      featureColumn: "Feature",
      faqTitle: "Frequently asked questions",
    }),
    contact: makeTranslatedContact({
      title: ["onehand.sales", copy.contactTitle],
      description:
        "Get help with pricing, demo scheduling, and use cases that fit your team.",
      trustedLabel: "Used by teams with repeat sales work",
      labels: {
        firstName: "First name *",
        lastName: "Last name *",
        email: "Work email *",
        title: "Job title *",
        company: "Company name *",
        companySize: "Company size *",
        region: "Country or region *",
        phone: "Phone number *",
        reason: "Reason for contact *",
        detail: "Tell us more. *",
      },
      placeholders: {
        firstName: "Jane",
        lastName: "Kim",
        email: "you@company.com",
        title: "Sales lead",
        company: "Example Inc.",
        companySize: "Select an option",
        region: copy.languageRegion === "UK" ? "United Kingdom" : "United States",
        phone: "(123) 456-7891",
        reason: "Select an option",
        detail: "Tell us how you want to use onehand.sales.",
      },
      submit: "Contact sales",
      agreement: "I agree to receive marketing messages from onehand.sales.",
      finePrint:
        "You can opt out of marketing messages at any time. Submitted information is used to respond to your request and guide product onboarding.",
      supportPrefix: "For technical or product support, email",
      supportSuffix: ".",
    }),
  };
}

function capitalize(value: string) {
  return `${value.slice(0, 1).toUpperCase()}${value.slice(1)}`;
}
