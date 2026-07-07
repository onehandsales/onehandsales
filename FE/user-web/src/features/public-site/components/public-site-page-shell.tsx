import { BriefcaseBusiness } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { PublicSiteHeader } from "@/features/public-site/components/public-site-header";
import { PublicSiteLanguageSelect } from "@/features/public-site/components/public-site-language-select";
import { usePublicSiteLanguage } from "@/features/public-site/i18n/public-site-language";

type PublicSitePageShellProps = {
  readonly children: ReactNode;
};

export function PublicSitePageShell({ children }: PublicSitePageShellProps) {
  const scrollProgress = usePublicSiteScrollProgress();

  return (
    <main className="public-site-root min-h-screen w-full overflow-x-hidden bg-white text-[#111111]">
      <PublicSiteScrollStyles />
      <PublicSiteHeader />
      <ScrollProgressBar progress={scrollProgress} />
      <div className="pt-14">
        {children}
        <PublicSiteFooter />
      </div>
    </main>
  );
}

function usePublicSiteScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    document.documentElement.classList.add("public-site-scrollbar-hidden");
    document.body.classList.add("public-site-scrollbar-hidden");

    const updateProgress = () => {
      const scrollableHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const nextProgress =
        scrollableHeight > 0
          ? Math.min(1, Math.max(0, window.scrollY / scrollableHeight))
          : 0;

      setProgress(nextProgress);
    };

    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);

    return () => {
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
      document.documentElement.classList.remove("public-site-scrollbar-hidden");
      document.body.classList.remove("public-site-scrollbar-hidden");
    };
  }, []);

  return progress;
}

function PublicSiteScrollStyles() {
  return (
    <style>
      {`
        .public-site-scrollbar-hidden {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        .public-site-scrollbar-hidden::-webkit-scrollbar {
          display: none;
          width: 0;
          height: 0;
        }
      `}
    </style>
  );
}

function ScrollProgressBar({ progress }: { readonly progress: number }) {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-x-0 top-14 z-50 h-[2px] bg-transparent"
    >
      <div
        className="h-full origin-left bg-[#111111] transition-transform duration-150 ease-out"
        style={{
          transform: `scaleX(${progress})`,
        }}
      />
    </div>
  );
}

function PublicSiteFooter() {
  const { copy } = usePublicSiteLanguage();

  return (
    <footer className="border-t border-[#eeeeec] bg-white px-4 py-14 md:px-6">
      <div className="mx-auto grid max-w-[980px] gap-10 md:grid-cols-[1.4fr_repeat(4,1fr)]">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-6 w-6 place-items-center rounded-[6px] border border-[#111111] bg-white">
              <BriefcaseBusiness className="h-3.5 w-3.5" />
            </span>
            <span className="text-sm font-black">onehand.sales</span>
          </div>
          <PublicSiteLanguageSelect />
        </div>

        {copy.common.footerColumns.map(([title, ...links]) => (
          <div key={title}>
            <h3 className="text-[12px] font-black">{title}</h3>
            <ul className="mt-3 grid gap-2 text-[12px] text-[#777770]">
              {links.map((link) => (
                <li key={link}>
                  <a className="hover:text-[#111111]" href="/">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mx-auto mt-10 max-w-[980px] text-[11px] text-[#999993]">
        {copy.common.copyright}
      </div>
    </footer>
  );
}
