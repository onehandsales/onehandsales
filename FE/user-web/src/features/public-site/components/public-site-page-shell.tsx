import { useEffect, useState, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { PublicSiteFooter } from "@/features/public-site/components/public-site-footer";
import { PublicSiteHeader } from "@/features/public-site/components/public-site-header";

type PublicSitePageShellProps = {
  readonly children: ReactNode;
};

// 기능 : PublicSitePageShell 컴포넌트를 렌더링합니다.
export function PublicSitePageShell({ children }: PublicSitePageShellProps) {
  const location = useLocation();
  const scrollProgress = usePublicSiteScrollProgress();

  useEffect(() => {
    window.scrollTo({
      behavior: "smooth",
      left: 0,
      top: 0,
    });
  }, [location.pathname]);

  return (
    <main className="public-site-root min-h-screen w-full overflow-x-hidden bg-white text-[#111111]">
      <PublicSiteScrollStyles />
      <PublicSiteHeader />
      <ScrollProgressBar progress={scrollProgress} />
      <div className="pt-14">
        {children}
        <PublicSiteFooter showTopDivider />
      </div>
    </main>
  );
}

// 기능 : Public Site Scroll Progress hook으로 상태와 동작을 제공합니다.
function usePublicSiteScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    document.documentElement.classList.add("public-site-scrollbar-hidden");
    document.body.classList.add("public-site-scrollbar-hidden");

    // 기능 : update Progress 정보를 수정합니다.
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

// 기능 : PublicSiteScrollStyles 컴포넌트를 렌더링합니다.
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

// 기능 : ScrollProgressBar 컴포넌트를 렌더링합니다.
function ScrollProgressBar({ progress }: { readonly progress: number }) {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-x-0 top-14 z-50 h-px bg-transparent"
    >
      <div
        className="h-full origin-left bg-[#d9d9d4] transition-transform duration-150 ease-out"
        style={{
          transform: `scaleX(${progress})`,
        }}
      />
    </div>
  );
}
