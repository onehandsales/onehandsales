import { useEffect, useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { OneHandLogoMark } from "@/components/brand/onehand-logo-mark";
import { usePublicSitePath } from "@/features/public-site/i18n/public-site-locale-hooks";
import { usePublicSiteLanguage } from "@/features/public-site/i18n/public-site-language";

type HeaderMenuColumn = readonly [string, ...string[]];
type PublicSiteCopy = ReturnType<typeof usePublicSiteLanguage>["copy"];

type HeaderTextDropdownProps = {
  readonly columnRoutes: readonly (readonly string[])[];
  readonly columns: readonly HeaderMenuColumn[];
  readonly fallbackPath: string;
  readonly gridClassName: string;
  readonly label: string;
  readonly toPublicPath: (path: string) => string;
  readonly widthClassName: string;
};

type PublicSiteHeaderProps = {
  readonly onLogin?: () => void;
};

type HeaderMobileMenuPanelProps = {
  readonly copy: PublicSiteCopy;
  readonly onClose: () => void;
  readonly onLogin: () => void;
  readonly toPublicPath: (path: string) => string;
};

type HeaderMobileMenuSectionProps = {
  readonly columnRoutes: readonly (readonly string[])[];
  readonly columns: readonly HeaderMenuColumn[];
  readonly fallbackPath: string;
  readonly label: string;
  readonly onNavigate: () => void;
  readonly sectionId: string;
  readonly toPublicPath: (path: string) => string;
};

const productMenuTargets: readonly (readonly string[])[] = [
  ["/about", "/product"],
  [
    "/features",
    "/features/customers",
    "/features/pipeline",
    "/features/schedules-follow-up",
    "/features/activity-records",
  ],
  [
    "/features/ai-sales-assistant",
    "/features/reports",
    "/features/import-export",
  ],
];

const solutionMenuTargets: readonly (readonly string[])[] = [
  ["/solutions"],
  ["/solutions/personal", "/solutions/b2b-field"],
  ["/solutions/real-estate", "/solutions/insurance-auto"],
];

const resourceMenuTargets: readonly (readonly string[])[] = [
  ["/help", "/faq", "/contact"],
];

// 기능 : 공개 사이트 상단의 텍스트 컬럼형 드롭다운 메뉴를 렌더링합니다.
function HeaderTextDropdown({
  columnRoutes,
  columns,
  fallbackPath,
  gridClassName,
  label,
  toPublicPath,
  widthClassName,
}: HeaderTextDropdownProps) {
  return (
    <div className="group relative">
      <button
        aria-haspopup="true"
        className="inline-flex h-9 items-center gap-1 rounded-[6px] px-2 hover:bg-[#f2f2ef] hover:text-[#111111]"
        type="button"
      >
        {label}
        <ChevronDown className="h-3.5 w-3.5 transition-transform group-hover:rotate-180" />
      </button>

      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-full hidden h-8 group-hover:block group-focus-within:block"
      />
      <div
        className={[
          "pointer-events-none fixed left-1/2 top-[62px] hidden -translate-x-1/2 rounded-[16px] border border-[#eeeeec] bg-white p-6 text-left opacity-0 shadow-[0_24px_80px_rgba(15,15,15,0.14)] transition group-hover:pointer-events-auto group-hover:block group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:block group-focus-within:opacity-100",
          widthClassName,
        ].join(" ")}
      >
        <div className={gridClassName}>
          {columns.map((column, columnIndex) => {
            const [title, ...links] = column;
            const routes = columnRoutes[columnIndex] ?? [];

            return (
              <div key={title}>
                <h3 className="text-[12px] font-normal text-[#777770]">
                  {title}
                </h3>
                <ul className="mt-3 grid gap-1">
                  {links.map((linkLabel, linkIndex) => (
                    <li key={linkLabel}>
                      <Link
                        className="block rounded-[6px] px-2 py-1.5 text-[14px] font-normal text-[#111111] hover:bg-[#FAFAF8]"
                        to={toPublicPath(routes[linkIndex] ?? fallbackPath)}
                      >
                        {linkLabel}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// 기능 : 공개 사이트 햄버거 메뉴의 텍스트 중심 전체 화면 panel을 렌더링합니다.
function HeaderMobileMenuPanel({
  copy,
  onClose,
  onLogin,
  toPublicPath,
}: HeaderMobileMenuPanelProps) {
  const onLoginClick = () => {
    onClose();
    onLogin();
  };

  return (
    <div
      aria-label={copy.common.menuAria}
      aria-modal="true"
      className="fixed inset-0 z-[60] flex min-h-dvh flex-col overflow-hidden bg-white text-[#111111] xl:hidden"
      id="public-site-mobile-menu"
      role="dialog"
    >
      <div className="flex h-14 shrink-0 items-center justify-between px-[14px]">
        <Link
          aria-label={copy.common.logoAria}
          className="flex h-9 w-9 items-center justify-center text-[#111111]"
          onClick={onClose}
          to={toPublicPath("/")}
        >
          <OneHandLogoMark className="h-9 w-9" />
        </Link>

        <div className="flex items-center gap-2">
          <button
            className="hidden h-8 rounded-[6px] px-2 text-[13px] font-normal text-[#4b4b48] hover:bg-[#f2f2ef] hover:text-[#111111] md:px-3 lg:block"
            onClick={onLoginClick}
            type="button"
          >
            {copy.common.nav.login}
          </button>
          <Link
            className="inline-flex h-8 items-center rounded-[6px] bg-[#4880EE] px-3 text-[13px] font-normal text-white hover:bg-[#336FE0]"
            onClick={onClose}
            to={toPublicPath("/signup")}
          >
            {copy.common.nav.freeCta}
          </Link>
          <button
            aria-label={copy.common.menuCloseAria}
            className="grid h-9 w-9 place-items-center rounded-[6px] text-[#111111] transition-colors hover:bg-[#f2f2ef]"
            onClick={onClose}
            type="button"
          >
            <X className="h-[25px] w-[25px]" />
          </button>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[1120px] flex-1 overflow-y-auto px-6 py-7 sm:px-8 lg:px-10 lg:py-10">
        <nav
          aria-label={copy.common.menuAria}
          className="grid divide-y divide-[#eeeeec] border-y border-[#eeeeec]"
        >
          <HeaderMobileMenuSection
            columnRoutes={productMenuTargets}
            columns={copy.common.productMenuColumns}
            fallbackPath="/features"
            label={copy.common.nav.product}
            onNavigate={onClose}
            sectionId="products"
            toPublicPath={toPublicPath}
          />
          <HeaderMobileMenuSection
            columnRoutes={solutionMenuTargets}
            columns={copy.common.solutionMenuColumns}
            fallbackPath="/solutions"
            label={copy.common.nav.solutions}
            onNavigate={onClose}
            sectionId="solutions"
            toPublicPath={toPublicPath}
          />
          <HeaderMobileMenuSection
            columnRoutes={resourceMenuTargets}
            columns={copy.common.resourceMenuColumns}
            fallbackPath="/help"
            label={copy.common.nav.resources}
            onNavigate={onClose}
            sectionId="resources"
            toPublicPath={toPublicPath}
          />
          <Link
            className="flex min-h-[64px] items-center rounded-[6px] px-2 py-4 text-[24px] font-normal leading-tight text-[#111111] transition-colors hover:bg-[#F2F2EF] hover:text-[#111111]"
            onClick={onClose}
            to={toPublicPath("/pricing")}
          >
            {copy.common.nav.pricing}
          </Link>
          <Link
            className="flex min-h-[64px] items-center rounded-[6px] px-2 py-4 text-[24px] font-normal leading-tight text-[#111111] transition-colors hover:bg-[#F2F2EF] hover:text-[#111111]"
            onClick={onClose}
            to={toPublicPath("/contact")}
          >
            {copy.common.nav.contact}
          </Link>
        </nav>
      </div>

      <div className="shrink-0 border-t border-[#eeeeec] bg-white px-4 py-3 pb-[max(12px,env(safe-area-inset-bottom))]">
        <div className="mx-auto grid w-full max-w-[1120px] grid-cols-2 gap-3">
          <Link
            className="inline-flex h-11 min-w-0 items-center justify-center rounded-[6px] bg-[#4880EE] px-4 text-center text-[14px] font-normal text-white transition-colors hover:bg-[#336FE0]"
            onClick={onClose}
            to={toPublicPath("/download")}
          >
            {copy.common.nav.downloadApp}
          </Link>
          <button
            className="inline-flex h-11 min-w-0 items-center justify-center rounded-[6px] bg-[#EAF2FF] px-4 text-center text-[14px] font-normal text-[#0075DE] transition-colors hover:bg-[#DCEBFF]"
            onClick={onLoginClick}
            type="button"
          >
            {copy.common.nav.login}
          </button>
        </div>
      </div>
    </div>
  );
}

function HeaderMobileMenuSection({
  columnRoutes,
  columns,
  fallbackPath,
  label,
  onNavigate,
  sectionId,
  toPublicPath,
}: HeaderMobileMenuSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const contentId = `public-site-mobile-menu-${sectionId}`;

  return (
    <section>
      <button
        aria-controls={contentId}
        aria-expanded={isOpen}
        className="flex min-h-[64px] w-full cursor-pointer items-center justify-between gap-4 rounded-[6px] px-2 py-4 text-left text-[24px] font-normal leading-tight text-[#111111] transition-colors hover:bg-[#F2F2EF] hover:text-[#111111]"
        onClick={() => setIsOpen((current) => !current)}
        type="button"
      >
        <span>{label}</span>
        <ChevronDown
          className={[
            "h-5 w-5 shrink-0 transition-transform duration-200 ease-out motion-reduce:transition-none",
            isOpen ? "rotate-180" : "",
          ].join(" ")}
        />
      </button>
      <div
        aria-hidden={!isOpen}
        className={[
          "grid transition-[grid-template-rows,opacity] duration-200 ease-out motion-reduce:transition-none",
          isOpen
            ? "grid-rows-[1fr] opacity-100"
            : "pointer-events-none grid-rows-[0fr] opacity-0",
        ].join(" ")}
        id={contentId}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="grid gap-6 pb-7 lg:grid-cols-3">
            {columns.map((column, columnIndex) => {
              const [title, ...links] = column;
              const routes = columnRoutes[columnIndex] ?? [];

              return (
                <div className="min-w-0" key={title}>
                  <p className="text-[12px] font-normal text-[#777770]">
                    {title}
                  </p>
                  <ul className="mt-3 grid gap-1">
                    {links.map((linkLabel, linkIndex) => (
                      <li key={linkLabel}>
                        <Link
                          className="block rounded-[6px] px-2 py-1.5 text-[16px] font-normal leading-6 text-[#333330] transition-colors hover:bg-[#F2F2EF] hover:text-[#333330]"
                          onClick={onNavigate}
                          tabIndex={isOpen ? undefined : -1}
                          to={toPublicPath(routes[linkIndex] ?? fallbackPath)}
                        >
                          {linkLabel}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

// 기능 : 공개 사이트 상단 고정 헤더와 주요 내비게이션을 렌더링합니다.
export function PublicSiteHeader({ onLogin }: PublicSiteHeaderProps) {
  const navigate = useNavigate();
  const { copy } = usePublicSiteLanguage();
  const publicSitePath = usePublicSitePath();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isMobileMenuOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    const desktopMediaQuery = window.matchMedia("(min-width: 1280px)");
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMobileMenuOpen(false);
      }
    };
    const closeOnDesktop = () => {
      if (desktopMediaQuery.matches) {
        setIsMobileMenuOpen(false);
      }
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", closeOnEscape);
    desktopMediaQuery.addEventListener("change", closeOnDesktop);
    closeOnDesktop();

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
      desktopMediaQuery.removeEventListener("change", closeOnDesktop);
    };
  }, [isMobileMenuOpen]);

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
      <div className="flex h-14 w-full items-center justify-between px-[14px]">
        <Link
          aria-label={copy.common.logoAria}
          className="flex h-9 w-9 items-center justify-center text-[#111111]"
          to={publicSitePath("/")}
        >
          <OneHandLogoMark className="h-9 w-9" />
        </Link>

        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-7 text-[13px] font-normal text-[#4b4b48] xl:flex">
          <HeaderTextDropdown
            columnRoutes={productMenuTargets}
            columns={copy.common.productMenuColumns}
            fallbackPath="/features"
            gridClassName="grid gap-x-12 gap-y-8 md:grid-cols-3"
            label={copy.common.nav.product}
            toPublicPath={publicSitePath}
            widthClassName="w-[min(820px,calc(100vw-32px))]"
          />
          <HeaderTextDropdown
            columnRoutes={solutionMenuTargets}
            columns={copy.common.solutionMenuColumns}
            fallbackPath="/solutions"
            gridClassName="grid gap-x-12 gap-y-8 md:grid-cols-3"
            label={copy.common.nav.solutions}
            toPublicPath={publicSitePath}
            widthClassName="w-[min(700px,calc(100vw-32px))]"
          />
          <HeaderTextDropdown
            columnRoutes={resourceMenuTargets}
            columns={copy.common.resourceMenuColumns}
            fallbackPath="/help"
            gridClassName="grid gap-y-8"
            label={copy.common.nav.resources}
            toPublicPath={publicSitePath}
            widthClassName="w-[min(360px,calc(100vw-32px))]"
          />
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
          <button
            className="hidden h-8 rounded-[6px] px-2 text-[13px] font-normal text-[#4b4b48] hover:bg-[#f2f2ef] hover:text-[#111111] md:px-3 lg:block"
            onClick={handleLogin}
            type="button"
          >
            {copy.common.nav.login}
          </button>
          <Link
            className="inline-flex h-8 items-center rounded-[6px] bg-[#4880EE] px-3 text-[13px] font-normal text-white hover:bg-[#336FE0]"
            to={publicSitePath("/signup")}
          >
            {copy.common.nav.freeCta}
          </Link>
          <button
            aria-controls="public-site-mobile-menu"
            aria-expanded={isMobileMenuOpen}
            aria-label={copy.common.menuAria}
            className="grid h-9 w-9 place-items-center rounded-[6px] text-[#4b4b48] transition-colors hover:bg-[#f2f2ef] hover:text-[#111111] xl:hidden"
            onClick={() => setIsMobileMenuOpen(true)}
            type="button"
          >
            <Menu className="h-[25px] w-[25px]" />
          </button>
        </div>
      </div>

      {isMobileMenuOpen ? (
        <HeaderMobileMenuPanel
          copy={copy}
          onClose={() => setIsMobileMenuOpen(false)}
          onLogin={handleLogin}
          toPublicPath={publicSitePath}
        />
      ) : null}
    </header>
  );
}
