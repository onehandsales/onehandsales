/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  publicSiteLanguageStorageKey,
  resolvePublicSiteLanguage,
} from "@/features/public-site/i18n/public-site-locale-routes";

export { publicSiteLanguageStorageKey } from "@/features/public-site/i18n/public-site-locale-routes";

export type PublicSiteLanguage =
  | "ko"
  | "ja"
  | "zh-TW"
  | "en-US"
  | "en-GB"
  | "en-SG"
  | "en-AU"
  | "en-CA";

export type PublicSiteCopyLanguage = Exclude<
  PublicSiteLanguage,
  "en-SG" | "en-AU" | "en-CA"
>;

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
    readonly footerSocialAria: string;
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
    readonly mediaAlts: readonly string[];
    readonly billingMonthly: string;
    readonly billingAnnual: string;
    readonly currency: string;
    readonly priceLabels: readonly string[];
    readonly pricePeriod: string;
    readonly recommended: string;
    readonly aiLabel: string;
    readonly aiTitle: string;
    readonly aiDescription: string;
    readonly aiCta: string;
    readonly aiImageAlt: string;
    readonly aiAvatarLabels: readonly string[];
    readonly setupTitle: string;
    readonly setupDescription: string;
    readonly featuresTitle: string;
    readonly featureColumn: string;
    readonly faqTitle: string;
    readonly includedValues: readonly string[];
    readonly emptyCell: string;
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

export const publicSiteLanguageOptions: readonly {
  readonly value: PublicSiteLanguage;
  readonly label: string;
  readonly htmlLang: string;
}[] = [
  { value: "ko", label: "한국어", htmlLang: "ko" },
  { value: "ja", label: "日本語", htmlLang: "ja" },
  { value: "zh-TW", label: "繁體中文", htmlLang: "zh-TW" },
  { value: "en-US", label: "English (US)", htmlLang: "en-US" },
  { value: "en-GB", label: "English (UK)", htmlLang: "en-GB" },
  { value: "en-SG", label: "English (Singapore)", htmlLang: "en-SG" },
  { value: "en-AU", label: "English (Australia)", htmlLang: "en-AU" },
  { value: "en-CA", label: "English (Canada)", htmlLang: "en-CA" },
];

const publicSiteCopy: Record<PublicSiteLanguage, PublicSiteCopy> = {
  ko: {
    common: {
      logoAria: "Onehand 홈",
      nav: {
        product: "제품",
        pricing: "요금제",
        contact: "문의",
        freeCta: "Onehand 시작",
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
      productTour: "Onehand 1.0 둘러보기",
      productApp: "앱으로 이동",
      footerColumns: [
        ["회사 소개", "Onehand 소개", "보안", "약관 및 개인정보", "개인정보 권리"],
        ["다운로드", "iOS & Android"],
        ["리소스", "요금제"],
        ["용도별", "엔터프라이즈", "스몰비즈니스", "개인"],
      ],
      cookieSettings: "쿠키 설정",
      languageAria: "언어 선택",
      footerSocialAria: "Onehand 소셜 링크",
      copyright: "© 2026 Onehand Labs, Inc.",
    },
    landing: {
      heroTitle: ["영업팀과 고객이", "함께 움직이는 곳"],
      heroDescription:
        "딜, 담당자, 일정, 회의록을 한 화면에서 연결하고 오늘 해야 할 일을 바로 확인하세요.",
      primaryCta: "Onehand 시작",
      secondaryCta: "흐름 보기",
      customerStrip: "반복 영업 업무가 많은 팀을 위해 설계한 CRM",
      sectionWork: "영업 흐름을 하루 종일 놓치지 마세요.",
      sectionAssistants: "필요할 때 언제든지 요청하세요.",
      sectionWorkspace: "모든 영업 작업을 한곳에서 관리하세요.",
      quote: "“AI보다 먼저, 영업의 흐름이 정리됩니다.”",
      trustedTitle: "결과로 말하는 영업팀을 위해.",
      finalCta: "지금 시작하세요.",
      finalPrimary: "Onehand 시작",
    },
    pricing: {
      title: "영업 운영에 필요한 하나의 도구.",
      description:
        "개인 영업부터 작은 팀의 파이프라인까지, 필요한 기능을 단계별로 선택하세요.",
      tags: ["딜", "고객", "일정", "회의록", "검색", "AI"],
      mediaCaptions: ["고객 상담", "업무 설계", "팀 운영"],
      mediaAlts: ["고객 상담 장면", "화이트보드 업무 설계", "팀 발표와 회의"],
      billingMonthly: "월간 결제",
      billingAnnual: "연간 결제 20% 절약",
      currency: "KRW 기준",
      priceLabels: ["₩0", "₩14,000", "₩30,000", ""],
      pricePeriod: "/월",
      recommended: "추천",
      aiLabel: "AI 옵션",
      aiTitle: "중요한 업무를 위한 AI 영업 도우미.",
      aiDescription:
        "회의록 요약, 다음 행동 추천, 팔로업 알림을 파이프라인과 연결합니다.",
      aiCta: "AI 기능 알아보기",
      aiImageAlt: "회의실에서 팀이 영업 계획을 공유하는 모습",
      aiAvatarLabels: ["딜", "회", "일"],
      setupTitle: "도입 지원 포함",
      setupDescription:
        "데이터 가져오기, 영업 단계 정리, 팀 온보딩을 함께 설계합니다.",
      featuresTitle: "요금제와 기능",
      featureColumn: "기능",
      faqTitle: "자주 묻는 질문",
      includedValues: ["포함"],
      emptyCell: "—",
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
      title: ["Onehand", "영업팀 문의하기"],
      description:
        "가격 및 요금제 상담부터 데모 예약과 팀에 맞는 활용 사례 안내까지, 필요한 지원을 받아보실 수 있습니다.",
      trustedLabel: "반복 영업 업무가 많은 팀이 사용하는 Onehand",
      companies: ["LG AI Research", "Sendbird", "HYOSUNG"],
      quoteCompany: "OpenAI",
      quote:
        "직원들은 같은 딜 목표와 고객 정보를 공유할 수 있는 단일 업무 공간이 필요합니다. Onehand는 영업 흐름을 한곳에서 처리할 수 있게 합니다.",
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
        detail: "Onehand를 어떻게 사용하고 싶은지 적어주세요.",
      },
      marketingAgreement: "Onehand의 마케팅 메시지를 수신하는 데 동의합니다.",
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
      logoAria: "Onehand ホーム",
      nav: {
        product: "製品",
        pricing: "料金",
        contact: "お問い合わせ",
        freeCta: "Onehandを始める",
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
      productTour: "Onehand 1.0 を見る",
      productApp: "アプリへ移動",
      footerColumns: [
        ["会社紹介", "Onehandについて", "セキュリティ", "規約とプライバシー", "プライバシー権利"],
        ["ダウンロード", "iOS & Android"],
        ["リソース", "料金"],
        ["用途別", "エンタープライズ", "スモールビジネス", "個人"],
      ],
      cookieSettings: "Cookie設定",
      languageAria: "言語を選択",
      footerSocialAria: "Onehand ソーシャルリンク",
      copyright: "© 2026 Onehand Labs, Inc.",
    },
    landing: {
      heroTitle: ["営業チームと顧客が", "一緒に動く場所"],
      heroDescription:
        "商談、担当者、予定、議事録を一つの画面でつなぎ、今日やるべきことをすぐ確認できます。",
      primaryCta: "Onehandを始める",
      secondaryCta: "流れを見る",
      customerStrip: "反復営業が多いチームのためのCRM",
      sectionWork: "営業の流れを一日中見失わない。",
      sectionAssistants: "必要なときにいつでも依頼。",
      sectionWorkspace: "すべての営業作業を一か所で管理。",
      quote: "“AIの前に、営業の流れが整います。”",
      trustedTitle: "成果で語る営業チームのために。",
      finalCta: "今すぐ始めましょう。",
      finalPrimary: "Onehandを始める",
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
      title: ["Onehand", "営業チームに問い合わせる"],
      description:
        "料金相談、デモ予約、チームに合った活用方法まで、必要な支援を受けられます。",
      trustedLabel: "反復営業が多いチームが使う Onehand",
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
        detail: "Onehandをどのように使いたいかご記入ください。",
      },
      submit: "営業チームに問い合わせる",
      agreement: "Onehandからのマーケティングメッセージを受け取ることに同意します。",
      finePrint:
        "マーケティングメッセージはいつでも配信停止できます。送信された情報はお問い合わせ対応と導入案内に使用されます。",
      supportPrefix: "技術または製品サポートが必要な場合は",
      supportSuffix: "までメールをお送りください。",
    }),
  },
  "zh-TW": {
    common: {
      logoAria: "Onehand 首頁",
      nav: {
        product: "產品",
        pricing: "價格",
        contact: "諮詢",
        freeCta: "開始使用 Onehand",
        login: "登入",
      },
      productMenuGroups: [
        [
          { title: "AI 銷售助理", description: "整理下一步行動與優先順序" },
          { title: "自動跟進", description: "提醒遺漏的聯繫與行程" },
          { title: "會議紀錄整理", description: "彙整筆記並連結到商機" },
          { title: "全站搜尋", description: "一次搜尋公司、聯絡人與商機" },
        ],
        [
          { title: "客戶資料庫", description: "集中管理公司與聯絡人" },
          { title: "文件", description: "整理提案書與資料" },
          { title: "專案", description: "同時管理商機與執行任務" },
          { title: "行程", description: "追蹤會議與後續工作" },
        ],
        [
          { title: "連結", description: "串連所有銷售紀錄" },
          { title: "安全", description: "區隔敏感筆記與權限" },
          { title: "範本", description: "保存重複工作的結構" },
          { title: "報表", description: "查看成果與風險" },
        ],
      ],
      productTour: "查看 Onehand 1.0",
      productApp: "進入應用程式",
      footerColumns: [
        ["公司介紹", "關於 Onehand", "安全", "條款與隱私", "隱私權利"],
        ["下載", "iOS & Android"],
        ["資源", "價格"],
        ["適用對象", "企業", "小型企業", "個人"],
      ],
      cookieSettings: "Cookie 設定",
      languageAria: "選擇語言",
      footerSocialAria: "Onehand 社群連結",
      copyright: "© 2026 Onehand Labs, Inc.",
    },
    landing: {
      heroTitle: ["銷售團隊與客戶", "協同工作的地方"],
      heroDescription:
        "在同一個介面串連商機、聯絡人、行程與會議紀錄，立即查看今天該完成的工作。",
      primaryCta: "開始使用 Onehand",
      secondaryCta: "查看流程",
      customerStrip: "為重複銷售工作較多的團隊設計的 CRM",
      sectionWork: "全天掌握銷售流程。",
      sectionAssistants: "需要時隨時請求協助。",
      sectionWorkspace: "在同一處管理所有銷售工作。",
      quote: "「在導入 AI 之前，先把銷售流程整理清楚。」",
      trustedTitle: "為重視成果的銷售團隊而設計。",
      finalCta: "現在開始。",
      finalPrimary: "開始使用 Onehand",
    },
    pricing: makeTranslatedPricing({
      title: "營運銷售所需的一體化工具。",
      description: "從個人銷售到小型團隊管線，依階段選擇需要的功能。",
      tags: ["商機", "客戶", "行程", "會議紀錄", "搜尋", "AI"],
      captions: ["客戶諮詢", "流程設計", "團隊營運"],
      monthly: "月付",
      annual: "年付節省 20%",
      currency: "TWD 參考",
      recommended: "推薦",
      aiLabel: "AI 選項",
      aiTitle: "為重要工作打造的 AI 銷售助理。",
      aiDescription: "將會議摘要、下一步行動與跟進提醒連結到銷售管線。",
      aiCta: "了解 AI 功能",
      setupTitle: "包含匯入支援",
      setupDescription: "一起設計資料匯入、銷售階段與團隊導入流程。",
      featuresTitle: "價格與功能",
      featureColumn: "功能",
      faqTitle: "常見問題",
    }),
    contact: makeTranslatedContact({
      title: ["Onehand", "聯繫銷售團隊"],
      description: "從價格諮詢、Demo 預約到適合團隊的使用方案，我們會提供所需支援。",
      trustedLabel: "重複銷售工作較多的團隊正在使用 Onehand",
      labels: {
        firstName: "名 *",
        lastName: "姓 *",
        email: "工作信箱 *",
        title: "職稱 *",
        company: "公司名稱 *",
        companySize: "公司規模 *",
        region: "國家或地區 *",
        phone: "電話號碼 *",
        reason: "諮詢原因 *",
        detail: "請提供詳細資訊。*",
      },
      placeholders: {
        firstName: "明",
        lastName: "王",
        email: "you@company.com",
        title: "銷售負責人",
        company: "範例有限公司",
        companySize: "請選擇",
        region: "台灣",
        phone: "0912 345 678",
        reason: "請選擇",
        detail: "請寫下您希望如何使用 Onehand。",
      },
      submit: "聯繫銷售團隊",
      agreement: "我同意接收 Onehand 的行銷訊息。",
      finePrint:
        "您可以隨時取消接收行銷訊息。提交的資訊將用於回覆諮詢與產品導入說明。",
      supportPrefix: "如果需要技術或產品支援，請寄送電子郵件至",
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
  "en-SG": makeEnglishCopy({
    organise: "organise",
    organizing: "organising",
    title: "One tool for running sales.",
    contactTitle: "Contact sales",
    pricing: "Pricing",
    contact: "Contact",
    languageRegion: "SG",
  }),
  "en-AU": makeEnglishCopy({
    organise: "organise",
    organizing: "organising",
    title: "One tool for running sales.",
    contactTitle: "Contact sales",
    pricing: "Pricing",
    contact: "Contact",
    languageRegion: "AU",
  }),
  "en-CA": makeEnglishCopy({
    organise: "organize",
    organizing: "organizing",
    title: "One tool for running sales.",
    contactTitle: "Contact sales",
    pricing: "Pricing",
    contact: "Contact",
    languageRegion: "CA",
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
    window.localStorage.setItem(publicSiteLanguageStorageKey, language);
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

export function getPublicSiteCopyLanguage(
  language: PublicSiteLanguage
): PublicSiteCopyLanguage {
  if (language === "en-AU") {
    return "en-GB";
  }

  if (language === "en-SG" || language === "en-CA") {
    return "en-US";
  }

  return language;
}

function getInitialLanguage(): PublicSiteLanguage {
  return resolvePublicSiteLanguage();
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
  const isJapanese = copy.title.includes("営業");
  const isChinese = copy.title.includes("銷售");
  const isEnglish = !isJapanese && !isChinese;
  const isGbp = copy.currency.includes("GBP");
  const isSgd = copy.currency.includes("SGD");
  const isAud = copy.currency.includes("AUD");
  const isCad = copy.currency.includes("CAD");

  return {
    ...copy,
    mediaCaptions: copy.captions,
    mediaAlts: isChinese
      ? ["客戶諮詢情境", "白板工作設計", "團隊簡報與會議"]
      : isJapanese
        ? ["顧客相談の場面", "ホワイトボードでの業務設計", "チーム発表と会議"]
        : ["Customer call scene", "Whiteboard workflow planning", "Team presentation and meeting"],
    billingMonthly: copy.monthly,
    billingAnnual: copy.annual,
    priceLabels: isChinese
      ? ["NT$0", "NT$299", "NT$699", ""]
      : isJapanese
        ? ["¥0", "¥1,500", "¥3,200", ""]
        : isGbp
          ? ["£0", "£9", "£20", ""]
          : isSgd
            ? ["S$0", "S$14", "S$30", ""]
            : isAud
              ? ["A$0", "A$15", "A$33", ""]
              : isCad
                ? ["C$0", "C$14", "C$30", ""]
                : ["$0", "$10", "$22", ""],
    pricePeriod: isEnglish ? "/mo" : "/月",
    aiImageAlt: isChinese
      ? "團隊在會議室分享銷售計畫"
      : isJapanese
        ? "会議室でチームが営業計画を共有する様子"
        : "Team sharing a sales plan in a meeting room",
    aiAvatarLabels: isChinese
      ? ["商機", "會", "任"]
      : isJapanese
        ? ["商談", "会", "タ"]
        : ["Deal", "Meet", "Task"],
    includedValues: isChinese ? ["包含"] : isJapanese ? ["含む"] : ["Included"],
    emptyCell: "—",
    plans: [
      {
        name: isJapanese ? "無料" : isChinese ? "免費" : "Free",
        description:
          isJapanese
            ? "最初の営業記録を整理する個人向け"
            : isChinese
              ? "適合剛開始整理銷售紀錄的個人"
              : "For individuals getting their sales records in order",
        cta: isChinese ? "開始使用" : isJapanese ? "始める" : "Get started",
        features:
          isChinese
            ? ["公司/聯絡人基礎管理", "30 個商機", "行程與會議紀錄", "行動瀏覽器支援"]
            : isJapanese
              ? ["会社/担当者の基本管理", "商談30件", "予定と議事録", "モバイルブラウザ対応"]
              : ["Basic company/contact management", "30 deals", "Calendar and notes", "Mobile browser support"],
      },
      {
        name: isJapanese ? "プラス" : isChinese ? "Plus" : "Plus",
        description:
          isJapanese
            ? "パイプラインを継続的に管理するユーザー向け"
            : isChinese
              ? "適合持續管理銷售管線的使用者"
              : "For people actively managing a sales pipeline",
        cta: isChinese ? "免費試用" : isJapanese ? "無料で試す" : "Free trial",
        features:
          isChinese
            ? ["商機無限制", "XLSX 下載", "垃圾桶還原", "進階篩選與排序"]
            : isJapanese
              ? ["商談無制限", "XLSXダウンロード", "ゴミ箱復元", "高度なフィルターと並び替え"]
              : ["Unlimited deals", "XLSX export", "Trash restore", "Advanced filters and sorting"],
      },
      {
        name: isJapanese ? "ビジネス" : isChinese ? "商務" : "Business",
        description:
          isJapanese
            ? "反復営業フローを自動化するチーム向け"
            : isChinese
              ? "適合自動化重複銷售流程的團隊"
              : "For teams automating repeat sales workflows",
        cta: isChinese ? "開始使用" : isJapanese ? "始める" : "Get started",
        features:
          isChinese
            ? ["AI 會議摘要", "優先順序推薦", "團隊共享檢視", "敏感筆記保護"]
            : isJapanese
              ? ["AI議事録要約", "優先順位の提案", "チーム共有ビュー", "機密メモ保護"]
              : ["AI meeting summaries", "Priority suggestions", "Shared team views", "Sensitive note protection"],
      },
      {
        name: isJapanese ? "エンタープライズ" : isChinese ? "企業" : "Enterprise",
        description:
          isJapanese
            ? "セキュリティ、権限、運用ポリシーが必要な組織向け"
            : isChinese
              ? "適合需要安全、權限與營運政策的組織"
              : "For organizations with security, access, and policy needs",
        cta: isChinese ? "聯繫我們" : isJapanese ? "問い合わせる" : "Contact us",
        features:
          isChinese
            ? ["專屬導入支援", "稽核記錄", "權限策略", "安全審查支援"]
            : isJapanese
              ? ["専任導入支援", "監査ログ", "権限ポリシー", "セキュリティレビュー支援"]
              : ["Dedicated onboarding", "Audit logs", "Access policies", "Security review support"],
      },
    ],
    comparisonGroups:
      copy.title.includes("銷售")
        ? [
            {
              title: "工作區",
              rows: [
                ["公司/聯絡人管理", "基礎", "無限制", "無限制", "無限制"],
                ["產品管理", "基礎", "無限制", "無限制", "無限制"],
                ["銷售管線", "30個", "無限制", "無限制", "無限制"],
                ["行程/會議紀錄", "基礎", "進階", "進階", "進階"],
                ["搜尋", "基礎", "進階", "進階", "進階"],
              ],
            },
            {
              title: "AI 與自動化",
              rows: [
                ["會議摘要", "", "", "包含", "包含"],
                ["下一步推薦", "", "", "包含", "包含"],
                ["跟進提醒", "基礎", "進階", "進階", "進階"],
                ["銷售報表", "", "基礎", "進階", "客製"],
                ["重複任務範本", "", "包含", "包含", "客製"],
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
      copy.title.includes("銷售")
        ? [
            "免費方案可以使用多久？",
            "商務方案的 AI 功能會使用哪些資料？",
            "團隊權限管理何時提供？",
            "可以匯入現有客戶資料嗎？",
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
        ? "社員は同じ商談目標と顧客情報を共有できる一つの業務空間を必要としています。Onehandは営業の流れを一か所で処理できるようにします。"
        : copy.title[1].includes("聯繫")
          ? "團隊需要一個能共享同一銷售目標與客戶資訊的工作空間。Onehand 讓銷售流程集中處理。"
          : "Teams need one workspace where deal goals and customer context stay together. Onehand keeps the sales flow in one place.",
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
          copy.title[1].includes("聯繫")
            ? "我們能更有效率地簡化銷售工作流程。"
            : copy.title[1].includes("問い合わせ")
              ? "営業ワークフローをより効率的に単純化できました。"
              : "We simplified our sales workflow more efficiently.",
        person: "Rahim Makani",
        role: copy.title[1].includes("聯繫") ? "產品負責人" : copy.title[1].includes("問い合わせ") ? "プロダクト責任者" : "Product Lead",
      },
      {
        company: "TOYOTA",
        quote:
          copy.title[1].includes("聯繫")
            ? "我們可以掌握全球市場進展，不再遺漏脈絡。"
            : copy.title[1].includes("問い合わせ")
              ? "世界中の市場進捗を把握し、見落としを減らせました。"
              : "We can follow market progress without missing context.",
        person: "Taku Wakasugi",
        role: "Research Center",
      },
      {
        company: "ramp",
        quote:
          copy.title[1].includes("聯繫")
            ? "重複工作減少後，我們能專注於客戶與合約流程。"
            : copy.title[1].includes("問い合わせ")
              ? "反復業務が減り、顧客と契約の流れに集中できました。"
              : "With repeat work reduced, we can focus on customers and contracts.",
        person: "Geoff Charles",
        role: copy.title[1].includes("聯繫") ? "營運負責人" : copy.title[1].includes("問い合わせ") ? "運用責任者" : "Operations Lead",
      },
    ],
  };
}

function getEnglishPricingCurrency(
  languageRegion: "US" | "UK" | "SG" | "AU" | "CA"
) {
  if (languageRegion === "UK") return "GBP reference";
  if (languageRegion === "SG") return "SGD reference";
  if (languageRegion === "AU") return "AUD reference";
  if (languageRegion === "CA") return "CAD reference";
  return "USD reference";
}

function getEnglishContactRegion(
  languageRegion: "US" | "UK" | "SG" | "AU" | "CA"
) {
  if (languageRegion === "UK") return "United Kingdom";
  if (languageRegion === "SG") return "Singapore";
  if (languageRegion === "AU") return "Australia";
  if (languageRegion === "CA") return "Canada";
  return "United States";
}

function makeEnglishCopy(copy: {
  readonly organise: string;
  readonly organizing: string;
  readonly title: string;
  readonly contactTitle: string;
  readonly pricing: string;
  readonly contact: string;
  readonly languageRegion: "US" | "UK" | "SG" | "AU" | "CA";
}): PublicSiteCopy {
  const common: PublicSiteCopy["common"] = {
    logoAria: "Onehand home",
    nav: {
      product: "Product",
      pricing: copy.pricing,
      contact: copy.contact,
      freeCta: "Get Onehand",
      login: copy.languageRegion === "US" || copy.languageRegion === "CA" ? "Log in" : "Sign in",
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
    productTour: "Explore Onehand 1.0",
    productApp: "Go to app",
    footerColumns: [
      ["Company", "About us", "Security", "Terms and privacy", "Your privacy rights"],
      ["Download", "iOS & Android"],
      ["Resources", "Pricing"],
      ["Onehand for", "Enterprise", "Small business", "Personal"],
    ],
    cookieSettings: "Cookie settings",
    languageAria: "Select language",
    footerSocialAria: "Onehand social links",
    copyright: "© 2026 Onehand Labs, Inc.",
  };

  return {
    common,
    landing: {
      heroTitle: ["Where sales teams", "move with customers"],
      heroDescription:
        "Connect deals, contacts, calendar, and meeting notes in one place and see today's next actions immediately.",
      primaryCta: "Get Onehand",
      secondaryCta: "See the flow",
      customerStrip: `A CRM designed for teams ${copy.organizing} repeat sales work`,
      sectionWork: "Keep your sales flow moving all day.",
      sectionAssistants: "Ask whenever you need help.",
      sectionWorkspace: "Manage all sales work in one place.",
      quote: "“Before AI, the sales flow gets organized.”",
      trustedTitle: "For sales teams that ship results.",
      finalCta: "Get started today.",
      finalPrimary: "Get Onehand",
    },
    pricing: makeTranslatedPricing({
      title: copy.title,
      description:
        "Choose the right set of features for solo selling, small teams, and pipeline operations.",
      tags: ["Deals", "Customers", "Calendar", "Notes", "Search", "AI"],
      captions: ["Customer call", "Workflow design", "Team operations"],
      monthly: "Monthly billing",
      annual: "Save 20% annually",
      currency: getEnglishPricingCurrency(copy.languageRegion),
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
      title: ["Onehand", copy.contactTitle],
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
        region: getEnglishContactRegion(copy.languageRegion),
        phone: "(123) 456-7891",
        reason: "Select an option",
        detail: "Tell us how you want to use Onehand.",
      },
      submit: "Contact sales",
      agreement: "I agree to receive marketing messages from Onehand.",
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
