import { ChevronDown } from "lucide-react";
import { useEffect, useRef } from "react";
import { usePublicSiteLocaleSwitcher } from "@/features/public-site/i18n/public-site-locale-hooks";
import {
  getPublicSiteLanguageOptionLabel,
  publicSiteLanguageOptions,
  usePublicSiteLanguage,
  type PublicSiteLanguage,
} from "@/features/public-site/i18n/public-site-language";

// 기능 : 공개 사이트 언어 선택 드롭다운을 렌더링합니다.
export function PublicSiteLanguageSelect() {
  // 1. 처리 흐름에 필요한 { copy, language } 값을 준비한다.
  const { copy, language } = usePublicSiteLanguage();
  // 2. 처리 흐름에 필요한 switchLocale 값을 준비한다.
  const switchLocale = usePublicSiteLocaleSwitcher();
  // 3. 처리 흐름에 필요한 detailsRef 값을 준비한다.
  const detailsRef = useRef<HTMLDetailsElement>(null);
  // 4. 이후 단계에서 사용할 selectedOption 값을 준비한다.
  const selectedOption = publicSiteLanguageOptions.find(
    (option) => option.value === language
  );
  // 5. 이후 단계에서 사용할 selectedLabel 값을 준비한다.
  const selectedLabel = getPublicSiteLanguageOptionLabel(
    selectedOption,
    language
  );

  // 기능 : 사용자가 선택한 언어로 공개 사이트 locale을 전환합니다.
  // 6. 이후 단계에서 사용할 onSelectLanguage 값을 준비한다.
  const onSelectLanguage = (nextLanguage: PublicSiteLanguage) => {
    switchLocale(nextLanguage);
  };

  // 7. 렌더링 이후 필요한 동작을 실행한다.
  useEffect(() => {
    // 기능 : 언어 선택 details 메뉴를 닫습니다.
    // 1. 이후 단계에서 사용할 closeLanguageMenu 값을 준비한다.
    const closeLanguageMenu = () => {
      detailsRef.current?.removeAttribute("open");
    };

    // 기능 : 언어 선택 메뉴 바깥 클릭을 감지해 메뉴를 닫습니다.
    // 2. 이후 단계에서 사용할 onPointerDown 값을 준비한다.
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target;

      if (
        target instanceof Node &&
        !detailsRef.current?.contains(target)
      ) {
        closeLanguageMenu();
      }
    };

    // 기능 : on Key Down 기능을 수행합니다.
    // 3. 이후 단계에서 사용할 onKeyDown 값을 준비한다.
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeLanguageMenu();
      }
    };

    // 4. 브라우저 이벤트 listener를 등록하거나 정리한다.
    document.addEventListener("pointerdown", onPointerDown);
    // 5. 브라우저 이벤트 listener를 등록하거나 정리한다.
    document.addEventListener("keydown", onKeyDown);

    // 6. 계산된 결과를 호출자에게 반환한다.
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  // 8. 계산된 결과를 호출자에게 반환한다.
  return (
    <details className="group relative mt-5 w-fit" ref={detailsRef}>
      <summary
        aria-label={copy.common.languageAria}
        className="inline-flex h-7 cursor-pointer list-none items-center gap-1.5 rounded-[6px] px-2 text-[12px] font-normal transition-colors hover:bg-[#f2f2ef] hover:text-[#111111] [&::-webkit-details-marker]:hidden"
      >
        {selectedLabel}
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
            {getPublicSiteLanguageOptionLabel(option, language)}
          </button>
        ))}
      </div>
    </details>
  );
}
