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
  readonly eyebrow: string;
  readonly iosLabel: string;
  readonly title: string;
};

const downloadCopyByLanguage: Record<PublicSiteCopyLanguage, DownloadCopy> = {
  ko: {
    eyebrow: "Download",
    title: "iOS와 Android에서 OneHand를 바로 열어보세요.",
    description:
      "앱 다운로드 흐름을 기준으로 안내합니다. 현장에서 고객을 만난 뒤에도 모바일에서 영업 흐름을 확인할 수 있게 설계합니다.",
    iosLabel: "App Store에서 다운로드",
    androidLabel: "Google Play에서 다운로드",
    ctaTitle: "계정이 있으면 웹에서도 바로 쓸 수 있어요.",
    ctaDescription:
      "모바일과 웹에서 같은 흐름으로 기록을 이어갈 수 있어요.",
    cards: [
      {
        title: "모바일 우선 확인",
        description: "외근 중에도 고객, 일정, 딜 흐름을 빠르게 확인합니다.",
      },
      {
        title: "웹과 이어지는 작업",
        description: "앱에서 본 기록을 웹에서도 이어서 정리할 수 있는 흐름입니다.",
      },
      {
        title: "안전한 계정 접근",
        description: "Google, Apple, LINE 로그인 흐름을 기반으로 접근합니다.",
      },
    ],
  },
  "en-US": {
    eyebrow: "Download",
    title: "Open OneHand on iOS and Android.",
    description:
      "This page is structured around the app download flow, so sellers can check customer and deal context while they are in the field.",
    iosLabel: "Download on the App Store",
    androidLabel: "Get it on Google Play",
    ctaTitle: "Already have an account? You can also start on the web.",
    ctaDescription:
      "OneHand is designed so mobile and web share the same workflow, helping you check and continue sales work while moving.",
    cards: [
      {
        title: "Mobile-first checks",
        description: "Review customers, schedules, and deal flow while working outside the office.",
      },
      {
        title: "Continue on web",
        description: "Pick up the same records on the web when you need a larger screen.",
      },
      {
        title: "Secure account access",
        description: "Access OneHand through Google, Apple, and LINE login flows.",
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
          <PublicDocumentHero
            description={copy.description}
            eyebrow={copy.eyebrow}
            title={copy.title}
          >
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <DownloadLink href={IOS_DOWNLOAD_URL} label={copy.iosLabel} />
              <DownloadLink
                href={ANDROID_DOWNLOAD_URL}
                label={copy.androidLabel}
              />
            </div>
          </PublicDocumentHero>

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
}: {
  readonly href: string;
  readonly label: string;
}) {
  return (
    <a
      className="inline-flex h-11 items-center justify-center gap-2 rounded-[6px] bg-[#111111] px-4 text-[13px] font-normal text-white transition hover:bg-[#2f2f2b]"
      href={href}
      rel="noreferrer"
      target="_blank"
    >
      <Download className="h-4 w-4" />
      {label}
      <ExternalLink className="h-3.5 w-3.5" />
    </a>
  );
}
