import {
  Bell,
  BookOpen,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  ChevronDown,
  FileText,
  FolderKanban,
  Link as LinkIcon,
  LockKeyhole,
  MessageSquareText,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { OnehandLogoMark } from "@/components/brand/onehand-logo-mark";
import { usePublicSiteLanguage } from "@/features/public-site/i18n/public-site-language";

type PublicSiteHeaderProps = {
  readonly onLogin?: () => void;
};

const productMenuIconGroups = [
  [
    {
      icon: Sparkles,
      tone: "bg-[#fff3e8] text-[#c6531a]",
    },
    {
      icon: Bell,
      tone: "bg-[#fff0f0] text-[#d63c31]",
    },
    {
      icon: MessageSquareText,
      tone: "bg-[#eef6ff] text-[#1677d2]",
    },
    {
      icon: Search,
      tone: "bg-[#f3eaff] text-[#7c3aed]",
    },
  ],
  [
    {
      icon: Building2,
      tone: "bg-[#edf7ff] text-[#1677d2]",
    },
    {
      icon: FileText,
      tone: "bg-[#e8f8f4] text-[#16856b]",
    },
    {
      icon: FolderKanban,
      tone: "bg-[#fff5d8] text-[#b77900]",
    },
    {
      icon: CalendarDays,
      tone: "bg-[#f1f1ef] text-[#555550]",
    },
  ],
  [
    {
      icon: LinkIcon,
      tone: "bg-[#f1f1ef] text-[#555550]",
    },
    {
      icon: LockKeyhole,
      tone: "bg-[#f1f1ef] text-[#555550]",
    },
    {
      icon: BookOpen,
      tone: "bg-[#f1f1ef] text-[#555550]",
    },
    {
      icon: ShieldCheck,
      tone: "bg-[#f1f1ef] text-[#555550]",
    },
  ],
];

export function PublicSiteHeader({ onLogin }: PublicSiteHeaderProps) {
  const navigate = useNavigate();
  const { copy } = usePublicSiteLanguage();

  const handleLogin = () => {
    if (onLogin) {
      onLogin();
      return;
    }

    navigate("/login");
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-white/95 backdrop-blur">
      <div className="flex h-14 w-full items-center justify-between px-4 md:px-5">
        <Link
          aria-label={copy.common.logoAria}
          className="flex h-9 w-9 items-center justify-center text-[#111111]"
          to="/"
        >
          <OnehandLogoMark className="h-8 w-8" />
        </Link>

        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-7 text-[13px] font-semibold text-[#4b4b48] md:flex">
          <div className="group">
            <button
              className="inline-flex h-9 items-center gap-1 rounded-[6px] px-2 hover:bg-[#f2f2ef] hover:text-[#111111]"
              type="button"
            >
              {copy.common.nav.product}
              <ChevronDown className="h-3.5 w-3.5 transition-transform group-hover:rotate-180" />
            </button>

            <div className="pointer-events-none fixed left-1/2 top-[62px] hidden w-[min(920px,calc(100vw-32px))] -translate-x-1/2 rounded-[16px] border border-[#eeeeec] bg-white p-6 text-left opacity-0 shadow-[0_24px_80px_rgba(15,15,15,0.14)] transition group-hover:pointer-events-auto group-hover:block group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:block group-focus-within:opacity-100">
              <div className="grid gap-5 md:grid-cols-3">
                {productMenuIconGroups.map((items, groupIndex) => (
                  <div className="grid gap-3" key={groupIndex}>
                    {items.map(({ icon: Icon, tone }, itemIndex) => {
                      const itemCopy =
                        copy.common.productMenuGroups[groupIndex]?.[itemIndex];

                      return (
                      <Link
                        className="flex items-start gap-3 rounded-[8px] p-2 hover:bg-[#f7f7f5]"
                        key={itemCopy?.title}
                        to="/"
                      >
                        <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-[8px] ${tone}`}>
                          <Icon className="h-5 w-5" />
                        </span>
                        <span>
                          <span className="block text-[14px] font-black text-[#222220]">
                            {itemCopy?.title}
                          </span>
                          <span className="mt-0.5 block text-[12px] font-medium leading-5 text-[#777770]">
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
                  className="flex items-center gap-3 rounded-[8px] px-2 py-2 text-[13px] font-bold text-[#555550] hover:bg-[#f7f7f5]"
                  to="/"
                >
                  <Sparkles className="h-4 w-4 text-[#777770]" />
                  {copy.common.productTour}
                  <span className="text-[#0077e6]">→</span>
                </Link>
                <Link
                  className="flex items-center gap-3 rounded-[8px] px-2 py-2 text-[13px] font-bold text-[#555550] hover:bg-[#f7f7f5] md:justify-end"
                  to="/login"
                >
                  <BriefcaseBusiness className="h-4 w-4 text-[#777770]" />
                  {copy.common.productApp}
                  <span className="text-[#0077e6]">→</span>
                </Link>
              </div>
            </div>
          </div>

          <Link className="hover:text-[#111111]" to="/pricing">
            {copy.common.nav.pricing}
          </Link>
          <Link className="hover:text-[#111111]" to="/contact">
            {copy.common.nav.contact}
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            className="hidden h-8 items-center rounded-[6px] bg-[#0075DE] px-3 text-[13px] font-bold text-white hover:bg-[#006AC8] sm:inline-flex"
            to="/signup"
          >
            {copy.common.nav.freeCta}
          </Link>
          <button
            className="h-8 rounded-[6px] px-2 text-[13px] font-semibold text-[#4b4b48] hover:bg-[#f2f2ef] md:px-3"
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
