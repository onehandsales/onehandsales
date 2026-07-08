import { ChevronDown } from "lucide-react";
import {
  publicSiteLanguageOptions,
  usePublicSiteLanguage,
  type PublicSiteLanguage,
} from "@/features/public-site/i18n/public-site-language";

export function PublicSiteLanguageSelect() {
  const { copy, language, setLanguage } = usePublicSiteLanguage();
  const selectedOption = publicSiteLanguageOptions.find(
    (option) => option.value === language
  );

  const onSelectLanguage = (nextLanguage: PublicSiteLanguage) => {
    setLanguage(nextLanguage);
  };

  return (
    <details className="group relative mt-5 w-fit">
      <summary
        aria-label={copy.common.languageAria}
        className="inline-flex h-8 cursor-pointer list-none items-center gap-2 rounded-[6px] px-3 text-[12px] font-bold [&::-webkit-details-marker]:hidden"
      >
        {selectedOption?.label ?? "한국어"}
        <ChevronDown className="h-3.5 w-3.5 transition-transform group-open:rotate-180" />
      </summary>

      <div className="absolute bottom-10 left-0 z-50 w-44 overflow-hidden rounded-[8px] bg-white p-1 shadow-[0_12px_40px_rgba(0,0,0,0.14)]">
        {publicSiteLanguageOptions.map((option) => (
          <button
            className={[
              "block w-full rounded-[6px] px-3 py-2 text-left text-[12px] font-bold",
              option.value === language
                ? "bg-[#111111] text-white"
                : "text-[#333330] hover:bg-[#f7f7f5]",
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
