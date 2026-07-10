import {
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  Youtube,
  type LucideIcon,
} from "lucide-react";
import { Link } from "react-router-dom";
import { OnehandLogoMark } from "@/components/brand/onehand-logo-mark";
import { PublicSiteLanguageSelect } from "@/features/public-site/components/public-site-language-select";
import { usePublicSitePath } from "@/features/public-site/i18n/public-site-locale-hooks";
import { usePublicSiteLanguage } from "@/features/public-site/i18n/public-site-language";

type PublicSiteFooterProps = {
  readonly showTopDivider?: boolean;
};

const footerSocialLinks: readonly {
  readonly label: string;
  readonly icon: LucideIcon;
}[] = [
  { label: "Instagram", icon: Instagram },
  { label: "Twitter", icon: Twitter },
  { label: "LinkedIn", icon: Linkedin },
  { label: "Facebook", icon: Facebook },
  { label: "YouTube", icon: Youtube },
];

const footerColumnRoutes: readonly (readonly string[])[] = [
  ["/about", "/security", "/terms", "/privacy"],
  ["/login"],
  ["/pricing"],
  ["/contact", "/contact", "/contact"],
];

export function PublicSiteFooter({
  showTopDivider = false,
}: PublicSiteFooterProps) {
  const { copy } = usePublicSiteLanguage();
  const publicSitePath = usePublicSitePath();

  return (
    <footer
      className={[
        "min-h-[418px] bg-white py-14",
        showTopDivider ? "border-t border-[#e3e3de]" : "",
      ].join(" ")}
    >
      <div className="mx-auto grid w-full max-w-[1320px] gap-12 px-4 sm:px-6 md:grid-cols-[1fr_2.35fr] lg:gap-16 lg:px-8">
        <div className="flex min-w-0 flex-col items-start">
          <Link
            className="inline-flex items-center gap-3 text-[#111111]"
            to={publicSitePath("/")}
          >
            <OnehandLogoMark className="h-9 w-9" />
            <span className="text-[26px] font-black leading-none">Onehand</span>
          </Link>

          <div
            aria-label={copy.common.footerSocialAria}
            className="mt-6 flex items-center gap-1.5 text-[#555550]"
          >
            {footerSocialLinks.map(({ icon: Icon, label }) => (
              <a
                aria-label={label}
                className="grid h-7 w-7 place-items-center rounded-[6px] transition-colors hover:bg-[#f4f4f1] hover:text-[#111111]"
                href="/"
                key={label}
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>

          <PublicSiteLanguageSelect />

          <p className="mt-5 text-[12px] font-semibold text-[#888880]">
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
                <h3 className="text-[12px] font-medium text-[#777770]">
                  {title}
                </h3>
                <ul className="mt-3 grid gap-2.5">
                  {links.map((label, linkIndex) => (
                    <li key={label}>
                      <Link
                        className="text-[13px] font-medium text-[#111111] underline-offset-2 hover:underline"
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
