import {
  Facebook,
  Instagram,
  Linkedin,
  Youtube,
} from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { OneHandLogoMark } from "@/components/brand/onehand-logo-mark";
import { PublicSiteLanguageSelect } from "@/features/public-site/components/public-site-language-select";
import { usePublicSitePath } from "@/features/public-site/i18n/public-site-locale-hooks";
import { usePublicSiteLanguage } from "@/features/public-site/i18n/public-site-language";

type PublicSiteFooterProps = {
  readonly compactDesktop?: boolean;
  readonly showTopDivider?: boolean;
};

const footerSocialLinks: readonly {
  readonly href?: string;
  readonly label: string;
  readonly icon: ReactNode;
}[] = [
  {
    href: "https://www.instagram.com/onehand_sales",
    label: "Instagram",
    icon: <Instagram className="h-4 w-4" />,
  },
  {
    href: "https://x.com/OneHand_Sales",
    label: "X",
    icon: <XSocialIcon className="h-4 w-4" />,
  },
  {
    href: "/",
    label: "LinkedIn",
    icon: <Linkedin className="h-4 w-4" />,
  },
  {
    href: "https://www.facebook.com/profile.php?id=61593723132814",
    label: "Facebook",
    icon: <Facebook className="h-4 w-4" />,
  },
  {
    href: "https://www.youtube.com/@OneHand_Sales",
    label: "YouTube",
    icon: <Youtube className="h-4 w-4" />,
  },
];

const footerColumnRoutes: readonly (readonly string[])[] = [
  ["/about", "/security", "/terms", "/privacy"],
  ["/product", "/features", "/pricing", "/download"],
  ["/help", "/faq", "/contact"],
  [
    "/solutions/personal",
    "/solutions/b2b-field",
    "/solutions/real-estate",
    "/solutions/insurance-auto",
  ],
];

// 기능 : 현재 X 브랜드 로고 형태의 단색 소셜 아이콘을 렌더링합니다.
function XSocialIcon({ className }: { readonly className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="currentColor"
      focusable="false"
      viewBox="0 0 300 271"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="m236 0h46l-101 115 118 156h-92.6l-72.5-94.8-83 94.8h-46l107-123-113-148h94.9l65.5 86.6zm-16.1 244h25.5l-165-218h-27.4z" />
    </svg>
  );
}

// 기능 : 공개 사이트 하단 푸터와 locale 기반 링크 목록을 렌더링합니다.
export function PublicSiteFooter({
  compactDesktop = false,
  showTopDivider = false,
}: PublicSiteFooterProps) {
  const { copy } = usePublicSiteLanguage();
  const publicSitePath = usePublicSitePath();

  return (
    <footer
      className={[
        compactDesktop
          ? "min-h-[418px] bg-white py-14 lg:min-h-[400px]"
          : "min-h-[418px] bg-white py-14",
        showTopDivider ? "border-t border-[#e3e3de]" : "",
      ].join(" ")}
    >
      <div className="mx-auto grid w-full max-w-[1320px] gap-12 px-4 sm:px-6 md:grid-cols-[1fr_2.35fr] lg:gap-16 lg:px-8">
        <div className="flex min-w-0 flex-col items-start">
          <Link
            className="inline-flex items-center gap-3 text-[#111111]"
            to={publicSitePath("/")}
          >
            <OneHandLogoMark className="h-9 w-9" />
            <span className="text-[26px] font-normal leading-none">OneHand</span>
          </Link>

          <div
            aria-label={copy.common.footerSocialAria}
            className="mt-6 flex items-center gap-1.5 text-[#555550]"
          >
            {footerSocialLinks.map(({ href = "/", icon, label }) => {
              const isExternalLink = href.startsWith("http");

              return (
                <a
                  aria-label={label}
                  className="grid h-7 w-7 place-items-center rounded-[6px] transition-colors hover:bg-[#f4f4f1] hover:text-[#111111]"
                  href={href}
                  key={label}
                  rel={isExternalLink ? "noreferrer" : undefined}
                  target={isExternalLink ? "_blank" : undefined}
                >
                  {icon}
                </a>
              );
            })}
          </div>

          <PublicSiteLanguageSelect />

          <p className="mt-5 text-[12px] font-normal text-[#888880]">
            {copy.common.copyright}
          </p>
        </div>

        <nav
          aria-label="Footer"
          className="grid gap-x-10 gap-y-9 sm:grid-cols-2 lg:grid-cols-4"
        >
          {copy.common.footerColumns.map((column, columnIndex) => {
            const [title, ...links] = column;
            const routes = footerColumnRoutes[columnIndex] ?? [];

            return (
              <div key={title}>
                <h3 className="text-[12px] font-normal text-[#777770]">
                  {title}
                </h3>
                <ul className="mt-3 grid gap-2.5">
                  {links.map((label, linkIndex) => (
                    <li key={label}>
                      <Link
                        className="text-[13px] font-normal text-[#111111] underline-offset-2 hover:underline"
                        to={publicSitePath(routes[linkIndex] ?? "/")}
                      >
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </nav>
      </div>
    </footer>
  );
}
