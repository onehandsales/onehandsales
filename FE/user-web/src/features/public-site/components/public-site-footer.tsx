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
import { usePublicSiteLanguage } from "@/features/public-site/i18n/public-site-language";

type FooterColumn = {
  readonly title: string;
  readonly links: readonly {
    readonly label: string;
    readonly to: string;
  }[];
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

const footerColumns: readonly FooterColumn[] = [
  {
    title: "Company",
    links: [
      { label: "About us", to: "/" },
      { label: "Security", to: "/" },
      { label: "Terms and privacy", to: "/" },
      { label: "Your privacy rights", to: "/" },
    ],
  },
  {
    title: "Download",
    links: [{ label: "iOS & Android", to: "/" }],
  },
  {
    title: "Resources",
    links: [
      { label: "Help center", to: "/" },
      { label: "Pricing", to: "/pricing" },
      { label: "Blog", to: "/" },
      { label: "Community", to: "/" },
    ],
  },
  {
    title: "Onehand for",
    links: [
      { label: "Enterprise", to: "/" },
      { label: "Small business", to: "/" },
      { label: "Personal", to: "/" },
    ],
  },
];

export function PublicSiteFooter() {
  const { copy } = usePublicSiteLanguage();

  return (
    <footer className="min-h-[418px] bg-white px-4 py-14 sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-[1320px] gap-12 md:grid-cols-[1fr_2.35fr] lg:gap-16">
        <div className="flex min-w-0 flex-col items-start">
          <Link className="inline-flex items-center gap-3 text-[#111111]" to="/">
            <OnehandLogoMark className="h-9 w-9" />
            <span className="text-[26px] font-black leading-none">Onehand</span>
          </Link>

          <div
            aria-label="Onehand social links"
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
          {footerColumns.map((column) => (
            <div key={column.title}>
              <h3 className="text-[12px] font-medium text-[#777770]">
                {column.title}
              </h3>
              <ul className="mt-3 grid gap-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      className="text-[13px] font-medium text-[#111111] transition-colors hover:text-[#0075DE]"
                      to={link.to}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>
    </footer>
  );
}
