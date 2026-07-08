import { ArrowRight, LockKeyhole } from "lucide-react";
import { Link } from "react-router-dom";
import { PublicSitePageShell } from "@/features/public-site/components/public-site-page-shell";
import {
  usePublicSiteLanguage,
  type PublicSiteLanguage,
} from "@/features/public-site/i18n/public-site-language";

type DefinitionCopy = {
  readonly term: string;
  readonly description: string;
};

type PrivacySubsection = {
  readonly title: string;
  readonly paragraphs?: readonly string[];
  readonly bullets?: readonly string[];
};

type PrivacySection = {
  readonly id: string;
  readonly title: string;
  readonly paragraphs?: readonly string[];
  readonly bullets?: readonly string[];
  readonly subsections?: readonly PrivacySubsection[];
};

type PrivacyCopy = {
  readonly eyebrow: string;
  readonly title: string;
  readonly intro: readonly string[];
  readonly definitionsTitle: string;
  readonly definitions: readonly DefinitionCopy[];
  readonly contactTitle: string;
  readonly contactDescription: string;
  readonly contactCta: string;
  readonly lastUpdated: string;
  readonly tableHeaders: readonly [string, string, string];
  readonly californiaRows: readonly (readonly [string, string, string])[];
  readonly sections: readonly PrivacySection[];
};

const privacyCopyByLanguage: Record<PublicSiteLanguage, PrivacyCopy> = {
  ko: {
    eyebrow: "Onehand 개인정보",
    title: "개인정보 처리방침",
    intro: [
      "Onehand는 2026년 7월 8일자로 이 개인정보 처리방침을 업데이트했습니다. 이전 버전은 Onehand 팀에 문의해 요청할 수 있습니다.",
      "이 방침은 Onehand가 정보를 수집, 사용, 공개하는 방법과 사용자가 특정 사용에 반대하거나 정보 접근 및 업데이트를 요청할 수 있는 선택권을 설명합니다.",
    ],
    definitionsTitle: "이 방침에서 사용하는 정의",
    definitions: [
      {
        term: "Onehand",
        description: "Onehand Labs, Inc. 및 관련 계열사를 의미합니다.",
      },
      {
        term: "웹사이트",
        description: "공개 웹사이트와 공개 제품 페이지를 의미합니다.",
      },
      {
        term: "서비스",
        description:
          "Onehand SaaS 플랫폼, 관련 API, 웹·모바일·데스크톱 애플리케이션을 의미합니다.",
      },
      {
        term: "워크스페이스",
        description:
          "사용자가 고객 기록과 관련 콘텐츠를 제출, 게시, 수정, 정리하는 분리된 공간입니다.",
      },
    ],
    contactTitle: "문의하기",
    contactDescription:
      "이 개인정보 처리방침 또는 개인정보 처리 관행에 대한 질문이 있으면 Onehand 팀에 문의하세요.",
    contactCta: "Onehand 문의",
    lastUpdated: "최종 업데이트: 2026년 7월 8일",
    tableHeaders: ["범주", "비즈니스 목적 공개", "적용 시 판매/공유"],
    californiaRows: [
      ["식별자", "서비스 제공자, 계열사, 법적 수신자, 광고 파트너", "적용 가능한 광고 파트너"],
      ["상업 정보", "서비스 제공자, 계열사, 법적 수신자", "무관한 제3자 제안을 위해 판매/공유하지 않음"],
      ["네트워크 활동", "서비스 제공자, 분석 제공자, 광고 파트너", "적용 가능한 광고 파트너"],
      ["일반 위치 정보", "서비스 제공자와 분석 제공자", "적용 가능한 광고 파트너"],
      ["직업 정보", "서비스 제공자, 계열사, 법적 수신자", "판매/공유하지 않음"],
      ["추론 정보", "서비스 제공자, 분석 제공자, 광고 파트너", "적용 가능한 광고 파트너"],
    ],
    sections: [
      {
        id: "information-we-collect",
        title: "1. 수집하는 정보",
        paragraphs: [
          "우리는 사용자가 제공하는 정보, 웹사이트 또는 서비스를 사용할 때 생성되는 정보, 그리고 다른 출처가 제공하는 정보를 수집합니다.",
        ],
        subsections: [
          {
            title: "A. 사용자가 제공하는 정보",
            bullets: [
              "계정 생성 정보: 이름, 이메일 주소, 역할, 회사 정보, 프로필 및 워크스페이스 세부정보.",
              "문의와 지원 정보: 이메일, 전화번호, 지원 메시지, 첨부파일, 사용자가 선택해 제공하는 정보.",
              "결제 정보: 결제 제공자를 통해 처리되는 청구 및 거래 정보.",
              "협업 콘텐츠: 양식, 댓글, 메시지, 공유 워크스페이스에 제출하는 내용.",
            ],
          },
          {
            title: "B. 자동으로 수집되는 정보",
            bullets: [
              "기기 및 사용 데이터: IP 주소, 브라우저, 운영체제, 언어, 시간대, 조회한 페이지와 클릭.",
              "쿠키와 유사 기술: 로그인, 보안, 선호도, 분석, 마케팅을 지원하는 쿠키와 로컬 저장소.",
              "분석 정보: 제품 성능과 서비스 개선을 이해하기 위한 집계 또는 이벤트 수준 사용 정보.",
            ],
          },
          {
            title: "C. 다른 출처의 정보",
            bullets: [
              "서드파티 로그인 또는 통합 제공자가 사용자의 설정에 따라 프로필이나 연결 정보를 제공할 수 있습니다.",
              "조직이 계정을 관리하는 경우 조직, 역할, 멤버십, 워크스페이스 정보를 받을 수 있습니다.",
            ],
          },
        ],
      },
      {
        id: "how-we-use",
        title: "2. 정보를 사용하는 방법",
        paragraphs: [
          "우리는 Onehand 제공, 보호, 지원, 개선과 관련된 비즈니스 및 운영 목적을 위해 정보를 사용합니다.",
        ],
        bullets: [
          "계정과 워크스페이스 생성, 인증, 관리.",
          "고객 기록, 노트, 업무, 딜 워크플로, AI 지원 기능 제공.",
          "구독, 청구, 결제, 고객 지원, 보안 문의, 개인정보 요청 처리.",
          "서비스 메시지, 제품 업데이트, 관리 공지 발송.",
          "플랫폼 안정성, 보안, 기능 개선, 사기와 오용 방지.",
        ],
      },
      {
        id: "disclosing",
        title: "3. 정보 공개",
        paragraphs: [
          "사용 방식과 선택에 따라 서비스 제공자, 비즈니스 파트너, 계열사, 광고 및 분석 파트너, 워크스페이스 사용자, 조직 관리자, 법적 수신자, 거래 관련 당사자에게 정보를 공개할 수 있습니다.",
        ],
      },
      {
        id: "international-transfers",
        title: "4. 국제 데이터 이전",
        paragraphs: [
          "Onehand에서 처리되는 정보는 사용자가 거주하는 국가 외의 국가로 이전, 처리, 저장될 수 있습니다.",
          "국제 이전 시 적용 법률이 요구하는 계약상 보호 또는 인정된 이전 메커니즘을 사용하려고 노력합니다.",
        ],
      },
      {
        id: "choices",
        title: "5. 사용자의 선택",
        bullets: [
          "동의에 기반한 처리에 대해서는 언제든지 동의를 철회할 수 있습니다.",
          "마케팅 이메일은 수신 거부 안내를 통해 중단할 수 있습니다.",
          "브라우저 설정 또는 제공되는 도구를 통해 쿠키를 관리할 수 있습니다.",
          "적용 법률이 요구하는 경우 법적으로 인정된 선호 신호에 대응합니다.",
        ],
      },
      {
        id: "privacy-rights",
        title: "6. 개인정보 권리",
        paragraphs: [
          "거주 지역과 적용 법률에 따라 접근, 정정, 삭제, 처리 제한, 반대, 이동, 차별 금지, 대리인 요청, 이의 제기 권리가 있을 수 있습니다.",
        ],
      },
      {
        id: "retention",
        title: "7. 데이터 보존",
        paragraphs: [
          "우리는 서비스 제공, 법적 의무 준수, 분쟁 해결, 계약 집행, 보안 유지, 감사, 정당한 비즈니스 목적에 필요한 기간 동안 정보를 보존합니다.",
          "워크스페이스 콘텐츠는 워크스페이스 설정, 고객 계약, 백업 관행, 법적 요구에 따라 보존될 수 있습니다.",
        ],
      },
      {
        id: "security",
        title: "8. 정보 보안",
        paragraphs: [
          "우리는 처리하는 정보의 성격에 맞는 관리적, 기술적, 조직적 보호 조치를 포함해 정보를 보호하기 위한 조치를 취합니다.",
          "어떤 시스템도 완전히 안전할 수 없으며, 법이 허용하는 범위에서 무단 접근이나 공개가 절대 발생하지 않는다고 보장할 수 없습니다.",
        ],
      },
      {
        id: "third-party-websites",
        title: "9. 제3자 웹사이트와 애플리케이션",
        paragraphs: [
          "웹사이트 또는 서비스에는 제3자 웹사이트, 애플리케이션, 통합, 서비스 링크가 포함될 수 있습니다. 해당 제3자의 개인정보 관행은 자체 정책을 따릅니다.",
        ],
      },
      {
        id: "children",
        title: "10. 아동 정보",
        paragraphs: [
          "서비스는 일반 비즈니스 이용자를 대상으로 하며 아동을 대상으로 하지 않습니다. 유효한 동의 없이 아동 정보를 수집한 사실을 알게 되면 관련 법률에 따라 삭제 조치를 취합니다.",
        ],
      },
      {
        id: "supervisory-authority",
        title: "11. 감독기관",
        paragraphs: [
          "유럽경제지역 또는 영국 등 관할권에 있는 경우, 정보 처리에 문제가 있다고 생각하면 데이터 보호 감독기관에 불만을 제기할 권리가 있을 수 있습니다.",
        ],
      },
      {
        id: "california",
        title: "12. 캘리포니아 거주자를 위한 추가 정보",
        paragraphs: [
          "캘리포니아 개인정보 보호법은 수집하는 개인정보 범주, 사용 목적, 공개·공유·판매 대상에 대한 추가 정보를 요구할 수 있습니다.",
          "이 섹션에서 개인정보, 판매, 공유, 민감한 개인정보 등 용어는 적용 가능한 캘리포니아 법률의 의미를 따릅니다.",
        ],
      },
      {
        id: "data-privacy-framework",
        title: "13. 데이터 개인정보 프레임워크",
        paragraphs: [
          "고객 계약, 이전 메커니즘, 개인정보 인증이 적용되는 경우 해당 계약 또는 인증 자료의 조건이 우선합니다.",
          "Onehand가 별도로 게시하거나 합의하지 않는 한 이 페이지는 특정 데이터 이전 인증을 주장하지 않습니다.",
        ],
      },
      {
        id: "changes",
        title: "14. 개인정보 처리방침 변경",
        paragraphs: [
          "우리는 이 방침을 수시로 개정할 수 있습니다. 변경이 중요한 경우 적용 법률에 따라 통지합니다.",
          "업데이트된 방침이 효력을 발생한 후 웹사이트 또는 서비스를 계속 사용하면 업데이트된 방침을 확인한 것으로 간주됩니다.",
        ],
      },
    ],
  },
  ja: {
    eyebrow: "Onehand プライバシー",
    title: "プライバシーポリシー",
    intro: [
      "Onehandは2026年7月8日付でこのプライバシーポリシーを更新しました。以前のバージョンはOnehandチームに連絡して請求できます。",
      "このポリシーは、Onehandが情報を収集、利用、開示する方法と、特定の利用への異議、情報へのアクセス、更新要求などの選択肢を説明します。",
    ],
    definitionsTitle: "このポリシーで使う定義",
    definitions: [
      { term: "Onehand", description: "Onehand Labs, Inc.および関連会社を指します。" },
      { term: "ウェブサイト", description: "公開ウェブサイトと公開製品ページを指します。" },
      {
        term: "サービス",
        description:
          "OnehandのSaaSプラットフォーム、関連API、Web、モバイル、デスクトップアプリを指します。",
      },
      {
        term: "ワークスペース",
        description:
          "ユーザーが顧客記録と関連コンテンツを提出、投稿、修正、整理する分離された領域です。",
      },
    ],
    contactTitle: "お問い合わせ",
    contactDescription:
      "このプライバシーポリシーまたは当社のプライバシー慣行について質問がある場合は、Onehandチームにお問い合わせください。",
    contactCta: "Onehandに問い合わせる",
    lastUpdated: "最終更新日: 2026年7月8日",
    tableHeaders: ["カテゴリ", "事業目的での開示", "適用される場合の販売/共有"],
    californiaRows: [
      ["識別子", "サービス提供者、関連会社、法的受領者、広告パートナー", "適用される広告パートナー"],
      ["商業情報", "サービス提供者、関連会社、法的受領者", "無関係な第三者提案のためには販売/共有しません"],
      ["ネットワーク活動", "サービス提供者、分析提供者、広告パートナー", "適用される広告パートナー"],
      ["一般的な位置情報", "サービス提供者と分析提供者", "適用される広告パートナー"],
      ["職業情報", "サービス提供者、関連会社、法的受領者", "販売/共有しません"],
      ["推定情報", "サービス提供者、分析提供者、広告パートナー", "適用される広告パートナー"],
    ],
    sections: [
      {
        id: "information-we-collect",
        title: "1. 収集する情報",
        paragraphs: [
          "当社は、ユーザーが提供する情報、ウェブサイトまたはサービス利用時に生成される情報、他の情報源から提供される情報を収集します。",
        ],
        subsections: [
          {
            title: "A. ユーザーが提供する情報",
            bullets: [
              "アカウント作成情報: 氏名、メールアドレス、役割、会社情報、プロフィール、ワークスペース詳細。",
              "問い合わせとサポート情報: メール、電話番号、サポートメッセージ、添付ファイル、任意で提供する情報。",
              "決済情報: 決済提供者を通じて処理される請求と取引情報。",
              "共同作業コンテンツ: フォーム、コメント、メッセージ、共有ワークスペースに提出する内容。",
            ],
          },
          {
            title: "B. 自動的に収集される情報",
            bullets: [
              "デバイスと利用データ: IPアドレス、ブラウザ、OS、言語、タイムゾーン、閲覧ページ、クリック。",
              "Cookieと類似技術: ログイン、セキュリティ、設定、分析、マーケティングを支援するCookieとローカルストレージ。",
              "分析情報: 製品性能とサービス改善を理解するための集計またはイベントレベルの利用情報。",
            ],
          },
          {
            title: "C. 他の情報源からの情報",
            bullets: [
              "第三者ログインまたは連携提供者が、ユーザー設定に基づいてプロフィールや接続情報を提供する場合があります。",
              "組織がアカウントを管理する場合、組織、役割、メンバーシップ、ワークスペース情報を受け取ることがあります。",
            ],
          },
        ],
      },
      {
        id: "how-we-use",
        title: "2. 情報の利用方法",
        paragraphs: [
          "当社は、Onehandの提供、保護、支援、改善に関連する事業上および運用上の目的で情報を利用します。",
        ],
        bullets: [
          "アカウントとワークスペースの作成、認証、管理。",
          "顧客記録、ノート、タスク、商談ワークフロー、AI支援機能の提供。",
          "サブスクリプション、請求、決済、顧客サポート、セキュリティ問い合わせ、プライバシー要求の処理。",
          "サービスメッセージ、製品更新、管理通知の送信。",
          "プラットフォームの安定性、セキュリティ、機能改善、不正や悪用の防止。",
        ],
      },
      {
        id: "disclosing",
        title: "3. 情報の開示",
        paragraphs: [
          "利用方法と選択に応じて、サービス提供者、ビジネスパートナー、関連会社、広告および分析パートナー、ワークスペースユーザー、組織管理者、法的受領者、取引関係者に情報を開示する場合があります。",
        ],
      },
      {
        id: "international-transfers",
        title: "4. 国際データ移転",
        paragraphs: [
          "Onehandで処理される情報は、ユーザーの居住国以外の国に移転、処理、保存される場合があります。",
          "国際移転では、適用法が求める契約上の保護または認められた移転メカニズムの利用に努めます。",
        ],
      },
      {
        id: "choices",
        title: "5. ユーザーの選択",
        bullets: [
          "同意に基づく処理については、いつでも同意を撤回できます。",
          "マーケティングメールは配信停止手順により停止できます。",
          "ブラウザ設定または提供されるツールでCookieを管理できます。",
          "適用法が求める場合、法的に認められた選好信号に対応します。",
        ],
      },
      {
        id: "privacy-rights",
        title: "6. プライバシー権利",
        paragraphs: [
          "居住地と適用法により、アクセス、訂正、削除、処理制限、異議、データ移転、差別禁止、代理人請求、異議申立ての権利がある場合があります。",
        ],
      },
      {
        id: "retention",
        title: "7. データ保持",
        paragraphs: [
          "当社は、サービス提供、法的義務の遵守、紛争解決、契約執行、セキュリティ維持、監査、正当な事業目的に必要な期間、情報を保持します。",
          "ワークスペースコンテンツは設定、顧客契約、バックアップ慣行、法的要件に従って保持される場合があります。",
        ],
      },
      {
        id: "security",
        title: "8. 情報のセキュリティ",
        paragraphs: [
          "当社は、処理する情報の性質に応じた管理的、技術的、組織的保護措置を含め、情報を保護するための措置を講じます。",
          "完全に安全なシステムはなく、法律で認められる範囲で、無断アクセスや開示が決して起きないことは保証できません。",
        ],
      },
      {
        id: "third-party-websites",
        title: "9. 第三者ウェブサイトとアプリ",
        paragraphs: [
          "ウェブサイトまたはサービスには、第三者のウェブサイト、アプリ、連携、サービスへのリンクが含まれる場合があります。それらのプライバシー慣行は各自の方針に従います。",
        ],
      },
      {
        id: "children",
        title: "10. 子どもの情報",
        paragraphs: [
          "サービスは一般的なビジネス利用者向けであり、子どもを対象としていません。有効な同意なしに子どもの情報を収集したことが判明した場合、適用法に従って削除します。",
        ],
      },
      {
        id: "supervisory-authority",
        title: "11. 監督機関",
        paragraphs: [
          "欧州経済領域または英国などに所在する場合、当社の情報処理が適用法に違反すると考えるときはデータ保護監督機関に苦情を申し立てる権利がある場合があります。",
        ],
      },
      {
        id: "california",
        title: "12. カリフォルニア居住者向け追加情報",
        paragraphs: [
          "カリフォルニアのプライバシー法は、収集する個人情報カテゴリ、利用目的、開示、共有、販売先に関する追加情報を求める場合があります。",
          "このセクションでの個人情報、販売、共有、機密個人情報などの用語は、適用されるカリフォルニア法の意味に従います。",
        ],
      },
      {
        id: "data-privacy-framework",
        title: "13. データプライバシーフレームワーク",
        paragraphs: [
          "顧客契約、移転メカニズム、プライバシー認証が適用される場合、その契約または認証資料の条件が優先されます。",
          "Onehandが別途公開または合意していない限り、このページは特定のデータ移転認証を主張するものではありません。",
        ],
      },
      {
        id: "changes",
        title: "14. プライバシーポリシーの変更",
        paragraphs: [
          "当社はこのポリシーを随時改訂することがあります。重要な変更については適用法に従って通知します。",
          "更新後にウェブサイトまたはサービスを継続利用することは、更新されたポリシーを確認したものとみなされます。",
        ],
      },
    ],
  },
  zh: {
    eyebrow: "Onehand 隐私",
    title: "隐私政策",
    intro: [
      "Onehand 已于 2026年7月8日更新本隐私政策。你可以联系 Onehand 团队请求以前版本。",
      "本隐私政策说明 Onehand 如何收集、使用和披露你的信息，也解释你可如何反对某些使用、访问信息或请求更新。",
    ],
    definitionsTitle: "本政策使用的定义",
    definitions: [
      { term: "Onehand", description: "指 Onehand Labs, Inc. 及相关关联公司。" },
      { term: "网站", description: "指我们的公开网站和公开产品页面。" },
      {
        term: "服务",
        description:
          "指 Onehand 软件即服务平台、相关 API 以及相关网页、移动或桌面应用。",
      },
      {
        term: "工作区",
        description:
          "指用户提交、发布、修改和整理客户记录及相关内容的分离区域。",
      },
    ],
    contactTitle: "联系我们",
    contactDescription:
      "如果你对本隐私政策或我们的隐私实践有疑问，请联系 Onehand 团队。",
    contactCta: "联系 Onehand",
    lastUpdated: "最后更新：2026年7月8日",
    tableHeaders: ["类别", "为业务目的披露", "适用时出售/共享"],
    californiaRows: [
      ["标识符", "服务提供商、关联公司、法律接收方、广告合作伙伴", "适用的广告合作伙伴"],
      ["商业信息", "服务提供商、关联公司、法律接收方", "不会为无关第三方优惠出售/共享"],
      ["网络活动", "服务提供商、分析提供商、广告合作伙伴", "适用的广告合作伙伴"],
      ["一般地理位置", "服务提供商和分析提供商", "适用的广告合作伙伴"],
      ["职业信息", "服务提供商、关联公司、法律接收方", "不出售/共享"],
      ["推断信息", "服务提供商、分析提供商、广告合作伙伴", "适用的广告合作伙伴"],
    ],
    sections: [
      {
        id: "information-we-collect",
        title: "1. 我们收集的信息",
        paragraphs: [
          "我们会收集你提供的信息、你使用网站或服务时产生的信息，以及其他来源提供给我们的信息。",
        ],
        subsections: [
          {
            title: "A. 你提供的信息",
            bullets: [
              "账户创建信息：姓名、邮箱地址、角色、公司信息、个人资料和工作区详情。",
              "联系和支持信息：邮箱、电话号码、支持消息、附件以及你选择提供的其他信息。",
              "支付信息：通过支付服务提供商处理的账单和交易信息。",
              "协作内容：你在表单、评论、消息和共享工作区中提交的内容。",
            ],
          },
          {
            title: "B. 自动收集的信息",
            bullets: [
              "设备和使用数据：IP 地址、浏览器、操作系统、语言、时区、浏览页面和点击。",
              "Cookie 和类似技术：支持登录、安全、偏好、分析和营销的 Cookie 与本地存储。",
              "分析信息：帮助我们了解产品表现并改进服务的汇总或事件级使用信息。",
            ],
          },
          {
            title: "C. 来自其他来源的信息",
            bullets: [
              "第三方登录或集成提供商可能根据你的设置提供资料、账户或连接信息。",
              "如果你的组织配置或管理账户，我们可能收到组织、角色、成员资格或工作区信息。",
            ],
          },
        ],
      },
      {
        id: "how-we-use",
        title: "2. 我们如何使用信息",
        paragraphs: [
          "我们将信息用于与提供、保护、支持和改进 Onehand 相关的业务和运营目的。",
        ],
        bullets: [
          "创建、认证和管理账户与工作区。",
          "提供客户记录、笔记、任务、交易工作流和 AI 辅助功能。",
          "处理订阅、账单、付款、客户支持、安全咨询和隐私请求。",
          "发送服务消息、产品更新和管理通知。",
          "改进平台可靠性、安全性和功能，并防止欺诈和滥用。",
        ],
      },
      {
        id: "disclosing",
        title: "3. 披露信息",
        paragraphs: [
          "根据你的使用方式和选择，我们可能向服务提供商、业务合作伙伴、关联公司、广告和分析合作伙伴、其他工作区用户、组织管理员、法律接收方或交易相关方披露信息。",
        ],
      },
      {
        id: "international-transfers",
        title: "4. 国际数据传输",
        paragraphs: [
          "Onehand 处理的信息可能被传输、处理并存储在你居住国家以外的国家。",
          "进行国际传输时，我们会努力使用适用法律要求的合同保护或其他认可的传输机制。",
        ],
      },
      {
        id: "choices",
        title: "5. 你的选择",
        bullets: [
          "对于基于同意的处理，你可以随时撤回同意。",
          "你可以通过营销邮件中的退订说明停止接收营销消息。",
          "你可以通过浏览器设置或可用工具管理 Cookie。",
          "在适用法律要求的情况下，我们会响应法律认可的偏好信号。",
        ],
      },
      {
        id: "privacy-rights",
        title: "6. 你的隐私权利",
        paragraphs: [
          "根据你的所在地和适用法律，你可能拥有访问、更正、删除、限制或反对处理、数据可携带、不受歧视、授权代理请求和申诉等权利。",
        ],
      },
      {
        id: "retention",
        title: "7. 数据保留",
        paragraphs: [
          "我们会在提供服务、履行法律义务、解决争议、执行协议、维护安全、进行审计和支持合法业务目的所需期间保留信息。",
          "工作区内容可能根据工作区设置、客户协议、备份实践和法律要求保留。",
        ],
      },
      {
        id: "security",
        title: "8. 信息安全",
        paragraphs: [
          "我们采取措施保护信息，包括与处理信息性质相适应的管理、技术和组织保护措施。",
          "没有系统是完全安全的。在法律允许的范围内，我们无法保证信息永远不会被未经授权访问、披露、更改或销毁。",
        ],
      },
      {
        id: "third-party-websites",
        title: "9. 第三方网站和应用",
        paragraphs: [
          "网站或服务可能包含指向第三方网站、应用、集成或服务的链接。这些第三方不受 Onehand 控制，其隐私实践由其自身政策管理。",
        ],
      },
      {
        id: "children",
        title: "10. 儿童信息",
        paragraphs: [
          "服务面向一般商业用户，并非面向儿童。如果我们发现未经有效同意收集了儿童个人信息，会按适用法律采取合理步骤删除。",
        ],
      },
      {
        id: "supervisory-authority",
        title: "11. 监管机构",
        paragraphs: [
          "如果你位于欧洲经济区或英国等司法辖区，并认为我们的信息处理违反适用法律，你可能有权向数据保护监管机构投诉。",
        ],
      },
      {
        id: "california",
        title: "12. 加州居民的附加信息",
        paragraphs: [
          "加州隐私法可能要求我们提供有关收集个人信息类别、使用目的以及披露、共享或出售对象的附加信息。",
          "本节中个人信息、出售、共享和敏感个人信息等术语采用适用加州法律规定的含义。",
        ],
      },
      {
        id: "data-privacy-framework",
        title: "13. 数据隐私框架",
        paragraphs: [
          "如果客户协议、传输机制或隐私认证适用于你使用 Onehand，则该协议或相关认证材料中的控制条款适用。",
          "除非 Onehand 另行发布或同意，本政策页面不声明特定的数据传输认证。",
        ],
      },
      {
        id: "changes",
        title: "14. 隐私政策变更",
        paragraphs: [
          "我们可能不时修订本隐私政策。如变更重大，我们会按适用法律提供通知。",
          "更新后的隐私政策生效后继续使用网站或服务，表示你确认更新后的政策。",
        ],
      },
    ],
  },
  "en-US": {
    eyebrow: "Onehand privacy",
    title: "Privacy policy",
    intro: [
      "Onehand has updated this Privacy Policy effective July 8, 2026. Previous versions may be requested by contacting the Onehand team.",
      "This Privacy Policy describes how Onehand collects, uses, and discloses your information. It also explains choices surrounding how we use personal information, including how you can object to certain uses, access information, or request updates.",
    ],
    definitionsTitle: "Definitions used in this policy",
    definitions: [
      {
        term: "Onehand",
        description: "refers to Onehand Labs, Inc. and relevant affiliates.",
      },
      {
        term: "Website",
        description: "refers to our public websites and public product pages.",
      },
      {
        term: "Services",
        description:
          "refers to the Onehand software-as-a-service platform, related APIs, and related web, mobile, or desktop applications.",
      },
      {
        term: "Workspaces",
        description:
          "are separated areas where users submit, post, modify, and organize customer records and related content.",
      },
    ],
    contactTitle: "Contact us",
    contactDescription:
      "If you have questions about this Privacy Policy or our privacy practices, contact the Onehand team.",
    contactCta: "Contact Onehand",
    lastUpdated: "Last updated: July 8, 2026",
    tableHeaders: ["Category", "Disclosed for business purposes", "Sold/shared where applicable"],
    californiaRows: [
      ["Identifiers", "Service providers, affiliates, legal recipients, advertising partners", "Advertising partners where applicable"],
      ["Commercial information", "Service providers, affiliates, legal recipients", "We do not sell/share for unrelated third-party offers"],
      ["Network activity", "Service providers, analytics providers, advertising partners", "Advertising partners where applicable"],
      ["General geolocation", "Service providers and analytics providers", "Advertising partners where applicable"],
      ["Professional information", "Service providers, affiliates, legal recipients", "We do not sell/share"],
      ["Inferences", "Service providers, analytics providers, advertising partners", "Advertising partners where applicable"],
    ],
    sections: [
      {
        id: "information-we-collect",
        title: "1. Information we collect",
        paragraphs: [
          "We collect information when you provide it to us, when you use our Website or Services, and when other sources provide it to us.",
        ],
        subsections: [
          {
            title: "A. Information you provide to us",
            bullets: [
              "Account creation information: name, email address, role, company information, profile details, and workspace details.",
              "Communications with us: email address, phone number, support messages, attachments, and other information you choose to provide.",
              "Payment information: billing details and transaction information processed through our payment providers.",
              "Collaborative content: content you submit in forms, comments, messages, shared workspaces, or other product areas.",
            ],
          },
          {
            title: "B. Information collected automatically",
            bullets: [
              "Device and usage data: IP address, browser type, operating system, language, time zone, pages viewed, and links clicked.",
              "Cookies and similar technologies: cookies and local storage that support login, security, preferences, analytics, and marketing where permitted.",
              "Analytics information: aggregated and event-level usage information that helps us improve the Services.",
            ],
          },
          {
            title: "C. Information from other sources",
            bullets: [
              "Third-party login or integration providers may provide profile, account, or connection information based on your settings.",
              "If your organization provisions or manages your account, we may receive organization, role, membership, or workspace information.",
            ],
          },
        ],
      },
      {
        id: "how-we-use",
        title: "2. How we use your information",
        paragraphs: [
          "We use information for business and operational purposes related to providing, securing, supporting, and improving Onehand.",
        ],
        bullets: [
          "Create, authenticate, and manage accounts and workspaces.",
          "Provide customer records, notes, tasks, deal workflows, and AI-assisted features.",
          "Process subscriptions, billing, payments, customer support, security inquiries, and privacy requests.",
          "Send service messages, product updates, and administrative notices.",
          "Improve platform reliability, security, and features while preventing fraud and abuse.",
        ],
      },
      {
        id: "disclosing",
        title: "3. Disclosing your information",
        paragraphs: [
          "Depending on how you use Onehand and the choices you make, we may disclose information to service providers, business partners, affiliates, advertising and analytics partners, workspace users, organizations that manage workspaces, legal recipients, or transaction parties.",
        ],
      },
      {
        id: "international-transfers",
        title: "4. International data transfers",
        paragraphs: [
          "Information processed by Onehand may be transferred to, processed in, and stored in countries other than where you live.",
          "When we transfer information internationally, we endeavor to use safeguards required by applicable law, such as contractual protections or other recognized transfer mechanisms.",
        ],
      },
      {
        id: "choices",
        title: "5. Your choices",
        bullets: [
          "Where processing is based on consent, you may withdraw that consent at any time.",
          "You can use unsubscribe instructions in marketing emails to stop future marketing messages.",
          "You may control cookies through browser settings and available preference tools.",
          "We respond to legally recognized preference signals where required by applicable law.",
        ],
      },
      {
        id: "privacy-rights",
        title: "6. Your privacy rights",
        paragraphs: [
          "Depending on your location and applicable law, you may have rights to access, correct, delete, restrict or object to processing, receive portability, avoid discrimination, use an authorized agent, or appeal a response.",
        ],
      },
      {
        id: "retention",
        title: "7. Data retention",
        paragraphs: [
          "We retain information for as long as needed to provide the Services, comply with legal obligations, resolve disputes, enforce agreements, maintain security, conduct audits, and support legitimate business purposes.",
          "Workspace content may be retained according to workspace settings, customer agreements, backup practices, and legal requirements.",
        ],
      },
      {
        id: "security",
        title: "8. Security of your information",
        paragraphs: [
          "We take steps designed to protect information, including administrative, technical, and organizational safeguards appropriate to the nature of the information we process.",
          "No system is completely secure. To the fullest extent permitted by law, we cannot guarantee that information will never be accessed, disclosed, altered, or destroyed without authorization.",
        ],
      },
      {
        id: "third-party-websites",
        title: "9. Third-party websites/applications",
        paragraphs: [
          "The Website or Services may contain links to third-party websites, applications, integrations, or services. These third parties are not controlled by Onehand, and their privacy practices are governed by their own policies.",
        ],
      },
      {
        id: "children",
        title: "10. Children's information",
        paragraphs: [
          "The Services are intended for general business audiences and are not directed to children. If we learn that we have collected personal information from a child without legally valid consent, we will take reasonable steps to delete it as required by applicable law.",
        ],
      },
      {
        id: "supervisory-authority",
        title: "11. Supervisory authority",
        paragraphs: [
          "If you are located in a jurisdiction such as the European Economic Area or the United Kingdom, you may have the right to lodge a complaint with a data protection supervisory authority if you believe our processing of your information violates applicable law.",
        ],
      },
      {
        id: "california",
        title: "12. Additional information for California residents",
        paragraphs: [
          "If you are a California resident, applicable California privacy law may require us to provide additional information about categories of personal information we collect, the purposes for which we use them, and the categories of third parties to whom we disclose, share, or sell them.",
          "For purposes of this section, terms such as personal information, sale, sharing, and sensitive personal information have the meanings given under applicable California law.",
        ],
      },
      {
        id: "data-privacy-framework",
        title: "13. Data privacy framework",
        paragraphs: [
          "Where a customer agreement, transfer mechanism, or privacy certification applies to your use of Onehand, the controlling terms will be stated in that agreement or the related certification materials.",
          "This policy page does not claim a specific data transfer certification unless Onehand has separately published or agreed to that certification.",
        ],
      },
      {
        id: "changes",
        title: "14. Changes to our privacy policy",
        paragraphs: [
          "We may revise this Privacy Policy from time to time. If changes are material, we will provide notice as required by applicable law.",
          "Your continued use of the Website or Services after the updated Privacy Policy takes effect means you acknowledge the updated policy.",
        ],
      },
    ],
  },
  "en-GB": {
    eyebrow: "Onehand privacy",
    title: "Privacy policy",
    intro: [
      "Onehand has updated this Privacy Policy effective 8 July 2026. Previous versions may be requested by contacting the Onehand team.",
      "This Privacy Policy describes how Onehand collects, uses, and discloses your information. It also explains choices surrounding how we use personal information, including how you can object to certain uses, access information, or request updates.",
    ],
    definitionsTitle: "Definitions used in this policy",
    definitions: [
      {
        term: "Onehand",
        description: "refers to Onehand Labs, Inc. and relevant affiliates.",
      },
      {
        term: "Website",
        description: "refers to our public websites and public product pages.",
      },
      {
        term: "Services",
        description:
          "refers to the Onehand software-as-a-service platform, related APIs, and related web, mobile, or desktop applications.",
      },
      {
        term: "Workspaces",
        description:
          "are separated areas where users submit, post, modify, and organise customer records and related content.",
      },
    ],
    contactTitle: "Contact us",
    contactDescription:
      "If you have questions about this Privacy Policy or our privacy practices, contact the Onehand team.",
    contactCta: "Contact Onehand",
    lastUpdated: "Last updated: 8 July 2026",
    tableHeaders: ["Category", "Disclosed for business purposes", "Sold/shared where applicable"],
    californiaRows: [
      ["Identifiers", "Service providers, affiliates, legal recipients, advertising partners", "Advertising partners where applicable"],
      ["Commercial information", "Service providers, affiliates, legal recipients", "We do not sell/share for unrelated third-party offers"],
      ["Network activity", "Service providers, analytics providers, advertising partners", "Advertising partners where applicable"],
      ["General geolocation", "Service providers and analytics providers", "Advertising partners where applicable"],
      ["Professional information", "Service providers, affiliates, legal recipients", "We do not sell/share"],
      ["Inferences", "Service providers, analytics providers, advertising partners", "Advertising partners where applicable"],
    ],
    sections: [
      {
        id: "information-we-collect",
        title: "1. Information we collect",
        paragraphs: [
          "We collect information when you provide it to us, when you use our Website or Services, and when other sources provide it to us.",
        ],
        subsections: [
          {
            title: "A. Information you provide to us",
            bullets: [
              "Account creation information: name, email address, role, company information, profile details, and workspace details.",
              "Communications with us: email address, phone number, support messages, attachments, and other information you choose to provide.",
              "Payment information: billing details and transaction information processed through our payment providers.",
              "Collaborative content: content you submit in forms, comments, messages, shared workspaces, or other product areas.",
            ],
          },
          {
            title: "B. Information collected automatically",
            bullets: [
              "Device and usage data: IP address, browser type, operating system, language, time zone, pages viewed, and links clicked.",
              "Cookies and similar technologies: cookies and local storage that support login, security, preferences, analytics, and marketing where permitted.",
              "Analytics information: aggregated and event-level usage information that helps us improve the Services.",
            ],
          },
          {
            title: "C. Information from other sources",
            bullets: [
              "Third-party login or integration providers may provide profile, account, or connection information based on your settings.",
              "If your organisation provisions or manages your account, we may receive organisation, role, membership, or workspace information.",
            ],
          },
        ],
      },
      {
        id: "how-we-use",
        title: "2. How we use your information",
        paragraphs: [
          "We use information for business and operational purposes related to providing, securing, supporting, and improving Onehand.",
        ],
        bullets: [
          "Create, authenticate, and manage accounts and workspaces.",
          "Provide customer records, notes, tasks, deal workflows, and AI-assisted features.",
          "Process subscriptions, billing, payments, customer support, security enquiries, and privacy requests.",
          "Send service messages, product updates, and administrative notices.",
          "Improve platform reliability, security, and features while preventing fraud and abuse.",
        ],
      },
      {
        id: "disclosing",
        title: "3. Disclosing your information",
        paragraphs: [
          "Depending on how you use Onehand and the choices you make, we may disclose information to service providers, business partners, affiliates, advertising and analytics partners, workspace users, organisations that manage workspaces, legal recipients, or transaction parties.",
        ],
      },
      {
        id: "international-transfers",
        title: "4. International data transfers",
        paragraphs: [
          "Information processed by Onehand may be transferred to, processed in, and stored in countries other than where you live.",
          "When we transfer information internationally, we endeavour to use safeguards required by applicable law, such as contractual protections or other recognised transfer mechanisms.",
        ],
      },
      {
        id: "choices",
        title: "5. Your choices",
        bullets: [
          "Where processing is based on consent, you may withdraw that consent at any time.",
          "You can use unsubscribe instructions in marketing emails to stop future marketing messages.",
          "You may control cookies through browser settings and available preference tools.",
          "We respond to legally recognised preference signals where required by applicable law.",
        ],
      },
      {
        id: "privacy-rights",
        title: "6. Your privacy rights",
        paragraphs: [
          "Depending on your location and applicable law, you may have rights to access, correct, delete, restrict or object to processing, receive portability, avoid discrimination, use an authorised agent, or appeal a response.",
        ],
      },
      {
        id: "retention",
        title: "7. Data retention",
        paragraphs: [
          "We retain information for as long as needed to provide the Services, comply with legal obligations, resolve disputes, enforce agreements, maintain security, conduct audits, and support legitimate business purposes.",
          "Workspace content may be retained according to workspace settings, customer agreements, backup practices, and legal requirements.",
        ],
      },
      {
        id: "security",
        title: "8. Security of your information",
        paragraphs: [
          "We take steps designed to protect information, including administrative, technical, and organisational safeguards appropriate to the nature of the information we process.",
          "No system is completely secure. To the fullest extent permitted by law, we cannot guarantee that information will never be accessed, disclosed, altered, or destroyed without authorisation.",
        ],
      },
      {
        id: "third-party-websites",
        title: "9. Third-party websites/applications",
        paragraphs: [
          "The Website or Services may contain links to third-party websites, applications, integrations, or services. These third parties are not controlled by Onehand, and their privacy practices are governed by their own policies.",
        ],
      },
      {
        id: "children",
        title: "10. Children's information",
        paragraphs: [
          "The Services are intended for general business audiences and are not directed to children. If we learn that we have collected personal information from a child without legally valid consent, we will take reasonable steps to delete it as required by applicable law.",
        ],
      },
      {
        id: "supervisory-authority",
        title: "11. Supervisory authority",
        paragraphs: [
          "If you are located in a jurisdiction such as the European Economic Area or the United Kingdom, you may have the right to lodge a complaint with a data protection supervisory authority if you believe our processing of your information violates applicable law.",
        ],
      },
      {
        id: "california",
        title: "12. Additional information for California residents",
        paragraphs: [
          "If you are a California resident, applicable California privacy law may require us to provide additional information about categories of personal information we collect, the purposes for which we use them, and the categories of third parties to whom we disclose, share, or sell them.",
          "For purposes of this section, terms such as personal information, sale, sharing, and sensitive personal information have the meanings given under applicable California law.",
        ],
      },
      {
        id: "data-privacy-framework",
        title: "13. Data privacy framework",
        paragraphs: [
          "Where a customer agreement, transfer mechanism, or privacy certification applies to your use of Onehand, the controlling terms will be stated in that agreement or the related certification materials.",
          "This policy page does not claim a specific data transfer certification unless Onehand has separately published or agreed to that certification.",
        ],
      },
      {
        id: "changes",
        title: "14. Changes to our privacy policy",
        paragraphs: [
          "We may revise this Privacy Policy from time to time. If changes are material, we will provide notice as required by applicable law.",
          "Your continued use of the Website or Services after the updated Privacy Policy takes effect means you acknowledge the updated policy.",
        ],
      },
    ],
  },
};

export function PrivacyPage() {
  const { language } = usePublicSiteLanguage();
  const copy = privacyCopyByLanguage[language];

  return (
    <PublicSitePageShell>
      <section className="bg-white py-16 sm:py-20 lg:py-24">
        <div className="mx-auto w-full max-w-[1320px] px-4 sm:px-6 lg:px-8">
          <article>
            <div className="max-w-[820px]">
              <p className="text-[13px] font-semibold text-[#777770]">
                {copy.eyebrow}
              </p>
              <h1 className="mt-3 break-keep text-[40px] font-black leading-[1.05] tracking-normal md:text-[58px]">
                {copy.title}
              </h1>
              <div className="mt-5 grid max-w-[760px] gap-4 break-keep text-[14px] leading-7 text-[#444440]">
                {copy.intro.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </div>

            <div className="mt-8 rounded-[8px] bg-[#f7f7f5] p-6">
              <div className="flex items-start gap-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[8px] bg-white text-[#0075DE]">
                  <LockKeyhole className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="break-keep text-[18px] font-black">
                    {copy.definitionsTitle}
                  </h2>
                  <ul className="mt-4 grid gap-3 break-keep text-[13px] leading-6 text-[#555550]">
                    {copy.definitions.map((definition) => (
                      <li key={definition.term}>
                        <strong className="text-[#222220]">
                          {definition.term}
                        </strong>
                        {language === "en-US" || language === "en-GB" ? " " : ": "}
                        {definition.description}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <nav className="mt-10 grid gap-2 rounded-[8px] bg-[#f7f7f5] p-4 text-[13px] font-bold text-[#333330] sm:grid-cols-2">
              {copy.sections.map((section, index) => (
                <a
                  className="rounded-[6px] px-2 py-1.5 hover:bg-white"
                  href={`#${section.id}`}
                  key={section.id}
                >
                  {index + 1}. {section.title.replace(/^\d+\.\s*/, "")}
                </a>
              ))}
            </nav>

            <div className="mt-12 grid gap-12">
              {copy.sections.map((section) => (
                <PrivacySectionBlock
                  copy={copy}
                  key={section.id}
                  section={section}
                />
              ))}
            </div>

            <section className="mt-14 rounded-[8px] bg-[#eef6ff] p-6">
              <h2 className="break-keep text-[20px] font-black">
                {copy.contactTitle}
              </h2>
              <p className="mt-3 break-keep text-[14px] leading-7 text-[#444440]">
                {copy.contactDescription}
              </p>
              <Link
                className="mt-4 inline-flex items-center gap-2 text-[13px] font-black text-[#0075DE] underline-offset-2 hover:underline"
                to="/contact"
              >
                {copy.contactCta}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <p className="mt-5 text-[12px] font-bold text-[#888880]">
                {copy.lastUpdated}
              </p>
            </section>
          </article>
        </div>
      </section>
    </PublicSitePageShell>
  );
}

function PrivacySectionBlock({
  copy,
  section,
}: {
  readonly copy: PrivacyCopy;
  readonly section: PrivacySection;
}) {
  return (
    <section id={section.id}>
      <h2 className="break-keep text-[28px] font-black leading-tight">
        {section.title}
      </h2>
      {section.paragraphs ? (
        <div className="mt-4 grid gap-4 break-keep text-[14px] leading-7 text-[#444440]">
          {section.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      ) : null}
      {section.bullets ? (
        <ul className="mt-4 grid gap-2 break-keep text-[14px] leading-7 text-[#444440]">
          {section.bullets.map((bullet) => (
            <li className="flex gap-3" key={bullet}>
              <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-[#111111]" />
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      ) : null}
      {section.subsections ? (
        <div className="mt-6 grid gap-7">
          {section.subsections.map((subsection) => (
            <div key={subsection.title}>
              <h3 className="break-keep text-[18px] font-black">
                {subsection.title}
              </h3>
              {subsection.paragraphs ? (
                <div className="mt-3 grid gap-4 break-keep text-[14px] leading-7 text-[#444440]">
                  {subsection.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              ) : null}
              {subsection.bullets ? (
                <ul className="mt-3 grid gap-2 break-keep text-[14px] leading-7 text-[#444440]">
                  {subsection.bullets.map((bullet) => (
                    <li className="flex gap-3" key={bullet}>
                      <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-[#111111]" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
      {section.id === "california" ? (
        <div className="mt-6 overflow-hidden rounded-[8px] border border-[#eeeeec]">
          <div className="grid grid-cols-[1fr_1.1fr_1.1fr] bg-[#f7f7f5] text-[12px] font-black text-[#333330]">
            {copy.tableHeaders.map((header) => (
              <div className="p-3" key={header}>
                {header}
              </div>
            ))}
          </div>
          {copy.californiaRows.map((row) => (
            <div
              className="grid grid-cols-[1fr_1.1fr_1.1fr] border-t border-[#eeeeec] text-[12px] leading-5 text-[#555550]"
              key={row[0]}
            >
              {row.map((cell) => (
                <div className="p-3" key={cell}>
                  {cell}
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
