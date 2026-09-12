import { useEffect, useState, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { PublicSiteFooter } from "@/features/public-site/components/public-site-footer";
import { PublicSiteHeader } from "@/features/public-site/components/public-site-header";

type PublicSitePageShellProps = {
  readonly children: ReactNode;
};

// 기능 : PublicSitePageShell 컴포넌트를 렌더링합니다.
export function PublicSitePageShell({ children }: PublicSitePageShellProps) {
  // 1. 처리 흐름에 필요한 location 값을 준비한다.
  const location = useLocation();
  // 2. 처리 흐름에 필요한 scrollProgress 값을 준비한다.
  const scrollProgress = usePublicSiteScrollProgress();

  // 3. 렌더링 이후 필요한 동작을 실행한다.
  useEffect(() => {
    window.scrollTo({
      behavior: "smooth",
      left: 0,
      top: 0,
    });
  }, [location.pathname]);

  // 4. 계산된 결과를 호출자에게 반환한다.
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
    // 1. 현재 단계에서 필요한 동작을 실행한다.
    document.documentElement.classList.add("public-site-scrollbar-hidden");
    // 2. 현재 단계에서 필요한 동작을 실행한다.
    document.body.classList.add("public-site-scrollbar-hidden");

    // 기능 : update Progress 정보를 수정합니다.
    // 3. 이후 단계에서 사용할 updateProgress 값을 준비한다.
    const updateProgress = () => {
      const scrollableHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const nextProgress =
        scrollableHeight > 0
          ? Math.min(1, Math.max(0, window.scrollY / scrollableHeight))
          : 0;

      setProgress(nextProgress);
    };

    // 4. 현재 단계에서 필요한 동작을 실행한다.
    updateProgress();
    // 5. 브라우저 이벤트 listener를 등록하거나 정리한다.
    window.addEventListener("scroll", updateProgress, { passive: true });
    // 6. 브라우저 이벤트 listener를 등록하거나 정리한다.
    window.addEventListener("resize", updateProgress);

    // 7. 계산된 결과를 호출자에게 반환한다.
    return () => {
      // 1. 브라우저 이벤트 listener를 등록하거나 정리한다.
      window.removeEventListener("scroll", updateProgress);
      // 2. 브라우저 이벤트 listener를 등록하거나 정리한다.
      window.removeEventListener("resize", updateProgress);
      // 3. 현재 단계에서 필요한 동작을 실행한다.
      document.documentElement.classList.remove("public-site-scrollbar-hidden");
      // 4. 현재 단계에서 필요한 동작을 실행한다.
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
