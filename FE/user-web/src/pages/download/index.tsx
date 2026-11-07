import {
  Download,
  ExternalLink,
  MonitorSmartphone,
  ShieldCheck,
  Smartphone,
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

const IOS_DOWNLOAD_URL = "https://www.apple.com/app-store/";
const ANDROID_DOWNLOAD_URL = "https://play.google.com/store/apps";

type DownloadCopy = {
  readonly androidLabel: string;
  readonly cards: readonly {
    readonly description: string;
    readonly title: string;
  }[];
  readonly ctaDescription: string;
  readonly ctaTitle: string;
  readonly description: string;
  readonly iosLabel: string;
  readonly title: string;
};

const downloadCopyByLanguage: Record<PublicSiteCopyLanguage, DownloadCopy> = {
  ko: {
    title: "OneHand CRM을 웹에서 시작해요.",
    description:
      "브라우저에서 계정에 로그인해 기록을 관리해요. 아래 버튼은 일반 앱 스토어 링크이며 OneHand CRM 설치 링크가 아니에요. 웹 이용은 하단 시작 버튼을 이용해 주세요.",
    iosLabel: "App Store 둘러보기",
    androidLabel: "Google Play 둘러보기",
    ctaTitle: "브라우저에서 내 기록을 관리해요.",
    ctaDescription:
      "OneHand CRM 계정을 만들거나 데모를 요청해 보세요.",
    cards: [
      {
        title: "웹에서 시작",
        description: "브라우저에서 업무 공간에 접속해요.",
      },
      {
        title: "내 기록 확인",
        description: "로그인한 계정의 업무 공간에서 기록을 확인해요.",
      },
      {
        title: "앱 제공 안내",
        description: "전용 앱 설치 경로는 확인된 정보가 있을 때 안내할게요.",
      },
    ],
  },
  "en-US": {
    title: "Start with OneHand CRM on the web.",
    description:
      "Sign in through your browser to manage records. The buttons below open general app stores, not OneHand CRM installation pages. Use the start button below to access the web product.",
    iosLabel: "Browse the App Store",
    androidLabel: "Browse Google Play",
    ctaTitle: "Manage your records in a browser.",
    ctaDescription:
      "Create a OneHand CRM account or request a demo.",
    cards: [
      {
        title: "Start on the web",
        description: "Open your workspace in a browser.",
      },
      {
        title: "Review your records",
        description: "Sign in to access your workspace records.",
      },
      {
        title: "App availability",
        description: "Dedicated app installation links will be shared when confirmed.",
      },
    ],
  },
};

const downloadCardIcons = [Smartphone, MonitorSmartphone, ShieldCheck] as const;

// 기능 : 공개 앱 다운로드 안내 페이지를 렌더링합니다.
export function DownloadPage() {
  const { language } = usePublicSiteLanguage();
  const copy = downloadCopyByLanguage[getPublicSiteCopyLanguage(language)];

  return (
    <PublicSitePageShell>
      <PublicPageSection>
        <PublicContentContainer>
          <PublicDocumentHero title={copy.title} />

          <div className="mt-16">
            <p className="max-w-[720px] break-keep text-[15px] leading-7 text-[#555550]">
              {copy.description}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <DownloadLink
                href={IOS_DOWNLOAD_URL}
                label={copy.iosLabel}
                platform="apple"
              />
              <DownloadLink
                href={ANDROID_DOWNLOAD_URL}
                label={copy.androidLabel}
                platform="android"
              />
            </div>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {copy.cards.map((card, index) => {
              const Icon = downloadCardIcons[index] ?? Download;

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

// 기능 : 앱스토어와 구글 플레이 외부 다운로드 링크를 렌더링합니다.
function DownloadLink({
  href,
  label,
  platform,
}: {
  readonly href: string;
  readonly label: string;
  readonly platform: "apple" | "android";
}) {
  return (
    <a
      className="inline-flex h-11 items-center justify-center gap-2 rounded-[6px] bg-[#111111] px-4 text-[13px] font-normal text-white transition hover:bg-[#2f2f2b]"
      href={href}
      rel="noreferrer"
      target="_blank"
    >
      <img
        alt=""
        aria-hidden="true"
        className={`h-10 w-10 shrink-0 object-contain${platform === "apple" ? " invert" : ""}`}
        height={40}
        src={platform === "apple" ? "/auth/apple-logo.png" : "/brand/android-logo.svg"}
        width={40}
      />
      {label}
      <ExternalLink className="h-3.5 w-3.5" />
    </a>
  );
}
