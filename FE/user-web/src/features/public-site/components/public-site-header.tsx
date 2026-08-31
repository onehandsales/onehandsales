import { ChevronDown } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { OneHandLogoMark } from "@/components/brand/onehand-logo-mark";
import { usePublicSitePath } from "@/features/public-site/i18n/public-site-locale-hooks";
import { usePublicSiteLanguage } from "@/features/public-site/i18n/public-site-language";

type HeaderMenuColumn = readonly [string, ...string[]];

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
