import { ChevronDown } from "lucide-react";
import { useEffect, useRef } from "react";
import { usePublicSiteLocaleSwitcher } from "@/features/public-site/i18n/public-site-locale-hooks";
import {
  publicSiteLanguageOptions,
  usePublicSiteLanguage,
  type PublicSiteLanguage,
} from "@/features/public-site/i18n/public-site-language";

// 기능 : 공개 사이트 언어 선택 드롭다운을 렌더링합니다.
export function PublicSiteLanguageSelect() {
  const { copy, language } = usePublicSiteLanguage();
  const switchLocale = usePublicSiteLocaleSwitcher();
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const selectedOption = publicSiteLanguageOptions.find(
    (option) => option.value === language
  );

  // 기능 : 사용자가 선택한 언어로 공개 사이트 locale을 전환합니다.
  const onSelectLanguage = (nextLanguage: PublicSiteLanguage) => {
    switchLocale(nextLanguage);
  };

  useEffect(() => {
    // 기능 : 언어 선택 details 메뉴를 닫습니다.
    const closeLanguageMenu = () => {
      detailsRef.current?.removeAttribute("open");
    };

    // 기능 : 언어 선택 메뉴 바깥 클릭을 감지해 메뉴를 닫습니다.
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target;

      if (
        target instanceof Node &&
        !detailsRef.current?.contains(target)
      ) {
        closeLanguageMenu();
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeLanguageMenu();
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return (
    <details className="group relative mt-5 w-fit" ref={detailsRef}>
      <summary
        aria-label={copy.common.languageAria}
        className="inline-flex h-7 cursor-pointer list-none items-center gap-1.5 rounded-[6px] px-2 text-[12px] font-normal transition-colors hover:bg-[#f2f2ef] hover:text-[#111111] [&::-webkit-details-marker]:hidden"
      >
        {selectedOption?.label ?? "한국어"}
        <ChevronDown className="h-3.5 w-3.5 transition-transform group-open:rotate-180" />
      </summary>

      <div className="absolute bottom-10 left-0 z-50 grid w-44 gap-1 overflow-hidden rounded-[8px] bg-white p-1.5 shadow-[0_12px_40px_rgba(0,0,0,0.14)]">
        {publicSiteLanguageOptions.map((option) => (
          <button
            className={[
              "block min-h-8 w-full rounded-[6px] px-3 py-1.5 text-left text-[12px] font-normal transition-colors hover:bg-[#f2f2ef] hover:text-[#111111]",
              option.value === language
                ? "bg-[#0000000D] text-[#111111]"
                : "text-[#333330]",
            ].join(" ")}
            data-language-option={option.value}
            key={option.value}
            onClick={(event) => {
              onSelectLanguage(option.value);
              event.currentTarget.closest("details")?.removeAttribute("open");
            }}
            type="button"
          >
            {option.label}
          </button>
        ))}
      </div>
    </details>
  );
}
