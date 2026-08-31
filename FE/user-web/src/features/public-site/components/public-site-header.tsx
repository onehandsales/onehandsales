import {
  ArrowRight,
  Bell,
  BookOpen,
  BriefcaseBusiness,
  Building2,
  ChevronDown,
  CircleHelp,
  FileText,
  FolderKanban,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { OneHandLogoMark } from "@/components/brand/onehand-logo-mark";
import { usePublicSitePath } from "@/features/public-site/i18n/public-site-locale-hooks";
import { usePublicSiteLanguage } from "@/features/public-site/i18n/public-site-language";

type PublicSiteHeaderProps = {
  readonly onLogin?: () => void;
};

const productMenuIconGroups = [
  [
    {
      icon: BriefcaseBusiness,
      tone: "bg-[#f1f1ef] text-[#555550]",
    },
    {
      icon: Building2,
      tone: "bg-[#edf7ff] text-[#1677d2]",
    },
    {
      icon: FolderKanban,
      tone: "bg-[#fff5d8] text-[#b77900]",
    },
  ],
  [
    {
      icon: Bell,
      tone: "bg-[#fff0f0] text-[#d63c31]",
    },
    {
      icon: MessageSquareText,
      tone: "bg-[#eef6ff] text-[#1677d2]",
    },
  ],
  [
    {
      icon: Sparkles,
      tone: "bg-[#fff3e8] text-[#c6531a]",
    },
    {
      icon: FileText,
      tone: "bg-[#f1f1ef] text-[#555550]",
    },
  ],
];

const productMenuTargets: readonly (readonly string[])[] = [
  [
    "/",
    "/features#customers",
    "/features#deals",
  ],
  [
    "/features#schedules",
    "/features#meeting-notes",
  ],
  [
    "/features#ai",
    "/features",
  ],
];

const resourceMenuItems = [
  {
    icon: CircleHelp,
    targetPath: "/help",
    tone: "bg-[#f1f1ef] text-[#555550]",
  },
  {
    icon: BookOpen,
    targetPath: "/help",
    tone: "bg-[#f1f1ef] text-[#555550]",
  },
] as const;

const solutionMenuItems = [
  {
    icon: UserRound,
    targetPath: "/solutions#personal",
    tone: "bg-[#f1f1ef] text-[#555550]",
  },
  {
    icon: Building2,
    targetPath: "/solutions#real-estate",
    tone: "bg-[#f1f1ef] text-[#555550]",
  },
  {
    icon: ShieldCheck,
    targetPath: "/solutions#insurance-auto",
    tone: "bg-[#f1f1ef] text-[#555550]",
  },
  {
    icon: BriefcaseBusiness,
    targetPath: "/solutions#b2b-field",
    tone: "bg-[#f1f1ef] text-[#555550]",
  },
] as const;

// 기능 : 공개 사이트 상단 고정 헤더와 주요 내비게이션을 렌더링합니다.
export function PublicSiteHeader({ onLogin }: PublicSiteHeaderProps) {
  const navigate = useNavigate();
  const { copy } = usePublicSiteLanguage();
  const publicSitePath = usePublicSitePath();

  // 기능 : 로그인 버튼 클릭 시 지정된 핸들러 또는 locale 로그인 페이지 이동을 실행합니다.
  const handleLogin = () => {
    if (onLogin) {
      onLogin();
      return;
    }

    navigate(publicSitePath("/login"));
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-white/95 backdrop-blur">
      <div className="flex h-14 w-full items-center justify-between px-4 md:px-5">
        <Link
          aria-label={copy.common.logoAria}
          className="flex h-9 w-9 items-center justify-center text-[#111111]"
          to={publicSitePath("/")}
        >
          <OneHandLogoMark className="h-9 w-9" />
        </Link>

        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-7 text-[13px] font-normal text-[#4b4b48] md:flex">
          <div className="group relative">
            <button
              className="inline-flex h-9 items-center gap-1 rounded-[6px] px-2 hover:bg-[#f2f2ef] hover:text-[#111111]"
              type="button"
            >
              {copy.common.nav.product}
              <ChevronDown className="h-3.5 w-3.5 transition-transform group-hover:rotate-180" />
            </button>

            <div
              aria-hidden="true"
              className="absolute inset-x-0 top-full hidden h-8 group-hover:block group-focus-within:block"
            />
            <div className="pointer-events-none fixed left-1/2 top-[62px] hidden w-[min(920px,calc(100vw-32px))] -translate-x-1/2 rounded-[16px] border border-[#eeeeec] bg-white p-6 text-left opacity-0 shadow-[0_24px_80px_rgba(15,15,15,0.14)] transition group-hover:pointer-events-auto group-hover:block group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:block group-focus-within:opacity-100">
              <div className="grid gap-5 md:grid-cols-3">
                {productMenuIconGroups.map((items, groupIndex) => (
                  <div className="grid gap-3" key={groupIndex}>
                    {items.map(({ icon: Icon, tone }, itemIndex) => {
                      const itemCopy =
                        copy.common.productMenuGroups[groupIndex]?.[itemIndex];
                      const targetPath =
                        productMenuTargets[groupIndex]?.[itemIndex] ??
                        "/features";

                      return (
                        <Link
                          className="flex items-start gap-3 rounded-[8px] p-2 hover:bg-[#FAFAF8]"
                          key={itemCopy?.title}
                          to={publicSitePath(targetPath)}
                        >
                          <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-[8px] ${tone}`}>
                            <Icon className="h-5 w-5" />
                          </span>
                          <span>
                            <span className="block text-[14px] font-normal text-[#222220]">
                              {itemCopy?.title}
                            </span>
                            <span className="mt-0.5 block text-[12px] font-normal leading-5 text-[#777770]">
                              {itemCopy?.description}
                            </span>
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                ))}
              </div>

              <div className="mt-5 grid border-t border-[#eeeeec] pt-4 md:grid-cols-2">
                <Link
                  className="flex items-center gap-3 rounded-[8px] px-2 py-2 text-[13px] font-normal text-[#555550] hover:bg-[#FAFAF8]"
                  to={publicSitePath("/features")}
                >
                  <Sparkles className="h-4 w-4 text-[#777770]" />
                  {copy.common.productTour}
                  <ArrowRight className="h-3.5 w-3.5 text-[#0077e6]" />
                </Link>
                <Link
                  className="flex items-center gap-3 rounded-[8px] px-2 py-2 text-[13px] font-normal text-[#555550] hover:bg-[#FAFAF8] md:justify-end"
                  to={publicSitePath("/login")}
                >
                  <BriefcaseBusiness className="h-4 w-4 text-[#777770]" />
                  {copy.common.productApp}
                  <ArrowRight className="h-3.5 w-3.5 text-[#0077e6]" />
                </Link>
              </div>
            </div>
          </div>

          <div className="group relative">
            <button
              className="inline-flex h-9 items-center gap-1 rounded-[6px] px-2 hover:bg-[#f2f2ef] hover:text-[#111111]"
              type="button"
            >
              {copy.common.nav.solutions}
              <ChevronDown className="h-3.5 w-3.5 transition-transform group-hover:rotate-180" />
            </button>

            <div
              aria-hidden="true"
              className="absolute inset-x-0 top-full hidden h-8 group-hover:block group-focus-within:block"
            />
            <div className="pointer-events-none fixed left-1/2 top-[62px] hidden w-[min(420px,calc(100vw-32px))] -translate-x-1/2 rounded-[16px] border border-[#eeeeec] bg-white p-6 text-left opacity-0 shadow-[0_24px_80px_rgba(15,15,15,0.14)] transition group-hover:pointer-events-auto group-hover:block group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:block group-focus-within:opacity-100">
              <div className="grid gap-3">
                {solutionMenuItems.map(({ icon: Icon, targetPath, tone }, itemIndex) => {
                  const itemCopy = copy.common.solutionMenuItems[itemIndex];

                  return (
                    <Link
                      className="flex items-start gap-3 rounded-[8px] p-2 hover:bg-[#FAFAF8]"
                      key={targetPath}
                      to={publicSitePath(targetPath)}
                    >
                      <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-[8px] ${tone}`}>
                        <Icon className="h-5 w-5" />
                      </span>
                      <span>
                        <span className="block text-[14px] font-normal text-[#222220]">
                          {itemCopy?.title}
                        </span>
                        <span className="mt-0.5 block text-[12px] font-normal leading-5 text-[#777770]">
                          {itemCopy?.description}
                        </span>
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="group relative">
            <button
              className="inline-flex h-9 items-center gap-1 rounded-[6px] px-2 hover:bg-[#f2f2ef] hover:text-[#111111]"
              type="button"
            >
              {copy.common.nav.resources}
              <ChevronDown className="h-3.5 w-3.5 transition-transform group-hover:rotate-180" />
            </button>

            <div
              aria-hidden="true"
              className="absolute inset-x-0 top-full hidden h-8 group-hover:block group-focus-within:block"
            />
            <div className="pointer-events-none fixed left-1/2 top-[62px] hidden w-[min(360px,calc(100vw-32px))] -translate-x-1/2 rounded-[16px] border border-[#eeeeec] bg-white p-6 text-left opacity-0 shadow-[0_24px_80px_rgba(15,15,15,0.14)] transition group-hover:pointer-events-auto group-hover:block group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:block group-focus-within:opacity-100">
              <div className="grid gap-3">
                {resourceMenuItems.map(({ icon: Icon, targetPath, tone }, itemIndex) => {
                  const itemCopy = copy.common.resourceMenuItems[itemIndex];

                  return (
                    <Link
                      className="flex items-start gap-3 rounded-[8px] p-2 hover:bg-[#FAFAF8]"
                      key={targetPath}
                      to={publicSitePath(targetPath)}
                    >
                      <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-[8px] ${tone}`}>
                        <Icon className="h-5 w-5" />
                      </span>
                      <span>
                        <span className="block text-[14px] font-normal text-[#222220]">
                          {itemCopy?.title}
                        </span>
                        <span className="mt-0.5 block text-[12px] font-normal leading-5 text-[#777770]">
                          {itemCopy?.description}
                        </span>
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
          <Link
            className="inline-flex h-9 items-center rounded-[6px] px-2 hover:bg-[#f2f2ef] hover:text-[#111111]"
            to={publicSitePath("/pricing")}
          >
            {copy.common.nav.pricing}
          </Link>
          <Link
            className="inline-flex h-9 items-center rounded-[6px] px-2 hover:bg-[#f2f2ef] hover:text-[#111111]"
            to={publicSitePath("/contact")}
          >
            {copy.common.nav.contact}
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            className="hidden h-8 items-center rounded-[6px] bg-[#4880EE] px-3 text-[13px] font-normal text-white hover:bg-[#336FE0] sm:inline-flex"
            to={publicSitePath("/signup")}
          >
            {copy.common.nav.freeCta}
          </Link>
          <button
            className="h-8 rounded-[6px] px-2 text-[13px] font-normal text-[#4b4b48] hover:bg-[#f2f2ef] hover:text-[#111111] md:px-3"
            onClick={handleLogin}
            type="button"
          >
            {copy.common.nav.login}
          </button>
        </div>
      </div>
    </header>
  );
}
